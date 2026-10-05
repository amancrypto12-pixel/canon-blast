// DOLPHIN MY DOLPHIN - EXACT 1:1 MASTER GAME ENGINE
(function() {
  'use strict';

  // --- AUDIO SYNTH ENGINE ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
    }
    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }
    playFeedChime() {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
    playMergeChord(tier) {
      this.init();
      if (!this.ctx) return;
      const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 987.77, 1046.50];
      const baseFreq = notes[Math.min(tier || 1, notes.length - 1)];
      const now = this.ctx.currentTime;
      [baseFreq, baseFreq * 1.25, baseFreq * 1.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.15, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.35);
      });
    }
    playEggCrack() {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }
    playCelebration() {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    }
  }

  const sound = new SoundEngine();

  // --- GAME STATE ---
  const state = {
    activeTab: 'dolphins',
    currencies: {
      pearlsBalance: 92935,
      starsBalance: 420
    },
    deckSlots: [
      { id: 1, name: 'Poseidon Dolphin', sprite: 'assets/premium/legendary_dolphin_poseidon.png', level: 5, exp: 40, maxExp: 100, feedCost: 10, rarity: 'LEGENDARY', yield: 144, mult: 'x2.5', rank: '#1,204' },
      { id: 2, name: 'Ocean Mystic', sprite: 'assets/dolphin_rare.png', level: 4, exp: 20, maxExp: 80, feedCost: 8, rarity: 'RARE', yield: 95, mult: 'x1.8', rank: '#3,410' },
      { id: 3, name: 'Abyss Titan', sprite: 'assets/dolphin_epic.png', level: 3, exp: 60, maxExp: 90, feedCost: 12, rarity: 'EPIC', yield: 120, mult: 'x2.2', rank: '#2,150' },
      { id: 4, name: 'Coral Sprinter', sprite: 'assets/dolphin_uncommon.png', level: 2, exp: 10, maxExp: 50, feedCost: 6, rarity: 'UNCOMMON', yield: 60, mult: 'x1.4', rank: '#5,820' },
      { id: 5, name: 'Tide Swimmer', sprite: 'assets/dolphin_common.png', level: 1, exp: 0, maxExp: 40, feedCost: 4, rarity: 'COMMON', yield: 30, mult: 'x1.0', rank: '#8,900' },
      { id: 6, name: 'Deep Diver', sprite: 'assets/dolphin_happy.png', level: 1, exp: 10, maxExp: 40, feedCost: 4, rarity: 'COMMON', yield: 30, mult: 'x1.0', rank: '#9,100' },
      { id: 7, name: 'Aqua Scout', sprite: 'assets/dolphin_smug.png', level: 1, exp: 25, maxExp: 40, feedCost: 4, rarity: 'COMMON', yield: 30, mult: 'x1.0', rank: '#9,340' },
      { id: 8, name: 'Neon Glider', sprite: 'assets/dolphin_rare.png', level: 2, exp: 15, maxExp: 60, feedCost: 8, rarity: 'RARE', yield: 75, mult: 'x1.8', rank: '#4,100' },
      { id: 9, name: 'Storm Fin', sprite: 'assets/dolphin_epic.png', level: 2, exp: 30, maxExp: 75, feedCost: 12, rarity: 'EPIC', yield: 110, mult: 'x2.2', rank: '#2,900' },
      { id: 10, name: 'Solar Surge', sprite: 'assets/dolphin_legendary.png', level: 1, exp: 0, maxExp: 100, feedCost: 15, rarity: 'LEGENDARY', yield: 135, mult: 'x2.5', rank: '#1,800' },
      { id: 11, name: 'Aura Sovereign', sprite: 'assets/premium/legendary_dolphin_poseidon.png', level: 1, exp: 0, maxExp: 100, feedCost: 15, rarity: 'LEGENDARY', yield: 140, mult: 'x2.5', rank: '#1,500' }
    ],
    activeSlotIdx: 0,
    isBreeding: false,
    breedEndTime: 0,
    gridArray: new Array(42).fill(null),
    eggCrackTaps: 0,
    draggedIndex: null
  };

  // Pre-fill merge grid with starter shells
  state.gridArray[0] = { level: 1, type: 'pearl', sprite: 'assets/pearl_t1.png' };
  state.gridArray[1] = { level: 1, type: 'pearl', sprite: 'assets/pearl_t1.png' };
  state.gridArray[6] = { level: 2, type: 'pearl', sprite: 'assets/pearl_t2.png' };
  state.gridArray[7] = { level: 2, type: 'pearl', sprite: 'assets/pearl_t2.png' };
  state.gridArray[12] = { level: 3, type: 'pearl', sprite: 'assets/pearl_t3.png' };
  state.gridArray[18] = { level: 1, type: 'heart', sprite: 'assets/heart_egg_t1.png' };
  state.gridArray[19] = { level: 1, type: 'heart', sprite: 'assets/heart_egg_t1.png' };

  // --- UI UPDATE HELPERS ---
  function updateHeader() {
    const pEl = document.getElementById('header-pearls-val');
    if (pEl) pEl.innerText = state.currencies.pearlsBalance.toLocaleString();

    const sEl = document.getElementById('header-stars-val');
    if (sEl) sEl.innerText = state.currencies.starsBalance.toLocaleString();
  }

  function updateActiveCard() {
    const cur = state.deckSlots[state.activeSlotIdx];
    if (!cur) return;

    const rarityEl = document.getElementById('dolphin-rarity-badge');
    if (rarityEl) {
      rarityEl.innerText = cur.rarity;
      rarityEl.className = `rarity-pill border-rarity-${cur.rarity.toLowerCase()}`;
    }

    const lvlEl = document.getElementById('dolphin-level-badge');
    if (lvlEl) lvlEl.innerText = `LVL ${cur.level}`;

    const mascotImg = document.getElementById('dolphin-hero-img');
    if (mascotImg) mascotImg.src = cur.sprite;

    const expText = document.getElementById('dolphin-exp-text');
    if (expText) expText.innerText = `EXP ${cur.exp} / ${cur.maxExp}`;

    const expFill = document.getElementById('dolphin-exp-fill');
    if (expFill) {
      const pct = Math.min(100, Math.round((cur.exp / cur.maxExp) * 100));
      expFill.style.width = `${pct}%`;
    }

    const yieldEl = document.getElementById('dolphin-yield-val');
    if (yieldEl) yieldEl.innerText = `+${cur.yield} 🔵/h`;

    const multEl = document.getElementById('dolphin-mult-val');
    if (multEl) multEl.innerText = cur.mult;

    const rankEl = document.getElementById('dolphin-rank-val');
    if (rankEl) rankEl.innerText = cur.rank;

    const feedBtn = document.getElementById('btn-feed-action');
    const breedOverlay = document.getElementById('breeding-overlay');

    if (state.isBreeding) {
      if (feedBtn) {
        feedBtn.classList.add('locked');
        feedBtn.innerText = 'BREEDING IN PROGRESS (TAP LOCKED)';
      }
      if (breedOverlay) breedOverlay.classList.add('active');
    } else {
      if (feedBtn) {
        feedBtn.classList.remove('locked');
        feedBtn.innerHTML = `<span>TAP TO FEED (Cost: ${cur.feedCost} 🔵)</span>`;
      }
      if (breedOverlay) breedOverlay.classList.remove('active');
    }

    // Update Deck Carousel highlight
    const slots = document.querySelectorAll('.deck-slots-carousel .slot-item');
    slots.forEach((s, idx) => {
      if (idx === state.activeSlotIdx) s.classList.add('active');
      else s.classList.remove('active');
    });
  }

  // --- FLOATING TEXT AT TAP COORDINATES ---
  function spawnFloatingTapText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-tap-text';
    el.innerText = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 800);
  }

  // --- FEED TAP HANDLER ---
  window.handleFeedTap = function(event) {
    if (state.isBreeding) return;

    const cur = state.deckSlots[state.activeSlotIdx];
    if (state.currencies.pearlsBalance < cur.feedCost) {
      alert('Not enough Blue Pearls!');
      return;
    }

    state.currencies.pearlsBalance -= cur.feedCost;
    cur.exp += 10;
    sound.playFeedChime();

    // Level up check
    if (cur.exp >= cur.maxExp) {
      cur.level += 1;
      cur.exp = 0;
      cur.maxExp = Math.round(cur.maxExp * 1.5);
      cur.feedCost = Math.round(cur.feedCost * 1.25);
      cur.yield = Math.round(cur.yield * 1.35);
      sound.playCelebration();
    }

    const clientX = event.clientX || (window.innerWidth / 2);
    const clientY = event.clientY || (window.innerHeight / 2);
    spawnFloatingTapText(clientX, clientY, '+10 🔵');

    updateHeader();
    updateActiveCard();
  };

  // --- DECK SWAP SLOT ---
  window.selectSlot = function(idx) {
    if (idx >= 0 && idx < state.deckSlots.length) {
      state.activeSlotIdx = idx;
      updateActiveCard();
    }
  };

  // --- BREEDING HANDLER ---
  window.startBreeding = function() {
    if (state.isBreeding) return;
    state.isBreeding = true;
    state.breedEndTime = Date.now() + (24 * 60 * 60 * 1000);
    updateActiveCard();
  };

  window.formatCountdown = function(msRemaining) {
    if (msRemaining <= 0) return '00:00:00';
    const totalSec = Math.floor(msRemaining / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Breeding Countdown Tick
  setInterval(() => {
    if (state.isBreeding) {
      const remaining = state.breedEndTime - Date.now();
      const timerEl = document.getElementById('breeding-countdown-text');
      if (remaining <= 0) {
        state.isBreeding = false;
        updateActiveCard();
        alert('🎉 Breeding Complete! A new mystic egg is ready to hatch!');
        window.openEggHatchModal();
      } else if (timerEl) {
        timerEl.innerText = window.formatCountdown(remaining);
      }
    }
  }, 1000);

  // --- EGG CRACKING RITUAL MODAL ---
  window.openEggHatchModal = function() {
    state.eggCrackTaps = 0;
    const eggImg = document.getElementById('interactive-hatch-egg');
    if (eggImg) eggImg.src = 'assets/premium/mystic_sea_egg_t12.png';
    const msg = document.getElementById('egg-hatch-instructions');
    if (msg) msg.innerText = 'Tap 3 times to crack the mystic egg!';
    window.openModal('modal-egg-hatch');
  };

  window.handleEggCrackTap = function(event) {
    state.eggCrackTaps += 1;
    sound.playEggCrack();

    const eggImg = document.getElementById('interactive-hatch-egg');
    const msg = document.getElementById('egg-hatch-instructions');

    const clientX = event.clientX || (window.innerWidth / 2);
    const clientY = event.clientY || (window.innerHeight / 2);
    spawnFloatingTapText(clientX, clientY, `⚡ CRACK ${state.eggCrackTaps}/3`);

    if (state.eggCrackTaps === 1) {
      if (eggImg) eggImg.src = 'assets/egg_cracked.png';
      if (msg) msg.innerText = 'Keep tapping! The shell is breaking...';
    } else if (state.eggCrackTaps === 2) {
      if (msg) msg.innerText = 'Almost there! 1 more tap!';
    } else if (state.eggCrackTaps >= 3) {
      sound.playCelebration();
      if (eggImg) eggImg.src = 'assets/premium/legendary_dolphin_poseidon.png';
      if (msg) msg.innerText = '🎉 HATCHED: Sovereign Dolphin (LEGENDARY)!';
      setTimeout(() => {
        window.closeModal('modal-egg-hatch');
      }, 1500);
    }
  };

  // --- MERGE GRID (7x6 42 CELLS) ---
  window.renderMergeGrid = function() {
    const gridEl = document.getElementById('shells-merge-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    state.gridArray.forEach((item, idx) => {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.index = idx;

      if (item) {
        const img = document.createElement('img');
        img.className = 'shell-sprite';
        img.src = item.sprite || `assets/pearl_t${item.level}.png`;
        cell.appendChild(img);

        const pill = document.createElement('div');
        pill.className = 'shell-tier-pill';
        pill.innerText = `T${item.level}`;
        cell.appendChild(pill);
      }

      // Drag & drop
      cell.draggable = !!item;
      cell.ondragstart = (e) => {
        state.draggedIndex = idx;
        e.dataTransfer.setData('text/plain', idx);
      };
      cell.ondragover = (e) => e.preventDefault();
      cell.ondrop = (e) => {
        e.preventDefault();
        const fromIdx = state.draggedIndex !== null ? state.draggedIndex : parseInt(e.dataTransfer.getData('text/plain'));
        const toIdx = idx;
        handleCellMerge(fromIdx, toIdx);
      };

      gridEl.appendChild(cell);
    });
  };

  function handleCellMerge(fromIdx, toIdx) {
    if (fromIdx === toIdx || fromIdx === null) return;
    const source = state.gridArray[fromIdx];
    const target = state.gridArray[toIdx];

    if (!source) return;

    if (!target) {
      state.gridArray[toIdx] = source;
      state.gridArray[fromIdx] = null;
      window.renderMergeGrid();
      return;
    }

    if (source.level === target.level && source.type === target.type) {
      const nextLevel = source.level + 1;
      const spritePath = source.type === 'heart' ? `assets/heart_egg_t${nextLevel}.png` : `assets/pearl_t${nextLevel}.png`;
      state.gridArray[toIdx] = {
        level: nextLevel,
        type: source.type,
        sprite: spritePath
      };
      state.gridArray[fromIdx] = null;
      sound.playMergeChord(nextLevel);
      window.renderMergeGrid();
    }
  }

  // --- SPAWN SHELL ---
  window.spawnShell = function() {
    const emptyIdx = state.gridArray.findIndex(cell => cell === null);
    if (emptyIdx === -1) {
      alert('Grid is full!');
      return;
    }
    if (state.currencies.pearlsBalance < 50) {
      alert('Need 50 Blue Pearls to spawn!');
      return;
    }
    state.currencies.pearlsBalance -= 50;
    state.gridArray[emptyIdx] = {
      level: 1,
      type: 'pearl',
      sprite: 'assets/pearl_t1.png'
    };
    updateHeader();
    window.renderMergeGrid();
  };

  // --- AUTO MERGE ---
  window.autoMergeAll = function() {
    let merged = false;
    for (let i = 0; i < state.gridArray.length; i++) {
      if (!state.gridArray[i]) continue;
      for (let j = i + 1; j < state.gridArray.length; j++) {
        if (!state.gridArray[j]) continue;
        if (state.gridArray[i].level === state.gridArray[j].level && state.gridArray[i].type === state.gridArray[j].type) {
          handleCellMerge(j, i);
          merged = true;
          break;
        }
      }
      if (merged) break;
    }
  };

  // --- TAB NAVIGATION ---
  window.switchTab = function(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) activeContent.classList.add('active');

    const activeNav = document.getElementById(`nav-btn-${tabName}`);
    if (activeNav) activeNav.classList.add('active');

    if (tabName === 'shells') {
      window.renderMergeGrid();
    }
  };

  // --- MODAL UTILS ---
  window.openModal = function(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add('active');
  };

  window.closeModal = function(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('active');
  };

  window.claimDailyLogin = function() {
    state.currencies.pearlsBalance += 500;
    state.currencies.starsBalance += 10;
    updateHeader();
    alert('🎉 Claimed 500 Blue Pearls and 10 Blue Stars!');
    window.closeModal('modal-streak');
  };

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    updateHeader();
    updateActiveCard();
    window.renderMergeGrid();
  });

})();
