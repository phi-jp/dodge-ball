/*
 * # tutorial - tmlib.js
 * tmlib.js のチュートリアルです.
 * http://phi-jp.github.io/tmlib.js/tutorial.html
 */

var SCREEN_WIDTH    = 640;              // スクリーン幅
var SCREEN_HEIGHT   = 960;              // スクリーン高さ
var SCREEN_CENTER_X = SCREEN_WIDTH/2;   // スクリーン幅の半分
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;  // スクリーン高さの半分
var SCREEN_CENTER   = tm.geom.Vector2(SCREEN_CENTER_X, SCREEN_CENTER_Y);
var SCREEN_RECT     = tm.geom.Rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
var LEVEL_MAP = [
    {
        frame: 150,
        step: 30,
        commands: [
            { method: "createRandomEnemy", args: ["Enemy"] }
        ],
    },
    {
        frame: 150,
        step: 10,
        commands: [
            { method: "createRandomEnemy", args: ["Enemy"] }
        ],
    },
    {
        frame: 150,
        step: 15,
        commands: [
            { method: "createRandomEnemy", args: ["Enemy"] },
            { method: "createRandomEnemy", args: ["SpeedyEnemy"] },
        ],
    },
    {
        frame: 150,
        step: 10,
        commands: [
            { method: "createRandomEnemy", args: ["Enemy"] },
            { method: "createRandomEnemy", args: ["SpeedyEnemy"] },
            { method: "createRandomEnemy", args: ["SpeedyEnemy"] },
        ],
    },
    {
        frame: 150,
        step: 10,
        commands: [
            { method: "createRandomEnemy", args: ["Enemy"] },
            { method: "createRandomEnemy", args: ["SpeedyEnemy"] },
            { method: "createVerticalEnemy", args: ["Enemy", 10] },
        ],
    },
    {
        frame: 150,
        step: 10,
        commands: [
            { method: "createRandomEnemy", args: ["SpeedyEnemy"] },
            { method: "createVerticalEnemy", args: ["SpeedyEnemy", 10] },
        ],
    },
    {
        frame: 150,
        step: 20,
        commands: [
            { method: "createHorizontalEnemy", args: ["Enemy", 10] },
        ],
    },
];
var DEFAULT_LEVEL = 0;

// main
tm.main(function() {
    // キャンバスアプリケーションを生成
    var app = tm.display.CanvasApp("#world");
    app.background = "white";
    // リサイズ
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    // ウィンドウにフィットさせる
    app.fitWindow();

    // // ロード
    // var loading = tm.scene.LoadingScene({
    //     assets: {
    //         "bgm": "sounds/bgm.mp3",
    //     },
    // });
    // loading.onload = function() {
    //     // シーン切り替え
    //     app.replaceScene(ManagerScene());
    // };
    // app.replaceScene(loading);
    app.replaceScene(ManagerScene());

    // 実行
    app.run();
});

tm.define("ManagerScene", {
    superClass: "tm.scene.ManagerScene",

    init: function() {
        this.superInit({
            scenes: [
                {
                    className: "tm.scene.TitleScene",
                    arguments: {
                        width: SCREEN_WIDTH,
                        height: SCREEN_HEIGHT,
                        title: "Dodge Ball",
                    },
                    label: "title",
                },
                {
                    className: "GameScene",
                    label: "game",
                    nextLabel: "title",
                }
            ],
        });

        // tm.asset.Manager.get("bgm").clone().play();
    },

    onstart: function() {
        this.gotoScene("game");
    },
});

