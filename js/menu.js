var firstTime = true;
var message = "";

var menuState = 
{
	selectedIndex: 0,
	levelButtons: [],
	levelTexts: [],
	selectorArrow: null,
	levelDescText: null,
	startBtnText: null,

	create: function()
	{
		this.game.world.setBounds(0, 0, this.game.width, this.game.height);
		this.game.stage.backgroundColor = "#0b101d";
		this.selectedIndex = GameState.selectedLevelIndex || 0;
		this.levelButtons = [];
		this.levelTexts = [];

		// Animated background grid particles
		this.emitter = game.add.emitter(game.world.centerX, 0, 35);
		this.emitter.width = game.world.width;
		this.emitter.makeParticles('spark_particle');
		this.emitter.minParticleSpeed.set(0, 30);
		this.emitter.maxParticleSpeed.set(0, 90);
		this.emitter.setAlpha(0.2, 0.6);
		this.emitter.setScale(0.5, 1.2);
		this.emitter.start(false, 3000, 200);

		// Game Logo
		var logo = game.add.sprite(game.world.centerX, 68, "logoRatPigeon");
		logo.anchor.setTo(0.5);
		logo.scale.setTo(0.68);
		game.add.tween(logo.scale).to({ x: 0.73, y: 0.73 }, 1200, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);

		// Subtitle & Lore Tag
		var subtitle = game.add.text(game.world.centerX, 122, '★ THE PIGEON-RAT: TURBO OVERDRIVE ★', {
			font: '19px VT323, monospace',
			fill: '#FFEA00',
			stroke: '#000000',
			strokeThickness: 4
		});
		subtitle.anchor.setTo(0.5);

		// High score banner
		var bestScore = GameState.highScore || 0;
		var hiScoreText = game.add.text(game.world.centerX, 148, '🏆 HIGH SCORE: ' + bestScore + ' PTS', {
			font: '18px VT323, monospace',
			fill: '#00E5FF',
			stroke: '#000000',
			strokeThickness: 3
		});
		hiScoreText.anchor.setTo(0.5);

		// LEVEL SELECTION HEADER
		var selectHeader = game.add.text(game.world.centerX, 185, '▼ CHOOSE YOUR LEVEL [ 1 / 2 / 3 / ◄ ► ] ▼', {
			font: '18px VT323, monospace',
			fill: '#FFD700',
			stroke: '#000000',
			strokeThickness: 3
		});
		selectHeader.anchor.setTo(0.5);

		// Create 3 Interactive Level Selection Cards
		var totalLevels = GameState.levels.length;
		var btnWidth = 175;
		var btnHeight = 65;
		var startX = 35;
		var spacing = 195;
		var btnY = 210;

		for (var i = 0; i < totalLevels; i++) {
			var lvl = GameState.levels[i];
			var x = startX + (i * spacing);

			// Card Bitmap Data
			var cardBmd = game.add.bitmapData(btnWidth, btnHeight);
			cardBmd.ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
			cardBmd.ctx.fillRect(0, 0, btnWidth, btnHeight);
			cardBmd.ctx.strokeStyle = (i === this.selectedIndex) ? '#FFD700' : '#334155';
			cardBmd.ctx.lineWidth = 3;
			cardBmd.ctx.strokeRect(1, 1, btnWidth - 2, btnHeight - 2);

			var btnSprite = game.add.sprite(x, btnY, cardBmd);
			btnSprite.inputEnabled = true;
			btnSprite.input.useHandCursor = true;
			btnSprite.levelIndex = i;

			(function(self, index) {
				btnSprite.events.onInputDown.add(function() {
					self.selectLevel(index);
					SoundEngine.playMenuBeep();
				});
			})(this, i);

			// Level Tag text
			var titleTxt = game.add.text(x + btnWidth / 2, btnY + 16, lvl.tag, {
				font: '18px VT323, monospace',
				fill: lvl.color,
				stroke: '#000000',
				strokeThickness: 3
			});
			titleTxt.anchor.setTo(0.5);

			var numTxt = game.add.text(x + btnWidth / 2, btnY + 42, 'LEVEL ' + lvl.number + ' (Press ' + lvl.number + ')', {
				font: '14px VT323, monospace',
				fill: '#94A3B8',
				stroke: '#000000',
				strokeThickness: 2
			});
			numTxt.anchor.setTo(0.5);

			this.levelButtons.push({
				sprite: btnSprite,
				bmd: cardBmd,
				title: titleTxt,
				num: numTxt,
				level: lvl
			});
		}

		// Active Level Detail Panel
		this.detailCardBmd = game.add.bitmapData(560, 95);
		this.detailCardBmd.ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
		this.detailCardBmd.ctx.fillRect(0, 0, 560, 95);
		this.detailCardBmd.ctx.strokeStyle = '#F59E0B';
		this.detailCardBmd.ctx.lineWidth = 2;
		this.detailCardBmd.ctx.strokeRect(1, 1, 558, 93);

		this.detailCard = game.add.sprite(20, 290, this.detailCardBmd);

		this.levelDescText = game.add.text(game.world.centerX, 335, '', {
			font: '17px VT323, monospace',
			fill: '#FFFFFF',
			stroke: '#000000',
			strokeThickness: 3,
			align: 'center',
			lineSpacing: 4
		});
		this.levelDescText.anchor.setTo(0.5);

		// Previous run result if any
		if (message) {
			var resultLabel = game.add.text(game.world.centerX, 415, message, {
				font: '19px VT323, monospace',
				fill: '#FF2A6D',
				stroke: '#000000',
				strokeThickness: 4,
				align: 'center'
			});
			resultLabel.anchor.setTo(0.5);
		}

		// Big Start Button / Label
		this.startBtnText = game.add.text(game.world.centerX, 475, '', {
			font: '25px VT323, monospace',
			fill: '#00FF66',
			stroke: '#000000',
			strokeThickness: 4
		});
		this.startBtnText.anchor.setTo(0.5);
		game.add.tween(this.startBtnText.scale).to({ x: 1.07, y: 1.07 }, 600, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);

		// Controls hint
		var hintText = game.add.text(game.world.centerX, 545, '[ ◄ / ► / 1-3 ] Select Level  |  [ SPACE / ENTER ] Play  |  [ M ] Mute', {
			font: '16px VT323, monospace',
			fill: '#94A3B8',
			stroke: '#000000',
			strokeThickness: 2
		});
		hintText.anchor.setTo(0.5);

		// Refresh Level UI
		this.updateLevelUI();

		// Keyboard controls setup
		var key1 = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
		var key2 = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
		var key3 = game.input.keyboard.addKey(Phaser.Keyboard.THREE);
		var num1 = game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_1);
		var num2 = game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_2);
		var num3 = game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_3);

		var leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
		var rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
		var aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
		var dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);

		var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		var mKey = game.input.keyboard.addKey(Phaser.Keyboard.M);

		key1.onDown.add(function() { this.selectLevel(0); }, this);
		num1.onDown.add(function() { this.selectLevel(0); }, this);
		key2.onDown.add(function() { this.selectLevel(1); }, this);
		num2.onDown.add(function() { this.selectLevel(1); }, this);
		key3.onDown.add(function() { this.selectLevel(2); }, this);
		num3.onDown.add(function() { this.selectLevel(2); }, this);

		leftKey.onDown.add(function() {
			var next = (this.selectedIndex - 1 + totalLevels) % totalLevels;
			this.selectLevel(next);
		}, this);
		aKey.onDown.add(function() {
			var next = (this.selectedIndex - 1 + totalLevels) % totalLevels;
			this.selectLevel(next);
		}, this);

		rightKey.onDown.add(function() {
			var next = (this.selectedIndex + 1) % totalLevels;
			this.selectLevel(next);
		}, this);
		dKey.onDown.add(function() {
			var next = (this.selectedIndex + 1) % totalLevels;
			this.selectLevel(next);
		}, this);

		spaceKey.onDown.addOnce(this.startCurrentLevel, this);
		enterKey.onDown.addOnce(this.startCurrentLevel, this);

		mKey.onDown.add(function() {
			var muted = SoundEngine.toggleMute();
			hintText.text = muted ? '🔇 SOUND MUTED' : '🔊 SOUND UNMUTED';
		}, this);

		// Click on Detail Card / Start button launches game
		this.detailCard.inputEnabled = true;
		this.detailCard.input.useHandCursor = true;
		this.detailCard.events.onInputDown.addOnce(this.startCurrentLevel, this);

		game.input.onDown.add(function(pointer) {
			// If clicked below level cards, launch current level
			if (pointer.y > 280) {
				menuState.startCurrentLevel();
			}
		});
	},

	selectLevel: function(index)
	{
		this.selectedIndex = index;
		GameState.selectedLevelIndex = index;
		this.updateLevelUI();
		SoundEngine.playMenuBeep();
	},

	updateLevelUI: function()
	{
		var curLevel = GameState.levels[this.selectedIndex];

		for (var i = 0; i < this.levelButtons.length; i++) {
			var btn = this.levelButtons[i];
			var isSelected = (i === this.selectedIndex);
			var ctx = btn.bmd.ctx;
			ctx.clearRect(0, 0, btn.bmd.width, btn.bmd.height);

			if (isSelected) {
				ctx.fillStyle = 'rgba(30, 41, 59, 0.98)';
				ctx.fillRect(0, 0, btn.bmd.width, btn.bmd.height);
				ctx.strokeStyle = '#FFD700'; // Gold border
				ctx.lineWidth = 4;
				ctx.strokeRect(2, 2, btn.bmd.width - 4, btn.bmd.height - 4);
				btn.num.fill = '#FFD700';
				btn.title.scale.set(1.08);
			} else {
				ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
				ctx.fillRect(0, 0, btn.bmd.width, btn.bmd.height);
				ctx.strokeStyle = '#334155';
				ctx.lineWidth = 2;
				ctx.strokeRect(1, 1, btn.bmd.width - 2, btn.bmd.height - 2);
				btn.num.fill = '#64748B';
				btn.title.scale.set(1.0);
			}
			btn.bmd.dirty = true;
		}

		if (this.levelDescText && curLevel) {
			this.levelDescText.text = 
				'★ ' + curLevel.name + ' ★\n' +
				curLevel.desc + '\n' +
				'🐟 Fish Heads = Overdrive  |  🪡 Stitches = Shield  |  Starting Wave: ' + curLevel.startWave;
		}

		if (this.startBtnText && curLevel) {
			this.startBtnText.text = '▶ START ' + curLevel.tag + ' (PRESS SPACE / CLICK) ◀';
		}
	},

	startCurrentLevel: function()
	{
		var level = GameState.levels[this.selectedIndex] || GameState.levels[0];
		SoundEngine.playMenuBeep();
		GameState.resetGame(this.selectedIndex);
		game.state.start(level.startState);
	}
};
