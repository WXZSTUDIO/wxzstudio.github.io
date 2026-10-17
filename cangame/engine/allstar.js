// cangame v4 · 全明星周末（投票 / 三分大赛 / 扣篮大赛 / 新秀挑战赛 / 全明星正赛）
// 依赖：config.js / rng.js / players.js / league.js（teamById）/ tactics.js（tactics_default）/ match.js（simulateGame）
// 确定性：所有随机走传入 rng 或 deriveSeed，禁止 Math.random / Date.now

var ALLSTAR_DUNK_JUDGE_MAX = 50;   // 扣篮大赛评委满分（赛制常量，非平衡数值）
var ALLSTAR_TEMP_A = '__allstarA'; // 临时球队 id（正赛/新秀赛用完即移除）
var ALLSTAR_TEMP_B = '__allstarB';

// 全明星名单（含投票数）惰性初始化
function allstar_ensure(state) {
  if (!state.allstar) state.allstar = null;
  return state.allstar;
}

// 按 id 定位球员 → { p, teamId }
function allstar_locate(state, pid) {
  for (let i = 0; i < state.teams.length; i++) {
    const t = state.teams[i], arr = t.players || [];
    for (let j = 0; j < arr.length; j++) if (arr[j].id === pid) return { p: arr[j], teamId: t.id };
  }
  return null;
}

// 球员镜像：正赛/新秀赛用拷贝上场，避免污染真实球员体力 / 犯规
function allstar_mirror(p) {
  const c = {};
  for (const k in p) if (Object.prototype.hasOwnProperty.call(p, k)) c[k] = p[k];
  c.injury = 0;
  c.stamina = 100;
  c.fouls = 0;
  return c;
}

function allstar_tempTeam(id, name, players) {
  const mirrors = players.map(allstar_mirror);
  return {
    id: id, name: name,
    players: mirrors,
    lineup: mirrors.slice(0, CONFIG.PLAYER.STARTING).map(function (p) { return p.id; }),
    tactics: tactics_default(),
    wins: 0, losses: 0, pf: 0, pa: 0,
    isAllstar: true
  };
}

// 临时挂进 state.teams 打一场，打完立刻移除（simulateGame 通过 teamById 找队）
function allstar_simMatch(state, nameA, nameB, playersA, playersB, rng) {
  if (typeof simulateGame !== 'function') return null;
  const seed = randInt(rng, 1, 2147483000);
  const ta = allstar_tempTeam(ALLSTAR_TEMP_A, nameA, playersA);
  const tb = allstar_tempTeam(ALLSTAR_TEMP_B, nameB, playersB);
  state.teams.push(ta); state.teams.push(tb);
  let res = null;
  try {
    res = simulateGame(state, ALLSTAR_TEMP_A, ALLSTAR_TEMP_B, seed);
  } finally {
    state.teams = state.teams.filter(function (t) { return t.id !== ALLSTAR_TEMP_A && t.id !== ALLSTAR_TEMP_B; });
  }
  return res;
}

// 奖金发放：只有玩家队真金到账（AI 球队无财务模型），其余仅记日志
function allstar_award(state, teamId, cash, kings, label) {
  const t = teamId ? teamById(state, teamId) : null;
  const nm = t ? t.name : '—';
  if (teamId && teamId === state.humanTeamId) {
    state.finance.cash += cash;
    state.finance.income += cash;
    if (kings) state.kingsPts = (state.kingsPts || 0) + kings;
    (state.log || (state.log = [])).push('🏀 ' + label + '：' + nm + ' 获 ¥' + cash + (kings ? ' / 王者积分 +' + kings : ''));
  } else {
    (state.log || (state.log = [])).push('🏀 ' + label + '：' + nm + '（AI 球队）获 ¥' + cash);
  }
  return { teamId: teamId, cash: cash, kings: kings || 0 };
}

