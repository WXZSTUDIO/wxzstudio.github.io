// cangame v4.4 · 每日登录突发事件系统
// 依赖：config.js / rng.js / league.js(teamById) / media.js(media_applyEff 命名空间可选)
// 设计要点：
//   1) 事件表读 CONFIG.RANDOM_EVENTS；触发概率读 CONFIG.RANDOM_EVENTS_CHANCE
//   2) eff 键：cash(资金) / morale(更衣室+老板+球迷) / ability(随机球员能力±) / tickets(上座率系数)
//   3) 触发写入 state.pendingRandomEvent；玩家选择后写入 state.newsLog（新闻日志）并清 pending
//   4) 每轮至多触发一次（lastRandomEventRound 守卫，防止 advanceRound 与登录重复触发）
//   5) 全部随机走传入 rng（deriveSeed），禁止 Math.random / Date.now

var RE_KEY = 'pendingRandomEvent';

function randomEvents_ensure(state) {
  if (!state) return state;
  if (!state.newsLog) state.newsLog = [];          // 新闻日志（含随机事件与战报摘要）
  if (state[RE_KEY] == null) state[RE_KEY] = null;  // 当前待处理事件
  if (state.lastRandomEventRound == null) state.lastRandomEventRound = -1;
  if (state.ticketMod == null) state.ticketMod = 1.0; // 上座率系数（门票影响，逐轮回归 1）
  if (!state.log) state.log = [];
  return state;
}

// 按 w 加权抽一条事件
function randomEvents_pick(rng) {
  var list = (CONFIG.RANDOM_EVENTS || []);
  var total = 0, i;
  for (i = 0; i < list.length; i++) total += (Number(list[i].w) || 0);
  if (!list.length || total <= 0) return null;
  var r = rng() * total;
  for (i = 0; i < list.length; i++) {
    r -= (Number(list[i].w) || 0);
    if (r <= 0) return list[i];
  }
  return list[list.length - 1];
}

// 每轮（每日登录）最多触发一次
function randomEvents_maybeTrigger(state, rng) {
  randomEvents_ensure(state);
  if (state[RE_KEY]) return null;                       // 已有待处理
  if (state.lastRandomEventRound === state.round) return null; // 本轮已触发
  var chance = Number(CONFIG.RANDOM_EVENTS_CHANCE) || 0;
  if (typeof rng !== 'function' || rng() >= chance) return null;
  var ev = randomEvents_pick(rng);
  if (!ev) return null;
  state[RE_KEY] = {
    id: ev.id, title: ev.title, desc: ev.desc,
    options: ev.options.map(function (o) { return { id: o.id, label: o.label, eff: o.eff || {} }; }),
    round: state.round || 0, season: state.season || 1
  };
  state.lastRandomEventRound = state.round;
  state.log.push('📰 突发事件：' + ev.title);
  return state[RE_KEY];
}

// 读取当前待处理事件（供前端弹窗）
function randomEvents_current(state) {
  return (state && state[RE_KEY]) || null;
}

// 应用单项 eff
function randomEvents_applyEff(state, eff, rng) {
  eff = eff || {};
  var human = teamById(state, state.humanTeamId);
  // 确定性兜底：rng 缺省时按 seed 派生（禁用 Math.random）
  if (typeof rng !== 'function') {
    rng = makeRNG(deriveSeed(state.seed || 0, (state.round || 0) * 131 + 7));
  }
  // 1) 资金
  if (eff.cash) {
    var c = Math.round(eff.cash);
    state.finance.cash = (state.finance.cash || 0) + c;
    if (c >= 0) state.finance.income += c; else state.finance.expense += -c;
  }
  // 2) 士气：更衣室 + 老板 + 球迷
  if (eff.morale) {
    var m = Number(eff.morale) || 0;
    if (!state.media) state.media = {};
    state.media.locker = clamp((state.media.locker || 70) + m, 0, 100);
    state.media.owner = clamp((state.media.owner || 70) + m * 0.8, 0, 100);
    state.media.fanMood = clamp((state.media.fanMood || 60) + m * 0.7, 0, 100);
  }
  // 3) 能力：随机一名本队球员综合 ±
  if (eff.ability && human && human.players && human.players.length) {
    var d = Math.round(eff.ability);
    var p = human.players[Math.floor(rng() * human.players.length)];
    if (p && p.a) {
      CONFIG.PLAYER.ATTRS.forEach(function (k) { p.a[k] = clamp((p.a[k] || 0) + d, CONFIG.PLAYER.ATTR_MIN, CONFIG.PLAYER.ATTR_MAX); });
      p.overall = players_overall(p);
    }
  }
  // 4) 门票：上座率系数（逐轮回归 1，影响下一轮球票收入）
  if (eff.tickets) {
    state.ticketMod = clamp((state.ticketMod || 1) * (1 + Number(eff.tickets)), 0.5, 1.6);
  }
}

// 玩家选择某个选项
function randomEvents_choose(state, optionId, rng) {
  randomEvents_ensure(state);
  var ev = state[RE_KEY];
  if (!ev) return { ok: false, reason: 'no-event' };
  var opt = null;
  for (var i = 0; i < ev.options.length; i++) if (ev.options[i].id === optionId) { opt = ev.options[i]; break; }
  if (!opt) return { ok: false, reason: 'no-option' };
  randomEvents_applyEff(state, opt.eff, rng);
  // 记入新闻日志
  var rec = { kind: 'random', id: ev.id, title: ev.title, choice: opt.label, season: ev.season, round: ev.round };
  state.newsLog.push(rec);
  if (state.newsLog.length > 60) state.newsLog.splice(0, state.newsLog.length - 60);
  state.log.push('✔ 你选择了「' + opt.label + '」— ' + ev.title);
  state[RE_KEY] = null;
  return { ok: true, event: ev, option: opt };
}

// 已解决的事件历史（前端"新闻中心"可展示）
function randomEvents_news(state) {
  return ((state && state.newsLog) || []).slice().reverse();
}

if (typeof module !== 'undefined') {
  module.exports = {
    randomEvents_ensure, randomEvents_maybeTrigger, randomEvents_current,
    randomEvents_choose, randomEvents_applyEff, randomEvents_news
  };
}
