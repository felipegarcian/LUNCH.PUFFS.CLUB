var endState = 
{
	create: function()
	{
		this.game.world.setBounds(0, 0, this.game.width, this.game.height);
		this.game.stage.backgroundColor = "#0d111a";
		SoundEngine.stopBGM();

		// Particle background
		this.emitter = game.add.emitter(game.world.centerX, 0, 30);
		this.emitter.width = game.world.width;
		this.emitter.makeParticles('spark_particle');
		this.emitter.minParticleSpeed.set(0, 20);
		this.emitter.maxParticleSpeed.set(0, 80);
		this.emitter.setAlpha(0.15, 0.5);
		this.emitter.start(false, 3000, 250);

		// Calculate Stats & Grade
		var score = GameState.score;
		var highScore = GameState.highScore;
		var isNewBest = (score >= highScore && score > 0);
		var grade = 'C';
		var gradeColor = '#94A3B8';
		var hugoVerdict = "HUGO: 'Back to the attic... Need to stitch better!'";

		if (score >= 15000) {
			grade = 'S+';
			gradeColor = '#FFD700';
			hugoVerdict = "HUGO: 'MAGNIFICENT! Bart and I will be truly inseparable!'";
		} else if (score >= 9000) {
			grade = 'A';
			gradeColor = '#00FF66';
			hugoVerdict = "HUGO: 'A terrifying success! The Pigeon-Rat lives!'";
		} else if (score >= 4500) {
			grade = 'B';
			gradeColor = '#00E5FF';
			hugoVerdict = "HUGO: 'Not bad... but the fish heads made it too hyper!'";
		}

		// Game Over Title
		var titleText = game.add.text(game.world.centerX, 45, '★ EXPERIMENT SUMMARY ★', {
			font: '30px VT323, monospace',
			fill: '#FF2A6D',
			stroke: '#000000',
			strokeThickness: 5
		});
		titleText.anchor.setTo(0.5);

		// Grade Badge Card
		var rankText = game.add.text(game.world.centerX, 95, 'SPECIMEN RANK ' + grade, {
			font: '38px VT323, monospace',
			fill: gradeColor,
			stroke: '#000000',
			strokeThickness: 6
		});
		rankText.anchor.setTo(0.5);

		// Hugo's Verdict Banner
		var verdictText = game.add.text(game.world.centerX, 135, hugoVerdict, {
			font: '18px VT323, monospace',
			fill: '#FFF59D',
			stroke: '#000000',
			strokeThickness: 3,
			align: 'center'
		});
		verdictText.anchor.setTo(0.5);

		// New Best Notification
		if (isNewBest) {
			var newBestLabel = game.add.text(game.world.centerX, 168, '✨ NEW PERSONAL RECORD! ✨', {
				font: '18px VT323, monospace',
				fill: '#FFEA00',
				stroke: '#000000',
				strokeThickness: 3
			});
			newBestLabel.anchor.setTo(0.5);
			game.add.tween(newBestLabel.scale).to({ x: 1.1, y: 1.1 }, 500, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);
		}

		// Stats Breakdown Box
		var survivalTime = Math.max(1, Math.floor((Date.now() - GameState.gameStartTime) / 1000));
		var statsStr = 
			'FINAL SCORE:     ' + score + ' PTS\n' +
			'BEST RECORD:     ' + highScore + ' PTS\n' +
			'WAVE REACHED:    ' + GameState.wave + '\n' +
			'FISH HEADS EATEN: ' + GameState.fishHeadsEaten + ' 🐟\n' +
			'STITCHES SEWN:   ' + GameState.stitchesCollected + ' 🪡\n' +
			'SNACKS COLLECTED: ' + GameState.snacksCollected + ' 🧀\n' +
			'SMASHED IN BOOST: ' + GameState.obstaclesSmashed + ' 💥\n' +
			'MAX COMBO:       ' + GameState.maxCombo + 'x 🔥 | TIME: ' + survivalTime + 's ⏱️';

		var statsBox = game.add.text(game.world.centerX, 290, statsStr, {
			font: '19px VT323, monospace',
			fill: '#FFFFFF',
			stroke: '#000000',
			strokeThickness: 3,
			align: 'left',
			lineSpacing: 5
		});
		statsBox.anchor.setTo(0.5);

		// Return to Main Menu Button / Prompt
		var returnBtn = game.add.text(game.world.centerX, 470, '▶ PRESS ANY KEY OR CLICK TO RETURN TO MAIN MENU ◀', {
			font: '23px VT323, monospace',
			fill: '#00FF66',
			stroke: '#000000',
			strokeThickness: 4
		});
		returnBtn.anchor.setTo(0.5);
		game.add.tween(returnBtn.scale).to({ x: 1.07, y: 1.07 }, 550, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);

		// Menu return hint
		var menuHint = game.add.text(game.world.centerX, 525, 'Select another Level or review Hugo\'s Attic Lore in Menu', {
			font: '16px VT323, monospace',
			fill: '#94A3B8',
			stroke: '#000000',
			strokeThickness: 2
		});
		menuHint.anchor.setTo(0.5);

		// Any Key / Touch Input Handler (with slight delay so holding a key doesn't instantly dismiss)
		var canExit = false;
		game.time.events.add(200, function() {
			canExit = true;
		}, this);

		var handleExit = function() {
			if (!canExit) return;
			canExit = false;
			SoundEngine.playMenuBeep();
			game.state.start('menu');
		};

		// Listen to ANY keyboard key press
		game.input.keyboard.onDownCallback = function() {
			handleExit();
		};

		// Listen to ANY mouse click or touch tap
		game.input.onDown.addOnce(function() {
			handleExit();
		});
	},

	shutdown: function()
	{
		// Clean up global keyboard onDownCallback
		if (this.game && this.game.input && this.game.input.keyboard) {
			this.game.input.keyboard.onDownCallback = null;
		}
	}
};
