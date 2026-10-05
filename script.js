/**
 * Shafee's Birthday Website - Page 1 Script
 * Includes: Ambient Canvas, Music Box Synthesizer (Zero-dependency Web Audio API),
 * Local MP3 support, Photo customization, 3D card tilt, and Page navigation handling.
 */

// ==========================================
// 1. PHOTO CUSTOMIZATION & LOCAL STORAGE
// ==========================================
const herPhoto = document.getElementById('herPhoto');
const photoUploadInput = document.getElementById('photoUploadInput');
const royalFrame = document.getElementById('royalFrame');

// Restore saved photo from localStorage if user previously uploaded one
const savedPhoto = localStorage.getItem('shafee_custom_photo');
if (savedPhoto && herPhoto) {
    herPhoto.src = savedPhoto;
}

if (photoUploadInput) {
    photoUploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                herPhoto.src = evt.target.result;
                try {
                    localStorage.setItem('shafee_custom_photo', evt.target.result);
                } catch (err) {
                    console.log('Image too large for localStorage, displayed in session.');
                }
                createSparkleBurst(window.innerWidth / 2, window.innerHeight / 2, 25);
            };
            reader.readAsDataURL(file);
        }
    });
}

// 3D Tilt Effect on the Photo Frame for desktop
if (royalFrame) {
    royalFrame.addEventListener('mousemove', (e) => {
        const rect = royalFrame.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = -(y / rect.height) * 16;
        const rotateY = (x / rect.width) * 16;
        royalFrame.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });

    royalFrame.addEventListener('mouseleave', () => {
        royalFrame.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });

    // Clicking photo frame generates cute hearts
    royalFrame.addEventListener('click', (e) => {
        createHeartBurst(e.clientX, e.clientY, 12);
    });
}

// ==========================================
// 2. DEDICATED AUDIO SYSTEM (PAGE 1 EXCLUSIVE)
// ==========================================
// Current page state: 1 = Page 1 (Wishes), 2 = Page 2 (Gift Box)
let currentPage = 1;

class BirthdayMusicEngine {
    constructor() {
        this.isPlaying = false;
        this.bgAudio = document.getElementById('bgAudio');
        this.vinylDisc = document.getElementById('vinylDisc');
        this.equalizer = document.getElementById('equalizer');
        this.statusText = document.getElementById('musicStatusText');
        this.init();
    }

    init() {
        if (this.bgAudio) {
            // Strictly lock to assert/remo.mpeg
            this.bgAudio.src = 'assert/remo.mpeg';
            this.bgAudio.volume = 0.85;

            // STRICT ENFORCEMENT: Never allow Page 1 song to play if user is on Page 2
            this.bgAudio.addEventListener('play', () => {
                if (currentPage !== 1) {
                    this.bgAudio.pause();
                    this.bgAudio.currentTime = 0;
                }
            });
        }
    }

    play() {
        // STRICT RULE: Page 1 song can ONLY play if user is currently on Page 1
        if (currentPage !== 1) {
            this.stop();
            return;
        }

        this.isPlaying = true;
        this.updateUI(true);

        if (this.bgAudio) {
            // Permanently locked to assert/remo.mpeg
            if (!this.bgAudio.src.includes('remo.mpeg')) {
                this.bgAudio.src = 'assert/remo.mpeg';
            }
            this.bgAudio.volume = 0.85;
            const playPromise = this.bgAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    if (this.statusText) {
                        this.statusText.textContent = "Playing: Remo Song 🎶";
                    }
                }).catch((err) => {
                    console.log('User interaction required to start audio:', err);
                });
            }
        }
    }

    pause() {
        this.isPlaying = false;
        this.updateUI(false);
        if (this.bgAudio) {
            this.bgAudio.pause();
        }
        if (this.statusText) {
            this.statusText.textContent = "Paused 🎵";
        }
    }

    stop() {
        this.isPlaying = false;
        this.updateUI(false);
        if (this.bgAudio) {
            this.bgAudio.pause();
            this.bgAudio.currentTime = 0;
            this.bgAudio.volume = 0.85;
        }
        if (this.statusText) {
            this.statusText.textContent = "Tap to Play Song 🎵";
        }
    }

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    fadeOutAndStop(callback) {
        if (this.bgAudio && !this.bgAudio.paused) {
            let currentVol = this.bgAudio.volume;
            const fadeInterval = setInterval(() => {
                if (currentVol > 0.08) {
                    currentVol -= 0.08;
                    this.bgAudio.volume = Math.max(0, currentVol);
                } else {
                    clearInterval(fadeInterval);
                    this.stop();
                    if (callback) callback();
                }
            }, 50);
        } else {
            this.stop();
            if (callback) callback();
        }
    }

    updateUI(active) {
        if (active) {
            if (this.vinylDisc) this.vinylDisc.classList.add('playing');
            if (this.equalizer) this.equalizer.classList.add('active');
        } else {
            if (this.vinylDisc) this.vinylDisc.classList.remove('playing');
            if (this.equalizer) this.equalizer.classList.remove('active');
        }
    }
}

const musicEngine = new BirthdayMusicEngine();
const musicToggleBtn = document.getElementById('musicToggleBtn');

if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        musicEngine.toggle();
    });
}

// Auto-start audio smoothly on first interaction on the page ONLY if on Page 1
let hasInteracted = false;
document.addEventListener('click', function autoPlayOnFirstClick(e) {
    if (!hasInteracted && currentPage === 1 && !musicEngine.isPlaying) {
        hasInteracted = true;
        musicEngine.play();
    }
});


