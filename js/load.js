var loadState = 
{
	preload: function()
	{
		// Set background color
		game.stage.backgroundColor = "#0f1423";

		// Loading indicator
		var loadingText = game.add.text(game.world.centerX, game.world.centerY - 30, 'LOADING POWER...', {
			font: '32px VT323, monospace',
			fill: '#00E5FF'
		});
		loadingText.anchor.setTo(0.5);

		// MENU ASSETS
		game.load.image("logoRatPigeon", "assets/images/logoRatPigeon.png");

		// RAT ASSETS
		game.load.image("floor", "assets/images/floor.png");
		game.load.image("rat", "assets/images/mouse.png");
		game.load.image("obstacle", "assets/images/obstacle.png");
		game.load.image("car", "assets/images/car.png");

		// PIGEON ASSETS
		game.load.spritesheet('pigeon-fly', 'assets/images/pigeon-fly.png', 122, 92, 2);
		game.load.spritesheet('playerScratch', 'assets/images/dog_scratch.png', 116, 100, 2);
		game.load.spritesheet('playerDig', 'assets/images/dog_dig.png', 129, 100, 2);
		game.load.image('ground', 'assets/images/ground.png');
		game.load.image('wire', 'assets/images/wire.png');
		game.load.image('sky', 'assets/images/sky.png');
		
		game.load.image('cat-down', 'assets/images/cat-down.png');
		game.load.image('cat-top', 'assets/images/cat-top.png');

		// AUDIO
		game.load.audio('whine', ['assets/audio/whine.ogg', 'assets/audio/whine.mp3']);
		game.load.audio('bark', ['assets/audio/bark.ogg', 'assets/audio/bark.mp3']);

		// Generate procedural dynamic textures
		TextureGenerator.init(game);
	},

	create: function()
	{
		SoundEngine.init();
		game.state.start('menu');
	}
};
