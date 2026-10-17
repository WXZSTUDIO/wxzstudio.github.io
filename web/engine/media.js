// cangame v4 · 媒体 / 球迷 / 老板 / 更衣室 / 随机事件 / 采访 / 转会传闻
// 依赖：config.js / rng.js / league.js(teamById)
// 设计要点：
//   1) 全部随机走传入的 rng，禁止 Math.random / Date.now
//   2) 所有评分恒 clamp(0, 100)；老存档缺失字段惰性初始化，不删除/重命名既有字段
//   3) eff 键名与 CONFIG.MEDIA.EVENTS 保持一致（media / fan / owner / locker），未知键忽略

var MEDIA_HISTORY_KEEP = 30;        // 新闻中心保留最近 N 条事件
var MEDIA_FAN_TRANSFER_STEP = 0.05; // 媒体评分→球迷情绪的每轮传导阻尼（结构常量，避免单轮跳变；
                                    // 平衡系数本身读 CONFIG.MEDIA.RATING_AFFECTS_FANS）

// eff 键 → state.media 字段映射（与 CONFIG.MEDIA.EVENTS 的 eff 键名一一对应）
var MEDIA_EFF_MAP = { media: 'rating', fan: 'fanMood', owner: 'owner', locker: 'locker' };

// 比赛结果系数：CONFIG.MEDIA 未提供 → 保守取小值（±1 ~ ±2），避免单场结果剧烈改变四项评分
var MEDIA_RESULT_EFF = {
  media:  { win: 1.0, lose: -1.0 },
  fan:    { win: 2.0, lose: -2.0 },
  owner:  { win: 1.5, lose: -1.5 },
  locker: { win: 1.0, lose: -1.0 },
  DIFF_SCALE: 0.05,   // 分差加成：每 1 分净胜分 ×0.05
  DIFF_CAP: 2.0       // 分差加成上限（±2，即大胜最多 ×3 倍基础值）
};

var MEDIA_MOOD_LABEL = { high: '高涨', mid: '平静', low: '低落' };

// 采访台词模板：{P}=球员名 {T}=队名 {POS}=位置
var MEDIA_INTERVIEW_TPL = {
  high_star: [
    '"我现在状态正热，队友把球交给我就够了。"',
    '"赢球是唯一目标，个人数据无所谓——当然，能顺便拿个 30 分更好。"',
    '"教练的战术我执行得很舒服，这就是我想要的角色。"'
  ],
  high: [
    '"最近手感不错，希望能保持下去。"',
    '"训练里投得很顺，比赛自然就有信心。"',
    '"赢球让一切都变简单了。"'
  ],
  mid_star: [
    '"我的职责就是把该进的球投进，其他交给教练安排。"',
    '"球队还在磨合，我们需要更稳定的防守。"',
    '"每场都当成最后一场打，这就够了。"'
  ],
  mid: [
    '"按教练的要求打，做好自己的活。"',
    '"还在找状态，慢慢来吧。"',
    '"轮换时间够用，我随时准备上场。"'
  ],
  low_star: [
    '"我不想谈轮换的话题，这个你得问教练。"',
    '"有些夜晚球就是不进，我会回去看录像调整。"',
    '"外界怎么说我不在意，我只想帮球队赢球。"'
  ],
  low: [
    '"我现在不想评价，谢谢。"',
    '"状态起伏是正常的，我会练回来的。"',
    '"给我一点时间。"'
  ]
};

// ——— 惰性初始化 / 存档兼容 ———
function media_init(state) {
  const M = CONFIG.MEDIA;
  if (!state.media || typeof state.media !== 'object') state.media = {};
  const m = state.media;
  const start = {
    rating: M.RATING_START,
    fanMood: M.FAN_MOOD_START,
    owner: M.OWNER_START,
    locker: M.LOCKER_START
  };
  // 缺失 → 取 START；已存在 → 钳回 0–100（老存档可能存在越界值）
  Object.keys(start).forEach(function (k) {
    if (m[k] == null || typeof m[k] !== 'number' || isNaN(m[k])) m[k] = Number(start[k]) || 0;
    m[k] = clamp(m[k], 0, 100);
  });
  if (m.lastEvent == null) m.lastEvent = null;
  if (!Array.isArray(m.history)) m.history = [];
  return m;
}