// 从全明星名单取人；名单缺失时退化为全联盟
function allstar_pool(state) {
  const out = [];
  const a = state.allstar;
  if (a && a.rosters) {
    ['A', 'B'].forEach(function (side) {
      (a.rosters[side] || []).forEach(function (pid) {
        const e = allstar_locate(state, pid);
        if (e) out.push(e);
      });
    });
  }
  if (!out.length) {
    state.teams.forEach(function (t) {
      (t.players || []).forEach(function (p) { out.push({ p: p, teamId: t.id }); });
    });
  }
  return out;
}

// 按 scoreFn + rng 扰动取名额
function allstar_contestants(state, scoreFn, size, rng) {
  const jitter = Math.max(1, Math.round(CONFIG.PLAYER.POS_SPREAD));
  const pool = allstar_pool(state).map(function (e) {
    return { e: e, k: scoreFn(e.p) + randInt(rng, 0, jitter) };
  }).sort(function (x, y) { return y.k - x.k; });
  const n = Math.min(size, pool.length);
  const picked = pool.slice(0, n);
  // 去重（同一球员不应重复参赛）
  const seen = {}, uniq = [];
  picked.forEach(function (x) { if (!seen[x.e.p.id]) { seen[x.e.p.id] = 1; uniq.push(x.e); } });
  return uniq;
}

// ——— 全明星投票：每队入选 VOTE_SLOTS 人 ———
function allstar_voting(state, rng) {
  const A = CONFIG.ALLSTAR, M = CONFIG.MATCH, P = CONFIG.PLAYER;
  const cands = [];
  state.teams.forEach(function (t) {
    (t.players || []).forEach(function (p) {
      const st = (state.seasonStats && state.seasonStats[p.id]) || null;
      // 人气 = 综合 + 赛季得分折算（分母由每队回合数导出） + 随机扰动（幅度由 MATCH.NOISE 导出）
      const noise = Math.max(1, Math.round(p.overall * M.NOISE));
      const score = p.overall + Math.round(((st && st.pts) || 0) / Math.max(1, M.POSSESSIONS / 10)) + randInt(rng, -noise, noise);
      cands.push({ p: p, teamId: t.id, score: score });
    });
  });
  cands.sort(function (x, y) { return y.score - x.score; });
  const need = A.VOTE_SLOTS * 2;   // 两支全明星队
  const picked = cands.slice(0, Math.min(need, cands.length));
  // 蛇形分队（按人气降序交替），保证两队实力均衡
  const ra = [], rb = [];
  picked.forEach(function (c, i) { (i % 2 === 0 ? ra : rb).push(c.p.id); });
  // 票数：名次越高票越多（基数锚定主场容量 = 球迷规模）
  const votes = {};
  picked.forEach(function (c, i) {
    votes[c.p.id] = Math.max(1, Math.round(CONFIG.FINANCE.STADIUM_CAP * (1 - i / (picked.length + 1)) * (0.8 + rng() * 0.4)));
  });
  state.allstar = {
    season: state.season,
    rosters: { A: ra, B: rb },
    votes: votes
  };
  (state.log || (state.log = [])).push('🗳 全明星投票结束：A 队 ' + ra.length + ' 人 / B 队 ' + rb.length + ' 人');
  return state.allstar;
}

// ——— 三分大赛：按 TRE 模拟命中数 ———
function allstar_threeContest(state, rng) {
  const A = CONFIG.ALLSTAR, M = CONFIG.MATCH, P = CONFIG.PLAYER;
  const pool = allstar_contestants(state, function (p) { return p.a.TRE * 1.0 + p.a.SHO * 0.2; }, A.THREE_CONTEST.size, rng);
  const attempts = Math.max(1, Math.round(M.POSSESSIONS / 4));   // 出手数由每队回合数导出
  const results = pool.map(function (e) {
    const prob = clamp(M.BASE_3P + (e.p.a.TRE - P.BASE_MEAN) * M.TRE_COEF, 0.05, 0.95);
    let made = 0;
    for (let i = 0; i < attempts; i++) if (rng() < prob) made++;
    return { pid: e.p.id, name: e.p.name, teamId: e.teamId, score: made, attempts: attempts };
  });
  results.sort(function (x, y) { return y.score - x.score; });
  const winner = results[0] || null;
  if (winner) allstar_award(state, winner.teamId, A.THREE_CONTEST.prize, 0, '三分大赛冠军 ' + winner.name + '（' + winner.score + '/' + attempts + '）');
  return { winner: winner, results: results };
}

