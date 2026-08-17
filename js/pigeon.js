var pigeonState =
{
     create: function(){
          this.pigeonStateTime = game.time.totalElapsedSeconds();
          this.phaseDuration = game.rnd.integerInRange(9, 13);

          // set up background and ground layer
          this.game.world.setBounds(0, 0, 3500, this.game.height);
          this.background1 = this.add.tileSprite(0, 0, this.game.world.width, 600, 'sky');
          this.ground = this.add.tileSprite(0, this.game.height - 70, this.game.world.width, 70, 'ground');
          this.wire = this.add.tileSprite(0, 0, this.game.world.width, 50, 'wire');
          
          // create player and fly animation
          this.player = this.game.add.sprite(this.game.width / 3, this.game.height / 2, 'pigeon-fly');
          this.player.animations.add('fly');
          this.player.animations.play('fly', 10, true);
          this.player.anchor.setTo(0.5, 0.5);

          // Particle emitters
          this.featherEmitter = this.game.add.emitter(0, 0, 40);
          this.featherEmitter.makeParticles('feather_particle');
          this.featherEmitter.setAlpha(0.4, 0.9);
          this.featherEmitter.setScale(0.8, 1.4);
          this.featherEmitter.minParticleSpeed.set(-80, -30);
          this.featherEmitter.maxParticleSpeed.set(20, 60);

          this.sparkEmitter = this.game.add.emitter(0, 0, 50);
          this.sparkEmitter.makeParticles('spark_particle');
          this.sparkEmitter.setScale(0.8, 1.6);
          this.sparkEmitter.minParticleSpeed.set(-100, -100);
          this.sparkEmitter.maxParticleSpeed.set(100, 100);

          // Shield & Aura Sprite
          this.shieldSprite = this.game.add.sprite(0, 0, 'shield_bubble');
          this.shieldSprite.anchor.setTo(0.5, 0.5);
          this.shieldSprite.visible = false;

          // Snack & Pickups Group in Sky
          this.snackGroup = this.game.add.group();
          this.snackGroup.enableBody = true;

          this.pickupGroup = this.game.add.group();
          this.pickupGroup.enableBody = true;

          // Cats Groups
          this.generateCats();
          this.generateCatsDown();
          this.generateSkySnacks();

          // Bring in order
          this.game.world.bringToTop(this.background1);
          this.game.world.bringToTop(this.cats);
          this.game.world.bringToTop(this.catsD);
          this.game.world.bringToTop(this.snackGroup);
          this.game.world.bringToTop(this.pickupGroup);
          this.game.world.bringToTop(this.ground);
          this.game.world.bringToTop(this.wire);
          this.game.world.bringToTop(this.shieldSprite);
          this.game.world.bringToTop(this.player);

          // Physics setup
          this.game.physics.arcade.enable(this.player);
          this.game.physics.arcade.enable(this.ground);
          this.game.physics.arcade.enable(this.wire);

          this.player.body.gravity.y = 850;
          this.player.body.setSize(60, 48, 0, 0);
          
          this.ground.body.immovable = true;
          this.ground.body.allowGravity = false;

          this.wire.body.immovable = true;
          this.wire.body.allowGravity = false;

          this.player.alive = true; 
          this.stopped = false;
          this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

          // Inputs
          this.cursors = this.game.input.keyboard.createCursorKeys();
          this.wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
          this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
          this.shiftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
          this.swipe = this.game.input.activePointer;

          // Sounds
          this.barkSound = this.game.add.audio('bark');
          this.whineSound = this.game.add.audio('whine');
          
          // Switch back to Rat state
          this.switchTimer = this.game.time.events.add(Phaser.Timer.SECOND * this.phaseDuration, switchToRat, this);

          // Spawn HUD
          GameHUD.create(this.game, false);
     },

     generateSkySnacks: function() {
          var numSnacks = this.game.rnd.integerInRange(14, 22);
          for (var i = 0; i < numSnacks; i++) {
               var x = this.game.rnd.integerInRange(300, this.game.world.width - 200);
               var y = this.game.rnd.integerInRange(90, this.game.height - 140);
               var rand = Math.random();

               // 1. Bucket of Fish Heads ~ 10%
               if (rand < 0.10) {
                    var fish = this.snackGroup.create(x, y, 'snack_fish_head');
                    fish.anchor.set(0.5);
                    fish.isFishHead = true;
               }
               // 2. Surgical Needle ~ 10%
               else if (rand < 0.20) {
                    var needle = this.pickupGroup.create(x, y, 'pickup_needle');
                    needle.anchor.set(0.5);
                    needle.isNeedle = true;
               }
               // 3. Heart if damaged ~ 10%
               else if (GameState.lives < GameState.maxLives && rand < 0.30) {
                    var heart = this.pickupGroup.create(x, y, 'pickup_heart');
                    heart.anchor.set(0.5);
                    heart.isHeart = true;
               }
               // 4. Power Puff Orb ~ 15%
               else if (rand < 0.45) {
                    var puff = this.snackGroup.create(x, y, 'power_puff');
                    puff.anchor.set(0.5);
                    puff.isPuff = true;
               }
               // 5. French Fry / Crumb
               else {
                    var fry = this.snackGroup.create(x, y, 'snack_fry');
                    fry.anchor.set(0.5);
                    fry.isFry = true;
               }
          }
     },

     update: function(){
          var dt = this.game.time.physicsElapsed;
          GameState.update(dt);

          // Update shield/aura
          this.shieldSprite.x = this.player.x;
          this.shieldSprite.y = this.player.y;
          this.shieldSprite.visible = GameState.isBoosting || (GameState.invincibleTimer > 0);

          if (GameState.isBoosting) {
               this.shieldSprite.rotation += 0.1;
               this.shieldSprite.tint = 0x00ffff;
               // Magnet effect: pull all snacks towards player
               var px = this.player.x;
               var py = this.player.y;
               this.snackGroup.forEachAlive(function(snack) {
                    var dist = Phaser.Math.distance(snack.x, snack.y, px, py);
                    if (dist < 400) {
                         snack.x += (px - snack.x) * 0.12;
                         snack.y += (py - snack.y) * 0.12;
                    }
               });
          } else if (GameState.invincibleTimer > 0) {
               this.player.alpha = (Math.floor(this.game.time.now / 80) % 2 === 0) ? 0.3 : 1.0;
          } else {
               this.player.alpha = 1.0;
          }

          // Collisions with Ground and Wire
          this.game.physics.arcade.collide(this.player, this.ground, this.handleHazardHit, null, this);
          this.game.physics.arcade.collide(this.player, this.wire, this.handleHazardHit, null, this);

          // Collisions with Cats
          this.game.physics.arcade.overlap(this.player, this.cats, this.handleCatCollision, null, this);
          this.game.physics.arcade.overlap(this.player, this.catsD, this.handleCatCollision, null, this);

          // Overlap with Snacks
          this.game.physics.arcade.overlap(this.player, this.snackGroup, function(p, snack) {
               this.sparkEmitter.x = snack.x;
               this.sparkEmitter.y = snack.y;
               this.sparkEmitter.explode(300, 8);

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
          }, null, this);

          // Overlap with Pickups (Heart / Needle)
          this.game.physics.arcade.overlap(this.player, this.pickupGroup, function(p, pickup) {
               if (pickup.isHeart) {
                    GameState.addHeart(pickup.x, pickup.y);
               } else if (pickup.isNeedle) {
                    GameState.addStitchNeedle(pickup.x, pickup.y);
               }
               pickup.destroy();
          }, null, this);

          if (this.player.alive && !this.stopped) {
               var speedBase = GameState.isBoosting ? 260 : 160;
               this.player.body.velocity.x = speedBase + (GameState.wave * 10);
               
               // Wrap around infinite sky
               if (!this.wrapping && this.player.x < this.game.width) {
                    this.wrapping = true;
                    this.cats.destroy();
                    this.catsD.destroy();
                    this.snackGroup.destroy();
                    this.pickupGroup.destroy();
                    
                    this.snackGroup = this.game.add.group();
                    this.snackGroup.enableBody = true;
                    this.pickupGroup = this.game.add.group();
                    this.pickupGroup.enableBody = true;

                    this.generateCats();
                    this.generateCatsDown();
                    this.generateSkySnacks();

                    this.game.world.bringToTop(this.background1);
                    this.game.world.bringToTop(this.cats);
                    this.game.world.bringToTop(this.catsD);
                    this.game.world.bringToTop(this.snackGroup);
                    this.game.world.bringToTop(this.pickupGroup);
                    this.game.world.bringToTop(this.ground);
                    this.game.world.bringToTop(this.wire);
                    this.game.world.bringToTop(this.shieldSprite);
                    this.game.world.bringToTop(this.player);
               } else if (this.player.x >= this.game.width) {
                    this.wrapping = false;
               }

               // Jump / Flap Input
               if (this.cursors.up.isDown || this.wKey.isDown) {
                    this.playerJump();
               }
               if (this.game.input.activePointer.isDown && this.game.input.activePointer.y < this.game.height - 130) {
                    this.playerJump();
               }

               // Boost trigger
               if (this.shiftKey.isDown || (this.spaceKey.isDown && GameState.boost >= 100)) {
                    GameState.activateBoost(this.game);
               }

               this.game.world.wrap(this.player, -(this.game.width / 2), false, true, false);
          }

          // Passive Survival Score
          GameState.addScore(1);

          // Update HUD
          var timeLeft = this.phaseDuration - (this.game.time.totalElapsedSeconds() - this.pigeonStateTime);
          GameHUD.update(this.game, false, timeLeft);
     },

     playerJump: function() {
          if (this.player.body.velocity.y > -220) {
               this.player.body.velocity.y = -320;
               SoundEngine.playFlap();
               
               // Feather burst
               this.featherEmitter.x = this.player.x - 15;
               this.featherEmitter.y = this.player.y + 10;
               this.featherEmitter.emitParticle();
          }
     },

     handleCatCollision: function(player, cat) {
          if (GameState.isBoosting) {
               // Blast cat away!
               this.sparkEmitter.x = cat.x;
               this.sparkEmitter.y = cat.y;
               this.sparkEmitter.explode(400, 14);
               cat.destroy();
               GameState.obstaclesSmashed++;
               GameState.addScore(300, cat.x, cat.y, "SONIC BLAST!");
               SoundEngine.playSmash();
               GameState.shakeCamera(this.game, 0.015, 180);
          } else {
               this.handleHazardHit(player, cat);
          }
     },

     handleHazardHit: function(player, hazard) {
          var isDead = GameState.takeDamage(this.game, this.player.x, this.player.y);
          if (isDead) {
               this.stopped = true;
               this.player.alive = false;
               this.player.body.velocity.x = 0;
               this.player.body.velocity.y = 0;
               this.player.loadTexture('playerScratch');
               this.player.animations.play('scratch', 10, true);
               try { this.whineSound.play(); } catch(e){}
               SoundEngine.playGameOver();

               this.game.time.events.add(1200, function() {
                    message = "GAME OVER!\nScore: " + GameState.score + " pts | Wave: " + GameState.wave;
                    this.game.state.start("end");
               }, this);
          } else {
               // Bounce player back into safe zone
               this.player.body.velocity.y = (this.player.y > this.game.height / 2) ? -280 : 280;
          }
     },

     generateCats: function() {
          this.cats = this.game.add.group();
          var y = this.game.height - 145;
          this.cats.enableBody = true;

          var numCats = this.game.rnd.integerInRange(3, 6);
          for (var i = 0; i < numCats; i++) {
               var x = this.game.rnd.integerInRange(this.game.width, this.game.world.width - this.game.width);
               var cat = this.cats.create(x, y, 'cat-down');
               cat.body.velocity.x = this.game.rnd.integerInRange(-30, -10);
               cat.body.immovable = true;
               cat.body.collideWorldBounds = false;
               cat.body.setSize(28, 28, 0, 0);
          }
     },

     generateCatsDown: function() {
          this.catsD = this.game.add.group();
          var y = 65;
          this.catsD.enableBody = true;

          var numCats = this.game.rnd.integerInRange(3, 6);
          for (var i = 0; i < numCats; i++) {
               var x = this.game.rnd.integerInRange(this.game.width, this.game.world.width - this.game.width);
               var catD = this.catsD.create(x, y, 'cat-top');
               catD.body.velocity.x = this.game.rnd.integerInRange(-30, -10);
               catD.body.immovable = true;
               catD.body.collideWorldBounds = false;
               catD.body.setSize(28, 28, 0, 0);
          }
     }
};

function switchToRat() {
     SoundEngine.playTransform();
     SoundEngine.playHugoLaugh();
     GameState.wave++;
     GameState.triggerHugoQuote("HUGO: 'The rat tries to scurry into a mouse hole!'");
     GameState.addScore(1000, game.width / 2, game.height / 2, "WAVE BONUS!");
     game.state.start("rat");
}
