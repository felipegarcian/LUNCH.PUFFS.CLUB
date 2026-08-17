// Global Game State, High Score, HUD and Power Management
var GameState = {
    score: 0,
    highScore: 0,
    lives: 3,
    maxLives: 3,
    boost: 0, // 0 to 100
    boostMax: 100,
    isBoosting: false,
    boostDuration: 4.5, // seconds
    boostTimer: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
    wave: 1,
    selectedLevelIndex: 0,
    levels: [
        {
            id: 'rat',
            number: 1,
            name: 'LEVEL 1: RAT ESCAPE',
            tag: '🐀 STREET RUN',
            desc: 'Scurry Springfield streets, dodge speeding cars & hoard cheese!',
            startState: 'rat',
            startWave: 1,
            color: '#FFB300'
        },
        {
            id: 'pigeon',
            number: 2,
            name: 'LEVEL 2: PIGEON FLIGHT',
            tag: '🕊️ SKY HIGH',
            desc: 'Flap through skies, dodge wire hazards & stray cats, catch fries!',
            startState: 'pigeon',
            startWave: 1,
            color: '#00E5FF'
        },
        {
            id: 'turbo',
            number: 3,
            name: 'LEVEL 3: TURBO FUSION',
            tag: '⚡ ENDLESS SHIFT',
            desc: 'Hugo\'s ultimate experiment! Rapid realm shifting at high speed!',
            startState: 'rat',
            startWave: 3,
            color: '#FF2A6D'
        }
    ],
    snacksCollected: 0,
    fishHeadsEaten: 0,
    stitchesCollected: 0,
    obstaclesSmashed: 0,
    invincibleTimer: 0,
    gameStartTime: 0,
    lastPhase: 'rat',
    hugoQuote: '',
    hugoQuoteTimer: 0,
    
    init: function() {
        try {
            var saved = localStorage.getItem('lunch_puff_highscore');
            if (saved) {
                this.highScore = parseInt(saved, 10) || 0;
            }
        } catch (e) {}
    },

    resetGame: function(levelIndex) {
        if (levelIndex !== undefined && this.levels[levelIndex]) {
            this.selectedLevelIndex = levelIndex;
        }
        var level = this.levels[this.selectedLevelIndex] || this.levels[0];

        this.score = 0;
        this.lives = 3;
        this.boost = 0;
        this.isBoosting = false;
        this.boostTimer = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.comboTimer = 0;
        this.wave = level.startWave;
        this.snacksCollected = 0;
        this.fishHeadsEaten = 0;
        this.stitchesCollected = 0;
        this.obstaclesSmashed = 0;
        this.invincibleTimer = 0;
        this.hugoQuote = "HUGO: 'Starting " + level.name + "! It lives!'";
        this.hugoQuoteTimer = 4.0;
        this.gameStartTime = Date.now();
        SoundEngine.startBGM(135);
    },

    addScore: function(points, x, y, label) {
        var multiplier = Math.max(1, 1 + Math.floor(this.combo / 3));
        var totalPoints = points * multiplier;
        this.score += totalPoints;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            try {
                localStorage.setItem('lunch_puff_highscore', this.highScore.toString());
            } catch (e) {}
        }

        if (x !== undefined && y !== undefined && game) {
            this.showFloatingText(x, y, (label ? label + " " : "") + "+" + totalPoints, totalPoints >= 300 ? "#ffdd00" : "#ffffff");
        }
    },

    addSnack: function(x, y) {
        this.snacksCollected++;
        this.combo++;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        this.comboTimer = 3.5; // seconds to keep combo alive

        // Increase boost gauge
        this.addBoost(18);

        this.addScore(150, x, y, this.combo > 1 ? "x" + (1 + Math.floor(this.combo / 3)) : "");
        SoundEngine.playCollect(this.combo);
    },

    addFishHead: function(x, y) {
        this.fishHeadsEaten++;
        this.addBoost(100);
        this.addScore(1200, x, y, "FISH HEADS! YUM!");
        SoundEngine.playFishHeadFeast();
        this.triggerHugoQuote("HUGO: 'Roly-poly fish heads! Eat them up, YUM!'");
    },

    addStitchNeedle: function(x, y) {
        this.stitchesCollected++;
        this.invincibleTimer = 3.0; // Temporary stitch armor
        this.addScore(450, x, y, "SURGICAL STITCH!");
        SoundEngine.playStitchSound();
        this.triggerHugoQuote("HUGO: 'Stitching pigeon to rat... Almost ready for Bart!'");
    },

    triggerHugoQuote: function(text) {
        this.hugoQuote = text;
        this.hugoQuoteTimer = 3.5;
    },

    addBoost: function(amount) {
        if (this.isBoosting) return;
        this.boost = Math.min(this.boostMax, this.boost + amount);
        if (this.boost >= this.boostMax) {
            SoundEngine.playBoostReady();
        }
    },

    shakeCamera: function(gameInstance, intensity, duration) {
        intensity = intensity || 0.02;
        duration = duration || 250;

        // 1. Try native camera.shake if supported
        if (gameInstance && gameInstance.camera && typeof gameInstance.camera.shake === 'function') {
            try {
                gameInstance.camera.shake(intensity, duration);
                return;
            } catch (e) {}
        }

        // 2. Safe DOM/Canvas Screen Shake fallback (works 100% reliably in any Phaser version)
        try {
            var container = document.getElementById('screenBezel') || document.getElementById('game-container');
            if (container) {
                var startTime = Date.now();
                var maxOffset = Math.max(2, Math.min(10, Math.floor(intensity * 250)));
                var interval = setInterval(function() {
                    var elapsed = Date.now() - startTime;
                    if (elapsed >= duration) {
                        clearInterval(interval);
                        container.style.transform = 'none';
                    } else {
                        var factor = 1 - (elapsed / duration);
                        var rx = (Math.random() * 2 - 1) * maxOffset * factor;
                        var ry = (Math.random() * 2 - 1) * maxOffset * factor;
                        container.style.transform = 'translate(' + rx.toFixed(1) + 'px, ' + ry.toFixed(1) + 'px)';
                    }
                }, 25);
            }
        } catch (e) {}
    },

    activateBoost: function(gameInstance) {
        if (this.boost >= 100 && !this.isBoosting) {
            this.isBoosting = true;
            this.boostTimer = this.boostDuration;
            SoundEngine.playBoostActivate();
            this.triggerHugoQuote("HUGO: 'IT'S ALIVE! THE PIGEON-RAT HAS FULL POWER!'");
            this.shakeCamera(gameInstance, 0.015, 300);
            return true;
        }
        return false;
    },

    takeDamage: function(gameInstance, x, y) {
        if (this.invincibleTimer > 0 || this.isBoosting) {
            return false;
        }

        this.lives--;
        this.combo = 0; // reset combo on hit
        this.invincibleTimer = 1.6; // 1.6 seconds invulnerability
        SoundEngine.playHit();

        var quotes = [
            "HUGO: 'Careful! The stitches are tearing!'",
            "HUGO: 'The pigeon and rat are fighting each other!'",
            "HUGO: 'Dr. Hibbert will never let me finish!'"
        ];
        this.triggerHugoQuote(quotes[Math.floor(Math.random() * quotes.length)]);

        this.shakeCamera(gameInstance, 0.025, 350);

        if (x !== undefined && y !== undefined) {
            this.showFloatingText(x, y, "OUCH!", "#ff3333");
        }

        if (this.lives <= 0) {
            return true; // Game Over triggered
        }
        return false;
    },

    addHeart: function(x, y) {
        if (this.lives < this.maxLives) {
            this.lives++;
            SoundEngine.playHeart();
            this.showFloatingText(x, y, "+1 HP ❤️", "#ff4466");
        } else {
            this.addScore(500, x, y, "MAX HP BONUS!");
        }
    },

    update: function(dt) {
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer < 0) this.invincibleTimer = 0;
        }

        if (this.hugoQuoteTimer > 0) {
            this.hugoQuoteTimer -= dt;
            if (this.hugoQuoteTimer <= 0) {
                this.hugoQuote = '';
            }
        }

        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }

        if (this.isBoosting) {
            this.boostTimer -= dt;
            this.boost = Math.max(0, (this.boostTimer / this.boostDuration) * 100);
            if (this.boostTimer <= 0) {
                this.isBoosting = false;
                this.boost = 0;
            }
        }
    },

    showFloatingText: function(x, y, text, color) {
        if (!game || !game.add) return;
        var style = {
            font: "22px VT323, monospace",
            fill: color || "#ffff00",
            stroke: "#000000",
            strokeThickness: 4,
            align: "center"
        };
        var floatText = game.add.text(x, y, text, style);
        floatText.anchor.setTo(0.5, 0.5);
        
        var tween = game.add.tween(floatText).to({ y: y - 45, alpha: 0 }, 800, Phaser.Easing.Quadratic.Out, true);
        tween.onComplete.add(function() {
            floatText.destroy();
        });
    }
};

GameState.init();
