// ═══════════════════════════════════════════════════════════════════════════
// 六边形塔防 - 场景定义
// ═══════════════════════════════════════════════════════════════════════════

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 开始场景
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
var StartScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function() {
    Phaser.Scene.call(this, {key: 'StartScene'});
  },
  
  preload: function() {
    // 生成所有贴图
    generateTextures(this);
  },
  
  create: function() {
    // 背景渐变
    var bg = this.add.graphics();
    bg.fillGradientStyle(ART.sky1, ART.sky1, ART.sky2, ART.sky2, 1);
    bg.fillRect(0, 0, CFG.WIDTH, CFG.HEIGHT);
    
    // 标题
    this.add.text(CFG.WIDTH / 2, 120, '未来山谷防线', {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    this.add.text(CFG.WIDTH / 2, 180, 'HEXAGON TOWER DEFENSE', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#3dcfd4'
    }).setOrigin(0.5);
    
    // 游戏说明
    var instructions = [
      '★ 在六边形山崖上建造防御塔',
      '★ 阻止敌人摧毁水晶',
      '★ 相同类型3个3级塔可合成超级塔',
      '★ 消灭所有波次获得胜利'
    ];
    
    for (var i = 0; i < instructions.length; i++) {
      this.add.text(CFG.WIDTH / 2, 250 + i * 35, instructions[i], {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#e0e6f0'
      }).setOrigin(0.5);
    }
    
    // 开始按钮
    var startBtn = this.add.text(CFG.WIDTH / 2, 420, '[ 开始游戏 ]', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#ffc850',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive();
    
    startBtn.on('pointerover', function() {
      this.setScale(1.1);
    });
    
    startBtn.on('pointerout', function() {
      this.setScale(1);
    });
    
    startBtn.on('pointerdown', function() {
      SFX.init();
      SFX.play('build');
      this.scene.scene.start('GameScene');
    });
    
    // 版权信息
    this.add.text(CFG.WIDTH / 2, CFG.HEIGHT - 30, '科幻像素塔防 v1.0', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#6d7a9c'
    }).setOrigin(0.5);
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 游戏主场景
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
var GameScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function() {
    Phaser.Scene.call(this, {key: 'GameScene'});
  },
  
  create: function() {
    // 游戏状态
    this.money = CFG.START_MONEY;
    this.crystalHP = CFG.START_CRYSTAL_HP;
    this.crystalMaxHP = CFG.START_CRYSTAL_HP;
    this.crystalLevel = 1;
    this.wave = 0;
    this.enemiesLeft = 0;
    this.isWaveActive = false;
    this.selectedTowerType = null;
    
    // 对象池
    this.towers = [];
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    
    // 网格占用状态 {r_c: tower}
    this.grid = {};
    
    // 渲染层
    this.createLayers();
    
    // 绘制地图
    this.drawMap();
    
    // 创建水晶
    this.createCrystal();
    
    // UI
    this.createUI();
    
    // 开始音乐
    SFX.playMusic(this);
    
    // 更新循环
    this.updateTimer = this.time.addEvent({
      delay: 50,
      callback: this.gameUpdate,
      callbackScope: this,
      loop: true
    });
  },
  
  createLayers: function() {
    // 背景渐变
    var bg = this.add.graphics();
    bg.fillGradientStyle(ART.sky1, ART.sky1, ART.sky2, ART.sky2, 1);
    bg.fillRect(0, 0, CFG.WIDTH, CFG.HEIGHT);
    
    // 图层顺序
    this.layerGround = this.add.container();
    this.layerPath = this.add.container();
    this.layerTowers = this.add.container();
    this.layerEnemies = this.add.container();
    this.layerBullets = this.add.container();
    this.layerParticles = this.add.container();
    this.layerUI = this.add.container();
  },
  
  drawMap: function() {
    var g = this.make.graphics({add: false});
    
    // 绘制所有六边形
    for (var r = 0; r < CFG.HEX_ROWS; r++) {
      for (var c = 0; c < CFG.HEX_COLS; c++) {
        var pos = HEX.toScreen(r, c);
        var tile = MAP.layout[r][c];
        
        if (tile === 1) {
          // 山谷路径
          PX.hexagon(g, pos.x, pos.y, CFG.HEX_SIZE, ART.valley2);
          PX.hexBorder(g, pos.x, pos.y, CFG.HEX_SIZE, ART.valley1, 2);
        } else if (tile === 2) {
          // 入口
          PX.hexagon(g, pos.x, pos.y, CFG.HEX_SIZE, ART.valley3);
          PX.hexBorder(g, pos.x, pos.y, CFG.HEX_SIZE, ART.green3, 2);
        } else if (tile === 3) {
          // 出口（水晶位置）
          PX.hexagon(g, pos.x, pos.y, CFG.HEX_SIZE, ART.valley3);
          PX.hexBorder(g, pos.x, pos.y, CFG.HEX_SIZE, ART.purple3, 3);
        } else {
          // 可建造的山崖
          PX.hexagon(g, pos.x, pos.y, CFG.HEX_SIZE, ART.cliff2);
          PX.hexBorder(g, pos.x, pos.y, CFG.HEX_SIZE, ART.cliff1, 1);
        }
      }
    }
    
    g.generateTexture('map', CFG.WIDTH, CFG.HEIGHT);
    g.destroy();
    
    var mapSprite = this.add.image(0, 0, 'map').setOrigin(0);
    this.layerGround.add(mapSprite);
    
    // 路径指示
    for (var i = 0; i < MAP.path.length - 1; i++) {
      var p1 = HEX.toScreen(MAP.path[i].r, MAP.path[i].c);
      var p2 = HEX.toScreen(MAP.path[i + 1].r, MAP.path[i + 1].c);
      var arrow = this.add.graphics();
      arrow.lineStyle(3, ART.orange2, 0.5);
      arrow.beginPath();
      arrow.moveTo(p1.x, p1.y);
      arrow.lineTo(p2.x, p2.y);
      arrow.strokePath();
      this.layerPath.add(arrow);
    }
  },
  
  createCrystal: function() {
    var crystalPos = MAP.path[MAP.path.length - 1];
    var pos = HEX.toScreen(crystalPos.r, crystalPos.c);
    
    this.crystal = this.add.sprite(pos.x, pos.y, 'crystal_1');
    this.layerTowers.add(this.crystal);
    
    // 水晶光晕动画
    this.tweens.add({
      targets: this.crystal,
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  },
  
  createUI: function() {
    var ui = this.layerUI;
    
    // 顶部信息栏
    var infoPanel = this.add.graphics();
    infoPanel.fillStyle(ART.ui_bg, 0.9);
    infoPanel.fillRect(10, 10, CFG.WIDTH - 20, 60);
    infoPanel.lineStyle(2, ART.ui_border);
    infoPanel.strokeRect(10, 10, CFG.WIDTH - 20, 60);
    ui.add(infoPanel);
    
    // 金币
    this.moneyText = this.add.text(30, 30, '金币: ' + this.money, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffc850'
    });
    ui.add(this.moneyText);
    
    // 波次
    this.waveText = this.add.text(200, 30, '波次: 0/' + WAVES.length, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#3dcfd4'
    });
    ui.add(this.waveText);
    
    // 水晶血量
    this.crystalText = this.add.text(400, 30, '水晶: ' + this.crystalHP + '/' + this.crystalMaxHP, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#c98dd9'
    });
    ui.add(this.crystalText);
    
    // 开始波次按钮
    this.startWaveBtn = this.add.text(CFG.WIDTH - 150, 30, '[ 开始波次 ]', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#68d978',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setInteractive();
    
    this.startWaveBtn.on('pointerover', function() {
      this.setScale(1.05);
    });
    
    this.startWaveBtn.on('pointerout', function() {
      this.setScale(1);
    });
    
    this.startWaveBtn.on('pointerdown', function() {
      if (!this.scene.isWaveActive && this.scene.wave < WAVES.length) {
        this.scene.startWave();
      }
    });
    ui.add(this.startWaveBtn);
    
    // 建造面板
    this.createBuildPanel();
    
    // 升级水晶按钮
    this.createCrystalUpgradeBtn();
  },
  
  createBuildPanel: function() {
    var panel = this.add.graphics();
    panel.fillStyle(ART.ui_bg, 0.9);
    panel.fillRect(10, 80, 280, 80);
    panel.lineStyle(2, ART.ui_border);
    panel.strokeRect(10, 80, 280, 80);
    this.layerUI.add(panel);
    
    var towerTypes = ['laser', 'plasma', 'missile', 'pulse', 'railgun'];
    this.buildBtns = [];
    
    for (var i = 0; i < towerTypes.length; i++) {
      var type = towerTypes[i];
      var data = TOWERS[type];
      var x = 30 + i * 52;
      var y = 100;
      
      // 按钮
      var btn = this.add.sprite(x, y, 'btn_' + type).setInteractive();
      btn.towerType = type;
      this.layerUI.add(btn);
      this.buildBtns.push(btn);
      
      // 费用
      var costText = this.add.text(x, y + 30, data.cost[0], {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#ffc850'
      }).setOrigin(0.5);
      this.layerUI.add(costText);
      
      // 点击事件
      btn.on('pointerdown', function() {
        var t = this.towerType;
        if (this.scene.money >= TOWERS[t].cost[0]) {
          this.scene.selectedTowerType = t;
          this.scene.updateBuildBtnsState();
          SFX.play('build');
        }
      });
      
      btn.on('pointerover', function() {
        this.setTint(0xaaffaa);
      });
      
      btn.on('pointerout', function() {
        this.clearTint();
      });
    }
  },
  
  createCrystalUpgradeBtn: function() {
    this.upgradeBtn = this.add.text(CFG.WIDTH - 180, 100, '升级水晶\n[' + CFG.CRYSTAL_UPGRADE_COST + ' 金币]', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#c98dd9',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setInteractive();
    
    this.upgradeBtn.on('pointerover', function() {
      this.setScale(1.05);
    });
    
    this.upgradeBtn.on('pointerout', function() {
      this.setScale(1);
    });
    
    this.upgradeBtn.on('pointerdown', function() {
      this.scene.upgradeCrystal();
    });
    
    this.layerUI.add(this.upgradeBtn);
  },
  
  updateBuildBtnsState: function() {
    for (var i = 0; i < this.buildBtns.length; i++) {
      var btn = this.buildBtns[i];
      if (this.selectedTowerType === btn.towerType) {
        btn.setTint(0x00ff00);
      } else {
        btn.clearTint();
      }
    }
  },
  
  startWave: function() {
    if (this.wave >= WAVES.length) return;
    
    this.isWaveActive = true;
    var waveData = WAVES[this.wave];
    this.enemiesLeft = waveData.enemies.length;
    this.wave++;
    
    this.waveText.setText('波次: ' + this.wave + '/' + WAVES.length);
    this.startWaveBtn.setVisible(false);
    
    SFX.play('upgrade');
    
    // 生成敌人
    var self = this;
    var index = 0;
    
    var spawnTimer = this.time.addEvent({
      delay: CFG.ENEMY_SPAWN_INTERVAL,
      callback: function() {
        if (index < waveData.enemies.length) {
          self.spawnEnemy(waveData.enemies[index]);
          index++;
        } else {
          spawnTimer.remove();
        }
      },
      loop: true
    });
  },
  
  spawnEnemy: function(type) {
    var data = ENEMIES[type];
    var startPos = HEX.toScreen(MAP.path[0].r, MAP.path[0].c);
    
    var enemy = {
      sprite: this.add.sprite(startPos.x, startPos.y, 'enemy_' + type),
      type: type,
      hp: data.hp,
      maxHP: data.hp,
      speed: data.speed,
      reward: data.reward,
      pathIndex: 0,
      slow: 0,
      isDead: false
    };
    
    this.layerEnemies.add(enemy.sprite);
    this.enemies.push(enemy);
    
    // 血条背景
    enemy.hpBarBg = this.add.graphics();
    this.layerEnemies.add(enemy.hpBarBg);
    
    // 血条
    enemy.hpBar = this.add.graphics();
    this.layerEnemies.add(enemy.hpBar);
  },
  
  upgradeCrystal: function() {
    if (this.money < CFG.CRYSTAL_UPGRADE_COST || this.crystalLevel >= 5) return;
    
    this.money -= CFG.CRYSTAL_UPGRADE_COST;
    this.crystalLevel++;
    this.crystalMaxHP += CFG.CRYSTAL_HP_PER_LEVEL;
    this.crystalHP = this.crystalMaxHP;
    
    this.crystal.setTexture('crystal_' + this.crystalLevel);
    this.updateUI();
    
    SFX.play('upgrade');
    
    // 升级特效
    this.createParticleExplosion(this.crystal.x, this.crystal.y, ART.purple3, 20);
  },
  
  gameUpdate: function() {
    // 点击地图建造塔
    if (this.selectedTowerType && this.input.activePointer.isDown) {
      var px = this.input.activePointer.x;
      var py = this.input.activePointer.y;
      var hex = HEX.fromScreen(px, py);
      
      if (HEX.inBounds(hex.r, hex.c) && MAP.layout[hex.r][hex.c] === 0) {
        var key = hex.r + '_' + hex.c;
        if (!this.grid[key]) {
          this.buildTower(hex.r, hex.c, this.selectedTowerType);
          this.selectedTowerType = null;
          this.updateBuildBtnsState();
        }
      }
    }
    
    // 更新敌人
    this.updateEnemies();
    
    // 更新塔攻击
    this.updateTowers();
    
    // 更新子弹
    this.updateBullets();
    
    // 更新粒子
    this.updateParticles();
    
    // 检查波次结束
    if (this.isWaveActive && this.enemiesLeft === 0 && this.enemies.length === 0) {
      this.endWave();
    }
    
    // 更新UI
    this.updateUI();
  },
  
  buildTower: function(r, c, type) {
    var data = TOWERS[type];
    if (this.money < data.cost[0]) return;
    
    this.money -= data.cost[0];
    var pos = HEX.toScreen(r, c);
    
    var tower = {
      sprite: this.add.sprite(pos.x, pos.y, 'tower_' + type + '_1').setInteractive(),
      type: type,
      level: 1,
      r: r,
      c: c,
      lastFire: 0,
      target: null
    };
    
    this.layerTowers.add(tower.sprite);
    this.towers.push(tower);
    this.grid[r + '_' + c] = tower;
    
    SFX.play('build');
    
    // 点击塔升级
    tower.sprite.on('pointerdown', function() {
      this.scene.upgradeTower(tower);
    });
    
    // 检查合成
    this.checkMerge(r, c);
  },
  
  upgradeTower: function(tower) {
    if (tower.level >= 3) return;
    
    var data = TOWERS[tower.type];
    var cost = data.cost[tower.level];
    
    if (this.money < cost) return;
    
    this.money -= cost;
    tower.level++;
    tower.sprite.setTexture('tower_' + tower.type + '_' + tower.level);
    
    SFX.play('upgrade');
    this.createParticleExplosion(tower.sprite.x, tower.sprite.y, data.color[tower.level - 1], 15);
    
    // 检查合成
    this.checkMerge(tower.r, tower.c);
  },
  
  checkMerge: function(r, c) {
    var tower = this.grid[r + '_' + c];
    if (!tower || tower.level !== 3 || tower.merged) return;
    
    var neighbors = HEX.neighbors(r, c);
    var sameType = [];
    
    for (var i = 0; i < neighbors.length; i++) {
      var n = neighbors[i];
      var key = n.r + '_' + n.c;
      var t = this.grid[key];
      if (t && t.type === tower.type && t.level === 3 && !t.merged) {
        sameType.push(t);
      }
    }
    
    if (sameType.length >= 2) {
      // 合成！
      var toMerge = [tower, sameType[0], sameType[1]];
      this.mergeTowers(toMerge);
    }
  },
  
  mergeTowers: function(towers) {
    var center = towers[0];
    var type = center.type;
    
    // 删除其他两个塔
    for (var i = 1; i < towers.length; i++) {
      var t = towers[i];
      var key = t.r + '_' + t.c;
      delete this.grid[key];
      t.sprite.destroy();
      var index = this.towers.indexOf(t);
      if (index > -1) this.towers.splice(index, 1);
    }
    
    // 升级中心塔为合成塔
    center.merged = true;
    center.sprite.setTexture('tower_' + type + '_merged');
    center.sprite.setScale(1.2);
    
    SFX.play('merge');
    this.createParticleExplosion(center.sprite.x, center.sprite.y, TOWERS[type].color[2], 30);
  },
  
  updateTowers: function() {
    var now = this.time.now;
    
    for (var i = 0; i < this.towers.length; i++) {
      var tower = this.towers[i];
      var data = TOWERS[tower.type];
      var fireRate = data.fireRate[tower.level - 1];
      
      if (now - tower.lastFire < fireRate) continue;
      
      // 寻找目标
      var range = data.range[tower.level - 1];
      if (tower.merged) range *= 1.3;
      
      var target = this.findNearestEnemy(tower.sprite.x, tower.sprite.y, range);
      
      if (target) {
        tower.lastFire = now;
        this.fireBullet(tower, target);
      }
    }
  },
  
  findNearestEnemy: function(x, y, range) {
    var nearest = null;
    var minDist = range;
    
    for (var i = 0; i < this.enemies.length; i++) {
      var e = this.enemies[i];
      if (e.isDead) continue;
      
      var dist = U.dist(x, y, e.sprite.x, e.sprite.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = e;
      }
    }
    
    return nearest;
  },
  
  fireBullet: function(tower, target) {
    var data = TOWERS[tower.type];
    var damage = data.damage[tower.level - 1];
    if (tower.merged) damage = data.mergeDamage;
    
    var bullet = {
      sprite: this.add.sprite(tower.sprite.x, tower.sprite.y, 'bullet_' + data.projectile),
      target: target,
      speed: 200,
      damage: damage,
      type: tower.type,
      tower: tower
    };
    
    this.layerBullets.add(bullet.sprite);
    this.bullets.push(bullet);
    
    SFX.play('shoot');
  },
  
  updateBullets: function() {
    for (var i = this.bullets.length - 1; i >= 0; i--) {
      var b = this.bullets[i];
      
      if (!b.target || b.target.isDead) {
        // 目标死亡，子弹消失
        b.sprite.destroy();
        this.bullets.splice(i, 1);
        continue;
      }
      
      // 移动子弹
      var dx = b.target.sprite.x - b.sprite.x;
      var dy = b.target.sprite.y - b.sprite.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 5) {
        // 击中
        this.hitEnemy(b);
        b.sprite.destroy();
        this.bullets.splice(i, 1);
      } else {
        var angle = Math.atan2(dy, dx);
        b.sprite.x += Math.cos(angle) * b.speed * 0.05;
        b.sprite.y += Math.sin(angle) * b.speed * 0.05;
        b.sprite.rotation = angle;
      }
    }
  },
  
  hitEnemy: function(bullet) {
    var data = TOWERS[bullet.type];
    
    // 直接伤害
    this.damageEnemy(bullet.target, bullet.damage);
    
    // 特殊效果
    if (data.splash) {
      // 溅射伤害
      var splash = data.splash[bullet.tower.level - 1];
      for (var i = 0; i < this.enemies.length; i++) {
        var e = this.enemies[i];
        if (e === bullet.target || e.isDead) continue;
        var dist = U.dist(e.sprite.x, e.sprite.y, bullet.target.sprite.x, bullet.target.sprite.y);
        if (dist < splash) {
          this.damageEnemy(e, bullet.damage * 0.5);
        }
      }
    }
    
    if (data.slow) {
      // 减速
      bullet.target.slow = Math.max(bullet.target.slow, data.slow[bullet.tower.level - 1]);
    }
    
    if (data.pierce) {
      // 穿透（简化：直接额外伤害附近敌人）
      var pierce = data.pierce[bullet.tower.level - 1];
      var hit = 0;
      for (var j = 0; j < this.enemies.length && hit < pierce; j++) {
        var e2 = this.enemies[j];
        if (e2 === bullet.target || e2.isDead) continue;
        var dist2 = U.dist(e2.sprite.x, e2.sprite.y, bullet.target.sprite.x, bullet.target.sprite.y);
        if (dist2 < 80) {
          this.damageEnemy(e2, bullet.damage);
          hit++;
        }
      }
    }
    
    // 击中特效
    this.createParticleExplosion(bullet.target.sprite.x, bullet.target.sprite.y, data.color[0], 8);
    SFX.play('hit');
  },
  
  damageEnemy: function(enemy, damage) {
    enemy.hp -= damage;
    
    if (enemy.hp <= 0 && !enemy.isDead) {
      this.killEnemy(enemy);
    }
  },
  
  killEnemy: function(enemy) {
    enemy.isDead = true;
    this.money += enemy.reward;
    this.enemiesLeft--;
    
    // 死亡动画
    this.tweens.add({
      targets: enemy.sprite,
      alpha: 0,
      scale: 0.5,
      duration: 200,
      onComplete: function() {
        enemy.sprite.destroy();
        if (enemy.hpBar) enemy.hpBar.destroy();
        if (enemy.hpBarBg) enemy.hpBarBg.destroy();
      }
    });
    
    var index = this.enemies.indexOf(enemy);
    if (index > -1) this.enemies.splice(index, 1);
    
    // 死亡特效
    this.createParticleExplosion(enemy.sprite.x, enemy.sprite.y, ART.orange3, 12);
  },
  
  updateEnemies: function() {
    for (var i = this.enemies.length - 1; i >= 0; i--) {
      var e = this.enemies[i];
      if (e.isDead) continue;
      
      // 移动
      if (e.pathIndex < MAP.path.length - 1) {
        var target = HEX.toScreen(MAP.path[e.pathIndex + 1].r, MAP.path[e.pathIndex + 1].c);
        var dx = target.x - e.sprite.x;
        var dy = target.y - e.sprite.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 3) {
          e.pathIndex++;
        } else {
          var data = ENEMIES[e.type];
          var speed = data.speed * (1 - e.slow) * 0.05;
          e.sprite.x += (dx / dist) * speed;
          e.sprite.y += (dy / dist) * speed;
        }
        
        // 减速衰减
        if (e.slow > 0) e.slow -= 0.01;
      } else {
        // 到达水晶
        this.attackCrystal(e);
      }
      
      // 更新血条
      if (e.hpBar && e.hpBarBg) {
        var hpRatio = e.hp / e.maxHP;
        var barWidth = 30;
        
        e.hpBarBg.clear();
        e.hpBarBg.fillStyle(0x000000, 0.5);
        e.hpBarBg.fillRect(e.sprite.x - barWidth / 2, e.sprite.y - 20, barWidth, 4);
        
        e.hpBar.clear();
        var color = hpRatio > 0.5 ? 0x00ff00 : (hpRatio > 0.2 ? 0xffaa00 : 0xff0000);
        e.hpBar.fillStyle(color, 1);
        e.hpBar.fillRect(e.sprite.x - barWidth / 2, e.sprite.y - 20, barWidth * hpRatio, 4);
      }
    }
  },
  
  attackCrystal: function(enemy) {
    this.crystalHP -= 10;
    
    // 水晶受击动画
    this.tweens.add({
      targets: this.crystal,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });
    
    this.createParticleExplosion(this.crystal.x, this.crystal.y, ART.red3, 15);
    
    // 移除敌人
    enemy.sprite.destroy();
    if (enemy.hpBar) enemy.hpBar.destroy();
    if (enemy.hpBarBg) enemy.hpBarBg.destroy();
    var index = this.enemies.indexOf(enemy);
    if (index > -1) this.enemies.splice(index, 1);
    this.enemiesLeft--;
    
    // 检查游戏结束
    if (this.crystalHP <= 0) {
      this.gameOver(false);
    }
  },
  
  createParticleExplosion: function(x, y, color, count) {
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 50 + Math.random() * 100;
      
      var p = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 20,
        color: color
      };
      
      this.particles.push(p);
    }
  },
  
  updateParticles: function() {
    for (var i = this.particles.length - 1; i >= 0; i--) {
      var p = this.particles[i];
      
      p.x += p.vx * 0.016;
      p.y += p.vy * 0.016;
      p.vy += 200 * 0.016; // 重力
      p.life--;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
    
    // 绘制粒子
    if (this.particleGraphics) this.particleGraphics.destroy();
    this.particleGraphics = this.add.graphics();
    this.layerParticles.add(this.particleGraphics);
    
    for (var j = 0; j < this.particles.length; j++) {
      var p2 = this.particles[j];
      var alpha = p2.life / 50;
      this.particleGraphics.fillStyle(p2.color, alpha);
      this.particleGraphics.fillRect(p2.x - 2, p2.y - 2, 4, 4);
    }
  },
  
  endWave: function() {
    this.isWaveActive = false;
    
    if (this.wave >= WAVES.length) {
      // 胜利
      this.time.delayedCall(1000, function() {
        this.gameOver(true);
      }, [], this);
    } else {
      // 下一波
      this.startWaveBtn.setVisible(true);
    }
  },
  
  gameOver: function(isWin) {
    this.updateTimer.remove();
    
    this.time.delayedCall(500, function() {
      if (isWin) {
        SFX.play('win');
      } else {
        SFX.play('lose');
      }
      
      this.scene.start('EndScene', {isWin: isWin, wave: this.wave, money: this.money});
    }, [], this);
  },
  
  updateUI: function() {
    this.moneyText.setText('金币: ' + this.money);
    this.crystalText.setText('水晶: ' + Math.max(0, this.crystalHP) + '/' + this.crystalMaxHP);
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 结束场景
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
var EndScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function() {
    Phaser.Scene.call(this, {key: 'EndScene'});
  },
  
  init: function(data) {
    this.isWin = data.isWin;
    this.wave = data.wave;
    this.money = data.money;
  },
  
  create: function() {
    // 背景
    var bg = this.add.graphics();
    if (this.isWin) {
      bg.fillGradientStyle(ART.sky2, ART.sky2, ART.purple1, ART.purple1, 1);
    } else {
      bg.fillGradientStyle(ART.sky1, ART.sky1, ART.red1, ART.red1, 1);
    }
    bg.fillRect(0, 0, CFG.WIDTH, CFG.HEIGHT);
    
    // 标题
    var title = this.isWin ? '任务完成！' : '防线失守';
    var titleColor = this.isWin ? '#68d978' : '#ff6b7a';
    
    this.add.text(CFG.WIDTH / 2, 150, title, {
      fontSize: '56px',
      fontFamily: 'Arial, sans-serif',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);
    
    // 统计信息
    var stats = [
      '完成波次: ' + this.wave + '/' + WAVES.length,
      '剩余金币: ' + this.money
    ];
    
    for (var i = 0; i < stats.length; i++) {
      this.add.text(CFG.WIDTH / 2, 250 + i * 40, stats[i], {
        fontSize: '24px',
        fontFamily: 'monospace',
        color: '#e0e6f0'
      }).setOrigin(0.5);
    }
    
    // 按钮
    var restartBtn = this.add.text(CFG.WIDTH / 2, 400, '[ 再来一局 ]', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#ffc850',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive();
    
    restartBtn.on('pointerover', function() {
      this.setScale(1.1);
    });
    
    restartBtn.on('pointerout', function() {
      this.setScale(1);
    });
    
    restartBtn.on('pointerdown', function() {
      SFX.play('build');
      this.scene.scene.start('GameScene');
    });
    
    var menuBtn = this.add.text(CFG.WIDTH / 2, 460, '[ 返回菜单 ]', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#3dcfd4',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setInteractive();
    
    menuBtn.on('pointerover', function() {
      this.setScale(1.1);
    });
    
    menuBtn.on('pointerout', function() {
      this.setScale(1);
    });
    
    menuBtn.on('pointerdown', function() {
      SFX.play('build');
      this.scene.scene.start('StartScene');
    });
  }
});
