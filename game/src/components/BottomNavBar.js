/**
 * BottomNavBar.js - Persistent bottom navigation bar with 5 tabs
 * Tabs: Shop, Equipment, Lobby, Talent, Abyss
 * This component is added to each scene and manages scene switching.
 */

class BottomNavBar {
    constructor(scene, activeTab = 'lobby') {
        this.scene = scene;
        this.activeTab = activeTab;
        this.container = null;
        this.tabs = [];

        this.tabConfig = [
            { key: 'shop', label: 'Shop', icon: 'nav_shop', scene: 'ShopScene' },
            { key: 'equip', label: 'Equip', icon: 'nav_equip', scene: 'EquipScene' },
            { key: 'lobby', label: 'Lobby', icon: 'nav_lobby', scene: 'LobbyScene' },
            { key: 'talent', label: 'Talent', icon: 'nav_talent', scene: 'TalentScene' },
            { key: 'abyss', label: 'Abyss', icon: 'nav_abyss', scene: 'AbyssScene' },
        ];

        this.create();
    }

    create() {
        const { width, height } = this.scene.scale;
        const barHeight = UIHelpers.BOTTOM_NAV_HEIGHT;
        const barY = height - barHeight;

        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(1000); // Always on top

        // Bar background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x0d0d1a, 0.95);
        bg.fillRect(0, barY, width, barHeight);
        // Top border line
        bg.lineStyle(1, 0x3a3a5a, 0.8);
        bg.lineBetween(0, barY, width, barY);
        this.container.add(bg);

        // Create tab buttons
        const tabWidth = width / this.tabConfig.length;
        const iconY = barY + 28;
        const labelY = barY + 55;

        this.tabConfig.forEach((tab, index) => {
            const tx = tabWidth * index + tabWidth / 2;
            const isActive = tab.key === this.activeTab;

            const tabContainer = this.scene.add.container(tx, 0);

            // Active indicator (glowing dot above icon)
            const indicator = this.scene.add.graphics();
            if (isActive) {
                indicator.fillStyle(UIHelpers.COLORS.ACCENT_PURPLE, 1);
                indicator.fillCircle(0, barY + 8, 3);
            }
            tabContainer.add(indicator);

            // Icon
            let icon;
            if (this.scene.textures.exists(tab.icon)) {
                icon = this.scene.add.image(0, iconY, tab.icon);
                icon.setScale(isActive ? 0.38 : 0.32);
                if (!isActive) icon.setAlpha(0.5);
            } else {
                icon = this.scene.add.graphics();
                icon.fillStyle(isActive ? UIHelpers.COLORS.ACCENT_PURPLE : 0x555555, 1);
                icon.fillCircle(0, iconY, 16);
            }
            tabContainer.add(icon);

            // Label
            const label = this.scene.add.text(0, labelY, tab.label, {
                fontSize: '10px',
                fontFamily: 'Arial, sans-serif',
                color: isActive ? '#ffffff' : '#777777',
                fontStyle: isActive ? 'bold' : 'normal',
            }).setOrigin(0.5);
            tabContainer.add(label);

            // Hit area for the full tab region
            const hitArea = this.scene.add.rectangle(0, barY + barHeight / 2, tabWidth - 4, barHeight, 0x000000, 0);
            hitArea.setInteractive({ useHandCursor: true });
            tabContainer.add(hitArea);

            // Pointer events
            hitArea.on('pointerover', () => {
                if (tab.key !== this.activeTab) {
                    if (icon.setAlpha) icon.setAlpha(0.8);
                    label.setColor('#bbbbbb');
                }
            });

            hitArea.on('pointerout', () => {
                if (tab.key !== this.activeTab) {
                    if (icon.setAlpha) icon.setAlpha(0.5);
                    label.setColor('#777777');
                }
            });

            hitArea.on('pointerup', () => {
                if (tab.key !== this.activeTab) {
                    this.switchTab(tab);
                }
            });

            this.tabs.push({
                key: tab.key,
                container: tabContainer,
                icon,
                label,
                indicator,
            });

            this.container.add(tabContainer);
        });
    }

    switchTab(tab) {
        // Stop current scene and start the new one
        this.scene.scene.start(tab.scene);
    }

    setActive(tabKey) {
        this.activeTab = tabKey;
        const { height } = this.scene.scale;
        const barY = height - UIHelpers.BOTTOM_NAV_HEIGHT;

        this.tabs.forEach((t) => {
            const isActive = t.key === tabKey;

            // Update indicator
            t.indicator.clear();
            if (isActive) {
                t.indicator.fillStyle(UIHelpers.COLORS.ACCENT_PURPLE, 1);
                t.indicator.fillCircle(0, barY + 8, 3);
            }

            // Update icon
            if (t.icon.setAlpha) {
                t.icon.setAlpha(isActive ? 1 : 0.5);
                t.icon.setScale(isActive ? 0.38 : 0.32);
            }

            // Update label
            t.label.setColor(isActive ? '#ffffff' : '#777777');
            t.label.setFontStyle(isActive ? 'bold' : 'normal');
        });
    }

    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}
