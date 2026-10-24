// cangame v4 · 球员生成与评分
// v4 变更（V4-BALANCE）：
//   1) 综合分布重铸：按 CONFIG.PLAYER.OVERALL_DIST 的权重分档抽样 → 档内均匀（明星稀有）
//   2) 球队主力（名册前 STARTER 位）向 STARTER_RANGE 回归，强度 STARTER_RANGE_K
//   3) 新秀（isRookie）走 ROOKIE_RANGE（即战力低）+ ROOKIE_POTENTIAL（潜力高）
//   兼容：genPlayer(rng, opts) 签名与 opts.age / opts.pos / opts.tier / opts.isFA / opts.id 语义不变
var SURNAMES = '王李张刘陈杨黄赵周吴徐孙马朱胡郭何高林郑谢罗梁宋唐许韩冯邓曹彭曾肖田董袁潘于蒋蔡余杜叶程苏魏吕丁任沈姚卢傅钟姜崔谭廖范汪陆金石戴贾韦夏邱方侯邹熊孟秦白江阎薛尹段雷黎史龙陶贺顾毛郝龚邵万钱严覃武戚莫孔向汤';
var GIVEN = ['伟','强','磊','军','洋','勇','杰','涛','明','超','峰','飞','鹏','华','健','俊','宇','浩','凯','轩','睿','晨','昊','霖','泽','航','阳','宁','博','译','皓','煜','辰','骁','峥','翊','牧','野','川','岩','朔','骁','cedric','霖','骁','擎','曜','屿','澈','屿','桉','珩','栩','琛','旻','骁'];

// 属性拟合迭代上限（算法常量，非平衡数值）
var PLAYER_FIT_STEPS = 16;

function genName(rng) {
  const s = SURNAMES[Math.floor(rng() * SURNAMES.length)];
  const g1 = GIVEN[Math.floor(rng() * GIVEN.length)];
  const g2 = rng() < 0.5 ? GIVEN[Math.floor(rng() * GIVEN.length)] : '';
  return s + g1 + g2;
}

// —— v4：按 OVERALL_DIST 权重选档（全部权重读 CONFIG）——
function players_pickBand(rng) {
  const D = CONFIG.PLAYER.OVERALL_DIST;
  let tot = 0, i;
  for (i = 0; i < D.length; i++) tot += (D[i].w || 0);
  if (tot <= 0) return D[0];
  let r = rng() * tot;
  for (i = 0; i < D.length; i++) { r -= (D[i].w || 0); if (r <= 0) return D[i]; }
  return D[D.length - 1];
}

// —— v4：档内均匀抽样 → 返回该名球员的基准综合 ——
// 取 [min, max) 的整数（下取整），避免向上取整越过档位边界污染邻居档权重
function players_sampleBase(rng) {
  const b = players_pickBand(rng);
  const lo = b.min, hi = b.max;
  return Math.floor(lo + rng() * (hi - lo));
}

// —— v4：是否首发槽位 ——
// 优先读显式 opts.starter；否则由名册位次推导（buildRoster / buildReservePool
// 以 `<teamId>_<序号>` 生成 id，序号 < CONFIG.PLAYER.STARTING 即主力）。
// 显式传 starter:false 可关闭（转会池 / 新秀等非名册球员用）。
function players_isStarterSlot(opts) {
  opts = opts || {};
  if (opts.starter != null) return !!opts.starter;
  const m = /_(\d+)$/.exec(String(opts.id || ''));
  if (!m) return false;
  const idx = parseInt(m[1], 10);
  return isFinite(idx) && idx >= 0 && idx < CONFIG.PLAYER.STARTING;
}

// 向 [lo,hi] 区间回归（k=0 不干预，k=1 完全钳制）
function players_regress(v, lo, hi, k) {
  const t = clamp(v, lo, hi);
  return Math.round(v + (t - v) * clamp(k, 0, 1));
}

