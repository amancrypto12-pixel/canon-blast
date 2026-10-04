
// --- 1. SINGLE-SOURCE-OF-TRUTH GAME STATE STORE ---
const GameStore = {
  state: {
    dlp: 187.74,
    fish: 85361,
    stars: 50,
    hearts: 14,
    shells: 65,
    activeSlot: 0,
    slots: [
      { id: 0, level: 1, rarity: 'Common', feedProgress: 0, feedMax: 5, state: 'active', skin: 'assets/dolphin_hero_stage.png', breedEnd: 0 },
      { id: 1, level: 2, rarity: 'Uncommon', feedProgress: 2, feedMax: 5, state: 'active', skin: 'assets/events/skin_sailor_squad_1.png', breedEnd: 0 },
      { id: 2, level: 3, rarity: 'Rare', feedProgress: 4, feedMax: 5, state: 'active', skin: 'assets/events/skin_cyber_currents_1.png', breedEnd: 0 },
      { id: 3, level: 5, rarity: 'Epic', feedProgress: 5, feedMax: 5, state: 'ready_breed', skin: 'assets/events/skin_abyssal_mystic_1.png', breedEnd: 0 },
      { id: 4, level: 1, rarity: 'Common', feedProgress: 1, feedMax: 5, state: 'active', skin: 'assets/dolphin_hero_stage.png', breedEnd: 0 },
      { id: 5, level: 0, rarity: 'Common', feedProgress: 0, feedMax: 5, state: 'locked', skin: 'assets/dolphin_hero_stage.png', breedEnd: 0 },
      { id: 6, level: 0, rarity: 'Common', feedProgress: 0, feedMax: 5, state: 'locked', skin: 'assets/dolphin_hero_stage.png', breedEnd: 0 },
      { id: 7, level: 0, rarity: 'Common', feedProgress: 0, feedMax: 5, state: 'locked', skin: 'assets/dolphin_hero_stage.png', breedEnd: 0 },
      { id: 8, level: 0, rarity: 'Common', feedProgress: 0, feedMax: 5, state: 'locked', skin: 'assets/dolphin_hero_stage.png', breedEnd: 0 },
      { id: 9, level: 0, rarity: 'Common', feedProgress: 0, feedMax: 5, state: 'locked', skin: 'assets/dolphin_hero_stage.png', breedEnd: 0 },
      { id: 10, level: 0, rarity: 'Common', feedProgress: 0, feedMax: 5, state: 'locked', skin: 'assets/dolphin_hero_stage.png', breedEnd: 0 }
    ],
    grid: Array(49).fill(null),
    combo: 0,
    lastMergeTime: 0,
    hotTimer: 24,
    marketMode: 'dolphins'
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

// --- 2. PENTATONIC AUDIO SYNTHESIZER ---
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
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(1450, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.09);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'eat') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.07);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'merge') {
      const noteIdx = Math.min(param, this.scale.length - 1);
      const freq = this.scale[noteIdx];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.14);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'crack') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.22);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'fanfare') {
      this.scale.slice(0, 4).forEach((freq, idx) => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g);
        g.connect(this.ctx.destination);
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.2, now + idx * 0.07);
        g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.24);
        o.start(now + idx * 0.07);
        o.stop(now + idx * 0.07 + 0.24);
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

// --- 5. PIXIJS BACKGROUND PARTICLES ENGINE ---
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
      const duration = 300;
      const midX = (startX + targetX) / 2 + (Math.random() - 0.5) * 60;
      const midY = Math.min(startY, targetY) - 50 - Math.random() * 30;

      function animateFrame(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const curX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * targetX;
        const curY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * targetY;
        const scale = 1 - t * 0.4;

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
            setTimeout(() => sprite.classList.remove('eating'), 100);
          }
        }
      }
      requestAnimationFrame(animateFrame);
    }, i * 50);
  }
}

// --- 7. DYNAMIC LEVEL PROGRESSION & FEED ENGINE ---
function getFeedCost(level, rarity) {
  const baseCosts = { Common: 75, Uncommon: 150, Rare: 300, Epic: 750, Legendary: 2000 };
  const base = baseCosts[rarity] || 75;
  return Math.floor(base * Math.pow(1.35, level - 1));
}