// ==========================================
// 3. AMBIENT PARTICLES (PETALS & SPARKLES)
// ==========================================
const canvas = document.getElementById('ambientCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const particles = [];
const TOTAL_PARTICLES = 45;

class AmbientParticle {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -20;
        this.type = Math.random() > 0.4 ? 'petal' : 'sparkle';
        this.size = this.type === 'petal' ? Math.random() * 8 + 6 : Math.random() * 4 + 2;
        this.speedY = Math.random() * 0.8 + 0.5;
        this.speedX = Math.sin(Math.random() * Math.PI) * 0.6;
        this.opacity = Math.random() * 0.6 + 0.3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 1.5;
        // Warm rose pink, lavender, and gold shades
        const colors = [
            'rgba(247, 168, 196, ', 
            'rgba(235, 137, 181, ', 
            'rgba(229, 177, 88, ', 
            'rgba(216, 180, 226, '
        ];
        this.baseColor = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y * 0.015) * 0.5 + this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
            this.reset(false);
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.baseColor + this.opacity + ')';

        if (this.type === 'petal') {
            // Elegant curved petal shape
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Twinkling sparkle star
            ctx.beginPath();
            const spikes = 4;
            const outerRadius = this.size;
            const innerRadius = this.size * 0.4;
            for (let i = 0; i < spikes * 2; i++) {
                const r = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / spikes;
                const sx = Math.cos(angle) * r;
                const sy = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
}

for (let i = 0; i < TOTAL_PARTICLES; i++) {
    particles.push(new AmbientParticle());
}

function renderAmbientScene() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(renderAmbientScene);
}
renderAmbientScene();


// ==========================================
// 4. CLICK SPARKLE & HEART BURST EFFECTS
// ==========================================
function createSparkleBurst(x, y, count = 18) {
    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.innerText = ['✨', '🌸', '💫', '💖'][Math.floor(Math.random() * 4)];
        span.style.position = 'fixed';
        span.style.left = `${x}px`;
        span.style.top = `${y}px`;
        span.style.fontSize = `${Math.random() * 16 + 14}px`;
        span.style.pointerEvents = 'none';
        span.style.zIndex = '9999';
        span.style.transition = 'all 1s cubic-bezier(0.1, 0.8, 0.3, 1)';
        document.body.appendChild(span);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 90 + 30;
        const destX = Math.cos(angle) * velocity;
        const destY = Math.sin(angle) * velocity;

        requestAnimationFrame(() => {
            span.style.transform = `translate(${destX}px, ${destY}px) scale(0)`;
            span.style.opacity = '0';
        });

        setTimeout(() => span.remove(), 1000);
    }
}

function createHeartBurst(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.position = 'fixed';
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.fontSize = `${Math.random() * 18 + 16}px`;
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '9999';
        heart.style.transition = 'all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
        document.body.appendChild(heart);

        const angle = (Math.PI * 2 / count) * i;
        const dist = Math.random() * 70 + 40;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 30;

        requestAnimationFrame(() => {
            heart.style.transform = `translate(${tx}px, ${ty}px) scale(1.4)`;
            heart.style.opacity = '0';
        });

        setTimeout(() => heart.remove(), 1200);
    }
}

// Sparkles on user click anywhere
document.addEventListener('click', (e) => {
    // Avoid double burst if clicking button
    if (e.target.closest('#btnNextPage') || e.target.closest('#musicPlayer')) return;
    createSparkleBurst(e.clientX, e.clientY, 8);
});


// ==========================================
// 5. PAGE NAVIGATION (PAGE 1 <-> PAGE 2 <-> PAGE 3)
// ==========================================
const page1Wrapper = document.getElementById('page1Wrapper');
const page2Wrapper = document.getElementById('page2Wrapper');
const page3Wrapper = document.getElementById('page3Wrapper');
const btnNextPage = document.getElementById('btnNextPage');
const btnBackToPage1 = document.getElementById('btnBackToPage1');
const btnBackToPage2 = document.getElementById('btnBackToPage2');
const btnReturnHome = document.getElementById('btnReturnHome');
const transitionCurtain = document.getElementById('transitionCurtain');
const musicPlayer = document.getElementById('musicPlayer');

function navigateToPage2() {
    currentPage = 2;

    // STRICT: Once Page 2 is loaded, Page 1 song and Page 3 celestial audio will stop
    musicEngine.stop();
    if (typeof celestialAudioEngine !== 'undefined') {
        celestialAudioEngine.stop();
    }
    closeCelestialModal();

    // Hide Page 1 music widget on Page 2
    if (musicPlayer) {
        musicPlayer.style.display = 'none';
    }

    const curtainTitle = document.querySelector('.curtain-title');
    const curtainSub = document.querySelector('.curtain-subtitle');
    const curtainHeart = document.querySelector('.curtain-heart');
    if (curtainTitle) curtainTitle.textContent = 'Opening Page 2...';
    if (curtainSub) curtainSub.textContent = 'Your birthday surprise is waiting inside ✨';
    if (curtainHeart) curtainHeart.textContent = '💖';

    // Trigger smooth transition curtain
    if (transitionCurtain) {
        transitionCurtain.classList.add('active');
        setTimeout(() => {
            document.body.classList.remove('page3-active');
            if (page1Wrapper) page1Wrapper.classList.add('page-hidden');
            if (page3Wrapper) page3Wrapper.classList.add('page-hidden');
            if (page2Wrapper) page2Wrapper.classList.remove('page-hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                transitionCurtain.classList.remove('active');
            }, 300);
        }, 700);
    }
}

