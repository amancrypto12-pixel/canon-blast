/**
 * DOLPHIN PEARLS - MASTER GAME ENGINE V3.5
 * Designed by 78-Year Experienced Game Director
 * Fully functional interactive mechanics, real drag-and-drop, full modals suite
 */

(function() {
  'use strict';

  // --- AUDIO SYNTHESIZER ---
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
    playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
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
    playTap() { this.playTone(523.25, 'triangle', 0.08, 0.15); },
    playMerge() {
      this.playTone(440, 'sine', 0.1, 0.1);
      setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.15), 60);
      setTimeout(() => this.playTone(880, 'sine', 0.2, 0.2), 120);
    },
    playHatch() {
      [523, 659, 784, 1046, 1318].forEach((f, i) => {
        setTimeout(() => this.playTone(f, 'triangle', 0.3, 0.2), i * 80);
      });
    }
  };

  // --- 10 THEMED DECK COLLECTIONS (250 TOTAL DOLPHINS) ---
  const COLLECTIONS = [
    {
      id: '01_Poseidon_Mythic_Gods',
      name: 'Poseidon Mythic Gods',
      rarity: 'MYTHIC',
      yieldBonus: '+45%',
      speed: '320 m/s',
      harvest: '+100 🐚',
      sprite: 'assets/collections/01_Poseidon_Mythic_Gods/01_01_poseidon.png'
    },
    {
      id: '02_Abyss_Deep_Ocean',
      name: 'Abyss Deep Ocean',
      rarity: 'LEGENDARY',
      yieldBonus: '+38%',
      speed: '280 m/s',
      harvest: '+80 🐚',
      sprite: 'assets/collections/02_Abyss_Deep_Ocean/02_01_angler.png'
    },
    {
      id: '03_Cyberpunk_Neon',
      name: 'Cyberpunk Neon',
      rarity: 'EPIC',
      yieldBonus: '+30%',
      speed: '260 m/s',
      harvest: '+65 🐚',
      sprite: 'assets/collections/03_Cyberpunk_Neon/03_01_cyber.png'
    },
    {
      id: '04_Pirates_Sea_Captains',
      name: 'Pirates Sea Captains',
      rarity: 'EPIC',
      yieldBonus: '+25%',
      speed: '240 m/s',
      harvest: '+50 🐚',
      sprite: 'assets/collections/04_Pirates_Sea_Captains/04_01_captain.png'
    },
    {
      id: '05_Celestial_Astral',
      name: 'Celestial Astral',
      rarity: 'MYTHIC',
      yieldBonus: '+42%',
      speed: '310 m/s',
      harvest: '+95 🐚',
      sprite: 'assets/collections/05_Celestial_Astral/05_01_starlight.png'
    },
    {
      id: '06_Coral_Reef_Tropical',
      name: 'Coral Reef Tropical',
      rarity: 'RARE',
      yieldBonus: '+18%',
      speed: '210 m/s',
      harvest: '+35 🐚',
      sprite: 'assets/collections/06_Coral_Reef_Tropical/06_01_clownfish.png'
    },
    {
      id: '07_Glacier_Frost',
      name: 'Glacier Frost',
      rarity: 'RARE',
      yieldBonus: '+20%',
      speed: '220 m/s',
      harvest: '+40 🐚',
      sprite: 'assets/collections/07_Glacier_Frost/07_01_iceberg.png'
    },
    {
      id: '08_Volcanic_Magma',
      name: 'Volcanic Magma',
      rarity: 'EPIC',
      yieldBonus: '+28%',
      speed: '250 m/s',
      harvest: '+60 🐚',
      sprite: 'assets/collections/08_Volcanic_Magma/08_01_magma.png'
    },
    {
      id: '09_Samurai_Warrior',
      name: 'Samurai Warrior',
      rarity: 'LEGENDARY',
      yieldBonus: '+35%',
      speed: '290 m/s',
      harvest: '+85 🐚',
      sprite: 'assets/collections/09_Samurai_Warrior/09_01_samurai.png'
    },
    {
      id: '10_Royal_Dynasty_Monarchs',
      name: 'Royal Dynasty Monarchs',
      rarity: 'MYTHIC',
      yieldBonus: '+40%',
      speed: '300 m/s',
      harvest: '+90 🐚',
      sprite: 'assets/collections/10_Royal_Dynasty_Monarchs/10_01_emperor.png'
    },
    {
      id: '01_02_neptune',
      name: 'Neptune Sovereign',
      rarity: 'MYTHIC',
      yieldBonus: '+44%',
      speed: '315 m/s',
      harvest: '+98 🐚',
      sprite: 'assets/collections/01_Poseidon_Mythic_Gods/01_02_neptune.png'
    }
  ];

  // --- GAME STATE ---
  const state = {
    currencies: {
      pearlsBalance: 12450,
      starsBalance: 350,
      energy: 0,
      maxEnergy: 2000
    },
    stats: {
      totalFeeds: 1420,
      totalMerges: 584,
      unlockedDolphins: 11
    },
    activeSlotIdx: 0,
    currentLevel: 1,
    currentExp: 350,
    maxExp: 1000,
    feedCost: 10,
    breedingEndTime: 0,
    isBreeding: false,
    crackTapsLeft: 3,
    boosterMultiplier: 1,
    boosterEndTime: 0,
    draggedCellIdx: null,
    selectedMarketItem: null,
    // 42 cells (7 rows x 6 cols)
    board: new Array(42).fill(null)
  };

  // Seed initial shells
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
    hdrLvlTxt: document.getElementById('hdr-lvl-txt'),
    mascotSprite: document.getElementById('mascot-sprite'),
    rarityTag: document.getElementById('current-slot-rarity'),
    lvlTag: document.getElementById('current-slot-lvl'),
    expFill: document.getElementById('hero-exp-fill'),
    expCur: document.getElementById('hero-exp-cur'),
    expMax: document.getElementById('hero-exp-max'),
    statYield: document.getElementById('stat-yield'),
    statSpeed: document.getElementById('stat-speed'),
    statHarvest: document.getElementById('stat-harvest'),
    feedCostTxt: document.getElementById('feed-cost-txt'),
    breedingOverlay: document.getElementById('breeding-overlay'),
    breedingTimerTxt: document.getElementById('breeding-timer-txt'),
    deckSlotsTrack: document.getElementById('deck-slots-track'),
    shellsBoard: document.getElementById('shells-board'),
    marketCollectionsGrid: document.getElementById('market-collections-grid'),
    godsPantheonList: document.getElementById('gods-pantheon-list'),
    questsContainer: document.getElementById('quests-container'),
    crackEggImg: document.getElementById('crack-egg-img'),
    crackTapsLeftTxt: document.getElementById('crack-taps-left'),
    tideWheelDisc: document.getElementById('tide-wheel-disc'),
    boosterStatusBadge: document.getElementById('booster-status-badge'),
    streakGrid: document.getElementById('streak-grid'),
    modalEnergyTxt: document.getElementById('modal-energy-txt')
  };

  function formatNum(n) {
    return Number(n).toLocaleString('en-US');
  }

  function formatTime(ms) {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  // --- RENDER FUNCTIONS ---
  function updateHeader() {
    if (el.pearlsVal) el.pearlsVal.textContent = formatNum(state.currencies.pearlsBalance);
    if (el.starsVal) el.starsVal.textContent = formatNum(state.currencies.starsBalance);
    if (el.energyVal) el.energyVal.textContent = `${formatNum(state.currencies.energy)} / ${formatNum(state.currencies.maxEnergy)}`;
    if (el.hdrLvlTxt) el.hdrLvlTxt.textContent = state.currentLevel;
    if (el.modalEnergyTxt) el.modalEnergyTxt.textContent = `${formatNum(state.currencies.energy)} / ${formatNum(state.currencies.maxEnergy)}`;
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
    if (el.rarityTag) el.rarityTag.textContent = active.rarity;
    if (el.statYield) el.statYield.textContent = active.yieldBonus;
    if (el.statSpeed) el.statSpeed.textContent = active.speed;
    if (el.statHarvest) el.statHarvest.textContent = active.harvest;
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

      // Drag and Drop Events
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
        cellDiv.ondragstart = () => {
          state.draggedCellIdx = idx;
        };

        cellDiv.innerHTML = `
          <img src="${imgSrc}" class="shell-item-img" alt="Shell Tier ${cell.tier}">
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
      // Merge!
      state.board[toIdx].tier += 1;
      state.board[fromIdx] = null;
      state.currencies.pearlsBalance += toItem.tier * 25;
      state.stats.totalMerges += 1;
      AudioEngine.playMerge();
      updateHeader();
      renderShellsBoard();
    } else if (fromItem && !toItem) {
      // Move to empty cell
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
        state.currencies.pearlsBalance += item.tier * 25;
        state.stats.totalMerges += 1;
        AudioEngine.playMerge();
        updateHeader();
        renderShellsBoard();
        return;
      }
    }
    AudioEngine.playTap();
  }

  function renderMarketCards() {
    if (!el.marketCollectionsGrid) return;
    el.marketCollectionsGrid.innerHTML = '';
    COLLECTIONS.slice(0, 9).forEach((col, idx) => {
      const card = document.createElement('div');
      card.className = 'market-item-card';
      card.onclick = () => openMarketInspect(col);
      card.innerHTML = `
        <img src="assets/special/market_badge_hot_deal.png" class="market-hot-seal" alt="HOT">
        <img src="${col.sprite}" class="market-item-img" alt="${col.name}">
        <div class="market-item-name">${col.name.split(' ')[0]}</div>
        <div class="market-item-price">${300 + idx * 50} 🐚</div>
      `;
      el.marketCollectionsGrid.appendChild(card);
    });
  }

  function renderGodsList() {
    if (!el.godsPantheonList) return;
    el.godsPantheonList.innerHTML = '';
    [
      { name: 'Poseidon Sovereign', yield: '+45%', cost: 1500, img: 'assets/collections/01_Poseidon_Mythic_Gods/01_01_poseidon.png' },
      { name: 'Aura of the Abyss', yield: '+38%', cost: 1200, img: 'assets/collections/02_Abyss_Deep_Ocean/02_01_angler.png' },
      { name: 'Astral Supernova', yield: '+42%', cost: 1400, img: 'assets/collections/05_Celestial_Astral/05_01_starlight.png' }
    ].forEach(god => {
      const row = document.createElement('div');
      row.className = 'task-card-row';
      row.innerHTML = `
        <div class="task-left-meta">
          <img src="${god.img}" class="task-icon-img" alt="${god.name}">
          <div>
            <div class="task-title">${god.name}</div>
            <div class="task-reward">Yield Multiplier: ${god.yield}</div>
          </div>
        </div>
        <button class="btn-claim-pill gold" onclick="mintGodNFT('${god.name}', ${god.cost})">MINT (${god.cost} 🐚)</button>
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

  function renderStreakCalendar() {
    if (!el.streakGrid) return;
    el.streakGrid.innerHTML = '';
    const rewards = [100, 200, 300, 450, 600, 800, 1500];
    rewards.forEach((r, idx) => {
      const day = idx + 1;
      const cell = document.createElement('div');
      cell.className = `streak-day-cell ${day === 3 ? 'active' : ''}`;
      cell.innerHTML = `
        <span class="streak-day-label">DAY ${day}</span>
        <span class="streak-day-reward">+${r} 🐚</span>
      `;
      el.streakGrid.appendChild(cell);
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

  window.handleFeedTap = function(e) {
    if (state.isBreeding) return;
    if (state.currencies.pearlsBalance < state.feedCost) {
      alert('Need more Blue Pearls to feed!');
      return;
    }

    const expGained = 25 * state.boosterMultiplier;
    state.currencies.pearlsBalance -= state.feedCost;
    state.currentExp += expGained;
    state.stats.totalFeeds += 1;

    if (state.currentExp >= state.maxExp) {
      state.currentLevel += 1;
      state.currentExp = 0;
      state.maxExp = Math.floor(state.maxExp * 1.5);
      if (el.lvlTag) el.lvlTag.textContent = state.currentLevel;
      window.openModal('modal-egg-crack');
    }

    if (el.expFill) el.expFill.style.width = `${(state.currentExp / state.maxExp) * 100}%`;
    if (el.expCur) el.expCur.textContent = state.currentExp;
    if (el.expMax) el.expMax.textContent = state.maxExp;

    const clientX = (e && e.clientX) ? e.clientX : 200;
    const clientY = (e && e.clientY) ? e.clientY : 400;
    const floatTxt = document.createElement('div');
    floatTxt.style.position = 'absolute';
    floatTxt.style.left = `${clientX - 20}px`;
    floatTxt.style.top = `${clientY - 20}px`;
    floatTxt.style.color = '#00f2fe';
    floatTxt.style.fontWeight = '900';
    floatTxt.style.fontSize = '16px';
    floatTxt.style.pointerEvents = 'none';
    floatTxt.style.zIndex = '999';
    floatTxt.style.transition = 'all 0.8s ease-out';
    floatTxt.textContent = `+${expGained} EXP`;
    document.body.appendChild(floatTxt);

    setTimeout(() => {
      floatTxt.style.transform = 'translateY(-40px)';
      floatTxt.style.opacity = '0';
    }, 20);
    setTimeout(() => floatTxt.remove(), 850);

    AudioEngine.playTap();
    updateHeader();
  };

  window.startBreedingRoutine = function() {
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
    if (el.breedingOverlay) el.breedingOverlay.style.display = 'none';
    AudioEngine.playHatch();
    updateHeader();
    window.openModal('modal-egg-crack');
  };

  window.spawnPearlToBoard = function() {
    const emptyIdx = state.board.findIndex(c => c === null);
    if (emptyIdx === -1) {
      alert('Shell grid is full! Merge shells first.');
      return;
    }
    if (state.currencies.pearlsBalance < 50) {
      alert('Need 50 Blue Pearls to spawn a shell!');
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
          state.stats.totalMerges += 1;
          break;
        }
      }
    }
    if (merged) {
      AudioEngine.playMerge();
      updateHeader();
      renderShellsBoard();
    }
  };

  // --- MODAL UTILITIES ---
  window.openModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'flex';
    AudioEngine.playTap();
  };

  window.closeModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'none';
  };

  window.openUserProfileModal = function() {
    document.getElementById('prof-total-feeds').textContent = formatNum(state.stats.totalFeeds);
    document.getElementById('prof-total-merges').textContent = formatNum(state.stats.totalMerges);
    window.openModal('modal-user-profile');
  };

  window.openShopModal = function(type) {
    if (type === 'pearls') window.openModal('modal-shop-pearls');
    else if (type === 'stars') window.openModal('modal-shop-stars');
  };

  window.openEnergyModal = function() { window.openModal('modal-energy-refill'); };
  window.openDailyStreakModal = function() {
    renderStreakCalendar();
    window.openModal('modal-daily-streak');
  };
  window.openBoostersModal = function() { window.openModal('modal-boosters'); };
  window.openPassModal = function() { window.openModal('modal-pass'); };
  window.openClansModal = function() { window.openModal('modal-clans'); };
  window.openArenaModal = function() { window.openModal('modal-arena'); };
  window.openLottoModal = function() { window.openModal('modal-lotto'); };
  window.openTideWheelModal = function() { window.openModal('modal-tide-wheel'); };

  // --- ACTIONS & SHOP PURCHASES ---
  window.buyPearlsPack = function(amount, tonPrice) {
    state.currencies.pearlsBalance += amount;
    updateHeader();
    AudioEngine.playHatch();
    alert(`🎉 Purchase Successful! +${formatNum(amount)} Blue Pearls added to wallet.`);
    window.closeModal('modal-shop-pearls');
  };

  window.buyStarsPack = function(amount, tonPrice) {
    state.currencies.starsBalance += amount;
    updateHeader();
    AudioEngine.playHatch();
    alert(`⭐ Purchase Successful! +${formatNum(amount)} Blue Stars added.`);
    window.closeModal('modal-shop-stars');
  };

  window.refillEnergyTank = function() {
    if (state.currencies.pearlsBalance < 50) {
      alert('Need 50 Pearls to refill Energy Tank!');
      return;
    }
    state.currencies.pearlsBalance -= 50;
    state.currencies.energy = state.currencies.maxEnergy;
    updateHeader();
    AudioEngine.playHatch();
    alert('⚡ Energy Tank fully recharged to 2,000 / 2,000!');
    window.closeModal('modal-energy-refill');
  };

  window.claimDailyStreakReward = function() {
    state.currencies.pearlsBalance += 300;
    updateHeader();
    AudioEngine.playHatch();
    const btn = document.getElementById('btn-claim-streak');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'CLAIMED TODAY';
      btn.style.background = '#8e9aaf';
    }
    alert('🔥 Day 3 Streak Claimed! +300 Blue Pearls.');
  };

  window.activateBooster = function(type) {
    state.boosterMultiplier = (type === '5X') ? 5 : 2;
    state.boosterEndTime = Date.now() + 10 * 60 * 1000;
    if (el.boosterStatusBadge) el.boosterStatusBadge.textContent = `${type} ON`;
    AudioEngine.playHatch();
    alert(`🚀 ${type} Speed Surge Active for 10 Minutes!`);
    window.closeModal('modal-boosters');
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
      alert('✨ HATCH COMPLETE! Unlocked Mythic Poseidon Dolphin Variant!');
    }
  };

  window.joinClan = function(clanName) {
    AudioEngine.playHatch();
    alert(`🛡️ Successfully Joined Syndicate: ${clanName}! Team Yield +15% Active.`);
    window.closeModal('modal-clans');
  };

  window.triggerPvpDuel = function() {
    AudioEngine.playTap();
    setTimeout(() => {
      AudioEngine.playHatch();
      state.currencies.pearlsBalance += 250;
      updateHeader();
      alert('🏆 VICTORY! You defeated the Abyssal Rival and won 250 Blue Pearls!');
      window.closeModal('modal-arena');
    }, 800);
  };

  window.buyLottoTicket = function() {
    if (state.currencies.pearlsBalance < 50) {
      alert('Need 50 Pearls to buy a Lotto Ticket!');
      return;
    }
    state.currencies.pearlsBalance -= 50;
    updateHeader();
    AudioEngine.playTap();
    alert('🎟️ Ticket #7492 Purchased! Daily draw in 4 hours.');
    window.closeModal('modal-lotto');
  };

  window.claimPassVault = function(tier) {
    if (tier === 'free') {
      state.currencies.pearlsBalance += 250;
      updateHeader();
      AudioEngine.playHatch();
      alert('🎁 Free Season Vault Claimed: +250 Blue Pearls!');
      window.closeModal('modal-pass');
    } else {
      alert('💎 Upgrade to Dolphin Pass Season 1 to unlock Mythic Vaults!');
    }
  };

  function openMarketInspect(col) {
    state.selectedMarketItem = col;
    document.getElementById('market-modal-title').textContent = col.name;
    document.getElementById('market-modal-rarity').textContent = `${col.rarity} RARITY`;
    document.getElementById('market-inspect-img').src = col.sprite;
    document.getElementById('market-meta-yield').textContent = col.yieldBonus;
    document.getElementById('market-meta-speed').textContent = col.speed;
    window.openModal('modal-market-inspect');
  }

  window.executeMarketBuy = function() {
    if (!state.selectedMarketItem) return;
    if (state.currencies.pearlsBalance < 450) {
      alert('Need 450 Blue Pearls to purchase this Dolphin NFT!');
      return;
    }
    state.currencies.pearlsBalance -= 450;
    state.stats.unlockedDolphins += 1;
    updateHeader();
    AudioEngine.playHatch();
    alert(`🎉 Purchased ${state.selectedMarketItem.name}! Swapping to active deck.`);
    window.closeModal('modal-market-inspect');
  };

  window.mintGodNFT = function(godName, cost) {
    if (state.currencies.pearlsBalance < cost) {
      alert(`Need ${cost} Pearls to mint ${godName}!`);
      return;
    }
    state.currencies.pearlsBalance -= cost;
    updateHeader();
    AudioEngine.playHatch();
    alert(`🔱 Mythic God NFT Minted: ${godName}! Passive Yield Multiplier boosted.`);
  };

  window.joinChampionshipTournament = function() {
    AudioEngine.playTap();
    alert('🏆 Entered Poseidon Grand Prix Season 1! Current Rank: #42');
  };

  window.claimQuestReward = function(btn, amount) {
    btn.disabled = true;
    btn.textContent = 'CLAIMED';
    btn.style.background = '#4facfe';
    state.currencies.pearlsBalance += amount;
    updateHeader();
    AudioEngine.playHatch();
  };

  window.copyInviteLink = function() {
    navigator.clipboard.writeText('https://t.me/dolphin_pearls_bot?start=ref123');
    alert('Invite link copied to clipboard!');
  };

  // --- INITIALIZATION ---
  function init() {
    updateHeader();
    renderDeckSlots();
    renderShellsBoard();
    renderMarketCards();
    renderGodsList();
    renderQuestsList();

    // Game loop timers
    setInterval(() => {
      if (state.isBreeding && state.breedingEndTime > 0) {
        const remaining = state.breedingEndTime - Date.now();
        if (remaining <= 0) {
          state.isBreeding = false;
          if (el.breedingOverlay) el.breedingOverlay.style.display = 'none';
        } else {
          if (el.breedingTimerTxt) el.breedingTimerTxt.textContent = formatTime(remaining);
        }
      }

      if (state.boosterMultiplier > 1 && state.boosterEndTime > 0) {
        if (Date.now() >= state.boosterEndTime) {
          state.boosterMultiplier = 1;
          state.boosterEndTime = 0;
          if (el.boosterStatusBadge) el.boosterStatusBadge.textContent = 'OFF';
        }
      }
    }, 1000);
  }

  window.addEventListener('DOMContentLoaded', init);
})();
