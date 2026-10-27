// 引擎初始化：缺库时显示错误而不是白屏 / 黑屏。
var portrait=document.getElementById('portrait');portrait.addEventListener('pointerdown',function(){portrait.classList.add('dismissed');});
var game=null;
if(typeof Phaser==='undefined'){
 document.getElementById('loading').innerHTML='Phaser 引擎未能加载<br><small>请联网后重新打开，或将 Phaser 3.90 的 phaser.min.js 放入 Game 文件夹。</small>';
}else{
 var gameConfig={type:Phaser.AUTO,parent:'game',width:CFG.width,height:CFG.height,backgroundColor:ART.ink[0],pixelArt:true,roundPixels:true,input:{activePointers:3},physics:{default:'arcade',arcade:{gravity:{y:0},debug:false}},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[BootScene,MenuScene,GameScene,PauseScene,OverScene],render:{antialias:false,roundPixels:true}};
 try{game=new Phaser.Game(gameConfig);}catch(e){document.getElementById('loading').innerHTML='游戏启动失败<br><small>'+String(e.message).replace(/</g,'&lt;')+'</small>';}
}
