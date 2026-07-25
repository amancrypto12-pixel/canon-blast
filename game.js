const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let cw, ch;
function resize() {
    cw = canvas.width = canvas.parentElement.clientWidth;
    ch = canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resize);
resize();

// Assets
const images = {
    bg: new Image(),
    player: new Image(),
    projectile: new Image(),
    enemyHex: new Image(),
    enemySnake: new Image()
};

images.bg.src = 'assert/Mountain_range_on_grass_hills_202607252258.jpeg';
// Randomly picked PNGs for game entities
images.player.src = 'assert/17834282-e0de-47af-a6c4-1ccd9aa28a03.png'; 
images.projectile.src = 'assert/1a8d8f71-a573-4efd-9f84-eb0254f615b2.png';
// Known entity images
images.enemyHex.src = 'assert/Red_hexagon_game_token_energy_202607252339-removebg-preview.png';
images.enemySnake.src = 'assert/Cyber_snake_head_robotic_design_202607252339 - Edited.png';

// Game State
let gameState = {
    running: true,
    score: 0,
    coins: 0,
    level: 1,
    lastTime: 0
};

// UI Elements
const scoreEl = document.getElementById('final-score');
const coinsEl = document.getElementById('coin-value');
const levelEl = document.getElementById('level-value');
const gameOverScreen = document.getElementById('game-over-screen');

// Game Objects
const player = {
    x: cw / 2,
    y: ch - 50,
    width: 80,
    height: 80,
    shootTimer: 0,
    shootInterval: 150 // ms between shots
};

const projectiles = [];
const shapes = [];
const floatingTexts = [];

// Input
let targetX = player.x;
let isDragging = false;

function bindInput() {
    canvas.addEventListener('mousedown', (e) => { isDragging = true; updateTargetX(e.clientX); });
    canvas.addEventListener('mousemove', (e) => { if(isDragging) updateTargetX(e.clientX); });
    canvas.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('mouseleave', () => isDragging = false);

    canvas.addEventListener('touchstart', (e) => { isDragging = true; updateTargetX(e.touches[0].clientX); }, {passive: true});
    canvas.addEventListener('touchmove', (e) => { if(isDragging) updateTargetX(e.touches[0].clientX); }, {passive: true});
    canvas.addEventListener('touchend', () => isDragging = false);
}
bindInput();

function updateTargetX(clientX) {
    const rect = canvas.getBoundingClientRect();
    targetX = clientX - rect.left;
    if (targetX < player.width/2) targetX = player.width/2;
    if (targetX > cw - player.width/2) targetX = cw - player.width/2;
}

// Spawning
let spawnTimer = 0;
function spawnShape(difficulty) {
    const radius = 30 + Math.random() * 30; // Radius for collision
    const hp = Math.floor(Math.random() * 10 * difficulty) + 5;
    
    // 10% chance to spawn the snake head instead of hexagon
    const isSnake = Math.random() > 0.9;
    
    shapes.push({
        x: Math.random() * (cw - radius*2) + radius,
        y: -radius,
        radius: radius,
        vx: (Math.random() - 0.5) * 4,
        vy: 0,
        hp: hp,
        maxHp: hp,
        isSnake: isSnake,
        markedForDeletion: false
    });
}

function spawnFloatingText(x, y, text, color) {
    floatingTexts.push({
        x: x,
        y: y,
        text: text,
        color: color,
        alpha: 1,
        vy: -2,
        decay: 0.02
    });
}

function gameOver() {
    gameState.running = false;
    gameOverScreen.classList.remove('hidden');
    scoreEl.innerText = gameState.score;
}

document.getElementById('restart-btn').addEventListener('click', () => {
    gameState.running = true;
    gameState.score = 0;
    gameState.level = 1;
    player.x = cw / 2;
    targetX = cw / 2;
    projectiles.length = 0;
    shapes.length = 0;
    floatingTexts.length = 0;
    gameOverScreen.classList.add('hidden');
    requestAnimationFrame(gameLoop);
});

