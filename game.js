
// --- 1. GAME STATE STORE ---
const GameStore = {
  state: {
    dlp: 183.38,
    fish: 92935,
    stars: 50,
    hearts: 14,
    shells: 65,
    level: 5,
    rarity: 'Common',
    feedCost: 150,
    feedProgress: 5,
    feedMax: 5,
    activeSlot: 0,
    slots: [
      { id: 0, level: 5, rarity: 'Common', owned: true, skin: 'assets/dolphin_hero_stage.png' },
      { id: 1, level: 3, rarity: 'Uncommon', owned: true, skin: 'assets/events/skin_sailor_squad_1.png' },
      { id: 2, level: 4, rarity: 'Rare', owned: true, skin: 'assets/events/skin_cyber_currents_1.png' },
      { id: 3, level: 5, rarity: 'Epic', owned: true, skin: 'assets/events/skin_abyssal_mystic_1.png' },
      { id: 4, level: 1, rarity: 'Common', owned: true, skin: 'assets/dolphin_hero_stage.png' },
      { id: 5, level: 0, rarity: 'Common', owned: false },
      { id: 6, level: 0, rarity: 'Common', owned: false },
      { id: 7, level: 0, rarity: 'Common', owned: false },
      { id: 8, level: 0, rarity: 'Common', owned: false },
      { id: 9, level: 0, rarity: 'Common', owned: false },
      { id: 10, level: 0, rarity: 'Common', owned: false }
    ],
    grid: Array(49).fill(null),
    combo: 13,
    hotTimer: 24,
    breedingRoom: null
  },

  listeners: [],
  subscribe(fn) { this.listeners.push(fn); },
  notify() { this.listeners.forEach(fn => fn(this.state)); },

  update(patch) {
    Object.assign(this.state, patch);
    this.notify();
  }
};

// --- 2. WEBAUDIO PROCEDURAL SOUND SYNTHESIZER ---
class SoundEngine {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  play(type) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    if (type === 'tap' || type === 'quack') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'merge') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'crack') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'fanfare') {
      [523, 659, 783, 1046].forEach((freq, idx) => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g);
        g.connect(this.ctx.destination);
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.15, now + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
        o.start(now + idx * 0.08);
        o.stop(now + idx * 0.08 + 0.2);
      });
    }
  }
}
const audio = new SoundEngine();

// --- 3. TELEGRAM INTEGRATION & HAPTICS ---
function initTelegram() {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    const user = tg.initDataUnsafe?.user;
    if (user) {
      if (user.username) document.getElementById('top-username').innerText = '@' + user.username;
      if (user.photo_url) {
        document.getElementById('top-avatar').src = user.photo_url;
        document.getElementById('top-avatar').style.display = 'block';
        document.getElementById('top-avatar-fallback').style.display = 'none';
      } else {
        const initial = (user.first_name || 'D')[0].toUpperCase();
        document.getElementById('top-avatar-fallback').innerText = initial;
      }
    }
  }
}

function haptic(type = 'light') {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(type);
  } catch (e) {}
}

// --- 4. PIXIJS BACKGROUND PARTICLES ENGINE ---
function initPixiEngine() {
  const container = document.getElementById('pixi-canvas-container');
  if (!container || typeof PIXI === 'undefined') return;

  const app = new PIXI.Application({
    width: window.innerWidth || 400,
    height: window.innerHeight || 800,
    backgroundAlpha: 0,
    antialias: false,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true
  });
  container.appendChild(app.view);

  // Floating Micro-Orbs Simulation
  const orbs = [];
  const graphics = new PIXI.Graphics();
  graphics.beginFill(0x00D4FF, 0.4);
  graphics.drawCircle(0, 0, 3);
  graphics.endFill();
  const orbTexture = app.renderer.generateTexture(graphics);

  for (let i = 0; i < 25; i++) {
    const orb = new PIXI.Sprite(orbTexture);
    orb.x = Math.random() * app.screen.width;
    orb.y = Math.random() * app.screen.height;
    orb.vx = (Math.random() - 0.5) * 0.4;
    orb.vy = -0.3 - Math.random() * 0.5;
    orb.alpha = 0.2 + Math.random() * 0.5;
    orb.scale.set(0.6 + Math.random() * 0.8);
    app.stage.addChild(orb);
    orbs.push(orb);
  }

  app.ticker.add(() => {
    orbs.forEach(orb => {
      orb.x += orb.vx;
      orb.y += orb.vy;
      if (orb.y < -10) {
        orb.y = app.screen.height + 10;
        orb.x = Math.random() * app.screen.width;
      }
    });
  });
}

