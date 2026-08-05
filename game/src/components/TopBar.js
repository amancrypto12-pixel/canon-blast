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
        bg.fillStyle(0x0d0d1a, 0.85);
        bg.fillRect(0, 0, width, barHeight);
        bg.lineStyle(1, 0x3a3a5a, 0.5);
        bg.lineBetween(0, barHeight, width, barHeight);
        this.container.add(bg);

        // Player avatar + name/level/xp card (top-left)
        this.createPlayerInfo(8, 6);

        // Currency pills (right side, below settings gear)
        this.createCurrencyRow(width);

        // Settings gear (top-right corner)
        this.createSettingsButton(width);
    }

    createPlayerInfo(x, y) {
        const avatarSize = 44;

        // Avatar frame - rounded square with purple border, like reference
        const avatarBg = this.scene.add.graphics();
        avatarBg.fillStyle(0x2a1a45, 1);
        avatarBg.fillRoundedRect(x, y, avatarSize, avatarSize, 8);
        avatarBg.lineStyle(2, UIHelpers.COLORS.ACCENT_PURPLE, 1);
        avatarBg.strokeRoundedRect(x, y, avatarSize, avatarSize, 8);
        this.container.add(avatarBg);

        // Avatar image (masked to rounded square)
        if (this.scene.textures.exists('avatar_player')) {
            const avatar = this.scene.add.image(x + avatarSize / 2, y + avatarSize / 2, 'avatar_player');
            avatar.setDisplaySize(avatarSize - 4, avatarSize - 4);
            const mask = this.scene.make.graphics({ x: 0, y: 0, add: false });
            mask.fillRoundedRect(x + 2, y + 2, avatarSize - 4, avatarSize - 4, 6);
            avatar.setMask(mask.createGeometryMask());
            this.container.add(avatar);
        }

        // Player name
        const nameX = x + avatarSize + 8;
        const nameText = UIHelpers.createOutlineText(this.scene, nameX, y + 8, this.playerData.name, {
            fontSize: '13px',
            strokeThickness: 3,
        }).setOrigin(0, 0.5);
        this.container.add(nameText);

        // Level pill
        const lvlPill = this.scene.add.container(nameX + 4, y + 26);
        const lvlBg = this.scene.add.graphics();
        UIHelpers.drawPill(lvlBg, 46, 16, { bgColor: UIHelpers.COLORS.ACCENT_PURPLE, cornerRadius: 8, gloss: false });
        lvlPill.add(lvlBg);
        const lvlText = this.scene.add.text(0, 0, `Lv.${this.playerData.level}`, {
            fontSize: '9px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        lvlPill.add(lvlText);
        this.container.add(lvlPill);

        // XP bar
        const xpBarWidth = 70;
        const xpBarHeight = 7;
        const xpBarX = nameX + 32;
        const xpBarY = y + 26;
        const xpProgress = Phaser.Math.Clamp(this.playerData.xp / this.playerData.xpMax, 0, 1);

        const xpBg = this.scene.add.graphics();
        xpBg.fillStyle(0x000000, 0.4);
        xpBg.fillRoundedRect(xpBarX, xpBarY - xpBarHeight / 2, xpBarWidth, xpBarHeight, 3);
        this.container.add(xpBg);

        const xpFill = this.scene.add.graphics();
        xpFill.fillStyle(UIHelpers.COLORS.ACCENT_PURPLE, 1);
        xpFill.fillRoundedRect(xpBarX, xpBarY - xpBarHeight / 2, xpBarWidth * xpProgress, xpBarHeight, 3);
        this.container.add(xpFill);

        this.xpFill = xpFill;
        this.xpBarX = xpBarX;
        this.xpBarY = xpBarY - xpBarHeight / 2;
        this.xpBarWidth = xpBarWidth;
        this.xpBarHeight = xpBarHeight;
    }

    createSettingsButton(width) {
        const gear = UIHelpers.createMenuIconBox(this.scene, width - 28, 30, 'icon_settings', '', {
            size: 34,
            bgColor: 0x1a1a2e,
            bgAlpha: 0.7,
            iconScale: 0.55,
            onClick: () => console.log('[TopBar] Settings clicked'),
        });
        this.container.add(gear);
    }

    createCurrencyRow(width) {
        const y = 52;
        const pillW = 78;
        const gap = 6;
        const startX = width - (pillW * 3 + gap * 2) / 2 - 30;

        // Energy
        this.energyDisplay = UIHelpers.createCurrencyPill(
            this.scene, startX, y, 'currency_energy', this.playerData.energy,
            { width: pillW, height: 24, bgColor: 0x1c2b45, borderColor: 0x3d5a8a, fontSize: '11px', iconScale: 0.22 }
        );
        this.container.add(this.energyDisplay);

        // Gold
        this.goldDisplay = UIHelpers.createCurrencyPill(
            this.scene, startX + pillW + gap, y, 'currency_gold', this.playerData.gold,
            { width: pillW, height: 24, bgColor: 0x3a2a10, borderColor: 0x8a6a2a, fontSize: '11px', iconScale: 0.22 }
        );
        this.container.add(this.goldDisplay);

        // Diamonds
        this.diamondDisplay = UIHelpers.createCurrencyPill(
            this.scene, startX + (pillW + gap) * 2, y, 'currency_diamond', this.playerData.diamonds,
            { width: pillW, height: 24, bgColor: 0x0f2a3a, borderColor: 0x2a7a9a, fontSize: '11px', iconScale: 0.22 }
        );
        this.container.add(this.diamondDisplay);
    }

    updateCurrency(type, amount) {
        this.playerData[type] = amount;
        switch (type) {
            case 'energy':
                this.energyDisplay.amountText.setText(UIHelpers.formatNumber(amount));
                break;
            case 'gold':
                this.goldDisplay.amountText.setText(UIHelpers.formatNumber(amount));
                break;
            case 'diamonds':
                this.diamondDisplay.amountText.setText(UIHelpers.formatNumber(amount));
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
