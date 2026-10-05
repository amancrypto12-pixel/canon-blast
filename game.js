// --- DOLPHIN PEARLS PRODUCTION MASTER GAME ENGINE ---

// 1. SINGLE-SOURCE-OF-TRUTH STATE STORE
window.GameStore = {
  state: {
    dlp: 183.21,
    fish: 92039,
    stars: 45,
    hearts: 14,
    shells: 65,
    energy: 0,
    maxEnergy: 2000,
    activeSlot: 0,
    slots: [
      { id: 0, level: 5, rarity: 'Uncommon', feedCost: 150, feedProgress: 5, feedMax: 5, state: 'active', skin: 'assets/dolphin_hero_stage.png', breedCount: 5, maxBreeds: 5, isStaked: false },
      { id: 1, level: 2, rarity: 'Uncommon', feedCost: 110, feedProgress: 2, feedMax: 5, state: 'active', skin: 'assets/events/skin_sailor_squad_1.png', breedCount: 5, maxBreeds: 5, isStaked: false },
      { id: 2, level: 3, rarity: 'Rare', feedCost: 200, feedProgress: 4, feedMax: 5, state: 'active', skin: 'assets/events/skin_cyber_currents_1.png', breedCount: 5, maxBreeds: 5, isStaked: false },
      { id: 3, level: 1, rarity: 'Common', feedCost: 75, feedProgress: 1, feedMax: 5, state: 'active', skin: 'assets/dolphin_hero_stage.png', breedCount: 5, maxBreeds: 5, isStaked: false },
      { id: 4, level: 0, rarity: 'Common', feedCost: 75, feedProgress: 0, feedMax: 5, state: 'locked', skin: 'assets/dolphin_hero_stage.png', breedCount: 0, maxBreeds: 5, isStaked: false },
      { id: 5, level: 0, rarity: 'Common', feedCost: 75, feedProgress: 0, feedMax: 5, state: 'locked', skin: 'assets/dolphin_hero_stage.png', breedCount: 0, maxBreeds: 5, isStaked: false },
      { id: 6, level: 0, rarity: 'Common', feedCost: 75, feedProgress: 0, feedMax: 5, state: 'locked', skin: 'assets/dolphin_hero_stage.png', breedCount: 0, maxBreeds: 5, isStaked: false }
    ],
    grid: [
      { id: 'p1', tier: 1, type: 'pearl' },
      { id: 'p2', tier: 1, type: 'pearl' },
      { id: 'p3', tier: 2, type: 'pearl' },
      { id: 'p4', tier: 2, type: 'pearl' },
      { id: 'p5', tier: 3, type: 'pearl' },
      { id: 'h1', tier: 1, type: 'heart' },
      ...Array(43).fill(null)
    ],
    selectedCell: null,
    crackingEggIdx: null,
    combo: 0
  },

  listeners: [],
  subscribe(fn) {
    this.listeners.push(fn);
  },
  notify() {
    this.listeners.forEach(fn => fn(this.state));
  },
  update(patch) {
    Object.assign(this.state, patch);
    this.notify();
  },
  getActiveSlot() {
    return this.state.slots[this.state.activeSlot];
  }
};

// 2. AUDIO & HAPTIC SYSTEM
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
  play(type, customParam = 0) {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'tap') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.06);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'merge') {
        const noteIdx = Math.min(customParam, this.scale.length - 1);
        const freq = this.scale[noteIdx];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.12);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'crack') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'fanfare') {
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.connect(g);
          g.connect(this.ctx.destination);
          o.frequency.setValueAtTime(f, now + i * 0.08);
          g.gain.setValueAtTime(0.25, now + i * 0.08);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.25);
          o.start(now + i * 0.08);
          o.stop(now + i * 0.08 + 0.25);
        });
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }
}
const audio = new SoundEngine();

window.haptic = function(type = 'light') {
  if (window.Telegram?.WebApp?.HapticFeedback) {
    const h = window.Telegram.WebApp.HapticFeedback;
    if (type === 'light') h.impactOccurred('light');
    else if (type === 'medium') h.impactOccurred('medium');
    else if (type === 'heavy') h.impactOccurred('heavy');
    else if (type === 'success') h.notificationOccurred('success');
    else if (type === 'error') h.notificationOccurred('error');
  }
};

