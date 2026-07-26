export const SaveManager = {
    data: {
        coins: 0,
        gems: 0,
        level: 1,
        highestScore: 0,
        highestLevel: 1,
        inventory: ['ab_1', 'wp_1', 'ul_1', 'dr_1'],
        equipped: {
            abilities: 'ab_1',
            weapons: 'wp_1',
            ultimates: 'ul_1',
            drones: 'dr_1'
        },
        upgrades: {
            damage: 1,
            fireRate: 1,
            critical: 1,
            hp: 1,
            coinBonus: 1,
            expBonus: 1
        }
    },

    load() {
        try {
            const s = localStorage.getItem('cannonBlastSaveV2');
            if (s) {
                this.data = { ...this.data, ...JSON.parse(s) };
            }
        } catch (e) {
            console.error("Save load failed", e);
        }
        return this.data;
    },

    save() {
        try {
            localStorage.setItem('cannonBlastSaveV2', JSON.stringify(this.data));
            // In the future, sync to Telegram Cloud Save here
        } catch (e) {
            console.error("Save failed", e);
        }
    },
    
    get() {
        return this.data;
    }
};