function navigateToPage1() {
    currentPage = 1;

    // Stop any active file card music and celestial audio
    fileAudioEngine.stop();
    if (typeof celestialAudioEngine !== 'undefined') {
        celestialAudioEngine.stop();
    }
    closeCelestialModal();

    const curtainTitle = document.querySelector('.curtain-title');
    const curtainSub = document.querySelector('.curtain-subtitle');
    const curtainHeart = document.querySelector('.curtain-heart');
    if (curtainTitle) curtainTitle.textContent = 'Returning to Wishes...';
    if (curtainSub) curtainSub.textContent = 'Celebrating Shafee ✨';
    if (curtainHeart) curtainHeart.textContent = '💖';

    // Show Page 1 music widget again
    if (musicPlayer) {
        musicPlayer.style.display = 'flex';
    }

    if (transitionCurtain) {
        transitionCurtain.classList.add('active');
        setTimeout(() => {
            document.body.classList.remove('page3-active');
            if (page2Wrapper) page2Wrapper.classList.add('page-hidden');
            if (page3Wrapper) page3Wrapper.classList.add('page-hidden');
            if (page1Wrapper) page1Wrapper.classList.remove('page-hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                transitionCurtain.classList.remove('active');
                // Access restored: Page 1 song plays again when user revisits Page 1
                musicEngine.play();
            }, 300);
        }, 700);
    }
}

if (btnNextPage) {
    btnNextPage.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = btnNextPage.getBoundingClientRect();
        createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);
        createHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);
        navigateToPage2();
    });
}

if (btnBackToPage1) {
    btnBackToPage1.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateToPage1();
    });
}

if (btnBackToPage2) {
    btnBackToPage2.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateToPage2();
    });
}

if (btnReturnHome) {
    btnReturnHome.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateToPage1();
    });
}


// ==========================================
// 6. PAGE 2: GIFT BOX & RIBBON UNWRAP
// ==========================================
const giftStage = document.getElementById('giftStage');
const ribbonBow = document.getElementById('ribbonBow');
const boxStatusInstruction = document.getElementById('boxStatusInstruction');
const rewrapContainer = document.getElementById('rewrapContainer');
const btnRewrapBox = document.getElementById('btnRewrapBox');

// Play crystalline chime sweep when ribbon is unwrapped
function playUnwrapSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        
        chords.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startTime = ctx.currentTime + idx * 0.08;
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            
            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + 1.2);
        });
    } catch (err) {
        console.warn('Audio not initialized yet:', err);
    }
}

function unwrapGiftBox() {
    if (!giftStage || giftStage.classList.contains('box-unwrapped')) return;

    // Trigger sound & particle explosion
    playUnwrapSound();
    
    if (ribbonBow) {
        const rect = ribbonBow.getBoundingClientRect();
        createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
        createHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
    }

    // Add unwrapped state
    giftStage.classList.add('box-unwrapped');

    if (boxStatusInstruction) {
        boxStatusInstruction.innerHTML = '<span class="pulse-sparkle">✨</span> The gift box is unwrapped! Click any card to read it <span class="pulse-sparkle">✨</span>';
    }

    if (rewrapContainer) {
        rewrapContainer.style.display = 'flex';
    }
}

function rewrapGiftBox() {
    if (!giftStage) return;

    // Stop card music if box rewrapped
    fileAudioEngine.stop();

    giftStage.classList.remove('box-unwrapped');

    if (boxStatusInstruction) {
        boxStatusInstruction.innerHTML = '<span class="pulse-sparkle">✨</span> Tap the golden ribbon on the box to unwrap your surprise <span class="pulse-sparkle">✨</span>';
    }

    if (rewrapContainer) {
        rewrapContainer.style.display = 'none';
    }

    if (ribbonBow) {
        const rect = ribbonBow.getBoundingClientRect();
        createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);
    }
}

if (ribbonBow) {
    ribbonBow.addEventListener('click', (e) => {
        e.stopPropagation();
        unwrapGiftBox();
    });
    ribbonBow.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            unwrapGiftBox();
        }
    });
}

if (btnRewrapBox) {
    btnRewrapBox.addEventListener('click', (e) => {
        e.stopPropagation();
        rewrapGiftBox();
    });
}


// ==========================================
// 7. DEDICATED FILE CARD AUDIO ENGINE
// ==========================================
// Starts automatically when a file card opens, stops when closed.
// Allows user to assign custom songs per file card or place files in assert/ folder.

class FileCardAudioEngine {
    constructor() {
        this.cardAudio = document.getElementById('cardAudio');
        this.modalMusicSpin = document.getElementById('modalMusicSpin');
        this.modalEqualizer = document.getElementById('modalEqualizer');
        this.modalMusicName = document.getElementById('modalMusicName');
        this.modalMusicToggleBtn = document.getElementById('modalMusicToggleBtn');
        this.modalMusicChangeBtn = document.getElementById('modalMusicChangeBtn');
        this.cardAudioFileInput = document.getElementById('cardAudioFileInput');
        
        this.currentCardId = null;
        this.isPlaying = false;
        this.synthTimer = null;
        this.audioCtx = null;

        // Assigned custom songs for each gift card
        this.assignedSongs = {
            1: { 
                src: 'assert/Kannakuzhiya - GV Prakash Kumar _ Tamil.mp3', 
                fallback: 'assert/file1.mpeg', 
                name: 'Kannakuzhiya - GV Prakash 🎵' 
            },
            2: { 
                src: 'assert/ayan_song_whistle.mp3', 
                fallback: 'assert/file2.mpeg', 
                name: 'Ayan Whistle Theme 🎵' 
            },
            3: { 
                src: 'assert/tamil_flute_ringtone.mp3', 
                fallback: 'assert/file3.mpeg', 
                name: 'Tamil Flute Ringtone 🎵' 
            }
        };

        this.init();
    }