// --- 5. LOBBY HERO & TAP FEED LOGIC ---
function initLobby() {
  const heroCard = document.getElementById('heroCard');
  const feedBtn = document.getElementById('feedBtn');
  const sprite = document.getElementById('heroSprite');

  function handleFeed(e) {
    const s = GameStore.state;
    if (s.fish < s.feedCost) {
      alert('Not enough Fish! Merge pearls or crack eggs to get more.');
      return;
    }
    audio.play('tap');
    haptic('medium');

    // Spring Squish Deformation
    if (sprite) {
      sprite.classList.add('squash');
      setTimeout(() => sprite.classList.remove('squash'), 120);
    }

    // Floating deltas
    const rect = feedBtn.getBoundingClientRect();
    const x = e.clientX || (rect.left + rect.width / 2);
    const y = e.clientY || rect.top;
    spawnTapParticle(x - 20, y, '+0.02 DLP', '#00D4FF');
    spawnTapParticle(x + 20, y + 10, '-' + s.feedCost + ' 🐟', '#6BE35A');

    GameStore.update({
      dlp: +(s.dlp + 0.02).toFixed(2),
      fish: s.fish - s.feedCost
    });
  }

  if (feedBtn) feedBtn.addEventListener('click', handleFeed);
  if (heroCard) heroCard.addEventListener('click', (e) => {
    if (e.target !== feedBtn && !feedBtn.contains(e.target)) handleFeed(e);
  });
}

function spawnTapParticle(x, y, text, color) {
  const el = document.createElement('div');
  el.className = 'tap-particle';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.color = color;
  el.innerText = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 750);
}

// --- 6. 7x7 MERGE-2 BOARD & EGG CRACKING ---
const lockedCorners = [0, 6, 42, 48];
let selectedCellIndex = null;
let draggedCellIndex = null;

function initMergeBoard() {
  const gridEl = document.getElementById('mergeGrid');
  if (!gridEl) return;

  // Initialize initial pearls
  const s = GameStore.state;
  for (let i = 0; i < 49; i++) {
    if (!lockedCorners.includes(i) && Math.random() < 0.25 && !s.grid[i]) {
      s.grid[i] = {
        level: Math.floor(Math.random() * 3) + 1,
        type: Math.random() < 0.3 ? 'heart' : 'pearl'
      };
    }
  }

  renderMergeGrid();

  // Auto Merge Tool
  document.getElementById('btnAutoMerge')?.addEventListener('click', () => {
    autoMergeGrid();
  });

  // Spawn Pearl Tool
  document.getElementById('btnSpawnPearl')?.addEventListener('click', () => {
    spawnPearlToBoard();
  });
}

function renderMergeGrid() {
  const gridEl = document.getElementById('mergeGrid');
  if (!gridEl) return;
  gridEl.innerHTML = '';
  const s = GameStore.state;

  for (let i = 0; i < 49; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.dataset.index = i;

    if (lockedCorners.includes(i)) {
      cell.classList.add('locked');
      cell.innerHTML = '<span style="font-size:10px; color:#444;">🔒</span>';
    } else {
      const item = s.grid[i];
      if (item) {
        const img = document.createElement('img');
        img.className = 'pearl-item';
        img.src = item.type === 'heart'
          ? `assets/heart_egg_lvl${item.level}.png`
          : `assets/pearl_egg_lvl${item.level}.png`;
        cell.appendChild(img);

        const tag = document.createElement('div');
        tag.className = 'pearl-lvl-tag';
        tag.innerText = 'L' + item.level;
        cell.appendChild(tag);

        if (selectedCellIndex === i) cell.classList.add('selected');
      }

      // Merge-2 Click Selection / Tap Mechanism
      cell.addEventListener('click', () => handleCellClick(i));
    }
    gridEl.appendChild(cell);
  }
}

