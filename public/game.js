// DOLPHIN MY DOLPHIN - MASTER GAME ENGINE (1:1 DUCK MY DUCK PARITY)
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
    playLevelUp() {
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

  // --- STATE MODEL ---
  const state = {
    activeTab: 'dolphins',
    user: {
      id: 8805966134,
      name: 'Poseidon Commander',
      wallet: 'Shovel #4920'
    },
    currencies: {
      pearlsBalance: 92039,
      starsBalance: 420,
      energy: 0,
      maxEnergy: 2000
    },
    dolphin: {
      id: 'poseidon_prime',
      name: 'Poseidon Dolphin',
      rarity: 'LEGENDARY',
      level: 5,
      exp: 40,
      maxExp: 100,
      feedCost: 10,
      yieldPerHour: 144,
      rarityMult: 'x2.5',
      powerRank: '#1,204',
      sprite: 'assets/premium/legendary_dolphin_poseidon.png',
      isBreeding: false,
      breedEndTime: 0
    },
    deckSlots: [
      { id: 1, name: 'Poseidon Dolphin', sprite: 'assets/premium/legendary_dolphin_poseidon.png', level: 5, rarity: 'LEGENDARY' },
      { id: 2, name: 'Ocean Mystic', sprite: 'assets/dolphin_rare.png', level: 4, rarity: 'RARE' },
      { id: 3, name: 'Abyss Titan', sprite: 'assets/dolphin_epic.png', level: 3, rarity: 'EPIC' },
      { id: 4, name: 'Coral Sprinter', sprite: 'assets/dolphin_uncommon.png', level: 2, rarity: 'UNCOMMON' },
      { id: 5, name: 'Tide Swimmer', sprite: 'assets/dolphin_common.png', level: 1, rarity: 'COMMON' },
      { id: 6, name: 'Deep Diver', sprite: 'assets/dolphin_happy.png', level: 1, rarity: 'COMMON' },
      { id: 7, name: 'Aqua Scout', sprite: 'assets/dolphin_smug.png', level: 1, rarity: 'COMMON' },
      { id: 8, name: 'Neon Glider', sprite: 'assets/dolphin_rare.png', level: 1, rarity: 'RARE' },
      { id: 9, name: 'Storm Fin', sprite: 'assets/dolphin_epic.png', level: 1, rarity: 'EPIC' },
      { id: 10, name: 'Solar Surge', sprite: 'assets/dolphin_legendary.png', level: 1, rarity: 'LEGENDARY' },
      { id: 11, name: 'Aura Keeper', sprite: 'assets/premium/legendary_dolphin_poseidon.png', level: 1, rarity: 'LEGENDARY' }
    ],
    selectedSlot: 0,
    gridArray: new Array(42).fill(null),
    draggedIndex: null
  };

  // Pre-fill some merge grid cells with sea shells
  state.gridArray[0] = { level: 1, type: 'pearl', sprite: 'assets/pearl_t1.png' };
  state.gridArray[1] = { level: 1, type: 'pearl', sprite: 'assets/pearl_t1.png' };
  state.gridArray[6] = { level: 2, type: 'pearl', sprite: 'assets/pearl_t2.png' };
  state.gridArray[7] = { level: 2, type: 'pearl', sprite: 'assets/pearl_t2.png' };
  state.gridArray[12] = { level: 3, type: 'pearl', sprite: 'assets/pearl_t3.png' };
  state.gridArray[18] = { level: 1, type: 'heart', sprite: 'assets/heart_egg_t1.png' };
  state.gridArray[19] = { level: 1, type: 'heart', sprite: 'assets/heart_egg_t1.png' };

  // --- UI UPDATE HELPERS ---
  function updateHeader() {
    const pearlsEl = document.getElementById('header-pearls-val');
    if (pearlsEl) pearlsEl.innerText = state.currencies.pearlsBalance.toLocaleString();

    const starsEl = document.getElementById('header-stars-val');
    if (starsEl) starsEl.innerText = state.currencies.starsBalance.toLocaleString();
  }

  function updateDolphinCard() {
    const d = state.dolphin;
    const lvlEl = document.getElementById('dolphin-level-badge');
    if (lvlEl) lvlEl.innerText = `LVL ${d.level}`;

    const expText = document.getElementById('dolphin-exp-text');
    if (expText) expText.innerText = `EXP ${d.exp} / ${d.maxExp}`;

    const expFill = document.getElementById('dolphin-exp-fill');
    if (expFill) {
      const pct = Math.min(100, Math.round((d.exp / d.maxExp) * 100));
      expFill.style.width = `${pct}%`;
    }

    const feedBtn = document.getElementById('btn-feed-action');
    const breedOverlay = document.getElementById('breeding-overlay');

    if (d.isBreeding) {
      if (feedBtn) {
        feedBtn.classList.add('locked');
        feedBtn.innerText = 'BREEDING IN PROGRESS (TAP LOCKED)';
      }
      if (breedOverlay) breedOverlay.classList.add('active');
    } else {
      if (feedBtn) {
        feedBtn.classList.remove('locked');
        feedBtn.innerHTML = `<span>TAP TO FEED (Cost: ${d.feedCost} 🔵)</span>`;
      }
      if (breedOverlay) breedOverlay.classList.remove('active');
    }
  }

  // --- SPAWN FLOATING TAP TEXT ---
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

  // --- FEED CLICKER HANDLER ---
  window.handleFeedTap = function(event) {
    if (state.dolphin.isBreeding) {
      return;
    }

    const d = state.dolphin;
    if (state.currencies.pearlsBalance < d.feedCost) {
      alert('Not enough Blue Pearls!');
      return;
    }

    // Deduct cost & Add EXP
    state.currencies.pearlsBalance -= d.feedCost;
    d.exp += 10;
    sound.playFeedChime();

    // Check Level Up
    if (d.exp >= d.maxExp) {
      d.level += 1;
      d.exp = 0;
      d.maxExp = Math.round(d.maxExp * 1.5);
      d.feedCost = Math.round(d.feedCost * 1.25);
      sound.playLevelUp();
    }

    // Tap coordinate floating text
    const clientX = event.clientX || (window.innerWidth / 2);
    const clientY = event.clientY || (window.innerHeight / 2);
    spawnFloatingTapText(clientX, clientY, '+10 🔵');

    updateHeader();
    updateDolphinCard();
  };

  // --- BREEDING HANDLER ---
  window.startBreeding = function() {
    if (state.dolphin.isBreeding) return;

    state.dolphin.isBreeding = true;
    state.dolphin.breedEndTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    updateDolphinCard();
  };

  window.formatCountdown = function(msRemaining) {
    if (msRemaining <= 0) return '00:00:00';
    const totalSec = Math.floor(msRemaining / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Timer Tick
  setInterval(() => {
    if (state.dolphin.isBreeding) {
      const remaining = state.dolphin.breedEndTime - Date.now();
      const timerEl = document.getElementById('breeding-countdown-text');
      if (remaining <= 0) {
        state.dolphin.isBreeding = false;
        updateDolphinCard();
        alert('🎉 Breeding Complete! A new mystic sea egg has been born!');
      } else if (timerEl) {
        timerEl.innerText = window.formatCountdown(remaining);
      }
    }
  }, 1000);

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

      // Drag & Drop
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
      // Move to empty cell
      state.gridArray[toIdx] = source;
      state.gridArray[fromIdx] = null;
      window.renderMergeGrid();
      return;
    }

    if (source.level === target.level && source.type === target.type) {
      // Merge to next tier!
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
    updateDolphinCard();
    window.renderMergeGrid();
  });

})();
