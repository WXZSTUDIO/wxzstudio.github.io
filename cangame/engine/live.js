// cangame v4 · 联赛直播系统（文字直播 / 实时技术统计 / 关键回合 / 回放 / 战报 / 转播）
// 无模块系统：全部为全局 function 声明，靠 index.html 的 <script defer> 顺序加载
// 依赖（均为已有全局）：CONFIG.LIVE / makeRNG / deriveSeed / randInt / clamp / teamById / players_overall
// 铁律：①所有数值参数读 CONFIG.LIVE，零硬编码 ②确定性（deriveSeed+makeRNG，禁用全局随机源与时间戳）
//      ③不修改 res（事件流只读复制进 live.events）④存档兼容：state 上只新增可选字段

// —— 事件类型别名：兼容 match.js 枚举（BLK/STL）与 CONFIG.LIVE.KEY_TYPES（BLOCK/STEAL/CLUTCH）——
var LIVE_TYPE_ALIAS = {
  SCORE3: 'SCORE3', '3P': 'SCORE3', '3PM': 'SCORE3',
  SCORE2: 'SCORE2', '2P': 'SCORE2', '2PM': 'SCORE2',
  SCORE1: 'SCORE1', FT: 'SCORE1', FREE: 'SCORE1',
  DUNK: 'DUNK', MISS: 'MISS',
  REB: 'REB', DREB: 'REB', OREB: 'OREB',
  AST: 'AST', STL: 'STL', STEAL: 'STL',
  BLK: 'BLK', BLOCK: 'BLK',
  TO: 'TO', TOV: 'TO', TURNOVER: 'TO',
  FOUL: 'FOUL', SUB: 'SUB', TIMEOUT: 'TIMEOUT',
  QUARTER: 'QUARTER', OT: 'OT', BUZZER: 'BUZZER', CLUTCH: 'CLUTCH'
};

// 文字直播行的中文标签（非数值，纯展示）
var LIVE_TYPE_LABEL = {
  SCORE3: '三分命中', SCORE2: '中投命中', SCORE1: '罚球命中', DUNK: '暴扣得手',
  MISS: '投篮不中', REB: '防守篮板', OREB: '前场篮板', AST: '助攻', STL: '抢断',
  BLK: '盖帽', TO: '失误', FOUL: '犯规', SUB: '换人', TIMEOUT: '暂停',
  QUARTER: '节间', OT: '加时', BUZZER: '压哨'
};

// 得分型事件（默认分值；实际优先取 ev.pts，保证与 box 一致）
var LIVE_SCORE_PTS = { SCORE3: 3, SCORE2: 2, DUNK: 2, SCORE1: 1 };

// ——————————————————————————— 基础工具 ———————————————————————————

function live_normType(t) {
  const k = String(t == null ? '' : t).toUpperCase();
  return LIVE_TYPE_ALIAS[k] || k;
}
function live_isScoreType(t) {
  return LIVE_SCORE_PTS[live_normType(t)] != null;
}
function live_typePts(t, pts) {
  const d = LIVE_SCORE_PTS[live_normType(t)];
  return pts != null && pts !== 0 ? pts : (d || 0);
}
// 字符串哈希（FNV-1a）：确定性种子派生，替代 Date.now
function live_hashStr(s) {
  let h = 2166136261;
  s = String(s);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// 'mm:ss' → 剩余秒数
function live_clockSec(clock) {
  const p = String(clock == null ? '0:00' : clock).split(':');
  const m = parseInt(p[0], 10), s = parseInt(p[1], 10);
  return (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : s);
}
function live_clockText(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  const m = Math.floor(sec / 60), s = sec % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}
function live_quarterSec(q) {
  const L = CONFIG.LIVE;
  return (q | 0) <= L.QUARTERS ? L.QUARTER_SECONDS : L.OT_SECONDS;
}
function live_quarterText(q) {
  const L = CONFIG.LIVE;
  return (q | 0) > L.QUARTERS ? ('加时' + ((q | 0) - L.QUARTERS)) : ('第' + (q | 0) + '节');
}
function live_teamName(live, teamId) {
  if (!teamId) return '';
  if (live && teamId === live.homeId) return live.homeName || teamId;
  if (live && teamId === live.awayId) return live.awayName || teamId;
  return teamId;
}
// 关键时刻：末节（或加时）且剩余时间 ≤ CLUTCH_WINDOW
function live_isClutch(ev) {
  const L = CONFIG.LIVE;
  if (!ev) return false;
  if (ev.clutch != null) return !!ev.clutch;
  const q = ev.q | 0;
  if (q < L.QUARTERS) return false;
  return live_clockSec(ev.clock) <= L.CLUTCH_WINDOW;
}
// 语气分级：BLOWOUT > CLUTCH > CLOSE > NORMAL
function live_toneOf(ev, diff) {
  const L = CONFIG.LIVE;
  const ad = Math.abs(diff | 0);
  if (ad >= L.BLOWOUT_DIFF) return 'BLOWOUT';
  // 0:0 开局不算"胶着"（否则开场第一球会带上"分差咬得很紧"前缀，语义失真）
  if (ev && ((ev.hs | 0) + (ev.as | 0)) <= 0) return 'NORMAL';
  if (ad <= L.CLUTCH_DIFF) return live_isClutch(ev) ? 'CLUTCH' : 'CLOSE';
  return 'NORMAL';
}
function live_isKey(ev) {
  if (!ev) return false;
  if (ev.key) return true;
  const L = CONFIG.LIVE;
  const nt = live_normType(ev.type);
  if (L.KEY_TYPES.indexOf(nt) >= 0) return true;
  // 别名互认：KEY_TYPES 写 BLOCK/STEAL/CLUTCH，事件枚举写 BLK/STL
  if (nt === 'BLK' && L.KEY_TYPES.indexOf('BLOCK') >= 0) return true;
  if (nt === 'STL' && L.KEY_TYPES.indexOf('STEAL') >= 0) return true;
  if (ev.clutch && L.KEY_TYPES.indexOf('CLUTCH') >= 0) return true;
  return false;
}
// 占位符替换（用 split/join，避免 $& 特殊序列被名字触发）
function live_commentatorSay(tpl, ctx) {
  ctx = ctx || {};
  let s = String(tpl == null ? '' : tpl);
  s = s.split('{P}').join(ctx.P == null ? '' : String(ctx.P));
  s = s.split('{T}').join(ctx.T == null ? '' : String(ctx.T));
  s = s.split('{Q}').join(ctx.Q == null ? '' : String(ctx.Q));
  s = s.split('{S}').join(ctx.S == null ? '' : String(ctx.S));
  s = s.split('{D}').join(ctx.D == null ? (ctx.diff == null ? '' : String(ctx.diff)) : String(ctx.D));
  return s.replace(/\s{2,}/g, ' ').trim();
}

// ——————————————————————————— 事件流规整 ———————————————————————————

function live_normEvent(e, i) {
  e = e || {};
  const nt = live_normType(e.type);
  return {
    i: i,
    q: e.q != null ? (e.q | 0) : 1,
    clock: e.clock != null ? String(e.clock) : '12:00',
    idx: e.idx != null ? (e.idx | 0) : i,
    type: nt,
    teamId: e.teamId || null,
    pid: e.pid || null,
    name: e.name || '',
    pos: e.pos || '',
    pts: live_typePts(nt, e.pts),
    hs: e.hs != null ? (e.hs | 0) : null,
    as: e.as != null ? (e.as | 0) : null,
    key: e.key != null ? !!e.key : undefined,
    clutch: e.clutch != null ? !!e.clutch : undefined
  };
}

// 补齐每条事件的比分快照（前向填充 + 单调不减 + 末条对齐终分）
// 这样 live_seek 的比分是 O(1)，且天然保证「末帧统计总和 === 比分」
function live_fillScores(events, hScore, aScore, homeId) {
  let hs = 0, as = 0;
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (ev.hs == null || ev.as == null) {
      const isHome = ev.teamId != null && ev.teamId === homeId;
      if (live_isScoreType(ev.type) && ev.pts) {
        if (isHome) hs += ev.pts; else as += ev.pts;
      }
      if (ev.hs == null) ev.hs = hs;
      if (ev.as == null) ev.as = as;
    }
    // 单调不减（防止上游快照抖动）
    if (ev.hs < hs) ev.hs = hs; if (ev.as < as) ev.as = as;
    hs = ev.hs; as = ev.as;
    if (ev.clutch == null) ev.clutch = live_isClutch(ev);
    if (ev.key == null) ev.key = undefined;
  }
  // 末条强制对齐终分（含 MAX_EVENTS 截断的极端情况）
  const last = events.length ? events[events.length - 1] : null;
  if (last) { last.hs = hScore | 0; last.as = aScore | 0; }
  // 扩散修正：若中间出现超过终分的快照，回拉
  if (last) {
    hs = last.hs; as = last.as;
    for (let i = events.length - 2; i >= 0; i--) {
      if (events[i].hs > hs) events[i].hs = hs; else hs = events[i].hs;
      if (events[i].as > as) events[i].as = as; else as = events[i].as;
    }
  }
  return events;
}

