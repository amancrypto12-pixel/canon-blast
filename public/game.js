/**
 * DOLPHIN PEARLS - MASTER GAME ENGINE V6.0
 * Swiper.js Coverflow 3D Deck, Tactile Motion, HUD State Machine
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
    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.12) {
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
      this.playTone(650, 'triangle', 0.06, 0.15);
      triggerHaptic('light');
    },
    playMerge() {
      this.playTone(440, 'sine', 0.1, 0.15);
      setTimeout(() => this.playTone(660, 'sine', 0.12, 0.18), 50);
      setTimeout(() => this.playTone(880, 'sine', 0.15, 0.22), 100);
      triggerHaptic('medium');
    },
    playHatch() {
      [523, 659, 784, 1046, 1318].forEach((f, i) => {
        setTimeout(() => this.playTone(f, 'triangle', 0.2, 0.2), i * 60);
      });
      triggerHaptic('heavy');
    }
  };

  // --- 10 THEMED DECK COLLECTIONS (250 TOTAL DOLPHINS) ---
  const COLLECTIONS = [
    {
      id: '01_Poseidon',
      name: 'Poseidon Sovereign',
      rarity: 'MYTHIC',
      rate: 99.68,
      sprite: 'assets/collections/01_Poseidon_Mythic_Gods/01_01_poseidon.png'
    },
    {
      id: '02_Abyss',
      name: 'Abyssal Angler',
      rarity: 'LEGENDARY',
      rate: 75.40,
      sprite: 'assets/collections/02_Abyss_Deep_Ocean/02_01_angler.png'
    },
    {
      id: '03_Cyber',
      name: 'Cyber Matrix Fin',
      rarity: 'EPIC',
      rate: 45.20,
      sprite: 'assets/collections/03_Cyberpunk_Neon/03_01_cyber.png'
    },
    {
      id: '04_Pirates',
      name: 'Captain Hookfin',
      rarity: 'RARE',
      rate: 22.10,
      sprite: 'assets/collections/04_Pirates_Sea_Captains/04_01_captain.png'
    },
    {
      id: '05_Celestial',
      name: 'Celestial Starlight',
      rarity: 'UNCOMMON',
      rate: 12.50,
      sprite: 'assets/collections/05_Celestial_Astral/05_01_starlight.png'
    },
    {
      id: '06_Coral',
      name: 'Coral Clown Dolphin',
      rarity: 'COMMON',
      rate: 5.00,
      sprite: 'assets/collections/06_Coral_Reef_Tropical/06_01_clown.png'
    }
  ];

  // --- GAME STATE ---
  const state = {
    currencies: {
      pearlsBalance: 5673,
      starsBalance: 30,
      dmdTokens: 99.68,
      heartsBalance: 0
    },
    activeSlotIdx: 0,
    currentLevel: 5,
    currentTapsInLevel: 125,
    maxTapsInLevel: 500,
    feedCost: 30,
    feedResetEndTime: Date.now() + 7 * 60 * 60 * 1000 + 5 * 60 * 1000, // 07:05:00
    marketCycleEndTime: Date.now() + 9 * 60 * 1000 + 13 * 1000,
    marketPrice: 30000,
    marketPhase: 'HOT',
    swiperInstance: null,
    // 42 cells grid
    board: new Array(42).fill(null)
  };

  // Seed board with sample items
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
    heroDmdRate: document.getElementById('hero-dmd-rate'),
    slotLvlChip: document.getElementById('current-slot-lvl-chip'),
    rarityChip: document.getElementById('current-slot-rarity'),
    mascotSprite: document.getElementById('mascot-sprite'),
    mascotAnimWrapper: document.getElementById('mascot-anim-wrapper'),
    tapsCur: document.getElementById('hero-taps-cur'),
    tapsMax: document.getElementById('hero-taps-max'),
    expFill: document.getElementById('hero-exp-fill'),
    feedCostTxt: document.getElementById('feed-cost-txt'),
    feedResetTimer: document.getElementById('feed-reset-timer'),
    heartsBalanceBadge: document.getElementById('hearts-balance-badge'),
    swiperDeckWrapper: document.getElementById('swiper-deck-wrapper'),
    shellsBoard: document.getElementById('shells-board'),
    marketPriceTxt: document.getElementById('market-current-price'),
    marketCycleTag: document.getElementById('market-cycle-tag'),
    marketCycleTimer: document.getElementById('market-cycle-timer'),
    marketCollectionsGrid: document.getElementById('market-collections-grid'),
    godsPantheonList: document.getElementById('gods-pantheon-list'),
    questsContainer: document.getElementById('quests-container'),
    tideWheelDisc: document.getElementById('tide-wheel-disc')
  };

  function formatNum(n) { return Number(n).toLocaleString('en-US'); }
  function formatTime(ms) {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  // --- HEADER & HUD UPDATES ---
  function updateHUD() {
    if (el.pearlsVal) el.pearlsVal.textContent = formatNum(state.currencies.pearlsBalance);
    if (el.starsVal) el.starsVal.textContent = formatNum(state.currencies.starsBalance);
    if (el.heroDmdRate) el.heroDmdRate.textContent = state.currencies.dmdTokens.toFixed(2);
    if (el.feedCostTxt) el.feedCostTxt.textContent = `${state.feedCost} 🐚`;
    if (el.heartsBalanceBadge) el.heartsBalanceBadge.textContent = `${formatNum(state.currencies.heartsBalance)} ❤️`;
  }

  // --- SWIPER.JS COVERFLOW 3D CAROUSEL ---
  function initSwiperDeck() {
    if (!el.swiperDeckWrapper) return;
    el.swiperDeckWrapper.innerHTML = '';
    COLLECTIONS.forEach((col, idx) => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.innerHTML = `
        <img src="${col.sprite}" alt="${col.name}" onerror="this.onerror=null; this.src=\'data:image/svg+xml;utf8,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' width=\\\'32\\\' height=\\\'32\\\' viewBox=\\\'0 0 32 32\\\'><text y=\\\'24\\\' font-size=\\\'22\\\'>🐬</text></svg>\';">
        <span class="deck-slot-num">SLOT ${idx + 1}</span>
      `;
      slide.onclick = () => selectDeckSlot(idx);
      el.swiperDeckWrapper.appendChild(slide);
    });

    if (window.Swiper) {
      state.swiperInstance = new window.Swiper('.mySwiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 4.5,
        coverflowEffect: {
          rotate: 15,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: false,
        },
        initialSlide: state.activeSlotIdx,
        on: {
          slideChange: function() {
            selectDeckSlot(this.activeIndex);
          }
        }
      });
    }
  }

  function selectDeckSlot(idx) {
    state.activeSlotIdx = idx;
    const col = COLLECTIONS[idx];
    if (!col) return;

    if (el.mascotSprite) el.mascotSprite.src = col.sprite;
    if (el.rarityChip) el.rarityChip.textContent = `~${col.rarity}`;
    state.currencies.dmdTokens = col.rate;
    updateHUD();
    AudioEngine.playTap();
  }

  // --- PRIMARY ACTION: TAP TO FEED WITH TACTILE MOTION ---
  window.handleFeedTap = function(e) {
    if (state.currencies.pearlsBalance < state.feedCost) {
      alert(`Need ${state.feedCost} Blue Pearls to feed!`);
      return;
    }

    state.currencies.pearlsBalance -= state.feedCost;
    state.currentTapsInLevel += 1;
    state.currencies.dmdTokens += 0.05;

    // EXP Bar Update
    if (el.tapsCur) el.tapsCur.textContent = state.currentTapsInLevel;
    if (el.expFill) el.expFill.style.width = `${Math.min((state.currentTapsInLevel / state.maxTapsInLevel) * 100, 100)}%`;

    // Tactile Framer Motion-Style Squash and Stretch Physics
    if (el.mascotAnimWrapper) {
      el.mascotAnimWrapper.style.transform = 'scale(0.92, 1.08) translateY(6px)';
      setTimeout(() => {
        if (el.mascotAnimWrapper) el.mascotAnimWrapper.style.transform = 'scale(1, 1)';
      }, 120);
    }

    // Dynamic Floating +EXP particle text
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
    floatTxt.textContent = '+0.05 $DMD';
    document.body.appendChild(floatTxt);

    setTimeout(() => {
      floatTxt.style.transform = 'translateY(-50px) scale(1.1)';
      floatTxt.style.opacity = '0';
    }, 20);
    setTimeout(() => floatTxt.remove(), 850);

    AudioEngine.playTap();
    updateHUD();
  };

  // --- 42-CELL SHELLS GRID ---
  function renderShellsBoard() {
    if (!el.shellsBoard) return;
    el.shellsBoard.innerHTML = '';
    state.board.forEach((cell, idx) => {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'shell-cell';
      cellDiv.dataset.idx = idx;

      if (cell) {
        const imgSrc = cell.tier <= 12 
          ? `assets/pearl_t${cell.tier}.png`
          : `assets/special/egg_t${Math.min(cell.tier, 20)}_abyssal_dark_crystal.png`;

        cellDiv.innerHTML = `
          <img src="${imgSrc}" alt="T${cell.tier}" onerror="this.onerror=null; this.src=\'data:image/svg+xml;utf8,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' width=\\\'32\\\' height=\\\'32\\\' viewBox=\\\'0 0 32 32\\\'><text y=\\\'24\\\' font-size=\\\'22\\\'>🥚</text></svg>\';">
          <span class="shell-lvl-badge">T${cell.tier}</span>
        `;
        cellDiv.onclick = () => handleCellMerge(idx);
      }
      el.shellsBoard.appendChild(cellDiv);
    });
  }

  function handleCellMerge(idx) {
    const item = state.board[idx];
    if (!item) return;

    for (let i = 0; i < state.board.length; i++) {
      if (i !== idx && state.board[i] && state.board[i].tier === item.tier) {
        state.board[idx] = null;
        state.board[i].tier += 1;
        state.currencies.pearlsBalance += item.tier * 25;
        AudioEngine.playMerge();
        updateHUD();
        renderShellsBoard();
        return;
      }
    }
    AudioEngine.playTap();
  }

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

  window.spawnPearlToBoard = function() {
    const emptyIdx = state.board.findIndex(c => c === null);
    if (emptyIdx === -1) {
      alert('Grid is full!');
      return;
    }
    if (state.currencies.pearlsBalance < 50) {
      alert('Need 50 Blue Pearls!');
      return;
    }
    state.currencies.pearlsBalance -= 50;
    state.board[emptyIdx] = { tier: 1 };
    AudioEngine.playTap();
    updateHUD();
    renderShellsBoard();
  };

  // --- MARKET CARDS ---
  function renderMarketCards() {
    if (!el.marketCollectionsGrid) return;
    el.marketCollectionsGrid.innerHTML = '';
    COLLECTIONS.forEach((col, idx) => {
      const card = document.createElement('div');
      card.className = 'market-item-card';
      card.innerHTML = `
        <img src="${col.sprite}" alt="${col.name}" onerror="this.onerror=null; this.src=\'data:image/svg+xml;utf8,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' width=\\\'32\\\' height=\\\'32\\\' viewBox=\\\'0 0 32 32\\\'><text y=\\\'24\\\' font-size=\\\'22\\\'>🐬</text></svg>\';">
        <div class="market-item-name">${col.name.split(' ')[0]}</div>
        <div class="market-item-price">${30000 + idx * 25000} 🐚</div>
      `;
      card.onclick = () => {
        alert(`🛒 Market Order: Buy ${col.name}?`);
      };
      el.marketCollectionsGrid.appendChild(card);
    });
  }

  // --- GODS PANTHEON ---
  function renderGodsList() {
    if (!el.godsPantheonList) return;
    el.godsPantheonList.innerHTML = '';
    [
      { name: 'Poseidon Sovereign', yield: '+45% $DMD Yield', cost: '1,500 🐚', img: 'assets/collections/01_Poseidon_Mythic_Gods/01_01_poseidon.png' },
      { name: 'Aura of the Abyss', yield: '+38% $DMD Yield', cost: '1,200 🐚', img: 'assets/collections/02_Abyss_Deep_Ocean/02_01_angler.png' }
    ].forEach(god => {
      const row = document.createElement('div');
      row.className = 'task-card-row';
      row.innerHTML = `
        <div class="task-left-meta">
          <img src="${god.img}" class="task-icon-img" alt="${god.name}" onerror="this.onerror=null; this.src=\'data:image/svg+xml;utf8,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' width=\\\'32\\\' height=\\\'32\\\' viewBox=\\\'0 0 32 32\\\'><text y=\\\'24\\\' font-size=\\\'22\\\'>🔱</text></svg>\';">
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

  // --- QUESTS LIST ---
  function renderQuestsList() {
    if (!el.questsContainer) return;
    el.questsContainer.innerHTML = '';
    [
      { title: 'Join Official Telegram Channel', reward: '+500 Blue Pearls', amount: 500, icon: 'assets/ui/icon_task_telegram.png' },
      { title: 'Follow Dolphin Pearls on X / Twitter', reward: '+300 Blue Pearls', amount: 300, icon: 'assets/ui/icon_task_x_twitter.png' },
      { title: 'Feed your Active Dolphin 20 Times', reward: '+150 Blue Pearls', amount: 150, icon: 'assets/ui/icon_task_feeding.png' }
    ].forEach(q => {
      const div = document.createElement('div');
      div.className = 'task-card-row';
      div.innerHTML = `
        <div class="task-left-meta">
          <img src="${q.icon}" class="task-icon-img" alt="${q.title}" onerror="this.onerror=null; this.src=\'data:image/svg+xml;utf8,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' width=\\\'32\\\' height=\\\'32\\\' viewBox=\\\'0 0 32 32\\\'><text y=\\\'24\\\' font-size=\\\'22\\\'>🎁</text></svg>\';">
          <div>
            <div class="task-title">${q.title}</div>
            <div class="task-reward">${q.reward}</div>
          </div>
        </div>
        <button class="btn-claim-pill" onclick="this.disabled=true; this.textContent='CLAIMED'; AudioEngine.playHatch();">CLAIM</button>
      `;
      el.questsContainer.appendChild(div);
    });
  }

  // --- GLOBAL WINDOW HANDLERS ---
  window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-view').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-game-tab').forEach(b => b.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');

    const targetBtn = document.querySelector(`.nav-game-tab[data-tab="${tabId}"]`);
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
  window.openDailyStreakModal = function() { window.openModal('modal-daily-streak'); };
  window.openBoostersModal = function() { window.openModal('modal-boosters'); };
  window.openPassModal = function() { window.openModal('modal-pass'); };
  window.openStakingModal = function() { window.openModal('modal-staking'); };
  window.openHeartsLadderModal = function() { window.openModal('modal-hearts-ladder'); };
  window.openTideWheelModal = function() { window.openModal('modal-tide-wheel'); };

  window.startBreedingRoutine = function() {
    AudioEngine.playHatch();
    alert('💕 Breeding Incubation Active (5/5)! Generates Love Eggs every 4 hours.');
  };

  window.executeStaking = function() {
    AudioEngine.playHatch();
    window.closeModal('modal-staking');
    alert('💰 Dolphin Staked in Abyss Pool! Earning +35% APY.');
  };

  window.spinTideWheel = function() {
    if (state.currencies.pearlsBalance < 100) {
      alert('Need 100 Blue Pearls to spin!');
      return;
    }
    state.currencies.pearlsBalance -= 100;
    updateHUD();

    const randomAngle = 1440 + Math.floor(Math.random() * 360);
    if (el.tideWheelDisc) {
      el.tideWheelDisc.style.transform = `rotate(${randomAngle}deg)`;
    }

    setTimeout(() => {
      AudioEngine.playHatch();
      state.currencies.pearlsBalance += 500;
      updateHUD();
      alert('🎉 Won 500 Blue Pearls + 2X Booster!');
    }, 3600);
  };

  window.buyPearlsPack = function(amt, price) {
    state.currencies.pearlsBalance += amt;
    updateHUD();
    AudioEngine.playHatch();
    alert(`🎉 Purchased +${formatNum(amt)} Blue Pearls!`);
    window.closeModal('modal-shop-pearls');
  };

  window.buyStarsPack = function(amt, price) {
    state.currencies.starsBalance += amt;
    updateHUD();
    AudioEngine.playHatch();
    alert(`⭐ Purchased +${formatNum(amt)} Blue Stars!`);
    window.closeModal('modal-shop-stars');
  };

  window.claimDailyStreakReward = function() {
    state.currencies.pearlsBalance += 300;
    updateHUD();
    AudioEngine.playHatch();
    alert('🔥 Day 3 Login Reward Claimed (+300 🐚)!');
    window.closeModal('modal-daily-streak');
  };

  window.activateBooster = function(type) {
    AudioEngine.playHatch();
    alert(`🚀 ${type} Speed Surge Active!`);
    window.closeModal('modal-boosters');
  };

  window.claimPassVault = function(tier) {
    alert(`💎 Subscribed to ${tier.toUpperCase()} Dolphin Pass!`);
    window.closeModal('modal-pass');
  };

  window.copyInviteLink = function() {
    navigator.clipboard.writeText('https://t.me/dolphin_pearls_bot?start=ref123');
    alert('Invite link copied!');
  };

  window.joinChampionshipTournament = function() {
    AudioEngine.playTap();
    alert('🏆 Entered Poseidon Grand Prix Championship!');
  };

  // --- INITIALIZATION ---
  function init() {
    updateHUD();
    initSwiperDeck();
    renderShellsBoard();
    renderMarketCards();
    renderGodsList();
    renderQuestsList();

    // 1-Second Ticker Loop for Reset Timers
    setInterval(() => {
      const feedRemaining = state.feedResetEndTime - Date.now();
      if (el.feedResetTimer) el.feedResetTimer.textContent = formatTime(feedRemaining);

      const marketRemaining = state.marketCycleEndTime - Date.now();
      if (el.marketCycleTimer) el.marketCycleTimer.textContent = formatTime(marketRemaining);
    }, 1000);
  }

  window.addEventListener('DOMContentLoaded', init);
})();