// ——— 扣篮大赛：按 SPD / DRV / 身高 模拟评委打分 ———
function allstar_dunkContest(state, rng) {
  const A = CONFIG.ALLSTAR, P = CONFIG.PLAYER;
  const pool = allstar_contestants(state, function (p) { return p.a.SPD * 1.0 + p.a.DRV * 0.6; }, A.DUNK_CONTEST.size, rng);
  const hLo = P.HEIGHT.PG[0], hHi = P.HEIGHT.C[1];
  const jitter = Math.max(1, Math.round(ALLSTAR_DUNK_JUDGE_MAX * 0.1));
  const results = pool.map(function (e) {
    const p = e.p;
    const nrm = function (v) { return clamp((v - P.ATTR_MIN) / (P.ATTR_MAX - P.ATTR_MIN), 0, 1); };
    const hN = clamp(((p.height || hLo) - hLo) / (hHi - hLo), 0, 1);
    const q = clamp(0.55 * nrm(p.a.SPD) + 0.30 * nrm(p.a.DRV) + 0.15 * hN, 0, 1);
    const score = clamp(Math.round(ALLSTAR_DUNK_JUDGE_MAX * q + randInt(rng, -jitter, jitter)), 1, ALLSTAR_DUNK_JUDGE_MAX);
    return { pid: p.id, name: p.name, teamId: e.teamId, score: score };
  });
  results.sort(function (x, y) { return y.score - x.score; });
  const winner = results[0] || null;
  if (winner) allstar_award(state, winner.teamId, A.DUNK_CONTEST.prize, 0, '扣篮大赛冠军 ' + winner.name + '（' + winner.score + ' 分）');
  return { winner: winner, results: results };
}

// ——— 新秀挑战赛：isRookie 球员分队打一场 ———
function allstar_rookieGame(state, rng) {
  const A = CONFIG.ALLSTAR, P = CONFIG.PLAYER;
  const pool = [];
  state.teams.forEach(function (t) {
    (t.players || []).forEach(function (p) { if (p.isRookie) pool.push({ p: p, teamId: t.id }); });
  });
  const size = Math.min(A.ROOKIE_GAME.size, pool.length);
  const picked = shuffle(rng, pool).slice(0, size);
  const sideA = [], sideB = [];
  picked.forEach(function (e, i) { (i % 2 === 0 ? sideA : sideB).push(e); });

  let mode = 'rating', hScore = 0, aScore = 0, mvp = null;
  const rating = function (arr) {
    return arr.reduce(function (s, e) { return s + e.p.overall + e.p.potential * 0.25; }, 0);
  };
  if (sideA.length >= P.STARTING && sideB.length >= P.STARTING && typeof simulateGame === 'function') {
    mode = 'sim';
    const res = allstar_simMatch(state, '新秀队A', '新秀队B',
      sideA.map(function (e) { return e.p; }), sideB.map(function (e) { return e.p; }), rng);
    if (res) {
      hScore = res.hScore; aScore = res.aScore;
      mvp = allstar_boxMvp(state, res);
    } else { mode = 'rating'; }
  }
  if (mode === 'rating') {
    hScore = Math.round(rating(sideA)); aScore = Math.round(rating(sideB));
    let best = null;
    picked.forEach(function (e) {
      const v = e.p.overall + e.p.potential * 0.25;
      if (!best || v > best.v) best = { v: v, e: e };
    });
    if (best) mvp = { pid: best.e.p.id, name: best.e.p.name, teamId: best.e.teamId, pts: 0, reb: 0, ast: 0 };
  }
  const winnerSide = hScore === aScore ? 'A' : (hScore > aScore ? 'A' : 'B');
  if (mvp) allstar_award(state, mvp.teamId, A.ROOKIE_GAME.prize, 0, '新秀挑战赛 MVP ' + mvp.name);
  return {
    mode: mode, size: picked.length,
    aScore: hScore, bScore: aScore,
    winner: winnerSide,
    mvp: mvp,
    rosters: { A: sideA.map(function (e) { return e.p.id; }), B: sideB.map(function (e) { return e.p.id; }) }
  };
}

