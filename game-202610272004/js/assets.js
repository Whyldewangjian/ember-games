// ═══════════════════════════════════════════════════════════════════════════
// 工具函数与贴图生成
// ═══════════════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────────────
// 通用工具
// ───────────────────────────────────────────────────────────────────────────
var U = {
  rnd: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  pick: function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },
  dist: function(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },
  clamp: function(v, min, max) {
    return Math.max(min, Math.min(max, v));
  },
};

// ───────────────────────────────────────────────────────────────────────────
// 像素绘制工具
// ───────────────────────────────────────────────────────────────────────────
var PX = {
  // 矩形
  rect: function(g, x, y, w, h, c) {
    g.fillStyle(c, 1);
    g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  },
  
  // 用矩形拼成的圆
  circle: function(g, cx, cy, r, c) {
    cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
    for (var y = -r; y <= r; y++) {
      var w = Math.floor(Math.sqrt(r * r - y * y));
      if (w > 0) this.rect(g, cx - w, cy + y, w * 2, 1, c);
    }
  },
  
  // 抖动
  dither: function(g, x, y, w, h, c1, c2) {
    for (var dy = 0; dy < h; dy++) {
      for (var dx = 0; dx < w; dx++) {
        if ((dx + dy) % 2 === 0) this.rect(g, x + dx, y + dy, 1, 1, c1);
        else this.rect(g, x + dx, y + dy, 1, 1, c2);
      }
    }
  },
  
  // 六边形（尖顶朝上）
  hexagon: function(g, cx, cy, size, c) {
    cx = Math.round(cx); cy = Math.round(cy); size = Math.round(size);
    var h = Math.floor(size * 0.866); // sqrt(3)/2
    // 从上到下绘制横线
    for (var y = -h; y <= h; y++) {
      var row = Math.abs(y);
      var width = size - Math.floor(row * 0.577); // 1/sqrt(3)
      if (width > 0) {
        this.rect(g, cx - width, cy + y, width * 2, 1, c);
      }
    }
  },
  
  // 六边形边框
  hexBorder: function(g, cx, cy, size, c, thickness) {
    cx = Math.round(cx); cy = Math.round(cy); size = Math.round(size);
    var h = Math.floor(size * 0.866);
    thickness = thickness || 1;
    
    // 绘制6条边
    var points = this.hexPoints(cx, cy, size);
    for (var i = 0; i < 6; i++) {
      var p1 = points[i];
      var p2 = points[(i + 1) % 6];
      this.line(g, p1.x, p1.y, p2.x, p2.y, c, thickness);
    }
  },
  
  // 获取六边形6个顶点
  hexPoints: function(cx, cy, size) {
    var points = [];
    for (var i = 0; i < 6; i++) {
      var angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
      points.push({
        x: Math.round(cx + size * Math.cos(angle)),
        y: Math.round(cy + size * Math.sin(angle))
      });
    }
    return points;
  },
  
  // 线段
  line: function(g, x1, y1, x2, y2, c, thickness) {
    x1 = Math.round(x1); y1 = Math.round(y1);
    x2 = Math.round(x2); y2 = Math.round(y2);
    thickness = thickness || 1;
    
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var sx = x1 < x2 ? 1 : -1;
    var sy = y1 < y2 ? 1 : -1;
    var err = dx - dy;
    
    while (true) {
      this.rect(g, x1 - Math.floor(thickness/2), y1 - Math.floor(thickness/2), thickness, thickness, c);
      if (x1 === x2 && y1 === y2) break;
      var e2 = err * 2;
      if (e2 > -dy) { err -= dy; x1 += sx; }
      if (e2 < dx) { err += dx; y1 += sy; }
    }
  },
};

// ───────────────────────────────────────────────────────────────────────────
// 六边形网格计算
// ───────────────────────────────────────────────────────────────────────────
var HEX = {
  // 将六边形网格坐标转为屏幕坐标
  toScreen: function(row, col) {
    var size = CFG.HEX_SIZE;
    var x = col * size * 1.5 + size * 2;
    var y = row * size * 1.732 + (col % 2) * size * 0.866 + size * 2;
    return {x: Math.round(x), y: Math.round(y)};
  },
  
  // 屏幕坐标转六边形网格坐标（近似）
  fromScreen: function(x, y) {
    var size = CFG.HEX_SIZE;
    var col = Math.round((x - size * 2) / (size * 1.5));
    var row = Math.round((y - size * 2 - (col % 2) * size * 0.866) / (size * 1.732));
    return {r: row, c: col};
  },
  
  // 获取相邻的六边形（6个方向）
  neighbors: function(row, col) {
    var even = col % 2 === 0;
    return [
      {r: row - 1, c: col},     // 上
      {r: row + 1, c: col},     // 下
      {r: even ? row - 1 : row, c: col - 1}, // 左上
      {r: even ? row : row + 1, c: col - 1}, // 左下
      {r: even ? row - 1 : row, c: col + 1}, // 右上
      {r: even ? row : row + 1, c: col + 1}, // 右下
    ];
  },
  
  // 检查坐标是否在范围内
  inBounds: function(row, col) {
    return row >= 0 && row < CFG.HEX_ROWS && col >= 0 && col < CFG.HEX_COLS;
  },
};