// ——————————————————————————— 兜底：从 box 合成事件流 ———————————————————————————
// 当 res.events 缺失（老存档 / match.js 未产出事件流）时，用技术统计反推一条可播放的流。
// 保证：合成的得分事件总和 === box.pts 总和 === 比分。
function live_synthEvents(state, res, seed) {
  const L = CONFIG.LIVE, M = CONFIG.MATCH;
  const rng = makeRNG(deriveSeed(seed, 9911));
  const homeId = res.homeId, awayId = res.awayId;
  const acts = [];

  function push(teamId, pid, name, pos, type, pts) {
    acts.push({ teamId: teamId, pid: pid, name: name, pos: pos, type: type, pts: pts || 0 });
  }
  // 取真实球员属性（box 行不带 a/height，需回球队查）
  function attrOf(teamId, pid) {
    const t = teamById(state || {}, teamId);
    if (!t || !t.players) return null;
    const hit = t.players.filter(function (p) { return p.id === pid; })[0];
    return hit || null;
  }
  function build(box, teamId) {
    if (!box || !box.players) return;
    Object.keys(box.players).forEach(function (pid) {
      const r = box.players[pid];
      let pts = r.pts | 0, fgm = r.fgm | 0;
      if (pts < 0) pts = 0;
      if (fgm * 2 > pts) fgm = Math.floor(pts / 2);   // 每个运动战进球至少 2 分
      // 恒等式：pts = 2*fgm + 三分个数 + 罚球个数
      // 本作引擎不模拟罚球，故 excess = pts - 2*fgm 恰好等于真实三分命中数（拆解后总和必然 = pts）
      const excess = Math.max(0, pts - fgm * 2);
      const src = attrOf(teamId, pid);
      const a = (src && src.a) || null;
      const threes = Math.min(excess, fgm);
      const fts = excess - threes;      // 正常为 0；仅当上游出现罚球数据时才 > 0
      const twos = fgm - threes;
      // 暴扣倾向：突破占比 × 身高归一化（全部来自 CONFIG.PLAYER.HEIGHT）
      const drvSh = a ? (a.DRV || 0) + (a.SHO || 0) : 0;
      const drvShare = drvSh > 0 ? clamp((a.DRV || 0) / drvSh, 0, 1) : 0;
      const H = CONFIG.PLAYER.HEIGHT;
      const hgt = (src && src.height) || (r.height || 0) || H.PG[0];
      const hNorm = clamp((hgt - H.PG[0]) / (H.C[1] - H.PG[0]), 0, 1);
      const dunks = Math.min(twos, Math.round(twos * clamp(drvShare * hNorm, 0, 1)));
      for (let k = 0; k < threes; k++) push(teamId, pid, r.name, r.pos, 'SCORE3', 3);
      for (let k = 0; k < twos; k++) push(teamId, pid, r.name, r.pos, (k < dunks ? 'DUNK' : 'SCORE2'), 2);
      for (let k = 0; k < fts; k++) push(teamId, pid, r.name, r.pos, 'SCORE1', 1);
      const miss = Math.max(0, (r.fga | 0) - fgm);
      for (let k = 0; k < miss; k++) push(teamId, pid, r.name, r.pos, 'MISS', 0);
      let reb = r.reb | 0;
      const oreb = Math.min(reb, Math.round(reb * M.REB_BASE));
      for (let k = 0; k < reb; k++) push(teamId, pid, r.name, r.pos, (k < oreb ? 'OREB' : 'REB'), 0);
      let k2;
      for (k2 = 0; k2 < (r.ast | 0); k2++) push(teamId, pid, r.name, r.pos, 'AST', 0);
      for (k2 = 0; k2 < (r.stl | 0); k2++) push(teamId, pid, r.name, r.pos, 'STL', 0);
      for (k2 = 0; k2 < (r.blk | 0); k2++) push(teamId, pid, r.name, r.pos, 'BLK', 0);
      for (k2 = 0; k2 < (r.to | 0); k2++) push(teamId, pid, r.name, r.pos, 'TO', 0);
    });
  }
  build(res.hBox, homeId);
  build(res.aBox, awayId);

  // 确定性乱序（Fisher-Yates），使两队回合交错
  for (let i = acts.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = acts[i]; acts[i] = acts[j]; acts[j] = t;
  }

  // 分配到 4 节并生成时钟
  const n = acts.length || 1;
  const per = n / L.QUARTERS;
  const out = [];
  let hs = 0, as = 0;
  for (let i = 0; i < acts.length; i++) {
    const a = acts[i];
    let q = Math.floor(i / per) + 1;
    if (q > L.QUARTERS) q = L.QUARTERS;
    const frac = (i - (q - 1) * per) / per;
    const sec = Math.round((1 - frac) * L.QUARTER_SECONDS);
    if (a.type === 'SCORE3' || a.type === 'SCORE2' || a.type === 'DUNK' || a.type === 'SCORE1') {
      if (a.teamId === homeId) hs += a.pts; else as += a.pts;
    }
    out.push(live_normEvent({
      q: q, clock: live_clockText(sec), idx: i, type: a.type, teamId: a.teamId,
      pid: a.pid, name: a.name, pos: a.pos, pts: a.pts, hs: hs, as: as
    }, out.length));
  }

  // 末条对齐终分（合成误差兜底）
  if (out.length) { out[out.length - 1].hs = res.hScore | 0; out[out.length - 1].as = res.aScore | 0; }

  // 节间事件
  if (out.length) {
    const withQ = [];
    let lastQ = out[0].q;
    for (let i = 0; i < out.length; i++) {
      withQ.push(out[i]);
      const nq = (i + 1 < out.length) ? out[i + 1].q : out[i].q;
      if (nq !== lastQ || i === out.length - 1) {
        const ev = out[i];
        withQ.push(live_normEvent({
          q: ev.q, clock: '00:00', idx: withQ.length, type: 'QUARTER',
          teamId: null, pid: null, name: '', pts: 0, hs: ev.hs, as: ev.as, key: true
        }, withQ.length));
        lastQ = nq;
      }
    }
    out.length = 0;
    withQ.forEach(function (e) { out.push(e); });
  }

  // 终场压哨（胶着 → 关键事件 / 绝杀）
  const fin = out.length ? out[out.length - 1] : null;
  if (fin) {
    const diff = Math.abs((res.hScore | 0) - (res.aScore | 0));
    out.push(live_normEvent({
      q: fin.q, clock: '00:00', idx: out.length, type: 'BUZZER', teamId: null, pid: null,
      name: '', pts: 0, hs: res.hScore | 0, as: res.aScore | 0, key: diff <= L.CLUTCH_DIFF
    }, out.length));
  }
  if (!out.length) {
    out.push(live_normEvent({ q: 1, clock: '12:00', idx: 0, type: 'QUARTER', hs: res.hScore | 0, as: res.aScore | 0, key: true }, 0));
  }
  return out;
}

