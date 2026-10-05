// --- DOLPHIN MY DOLPHIN - MASTER TECHNICAL GAME ENGINE ---

window.GameState = {
  // Currencies
  pearlsBalance: 92039,
  starsBalance: 45,
  dlpBalance: 183.21,

  // Clicker State
  dolphinLevel: 5,
  dolphinRarity: 'LEGENDARY',
  dolphinEnergy: 2000,
  maxEnergy: 2000,
  isBreeding: false,
  breedEndTime: null,
  isStaked: false,

  // Merge Grid: 7 Rows x 6 Columns = 42 Slots
  gridArray: Array(42).fill(null),
  selectedCell: null,
  draggedCell: null,

  // Active Tab
  currentTab: 'dolphins'
};

// Initialize Grid with default starter Sea Shells / Pearls
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

// WebAudio Juice
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
      }
    } catch (e) {}
  }
}
const sfx = new SoundFX();

// 1. NAVIGATION (5 TABS: Market, Shells, Dolphins, Gods, Tasks)
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

// 2. CLICKER CORE LOGIC (Dolphins Tab)
window.handleDolphinTap = function(event) {
  const s = GameState;
  if (s.isBreeding) {
    showToast('Dolphin is currently breeding! Please wait.', '⏳');
    return;
  }

  if (s.dolphinEnergy < 10) {
    showToast('Energy depleted! Refill to keep feeding.', '⚡');
    return;
  }

  // Deplete 10 energy, add 10 pearls
  s.dolphinEnergy -= 10;
  s.pearlsBalance += 10;
  s.dlpBalance = +(s.dlpBalance + 0.01).toFixed(2);

  sfx.play('tap');
  sfx.play('coin');

  // Floating text animation (+10)
  const target = event.currentTarget || event.target;
  const rect = target.getBoundingClientRect();
  const clickX = event.clientX || (rect.left + rect.width / 2);
  const clickY = event.clientY || (rect.top + rect.height / 2);

  spawnFloatingText(clickX, clickY, '+10 🔵');
  updateUI();
};

function spawnFloatingText(x, y, text) {
  const el = document.createElement('div');
  el.className = 'floating-text';
  el.innerText = text;
  el.style.left = `${x - 20}px`;
  el.style.top = `${y - 20}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 650);
}

window.startBreeding = function() {
  const s = GameState;
  if (s.isBreeding) return;

  s.isBreeding = true;
  s.breedEndTime = Date.now() + 60 * 1000; // 1 minute demo countdown

  sfx.play('coin');
  showToast('Breeding ritual initiated! (1m duration)', '❤️');
  updateUI();
};

window.toggleStaking = function() {
  const s = GameState;
  s.isStaked = !s.isStaked;
  sfx.play('coin');
  showToast(s.isStaked ? 'Dolphin Staked! Earning passive DLP 👑' : 'Dolphin Unstaked.', '👑');
  updateUI();
};

// 3. MERGE GRID LOGIC (7 Rows x 6 Columns = 42 Cells)
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

    // Touch / Click Handler
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
      // Move to empty cell
      s.gridArray[idx] = source;
      s.gridArray[fromIdx] = null;
      sfx.play('tap');
    } else if (source.level === target.level && source.level < 12) {
      // MERGE LOGIC (source.level === target.level -> level + 1)
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

      // Add visual glow animation to target
      setTimeout(() => {
        const targetEl = document.querySelector(`[data-index="${idx}"]`);
        if (targetEl) targetEl.classList.add('merge-glow');
      }, 20);
    } else {
      // Swap
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

// 4. UI REFRESH & TICKER
function updateUI() {
  const s = window.GameState;
  const pEl = document.getElementById('pearlsTopDisplay');
  const stEl = document.getElementById('starsTopDisplay');
  const eProg = document.getElementById('energyProgressFill');
  const eText = document.getElementById('energyTextVal');
  const breedBtn = document.getElementById('breedBtnText');
  const stakeBtn = document.getElementById('stakeBtnText');

  if (pEl) pEl.innerText = s.pearlsBalance.toLocaleString();
  if (stEl) stEl.innerText = s.starsBalance.toLocaleString();
  if (eProg) eProg.style.width = `${(s.dolphinEnergy / s.maxEnergy) * 100}%`;
  if (eText) eText.innerText = `${s.dolphinEnergy} / ${s.maxEnergy}`;

  if (breedBtn) {
    if (s.isBreeding) {
      const rem = Math.max(0, Math.floor((s.breedEndTime - Date.now()) / 1000));
      breedBtn.innerText = `BREEDING (${rem}s)`;
    } else {
      breedBtn.innerText = 'BREED (5/5)';
    }
  }

  if (stakeBtn) {
    stakeBtn.innerText = s.isStaked ? '⚡ STAKED' : '👑 START STAKING';
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

// 5. LIFECYCLE
document.addEventListener('DOMContentLoaded', () => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }

  // Energy regeneration (10 energy every 3s)
  setInterval(() => {
    if (GameState.dolphinEnergy < GameState.maxEnergy) {
      GameState.dolphinEnergy = Math.min(GameState.maxEnergy, GameState.dolphinEnergy + 10);
      updateUI();
    }
    if (GameState.isBreeding && Date.now() >= GameState.breedEndTime) {
      GameState.isBreeding = false;
      showToast('Breeding complete! Love Pearl ready. ❤️', '🎉');
      updateUI();
    }
  }, 1000);

  updateUI();
  renderMergeGrid();
});