window.showToast = function(text, icon = '✨') {
  const t = document.getElementById('gameToast');
  const ic = document.getElementById('gameToastIcon');
  const msg = document.getElementById('gameToastMsg');
  if (!t || !msg) return;
  if (ic) ic.innerText = icon;
  msg.innerText = text;
  t.classList.add('show');
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    t.classList.remove('show');
  }, 2200);
};

// 3. NAVIGATION (5 TABS)
window.switchTab = function(tabId) {
  haptic('medium');
  audio.play('tap');

  const tabs = ['dolphins', 'eggs', 'market', 'gods', 'tasks'];
  tabs.forEach(t => {
    const sec = document.getElementById(`tab-${t}`);
    const nav = document.getElementById(`navTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (sec) sec.classList.toggle('active', t === tabId);
    if (nav) nav.classList.toggle('active', t === tabId);
  });

  if (tabId === 'eggs') {
    renderMergeGrid();
  } else if (tabId === 'market') {
    initMarketChart();
  }
};

// 4. LOBBY & DECK SLOTS
window.switchSlot = function(slotIdx) {
  const s = GameStore.state;
  if (slotIdx >= s.slots.length) return;
  haptic('light');
  audio.play('tap');
  GameStore.update({ activeSlot: slotIdx });
  renderActiveDolphin();
  renderSlotsTracker();
};

function renderSlotsTracker() {
  const container = document.getElementById('deckSlotDots');
  if (!container) return;
  const s = GameStore.state;
  
  let html = '';
  s.slots.forEach((slot, i) => {
    if (slot.state === 'active') {
      if (i === s.activeSlot) {
        html += `<div class="slot-item active" onclick="switchSlot(${i})"></div>`;
      } else {
        html += `<div class="slot-item owned" onclick="switchSlot(${i})"></div>`;
      }
    } else {
      html += `<div class="slot-item locked" onclick="switchSlot(${i})">🔒</div>`;
    }
  });
  html += `<div class="slot-item add-plus" onclick="document.getElementById('modalSlotUnlock').classList.add('active'); haptic('medium');">➕</div>`;
  container.innerHTML = html;
}

function renderActiveDolphin() {
  const slot = GameStore.getActiveSlot();
  const card = document.getElementById('heroStageCard');
  if (!card || !slot) return;

  if (slot.state === 'locked') {
    card.className = 'hero-stage-card dotted-locked';
    card.innerHTML = `
      <div style="font-size:32px; margin-bottom:4px;">🔒</div>
      <div style="font-family:'Fredoka',sans-serif; font-weight:900; font-size:14px; color:#fff; margin-bottom:4px;">BUY A SLOT FOR A NEW DOLPHIN</div>
      <div style="font-size:10px; color:var(--text-muted); margin-bottom:12px;">Expand deck capacity to keep more dolphins active!</div>
      <button class="modal-action-btn btn-crack" onclick="buySlotWithStars()" style="width:auto; padding:8px 16px;">
        GET A NEW SLOT <img class="inline-star-icon" src="assets/icon_user_star.png" /> 120
      </button>
    `;
    return;
  }

  card.className = 'hero-stage-card';
  card.style.borderColor = slot.rarity === 'Rare' ? 'var(--rarity-rare)' : (slot.rarity === 'Epic' ? 'var(--rarity-epic)' : 'var(--rarity-uncommon)');
  card.innerHTML = `
    <div class="card-pills-row">
      <div class="card-pill">LVL ${slot.level}</div>
      <div class="card-pill rarity-${slot.rarity.toLowerCase()}">~${slot.rarity.toUpperCase()}</div>
    </div>
    <div class="card-center-stage">
      <img id="dolphinMascot" class="mascot-sprite" src="${slot.skin}" alt="Dolphin" onclick="handleFeedTap(event)" />
    </div>
    <button class="feed-btn" id="feedActionBtn" onclick="handleFeedTap(event)">
      <div class="feed-btn-content">
        <span class="feed-btn-text">TAP TO FEED</span>
        <div class="feed-btn-cost">
          <span>${slot.feedCost}</span>
          <img src="assets/icon_user_fish.png" style="width:14px; height:14px; object-fit:contain;" />
        </div>
      </div>
      <span class="feed-btn-timer">RESET IN 6:43:10</span>
    </button>
  `;

  // Update Progression widget
  const lvlBadge = document.getElementById('dmdLvlBadge');
  const xpFill = document.getElementById('dmdXpFill');
  const breedPill = document.getElementById('dmdBreedPill');
  const stakeBtn = document.getElementById('dmdStakeBtn');

  if (lvlBadge) lvlBadge.innerText = slot.level;
  if (xpFill) xpFill.style.width = `${(slot.feedProgress / slot.feedMax) * 100}%`;
  if (breedPill) breedPill.innerHTML = `<span>BREED ${slot.breedCount}/${slot.maxBreeds}</span>`;
  if (stakeBtn) {
    stakeBtn.innerHTML = slot.isStaked ? `<span>⚡ STAKED (+1.85 DLP/hr)</span>` : `<span>👑 STAKE</span>`;
  }
}

// 5. TAP FEEDING MECHANISM
window.handleFeedTap = function(e) {
  if (e) e.preventDefault();
  const s = GameStore.state;
  const slot = GameStore.getActiveSlot();
  if (!slot || slot.state === 'locked') return;

  if (s.fish < slot.feedCost) {
    haptic('error');
    showToast('Not enough Fish! Merge eggs or complete tasks.', '⚠️');
    return;
  }

  // Deduct fish, add DLP yield
  const dlpYield = 0.02 * slot.level;
  let newProgress = slot.feedProgress + 1;
  let newLevel = slot.level;
  let leveledUp = false;

  if (newProgress >= slot.feedMax && slot.level < 5) {
    newProgress = 0;
    newLevel += 1;
    leveledUp = true;
  }

  slot.feedProgress = newProgress;
  slot.level = newLevel;

  GameStore.update({
    fish: s.fish - slot.feedCost,
    dlp: +(s.dlp + dlpYield).toFixed(2)
  });

  haptic('medium');
  audio.play('tap');
  audio.play('coin');

  // Gulp animation on mascot
  const mascot = document.getElementById('dolphinMascot');
  if (mascot) {
    mascot.classList.add('eating');
    setTimeout(() => mascot.classList.remove('eating'), 180);
  }

  // Floating text
  const rect = (e && e.target) ? e.target.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
  spawnTapParticle(rect.left + 30, rect.top - 10, `+${dlpYield.toFixed(2)} DLP`, '#00D4FF');
  spawnTapParticle(rect.left - 20, rect.top + 10, `-${slot.feedCost} 🐟`, '#FF4D8D');

  if (leveledUp) {
    audio.play('fanfare');
    haptic('heavy');
    showToast(`Dolphin upgraded to Level ${newLevel}! 🎉`, '✨');
  }

  renderActiveDolphin();
};

function spawnTapParticle(x, y, text, color) {
  const p = document.createElement('div');
  p.className = 'tap-particle';
  p.innerText = text;
  p.style.color = color;
  p.style.left = `${x}px`;
  p.style.top = `${y}px`;
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 750);
}

// 6. 7x7 TOUCH MERGE-2 BOARD SYSTEM
function renderMergeGrid() {
  const gridEl = document.getElementById('mergeGrid');
  if (!gridEl) return;
  const s = GameStore.state;
  gridEl.innerHTML = '';

  const lockedCorners = [0, 6, 42, 48];

  s.grid.forEach((item, idx) => {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.dataset.index = idx;

    if (lockedCorners.includes(idx)) {
      cell.classList.add('locked');
      cell.innerHTML = '<span style="font-size:8px; color:#444;">🔒</span>';
    } else if (item) {
      const imgPath = item.type === 'heart' ? `assets/heart_egg_t${item.tier}.png` : `assets/pearl_t${item.tier}.png`;
      cell.innerHTML = `
        <img class="pearl-item" src="${imgPath}" alt="Egg T${item.tier}" />
        <span class="pearl-lvl-tag">T${item.tier}</span>
      `;
    }

    if (s.selectedCell === idx) {
      cell.classList.add('selected');
    }

    cell.addEventListener('click', () => handleCellClick(idx));
    gridEl.appendChild(cell);
  });
}

function handleCellClick(idx) {
  const lockedCorners = [0, 6, 42, 48];
  if (lockedCorners.includes(idx)) return;

  const s = GameStore.state;
  const item = s.grid[idx];

  if (s.selectedCell === null) {
    if (item) {
      s.selectedCell = idx;
      haptic('light');
      audio.play('tap');
      renderMergeGrid();
    }
  } else {
    const fromIdx = s.selectedCell;
    s.selectedCell = null;

    if (fromIdx === idx) {
      if (item) {
        openCrackModal(item, idx);
      }
      renderMergeGrid();
      return;
    }

    const sourceItem = s.grid[fromIdx];
    const targetItem = s.grid[idx];

    if (!targetItem) {
      // Move item
      s.grid[idx] = sourceItem;
      s.grid[fromIdx] = null;
      haptic('light');
      audio.play('tap');
    } else if (sourceItem.type === targetItem.type && sourceItem.tier === targetItem.tier && sourceItem.tier < 12) {
      // Merge items!
      s.combo = (s.combo || 0) + 1;
      s.grid[idx] = {
        id: 'egg_' + Date.now(),
        type: sourceItem.type,
        tier: sourceItem.tier + 1
      };
      s.grid[fromIdx] = null;
      haptic('heavy');
      audio.play('merge', s.combo);
      showToast(`Merged to Tier ${sourceItem.tier + 1} Egg! ✨`, '🔮');
    } else {
      // Swap items
      s.grid[idx] = sourceItem;
      s.grid[fromIdx] = targetItem;
      haptic('light');
    }

    renderMergeGrid();
  }
}

window.spawnPearlToBoard = function(tier = 1) {
  const s = GameStore.state;
  if (s.fish < 200) {
    haptic('error');
    showToast('Need 200 Fish to buy Egg!', '⚠️');
    return;
  }

  const lockedCorners = [0, 6, 42, 48];
  const emptyIndices = s.grid.map((item, i) => (item === null && !lockedCorners.includes(i)) ? i : null).filter(i => i !== null);
  
  if (emptyIndices.length === 0) {
    haptic('error');
    showToast('Board is full! Merge eggs to free space.', '⚠️');
    return;
  }

  const targetIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  s.grid[targetIdx] = { id: 'p_' + Date.now(), tier, type: 'pearl' };
  GameStore.update({ fish: s.fish - 200 });

  haptic('medium');
  audio.play('tap');
  showToast('Egg spawned on Reef Board! 🥚', '✨');
  renderMergeGrid();
};

window.autoMergeBoard = function() {
  const s = GameStore.state;
  let mergedAny = false;
  const lockedCorners = [0, 6, 42, 48];

  for (let i = 0; i < s.grid.length; i++) {
    if (!s.grid[i] || lockedCorners.includes(i)) continue;
    for (let j = i + 1; j < s.grid.length; j++) {
      if (!s.grid[j] || lockedCorners.includes(j)) continue;
      if (s.grid[i].type === s.grid[j].type && s.grid[i].tier === s.grid[j].tier && s.grid[i].tier < 12) {
        s.grid[i] = { id: 'm_' + Date.now(), type: s.grid[i].type, tier: s.grid[i].tier + 1 };
        s.grid[j] = null;
        mergedAny = true;
        break;
      }
    }
  }

  if (mergedAny) {
    haptic('heavy');
    audio.play('merge', 2);
    showToast('Auto-merged all matching pairs! ⚡', '🎉');
  } else {
    showToast('No matching pairs found to merge.', 'ℹ️');
  }
  renderMergeGrid();
};

function openCrackModal(egg, idx) {
  GameStore.state.crackingEggIdx = idx;
  const modal = document.getElementById('modalCrackEgg');
  const img = document.getElementById('crackEggImg');
  const title = document.getElementById('crackEggTitle');

  if (img) img.src = egg.type === 'heart' ? `assets/heart_egg_t${egg.tier}.png` : `assets/pearl_t${egg.tier}.png`;
  if (title) title.innerText = `CRACK TIER ${egg.tier} ${egg.type.toUpperCase()} EGG`;
  if (modal) modal.classList.add('active');
}

window.doCrackCurrentEgg = function() {
  const s = GameStore.state;
  if (s.crackingEggIdx === null) return;

  const egg = s.grid[s.crackingEggIdx];
  if (!egg) return;

  s.grid[s.crackingEggIdx] = null;
  s.crackingEggIdx = null;

  const rewardFish = egg.tier * 2500;
  GameStore.update({
    fish: s.fish + rewardFish,
    hearts: s.hearts + egg.tier
  });

  audio.play('crack');
  audio.play('fanfare');
  haptic('heavy');
  showToast(`Hatched! Earned +${rewardFish.toLocaleString()} 🐟 & +${egg.tier} ❤️`, '💥');

  closeAllModals();
  renderMergeGrid();
};

window.spinTideWheel = function() {
  haptic('heavy');
  audio.play('fanfare');
  const s = GameStore.state;
  GameStore.update({ fish: s.fish + 15000, stars: s.stars + 5 });
  showToast('Tide Wheel: Won +15,000 Fish & 5 Blue Stars! 🎡', '🎁');
};

// 7. BREEDING & STAKING FLOWS
window.openBreedingModal = function() {
  const slot = GameStore.getActiveSlot();
  if (!slot || slot.state === 'locked') return;

  if (slot.breedCount <= 0) {
    showToast('This dolphin has reached max breeding capacity (5/5)!', '⚠️');
    return;
  }

  haptic('medium');
  audio.play('fanfare');
  slot.breedCount -= 1;
  const s = GameStore.state;
  GameStore.update({
    hearts: s.hearts + 5,
    fish: s.fish + 5000
  });

  // Spawn Love Heart Egg on Board
  const lockedCorners = [0, 6, 42, 48];
  const emptyIdx = s.grid.findIndex((item, i) => item === null && !lockedCorners.includes(i));
  if (emptyIdx !== -1) {
    s.grid[emptyIdx] = { id: 'h_' + Date.now(), tier: 1, type: 'heart' };
  }

  showToast('Breeding Successful! Love Egg dropped on Reef Board! ❤️', '🎉');
  renderActiveDolphin();
  renderMergeGrid();
};

window.toggleStaking = function() {
  const slot = GameStore.getActiveSlot();
  if (!slot || slot.state === 'locked') return;

  slot.isStaked = !slot.isStaked;
  haptic('heavy');
  audio.play('coin');

  if (slot.isStaked) {
    showToast('Dolphin Staked! Earning +1.85 DLP/hr 24/7 passive yield 👑', '✨');
  } else {
    showToast('Dolphin Unstaked! Returned to active tapping deck.', 'ℹ️');
  }
  renderActiveDolphin();
};

// 8. MODAL ACTIONS & TELEGRAM STARS CHECKOUT
window.buySlotWithStars = function() {
  const s = GameStore.state;
  if (s.stars < 120) {
    haptic('error');
    showToast('Need 120 Blue Stars to unlock new Slot!', '⚠️');
    return;
  }

  const lockedSlot = s.slots.find(slot => slot.state === 'locked');
  if (!lockedSlot) {
    showToast('All 11 slots already unlocked!', 'ℹ️');
    closeAllModals();
    return;
  }

  lockedSlot.state = 'active';
  lockedSlot.level = 1;
  lockedSlot.rarity = 'Common';
  lockedSlot.feedCost = 75;
  lockedSlot.feedProgress = 0;

  GameStore.update({ stars: s.stars - 120 });
  haptic('heavy');
  audio.play('fanfare');
  showToast('New Dolphin Slot Unlocked! 🎉', '🐬');

  closeAllModals();
  renderActiveDolphin();
  renderSlotsTracker();
};

window.buyStarsItem = function(name, cost) {
  const s = GameStore.state;
  if (s.stars < cost) {
    haptic('error');
    showToast(`Need ${cost} Blue Stars for ${name}!`, '⚠️');
    return;
  }

  GameStore.update({ stars: s.stars - cost });
  haptic('heavy');
  audio.play('fanfare');
  showToast(`Purchased ${name}! Active now. ✨`, '👑');
  closeAllModals();
};

window.refillEnergyTank = function() {
  const s = GameStore.state;
  if (s.fish < 500) {
    haptic('error');
    showToast('Need 500 Fish to refill energy tank!', '⚠️');
    return;
  }

  GameStore.update({
    fish: s.fish - 500,
    energy: s.maxEnergy
  });

  const sideVal = document.getElementById('energySideVal');
  if (sideVal) sideVal.innerHTML = `2 000<br>/ 2 000`;

  haptic('medium');
  audio.play('coin');
  showToast('Energy Tank fully refilled! (2 000 / 2 000) ⚡', '🔋');
  closeAllModals();
};

window.claimDailyBonus = function() {
  const s = GameStore.state;
  GameStore.update({
    fish: s.fish + 25000,
    stars: s.stars + 10
  });
  haptic('heavy');
  audio.play('fanfare');
  showToast('Claimed Daily Streak: +25,000 Fish & 10 Blue Stars! 🎁', '🎉');
  closeAllModals();
};

window.shareReferralLink = function() {
  haptic('medium');
  const text = encodeURIComponent('Join Dolphin Pearls! Tap, Breed, and Mine DLP tokens with me! 🐬');
  const shareUrl = `https://t.me/share/url?url=https://t.me/DolphinPearlsBot/play&text=${text}`;
  if (window.Telegram?.WebApp?.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, '_blank');
  }
};

window.toggleWallet = function() {
  haptic('light');
  showToast('TON Wallet Connect: Connected to Shovel Mainnet', '👛');
};

window.closeAllModals = function() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
};

// 9. PIXI.JS BACKGROUND ORBS
function initPixiEngine() {
  const container = document.getElementById('pixi-canvas-container');
  if (!container || typeof PIXI === 'undefined') return;

  try {
    const app = new PIXI.Application({
      resizeTo: container,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });
    container.appendChild(app.view);

    const particles = new PIXI.ParticleContainer(40, {
      scale: true,
      position: true,
      alpha: true
    });
    app.stage.addChild(particles);

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x00D4FF, 0.4);
    graphics.drawCircle(0, 0, 6);
    graphics.endFill();
    const texture = app.renderer.generateTexture(graphics);

    const sprites = [];
    for (let i = 0; i < 25; i++) {
      const sp = new PIXI.Sprite(texture);
      sp.x = Math.random() * app.screen.width;
      sp.y = Math.random() * app.screen.height;
      sp.scale.set(Math.random() * 0.8 + 0.4);
      sp.alpha = Math.random() * 0.5 + 0.2;
      sp.vy = -(Math.random() * 0.4 + 0.2);
      particles.addChild(sp);
      sprites.push(sp);
    }

    app.ticker.add(() => {
      for (const sp of sprites) {
        sp.y += sp.vy;
        if (sp.y < -10) {
          sp.y = app.screen.height + 10;
          sp.x = Math.random() * app.screen.width;
        }
      }
    });
  } catch (e) {
    console.warn('Pixi init:', e);
  }
}

