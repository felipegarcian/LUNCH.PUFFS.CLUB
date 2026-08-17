var rat;
var ratColor = 0xff0000;
var ratTurnSpeed = 180;

var obstacleGroup;
var snackGroup;
var pickupGroup;
var particleEmitter;
var smashEmitter;

var obstacleSpeed = 500;
var obstacleDelay = 420;

var road;
var cursors;
var wasdKeys;
var spaceKey;
var shiftKey;
var ratStateTime = 0;
var ratPhaseDuration = 9; // seconds per rat phase
var shieldSprite = null;

var ratState =
{
     create: function(){
          ratStateTime = game.time.totalElapsedSeconds();
          this.game.world.setBounds(0, 0, this.game.width, this.game.height);
          game.physics.startSystem(Phaser.Physics.ARCADE);

          // Scrolling road background
          road = game.add.tileSprite(0, 0, game.width, game.height, "floor");

          // Groups
          obstacleGroup = game.add.group();
          obstacleGroup.enableBody = true;

          snackGroup = game.add.group();
          snackGroup.enableBody = true;

          pickupGroup = game.add.group();
          pickupGroup.enableBody = true;

          // Particle emitters
          particleEmitter = game.add.emitter(0, 0, 50);
          particleEmitter.makeParticles('spark_particle');
          particleEmitter.setAlpha(0.3, 0.8);
          particleEmitter.setScale(0.6, 1.2);
          particleEmitter.minParticleSpeed.set(-30, -50);
          particleEmitter.maxParticleSpeed.set(30, 50);

          smashEmitter = game.add.emitter(0, 0, 60);
          smashEmitter.makeParticles('spark_particle');
          smashEmitter.setScale(1.0, 2.0);
          smashEmitter.minParticleSpeed.set(-150, -150);
          smashEmitter.maxParticleSpeed.set(150, 150);

          // Rat Player
          rat = game.add.sprite(game.width / 2, game.height - 70, "rat");
          rat.positions = [game.width / 6, game.width / 2, game.width - (game.width / 6)];
          rat.anchor.set(0.5);
          rat.canMove = true;
          rat.side = 1;
          rat.x = rat.positions[rat.side];
          game.physics.enable(rat, Phaser.Physics.ARCADE);
          rat.body.allowRotation = false;
          rat.body.moves = false;
          rat.body.setSize(44, 44, 0, 0);

          // Shield / Boost Aura
          shieldSprite = game.add.sprite(0, 0, 'shield_bubble');
          shieldSprite.anchor.set(0.5);
          shieldSprite.visible = false;

          // Keyboard setup
          cursors = this.input.keyboard.createCursorKeys();
          wasdKeys = {
              left: this.input.keyboard.addKey(Phaser.Keyboard.A),
              right: this.input.keyboard.addKey(Phaser.Keyboard.D),
              up: this.input.keyboard.addKey(Phaser.Keyboard.W)
          };
          spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
          shiftKey = this.input.keyboard.addKey(Phaser.Keyboard.SHIFT);

          // Progressive obstacle & snack spawning
          var currentDelay = Math.max(260, obstacleDelay - (GameState.wave * 20));
          this.obstacleTimer = game.time.events.loop(currentDelay, this.spawnObstacle, this);
          this.snackTimer = game.time.events.loop(550, this.spawnSnack, this);

          // Phase switch timer
          ratPhaseDuration = game.rnd.integerInRange(8, 12);
          this.switchTimer = game.time.events.add(Phaser.Timer.SECOND * ratPhaseDuration, switchToPigeon, this);

          // Create In-Game HUD
          GameHUD.create(game, true);
     },

     spawnObstacle: function() {
          var position = game.rnd.between(0, 2);
          var isCar = (Math.random() < 0.25 + (GameState.wave * 0.05));
          var obsType = isCar ? "car" : "obstacle";

          var obs = obstacleGroup.create(game.width * (position * 2 + 1) / 6, -40, obsType);
          obs.anchor.set(0.5);
          obs.isCar = isCar;
          obs.lane = position;
          
          var speedMultiplier = 1 + (GameState.wave * 0.08);
          obs.body.velocity.y = (isCar ? obstacleSpeed * 1.35 : obstacleSpeed) * speedMultiplier;
     },

     spawnSnack: function() {
          var position = game.rnd.between(0, 2);
          var x = game.width * (position * 2 + 1) / 6;
          var rand = Math.random();

          // 1. Bucket of Fish Heads (Hugo's favorite) ~ 10%
          if (rand < 0.10) {
               var fish = snackGroup.create(x, -30, 'snack_fish_head');
               fish.anchor.set(0.5);
               fish.body.velocity.y = obstacleSpeed * 0.9;
               fish.isFishHead = true;
          }
          // 2. Surgical Needle & Thread ~ 10%
          else if (rand < 0.20) {
               var needle = pickupGroup.create(x, -30, 'pickup_needle');
               needle.anchor.set(0.5);
               needle.body.velocity.y = obstacleSpeed * 0.9;
               needle.isNeedle = true;
          }
          // 3. Heart if damaged ~ 12%
          else if (GameState.lives < GameState.maxLives && rand < 0.32) {
               var heart = pickupGroup.create(x, -30, 'pickup_heart');
               heart.anchor.set(0.5);
               heart.body.velocity.y = obstacleSpeed * 0.85;
               heart.isHeart = true;
          }
          // 4. Power Puff Orb ~ 15%
          else if (rand < 0.45) {
               var puff = snackGroup.create(x, -30, 'power_puff');
               puff.anchor.set(0.5);
               puff.body.velocity.y = obstacleSpeed * 0.9;
               puff.isPuff = true;
          }
          // 5. Regular Cheese
          else {
               var cheese = snackGroup.create(x, -30, 'snack_cheese');
               cheese.anchor.set(0.5);
               cheese.body.velocity.y = obstacleSpeed * 0.9;
               cheese.isCheese = true;
          }
     },

     update: function(){
          var dt = game.time.physicsElapsed;
          GameState.update(dt);

          // Scroll road
          var scrollSpeed = GameState.isBoosting ? 14 : 7;
          road.tilePosition.y += scrollSpeed;

          // Update shield position
          shieldSprite.x = rat.x;
          shieldSprite.y = rat.y;
          shieldSprite.visible = GameState.isBoosting || (GameState.invincibleTimer > 0);
          if (GameState.isBoosting) {
               shieldSprite.rotation += 0.08;
               shieldSprite.tint = 0x00ffff;
          } else if (GameState.invincibleTimer > 0) {
               shieldSprite.tint = 0xffffff;
               rat.alpha = (Math.floor(game.time.now / 80) % 2 === 0) ? 0.3 : 1.0;
          } else {
               rat.alpha = 1.0;
          }

          // Boost emission trail
          if (GameState.isBoosting && Math.random() < 0.5) {
               particleEmitter.x = rat.x;
               particleEmitter.y = rat.y + 15;
               particleEmitter.emitParticle();
          }

          // Collisions with Obstacles
          game.physics.arcade.overlap(rat, obstacleGroup, function(player, obs) {
               if (GameState.isBoosting) {
                    // Smash obstacle!
                    smashEmitter.x = obs.x;
                    smashEmitter.y = obs.y;
                    smashEmitter.explode(400, 12);
                    obs.destroy();
                    GameState.obstaclesSmashed++;
                    GameState.addScore(300, obs.x, obs.y, "SMASH!");
                    SoundEngine.playSmash();
                    GameState.shakeCamera(game, 0.015, 180);
               } else {
                    var isDead = GameState.takeDamage(game, rat.x, rat.y);
                    obs.destroy();
                    if (isDead) {
                         triggerGameOver();
                    }
               }
          });

          // Overlap with Snacks (Cheese / Power Puff / Fish Heads)
          game.physics.arcade.overlap(rat, snackGroup, function(player, snack) {
               particleEmitter.x = snack.x;
               particleEmitter.y = snack.y;
               particleEmitter.explode(300, 8);

               if (snack.isFishHead) {
                    GameState.addFishHead(snack.x, snack.y);
               } else if (snack.isPuff) {
                    GameState.addBoost(50);
                    GameState.addScore(500, snack.x, snack.y, "MEGA PUFF!");
                    SoundEngine.playBoostReady();
               } else {
                    GameState.addSnack(snack.x, snack.y);
               }
               snack.destroy();
          });

          // Overlap with Pickups (Heart / Needle)
          game.physics.arcade.overlap(rat, pickupGroup, function(player, pickup) {
               if (pickup.isHeart) {
                    GameState.addHeart(pickup.x, pickup.y);
               } else if (pickup.isNeedle) {
                    GameState.addStitchNeedle(pickup.x, pickup.y);
               }
               pickup.destroy();
          });

          // Clean up offscreen obstacles & snacks
          obstacleGroup.forEachAlive(function(obs) {
               if (obs.y > game.height + 40) obs.destroy();
          });
          snackGroup.forEachAlive(function(s) {
               if (s.y > game.height + 40) s.destroy();
          });
          pickupGroup.forEachAlive(function(p) {
               if (p.y > game.height + 40) p.destroy();
          });

          // Controls
          if (cursors.left.isDown || wasdKeys.left.isDown) {
               moveCarLeft();
          }
          if (cursors.right.isDown || wasdKeys.right.isDown) {
               moveCarRight();
          }

          // Boost Activation Key
          if (spaceKey.isDown || shiftKey.isDown) {
               GameState.activateBoost(game);
          }

          // Passive Survival Score
          GameState.addScore(1);

          // Update HUD
          var timeLeft = ratPhaseDuration - (game.time.totalElapsedSeconds() - ratStateTime);
          GameHUD.update(game, true, timeLeft);
     }
};

