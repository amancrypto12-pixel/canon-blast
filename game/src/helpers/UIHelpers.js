/**
 * UIHelpers.js - Reusable UI utility functions for Phaser 3
 */

const UIHelpers = {
    // Game design constants
    GAME_WIDTH: 450,
    GAME_HEIGHT: 800,
    TOP_BAR_HEIGHT: 76,
    BOTTOM_NAV_HEIGHT: 80,
    CONTENT_Y_START: 80,
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

        // Optional icon (box-fit so native asset resolution never overflows the button)
        if (iconKey && scene.textures.exists(iconKey)) {
            const icon = scene.add.image(-width / 2 + 25, 0, iconKey);
            UIHelpers.fitImage(icon, height * 0.7, height * 0.7);
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
            icon = scene.add.image(0, 0, textureKey);
            // Box-fit to a fixed slot size instead of scaling relative to
            // the source image's native resolution (assets vary wildly).
            const boxSize = 80 * scale;
            UIHelpers.fitImage(icon, boxSize, boxSize);
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
     * Supports a full-width underline style bar (like the reference designs)
     * where inactive tabs have no background and the active tab gets a
     * colored rounded-rect pill (purple for Shop, gold for Equip, etc).
     */
    createTabBar(scene, x, y, tabs, options = {}) {
        const {
            tabWidth = 80,
            tabHeight = 36,
            gap = 4,
            activeIndex = 0,
            onTabChange = null,
            fontSize = '12px',
            activeColor = UIHelpers.COLORS.TAB_ACTIVE,
            inactiveColor = UIHelpers.COLORS.TAB_INACTIVE,
            activeTextColor = '#ffffff',
            inactiveTextColor = UIHelpers.COLORS.TEXT_GRAY,
            showInactiveBg = true,
            barBgColor = null,
            barWidth = null,
        } = options;

        const container = scene.add.container(x, y);
        const tabButtons = [];
        const totalWidth = tabs.length * tabWidth + (tabs.length - 1) * gap;
        const startX = -totalWidth / 2 + tabWidth / 2;

        // Optional full-width dark strip behind the whole tab row
        if (barBgColor !== null) {
            const stripWidth = barWidth || (totalWidth + 20);
            const strip = scene.add.graphics();
            strip.fillStyle(barBgColor, 1);
            strip.fillRect(-stripWidth / 2, -tabHeight / 2 - 4, stripWidth, tabHeight + 8);
            container.add(strip);
        }

        tabs.forEach((tab, index) => {
            const tx = startX + index * (tabWidth + gap);
            const isActive = index === activeIndex;

            const tabBg = scene.add.graphics();
            if (isActive) {
                tabBg.fillStyle(activeColor, 1);
                tabBg.fillRoundedRect(-tabWidth / 2, -tabHeight / 2, tabWidth, tabHeight, 8);
            } else if (showInactiveBg) {
                tabBg.fillStyle(inactiveColor, 1);
                tabBg.fillRoundedRect(-tabWidth / 2, -tabHeight / 2, tabWidth, tabHeight, 8);
            }

            const tabLabel = scene.add.text(0, 0, tab.label, {
                fontSize,
                fontFamily: 'Arial, sans-serif',
                color: isActive ? activeTextColor : inactiveTextColor,
                fontStyle: 'bold',
            }).setOrigin(0.5);

            const tabContainer = scene.add.container(tx, 0, [tabBg, tabLabel]);

            const hitRect = scene.add.rectangle(0, 0, tabWidth, tabHeight, 0x000000, 0);
            hitRect.setInteractive({ useHandCursor: true });
            tabContainer.add(hitRect);

            hitRect.on('pointerup', () => {
                UIHelpers.setActiveTab(tabButtons, index, { activeColor, inactiveColor, activeTextColor, inactiveTextColor, showInactiveBg });
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
    setActiveTab(tabButtons, activeIndex, colorOptions = {}) {
        const {
            activeColor = UIHelpers.COLORS.TAB_ACTIVE,
            inactiveColor = UIHelpers.COLORS.TAB_INACTIVE,
            activeTextColor = '#ffffff',
            inactiveTextColor = UIHelpers.COLORS.TEXT_GRAY,
            showInactiveBg = true,
        } = colorOptions;

        tabButtons.forEach((tab, index) => {
            const isActive = index === activeIndex;
            tab.bg.clear();
            if (isActive) {
                tab.bg.fillStyle(activeColor, 1);
                tab.bg.fillRoundedRect(-tab.tabWidth / 2, -tab.tabHeight / 2, tab.tabWidth, tab.tabHeight, 8);
            } else if (showInactiveBg) {
                tab.bg.fillStyle(inactiveColor, 1);
                tab.bg.fillRoundedRect(-tab.tabWidth / 2, -tab.tabHeight / 2, tab.tabWidth, tab.tabHeight, 8);
            }
            tab.label.setColor(isActive ? activeTextColor : inactiveTextColor);
            tab.label.setFontStyle('bold');
        });
    },

    /**
     * Bold cartoon-style outlined text (white fill + dark stroke + shadow)
     * Matches the chunky title text seen throughout the reference designs.
     */
    createOutlineText(scene, x, y, text, options = {}) {
        const {
            fontSize = '18px',
            color = '#ffffff',
            strokeColor = '#1a1a1a',
            strokeThickness = 5,
            fontStyle = 'bold',
            shadow = true,
            align = 'center',
        } = options;

        const txt = scene.add.text(x, y, text, {
            fontSize,
            fontFamily: 'Arial, sans-serif',
            color,
            stroke: strokeColor,
            strokeThickness,
            fontStyle,
            align,
        }).setOrigin(0.5);

        if (shadow) {
            txt.setShadow(0, 2, '#000000', 3, false, true);
        }

        return txt;
    },

    /**
     * Draw a pill/rounded-rect background with a subtle glossy highlight.
     * Returns the Graphics object only (caller positions/adds it).
     */
    drawPill(graphics, width, height, options = {}) {
        const {
            bgColor = UIHelpers.COLORS.ACCENT_PURPLE,
            borderColor = null,
            borderWidth = 3,
            cornerRadius = height / 2,
            gloss = true,
        } = options;

        graphics.clear();
        graphics.fillStyle(bgColor, 1);
        graphics.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);

        if (gloss) {
            graphics.fillStyle(0xffffff, 0.16);
            graphics.fillRoundedRect(-width / 2 + 3, -height / 2 + 3, width - 6, height * 0.45, cornerRadius * 0.7);
        }

        if (borderColor !== null) {
            graphics.lineStyle(borderWidth, borderColor, 1);
            graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
        }
    },

    /**
     * Create an interactive pill-shaped button with an outlined bold label.
     * Used for things like "Draw 1x", "STAGE 1", "PLAY ABYSS", "GRADE UP".
     */
    createPillButton(scene, x, y, width, height, text, options = {}) {
        const {
            fontSize = '15px',
            bgColor = UIHelpers.COLORS.ACCENT_GOLD,
            borderColor = 0x8a5a00,
            textColor = '#ffffff',
            strokeColor = '#7a4a00',
            strokeThickness = 4,
            cornerRadius = height / 2,
            onClick = null,
            iconKey = null,
            iconScale = 0.4,
            disabled = false,
        } = options;

        const container = scene.add.container(x, y);

        const bg = scene.add.graphics();
        UIHelpers.drawPill(bg, width, height, { bgColor, borderColor, cornerRadius });
        container.add(bg);

        const label = scene.add.text(iconKey ? 8 : 0, 0, text, {
            fontSize,
            fontFamily: 'Arial, sans-serif',
            color: textColor,
            stroke: strokeColor,
            strokeThickness,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        container.add(label);

        if (iconKey && scene.textures.exists(iconKey)) {
            const icon = scene.add.image(-width / 2 + height * 0.45, 0, iconKey);
            UIHelpers.fitImage(icon, height * 0.7, height * 0.7);
            container.add(icon);
        }

        if (!disabled) {
            const hitArea = scene.add.rectangle(0, 0, width, height, 0x000000, 0);
            hitArea.setInteractive({ useHandCursor: true });
            container.add(hitArea);

            hitArea.on('pointerover', () => container.setScale(1.03));
            hitArea.on('pointerout', () => container.setScale(1.0));
            hitArea.on('pointerdown', () => container.setScale(0.95));
            hitArea.on('pointerup', () => {
                container.setScale(1.0);
                if (onClick) onClick();
            });
        } else {
            container.setAlpha(0.5);
        }

        container.bg = bg;
        container.label = label;
        return container;
    },

    /**
     * Small pill containing an icon + amount, used for currency/cost tags
     * (e.g. the little "300 diamond" / "1000 star" chips in the reference art).
     */
    createCurrencyPill(scene, x, y, iconKey, amount, options = {}) {
        const {
            width = 84,
            height = 26,
            bgColor = 0x1c2b45,
            borderColor = 0x3d5a8a,
            fontSize = '12px',
            textColor = '#ffffff',
            iconScale = 0.22,
        } = options;

        const container = scene.add.container(x, y);

        const bg = scene.add.graphics();
        UIHelpers.drawPill(bg, width, height, { bgColor, borderColor, cornerRadius: height / 2, gloss: false });
        container.add(bg);

        if (scene.textures.exists(iconKey)) {
            const icon = scene.add.image(-width / 2 + 15, 0, iconKey);
            UIHelpers.fitImage(icon, height * 0.8, height * 0.8);
            container.add(icon);
        }

        const amountText = scene.add.text(4, 0, UIHelpers.formatNumber(amount), {
            fontSize,
            fontFamily: 'Arial, sans-serif',
            color: textColor,
            fontStyle: 'bold',
        }).setOrigin(0, 0.5);
        container.add(amountText);

        container.amountText = amountText;
        return container;
    },

    /**
     * Small circular "?" info badge (top-right corner of chest/gacha cards)
     */
    createInfoBadge(scene, x, y, options = {}) {
        const { radius = 11, onClick = null } = options;
        const container = scene.add.container(x, y);

        const bg = scene.add.graphics();
        bg.fillStyle(0x000000, 0.4);
        bg.fillCircle(0, 0, radius);
        bg.lineStyle(1.5, 0xffffff, 0.6);
        bg.strokeCircle(0, 0, radius);
        container.add(bg);

        const q = scene.add.text(0, 0, '?', {
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        container.add(q);

        const hit = scene.add.circle(0, 0, radius, 0x000000, 0);
        hit.setInteractive({ useHandCursor: true });
        container.add(hit);
        hit.on('pointerup', () => { if (onClick) onClick(); });

        return container;
    },

    /**
     * Curved "back" arrow button, top-left of banner headers
     */
    createBackButton(scene, x, y, onClick = null) {
        const container = scene.add.container(x, y);
        const radius = 20;

        const bg = scene.add.graphics();
        bg.fillStyle(0x000000, 0.25);
        bg.fillCircle(0, 0, radius);
        container.add(bg);

        const arrow = scene.add.text(0, -1, '\u21A9', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            color: '#111111',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        container.add(arrow);

        const hit = scene.add.circle(0, 0, radius, 0x000000, 0);
        hit.setInteractive({ useHandCursor: true });
        container.add(hit);

        hit.on('pointerover', () => container.setScale(1.1));
        hit.on('pointerout', () => container.setScale(1.0));
        hit.on('pointerup', () => {
            container.setScale(1.0);
            if (onClick) onClick();
        });

        return container;
    },

    /**
     * Decorative sunburst / rays behind banners (matches the yellow rays
     * behind the coin pile character art, and red rays behind the Daily
     * Special pedestal).
     */
    createSunburst(scene, x, y, options = {}) {
        const {
            radius = 200,
            rayCount = 16,
            colorA = 0xffdd55,
            colorB = 0xffb700,
            alpha = 1,
        } = options;

        const g = scene.add.graphics();
        g.setPosition(x, y);
        const angleStep = (Math.PI * 2) / rayCount;

        for (let i = 0; i < rayCount; i++) {
            const a0 = i * angleStep;
            const a1 = a0 + angleStep;
            const color = i % 2 === 0 ? colorA : colorB;
            g.fillStyle(color, alpha);
            g.beginPath();
            g.moveTo(0, 0);
            g.lineTo(Math.cos(a0) * radius, Math.sin(a0) * radius);
            g.lineTo(Math.cos(a1) * radius, Math.sin(a1) * radius);
            g.closePath();
            g.fillPath();
        }

        return g;
    },

    /**
     * Soft radial glow made of concentric fading circles (purple equip
     * background glow, red abyss glow, etc).
     */
    createRadialGlow(scene, x, y, options = {}) {
        const {
            radius = 160,
            steps = 6,
            color = UIHelpers.COLORS.ACCENT_PURPLE,
            maxAlpha = 0.35,
        } = options;

        const g = scene.add.graphics();
        g.setPosition(x, y);
        for (let i = steps; i > 0; i--) {
            const r = (radius / steps) * i;
            const alpha = maxAlpha * (1 - i / (steps + 1));
            g.fillStyle(color, alpha);
            g.fillCircle(0, 0, r);
        }
        return g;
    },

    /**
     * Full-width section header strip with centered bold text
     * (e.g. "Diamond", "Gold", "Energy", "Daily Special")
     */
    createSectionHeader(scene, x, y, width, text, options = {}) {
        const {
            height = 30,
            bgColor = 0x33373f,
            bgAlpha = 0.9,
            fontSize = '15px',
            textColor = '#ffffff',
        } = options;

        const container = scene.add.container(x, y);
        const bg = scene.add.graphics();
        bg.fillStyle(bgColor, bgAlpha);
        bg.fillRect(-width / 2, -height / 2, width, height);
        container.add(bg);

        const label = UIHelpers.createOutlineText(scene, 0, 0, text, {
            fontSize,
            color: textColor,
            strokeThickness: 4,
        });
        container.add(label);

        return container;
    },

    /**
     * Rounded menu icon box used for the Lobby side icons
     * (Ranking / Pass / Package / Mail / Mission / Notice)
     */
    createMenuIconBox(scene, x, y, iconKey, label, options = {}) {
        const {
            size = 52,
            onClick = null,
            bgColor = 0x000000,
            bgAlpha = 0.35,
            borderColor = 0xffffff,
            borderAlpha = 0.5,
            iconScale = 0.5,
        } = options;

        const container = scene.add.container(x, y);

        const bg = scene.add.graphics();
        bg.fillStyle(bgColor, bgAlpha);
        bg.fillRoundedRect(-size / 2, -size / 2, size, size, 10);
        bg.lineStyle(1.5, borderColor, borderAlpha);
        bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 10);
        container.add(bg);

        if (iconKey && scene.textures.exists(iconKey)) {
            const icon = scene.add.image(0, -2, iconKey);
            UIHelpers.fitImage(icon, size * 0.6, size * 0.6);
            container.add(icon);
        }

        if (label) {
            const txt = UIHelpers.createOutlineText(scene, 0, size / 2 + 11, label, {
                fontSize: '10px',
                strokeThickness: 3,
            });
            container.add(txt);
        }

        const hit = scene.add.rectangle(0, 0, size, size + 20, 0x000000, 0);
        hit.setInteractive({ useHandCursor: true });
        container.add(hit);

        hit.on('pointerover', () => container.setScale(1.06));
        hit.on('pointerout', () => container.setScale(1.0));
        hit.on('pointerup', () => {
            container.setScale(1.0);
            if (onClick) onClick();
        });

        return container;
    },

    /**
     * Draw a stylized treasure chest using vector graphics.
     * variant: 'wood' | 'blue' | 'mystery'
     */
    createChestIcon(scene, x, y, options = {}) {
        const { size = 90, variant = 'wood' } = options;
        const container = scene.add.container(x, y);
        const g = scene.add.graphics();
        container.add(g);

        const palettes = {
            wood: { body: 0x8a5a2e, bodyDark: 0x6b4522, band: 0xc9c9d1, bandDark: 0x8f8f99, lock: 0xffd54f },
            blue: { body: 0x2f5fa8, bodyDark: 0x1f3f78, band: 0xbfe3ff, bandDark: 0x7fb8e8, lock: 0x4fd1ff },
            mystery: { body: 0x7a4fb0, bodyDark: 0x54327f, band: 0x3fd6c6, bandDark: 0x2a9c90, lock: 0xffd54f },
        };
        const p = palettes[variant] || palettes.wood;

        const w = size;
        const h = size * 0.78;
        const lidH = h * 0.42;

        // Body
        g.fillStyle(p.body, 1);
        g.fillRoundedRect(-w / 2, -h / 2 + lidH, w, h - lidH, 8);
        g.lineStyle(3, p.bodyDark, 1);
        g.strokeRoundedRect(-w / 2, -h / 2 + lidH, w, h - lidH, 8);

        // Lid
        g.fillStyle(p.body, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, lidH + 6, 10);
        g.lineStyle(3, p.bodyDark, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, lidH + 6, 10);

        // Metal bands (vertical)
        [-w * 0.28, w * 0.28].forEach((bx) => {
            g.fillStyle(p.band, 1);
            g.fillRect(bx - 5, -h / 2, 10, h);
            g.lineStyle(1.5, p.bandDark, 1);
            g.strokeRect(bx - 5, -h / 2, 10, h);
        });

        // Horizontal trim where lid meets body
        g.fillStyle(p.band, 1);
        g.fillRect(-w / 2, -h / 2 + lidH - 3, w, 6);

        // Lock plate
        g.fillStyle(p.band, 1);
        g.fillRoundedRect(-11, -h / 2 + lidH - 10, 22, 22, 4);
        g.fillStyle(p.lock, 1);
        g.fillCircle(0, -h / 2 + lidH + 1, 6);

        if (variant === 'mystery') {
            const q = UIHelpers.createOutlineText(scene, 0, -h * 0.06, '?', {
                fontSize: `${Math.round(size * 0.42)}px`,
                color: '#ffd54f',
                strokeColor: '#5a3a00',
                strokeThickness: 5,
            });
            container.add(q);
        } else if (variant === 'blue') {
            g.fillStyle(0x66e0ff, 1);
            g.fillTriangle(0, -h / 2 - 6, -10, -h / 2 + 10, 10, -h / 2 + 10);
            g.fillStyle(0xffffff, 0.85);
            g.fillCircle(0, -h / 2 + 2, 4);
        }

        return container;
    },

    /**
     * Gold hexagonal emblem/badge (used for "Exclusive S-Gear" style icons)
     */
    createEmblemIcon(scene, x, y, options = {}) {
        const { size = 90, gemColor = 0x9b59f7 } = options;
        const container = scene.add.container(x, y);
        const g = scene.add.graphics();
        container.add(g);

        const r = size / 2;
        const pts = [];
        for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i - Math.PI / 2;
            pts.push(new Phaser.Geom.Point(Math.cos(a) * r, Math.sin(a) * r));
        }

        g.fillStyle(0xffd700, 1);
        g.fillPoints(pts, true);
        g.lineStyle(4, 0xb8860b, 1);
        g.strokePoints(pts, true);

        g.fillStyle(0xffe97a, 1);
        g.fillCircle(0, 0, r * 0.55);
        g.lineStyle(2, 0xb8860b, 1);
        g.strokeCircle(0, 0, r * 0.55);

        g.fillStyle(gemColor, 1);
        g.fillCircle(0, 0, r * 0.28);
        g.fillStyle(0xffffff, 0.6);
        g.fillCircle(-r * 0.08, -r * 0.08, r * 0.08);

        return container;
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
            const icon = scene.add.image(0, 0, iconKey);
            UIHelpers.fitImage(icon, size * 0.7, size * 0.7);
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
            const icon = scene.add.image(0, -5, skillData.iconKey);
            UIHelpers.fitImage(icon, size * 0.55, size * 0.55);
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
            const icon = scene.add.image(0, 0, iconKey);
            UIHelpers.fitImage(icon, 24, 24);
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
     * Scale an image so it FITS inside a max box (maxWidth x maxHeight),
     * preserving aspect ratio, regardless of the source texture's native
     * pixel size. This must be used instead of setScale() for any real
     * (non-placeholder) image asset, since our art is exported at wildly
     * different native resolutions (some icons ~1024px, some character
     * art 1500x2700+). setScale(0.4) on a 1024px icon renders at ~410px
     * inside a 450px-wide game and causes the overlap/bleed bugs seen in
     * the UI. fitImage always fits the intended slot size instead.
     */
    fitImage(image, maxWidth, maxHeight) {
        const srcW = image.width;
        const srcH = image.height;
        if (!srcW || !srcH) return image;
        const scale = Math.min(maxWidth / srcW, maxHeight / srcH);
        image.setDisplaySize(srcW * scale, srcH * scale);
        return image;
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
