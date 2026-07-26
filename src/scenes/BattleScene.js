import { SaveManager } from '../save/SaveManager.js';
import { SnakeBoss } from '../boss/SnakeBoss.js';

export const BattleScene = {
    canvas: null,
    ctx: null,
    cw: 0,
    ch: 0,
    mode: 'classic',
    running: false,
    assets: {},
    assetsLoaded: false,
    
    // State
    player: { x: 0, shootTimer: 0 },
    stats: { fireInterval: 260, damage: 8, multishot: 1, bulletSpeed: 640 },
    projectiles: [],
    blocks: [],
    boss: null,
    waveProgress: 0,
    ultimateCharge: 0,
    ultActiveTimer: 0,
    spawnTimer: 0,
    lastTime: 0,
    animationFrameId: null,
    inputBound: false,
    floatingTexts: [],
    SaveManager: SaveManager, // Exposed for Boss use

    start(mode) {
        this.mode = mode;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        
        this.player.x = this.cw / 2;
        this.resetState();
        this.bindInput();
        
        if (!this.assetsLoaded) {
            this.loadAssets().then(() => {
                this.assetsLoaded = true;
                this.running = true;
                this.lastTime = performance.now();
                this.loop(performance.now());
            });
        } else {
            this.running = true;
            this.lastTime = performance.now();
            this.loop(performance.now());
        }
    },

    resetState() {
        this.projectiles = [];
        this.blocks = [];
        this.floatingTexts = [];
        this.boss = null;
        this.waveProgress = 0;
        this.ultimateCharge = 0;
        this.ultActiveTimer = 0;
        document.getElementById('game-over-screen').classList.add('hidden');
        
        if (this.mode === 'boss') {
            this.boss = new SnakeBoss(this.cw, this.ch, SaveManager.get().level);
        }
    },

    stop() {
        this.running = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    },

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.cw = rect.width;
        this.ch = rect.height;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.cw * dpr;
        this.canvas.height = this.ch * dpr;
        this.ctx.scale(dpr, dpr);
    },

    loadAssets() {
        return fetch('assets.json').then(r => r.json()).then(manifest => {
            let promises = [];
            for (let key in manifest) {
                let img = new Image();
                img.src = manifest[key];
                this.assets[key] = img;
                promises.push(new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }));
            }
            return Promise.all(promises);
        });
    },

    bindInput() {
        if (this.inputBound) return;
        this.inputBound = true;
        
        window.addEventListener('resize', () => this.resize());
        
        let isDragging = false;
        const updateX = (clientX) => {
            const rect = this.canvas.getBoundingClientRect();
            this.player.x = clientX - rect.left;
            if (this.player.x < 30) this.player.x = 30;
            if (this.player.x > this.cw - 30) this.player.x = this.cw - 30;
        };
        
        this.canvas.onmousedown = (e) => { isDragging = true; updateX(e.clientX); };
        this.canvas.onmousemove = (e) => { if(isDragging) updateX(e.clientX); };
        this.canvas.onmouseup = () => isDragging = false;
        
        this.canvas.ontouchstart = (e) => { isDragging = true; updateX(e.touches[0].clientX); };
        this.canvas.ontouchmove = (e) => { if(isDragging) updateX(e.touches[0].clientX); };
        this.canvas.ontouchend = () => isDragging = false;

        document.getElementById('ult-btn').onclick = () => {
            if (this.ultimateCharge >= 100) {
                this.ultimateCharge = 0;
                this.ultActiveTimer = 0.9;
            }
        };

        document.getElementById('retry-btn').onclick = () => {
            this.resetState();
            this.running = true;
            this.lastTime = performance.now();
            this.loop(performance.now());
        };
    },

    loop(timestamp) {
        if (!this.running) return;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
    },

    update(dt) {
        this.updateHUD();
        const save = SaveManager.get();

        // Check if level is boss level in classic mode
        if (this.mode === 'classic' && save.level > 0 && save.level % 10 === 0 && !this.boss) {
            this.boss = new SnakeBoss(this.cw, this.ch, save.level);
            this.blocks = []; // Clear normal blocks
        }

        // Ultimate damage
        if (this.ultActiveTimer > 0) {
            this.ultActiveTimer -= dt;
            this.blocks.forEach(b => {
                if (Math.abs(b.x - this.player.x) < 60) b.hp -= 400 * dt;
            });
            if (this.boss && Math.abs(this.boss.x - this.player.x) < 60) {
                this.boss.hp -= 400 * dt;
            }
        }

        // Player shooting
        this.player.shootTimer -= dt * 1000;
        if (this.player.shootTimer <= 0 && this.ultActiveTimer <= 0) {
            for(let i=0; i<this.stats.multishot; i++) {
                let offset = (i - (this.stats.multishot-1)/2) * 15;
                this.projectiles.push({ x: this.player.x + offset, y: this.ch - 70, vx: 0, vy: -this.stats.bulletSpeed, damage: this.stats.damage });
            }
            this.player.shootTimer = this.stats.fireInterval;
        }

        this.projectiles.forEach(p => { p.y += p.vy * dt; if (p.y < -50) p.markedForDeletion = true; });

        // Update Boss
        if (this.boss) {
            this.boss.update(dt, this.player, this);
            if (this.boss.markedForDeletion) {
                this.boss = null;
                if (this.mode === 'classic') {
                    save.level++;
                    this.waveProgress = 0;
                    SaveManager.save();
                } else if (this.mode === 'boss') {
                    // Won boss mode
                    document.getElementById('game-over-title').innerText = "BOSS DEFEATED!";
                    this.gameOver();
                }
            }
        }

        // Update Normal Blocks
        if (!this.boss || this.mode === 'endless') {
            this.blocks.forEach(b => {
                b.y += b.speed * dt;
                if (b.y - b.radius > this.ch) {
                    b.markedForDeletion = true;
                    this.waveProgress = Math.max(0, this.waveProgress - 1);
                }
                const dx = b.x - this.player.x;
                const dy = b.y - (this.ch - 50);
                if (Math.sqrt(dx*dx + dy*dy) < b.radius + 20) {
                    this.gameOver();
                }
            });
        }

        // Projectile Collisions
        this.projectiles.forEach(p => {
            if(p.markedForDeletion) return;
            
            // Check Boss
            if (this.boss && Math.sqrt((p.x-this.boss.x)**2 + (p.y-this.boss.y)**2) < this.boss.radius + 10) {
                p.markedForDeletion = true;
                this.boss.hp -= p.damage;
                this.spawnFloatingText(p.x, p.y, p.damage, "#fff");
                this.ultimateCharge = Math.min(100, this.ultimateCharge + (p.damage * 0.15));
                return;
            }
            
            // Check Boss Minions
            if (this.boss) {
                this.boss.minions.forEach(m => {
                    if (m.markedForDeletion) return;
                    if (Math.sqrt((p.x-m.x)**2 + (p.y-m.y)**2) < m.radius + 10) {
                        p.markedForDeletion = true;
                        m.hp -= p.damage;
                        this.spawnFloatingText(m.x, m.y, p.damage, "#fff");
                        if(m.hp <= 0) m.markedForDeletion = true;
                    }
                });
            }

            // Check Normal Blocks
            this.blocks.forEach(b => {
                if (b.markedForDeletion) return;
                if (Math.sqrt((p.x-b.x)**2 + (p.y-b.y)**2) < b.radius + 10) {
                    p.markedForDeletion = true;
                    b.hp -= p.damage;
                    this.spawnFloatingText(b.x, b.y, p.damage, "#fff");
                    this.ultimateCharge = Math.min(100, this.ultimateCharge + (Math.min(p.damage, b.hp+p.damage) * 0.15));
                }
            });
        });

        this.floatingTexts.forEach(t => {
            t.y += t.vy * dt;
            t.life -= dt;
        });
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);

        this.blocks.forEach(b => {
            if (b.hp <= 0 && !b.markedForDeletion) {
                b.markedForDeletion = true;
                save.coins += Math.round(b.maxHp / 3);
                this.waveProgress++;
                const waveTarget = 8 + Math.floor(save.level * 1.4);
                if (this.waveProgress >= waveTarget && this.mode === 'classic') {
                    save.level++;
                    this.waveProgress = 0;
                    save.gems++;
                }
                SaveManager.save();
            }
        });

        for (let i = this.projectiles.length - 1; i >= 0; i--) if (this.projectiles[i].markedForDeletion) this.projectiles.splice(i, 1);
        for (let i = this.blocks.length - 1; i >= 0; i--) if (this.blocks[i].markedForDeletion) this.blocks.splice(i, 1);

        // Spawning Blocks
        if (!this.boss || this.mode === 'endless') {
            this.spawnTimer -= dt * 1000;
            if (this.spawnTimer <= 0) {
                this.spawnBlock(save.level);
                this.spawnTimer = Math.max(500, 1100 - save.level * 15);
            }
        }
    },

    spawnBlock(level) {
        const hp = 10 + level * 4;
        const radius = 34 + Math.min(24, Math.floor(hp / 12));
        this.blocks.push({
            x: radius + Math.random() * (this.cw - radius*2),
            y: -radius,
            radius: radius,
            hp: hp,
            maxHp: hp,
            speed: 34 + (Math.random() * 14) + level * 0.6,
            markedForDeletion: false
        });
    },

    spawnFloatingText(x, y, text, color) {
        this.floatingTexts.push({ x: x, y: y, text: text, color: color, life: 1.0, vy: -50 });
    },

    updateHUD() {
        const save = SaveManager.get();
        document.getElementById('level-value').innerText = save.level;
        const waveTarget = 8 + Math.floor(save.level * 1.4);
        document.getElementById('wave-progress-fill').style.width = `${Math.min(100, (this.waveProgress/waveTarget)*100)}%`;
        document.getElementById('ult-progress-fill').style.width = `${Math.min(100, this.ultimateCharge)}%`;
        const ultBtn = document.getElementById('ult-btn');
        if(this.ultimateCharge >= 100) ultBtn.classList.remove('disabled');
        else ultBtn.classList.add('disabled');
    },

    draw() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0,0,this.cw,this.ch);
        if(this.assets['bg_mountain']) {
            this.ctx.drawImage(this.assets['bg_mountain'], 0, 0, this.cw, this.ch);
            this.ctx.fillStyle = 'rgba(0,0,0,0.4)'; this.ctx.fillRect(0,0,this.cw,this.ch);
        }

        if (this.ultActiveTimer > 0) {
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
            this.ctx.fillRect(this.player.x - 60, 0, 120, this.ch);
        }

        if (this.boss) this.boss.draw(this.ctx, this.assets);

        this.blocks.forEach(b => {
            if(this.assets['gem']) this.ctx.drawImage(this.assets['gem'], b.x-b.radius, b.y-b.radius, b.radius*2, b.radius*2);
            this.ctx.fillStyle = '#fff'; this.ctx.font = `bold ${Math.max(14, b.radius * 0.7)}px Outfit`;
            this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle';
            this.ctx.fillText(Math.ceil(b.hp), b.x, b.y);
        });

        this.projectiles.forEach(p => {
            if(this.assets['projectile']) this.ctx.drawImage(this.assets['projectile'], p.x-8, p.y-8, 16, 16);
        });
        
        this.floatingTexts.forEach(t => {
            this.ctx.fillStyle = t.color;
            this.ctx.globalAlpha = Math.max(0, t.life);
            this.ctx.font = 'bold 20px Outfit';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(t.text, t.x, t.y);
            this.ctx.globalAlpha = 1.0;
        });

        if(this.assets['cannon_base']) this.ctx.drawImage(this.assets['cannon_base'], this.player.x-32, this.ch-82, 64, 64);
    },

    gameOver() {
        this.running = false;
        document.getElementById('game-over-title').innerText = "Game Over";
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
};