function handleCellClick(idx) {
  const s = GameStore.state;
  if (lockedCorners.includes(idx)) return;

  if (selectedCellIndex === null) {
    if (s.grid[idx]) {
      selectedCellIndex = idx;
      haptic('light');
      renderMergeGrid();
    }
  } else {
    if (selectedCellIndex === idx) {
      // Tap again on high tier pearl opens Egg Crack Modal
      if (s.grid[idx] && s.grid[idx].level >= 4) {
        openCrackModal(s.grid[idx], idx);
      }
      selectedCellIndex = null;
      renderMergeGrid();
      return;
    }

    const source = s.grid[selectedCellIndex];
    const target = s.grid[idx];

    if (source && target && source.type === target.type && source.level === target.level && source.level < 12) {
      // Merge-2 Success!
      audio.play('merge');
      haptic('heavy');
      target.level += 1;
      s.grid[selectedCellIndex] = null;
      selectedCellIndex = null;
      GameStore.update({ shells: s.shells + 5, combo: s.combo + 1 });
      renderMergeGrid();
    } else if (source && !target) {
      // Move to empty slot
      s.grid[idx] = source;
      s.grid[selectedCellIndex] = null;
      selectedCellIndex = null;
      haptic('light');
      renderMergeGrid();
    } else {
      selectedCellIndex = idx;
      haptic('light');
      renderMergeGrid();
    }
  }
}

function autoMergeGrid() {
  const s = GameStore.state;
  let mergedAny = false;
  for (let i = 0; i < 49; i++) {
    if (!s.grid[i] || lockedCorners.includes(i)) continue;
    for (let j = i + 1; j < 49; j++) {
      if (!s.grid[j] || lockedCorners.includes(j)) continue;
      if (s.grid[i].type === s.grid[j].type && s.grid[i].level === s.grid[j].level && s.grid[i].level < 12) {
        s.grid[j].level += 1;
        s.grid[i] = null;
        mergedAny = true;
        break;
      }
    }
  }
  if (mergedAny) {
    audio.play('merge');
    haptic('heavy');
    renderMergeGrid();
  }
}

function spawnPearlToBoard() {
  const s = GameStore.state;
  if (s.fish < 150) {
    alert('Need 150 Fish to spawn pearl!');
    return;
  }
  const emptyIndices = [];
  for (let i = 0; i < 49; i++) {
    if (!lockedCorners.includes(i) && !s.grid[i]) emptyIndices.push(i);
  }
  if (emptyIndices.length === 0) {
    alert('Board is full! Merge or crack pearls.');
    return;
  }
  const targetIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  s.grid[targetIdx] = {
    level: Math.random() < 0.2 ? 2 : 1,
    type: Math.random() < 0.3 ? 'heart' : 'pearl'
  };
  audio.play('tap');
  haptic('medium');
  GameStore.update({ fish: s.fish - 150 });
  renderMergeGrid();
}

// --- 7. EGG CRACK RITUAL MODAL ---
let activeCrackEgg = null;
let activeCrackIndex = null;

function openCrackModal(egg, idx) {
  activeCrackEgg = egg;
  activeCrackIndex = idx;
  const modal = document.getElementById('modalCrack');
  const img = document.getElementById('crackEggImg');
  const title = document.getElementById('crackEggTitle');
  const reward = document.getElementById('crackEggReward');

  const isHeart = egg.type === 'heart';
  img.src = isHeart ? `assets/heart_egg_lvl${egg.level}.png` : `assets/pearl_egg_lvl${egg.level}.png`;
  title.innerText = `LEVEL ${egg.level} ${isHeart ? 'HEART PEARL' : 'PEARL'}`;
  
  const fishYield = egg.level * 25000;
  const heartsYield = egg.level * 2;
  reward.innerText = isHeart ? `+${heartsYield} Love Hearts & Task Progress` : `+${fishYield.toLocaleString()} Fish Food Resource`;

  modal.classList.add('active');
}