// ——————————————————————————— 构建直播对象 ———————————————————————————

function live_seedOf(state, res, opts) {
  if (opts && opts.seed != null) return opts.seed >>> 0;
  if (res && res.seed != null) return res.seed >>> 0;
  const st = state || {};
  return live_hashStr([res.homeId, res.awayId, res.hScore, res.aScore, st.season || 0, st.round || 0].join('|'));
}

function live_cloneBox(box) {
  if (!box) return null;
  const players = {};
  let pts = 0;
  Object.keys(box.players || {}).forEach(function (pid) {
    const r = box.players[pid];
    players[pid] = {
      id: r.id || pid, name: r.name || pid, pos: r.pos || '',
      pts: r.pts | 0, reb: r.reb | 0, ast: r.ast | 0, stl: r.stl | 0, blk: r.blk | 0,
      to: r.to | 0, fgm: r.fgm | 0, fga: r.fga | 0, min: r.min | 0
    };
    pts += r.pts | 0;
  });
  return {
    teamId: box.teamId, teamName: box.teamName || '',
    players: players,
    teamReb: box.teamReb | 0, teamTo: box.teamTo | 0, teamStl: box.teamStl | 0, teamBlk: box.teamBlk | 0,
    pts: pts
  };
}
function live_emptyBox(teamId, teamName) {
  return { teamId: teamId, teamName: teamName || '', players: {}, teamReb: 0, teamTo: 0, teamStl: 0, teamBlk: 0, pts: 0 };
}

