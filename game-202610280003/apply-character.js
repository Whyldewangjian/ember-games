const fs=require('fs'),path=require('path'),vm=require('vm');
const root=__dirname;
const png=fs.readFileSync(path.join(root,'characters/white-shirt-sheet.png'));
if(png.readUInt32BE(16)!==256||png.readUInt32BE(20)!==96)throw Error('Unexpected sheet size');
// Embedded PNG avoids file:// image/XHR restrictions; still uses the original spritesheet.
fs.writeFileSync(path.join(root,'js/character-data.js'),'// Generated from characters/white-shirt-sheet.png for offline local-file support.\nvar TRAVELER_SHEET_DATA = '+JSON.stringify('data:image/png;base64,'+png.toString('base64'))+';\n');
let file=path.join(root,'js/scenes.js'),s=fs.readFileSync(file,'utf8');
s=s.replace(/class BootScene extends Phaser\.Scene\{[\s\S]*?(?=class MenuScene)/,`class BootScene extends Phaser.Scene{
 constructor(){super('Boot');}
 preload(){this.load.spritesheet('white-shirt-traveler',TRAVELER_SHEET_DATA,{frameWidth:32,frameHeight:48});}
 create(){
  if(!this.textures.exists('white-shirt-traveler')){document.getElementById('loading').innerHTML='角色素材加载失败，请刷新重试';return;}
  buildArt(this);makeTexture(this,'blank',2,2,function(){});
  this.anims.create({key:'traveler-idle',frames:this.anims.generateFrameNumbers('white-shirt-traveler',{start:0,end:7}),frameRate:6,repeat:-1});
  this.anims.create({key:'traveler-run',frames:this.anims.generateFrameNumbers('white-shirt-traveler',{start:8,end:15}),frameRate:12,repeat:-1});
  document.getElementById('loading').remove();this.scene.start('Menu');
 }
}
`);
s=s.replace("this.player=this.physics.add.sprite(128,258,'hero-walk-0');this.player.body.setSize(18,36).setOffset(15,7);", "this.player=this.physics.add.sprite(128,258,'white-shirt-traveler',8).setOrigin(.5,1);this.player.setY(CFG.groundY);this.player.body.setSize(14,44).setOffset(9,4);");
s=s.replace("this.player.play('walk');", "this.player.play('traveler-run');");
s=s.replace("this.player.body.setSize(18,36).setOffset(15,7);this.player.body.setVelocityY", "this.player.setScale(1);this.player.body.setSize(14,44).setOffset(9,4);this.player.body.setVelocityY");
s=s.replace("this.player.play('attack',true);", "this.player.anims.stop();this.player.setFrame(this.jumps===1?10:14);");
s=s.replace("this.player.y+18,5", "this.player.y-2,5");
s=s.replace("p.play('hurt',true);", "p.setTint(0xffc6ad);this.time.delayedCall(150,()=>{if(p.active)p.clearTint();});");
s=s.replace("emitParticleAt(p.x,p.y,16)","emitParticleAt(p.x,p.y-24,16)");
s=s.replace("this.player.body.setSize(18,crouch?21:36).setOffset(15,crouch?22:7);this.player.setScale(1,crouch?.7:1);if(grounded)this.player.play(this.elapsed<this.invUntil?'hurt':'walk',true);", "this.player.setScale(1,crouch?.58:1);this.player.body.setSize(14,44).setOffset(9,4);if(x!==0)this.player.setFlipX(x<0);if(grounded){this.player.play('traveler-run',true);this.player.anims.timeScale=crouch?.65:speed/CFG.speed;}else{this.player.anims.stop();this.player.setFrame(this.player.body.velocity.y<0?10:13);}");
fs.writeFileSync(file,s);
file=path.join(root,'js/assets.js');let a=fs.readFileSync(file,'utf8');a=a.replace(/ \['idle','walk','attack','hurt'\]\.forEach[\s\S]*?(?= makeTexture\(s,'rock')/, ' // Player textures and animations now come from the original white-shirt spritesheet.\n');fs.writeFileSync(file,a);
file=path.join(root,'index.html');let html=fs.readFileSync(file,'utf8');if(!html.includes('js/character-data.js'))html=html.replace('<script src="js/scenes.js">','<script src="js/character-data.js"></script><script src="js/scenes.js">');fs.writeFileSync(file,html);
file=path.join(root,'js/main.js');let m=fs.readFileSync(file,'utf8');m=m.replace("pixelArt:true,roundPixels:true,physics:","pixelArt:true,roundPixels:true,input:{activePointers:3},physics:");fs.writeFileSync(file,m);
file=path.join(root,'characters/preview.html');let p=fs.readFileSync(file,'utf8');p=p.replace('这是独立的角色造型预览，尚未替换游戏主角。','角色现已接入游戏，作为可控制的主角。');p=p.replace('<div class="buttons"><a href="white-shirt-idle.png"','<div class="buttons"><a href="../index.html">进入游戏操控角色</a><a href="white-shirt-idle.png"');fs.writeFileSync(file,p);
for(const name of ['config','assets','character-data','scenes','main'])new vm.Script(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),{filename:name+'.js'});
if(/hero-walk|play\('walk'|play\('hurt'|play\('attack'/.test(s))throw Error('Old player reference remains');
console.log('Applied white-shirt character. PNG 256x96, frames 32x48; JS syntax checks passed.');
