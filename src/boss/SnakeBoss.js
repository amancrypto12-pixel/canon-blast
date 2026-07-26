export class SnakeBoss {
    constructor(cw, ch, level) {
        this.cw = cw;
        this.ch = ch;
        this.x = cw / 2;
        this.y = -100;
        this.radius = 60;
        
        // Base stats scaled by level
        this.maxHp = 500 + (level * 100);
        this.hp = this.maxHp;
        
        this.state = 'spawn'; // spawn, move, fireball, charge, summon, laser, die
        this.stateTimer = 2; // seconds
        this.vx = 150; // px/sec
        
        this.rageMode = false;
        this.markedForDeletion = false;
        this.projectiles = []; // Boss projectiles
        this.minions = []; // Summoned small snakes
    }

    update(dt, player, gameScene) {
        if (this.hp <= 0 && this.state !== 'die') {
            this.state = 'die';
            this.stateTimer = 2;
            gameScene.spawnFloatingText(this.x, this.y, "BOSS DEFEATED!", "#facc15");
        }

        // Rage check
        if (this.hp <= this.maxHp * 0.5 && !this.rageMode) {
            this.rageMode = true;
            this.vx *= 1.5;
            gameScene.spawnFloatingText(this.x, this.y, "RAGE MODE!", "#ef4444");
        }

        this.stateTimer -= dt;

        switch (this.state) {
            case 'spawn':
                this.y += 100 * dt;
                if (this.stateTimer <= 0) this.switchState('move', 3);
                break;
                
            case 'move':
                this.x += this.vx * dt;
                if (this.x < this.radius || this.x > this.cw - this.radius) {
                    this.vx *= -1;
                    this.x = Math.max(this.radius, Math.min(this.cw - this.radius, this.x));
                }
                if (this.stateTimer <= 0) {
                    const next = ['fireball', 'charge', 'summon', 'laser'][Math.floor(Math.random() * (this.rageMode ? 4 : 3))];
                    this.switchState(next, 2);
                }
                break;

            case 'fireball':
                if (this.stateTimer > 0 && Math.random() < 0.05) { // Shoot randomly during this state
                    this.projectiles.push({
                        x: this.x, y: this.y + this.radius,
                        vx: (player.x - this.x) * 0.5, vy: 300,
                        radius: 15, damage: 10, markedForDeletion: false
                    });
                }
                if (this.stateTimer <= 0) this.switchState('move', 3);
                break;

            case 'charge':
                // Simple telegraph then drop down
                if (this.stateTimer > 1) {
                    // Telegraphing (shaking)
                    this.x += (Math.random() - 0.5) * 10;
                } else if (this.stateTimer > 0) {
                    this.y += 800 * dt; // Charge down
                    if (this.y > this.ch - 100) this.stateTimer = 0; // Hit bottom early
                } else {
                    this.y -= 400 * dt; // Return up
                    if (this.y <= 100) {
                        this.y = 100;
                        this.switchState('move', 3);
                    }
                }
                break;

            case 'summon':
                if (this.stateTimer > 1.5 && this.minions.length < 3) {
                    this.minions.push({
                        x: this.x + (Math.random()-0.5)*100, y: this.y + 50,
                        radius: 20, hp: 50, maxHp: 50,
                        vx: (Math.random()-0.5)*100, vy: 100, markedForDeletion: false
                    });
                }
                if (this.stateTimer <= 0) this.switchState('move', 3);
                break;

            case 'laser': // Only in rage mode
                if (this.stateTimer < 1.5 && this.stateTimer > 0.5) {
                    // Laser active (handled in draw and collision)
                    if (Math.abs(player.x - this.x) < 40) {
                        gameScene.gameOver(); // Instant kill player
                    }
                }
                if (this.stateTimer <= 0) this.switchState('move', 4);
                break;

            case 'die':
                // Explode particles
                this.radius *= 0.95; 
                if (this.stateTimer <= 0) {
                    this.markedForDeletion = true;
                    // Reward chest (grant huge coins/gems)
                    const save = gameScene.SaveManager.get();
                    save.coins += 500;
                    save.gems += 5;
                    gameScene.SaveManager.save();
                }
                break;
        }

        // Update Boss Projectiles
        this.projectiles.forEach(p => {
            p.x += p.vx * dt; p.y += p.vy * dt;
            if (p.y > this.ch) p.markedForDeletion = true;
            // Collision with player
            if (Math.sqrt((p.x-player.x)**2 + (p.y-(this.ch-50))**2) < p.radius + 20) {
                gameScene.gameOver();
            }
        });

        // Update Minions (they fall like normal blocks but track player slightly)
        this.minions.forEach(m => {
            m.x += m.vx * dt; m.y += m.vy * dt;
            m.vx += (player.x - m.x) * 2.0 * dt; // homing pull
            m.vx *= 0.95; // friction
            
            if (m.vx > 250) m.vx = 250;
            if (m.vx < -250) m.vx = -250;
            
            if (m.y > this.ch) m.markedForDeletion = true;
            if (Math.sqrt((m.x-player.x)**2 + (m.y-(this.ch-50))**2) < m.radius + 20) {
                gameScene.gameOver();
            }
        });

        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
        this.minions = this.minions.filter(m => !m.markedForDeletion);
    }

    switchState(newState, duration) {
        this.state = newState;
        this.stateTimer = duration;
    }

    draw(ctx, assets) {
        // Draw Minions
        this.minions.forEach(m => {
            if(assets['drone_snake']) ctx.drawImage(assets['drone_snake'], m.x-m.radius, m.y-m.radius, m.radius*2, m.radius*2);
        });

        // Draw Projectiles
        this.projectiles.forEach(p => {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
        });

        // Draw Laser
        if (this.state === 'laser' && this.stateTimer < 1.5 && this.stateTimer > 0.5) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
            ctx.fillRect(this.x - 40, this.y, 80, this.ch);
        }

        // Draw Boss Body
        if(assets['boss_face']) {
            ctx.save();
            if(this.rageMode) { ctx.filter = 'drop-shadow(0 0 10px red)'; }
            ctx.drawImage(assets['boss_face'], this.x-this.radius, this.y-this.radius, this.radius*2, this.radius*2);
            ctx.restore();
        }

        // Draw HP Bar
        if (this.state !== 'die') {
            ctx.fillStyle = '#000'; ctx.fillRect(this.x - 50, this.y - this.radius - 20, 100, 10);
            ctx.fillStyle = this.rageMode ? '#ef4444' : '#22c55e';
            ctx.fillRect(this.x - 50, this.y - this.radius - 20, 100 * (Math.max(0, this.hp) / this.maxHp), 10);
        }
    }
}
