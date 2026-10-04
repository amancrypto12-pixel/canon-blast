
// --- 1. SINGLE-SOURCE-OF-TRUTH GAME STATE STORE ---
const GameStore = {
  state: {
    dlp: 183.21,
    fish: 92039,
    stars: 45,
    hearts: 14,
    shells: 65,
    activeSlot: 0,
    slots: [
      { id: 0, level: 5, rarity: 'Uncommon', feedCost: 150, feedProgress: 5, feedMax: 5, state: 'active', skin: 'assets/dolphin_hero_stage.png', breedEnd: 0 },
      { id: 1, level: 2, rarity: 'Uncommon', feedCost: 110, feedProgress: 2, feedMax: 5, state: 'active', skin: 'assets/events/skin_sailor_squad_1.png', breedEnd: 0 },
      { id: 2, level: 3, rarity: 'Rare', feedCost: 200, feedProgress: 4, feedMax: 5, state: 'active', skin: 'assets/events/skin_cyber_currents_1.png', breedEnd: 0 },
      { id: 3, level: 1, rarity: 'Common', feedCost: 75, feedProgress: 1, feedMax: 5, state: 'active', skin: 'assets/dolphin_hero_stage.png', breedEnd: 0 },
      { id: 4, level: 0, rarity: 'Common', feedCost: 75, feedProgress: 0, feedMax: 5, state: 'locked', skin: 'assets/dolphin_hero_stage.png', breedEnd: 0 },
      { id: 5, level: 0, rarity: 'Common', feedCost: 75, feedProgress: 0, feedMax: 5, state: 'locked', skin: 'assets/dolphin_hero_stage.png', breedEnd: 0 },
      { id: 6, level: 0, rarity: 'Common', feedCost: 75, feedProgress: 0, feedMax: 5, state: 'locked', skin: 'assets/dolphin_hero_stage.png', breedEnd: 0 }
    ],
    grid: Array(49).fill(null),
    combo: 0,
    lastMergeTime: 0
  },

  listeners: [],
  subscribe(fn) { this.listeners.push(fn); },
  notify() { this.listeners.forEach(fn => fn(this.state)); },

  update(patch) {
    Object.assign(this.state, patch);
    this.notify();
  },

  getActiveDolphin() {
    return this.state.slots[this.state.activeSlot];
  }
};

// --- 2. HIGH-ENERGY ARCADE AUDIO ENGINE ---
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
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
  play(type, param = 0) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    if (type === 'tap' || type === 'quack') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1450, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'eat') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'merge') {
      const noteIdx = Math.min(param, this.scale.length - 1);
      const freq = this.scale[noteIdx];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.12);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'crack') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'fanfare') {
      this.scale.slice(0, 5).forEach((freq, idx) => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g);
        g.connect(this.ctx.destination);
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.25, now + idx * 0.06);
        g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.22);
        o.start(now + idx * 0.06);
        o.stop(now + idx * 0.06 + 0.22);
      });
    }
  }
}
const audio = new SoundEngine();

