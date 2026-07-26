// --- TELEGRAM & INIT ---
let isTelegram = false;
try {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        isTelegram = true;
    }
} catch(e) {}

// --- ASSET LOADER ---
const assets = {};
let assetsLoaded = false;
fetch('assets.json').then(r => r.json()).then(manifest => {
    let promises = [];
    for (let key in manifest) {
        let img = new Image();
        img.src = manifest[key];
        assets[key] = img;
        promises.push(new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if one fails
        }));
    }
    Promise.all(promises).then(() => {
        assetsLoaded = true;
        initUIAssets();
        requestAnimationFrame(gameLoop);
    });
});

function initUIAssets() {
    document.getElementById('hud-coin-img').src = assets['coin'].src;
    document.getElementById('hud-gem-img').src = assets['gem'].src;
    document.getElementById('hud-pause-img').src = assets['pause'].src;
}

// --- CANVAS SETUP ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let cw, ch;
function resize() {
    // PDF spec: scale to devicePixelRatio, responsive max ~480px
    const rect = canvas.parentElement.getBoundingClientRect();
    cw = rect.width;
    ch = rect.height;
    
    // Handle High DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resize);
resize();

// --- GAME LOGIC ---
let gameState = {
    running: true,
    waveProgress: 0,
    ultimateCharge: 0,
    ultActiveTimer: 0,
    lastTime: 0
};

// Cannon Base Stats (PDF 3.1)
let stats = {
    fireInterval: 260,
    damage: 8,
    multishot: 1,
    bulletSpeed: 640,
    sideShot: false
};

const player = {
    x: cw / 2,
    shootTimer: 0
};

const projectiles = [];
const blocks = [];
const particles = [];
let spawnTimer = 0;

// Apply shop stats
window.applyStats = function() {
    const mods = getPlayerStats(); // from shop.js
    stats.fireInterval = 260 * mods.fireRateMult;
    stats.damage = 8 * mods.dmgMult;
    stats.multishot = mods.multishot;
    stats.sideShot = mods.sideShot;
};
if(window.getPlayerStats) applyStats();

window.updateHUD = function() {
    document.getElementById('coin-value').innerText = playerSave.coins;
    document.getElementById('gem-value').innerText = playerSave.gems;
    document.getElementById('level-value').innerText = playerSave.level;
    
    // Wave Progress (PDF 3.4)
    const waveTarget = 8 + Math.floor(playerSave.level * 1.4);
    let pPct = (gameState.waveProgress / waveTarget) * 100;
    document.getElementById('wave-progress-fill').style.width = `${Math.min(100, Math.max(0, pPct))}%`;
    
    // Ultimate (PDF 3.5)
    let uPct = (gameState.ultimateCharge / 100) * 100;
    document.getElementById('ult-progress-fill').style.width = `${Math.min(100, uPct)}%`;
    
    const ultBtn = document.getElementById('ult-btn');
    if (gameState.ultimateCharge >= 100) {
        ultBtn.classList.remove('disabled');
    } else {
        ultBtn.classList.add('disabled');
    }
};

// --- INPUT ---
let isDragging = false;
canvas.addEventListener('mousedown', (e) => { isDragging = true; updatePlayerX(e); });
canvas.addEventListener('mousemove', (e) => { if(isDragging) updatePlayerX(e); });
canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('touchstart', (e) => { isDragging = true; updatePlayerX(e.touches[0]); }, {passive: true});
canvas.addEventListener('touchmove', (e) => { if(isDragging) updatePlayerX(e.touches[0]); }, {passive: true});
canvas.addEventListener('touchend', () => isDragging = false);

function updatePlayerX(e) {
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left;
    // Free horizontal position (PDF 2.1)
    if (player.x < 30) player.x = 30;
    if (player.x > cw - 30) player.x = cw - 30;
}

// --- SPAWNERS ---
function spawnBlock() {
    const hpBase = 10 + playerSave.level * 4; // PDF 3.2
    
    // Roll type (PDF 3.2 Special blocks)
    let roll = Math.random() * 100;
    let type = 'normal';
    let hp = hpBase * (0.7 + Math.random() * 1.1); // random(0.7, 1.8)
    
    if (roll < 6) { type = 'bomb'; hp = hpBase * 0.6; }
    else if (roll < 11) { type = 'heal'; hp = hpBase * 0.6; }
    else if (roll < 15) { type = 'mystery'; hp = hpBase * 0.6; }
    
    hp = Math.floor(hp);
    if(hp < 1) hp = 1;

    const radius = 34 + Math.min(24, Math.floor(hp / 12));
    const fallSpeed = 34 + (Math.random() * 14) + playerSave.level * 0.6;

    blocks.push({
        x: radius + Math.random() * (cw - radius*2),
        y: -radius,
        radius: radius,
        hp: hp,
        maxHp: hp,
        type: type,
        speed: fallSpeed,
        markedForDeletion: false
    });
}

// --- ULTIMATE ---
document.getElementById('ult-btn').addEventListener('click', () => {
    if (gameState.ultimateCharge >= 100) {
        gameState.ultimateCharge = 0;
        gameState.ultActiveTimer = 0.9; // 900ms duration
        updateHUD();
    }
});

// --- MAIN LOOP ---
function gameLoop(timestamp) {
    if (!assetsLoaded) { requestAnimationFrame(gameLoop); return; }
    
    const dt = (timestamp - gameState.lastTime) / 1000; // in seconds
    gameState.lastTime = timestamp;

    if (gameState.running) {
        update(dt);
        draw();
    }

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    updateHUD();

    // Ultimate logic (PDF 3.5: deals 400 dmg/sec within 60px of X)
    if (gameState.ultActiveTimer > 0) {
        gameState.ultActiveTimer -= dt;
        blocks.forEach(b => {
            if (Math.abs(b.x - player.x) < 60) {
                b.hp -= 400 * dt;
            }
        });
    }

    // Shooting (PDF 2.2 auto-fires fixed interval)
    player.shootTimer -= dt * 1000; // to ms
    if (player.shootTimer <= 0 && gameState.ultActiveTimer <= 0) { // Don't shoot normal bullets while ult
        for(let i=0; i<stats.multishot; i++) {
            let offset = (i - (stats.multishot-1)/2) * 15;
            projectiles.push({ x: player.x + offset, y: ch - 70, vx: 0, vy: -stats.bulletSpeed });
        }
        player.shootTimer = stats.fireInterval;
    }

    // Update Projectiles
    projectiles.forEach(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y < -50) p.markedForDeletion = true;
    });

    // Update Blocks
    blocks.forEach(b => {
        b.y += b.speed * dt;
        
        // Block reaches bottom (PDF 3.4)
        if (b.y - b.radius > ch) {
            b.markedForDeletion = true;
            gameState.waveProgress = Math.max(0, gameState.waveProgress - 1);
        }
    });

    // Collisions
    projectiles.forEach(p => {
        if(p.markedForDeletion) return;
        blocks.forEach(b => {
            if (b.markedForDeletion) return;
            const dx = p.x - b.x;
            const dy = p.y - b.y;
            if (Math.sqrt(dx*dx + dy*dy) < b.radius + 10) {
                p.markedForDeletion = true;
                b.hp -= stats.damage; // PDF 3.1
                
                // Ultimate gain per damage (PDF 3.5)
                let dmgDone = Math.min(stats.damage, b.hp + stats.damage);
                if(b.type === 'heal') dmgDone *= 1.5; // PDF 3.2 heal block bonus
                
                gameState.ultimateCharge = Math.min(100, gameState.ultimateCharge + (dmgDone * 0.15));
            }
        });
    });

    // Death logic
    blocks.forEach(b => {
        if (b.hp <= 0 && !b.markedForDeletion) {
            b.markedForDeletion = true;
            
            // Special Death Effects (PDF 3.2)
            if (b.type === 'bomb') {
                blocks.forEach(ob => {
                    if (Math.sqrt((ob.x-b.x)**2 + (ob.y-b.y)**2) <= 140) ob.hp -= 999;
                });
            } else if (b.type === 'mystery') {
                if (Math.random() < 0.3) playerSave.gems += 3;
                else playerSave.coins += 40;
            }
            
            // Currency (PDF 3.3)
            const mods = getPlayerStats();
            let c = Math.round((b.maxHp / 3) * mods.coinMult);
            playerSave.coins += c;
            
            // Progress
            gameState.waveProgress++;
            const waveTarget = 8 + Math.floor(playerSave.level * 1.4);
            if (gameState.waveProgress >= waveTarget) {
                playerSave.level++;
                gameState.waveProgress = 0;
                playerSave.gems++;
            }
            saveGame();
        }
    });

    // Cleanup
    for (let i = projectiles.length - 1; i >= 0; i--) if (projectiles[i].markedForDeletion) projectiles.splice(i, 1);
    for (let i = blocks.length - 1; i >= 0; i--) if (blocks[i].markedForDeletion) blocks.splice(i, 1);

    // Spawning (PDF 3.2 spawn interval)
    spawnTimer -= dt * 1000;
    if (spawnTimer <= 0) {
        spawnBlock();
        spawnTimer = Math.max(500, 1100 - playerSave.level * 15);
    }
}

