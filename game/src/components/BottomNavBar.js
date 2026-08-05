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
        bg.fillStyle(0x18181f, 0.97);
        bg.fillRect(0, barY, width, barHeight);
        // Top border line
        bg.lineStyle(1, 0x3a3a5a, 0.8);
        bg.lineBetween(0, barY, width, barY);
        this.container.add(bg);

        // Create tab buttons - rounded-square tiles like the reference art
        const tabWidth = width / this.tabConfig.length;
        const tileSize = 54;
        const tileY = barY + barHeight / 2;

        this.tabConfig.forEach((tab, index) => {
            const tx = tabWidth * index + tabWidth / 2;
            const isActive = tab.key === this.activeTab;

            const tabContainer = this.scene.add.container(tx, tileY);

            // Tile background (purple normal, gold when active)
            const tileBg = this.scene.add.graphics();
            this.drawTile(tileBg, tileSize, isActive);
            tabContainer.add(tileBg);

            // Icon
            let icon;
            if (this.scene.textures.exists(tab.icon)) {
                icon = this.scene.add.image(0, 0, tab.icon);
                const iconBox = tileSize * (isActive ? 0.56 : 0.5);
                UIHelpers.fitImage(icon, iconBox, iconBox);
            } else {
                icon = this.scene.add.graphics();
                icon.fillStyle(0xffffff, 0.8);
                icon.fillCircle(0, 0, 14);
            }
            tabContainer.add(icon);

            // Hit area for the full tab region
            const hitArea = this.scene.add.rectangle(0, 0, tabWidth - 4, barHeight, 0x000000, 0);
            hitArea.setInteractive({ useHandCursor: true });
            tabContainer.add(hitArea);

            // Pointer events
            hitArea.on('pointerover', () => {
                if (tab.key !== this.activeTab) tabContainer.setScale(1.05);
            });

            hitArea.on('pointerout', () => {
                if (tab.key !== this.activeTab) tabContainer.setScale(1.0);
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
                tileBg,
            });

            this.container.add(tabContainer);
        });
    }

    drawTile(g, size, isActive) {
        g.clear();
        if (isActive) {
            UIHelpers.drawPill(g, size, size, {
                bgColor: UIHelpers.COLORS.ACCENT_GOLD,
                borderColor: 0x8a5a00,
                cornerRadius: 12,
                gloss: true,
            });
        } else {
            UIHelpers.drawPill(g, size, size, {
                bgColor: UIHelpers.COLORS.ACCENT_PURPLE,
                borderColor: 0x4a1a8a,
                cornerRadius: 12,
                gloss: true,
            });
        }
    }

    switchTab(tab) {
        // Stop current scene and start the new one
        this.scene.scene.start(tab.scene);
    }

    setActive(tabKey) {
        this.activeTab = tabKey;

        this.tabs.forEach((t) => {
            const isActive = t.key === tabKey;
            this.drawTile(t.tileBg, 54, isActive);
            if (t.icon.setDisplaySize) {
                const iconBox = 54 * (isActive ? 0.56 : 0.5);
                UIHelpers.fitImage(t.icon, iconBox, iconBox);
            }
            t.container.setScale(1.0);
        });
    }

    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}
