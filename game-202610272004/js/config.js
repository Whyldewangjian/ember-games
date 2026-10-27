// ═══════════════════════════════════════════════════════════════════════════
// 六边形塔防 - 配置与数据表
// ═══════════════════════════════════════════════════════════════════════════

var CFG = {
  // 游戏基础配置
  WIDTH: 960,
  HEIGHT: 540,
  
  // 六边形网格配置
  HEX_SIZE: 28,              // 六边形半径
  HEX_ROWS: 11,              // 行数
  HEX_COLS: 20,              // 列数
  
  // 游戏平衡
  START_MONEY: 300,          // 初始金币
  START_CRYSTAL_HP: 100,     // 水晶初始血量
  CRYSTAL_UPGRADE_COST: 150, // 水晶升级费用
  CRYSTAL_HP_PER_LEVEL: 50,  // 每级增加血量
  
  // 波次配置
  WAVE_DELAY: 3000,          // 波次间隔(ms)
  ENEMY_SPAWN_INTERVAL: 800, // 敌人生成间隔(ms)
  
  // 塔防配置
  MERGE_BONUS: 1.8,          // 合成后的伤害倍率
};

// ═══════════════════════════════════════════════════════════════════════════
// 调色板 - 科幻像素风
// ═══════════════════════════════════════════════════════════════════════════
var ART = {
  // 天空与背景
  sky1: 0x0a0e1f,      // 深空蓝
  sky2: 0x1a1f3a,      // 中空蓝
  sky3: 0x2d3561,      // 浅空蓝
  
  // 山崖地形
  cliff1: 0x3d4466,    // 山崖暗部
  cliff2: 0x545d7a,    // 山崖中调
  cliff3: 0x6d7a9c,    // 山崖亮部
  cliff4: 0x8899bb,    // 山崖高光
  
  // 山谷地面
  valley1: 0x2a3142,   // 谷底暗
  valley2: 0x3f4a5e,   // 谷底中
  valley3: 0x546278,   // 谷底亮
  
  // 科幻元素
  cyan1: 0x0d7377,     // 青色暗
  cyan2: 0x14a1a8,     // 青色中
  cyan3: 0x3dcfd4,     // 青色亮
  cyan4: 0x7ffff5,     // 青色高光
  
  purple1: 0x6a3a7c,   // 紫色暗
  purple2: 0x9d5bb5,   // 紫色中
  purple3: 0xc98dd9,   // 紫色亮
  purple4: 0xeebfff,   // 紫色高光
  
  orange1: 0xb85c33,   // 橙色暗
  orange2: 0xe87d3e,   // 橙色中
  orange3: 0xffa45e,   // 橙色亮
  orange4: 0xffd493,   // 橙色高光
  
  green1: 0x2d7a3f,    // 绿色暗
  green2: 0x3ea855,    // 绿色中
  green3: 0x68d978,    // 绿色亮
  green4: 0xa0ffad,    // 绿色高光
  
  blue1: 0x2c4e8c,     // 蓝色暗
  blue2: 0x3e73c4,     // 蓝色中
  blue3: 0x5b9bf5,     // 蓝色亮
  blue4: 0x9ac7ff,     // 蓝色高光
  
  red1: 0x9c2e3d,      // 红色暗
  red2: 0xd4475b,      // 红色中
  red3: 0xff6b7a,      // 红色亮
  red4: 0xffa5ad,      // 红色高光
  
  // UI
  ui_bg: 0x1a1f2e,     // UI背景
  ui_border: 0x3d4466, // UI边框
  ui_text: 0xe0e6f0,   // UI文字
  ui_gold: 0xffc850,   // 金币色
  
  // 敌人
  enemy_weak: 0x7a5c42,   // 弱敌
  enemy_normal: 0xb87333, // 普通敌
  enemy_strong: 0xe89050, // 强敌
  enemy_boss: 0xff5050,   // Boss
};