function live_buildFromResult(state, res, opts) {
  state = state || {};
  res = res || {};
  opts = opts || {};
  const L = CONFIG.LIVE;
  const homeId = res.homeId, awayId = res.awayId;
  const hT = teamById(state, homeId), aT = teamById(state, awayId);
  const homeName = (res.hBox && res.hBox.teamName) || (hT && hT.name) || homeId;
  const awayName = (res.aBox && res.aBox.teamName) || (aT && aT.name) || awayId;
  const seed = live_seedOf(state, res, opts);

  // 事件流：优先用 match.js 产出的 res.events（只读复制，不污染 res）
  let raw = (res.events && res.events.length) ? res.events : live_synthEvents(state, res, seed);
  let events = [];
  const lim = L.MAX_EVENTS | 0;
  const total = Math.min(raw.length, lim > 0 ? lim : raw.length);
  for (let i = 0; i < total; i++) events.push(live_normEvent(raw[i], i));
  if (!events.length) {
    events.push(live_normEvent({ q: 1, clock: live_clockText(L.QUARTER_SECONDS), idx: 0, type: 'QUARTER', hs: res.hScore | 0, as: res.aScore | 0, key: true }, 0));
  }
  live_fillScores(events, res.hScore | 0, res.aScore | 0, homeId);

  // 关键事件标记：结构事件 + 关键时刻的攻防回合 + 最后一个得分回合
  let lastScoreIdx = -1;
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (ev.key === undefined) {
      const nt = live_normType(ev.type);
      let k = false;
      if (nt === 'QUARTER' || nt === 'OT' || nt === 'BUZZER') k = true;
      else if (live_isScoreType(nt) && ev.clutch && Math.abs(ev.hs - ev.as) <= L.CLUTCH_DIFF) k = true;
      else if ((nt === 'BLK' || nt === 'STL' || nt === 'DUNK') && ev.clutch) k = true;
      ev.key = k;
    }
    if (live_isScoreType(ev.type) && ev.pts) lastScoreIdx = i;
  }
  if (lastScoreIdx >= 0) events[lastScoreIdx].key = true;
  if (events.length) events[events.length - 1].key = true;

  // 单调递增的直播序号（新增可选字段，老存档无此字段时从 1 开始）
  state.liveSeq = (state.liveSeq | 0) + 1;

  const first = events[0];
  const live = {
    id: opts.id || ('lv' + state.liveSeq),
    homeId: homeId, awayId: awayId,
    homeName: homeName, awayName: awayName,
    hScore: res.hScore | 0, aScore: res.aScore | 0,
    winner: res.winner || (res.hScore >= res.aScore ? homeId : awayId),
    origH: res.hScore | 0, origA: res.aScore | 0,   // 原始终分（微操改写前，用于回写战绩）
    microDone: false, microOption: null, microNonce: 0, _microFrom: 0, _oppRun: 0,
    quarter: first.q, clock: first.clock,
    events: events,
    commentary: [],
    viewers: 0, broadcastType: 'web', broadcastName: '', income: 0,
    finished: events.length <= 1,
    createdRound: opts.round != null ? opts.round : (state.round | 0),
    createdSeason: opts.season != null ? opts.season : (state.season | 0),
    comp: opts.comp || 'LEAGUE',
    stage: opts.stage || 'regular',
    focus: !!opts.focus,
    seed: seed,
    idx: 0,
    speed: L.SPEEDS[0],
    keyOnly: false,
    playing: false,
    finalBox: { hBox: live_cloneBox(res.hBox) || live_emptyBox(homeId, homeName), aBox: live_cloneBox(res.aBox) || live_emptyBox(awayId, awayName) }
  };
  const inc = live_broadcastIncome(state, live);
  live.viewers = inc.viewers;
  live.broadcastType = inc.type;
  live.broadcastName = inc.name;
  live.income = inc.income;
  return live;
}

// ——————————————————————————— 解说生成 ———————————————————————————

function live_genCommentary(state, live) {
  if (!live) return [];
  const L = CONFIG.LIVE;
  const evs = live.events || [];
  const out = [];
  for (let i = 0; i < evs.length; i++) {
    const ev = evs[i];
    const nt = live_normType(ev.type);
    const diff = (ev.hs | 0) - (ev.as | 0);
    const tone = live_toneOf(ev, diff);
    const tpls = L.TPL[nt] || L.TPL[ev.type] || ['{T} {P}'];
    // 每条事件独立派生子种子：O(n) 且完全确定（同 seed 同文本）
    const r = makeRNG(deriveSeed(live.seed | 0, i + 1));
    const tpl = tpls[Math.floor(r() * tpls.length) % tpls.length];
    const tones = L.TONE[tone] || L.TONE.NORMAL || [''];
    const tr = makeRNG(deriveSeed(live.seed | 0, 77000 + i));
    const tpre = tones[Math.floor(tr() * tones.length) % tones.length];
    const body = live_commentatorSay(tpl, {
      P: ev.name || '',
      T: live_teamName(live, ev.teamId),
      Q: ev.q,
      S: (ev.hs | 0) + ':' + (ev.as | 0),
      D: Math.abs(diff),
      diff: diff
    });
    // 结构性事件（节间/加时）不加语气前缀
    const structural = (nt === 'QUARTER' || nt === 'OT');
    let line = (structural || !tpre ? '' : tpre) + body;
    // 兜底：模板解析后若为空（如跳球/节间等无球员事件），退回事件行文本，保证「每条解说非空」
    if (!line || !line.trim()) line = live_eventLine(live, ev) || (LIVE_TYPE_LABEL[nt] || nt || '—');
    out.push(line);
  }
  live.commentary = out;
  return out;
}

// 文字直播行：`第1节 11:32 广东宏远 易建联 中投命中 2:0`
function live_eventLine(live, ev) {
  if (!ev) return '';
  const L = CONFIG.LIVE;
  let s = live_quarterText(ev.q) + ' ' + ev.clock;
  const tn = live_teamName(live, ev.teamId);
  const nt = live_normType(ev.type);
  if (nt === 'QUARTER') return s + ' ' + ((ev.q | 0) >= L.QUARTERS ? '全场结束' : '本节结束') + ' ' + (ev.hs | 0) + ':' + (ev.as | 0);
  if (nt === 'OT') return s + ' 战平，进入加时 ' + (ev.hs | 0) + ':' + (ev.as | 0);
  if (tn) s += ' ' + tn;
  if (ev.name) s += ' ' + ev.name;
  s += ' ' + (LIVE_TYPE_LABEL[nt] || nt);
  if (ev.pts) s += ' +' + ev.pts;
  return s + ' ' + (ev.hs | 0) + ':' + (ev.as | 0);
}

// ——————————————————————————— 播放控制 ———————————————————————————

function live_clampIdx(live, idx) {
  const n = (live.events || []).length;
  if (!n) return 0;
  return clamp(idx | 0, 0, n - 1);
}

// 可见事件索引（只看关键回合时过滤；首尾必留，保证能走到终分）
function live_visibleIdx(live) {
  const evs = live.events || [];
  const n = evs.length;
  if (!live.keyOnly) {
    if (live._vis && live._visAll && live._visAll === n) return live._vis;
    const all = [];
    for (let i = 0; i < n; i++) all.push(i);
    live._vis = all; live._visAll = n; live._visMode = false;
    return all;
  }
  if (live._vis && live._visMode === true && live._visAll === n) return live._vis;
  const v = [];
  for (let i = 0; i < n; i++) {
    if (i === 0 || i === n - 1 || live_isKey(evs[i])) v.push(i);
  }
  live._vis = v; live._visAll = n; live._visMode = true;
  return v;
}

