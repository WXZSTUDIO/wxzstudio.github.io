// cangame v4 · 排行榜（得分/篮板/助攻… + MVP 榜 + 最佳新秀 + 周最佳 / 月最佳 + 赛季颁奖）
// 铁律：①函数均为全局 function 声明（<script defer> 顺序加载，无模块系统）
//      ②所有权重/阈值读 CONFIG.LEADERS（MVP_WEIGHT / ROY_MIN_GP / WEEK_GAMES / MONTH_GAMES）
//      ③容错：state.seasonStats 可能为空或字段缺失；gp=0 一律排最后，avg 记 0
//      ④只读取 state，不修改任何既有字段（state.leaders 为新增可选字段）
//
// 依赖全局：CONFIG、teamById（league.js）

// —— 排序规则说明（写在最前，便于评审）——
// 数据榜（pts/reb/ast/stl/blk）按 **场均** 降序，场均相同则比累计值；
// MVP 榜 / 最佳新秀榜按 **评分值** 降序。两种模式都遵守「gp = 0 排最后」。

function leaders_r2(v) { return Math.round((Number(v) || 0) * 100) / 100; }
function leaders_num(v) { const n = Number(v); return isNaN(n) ? 0 : n; }

/* ==================================================================
 * 0. 索引 / 取值 / 排序
 * ================================================================== */

// pid → { player, team } 索引（42 队 × 12 人，量级极小；为免 O(n²)，内部复用同一实例）
function leaders_index(state) {
  const map = {};
  (state.teams || []).forEach(function (t) {
    (t.players || []).forEach(function (p) {
      if (!p || p.id == null) return;
      map[p.id] = { player: p, team: t };
    });
  });
  return map;
}

// 统一行格式：{ pid, name, teamId, teamName, val, gp, avg }
// gp=0 时 avg 记 0（不除零）
function leaders_row(index, pid, st, val) {
  const ent = index[pid];
  const gp = Math.max(0, Math.floor(leaders_num(st && st.gp)));
  const v = leaders_r2(val);
  return {
    pid: pid,
    name: ent ? ent.player.name : String(pid),
    teamId: ent ? ent.team.id : null,
    teamName: ent ? ent.team.name : '自由球员',
    val: v,
    gp: gp,
    avg: gp > 0 ? leaders_r2(v / gp) : 0
  };
}

// mode='avg'：按场均；mode='val'：按 val（MVP 评分 / 窗口累计）。gp=0 永远最后。
function leaders_sortRows(rows, mode) {
  const keyOf = mode === 'avg'
    ? function (r) { return r.avg; }
    : function (r) { return r.val; };
  rows.sort(function (a, b) {
    const az = a.gp > 0 ? 1 : 0, bz = b.gp > 0 ? 1 : 0;
    if (az !== bz) return bz - az;                       // 未出场者沉底
    const ka = leaders_num(keyOf(a)), kb = leaders_num(keyOf(b));
    if (kb !== ka) return kb - ka;                       // 主排序降序
    if (b.val !== a.val) return b.val - a.val;           // 次排序：累计值
    if (b.gp !== a.gp) return b.gp - a.gp;               // 再次：出场多的在前
    if (a.name < b.name) return -1;                      // 稳定兜底（不依赖 locale）
    if (a.name > b.name) return 1;
    return 0;
  });
  return rows;
}

// 统计行的规范化（补全缺失字段，容错老存档）
function leaders_statRow(state, pid) {
  const raw = (state && state.seasonStats ? state.seasonStats[pid] : null) || {};
  return {
    pts: leaders_num(raw.pts), reb: leaders_num(raw.reb), ast: leaders_num(raw.ast),
    stl: leaders_num(raw.stl), blk: leaders_num(raw.blk), gp: Math.max(0, Math.floor(leaders_num(raw.gp)))
  };
}

function leaders_pids(state) {
  return Object.keys((state && state.seasonStats) || {});
}

/* ==================================================================
 * 1. MVP 评分
 * ================================================================== */