// シーンを定義
tm.define("GameScene", {
    superClass: "tm.app.Scene",
    
    init: function() {
        this.superInit();
        
        this.fromJSON({
            children: {
                stage: {
                    type: "tm.display.CanvasElement",
                },
                player: {
                    type: "tm.display.CircleShape",
                    init: {
                        width: 64,
                        heigth: 64,
                        fillStyle: "hsla(0, 80%, 60%, 0.8)",
                        strokeStyle: "transparent",
                    },
                    x: SCREEN_CENTER_X,
                    y: SCREEN_CENTER_Y,
                },
                enemyGroup: {
                    type: "tm.display.CanvasElement",
                },
                bg: {
                    type: "Background",
                },
                levelText: {
                    type: "tm.display.Label",
                    x: SCREEN_CENTER_X-30,
                    y: 885,
                    text: "Level",
                    fillStyle: "#444",
                    fontSize: 40,
                },
                levelLabel: {
                    type: "tm.display.Label",
                    x: SCREEN_CENTER_X+50,
                    y: 880,
                    text: "1",
                    fillStyle: "#444",
                    fontSize: 56,
                },
                scoreLabel: {
                    type: "tm.display.Label",
                    x: SCREEN_CENTER_X,
                    y: 80,
                    text: "0",
                    fillStyle: "#444",
                    fontSize: 56,
                },
            }
        });

        this.stage.fromJSON({

        });

        this.setLevel(DEFAULT_LEVEL);
    },

    onenter: function(e) {
        e.app.frame = 0;
    },
    
    update: function(app) {
        var p = app.pointing;
        
        if (p.getPointing()) {
            this.player.x += p.dx;
            this.player.y += p.dy;
        }

        if (this.frame % this.levelMap.step === 0) {
            var command = this.levelMap.commands.pickup();
            var method = this[command.method];
            method.apply(this, command.args);
        }

        if (this.checkLevelUp()) {
            this.levelUp(app);
        }

        this.checkCollision(app);

        this.frame++;

        this.scoreLabel.text = app.frame;
    },

    checkLevelUp: function() {
        return this.frame > this.levelMap.frame && LEVEL_MAP[this.level+1] != null;
    },

    setLevel: function(level) {
        this.level = level;
        this.levelMap = LEVEL_MAP[this.level];

        this.levelLabel.text = this.level+1;
        this.frame = 0;
        return this;
    },

    levelUp: function() {
        return this.setLevel(this.level+1);
    },

    createEnemy: function(name, x, y, angle) {
        var enemyGroup = this.enemyGroup;
        var klass = tm.using(name);
        var enemy = klass().addChildTo(enemyGroup);

        enemy.setPosition(x, y);
        enemy.setDirection(angle);

        return enemy;
    },

    createRandomEnemy: function(name) {
        var length = 560;
        var angle = Math.rand(0, 360);
        var vx = Math.cos(angle*Math.PI/180);
        var vy = Math.sin(angle*Math.PI/180);
        var x = SCREEN_CENTER_X + vx*length;
        var y = SCREEN_CENTER_Y + vy*length;
        var enemy = this.createEnemy(name, x, y, angle+180+Math.rand(-30, 30));
        
        return enemy;
    },

    createHorizontalEnemy: function(name, count) {
        var enemies = [];
        var baseEnemy = this.createRandomEnemy(name);

        var angle = baseEnemy.angle;
        var vx = Math.cos((angle+90)*Math.PI/180);
        var vy = Math.sin((angle+90)*Math.PI/180);
        count.times(function(i) {
            var index = i-5;
            var x = vx*index*-1*20 + baseEnemy.x;
            var y = vy*index*-1*20 + baseEnemy.y;
            var enemy = this.createEnemy(name, x, y, angle);
        }, this);
    },

    createVerticalEnemy: function(name, count) {
        var enemies = [];
        var baseEnemy = this.createRandomEnemy(name);

        var angle = baseEnemy.angle;
        var vx = Math.cos(angle*Math.PI/180);
        var vy = Math.sin(angle*Math.PI/180);
        count.times(function(i) {
            var index = i+1;
            var x = vx*index*-1*20 + baseEnemy.x;
            var y = vy*index*-1*20 + baseEnemy.y;
            var enemy = this.createEnemy(name, x, y, angle);
        }, this);
    },

    checkCollision: function(app) {
        var flag = this.enemyGroup.children.some(function(enemy) {
            if (this.player.isHitElement(enemy)) {
                return true;
            }
        }, this);

        if (flag == true) {
            var result = ResultScene({
                score: app.frame,
            });
            this.app.pushScene(result);

            this.onresume = function() {
                app.popScene();
            };
        }
    },
});


tm.define("Background", {
    superClass: "tm.display.Shape",
    
    init: function() {
        this.superInit({
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
        });
        
        this.setOrigin(0, 0);
        
        var c = this.canvas;
        c.clearColor("rgba(240, 240, 240, 0.9)");
        c.globalCompositeOperation = "xor";
        c.fillStyle = "white";
        c.fillCircle(SCREEN_CENTER_X, SCREEN_CENTER_Y, 320);
    }
});


tm.define("Enemy", {
    superClass: "tm.display.CircleShape",
    
    init: function(color) {
        this.superInit({
            width: 16,
            height: 16,
            fillStyle: color||"black",
            strokeStyle: "transparent",
        });
        
        this.velocity = tm.geom.Vector2(0, 0);
        this.speed = 4;
    },
    
    update: function() {
        this.x += this.velocity.x*this.speed;
        this.y += this.velocity.y*this.speed;

        // dir check
        var toCenter = tm.geom.Vector2.sub(SCREEN_CENTER, this.position);
        var dot = tm.geom.Vector2.dot(toCenter, this.velocity);

        if (dot < 0 && SCREEN_RECT.contains(this.x, this.y) == false) {
            this.remove();
        }
    },
    
    setDirection: function(angle) {
        this.angle = angle;
        this.velocity.x = Math.cos(angle*Math.PI/180);
        this.velocity.y = Math.sin(angle*Math.PI/180);

        return this;
    },
});

tm.define("SpeedyEnemy", {
    superClass: "Enemy",
    
    init: function() {
        this.superInit("blue");
        
        this.speed = 12;
    },
});

tm.define("CrookedEnemy", {
    superClass: "Enemy",
    
    init: function() {
        this.superInit("green");

        this.onenterframe = function(e) {
            if (e.app.frame % 30 == 0) {
                this.setDirection(this.angle + 60);
            }
            else if (e.app.frame % 15 == 0) {
                this.setDirection(this.angle - 60);
            }
        };

        this.speed = 8;
    },
});


tm.define("ResultScene", {
    superClass: "tm.scene.ResultScene",

    init: function(param) {
        this.superInit(param);
    },
});










