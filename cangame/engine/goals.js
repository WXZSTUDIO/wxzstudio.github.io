// cangame v4 · 赛季目标（老板信任度）+ 成就系统 + 每日任务
// 铁律：①函数均为全局 function 声明（<script defer> 顺序加载，无模块系统）
//      ②所有数值读 CONFIG（GOALS / ACHIEVEMENTS / DAILY），本文件不写死任何奖励与阈值
//      ③确定性：抽取一律走传入的 rng / deriveSeed，禁止 Math.random
//      ④存档兼容：只新增可选字段（state.trust / state.goals / state.dailyTasks / state.achievements 等），
//                老存档读不到时走默认分支，禁止删除或重命名既有字段
//
// 依赖全局：CONFIG、makeRNG / deriveSeed / randInt / clamp / teamById / seasonStandings（season.js）

// —— 语义常量：config 未提供、由术语本身定义的阈值（改动前请同步 config 注释）——
var GOALS_SEMANTIC = {
  SEMIFINAL_RANK: 4,        // 「四强」= 常规赛前 4
  TRIPLE_DOUBLE_MIN: 10     // 「三双」= 单项 ≥10 的数据达到 3 项
};

/* ==================================================================
 * 0. 通用小工具
 * ================================================================== */

// 两位小数归一（避免 0.30000000000000004 之类的脏值进存档）
function goals_r2(v) { return Math.round((Number(v) || 0) * 100) / 100; }
function goals_r1(v) { return Math.round((Number(v) || 0) * 10) / 10; }

// 从 config 文本里提取第一个数字，用于「名称即阈值」的派生
//   例：'胜率达到 60%' → 60、'单场 50 分' → 50、'选中潜力 ≥ 85 的新秀' → 85、'取得 3 连胜' → 3
// 设计取舍：策划改动 config 文案里的数字，代码自动跟随；配置未标数字时回退到传入的 fallback。
function goals_numIn(str, fallback) {
  if (str == null) return fallback;
  const m = /(-?\d+(?:\.\d+)?)/.exec(String(str));
  if (!m) return fallback;
  const v = parseFloat(m[1]);
  return isNaN(v) ? fallback : v;
}

// 目标/任务的目标值：优先显式 def.target，其次从 name 派生，兜底 1
function goals_targetOf(def) {
  if (!def) return 1;
  if (typeof def.target === 'number' && !isNaN(def.target)) return def.target;
  const n = goals_numIn(def.name, null);
  return (n != null && n > 0) ? n : 1;
}

// 发奖入口（唯一）：cash → state.finance.cash；kings → state.kingsPts
// 注意：绝不触碰 state.kings（那是「胜者为王」的进行中场次对象）
function goals_pay(state, reward) {
  const paid = { cash: 0, kings: 0 };
  if (!reward) return paid;
  if (!state.finance) state.finance = {};
  if (state.finance.cash == null) state.finance.cash = 0;
  const cash = Number(reward.cash) || 0;
  const kings = Number(reward.kings) || 0;
  state.finance.cash += cash;
  state.kingsPts = (Number(state.kingsPts) || 0) + kings;
  paid.cash = cash;
  paid.kings = kings;
  return paid;
}

function goals_log(state, msg) {
  if (state && Array.isArray(state.log)) state.log.push(msg);
  return msg;
}

// key ↔ id 匹配：全部 token 命中即视为同一语义（'win' → win_game / win_streak3；'transfer' → do_transfer）
function goals_keyTokens(s) {
  return String(s == null ? '' : s).toLowerCase().split(/[^a-z0-9]+/).filter(function (x) { return !!x; });
}
function goals_keyMatches(id, key) {
  const kid = String(id == null ? '' : id).toLowerCase();
  const kkey = String(key == null ? '' : key).toLowerCase();
  if (!kid || !kkey) return false;
  if (kid === kkey) return true;
  const tk = goals_keyTokens(kkey);
  if (!tk.length) return false;
  const idTok = goals_keyTokens(kid);
  for (let i = 0; i < tk.length; i++) if (idTok.indexOf(tk[i]) < 0) return false;
  return true;
}

