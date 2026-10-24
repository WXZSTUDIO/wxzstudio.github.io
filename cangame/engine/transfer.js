// cangame v4 · 转会市场（XBA 逆向：系统球员池 + 极限球员）
// v4 变更（V4-BALANCE）：动态定价 + 挂牌费 / 竞价 / 成交税 / 球探 / 买断市场 / 转会截止轮
//   身价 = 基础价 × 年龄系数 × 潜力系数 × 位置稀缺系数 × 市场供需系数
// 兼容：transfer_genPool / transfer_buy / transfer_jersey 的签名与行为保持不变
// 存档：state.listings / state.scoutReports / state.buyoutMarket 为新增可选字段（缺失时惰性初始化）

// —— 新增字段惰性初始化 ——
function transfer_ensure(state) {
  if (!state) return state;
  if (!state.listings) state.listings = [];            // 挂牌列表
  if (!state.scoutReports) state.scoutReports = {};    // 球探报告缓存（按 pid）
  if (!state.buyoutMarket) state.buyoutMarket = [];    // 买断市场快照
  if (!state.faPool) state.faPool = [];                // 自由球员池
  if (!state.faSeq) state.faSeq = 0;
  if (!state.log) state.log = [];
  if (!state.finance) state.finance = { cash: 0, income: 0, expense: 0 };
  if (state.transferSeq == null) state.transferSeq = 0;
  return state;
}

