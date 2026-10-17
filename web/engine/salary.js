// cangame v4 · 工资帽 / 奢侈税 / 合同（V4-BALANCE）
// 依赖：config.js（CONFIG.SALARY）/ rng.js / league.js（teamById）
// 设计要点：
//   1) 全部数值来自 CONFIG.SALARY，本文件不含平衡魔数
//   2) 存档兼容：state.luxuryHistory / state.salaryLogs 为新增可选字段，缺失时惰性初始化
//   3) 随机一律走 rng 或 deriveSeed(state.seed, …)，禁止 Math.random / Date.now
//   4) 只有人类队有资金流水（state.finance 属于玩家）；AI 队只记账、记历史，不扣款

// —— 新增字段惰性初始化 ——
function salary_ensure(state) {
  if (!state) return state;
  if (!state.luxuryHistory) state.luxuryHistory = {};   // { teamId: 连续超税期数 }
  if (!state.salaryLogs) state.salaryLogs = [];         // 奢侈税结算流水
  if (!state.finance) state.finance = { cash: 0, income: 0, expense: 0 };
  if (!state.log) state.log = [];
  return state;
}

// 字符串 → 32 位哈希（按球员派生稳定的随机子种子）
function salary_hashId(s) {
  let h = 2166136261 >>> 0;
  s = String(s);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

// 未显式传 rng 时的确定性子种子（同存档同局面 → 同结果）
function salary_subRng(state, key, tag) {
  return makeRNG(deriveSeed((state && state.seed) || 1, (salary_hashId(key) ^ Math.imul(tag | 0, 0x9E3779B1)) >>> 0));
}

function salary_enabled() {
  return !!(CONFIG.SALARY && CONFIG.SALARY.ENABLED);
}

function salary_season(state) {
  return Math.max(1, (state && state.season ? state.season : 1) | 0);
}

// —— 工资帽 = CAP_BASE × (1 + CAP_SEASON_GROWTH)^(season-1) ——
function salary_cap(state) {
  const S = CONFIG.SALARY;
  return Math.round(S.CAP_BASE * Math.pow(1 + S.CAP_SEASON_GROWTH, salary_season(state) - 1));
}

// —— 奢侈税线 = 工资帽 × LUXURY_LINE ——
function salary_luxuryLine(state) {
  return Math.round(salary_cap(state) * CONFIG.SALARY.LUXURY_LINE);
}

// —— 顶薪 / 中产特例 / 底薪（按工资帽百分比）——
function salary_maxContract(state) { return Math.round(salary_cap(state) * CONFIG.SALARY.MAX_SALARY_PCT); }
function salary_midlevel(state) { return Math.round(salary_cap(state) * CONFIG.SALARY.MIDLEVEL_PCT); }
function salary_minContract(state) { return Math.round(salary_cap(state) * CONFIG.SALARY.MIN_SALARY_PCT); }

// —— 球队工资总额 ——
function salary_teamTotal(state, teamId) {
  const t = teamById(state, teamId);
  if (!t || !t.players) return 0;
  return t.players.reduce(function (s, p) { return s + (p.salary || 0); }, 0);
}

// —— 剩余薪资空间 ——
function salary_room(state, teamId) {
  return Math.max(0, salary_cap(state) - salary_teamTotal(state, teamId));
}

// —— 超帽 / 超奢侈税线 ——
function salary_isOver(state, teamId) {
  if (!salary_enabled()) return false;
  return salary_teamTotal(state, teamId) > salary_cap(state);
}
function salary_isOverLuxury(state, teamId) {
  if (!salary_enabled()) return false;
  return salary_teamTotal(state, teamId) > salary_luxuryLine(state);
}

// —— 税率：连续超税球队（history ≥ 1）适用 REPEATER_TAX ——
function salary_taxRate(state, teamId) {
  salary_ensure(state);
  const S = CONFIG.SALARY;
  const streak = (state.luxuryHistory && state.luxuryHistory[teamId]) || 0;
  return streak >= 1 ? S.REPEATER_TAX : S.TAX_RATE;
}

// —— 奢侈税额 = 超出税线部分 × 税率 ——
function salary_tax(state, teamId) {
  salary_ensure(state);
  if (!salary_enabled()) return 0;
  const over = salary_teamTotal(state, teamId) - salary_luxuryLine(state);
  if (over <= 0) return 0;
  return Math.round(over * salary_taxRate(state, teamId));
}

// —— 能否签约 ——
// amount = 拟新增的年薪金额。续约时传"涨薪增量"即可，
// 避免"整队已满 → 自家核心永远无法续约"的悖论（既符合现实，也让超帽约束不失效）。
// OVER_CAP_BLOCK_SIGN=false 时不拦截，仅返回 over-cap-warn。
function salary_canSign(state, teamId, amount) {
  salary_ensure(state);
  const cap = salary_cap(state);
  const total = salary_teamTotal(state, teamId);
  const room = Math.max(0, cap - total);
  const amt = amount || 0;
  if (!salary_enabled()) return { ok: true, reason: 'disabled', cap: cap, total: total, room: room };
  if (!teamById(state, teamId)) return { ok: false, reason: 'no-team', cap: cap, total: 0, room: room };
  if (amt > salary_maxContract(state)) return { ok: false, reason: 'over-max', cap: cap, total: total, room: room, max: salary_maxContract(state) };
  if (amt <= room) return { ok: true, reason: 'ok', cap: cap, total: total, room: room };
  if (!CONFIG.SALARY.OVER_CAP_BLOCK_SIGN) return { ok: true, reason: 'over-cap-warn', cap: cap, total: total, room: room };
  return { ok: false, reason: 'over-cap', cap: cap, total: total, room: room };
}

// —— 查球员所属球队 ——
function salary_findOwner(state, pid) {
  const teams = (state && state.teams) || [];
  for (let i = 0; i < teams.length; i++) {
    const ps = teams[i].players || [];
    for (let j = 0; j < ps.length; j++) if (ps[j].id === pid) return { team: teams[i], player: ps[j] };
  }
  return null;
}

// —— 续约 ——
// 年薪每年按 RAISE_PER_YEAR 递增，最长 RAISE_MAX_YEARS；球员可能拒绝（RENEW_DECLINE_CHANCE）
function salary_renew(state, pid, years, rng) {
  salary_ensure(state);
  const S = CONFIG.SALARY;
  const hit = salary_findOwner(state, pid);
  if (!hit) return { ok: false, reason: 'no-player', declined: false };
  const p = hit.player, team = hit.team;
  const y = clamp(Math.round(years || 1), 1, S.RAISE_MAX_YEARS);
  const base = (p.salary && p.salary > 0) ? p.salary : salary_minContract(state);
  const want = Math.round(base * Math.pow(1 + S.RAISE_PER_YEAR, y - 1));
  const inc = Math.max(0, want - (p.salary || 0));
  const chk = salary_canSign(state, team.id, inc);
  if (!chk.ok) {
    return { ok: false, reason: chk.reason, declined: false, player: p, salary: want, years: y, cap: chk.cap, room: chk.room, teamId: team.id };
  }
  const r = (typeof rng === 'function') ? rng
    : salary_subRng(state, pid, salary_season(state) * 131 + (state.round || 0) * 17 + 7);
  if (r() < S.RENEW_DECLINE_CHANCE) {
    state.log.push('✍ ' + p.name + ' 拒绝了 ' + team.name + ' 的续约报价（年薪 ¥' + want + ' / ' + y + ' 年）');
    return { ok: false, reason: 'declined', declined: true, player: p, salary: want, years: y, teamId: team.id };
  }
  p.salary = want;
  p.contractYears = y;
  state.log.push('✍ ' + team.name + ' 与 ' + p.name + ' 续约 ' + y + ' 年（年薪 ¥' + want + '）');
  return { ok: true, declined: false, player: p, salary: want, years: y, teamId: team.id };
}

// —— 每轮 / 每赛季结算奢侈税 ——
// 人类队：扣 state.finance.cash 并写 salaryLogs / log；AI 队：更新连续超税历史（影响未来税率）
function salary_tick(state) {
  salary_ensure(state);
  const cap = salary_cap(state), line = salary_luxuryLine(state);
  const season = salary_season(state);
  const out = { season: season, round: state.round || 0, cap: cap, luxuryLine: line, teams: [], totalTax: 0, humanTax: 0, overTeams: 0 };
  if (!salary_enabled()) return out;
  (state.teams || []).forEach(function (t) {
    const total = salary_teamTotal(state, t.id);
    const tax = salary_tax(state, t.id);
    const overLine = Math.max(0, total - line);
    out.teams.push({ teamId: t.id, name: t.name, total: total, overLine: overLine, tax: tax, rate: salary_taxRate(state, t.id) });
    out.totalTax += tax;
    if (total > line) out.overTeams++;
    // 更新连续超税历史 → 下一结算周期适用 REPEATER_TAX
    state.luxuryHistory[t.id] = (total > line) ? ((state.luxuryHistory[t.id] || 0) + 1) : 0;
  });
  const h = out.teams.filter(function (x) { return x.teamId === state.humanTeamId; })[0];
  const humanTax = h ? h.tax : 0;
  if (humanTax > 0) {
    state.finance.cash -= humanTax;
    state.finance.expense += humanTax;
    state.salaryLogs.push({ season: season, round: state.round || 0, teamId: state.humanTeamId, amount: humanTax, kind: 'luxury-tax' });
    state.log.push('💸 奢侈税结算：超出税线 ¥' + (h.total - line) + '，缴纳 ¥' + humanTax);
  } else {
    state.salaryLogs.push({ season: season, round: state.round || 0, teamId: state.humanTeamId, amount: 0, kind: 'no-tax' });
  }
  out.humanTax = humanTax;
  return out;
}

// —— 合同到期递减（每赛季调用一次：有合同年份则 -1）——
// 返回「本赛季参与结算的在册球员总数」（覆盖全部 3 个联赛的所有球队名册）
function salary_decayContracts(state) {
  salary_ensure(state);
  let n = 0;
  (state.teams || []).forEach(function (t) {
    (t.players || []).forEach(function (p) {
      n++;
      if (p.contractYears != null && p.contractYears > 0) p.contractYears--;
    });
  });
  return n;
}

if (typeof module !== 'undefined') {
  module.exports = {
    salary_ensure, salary_cap, salary_luxuryLine, salary_teamTotal, salary_isOver, salary_isOverLuxury,
    salary_tax, salary_taxRate, salary_canSign, salary_room, salary_renew, salary_tick,
    salary_maxContract, salary_midlevel, salary_minContract, salary_decayContracts,
    salary_findOwner, salary_hashId, salary_season, salary_enabled, salary_subRng
  };
}