// --- 3. TOAST NOTIFICATION SYSTEM ---
function showToast(text, icon = '✨') {
  let toast = document.getElementById('gameToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'gameToast';
    toast.className = 'game-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>${icon}</span><span>${text}</span>`;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// --- 4. TELEGRAM SDK & HAPTICS ---
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

// --- 5. PIXIJS BACKGROUND AMBIENT ENGINE ---
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

  const orbs = [];
  const graphics = new PIXI.Graphics();
  graphics.beginFill(0x00D4FF, 0.45);
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

// --- 6. FLYING FOOD PARTICLES STREAM ---
function shootFlyingFood(startX, startY, targetX, targetY) {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const el = document.createElement('img');
      el.className = 'flying-food';
      el.src = 'assets/icon_user_fish.png';
      el.style.left = startX + 'px';
      el.style.top = startY + 'px';
      document.body.appendChild(el);

      const startTime = performance.now();
      const duration = 280;
      const midX = (startX + targetX) / 2 + (Math.random() - 0.5) * 50;
      const midY = Math.min(startY, targetY) - 40 - Math.random() * 20;

      function animateFrame(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const curX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * targetX;
        const curY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * targetY;
        const scale = 1 - t * 0.35;

        el.style.left = curX + 'px';
        el.style.top = curY + 'px';
        el.style.transform = `scale(${scale}) rotate(${t * 360}deg)`;

        if (t < 1) {
          requestAnimationFrame(animateFrame);
        } else {
          el.remove();
          audio.play('eat');
          const sprite = document.getElementById('heroSprite');
          if (sprite) {
            sprite.classList.add('eating');
            setTimeout(() => sprite.classList.remove('eating'), 90);
          }
        }
      }
      requestAnimationFrame(animateFrame);
    }, i * 45);
  }
}

// --- 7. DYNAMIC SLOTS & LOBBY SYSTEM ---
function initLobby() {
  const heroCard = document.getElementById('heroCard');
  const feedBtn = document.getElementById('feedBtn');

  function handleFeed(e) {
    const s = GameStore.state;
    const dolphin = GameStore.getActiveDolphin();
    if (!dolphin || dolphin.state === 'locked') return;

    if (dolphin.state === 'breeding') {
      showToast('Breeding in progress! Please do not disturb 💖', '⏳');
      return;
    }

    const cost = dolphin.feedCost || 150;
    if (s.fish < cost) {
      showToast(`Need ${cost} Fish! Breed or crack eggs for fish.`, '🐟');
      return;
    }

    audio.play('tap');
    haptic('medium');

    const rect = feedBtn.getBoundingClientRect();
    const cardRect = heroCard.getBoundingClientRect();
    const tapX = e.clientX || (rect.left + rect.width / 2);
    const tapY = e.clientY || rect.top;
    const mouthX = cardRect.left + cardRect.width / 2;
    const mouthY = cardRect.top + cardRect.height * 0.42;

    shootFlyingFood(tapX, tapY, mouthX, mouthY);

    const yieldAmount = +(0.02 * dolphin.level).toFixed(2);
    spawnTapParticle(tapX - 25, tapY - 10, `+${yieldAmount} DLP`, '#00D4FF');
    spawnTapParticle(tapX + 25, tapY, `-${cost} 🐟`, '#6BE35A');

    // Feed progression
    let nextFeeds = dolphin.feedProgress + 1;
    if (nextFeeds >= dolphin.feedMax) {
      if (dolphin.level < 5) {
        dolphin.level += 1;
        dolphin.feedProgress = 0;
        audio.play('fanfare');
        showToast(`LEVEL UP! Dolphin reached Level ${dolphin.level}! 🎉`, '⭐');
      } else {
        dolphin.feedProgress = dolphin.feedMax;
        dolphin.state = 'ready_breed';
        audio.play('fanfare');
        showToast('MAX LEVEL REACHED! READY TO BREED OR STAKE 👑', '🎉');
      }
    } else {
      dolphin.feedProgress = nextFeeds;
    }

    GameStore.update({
      dlp: +(s.dlp + yieldAmount).toFixed(2),
      fish: s.fish - cost
    });

    renderActiveDolphin();
  }

  if (feedBtn) feedBtn.addEventListener('click', handleFeed);
  if (heroCard) heroCard.addEventListener('click', (e) => {
    const dolphin = GameStore.getActiveDolphin();
    if (dolphin && dolphin.state !== 'locked' && e.target !== feedBtn && !feedBtn.contains(e.target)) {
      handleFeed(e);
    }
  });

  renderActiveDolphin();
  renderSlotsTracker();
}

