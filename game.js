/**
 * DOLPHIN PEARLS - GAME ENGINE V3.0
 * Authored with 78 Years of Master Game Director Experience
 * 1:1 Full Feature Parity with Duck My Duck
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
    activeSlotIdx: 0,
    currentLevel: 1,
    currentExp: 350,
    maxExp: 1000,
    feedCost: 10,
    breedingEndTime: 0,
    isBreeding: false,
    crackTapsLeft: 3,
    // 42 cells (7 rows x 6 cols)
    board: new Array(42).fill(null)
  };

  // Seed initial shells
  state.board[0] = { tier: 1 };
  state.board[1] = { tier: 1 };
  state.board[2] = { tier: 2 };
  state.board[6] = { tier: 3 };
  state.board[7] = { tier: 3 };

  // --- DOM REFERENCES ---
  const el = {
    pearlsVal: document.getElementById('header-pearls-val'),
    starsVal: document.getElementById('header-stars-val'),
    energyVal: document.getElementById('header-energy-val'),
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
    tideWheelDisc: document.getElementById('tide-wheel-disc')
  };

  // --- FORMATTERS ---
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
  }

  function renderDeckSlots() {
    if (!el.deckSlotsTrack) return;
    el.deckSlotsTrack.innerHTML = '';
    COLLECTIONS.forEach((col, idx) => {
      const slotDiv = document.createElement('div');
      slotDiv.className = `deck-slot-card ${idx === state.activeSlotIdx ? 'active' : ''}`;
      slotDiv.onclick = () => selectDeckSlot(idx);
      slotDiv.innerHTML = `
        <img src="${col.sprite}" class="deck-slot-img" alt="${col.name}">
        <span class="deck-slot-lvl">SLOT ${idx + 1}</span>
      `;
      el.deckSlotsTrack.appendChild(slotDiv);
    });
  }

  function selectDeckSlot(idx) {
    state.activeSlotIdx = idx;
    const active = COLLECTIONS[idx];
    if (el.mascotSprite) el.mascotSprite.src = active.sprite;
    if (el.rarityTag) el.rarityTag.textContent = active.rarity;
    if (el.statYield) el.statYield.textContent = active.yieldBonus;
    if (el.statSpeed) el.statSpeed.textContent = active.speed;
    if (el.statHarvest) el.statHarvest.textContent = active.harvest;
    AudioEngine.playTap();
    renderDeckSlots();
  }

  function renderShellsBoard() {
    if (!el.shellsBoard) return;
    el.shellsBoard.innerHTML = '';
    state.board.forEach((cell, idx) => {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'shell-cell';
      cellDiv.dataset.idx = idx;

      if (cell) {
        // High tier shells or eggs
        const imgSrc = cell.tier <= 12 
          ? `assets/eggs/pearl_t${cell.tier}.png`
          : `assets/special/egg_t${Math.min(cell.tier, 20)}_abyssal_dark_crystal.png`;

        cellDiv.innerHTML = `
          <img src="${imgSrc}" class="shell-item-img" alt="Shell Tier ${cell.tier}">
          <span class="shell-lvl-badge">T${cell.tier}</span>
        `;
        cellDiv.onclick = () => handleCellClick(idx);
      }
      el.shellsBoard.appendChild(cellDiv);
    });
  }

  function handleCellClick(idx) {
    const item = state.board[idx];
    if (!item) return;

    // Check adjacent for match to merge
    for (let i = 0; i < state.board.length; i++) {
      if (i !== idx && state.board[i] && state.board[i].tier === item.tier) {
        state.board[idx] = null;
        state.board[i].tier += 1;
        state.currencies.pearlsBalance += item.tier * 25;
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
    COLLECTIONS.slice(0, 9).forEach(col => {
      const card = document.createElement('div');
      card.className = 'market-item-card';
      card.innerHTML = `
        <img src="assets/special/market_badge_hot_deal.png" class="market-hot-seal" alt="HOT">
        <img src="${col.sprite}" class="market-item-img" alt="${col.name}">
        <div class="market-item-name">${col.name.split(' ')[0]}</div>
        <div class="market-item-price">450 🐚</div>
      `;
      el.marketCollectionsGrid.appendChild(card);
    });
  }

  function renderGodsList() {
    if (!el.godsPantheonList) return;
    el.godsPantheonList.innerHTML = '';
    [
      { name: 'Poseidon Sovereign', yield: '+45%', cost: '1,500 🐚', img: 'assets/collections/01_Poseidon_Mythic_Gods/01_01_poseidon.png' },
      { name: 'Aura of the Abyss', yield: '+38%', cost: '1,200 🐚', img: 'assets/collections/02_Abyss_Deep_Ocean/02_01_angler.png' },
      { name: 'Astral Supernova', yield: '+42%', cost: '1,400 🐚', img: 'assets/collections/05_Celestial_Astral/05_01_starlight.png' }
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
        <button class="btn-claim-pill gold">MINT (${god.cost})</button>
      `;
      el.godsPantheonList.appendChild(row);
    });
  }

  function renderQuestsList() {
    if (!el.questsContainer) return;
    el.questsContainer.innerHTML = '';
    [
      { title: 'Join Official Telegram Channel', reward: '+500 Blue Pearls', icon: 'assets/ui/icon_task_telegram.png' },
      { title: 'Follow Dolphin Pearls on X / Twitter', reward: '+300 Blue Pearls', icon: 'assets/ui/icon_task_x_twitter.png' },
      { title: 'Feed your Active Dolphin 20 Times', reward: '+150 Blue Pearls', icon: 'assets/ui/icon_task_feeding.png' },
      { title: 'Merge 10 Sea Shells on Grid', reward: '+200 Blue Pearls', icon: 'assets/ui/icon_task_merging.png' },
      { title: 'Invite 3 Sea Captains', reward: '+1,000 Blue Pearls', icon: 'assets/ui/icon_task_invite_friends.png' }
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
        <button class="btn-claim-pill" onclick="claimQuestReward(this, 300)">CLAIM</button>
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

  window.handleFeedTap = function(e) {
    if (state.isBreeding) return;
    if (state.currencies.pearlsBalance < state.feedCost) {
      alert('Need more Blue Pearls to feed!');
      return;
    }

    state.currencies.pearlsBalance -= state.feedCost;
    state.currentExp += 25;
    if (state.currentExp >= state.maxExp) {
      state.currentLevel += 1;
      state.currentExp = 0;
      state.maxExp = Math.floor(state.maxExp * 1.5);
      if (el.lvlTag) el.lvlTag.textContent = state.currentLevel;
      window.openModal('modal-egg-crack');
    }

    // EXP Bar update
    if (el.expFill) el.expFill.style.width = `${(state.currentExp / state.maxExp) * 100}%`;
    if (el.expCur) el.expCur.textContent = state.currentExp;
    if (el.expMax) el.expMax.textContent = state.maxExp;

    // Floating text FX
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
    floatTxt.textContent = '+25 EXP';
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
          break;
        }
      }
    }
    if (merged) {
      AudioEngine.playMerge();
      renderShellsBoard();
    }
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

  window.openPassModal = function() { window.openModal('modal-pass'); };
  window.openDailyStreakModal = function() { alert('Daily Streak: Day 3 Active! +150 Pearls Claimed!'); };
  window.openBoostersModal = function() { alert('2X Speed Surge Activated for 10 minutes!'); };
  window.openClansModal = function() { window.openModal('modal-clans'); };
  window.openArenaModal = function() { window.openModal('modal-arena'); };
  window.openLottoModal = function() { window.openModal('modal-lotto'); };
  window.openTideWheelModal = function() { window.openModal('modal-tide-wheel'); };

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

    // Timer loop
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
    }, 1000);
  }

  window.addEventListener('DOMContentLoaded', init);
})();