/* ==================================================================
 * 1. 信任度
 * ================================================================== */

// 读取信任度（老存档兼容：字段缺失 / 非数字 → CONFIG.GOALS.TRUST_START）
// 注意：不能用 `state.trust || TRUST_START`，否则 trust=0（合法值）会被误判为缺失
function goals_trust(state) {
  const G = CONFIG.GOALS || {};
  const start = Number(G.TRUST_START) || 70;
  if (!state) return start;
  const t = state.trust;
  if (t == null || typeof t !== 'number' || isNaN(t)) return start;
  return t;
}

// 写入信任度（钳制到 TRUST_MIN..TRUST_MAX）
function goals_setTrust(state, v) {
  const G = CONFIG.GOALS || {};
  const lo = Number(G.TRUST_MIN) || 0;
  const hi = Number(G.TRUST_MAX) || 100;
  const nv = clamp(Math.round(Number(v) || 0), lo, hi);
  state.trust = nv;
  return nv;
}

/* ==================================================================
 * 2. 赛季目标
 * ================================================================== */

function goals_defById(id) {
  const list = (CONFIG.GOALS && CONFIG.GOALS.TYPES) || [];
  for (let i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
  return null;
}

// 快照本队新秀综合作为「培养」基线（每赛季初调用；老存档缺失时由 goals_check 惰性补拍）
function goals_snapshotRookies(state) {
  const human = teamById(state, state.humanTeamId);
  const base = {};
  if (human) {
    (human.players || []).forEach(function (p) {
      if (p.isRookie) base[p.id] = Number(p.overall) || 0;
    });
  }
  state.rookieBase = base;
  return base;
}

// 本队新秀本赛季最大综合涨幅
function goals_rookieGrowth(state) {
  const human = teamById(state, state.humanTeamId);
  if (!human) return 0;
  const base = state.rookieBase || {};   // 老存档无此字段 → 惰性以当前值为基线，涨幅 0
  let best = 0;
  (human.players || []).forEach(function (p) {
    if (!p.isRookie) return;
    const b = (base[p.id] != null) ? base[p.id] : (Number(p.overall) || 0);
    const g = (Number(p.overall) || 0) - b;
    if (g > best) best = g;
  });
  return Math.max(0, best);
}

// 平均上座率（%）：优先用显式采样（goals_progress 的 'attend' key）；
// 无采样时用当前票价档的基准上座率近似 —— engine 未归档逐轮上座率，这是唯一可读的数据源。
function goals_attendAvg(state) {
  const log = Array.isArray(state.attendLog) ? state.attendLog : [];
  if (log.length) {
    let sum = 0;
    log.forEach(function (v) { sum += Number(v) || 0; });
    return goals_r1(sum / log.length);
  }
  const opts = (CONFIG.PRICE && CONFIG.PRICE.options) || [];
  const key = state.finance && state.finance.ticketPrice;
  if (!opts.length) return 0;
  const opt = opts.filter(function (o) { return o.key === key; })[0] || opts[1] || opts[0];
  return goals_r1((Number(opt.att) || 0) * 100);
}

// 结算所需的环境快照（一次计算，多个目标复用）
function goals_env(state) {
  const ev = {
    rank: 0, wins: 0, losses: 0, games: 0, winrate: 0,
    payroll: 0, salaryCap: 0, rookieGrowth: 0, attendAvg: 0, attendSamples: 0
  };
  const human = teamById(state, state.humanTeamId);
  if (human) {
    ev.wins = Number(human.wins) || 0;
    ev.losses = Number(human.losses) || 0;
    ev.games = ev.wins + ev.losses;
    ev.winrate = ev.games > 0 ? goals_r1(ev.wins / ev.games * 100) : 0;
    // 即时积分榜排名（跨联赛安全：只排本队所在联赛）
    const lid = human.leagueId;
    if (lid && state.leagues && state.leagues[lid] && typeof seasonStandings === 'function') {
      const rows = seasonStandings(state, lid) || [];
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].team && rows[i].team.id === human.id) { ev.rank = rows[i].rank; break; }
      }
    }
    ev.payroll = (human.players || []).reduce(function (s, p) { return s + (Number(p.salary) || 0); }, 0);
  }
  ev.salaryCap = (state.finance && Number(state.finance.salaryCap)) || 0;
  ev.rookieGrowth = goals_rookieGrowth(state);
  ev.attendAvg = goals_attendAvg(state);
  ev.attendSamples = (Array.isArray(state.attendLog) ? state.attendLog.length : 0);
  return ev;
}