// 向基线回归（每轮最多移动 rate）
function media_decay(v, base, rate) {
  const d = (Number(base) || 0) - v;
  if (Math.abs(d) <= rate) return clamp(Number(base) || 0, 0, 100);
  return clamp(v + (d > 0 ? rate : -rate), 0, 100);
}

// 按权重 w 抽一条随机事件
function media_pickEvent(rng) {
  const list = (CONFIG.MEDIA && Array.isArray(CONFIG.MEDIA.EVENTS)) ? CONFIG.MEDIA.EVENTS : [];
  let total = 0;
  list.forEach(function (e) { total += Number(e.w) || 0; });
  if (!list.length || total <= 0) return null;
  let r = rng() * total;
  for (let i = 0; i < list.length; i++) {
    r -= (Number(list[i].w) || 0);
    if (r <= 0) return list[i];
  }
  return list[list.length - 1];
}

// 应用 eff（未知键忽略；结果钳制 0–100）
function media_applyEff(state, eff) {
  const m = media_init(state);
  if (!eff) return m;
  Object.keys(eff).forEach(function (k) {
    const field = MEDIA_EFF_MAP[k];
    if (!field) return;                       // 未知 eff 键忽略
    m[field] = clamp((Number(m[field]) || 0) + (Number(eff[k]) || 0), 0, 100);
  });
  return m;
}

// 媒体评分 → 球迷情绪传导；返回本轮实际施加的增量
function media_affectFans(state) {
  const m = media_init(state);
  const M = CONFIG.MEDIA;
  const base = Number(M.RATING_START) || 0;
  const k = Number(M.RATING_AFFECTS_FANS) || 0;
  const delta = (m.rating - base) * k * MEDIA_FAN_TRANSFER_STEP;
  const before = m.fanMood;
  m.fanMood = clamp(m.fanMood + delta, 0, 100);
  return m.fanMood - before;
}

// 每轮推进：抽事件 → 应用 eff → 向基线回归 → 媒体传导球迷 → 写 history（保留最近 30 条）
function media_tick(state, rng) {
  const m = media_init(state);
  const M = CONFIG.MEDIA;

  let ev = null;
  if (rng() < (Number(M.EVENT_CHANCE) || 0)) {
    ev = media_pickEvent(rng);
    if (ev) {
      media_applyEff(state, ev.eff);
      const rec = {
        id: ev.id, name: ev.name,
        round: (state.round != null ? state.round : null),
        season: state.season || 1
      };
      m.lastEvent = rec;
      m.history.push(rec);
      if (m.history.length > MEDIA_HISTORY_KEEP) m.history.splice(0, m.history.length - MEDIA_HISTORY_KEEP);
    }
  }

  const rate = Number(M.DECAY) || 0;
  m.rating = media_decay(m.rating, M.RATING_START, rate);
  m.fanMood = media_decay(m.fanMood, M.FAN_MOOD_START, rate);
  m.owner = media_decay(m.owner, M.OWNER_START, rate);
  m.locker = media_decay(m.locker, M.LOCKER_START, rate);

  media_affectFans(state);

  return {
    event: ev ? { id: ev.id, name: ev.name, eff: ev.eff } : null,
    media: { rating: m.rating, fanMood: m.fanMood, owner: m.owner, locker: m.locker }
  };
}

// 比赛结果影响（赢了球迷/老板+，输了-）；分差越大幅度越大（有上限）
function media_applyResult(state, won, scoreDiff) {
  const m = media_init(state);
  const R = MEDIA_RESULT_EFF;
  const k = 1 + clamp(Math.abs(Number(scoreDiff) || 0) * R.DIFF_SCALE, 0, R.DIFF_CAP);
  m.rating = clamp(m.rating + (won ? R.media.win : R.media.lose) * k, 0, 100);
  m.fanMood = clamp(m.fanMood + (won ? R.fan.win : R.fan.lose) * k, 0, 100);
  m.owner = clamp(m.owner + (won ? R.owner.win : R.owner.lose) * k, 0, 100);
  m.locker = clamp(m.locker + (won ? R.locker.win : R.locker.lose) * k, 0, 100);
  media_affectFans(state);
  return { rating: m.rating, fanMood: m.fanMood, owner: m.owner, locker: m.locker };
}