// 字符串 → 32 位哈希（按球员派生稳定的球探子种子）
function transfer_hashId(s) {
  let h = 2166136261 >>> 0;
  s = String(s);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

// ==================== 查找辅助 ====================
function transfer_findRoster(state, pid) {
  const teams = (state && state.teams) || [];
  for (let i = 0; i < teams.length; i++) {
    const ps = teams[i].players || [];
    for (let j = 0; j < ps.length; j++) {
      if (ps[j].id === pid) return { p: ps[j], teamId: teams[i].id, team: teams[i] };
    }
  }
  return null;
}
function transfer_findPoolOrRoster(state, pid) {
  const hit = transfer_findRoster(state, pid);
  if (hit) return hit;
  const pool = (state && state.transferPool) || [];
  for (let i = 0; i < pool.length; i++) {
    if (pool[i].id === pid) return { p: pool[i], teamId: null, team: null };
  }
  return null;
}
function transfer_ownerTeamOf(state, pid) {
  const hit = transfer_findRoster(state, pid);
  return hit ? hit.teamId : null;
}

// 释放球员（离队）：人类队按 resellRate 回收现金
function transfer_release(state, team, p) {
  if (!team || !p) return 0;
  team.players = (team.players || []).filter(function (x) { return x.id !== p.id; });
  team.lineup = (team.lineup || []).filter(function (id) { return id !== p.id; });
  const refund = Math.round((p.marketPrice || p.overall * 200) * CONFIG.TRANSFER.resellRate);
  if (team.id === state.humanTeamId) {
    state.finance.cash += refund;
    state.finance.income += refund;
    state.log.push('转出 ' + p.name + '（回收 ¥' + refund + '）');
  }
  return refund;
}

// 资金不足时转出队内最弱的非挂牌球员换现金（AI 队无资金账，跳过）
function transfer_raiseCash(state, team, need) {
  let guard = 0;
  while ((team.players || []).length > CONFIG.PLAYER.STARTING && guard < 12) {
    if ((state.finance.cash || 0) >= need) break;
    const cands = (team.players || []).filter(function (x) { return !x.isListed; })
      .sort(function (a, b) { return a.overall - b.overall; });
    if (!cands.length) break;
    transfer_release(state, team, cands[0]);
    guard++;
  }
  return (state.finance.cash || 0) >= need;
}

// ==================== 系统球员池（沿用旧行为 + 应用新分布 + 动态定价）====================
function transfer_genPool(state, rng) {
  const T = CONFIG.TRANSFER;
  const pool = [];
  for (let i = 0; i < T.poolSize; i++) {
    const extreme = rng() < T.extremeRate;   // 先定极限，避免受 genPlayer 内部 rng 消耗影响
    const p = genPlayer(rng, { id: 'mkt_' + i, tier: randInt(rng, -4, 14) });
    if (extreme) {
      p.isExtreme = true;
      p.overall = clamp(p.overall + randInt(rng, 3, 8), CONFIG.PLAYER.ATTR_MIN, CONFIG.PLAYER.ATTR_MAX);
      p.jersey = randInt(rng, 0, 99); // 极限球员专属球衣号码（可刷）
    }
    p.salary = players_salary(p);
    pool.push(p);
  }
  // 保证转会池至少有一个极限球员（XBA：市场必出极限球员）
  if (!pool.some(function (p) { return p.isExtreme; })) {
    const p = pool[0]; p.isExtreme = true;
    p.overall = clamp(p.overall + randInt(rng, 3, 8), CONFIG.PLAYER.ATTR_MIN, CONFIG.PLAYER.ATTR_MAX);
    p.jersey = randInt(rng, 0, 99);
  }
  // "市场供需"要在完整市场上统计，故先造齐全部球员再统一定价
  const marketState = { transferPool: pool, listings: (state && state.listings) || [] };
  pool.forEach(function (p) { p.marketPrice = transfer_price(marketState, p).price; });
  return pool;
}

// ==================== v4 · 动态定价 ====================
// 基础价：沿用旧模型（综合² × priceK），极限球员沿用其专属加成
function transfer_basePrice(p) {
  const T = CONFIG.TRANSFER;
  return p.overall * p.overall * T.priceK + (p.isExtreme ? 50000 : 0);
}

// 年龄系数：以 AGE_PEAK 为峰值，年轻一侧向 AGE_YOUNG_K 收敛、老将一侧向 AGE_OLD_K 收敛
function transfer_ageFactor(p) {
  const T = CONFIG.TRANSFER, P = CONFIG.PLAYER;
  const peak = T.AGE_PEAK;
  if (p.age <= peak) {
    const t = clamp((peak - p.age) / Math.max(1, peak - P.AGE_MIN), 0, 1);
    return 1 - (1 - T.AGE_YOUNG_K) * t;
  }
  const t = clamp((p.age - peak) / Math.max(1, P.AGE_MAX - peak), 0, 1);
  return 1 - (1 - T.AGE_OLD_K) * t;
}

// 潜力系数：潜力高于综合越多越贵
function transfer_potentialFactor(p) {
  const T = CONFIG.TRANSFER;
  const gap = Math.max(0, (p.potential || 0) - p.overall);
  const span = CONFIG.PLAYER.POS_SPREAD * 2;   // 归一化尺度复用既有 CONFIG，避免新增魔数
  return 1 + T.POTENTIAL_K * clamp(gap / span, 0, 1);
}

// 位置稀缺系数：中锋最贵
function transfer_scarcityFactor(p) {
  const m = CONFIG.TRANSFER.POS_SCARCITY || {};
  return m[p.pos] != null ? m[p.pos] : 1;
}

// 市场供需系数：统计当前市场（转会池 + 挂牌）同位置供给
function transfer_supplyFactor(state, p) {
  const T = CONFIG.TRANSFER, P = CONFIG.PLAYER;
  const pool = (state && state.transferPool) || [];
  const listings = (state && state.listings) || [];
  let same = 0, total = 0;
  pool.forEach(function (x) { total++; if (x.pos === p.pos) same++; });
  listings.forEach(function (l) {
    const lp = l.snapshot;
    if (!lp || lp.id === p.id) return;            // 同一名球员不重复计入供给
    total++; if (lp.pos === p.pos) same++;
  });
  if (total <= 0) return 1;
  const fair = total / P.POSITIONS.length;        // 均衡供给
  const ratio = same / Math.max(1, fair);
  if (ratio >= 1) return 1 - T.SUPPLY_K * clamp(ratio - 1, 0, 1);   // 供过于求 → 降价
  return 1 + T.DEMAND_K * clamp(1 - ratio, 0, 1);                   // 稀缺 → 加价
}

// —— 核心：动态身价（返回价格 + breakdown 明细，便于测试与 UI 展示）——
function transfer_price(state, p) {
  const base = transfer_basePrice(p);
  const fAge = transfer_ageFactor(p);
  const fPot = transfer_potentialFactor(p);
  const fPos = transfer_scarcityFactor(p);
  const fSup = transfer_supplyFactor(state, p);
  const raw = base * fAge * fPot * fPos * fSup;
  const price = Math.max(100, Math.round(raw / 100) * 100);
  return {
    price: price,
    breakdown: {
      base: Math.round(base), age: fAge, potential: fPot, scarcity: fPos, supply: fSup,
      raw: Math.round(raw), overall: p.overall, pos: p.pos
    }
  };
}

// ==================== v4 · 转会截止轮 ====================
// 是否在转会截止轮 DEADLINE_ROUND 之前
function transfer_beforeDeadline(state) {
  return (((state && state.round) || 0)) < CONFIG.TRANSFER.DEADLINE_ROUND;
}

// ==================== v4 · 挂牌 ====================
// 卖方付挂牌费（要价 × LISTING_FEE），写入 state.listings
// opts.allowAiSeller = true 时允许 AI 球队挂牌（默认只认人类队，防止越权操作他队阵容）
function transfer_list(state, pid, askPrice, opts) {
  transfer_ensure(state);
  opts = opts || {};
  const hit = transfer_findRoster(state, pid);
  if (!hit) return { ok: false, reason: 'no-player' };
  const owner = hit.team, p = hit.p;
  if (!opts.allowAiSeller && owner.id !== state.humanTeamId) return { ok: false, reason: 'not-your-player' };
  const already = (state.listings || []).filter(function (l) { return l.pid === pid; })[0];
  if (already) return { ok: false, reason: 'already-listed', listingId: already.id };
  const ask = askPrice != null ? Math.round(askPrice) : transfer_price(state, p).price;
  const fee = Math.round(ask * CONFIG.TRANSFER.LISTING_FEE);
  const isHumanSeller = owner.id === state.humanTeamId;
  let feeCharged = 0;
  if (isHumanSeller && state.finance.cash >= fee) {
    state.finance.cash -= fee;
    state.finance.expense += fee;
    feeCharged = fee;
  }
  const id = 'L' + (state.transferSeq++);
  state.listings.push({
    id: id, pid: pid, sellerId: owner.id, ask: ask, listingFee: fee, feeCharged: feeCharged,
    bids: [], round: state.round || 0, snapshot: JSON.parse(JSON.stringify(p))
  });
  p.isListed = true;
  state.log.push('📋 挂牌 ' + p.name + '（' + p.pos + '，综合 ' + p.overall + '，要价 ¥' + ask.toLocaleString()
    + '，挂牌费 ¥' + fee + '）');
  return { ok: true, listingId: id, ask: ask, listingFee: fee, feeCharged: feeCharged, sellerId: owner.id, pid: pid };
}

// ==================== v4 · 竞价 ====================
// 首次出价 ≥ 要价；之后每次加价不低于 BID_STEP；最多 BID_ROUNDS 次出价
function transfer_bid(state, listingId, teamId, amount) {
  transfer_ensure(state);
  const T = CONFIG.TRANSFER;
  const l = (state.listings || []).filter(function (x) { return x.id === listingId; })[0];
  if (!l) return { ok: false, reason: 'no-listing' };
  if (teamId === l.sellerId) return { ok: false, reason: 'own-listing' };
  if (!teamById(state, teamId)) return { ok: false, reason: 'no-team' };
  if (!transfer_beforeDeadline(state)) return { ok: false, reason: 'deadline' };
  // 竞价轮数上限按「当前赛季轮」计算：每个转会窗口轮最多 BID_ROUNDS 次出价，
  // 进入新的一轮后重新计，避免赛季早期就把一个挂牌的出价次数用尽。
  const curRound = state.round || 0;
  const roundBids = l.bids.filter(function (b) { return b.round === curRound; }).length;
  if (roundBids >= T.BID_ROUNDS) return { ok: false, reason: 'rounds-exceeded' };
  const current = l.bids.length ? l.bids[l.bids.length - 1].amount : l.ask;
  const minBid = Math.ceil(current * (1 + T.BID_STEP));
  const amt = Math.round(amount || 0);
  if (amt < minBid) return { ok: false, reason: 'bid-too-low', min: minBid, current: current };
  const live = transfer_findRoster(state, l.pid);
  const ref = live ? live.p : l.snapshot;
  if (typeof salary_canSign === 'function') {
    const chk = salary_canSign(state, teamId, ref.salary || 0);
    if (!chk.ok) return { ok: false, reason: 'over-cap', cap: chk.cap, room: chk.room };
  }
  if (teamId === state.humanTeamId) {
    const need = Math.round(amt * (1 + T.DEAL_TAX));
    if ((state.finance.cash || 0) < need) return { ok: false, reason: 'no-cash', need: need, cash: state.finance.cash };
  }
  l.bids.push({ teamId: teamId, amount: amt, round: state.round || 0 });
  return { ok: true, listingId: listingId, amount: amt, bidCount: l.bids.length, round: state.round || 0 };
}

// ==================== v4 · 撤销挂牌（挂牌费不退）====================
function transfer_cancelListing(state, listingId) {
  transfer_ensure(state);
  const idx = transfer_listingIndex(state, listingId);
  if (idx < 0) return { ok: false, reason: 'no-listing' };
  const l = state.listings[idx];
  const hit = transfer_findRoster(state, l.pid);
  if (hit) hit.p.isListed = false;
  state.listings.splice(idx, 1);
  state.log.push('↩ 撤销 ' + (l.snapshot ? l.snapshot.name : l.pid) + ' 的挂牌（挂牌费 ¥' + l.listingFee + ' 不退）');
  return { ok: true, listingId: listingId, sunkFee: l.feeCharged || 0 };
}

function transfer_listingIndex(state, listingId) {
  const list = (state && state.listings) || [];
  for (let i = 0; i < list.length; i++) if (list[i].id === listingId) return i;
  return -1;
}

// ==================== v4 · 成交 ====================
// 买方付成交价 + DEAL_TAX；卖方得 成交价 - 挂牌费（挂牌费已于挂牌时扣除）
// opts: { buyerId, amount } 指定买方 → 一口价直接成交（缺省取要价）
//       缺省 → 取最高出价者成交（无人出价则流拍）
function transfer_closeListing(state, listingId, opts) {
  transfer_ensure(state);
  opts = opts || {};
  const T = CONFIG.TRANSFER;
  const idx = transfer_listingIndex(state, listingId);
  if (idx < 0) return { ok: false, reason: 'no-listing' };
  const l = state.listings[idx];
  const seller = teamById(state, l.sellerId);
  const p = seller ? (seller.players || []).filter(function (x) { return x.id === l.pid; })[0] : null;
  if (!seller || !p) { state.listings.splice(idx, 1); return { ok: false, reason: 'player-moved' }; }
  // 买方与成交价：
  //   ① opts.buyerId 指定 → 一口价直接成交（amount 缺省取要价，不得低于要价）
  //   ② 缺省 → 取最高出价者成交（无人出价则流拍）
  let buyerId = null, price = 0;
  if (opts.buyerId) {
    buyerId = opts.buyerId;
    price = Math.round(opts.amount != null ? opts.amount : l.ask);
    if (price < l.ask) return { ok: false, reason: 'price-below-ask' };
  } else {
    if (!l.bids.length) return { ok: false, reason: 'no-bid' };
    // 最高价中标；同价时若传入 rng 则由 rng 定序（否则先到先得）
    let top = l.bids[0].amount;
    for (let i = 1; i < l.bids.length; i++) if (l.bids[i].amount > top) top = l.bids[i].amount;
    const tied = l.bids.filter(function (b) { return b.amount === top; });
    const win = (tied.length > 1 && typeof rng === 'function')
      ? tied[Math.floor(rng() * tied.length)] : tied[0];
    buyerId = win.teamId;
    price = Math.round(win.amount);
  }
  const tax = Math.round(price * (T.DEAL_TAX != null ? T.DEAL_TAX : 0.05));
  const buyer = teamById(state, buyerId);
  if (!buyer) return { ok: false, reason: 'no-buyer' };
  const isHumanBuyer = buyer.id === state.humanTeamId;
  const isHumanSeller = seller.id === state.humanTeamId;
  // 买方付款（成交价 + 成交税）；资金不足先按替补回收现金，仍不足则流拍
  if (isHumanBuyer) {
    transfer_raiseCash(state, buyer, price + tax);
    if (state.finance.cash < price + tax) return { ok: false, reason: 'no-cash', need: price + tax, cash: state.finance.cash };
    state.finance.cash -= price + tax;
    state.finance.expense += price + tax;
  }
  // 卖方收款（净额 = 成交价 - 挂牌费）
  const sellerReceives = price - (l.feeCharged || 0);
  if (isHumanSeller) {
    state.finance.cash += sellerReceives;
    state.finance.income += sellerReceives;
  }
  // 阵容转移
  seller.players = seller.players.filter(function (x) { return x.id !== p.id; });
  seller.lineup = (seller.lineup || []).filter(function (id) { return id !== p.id; });
  p.isListed = false;
  if ((buyer.players || []).length >= CONFIG.PLAYER.ROSTER_SIZE) {
    const weakest = (buyer.players || []).slice().sort(function (a, b) { return a.overall - b.overall; })[0];
    transfer_release(state, buyer, weakest);
  }
  buyer.players.push(p);
  if ((buyer.lineup || []).length < CONFIG.PLAYER.STARTING &&
      (buyer.lineup || []).indexOf(p.id) < 0) buyer.lineup.push(p.id);
  state.listings.splice(idx, 1);
  state.log.push('🤝 成交 ' + p.name + '：' + seller.name + ' → ' + buyer.name
    + '（成交价 ¥' + price.toLocaleString() + ' + 成交税 ¥' + tax.toLocaleString() + '）');
  return {
    ok: true, listingId: listingId, pid: p.id, ask: l.ask, listingFee: l.listingFee,
    price: price, tax: tax, buyerId: buyer.id, sellerId: seller.id,
    sellerReceives: sellerReceives, bidCount: l.bids.length
  };
}

// ==================== v4 · 球探报告 ====================
// 扣 SCOUT_COST；按 SCOUT_ACCURACY 揭示隐藏属性；未球探时展示值带 HIDDEN_NOISE 浮动
function transfer_scout(state, pid) {
  transfer_ensure(state);
  const T = CONFIG.TRANSFER, P = CONFIG.PLAYER;
  const hit = transfer_findPoolOrRoster(state, pid);
  if (!hit) return { ok: false, reason: 'no-player' };
  const p = hit.p;
  const cost = T.SCOUT_COST;
  const cached = state.scoutReports[pid];
  if (cached) return { ok: true, report: cached, charged: 0, already: true };
  if ((state.finance.cash || 0) < cost) return { ok: false, reason: 'no-cash', need: cost };
  const r = makeRNG(deriveSeed((state.seed || 1) ^ 0x5bf03635, transfer_hashId(pid)));
  const attrs = {};
  P.ATTRS.forEach(function (k) {
    attrs[k] = r() < T.SCOUT_ACCURACY ? p.a[k] : clamp(p.a[k] + randInt(r, -T.HIDDEN_NOISE, T.HIDDEN_NOISE), P.ATTR_MIN, P.ATTR_MAX);
  });
  const potential = r() < T.SCOUT_ACCURACY ? p.potential : clamp(p.potential + randInt(r, -T.HIDDEN_NOISE, T.HIDDEN_NOISE), P.ATTR_MIN, P.ATTR_MAX);
  const report = {
    pid: pid, name: p.name, pos: p.pos, age: p.age, overall: p.overall,
    attrs: attrs, potential: potential, accuracy: T.SCOUT_ACCURACY, cost: cost
  };
  state.scoutReports[pid] = report;
  state.finance.cash -= cost;
  state.finance.expense += cost;
  state.log.push('🔎 球探报告：' + p.name + '（综合 ' + report.overall + '，潜力 ' + potential + '）');
  return { ok: true, report: report, charged: cost, already: false };
}

// UI 展示用：未球探时综合带 HIDDEN_NOISE 浮动；球探后取报告值（更准）
function transfer_displayOverall(state, p) {
  const T = CONFIG.TRANSFER, P = CONFIG.PLAYER;
  const rep = state && state.scoutReports ? state.scoutReports[p.id] : null;
  if (rep) return players_overall({ pos: rep.pos, a: rep.attrs });
  const r = makeRNG(deriveSeed((state && state.seed) || 1, transfer_hashId(p.id) ^ 0x1d7f9b11));
  return clamp(p.overall + randInt(r, -T.HIDDEN_NOISE, T.HIDDEN_NOISE), P.ATTR_MIN, P.ATTR_MAX);
}

// ==================== v4 · 买断市场 ====================
// 只含年龄 ≥ BUYOUT_MIN_AGE 的老将，价格 = 动态身价 × BUYOUT_DISCOUNT
function transfer_buyoutMarket(state, rng) {
  transfer_ensure(state);
  const T = CONFIG.TRANSFER;
  const pool = (state && state.transferPool) || [];
  const out = pool.filter(function (p) { return p.age >= T.BUYOUT_MIN_AGE; })
    .map(function (p) {
      return {
        pid: p.id, name: p.name, pos: p.pos, age: p.age, overall: p.overall, salary: p.salary,
        price: Math.round(transfer_price(state, p).price * T.BUYOUT_DISCOUNT)
      };
    })
    .sort(function (a, b) { return b.overall - a.overall; });
  state.buyoutMarket = out;
  return out;
}

// ==================== 买入（沿用旧逻辑 + 动态定价 + 工资帽）====================
// 买入（通用：指定球队）。人类队通过 transfer_buy 委托本函数。
// 人类队扣资金；AI 队无资金账，仅过工资帽校验（防止无限堆明星）。满员则替换综合最低者。
function transfer_buyFor(state, teamId, playerId) {
  transfer_ensure(state);
  const pool = state.transferPool || [];
  const p = pool.filter(function (x) { return x.id === playerId; })[0];
  if (!p) return { ok: false, reason: 'no-player' };
  const price = transfer_price(state, p).price;
  const team = teamById(state, teamId);
  if (!team) return { ok: false, reason: 'no-team' };
  const isHuman = teamId === state.humanTeamId;
  if (isHuman && state.finance.cash < price) return { ok: false, reason: 'no-cash' };
  if (typeof salary_canSign === 'function') {
    const chk = salary_canSign(state, team.id, p.salary || 0);
    if (!chk.ok) return { ok: false, reason: 'over-cap', cap: chk.cap, room: chk.room };
  }

  if (team.players.length >= CONFIG.PLAYER.ROSTER_SIZE) {
    const drop = team.players.slice().sort(function (a, b) { return a.overall - b.overall; })[0];
    transfer_release(state, team, drop);
  }

  if (isHuman) { state.finance.cash -= price; state.finance.expense += price; }
  const np = JSON.parse(JSON.stringify(p));
  np.id = teamId + '_m' + (state.transferBought || 0);
  np.marketPrice = price;
  state.transferBought = (state.transferBought || 0) + 1;
  team.players.push(np);
  if (team.lineup.length < CONFIG.PLAYER.STARTING &&
      !team.lineup.some(function (id) { return id === np.id; })) {
    team.lineup.push(np.id);
  }
  state.transferPool = pool.filter(function (x) { return x.id !== playerId; });
  state.log.push((isHuman ? '转会引入 ' : '🤝 ' + team.name + ' 从转会池签下 ') + p.name
    + '（综合 ' + p.overall + (isHuman ? '，¥' + price : '') + '）');
  return { ok: true, player: p.name, overall: p.overall, price: price, teamId: teamId };
}

// 买入（人类队便捷入口，行为不变）
function transfer_buy(state, playerId) {
  return transfer_buyFor(state, state.humanTeamId, playerId);
}

// ==================== 极限球员刷球衣（沿用旧玩法）====================
function transfer_jersey(state, playerId) {
  const human = teamById(state, state.humanTeamId);
  const p = human.players.filter(function (x) { return x.id === playerId; })[0];
  if (!p) return { ok: false, reason: 'no-player' };
  if (!p.isExtreme) return { ok: false, reason: 'not-extreme' };
  p.jersey = randInt(makeRNG(deriveSeed(state.seed, state.round * 131 + idNum(p.id) + 7)), 0, 99);
  const sale = randInt(makeRNG(deriveSeed(state.seed, state.round * 17 + idNum(p.id))), 8000, 30000);
  state.finance.cash += sale; state.finance.income += sale;
  state.fans = clamp(state.fans + 300, 0, 9999999);
  state.log.push('👕 极限球员 ' + p.name + ' 换新球衣 #' + p.jersey + '，球衣热卖 +¥' + sale + '、球迷 +300');
  return { ok: true, jersey: p.jersey, sale: sale };
}

// ==================== v4.1 · 自由球员市场 ====================
// 池上限；低于目标时每轮按概率补充新自由球员（确定性 rng 由 engine 传入）
function transfer_FA_TARGET() { return (CONFIG.FREE_AGENT && CONFIG.FREE_AGENT.POOL_TARGET) || 6; }

function transfer_faTick(state, rng) {
  transfer_ensure(state);
  const F = CONFIG.FREE_AGENT;
  if (!F || !F.ENABLED) return null;
  if ((state.faPool.length >= transfer_FA_TARGET()) || typeof rng !== 'function') return null;
  if (rng() >= (F.CHANCE_PER_ROUND != null ? F.CHANCE_PER_ROUND : 0.4)) return null;
  const P = CONFIG.PLAYER;
  const year = state.season || 1;
  const p = genPlayer(rng, {
    id: 'fa' + year + '_' + (state.faSeq++),
    pos: P.POSITIONS[Math.floor(rng() * P.POSITIONS.length)],
    age: F.AGE[0] + Math.floor(rng() * (F.AGE[1] - F.AGE[0] + 1)),
    tier: F.TIER[0] + Math.floor(rng() * (F.TIER[1] - F.TIER[0] + 1)),
    baseYear: year,
    isFA: true
  });
  p.salary = players_salary(p);
  p.contractYears = 0;
  state.faPool.push(p);
  state.log.push('🆓 ' + p.name + '（' + p.pos + '，综合 ' + p.overall + '）进入自由市场');
  return p;
}

function transfer_faList(state) {
  transfer_ensure(state);
  return state.faPool || [];
}

// 签约自由球员（通用：指定球队）。人类队通过 transfer_signFA 委托本函数。
function transfer_signFATo(state, teamId, pid) {
  transfer_ensure(state);
  const F = CONFIG.FREE_AGENT;
  const idx = (state.faPool || []).findIndex(function (p) { return p.id === pid; });
  if (idx < 0) return { ok: false, reason: 'no-player' };
  const p = state.faPool[idx];
  const team = teamById(state, teamId);
  if (!team) return { ok: false, reason: 'no-team' };
  if (team.players.length >= CONFIG.PLAYER.ROSTER_SIZE) return { ok: false, reason: 'roster-full' };
  if (typeof salary_canSign === 'function') {
    const chk = salary_canSign(state, team.id, p.salary || 0);
    if (!chk.ok) return { ok: false, reason: 'over-cap', cap: chk.cap, room: chk.room };
  }
  state.faPool.splice(idx, 1);
  p.isFA = false;
  p.isRookie = false;
  p.contractYears = (F && F.CONTRACT_YEARS) || 2;
  team.players.push(p);
  if (team.lineup.length < CONFIG.PLAYER.STARTING && team.lineup.indexOf(p.id) < 0) team.lineup.push(p.id);
  const isHuman = teamId === state.humanTeamId;
  state.log.push('✍️ ' + (isHuman ? '签下' : team.name + ' 签下') + '自由球员 ' + p.name
    + '（' + p.pos + '，综合 ' + p.overall + '，年薪 ¥' + (p.salary || 0).toLocaleString() + '）');
  return { ok: true, pid: p.id, name: p.name, salary: p.salary, teamId: teamId };
}

// 签约自由球员（人类队便捷入口，行为不变）
function transfer_signFA(state, pid) {
  return transfer_signFATo(state, state.humanTeamId, pid);
}

if (typeof module !== 'undefined') {
  module.exports = {
    transfer_genPool, transfer_buy, transfer_buyFor, transfer_jersey,
    transfer_price, transfer_basePrice, transfer_ageFactor, transfer_potentialFactor,
    transfer_scarcityFactor, transfer_supplyFactor,
    transfer_list, transfer_bid, transfer_closeListing, transfer_cancelListing,
    transfer_scout, transfer_displayOverall, transfer_buyoutMarket, transfer_beforeDeadline,
    transfer_ensure, transfer_hashId, transfer_listingIndex,
    transfer_findRoster, transfer_findPoolOrRoster, transfer_ownerTeamOf,
    transfer_release, transfer_raiseCash,
    transfer_faTick, transfer_faList, transfer_signFA, transfer_signFATo
  };
}