function renderActiveDolphin() {
  const dolphin = GameStore.getActiveDolphin();
  if (!dolphin) return;

  const heroCard = document.getElementById('heroCard');
  const cardActiveView = document.getElementById('cardActiveView');
  const cardLockedView = document.getElementById('cardLockedView');

  if (dolphin.state === 'locked') {
    heroCard.classList.add('dotted-locked');
    cardActiveView.style.display = 'none';
    cardLockedView.style.display = 'flex';
  } else {
    heroCard.classList.remove('dotted-locked');
    cardActiveView.style.display = 'flex';
    cardLockedView.style.display = 'none';

    const sprite = document.getElementById('heroSprite');
    const levelPill = document.getElementById('heroLevelPill');
    const rarityPill = document.getElementById('heroRarityPill');
    const feedCostSpan = document.getElementById('feedCostVal');

    if (sprite) {
      sprite.src = dolphin.skin;
      const scale = 0.85 + (dolphin.level * 0.05);
      sprite.style.transform = `scale(${scale})`;
    }

    if (levelPill) levelPill.innerText = `LVL ${dolphin.level}`;
    if (rarityPill) {
      rarityPill.innerText = dolphin.rarity.toUpperCase();
      rarityPill.className = `card-pill rarity-${dolphin.rarity.toLowerCase()}`;
    }
    if (feedCostSpan) feedCostSpan.innerText = dolphin.feedCost || 150;
  }

  // Update Authentic Duck My Duck Widget
  const dmdLevelBadge = document.getElementById('dmdLevelBadge');
  const dmdProgressFill = document.getElementById('dmdProgressFill');
  const dmdBreedPill = document.getElementById('dmdBreedPill');

  if (dmdLevelBadge) dmdLevelBadge.innerText = dolphin.level || 1;
  const percent = dolphin.feedMax ? (dolphin.feedProgress / dolphin.feedMax) * 100 : 0;
  if (dmdProgressFill) dmdProgressFill.style.width = percent + '%';

  if (dmdBreedPill) {
    if (dolphin.level >= 5 && dolphin.feedProgress >= 5) {
      dmdBreedPill.innerText = 'READY TO BREED';
    } else {
      dmdBreedPill.innerText = `BREED ${dolphin.feedProgress || 0}/${dolphin.feedMax || 5}`;
    }
  }

  renderSlotsTracker();
}

function renderSlotsTracker() {
  const container = document.getElementById('slotsTrackerRow');
  if (!container) return;
  container.innerHTML = '';
  const s = GameStore.state;

  s.slots.forEach((slot, idx) => {
    const dot = document.createElement('div');
    dot.className = 'slot-item';

    if (idx === s.activeSlot) {
      dot.classList.add('active');
    } else if (slot.state !== 'locked') {
      dot.classList.add('owned');
    } else {
      dot.classList.add('locked');
      dot.innerText = '🔒';
    }

    dot.addEventListener('click', () => {
      GameStore.update({ activeSlot: idx });
      haptic('light');
      renderActiveDolphin();
    });

    container.appendChild(dot);
  });

  // Plus button to buy in advance
  const plusBtn = document.createElement('div');
  plusBtn.className = 'slot-item add-plus';
  plusBtn.innerText = '➕';
  plusBtn.addEventListener('click', () => {
    const lockedIdx = s.slots.findIndex(sl => sl.state === 'locked');
    if (lockedIdx !== -1) {
      GameStore.update({ activeSlot: lockedIdx });
      renderActiveDolphin();
    } else {
      showToast('All slots currently unlocked! 👑', '⭐');
    }
  });
  container.appendChild(plusBtn);
}