// 把属性整体平移使综合等于 target（保留属性高低差；受 ATTR_MIN/MAX 钳制时提前收敛）
function players_pullOverall(p, target) {
  const P = CONFIG.PLAYER;
  target = clamp(Math.round(target), P.ATTR_MIN, P.ATTR_MAX);
  p.overall = players_overall(p);
  for (let i = 0; i < PLAYER_FIT_STEPS; i++) {
    const cur = p.overall;
    const d = target - cur;
    if (d === 0) break;
    P.ATTRS.forEach(function (k) {
      p.a[k] = clamp(p.a[k] + d, P.ATTR_MIN, P.ATTR_MAX);
    });
    p.overall = players_overall(p);
    if (p.overall === cur) break;   // 钳制封顶，无法再移动
  }
  return p.overall;
}

function genPlayer(rng, opts) {
  opts = opts || {};
  const P = CONFIG.PLAYER;
  const pos = opts.pos || P.POSITIONS[Math.floor(rng() * P.POSITIONS.length)];
  const age = opts.age != null ? opts.age : randInt(rng, P.AGE_MIN, P.AGE_MAX);
  const tier = opts.tier != null ? opts.tier : 0; // -8 替补 / 0 轮换 / +8 主力 / +15 明星
  // 新秀判定：仅当显式标记（draft.js 生成的新秀 / 外部调用）才走 ROOKIE_RANGE。
  // 理由：随机年龄落在 19-22 的名册球员不等于"新秀"（可能是已打了几年的老兵），
  //       若按年龄自动走新秀档，初始球队主力会被 ~20% 的 45 分球员拖出 STARTER_RANGE。
  //       输出字段 p.isRookie 仍保留"按年龄判定"的既有语义（向后兼容，不删字段）。
  const isRookie = opts.isRookie === true;
  const ageFlagRookie = age >= P.ROOKIE_AGE[0] && age <= P.ROOKIE_AGE[1];
  let target;
  if (isRookie) {
    // 新秀：即战力钉在 ROOKIE_RANGE（不看 tier / 不做主力回归）
    target = randInt(rng, P.ROOKIE_RANGE[0], P.ROOKIE_RANGE[1]);
  } else {
    target = Math.round(players_sampleBase(rng) + tier);
    if (players_isStarterSlot(opts)) {
      target = players_regress(target, P.STARTER_RANGE[0], P.STARTER_RANGE[1], P.STARTER_RANGE_K);
    }
    target = clamp(target, P.ATTR_MIN, P.ATTR_MAX);
  }
  const a = {};
  P.ATTRS.forEach(function (k) {
    let v = target + randInt(rng, -12, 12);
    if (k === 'STA') v = clamp(v + 4, P.ATTR_MIN, P.ATTR_MAX); // 体力偏高更真实
    a[k] = clamp(Math.round(v), P.ATTR_MIN, P.ATTR_MAX);
  });
  // 力量（单独属性，参与篮板/对抗，不计入综合）
  const strBias = { C: 10, PF: 5, SF: 0, SG: -4, PG: -8 }[pos] || 0;
  a.STR = clamp(randInt(rng, P.STR_RANGE[0], P.STR_RANGE[1]) + strBias, 35, 99);
  // 身高/体重（按位置区间）
  const hr = P.HEIGHT[pos] || [185, 205];
  const height = randInt(rng, hr[0], hr[1]);
  const weight = Math.round(height * (0.44 + rng() * 0.08));
  const p = {
    id: opts.id || ('p' + Math.floor(rng() * 1e9).toString(36)),
    name: genName(rng), pos: pos, age: age,
    height: height, weight: weight,
    trait: P.TRAITS[Math.floor(rng() * P.TRAITS.length)],
    a: a, overall: 0,
    salary: 0, contractYears: randInt(rng, 1, 4),
    stamina: 100, injury: 0, mood: CONFIG.MOOD.BASE,
    potential: 0, birthday: null, isRookie: false, isFA: !!opts.isFA,
    todoVerify: !!opts.todoVerify
  };
  p.overall = players_overall(p);
  // v4：把综合收敛到目标（同一批 rng 下属性形状由 target 唯一决定，分布严格贴合 CONFIG）
  players_pullOverall(p, target);
  p.salary = players_salary(p);
  // 潜力：新秀走 ROOKIE_POTENTIAL（潜力高）；其余沿用年轻递减模型
  const baseYear = opts.baseYear || 2006;
  if (isRookie) {
    p.potential = clamp(p.overall + randInt(rng, P.ROOKIE_POTENTIAL[0], P.ROOKIE_POTENTIAL[1]), P.ATTR_MIN, P.ATTR_MAX);
  } else {
    p.potential = clamp(p.overall + randInt(rng, 0, 16) + (age <= 22 ? 6 : 0), P.ATTR_MIN, P.ATTR_MAX);
  }
  p.birthday = (baseYear - age) + '-' + String(randInt(rng, 1, 12)).padStart(2, '0') + '-' + String(randInt(rng, 1, 28)).padStart(2, '0');
  p.isRookie = opts.isRookie != null ? !!opts.isRookie : ageFlagRookie;
  return p;
}