// Main Loop
function gameLoop(timestamp) {
    if (!gameState.running) return;
    
    const dt = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;

    update(dt);
    draw();

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    // Player movement
    player.x += (targetX - player.x) * 0.2;
    player.y = ch - player.height / 2 - 20;

    // Shooting
    player.shootTimer -= dt;
    if (player.shootTimer <= 0) {
        projectiles.push({
            x: player.x,
            y: player.y - player.height/2,
            vy: -15,
            radius: 15,
            markedForDeletion: false
        });
        player.shootTimer = player.shootInterval;
    }

    // Update Projectiles
    projectiles.forEach(p => {
        p.y += p.vy;
        if (p.y < -50) p.markedForDeletion = true;
    });

    // Update Shapes
    const gravity = 0.15;
    shapes.forEach(s => {
        s.vy += gravity;
        s.x += s.vx;
        s.y += s.vy;

        // Bounce walls
        if (s.x - s.radius < 0) { s.x = s.radius; s.vx *= -1; }
        if (s.x + s.radius > cw) { s.x = cw - s.radius; s.vx *= -1; }
        
        // Bounce floor
        if (s.y + s.radius > ch - 10) {
            s.y = ch - 10 - s.radius;
            s.vy *= -0.9;
        }

        // Collision with player
        const dx = s.x - player.x;
        const dy = s.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < s.radius + player.width/2 * 0.6) {
            gameOver();
        }
    });

    // Collisions: Projectiles vs Shapes
    projectiles.forEach(p => {
        shapes.forEach(s => {
            if (p.markedForDeletion || s.markedForDeletion) return;
            const dx = p.x - s.x;
            const dy = p.y - s.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < s.radius + p.radius) {
                p.markedForDeletion = true;
                s.hp -= 1;
                
                if (s.hp <= 0) {
                    s.markedForDeletion = true;
                    spawnFloatingText(s.x, s.y, `+${s.maxHp}`, '#4ade80');
                    gameState.score += s.maxHp;
                    gameState.coins += Math.floor(s.maxHp / 5);
                    coinsEl.innerText = gameState.coins;
                    
                    // Split
                    if (s.radius > 35 && !s.isSnake) {
                        for(let i=0; i<2; i++) {
                            shapes.push({
                                x: s.x + (i===0?-10:10),
                                y: s.y,
                                radius: s.radius * 0.7,
                                vx: s.vx + (i===0?-2:2),
                                vy: -5,
                                hp: Math.ceil(s.maxHp / 2),
                                maxHp: Math.ceil(s.maxHp / 2),
                                isSnake: false,
                                markedForDeletion: false
                            });
                        }
                    }
                }
            }
        });
    });

    // Update Floating Texts
    floatingTexts.forEach(ft => {
        ft.y += ft.vy;
        ft.alpha -= ft.decay;
    });

    // Cleanup
    for (let i = projectiles.length - 1; i >= 0; i--) if (projectiles[i].markedForDeletion) projectiles.splice(i, 1);
    for (let i = shapes.length - 1; i >= 0; i--) if (shapes[i].markedForDeletion) shapes.splice(i, 1);
    for (let i = floatingTexts.length - 1; i >= 0; i--) if (floatingTexts[i].alpha <= 0) floatingTexts.splice(i, 1);

    // Spawning Logic
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
        spawnShape(gameState.level);
        spawnTimer = 2000 - Math.min(gameState.level * 100, 1500);
        gameState.level = Math.floor(gameState.score / 100) + 1;
        levelEl.innerText = gameState.level;
    }
}

function drawImageCenter(img, x, y, width, height) {
    if (img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, x - width/2, y - height/2, width, height);
    }
}

function draw() {
    // Background
    if (images.bg.complete && images.bg.naturalWidth !== 0) {
        const scale = Math.max(cw / images.bg.width, ch / images.bg.height);
        const x = (cw / 2) - (images.bg.width / 2) * scale;
        const y = (ch / 2) - (images.bg.height / 2) * scale;
        ctx.drawImage(images.bg, x, y, images.bg.width * scale, images.bg.height * scale);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0,0,cw,ch);
    } else {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, cw, ch);
    }

    // Ground
    ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
    ctx.fillRect(0, ch - 20, cw, 20);

    // Projectiles
    projectiles.forEach(p => {
        drawImageCenter(images.projectile, p.x, p.y, p.radius*2, p.radius*2);
    });

    // Shapes
    shapes.forEach(s => {
        const img = s.isSnake ? images.enemySnake : images.enemyHex;
        drawImageCenter(img, s.x, s.y, s.radius*2, s.radius*2);
        
        // Text
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${s.radius * 0.8}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(s.hp, s.x, s.y);
        ctx.fillText(s.hp, s.x, s.y);
    });

    // Player
    drawImageCenter(images.player, player.x, player.y, player.width, player.height);

    // Floating Texts
    floatingTexts.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 24px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
    });
}

// Start
gameState.lastTime = performance.now();
requestAnimationFrame(gameLoop);