function live_seek(live, idx) {
  const evs = live.events || [];
  const n = evs.length;
  if (!n) {
    return { quarter: 1, clock: live_clockText(CONFIG.LIVE.QUARTER_SECONDS), hs: 0, as: 0, box: { hBox: live_emptyBox(live.homeId, live.homeName), aBox: live_emptyBox(live.awayId, live.awayName) }, curEvent: null, isKey: false, finished: true };
  }
  const i = live_clampIdx(live, idx);
  live.idx = i;
  const ev = evs[i];
  const box = live_boxAt(live, i);
  live.quarter = ev.q;
  live.clock = ev.clock;
  live.finished = (i >= n - 1);
  return {
    quarter: ev.q,
    clock: ev.clock,
    hs: ev.hs | 0,
    as: ev.as | 0,
    box: box,
    curEvent: ev,
    isKey: live_isKey(ev),
    finished: live.finished,
    idx: i,
    say: (live.commentary && live.commentary[i]) || ''
  };
}

function live_next(live) {
  const n = (live.events || []).length;
  if (!n) return live_seek(live, 0);
  const vis = live_visibleIdx(live);
  let ni = -1;
  for (let k = 0; k < vis.length; k++) { if (vis[k] > live.idx) { ni = vis[k]; break; } }
  if (ni < 0) ni = n - 1;
  return live_seek(live, ni);
}

function live_skipToEnd(live) {
  const n = (live.events || []).length;
  live.playing = false;
  return live_seek(live, n - 1);
}

function live_setSpeed(live, speed) {
  const S = CONFIG.LIVE.SPEEDS;
  if (S.indexOf(speed) >= 0) live.speed = speed;
  return live.speed;
}

function live_toggleKeyOnly(live, on) {
  live.keyOnly = (on == null) ? !live.keyOnly : !!on;
  // 当前帧若被过滤掉，回退到最近一个可见帧
  const vis = live_visibleIdx(live);
  let best = -1;
  for (let k = 0; k < vis.length; k++) { if (vis[k] <= live.idx) best = vis[k]; else break; }
  if (best >= 0 && best !== live.idx) live_seek(live, best);
  return live.keyOnly;
}

function live_reset(live) {
  live.playing = false;
  live.finished = false;
  return live_seek(live, 0);
}

// ——————————————————————————— 实时技术统计 ———————————————————————————

function live_rowOf(box, pid, name, pos) {
  if (!box.players[pid]) {
    box.players[pid] = { id: pid, name: name || pid, pos: pos || '', pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0, fgm: 0, fga: 0, min: 0 };
  }
  return box.players[pid];
}

function live_accEvent(st, ev, live) {
  const isHome = ev.teamId != null && ev.teamId === live.homeId;
  const isAway = ev.teamId != null && ev.teamId === live.awayId;
  const box = isHome ? st.h : (isAway ? st.a : null);
  if (!box || !ev.pid) return;
  const nt = live_normType(ev.type);
  const row = live_rowOf(box, ev.pid, ev.name, ev.pos);
  if (live_isScoreType(nt)) {
    const p = ev.pts || 0;
    row.pts += p; box.pts += p; row.fgm++; row.fga++;
  } else if (nt === 'MISS') {
    row.fga++;
  } else if (nt === 'REB' || nt === 'OREB') {
    row.reb++; box.teamReb++;
  } else if (nt === 'AST') {
    row.ast++;
  } else if (nt === 'STL') {
    row.stl++; box.teamStl++;
  } else if (nt === 'BLK') {
    row.blk++; box.teamBlk++;
  } else if (nt === 'TO') {
    row.to++; box.teamTo++;
  }
}

// 把累计得分误差归到该队最高得分手（确定性：同分取字典序小的 pid）
function live_reconcile(box, delta) {
  if (!delta) return;
  let best = null;
  Object.keys(box.players).forEach(function (pid) {
    const r = box.players[pid];
    if (!best) { best = r; return; }
    if (r.pts > best.pts || (r.pts === best.pts && String(pid) < String(best.id))) best = r;
  });
  if (!best) return;
  best.pts += delta;
  if (best.pts < 0) best.pts = 0;
  box.pts += delta;
}

// 播放到 idx 的累计技术统计。硬保证：任意帧 Σpts === 该帧比分（末帧 === 终分）
function live_boxAt(live, idx) {
  const evs = live.events || [];
  const n = evs.length;
  if (!n) return { hBox: live_emptyBox(live.homeId, live.homeName), aBox: live_emptyBox(live.awayId, live.awayName) };
  const i = live_clampIdx(live, idx);
  // 终局直接返回权威 box（与 match.js 的 box 完全一致，含 min / teamReb）
  if (i === n - 1 && live.finalBox && live.finalBox.hBox) {
    return { hBox: live_cloneBox(live.finalBox.hBox), aBox: live_cloneBox(live.finalBox.aBox) };
  }
  let st = live._boxc;
  if (!st || st.homeId !== live.homeId || st.awayId !== live.awayId || st.i == null || st.i > i) {
    st = { i: -1, h: live_emptyBox(live.homeId, live.homeName), a: live_emptyBox(live.awayId, live.awayName), homeId: live.homeId, awayId: live.awayId };
    live._boxc = st;
  }
  if (st.i < i) {
    for (let k = st.i + 1; k <= i; k++) live_accEvent(st, evs[k], live);
    st.i = i;
  }
  const ev = evs[i];
  // 比分快照为准，修正累计误差（正常情况下 delta = 0）
  live_reconcile(st.h, (ev.hs | 0) - st.h.pts);
  live_reconcile(st.a, (ev.as | 0) - st.a.pts);
  const hb = live_cloneBox(st.h), ab = live_cloneBox(st.a);
  // 上场时间：按进度线性放大（末帧由 finalBox 精确给出）
  const fb = live.finalBox;
  const frac = (i + 1) / n;
  [hb, ab].forEach(function (b) {
    const src = (b === hb ? fb.hBox : fb.aBox);
    if (!src) return;
    Object.keys(b.players).forEach(function (pid) {
      const fr = src.players ? src.players[pid] : null;
      if (fr) b.players[pid].min = Math.round((fr.min | 0) * frac);
    });
  });
  return { hBox: hb, aBox: ab };
}