// ───────────────────────────────────────────────────────────────────────────
// 贴图生成
// ───────────────────────────────────────────────────────────────────────────
function generateTextures(scene) {
  var g;
  
  // 透明贴图
  if (!scene.textures.exists('blank')) {
    g = scene.make.graphics({add: false});
    g.fillStyle(0xffffff, 0);
    g.fillRect(0, 0, 2, 2);
    g.generateTexture('blank', 2, 2);
    g.destroy();
  }
  
  // ─────────── 防御塔贴图 ───────────
  var towerTypes = ['laser', 'plasma', 'missile', 'pulse', 'railgun'];
  towerTypes.forEach(function(type) {
    var data = TOWERS[type];
    
    // 各级塔
    for (var lv = 0; lv < 3; lv++) {
      var key = 'tower_' + type + '_' + (lv + 1);
      g = scene.make.graphics({add: false});
      drawTower(g, type, lv, data.color[lv]);
      g.generateTexture(key, 48, 48);
      g.destroy();
    }
    
    // 合成塔
    var mergeKey = 'tower_' + type + '_merged';
    g = scene.make.graphics({add: false});
    drawTowerMerged(g, type, data.color[2]);
    g.generateTexture(mergeKey, 60, 60);
    g.destroy();
  });
  
  // ─────────── 敌人贴图 ───────────
  Object.keys(ENEMIES).forEach(function(type) {
    var data = ENEMIES[type];
    g = scene.make.graphics({add: false});
    drawEnemy(g, type, data.color, data.size);
    g.generateTexture('enemy_' + type, data.size * 2 + 4, data.size * 2 + 4);
    g.destroy();
  });
  
  // ─────────── 子弹贴图 ───────────
  // 激光
  g = scene.make.graphics({add: false});
  PX.rect(g, 0, 2, 8, 2, ART.cyan4);
  PX.rect(g, 1, 1, 6, 4, ART.cyan3);
  g.generateTexture('bullet_laser', 8, 6);
  g.destroy();
  
  // 等离子
  g = scene.make.graphics({add: false});
  PX.circle(g, 6, 6, 5, ART.purple2);
  PX.circle(g, 6, 6, 3, ART.purple3);
  PX.circle(g, 6, 6, 1, ART.purple4);
  g.generateTexture('bullet_plasma', 12, 12);
  g.destroy();
  
  // 导弹
  g = scene.make.graphics({add: false});
  PX.rect(g, 0, 3, 10, 3, ART.orange2);
  PX.rect(g, 8, 2, 2, 5, ART.orange3);
  PX.rect(g, 1, 4, 2, 1, ART.orange4);
  g.generateTexture('bullet_missile', 10, 9);
  g.destroy();
  
  // 脉冲
  g = scene.make.graphics({add: false});
  PX.circle(g, 5, 5, 4, ART.blue3);
  PX.circle(g, 5, 5, 2, ART.blue4);
  g.generateTexture('bullet_pulse', 10, 10);
  g.destroy();
  
  // 轨道炮
  g = scene.make.graphics({add: false});
  PX.rect(g, 0, 1, 14, 2, ART.green3);
  PX.rect(g, 0, 0, 12, 4, ART.green2);
  PX.rect(g, 12, 1, 2, 2, ART.green4);
  g.generateTexture('bullet_railgun', 14, 4);
  g.destroy();
  
  // ─────────── 水晶贴图 ───────────
  for (var clv = 1; clv <= 5; clv++) {
    g = scene.make.graphics({add: false});
    drawCrystal(g, clv);
    g.generateTexture('crystal_' + clv, 48, 60);
    g.destroy();
  }
  
  // ─────────── UI元素 ───────────
  // 建造按钮
  towerTypes.forEach(function(type) {
    g = scene.make.graphics({add: false});
    PX.rect(g, 0, 0, 50, 50, ART.ui_bg);
    PX.rect(g, 1, 1, 48, 48, ART.ui_border);
    drawTowerIcon(g, type, TOWERS[type].color[0]);
    g.generateTexture('btn_' + type, 50, 50);
    g.destroy();
  });
}