// 各目标类型的判定式：入参是全球环境快照 ev + 目标条目 g，返回「当前进度值」与 target 比较
// 排名类目标在赛季中取即时快照；最终以 goals_seasonEnd 的二次判定为准。
var GOALS_EVALS = {
  // 进入季后赛：排名进入季后赛名额（CONFIG.PLAYOFF.TEAMS）
  playoff: function (state, ev, g) {
    const slots = (CONFIG.PLAYOFF && Number(CONFIG.PLAYOFF.TEAMS)) || 8;
    return (ev.rank > 0 && ev.rank <= slots) ? 1 : 0;
  },
  // 打进四强：排名前 4
  semifinal: function (state, ev, g) {
    return (ev.rank > 0 && ev.rank <= GOALS_SEMANTIC.SEMIFINAL_RANK) ? 1 : 0;
  },
  // 夺冠：本联赛常规赛第 1
  champion: function (state, ev, g) { return ev.rank === 1 ? 1 : 0; },
  // 培养一名新秀：本队新秀最大综合涨幅（阈值来自 target，如「+5」）
  rookie: function (state, ev, g) { return ev.rookieGrowth; },
  // 工资帽内运营：当前薪资总额 ≤ 工资帽
  salary: function (state, ev, g) { return (ev.payroll <= ev.salaryCap) ? 1 : 0; },
  // 胜率：百分比，与 name 中派生的 target（60）比较
  winrate: function (state, ev, g) { return ev.winrate; },
  // 平均上座率：百分比，与 name 中派生的 target（80）比较
  attend: function (state, ev, g) { return ev.attendAvg; }
};

// 重算单个目标的进度（不负责发奖）
function goals_evalGoal(state, ev, g) {
  const fn = GOALS_EVALS[g.id];
  if (!fn) return goals_r2(g.progress);
  return goals_r2(fn(state, ev, g));
}

// 每赛季开始：老板抽取 CONFIG.GOALS.COUNT 个目标（不重复），写入 state.goals
// 返回 state.goals。rng 必须由调用方传入以保证确定性。
function goals_newSeason(state, rng) {
  const G = CONFIG.GOALS || {};
  const draw = rng || function () { return 0.5; };   // 防御：缺 rng 时不崩（但失去随机性）
  if (!G.ENABLED) { state.goals = []; return state.goals; }

  const pool = (G.TYPES || []).slice();
  const want = Math.max(0, Math.min(Number(G.COUNT) || 0, pool.length));
  // 部分 Fisher–Yates：每次抽走一个，天然不重复
  const picked = [];
  for (let i = 0; i < want; i++) {
    const j = randInt(draw, 0, pool.length - 1);
    picked.push(pool.splice(j, 1)[0]);
  }

  state.goals = picked.map(function (d) {
    return {
      id: d.id,
      name: d.name,
      reward: { cash: (d.reward && Number(d.reward.cash)) || 0, kings: (d.reward && Number(d.reward.kings)) || 0 },
      trust: Number(d.trust) || 0,
      progress: 0,
      target: goals_targetOf(d),
      done: false,
      paid: false      // 幂等标记：防止 goals_check 与 goals_seasonEnd 重复发奖
    };
  });

  // 赛季级附属状态（新增可选字段，老存档缺失时 goals_check 内部会兜底）
  state.trust = goals_trust(state);
  state.attendLog = [];
  goals_snapshotRookies(state);
  return state.goals;
}

