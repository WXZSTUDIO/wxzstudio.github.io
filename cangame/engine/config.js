// cangame v4.0 · 配置（唯一可调数值源）
// XBA 逆向：金字塔联赛 / 街球杯赛 / 冠军杯(512淘汰) / 联盟系统 / 经营细化 / 竞猜 / 球星 / 6v6 战术
// v4 新增：联赛直播 / 赛季目标·成就·每日任务 / 选秀·全明星·季后赛 / 媒体球迷·随机事件 / 排行榜 / 转播收入
//         / 工资帽·奢侈税 / 动态转会定价 / AI 交易
var CONFIG = {
  VERSION: '4.1.0',
  SEED_DEFAULT: 20261014,

  // —— 职业联赛（XBA 金字塔）：1级联赛×1 + 2级联赛×2，每个联赛 14 队 ——
  LEAGUE: {
    TEAMS_PER_LEAGUE: 14,     // 每个联赛 14 队（XBA 规则）
    LEVEL1_LEAGUES: 1,        // 1级联赛数量
    LEVEL2_LEAGUES: 2,        // 2级联赛数量（= 2倍 1级，保证 2升4降 闭环）
    REGULAR_ROUNDS: 26,       // 主客场双循环 26 轮（XBA 规则）
    PROMOTE_PER_LEAGUE: 2,    // 每个 2级联赛前 2 名升级（XBA 规则）
    RELEGATE_PER_LEAGUE: 4    // 1级联赛后 4 名降级（XBA 规则）
  },

  PLAYER: {
    POSITIONS: ['PG', 'SG', 'SF', 'PF', 'C'],
    ATTRS: ['SHO', 'TRE', 'DRV', 'PAS', 'REB', 'DEF', 'SPD', 'STA', 'IQ', 'CLU'],
    ATTR_MIN: 35, ATTR_MAX: 99,
    BASE_MEAN: 65, POS_SPREAD: 10,
    ROSTER_SIZE: 12, STARTING: 5,
    AGE_MIN: 19, AGE_MAX: 38, ROOKIE_AGE: [19, 22],
    TRAITS: ['稳重', '好胜', '独狼', '领袖', '玻璃人', '神经刀'],
    POS_WEIGHT: {
      PG: { PAS: 1.4, SPD: 1.3, IQ: 1.3, TRE: 1.2, DRV: 1.1, SHO: 1.0, DEF: 0.9, REB: 0.5, STA: 0.9, CLU: 0.9 },
      SG: { SHO: 1.4, TRE: 1.3, SPD: 1.1, DRV: 1.1, CLU: 1.1, DEF: 0.9, IQ: 0.9, PAS: 0.9, REB: 0.5, STA: 0.9 },
      SF: { DEF: 1.2, SHO: 1.2, DRV: 1.1, SPD: 1.1, REB: 1.0, IQ: 1.0, TRE: 1.0, PAS: 0.9, STA: 1.0, CLU: 1.0 },
      PF: { REB: 1.4, DEF: 1.2, DRV: 1.1, SHO: 1.0, IQ: 0.9, SPD: 0.8, TRE: 0.7, PAS: 0.8, STA: 1.0, CLU: 0.9 },
      C:  { REB: 1.6, DEF: 1.3, SHO: 0.9, DRV: 0.8, IQ: 0.9, SPD: 0.6, TRE: 0.4, PAS: 0.7, STA: 1.1, CLU: 0.8 }
    },
    TRAIT_USAGE: { 稳重: 0.95, 好胜: 1.10, 独狼: 1.25, 领袖: 1.05, 玻璃人: 0.90, 神经刀: 1.00 },
    TRAIT_VOLATILE: { 稳重: 0.03, 好胜: 0.04, 独狼: 0.05, 领袖: 0.04, 玻璃人: 0.05, 神经刀: 0.09 },
    // 篮板位置基础权重（C/PF 最高，PG 最低）—— 修复 PG 篮板异常的核心
    POS_REB_WEIGHT: { PG: 0.5, SG: 0.85, SF: 1.1, PF: 2.4, C: 3.2 },
    // 身高区间（cm，按位置）—— 参与篮板/内线对抗
    HEIGHT: { PG: [178, 193], SG: [188, 200], SF: [195, 208], PF: [201, 214], C: [207, 221] },
    STR_RANGE: [45, 90],   // 力量属性区间（a.STR，单独存，不参与综合）
    // —— v4 综合分布重铸：初始球队主力 55-65，明星稀有（防止高能力球员泛滥）——
    // 抽样方式：按权重选档 → 档内均匀；ROOKIE/新秀走独立档位
    OVERALL_DIST: [
      { min: 40, max: 50, w: 0.50 },
      { min: 50, max: 60, w: 0.30 },
      { min: 60, max: 70, w: 0.15 },
      { min: 70, max: 80, w: 0.04 },
      { min: 80, max: 99, w: 0.01 }
    ],
    STARTER_RANGE: [55, 65],    // 初始球队主力综合区间（超出部分被拉回）
    STARTER_RANGE_K: 0.75,      // 主力回归区间的强度（0=不干预，1=完全钳制）
    ROOKIE_RANGE: [38, 52],     // 新秀即战力低
    ROOKIE_POTENTIAL: [12, 30]  // 新秀潜力加成高
  },

  MATCH: {
    POSSESSIONS: 100,                   // 每队回合数（对齐真实篮球 ~100 回合/场）
    // 本作不模拟罚球（真实比赛约 20% 得分来自罚球），故投篮命中率基线调高以补偿，
    // 使每队场均落在真实区间（~100 分）；同时打铁减少 → 篮板回落，各位置篮板才不超标。
    BASE_2P: 0.63, BASE_3P: 0.44,
    SHO_COEF: 0.0042, TRE_COEF: 0.0045, DEF_COEF: 0.0035, IQ_COEF: 0.0020,
    FATIGUE_SHOOT_PENALTY: 0.004, FATIGUE_MIN_THRESHOLD: 24,
    TO_BASE: 0.12, IQ_TO_COEF: 0.0018, PRESS_TO_BONUS: 0.05,
    REB_COEF: 0.006, REB_BASE: 0.30,   // 进攻篮板率压到真实区间（~25-35%）
    OREB_FACTOR: 0.82,                  // 进攻篮板相对防守更难
    NOISE: 0.05,
    CLUTCH_DIFF: 3, CLUTCH_BONUS: 0.02,
    STARTER_MIN: 34, BENCH_MIN: 14, FREQ_STARTER_DELTA: -4, FREQ_BENCH_DELTA: 4,
    FATIGUE_PER_POSSESS: 0.70,          // 每回合在场所耗体力（赛中轮换用）
    REST_RECOVER_POSSESS: 1.20,         // 板凳每回合恢复体力（短休息→首发快速回归，占比~85%）
    SUB_STAMINA: 60,                    // 体力≤此值换下
    FOUL_SUB: 4, FOUL_OUT: 5,           // 4 犯换下 / 5 犯离场
    FOUL_RATE: 0.10,                    // 每回合出现犯规的概率
    MIN_ROTATION: 8,                    // 每场至少登场人数
    ROT_MIN: { 保守: { starter: 42, bench: 14 }, 均衡: { starter: 34, bench: 20 }, 频繁: { starter: 28, bench: 24 } }
  },

  // —— 战术系统（XBA 逆向：6 进攻 × 6 防守 + 相克矩阵）——
  TACTICS: {
    OFFENSE: ['内线强攻', '中锋策应', '外线', '快攻', '整体', '挡拆'],
    DEFENSE: ['2-3联防', '3-2联防', '2-1-2联防', '盯人', '盯内', '盯外'],
    ROTATION: ['保守', '均衡', '频繁'],
    // 节奏：进攻战术自带 tempo（ possessions 乘数）
    OFF_TEMPO: { '内线强攻': 0.95, '中锋策应': 0.97, '外线': 1.0, '快攻': 1.08, '整体': 1.0, '挡拆': 1.0 },
    // 攻克防命中加成（攻_防 → ±）。依据 XBA 老玩家攻略：联防克整体/内线，挡拆克 2-3，外线怕 2-3/盯外…
    COUNTER: {
      '内线强攻_盯人': 0.04, '内线强攻_2-3联防': -0.05, '内线强攻_盯内': -0.06, '内线强攻_3-2联防': 0.03,
      '中锋策应_盯人': 0.03, '中锋策应_盯外': 0.05, '中锋策应_2-3联防': -0.04, '中锋策应_2-1-2联防': -0.04,
      '外线_3-2联防': 0.05, '外线_2-3联防': -0.04, '外线_盯外': -0.03, '外线_盯人': 0.02,
      '快攻_盯人': 0.03, '快攻_2-1-2联防': 0.02, '快攻_2-3联防': -0.03, '快攻_3-2联防': -0.03,
      '整体_盯人': 0.02, '整体_2-3联防': -0.05, '整体_3-2联防': -0.04, '整体_2-1-2联防': -0.04,
      '挡拆_2-3联防': 0.04, '挡拆_2-1-2联防': -0.04, '挡拆_盯外': -0.03, '挡拆_盯人': 0.02
    },
    COUNTER_CAP: 0.08
  },

  INJURY: {
    BASE: 0.04, AGE_FACTOR: 0.004, GLASS_MULT: 1.6, MAX_DNP: 8, REST_RECOVER: 18
  },

  FINANCE: {
    STADIUM_CAP: 8000,        // 主场容量（经营细化：票价×上座率）
    AD_PER_SLOT: 240,         // 每个广告位单轮价值（随球迷/威望放大）
    JERSEY_BASE: 150,         // 球衣销售基础（随战绩/球星/极限球员放大）
    SPONSOR_BASE: 800, BANKRUPT: -50000, SAL_K: 1.6, CLUTCH_SAL_BONUS: 30
  },

  // —— 经营细化：票价档位 + 上座率（XBA：上座率 80%–90% 净收入最高）——
  PRICE: {
    default: 'mid',
    options: [
      { key: 'low',  label: '低价 ¥30', price: 30, att: 0.95 },
      { key: 'mid',  label: '中价 ¥55', price: 55, att: 0.88 },
      { key: 'high', label: '高价 ¥90', price: 90, att: 0.70 }
    ]
  },
  // 球衣销售放大系数（单场战绩 + 球星 + 极限球员）
  JERSEY: { perWin: 1.4, starBonus: 0.10, extremeBonus: 0.20 },

  // —— 球场（广告位数量 = 球场等级 + 球迷/4000）——
  STADIUM: { DEFAULT_LEVEL: 1, LEVEL_CAP: 5, UPGRADE_COST: [0, 120000, 400000, 900000, 2000000], CAPACITY_PER_LEVEL: 0.6 },

  // —— 赞助商合同制广告（替换原“胜负赔钱”简单模型）——
  SPONSOR: {
    COUNT: 14,                          // 生成的赞助商数量
    industries: ['运动品牌', '饮料', '汽车', '金融', '电子', '餐饮', '地产', '航空', '互联网', '护肤'],
    namePrefix: ['锐', '腾', '恒', '昇', '星', '云', '海', '极', '光', '川', '宇', '晟'],
    nameSuffix: ['动', '驰', '达', '耀', '联', '峰', '润', '锐', '源', '创', '盛', '通'],
    basePrice: [2000, 7000],            // 单轮基础单价区间
    roundsOpts: [5, 10, 20],            // 合同轮次选项
    FAN_COEF_CAP: 1.5,                  // 球迷系数上限 = min(1.5, 球迷/4000)
    RECORD_WIN_BONUS: 0.5,              // 战绩系数 = 1 + 胜率×0.5 + 连胜加成
    STREAK_BONUS: 0.15,
    IMPORTANCE: { REGULAR: 1.0, CUP: 1.2, PLAYOFF: 1.5 },  // 比赛重要性系数
    FIT_RANGE: [0.8, 1.2],              // 品牌契合度
    DYNAMIC_DOWN: 0.92,                 // 签得多 → 单价下降
    DYNAMIC_UP: 1.04,                   // 没人签 → 单价回升
    BREACH_PENALTY: 0.5,                // 提前解约扣已得收入比例
    bonuses: { champion: 50000, playoff: 20000, streak3: 5000, rankTop4: 15000 }  // 奖金条款
  },

  // —— CBA 真实队名导入（阶段3）——
  USE_CBA: true,                        // 新游戏用真实 CBA 队名 + 占位球员(TODO)

  // —— 训练（普通训练：训练点制）——
  TRAINING: {
    POINTS_PER_WIN: 3, POINTS_PER_LOSS: 1,
    START_POINTS: 10,
    COST_POINTS: 5, COST_STAMINA: 8, COST_MOOD: 4,
    GAIN_MIN: 1, GAIN_MAX: 3,
    ATTRS: ['SHO', 'TRE', 'DRV', 'PAS', 'REB', 'DEF', 'SPD', 'STA', 'IQ', 'CLU'],
    PHYSIO_CASH: 100, PHYSIO_STAMINA: 15, PHYSIO_MOOD: 10
  },

  // —— 球星系统（XBA 逆向：王者积分 + 资金训练，每级最高 +7% 综合，可降级重训）——
  STAR: {
    MAX_LEVEL: 5,
    GAIN_PCT_MAX: 0.07,          // 每升一级最高 +当前值 7%
    GAIN_PCT_MIN: 0.02,
    KINGS_PTS_BASE: 8,           // 升到第 n 级消耗 王者积分 = BASE + (n-1)*STEP
    KINGS_PTS_STEP: 4,
    CASH_BASE: 5000, CASH_STEP: 5000,   // 资金消耗同理
    DOWNGRADE_CASH: 3000,        // 降级费用（积分不返还）
    COLOR: '#c084fc'             // 球星紫色
  },

  // —— 胜者为王（连续淘汰赛，连胜 3/6/9 领取）——
  KINGS: {
    MAX_STREAK: 9,
    POINTS_PER_WIN: [1, 1, 1, 2, 2, 2, 4, 4, 4], // 第 n 场胜利的积分
    CASH_PER_WIN: 800,
    STAMINA_COST: 6,
    CLAIM_AT: [3, 6, 9],
    EXIT_KEEP_PCT: 0.6           // 非里程碑退出只得 60% 积分
  },

  // —— 街球杯赛（XBA 逆向：新人杯/小杯赛/大杯赛/大师杯，淘汰赛制）——
  CUP: {
    // 每个杯赛：开赛轮 = rounds 数组（依次 1/16→1/8→1/4→1/2→决赛 视 size 而定）
    TYPES: [
      { id: 'rookie', name: '新人杯', size: 16, startRound: 4, gap: 2, only: 'first-season',
        prize: [50000, 20000, 10000, 5000], kings: 6, desc: '新赛季首次参赛保护杯（仅第一赛季，16 队淘汰赛）' },
      { id: 'small', name: '小杯赛', size: 8, startRound: 10, gap: 3, only: 'all',
        prize: [30000, 12000, 6000, 3000], kings: 4, desc: '赛季中热身（8 队淘汰赛，全等级可报）' },
      { id: 'big', name: '大杯赛', size: 16, startRound: 16, gap: 3, only: 'all',
        prize: [80000, 30000, 15000, 8000], kings: 8, desc: '全等级开放 · 每赛季一次（16 队淘汰赛）' },
      { id: 'master', name: '大师杯', size: 16, startRound: 22, gap: 3, only: 'all', reqCupWin: true,
        prize: [150000, 60000, 30000, 12000], kings: 12, desc: '最高等级街球杯（需先夺得任意杯赛冠军方可报名）' }
    ],
    MIN_ENTRY: 0.5   // 报名人数≥上限 50% 才发全额奖金（XBA 规则，展示用）
  },

  // —— 冠军杯赛（XBA 逆向：512 人制单淘汰 + 报名分阶段）——
  // 规模 512（AI 俱乐部填充 + 人类资格队）；报名三阶段：优先邀请函→盟邀请函→全员
  CHAMPIONSHIP: {
    size: 512,            // 单淘汰规模（2 的幂）
    openRound: 6,         // 第 6 轮开放报名（优先邀请函：各级联赛前 2）
    phase2Round: 9,       // 第 9 轮开放盟邀请函（联盟排名资格）
    phase3Round: 12,      // 第 12 轮开放全员报名
    bracketStart: 14,     // 第 14 轮抽签/首轮开打
    gap: 1,               // 每联赛轮推进一 bracket 轮
    championPrize: { cash: 1000000, prestige: 500, kings: 30 }, // 总冠军
    runPrize: 8000        // 每赢一轮奖金
  },

  // —— 联盟系统（XBA 逆向：联盟首页/盟战/联盟威望/联盟杯赛/至尊杯邀请函）——
  ALLIANCE: {
    poolSize: 8,          // AI 联盟数量（单机版模拟工会）
    warGap: 4,            // 每 4 轮一场盟战
    warPrestige: 8,       // 盟战胜场为联盟加威望
    warKings: 3,          // 盟战胜场给经理王者积分
    cupRound: 13,         // 联盟杯赛抽签轮（每赛季一次）
    cupGap: 2,
    cupPrize: [60000, 20000, 8000],
    cupPrestige: [30, 15, 5],
    supremeTopN: 6,       // 联盟排名前 6 获至尊杯邀请函
    supremeCheckRound: 16,
    supremeRound: 18,
    supremeGap: 2,
    supremePrize: { cash: 1500000, prestige: 800, kings: 50 }
  },

  // —— 有奖竞猜（XBA 逆向：押注比赛结果赢资金）——
  BET: {
    maxStakePct: 0.4,     // 单注最多押资金 40%
    baseOdd: 1.9,         // 基础赔率（按实力差微调）
    featured: 3           // 每轮展示可押注场次
  },

  // —— 转会市场（XBA 逆向：系统球员池，按综合定价买卖）——
  TRANSFER: {
    poolSize: 14,
    priceK: 2.2,        // 身价基础系数（身价 ≈ overall² × priceK）
    extremeRate: 0.2,   // 极限球员占比
    resellRate: 0.5,    // 转出回收比例
    // —— v4 动态定价：价格 = 基础价 × 综合系数 × 年龄系数 × 潜力系数 × 位置稀缺系数 × 市场供需系数 ——
    AGE_PEAK: 27,           // 身价峰值年龄
    AGE_YOUNG_K: 0.85,      // 年轻（未兑现潜力）折扣下限
    AGE_OLD_K: 0.45,        // 老将折扣下限（34+ 趋近此值）
    POTENTIAL_K: 1.1,       // 潜力溢价系数（潜力高于综合越多越贵）
    POS_SCARCITY: { PG: 1.00, SG: 1.00, SF: 1.05, PF: 1.15, C: 1.30 },  // 中锋稀缺 → 贵
    SUPPLY_K: 0.40,         // 同位置供给过剩时的最大降价幅度
    DEMAND_K: 0.25,         // 需求（同位置缺人）时的最大加价幅度
    // —— v4 转会机制 ——
    LISTING_FEE: 0.02,      // 挂牌费 = 身价 × 2%
    DEAL_TAX: 0.08,         // 成交税 = 成交价 × 8%（买方付）
    BID_STEP: 0.05,         // 竞价最小加价 5%
    BID_ROUNDS: 3,          // 竞价轮数
    SCOUT_COST: 2000,       // 球探报告费用
    SCOUT_ACCURACY: 0.85,   // 球探准确度（隐藏属性揭示概率）
    HIDDEN_NOISE: 6,        // 未球探时属性显示浮动 ±
    DEADLINE_ROUND: 22,     // 转会截止轮（之后只能买断市场）
    BUYOUT_MIN_AGE: 30,     // 买断市场准入年龄（老将为主）
    BUYOUT_DISCOUNT: 0.7,   // 买断市场折扣
    AI_TRADE_ENABLED: true,
    AI_TRADE_GAP: 2,        // AI 每 N 轮做一次交易决策（v4.1 由 3 提频，保证挂牌市场有货）
    AI_TRADE_CHANCE: 0.55   // 每次决策实际出手概率（v4.1 由 0.35 提频）
  },

  // —— v4.1 自由球员市场 ——
  FREE_AGENT: {
    ENABLED: true,
    POOL_TARGET: 6,          // 池目标人数（低于则每轮按概率补充）
    CHANCE_PER_ROUND: 0.4,   // 每轮补充一名的概率
    AGE: [24, 33],           // 自由球员年龄带
    TIER: [-6, 8],           // 综合档位偏移（相对均值）
    CONTRACT_YEARS: 2        // 签约默认合同年数
  },

  // —— v4 工资帽 / 奢侈税 / 合同 ——
  SALARY: {
    ENABLED: true,
    CAP_BASE: 900000,           // 工资帽基准（按赛季微调）
    CAP_SEASON_GROWTH: 0.03,    // 每赛季工资帽增长
    LUXURY_LINE: 1.15,          // 奢侈税线 = 工资帽 × 1.15
    TAX_RATE: 0.5,              // 超出部分税率（每超 1 元交 0.5 元）
    REPEATER_TAX: 0.75,         // 连续超税球队的追加税率
    MAX_SALARY_PCT: 0.35,       // 顶薪 = 工资帽 × 35%
    MIDLEVEL_PCT: 0.12,         // 中产特例 = 工资帽 × 12%
    MIN_SALARY_PCT: 0.02,       // 底薪 = 工资帽 × 2%
    RAISE_PER_YEAR: 0.08,       // 续约涨薪幅度（每年）
    RAISE_MAX_YEARS: 5,         // 最长合同年限
    RENEW_DECLINE_CHANCE: 0.15, // 球员拒绝续约的概率
    OVER_CAP_BLOCK_SIGN: true   // 超帽禁止签约（自由市场）
  },

  // 心情：影响比赛命中，每轮向基线回归
  MOOD: { BASE: 70, LOW: 40, HIGH: 75, LOW_PENALTY: 0.015, HIGH_BONUS: 0.010, RECOVER: 2 },

  TEAM_LEVEL: [
    { min: 0, name: '业余球队' },
    { min: 20000, name: '职业球队' },
    { min: 60000, name: '豪门球队' }
  ],

  // ==================== v4 · 联赛直播系统 ====================
  // 文字直播 + 实时数据 + 关键事件回放（不做 3D 动画，成本低效果好）
  LIVE: {
    ENABLED: true,
    QUARTERS: 4,
    QUARTER_SECONDS: 720,      // 每节 12 分钟
    OT_SECONDS: 300,           // 加时 5 分钟
    SPEEDS: [1, 2, 4, 8],      // 快进倍速选项
    AUTO_PLAY_MS: 850,         // 自动播放每步间隔
    // 关键事件类型（"只看关键回合"过滤用）
    KEY_TYPES: ['SCORE3', 'DUNK', 'BLOCK', 'STEAL', 'FOUL', 'SUB', 'TIMEOUT', 'QUARTER', 'OT', 'BUZZER', 'CLUTCH'],
    CLUTCH_WINDOW: 120,        // 最后 2 分钟 = 关键时刻
    CLUTCH_DIFF: 3,            // 分差 ≤3 = 胶着（语气更紧张）
    BLOWOUT_DIFF: 20,          // 分差 ≥20 = 垃圾时间（语气平淡）
    REPLAY_KEEP: 30,           // 保留最近 N 场回放
    HIGHLIGHT_MIN: 5,          // 战报至少摘录的高亮条数
    MAX_EVENTS: 400,           // 单场事件上限（防止爆内存）
    // 解说模板：占位符 {P}=球员 {T}=球队 {Q}=节次 {S}=比分
    TPL: {
      SCORE3: ['{P} 接球就投，三分空心入网！', '{P} 外线发炮，三分命中！', '{T} {P} 弧顶三分，稳稳命中！'],
      SCORE2: ['{P} 突破抛投命中', '{P} 中距离急停跳投打进', '{P} 篮下强攻得手'],
      SCORE1: ['{P} 罚球命中'],
      DUNK: ['{P} 起飞暴扣！全场沸腾！', '{P} 一记势大力沉的灌篮！'],
      MISS: ['{P} 出手偏出', '{P} 投篮不中'],
      REB: ['{P} 摘下防守篮板', '{P} 抢下关键篮板！'],
      OREB: ['{P} 冲抢前场篮板！二次进攻机会'],
      AST: ['{P} 送出妙传'],
      STL: ['{P} 抢断成功！'],
      BLK: ['这球被 {P} 扇飞了！', '{P} 送出一记大火锅！'],
      TO: ['{P} 失误，球权丢失'],
      FOUL: ['{P} 犯规'],
      SUB: ['{T} 换人：{P} 登场'],
      TIMEOUT: ['{T} 请求暂停'],
      QUARTER: ['第 {Q} 节结束'],
      OT: ['双方战平，进入加时赛！'],
      BUZZER: ['压哨出手！']
    },
    // 语气前缀：按分差区间叠加
    TONE: {
      CLUTCH: ['关键时刻！', '决胜时刻，'],
      CLOSE: ['分差咬得很紧，', '胶着之中，'],
      BLOWOUT: ['胜负已无悬念，', '大局已定，'],
      NORMAL: ['']
    },
    // 转播合同：观众越多收入越高
    BROADCAST: {
      local:    { name: '地方直播',  perViewer: 0.6,  base: 3000 },
      national: { name: '全国直播',  perViewer: 1.2,  base: 12000 },
      web:      { name: '网络直播',  perViewer: 0.35, base: 1500 },
      playoff:  { name: '季后赛转播', perViewer: 2.0,  base: 30000 }
    },
    VIEWER_BASE: 800,          // 基础观众
    VIEWER_FAN_K: 0.8,         // 观众 = 基础 + 球迷 × K
    VIEWER_WIN_K: 0.15,        // 胜率加成
    VIEWER_STAR_K: 0.05        // 球星加成
  },

  // ==================== v4 · 赛季目标（老板信任度）====================
  GOALS: {
    ENABLED: true,
    TRUST_START: 70,           // 初始信任度
    TRUST_MIN: 0, TRUST_MAX: 100,
    // 目标类型：每赛季由老板抽取 2 个
    TYPES: [
      { id: 'playoff',  name: '进入季后赛',   reward: { cash: 300000, kings: 10 }, trust: 12 },
      { id: 'semifinal',name: '打进四强',     reward: { cash: 500000, kings: 20 }, trust: 18 },
      { id: 'champion', name: '夺冠',         reward: { cash: 1200000, kings: 40 }, trust: 30 },
      { id: 'rookie',   name: '培养一名新秀（综合 +5）', reward: { cash: 200000, kings: 8 }, trust: 10 },
      { id: 'salary',   name: '工资帽内运营', reward: { cash: 250000, kings: 6 }, trust: 10 },
      { id: 'winrate',  name: '胜率达到 60%', reward: { cash: 350000, kings: 12 }, trust: 14 },
      { id: 'attend',   name: '平均上座率 80%', reward: { cash: 180000, kings: 6 }, trust: 8 }
    ],
    COUNT: 2,                  // 每赛季目标数
    FAIL_TRUST_PENALTY: 1.5,   // 失败扣分倍率（相对 trust 值）
    SACK_TRUST: 20             // 信任度低于此值下课（游戏内警告）
  },

  // ==================== v4 · 成就系统 ====================
  ACHIEVEMENTS: [
    { id: 'first_title',   name: '首次夺冠',     desc: '夺得任意赛事冠军',               reward: { kings: 20, cash: 200000 } },
    { id: 'single50',      name: '单场 50 分',   desc: '己方球员单场得分 ≥ 50',          reward: { kings: 10, cash: 80000 } },
    { id: 'streak10',      name: '10 连胜',      desc: '取得 10 连胜',                   reward: { kings: 15, cash: 150000 } },
    { id: 'roy',           name: '最佳新秀',     desc: '己方新秀获年度最佳新秀',         reward: { kings: 12, cash: 100000 } },
    { id: 'mvp',           name: '常规赛 MVP',   desc: '己方球员获常规赛 MVP',           reward: { kings: 25, cash: 300000 } },
    { id: 'dpoy',          name: '最佳防守球员', desc: '己方球员获最佳防守球员',         reward: { kings: 18, cash: 200000 } },
    { id: 'promote',       name: '升入 1 级',    desc: '从 2 级联赛升入 1 级',           reward: { kings: 10, cash: 120000 } },
    { id: 'triple_double', name: '三双',         desc: '己方球员单场三双',               reward: { kings: 8, cash: 60000 } },
    { id: 'perfect_month', name: '月度全胜',     desc: '单月比赛全胜',                   reward: { kings: 10, cash: 90000 } },
    { id: 'draft_gem',     name: '慧眼识珠',     desc: '选中潜力 ≥ 85 的新秀',           reward: { kings: 15, cash: 150000 } }
  ],

  // ==================== v4 · 每日 / 每周任务 ====================
  DAILY: {
    ENABLED: true,
    REFRESH_ROUNDS: 1,         // 每 N 轮刷新（1=每轮）
    COUNT: 3,                  // 同时存在的任务数
    TASKS: [
      { id: 'watch_live', name: '观看一场直播',   desc: '进入直播页看完一场比赛', reward: { cash: 20000, kings: 2 } },
      { id: 'do_transfer',name: '完成一次转会',   desc: '签下或卖出一名球员',     reward: { cash: 30000, kings: 3 } },
      { id: 'win_game',   name: '赢得一场比赛',   desc: '赢下本轮联赛',           reward: { cash: 25000, kings: 2 } },
      { id: 'join_bet',   name: '参与竞猜',       desc: '在竞猜中下注一次',       reward: { cash: 15000, kings: 1 } },
      { id: 'train',      name: '训练球员',       desc: '完成一次球员训练',       reward: { cash: 18000, kings: 2 } },
      { id: 'scout',      name: '球探报告',       desc: '购买一份球探报告',       reward: { cash: 12000, kings: 1 } },
      { id: 'win_streak3',name: '取得 3 连胜',    desc: '连赢 3 场',              reward: { cash: 40000, kings: 4 } }
    ]
  },

  // ==================== v4 · 选秀系统 ====================
  DRAFT: {
    ENABLED: true,
    ROUNDS: 2,                 // 两轮选秀
    PICK_ORDER_REVERSE: true,  // 战绩差的先选（倒序）
    CLASS_SIZE: 30,            // 每届新秀人数
    ROOKIE_AGE: [19, 22],
    ROOKIE_RANGE: [38, 52],    // 即战力低
    ROOKIE_POTENTIAL: [12, 30],// 潜力高
    WORKOUT_ACCURACY: 0.6,     // 试训揭示潜力准确度
    WORKOUT_COST: 5000,        // 试训费用
    PICK_TRADE_ENABLED: true,  // 选秀权交易
    LOTTERY: true,             // 乐透抽签（非严格倒序，增加随机性）
    LOTTERY_WEIGHT: 0.35       // 乐透权重（0=严格倒序，1=完全随机）
  },

  // ==================== v4 · 季后赛 ====================
  PLAYOFF: {
    ENABLED: true,
    TEAMS: 8,                  // 常规赛前 8 进季后赛
    SERIES_LENGTH: 7,          // 7 场 4 胜
    WIN_NEEDED: 4,
    HAS_FMVP: true,            // 总决赛 MVP
    PRIZE: { champion: 2000000, runner: 800000, semifinal: 300000 },
    KINGS: { champion: 50, runner: 20, semifinal: 10 }
  },

  // ==================== v4 · 全明星周末 ====================
  ALLSTAR: {
    ENABLED: true,
    ROUND: 18,                 // 赛季第 18 轮举办
    VOTE_SLOTS: 10,            // 每队入选人数（全明星名单）
    THREE_CONTEST: { size: 6, prize: 100000 },
    DUNK_CONTEST: { size: 4, prize: 120000 },
    ROOKIE_GAME: { size: 10, prize: 80000 },
    MAIN_GAME: { prize: 300000 },
    MVP_REWARD: { cash: 150000, kings: 15 }
  },

  // ==================== v4 · 媒体 / 球迷 / 随机事件 ====================
  MEDIA: {
    ENABLED: true,
    RATING_START: 60,          // 媒体评分
    FAN_MOOD_START: 60,        // 球迷情绪
    OWNER_START: 70,           // 老板满意度（与 GOALS.TRUST_START 独立）
    LOCKER_START: 70,          // 更衣室氛围
    DECAY: 1.5,                // 每轮向基线回归速度
    // 随机事件（每轮按概率触发一条）
    EVENTS: [
      { id: 'injury',     name: '球员受伤',     w: 0.10, eff: { locker: -3, media: -2 } },
      { id: 'trade_req',  name: '球员要求交易', w: 0.07, eff: { locker: -6, media: -3 } },
      { id: 'locker',     name: '更衣室矛盾',   w: 0.06, eff: { locker: -10, media: -5 } },
      { id: 'fan_protest',name: '球迷抗议',     w: 0.05, eff: { fan: -12, media: -6 } },
      { id: 'sponsor_out',name: '赞助商撤资',   w: 0.04, eff: { owner: -8 } },
      { id: 'new_star',   name: '新星爆发',     w: 0.06, eff: { fan: 8, media: 6 } },
      { id: 'interview',  name: '球员采访',     w: 0.12, eff: { media: 3 } },
      { id: 'rumor',      name: '转会传闻',     w: 0.10, eff: { media: 2, locker: -2 } }
    ],
    EVENT_CHANCE: 0.35,        // 每轮触发随机事件的概率
    RATING_AFFECTS_FANS: 0.3   // 媒体评分对球迷情绪的影响系数
  },

  // ==================== v4 · 排行榜 ====================
  LEADERS: {
    ENABLED: true,
    CATEGORIES: ['pts', 'reb', 'ast', 'stl', 'blk'],
    MVP_WEIGHT: { pts: 1.0, reb: 0.6, ast: 0.8, stl: 0.5, blk: 0.5, win: 2.0 },
    ROY_MIN_GP: 10,            // 最佳新秀最少出场
    WEEK_BEST: true,           // 周最佳
    MONTH_BEST: true,          // 月最佳
    WEEK_GAMES: 2,             // 几轮算一周
    MONTH_GAMES: 8             // 几轮算一月
  }
};

if (typeof module !== 'undefined') { module.exports = CONFIG; }