function executeCrackEgg() {
  if (!activeCrackEgg || activeCrackIndex === null) return;
  audio.play('crack');
  haptic('heavy');

  const egg = activeCrackEgg;
  const idx = activeCrackIndex;
  const s = GameStore.state;

  if (egg.type === 'heart') {
    GameStore.update({ hearts: s.hearts + egg.level * 2 });
  } else {
    GameStore.update({ fish: s.fish + egg.level * 25000 });
  }

  s.grid[idx] = null;
  activeCrackEgg = null;
  activeCrackIndex = null;
  closeAllModals();
  renderMergeGrid();
  audio.play('fanfare');
}

// --- 8. LIVE CANVAS PRICE GRAPH (MARKET) ---
function initMarketChart() {
  const canvas = document.getElementById('priceChartCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.parentElement.clientWidth || 360;
  const height = canvas.height = 120;

  // Draw smooth bezier price curve
  const points = [
    { x: 0, y: 80 },
    { x: width * 0.2, y: 65 },
    { x: width * 0.4, y: 75 },
    { x: width * 0.6, y: 40 },
    { x: width * 0.8, y: 50 },
    { x: width, y: 25 }
  ];

  ctx.clearRect(0, 0, width, height);

  // Gradient fill under curve
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(0, 212, 255, 0.4)');
  grad.addColorStop(1, 'rgba(0, 212, 255, 0.0)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const cx = (points[i-1].x + points[i].x) / 2;
    const cy = (points[i-1].y + points[i].y) / 2;
    ctx.quadraticCurveTo(points[i-1].x, points[i-1].y, cx, cy);
  }
  ctx.lineTo(points[points.length-1].x, points[points.length-1].y);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Stroke line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const cx = (points[i-1].x + points[i].x) / 2;
    const cy = (points[i-1].y + points[i].y) / 2;
    ctx.quadraticCurveTo(points[i-1].x, points[i-1].y, cx, cy);
  }
  ctx.lineTo(points[points.length-1].x, points[points.length-1].y);
  ctx.strokeStyle = '#00D4FF';
  ctx.lineWidth = 3;
  ctx.stroke();
}

// --- 9. REAL PLAYER SHARED BREEDING ROOM ---
function initBreeding() {
  document.getElementById('btnCreateRoom')?.addEventListener('click', () => {
    const roomId = 'REEF-' + Math.floor(1000 + Math.random() * 9000);
    GameStore.update({ breedingRoom: roomId });
    document.getElementById('roomStatusText').innerText = 'Room Created: ' + roomId + ' (Waiting for partner)';
    haptic('medium');
  });

  document.getElementById('btnShareInvite')?.addEventListener('click', () => {
    const room = GameStore.state.breedingRoom || 'REEF-8921';
    const link = `https://t.me/share/url?url=https://t.me/DolphinPearlBot/game?startapp=breed_${room}&text=Join%20my%20Dolphin%20Breeding%20Nest%20Room%20${room}!`;
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(link);
    } else {
      window.open(link, '_blank');
    }
  });

  document.getElementById('btnStartIncubation')?.addEventListener('click', () => {
    audio.play('fanfare');
    haptic('heavy');
    alert('Breeding Incubation started with partner! Cooldown: 6 Hours.');
    closeAllModals();
  });
}

// --- 10. TELEGRAM STARS PAYMENT FLOW ---
function payWithTelegramStars(item, starsAmount) {
  haptic('medium');
  const invoiceUrl = `https://t.me/$invoice?item=${encodeURIComponent(item)}&stars=${starsAmount}`;
  if (window.Telegram?.WebApp?.openInvoice) {
    window.Telegram.WebApp.openInvoice(invoiceUrl, (status) => {
      if (status === 'paid') {
        audio.play('fanfare');
        alert(`Payment successful for ${item}!`);
        GameStore.update({ stars: GameStore.state.stars + starsAmount });
      }
    });
  } else {
    // Fallback in testing
    alert(`Telegram Stars Payment initiated for ${item} (⭐ ${starsAmount}).`);
  }
}