// MVP 评分（含球队胜场加成）：场均得分/篮板/助攻/抢断/盖帽 加权 + 球队胜场 × win 权重
// 内部版本：可复用已构建的 index，避免逐个球员重建索引导致 O(n²)
function leaders_scoreCore(index, state, pid, st) {
  const W = (CONFIG.LEADERS && CONFIG.LEADERS.MVP_WEIGHT) || { pts: 1, reb: 1, ast: 1, stl: 1, blk: 1, win: 0 };
  st = st || leaders_statRow(state, pid);
  const gp = Math.max(0, Math.floor(leaders_num(st.gp)));
  const per = function (k) { return gp > 0 ? leaders_num(st[k]) / gp : 0; };
  let s = per('pts') * leaders_num(W.pts)
    + per('reb') * leaders_num(W.reb)
    + per('ast') * leaders_num(W.ast)
    + per('stl') * leaders_num(W.stl)
    + per('blk') * leaders_num(W.blk);
  const ent = index[pid];
  const wins = (ent && ent.team) ? leaders_num(ent.team.wins) : 0;
  s += wins * leaders_num(W.win);
  return leaders_r2(s);
}

// MVP 评分（公开 API）
function leaders_mvpScore(state, pid) {
  const index = leaders_index(state);
  return leaders_scoreCore(index, state, pid, leaders_statRow(state, pid));
}

/* ==================================================================
 * 2. 榜单计算
 * ================================================================== */

// 数据榜：某项 Category（CONFIG.LEADERS.CATEGORIES）
function leaders_categoryRows(state, index, cat) {
  const pids = leaders_pids(state);
  const rows = pids.map(function (pid) {
    const st = leaders_statRow(state, pid);
    return leaders_row(index, pid, st, leaders_num(st[cat]));
  });
  return leaders_sortRows(rows, 'avg');
}

// MVP 榜（全员，按评分降序）
function leaders_mvpRows(state, index) {
  const pids = leaders_pids(state);
  const rows = pids.map(function (pid) {
    const st = leaders_statRow(state, pid);
    return leaders_row(index, pid, st, leaders_scoreCore(index, state, pid, st));
  });
  return leaders_sortRows(rows, 'val');
}

// 最佳防守球员榜：按 抢断 + 盖帽 排序
function leaders_dpoyRows(state, index) {
  const pids = leaders_pids(state);
  const rows = pids.map(function (pid) {
    const st = leaders_statRow(state, pid);
    return leaders_row(index, pid, st, st.stl + st.blk);
  });
  return leaders_sortRows(rows, 'avg');
}

// 最佳新秀：只统计 p.isRookie，且 gp ≥ CONFIG.LEADERS.ROY_MIN_GP，按 MVP 评分排序
function leaders_roy(state, n) {
  const L = CONFIG.LEADERS || {};
  const minGp = leaders_num(L.ROY_MIN_GP);
  const index = leaders_index(state);
  const rows = [];
  leaders_pids(state).forEach(function (pid) {
    const ent = index[pid];
    const p = ent && ent.player;
    if (!p || !p.isRookie) return;                 // 只看新秀身份
    const st = leaders_statRow(state, pid);
    if (st.gp < minGp) return;                     // 出场不足不入榜
    rows.push(leaders_row(index, pid, st, leaders_scoreCore(index, state, pid, st)));
  });
  leaders_sortRows(rows, 'val');
  return (typeof n === 'number' && n > 0) ? rows.slice(0, n) : rows;
}

// 计算全部榜单写入 state.leaders（数据榜 + stl/blk + MVP + 最佳新秀 + DPOY + 周最佳 + 月最佳）
// 返回 state.leaders
function leaders_update(state) {
  const L = CONFIG.LEADERS || {};
  const index = leaders_index(state);
  const out = {};
  (L.CATEGORIES || ['pts', 'reb', 'ast']).forEach(function (cat) {
    out[cat] = leaders_categoryRows(state, index, cat);
  });
  out.mvp = leaders_mvpRows(state, index);
  out.roy = leaders_roy(state);
  out.dpoy = leaders_dpoyRows(state, index);
  out.week = leaders_weekBest(state);
  out.month = leaders_monthBest(state);
  state.leaders = out;
  return out;
}

// 取某榜前 n（cat ∈ CONFIG.LEADERS.CATEGORIES ∪ ['mvp','roy','dpoy','week','month']）
// n 缺省或非法 → 返回整榜；state.leaders 缺失时按需重算
function leaders_top(state, cat, n) {
  if (!cat) return [];
  if (!state.leaders || !state.leaders[cat]) leaders_update(state);
  const arr = (state.leaders && state.leaders[cat]) || [];
  const k = Math.floor(Number(n));
  return (isNaN(k) || k <= 0) ? arr.slice() : arr.slice(0, k);
}

