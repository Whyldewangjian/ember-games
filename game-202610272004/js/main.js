// ═══════════════════════════════════════════════════════════════════════════
// 六边形塔防 - 主程序入口
// ═══════════════════════════════════════════════════════════════════════════

var gameConfig = {
  type: Phaser.AUTO,
  width: CFG.WIDTH,
  height: CFG.HEIGHT,
  parent: 'game',
  backgroundColor: '#0a0e1f',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  pixelArt: true,
  scene: [StartScene, GameScene, EndScene]
};

var game = new Phaser.Game(gameConfig);
