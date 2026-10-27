// 配置 / 数据：所有玩法数值集中维护
var CFG = {width:640,height:360,groundY:282,gravity:980,speed:143,maxSpeed:250,acceleration:1.5,move:125,jump:-355,doubleJump:-310,maxHp:3,invincible:1600,spawn:1550,minSpawn:1000,coinScore:50,saveKey:'banshan-run-v2',volume:0.045};
// 调色板：8 个色族，每族 8 阶；从深阴影到左上高光，共 64 色。
var ART = {
 ink:['#101d32','#162c40','#213c4d','#2c4e5d','#426674','#65858b','#9ab3af','#dce3cc'],
 sky:['#326c9a','#4488af','#60a3c3','#7fbcd2','#a2d5df','#bce5e4','#dcf0df','#fff3d0'],
 stone:['#273747','#3c4c55','#566467','#727d75','#929a88','#b1b59b','#d1d0ae','#ede2bf'],
 green:['#123d3e','#1c5548','#296e50','#3f8957','#60a25e','#88bc6c','#b5d580','#e0e8a2'],
 water:['#144b64','#1b657b','#218294','#2f9faa','#4eb8ba','#79d2ca','#b1e6d8','#e4f4dc'],
 gold:['#583d38','#80503b','#a56b3f','#c18c49','#dbad5b','#edca7a','#f8e0a0','#fff2c5'],
 red:['#492b40','#6d3549','#933c50','#b95359','#d66e65','#e9947c','#f3ba99','#ffdfb5'],
 blue:['#202d52','#2b4272','#345c94','#437faf','#5d9cc3','#82b9d4','#b0d7e2','#e0eff0']
};
var DATA={obstacles:[{key:'rock',w:26,h:23},{key:'stump',w:24,h:31},{key:'gate',w:48,h:61}],tips:['空格 / W / ↑ 跳跃 · 空中可再跳一次','S / ↓ 下蹲，躲过悬挂横木','A / D 或 ← / → 微调位置 · 收集金叶加分']};