// ─────────── 绘制防御塔（1-3级）───────────
function drawTower(g, type, level, color) {
  var cx = 24, cy = 24;
  var baseSize = 8 + level * 2;
  var barrelLen = 10 + level * 3;
  
  // 底座
  PX.circle(g, cx, cy + 2, baseSize, ART.cliff1);
  PX.circle(g, cx, cy, baseSize, ART.cliff2);
  PX.circle(g, cx, cy - 1, baseSize - 1, ART.cliff3);
  
  // 主体（不同类型不同形状）
  if (type === 'laser') {
    // 激光塔 - 细长炮管
    PX.rect(g, cx - 2, cy - barrelLen, 4, barrelLen, color);
    PX.rect(g, cx - 1, cy - barrelLen - 2, 2, 2, ART.cyan4);
  } else if (type === 'plasma') {
    // 等离子炮 - 球形
    PX.circle(g, cx, cy - 5, 6 + level, color);
    PX.circle(g, cx, cy - 6, 4 + level, ART.purple3);
  } else if (type === 'missile') {
    // 导弹塔 - 多管
    for (var i = -1; i <= 1; i++) {
      PX.rect(g, cx + i * 5 - 1, cy - barrelLen, 2, barrelLen, color);
    }
  } else if (type === 'pulse') {
    // 脉冲塔 - 圆盘
    PX.rect(g, cx - 8, cy - 3, 16, 6, color);
    PX.circle(g, cx, cy, 5, ART.blue4);
  } else if (type === 'railgun') {
    // 轨道炮 - 粗炮管
    PX.rect(g, cx - 3, cy - barrelLen, 6, barrelLen, color);
    PX.rect(g, cx - 1, cy - barrelLen, 2, barrelLen, ART.green4);
  }
  
  // 等级标识
  for (var i = 0; i <= level; i++) {
    PX.rect(g, cx - 6 + i * 4, cy + 6, 2, 2, ART.ui_gold);
  }
}

// ─────────── 绘制合成塔 ───────────
function drawTowerMerged(g, type, color) {
  var cx = 30, cy = 30;
  
  // 更大的底座
  PX.circle(g, cx, cy + 3, 14, ART.cliff1);
  PX.circle(g, cx, cy, 14, ART.cliff2);
  PX.circle(g, cx, cy - 1, 12, ART.cliff3);
  
  // 能量环
  for (var r = 8; r <= 12; r += 2) {
    for (var a = 0; a < 360; a += 30) {
      var rad = a * Math.PI / 180;
      var px = cx + Math.cos(rad) * r;
      var py = cy + Math.sin(rad) * r;
      PX.rect(g, px, py, 2, 2, color);
    }
  }
  
  // 超级主体
  if (type === 'laser') {
    PX.rect(g, cx - 3, cy - 20, 6, 20, color);
    PX.circle(g, cx, cy - 20, 4, ART.cyan4);
  } else if (type === 'plasma') {
    PX.circle(g, cx, cy - 8, 10, color);
    PX.circle(g, cx, cy - 9, 6, ART.purple4);
  } else if (type === 'missile') {
    for (var i = -2; i <= 2; i++) {
      PX.rect(g, cx + i * 4 - 1, cy - 18, 2, 18, color);
    }
  } else if (type === 'pulse') {
    PX.rect(g, cx - 12, cy - 5, 24, 10, color);
    PX.circle(g, cx, cy, 7, ART.blue4);
  } else if (type === 'railgun') {
    PX.rect(g, cx - 4, cy - 22, 8, 22, color);
    PX.rect(g, cx - 2, cy - 22, 4, 22, ART.green4);
  }
  
  // 合成标识（星星）
  var star = [{x:0,y:-3},{x:1,y:-1},{x:3,y:0},{x:1,y:1},{x:0,y:3},{x:-1,y:1},{x:-3,y:0},{x:-1,y:-1}];
  star.forEach(function(p) {
    PX.rect(g, cx + p.x, cy + 10 + p.y, 1, 1, ART.ui_gold);
  });
}

// ─────────── 绘制塔图标（简化版）───────────
function drawTowerIcon(g, type, color) {
  var cx = 25, cy = 25;
  if (type === 'laser') {
    PX.rect(g, cx - 2, cy - 8, 4, 12, color);
  } else if (type === 'plasma') {
    PX.circle(g, cx, cy, 8, color);
  } else if (type === 'missile') {
    PX.rect(g, cx - 1, cy - 10, 2, 15, color);
    PX.rect(g, cx - 5, cy - 8, 2, 12, color);
    PX.rect(g, cx + 3, cy - 8, 2, 12, color);
  } else if (type === 'pulse') {
    PX.rect(g, cx - 10, cy - 2, 20, 4, color);
  } else if (type === 'railgun') {
    PX.rect(g, cx - 3, cy - 10, 6, 15, color);
  }
}