// 推进任务/目标进度（只推进，不发奖；发奖走 goals_check / goals_dailyTick）
// key 语义：'win' / 'transfer' / 'train' / 'bet' / 'watch_live' / 'scout' / 'attend'
// 返回 { touched, tasks, goals }
function goals_progress(state, key, amount) {
  if (!key) return { touched: 0, tasks: [], goals: [] };
  let n = Number(amount);
  if (n == null || isNaN(n)) n = 1;

  // ① 赛季目标
  const goalHits = [];
  (state.goals || []).forEach(function (g) {
    if (g.done) return;
    if (!goals_keyMatches(g.id, key)) return;
    if (g.id === 'attend') {
      // 采集型进度：记录一轮上座率（0–1 或 0–100 自动归一），取其均值
      const pct = n <= 1 ? n * 100 : n;
      if (!Array.isArray(state.attendLog)) state.attendLog = [];
      state.attendLog.push(clamp(goals_r1(pct), 0, 100));
      g.progress = goals_attendAvg(state);
    } else {
      g.progress = clamp(goals_r2(Number(g.progress) + n), 0, g.target);
    }
    goalHits.push(g.id);
  });

  // ② 每日任务
  const taskHits = [];
  (state.dailyTasks || []).forEach(function (t) {
    if (t.done) return;
    if (!goals_keyMatches(t.id, key)) return;
    t.progress = clamp(Number(t.progress) + n, 0, t.target);
    taskHits.push(t.id);
  });

  return { touched: goalHits.length + taskHits.length, goals: goalHits, tasks: taskHits };
}

// 检查所有目标与每日任务的完成状态；完成的自动发奖（cash/kings）并标记 done
// 返回 { goalsDone, tasksDone, rewards }
// 幂等：已 paid 的条目不会二次到账
function goals_check(state) {
  const res = { goalsDone: [], tasksDone: [], rewards: { cash: 0, kings: 0 } };
  const G = CONFIG.GOALS || {};
  const D = CONFIG.DAILY || {};

  if (G.ENABLED && (state.goals || []).length) {
    const ev = goals_env(state);
    (state.goals || []).forEach(function (g) {
      // 采集型目标（attend）以显式采样为准；其余以即时快照重算为准
      const isSampled = (g.id === 'attend' && Array.isArray(state.attendLog) && state.attendLog.length);
      if (!isSampled) g.progress = goals_evalGoal(state, ev, g);
      if (Number(g.progress) >= Number(g.target)) {
        g.done = true;
        res.goalsDone.push(g.id);
        if (!g.paid) {
          const p = goals_pay(state, g.reward);
          res.rewards.cash += p.cash;
          res.rewards.kings += p.kings;
          g.paid = true;
          goals_log(state, '🎯 达成赛季目标「' + g.name + '」+¥' + p.cash + ' +' + p.kings + ' 王者积分');
        }
      }
    });
  }

  if (D.ENABLED && (state.dailyTasks || []).length) {
    (state.dailyTasks || []).forEach(function (t) {
      if (t.done) return;
      if (Number(t.progress) >= Number(t.target)) {
        t.done = true;
        res.tasksDone.push(t.id);
        if (!t.paid) {
          const p = goals_pay(state, t.reward);
          res.rewards.cash += p.cash;
          res.rewards.kings += p.kings;
          t.paid = true;
          goals_log(state, '✅ 完成每日任务「' + t.name + '」+¥' + p.cash + ' +' + p.kings + ' 王者积分');
        }
      }
    });
  }
  return res;
}

