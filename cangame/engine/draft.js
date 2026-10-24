// cangame v4 · 选秀系统（新秀生成 / 球探报告 / 试训 / 乐透 / 选秀权交易）
// 依赖：config.js / rng.js / players.js / league.js（teamById）
// 设计要点：
//   1) 新秀 = 即战力低（overall 钉在 CONFIG.PLAYER.ROOKIE_RANGE）+ 潜力高（overall + ROOKIE_POTENTIAL）
//   2) 球探报告免费但带误差；试训付费（WORKOUT_COST）提高揭示准确度（WORKOUT_ACCURACY）
//   3) 全部随机走传入的 rng 或 deriveSeed，禁止 Math.random / Date.now

var DRAFT_BASE_YEAR = 2025;      // 赛季 → 年份锚点（第 1 赛季 = 2025 年选秀）
var DRAFT_PULL_STEPS = 32;       // 综合收敛迭代上限（算法常量，非平衡数值）
var DRAFT_SCOUT_ACC_K = 0.5;     // 未试训准确度 = WORKOUT_ACCURACY × 该系数

// ——— 存档兼容：新增字段惰性初始化 ———
function draft_ensure(state) {
  if (!state.draftClass) state.draftClass = [];
  if (!state.scoutReports) state.scoutReports = {};
  if (!state.draftPickTrades) state.draftPickTrades = [];
  return state;
}