// --- 11. 32 EVENT COLLECTIONS RENDERER ---
const eventsList = [
  { code: 'spring_cruise', name: 'Spring Cruise', slots: 8, prize: '125,000 🐟 + ⭐ 250' },
  { code: 'jolly_roger', name: 'Jolly Roger Pirate', slots: 6, prize: '350,000 🐟 + ⭐ 500' },
  { code: 'abyssal_mystic', name: 'Abyssal Mystic', slots: 20, prize: '4,500,000 🐟 + ⭐ 5,000' },
  { code: 'cyber_currents', name: 'Cyber Currents', slots: 3, prize: '1,200,000 🐟 + ⭐ 1,500' },
  { code: 'golden_overlord', name: 'Golden Overlord', slots: 8, prize: '13,500,000 🐟 + ⭐ 25,000' },
  { code: 'sailor_squad', name: 'Sailor Squad', slots: 6, prize: '650,000 🐟 + ⭐ 800' },
  { code: 'coral_carnival', name: 'Coral Carnival', slots: 8, prize: '850,000 🐟 + ⭐ 1,000' },
  { code: 'volcanic_vent', name: 'Volcanic Vent', slots: 6, prize: '1,500,000 🐟 + ⭐ 2,000' }
];

function renderEventsCollections() {
  const container = document.getElementById('eventsContainer');
  if (!container) return;
  container.innerHTML = '';

  eventsList.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'event-card';

    let slotsHtml = '';
    for (let i = 1; i <= ev.slots; i++) {
      const skinImg = `assets/events/skin_${ev.code}_${((i-1)%4)+1}.png`;
      const isFilled = i <= 2;
      slotsHtml += `
        <div class="event-slot-item ${isFilled ? 'filled' : ''}">
          <img class="event-slot-img" src="${skinImg}" />
          ${isFilled ? '<span style="position:absolute;bottom:2px;right:2px;font-size:8px;color:#FFC933;">✓</span>' : ''}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="event-header">
        <div>
          <div style="font-weight:900; font-size:15px; color:#fff;">${ev.name}</div>
          <div style="font-size:11px; color:#9AA0B4;">Requirement: ${ev.slots} Fully-Fed Lv5 Dolphins</div>
        </div>
        <div style="font-size:11px; color:#FFC933; font-weight:800;">${ev.prize}</div>
      </div>
      <div class="event-slots-tray">${slotsHtml}</div>
      <button class="cta-btn cta-btn-stake" style="font-size:12px; padding:8px;" onclick="openFeedAddModal('${ev.name}')">
        FEED & ADD [Lv5+]
      </button>
    `;
    container.appendChild(card);
  });
}

function openFeedAddModal(eventName) {
  document.getElementById('feedAddEventTitle').innerText = eventName;
  document.getElementById('modalFeedAdd').classList.add('active');
  haptic('medium');
}

// --- 12. TAB ROUTER & NAVIGATION ---
function initRouter() {
  const tabs = document.querySelectorAll('.nav-tab');
  const pages = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      pages.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById('tab-' + target)?.classList.add('active');
      haptic('light');

      if (target === 'market') initMarketChart();
      if (target === 'events') renderEventsCollections();
    });
  });
}

// --- 13. MODAL CONTROLS ---
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

window.addEventListener('DOMContentLoaded', () => {
  initTelegram();
  initPixiEngine();
  initLobby();
  initMergeBoard();
  initBreeding();
  initRouter();

  // Sync Store to DOM
  GameStore.subscribe((s) => {
    document.getElementById('top-fish').innerText = s.fish.toLocaleString();
    document.getElementById('top-stars').innerText = s.stars.toLocaleString();
    document.getElementById('hero-dlp-val').innerText = s.dlp.toFixed(2);
  });

  // Modal open buttons
  document.getElementById('btnOpenPackModal')?.addEventListener('click', () => {
    document.getElementById('modalPack').classList.add('active');
    haptic('medium');
  });

  document.getElementById('btnBreedCTA')?.addEventListener('click', () => {
    document.getElementById('modalBreed').classList.add('active');
    haptic('medium');
  });

  document.getElementById('btnOpenWheelModal')?.addEventListener('click', () => {
    document.getElementById('modalWheel').classList.add('active');
    haptic('medium');
  });

  document.getElementById('btnOpenReefPassModal')?.addEventListener('click', () => {
    document.getElementById('modalReefPass').classList.add('active');
    haptic('medium');
  });

  // Close modals
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
  });
});