/* ==================================================================
 * 3. 周最佳 / 月最佳
 * ================================================================== */

// 【妥协说明 · 必读】
// 理想实现：取最近 CONFIG.LEADERS.WEEK_GAMES / MONTH_GAMES 轮的**逐轮**技术统计求和。
// 现实：engine.js 目前只在 state.lastResults 里保留「本轮」结果，没有逐轮历史归档，
//       且本项目铁律不允许我改 engine.js。因此本模块的策略是：
//   ① 若游戏已产生逐轮历史（state.roundHistory / state.history / state.roundStats，
//      支持 [{round, players:{pid:{...}}}] 或 [{round, games:[{hBox,aBox}]}] 两种形态，后者由 V4 赛程层补写），
//      则按其真正聚合最近 N 轮；
//   ② 否则（绝大多数情况）退回「seasonStats 场均 × 窗口场次」近似：把球员的赛季场均表现当作该窗口的
//      每场水平，窗口场次 = min(gp, 窗口轮数)。这意味着**无历史时周榜与月榜的名次序列等于 MVP 榜**，
//      区别仅在展示的 gp / 累计值；返回结果每条都带 approx=true 明示这是近似值。
function leaders_history(state) {
  const raw = state.roundHistory || state.history || state.roundStats || null;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : Object.keys(raw).map(function (k) { return raw[k]; });
  const out = [];
  arr.forEach(function (rec, i) {
    if (!rec) return;
    let players = null;
    if (rec.players && typeof rec.players === 'object') {
      players = rec.players;
    } else {
      const games = rec.games || rec.results || null;
      const list = Array.isArray(games) ? games : (rec.hBox || rec.aBox ? [rec] : null);
      if (list) {
        players = {};
        list.forEach(function (g) {
          [g.hBox, g.aBox].forEach(function (box) {
            if (!box || !box.players) return;
            Object.keys(box.players).forEach(function (pid) {
              const b = box.players[pid] || {};
              const s = players[pid] || (players[pid] = { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, gp: 0 });
              s.pts += leaders_num(b.pts); s.reb += leaders_num(b.reb); s.ast += leaders_num(b.ast);
              s.stl += leaders_num(b.stl); s.blk += leaders_num(b.blk);
              s.gp += (leaders_num(b.min) > 0 || leaders_num(b.pts) + leaders_num(b.reb) + leaders_num(b.ast) > 0) ? 1 : 0;
            });
          });
        });
      }
    }
    if (!players || !Object.keys(players).length) return;
    const round = rec.round != null ? leaders_num(rec.round) : (rec.roundIdx != null ? leaders_num(rec.roundIdx) : i);
    out.push({ round: round, players: players });
  });
  out.sort(function (a, b) { return a.round - b.round; });
  return out;
}

// 把若干轮的记录聚合成 { pid: {pts,reb,ast,stl,blk,gp} }
function leaders_aggregate(records) {
  const agg = {};
  (records || []).forEach(function (rec) {
    Object.keys(rec.players || {}).forEach(function (pid) {
      const b = rec.players[pid] || {};
      const s = agg[pid] || (agg[pid] = { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, gp: 0 });
      s.pts += leaders_num(b.pts); s.reb += leaders_num(b.reb); s.ast += leaders_num(b.ast);
      s.stl += leaders_num(b.stl); s.blk += leaders_num(b.blk); s.gp += Math.max(0, Math.floor(leaders_num(b.gp)));
    });
  });
  return agg;
}