// 赛季结束结算：完成 → 发奖励 + 加信任度；未完成 → 扣信任度
// trust -= goal.trust * CONFIG.GOALS.FAIL_TRUST_PENALTY
// 幂等：奖励只在未 paid 时发放；信任度加减只在此处结算（不看 done 标记，只看最终重算结果）
function goals_seasonEnd(state) {
  const G = CONFIG.GOALS || {};
  const res = { passed: [], failed: [], trustDelta: 0, rewards: { cash: 0, kings: 0 } };
  const before = goals_trust(state);

  if (!G.ENABLED || !(state.goals || []).length) {
    state.trust = before;
    return res;
  }

  const penalty = Number(G.FAIL_TRUST_PENALTY);
  const penaltyK = isNaN(penalty) ? 1 : penalty;
  let delta = 0;
  const ev = goals_env(state);

  (state.goals || []).forEach(function (g) {
    const isSampled = (g.id === 'attend' && Array.isArray(state.attendLog) && state.attendLog.length);
    if (!isSampled) g.progress = goals_evalGoal(state, ev, g);
    if (Number(g.progress) >= Number(g.target)) {
      g.done = true;
      res.passed.push(g.id);
      if (!g.paid) {
        const p = goals_pay(state, g.reward);
        res.rewards.cash += p.cash;
        res.rewards.kings += p.kings;
        g.paid = true;
        goals_log(state, '🎯 赛季目标达成「' + g.name + '」+¥' + p.cash + ' +' + p.kings + ' 王者积分');
      }
      delta += Number(g.trust) || 0;
    } else {
      g.done = false;
      res.failed.push(g.id);
      delta -= (Number(g.trust) || 0) * penaltyK;
      goals_log(state, '❌ 赛季目标未达成「' + g.name + '」信任度 -' + goals_r1((Number(g.trust) || 0) * penaltyK));
    }
  });

  const after = goals_setTrust(state, before + delta);
  res.trustDelta = after - before;
  res.trust = after;
  if (G.SACK_TRUST != null && after < Number(G.SACK_TRUST)) {
    goals_log(state, '⚠ 老板信任度跌破 ' + G.SACK_TRUST + '（当前 ' + after + '），下课警告！');
  }
  if (res.passed.length) goals_log(state, '老板信任度：' + before + ' → ' + after);
  return res;
}

/* ==================================================================
 * 3. 成就系统
 * ================================================================== */