// 双方首发：取上场时间最多的 CONFIG.PLAYER.STARTING 人；无 min 回退 lineup
function live_starters(state, live) {
  const P = CONFIG.PLAYER;
  const take = P.STARTING | 0;
  const fb = live.finalBox || {};
  function pick(teamId, box) {
    const list = [];
    if (box && box.players) {
      Object.keys(box.players).forEach(function (pid) {
        const r = box.players[pid];
        if ((r.min | 0) > 0) list.push({ id: pid, name: r.name, pos: r.pos, min: r.min | 0, pts: r.pts | 0, reb: r.reb | 0, ast: r.ast | 0 });
      });
    }
    list.sort(function (a, b) { return (b.min - a.min) || (String(a.id) < String(b.id) ? -1 : 1); });
    let out = list.slice(0, take > 0 ? take : 5);
    if (out.length < (take > 0 ? take : 5)) {
      const t = teamById(state || {}, teamId);
      if (t && t.lineup) {
        (t.lineup || []).forEach(function (pid) {
          if (out.some(function (x) { return x.id === pid; })) return;
          const p = (t.players || []).filter(function (x) { return x.id === pid; })[0];
          if (p) out.push({ id: pid, name: p.name, pos: p.pos, min: 0, pts: 0, reb: 0, ast: 0 });
        });
        out = out.slice(0, take > 0 ? take : 5);
      }
    }
    return out;
  }
  return {
    homeId: live.homeId, awayId: live.awayId,
    homeName: live.homeName, awayName: live.awayName,
    home: pick(live.homeId, fb.hBox),
    away: pick(live.awayId, fb.aBox)
  };
}

// ——————————————————————————— 精彩镜头 ———————————————————————————

// 单条事件的"精彩度"权重（独立函数，便于测试与 UI 复用同一套排序口径）
function live_highlightWeight(live, ev, i, total) {
  const L = CONFIG.LIVE;
  if (!ev) return -Infinity;
  const nt = live_normType(ev.type);
  let w = 0;
  if (ev.key) w += 100;
  if (ev.clutch) w += 60;
  w += (ev.pts || 0) * 4;
  if (nt === 'DUNK') w += 30;
  if (nt === 'BLK' || nt === 'STL') w += 20;
  // 结构性事件（节间/换人/暂停）只在真正的回合不够时才补位，避免战报被"第N节结束"刷屏
  if (nt === 'QUARTER' || nt === 'OT' || nt === 'SUB' || nt === 'TIMEOUT') w -= 100;
  // 负面回合（打铁/失误/犯规）压后：只有真正被标为关键时才入选
  if (nt === 'MISS' || nt === 'TO' || nt === 'FOUL') w -= 60;
  if ((ev.q | 0) >= L.QUARTERS) w += 10;
  if (Math.abs((ev.hs | 0) - (ev.as | 0)) <= L.CLUTCH_DIFF) w += 10;
  if (i === total - 1) w += 50;
  return w - i * 0.001;   // 稳定性：同权重时靠前的优先
}

function live_highlights(live, n) {
  const L = CONFIG.LIVE;
  const evs = live.events || [];
  const want = n == null ? (L.HIGHLIGHT_MIN | 0) * 2 : (n | 0);
  if (want <= 0 || !evs.length) return [];
  const scored = [];
  for (let i = 0; i < evs.length; i++) {
    scored.push({
      i: i,
      w: live_highlightWeight(live, evs[i], i, evs.length),
      ev: evs[i],
      say: (live.commentary && live.commentary[i]) || ''
    });
  }
  scored.sort(function (a, b) { return b.w - a.w; });
  const top = scored.slice(0, want);
  top.sort(function (a, b) { return a.i - b.i; }); // 回放按时间顺序呈现
  return top.map(function (x) { return x; });
}

// ——————————————————————————— 回放存档 ———————————————————————————

function live_snapshot(live) {
  const o = {};
  Object.keys(live).forEach(function (k) {
    if (k.charAt(0) !== '_') o[k] = live[k];   // 剔除内部缓存（_boxc/_vis），保证 JSON 干净
  });
  return o;
}

function live_saveReplay(state, live) {
  state = state || {};
  if (!state.replays) state.replays = [];
  const snap = live_snapshot(live);
  let at = -1;
  for (let i = 0; i < state.replays.length; i++) { if (state.replays[i].id === snap.id) { at = i; break; } }
  if (at >= 0) state.replays[at] = snap; else state.replays.push(snap);
  const keep = CONFIG.LIVE.REPLAY_KEEP | 0;
  if (keep > 0 && state.replays.length > keep) state.replays.splice(0, state.replays.length - keep);
  return snap;
}

