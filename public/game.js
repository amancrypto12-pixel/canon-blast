// --- DOLPHIN MY DOLPHIN - MASTER PRODUCTION ENGINE (PROMPT 3 & 4 PARITY) ---

window.GameState = {
  // Currencies
  pearlsBalance: 92039,
  starsBalance: 45,
  dlpBalance: 183.21,

  // Clicker State (Prompt 3 & 4)
  dolphinLevel: 5,
  dolphinRarity: 'LEGENDARY',
  levelProgress: 40, // 40% towards next level
  maxLevelProgress: 100,
  feedCost: 10,
  
  // Breeding State (Prompt 4)
  isBreeding: false,
  breedEndTime: null, // Timestamp in ms (24 hours)
  
  // Staking State
  isStaked: false,

  // Merge Grid (42 Cells: 7 Rows x 6 Columns)
  gridArray: Array(42).fill(null),
  selectedCell: null,

  // Current Tab
  currentTab: 'dolphins'
};

// Initial starter shells
(function initStarterGrid() {
  const s = window.GameState;
  s.gridArray[0] = { id: 's1', level: 1, type: 'shell', name: 'Nautilus Shell' };
  s.gridArray[1] = { id: 's2', level: 1, type: 'shell', name: 'Nautilus Shell' };
  s.gridArray[2] = { id: 's3', level: 2, type: 'shell', name: 'Coral Shell' };
  s.gridArray[3] = { id: 's4', level: 2, type: 'shell', name: 'Coral Shell' };
  s.gridArray[4] = { id: 's5', level: 3, type: 'shell', name: 'Abyssal Shell' };
  s.gridArray[5] = { id: 'p1', level: 1, type: 'pearl', name: 'Blue Pearl' };
  s.gridArray[6] = { id: 'p2', level: 1, type: 'pearl', name: 'Blue Pearl' };
})();

// Audio Synthesizer
class SoundFX {
  constructor() {
    this.ctx = null;
    this.scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
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
  play(type, lvl = 1) {
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
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'merge') {
        const noteIdx = Math.min(lvl, this.scale.length - 1);
        const f = this.scale[noteIdx];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.16);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.06);
        gain.gain.setValueAtTime(0.25, now);
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
    } catch (e) {}
  }
}
const sfx = new SoundFX();

// 1. NAVIGATION TABS (Market, Shells, Dolphins, Gods, Tasks)
window.switchTab = function(tabName) {
  sfx.play('tap');
  GameState.currentTab = tabName;

  const tabs = ['market', 'shells', 'dolphins', 'gods', 'tasks'];
  tabs.forEach(t => {
    const pane = document.getElementById(`tabPane-${t}`);
    const btn = document.getElementById(`navBtn-${t}`);
    if (pane) pane.classList.toggle('active', t === tabName);
    if (btn) btn.classList.toggle('active', t === tabName);
  });

  if (tabName === 'shells') {
    renderMergeGrid();
  }
};

// 2. PROMPT 3: CLICKER LOGIC (TAP TO FEED & EXACT COORDINATE FLOATING TEXT)
window.handleDolphinTap = function(event) {
  const s = GameState;

  // Prompt 4 Rule: Disable tap-to-feed while breeding is active
  if (s.isBreeding) {
    showToast('Breeding in progress! Tap disabled until breeding completes.', '⏳');
    return;
  }

  if (s.pearlsBalance < s.feedCost) {
    showToast('Not enough Blue Pearls! Merge shells or complete tasks.', '⚠️');
    return;
  }

  // Deduct 10 Pearls
  s.pearlsBalance -= s.feedCost;
  s.dlpBalance = +(s.dlpBalance + 0.02).toFixed(2);
  
  // Increase Level progress (+10% per tap)
  s.levelProgress += 10;
  let leveledUp = false;

  if (s.levelProgress >= s.maxLevelProgress) {
    s.levelProgress = 0;
    s.dolphinLevel += 1;
    leveledUp = true;
  }

  sfx.play('tap');
  sfx.play('coin');

  // Exact Tap Coordinates Floating Animation (+10)
  let tapX, tapY;
  if (event && event.clientX && event.clientY) {
    tapX = event.clientX;
    tapY = event.clientY;
  } else if (event && event.touches && event.touches[0]) {
    tapX = event.touches[0].clientX;
    tapY = event.touches[0].clientY;
  } else {
    const target = (event && (event.currentTarget || event.target)) || document.getElementById('dolphinMainImg');
    const rect = target ? target.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    tapX = rect.left + rect.width / 2;
    tapY = rect.top + rect.height / 2;
  }

  spawnFloatingText(tapX, tapY, '+10 🔵');

  // Mascot Squash & Stretch reaction
  const mascot = document.getElementById('dolphinMainImg');
  if (mascot) {
    mascot.style.transform = 'scale(1.15, 0.85)';
    setTimeout(() => {
      mascot.style.transform = '';
    }, 120);
  }

  if (leveledUp) {
    sfx.play('fanfare');
    showToast(`Dolphin reached Level ${s.dolphinLevel}! 🎉`, '✨');
  }

  updateUI();
};