function initLobby() {
  const heroCard = document.getElementById('heroCard');
  const feedBtn = document.getElementById('feedBtn');
  const sprite = document.getElementById('heroSprite');

  function handleFeed(e) {
    const s = GameStore.state;
    const dolphin = GameStore.getActiveDolphin();
    if (!dolphin || dolphin.state === 'locked') return;

    if (dolphin.state === 'breeding') {
      showToast('Breeding in progress! Please do not disturb 💖', '⏳');
      return;
    }

    const cost = getFeedCost(dolphin.level, dolphin.rarity);
    if (s.fish < cost) {
      showToast(`Need ${cost} Fish! Merge pearls or crack eggs.`, '🐟');
      return;
    }

    audio.play('tap');
    haptic('medium');

    const rect = feedBtn.getBoundingClientRect();
    const cardRect = heroCard.getBoundingClientRect();
    const tapX = e.clientX || (rect.left + rect.width / 2);
    const tapY = e.clientY || rect.top;
    const mouthX = cardRect.left + cardRect.width / 2;
    const mouthY = cardRect.top + cardRect.height * 0.45;

    shootFlyingFood(tapX, tapY, mouthX, mouthY);

    const yieldAmount = +(0.02 * dolphin.level).toFixed(2);
    spawnTapParticle(tapX - 25, tapY - 10, `+${yieldAmount} DLP`, '#00D4FF');
    spawnTapParticle(tapX + 25, tapY, `-${cost} 🐟`, '#6BE35A');

    // Progress Level Up
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
    if (e.target !== feedBtn && !feedBtn.contains(e.target)) handleFeed(e);
  });

  renderActiveDolphin();
  initSlotSelector();
}

function renderActiveDolphin() {
  const dolphin = GameStore.getActiveDolphin();
  if (!dolphin) return;

  const sprite = document.getElementById('heroSprite');
  const rarityPill = document.getElementById('heroRarityPill');
  const slotPill = document.getElementById('heroSlotPill');
  const feedCostSpan = document.getElementById('feedCostVal');
  const breedProgressText = document.getElementById('breedProgressText');
  const levelProgressFill = document.getElementById('levelProgressFill');
  const levelProgressText = document.getElementById('levelProgressText');
  const statusChipVal = document.getElementById('statusChipVal');

  // Update card visuals
  if (sprite) {
    sprite.src = dolphin.skin;
    const scale = 0.85 + (dolphin.level * 0.05);
    sprite.style.transform = `scale(${scale})`;
  }

  const cost = getFeedCost(dolphin.level, dolphin.rarity);
  if (feedCostSpan) feedCostSpan.innerText = cost;
  if (rarityPill) rarityPill.innerText = `LVL ${dolphin.level} • ${dolphin.rarity.toUpperCase()}`;
  if (slotPill) slotPill.innerText = `SLOT ${GameStore.state.activeSlot + 1} / 11`;
  if (statusChipVal) statusChipVal.innerText = `LVL ${dolphin.level} ~ ${dolphin.rarity.toUpperCase()}`;

  // Update Progress Bars
  const percent = (dolphin.feedProgress / dolphin.feedMax) * 100;
  if (levelProgressFill) levelProgressFill.style.width = percent + '%';
  if (levelProgressText) {
    if (dolphin.level >= 5 && dolphin.feedProgress >= 5) {
      levelProgressText.innerText = 'MAX (5/5 FEEDS) - READY TO BREED';
      levelProgressText.style.color = 'var(--accent-gold)';
    } else {
      levelProgressText.innerText = `LEVEL ${dolphin.level} PROGRESS: ${dolphin.feedProgress}/${dolphin.feedMax} FEEDS`;
      levelProgressText.style.color = '#fff';
    }
  }
  if (breedProgressText) breedProgressText.innerText = `BREED ${dolphin.feedProgress}/${dolphin.feedMax}`;

  // State Banners (Breeding / Ready to Breed)
  const breedingBanner = document.getElementById('bannerBreeding');
  const readyBanner = document.getElementById('bannerReady');

  if (dolphin.state === 'breeding') {
    if (breedingBanner) breedingBanner.classList.add('active');
    if (readyBanner) readyBanner.classList.remove('active');
  } else if (dolphin.state === 'ready_breed') {
    if (readyBanner) readyBanner.classList.add('active');
    if (breedingBanner) breedingBanner.classList.remove('active');
  } else {
    if (breedingBanner) breedingBanner.classList.remove('active');
    if (readyBanner) readyBanner.classList.remove('active');
  }

  // Update 11 Slots row
  document.querySelectorAll('.slot-dot').forEach((dot, idx) => {
    dot.classList.remove('active', 'owned');
    const sDolphin = GameStore.state.slots[idx];
    if (sDolphin && sDolphin.state !== 'locked') dot.classList.add('owned');
    if (idx === GameStore.state.activeSlot) dot.classList.add('active');
  });
}

