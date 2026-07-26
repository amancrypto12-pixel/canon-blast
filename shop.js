// Shop Database
const SHOP_ITEMS = {
    abilities: [
        { id: 'ab_1', name: 'Basic Barrel', cost: 0, effect: { fireRateMult: 1, dmgMult: 1 } },
        { id: 'ab_2', name: 'Rail Boost', cost: 800, effect: { fireRateMult: 0.85, dmgMult: 1 } },
        { id: 'ab_3', name: 'Flame Core', cost: 2200, effect: { fireRateMult: 0.7, dmgMult: 1.15 } }
    ],
    weapons: [
        { id: 'wp_1', name: 'Single Shot', cost: 0, effect: { multishot: 1, dmgMult: 1 } },
        { id: 'wp_2', name: 'Boomerang', cost: 1500, effect: { multishot: 1, dmgMult: 1.3 } },
        { id: 'wp_3', name: 'Saw Blade', cost: 3200, effect: { multishot: 2, dmgMult: 1 } },
        { id: 'wp_4', name: 'Spray Gun', cost: 5000, effect: { multishot: 3, dmgMult: 0.8 } }
    ],
    ultimates: [
        { id: 'ul_1', name: 'Laser Beam', cost: 0, effect: { ultType: 'laser' } },
        { id: 'ul_2', name: 'Orb Burst', cost: 4000, effect: { ultType: 'orb' } }
    ],
    drones: [
        { id: 'dr_1', name: 'No Drone', cost: 0, effect: { sideShot: false, coinMult: 1 } },
        { id: 'dr_2', name: 'Pink Scout', cost: 2500, effect: { sideShot: true, coinMult: 1 } },
        { id: 'dr_3', name: 'Gambler Bot', cost: 6000, effect: { sideShot: false, coinMult: 1.2 } }
    ]
};

// Player Save Data
let playerSave = {
    coins: 0,
    gems: 0,
    level: 1,
    inventory: ['ab_1', 'wp_1', 'ul_1', 'dr_1'], // owned IDs
    equipped: {
        abilities: 'ab_1',
        weapons: 'wp_1',
        ultimates: 'ul_1',
        drones: 'dr_1'
    }
};

function loadSave() {
    const s = localStorage.getItem('cannonBlastSave');
    if (s) playerSave = JSON.parse(s);
}

function saveGame() {
    localStorage.setItem('cannonBlastSave', JSON.stringify(playerSave));
}

// Global hook for game.js to read stats
function getPlayerStats() {
    let stats = {
        fireRateMult: 1,
        dmgMult: 1,
        multishot: 1,
        ultType: 'laser',
        sideShot: false,
        coinMult: 1
    };
    
    // Apply Ability
    const ab = SHOP_ITEMS.abilities.find(i => i.id === playerSave.equipped.abilities);
    if(ab) { stats.fireRateMult *= ab.effect.fireRateMult; stats.dmgMult *= ab.effect.dmgMult; }
    
    // Apply Weapon
    const wp = SHOP_ITEMS.weapons.find(i => i.id === playerSave.equipped.weapons);
    if(wp) { stats.multishot = wp.effect.multishot; stats.dmgMult *= wp.effect.dmgMult; }
    
    // Apply Ultimate
    const ul = SHOP_ITEMS.ultimates.find(i => i.id === playerSave.equipped.ultimates);
    if(ul) { stats.ultType = ul.effect.ultType; }
    
    // Apply Drone
    const dr = SHOP_ITEMS.drones.find(i => i.id === playerSave.equipped.drones);
    if(dr) { stats.sideShot = dr.effect.sideShot; stats.coinMult = dr.effect.coinMult; }
    
    return stats;
}

// UI Logic
function renderShop(category) {
    const grid = document.getElementById('shop-grid');
    grid.innerHTML = '';
    
    SHOP_ITEMS[category].forEach(item => {
        const isOwned = playerSave.inventory.includes(item.id);
        const isEquipped = playerSave.equipped[category] === item.id;
        
        const div = document.createElement('div');
        div.className = `shop-item ${isEquipped ? 'equipped' : ''}`;
        
        let actionBtn = `<button class="primary-btn" style="padding: 5px; font-size: 0.9rem;" onclick="buyOrEquip('${category}', '${item.id}')">
            ${isOwned ? (isEquipped ? 'Equipped' : 'Equip') : `Buy ${item.cost}C`}
        </button>`;
        
        div.innerHTML = `
            <div style="font-size:0.8rem">${item.name}</div>
            ${actionBtn}
        `;
        grid.appendChild(div);
    });
}

window.buyOrEquip = function(category, id) {
    const item = SHOP_ITEMS[category].find(i => i.id === id);
    const isOwned = playerSave.inventory.includes(id);
    
    if (isOwned) {
        playerSave.equipped[category] = id;
    } else {
        if (playerSave.coins >= item.cost) {
            playerSave.coins -= item.cost;
            playerSave.inventory.push(id);
            playerSave.equipped[category] = id;
            if(window.updateHUD) window.updateHUD();
        } else {
            alert("Not enough coins!");
            return;
        }
    }
    saveGame();
    renderShop(category);
    if(window.applyStats) window.applyStats(); // Tell game engine to reload
};

// Tabs
document.querySelectorAll('.shop-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        renderShop(e.target.dataset.cat);
    });
});

loadSave();