function unlockActiveSlotWithStars() {
  const s = GameStore.state;
  const dolphin = GameStore.getActiveDolphin();
  if (!dolphin || dolphin.state !== 'locked') return;

  if (s.stars < 120) {
    payWithTelegramStars('Unlock Slot for New Dolphin', 120);
    return;
  }

  // Deduct stars & unlock
  dolphin.state = 'active';
  dolphin.level = 1;
  dolphin.feedCost = 75;
  dolphin.feedProgress = 0;
  dolphin.feedMax = 5;
  dolphin.rarity = 'Common';
  dolphin.skin = 'assets/dolphin_hero_stage.png';

  GameStore.update({ stars: s.stars - 120 });
  audio.play('fanfare');
  haptic('heavy');
  showToast('New Dolphin Slot Unlocked! Deploy & start feeding! 🎉', '🐬');
  renderActiveDolphin();
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

// --- 8. 7x7 MERGE-2 BOARD ---
const lockedCorners = [0, 6, 42, 48];
let selectedCellIndex = null;
let draggedIndex = null;
let ghostDragEl = null;

function initMergeBoard() {
  const gridEl = document.getElementById('mergeGrid');
  if (!gridEl) return;

  const s = GameStore.state;
  for (let i = 0; i < 49; i++) {
    if (!lockedCorners.includes(i) && Math.random() < 0.28 && !s.grid[i]) {
      s.grid[i] = {
        level: Math.floor(Math.random() * 3) + 1,
        type: Math.random() < 0.4 ? 'heart' : 'pearl'
      };
    }
  }

  renderMergeGrid();
  setupPointerDrag();

  document.getElementById('btnAutoMerge')?.addEventListener('click', autoMergeGrid);
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

      cell.addEventListener('click', () => handleCellClick(i));
    }
    gridEl.appendChild(cell);
  }
}

function setupPointerDrag() {
  const gridEl = document.getElementById('mergeGrid');
  if (!gridEl) return;

  gridEl.addEventListener('pointerdown', (e) => {
    const cell = e.target.closest('.grid-cell');
    if (!cell) return;
    const idx = parseInt(cell.dataset.index);
    if (isNaN(idx) || lockedCorners.includes(idx)) return;
    const s = GameStore.state;
    if (!s.grid[idx]) return;

    draggedIndex = idx;
    const item = s.grid[idx];

    ghostDragEl = document.createElement('img');
    ghostDragEl.src = item.type === 'heart' ? `assets/heart_egg_lvl${item.level}.png` : `assets/pearl_egg_lvl${item.level}.png`;
    ghostDragEl.style.position = 'fixed';
    ghostDragEl.style.width = '46px';
    ghostDragEl.style.height = '46px';
    ghostDragEl.style.pointerEvents = 'none';
    ghostDragEl.style.zIndex = '5000';
    ghostDragEl.style.transform = 'translate(-50%, -50%) scale(1.18)';
    ghostDragEl.style.left = e.clientX + 'px';
    ghostDragEl.style.top = e.clientY + 'px';
    document.body.appendChild(ghostDragEl);

    cell.style.opacity = '0.3';
    haptic('light');
  });

  window.addEventListener('pointermove', (e) => {
    if (!ghostDragEl) return;
    ghostDragEl.style.left = e.clientX + 'px';
    ghostDragEl.style.top = e.clientY + 'px';

    document.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('drag-over'));
    const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
    const targetCell = hoveredEl?.closest('.grid-cell');
    if (targetCell) targetCell.classList.add('drag-over');
  });

  window.addEventListener('pointerup', (e) => {
    if (draggedIndex === null) return;
    if (ghostDragEl) {
      ghostDragEl.remove();
      ghostDragEl = null;
    }

    document.querySelectorAll('.grid-cell').forEach(c => {
      c.style.opacity = '1';
      c.classList.remove('drag-over');
    });

    const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
    const targetCell = hoveredEl?.closest('.grid-cell');
    if (targetCell) {
      const targetIdx = parseInt(targetCell.dataset.index);
      if (!isNaN(targetIdx) && targetIdx !== draggedIndex && !lockedCorners.includes(targetIdx)) {
        performMergeOrMove(draggedIndex, targetIdx);
      }
    }

    draggedIndex = null;
  });
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
      if (s.grid[idx] && s.grid[idx].level >= 4) {
        openCrackModal(s.grid[idx], idx);
      }
      selectedCellIndex = null;
      renderMergeGrid();
      return;
    }
    performMergeOrMove(selectedCellIndex, idx);
    selectedCellIndex = null;
  }
}