    init() {
        if (this.modalMusicToggleBtn) {
            this.modalMusicToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }

        if (this.modalMusicChangeBtn && this.cardAudioFileInput) {
            this.modalMusicChangeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.cardAudioFileInput.click();
            });

            this.cardAudioFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && this.currentCardId) {
                    const objectUrl = URL.createObjectURL(file);
                    this.assignedSongs[this.currentCardId] = {
                        src: objectUrl,
                        name: file.name
                    };
                    this.playForCard(this.currentCardId);
                }
            });
        }
    }

    getAudioContext() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    // Gentle chime synthesizer for card fallback melodies
    playSynthNote(freq, time, duration = 1.0, gainLevel = 0.2) {
        if (!this.isPlaying) return;
        try {
            const ctx = this.getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.001, time);
            gain.gain.exponentialRampToValueAtTime(gainLevel, time + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(time);
            osc.stop(time + duration);
        } catch (e) {
            console.warn(e);
        }
    }

    startSynthMelodyForCard(cardId) {
        this.stopSynth();
        const ctx = this.getAudioContext();

        // 3 Distinct Chime Melodies for each card
        const melodies = {
            1: [ // Sweet joyful melody
                { f: 523.25, d: 0.4 }, { f: 659.25, d: 0.4 }, { f: 783.99, d: 0.6 },
                { f: 880.00, d: 0.5 }, { f: 783.99, d: 0.4 }, { f: 1046.50, d: 0.9 }
            ],
            2: [ // Gentle romantic letter melody
                { f: 440.00, d: 0.5 }, { f: 523.25, d: 0.5 }, { f: 659.25, d: 0.7 },
                { f: 587.33, d: 0.5 }, { f: 523.25, d: 0.8 }, { f: 493.88, d: 1.0 }
            ],
            3: [ // Magical celebratory melody
                { f: 587.33, d: 0.35 }, { f: 783.99, d: 0.4 }, { f: 880.00, d: 0.4 },
                { f: 987.77, d: 0.6 }, { f: 880.00, d: 0.4 }, { f: 1174.66, d: 1.1 }
            ]
        };

        const notes = melodies[cardId] || melodies[1];
        let idx = 0;

        const loop = () => {
            if (!this.isPlaying) return;
            const n = notes[idx];
            const now = ctx.currentTime;
            this.playSynthNote(n.f, now, n.d * 1.5, 0.2);
            idx = (idx + 1) % notes.length;
            this.synthTimer = setTimeout(loop, n.d * 1200);
        };
        loop();
    }

    stopSynth() {
        if (this.synthTimer) {
            clearTimeout(this.synthTimer);
            this.synthTimer = null;
        }
    }

    playForCard(cardId) {
        this.currentCardId = cardId;
        this.isPlaying = true;
        this.updateUI(true);

        const songConfig = this.assignedSongs[cardId];
        const songName = songConfig ? songConfig.name : `File #0${cardId} Song 🎶`;
        
        if (this.modalMusicName) {
            this.modalMusicName.textContent = songName;
        }

        if (this.cardAudio && songConfig) {
            this.cardAudio.src = songConfig.src;
            const playPromise = this.cardAudio.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.stopSynth();
                }).catch(() => {
                    // Try fallback source or synth
                    if (songConfig.fallback) {
                        this.cardAudio.src = songConfig.fallback;
                        this.cardAudio.play().catch(() => {
                            this.startSynthMelodyForCard(cardId);
                        });
                    } else {
                        this.startSynthMelodyForCard(cardId);
                    }
                });
            }
        } else {
            this.startSynthMelodyForCard(cardId);
        }
    }

    pause() {
        this.isPlaying = false;
        this.updateUI(false);
        this.stopSynth();
        if (this.cardAudio) {
            this.cardAudio.pause();
        }
    }

    stop() {
        this.isPlaying = false;
        this.updateUI(false);
        this.stopSynth();
        if (this.cardAudio) {
            this.cardAudio.pause();
            this.cardAudio.currentTime = 0;
        }
        this.currentCardId = null;
    }

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else if (this.currentCardId) {
            this.playForCard(this.currentCardId);
        }
    }

    updateUI(active) {
        if (active) {
            if (this.modalMusicSpin) this.modalMusicSpin.classList.add('playing');
            if (this.modalEqualizer) this.modalEqualizer.classList.add('active');
            if (this.modalMusicToggleBtn) this.modalMusicToggleBtn.textContent = '⏸';
        } else {
            if (this.modalMusicSpin) this.modalMusicSpin.classList.remove('playing');
            if (this.modalEqualizer) this.modalEqualizer.classList.remove('active');
            if (this.modalMusicToggleBtn) this.modalMusicToggleBtn.textContent = '▶';
        }
    }
}

const fileAudioEngine = new FileCardAudioEngine();


// ==========================================
// 8. 3 FILE-LIKE GIFT CARDS & MODAL READING
// ==========================================
const cardModal = document.getElementById('cardModal');
const modalCardBody = document.getElementById('modalCardBody');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalBackdrop = document.getElementById('modalBackdrop');
const fileCards = document.querySelectorAll('.gift-file-card');