function goals_achDef(id) {
  const list = CONFIG.ACHIEVEMENTS || [];
  for (let i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
  return null;
}
function goals_achMap(state) {
  if (!state.achievements || typeof state.achievements !== 'object') state.achievements = {};
  return state.achievements;
}

// 全部成就 + 已解锁状态 [{ ...def, unlocked, at }]
function goals_achievementList(state) {
  const map = goals_achMap(state);
  return (CONFIG.ACHIEVEMENTS || []).map(function (d) {
    return {
      id: d.id, name: d.name, desc: d.desc, reward: d.reward,
      unlocked: Object.prototype.hasOwnProperty.call(map, d.id),
      at: (Object.prototype.hasOwnProperty.call(map, d.id) ? map[d.id] : null)
    };
  });
}

// 解锁成就并发奖（幂等：已解锁则直接返回，不重复发奖）
function goals_unlock(state, achId) {
  const def = goals_achDef(achId);
  if (!def) return { ok: false, reason: 'no-such-achievement', id: achId };
  const map = goals_achMap(state);
  if (Object.prototype.hasOwnProperty.call(map, achId)) {
    return { ok: false, reason: 'already', id: achId, def: def, reward: { cash: 0, kings: 0 } };
  }
  const stamp = (Number(state.season) || 1) * 1000 + (Number(state.round) || 0);  // S*1000+R，避免引入 Date（确定性）
  map[achId] = stamp;
  const p = goals_pay(state, def.reward);
  goals_log(state, '🏅 解锁成就「' + def.name + '」+¥' + p.cash + ' +' + p.kings + ' 王者积分');
  return { ok: true, id: achId, def: def, at: stamp, reward: p };
}

// 上下文一次性解锁多个成就，返回本次「新解锁」的 id 列表
// ctx 形如 { won:true, streak:10, playerStats:{pts,reb,ast,stl,blk}, isRookie:true,
//           champion:true, promoted:true, draftPotential:88, mvp:true, roy:true, dpoy:true, monthPerfect:true }
function goals_checkAchievements(state, ctx) {
  ctx = ctx || {};
  const ps = ctx.playerStats || null;
  const fifties = goals_numIn(goals_achDef('single50') && goals_achDef('single50').desc, 50);
  const streakNeed = goals_numIn(goals_achDef('streak10') && goals_achDef('streak10').desc, 10);
  const gemNeed = goals_numIn(goals_achDef('draft_gem') && goals_achDef('draft_gem').desc, 85);

  function anyTrue(keys) {
    for (let i = 0; i < keys.length; i++) if (ctx[keys[i]] === true) return true;
    return false;
  }
  function hasAward(name) {
    if (ctx.award === name) return true;
    if (Array.isArray(ctx.awards) && ctx.awards.indexOf(name) >= 0) return true;
    return false;
  }
  function monthPerfect() {
    if (anyTrue(['monthPerfect', 'perfectMonth', 'monthUnbeaten'])) return true;
    const m = ctx.monthRecord || ctx.month || null;
    if (m && (Number(m.wins) || 0) > 0 && (Number(m.losses) || 0) === 0) return true;
    return false;
  }
  // 三双：任意 3 项主要数据达到线（默认 10）
  function tripleDouble() {
    if (!ps) return false;
    const keys = ['pts', 'reb', 'ast', 'stl', 'blk'];
    let cnt = 0;
    keys.forEach(function (k) { if ((Number(ps[k]) || 0) >= GOALS_SEMANTIC.TRIPLE_DOUBLE_MIN) cnt++; });
    return cnt >= 3;
  }

  const triggers = {
    // 首次夺冠：夺得任意赛事冠军（联赛/杯赛/冠军杯皆可）
    first_title: anyTrue(['champion', 'title', 'firstTitle', 'cupWin', 'wonCup', 'wonChampionship', 'wonFinal']),
    // 单场 50 分
    single50: !!ps && ((Number(ps.pts) || 0) >= fifties),
    // 10 连胜
    streak10: (Number(ctx.streak) || (ctx.won === true ? 1 : 0)) >= streakNeed,
    // 最佳新秀
    roy: anyTrue(['roy', 'isROY', 'royWinner', 'bestRookie']) || hasAward('roy'),
    // 常规赛 MVP
    mvp: anyTrue(['mvp', 'isMVP', 'mvpWinner']) || hasAward('mvp'),
    // 最佳防守球员
    dpoy: anyTrue(['dpoy', 'isDPOY', 'dpoyWinner', 'bestDefender']) || hasAward('dpoy'),
    // 升入 1 级
    promote: anyTrue(['promoted', 'promotion', 'promotedToL1']),
    // 三双
    triple_double: tripleDouble(),
    // 月度全胜
    perfect_month: monthPerfect(),
    // 慧眼识珠：选中潜力 ≥ 85 的新秀
    draft_gem: (function () {
      const v = ctx.draftPotential != null ? ctx.draftPotential : (ctx.potential != null ? ctx.potential : ctx.rookiePotential);
      return (v != null) && ((Number(v) || 0) >= gemNeed);
    })()
  };

  const got = [];
  Object.keys(triggers).forEach(function (id) {
    if (!triggers[id]) return;
    const r = goals_unlock(state, id);
    if (r.ok) got.push(id);
  });
  return got;
}

/* ==================================================================
 * 4. 每日 / 每周任务
 * ================================================================== */

function goals_dailyDef(id) {
  const list = (CONFIG.DAILY && CONFIG.DAILY.TASKS) || [];
  for (let i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
  return null;
}

// 刷新每日任务：抽 CONFIG.DAILY.COUNT 条（不重复），写入 state.dailyTasks
function goals_dailyRefresh(state, rng) {
  const D = CONFIG.DAILY || {};
  const draw = rng || function () { return 0.5; };
  if (!D.ENABLED) { state.dailyTasks = []; return state.dailyTasks; }

  const pool = (D.TASKS || []).slice();
  const want = Math.max(0, Math.min(Number(D.COUNT) || 0, pool.length));
  const picked = [];
  for (let i = 0; i < want; i++) {
    const j = randInt(draw, 0, pool.length - 1);
    picked.push(pool.splice(j, 1)[0]);
  }

  state.dailyTasks = picked.map(function (d) {
    return {
      id: d.id, name: d.name, desc: d.desc,
      reward: { cash: (d.reward && Number(d.reward.cash)) || 0, kings: (d.reward && Number(d.reward.kings)) || 0 },
      progress: 0,
      target: goals_targetOf(d),
      done: false,
      paid: false
    };
  });
  state.dailyRound = Number(state.round) || 0;
  return state.dailyTasks;
}

// 按 CONFIG.DAILY.REFRESH_ROUNDS 判断是否该刷新（每 N 轮一次）
function goals_dailyShouldRefresh(state) {
  const D = CONFIG.DAILY || {};
  if (!D.ENABLED) return false;
  if (!state.dailyTasks || !state.dailyTasks.length) return true;
  const gap = (Number(state.round) || 0) - (Number(state.dailyRound) || 0);
  return gap >= Math.max(1, Number(D.REFRESH_ROUNDS) || 1);
}

// 推进每日任务进度并结算（未完成的继续累积，达标的立刻发奖 + done）
// 返回 { progress, tasksDone, rewards }
function goals_dailyTick(state, key, amount) {
  const res = { progress: null, tasksDone: [], rewards: { cash: 0, kings: 0 } };
  if (!key) return res;
  res.progress = goals_progress(state, key, amount);
  (state.dailyTasks || []).forEach(function (t) {
    if (t.done || Number(t.progress) < Number(t.target)) return;
    t.done = true;
    res.tasksDone.push(t.id);
    if (!t.paid) {
      const p = goals_pay(state, t.reward);
      res.rewards.cash += p.cash;
      res.rewards.kings += p.kings;
      t.paid = true;
      goals_log(state, '✅ 完成每日任务「' + t.name + '」+¥' + p.cash + ' +' + p.kings + ' 王者积分');
    }
  });
  return res;
}

// 一次性面板数据（UI 直接取用，避免各处重复容错）
function goals_panel(state) {
  return {
    enabled: !!(CONFIG.GOALS || {}).ENABLED,
    trust: goals_trust(state),
    trustMax: Number((CONFIG.GOALS || {}).TRUST_MAX) || 100,
    sackTrust: Number((CONFIG.GOALS || {}).SACK_TRUST) || 0,
    goals: state.goals || [],
    dailyTasks: state.dailyTasks || [],
    achievements: goals_achievementList(state)
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    goals_newSeason, goals_progress, goals_check, goals_seasonEnd, goals_trust, goals_setTrust,
    goals_achievementList, goals_unlock, goals_checkAchievements,
    goals_dailyRefresh, goals_dailyTick, goals_dailyShouldRefresh, goals_panel,
    goals_numIn, goals_targetOf, goals_keyMatches, goals_pay, goals_env, goals_evalGoal,
    goals_attendAvg, goals_rookieGrowth, goals_snapshotRookies, goals_defById, goals_dailyDef, GOALS_SEMANTIC
  };
}
