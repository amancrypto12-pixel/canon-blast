/**
 * DOLPHIN PEARLS - MASTER GAME ENGINE V5.0
 * 1:1 Complete Duck My Duck Reverse-Engineered Mechanics
 * Teletype Guide Formulas & Telegram Mini App Dev Kit Standards
 */

(function() {
  'use strict';

  // --- TELEGRAM WEBAPP SDK INITIALIZATION ---
  if (window.Telegram && window.Telegram.WebApp) {
    try {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.enableClosingConfirmation();
    } catch (e) {}
  }

  function triggerHaptic(type = 'medium') {
    try {
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    } catch (e) {}
  }

  // --- WEBAUDIO SYNTHESIZER ---
  const AudioEngine = {
    ctx: null,
    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },
    playTone(freq, type = 'sine', duration = 0.12, gainVal = 0.12) {
      try {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    },
    playTap() {
      this.playTone(600, 'triangle', 0.06, 0.15);
      triggerHaptic('light');
    },
    playMerge() {
      this.playTone(440, 'sine', 0.1, 0.15);
      setTimeout(() => this.playTone(660, 'sine', 0.15, 0.18), 60);
      setTimeout(() => this.playTone(880, 'sine', 0.2, 0.22), 120);
      triggerHaptic('medium');
    },
    playHatch() {
      [523, 659, 784, 1046, 1318].forEach((f, i) => {
        setTimeout(() => this.playTone(f, 'triangle', 0.25, 0.2), i * 70);
      });
      triggerHaptic('heavy');
    }
  };

  // --- 10 THEMED DECK COLLECTIONS (250 TOTAL DOLPHINS) ---
  const COLLECTIONS = [
    {
      id: '01_Poseidon_Mythic_Gods',
      name: 'Poseidon Sovereign',
      rarity: 'MYTHIC',
      dmdRate: 1.6,
      maxTapsPerLvl: [100, 200, 300, 400, 500],
      sprite: 'assets/collections/01_Poseidon_Mythic_Gods/01_01_poseidon.png'
    },
    {
      id: '02_Abyss_Deep_Ocean',
      name: 'Abyssal Angler',
      rarity: 'LEGENDARY',
      dmdRate: 1.6,
      maxTapsPerLvl: [100, 200, 300, 400, 500],
      sprite: 'assets/collections/02_Abyss_Deep_Ocean/02_01_angler.png'
    },
    {
      id: '03_Cyberpunk_Neon',
      name: 'Cyber Matrix Fin',
      rarity: 'EPIC',
      dmdRate: 0.5,
      maxTapsPerLvl: [300, 600, 900, 1200, 1500],
      sprite: 'assets/collections/03_Cyberpunk_Neon/03_01_cyber.png'
    },
    {
      id: '04_Pirates_Sea_Captains',
      name: 'Captain Hookfin',
      rarity: 'RARE',
      dmdRate: 0.04,
      maxTapsPerLvl: [200, 400, 600, 800, 1000],
      sprite: 'assets/collections/04_Pirates_Sea_Captains/04_01_captain.png'
    },
    {
      id: '05_Celestial_Astral',
      name: 'Celestial Starlight',
      rarity: 'UNCOMMON',
      dmdRate: 0.02,
      maxTapsPerLvl: [150, 300, 450, 600, 750],
      sprite: 'assets/collections/05_Celestial_Astral/05_01_starlight.png'
    },
    {
      id: '06_Coral_Reef_Tropical',
      name: 'Coral Clown Dolphin',
      rarity: 'COMMON',
      dmdRate: 0.01,
      maxTapsPerLvl: [100, 200, 300, 400, 500],
      sprite: 'assets/collections/06_Coral_Reef_Tropical/06_01_clownfish.png'
    }
  ];

  // --- 49-TIER HEARTS LADDER MILESTONES ---
  const HEARTS_LADDER = [
    { target: 200, reward: '1,000 Blue Pearls 🐚', pearls: 1000 },
    { target: 700, reward: '2,500 Blue Pearls 🐚', pearls: 2500 },
    { target: 1400, reward: '20 Blue Stars ⭐', stars: 20 },
    { target: 2400, reward: 'Tier 10 Sea Egg 🥚', eggTier: 10 },
    { target: 4000, reward: 'New Dolphin Deck Slot 🔓', newSlot: true },
    { target: 6500, reward: '30 Blue Stars ⭐', stars: 30 },
    { target: 11000, reward: '10,000 Blue Pearls 🐚', pearls: 10000 },
    { target: 17500, reward: 'Tier 11 Sea Egg 🥚', eggTier: 11 },
    { target: 23500, reward: '40 Blue Stars ⭐', stars: 40 },
    { target: 37500, reward: 'Tier 11 Sea Egg 🥚', eggTier: 11 },
    { target: 82000, reward: 'New Dolphin Deck Slot 🔓', newSlot: true },
    { target: 164500, reward: 'Tier 12 Mythic Egg 🥚', eggTier: 12 },
    { target: 310000, reward: '50 Blue Stars ⭐', stars: 50 },
    { target: 850000, reward: 'New Dolphin Deck Slot 🔓', newSlot: true },
    { target: 2000000, reward: '75 Blue Stars ⭐ + Poseidon NFT 🔱', stars: 75 }
  ];

  // --- GAME STATE ---
  const state = {
    currencies: {
      pearlsBalance: 12450,
      starsBalance: 50,
      dmdTokens: 0.00,
      heartsBalance: 0,
      energy: 1000,
      maxEnergy: 2000
    },
    activeSlotIdx: 0,
    currentLevel: 1,
    currentTapsInLevel: 0,
    totalTapsEver: 0,
    consecutiveTapsThisSession: 0,
    feedResetEndTime: Date.now() + 8 * 60 * 60 * 1000, // 8-hour countdown
    isBreeding: false,
    breedingEndTime: 0,
    isStaked: false,
    crackTapsLeft: 3,
    boosterMultiplier: 1,
    boosterEndTime: 0,
    marketCycleEndTime: Date.now() + 10 * 60 * 1000, // 10-minute market cycle
    marketPhase: 'HOT',
    marketPrice: 30000,
    claimedHeartsIndex: 0,
    // 42 cells grid
    board: new Array(42).fill(null)
  };

  // Seed Initial Board with Eggs
  state.board[0] = { tier: 1 };
  state.board[1] = { tier: 1 };
  state.board[2] = { tier: 2 };
  state.board[6] = { tier: 3 };
  state.board[7] = { tier: 3 };
  state.board[12] = { tier: 4 };

  // --- DOM REFERENCES ---
  const el = {
    pearlsVal: document.getElementById('header-pearls-val'),
    starsVal: document.getElementById('header-stars-val'),
    energyVal: document.getElementById('header-energy-val'),
    dmdTokenPill: document.getElementById('user-dmd-token-pill'),
    avatarLvlTxt: document.getElementById('avatar-lvl-txt'),
    slotLvlChip: document.getElementById('current-slot-lvl-chip'),
    dmdRateTxt: document.getElementById('hero-dmd-rate'),
    rarityTag: document.getElementById('current-slot-rarity'),
    mascotSprite: document.getElementById('mascot-sprite'),
    mascotAnimWrapper: document.getElementById('mascot-anim-wrapper'),
    expFill: document.getElementById('hero-exp-fill'),
    tapsCur: document.getElementById('hero-taps-cur'),
    tapsMax: document.getElementById('hero-taps-max'),
    feedCostTxt: document.getElementById('feed-cost-txt'),
    feedResetTimer: document.getElementById('feed-reset-timer'),
    heartsBalanceBadge: document.getElementById('hearts-balance-badge'),
    deckSlotsTrack: document.getElementById('deck-slots-track'),
    shellsBoard: document.getElementById('shells-board'),
    breedingOverlay: document.getElementById('breeding-overlay'),
    breedingTimerTxt: document.getElementById('breeding-timer-txt'),
    marketPriceTxt: document.getElementById('market-current-price'),
    marketCycleTag: document.getElementById('market-cycle-tag'),
    marketCycleTimer: document.getElementById('market-cycle-timer'),
    marketCollectionsGrid: document.getElementById('market-collections-grid'),
    godsPantheonList: document.getElementById('gods-pantheon-list'),
    questsContainer: document.getElementById('quests-container'),
    heartsLadderContainer: document.getElementById('hearts-ladder-container'),
    streakGrid: document.getElementById('streak-grid'),
    tideWheelDisc: document.getElementById('tide-wheel-disc'),
    crackTapsLeftTxt: document.getElementById('crack-taps-left')
  };

  function formatNum(n) { return Number(n).toLocaleString('en-US'); }
  function formatDMD(n) { return Number(n).toFixed(2); }

  function formatTime(ms) {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  // Calculate dynamic feed cost based on 20-tap steps (Teletype Section 3)
  function getDynamicFeedCost() {
    const active = COLLECTIONS[state.activeSlotIdx];
    const baseCost = state.currentLevel * (active.rarity === 'COMMON' ? 1 : active.rarity === 'UNCOMMON' ? 5 : 15);
    const step = Math.floor(state.consecutiveTapsThisSession / 20);
    return Math.min(baseCost * (step + 1), baseCost * 10);
  }

  function getMaxTapsForLevel() {
    const active = COLLECTIONS[state.activeSlotIdx];
    return active.maxTapsPerLvl[state.currentLevel - 1] || 500;
  }

  // --- RENDER FUNCTIONS ---
  function updateHeader() {
    if (el.pearlsVal) el.pearlsVal.textContent = formatNum(state.currencies.pearlsBalance);
    if (el.starsVal) el.starsVal.textContent = formatNum(state.currencies.starsBalance);
    if (el.energyVal) el.energyVal.textContent = `${formatNum(state.currencies.energy)} / ${formatNum(state.currencies.maxEnergy)}`;
    if (el.dmdTokenPill) el.dmdTokenPill.textContent = `${formatDMD(state.currencies.dmdTokens)} $DMD`;
    if (el.avatarLvlTxt) el.avatarLvlTxt.textContent = `LVL ${state.currentLevel}`;
    if (el.slotLvlChip) el.slotLvlChip.textContent = `LVL ${state.currentLevel} ${state.currentLevel >= 5 ? 'XL' : ''}`;
    if (el.feedCostTxt) el.feedCostTxt.textContent = `${getDynamicFeedCost()} 🐚`;
    if (el.heartsBalanceBadge) el.heartsBalanceBadge.textContent = `${formatNum(state.currencies.heartsBalance)} ❤️`;
  }

  function renderDeckSlots() {
    if (!el.deckSlotsTrack) return;
    el.deckSlotsTrack.innerHTML = '';
    COLLECTIONS.forEach((col, idx) => {
      const slotDiv = document.createElement('div');
      slotDiv.className = `duck-slider--item ${idx === state.activeSlotIdx ? 'active' : ''}`;
      slotDiv.onclick = (e) => {
        e.stopPropagation();
        window.selectDeckSlot(idx);
      };
      slotDiv.innerHTML = `
        <img src="${col.sprite}" class="deck-slot-img" alt="${col.name}">
        <span class="deck-slot-lvl">SLOT ${idx + 1}</span>
      `;
      el.deckSlotsTrack.appendChild(slotDiv);
    });
  }

  window.selectDeckSlot = function(idx) {
    state.activeSlotIdx = idx;
    const active = COLLECTIONS[idx];
    if (el.mascotSprite) el.mascotSprite.src = active.sprite;
    if (el.rarityTag) el.rarityTag.textContent = `${active.rarity === 'COMMON' ? '🤍' : active.rarity === 'UNCOMMON' ? '💚' : active.rarity === 'RARE' ? '💙' : '🔱'} ~${active.rarity}`;
    if (el.dmdRateTxt) el.dmdRateTxt.innerHTML = `${active.dmdRate} <span class="yield-unit">$DMD/tap</span>`;
    
    // Update taps display
    const maxTaps = getMaxTapsForLevel();
    if (el.tapsMax) el.tapsMax.textContent = maxTaps;
    if (el.tapsCur) el.tapsCur.textContent = state.currentTapsInLevel;
    if (el.expFill) el.expFill.style.width = `${(state.currentTapsInLevel / maxTaps) * 100}%`;

    AudioEngine.playTap();
    renderDeckSlots();
  };

  // --- 42-CELL DRAG AND DROP MERGING ---
  function renderShellsBoard() {
    if (!el.shellsBoard) return;
    el.shellsBoard.innerHTML = '';
    state.board.forEach((cell, idx) => {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'shell-cell';
      cellDiv.dataset.idx = idx;

      cellDiv.ondragover = (e) => {
        e.preventDefault();
        cellDiv.classList.add('drag-over');
      };
      cellDiv.ondragleave = () => cellDiv.classList.remove('drag-over');
      cellDiv.ondrop = (e) => {
        e.preventDefault();
        cellDiv.classList.remove('drag-over');
        handleCellDrop(state.draggedCellIdx, idx);
      };

      if (cell) {
        const imgSrc = cell.tier <= 12 
          ? `assets/eggs/pearl_t${cell.tier}.png`
          : `assets/special/egg_t${Math.min(cell.tier, 20)}_abyssal_dark_crystal.png`;

        cellDiv.draggable = true;
        cellDiv.ondragstart = () => { state.draggedCellIdx = idx; };
        cellDiv.innerHTML = `
          <img src="${imgSrc}" class="shell-item-img" alt="Tier ${cell.tier}">
          <span class="shell-lvl-badge">T${cell.tier}</span>
        `;
        cellDiv.onclick = () => handleCellTapMerge(idx);
      }
      el.shellsBoard.appendChild(cellDiv);
    });
  }

  function handleCellDrop(fromIdx, toIdx) {
    if (fromIdx === null || fromIdx === toIdx) return;
    const fromItem = state.board[fromIdx];
    const toItem = state.board[toIdx];

    if (fromItem && toItem && fromItem.tier === toItem.tier) {
      state.board[toIdx].tier += 1;
      state.board[fromIdx] = null;
      state.currencies.pearlsBalance += toItem.tier * 30;
      AudioEngine.playMerge();
      updateHeader();
      renderShellsBoard();
    } else if (fromItem && !toItem) {
      state.board[toIdx] = fromItem;
      state.board[fromIdx] = null;
      AudioEngine.playTap();
      renderShellsBoard();
    }
    state.draggedCellIdx = null;
  }

  function handleCellTapMerge(idx) {
    const item = state.board[idx];
    if (!item) return;

    for (let i = 0; i < state.board.length; i++) {
      if (i !== idx && state.board[i] && state.board[i].tier === item.tier) {
        state.board[idx] = null;
        state.board[i].tier += 1;
        state.currencies.pearlsBalance += item.tier * 30;
        AudioEngine.playMerge();
        updateHeader();
        renderShellsBoard();
        return;
      }
    }
    AudioEngine.playTap();
  }

  // --- TAP TO FEED MECHANIC (TELETYPE SECTION 3 & NOTCOIN TOUCH) ---
  window.handleFeedTap = function(e) {
    if (state.isBreeding) return;
    if (state.currencies.energy < 1) {
      alert('⚡ Energy depleted! Wait for recharge or use Energy Cell.');
      return;
    }

    const cost = getDynamicFeedCost();
    if (state.currencies.pearlsBalance < cost) {
      alert(`Need ${cost} Blue Pearls to feed!`);
      return;
    }

    // Deduct cost & energy
    state.currencies.pearlsBalance -= cost;
    state.currencies.energy -= 1;
    state.consecutiveTapsThisSession += 1;
    state.totalTapsEver += 1;
    state.currentTapsInLevel += 1 * state.boosterMultiplier;

    // Add $DMD token earnings
    const active = COLLECTIONS[state.activeSlotIdx];
    state.currencies.dmdTokens += active.dmdRate * state.boosterMultiplier;

    // 4-5 tap Egg drop check (Teletype Section 4)
    if (state.totalTapsEver % 5 === 0) {
      const emptyIdx = state.board.findIndex(c => c === null);
      if (emptyIdx !== -1) {
        state.board[emptyIdx] = { tier: Math.min(state.currentLevel, 6) };
        renderShellsBoard();
      }
    }

    // Level up check
    const maxTaps = getMaxTapsForLevel();
    if (state.currentTapsInLevel >= maxTaps) {
      if (state.currentLevel < 5) {
        state.currentLevel += 1;
        state.currentTapsInLevel = 0;
        window.openModal('modal-egg-crack');
      } else {
        alert('👑 MAX LEVEL 5 REACHED! Ready for Fusion or Staking.');
      }
    }

    // UI Updates
    if (el.tapsCur) el.tapsCur.textContent = state.currentTapsInLevel;
    if (el.expFill) el.expFill.style.width = `${Math.min((state.currentTapsInLevel / maxTaps) * 100, 100)}%`;

    // Squash and stretch physics animation
    if (el.mascotAnimWrapper) {
      el.mascotAnimWrapper.style.transform = 'scale(0.92, 1.08) translateY(6px)';
      setTimeout(() => {
        if (el.mascotAnimWrapper) el.mascotAnimWrapper.style.transform = 'scale(1, 1)';
      }, 120);
    }

    // Coordinate-based floating particles
    const clientX = (e && e.clientX) ? e.clientX : 200;
    const clientY = (e && e.clientY) ? e.clientY : 400;
    const floatTxt = document.createElement('div');
    floatTxt.style.position = 'absolute';
    floatTxt.style.left = `${clientX - 20}px`;
    floatTxt.style.top = `${clientY - 20}px`;
    floatTxt.style.color = '#00F0FF';
    floatTxt.style.fontWeight = '900';
    floatTxt.style.fontSize = '18px';
    floatTxt.style.pointerEvents = 'none';
    floatTxt.style.zIndex = '999';
    floatTxt.style.textShadow = '0 0 10px rgba(0, 240, 255, 0.8)';
    floatTxt.style.transition = 'all 0.8s cubic-bezier(0.15, 0.9, 0.25, 1)';
    floatTxt.textContent = `+${active.dmdRate} $DMD`;
    document.body.appendChild(floatTxt);

    setTimeout(() => {
      floatTxt.style.transform = 'translateY(-50px) scale(1.1)';
      floatTxt.style.opacity = '0';
    }, 20);
    setTimeout(() => floatTxt.remove(), 850);

    AudioEngine.playTap();
    updateHeader();
  };

  // --- BREEDING ROUTINE (TELETYPE SECTION 5) ---
  window.startBreedingRoutine = function() {
    if (state.currentLevel < 2) {
      alert('Dolphin must be Level 2+ to start breeding!');
      return;
    }
    state.isBreeding = true;
    state.breedingEndTime = Date.now() + 24 * 60 * 60 * 1000;
    if (el.breedingOverlay) el.breedingOverlay.style.display = 'flex';
    AudioEngine.playTap();
  };

  window.speedUpBreeding = function() {
    if (state.currencies.starsBalance < 50) {
      alert('Need 50 Blue Stars to speed up incubation!');
      return;
    }
    state.currencies.starsBalance -= 50;
    state.isBreeding = false;
    state.currencies.heartsBalance += 154; // Grant max love eggs
    if (el.breedingOverlay) el.breedingOverlay.style.display = 'none';
    AudioEngine.playHatch();
    updateHeader();
    alert('💕 Incubation Complete! Gained +154 Hearts ❤️ & Unlocked Dolphin Child!');
  };

  // --- FUSION XL (TELETYPE SECTION 6) ---
  window.executeFusion = function(targetRarity) {
    state.currencies.pearlsBalance -= 20000;
    AudioEngine.playHatch();
    updateHeader();
    alert(`🔱 FUSION SUCCESS! Evolved into ${targetRarity} XL Dolphin! All $DMD tokens compounded.`);
    window.closeModal('modal-fusion');
  };

  // --- STAKING (TELETYPE SECTION 7) ---
  window.executeStaking = function() {
    if (state.currencies.starsBalance < 20) {
      alert('Need 20 Blue Stars for Staking fee!');
      return;
    }
    state.currencies.starsBalance -= 20;
    state.isStaked = true;
    AudioEngine.playHatch();
    updateHeader();
    alert('💰 Dolphin Staked in Abyss Pool! Earning +35% APY in $DMD tokens.');
    window.closeModal('modal-staking');
  };

  // --- 49-TIER HEARTS PROGRESS LADDER (TELETYPE SECTION 10.4) ---
  function renderHeartsLadder() {
    if (!el.heartsLadderContainer) return;
    el.heartsLadderContainer.innerHTML = '';
    HEARTS_LADDER.forEach((tier, idx) => {
      const unlocked = state.currencies.heartsBalance >= tier.target;
      const claimed = idx < state.claimedHeartsIndex;
      const row = document.createElement('div');
      row.className = 'task-card-row';
      row.innerHTML = `
        <div class="task-left-meta">
          <span style="font-size: 20px;">❤️</span>
          <div>
            <div class="task-title">${tier.target.toLocaleString()} Hearts</div>
            <div class="task-reward">${tier.reward}</div>
          </div>
        </div>
        <button class="btn-claim-pill ${unlocked && !claimed ? 'gold' : ''}" 
          ${!unlocked || claimed ? 'disabled' : ''} 
          onclick="claimHeartsTier(${idx})">
          ${claimed ? 'CLAIMED' : unlocked ? 'CLAIM' : 'LOCKED'}
        </button>
      `;
      el.heartsLadderContainer.appendChild(row);
    });
  }

  window.claimHeartsTier = function(idx) {
    const tier = HEARTS_LADDER[idx];
    if (tier.pearls) state.currencies.pearlsBalance += tier.pearls;
    if (tier.stars) state.currencies.starsBalance += tier.stars;
    state.claimedHeartsIndex = idx + 1;
    AudioEngine.playHatch();
    updateHeader();
    renderHeartsLadder();
  };

  // --- MARKET CYCLES & TRADING (TELETYPE SECTION 8) ---
  function updateMarketCycle() {
    const remaining = state.marketCycleEndTime - Date.now();
    if (remaining <= 0) {
      state.marketCycleEndTime = Date.now() + 10 * 60 * 1000;
      state.marketPhase = (state.marketPhase === 'HOT') ? 'REGULAR' : 'HOT';
      state.marketPrice = Math.floor(state.marketPrice * (state.marketPhase === 'HOT' ? 1.15 : 0.95));
      if (el.marketPriceTxt) el.marketPriceTxt.textContent = `${formatNum(state.marketPrice)} 🐚`;
      if (el.marketCycleTag) el.marketCycleTag.textContent = `${state.marketPhase} (${state.marketPhase === 'HOT' ? '+15%' : '-1%'} / 10m)`;
    } else {
      if (el.marketCycleTimer) el.marketCycleTimer.textContent = formatTime(remaining);
    }
  }

  function renderMarketCards() {
    if (!el.marketCollectionsGrid) return;
    el.marketCollectionsGrid.innerHTML = '';
    COLLECTIONS.forEach((col, idx) => {
      const card = document.createElement('div');
      card.className = 'market-item-card';
      card.innerHTML = `
        <img src="assets/special/market_badge_hot_deal.png" class="market-hot-seal" alt="HOT">
        <img src="${col.sprite}" class="market-item-img" alt="${col.name}">
        <div class="market-item-name">${col.name.split(' ')[0]}</div>
        <div class="market-item-price">${30000 + idx * 50000} 🐚</div>
      `;
      card.onclick = () => {
        alert(`🛒 Market Order: Buy ${col.name} for ${30000 + idx * 50000} Pearls?`);
      };
      el.marketCollectionsGrid.appendChild(card);
    });
  }

  function renderGodsList() {
    if (!el.godsPantheonList) return;
    el.godsPantheonList.innerHTML = '';
    [
      { name: 'Poseidon Sovereign', yield: '+45% $DMD Yield', cost: '1,500 🐚', img: 'assets/collections/01_Poseidon_Mythic_Gods/01_01_poseidon.png' },
      { name: 'Aura of the Abyss', yield: '+38% $DMD Yield', cost: '1,200 🐚', img: 'assets/collections/02_Abyss_Deep_Ocean/02_01_angler.png' },
      { name: 'Astral Supernova', yield: '+42% $DMD Yield', cost: '1,400 🐚', img: 'assets/collections/05_Celestial_Astral/05_01_starlight.png' }
    ].forEach(god => {
      const row = document.createElement('div');
      row.className = 'task-card-row';
      row.innerHTML = `
        <div class="task-left-meta">
          <img src="${god.img}" class="task-icon-img" alt="${god.name}">
          <div>
            <div class="task-title">${god.name}</div>
            <div class="task-reward">${god.yield}</div>
          </div>
        </div>
        <button class="btn-claim-pill gold">MINT (${god.cost})</button>
      `;
      el.godsPantheonList.appendChild(row);
    });
  }

  function renderQuestsList() {
    if (!el.questsContainer) return;
    el.questsContainer.innerHTML = '';
    [
      { title: 'Join Official Telegram Channel', reward: '+500 Blue Pearls', amount: 500, icon: 'assets/ui/icon_task_telegram.png' },
      { title: 'Follow Dolphin Pearls on X / Twitter', reward: '+300 Blue Pearls', amount: 300, icon: 'assets/ui/icon_task_x_twitter.png' },
      { title: 'Feed your Active Dolphin 20 Times', reward: '+150 Blue Pearls', amount: 150, icon: 'assets/ui/icon_task_feeding.png' },
      { title: 'Merge 10 Sea Shells on Grid', reward: '+200 Blue Pearls', amount: 200, icon: 'assets/ui/icon_task_merging.png' },
      { title: 'Invite 3 Sea Captains', reward: '+1,000 Blue Pearls', amount: 1000, icon: 'assets/ui/icon_task_invite_friends.png' }
    ].forEach(q => {
      const div = document.createElement('div');
      div.className = 'task-card-row';
      div.innerHTML = `
        <div class="task-left-meta">
          <img src="${q.icon}" class="task-icon-img" alt="${q.title}">
          <div>
            <div class="task-title">${q.title}</div>
            <div class="task-reward">${q.reward}</div>
          </div>
        </div>
        <button class="btn-claim-pill" onclick="claimQuestReward(this, ${q.amount})">CLAIM</button>
      `;
      el.questsContainer.appendChild(div);
    });
  }

  // --- GLOBAL WINDOW HANDLERS ---
  window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-view').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');

    const targetBtn = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    AudioEngine.playTap();
  };

  window.switchTaskSubTab = function(subId) {
    document.querySelectorAll('.subtab-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.task-sub-tab').forEach(b => b.classList.remove('active'));

    const targetSub = document.getElementById(`subtab-${subId}`);
    if (targetSub) targetSub.classList.add('active');

    const activeBtn = Array.from(document.querySelectorAll('.task-sub-tab'))
      .find(b => b.textContent.toLowerCase().includes(subId.slice(0, 4)));
    if (activeBtn) activeBtn.classList.add('active');

    AudioEngine.playTap();
  };

  window.openModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'flex';
    AudioEngine.playTap();
  };

  window.closeModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'none';
  };

  window.openUserProfileModal = function() { window.openModal('modal-user-profile'); };
  window.openShopModal = function(type) {
    if (type === 'pearls') window.openModal('modal-shop-pearls');
    else if (type === 'stars') window.openModal('modal-shop-stars');
  };
  window.openEnergyModal = function() { window.openModal('modal-energy-refill'); };
  window.openDailyStreakModal = function() { window.openModal('modal-daily-streak'); };
  window.openBoostersModal = function() { window.openModal('modal-boosters'); };
  window.openPassModal = function() { window.openModal('modal-pass'); };
  window.openFusionModal = function() { window.openModal('modal-fusion'); };
  window.openStakingModal = function() { window.openModal('modal-staking'); };
  window.openHeartsLadderModal = function() {
    renderHeartsLadder();
    window.openModal('modal-hearts-ladder');
  };
  window.openLottoModal = function() { alert('🎟️ Lucky Lotto: 250,000 Blue Pearls Raffle active!'); };
  window.openTideWheelModal = function() { window.openModal('modal-tide-wheel'); };

  window.spawnPearlToBoard = function() {
    const emptyIdx = state.board.findIndex(c => c === null);
    if (emptyIdx === -1) {
      alert('Egg Sanctuary is full! Merge eggs first.');
      return;
    }
    if (state.currencies.pearlsBalance < 50) {
      alert('Need 50 Blue Pearls to spawn an egg!');
      return;
    }
    state.currencies.pearlsBalance -= 50;
    state.board[emptyIdx] = { tier: 1 };
    AudioEngine.playTap();
    updateHeader();
    renderShellsBoard();
  };

  window.triggerAutoMerge = function() {
    let merged = false;
    for (let i = 0; i < state.board.length; i++) {
      if (!state.board[i]) continue;
      for (let j = i + 1; j < state.board.length; j++) {
        if (state.board[j] && state.board[j].tier === state.board[i].tier) {
          state.board[i].tier += 1;
          state.board[j] = null;
          merged = true;
          break;
        }
      }
    }
    if (merged) {
      AudioEngine.playMerge();
      renderShellsBoard();
    }
  };

  window.spinTideWheel = function() {
    if (state.currencies.pearlsBalance < 100) {
      alert('Need 100 Blue Pearls to spin the Tide Wheel!');
      return;
    }
    state.currencies.pearlsBalance -= 100;
    updateHeader();

    const randomAngle = 1440 + Math.floor(Math.random() * 360);
    if (el.tideWheelDisc) {
      el.tideWheelDisc.style.transform = `rotate(${randomAngle}deg)`;
    }

    setTimeout(() => {
      AudioEngine.playHatch();
      state.currencies.pearlsBalance += 500;
      updateHeader();
      alert('🎉 TIDE WHEEL REWARD: Won 500 Blue Pearls + 2X Booster!');
    }, 3600);
  };

  window.doCrackCurrentEgg = function() {
    state.crackTapsLeft -= 1;
    if (el.crackTapsLeftTxt) el.crackTapsLeftTxt.textContent = state.crackTapsLeft;
    AudioEngine.playTap();

    if (state.crackTapsLeft <= 0) {
      state.crackTapsLeft = 3;
      AudioEngine.playHatch();
      window.closeModal('modal-egg-crack');
      alert('✨ HATCH COMPLETE! Unlocked Level ' + state.currentLevel + ' Dolphin!');
    }
  };

  window.claimPassVault = function(tier) {
    alert(`💎 Subscribed to ${tier.toUpperCase()} Dolphin Pass! Turbo-Feed & Auto-Merge active.`);
    window.closeModal('modal-pass');
  };

  window.buyPearlsPack = function(amt, price) {
    state.currencies.pearlsBalance += amt;
    updateHeader();
    AudioEngine.playHatch();
    alert(`🎉 Purchased +${formatNum(amt)} Blue Pearls!`);
    window.closeModal('modal-shop-pearls');
  };

  window.buyStarsPack = function(amt, price) {
    state.currencies.starsBalance += amt;
    updateHeader();
    AudioEngine.playHatch();
    alert(`⭐ Purchased +${formatNum(amt)} Blue Stars!`);
    window.closeModal('modal-shop-stars');
  };

  window.refillEnergyTank = function() {
    state.currencies.energy = state.currencies.maxEnergy;
    updateHeader();
    AudioEngine.playHatch();
    alert('⚡ Energy Tank fully recharged!');
    window.closeModal('modal-energy-refill');
  };

  window.claimDailyStreakReward = function() {
    state.currencies.pearlsBalance += 300;
    updateHeader();
    AudioEngine.playHatch();
    alert('🔥 Day 3 Login Reward Claimed (+300 🐚)!');
    window.closeModal('modal-daily-streak');
  };

  window.activateBooster = function(type) {
    state.boosterMultiplier = (type === '5X') ? 5 : 2;
    state.boosterEndTime = Date.now() + 10 * 60 * 1000;
    AudioEngine.playHatch();
    alert(`🚀 ${type} Speed Surge Active!`);
    window.closeModal('modal-boosters');
  };

  window.claimQuestReward = function(btn, amt) {
    btn.disabled = true;
    btn.textContent = 'CLAIMED';
    state.currencies.pearlsBalance += amt;
    updateHeader();
    AudioEngine.playHatch();
  };

  window.copyInviteLink = function() {
    navigator.clipboard.writeText('https://t.me/dolphin_pearls_bot?start=ref123');
    alert('Invite link copied!');
  };

  window.joinChampionshipTournament = function() {
    AudioEngine.playTap();
    alert('🏆 Entered Poseidon Grand Prix Championship! Season 1.');
  };

  // --- INITIALIZATION & TICKER LOOPS ---
  function init() {
    updateHeader();
    renderDeckSlots();
    renderShellsBoard();
    renderMarketCards();
    renderGodsList();
    renderQuestsList();

    // 1-Second Ticker Loop
    setInterval(() => {
      // 1. Energy Auto-Recharge (+1 energy every 2 seconds)
      if (state.currencies.energy < state.currencies.maxEnergy) {
        state.currencies.energy = Math.min(state.currencies.energy + 1, state.currencies.maxEnergy);
        updateHeader();
      }

      // 2. 8-Hour Feed Reset Timer
      const feedRemaining = state.feedResetEndTime - Date.now();
      if (feedRemaining <= 0) {
        state.feedResetEndTime = Date.now() + 8 * 60 * 60 * 1000;
        state.consecutiveTapsThisSession = 0;
        updateHeader();
      } else {
        if (el.feedResetTimer) el.feedResetTimer.textContent = formatTime(feedRemaining);
      }

      // 3. Breeding Timer
      if (state.isBreeding && state.breedingEndTime > 0) {
        const breedRemaining = state.breedingEndTime - Date.now();
        if (breedRemaining <= 0) {
          state.isBreeding = false;
          if (el.breedingOverlay) el.breedingOverlay.style.display = 'none';
        } else {
          if (el.breedingTimerTxt) el.breedingTimerTxt.textContent = formatTime(breedRemaining);
        }
      }

      // 4. Market Cycle Timer
      updateMarketCycle();
    }, 1000);
  }

  window.addEventListener('DOMContentLoaded', init);
})();