// Card contents data with attractive, simple, and pleasant slogans
const cardContents = {
    1: {
        tag: '🌸 File #01: Her Sweet Smile',
        title: 'The Light You Bring',
        subtitle: 'A smile that makes everything brighter ✨',
        image: 'assert/WhatsApp Image 2026-10-05 at 20.11.25 (1).jpeg',
        caption: '“Keep smiling, because your smile makes life so much more beautiful.” 🌸',
        slogan: '“Some people make the world a little softer, a little brighter, and a lot more wonderful — just by being in it.”',
        body: `Dear Shafee,<br><br>Your smile carries a gentle warmth that turns simple days into sweet memories. May your life always be filled with reasons to laugh freely, smile radiantly, and feel deeply loved.`
    },
    2: {
        tag: '💌 File #02: From The Heart',
        title: 'Words Just For You',
        subtitle: 'A sweet and pleasant wish for your heart 💖',
        image: null,
        slogan: '“May your heart always be at peace, your days painted with joy, and your journey blessed with endless love.”',
        body: `Dear Shafee,<br><br>On this special day, I hope you remember how truly wonderful you are. You have a heart of pure gold and a kindness that touches everyone around you.<br><br>May the year ahead bring you quiet peace, gentle happiness, and dreams that unfold into beautiful reality. Happy Birthday! 💖`
    },
    3: {
        tag: '🌟 File #03: Golden Wishes',
        title: 'Wishes For Shafee',
        subtitle: 'Sweet blessings wrapped with love for Shafee ✨',
        image: null,
        isWishlist: true,
        slogan: '“May every step you take lead to happiness, and every tomorrow be sweeter than today.”',
        wishes: [
            '🌸 365 Days of Sweet Smiles & Gentle Peace for Shafee',
            '✨ Beautiful Dreams Coming True, One by One',
            '💖 Warm Hearts, True Friends & Endless Love',
            '🎂 Countless Joyful Moments & Sweet Memories'
        ]
    }
};

function openCardModal(cardId) {
    const data = cardContents[cardId];
    if (!data || !modalCardBody || !cardModal) return;

    let contentHtml = `
        <div class="modal-file-tag">${data.tag}</div>
        <h3 class="modal-title">${data.title}</h3>
        <p class="modal-subtitle">${data.subtitle}</p>
    `;

    if (data.image) {
        contentHtml += `
            <div class="modal-photo-wrapper">
                <img src="${data.image}" alt="Shafee photo">
            </div>
            <p style="font-size: 0.9rem; color: #863d80; font-weight: 600; margin-bottom: 1rem; text-align: center;">${data.caption}</p>
        `;
    }

    if (data.slogan) {
        contentHtml += `
            <div class="modal-slogan-card">
                <p class="modal-slogan-quote">${data.slogan}</p>
            </div>
        `;
    }

    if (data.body) {
        contentHtml += `<div class="modal-body-text">${data.body}</div>`;
    }

    if (data.isWishlist && data.wishes) {
        contentHtml += `
            <ul class="modal-wishes-list">
                ${data.wishes.map(w => `<li><span>✨</span> ${w}</li>`).join('')}
            </ul>
            <button class="btn-make-wish" id="btnMakeWishModal">
                <span>🎂 Make a Birthday Wish!</span>
            </button>
        `;
    }

    modalCardBody.innerHTML = contentHtml;
    cardModal.classList.add('active');

    // "The music will start automatically when the file open"
    fileAudioEngine.playForCard(cardId);

    // Attach wish button trigger inside modal
    const btnWish = document.getElementById('btnMakeWishModal');
    if (btnWish) {
        btnWish.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = btnWish.getBoundingClientRect();
            createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 50);
            createHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
            btnWish.innerHTML = '<span>✨ Traveling to the Stars... 🌙</span>';
            btnWish.style.background = 'linear-gradient(135deg, #10b981, #059669)';

            setTimeout(() => {
                closeCardModal();
                navigateToPage3();
            }, 600);
        });
    }
}

function closeCardModal() {
    if (cardModal) {
        cardModal.classList.remove('active');
    }
    // "Stop music when file is closed"
    fileAudioEngine.stop();
}

fileCards.forEach(card => {
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        // If the box isn't unwrapped yet, unwrap it first!
        if (!giftStage.classList.contains('box-unwrapped')) {
            unwrapGiftBox();
            setTimeout(() => {
                const cardId = card.getAttribute('data-card');
                openCardModal(cardId);
            }, 600);
        } else {
            const cardId = card.getAttribute('data-card');
            openCardModal(cardId);
        }
    });
});

if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeCardModal);
}

if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeCardModal);
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCardModal();
        closeCelestialModal();
    }
});


// ==========================================================================
// 9. PAGE 3: NIGHT SKY, 2-SEC FIREWORKS, 6 STARS & CELESTIAL PHOTO FRAME
// ==========================================================================
const page3HeadingContainer = document.getElementById('page3HeadingContainer');
const starSweetyPopup = document.getElementById('starSweetyPopup');
const btnReplayFireworks = document.getElementById('btnReplayFireworks');

const celestialModal = document.getElementById('celestialModal');
const celestialCloseBtn = document.getElementById('celestialCloseBtn');
const celestialBackdrop = document.getElementById('celestialBackdrop');
const celestialHerPhoto = document.getElementById('celestialHerPhoto');
const celestialModalTitle = document.getElementById('celestialModalTitle');
const celestialModalCaption = document.getElementById('celestialModalCaption');
const celestialTagText = document.getElementById('celestialTagText');
const cPhotoUploadInput = document.getElementById('cPhotoUploadInput');
const switcherBtns = document.querySelectorAll('.c-switcher-btn');
const celestialStars = document.querySelectorAll('.celestial-star');