function drawImageCenter(img, x, y, size) {
    if(!img) return;
    ctx.drawImage(img, x - size/2, y - size/2, size, size);
}

function draw() {
    // BG
    ctx.fillStyle = '#111';
    ctx.fillRect(0,0,cw,ch);
    if(assets['bg_mountain']) {
        ctx.drawImage(assets['bg_mountain'], 0, 0, cw, ch);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0,0,cw,ch);
    }

    // Ultimate Beam
    if (gameState.ultActiveTimer > 0) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
        ctx.fillRect(player.x - 60, 0, 120, ch);
    }

    // Blocks
    blocks.forEach(b => {
        let img = assets['gem']; // fallback
        if (b.type === 'bomb') img = assets['explosion'];
        
        drawImageCenter(img, b.x, b.y, b.radius*2);
        
        ctx.fillStyle = b.type === 'heal' ? '#22c55e' : (b.type === 'bomb' ? '#ef4444' : '#fff');
        ctx.font = `bold ${Math.max(14, b.radius * 0.7)}px Outfit, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(Math.ceil(b.hp), b.x, b.y);
    });

    // Projectiles
    projectiles.forEach(p => {
        drawImageCenter(assets['projectile'], p.x, p.y, 16);
    });

    // Cannon
    drawImageCenter(assets['cannon_base'], player.x, ch - 50, 64);
    
    // Drone
    if(playerSave.equipped.drones !== 'dr_1') {
        drawImageCenter(assets['drone_snake'], player.x + 40, ch - 80, 40);
    }
}

// --- UI NAVIGATION ---
document.getElementById('nav-shop').addEventListener('click', () => {
    gameState.running = false;
    document.getElementById('shop-view').classList.remove('hidden');
    renderShop('abilities');
});
document.getElementById('nav-wallet').addEventListener('click', () => {
    gameState.running = false;
    document.getElementById('wallet-view').classList.remove('hidden');
});
document.querySelectorAll('.nav-back').forEach(b => {
    b.addEventListener('click', () => {
        document.getElementById('shop-view').classList.add('hidden');
        document.getElementById('wallet-view').classList.add('hidden');
        gameState.running = true;
    });
});

// --- TON CONNECT (UI Only) ---
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://amancrypto12-pixel.github.io/canon-blast/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

tonConnectUI.onStatusChange(wallet => {
    if (wallet) {
        document.getElementById('wallet-actions').classList.remove('hidden');
        // Shorten address
        const a = wallet.account.address;
        document.getElementById('wallet-address').innerText = a.substring(0,6) + '...' + a.substring(a.length-4);
    } else {
        document.getElementById('wallet-actions').classList.add('hidden');
    }
});

document.getElementById('claim-btn').addEventListener('click', () => {
    if (tonConnectUI.account) {
        // PDF Section 7 Backend logic required here.
        alert("Client request built. Needs backend server to process TON transfer safely.");
    }
});
