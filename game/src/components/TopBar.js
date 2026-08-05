/**
 * TopBar.js - Top bar UI component with player profile and currency display
 * Shows: Avatar, Name, Level/XP, Energy, Gold, Diamond counts
 */

class TopBar {
    constructor(scene, playerData = {}) {
        this.scene = scene;
        this.container = null;

        this.playerData = Object.assign({
            name: 'Player',
            level: 1,
            xp: 0,
            xpMax: 100,
            energy: 120,
            gold: 25000,
            diamonds: 500,
        }, playerData);

        this.create();
    }

    create() {
        const { width } = this.scene.scale;
        const barHeight = UIHelpers.TOP_BAR_HEIGHT;

        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(999);

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x0d0d1a, 0.9);
        bg.fillRect(0, 0, width, barHeight);
        bg.lineStyle(1, 0x3a3a5a, 0.5);
        bg.lineBetween(0, barHeight, width, barHeight);
        this.container.add(bg);

        // Player avatar
        this.createPlayerInfo(12, 8);

        // Currency displays (right side)
        this.createCurrencyRow(width);
    }

    createPlayerInfo(x, y) {
        const avatarSize = 40;

        // Avatar frame
        const avatarBg = this.scene.add.graphics();
        avatarBg.fillStyle(UIHelpers.COLORS.SLOT_BG, 1);
        avatarBg.fillCircle(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2 + 2);
        avatarBg.lineStyle(2, UIHelpers.COLORS.ACCENT_PURPLE, 1);
        avatarBg.strokeCircle(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2 + 2);
        this.container.add(avatarBg);

        // Avatar image
        if (this.scene.textures.exists('avatar_player')) {
            const avatar = this.scene.add.image(x + avatarSize / 2, y + avatarSize / 2, 'avatar_player');
            avatar.setDisplaySize(avatarSize, avatarSize);
            // Create circular mask
            const mask = this.scene.add.graphics();
            mask.fillCircle(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2);
            avatar.setMask(mask.createGeometryMask());
            this.container.add(avatar);
        }

        // Player name
        const nameX = x + avatarSize + 8;
        const nameText = this.scene.add.text(nameX, y + 6, this.playerData.name, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        });
        this.container.add(nameText);

        // Level badge
        const lvlText = this.scene.add.text(nameX, y + 22, `Lv.${this.playerData.level}`, {
            fontSize: '10px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GOLD,
        });
        this.container.add(lvlText);

        // XP bar
        const xpBarWidth = 60;
        const xpBarHeight = 6;
        const xpBarX = nameX + 30;
        const xpBarY = y + 28;
        const xpProgress = this.playerData.xp / this.playerData.xpMax;

        const xpBg = this.scene.add.graphics();
        xpBg.fillStyle(0x2a2a4a, 1);
        xpBg.fillRoundedRect(xpBarX, xpBarY, xpBarWidth, xpBarHeight, 3);
        this.container.add(xpBg);

        const xpFill = this.scene.add.graphics();
        xpFill.fillStyle(UIHelpers.COLORS.ACCENT_PURPLE, 1);
        xpFill.fillRoundedRect(xpBarX, xpBarY, xpBarWidth * xpProgress, xpBarHeight, 3);
        this.container.add(xpFill);

        this.xpFill = xpFill;
        this.xpBarX = xpBarX;
        this.xpBarY = xpBarY;
        this.xpBarWidth = xpBarWidth;
        this.xpBarHeight = xpBarHeight;
    }

    createCurrencyRow(width) {
        const y = 20;
        const spacing = 75;
        const startX = width - spacing * 3 + 10;

        // Energy
        this.energyDisplay = UIHelpers.createCurrencyDisplay(
            this.scene, startX, y, 'currency_energy', this.playerData.energy,
            { iconScale: 0.25, fontSize: '11px' }
        );
        this.container.add(this.energyDisplay);

        // Gold
        this.goldDisplay = UIHelpers.createCurrencyDisplay(
            this.scene, startX + spacing, y, 'currency_gold', this.playerData.gold,
            { iconScale: 0.25, fontSize: '11px' }
        );
        this.container.add(this.goldDisplay);

        // Diamonds
        this.diamondDisplay = UIHelpers.createCurrencyDisplay(
            this.scene, startX + spacing * 2, y, 'currency_diamond', this.playerData.diamonds,
            { iconScale: 0.25, fontSize: '11px' }
        );
        this.container.add(this.diamondDisplay);
    }

    updateCurrency(type, amount) {
        this.playerData[type] = amount;
        switch (type) {
            case 'energy':
                this.energyDisplay.setAmount(amount);
                break;
            case 'gold':
                this.goldDisplay.setAmount(amount);
                break;
            case 'diamonds':
                this.diamondDisplay.setAmount(amount);
                break;
        }
    }

    updateXP(xp, xpMax) {
        this.playerData.xp = xp;
        this.playerData.xpMax = xpMax;
        const progress = xp / xpMax;

        this.xpFill.clear();
        this.xpFill.fillStyle(UIHelpers.COLORS.ACCENT_PURPLE, 1);
        this.xpFill.fillRoundedRect(this.xpBarX, this.xpBarY, this.xpBarWidth * progress, this.xpBarHeight, 3);
    }

    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}