function spawnFloatingText(x, y, text) {
  const el = document.createElement('div');
  el.className = 'floating-text';
  el.innerText = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 650);
}

// 3. PROMPT 4: TIMER & BREEDING LOGIC (24-HOUR COUNTDOWN & OVERLAY)
window.startBreeding = function() {
  const s = GameState;
  if (s.isBreeding) {
    showToast('Breeding already in progress!', 'ℹ️');
    return;
  }

  s.isBreeding = true;
  s.breedEndTime = Date.now() + 24 * 3600 * 1000; // 24 Hours exact

  sfx.play('coin');
  showToast('Breeding started! 24h countdown initiated. ❤️', '🎉');
  updateUI();
};

window.formatCountdown = function(msRemaining) {
  if (msRemaining <= 0) return '00:00:00';
  const totalSec = Math.floor(msRemaining / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const hh = hours < 10 ? '0' + hours : hours;
  const mm = mins < 10 ? '0' + mins : mins;
  const secsStr = secs < 10 ? '0' + secs : secs;
  return `${hh}:${mm}:${secsStr}`;
};

window.toggleStaking = function() {
  const s = GameState;
  s.isStaked = !s.isStaked;
  sfx.play('coin');
  showToast(s.isStaked ? 'Dolphin Staked! Earning passive DLP yield 👑' : 'Dolphin Unstaked.', '👑');
  updateUI();
};

// 4. MERGE GRID COMPONENT (7 Rows x 6 Columns = 42 Slots)
function renderMergeGrid() {
  const gridEl = document.getElementById('mergeGridWrapper');
  if (!gridEl) return;
  const s = GameState;
  gridEl.innerHTML = '';

  s.gridArray.forEach((item, idx) => {
    const cell = document.createElement('div');
    cell.className = 'grid-cell-item';
    cell.dataset.index = idx;

    if (item) {
      const assetUrl = item.type === 'pearl' ? `assets/pearl_t${Math.min(item.level, 12)}.png` : `assets/heart_egg_t${Math.min(item.level, 12)}.png`;
      cell.innerHTML = `
        <img class="shell-sprite" src="${assetUrl}" alt="${item.name}" />
        <span class="shell-level-badge">L${item.level}</span>
      `;
    }

    if (s.selectedCell === idx) {
      cell.classList.add('selected');
    }

    cell.addEventListener('click', () => handleGridCellClick(idx));
    gridEl.appendChild(cell);
  });

  const countEl = document.getElementById('shellsCountBadge');
  if (countEl) {
    const occupied = s.gridArray.filter(x => x !== null).length;
    countEl.innerText = `${occupied} / 42 Slots`;
  }
}

function handleGridCellClick(idx) {
  const s = GameState;
  const clickedItem = s.gridArray[idx];

  if (s.selectedCell === null) {
    if (clickedItem) {
      s.selectedCell = idx;
      sfx.play('tap');
      renderMergeGrid();
    }
  } else {
    const fromIdx = s.selectedCell;
    s.selectedCell = null;

    if (fromIdx === idx) {
      renderMergeGrid();
      return;
    }

    const source = s.gridArray[fromIdx];
    const target = s.gridArray[idx];

    if (!target) {
      // Move to empty slot
      s.gridArray[idx] = source;
      s.gridArray[fromIdx] = null;
      sfx.play('tap');
    } else if (source.level === target.level && source.level < 12) {
      // Merge: if (source.level === target.level) -> level + 1
      console.log(`Merged to Level ${source.level + 1}`);
      s.gridArray[idx] = {
        id: 'shell_' + Date.now(),
        type: source.type,
        level: source.level + 1,
        name: `Tier ${source.level + 1} Ocean Shell`
      };
      s.gridArray[fromIdx] = null;
      sfx.play('merge', source.level);
      showToast(`Merged to Level ${source.level + 1} Sea Shell! ✨`, '🔮');

      setTimeout(() => {
        const targetEl = document.querySelector(`[data-index="${idx}"]`);
        if (targetEl) targetEl.classList.add('merge-glow');
      }, 20);
    } else {
      // Swap items
      s.gridArray[idx] = source;
      s.gridArray[fromIdx] = target;
      sfx.play('tap');
    }

    renderMergeGrid();
  }
}

window.spawnNewShell = function() {
  const s = GameState;
  if (s.pearlsBalance < 200) {
    showToast('Need 200 Blue Pearls to spawn Sea Shell!', '⚠️');
    return;
  }

  const emptyIndices = s.gridArray.map((item, i) => item === null ? i : null).filter(i => i !== null);
  if (emptyIndices.length === 0) {
    showToast('Grid full! Merge shells to free slots.', '⚠️');
    return;
  }

  const targetIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  s.gridArray[targetIdx] = {
    id: 's_' + Date.now(),
    type: Math.random() > 0.5 ? 'shell' : 'pearl',
    level: 1,
    name: 'Nautilus Shell'
  };
  s.pearlsBalance -= 200;

  sfx.play('tap');
  showToast('Spawned Level 1 Sea Shell! 🐚', '✨');
  updateUI();
  renderMergeGrid();
};

window.autoMergeAll = function() {
  const s = GameState;
  let merged = false;

  for (let i = 0; i < s.gridArray.length; i++) {
    if (!s.gridArray[i]) continue;
    for (let j = i + 1; j < s.gridArray.length; j++) {
      if (!s.gridArray[j]) continue;
      if (s.gridArray[i].level === s.gridArray[j].level && s.gridArray[i].level < 12) {
        s.gridArray[i] = {
          id: 'am_' + Date.now(),
          type: s.gridArray[i].type,
          level: s.gridArray[i].level + 1,
          name: `Tier ${s.gridArray[i].level + 1} Shell`
        };
        s.gridArray[j] = null;
        merged = true;
        break;
      }
    }
  }

  if (merged) {
    sfx.play('merge', 3);
    showToast('Auto-merged matching Sea Shells! ⚡', '🎉');
  } else {
    showToast('No matching pairs to merge.', 'ℹ️');
  }
  renderMergeGrid();
};

window.spinTideWheel = function() {
  const s = GameState;
  s.pearlsBalance += 15000;
  s.starsBalance += 5;
  sfx.play('coin');
  showToast('Tide Wheel: Won +15,000 Blue Pearls & 5 Stars! 🎡', '🎁');
  updateUI();
};

// 5. UI REFRESH & TICKER
function updateUI() {
  const s = window.GameState;
  const pEl = document.getElementById('pearlsTopDisplay');
  const stEl = document.getElementById('starsTopDisplay');
  const lvlBadge = document.getElementById('cardLvlBadge');
  const lvlText = document.getElementById('levelProgressText');
  const lvlFill = document.getElementById('levelProgressFill');
  const feedBtn = document.getElementById('feedActionButton');
  const breedOverlay = document.getElementById('breedingOverlay');
  const breedTimerText = document.getElementById('breedingTimerCountdown');
  const breedBtn = document.getElementById('breedingTriggerBtn');

  if (pEl) pEl.innerText = s.pearlsBalance.toLocaleString();
  if (stEl) stEl.innerText = s.starsBalance.toLocaleString();
  if (lvlBadge) lvlBadge.innerText = `LVL ${s.dolphinLevel}`;
  if (lvlText) lvlText.innerText = `Level ${s.dolphinLevel} (${s.levelProgress}%)`;
  if (lvlFill) lvlFill.style.width = `${s.levelProgress}%`;

  // Breeding state updates
  if (s.isBreeding) {
    const msLeft = Math.max(0, s.breedEndTime - Date.now());
    if (breedOverlay) breedOverlay.classList.add('active');
    if (breedTimerText) breedTimerText.innerText = formatCountdown(msLeft);
    if (feedBtn) {
      feedBtn.classList.add('disabled');
      feedBtn.innerText = 'BREEDING IN PROGRESS (TAP LOCKED)';
    }
    if (breedBtn) {
      breedBtn.innerText = `BREEDING (${formatCountdown(msLeft)})`;
    }
  } else {
    if (breedOverlay) breedOverlay.classList.remove('active');
    if (feedBtn) {
      feedBtn.classList.remove('disabled');
      feedBtn.innerText = 'TAP TO FEED (Cost: 10 Pearls)';
    }
    if (breedBtn) {
      breedBtn.innerText = '❤️ START BREEDING';
    }
  }
}

window.showToast = function(msg, icon = '✨') {
  const t = document.getElementById('toastNotification');
  if (!t) return;
  t.innerText = `${icon} ${msg}`;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(window._tHide);
  window._tHide = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(-20px)';
  }, 2200);
};

// 6. LIFECYCLE & COUNTDOWN TICKER
document.addEventListener('DOMContentLoaded', () => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }

  // 1-second ticker for 24h countdown
  setInterval(() => {
    if (GameState.isBreeding) {
      if (Date.now() >= GameState.breedEndTime) {
        GameState.isBreeding = false;
        GameState.breedEndTime = null;
        showToast('Breeding complete! Love Pearl ready. ❤️', '🎉');
      }
      updateUI();
    }
  }, 1000);

  updateUI();
  renderMergeGrid();
});