function moveCarLeft(){
    if(rat.canMove){
         rat.canMove = false;
         rat.side = (rat.side - 1 >= 0 ? rat.side - 1 : 0);
         SoundEngine.playDash();
         var moveTween = game.add.tween(rat).to({
              x: rat.positions[rat.side],
         }, ratTurnSpeed, Phaser.Easing.Quadratic.Out, true);
         moveTween.onComplete.add(function(){
              rat.canMove = true;
         });
    }
}

function moveCarRight(){
    if(rat.canMove){
         rat.canMove = false;
         rat.side = (rat.side + 1 <= 2 ? rat.side + 1 : 2);
         SoundEngine.playDash();
         var moveTween = game.add.tween(rat).to({
              x: rat.positions[rat.side],
         }, ratTurnSpeed, Phaser.Easing.Quadratic.Out, true);
         moveTween.onComplete.add(function(){
              rat.canMove = true;
         });
    }
}

function switchToPigeon() {
    SoundEngine.playTransform();
    SoundEngine.playHugoLaugh();
    GameState.wave++;
    GameState.triggerHugoQuote("HUGO: 'The pigeon tries to fly out the broken attic window!'");
    GameState.addScore(1000, game.width / 2, game.height / 2, "WAVE BONUS!");
    game.state.start("pigeon");
}

function triggerGameOver() {
    rat.alive = false;
    rat.loadTexture('playerScratch');
    rat.animations.play('scratch', 10, true);
    SoundEngine.playGameOver();
    try { ratWhine.play(); } catch(e){}
    game.time.events.add(850, function() {
        message = "SPECIMEN DOWN!\nScore: " + GameState.score + " pts | Wave: " + GameState.wave;
        game.state.start("end");
    });
}