// 窗口最佳：先真·历史，退回近似
function leaders_windowBest(state, windowGames, n) {
  const win = Math.max(1, Math.floor(leaders_num(windowGames)));
  const index = leaders_index(state);
  const rows = [];
  const hist = leaders_history(state);

  if (hist.length) {
    const agg = leaders_aggregate(hist.slice(-win));
    Object.keys(agg).forEach(function (pid) {
      const st = agg[pid];
      rows.push(leaders_row(index, pid, st, leaders_scoreCore(index, state, pid, st)));
    });
  } else {
    // —— 近似路径：以赛季场均代表窗口内每场水平，窗口场次取 min(gp, win) ——
    leaders_pids(state).forEach(function (pid) {
      const st = leaders_statRow(state, pid);
      const gpWin = Math.min(st.gp, win);
      const per = function (k) { return st.gp > 0 ? st[k] / st.gp : 0; };
      const approxSt = {
        pts: per('pts') * gpWin, reb: per('reb') * gpWin, ast: per('ast') * gpWin,
        stl: per('stl') * gpWin, blk: per('blk') * gpWin, gp: gpWin
      };
      rows.push(leaders_row(index, pid, approxSt, leaders_scoreCore(index, state, pid, approxSt)));
    });
  }
  leaders_sortRows(rows, 'val');
  rows.forEach(function (r) { r.approx = !hist.length; });   // 明示是否近似（约等值仅供展示）
  return (typeof n === 'number' && n > 0) ? rows.slice(0, n) : rows;
}

function leaders_weekBest(state, n) {
  return leaders_windowBest(state, (CONFIG.LEADERS || {}).WEEK_GAMES, n);
}
function leaders_monthBest(state, n) {
  return leaders_windowBest(state, (CONFIG.LEADERS || {}).MONTH_GAMES, n);
}

/* ==================================================================
 * 4. 赛季颁奖
 * ================================================================== */

function leaders_firstRow(state, cat) {
  const arr = (state.leaders && state.leaders[cat]) || [];
  return arr.length ? arr[0] : null;
}

// 赛季颁奖（纯函数，不改动既有 state 字段；要发成就请用返回值调用 goals_checkAchievements）
// 返回 { mvp, roy, dpoy, scoring, rebound, assist, weekBests:[], monthBests:[] }
// weekBests / monthBests 的元素形如 { index, roundStart, roundEnd, rounds, approx, player }
function leaders_awardSeason(state) {
  leaders_update(state);
  const L = CONFIG.LEADERS || {};
  const res = {
    mvp: leaders_firstRow(state, 'mvp'),
    roy: leaders_firstRow(state, 'roy'),
    dpoy: leaders_firstRow(state, 'dpoy'),
    scoring: leaders_firstRow(state, 'pts'),
    rebound: leaders_firstRow(state, 'reb'),
    assist: leaders_firstRow(state, 'ast'),
    weekBests: [], monthBests: []
  };

  function segmentBests(size, marks) {
    const hist = leaders_history(state);
    const win = Math.max(1, Math.floor(leaders_num(size)));
    if (hist.length) {
      for (let s = 0; s < hist.length; s += win) {
        const chunk = hist.slice(s, s + win);
        const agg = leaders_aggregate(chunk);
        const idx = leaders_index(state);
        const rows = Object.keys(agg).map(function (pid) {
          const st = agg[pid];
          return leaders_row(idx, pid, st, leaders_scoreCore(idx, state, pid, st));
        });
        leaders_sortRows(rows, 'val');
        marks.push({
          index: marks.length + 1,
          roundStart: chunk[0].round, roundEnd: chunk[chunk.length - 1].round, rounds: chunk.length,
          approx: false, player: rows.length ? rows[0] : null
        });
      }
      return marks;
    }
    // 无逐轮历史：只给最近一个窗口的近似最佳（见 leaders_windowBest 顶部妥协说明）
    const best = leaders_windowBest(state, win, 1);
    marks.push({
      index: 1,
      roundStart: Math.max(0, (leaders_num(state.round)) - win), roundEnd: leaders_num(state.round), rounds: win,
      approx: true, player: best.length ? best[0] : null
    });
    return marks;
  }

  if (L.WEEK_BEST !== false) segmentBests(L.WEEK_GAMES, res.weekBests);
  if (L.MONTH_BEST !== false) segmentBests(L.MONTH_GAMES, res.monthBests);
  return res;
}

if (typeof module !== 'undefined') {
  module.exports = {
    leaders_update, leaders_top, leaders_weekBest, leaders_monthBest, leaders_mvpScore,
    leaders_roy, leaders_awardSeason, leaders_index, leaders_row, leaders_sortRows,
    leaders_history, leaders_windowBest, leaders_statRow, leaders_scoreCore
  };
}