function performMergeOrMove(fromIdx, toIdx) {
  const s = GameStore.state;
  const source = s.grid[fromIdx];
  const target = s.grid[toIdx];

  if (!source) return;

  if (target && source.type === target.type && source.level === target.level && source.level < 12) {
    const now = Date.now();
    let combo = (now - s.lastMergeTime < 2500) ? s.combo + 1 : 1;
    audio.play('merge', combo);
    haptic('heavy');

    target.level += 1;
    s.grid[fromIdx] = null;
    GameStore.update({ shells: s.shells + 5, combo: combo, lastMergeTime: now });
    showToast(`Merged Level ${target.level} Pearl! (Combo x${combo})`, '✨');
    renderMergeGrid();
  } else if (!target) {
    s.grid[toIdx] = source;
    s.grid[fromIdx] = null;
    haptic('light');
    renderMergeGrid();
  } else {
    renderMergeGrid();
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
    audio.play('merge', 2);
    haptic('heavy');
    showToast('Auto-Merge complete!', '⚡');
    renderMergeGrid();
  }
}

function dropLoveEggOnBoard(level = 1) {
  const s = GameStore.state;
  const emptyIndices = [];
  for (let i = 0; i < 49; i++) {
    if (!lockedCorners.includes(i) && !s.grid[i]) emptyIndices.push(i);
  }
  if (emptyIndices.length > 0) {
    const targetIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    s.grid[targetIdx] = { level: level, type: 'heart' };
    renderMergeGrid();
  }
}

// --- 9. 5-STAGE EGG CRACKING RITUAL MODAL ---
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
  img.classList.remove('shake');
  title.innerText = `LEVEL ${egg.level} ${isHeart ? 'LOVE HEART EGG' : 'PEARL'}`;
  
  const fishYield = egg.level * 25000;
  const heartsYield = egg.level * 2;
  reward.innerText = isHeart ? `+${heartsYield} Love Hearts & Task Progress` : `+${fishYield.toLocaleString()} Fish Food Resource`;

  modal.classList.add('active');
}

function executeCrackEgg() {
  if (!activeCrackEgg || activeCrackIndex === null) return;
  const img = document.getElementById('crackEggImg');
  img.classList.add('shake');
  audio.play('crack');
  haptic('heavy');

  setTimeout(() => {
    const egg = activeCrackEgg;
    const idx = activeCrackIndex;
    const s = GameStore.state;

    if (egg.type === 'heart') {
      GameStore.update({ hearts: s.hearts + egg.level * 2 });
      showToast(`CRACKED! +${egg.level * 2} Love Hearts ❤️`, '🎉');
    } else {
      GameStore.update({ fish: s.fish + egg.level * 25000 });
      showToast(`CRACKED! +${(egg.level * 25000).toLocaleString()} 🐟 Fish Food`, '🎉');
    }

    s.grid[idx] = null;
    activeCrackEgg = null;
    activeCrackIndex = null;
    closeAllModals();
    renderMergeGrid();
    audio.play('fanfare');
  }, 420);
}