// 字符串 → 32 位哈希（按球员派生稳定的报告子种子）
function draft_hashId(s) {
  let h = 2166136261 >>> 0;
  s = String(s);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

function draft_seasonYear(state) {
  return DRAFT_BASE_YEAR + ((state && state.season ? state.season : 1) - 1);
}

// ——— 把球员综合钉到目标值（保留属性形状，钳制由 ATTR_MIN/ATTR_MAX 兜住）———
function draft_fitOverall(p, target) {
  const P = CONFIG.PLAYER;
  p.overall = players_overall(p);
  for (let it = 0; it < DRAFT_PULL_STEPS; it++) {
    const cur = p.overall;
    if (cur === target) break;
    const d = target - cur;
    if (Math.abs(d) > 3) {
      // 差距大：整体按比例缩放（保留属性高低差）
      const k = target / Math.max(1, cur);
      P.ATTRS.forEach(function (key) {
        p.a[key] = clamp(Math.round(p.a[key] * k), P.ATTR_MIN, P.ATTR_MAX);
      });
    } else {
      // 差距小：整体平移（微调会受钳制影响，故只用于收尾）
      P.ATTRS.forEach(function (key) {
        p.a[key] = clamp(p.a[key] + d, P.ATTR_MIN, P.ATTR_MAX);
      });
    }
    p.overall = players_overall(p);
    if (p.overall === cur) break;   // 钳制封顶，无法再移动
  }
  p.a.STR = clamp(p.a.STR != null ? p.a.STR : P.STR_RANGE[0], P.ATTR_MIN, P.ATTR_MAX);
  return p.overall;
}

// ——— 生成一届新秀：即战力低 + 潜力高 ———
function draft_genClass(state, rng, year) {
  draft_ensure(state);
  const D = CONFIG.DRAFT, P = CONFIG.PLAYER;
  if (year == null) year = draft_seasonYear(state);
  const cls = [];
  for (let i = 0; i < D.CLASS_SIZE; i++) {
    // 位置轮转铺开，保证一届新秀五个位置都有人（AI 按缺位置选人时才有意义）
    const pos = P.POSITIONS[i % P.POSITIONS.length];
    const target = randInt(rng, P.ROOKIE_RANGE[0], P.ROOKIE_RANGE[1]);
    // tier 直接对齐目标综合，减少后续收敛对属性形状的破坏
    const p = genPlayer(rng, {
      id: 'draft' + year + '_' + i,
      pos: pos,
      age: randInt(rng, D.ROOKIE_AGE[0], D.ROOKIE_AGE[1]),
      tier: target - P.BASE_MEAN,
      baseYear: year,
      isFA: false
    });
    draft_fitOverall(p, target);
    p.isRookie = true;
    p.draftYear = year;
    p.draftedBy = null;
    p.potential = clamp(p.overall + randInt(rng, P.ROOKIE_POTENTIAL[0], P.ROOKIE_POTENTIAL[1]), P.ATTR_MIN, P.ATTR_MAX);
    p.salary = players_salary(p);
    cls.push(p);
  }
  state.draftClass = cls;
  return cls;
}

// 未签约新秀（可摘牌）
function draft_available(state) {
  draft_ensure(state);
  return (state.draftClass || []).filter(function (p) { return !p.draftedBy; });
}

function draft_prospect(state, pid) {
  draft_ensure(state);
  const arr = state.draftClass || [];
  for (let i = 0; i < arr.length; i++) if (arr[i].id === pid) return arr[i];
  return null;
}

// ——— 球探报告：未试训时潜力带误差 ———
function draft_buildReport(state, p, worked) {
  const D = CONFIG.DRAFT, P = CONFIG.PLAYER;
  const acc = worked ? D.WORKOUT_ACCURACY : D.WORKOUT_ACCURACY * DRAFT_SCOUT_ACC_K;
  // 误差带由“揭示准确度”与潜力区间宽度共同决定（全部来自 CONFIG）
  const band = Math.max(1, Math.round((1 - acc) * (P.ROOKIE_POTENTIAL[1] - P.ROOKIE_POTENTIAL[0])));
  const r = makeRNG(deriveSeed(state.seed || 1, draft_hashId(p.id) ^ (worked ? 0x5bf03635 : 0x1d7f9b11)));
  const overallShown = clamp(p.overall + randInt(r, -band, band), P.ATTR_MIN, P.ATTR_MAX);
  const potentialShown = clamp(p.potential + randInt(r, -band, band), P.ATTR_MIN, P.ATTR_MAX);
  return {
    pid: p.id, name: p.name, pos: p.pos, age: p.age, height: p.height,
    overallShown: overallShown,
    potentialShown: potentialShown,
    potential: potentialShown,      // 与 potentialShown 同值（契约别名，便于存档读取）
    accuracy: acc, band: band,
    worked: !!worked
  };
}

// 球探报告（免费，误差较大；结果缓存到 state.scoutReports[pid]）
function draft_scoutReport(state, pid) {
  draft_ensure(state);
  const p = draft_prospect(state, pid);
  if (!p) return null;
  const cached = state.scoutReports[pid];
  if (cached) return cached;
  const rep = draft_buildReport(state, p, false);
  state.scoutReports[pid] = rep;
  return rep;
}

// 试训（付费，揭示更精确；余额不足直接失败，绝不扣成负数）
function draft_workout(state, pid) {
  draft_ensure(state);
  const p = draft_prospect(state, pid);
  if (!p) return { ok: false, reason: 'no-player' };
  const cost = CONFIG.DRAFT.WORKOUT_COST;
  const cached = state.scoutReports[pid];
  if (cached && cached.worked) return { ok: true, report: cached, charged: 0, reason: 'already' };
  if ((state.finance.cash || 0) < cost) return { ok: false, reason: 'no-cash', need: cost };
  state.finance.cash -= cost;
  state.finance.expense += cost;
  const rep = draft_buildReport(state, p, true);
  state.scoutReports[pid] = rep;
  p.workedOut = true;
  (state.log || (state.log = [])).push('🔎 试训 ' + p.name + '（' + p.pos + '），花费 ¥' + cost + '，潜力揭示 ' + rep.potentialShown);
  return { ok: true, report: rep, charged: cost };
}

// v4.4 球探：新秀默认隐藏具体数值，只暴露范围 [round(综合)±RANGE_BAND]；
// 已球探（scoutReports 命中，含试训）则揭示整体与潜力。供 UI 直接调用。
function draft_scoutInfo(state, p) {
  const P = CONFIG.PLAYER, S = CONFIG.SCOUTING;
  const rep = state && state.scoutReports ? state.scoutReports[p.id] : null;
  const young = p.isRookie || ((p.age || 99) <= S.ROOKIE_MAX_AGE);
  if (rep) {
    return { scouted: true, young: young, hidden: false, overall: rep.overallShown != null ? rep.overallShown : p.overall, potential: rep.potentialShown != null ? rep.potentialShown : p.potential, range: null, rangeText: null };
  }
  if (!S.ENABLED || !young) {
    return { scouted: false, young: young, hidden: false, overall: p.overall, potential: p.potential, range: null, rangeText: null };
  }
  const base = Math.round(p.overall);
  const lo = clamp(base - S.RANGE_BAND, P.ATTR_MIN, P.ATTR_MAX);
  const hi = clamp(base + S.RANGE_BAND, P.ATTR_MIN, P.ATTR_MAX);
  return { scouted: false, young: young, hidden: true, overall: null, potential: null, range: [lo, hi], rangeText: lo + '~' + hi };
}

// ——— 选秀权交易映射：某轮某队签位归属 ———
function draft_pickOwner(state, round, teamId) {
  draft_ensure(state);
  const tr = state.draftPickTrades.filter(function (x) { return x.round === round && x.fromTeamId === teamId; })[0];
  return tr ? tr.toTeamId : teamId;
}

// ——— 选秀顺序：默认按上赛季战绩倒序（弱队先选），乐透按比例混入随机 ———
function draft_order(state, rng, round) {
  draft_ensure(state);
  const D = CONFIG.DRAFT;
  const r = round == null ? ((state.draft && state.draft.round) || 1) : round;
  // 战绩倒序：胜场少在前 → 净胜分低在前
  const ranked = state.teams.slice().sort(function (x, y) {
    if (x.wins !== y.wins) return x.wins - y.wins;
    return (x.pf - x.pa) - (y.pf - y.pa);
  });
  let order;
  if (D.LOTTERY && D.LOTTERY_WEIGHT > 0) {
    // 乐透：真实顺位权重 (1-w) 与随机权重 w 线性混合（w=0 严格倒序，w=1 完全随机）
    const w = clamp(D.LOTTERY_WEIGHT, 0, 1), n = ranked.length;
    order = ranked.map(function (t, i) {
      return { t: t, k: -i * (1 - w) + rng() * w * n };
    }).sort(function (a, b) { return b.k - a.k; }).map(function (x) { return x.t; });
  } else {
    order = ranked;
  }
  return order.map(function (t) { return draft_pickOwner(state, r, t.id); });
}

// 当前该谁选
function draft_current(state) {
  draft_ensure(state);
  const d = state.draft;
  if (!d || !d.order || !d.order.length || d.done) {
    return { done: true, round: d ? d.round : 0, pickIndex: 0, pickNumber: 0, teamId: null, remaining: draft_available(state).length };
  }
  const remaining = draft_available(state).length;
  return {
    done: remaining === 0,
    round: d.round,
    pickIndex: d.pickIndex,
    pickNumber: (d.round - 1) * d.order.length + d.pickIndex + 1,
    teamId: draft_pickOwner(state, d.round, d.order[d.pickIndex]),
    remaining: remaining
  };
}

// 推进到下一个签位（两轮：CONFIG.DRAFT.ROUNDS）
function draft_advance(state) {
  draft_ensure(state);
  const d = state.draft;
  if (!d || !d.order || !d.order.length) return { done: true, teamId: null, round: 0, pickIndex: 0, pickNumber: 0, remaining: 0 };
  if (d.done) return draft_current(state);
  d.pickIndex++;
  while (d.pickIndex >= d.order.length) {
    d.round++;
    d.pickIndex -= d.order.length;
    if (d.round > CONFIG.DRAFT.ROUNDS) {
      d.done = true; d.pickIndex = 0; d.round = CONFIG.DRAFT.ROUNDS + 1;
      return draft_current(state);
    }
    // 新一轮按战绩重排（同一 seed 下确定性）
    d.order = draft_order(state, makeRNG(deriveSeed(state.seed || 1, d.year * 131 + d.round * 17)), d.round);
  }
  if (!draft_available(state).length) d.done = true;
  return draft_current(state);
}

// ——— 执行选择 ———
function draft_pick(state, teamId, pid) {
  draft_ensure(state);
  const P = CONFIG.PLAYER;
  const p = draft_prospect(state, pid);
  if (!p) return { ok: false, reason: 'no-player' };
  if (p.draftedBy) return { ok: false, reason: 'already-drafted' };
  const team = teamById(state, teamId);
  if (!team) return { ok: false, reason: 'no-team' };
  if (team.players.length >= P.ROSTER_SIZE) return { ok: false, reason: 'roster-full' };   // 满员拒签，不静默丢人

  const d = state.draft || {};
  const cur = draft_current(state);
  p.draftedBy = teamId;
  p.isFA = false;
  p.isRookie = true;
  p.draftRound = d.round || 1;
  p.draftPick = (d.picks ? d.picks.length : 0) + 1;
  p.salary = players_salary(p);
  team.players.push(p);
  if (team.lineup.length < P.STARTING && team.lineup.indexOf(p.id) < 0) team.lineup.push(p.id);
  if (d.picks) d.picks.push({ round: d.round || 1, pickNumber: cur.pickNumber, teamId: teamId, pid: p.id });
  (state.log || (state.log = [])).push('🎓 选秀第 ' + (d.round || 1) + '轮：' + team.name + ' 选中 ' + p.name +
    '（' + p.pos + '，综合 ' + p.overall + ' / 潜力 ' + p.potential + '）');
  return p;
}

// 玩家选择；选完立即让 AI 连续选到再次轮到玩家（否则选秀永不推进）
function draft_humanPick(state, pid) {
  const r = draft_pick(state, state.humanTeamId, pid);
  if (r && r.id) {
    const d = state.draft;
    if (d && !d.done) {
      draft_autoAIPicks(state, makeRNG(deriveSeed(state.seed || 1, state.season * 13 + (d.pickIndex || 0) + 71)));
    }
  }
  return r;
}

// AI 选人评分：潜力为主 + 位置缺口 + 即战力；同分靠 rng 打破（确定性）
function draft_aiChoose(state, teamId, avail, rng) {
  const P = CONFIG.PLAYER;
  const team = teamById(state, teamId);
  const counts = {};
  P.POSITIONS.forEach(function (pos) { counts[pos] = 0; });
  (team ? team.players : []).forEach(function (p) { if (counts[p.pos] != null) counts[p.pos]++; });
  const avg = (team ? team.players.length : 0) / P.POSITIONS.length;
  const jitter = Math.max(1, Math.round(P.POS_SPREAD / 2));
  let best = null, bestScore = -1e9;
  for (let i = 0; i < avail.length; i++) {
    const p = avail[i];
    const need = (avg - (counts[p.pos] || 0)) * P.POS_SPREAD;   // 缺位置加权（权重取 CONFIG）
    const s = p.potential + p.overall * 0.35 + need + randInt(rng, 0, jitter);
    if (s > bestScore) { bestScore = s; best = p; }
  }
  return best || avail[0];
}

// 腾名额：裁掉队内综合最低者（AI 球队用；玩家队不自动裁人，须自行管理名册）
function draft_makeRoom(state, teamId) {
  const team = teamById(state, teamId);
  if (!team || team.players.length < CONFIG.PLAYER.ROSTER_SIZE) return null;
  const drop = team.players.slice().sort(function (a, b) { return a.overall - b.overall; })[0];
  team.players = team.players.filter(function (p) { return p.id !== drop.id; });
  team.lineup = (team.lineup || []).filter(function (id) { return id !== drop.id; });
  (state.log || (state.log = [])).push('✂ ' + team.name + ' 为选秀腾名额，裁掉 ' + drop.name + '（综合 ' + drop.overall + '）');
  return drop;
}

// AI 球队自动选人（一路选到轮到玩家 / 新秀摘完 / 选秀结束）
function draft_autoAIPicks(state, rng) {
  draft_ensure(state);
  const out = [];
  const d = state.draft;
  const maxIter = CONFIG.DRAFT.ROUNDS * ((d && d.order ? d.order.length : 0)) + 2;
  for (let i = 0; i < maxIter; i++) {
    const cur = draft_current(state);
    if (cur.done || !cur.teamId) break;
    if (cur.teamId === state.humanTeamId) break;      // 轮到玩家，交回控制权
    const avail = draft_available(state);
    if (!avail.length) break;
    const choice = draft_aiChoose(state, cur.teamId, avail, rng);
    let res = draft_pick(state, cur.teamId, choice.id);
    // AI 名册满员：先裁掉最弱一人再摘牌（draft_pick 本身对满员一律拒签，不改）
    if (res && res.ok === false && res.reason === 'roster-full') {
      draft_makeRoom(state, cur.teamId);
      res = draft_pick(state, cur.teamId, choice.id);
    }
    out.push({
      round: cur.round, pickNumber: cur.pickNumber, teamId: cur.teamId, pid: choice.id, name: choice.name,
      ok: !!(res && res.id), reason: (res && res.ok === false) ? res.reason : null
    });
    draft_advance(state);
  }
  return out;
}

// ——— 选秀权交易 ———
function draft_tradePick(state, fromTeamId, toTeamId, round) {
  draft_ensure(state);
  const D = CONFIG.DRAFT;
  if (!D.PICK_TRADE_ENABLED) return { ok: false, reason: 'disabled' };
  const from = teamById(state, fromTeamId), to = teamById(state, toTeamId);
  if (!from || !to) return { ok: false, reason: 'no-team' };
  if (fromTeamId === toTeamId) return { ok: false, reason: 'same-team' };
  const r = round == null ? ((state.draft && state.draft.round) || 1) : round;
  if (r < 1 || r > D.ROUNDS) return { ok: false, reason: 'bad-round' };
  // 同一签位重复交易：以最后一次为准
  state.draftPickTrades = state.draftPickTrades.filter(function (x) {
    return !(x.round === r && x.fromTeamId === fromTeamId);
  });
  const rec = { round: r, fromTeamId: fromTeamId, toTeamId: toTeamId, season: state.season, year: (state.draft && state.draft.year) || draft_seasonYear(state) };
  state.draftPickTrades.push(rec);
  (state.log || (state.log = [])).push('🔄 选秀权交易：第 ' + r + ' 轮签 ' + from.name + ' → ' + to.name);
  return { ok: true, trade: rec };
}

// ——— 赛季中球探开放：预生成「下一届」新秀供考察（不开启选秀，state.draft 保持 null）———
// draft_start 仅在赛季末 seasonRoll 调用；若不预生成，整个赛季球探/试训无目标
function draft_openScouting(state) {
  draft_ensure(state);
  const D = CONFIG.DRAFT;
  if (!D.ENABLED) return null;
  const hasClass = (state.draftClass || []).length > 0;
  const hasActiveDraft = !!state.draft && !state.draft.done;
  if (hasClass || hasActiveDraft) return state.draftClass;
  const rng = makeRNG(deriveSeed(state.seed || 1, (state.season || 1) * 977 + 5));
  return draft_genClass(state, rng, draft_seasonYear(state) + 1);
}

// ——— 赛季末开启选秀：生成新秀 + 定顺序 + 重置轮次 ———
function draft_start(state, rng) {
  draft_ensure(state);
  const D = CONFIG.DRAFT;
  if (!D.ENABLED) return { ok: false, reason: 'disabled' };
  const year = draft_seasonYear(state);
  const cls = draft_genClass(state, rng, year);
  state.scoutReports = {};
  state.draftPickTrades = [];
  const order = draft_order(state, rng, 1);
  state.draft = {
    year: year, round: 1, pickIndex: 0,
    order: order, picks: [],
    done: cls.length === 0
  };
  (state.log || (state.log = [])).push('🎓 第 ' + year + ' 年选秀开启：' + cls.length + ' 名新秀 / ' + order.length + ' 支球队参与');
  return state.draft;
}

// 状元 / 榜眼 / 探花
function draft_topThree(state) {
  const d = state.draft || {};
  const labels = ['状元', '榜眼', '探花'];
  return (d.picks || []).slice(0, 3).map(function (r, i) {
    const p = draft_prospect(state, r.pid);
    const t = teamById(state, r.teamId);
    return {
      label: labels[i], pid: r.pid, name: p ? p.name : '', pos: p ? p.pos : '',
      overall: p ? p.overall : 0, potential: p ? p.potential : 0,
      teamId: r.teamId, teamName: t ? t.name : ''
    };
  });
}

if (typeof module !== 'undefined') {
  module.exports = {
    draft_genClass, draft_scoutReport, draft_workout, draft_scoutInfo, draft_order, draft_pick,
    draft_humanPick, draft_autoAIPicks, draft_advance, draft_tradePick, draft_start,
    draft_available, draft_prospect, draft_current, draft_aiChoose, draft_topThree, draft_makeRoom,
    draft_ensure, draft_fitOverall, draft_pickOwner, draft_seasonYear, draft_openScouting
  };
}