let currentStarIndex = 1;
let fireworksAnimId = null;

// The 6 Stars Photo, Audio and Wish Data
const starMemoriesData = {
    1: {
        tag: 'Star Memory #1',
        title: 'The Radiant Queen 👑',
        image: 'assert/WhatsApp Image 2026-10-05 at 20.11.25 (2).jpeg',
        audio: 'assert/Pesamale.mp3',
        fallbackAudio: 'assert/Kannakuzhiya - GV Prakash Kumar _ Tamil.mp3',
        songName: 'Pesamale 🎵',
        caption: '“To my dearest Mam — a smile so bright, even the moon pauses to admire you. Happy Birthday My Mam!” 💖'
    },
    2: {
        tag: 'Star Memory #2',
        title: 'Sweet & Serene 🍃',
        image: 'assert/WhatsApp Image 2026-10-05 at 20.11.25.jpeg',
        audio: 'assert/naan_pizhai.mp3',
        fallbackAudio: 'assert/ayan_song_whistle.mp3',
        songName: 'Naan Pizhai 🎵',
        caption: '“Your gentle warmth turns ordinary days into sweet starlit memories. Keep smiling always.” 🌸'
    },
    3: {
        tag: 'Star Memory #3',
        title: 'Pure Grace & Charm 🌹',
        image: 'assert/WhatsApp Image 2026-10-05 at 20.11.26.jpeg',
        audio: 'assert/Kadhalaada-Downringtone.com.mp3',
        fallbackAudio: 'assert/remo.mpeg',
        songName: 'Kadhalaada 🎵',
        caption: '“No matter how dark the night gets, your presence always brings the sunrise.” ✨'
    },
    4: {
        tag: 'Star Memory #4',
        title: 'Joyous Celebrations 🎉',
        image: 'assert/WhatsApp Image 2026-10-05 at 20.13.14.jpeg',
        audio: 'assert/_Kamban_Solla_Vandhu_Kurumugil_Sita_Raman_Tamil_Ringtone_(by Fringster.com).mp3',
        fallbackAudio: 'assert/tamil_flute_ringtone.mp3',
        songName: 'Kurumugil - Sita Ramam 🎵',
        caption: '“May every tomorrow be wrapped in sweet laughter, celestial light, and endless blessings.” 🎂'
    },
    5: {
        tag: 'Star Memory #5',
        title: 'Timeless Royal Grace 👑',
        image: 'assert/WhatsApp Image 2026-10-05 at 20.13.15.jpeg',
        audio: 'assert/_Vinnellaam_Mozhi_Minnum_Theethiriyaai_Brahmastra_Song_Tamil_Ringtone_(by Fringster.com).mp3',
        fallbackAudio: 'assert/file1.mp3',
        songName: 'Theethiriyaai - Brahmāstra 🎵',
        caption: '“Dignity, kindness, and royal beauty that inspires everyone who knows you.” 🌟'
    },
    6: {
        tag: 'Star Memory #6',
        title: 'Playful Moments 💫',
        image: 'assert/WhatsApp Image 2026-10-05 at 20.16.49.jpeg',
        audio: 'assert/_Oththa_Seruppu_Kulirudha_Pulla_Telugu_Song_Ringtone_(by Fringster.com).mp3',
        fallbackAudio: 'assert/file2.mp3',
        songName: 'Kulirudha Pulla - Oththa Seruppu 🎵',
        caption: '“Keep shining, keep smiling, and never stop being your wonderful self!” 💖'
    }
};