// ═══════════════════════════════════════════════════════════════════════════
// 地图数据 - 六边形网格布局
// ═══════════════════════════════════════════════════════════════════════════
// 0=可建造山崖 1=山谷路径 2=入口 3=出口(水晶)
var MAP = {
  // 生成地图布局
  layout: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,1,1,0,0,0,0,1,1,1,1,0,0,0,0],
    [0,0,1,1,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0],
    [0,2,1,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0],
    [0,0,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0],
    [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3],
    [0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0],
    [0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  
  // 寻路路径(手动定义关键点)
  path: [
    {r:4,c:1}, {r:3,c:2}, {r:3,c:3}, {r:2,c:4}, {r:1,c:5}, {r:1,c:6},
    {r:2,c:7}, {r:3,c:8}, {r:4,c:8}, {r:5,c:8}, {r:4,c:9}, {r:4,c:10},
    {r:3,c:11}, {r:2,c:12}, {r:2,c:13}, {r:3,c:15}, {r:4,c:16}, {r:5,c:17},
    {r:6,c:18}, {r:6,c:19}
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// 防御塔数据表
// ═══════════════════════════════════════════════════════════════════════════
var TOWERS = {
  // 激光塔 - 高射速低伤害
  laser: {
    name: '激光塔',
    cost: [80, 120, 180],        // 建造+升级费用
    damage: [8, 15, 25],          // 各级伤害
    range: [120, 140, 160],       // 攻击范围
    fireRate: [400, 350, 300],    // 射速(ms)
    color: [ART.cyan2, ART.cyan3, ART.cyan4],
    projectile: 'laser',          // 子弹类型
    mergeName: '超导激光炮',
    mergeDamage: 60,
  },
  
  // 等离子炮 - 范围伤害
  plasma: {
    name: '等离子炮',
    cost: [100, 150, 220],
    damage: [15, 28, 45],
    range: [100, 115, 130],
    fireRate: [800, 700, 600],
    color: [ART.purple2, ART.purple3, ART.purple4],
    projectile: 'plasma',
    splash: [30, 40, 50],         // 溅射范围
    mergeName: '重离子聚变炮',
    mergeDamage: 95,
  },
  
  // 导弹塔 - 高伤害低射速
  missile: {
    name: '导弹塔',
    cost: [120, 180, 260],
    damage: [30, 55, 90],
    range: [150, 170, 190],
    fireRate: [1200, 1000, 850],
    color: [ART.orange2, ART.orange3, ART.orange4],
    projectile: 'missile',
    mergeName: '战略导弹阵列',
    mergeDamage: 180,
  },
  
  // 脉冲塔 - 减速效果
  pulse: {
    name: '脉冲塔',
    cost: [90, 135, 200],
    damage: [5, 10, 18],
    range: [110, 125, 145],
    fireRate: [600, 500, 400],
    color: [ART.blue2, ART.blue3, ART.blue4],
    projectile: 'pulse',
    slow: [0.3, 0.4, 0.5],        // 减速比例
    mergeName: '时空脉冲塔',
    mergeDamage: 40,
  },
  
  // 轨道炮 - 穿透攻击
  railgun: {
    name: '轨道炮',
    cost: [110, 165, 240],
    damage: [20, 38, 65],
    range: [180, 200, 220],
    fireRate: [1000, 850, 700],
    color: [ART.green2, ART.green3, ART.green4],
    projectile: 'railgun',
    pierce: [2, 3, 4],            // 穿透数量
    mergeName: '超电磁炮',
    mergeDamage: 140,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 敌人数据表
// ═══════════════════════════════════════════════════════════════════════════
var ENEMIES = {
  scout: {
    name: '侦察机器人',
    hp: 40,
    speed: 50,
    reward: 10,
    color: ART.enemy_weak,
    size: 10,
  },
  
  soldier: {
    name: '战斗机器人',
    hp: 80,
    speed: 40,
    reward: 15,
    color: ART.enemy_normal,
    size: 12,
  },
  
  tank: {
    name: '重型坦克',
    hp: 200,
    speed: 25,
    reward: 30,
    color: ART.enemy_strong,
    size: 16,
  },
  
  flyer: {
    name: '飞行无人机',
    hp: 60,
    speed: 65,
    reward: 20,
    color: ART.cyan2,
    size: 11,
  },
  
  elite: {
    name: '精英战士',
    hp: 350,
    speed: 35,
    reward: 50,
    color: ART.purple2,
    size: 14,
  },
  
  boss: {
    name: '终极毁灭者',
    hp: 800,
    speed: 20,
    reward: 100,
    color: ART.enemy_boss,
    size: 20,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 波次配置
// ═══════════════════════════════════════════════════════════════════════════
var WAVES = [
  // 前期 - 只有侦察兵
  {enemies: ['scout','scout','scout','scout','scout']},
  {enemies: ['scout','scout','soldier','scout','scout']},
  {enemies: ['scout','soldier','soldier','scout','soldier']},
  
  // 中期 - 加入坦克和飞行器
  {enemies: ['soldier','soldier','tank','soldier','soldier']},
  {enemies: ['scout','flyer','flyer','soldier','tank']},
  {enemies: ['soldier','tank','soldier','flyer','tank']},
  
  // 后期 - 精英单位
  {enemies: ['tank','elite','tank','flyer','soldier','soldier']},
  {enemies: ['elite','flyer','elite','tank','flyer']},
  {enemies: ['tank','tank','elite','elite','tank']},
  
  // Boss波
  {enemies: ['boss','elite','elite','tank','tank','soldier','soldier']},
];