// ─────────── 绘制敌人 ───────────
function drawEnemy(g, type, color, size) {
  var cx = size + 2, cy = size + 2;
  
  if (type === 'scout') {
    // 侦察机器人 - 小圆球
    PX.circle(g, cx, cy, size, color);
    PX.circle(g, cx - 2, cy - 2, 2, ART.red3);
  } else if (type === 'soldier') {
    // 战斗机器人 - 方形
    PX.rect(g, cx - size, cy - size, size * 2, size * 2, color);
    PX.rect(g, cx - 3, cy - 3, 6, 6, ART.red3);
  } else if (type === 'tank') {
    // 重型坦克 - 大方块
    PX.rect(g, cx - size, cy - size + 3, size * 2, size * 2 - 3, color);
    PX.rect(g, cx - size + 3, cy - size, size * 2 - 6, size * 2, color);
    PX.rect(g, cx - 2, cy - 2, 4, 4, ART.red4);
  } else if (type === 'flyer') {
    // 飞行无人机 - 菱形
    var points = [{x:0,y:-size},{x:size,y:0},{x:0,y:size},{x:-size,y:0}];
    for (var i = 0; i < 4; i++) {
      var p1 = points[i], p2 = points[(i+1)%4];
      PX.line(g, cx + p1.x, cy + p1.y, cx + p2.x, cy + p2.y, color, 3);
    }
  } else if (type === 'elite') {
    // 精英战士 - 八边形
    for (var a = 0; a < 8; a++) {
      var angle = a * Math.PI / 4;
      var x = cx + Math.cos(angle) * size;
      var y = cy + Math.sin(angle) * size;
      PX.circle(g, x, y, 3, color);
    }
    PX.circle(g, cx, cy, size - 3, color);
  } else if (type === 'boss') {
    // Boss - 大圆+尖刺
    PX.circle(g, cx, cy, size, color);
    PX.circle(g, cx, cy, size - 3, ART.red2);
    for (var b = 0; b < 8; b++) {
      var bAngle = b * Math.PI / 4;
      var bx = cx + Math.cos(bAngle) * size;
      var by = cy + Math.sin(bAngle) * size;
      var bx2 = cx + Math.cos(bAngle) * (size + 5);
      var by2 = cy + Math.sin(bAngle) * (size + 5);
      PX.line(g, bx, by, bx2, by2, ART.red4, 2);
    }
  }
}

// ─────────── 绘制水晶 ───────────
function drawCrystal(g, level) {
  var cx = 24, cy = 40;
  var h = 30 + level * 3;
  
  // 底座
  PX.rect(g, cx - 8, cy, 16, 8, ART.cliff2);
  
  // 水晶主体（菱形）
  var top = cy - h;
  var mid1 = cy - h * 0.6;
  var mid2 = cy - h * 0.3;
  
  // 暗部
  for (var y = top; y < cy; y++) {
    var ratio = (y - top) / h;
    var w = Math.floor(8 * (ratio < 0.5 ? ratio * 2 : (1 - ratio) * 2));
    PX.rect(g, cx - w, y, w, 1, ART.purple1);
  }
  
  // 亮部
  for (var y2 = top; y2 < cy; y2++) {
    var ratio2 = (y2 - top) / h;
    var w2 = Math.floor(7 * (ratio2 < 0.5 ? ratio2 * 2 : (1 - ratio2) * 2));
    PX.rect(g, cx, y2, w2, 1, ART.purple2);
  }
  
  // 高光
  PX.rect(g, cx - 2, top + 5, 4, 10, ART.purple3);
  PX.rect(g, cx - 1, top + 2, 2, 3, ART.purple4);
  
  // 等级标识
  for (var lv = 0; lv < level; lv++) {
    PX.rect(g, cx - 10 + lv * 4, cy + 10, 3, 3, ART.ui_gold);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// 音效合成
// ───────────────────────────────────────────────────────────────────────────
var SFX = {
  ctx: null,
  
  init: function() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },
  
  play: function(type) {
    if (!this.ctx) return;
    var ctx = this.ctx;
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'shoot') {
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'hit') {
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'build') {
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'upgrade') {
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'merge') {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'win') {
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'lose') {
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  },
  
  // 背景音乐（轻松科幻）
  playMusic: function(scene) {
    if (!this.ctx) return;
    var ctx = this.ctx;
    
    var playNote = function(freq, time, duration) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.03, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
      osc.start(time);
      osc.stop(time + duration);
    };
    
    // 简单的循环旋律
    var notes = [523, 587, 659, 523, 659, 587, 523, 494]; // C5 D5 E5 C5 E5 D5 C5 B4
    var interval = 0.4;
    var startTime = ctx.currentTime;
    
    for (var i = 0; i < notes.length; i++) {
      playNote(notes[i], startTime + i * interval, interval * 0.8);
    }
    
    // 递归播放
    scene.time.delayedCall(notes.length * interval * 1000, function() {
      SFX.playMusic(scene);
    });
  },
};
