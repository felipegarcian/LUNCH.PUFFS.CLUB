// Universal In-Game HUD & Interactive Arcade Interface
var GameHUD = {
    group: null,
    scoreText: null,
    highScoreText: null,
    heartsGroup: null,
    waveText: null,
    comboText: null,
    boostBg: null,
    boostFill: null,
    boostLabel: null,
    warningBanner: null,
    boostButton: null,
    
    create: function(gameInstance, isRatMode) {
        // Create HUD group fixed to camera
        this.group = gameInstance.add.group();
        this.group.fixedToCamera = true;

        var fontStyle = { font: '20px VT323, monospace', fill: '#FFFFFF', stroke: '#000000', strokeThickness: 3 };
        var smallFontStyle = { font: '16px VT323, monospace', fill: '#CCCCCC', stroke: '#000000', strokeThickness: 2 };

        // Top Bar Background
        var topBarBmd = gameInstance.add.bitmapData(gameInstance.width, 42);
        topBarBmd.ctx.fillStyle = 'rgba(10, 15, 25, 0.85)';
        topBarBmd.ctx.fillRect(0, 0, gameInstance.width, 42);
        var topBar = gameInstance.add.image(0, 0, topBarBmd);
        this.group.add(topBar);

        // Score display
        this.scoreText = gameInstance.add.text(12, 10, 'SCORE: 0', { font: '22px VT323, monospace', fill: '#FFE600', stroke: '#000000', strokeThickness: 3 });
        this.group.add(this.scoreText);

        // High Score display
        this.highScoreText = gameInstance.add.text(gameInstance.width / 2, 10, 'BEST: ' + GameState.highScore, { font: '18px VT323, monospace', fill: '#00E5FF', stroke: '#000000', strokeThickness: 3 });
        this.highScoreText.anchor.set(0.5, 0);
        this.group.add(this.highScoreText);

        // Hearts Display
        this.heartsText = gameInstance.add.text(gameInstance.width - 12, 10, '❤️❤️❤️', { font: '20px VT323, monospace', fill: '#FF2A6D', stroke: '#000000', strokeThickness: 2 });
        this.heartsText.anchor.set(1, 0);
        this.group.add(this.heartsText);

        // Wave & Mode Indicator
        var modeName = isRatMode ? "🐀 RAT RUN" : "🕊️ PIGEON SKY";
        this.waveText = gameInstance.add.text(12, 48, 'WAVE ' + GameState.wave + ' | ' + modeName, { font: '18px VT323, monospace', fill: '#A0E7E5', stroke: '#000000', strokeThickness: 3 });
        this.group.add(this.waveText);

        // Combo Multiplier
        this.comboText = gameInstance.add.text(gameInstance.width - 12, 48, '', { font: '20px VT323, monospace', fill: '#FF0055', stroke: '#000000', strokeThickness: 3 });
        this.comboText.anchor.set(1, 0);
        this.group.add(this.comboText);

        // Boost Gauge Bar at Bottom
        var barWidth = 240;
        var barHeight = 16;
        var barX = (gameInstance.width - barWidth) / 2;
        var barY = gameInstance.height - 28;

        var bgBmd = gameInstance.add.bitmapData(barWidth, barHeight);
        bgBmd.ctx.fillStyle = 'rgba(20, 20, 30, 0.9)';
        bgBmd.ctx.fillRect(0, 0, barWidth, barHeight);
        bgBmd.ctx.strokeStyle = '#FFFFFF';
        bgBmd.ctx.lineWidth = 2;
        bgBmd.ctx.strokeRect(0, 0, barWidth, barHeight);
        this.boostBg = gameInstance.add.image(barX, barY, bgBmd);
        this.group.add(this.boostBg);

        this.boostFillBmd = gameInstance.add.bitmapData(barWidth - 4, barHeight - 4);
        this.boostFill = gameInstance.add.image(barX + 2, barY + 2, this.boostFillBmd);
        this.group.add(this.boostFill);

        this.boostLabel = gameInstance.add.text(gameInstance.width / 2, barY - 18, '⚡ POWER BOOST [SPACE / CLICK]', { font: '16px VT323, monospace', fill: '#FFFFFF', stroke: '#000000', strokeThickness: 3 });
        this.boostLabel.anchor.set(0.5, 0);
        this.group.add(this.boostLabel);

        // Warning Transform Banner (hidden by default)
        this.warningBanner = gameInstance.add.text(gameInstance.width / 2, 110, '', {
            font: '26px VT323, monospace',
            fill: '#FFEA00',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        });
        this.warningBanner.anchor.set(0.5);
        this.warningBanner.visible = false;
        this.group.add(this.warningBanner);

        // Hugo's Attic Lore Speech Bubble
        this.hugoBubbleGroup = gameInstance.add.group();
        this.hugoBubbleBmd = gameInstance.add.bitmapData(560, 36);
        this.hugoBubbleBmd.ctx.fillStyle = 'rgba(17, 24, 39, 0.92)';
        this.hugoBubbleBmd.ctx.fillRect(0, 0, 560, 36);
        this.hugoBubbleBmd.ctx.strokeStyle = '#FFD700'; // Simpsons Gold
        this.hugoBubbleBmd.ctx.lineWidth = 2;
        this.hugoBubbleBmd.ctx.strokeRect(1, 1, 558, 34);

        this.hugoBubbleBg = gameInstance.add.image(20, 78, this.hugoBubbleBmd);
        this.hugoBubbleText = gameInstance.add.text(280, 96, '', {
            font: '17px VT323, monospace',
            fill: '#FFF59D',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        });
        this.hugoBubbleText.anchor.set(0.5);

        this.hugoBubbleGroup.add(this.hugoBubbleBg);
        this.hugoBubbleGroup.add(this.hugoBubbleText);
        this.hugoBubbleGroup.visible = false;
        this.group.add(this.hugoBubbleGroup);

        // Virtual Touch Controls Overlay for Mobile & Easy Play
        this.createTouchControls(gameInstance, isRatMode);
    },

    createTouchControls: function(gameInstance, isRatMode) {
        var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth < 768;
        
        var touchGroup = gameInstance.add.group();
        touchGroup.fixedToCamera = true;
        this.group.add(touchGroup);

        var btnSize = 56;
        var btnBmd = gameInstance.add.bitmapData(btnSize, btnSize);
        btnBmd.ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        btnBmd.ctx.beginPath();
        btnBmd.ctx.arc(btnSize/2, btnSize/2, btnSize/2 - 2, 0, Math.PI*2);
        btnBmd.ctx.fill();
        btnBmd.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        btnBmd.ctx.lineWidth = 2;
        btnBmd.ctx.stroke();

        if (isRatMode) {
            // Left Button
            var leftBtn = gameInstance.add.button(16, gameInstance.height - 120, btnBmd, function() {
                if (typeof moveCarLeft === 'function') moveCarLeft();
            }, this);
            leftBtn.input.useHandCursor = true;
            touchGroup.add(leftBtn);

            var leftLabel = gameInstance.add.text(16 + btnSize/2, gameInstance.height - 120 + btnSize/2, '◀', { font: '28px VT323', fill: '#FFF', stroke: '#000', strokeThickness: 3 });
            leftLabel.anchor.set(0.5);
            touchGroup.add(leftLabel);

            // Right Button
            var rightBtn = gameInstance.add.button(86, gameInstance.height - 120, btnBmd, function() {
                if (typeof moveCarRight === 'function') moveCarRight();
            }, this);
            rightBtn.input.useHandCursor = true;
            touchGroup.add(rightBtn);

            var rightLabel = gameInstance.add.text(86 + btnSize/2, gameInstance.height - 120 + btnSize/2, '▶', { font: '28px VT323', fill: '#FFF', stroke: '#000', strokeThickness: 3 });
            rightLabel.anchor.set(0.5);
            touchGroup.add(rightLabel);
        }

        // Boost button on right
        var boostTouchBtn = gameInstance.add.button(gameInstance.width - 76, gameInstance.height - 120, btnBmd, function() {
            GameState.activateBoost(gameInstance);
        }, this);
        boostTouchBtn.input.useHandCursor = true;
        touchGroup.add(boostTouchBtn);

        var boostIcon = gameInstance.add.text(gameInstance.width - 76 + btnSize/2, gameInstance.height - 120 + btnSize/2, '⚡', { font: '28px VT323', fill: '#FFEA00', stroke: '#000', strokeThickness: 3 });
        boostIcon.anchor.set(0.5);
        touchGroup.add(boostIcon);
    },

    update: function(gameInstance, isRatMode, timeLeftToTransform) {
        if (!this.group || !this.scoreText) return;

        // Update Score
        this.scoreText.text = 'SCORE: ' + GameState.score;
        this.highScoreText.text = 'BEST: ' + GameState.highScore;

        // Update Hearts
        var heartsStr = '';
        for (var i = 0; i < GameState.maxLives; i++) {
            heartsStr += (i < GameState.lives) ? '❤️' : '🖤';
        }
        this.heartsText.text = heartsStr;

        // Update Combo
        if (GameState.combo > 1) {
            var mult = 1 + Math.floor(GameState.combo / 3);
            this.comboText.text = '🔥 ' + GameState.combo + ' COMBO (x' + mult + ')';
            this.comboText.visible = true;
        } else {
            this.comboText.visible = false;
        }

        // Update Boost Bar
        var fillWidth = Math.max(0, ((this.boostBg.width - 4) * (GameState.boost / GameState.boostMax)));
        var ctx = this.boostFillBmd.ctx;
        ctx.clearRect(0, 0, this.boostBg.width - 4, 12);

        if (GameState.isBoosting) {
            ctx.fillStyle = '#00FFFF';
            ctx.fillRect(0, 0, fillWidth, 12);
            this.boostLabel.text = '💥 SUPER OVERDRIVE ACTIVE! 💥';
            this.boostLabel.fill = '#00FFFF';
        } else if (GameState.boost >= 100) {
            // Pulsing rainbow/gold
            var hue = (gameInstance.time.now / 3) % 360;
            ctx.fillStyle = 'hsl(' + hue + ', 100%, 55%)';
            ctx.fillRect(0, 0, fillWidth, 12);
            this.boostLabel.text = '⚡ BOOST READY! [SPACE / TAP ⚡]';
            this.boostLabel.fill = '#FFFF00';
        } else {
            ctx.fillStyle = '#FF9100';
            ctx.fillRect(0, 0, fillWidth, 12);
            this.boostLabel.text = '⚡ POWER BOOST ' + Math.floor(GameState.boost) + '%';
            this.boostLabel.fill = '#CCCCCC';
        }
        this.boostFillBmd.dirty = true;

        // Transform countdown banner
        if (timeLeftToTransform !== undefined && timeLeftToTransform <= 3.5 && timeLeftToTransform > 0) {
            this.warningBanner.visible = true;
            this.warningBanner.text = '⚠️ SHIFTING REALMS IN ' + Math.ceil(timeLeftToTransform) + 's! ⚠️';
            this.warningBanner.scale.set(1 + 0.1 * Math.sin(gameInstance.time.now / 100));
        } else {
            this.warningBanner.visible = false;
        }

        // Hugo Attic Lore speech bubble update
        if (GameState.hugoQuote && GameState.hugoQuoteTimer > 0) {
            this.hugoBubbleGroup.visible = true;
            this.hugoBubbleText.text = GameState.hugoQuote;
        } else {
            this.hugoBubbleGroup.visible = false;
        }
    }
};