function navigateToPage3() {
    currentPage = 3;

    // Stop card audio and page 1 music
    fileAudioEngine.stop();
    musicEngine.stop();
    if (musicPlayer) musicPlayer.style.display = 'none';

    // Update curtain text for Page 3
    const curtainTitle = document.querySelector('.curtain-title');
    const curtainSub = document.querySelector('.curtain-subtitle');
    const curtainHeart = document.querySelector('.curtain-heart');
    if (curtainTitle) curtainTitle.textContent = 'Traveling to the Stars... 🌙';
    if (curtainSub) curtainSub.textContent = 'A magical midnight celebration awaits ✨';
    if (curtainHeart) curtainHeart.textContent = '✨';

    if (transitionCurtain) {
        transitionCurtain.classList.add('active');
        setTimeout(() => {
            document.body.classList.add('page3-active');
            if (page1Wrapper) page1Wrapper.classList.add('page-hidden');
            if (page2Wrapper) page2Wrapper.classList.add('page-hidden');
            if (page3Wrapper) page3Wrapper.classList.remove('page-hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Reset heading & popup
            if (page3HeadingContainer) page3HeadingContainer.classList.remove('revealed');
            if (starSweetyPopup) starSweetyPopup.classList.remove('revealed');

            setTimeout(() => {
                transitionCurtain.classList.remove('active');
                // Launch the 2-second fireworks celebration!
                startFireworksShow();
            }, 300);
        }, 700);
    }
}

function startFireworksShow() {
    // Reset heading & popup state during show
    if (page3HeadingContainer) page3HeadingContainer.classList.remove('revealed');
    if (starSweetyPopup) starSweetyPopup.classList.remove('revealed');

    // Run fireworks show strictly completed within 2 seconds
    runFireworksEngine(2000, () => {
        // After completing the 2-second fireworks:
        // 1. Give beautiful glowing heading: (happy birthday my mam)
        if (page3HeadingContainer) {
            page3HeadingContainer.classList.add('revealed');
        }

        // 2. Give small popup down to the star: (click the star , sweety)
        if (starSweetyPopup) {
            starSweetyPopup.classList.add('revealed');
        }

        // Gentle celebratory chime note
        fileAudioEngine.playSynthNote(880.00, fileAudioEngine.getAudioContext().currentTime, 1.2, 0.25);
        fileAudioEngine.playSynthNote(1046.50, fileAudioEngine.getAudioContext().currentTime + 0.2, 1.4, 0.25);

        // Stardust burst at Star 1
        const star1 = document.getElementById('star1');
        if (star1) {
            const rect = star1.getBoundingClientRect();
            createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
        }
    });
}
// Backward-compatible alias
const startFiveSecondFireworks = startFireworksShow;

// 2-Second Fireworks Canvas Engine (strictly completes within 2 sec alone)
function runFireworksEngine(durationMs, onComplete) {
    const canvas = document.getElementById('fireworksCanvas');
    if (!canvas) {
        if (onComplete) onComplete();
        return;
    }

    if (fireworksAnimId) {
        cancelAnimationFrame(fireworksAnimId);
        fireworksAnimId = null;
    }

    const card = document.getElementById('nightSkyCard');
    canvas.width = (card && card.clientWidth) ? card.clientWidth : window.innerWidth;
    canvas.height = (card && card.clientHeight) ? card.clientHeight : 740;
    const ctx = canvas.getContext('2d');

    const particles = [];
    const rockets = [];
    const colors = ['#f5b041', '#ffeaa7', '#ff4757', '#ff6b81', '#a55eea', '#54a0ff', '#2ed573', '#f368e0', '#ffd32a', '#ff9ff3'];
    const startTime = performance.now();
    let isSpawning = true;
    let lastRocketTime = 0;

    function playFireworkBoom() {
        try {
            const ctxA = fileAudioEngine.getAudioContext();
            const osc = ctxA.createOscillator();
            const gain = ctxA.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(240, ctxA.currentTime);
            osc.frequency.exponentialRampToValueAtTime(60, ctxA.currentTime + 0.25);
            gain.gain.setValueAtTime(0.09, ctxA.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctxA.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(ctxA.destination);
            osc.start();
            osc.stop(ctxA.currentTime + 0.25);
        } catch (e) {
            // Audio context policy safe fallback
        }
    }

    function createRocket() {
        const x = Math.random() * (canvas.width * 0.8) + (canvas.width * 0.1);
        const targetY = Math.random() * (canvas.height * 0.40) + (canvas.height * 0.14);
        const color = colors[Math.floor(Math.random() * colors.length)];
        rockets.push({
            x,
            y: canvas.height,
            targetY,
            speedY: -(Math.random() * 4 + 11.5), // fast ascent so explosions occur swiftly
            color
        });
    }

    function explode(x, y, color) {
        playFireworkBoom();
        const count = 48 + Math.floor(Math.random() * 28);
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
            const speed = Math.random() * 4.6 + 1.2;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.034 + 0.024, // swift decay so bursts conclude cleanly within 2s
                color,
                size: Math.random() * 2.3 + 1.3
            });
        }
    }

    // Launch first batch instantly at t=0
    createRocket();
    createRocket();

    function render(currentTime) {
        const elapsed = currentTime - startTime;

        // Stop launching rockets after ~1050ms so all particles disperse before 2000ms
        if (elapsed >= Math.min(1050, durationMs * 0.55)) {
            isSpawning = false;
        }

        if (isSpawning && currentTime - lastRocketTime > 200) {
            createRocket();
            if (Math.random() > 0.45) createRocket();
            lastRocketTime = currentTime;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw and update rockets
        for (let i = rockets.length - 1; i >= 0; i--) {
            const r = rockets[i];
            r.y += r.speedY;

            ctx.beginPath();
            ctx.arc(r.x, r.y, 2.8, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 12;
            ctx.shadowColor = r.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (r.y <= r.targetY || r.speedY >= 0) {
                explode(r.x, r.y, r.color);
                rockets.splice(i, 1);
            }
        }

        // Draw and update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.06; // gravity
            p.vx *= 0.98; // air resistance
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 9;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.restore();
        }

        // Complete within 2 seconds alone (or when all particles finish)
        if (elapsed >= durationMs || (!isSpawning && particles.length === 0 && rockets.length === 0)) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(fireworksAnimId);
            fireworksAnimId = null;
            if (onComplete) onComplete();
            return;
        }

        fireworksAnimId = requestAnimationFrame(render);
    }

    fireworksAnimId = requestAnimationFrame(render);
}

// ==========================================================================
// 10. CELESTIAL PHOTO AUDIO ENGINE (Plays assigned audio per photo)
// ==========================================================================
class CelestialPhotoAudioEngine {
    constructor() {
        this.audioEl = document.getElementById('celestialAudio');
        this.barEl = document.getElementById('celestialAudioBar');
        this.titleEl = document.getElementById('cAudioTitle');
        this.toggleBtn = document.getElementById('cAudioToggleBtn');
        this.btnIcon = document.getElementById('cAudioBtnIcon');
        this.uploadInput = document.getElementById('cAudioUploadInput');
        this.isPlaying = false;
        this.currentStarId = null;

        // User custom songs uploaded for specific stars
        this.customAudios = {};

        this.init();
    }

    init() {
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }

        if (this.uploadInput) {
            this.uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && this.currentStarId) {
                    const objectUrl = URL.createObjectURL(file);
                    this.customAudios[this.currentStarId] = {
                        src: objectUrl,
                        name: file.name
                    };
                    this.playForStar(this.currentStarId);
                }
            });
        }

        if (this.audioEl) {
            this.audioEl.addEventListener('ended', () => {
                this.updateUI(false);
            });
            this.audioEl.addEventListener('play', () => {
                this.updateUI(true);
            });
            this.audioEl.addEventListener('pause', () => {
                this.updateUI(false);
            });
        }
    }

    updateUI(playing) {
        this.isPlaying = playing;
        if (this.barEl) {
            if (playing) this.barEl.classList.add('playing');
            else this.barEl.classList.remove('playing');
        }
        if (this.btnIcon) {
            this.btnIcon.textContent = playing ? '⏸️' : '▶️';
        }
    }

    playForStar(starId) {
        this.currentStarId = starId;
        const memory = starMemoriesData[starId];
        if (!memory || !this.audioEl) return;

        // Pause Page 1 background music and gift card audio
        musicEngine.pause();
        fileAudioEngine.pause();

        const custom = this.customAudios[starId];
        const audioSrc = custom ? custom.src : memory.audio;
        const songName = custom ? custom.name : memory.songName;

        if (this.titleEl) {
            this.titleEl.textContent = songName;
        }

        this.audioEl.src = audioSrc;
        this.audioEl.currentTime = 0;
        const playPromise = this.audioEl.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.updateUI(true);
            }).catch(() => {
                // If primary source format is unsupported or restricted, try fallback
                if (memory.fallbackAudio && !custom) {
                    this.audioEl.src = memory.fallbackAudio;
                    this.audioEl.play().then(() => {
                        this.updateUI(true);
                    }).catch(() => {
                        this.updateUI(false);
                    });
                } else {
                    this.updateUI(false);
                }
            });
        }
    }

    toggle() {
        if (!this.audioEl) return;
        if (this.isPlaying) {
            this.audioEl.pause();
            this.updateUI(false);
        } else {
            this.audioEl.play().then(() => {
                this.updateUI(true);
            }).catch(() => {});
        }
    }

    pause() {
        if (this.audioEl) {
            this.audioEl.pause();
            this.updateUI(false);
        }
    }

    stop() {
        if (this.audioEl) {
            this.audioEl.pause();
            this.audioEl.currentTime = 0;
            this.updateUI(false);
        }
    }
}

const celestialAudioEngine = new CelestialPhotoAudioEngine();

// Celestial Photo Modal Handlers
function openCelestialModal(starId) {
    currentStarIndex = starId;
    const data = starMemoriesData[starId];
    if (!data) return;

    if (celestialTagText) celestialTagText.textContent = data.tag;
    if (celestialModalTitle) celestialModalTitle.textContent = data.title;
    if (celestialModalCaption) celestialModalCaption.textContent = data.caption;

    // Check if user uploaded a custom photo for this star
    const customPhoto = localStorage.getItem(`shafee_star_photo_v2_${starId}`);
    if (celestialHerPhoto) {
        celestialHerPhoto.src = customPhoto || data.image;
    }

    // Play assigned audio track for this star photo!
    celestialAudioEngine.playForStar(starId);

    // Update active switcher button
    switcherBtns.forEach(btn => {
        const id = parseInt(btn.getAttribute('data-switch-star'));
        if (id === starId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (celestialModal) {
        celestialModal.classList.add('active');
    }

    // Play sparkling chime note
    fileAudioEngine.playSynthNote(783.99, fileAudioEngine.getAudioContext().currentTime, 0.8, 0.2);
}

function closeCelestialModal() {
    if (celestialModal) {
        celestialModal.classList.remove('active');
    }
    // Stop celestial photo audio when modal closes
    celestialAudioEngine.stop();
}

// Attach star click listeners
celestialStars.forEach(star => {
    star.addEventListener('click', (e) => {
        e.stopPropagation();
        const starId = parseInt(star.getAttribute('data-star')) || 1;
        const rect = star.getBoundingClientRect();
        createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);
        openCelestialModal(starId);
    });

    star.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const starId = parseInt(star.getAttribute('data-star')) || 1;
            openCelestialModal(starId);
        }
    });
});

// Click on the user's popup "click the star , sweety" also opens Star 1!
if (starSweetyPopup) {
    starSweetyPopup.addEventListener('click', (e) => {
        e.stopPropagation();
        const star1 = document.getElementById('star1');
        if (star1) {
            const rect = star1.getBoundingClientRect();
            createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);
        }
        openCelestialModal(1);
    });
}

// Switch between the 6 stars from inside the modal
switcherBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const starId = parseInt(btn.getAttribute('data-switch-star'));
        if (starId) {
            openCelestialModal(starId);
        }
    });
});

// Interactive photo upload for the Celestial Frame
if (cPhotoUploadInput && celestialHerPhoto) {
    cPhotoUploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                celestialHerPhoto.src = evt.target.result;
                try {
                    localStorage.setItem(`shafee_star_photo_v2_${currentStarIndex}`, evt.target.result);
                } catch (err) {
                    console.log('Image too large for localStorage, shown for session.');
                }
                createSparkleBurst(window.innerWidth / 2, window.innerHeight / 2, 35);
            };
            reader.readAsDataURL(file);
        }
    });
}

if (celestialCloseBtn) {
    celestialCloseBtn.addEventListener('click', closeCelestialModal);
}

if (celestialBackdrop) {
    celestialBackdrop.addEventListener('click', closeCelestialModal);
}

if (btnReplayFireworks) {
    btnReplayFireworks.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = btnReplayFireworks.getBoundingClientRect();
        createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
        startFireworksShow();
    });
}



