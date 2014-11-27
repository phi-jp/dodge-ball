/*
 * # tutorial - tmlib.js
 * tmlib.js のチュートリアルです.
 * http://phi-jp.github.io/tmlib.js/tutorial.html
 */

var SCREEN_WIDTH    = 640;              // スクリーン幅
var SCREEN_HEIGHT   = 960;              // スクリーン高さ
var SCREEN_CENTER_X = SCREEN_WIDTH/2;   // スクリーン幅の半分
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;  // スクリーン高さの半分

// main
tm.main(function() {
    // キャンバスアプリケーションを生成
    var app = tm.display.CanvasApp("#world");
    app.background = "white";
    // リサイズ
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    // ウィンドウにフィットさせる
    app.fitWindow();
    
    // シーン切り替え
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
	}
})

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
                    init: [64, 64, {
                        fillStyle: "hsla(0, 80%, 60%, 0.8)",
                        strokeStyle: "transparent",
                    }],
                    x: SCREEN_CENTER_X,
                    y: SCREEN_CENTER_Y,
                },
                enemyGroup: {
                    type: "tm.display.CanvasElement",
                },
                bg: {
                    type: "Background",
                },
            }
        });

        this.stage.fromJSON({

        });
        
    },
    
    update: function(app) {
        var p = app.pointing;
        
        if (p.getPointing()) {
            this.player.x += p.dx;
            this.player.y += p.dy;
        }
        
        if (app.frame % 30 === 0) {
            var enemy = Enemy().addChildTo(this.enemyGroup);
            var length = 560;
            var angle = Math.rand(0, 360);
            var vx = Math.cos(angle*Math.PI/180);
            var vy = Math.sin(angle*Math.PI/180);
            var x = SCREEN_CENTER_X + vx*length;
            var y = SCREEN_CENTER_Y + vy*length;
            
            enemy.setDirection(angle+180+Math.rand(-30, 30));
            enemy.setPosition(x, y);
        }
        
        if (app.frame % 120 === 0) {
            var enemy = SpeedyEnemy().addChildTo(this.enemyGroup);
            var length = 560;
            var angle = Math.rand(0, 360);
            var vx = Math.cos(angle*Math.PI/180);
            var vy = Math.sin(angle*Math.PI/180);
            var x = SCREEN_CENTER_X + vx*length;
            var y = SCREEN_CENTER_Y + vy*length;
            
            enemy.setDirection(angle+180+Math.rand(-30, 30));
            enemy.setPosition(x, y);
        }

        this.checkCollision(app);
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
        this.superInit(SCREEN_WIDTH, SCREEN_HEIGHT);
        
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
        this.superInit(16, 16, {
            fillStyle: color||"black",
            strokeStyle: "transparent",
        });
        
        this.velocity = tm.geom.Vector2(0, 0);
        this.speed = 4;
    },
    
    update: function() {
        this.x += this.velocity.x*this.speed;
        this.y += this.velocity.y*this.speed;
    },
    
    setDirection: function(angle) {
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


tm.define("ResultScene", {
	superClass: "tm.scene.ResultScene",

	init: function(param) {
		this.superInit(param);
	},
});










