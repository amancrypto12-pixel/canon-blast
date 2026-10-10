export const RARITIES = {
    COMMON: { id: 'COMMON', key: 'common', maxTaps: 100, reward: 0.01, next: 'UNCOMMON' },
    UNCOMMON: { id: 'UNCOMMON', key: 'uncommon', maxTaps: 150, reward: 0.02, next: 'RARE' },
    RARE: { id: 'RARE', key: 'rare', maxTaps: 200, reward: 0.04, next: 'EPIC' },
    EPIC: { id: 'EPIC', key: 'epic', maxTaps: 250, reward: 0.5, next: 'LEGENDARY' },
    LEGENDARY: { id: 'LEGENDARY', key: 'legendary', maxTaps: 300, reward: 1.6, next: null }
};

export class GameState {
    static instance = null;

    constructor() {
        if (GameState.instance) return GameState.instance;
        GameState.instance = this;

        // Default State
        this.data = {
            pearls: 1000,
            dmdTokens: 0,
            heartPearls: 0,
            slots: [
                this.createNewDolphin('COMMON') // Starting slot 1
            ],
            maxSlots: 5
        };
        this.load();
    }

    createNewDolphin(rarityId) {
        return {
            rarity: rarityId,
            level: 1,
            taps: 0,
            state: 'FEEDING' // FEEDING, READY, BREEDING, STAKING
        };
    }

    save() {
        try {
            const dataStr = JSON.stringify(this.data);
            localStorage.setItem('dolphinGameState', dataStr);
            
            // If Telegram WebApp CloudStorage is available
            if (window.Telegram?.WebApp?.CloudStorage) {
                window.Telegram.WebApp.CloudStorage.setItem('dolphinGameState', dataStr, (err, success) => {
                    if (err) console.error("TG CloudStorage Save Error", err);
                });
            }
        } catch(e) {
            console.error("Save error:", e);
        }
    }

    load() {
        try {
            // First try to load from localStorage (synchronous fallback)
            const local = localStorage.getItem('dolphinGameState');
            if (local) {
                this.data = JSON.parse(local);
            }

            // In a real prod environment, we might want to load async from TG CloudStorage here, 
            // but for simplicity/MVP we just use local/fallback sync.
            if (window.Telegram?.WebApp?.CloudStorage) {
                window.Telegram.WebApp.CloudStorage.getItem('dolphinGameState', (err, value) => {
                    if (!err && value) {
                        this.data = JSON.parse(value);
                        // trigger an event to update UI? We can dispatch event
                        window.dispatchEvent(new Event('gameStateLoaded'));
                    }
                });
            }
        } catch(e) {
            console.error("Load error:", e);
        }
    }

    addEgg() {
        this.data.heartPearls++;
        this.save();
    }

    hatchEgg() {
        if (this.data.heartPearls > 0 && this.data.slots.length < this.data.maxSlots) {
            this.data.heartPearls--;
            // Random rarity logic: 70% COMMON, 25% UNCOMMON, 5% RARE
            const rand = Math.random();
            let newRarity = 'COMMON';
            if (rand > 0.95) newRarity = 'RARE';
            else if (rand > 0.70) newRarity = 'UNCOMMON';
            
            this.data.slots.push(this.createNewDolphin(newRarity));
            this.save();
            return true;
        }
        return false;
    }
}