// 10. MARKET CHART CANVAS
function initMarketChart() {
  const canvas = document.getElementById('marketChartCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth || 300;
  canvas.height = canvas.parentElement.clientHeight || 80;

  const points = [20, 25, 22, 35, 30, 48, 42, 60, 55, 68, 62, 75];
  const step = canvas.width / (points.length - 1);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, 'rgba(0, 212, 255, 0.35)');
  grad.addColorStop(1, 'rgba(0, 212, 255, 0)');

  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  points.forEach((p, i) => {
    const y = canvas.height - (p / 80) * canvas.height;
    ctx.lineTo(i * step, y);
  });
  ctx.lineTo(canvas.width, canvas.height);
  ctx.fillStyle = grad;
  ctx.fill();

  // Draw line
  ctx.beginPath();
  points.forEach((p, i) => {
    const y = canvas.height - (p / 80) * canvas.height;
    if (i === 0) ctx.moveTo(0, y);
    else ctx.lineTo(i * step, y);
  });
  ctx.strokeStyle = '#00D4FF';
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

// 11. INITIALIZATION ON DOM READY
document.addEventListener('DOMContentLoaded', () => {
  // Telegram User Photo & Name Binding
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    const user = window.Telegram.WebApp.initDataUnsafe?.user;
    if (user) {
      const uDisp = document.getElementById('usernameDisplay');
      if (uDisp) uDisp.innerText = user.username ? `@${user.username}` : (user.first_name || '@Wild_airdrop');
      if (user.photo_url) {
        const aImg = document.getElementById('userAvatarImg');
        const aFall = document.getElementById('userAvatarFallback');
        if (aImg) {
          aImg.src = user.photo_url;
          aImg.style.display = 'block';
          if (aFall) aFall.style.display = 'none';
        }
      }
    }
  }

  // Subscribe UI to State Changes
  GameStore.subscribe((s) => {
    const fishEl = document.getElementById('top-fish');
    const starsEl = document.getElementById('top-stars');
    const dlpEl = document.getElementById('tokenBalance');
    if (fishEl) fishEl.innerText = s.fish.toLocaleString();
    if (starsEl) starsEl.innerText = s.stars.toLocaleString();
    if (dlpEl) dlpEl.innerText = s.dlp.toFixed(2);
  });

  // Initial Renders
  renderActiveDolphin();
  renderSlotsTracker();
  renderMergeGrid();
  initPixiEngine();
});
