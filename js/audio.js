// Web Audio Synthesizer & Sound FX Engine for Lunch Puff Club
var SoundEngine = (function() {
    var ctx = null;
    var isMuted = false;
    var musicPlaying = false;
    var musicTimer = null;
    var currentBpm = 135;
    var stepIndex = 0;

    function getAudioContext() {
        if (!ctx) {
            var AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                ctx = new AudioCtx();
            }
        }
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
        return ctx;
    }

    // Try unlocking on first user interaction
    ['click', 'keydown', 'touchstart'].forEach(function(evt) {
        window.addEventListener(evt, function() {
            if (ctx && ctx.state === 'suspended') {
                ctx.resume();
            }
        }, { once: true });
    });

    function playTone(freq, type, duration, gainVal, slideToFreq) {
        if (isMuted) return;
        var audioCtx = getAudioContext();
        if (!audioCtx) return;

        try {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();

            osc.type = type || 'square';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            if (slideToFreq) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(10, slideToFreq), audioCtx.currentTime + duration);
            }

            gain.gain.setValueAtTime(gainVal || 0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // Ignore audio context errors
        }
    }

    function playNoise(duration, gainVal) {
        if (isMuted) return;
        var audioCtx = getAudioContext();
        if (!audioCtx) return;

        try {
            var bufferSize = audioCtx.sampleRate * duration;
            var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            var output = buffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            var whiteNoise = audioCtx.createBufferSource();
            whiteNoise.buffer = buffer;

            var filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000;

            var gain = audioCtx.createGain();
            gain.gain.setValueAtTime(gainVal || 0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            whiteNoise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            whiteNoise.start();
        } catch (e) {}
    }

    return {
        init: function() {
            getAudioContext();
        },
        toggleMute: function() {
            isMuted = !isMuted;
            return isMuted;
        },
        isMuted: function() {
            return isMuted;
        },
        playDash: function() {
            playTone(320, 'triangle', 0.12, 0.2, 580);
        },
        playFlap: function() {
            playTone(280, 'sine', 0.14, 0.25, 480);
            playNoise(0.08, 0.1);
        },
        playCollect: function(combo) {
            combo = combo || 1;
            var baseFreq = 523.25; // C5
            var multiplier = Math.min(2.5, 1 + (combo * 0.15));
            playTone(baseFreq * multiplier, 'square', 0.12, 0.2, baseFreq * multiplier * 1.5);
            setTimeout(function() {
                playTone(baseFreq * multiplier * 1.5, 'sine', 0.15, 0.25);
            }, 60);
        },
        playBoostReady: function() {
            [440, 554, 659, 880].forEach(function(f, i) {
                setTimeout(function() {
                    playTone(f, 'sawtooth', 0.12, 0.25);
                }, i * 70);
            });
        },
        playBoostActivate: function() {
            playTone(200, 'sawtooth', 0.4, 0.35, 900);
            playNoise(0.3, 0.3);
        },
        playSmash: function() {
            playTone(150, 'square', 0.2, 0.3, 40);
            playNoise(0.25, 0.4);
        },
        playHit: function() {
            playTone(220, 'sawtooth', 0.25, 0.3, 60);
            playNoise(0.2, 0.35);
        },
        playHeart: function() {
            playTone(440, 'triangle', 0.12, 0.2);
            setTimeout(function() {
                playTone(660, 'triangle', 0.18, 0.25);
            }, 100);
        },
        playTransform: function() {
            [300, 450, 600, 750, 900, 1200].forEach(function(f, i) {
                setTimeout(function() {
                    playTone(f, 'sine', 0.1, 0.2, f * 1.2);
                }, i * 50);
            });
        },
        playGameOver: function() {
            var notes = [440, 415, 392, 349];
            notes.forEach(function(f, i) {
                setTimeout(function() {
                    playTone(f, 'sawtooth', 0.25, 0.25, f * 0.9);
                }, i * 180);
            });
        },
        playMenuBeep: function() {
            playTone(587.33, 'triangle', 0.08, 0.15);
        },
        playHugoLaugh: function() {
            // Evil Hugo attic chuckle
            var pitches = [260, 320, 240, 300, 220];
            pitches.forEach(function(f, i) {
                setTimeout(function() {
                    playTone(f, 'sawtooth', 0.09, 0.22, f * 0.85);
                }, i * 95);
            });
        },
        playFishHeadFeast: function() {
            // Fish heads fanfare: "Fish heads, fish heads, roly poly fish heads!"
            var notes = [523.25, 659.25, 783.99, 1046.50, 880, 1046.50];
            notes.forEach(function(f, i) {
                setTimeout(function() {
                    playTone(f, 'square', 0.12, 0.25, f * 1.05);
                }, i * 80);
            });
        },
        playStitchSound: function() {
            playTone(700, 'sawtooth', 0.06, 0.2, 300);
            setTimeout(function() {
                playTone(850, 'triangle', 0.1, 0.25, 450);
            }, 60);
        },
        // Chiptune Groove BGM generator
        startBGM: function(bpm) {
            if (musicPlaying) return;
            musicPlaying = true;
            currentBpm = bpm || 140;
            stepIndex = 0;

            var bassline = [110, 0, 110, 130.81, 146.83, 0, 130.81, 110, 98, 0, 98, 110, 130.81, 146.83, 164.81, 130.81];
            var melody = [0, 440, 0, 523.25, 0, 587.33, 0, 659.25, 0, 587.33, 0, 523.25, 440, 0, 392, 0];

            function tick() {
                if (!musicPlaying) return;
                var audioCtx = getAudioContext();
                if (audioCtx && !isMuted) {
                    var note = bassline[stepIndex % bassline.length];
                    if (note > 0) {
                        playTone(note, 'triangle', 0.1, 0.12);
                    }
                    if (stepIndex % 4 === 0) {
                        playNoise(0.04, 0.08); // Hi-hat click
                    }
                    if (stepIndex % 8 === 4) {
                        playNoise(0.08, 0.12); // Snare
                    }
                    var melNote = melody[stepIndex % melody.length];
                    if (melNote > 0 && Math.random() > 0.3) {
                        playTone(melNote, 'sine', 0.08, 0.06);
                    }
                }
                stepIndex++;
                var interval = (60 / currentBpm) * 250; // 16th note
                musicTimer = setTimeout(tick, interval);
            }
            tick();
        },
        setBpm: function(bpm) {
            currentBpm = bpm;
        },
        stopBGM: function() {
            musicPlaying = false;
            if (musicTimer) {
                clearTimeout(musicTimer);
                musicTimer = null;
            }
        }
    };
})();