function live_replayById(state, id) {
  const arr = (state && state.replays) || [];
  for (let i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
  return null;
}

// 列表：最近在前（UI 回放列表常用顺序）
function live_replayList(state) {
  return ((state && state.replays) || []).slice().reverse();
}

// ——————————————————————————— 赛后战报 ———————————————————————————

function live_genReport(state, live) {
  if (!live) return null;
  const L = CONFIG.LIVE;
  const evs = live.events || [];
  // 分节比分：每节最后一条事件的快照
  const quarters = [];
  const lastOfQ = {};
  for (let i = 0; i < evs.length; i++) lastOfQ[evs[i].q | 0] = evs[i];
  Object.keys(lastOfQ).sort(function (a, b) { return (a | 0) - (b | 0); }).forEach(function (q) {
    const ev = lastOfQ[q];
    quarters.push({ q: q | 0, label: live_quarterText(q), hs: ev.hs | 0, as: ev.as | 0 });
  });
  // 最佳球员：两队合并按得分排序
  const fb = live.finalBox || {};
  const all = [];
  [fb.hBox, fb.aBox].forEach(function (box) {
    if (!box || !box.players) return;
    Object.keys(box.players).forEach(function (pid) {
      const r = box.players[pid];
      if ((r.pts | 0) + (r.reb | 0) + (r.ast | 0) + (r.stl | 0) + (r.blk | 0) <= 0 && !(r.min | 0)) return;
      all.push({
        pid: pid, name: r.name, pos: r.pos, teamId: box.teamId, teamName: box.teamName,
        pts: r.pts | 0, reb: r.reb | 0, ast: r.ast | 0, stl: r.stl | 0, blk: r.blk | 0, min: r.min | 0
      });
    });
  });
  all.sort(function (a, b) { return (b.pts - a.pts) || (b.reb - a.reb) || (b.ast - a.ast); });
  const topPlayers = all.slice(0, Math.max(1, (L.HIGHLIGHT_MIN | 0)));
  const hl = live_highlights(live);
  const hlTxt = hl.map(function (h) { return h.say; }).filter(function (s) { return !!s; });
  let summary = '';
  if (hlTxt.length) summary = hlTxt.slice(0, Math.max(1, (L.HIGHLIGHT_MIN | 0))).join('｜');
  if (!summary) summary = live.homeName + ' 与 ' + live.awayName + ' 联手上演一场对决。';
  const winName = live.winner === live.homeId ? live.homeName : live.awayName;
  summary += '｜最终 ' + winName + ' 以 ' + Math.max(live.hScore, live.aScore) + '-' + Math.min(live.hScore, live.aScore) + ' 拿下比赛。';
  return {
    title: live.homeName + ' ' + live.hScore + '-' + live.aScore + ' ' + live.awayName,
    score: {
      homeId: live.homeId, awayId: live.awayId,
      homeName: live.homeName, awayName: live.awayName,
      hScore: live.hScore, aScore: live.aScore, winner: live.winner, winnerName: winName
    },
    quarters: quarters,
    topPlayers: topPlayers,
    highlights: hl,
    summary: summary,
    matchId: live.id,
    season: live.createdSeason, round: live.createdRound, comp: live.comp,
    viewers: live.viewers, broadcastType: live.broadcastType, income: live.income
  };
}

// ——————————————————————————— 转播收入 ———————————————————————————

// 球队在其联赛内的排名（按胜场，同分按净胜分），用于判断是否"强队/焦点战"
function live_teamRank(state, teamId) {
  const t = teamById(state, teamId);
  if (!t) return 999;
  const peers = (state.teams || []).filter(function (x) { return x.leagueId === t.leagueId; });
  peers.sort(function (a, b) {
    return (b.wins - a.wins) || ((b.pf - b.pa) - (a.pf - a.pa)) || (String(a.id) < String(b.id) ? -1 : 1);
  });
  for (let i = 0; i < peers.length; i++) if (peers[i].id === teamId) return i + 1;
  return 999;
}

function live_fansOf(state, live) {
  const st = state || {};
  let fans = st.fans | 0;
  const h = teamById(st, live.homeId), a = teamById(st, live.awayId);
  if (h && h.fans != null) fans += h.fans | 0;
  if (a && a.fans != null) fans += a.fans | 0;
  return fans;
}

// 球星系数：双方最强 5 人的平均综合 / 100（全部由数据推导，无硬编码）
function live_starPower(state, live) {
  function topAvg(teamId) {
    const t = teamById(state || {}, teamId);
    if (!t || !t.players) return 0;
    const ov = t.players.map(function (p) { return players_overall(p); }).sort(function (a, b) { return b - a; });
    const k = ov.slice(0, CONFIG.PLAYER.STARTING | 0);
    if (!k.length) return 0;
    return k.reduce(function (s, x) { return s + x; }, 0) / k.length;
  }
  const a = topAvg(live.homeId), b = topAvg(live.awayId);
  return Math.max(a, b) / 100;
}

function live_broadcastType(state, live) {
  const comp = String(live.comp || '').toUpperCase();
  const stage = String(live.stage || '').toLowerCase();
  if (comp === 'PLAYOFF' || comp === '季后赛' || stage === 'playoff' || stage === 'final') return 'playoff';
  // 焦点战 / 强队：双方都在季后赛区内（复用 CONFIG.PLAYOFF.TEAMS，无新常量）
  const zone = CONFIG.PLAYOFF.TEAMS | 0;
  if (live.focus) return 'national';
  if (live_teamRank(state, live.homeId) <= zone && live_teamRank(state, live.awayId) <= zone) return 'national';
  // 常规赛：主队是玩家球队 → 地方直播，否则网络直播
  if (state && state.humanTeamId && (live.homeId === state.humanTeamId || live.awayId === state.humanTeamId)) return 'local';
  return 'web';
}

function live_broadcastIncome(state, live) {
  const L = CONFIG.LIVE;
  const type = live_broadcastType(state, live);
  const b = L.BROADCAST[type] || L.BROADCAST.web;
  const fans = live_fansOf(state, live);
  let viewers = L.VIEWER_BASE + fans * L.VIEWER_FAN_K;
  const ht = teamById(state || {}, live.homeId), at = teamById(state || {}, live.awayId);
  let wr = 0;
  if (ht) {
    const g = (ht.wins | 0) + (ht.losses | 0);
    wr = g > 0 ? (ht.wins | 0) / g : 0;
  }
  const at2 = at;
  if (at2) {
    const g = (at2.wins | 0) + (at2.losses | 0);
    if (g > 0) wr = Math.max(wr, (at2.wins | 0) / g);
  }
  viewers = viewers * (1 + wr * L.VIEWER_WIN_K) * (1 + live_starPower(state, live) * L.VIEWER_STAR_K);
  viewers = Math.max(0, Math.round(viewers));
  const income = Math.round(b.base + viewers * b.perViewer);
  return { type: type, name: b.name, base: b.base, perViewer: b.perViewer, viewers: viewers, income: income, winRate: wr };
}

// ——————————————————————————— 便捷入口 ———————————————————————————

function live_start(state, res, opts) {
  const live = live_buildFromResult(state, res, opts);
  live_genCommentary(state, live);
  live_saveReplay(state, live);
  return live;
}

// ——————————————————————————— v4.4 微操打断 ———————————————————————————
// 直播回放推进时（每次 live_next 之后）调用：检测是否命中微操触发条件。
// 命中则返回一个 trigger 描述（前端据此暂停自动播放并弹出 3 个选项）。
// 两个条件：①对手连续得分达到 OPP_RUN（如 8:0 高潮）②最后 2 分钟分差 < LAST2MIN_DIFF。
function live_detectMicro(live, state) {
  const M = CONFIG.MICRO;
  if (!M || !M.ENABLED || !live) return null;
  if (live.microDone) return null;                 // 每场至多一次
  const humanId = state ? state.humanTeamId : null;
  if (!humanId) return null;
  const evs = live.events || [];
  let from = Math.max(0, live._microFrom | 0);
  let to = live.idx | 0;
  if (to >= evs.length) to = evs.length - 1;
  let oppRun = live._oppRun || 0;
  let trigger = null;
  for (let i = from; i <= to; i++) {
    const ev = evs[i];
    const nt = live_normType(ev.type);
    if (live_isScoreType(nt)) {
      if (ev.teamId === humanId) oppRun = 0;
      else oppRun += (ev.pts || 0);
      if (oppRun >= M.OPP_RUN) { trigger = { type: 'OPP_RUN', run: oppRun, idx: i }; break; }
    }
    if (!trigger) {
      const sec = live_clockSec(ev.clock);
      if (sec <= CONFIG.LIVE.CLUTCH_WINDOW) {
        const diff = Math.abs((ev.hs | 0) - (ev.as | 0));
        if (diff < M.LAST2MIN_DIFF) trigger = { type: 'LAST2MIN', diff: diff, idx: i };
      }
    }
  }
  live._oppRun = oppRun;
  live._microFrom = to + 1;
  return trigger;
}

// 玩家选择微操选项后调用：把 Buff 应用到"剩余模拟"（重新加权尾部事件），
// 重算比分并回写战绩（state.lastResult / 双方胜负值 / 净胜分）。
function live_applyMicroBuff(state, live, optId) {
  const M = CONFIG.MICRO;
  if (!M || !M.ENABLED || !live) return { ok: false, reason: 'no-micro' };
  if (live.microDone) return { ok: false, reason: 'already' };
  let opt = null;
  for (let k = 0; k < M.OPTIONS.length; k++) if (M.OPTIONS[k].id === optId) { opt = M.OPTIONS[k]; break; }
  if (!opt) return { ok: false, reason: 'no-option' };
  const humanId = state ? state.humanTeamId : null;
  const homeId = live.homeId;
  const buff = opt.buff || {};
  const myBonus = Number(buff.myShootBonus) || 0;
  const oppPen = Number(buff.oppShootPenalty) || 0;
  const evs = live.events || [];
  const idx = live.idx | 0;
  // 确定性子种子（每次微操独立，避免同局同结果）
  live.microNonce = (live.microNonce || 0) + 1;
  const rng = makeRNG(deriveSeed(live.seed | 0, 555001 + live.microNonce * 7 + idx));
  // 重新加权尾部得分事件：我方 MISS→SCORE2；对手 SCORE→MISS
  for (let i = idx + 1; i < evs.length; i++) {
    const ev = evs[i];
    const nt = live_normType(ev.type);
    if (!live_isScoreType(nt)) continue;
    if (ev.teamId === humanId) {
      if (nt === 'MISS' && rng() < Math.min(0.6, myBonus * 1.6)) { ev.type = 'SCORE2'; ev.pts = 2; }
    } else {
      if ((nt === 'SCORE2' || nt === 'SCORE3') && rng() < Math.min(0.6, oppPen * 1.6)) { ev.type = 'MISS'; ev.pts = 0; }
    }
  }
  // 全量重算比分（O(n)，n≤400）
  let hs = 0, as = 0;
  for (let j = 0; j < evs.length; j++) {
    const e = evs[j];
    const n2 = live_normType(e.type);
    if (live_isScoreType(n2)) { if (e.teamId === homeId) hs += e.pts || 0; else as += e.pts || 0; }
    e.hs = hs; e.as = as;
  }
  live.hScore = hs; live.aScore = as;
  live.winner = (hs >= as) ? live.homeId : live.awayId;
  live.microDone = true;
  live.microOption = optId;
  live_reconcileResult(state, live);
  return { ok: true, option: optId, hScore: hs, aScore: as, winner: live.winner };
}

// 把微操改写后的比分回写到战绩（修正胜负、净胜分、lastResult、formHistory 末条）
function live_reconcileResult(state, live) {
  if (!state) return;
  const humanId = state.humanTeamId;
  const oppId = (humanId === live.homeId) ? live.awayId : live.homeId;
  const human = teamById(state, humanId), opp = teamById(state, oppId);
  if (!human || !opp) return;
  const oH = live.origH | 0, oA = live.origA | 0;
  const nH = live.hScore | 0, nA = live.aScore | 0;
  const oWin = oH >= oA ? live.homeId : live.awayId;
  const nWin = nH >= nA ? live.homeId : live.awayId;
  if (oWin !== nWin) {
    const ow = teamById(state, oWin), ol = teamById(state, (oWin === live.homeId ? live.awayId : live.homeId));
    if (ow) ow.wins = Math.max(0, ow.wins - 1);
    if (ol) ol.losses = Math.max(0, ol.losses - 1);
    const nw = teamById(state, nWin), nl = teamById(state, (nWin === live.homeId ? live.awayId : live.homeId));
    if (nw) nw.wins++; if (nl) nl.losses++;
  }
  human.pf += (nH - oH); human.pa += (nA - oA);
  opp.pf += (nA - oA); opp.pa += (nH - oH);
  if (state.lastResult) {
    state.lastResult.hScore = nH; state.lastResult.aScore = nA;
    state.lastResult.winner = nWin;
    if (state.lastResult.hBox) state.lastResult.hBox.pts = nH;
    if (state.lastResult.aBox) state.lastResult.aBox.pts = nA;
  }
  if (Array.isArray(state.formHistory) && state.formHistory.length) {
    const fh = state.formHistory[state.formHistory.length - 1];
    for (let i = 0; i < fh.length; i++) {
      if ((fh[i].h === live.homeId && fh[i].a === live.awayId) || (fh[i].h === live.awayId && fh[i].a === live.homeId)) {
        fh[i].hs = nH; fh[i].as = nA; fh[i].w = nWin;
      }
    }
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    live_normType, live_isScoreType, live_typePts, live_hashStr,
    live_clockSec, live_clockText, live_quarterSec, live_quarterText,
    live_teamName, live_isClutch, live_toneOf, live_isKey, live_commentatorSay,
    live_normEvent, live_fillScores, live_synthEvents, live_seedOf, live_cloneBox, live_emptyBox,
    live_buildFromResult, live_genCommentary, live_eventLine,
    live_visibleIdx, live_seek, live_next, live_skipToEnd, live_setSpeed, live_toggleKeyOnly, live_reset,
    live_boxAt, live_starters, live_highlights, live_highlightWeight,
    live_snapshot, live_saveReplay, live_replayById, live_replayList,
    live_genReport, live_teamRank, live_fansOf, live_starPower, live_broadcastType, live_broadcastIncome,
    live_start, live_detectMicro, live_applyMicroBuff, live_reconcileResult
  };
}