// --- 10. LIVE CANVAS PRICE GRAPH (MARKET) ---
function initMarketChart() {
  const canvas = document.getElementById('priceChartCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.parentElement.clientWidth || 360;
  const height = canvas.height = 110;

  const points = [
    { x: 0, y: 70 },
    { x: width * 0.2, y: 55 },
    { x: width * 0.4, y: 65 },
    { x: width * 0.6, y: 35 },
    { x: width * 0.8, y: 45 },
    { x: width, y: 20 }
  ];

  ctx.clearRect(0, 0, width, height);

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(0, 212, 255, 0.45)');
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

// --- 11. DUAL BREEDING FLOW (REAL PLAYER & AUTO-BOT) ---
function startBreedingWithBot() {
  const dolphin = GameStore.getActiveDolphin();
  if (!dolphin || dolphin.state === 'locked') return;
  dolphin.state = 'breeding';
  dolphin.breedEnd = Date.now() + 6 * 3600 * 1000;
  audio.play('fanfare');
  haptic('heavy');
  showToast('Matched with Breeding Bot! Status: DO NOT DISTURB 💖', '🐣');
  
  dropLoveEggOnBoard(2);
  
  closeAllModals();
  renderActiveDolphin();
}

function startStakingActive() {
  const dolphin = GameStore.getActiveDolphin();
  if (!dolphin || dolphin.state === 'locked') return;
  dolphin.state = 'staked';
  audio.play('fanfare');
  haptic('heavy');
  showToast('Dolphin staked in 24/7 automated harvest pool! ⚡', '👑');
  closeAllModals();
  renderActiveDolphin();
}

// --- 12. TELEGRAM STARS PAYMENT FLOW ---
function payWithTelegramStars(item, starsAmount) {
  haptic('medium');
  const invoiceUrl = `https://t.me/$invoice?item=${encodeURIComponent(item)}&stars=${starsAmount}`;
  if (window.Telegram?.WebApp?.openInvoice) {
    window.Telegram.WebApp.openInvoice(invoiceUrl, (status) => {
      if (status === 'paid') {
        audio.play('fanfare');
        showToast(`Payment successful for ${item}!`, '⭐');
        GameStore.update({ stars: GameStore.state.stars + starsAmount });
      }
    });
  } else {
    showToast(`Telegram Stars Payment: ⭐ ${starsAmount}`, '⭐');
  }
}

// --- 13. TAB ROUTER & NAVIGATION (5 AUTHENTIC TABS) ---
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
    });
  });
}

// --- 14. MODAL CONTROLS ---
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

window.addEventListener('DOMContentLoaded', () => {
  initTelegram();
  initPixiEngine();
  initLobby();
  initMergeBoard();
  initRouter();

  GameStore.subscribe((s) => {
    document.getElementById('top-fish').innerText = s.fish.toLocaleString();
    document.getElementById('top-stars').innerText = s.stars.toLocaleString();
    document.getElementById('hero-dlp-val').innerText = s.dlp.toFixed(2);
  });

  document.getElementById('btnOpenPackModal')?.addEventListener('click', () => {
    document.getElementById('modalPack').classList.add('active');
    haptic('medium');
  });

  document.getElementById('dmdBreedPill')?.addEventListener('click', () => {
    const dolphin = GameStore.getActiveDolphin();
    if (dolphin.level < 5 || dolphin.feedProgress < dolphin.feedMax) {
      showToast(`Reach 5/5 Feeds to breed! Currently: ${dolphin.feedProgress}/${dolphin.feedMax}`, '💖');
    } else {
      document.getElementById('modalBreed').classList.add('active');
      haptic('medium');
    }
  });

  document.getElementById('dmdStakePill')?.addEventListener('click', () => {
    const dolphin = GameStore.getActiveDolphin();
    if (dolphin.level < 5 || dolphin.feedProgress < dolphin.feedMax) {
      showToast(`Reach Level 5 (5/5 Feeds) to stake! Currently: Level ${dolphin.level}`, '⚡');
    } else {
      startStakingActive();
    }
  });

  document.getElementById('btnOpenWheelModal')?.addEventListener('click', () => {
    document.getElementById('modalWheel').classList.add('active');
    haptic('medium');
  });

  document.getElementById('btnOpenReefPassModal')?.addEventListener('click', () => {
    document.getElementById('modalReefPass').classList.add('active');
    haptic('medium');
  });

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
  });
});