function players_overall(p) {
  const w = CONFIG.PLAYER.POS_WEIGHT[p.pos];
  let sum = 0, tot = 0;
  CONFIG.PLAYER.ATTRS.forEach(function (k) { sum += p.a[k] * (w[k] || 1); tot += (w[k] || 1); });
  return Math.round(sum / tot);
}

function players_salary(p) {
  const F = CONFIG.FINANCE;
  let s = p.overall * p.overall * F.SAL_K + p.a.CLU * F.CLUTCH_SAL_BONUS;
  // 年龄折扣（老将略降，新秀合同低）
  if (p.age >= 33) s *= 0.82;
  else if (p.age <= 21) s *= 0.7;
  return Math.round(s / 10) * 10; // 取整到十
}

// —— v4.3 赛季末成长系统：让球员随赛季真实成长（修复"打满一赛季数值不变"）——
// 成长量 = (潜力 - 当前综合) × GAP_COEF × 年龄因子；年轻保底、老将自然下滑。
// 成长量同时加到 10 项属性 → 综合同步上涨（overall 为属性加权平均，等幅加成属性即等幅涨综合）。
function processPlayerGrowth(p) {
  if (!p || !p.a) return p;
  const P = CONFIG.PLAYER, G = CONFIG.GROWTH;
  const gap = Math.max(0, (p.potential != null ? p.potential : p.overall) - p.overall);
  let factor;
  if (p.age <= G.PEAK_AGE) factor = 1.0;
  else if (p.age <= G.DECLINE_AGE) factor = 0.4;
  else factor = 0.05;
  let gain = gap * G.GAP_COEF * factor;
  // 老将自然下滑（潜力已兑现时综合缓慢回落）
  let decline = 0;
  if (p.age >= G.DECLINE_AGE) decline = (p.age - G.DECLINE_AGE + 1) * G.DECLINE_PER_AGE;
  // 年轻保底：仍有潜力空间则保证最低成长，杜绝"数值不动"
  if (p.age <= G.YOUNG_BONUS_AGE && gap > 0 && gain < G.ROOKIE_FLOOR) gain = G.ROOKIE_FLOOR;
  gain = Math.round(gain - decline);
  if (gain === 0) return p;
  P.ATTRS.forEach(function (k) { p.a[k] = clamp(p.a[k] + gain, P.ATTR_MIN, P.ATTR_MAX); });
  p.overall = players_overall(p);
  return p;
}

// 简单属性端点
function attrEnd(p, k) { return p.a[k]; }

if (typeof module !== 'undefined') {
  module.exports = {
    genPlayer, players_overall, players_salary, genName, processPlayerGrowth,
    players_pickBand, players_sampleBase, players_isStarterSlot, players_regress, players_pullOverall
  };
}
