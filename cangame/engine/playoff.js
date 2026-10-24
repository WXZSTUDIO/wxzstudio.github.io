// cangame v4 · 季后赛（常规赛前 8 进季后赛 / 7 场 4 胜 / 抢七 / 总决赛 MVP）
// 依赖：config.js / rng.js / league.js(teamById) / season.js(seasonStandings) / match.js(simulateGame)
// 设计要点：
//   1) 全部随机走传入的 rng 或 deriveSeed(series.seed, ...)，禁止 Math.random / Date.now
//   2) 季后赛结果**只**写进 state.playoff.rounds[].series[].games，**绝不累加 team.wins/losses/pf/pa**，
//      也绝不改 state.round / state.phase —— 否则会破坏既有升降级（seasonRoll 依赖常规赛战绩）
//   3) 每场只保留精简技术统计（pts/reb/ast），不存 play-by-play，避免存档膨胀
//   4) 存档兼容：state.playoff 缺失时惰性构建；已存在则沿用，不删除既有字段

var PLAYOFF_ROUND_NAMES = ['四分之一决赛', '半决赛', '总决赛'];
// 2-2-1-1-1 主客场分配：0 = 高种子主场，1 = 低种子主场（结构常量，非平衡数值）
var PLAYOFF_HOME_PATTERN = [0, 0, 1, 1, 0, 1, 0];
var PLAYOFF_ADVANCE_CAP = 16;   // 推进轮数上限（防御死循环，算法常量）