// 从比赛 box 里挑得分最高者当 MVP
function allstar_boxMvp(state, res) {
  let mvp = null;
  [res.hBox, res.aBox].forEach(function (box) {
    Object.keys(box.players).forEach(function (pid) {
      const row = box.players[pid];
      if (row.min <= 0 && row.pts <= 0) return;
      if (!mvp || row.pts > mvp.pts) {
        const loc = allstar_locate(state, pid);
        mvp = { pid: pid, name: row.name, pts: row.pts, reb: row.reb, ast: row.ast, teamId: loc ? loc.teamId : null };
      }
    });
  });
  return mvp;
}

// ——— 全明星正赛 ———
function allstar_mainGame(state, rng) {
  const A = CONFIG.ALLSTAR;
  if (!state.allstar || !state.allstar.rosters) allstar_voting(state, rng);
  const pa = allstar_pool(state).filter(function (e) { return state.allstar.rosters.A.indexOf(e.p.id) >= 0; });
  const pb = allstar_pool(state).filter(function (e) { return state.allstar.rosters.B.indexOf(e.p.id) >= 0; });
  if (!pa.length || !pb.length) return { ok: false, reason: 'no-rosters', mvp: null };

  const res = allstar_simMatch(state, '全明星A队', '全明星B队',
    pa.map(function (e) { return e.p; }), pb.map(function (e) { return e.p; }), rng);
  if (!res) return { ok: false, reason: 'no-sim', mvp: null };

  const mvp = allstar_boxMvp(state, res);
  const winnerSide = res.winner === ALLSTAR_TEMP_A ? 'A' : 'B';
  const humanInGame = pa.concat(pb).some(function (e) { return e.teamId === state.humanTeamId; });

  // 正赛奖金：玩家有球员入选即获得出场/夺冠分成
  if (humanInGame) allstar_award(state, state.humanTeamId, A.MAIN_GAME.prize, 0, '全明星正赛（' + winnerSide + ' 队获胜）');
  else (state.log || (state.log = [])).push('🏀 全明星正赛：' + winnerSide + ' 队获胜（你无球员入选）');

  // MVP 奖励（现金 + 王者积分）
  if (mvp) allstar_award(state, mvp.teamId, A.MVP_REWARD.cash, A.MVP_REWARD.kings, '全明星 MVP ' + mvp.name + '（' + mvp.pts + ' 分）');

  return {
    ok: true,
    winner: winnerSide,
    aScore: res.hScore, bScore: res.aScore,
    mvp: mvp,
    box: { A: res.hBox, B: res.aBox }
  };
}

// ——— 一键跑完整个周末 ———
function allstar_runWeekend(state, rng) {
  const voting = allstar_voting(state, rng);
  const three = allstar_threeContest(state, rng);
  const dunk = allstar_dunkContest(state, rng);
  const rookie = allstar_rookieGame(state, rng);
  const main = allstar_mainGame(state, rng);
  const result = {
    season: state.season,
    voting: { A: (voting && voting.rosters.A) || [], B: (voting && voting.rosters.B) || [] },
    three: three, dunk: dunk, rookie: rookie, main: main,
    mvp: (main && main.mvp) || null
  };
  state.allstarResult = result;
  return result;
}

if (typeof module !== 'undefined') {
  module.exports = {
    allstar_voting, allstar_threeContest, allstar_dunkContest,
    allstar_rookieGame, allstar_mainGame, allstar_runWeekend,
    allstar_locate, allstar_pool, allstar_contestants, allstar_boxMvp,
    allstar_mirror, allstar_tempTeam, allstar_simMatch, allstar_award, allstar_ensure
  };
}
