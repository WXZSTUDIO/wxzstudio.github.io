// cangame v4 · AI 球队交易与续约（V4-BALANCE）
// 依赖：config.js / rng.js / league.js（teamById）/ transfer.js（挂牌·买断·竞价）/ salary.js（工资帽）
// 设计要点：
//   1) AI 一切新增薪资都要过 salary_canSign —— 工资帽是真的约束，AI 不得无限堆明星
//   2) 绝不修改人类球队阵容（state.humanTeamId）：
//      默认跳过"卖方是人类"的挂牌；人类主动挂牌后仍可用 transfer_closeListing 与 AI 成交
//   3) 转会截止轮 DEADLINE_ROUND 之后，AI 只能走买断市场
//   4) 全部随机走 rng 或 deriveSeed(state.seed, …)，禁止 Math.random / Date.now

function aiTrade_ensure(state) {
  if (!state) return state;
  if (!state.log) state.log = [];
  if (!state.listings) state.listings = [];
  return state;
}

function aiTrade_hashId(s) {
  let h = 2166136261 >>> 0;
  s = String(s);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

function aiTrade_subRng(state, key, tag) {
  return makeRNG(deriveSeed((state && state.seed) || 1, (aiTrade_hashId(key) ^ Math.imul(tag | 0, 0x9E3779B1)) >>> 0));
}

function aiTrade_isHuman(state, teamId) {
  return !!state && teamId === state.humanTeamId;
}

// 所有 AI 球队（排除人类）
function aiTrade_teams(state) {
  return ((state && state.teams) || []).filter(function (t) { return !aiTrade_isHuman(state, t.id); });
}

// 按 pid 找球员（队伍阵容 + 转会池 + 挂牌快照）
function aiTrade_findPlayer(state, pid) {
  const teams = (state && state.teams) || [];
  for (let i = 0; i < teams.length; i++) {
    const ps = teams[i].players || [];
    for (let j = 0; j < ps.length; j++) if (ps[j].id === pid) return ps[j];
  }
  const pool = (state && state.transferPool) || [];
  for (let i = 0; i < pool.length; i++) if (pool[i].id === pid) return pool[i];
  const list = (state && state.listings) || [];
  for (let i = 0; i < list.length; i++) if (list[i].pid === pid) return list[i].snapshot;
  return null;
}

// —— 位置强度：首发名单内该位置的最高综合；首发未覆盖则用全队该位置最强兜底 ——
function aiTrade_lineupStrength(state, team) {
  const P = CONFIG.PLAYER;
  const strong = {};
  P.POSITIONS.forEach(function (pos) { strong[pos] = 0; });
  (team.players || []).forEach(function (p) {
    if (p.overall > (strong[p.pos] || 0)) strong[p.pos] = p.overall;
  });
  const out = {};
  P.POSITIONS.forEach(function (pos) {
    let best = 0;
    ((team.lineup || []).length ? team.lineup.map(function (id) {
      return (team.players || []).filter(function (p) { return p.id === id; })[0];
    }) : []).forEach(function (p) { if (p && p.pos === pos && p.overall > best) best = p.overall; });
    out[pos] = best > 0 ? best : (strong[pos] || 0);
  });
  return out;
}

// —— 评估最缺的位置（按首发综合最低）——
function aiTrade_evaluateNeeds(state, team) {
  const P = CONFIG.PLAYER;
  const s = aiTrade_lineupStrength(state, team);
  let need = P.POSITIONS[0], worst = Infinity;
  P.POSITIONS.forEach(function (pos) {
    const v = s[pos] || 0;
    if (v < worst) { worst = v; need = pos; }
  });
  return need;
}

// —— 位置人数统计 ——
function aiTrade_posCounts(team) {
  const P = CONFIG.PLAYER;
  const counts = {};
  P.POSITIONS.forEach(function (pos) { counts[pos] = 0; });
  (team.players || []).forEach(function (p) { if (counts[p.pos] != null) counts[p.pos]++; });
  return counts;
}

// —— 买入评分：即战力 + 位置缺口 + 潜力（权重取自 CONFIG，避免硬编码）——
function aiTrade_buyScore(state, team, p, need, rng) {
  const P = CONFIG.PLAYER;
  return p.overall
    + (p.pos === need ? P.POS_SPREAD : 0)
    + Math.max(0, (p.potential || 0) - p.overall)
    + (typeof rng === 'function' ? randInt(rng, 0, P.POS_SPREAD) : 0);
}

// —— AI 出价上限 = 要价 × (1 + BID_STEP × BID_ROUNDS)，防止 AI 无限抬价 ——
function aiTrade_maxBid(ask) {
  const T = CONFIG.TRANSFER;
  return ask * (1 + T.BID_STEP * T.BID_ROUNDS);
}

// —— 买得起吗：先看工资帽，再看"溢价容忍度"——
// AI 队没有资金账（只有人类有 state.finance），所以：
//   ① 薪资必须能塞进工资帽（防止 AI 无限堆明星）
//   ② 要价不得高于"动态身价 × (1 + BID_STEP×BID_ROUNDS)"（防止 AI 无脑接盘溢价挂牌）
function aiTrade_canAfford(state, teamId, p, ask) {
  const chk = salary_canSign(state, teamId, p.salary || 0);
  if (!chk.ok) return chk;
  const ceiling = aiTrade_maxBid(transfer_price(state, p).price);
  if (ask > ceiling) return { ok: false, reason: 'bid-cap', ceiling: ceiling };
  return chk;
}

// —— 尝试买入：先看"无人出价且卖方非人类"的挂牌，再看买断市场 ——
function aiTrade_tryBuy(state, teamId, rng, opts) {
  aiTrade_ensure(state);
  opts = opts || {};
  if (aiTrade_isHuman(state, teamId)) return { ok: false, reason: 'human-team' };
  const team = teamById(state, teamId);
  if (!team) return { ok: false, reason: 'no-team' };
  const need = aiTrade_evaluateNeeds(state, team);
  let best = null, bestScore = -Infinity, bestAsk = 0, bestFrom = null;

  (state.listings || []).forEach(function (l) {
    if (l.sellerId === teamId) return;
    if (aiTrade_isHuman(state, l.sellerId) && !opts.allowHumanTarget) return;  // 默认不碰人类队的挂牌
    if (l.bids && l.bids.length) return;                 // 只抢"尚无人出价"的挂牌
    const p = l.snapshot || aiTrade_findPlayer(state, l.pid);
    if (!p) return;
    if (!aiTrade_canAfford(state, teamId, p, l.ask || 0).ok) return;
    const sc = aiTrade_buyScore(state, team, p, need, rng);
    if (sc > bestScore) { bestScore = sc; best = l; bestAsk = l.ask || 0; bestFrom = 'listing'; }
  });

  if (typeof transfer_buyoutMarket === 'function') {
    transfer_buyoutMarket(state, rng).forEach(function (e) {
      const p = e.player;
      if (!p) return;
      if (!aiTrade_canAfford(state, teamId, p, e.price || 0).ok) return;
      const sc = aiTrade_buyScore(state, team, p, need, rng);
      if (sc > bestScore) { bestScore = sc; best = { id: p.id, ask: e.price }; bestAsk = e.price; bestFrom = 'buyout'; }
    });
  }

  if (!best) return { ok: false, reason: 'no-target', need: need };

  if (bestFrom === 'listing' && typeof transfer_closeListing === 'function') {
    const r = transfer_closeListing(state, best.id, { buyerId: teamId, amount: bestAsk });
    if (r && r.ok) return { ok: true, kind: 'listing', listingId: best.id, pid: r.pid, name: r.name, price: r.price, sellerId: r.sellerId, need: need };
    return { ok: false, reason: (r && r.reason) || 'close-failed', need: need };
  }
  if (bestFrom === 'buyout' && typeof transfer_buyoutBuy === 'function') {
    const r = transfer_buyoutBuy(state, best.id, { buyerId: teamId });
    if (r && r.ok) return { ok: true, kind: 'buyout', pid: r.pid, name: r.name, price: r.price, buyerId: teamId, need: need };
    return { ok: false, reason: (r && r.reason) || 'buy-failed', need: need };
  }
  return { ok: false, reason: 'no-channel', need: need };
}

// —— 尝试卖出：挂牌"冗余位置的最弱者"或老将 ——
function aiTrade_trySell(state, teamId, rng) {
  aiTrade_ensure(state);
  if (aiTrade_isHuman(state, teamId)) return { ok: false, reason: 'human-team' };
  const team = teamById(state, teamId);
  if (!team) return { ok: false, reason: 'no-team' };
  const T = CONFIG.TRANSFER, P = CONFIG.PLAYER;
  const counts = aiTrade_posCounts(team);
  // v4.3：每位置 ≥3 即视为有冗余（原为 ceil(12/5)=3 → 必须 >3 才出手，过于保守）
  const even = Math.ceil(P.ROSTER_SIZE / P.POSITIONS.length) - 1;
  const VET_AGE = 28;   // 老将门槛由 30 降至 28，增加挂牌流动
  let top = null, topScore = -Infinity;
  (team.players || []).forEach(function (p) {
    if (p.isListed) return;
    if ((counts[p.pos] || 0) <= 1) return;                      // 该位置不能清空
    const surplus = Math.max(0, (counts[p.pos] || 0) - even);
    const veteran = p.age >= VET_AGE ? (p.age - VET_AGE + 1) : 0;
    if (surplus <= 0 && veteran <= 0) return;
    // 优先出清"冗余位置的最弱者"，其次老将（都乘 CONFIG.POS_SPREAD，避免魔数）
    const sc = (surplus + veteran) * P.POS_SPREAD - p.overall;
    if (sc > topScore) { topScore = sc; top = p; }
  });
  if (!top) return { ok: false, reason: 'no-sellable' };
  const ask = transfer_price(state, top).price;
  const r = transfer_list(state, top.id, ask, { allowAiSeller: true });
  return { ok: !!(r && r.ok), listingId: r && r.listingId, pid: top.id, name: top.name, ask: ask, reason: r && r.reason };
}

// —— 尝试续约：优先续约合同到期（contractYears ≤ 1）的最强球员 ——
function aiTrade_tryRenew(state, teamId, rng) {
  aiTrade_ensure(state);
  if (aiTrade_isHuman(state, teamId)) return { ok: false, reason: 'human-team' };
  const team = teamById(state, teamId);
  if (!team) return { ok: false, reason: 'no-team' };
  const cands = (team.players || []).filter(function (p) { return (p.contractYears || 0) <= 1; })
    .sort(function (a, b) { return b.overall - a.overall; });
  if (!cands.length) return { ok: false, reason: 'no-expiring' };
  const p = cands[0];
  const years = (typeof rng === 'function') ? randInt(rng, 1, CONFIG.SALARY.RAISE_MAX_YEARS) : CONFIG.SALARY.RAISE_MAX_YEARS;
  const r = salary_renew(state, p.id, years, rng);
  return {
    ok: !!(r && r.ok), pid: p.id, name: p.name, years: years,
    declined: !!(r && r.declined), reason: r && r.reason, salary: r && r.salary
  };
}

// —— 尝试签下自由球员：优先补最缺位置，工资帽允许才签（AI 无资金账，仅过帽校验）——
function aiTrade_trySignFA(state, teamId, rng) {
  aiTrade_ensure(state);
  if (aiTrade_isHuman(state, teamId)) return { ok: false, reason: 'human-team' };
  const team = teamById(state, teamId);
  if (!team) return { ok: false, reason: 'no-team' };
  const need = aiTrade_evaluateNeeds(state, team);
  const pool = (state.faPool || []).filter(function (p) { return p.pos === need || p.overall >= 62; });
  if (!pool.length) return { ok: false, reason: 'no-fa' };
  pool.sort(function (a, b) { return b.overall - a.overall; });
  const cand = pool[0];
  // 名册满则先释放最弱球员腾名额（仅 AI；人类走 transfer_signFA 的 roster-full 报错）
  if ((team.players || []).length >= CONFIG.PLAYER.ROSTER_SIZE) {
    const weak = team.players.slice().sort(function (a, b) { return a.overall - b.overall; })[0];
    if (!weak || cand.overall <= weak.overall) return { ok: false, reason: 'no-upgrade' };
    if (typeof transfer_release === 'function') transfer_release(state, team, weak);
  }
  if (typeof salary_canSign === 'function') {
    const chk = salary_canSign(state, teamId, cand.salary || 0);
    if (!chk.ok) return { ok: false, reason: 'over-cap' };
  }
  const r = transfer_signFATo(state, teamId, cand.id);
  return { ok: !!(r && r.ok), pid: cand.id, name: cand.name, pos: cand.pos, overall: cand.overall };
}

// —— 尝试从系统转会池买人（补最缺位置），制造可见的球员流动 ——
function aiTrade_tryBuyPool(state, teamId, rng) {
  aiTrade_ensure(state);
  if (aiTrade_isHuman(state, teamId)) return { ok: false, reason: 'human-team' };
  const team = teamById(state, teamId);
  if (!team) return { ok: false, reason: 'no-team' };
  const need = aiTrade_evaluateNeeds(state, team);
  const pool = (state.transferPool || []).filter(function (p) { return p.pos === need; });
  if (!pool.length) return { ok: false, reason: 'no-target' };
  const curBest = aiTrade_lineupStrength(state, team)[need] || 0;
  const cand = pool.filter(function (p) {
    if (typeof salary_canSign === 'function' && !salary_canSign(state, teamId, p.salary || 0).ok) return false;
    return p.overall > curBest - 4;   // 略强于现有即值得补
  }).sort(function (a, b) { return b.overall - a.overall; })[0];
  if (!cand) return { ok: false, reason: 'no-upgrade' };
  const r = transfer_buyFor(state, teamId, cand.id);
  return { ok: !!(r && r.ok), pid: cand.id, name: cand.name, pos: cand.pos, overall: cand.overall };
}

// —— 每轮决策：每 AI_TRADE_GAP 轮触发一次窗口，窗口内按 AI_TRADE_CHANCE 概率出手 ——
function aiTrade_tick(state, rng) {
  aiTrade_ensure(state);
  const T = CONFIG.TRANSFER;
  const summary = [];
  const eligible = !!T.AI_TRADE_ENABLED && ((state.round || 0) === 0 || (state.round % T.AI_TRADE_GAP) === 0);
  aiTrade_teams(state).forEach(function (t) {
    const r = (typeof rng === 'function') ? rng : aiTrade_subRng(state, t.id, (state.round || 0) * 31 + 7);
    if (!eligible) { summary.push({ teamId: t.id, skipped: true, reason: 'not-eligible' }); return; }
    if (r() >= T.AI_TRADE_CHANCE) { summary.push({ teamId: t.id, skipped: true, reason: 'no-action' }); return; }
    summary.push({
      teamId: t.id, skipped: false,
      renew: aiTrade_tryRenew(state, t.id, r),
      buy: aiTrade_tryBuy(state, t.id, r),
      buyPool: aiTrade_tryBuyPool(state, t.id, r),
      signFA: aiTrade_trySignFA(state, t.id, r),
      sell: aiTrade_trySell(state, t.id, r)
    });
  });
  state.lastAiTradeRound = state.round || 0;
  return summary;
}

// —— 休赛期集中运作：所有 AI 队各操作一轮（不受 gap / chance 限制）——
function aiTrade_runOffseason(state, rng) {
  aiTrade_ensure(state);
  const teams = aiTrade_teams(state);
  const res = { teams: teams.length, renewed: 0, declined: 0, sold: 0, bought: 0, idle: 0 };
  teams.forEach(function (t, i) {
    const r = (typeof rng === 'function') ? rng : aiTrade_subRng(state, t.id, 991 * (i + 1) + 13);
    const nw = aiTrade_tryRenew(state, t.id, r);
    if (nw && nw.ok) res.renewed++;
    else if (nw && nw.declined) res.declined++;
    else res.idle++;
    const sl = aiTrade_trySell(state, t.id, r);
    if (sl && sl.ok) res.sold++;
    const by = aiTrade_tryBuy(state, t.id, r);
    if (by && by.ok) res.bought++;
    const bp = aiTrade_tryBuyPool(state, t.id, r);
    if (bp && bp.ok) res.bought++;
    const fa = aiTrade_trySignFA(state, t.id, r);
    if (fa && fa.ok) res.bought++;
  });
  return res;
}

if (typeof module !== 'undefined') {
  module.exports = {
    aiTrade_ensure, aiTrade_isHuman, aiTrade_teams, aiTrade_findPlayer, aiTrade_lineupStrength,
    aiTrade_evaluateNeeds, aiTrade_posCounts, aiTrade_buyScore, aiTrade_maxBid, aiTrade_canAfford,
    aiTrade_tryBuy, aiTrade_trySell, aiTrade_tryRenew, aiTrade_tick, aiTrade_runOffseason,
    aiTrade_trySignFA, aiTrade_tryBuyPool,
    aiTrade_subRng, aiTrade_hashId
  };
}