function initSlotSelector() {
  document.querySelectorAll('.slot-dot').forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      const sDolphin = GameStore.state.slots[idx];
      if (sDolphin && sDolphin.state !== 'locked') {
        GameStore.update({ activeSlot: idx });
        haptic('light');
        renderActiveDolphin();
      } else if (sDolphin && sDolphin.state === 'locked') {
        showToast(`Unlock Slot ${idx + 1} with ⭐ 120 Stars!`, '🔒');
      }
    });
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
        type: Math.random() < 0.3 ? 'heart' : 'pearl'
      };
    }
  }

  renderMergeGrid();
  setupPointerDrag();

  document.getElementById('btnAutoMerge')?.addEventListener('click', autoMergeGrid);
  document.getElementById('btnSpawnPearl')?.addEventListener('click', spawnPearlToBoard);
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
    ghostDragEl.style.width = '50px';
    ghostDragEl.style.height = '50px';
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

function spawnPearlToBoard() {
  const s = GameStore.state;
  if (s.fish < 150) {
    showToast('Need 150 Fish to spawn pearl!', '🐟');
    return;
  }
  const emptyIndices = [];
  for (let i = 0; i < 49; i++) {
    if (!lockedCorners.includes(i) && !s.grid[i]) emptyIndices.push(i);
  }
  if (emptyIndices.length === 0) {
    showToast('Board is full! Merge or crack pearls.', '⚠️');
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
  title.innerText = `LEVEL ${egg.level} ${isHeart ? 'HEART PEARL' : 'PEARL'}`;
  
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
  }, 450);
}

// --- 10. LIVE CANVAS PRICE GRAPH (MARKET) ---
function initMarketChart() {
  const canvas = document.getElementById('priceChartCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.parentElement.clientWidth || 360;
  const height = canvas.height = 120;

  const points = [
    { x: 0, y: 80 },
    { x: width * 0.2, y: 65 },
    { x: width * 0.4, y: 75 },
    { x: width * 0.6, y: 40 },
    { x: width * 0.8, y: 50 },
    { x: width, y: 25 }
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

// --- 11. BREEDING AND STAKING IN-GAME STATE TRANSITIONS ---
function startBreedingActive() {
  const dolphin = GameStore.getActiveDolphin();
  if (!dolphin) return;
  dolphin.state = 'breeding';
  dolphin.breedEnd = Date.now() + 6 * 3600 * 1000; // 6 hours
  audio.play('fanfare');
  haptic('heavy');
  showToast('Breeding started! Status: DO NOT DISTURB 💖', '🐣');
  closeAllModals();
  renderActiveDolphin();
}

function startStakingActive() {
  const dolphin = GameStore.getActiveDolphin();
  if (!dolphin) return;
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

// --- 13. 32 EVENT COLLECTIONS RENDERER ---
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
          <div style="font-family:'Fredoka',sans-serif; font-weight:900; font-size:16px; color:#fff;">${ev.name}</div>
          <div style="font-size:11px; color:#9AA0B4;">Requirement: ${ev.slots} Fully-Fed Lv5 Dolphins</div>
        </div>
        <div style="font-family:'Fredoka',sans-serif; font-size:12px; color:#FFC933; font-weight:900;">${ev.prize}</div>
      </div>
      <div class="event-slots-tray">${slotsHtml}</div>
      <button class="cta-btn cta-btn-stake" style="font-size:12px; padding:9px;" onclick="openFeedAddModal('${ev.name}')">
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

// --- 14. TAB ROUTER & NAVIGATION ---
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

// --- 15. MODAL CONTROLS ---
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

  document.getElementById('btnBreedCTA')?.addEventListener('click', () => {
    const dolphin = GameStore.getActiveDolphin();
    if (dolphin.level < 5 || dolphin.feedProgress < dolphin.feedMax) {
      showToast(`Reach Level 5 (5/5 Feeds) to breed! Currently: Level ${dolphin.level} (${dolphin.feedProgress}/${dolphin.feedMax})`, '💖');
    } else {
      document.getElementById('modalBreed').classList.add('active');
      haptic('medium');
    }
  });

  document.getElementById('btnStakeCTA')?.addEventListener('click', () => {
    const dolphin = GameStore.getActiveDolphin();
    if (dolphin.level < 5 || dolphin.feedProgress < dolphin.feedMax) {
      showToast(`Reach Level 5 (5/5 Feeds) to stake! Currently: Level ${dolphin.level}`, '⚡');
    } else {
      startStakingActive();
    }
  });

  document.getElementById('btnStartBreedingBanner')?.addEventListener('click', startBreedingActive);
  document.getElementById('btnStartStakingBanner')?.addEventListener('click', startStakingActive);

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