// ——— 工具：字符串 → 32 位哈希（按联赛派生稳定的子种子）———
function playoff_hashStr(s) {
  let h = 2166136261 >>> 0;
  s = String(s);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

// 季后赛随机基种子：优先由 state.seed 派生（跨存档稳定），否则退回 rng
function playoff_seedBase(state, leagueId, rng, salt) {
  if (state && typeof state.seed === 'number') {
    return deriveSeed(state.seed,
      7700 + (state.season || 1) * 131 + (playoff_hashStr(String(leagueId)) % 97) + (salt || 0) * 1009);
  }
  return (Math.floor(rng() * 0x7fffffff) >>> 0) || 1;
}

// 该联赛季后赛种子（常规赛前 CONFIG.PLAYOFF.TEAMS 名，按排名）→ 返回球队 id 数组
function playoff_seed(state, leagueId) {
  const P = CONFIG.PLAYOFF;
  const stand = seasonStandings(state, leagueId);
  return stand.slice(0, P.TEAMS).map(function (row) { return row.team.id; });
}

// 种子排名（0 = 第 1 种子）；不在种子表里返回极大值
function playoff_rankOf(po, id) {
  const i = (po && po.seeds) ? po.seeds.indexOf(id) : -1;
  return i < 0 ? 9999 : i;
}

// 建一个系列赛：aId 恒为更高种子（排名更靠前），保证主场分配正确
function playoff_makeSeries(po, xId, yId, seedBase, k) {
  const rx = playoff_rankOf(po, xId), ry = playoff_rankOf(po, yId);
  const hi = rx <= ry ? xId : yId;
  const lo = hi === xId ? yId : xId;
  return {
    aId: hi, bId: lo,
    aWin: 0, bWin: 0,
    games: [],
    winner: null,
    seed: deriveSeed(seedBase, 101 + k * 17)
  };
}

// 总轮次：8 队 → 3 轮（四分之一决赛 / 半决赛 / 总决赛）
function playoff_totalRounds(n) {
  let r = 0, m = n;
  while (m > 1) { m = Math.floor(m / 2); r++; }
  return Math.max(1, r);
}

function playoff_roundName(totalRounds, idx) {
  const names = PLAYOFF_ROUND_NAMES;
  const start = Math.max(0, names.length - totalRounds);
  return names[start + idx] || ('第 ' + (idx + 1) + ' 轮');
}

// 构建对阵树：1v8 / 2v7 / 3v6 / 4v5，胜者逐级晋级
function playoff_build(state, leagueId, rng) {
  const P = CONFIG.PLAYOFF;
  const seeds = playoff_seed(state, leagueId);
  const n = Math.min(P.TEAMS, seeds.length);
  const base = playoff_seedBase(state, leagueId, rng, 0);
  const totalRounds = playoff_totalRounds(n);

  const po = {
    leagueId: leagueId,
    season: state.season || 1,
    seeds: seeds.slice(0, n),
    seedBase: base,
    totalRounds: totalRounds,
    rounds: [],
    cur: 0,
    done: false,
    champion: null,
    fmvp: null,
    prize: null            // 发奖结果（防重复发奖）
  };

  const first = [];
  for (let i = 0; i < Math.floor(n / 2); i++) first.push([i, n - 1 - i]);
  po.rounds.push({
    name: playoff_roundName(totalRounds, 0),
    index: 0,
    series: first.map(function (pr, i) {
      return playoff_makeSeries(po, po.seeds[pr[0]], po.seeds[pr[1]], base, i);
    })
  });

  state.playoff = po;
  return po;
}

// 精简技术统计：只保留 pts/reb/ast（FMVP 用），未登场球员不记
function playoff_statLine(g) {
  const out = {};
  function take(box, tid) {
    if (!box || !box.players) return;
    Object.keys(box.players).forEach(function (pid) {
      const r = box.players[pid];
      if (!r) return;
      if (!r.min && !r.pts && !r.reb && !r.ast) return;
      out[pid] = { pts: r.pts || 0, reb: r.reb || 0, ast: r.ast || 0, teamId: tid };
    });
  }
  take(g.hBox, g.homeId);
  take(g.aBox, g.awayId);
  return out;
}

// 打完一个系列赛：先到 WIN_NEEDED(4) 胜者晋级；3:3 时打满第 7 场（抢七）
// 注意：simulateGame 不写 wins/losses/pf/pa，也不动 state.round —— 季后赛天然不污染常规赛积分榜
function playoff_playSeries(state, series, rng) {
  if (!series) return null;
  const P = CONFIG.PLAYOFF;
  const need = P.WIN_NEEDED || 4;
  const max = P.SERIES_LENGTH || 7;

  let aWin = Number(series.aWin) || 0;
  let bWin = Number(series.bWin) || 0;
  if (!Array.isArray(series.games)) series.games = [];
  if (series.seed == null) series.seed = (Math.floor(rng() * 0x7fffffff) >>> 0) || 1;

  while (aWin < need && bWin < need && series.games.length < max) {
    const gi = series.games.length;
    const homeIsA = (PLAYOFF_HOME_PATTERN[gi] || 0) === 0;
    const homeId = homeIsA ? series.aId : series.bId;
    const awayId = homeIsA ? series.bId : series.aId;
    const g = simulateGame(state, homeId, awayId, deriveSeed(series.seed, 211 + gi * 37));
    // simulateGame 在平分时兜底判 homeId 胜，这里沿用其 winner
    const aWon = g.winner === series.aId;
    if (aWon) aWin++; else bWin++;
    series.games.push({
      n: gi + 1,
      homeId: homeId, awayId: awayId,
      hScore: g.hScore, aScore: g.aScore,
      winner: g.winner,
      aWon: aWon,
      stats: playoff_statLine(g)
    });
  }

  series.aWin = aWin;
  series.bWin = bWin;
  series.winner = aWin > bWin ? series.aId : (bWin > aWin ? series.bId : null);
  return series;
}

// 推进一轮：打完当前轮全部系列赛 → 生成下一轮对阵（winners[k] vs winners[n-1-k]，保持强弱分区）
// 已是最后一轮（仅 1 组系列赛）则结束并产出冠军 + FMVP
function playoff_advance(state, rng) {
  if (!state.playoff) {
    const hid = state.humanTeamId;
    const ht = hid ? teamById(state, hid) : null;
    playoff_build(state, (ht && ht.leagueId) || 'L1', rng);
  }
  const po = state.playoff;
  if (!po || po.done) return po || null;

  const round = po.rounds[po.cur];
  if (!round) { po.done = true; return po; }

  round.series.forEach(function (s) { playoff_playSeries(state, s, rng); });

  const winners = round.series.map(function (s) { return s.winner; }).filter(Boolean);
  if (round.series.length <= 1 || winners.length < 2) {
    po.done = true;
    po.champion = winners[0] || null;
    po.fmvp = po.champion ? playoff_fmvp(state) : null;
    po.cur = Math.min(po.cur, po.rounds.length - 1);
    return po;
  }

  const n = winners.length;
  const next = [];
  for (let k = 0; k < Math.floor(n / 2); k++) {
    next.push(playoff_makeSeries(po, winners[k], winners[n - 1 - k], po.seedBase, po.rounds.length * 100 + k));
  }
  po.rounds.push({ name: playoff_roundName(po.totalRounds, po.rounds.length), index: po.rounds.length, series: next });
  po.cur = po.rounds.length - 1;
  return po;
}

// 一口气跑完整个季后赛，返回冠军队 id
// 跨赛季重建（v4.3 修复）：po.season 记录建队时的赛季号；state.season 已推进到新赛季
// 而旧 playoff 仍停留在上一赛季时，必须按新赛季最终排名重新建树（升降级/换联赛后种子会变）
function playoff_runAll(state, rng) {
  if (!state.playoff || state.playoff.season !== state.season) {
    const ht = state.humanTeamId ? teamById(state, state.humanTeamId) : null;
    playoff_build(state, (ht && ht.leagueId) || 'L1', rng);
  }
  const po = state.playoff;
  let guard = 0;
  while (po && !po.done && guard++ < PLAYOFF_ADVANCE_CAP) playoff_advance(state, rng);
  if (po && !po.champion && po.done) {
    const last = po.rounds[po.rounds.length - 1];
    if (last && last.series.length === 1) {
      po.champion = last.series[0].winner || null;
      po.fmvp = po.champion ? playoff_fmvp(state) : null;
    }
  }
  return po ? po.champion : null;
}

// 冠军队 id（未结束 / 未开赛返回 null）
function playoff_champion(state) {
  const po = state && state.playoff;
  return (po && po.champion) ? po.champion : null;
}

// 玩家队参与到的最远轮次下标（未参与返回 -1）
function playoff_teamLastRound(po, teamId) {
  if (!po || !teamId) return -1;
  let idx = -1;
  po.rounds.forEach(function (rd, i) {
    const hit = rd.series.some(function (s) { return s.aId === teamId || s.bId === teamId; });
    if (hit && i > idx) idx = i;
  });
  return idx;
}

// 总决赛 MVP：冠军队球员在总决赛系列赛累计（pts+reb+ast）最高者
function playoff_fmvp(state) {
  const po = state && state.playoff;
  if (!po) return null;
  if (po.fmvp) return po.fmvp;

  const champ = po.champion;
  if (!champ) return null;
  const finalRound = po.rounds[po.rounds.length - 1];
  const team = teamById(state, champ);
  if (!finalRound || !team) return null;

  const acc = {};
  finalRound.series.forEach(function (s) {
    (s.games || []).forEach(function (g) {
      const st = g.stats || {};
      Object.keys(st).forEach(function (pid) {
        const r = st[pid];
        if (!r || r.teamId !== champ) return;      // 只统计冠军队球员
        if (!acc[pid]) acc[pid] = { pid: pid, pts: 0, reb: 0, ast: 0 };
        acc[pid].pts += r.pts || 0;
        acc[pid].reb += r.reb || 0;
        acc[pid].ast += r.ast || 0;
      });
    });
  });

  let best = null;
  Object.keys(acc).forEach(function (pid) {
    const r = acc[pid];
    r.total = r.pts + r.reb + r.ast;
    if (!best) { best = r; return; }
    if (r.total > best.total) { best = r; return; }
    if (r.total === best.total) {
      if (r.pts > best.pts) { best = r; return; }
      if (r.pts === best.pts && String(pid) < String(best.pid)) best = r;  // 兜底：保证确定性
    }
  });
  if (!best) return null;

  let name = '';
  for (let i = 0; i < team.players.length; i++) {
    if (team.players[i].id === best.pid) { name = team.players[i].name; break; }
  }
  const out = {
    pid: best.pid, name: name,
    pts: best.pts, reb: best.reb, ast: best.ast,
    total: best.total
  };
  po.fmvp = out;
  return out;
}

// 按 CONFIG.PLAYOFF.PRIZE / KINGS 给玩家发奖（若玩家队参与）；已发过则直接返回上次结果
function playoff_prize(state) {
  const P = CONFIG.PLAYOFF;
  const po = state && state.playoff;
  if (!po) return { cash: 0, kings: 0, note: '季后赛尚未开始', tier: null };
  if (po.prize) return po.prize;

  const hid = state.humanTeamId;
  const champ = playoff_champion(state);
  const deepest = playoff_teamLastRound(po, hid);
  const lastIdx = po.rounds.length - 1;
  // 只有"打满到真正的总决赛轮"才可能是亚军 / 四强；否则只是止步于已进行的那一轮
  const reachedFinal = lastIdx >= 0 && lastIdx === po.totalRounds - 1;

  let tier = null, note = '';
  if (!hid || deepest < 0) {
    note = '未进入季后赛';
  } else if (champ === hid) {
    tier = 'champion'; note = '夺得季后赛总冠军';
  } else if (reachedFinal && deepest === lastIdx) {
    tier = 'runner'; note = '总决赛失利 · 亚军';
  } else if (reachedFinal && deepest === lastIdx - 1) {
    tier = 'semifinal'; note = '止步半决赛 · 四强';
  } else {
    note = '止步' + (po.rounds[deepest] ? po.rounds[deepest].name : '季后赛首轮');
  }

  const cash = tier ? (Number(P.PRIZE[tier]) || 0) : 0;
  const kings = tier ? (Number(P.KINGS[tier]) || 0) : 0;

  if (cash) {
    if (!state.finance) state.finance = {};
    state.finance.cash = (Number(state.finance.cash) || 0) + cash;
    state.finance.income = (Number(state.finance.income) || 0) + cash;
  }
  if (kings) state.kingsPts = (Number(state.kingsPts) || 0) + kings;

  po.prize = { cash: cash, kings: kings, note: note, tier: tier };
  if (Array.isArray(state.log) && (cash || kings)) {
    state.log.push('季后赛奖励：+' + cash + ' 现金 / +' + kings + ' 王者积分（' + note + '）');
  }
  return po.prize;
}

// 状态查询（UI 用）
function playoff_isActive(state) {
  const po = state && state.playoff;
  return !!(po && !po.done);
}
function playoff_currentRound(state) {
  const po = state && state.playoff;
  if (!po || po.done) return null;
  return po.rounds[po.cur] || null;
}

if (typeof module !== 'undefined') {
  module.exports = {
    playoff_seed, playoff_rankOf, playoff_makeSeries, playoff_totalRounds, playoff_roundName,
    playoff_build, playoff_statLine, playoff_playSeries, playoff_advance, playoff_runAll,
    playoff_champion, playoff_fmvp, playoff_prize, playoff_teamLastRound,
    playoff_isActive, playoff_currentRound, playoff_hashStr, playoff_seedBase
  };
}