// 读取（兼容老存档，缺失走 START 值）
function media_rating(state) { return media_init(state).rating; }
function media_fanMood(state) { return media_init(state).fanMood; }
function media_owner(state) { return media_init(state).owner; }
function media_locker(state) { return media_init(state).locker; }

// 快照（UI 一次性拿四项，避免重复 init）
function media_snapshot(state) {
  const m = media_init(state);
  return { rating: m.rating, fanMood: m.fanMood, owner: m.owner, locker: m.locker, lastEvent: m.lastEvent };
}

// 最近 n 条随机事件（最新在前，供"新闻中心"展示）
function media_recentEvents(state, n) {
  const m = media_init(state);
  const k = (n == null || n <= 0) ? MEDIA_HISTORY_KEEP : n;
  return m.history.slice(-k).reverse().map(function (r) {
    return { id: r.id, name: r.name, round: r.round, season: r.season };
  });
}

// 球员采访：随机本队球员 × 心情档位 × 是否高于队内均值 → 不同口吻
function media_interview(state, rng) {
  media_init(state);
  const team = (state.humanTeamId ? teamById(state, state.humanTeamId) : null)
    || (state.teams && state.teams[0]) || null;
  if (!team || !team.players || !team.players.length) return null;

  const p = pick(rng, team.players);
  const mo = CONFIG.MOOD;
  const mv = (p.mood == null ? mo.BASE : p.mood);
  let band = 'mid';
  if (mv >= mo.HIGH) band = 'high';
  else if (mv <= mo.LOW) band = 'low';

  let sum = 0;
  team.players.forEach(function (x) { sum += (x.overall || 0); });
  const avg = sum / team.players.length;
  const isStar = (p.overall || 0) >= avg;

  const tpl = MEDIA_INTERVIEW_TPL[band + (isStar ? '_star' : '')] || MEDIA_INTERVIEW_TPL.mid;
  const line = pick(rng, tpl)
    .replace('{P}', p.name)
    .replace('{T}', team.name)
    .replace('{POS}', p.pos);

  return {
    pid: p.id, name: p.name, pos: p.pos,
    line: line,
    mood: MEDIA_MOOD_LABEL[band],
    moodValue: mv
  };
}

// 转会传闻：随机球员 × 随机下家 × 可信度
function media_rumor(state, rng) {
  media_init(state);
  const teams = (state.teams || []).filter(function (t) { return t.players && t.players.length; });
  if (teams.length < 2) return null;

  const from = pick(rng, teams);
  let to = pick(rng, teams), guard = 0;
  while (to.id === from.id && guard++ < 16) to = pick(rng, teams);
  if (to.id === from.id) return null;

  const p = pick(rng, from.players);
  const cred = randInt(rng, 35, 95);
  let tail = '目前双方均未官方回应。';
  if (cred >= 80) tail = '消息人士称谈判已进入实质阶段。';
  else if (cred <= 45) tail = '不过知情人士表示成行可能性偏低。';

  const text = '据悉，' + from.name + ' 的 ' + p.name + '（' + p.pos + '）可能在赛季结束后加盟 '
    + to.name + '，' + tail;

  return {
    pid: p.id, name: p.name,
    fromTeam: from.name, toTeam: to.name,
    fromTeamId: from.id, toTeamId: to.id,
    text: text,
    可信度: cred,    // 需求指定字段名
    cred: cred       // 英文别名（便于代码内使用）
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    media_init, media_decay, media_pickEvent, media_applyEff, media_affectFans,
    media_tick, media_applyResult,
    media_rating, media_fanMood, media_owner, media_locker, media_snapshot,
    media_recentEvents, media_interview, media_rumor
  };
}
