import { SaveManager } from './save/SaveManager.js';
import { BattleScene } from './scenes/BattleScene.js';

let isTelegram = false;
try {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        isTelegram = true;
    }
} catch(e) {}

const App = {
    init() {
        SaveManager.load();
        this.bindLobbyUI();
        this.updateLobbyStats();
    },

    bindLobbyUI() {
        // Mode Selection
        document.getElementById('btn-play').addEventListener('click', () => {
            document.getElementById('mode-select-view').classList.remove('hidden');
        });
        
        document.getElementById('btn-close-modes').addEventListener('click', () => {
            document.getElementById('mode-select-view').classList.add('hidden');
        });

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.startGame(mode);
            });
        });

        // Other Lobby Buttons (Placeholders for now)
        ['shop', 'upgrade', 'inventory', 'leaderboard'].forEach(menu => {
            document.getElementById(`btn-${menu}`).addEventListener('click', () => {
                alert(`${menu.toUpperCase()} system coming soon in Stage 3!`);
            });
        });
        
        // Back to lobby
        document.getElementById('back-to-lobby-btn').addEventListener('click', () => {
            BattleScene.stop();
            
            document.getElementById('game-view').classList.remove('active');
            document.getElementById('game-view').classList.add('hidden');
            document.getElementById('game-over-screen').classList.add('hidden');
            
            document.getElementById('lobby-view').classList.remove('hidden');
            document.getElementById('lobby-view').classList.add('active');
            this.updateLobbyStats();
        });
    },

    updateLobbyStats() {
        const data = SaveManager.get();
        document.getElementById('lobby-coins').innerText = data.coins;
        document.getElementById('lobby-gems').innerText = data.gems;
    },

    startGame(mode) {
        document.getElementById('mode-select-view').classList.add('hidden');
        document.getElementById('lobby-view').classList.remove('active');
        document.getElementById('lobby-view').classList.add('hidden');
        
        document.getElementById('game-view').classList.remove('hidden');
        document.getElementById('game-view').classList.add('active');
        
        BattleScene.start(mode);
    }
};

window.onload = () => {
    App.init();
};
