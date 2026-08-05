/**
 * UIHelpers.js - Reusable UI utility functions for Phaser 3
 */

const UIHelpers = {
    // Game design constants
    GAME_WIDTH: 450,
    GAME_HEIGHT: 800,
    TOP_BAR_HEIGHT: 60,
    BOTTOM_NAV_HEIGHT: 80,
    CONTENT_Y_START: 65,
    CONTENT_Y_END: 720,

    // Color palette
    COLORS: {
        DARK_BG: 0x1a1a2e,
        PANEL_BG: 0x16213e,
        ACCENT_PURPLE: 0x7b2ff7,
        ACCENT_GOLD: 0xffd700,
        ACCENT_BLUE: 0x00d4ff,
        ACCENT_RED: 0xff4757,
        ACCENT_GREEN: 0x2ed573,
        TEXT_WHITE: '#ffffff',
        TEXT_GRAY: '#aaaaaa',
        TEXT_GOLD: '#ffd700',
        BUTTON_PRIMARY: 0x7b2ff7,
        BUTTON_HOVER: 0x9b4dff,
        BUTTON_ACTIVE: 0x5a1dbf,
        TAB_ACTIVE: 0x7b2ff7,
        TAB_INACTIVE: 0x2a2a4a,
        SLOT_BG: 0x2a2a4a,
        SLOT_BORDER: 0x4a4a6a,
    },

    /**
     * Create an interactive button with text
     */
    createButton(scene, x, y, width, height, text, options = {}) {
        const {
            fontSize = '16px',
            bgColor = UIHelpers.COLORS.BUTTON_PRIMARY,
            hoverColor = UIHelpers.COLORS.BUTTON_HOVER,
            activeColor = UIHelpers.COLORS.BUTTON_ACTIVE,
            textColor = UIHelpers.COLORS.TEXT_WHITE,
            cornerRadius = 12,
            onClick = null,
            iconKey = null,
            iconScale = 0.4,
        } = options;

        const container = scene.add.container(x, y);

        // Button background
        const bg = scene.add.graphics();
        bg.fillStyle(bgColor, 1);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
        container.add(bg);

        // Button text
        const label = scene.add.text(iconKey ? 10 : 0, 0, text, {
            fontSize,
            fontFamily: 'Arial, sans-serif',
            color: textColor,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        container.add(label);

        // Optional icon
        if (iconKey && scene.textures.exists(iconKey)) {
            const icon = scene.add.image(-width / 2 + 25, 0, iconKey).setScale(iconScale);
            container.add(icon);
        }

        // Hit area
        const hitArea = scene.add.rectangle(0, 0, width, height, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        container.add(hitArea);

        // Interactive events
        hitArea.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(hoverColor, 1);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
            container.setScale(1.02);
        });

        hitArea.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(bgColor, 1);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
            container.setScale(1.0);
        });

        hitArea.on('pointerdown', () => {
            bg.clear();
            bg.fillStyle(activeColor, 1);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
            container.setScale(0.96);
        });

        hitArea.on('pointerup', () => {
            bg.clear();
            bg.fillStyle(hoverColor, 1);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
            container.setScale(1.0);
            if (onClick) onClick();
        });

        container.bg = bg;
        container.label = label;
        container.hitArea = hitArea;
        return container;
    },

    /**
     * Create an icon button (image-based)
     */
    createIconButton(scene, x, y, textureKey, options = {}) {
        const {
            scale = 0.5,
            tint = null,
            onClick = null,
            label = null,
            labelFontSize = '10px',
        } = options;

        const container = scene.add.container(x, y);

        let icon;
        if (scene.textures.exists(textureKey)) {
            icon = scene.add.image(0, 0, textureKey).setScale(scale);
        } else {
            // Fallback: colored circle placeholder
            icon = scene.add.graphics();
            icon.fillStyle(UIHelpers.COLORS.ACCENT_PURPLE, 1);
            icon.fillCircle(0, 0, 20);
        }
        container.add(icon);

        if (tint && icon.setTint) {
            icon.setTint(tint);
        }

        // Label below icon
        if (label) {
            const txt = scene.add.text(0, 28, label, {
                fontSize: labelFontSize,
                fontFamily: 'Arial, sans-serif',
                color: UIHelpers.COLORS.TEXT_WHITE,
            }).setOrigin(0.5);
            container.add(txt);
        }

        // Hit area
        const hitSize = 50;
        const hitRect = scene.add.rectangle(0, 0, hitSize, hitSize, 0x000000, 0);
        hitRect.setInteractive({ useHandCursor: true });
        container.add(hitRect);

        hitRect.on('pointerover', () => container.setScale(1.1));
        hitRect.on('pointerout', () => container.setScale(1.0));
        hitRect.on('pointerdown', () => container.setScale(0.9));
        hitRect.on('pointerup', () => {
            container.setScale(1.0);
            if (onClick) onClick();
        });

        container.icon = icon;
        return container;
    },

    /**
     * Create a tab bar with multiple tabs
     */
    createTabBar(scene, x, y, tabs, options = {}) {
        const {
            tabWidth = 80,
            tabHeight = 36,
            gap = 4,
            activeIndex = 0,
            onTabChange = null,
            fontSize = '12px',
        } = options;

        const container = scene.add.container(x, y);
        const tabButtons = [];
        const totalWidth = tabs.length * tabWidth + (tabs.length - 1) * gap;
        const startX = -totalWidth / 2 + tabWidth / 2;

        tabs.forEach((tab, index) => {
            const tx = startX + index * (tabWidth + gap);
            const isActive = index === activeIndex;

            const tabBg = scene.add.graphics();
            tabBg.fillStyle(isActive ? UIHelpers.COLORS.TAB_ACTIVE : UIHelpers.COLORS.TAB_INACTIVE, 1);
            tabBg.fillRoundedRect(-tabWidth / 2, -tabHeight / 2, tabWidth, tabHeight, 8);

            const tabLabel = scene.add.text(0, 0, tab.label, {
                fontSize,
                fontFamily: 'Arial, sans-serif',
                color: isActive ? UIHelpers.COLORS.TEXT_WHITE : UIHelpers.COLORS.TEXT_GRAY,
                fontStyle: isActive ? 'bold' : 'normal',
            }).setOrigin(0.5);

            const tabContainer = scene.add.container(tx, 0, [tabBg, tabLabel]);

            const hitRect = scene.add.rectangle(0, 0, tabWidth, tabHeight, 0x000000, 0);
            hitRect.setInteractive({ useHandCursor: true });
            tabContainer.add(hitRect);

            hitRect.on('pointerup', () => {
                UIHelpers.setActiveTab(tabButtons, index);
                if (onTabChange) onTabChange(index, tab);
            });

            tabContainer.bg = tabBg;
            tabContainer.label = tabLabel;
            tabContainer.tabWidth = tabWidth;
            tabContainer.tabHeight = tabHeight;
            tabButtons.push(tabContainer);
            container.add(tabContainer);
        });

        container.tabButtons = tabButtons;
        return container;
    },

    /**
     * Highlight a specific tab in a tab bar
     */
    setActiveTab(tabButtons, activeIndex) {
        tabButtons.forEach((tab, index) => {
            const isActive = index === activeIndex;
            tab.bg.clear();
            tab.bg.fillStyle(isActive ? UIHelpers.COLORS.TAB_ACTIVE : UIHelpers.COLORS.TAB_INACTIVE, 1);
            tab.bg.fillRoundedRect(-tab.tabWidth / 2, -tab.tabHeight / 2, tab.tabWidth, tab.tabHeight, 8);
            tab.label.setColor(isActive ? UIHelpers.COLORS.TEXT_WHITE : UIHelpers.COLORS.TEXT_GRAY);
            tab.label.setFontStyle(isActive ? 'bold' : 'normal');
        });
    },

    /**
     * Create an equipment slot with border and optional icon
     */
    createEquipSlot(scene, x, y, slotKey, options = {}) {
        const {
            size = 64,
            iconKey = null,
            iconScale = 0.5,
            label = '',
            onClick = null,
        } = options;

        const container = scene.add.container(x, y);

        // Slot background
        const bg = scene.add.graphics();
        bg.fillStyle(UIHelpers.COLORS.SLOT_BG, 0.8);
        bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
        bg.lineStyle(2, UIHelpers.COLORS.SLOT_BORDER, 1);
        bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
        container.add(bg);

        // Equipment icon
        if (iconKey && scene.textures.exists(iconKey)) {
            const icon = scene.add.image(0, 0, iconKey).setScale(iconScale);
            container.add(icon);
        }

        // Slot label
        if (label) {
            const txt = scene.add.text(0, size / 2 + 10, label, {
                fontSize: '10px',
                fontFamily: 'Arial, sans-serif',
                color: UIHelpers.COLORS.TEXT_GRAY,
            }).setOrigin(0.5);
            container.add(txt);
        }

        // Interaction
        const hitRect = scene.add.rectangle(0, 0, size, size, 0x000000, 0);
        hitRect.setInteractive({ useHandCursor: true });
        container.add(hitRect);

        hitRect.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(UIHelpers.COLORS.SLOT_BG, 1);
            bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
            bg.lineStyle(2, UIHelpers.COLORS.ACCENT_PURPLE, 1);
            bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
        });

        hitRect.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(UIHelpers.COLORS.SLOT_BG, 0.8);
            bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
            bg.lineStyle(2, UIHelpers.COLORS.SLOT_BORDER, 1);
            bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
        });

        hitRect.on('pointerup', () => {
            if (onClick) onClick(slotKey);
        });

        return container;
    },

    /**
     * Create a skill tile for the talent grid
     */
    createSkillTile(scene, x, y, skillData, options = {}) {
        const {
            size = 70,
            onClick = null,
        } = options;

        const container = scene.add.container(x, y);

        // Tile background
        const bg = scene.add.graphics();
        bg.fillStyle(UIHelpers.COLORS.SLOT_BG, 0.9);
        bg.fillRoundedRect(-size / 2, -size / 2, size, size, 10);
        bg.lineStyle(2, UIHelpers.COLORS.SLOT_BORDER, 1);
        bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 10);
        container.add(bg);

        // Skill icon
        if (skillData.iconKey && scene.textures.exists(skillData.iconKey)) {
            const icon = scene.add.image(0, -5, skillData.iconKey).setScale(0.4);
            container.add(icon);
        } else {
            // Placeholder colored square
            const placeholder = scene.add.graphics();
            placeholder.fillStyle(skillData.color || UIHelpers.COLORS.ACCENT_PURPLE, 1);
            placeholder.fillRoundedRect(-15, -20, 30, 30, 6);
            container.add(placeholder);
        }

        // Level indicator
        if (skillData.level !== undefined) {
            const lvlText = scene.add.text(0, size / 2 - 14, `Lv.${skillData.level}`, {
                fontSize: '9px',
                fontFamily: 'Arial, sans-serif',
                color: UIHelpers.COLORS.TEXT_GOLD,
            }).setOrigin(0.5);
            container.add(lvlText);
        }

        // Interaction
        const hitRect = scene.add.rectangle(0, 0, size, size, 0x000000, 0);
        hitRect.setInteractive({ useHandCursor: true });
        container.add(hitRect);

        hitRect.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(UIHelpers.COLORS.SLOT_BG, 1);
            bg.fillRoundedRect(-size / 2, -size / 2, size, size, 10);
            bg.lineStyle(2, UIHelpers.COLORS.ACCENT_GOLD, 1);
            bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 10);
        });

        hitRect.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(UIHelpers.COLORS.SLOT_BG, 0.9);
            bg.fillRoundedRect(-size / 2, -size / 2, size, size, 10);
            bg.lineStyle(2, UIHelpers.COLORS.SLOT_BORDER, 1);
            bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 10);
        });

        hitRect.on('pointerup', () => {
            if (onClick) onClick(skillData);
        });

        return container;
    },

    /**
     * Create a currency display (icon + amount)
     */
    createCurrencyDisplay(scene, x, y, iconKey, amount, options = {}) {
        const {
            iconScale = 0.3,
            fontSize = '14px',
            textColor = UIHelpers.COLORS.TEXT_WHITE,
        } = options;

        const container = scene.add.container(x, y);

        if (scene.textures.exists(iconKey)) {
            const icon = scene.add.image(0, 0, iconKey).setScale(iconScale);
            container.add(icon);
        } else {
            const placeholder = scene.add.graphics();
            placeholder.fillStyle(UIHelpers.COLORS.ACCENT_GOLD, 1);
            placeholder.fillCircle(0, 0, 10);
            container.add(placeholder);
        }

        const amountText = scene.add.text(18, 0, UIHelpers.formatNumber(amount), {
            fontSize,
            fontFamily: 'Arial, sans-serif',
            color: textColor,
            fontStyle: 'bold',
        }).setOrigin(0, 0.5);
        container.add(amountText);

        container.amountText = amountText;
        container.setAmount = (newAmount) => {
            amountText.setText(UIHelpers.formatNumber(newAmount));
        };

        return container;
    },

    /**
     * Format large numbers (e.g., 10000 -> 10K)
     */
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K';
        return num.toString();
    },

    /**
     * Create a panel/card background
     */
    createPanel(scene, x, y, width, height, options = {}) {
        const {
            bgColor = UIHelpers.COLORS.PANEL_BG,
            alpha = 0.9,
            cornerRadius = 12,
            borderColor = null,
            borderWidth = 0,
        } = options;

        const graphics = scene.add.graphics();
        graphics.fillStyle(bgColor, alpha);
        graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, cornerRadius);

        if (borderColor !== null) {
            graphics.lineStyle(borderWidth || 2, borderColor, 1);
            graphics.strokeRoundedRect(x - width / 2, y - height / 2, width, height, cornerRadius);
        }

        return graphics;
    },

    /**
     * Animate a scene transition (fade in)
     */
    fadeInScene(scene, duration = 300) {
        scene.cameras.main.setAlpha(0);
        scene.tweens.add({
            targets: scene.cameras.main,
            alpha: 1,
            duration,
            ease: 'Power2',
        });
    },

    /**
     * Generate placeholder texture at runtime
     */
    generatePlaceholder(scene, key, width, height, color = 0x7b2ff7) {
        if (scene.textures.exists(key)) return;
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(0, 0, width, height, 4);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    },
};
