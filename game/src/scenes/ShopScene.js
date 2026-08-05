/**
 * ShopScene.js - Shop with sub-tabs (Special, Gear, Skill, Top Up)
 * Redesigned to match reference art: banner header w/ back button,
 * chest/draw cards with Draw 1x/10x pills, and a dark sub-tab footer
 * (Special / Gear / Skill / Top Up) instead of the main 5-icon nav.
 */

class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Dark base background
        this.cameras.main.setBackgroundColor(0x23262e);

        // Player currency state
        this.playerCurrency = {
            gold: 25000,
            diamonds: 500,
            energy: 120,
            stars: 1000,
        };

        this.bannerHeight = 172;
        this.footerHeight = 66;

        // Banner header (back button + fire creature/coin decoration)
        this.createBanner();

        // Sub-tab footer bar
        this.activeSubTab = 0;
        this.createSubTabFooter();

        // Content area
        this.contentContainer = this.add.container(0, 0);
        this.showSpecialPanel();

        UIHelpers.fadeInScene(this);
    }

    // --- BANNER HEADER ---
    createBanner() {
        const { width } = this.scale;
        const bh = this.bannerHeight;
        const centerX = width / 2;
        const centerY = bh / 2;

        // Sunburst backdrop
        const mask = this.add.graphics();
        mask.fillStyle(0xffffff, 1);
        mask.fillRect(0, 0, width, bh);
        const maskShape = mask.createGeometryMask();

        const burst = UIHelpers.createSunburst(this, centerX, centerY, {
            radius: width * 0.9,
            rayCount: 20,
            colorA: 0xffe066,
            colorB: 0xffb700,
        });
        burst.setMask(maskShape);

        // Coin piles (drawn) flanking the center monster
        const coinPositions = [-140, -95, 95, 140];
        coinPositions.forEach((dx) => {
            const coin = this.add.graphics();
            coin.setPosition(centerX + dx, bh - 30);
            coin.fillStyle(0xffd54f, 1);
            coin.fillEllipse(0, 0, 46, 30);
            coin.lineStyle(3, 0xc98a1a, 1);
            coin.strokeEllipse(0, 0, 46, 30);
            coin.fillStyle(0xffe999, 1);
            coin.fillEllipse(0, -6, 34, 18);
        });

        // Center fire-creature (Cinder Hound stand-in for the boss art)
        if (this.textures.exists('char_monster')) {
            const monster = this.add.image(centerX, bh - 45, 'char_monster');
            monster.setScale(0.45);
            monster.setTint(0xffb060);
        }

        // Back button (top-left)
        UIHelpers.createBackButton(this, 30, 30, () => this.onBack());

        // Bottom edge shadow to separate banner from content
        const shadow = this.add.graphics();
        shadow.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.35, 0.35);
        shadow.fillRect(0, bh - 20, width, 20);
    }

    onBack() {
        this.scene.start('LobbyScene');
    }

    // --- SUB-TAB FOOTER (Special / Gear / Skill / Top Up) ---
    createSubTabFooter() {
        const { width, height } = this.scale;
        const footerY = height - this.footerHeight / 2;

        const bg = this.add.graphics();
        bg.fillStyle(0x1c1e24, 1);
        bg.fillRect(0, height - this.footerHeight, width, this.footerHeight);
        bg.lineStyle(1, 0x3a3a44, 1);
        bg.lineBetween(0, height - this.footerHeight, width, height - this.footerHeight);

        const tabs = [
            { label: 'Special' },
            { label: 'Gear' },
            { label: 'Skill' },
            { label: 'Top Up' },
        ];

        this.tabBar = UIHelpers.createTabBar(this, width / 2, footerY, tabs, {
            tabWidth: 92,
            tabHeight: 36,
            gap: 6,
            activeIndex: 0,
            fontSize: '13px',
            activeColor: UIHelpers.COLORS.ACCENT_PURPLE,
            inactiveColor: 0x2a2c34,
            showInactiveBg: true,
            onTabChange: (index, tab) => this.onSubTabChange(index, tab),
        });
    }

    onSubTabChange(index, tab) {
        this.activeSubTab = index;
        this.contentContainer.destroy();
        this.contentContainer = this.add.container(0, 0);

        switch (index) {
            case 0: this.showSpecialPanel(); break;
            case 1: this.showGearPanel(); break;
            case 2: this.showSkillPanel(); break;
            case 3: this.showTopUpPanel(); break;
        }
    }

    // --- SPECIAL PANEL (Daily Special pedestal) ---
    showSpecialPanel() {
        const { width } = this.scale;
        const centerX = width / 2;
        const topY = this.bannerHeight;

        // Section header
        const header = UIHelpers.createSectionHeader(this, centerX, topY + 18, width, 'Daily Special', {
            height: 34,
            fontSize: '17px',
        });
        this.contentContainer.add(header);

        // Red sunburst display area
        const displayH = 300;
        const displayY = topY + 40;

        const dispMask = this.make.graphics({ x: 0, y: 0, add: false });
        dispMask.fillRect(0, displayY, width, displayH);

        const burst = UIHelpers.createSunburst(this, centerX, displayY + displayH / 2, {
            radius: width,
            rayCount: 18,
            colorA: 0xd91f2e,
            colorB: 0x8f1018,
        });
        burst.setMask(dispMask.createGeometryMask());
        this.contentContainer.add(burst);

        // Stone pedestal (drawn)
        const pedestalY = displayY + displayH / 2 + 40;
        const pedestal = this.add.graphics();
        pedestal.setPosition(centerX, pedestalY);
        const tiers = [
            { w: 150, h: 26, dy: 40 },
            { w: 120, h: 24, dy: 16 },
            { w: 95, h: 22, dy: -6 },
            { w: 70, h: 40, dy: -40 },
        ];
        tiers.forEach((t) => {
            pedestal.fillStyle(0xc9c9c9, 1);
            pedestal.fillRoundedRect(-t.w / 2, t.dy - t.h / 2, t.w, t.h, 6);
            pedestal.lineStyle(2, 0x8a8a8a, 1);
            pedestal.strokeRoundedRect(-t.w / 2, t.dy - t.h / 2, t.w, t.h, 6);
        });
        this.contentContainer.add(pedestal);

        // Star reward pill button
        const btnY = displayY + displayH + 30;
        const rewardBtn = UIHelpers.createPillButton(this, centerX, btnY, 190, 46, '1000', {
            fontSize: '22px',
            bgColor: 0x4fc3ff,
            borderColor: 0x1a7fbf,
            strokeColor: '#0a4a70',
            iconKey: this.textures.exists('star_icon') ? 'star_icon' : null,
            iconScale: 0.12,
            cornerRadius: 23,
            onClick: () => this.onClaimDailySpecial(),
        });
        this.contentContainer.add(rewardBtn);
    }

    onClaimDailySpecial() {
        this.cameras.main.flash(200, 255, 215, 0);
        this.showResult('Daily Special claimed!', '#2ed573');
    }

    // --- GEAR PANEL (Exclusive S-Gear Chest + Gear Chest) ---
    showGearPanel() {
        const { width } = this.scale;
        const centerX = width / 2;
        const topY = this.bannerHeight + 14;

        this.createChestCard(centerX, topY, {
            title: 'Exclusive S-Gear Chest',
            desc: 'May give Exclusive S Epic equipment',
            accentColor: 0x2f6fd8,
            panelColor: 0x101a30,
            emblem: true,
            draws: [
                { label: 'Draw 1x', cost: 300, currency: 'diamonds' },
                { label: 'Draw 10x', cost: 2800, currency: 'diamonds' },
            ],
        });

        this.createChestCard(centerX, topY + 268, {
            title: 'Gear Chest',
            desc: 'May give Normal Grade equipment',
            accentColor: 0x8a4fd8,
            panelColor: 0x241a3a,
            chestVariant: 'wood',
            draws: [
                { label: 'Draw 1x', cost: 200, currency: 'gold' },
                { label: 'Draw 1x', cost: 1800, currency: 'diamonds', color: 0x2ed573 },
            ],
        });
    }

    // --- SKILL PANEL (Exclusive Skill Chest + Skill Chest) ---
    showSkillPanel() {
        const { width } = this.scale;
        const centerX = width / 2;
        const topY = this.bannerHeight + 14;

        this.createChestCard(centerX, topY, {
            title: 'Exclusive SkiLL Chest',
            desc: 'Contains exclusive Common, Magic, Rare, or Epic equipment',
            accentColor: 0x8a4fd8,
            panelColor: 0x241a3a,
            chestVariant: 'blue',
            draws: [
                { label: 'Draw 1x', cost: 300, currency: 'diamonds' },
                { label: 'Draw 10x', cost: 2800, currency: 'diamonds' },
            ],
        });

        this.createChestCard(centerX, topY + 268, {
            title: 'SkiLL Chest',
            desc: 'Contains Common, Magic, or Rare equipment',
            accentColor: 0x2f6fd8,
            panelColor: 0x101a30,
            chestVariant: 'mystery',
            draws: [
                { label: 'Draw 1x', cost: 200, currency: 'gold' },
                { label: 'Draw 1x', cost: 1800, currency: 'diamonds', color: 0x2ed573 },
            ],
        });
    }

    // --- SHARED: chest/gear draw card ---
    createChestCard(centerX, topY, cfg) {
        const { width } = this.scale;
        const cardW = width - 24;
        const cardH = 250;
        const cardY = topY + cardH / 2;

        // Outer accent-colored card background
        const card = UIHelpers.createPanel(this, centerX, cardY, cardW, cardH, {
            bgColor: cfg.panelColor,
            alpha: 1,
            cornerRadius: 16,
            borderColor: cfg.accentColor,
            borderWidth: 3,
        });
        this.contentContainer.add(card);

        // Title bar
        const titleBg = this.add.graphics();
        titleBg.fillStyle(cfg.accentColor, 1);
        titleBg.fillRoundedRect(centerX - cardW / 2 + 3, topY + 3, cardW - 6, 34, { tl: 13, tr: 13, bl: 0, br: 0 });
        this.contentContainer.add(titleBg);

        const title = UIHelpers.createOutlineText(this, centerX, topY + 20, cfg.title, {
            fontSize: '15px',
            strokeThickness: 3,
        });
        this.contentContainer.add(title);

        // Info badge
        const info = UIHelpers.createInfoBadge(this, centerX + cardW / 2 - 22, topY + 20, {
            onClick: () => this.showResult(cfg.desc, '#ffffff'),
        });
        this.contentContainer.add(info);

        // Description panel (left)
        const descX = centerX - cardW / 2 + 95;
        const descY = topY + 95;
        const descBg = UIHelpers.createPanel(this, descX, descY, 155, 80, {
            bgColor: 0x000000,
            alpha: 0.3,
            cornerRadius: 12,
        });
        this.contentContainer.add(descBg);

        const descText = this.add.text(descX, descY, cfg.desc, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: 140 },
        }).setOrigin(0.5);
        this.contentContainer.add(descText);

        // Chest/emblem art (right)
        const artX = centerX + cardW / 2 - 68;
        const artY = topY + 95;
        let art;
        if (cfg.emblem) {
            art = UIHelpers.createEmblemIcon(this, artX, artY, { size: 82 });
        } else {
            art = UIHelpers.createChestIcon(this, artX, artY, { size: 82, variant: cfg.chestVariant || 'wood' });
        }
        this.contentContainer.add(art);
        this.tweens.add({
            targets: art,
            y: artY - 6,
            duration: 1400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Draw buttons row
        const drawY = topY + 205;
        const gap = 16;
        const btnW = (cardW - 40 - gap) / 2;
        const startX = centerX - cardW / 2 + 20 + btnW / 2;

        cfg.draws.forEach((draw, i) => {
            const bx = startX + i * (btnW + gap);
            const pillColor = draw.color || UIHelpers.COLORS.ACCENT_GOLD;
            const currencyIcon = draw.currency === 'diamonds' ? 'currency_diamond'
                : draw.currency === 'gold' ? 'currency_gold' : 'currency_energy';

            const btn = UIHelpers.createPillButton(this, bx, drawY, btnW, 40, draw.label, {
                fontSize: '13px',
                bgColor: pillColor,
                borderColor: 0x00000055,
                strokeColor: '#00000088',
                cornerRadius: 20,
                onClick: () => this.onDraw(draw.label.includes('10') ? 10 : 1, draw.currency, draw.cost),
            });
            this.contentContainer.add(btn);

            // cost tag under button
            const costPill = UIHelpers.createCurrencyPill(this, bx, drawY + 30, currencyIcon, draw.cost, {
                width: btnW - 6,
                height: 20,
                bgColor: 0x0a0a12,
                borderColor: 0x333344,
                fontSize: '10px',
                iconScale: 0.16,
            });
            this.contentContainer.add(costPill);
        });
    }

    // --- TOP UP PANEL (Diamond / Gold / Energy sections) ---
    showTopUpPanel() {
        const { width } = this.scale;
        const centerX = width / 2;
        let y = this.bannerHeight + 8;

        y = this.createTopUpSection(centerX, y, 'Diamond', [
            { amount: 500, cost: 250, icon: 'currency_diamond', currencyType: 'diamonds' },
            { amount: 1500, cost: 500, icon: 'currency_diamond', currencyType: 'diamonds' },
            { amount: 6000, cost: 2000, icon: 'currency_diamond', currencyType: 'diamonds' },
            { amount: 15000, cost: 5000, icon: 'currency_diamond', currencyType: 'diamonds', chest: true },
        ], 'star_icon');

        y = this.createTopUpSection(centerX, y + 10, 'Gold', [
            { amount: 6000, cost: 15, icon: 'currency_gold', currencyType: 'gold' },
            { amount: 50000, cost: 150, icon: 'currency_gold', currencyType: 'gold' },
            { amount: 100000, cost: 6000, icon: 'currency_gold', currencyType: 'gold' },
            { amount: 300000, cost: 10000, icon: 'currency_gold', currencyType: 'gold', chest: true },
        ], 'currency_diamond');

        y = this.createTopUpSection(centerX, y + 10, 'Energy', [
            { amount: 5, cost: 0, icon: 'currency_energy', currencyType: 'energy', free: true },
            { amount: 10, cost: 20, icon: 'currency_energy', currencyType: 'energy' },
            { amount: 20, cost: 100, icon: 'currency_energy', currencyType: 'energy' },
            { amount: 100, cost: 500, icon: 'currency_energy', currencyType: 'energy' },
        ], 'currency_diamond');
    }

    createTopUpSection(centerX, y, title, items, costIconKey) {
        const { width } = this.scale;
        const header = UIHelpers.createSectionHeader(this, centerX, y, width, title, { height: 28, fontSize: '14px' });
        this.contentContainer.add(header);

        const cardY = y + 20 + 55;
        const cardW = 96;
        const cardH = 100;
        const gap = 8;
        const totalW = items.length * cardW + (items.length - 1) * gap;
        const startX = centerX - totalW / 2 + cardW / 2;

        items.forEach((item, i) => {
            const cx = startX + i * (cardW + gap);
            this.createTopUpCard(cx, cardY, cardW, cardH, item, costIconKey);
        });

        return cardY + cardH / 2;
    }

    createTopUpCard(x, y, w, h, item, costIconKey) {
        const card = UIHelpers.createPanel(this, x, y, w, h, {
            bgColor: 0x1a1c24,
            alpha: 0.95,
            cornerRadius: 10,
            borderColor: 0x3a3d48,
            borderWidth: 2,
        });
        this.contentContainer.add(card);

        // Amount text
        const amountText = UIHelpers.createOutlineText(this, x, y - h / 2 + 16, UIHelpers.formatNumber(item.amount), {
            fontSize: '13px',
            strokeThickness: 3,
        });
        this.contentContainer.add(amountText);

        // Icon
        if (this.textures.exists(item.icon)) {
            const icon = this.add.image(x, y - 4, item.icon).setScale(0.28);
            this.contentContainer.add(icon);
        }

        // Cost pill at bottom
        if (item.free) {
            const freeBtn = UIHelpers.createPillButton(this, x, y + h / 2 - 12, w - 12, 22, 'Free', {
                fontSize: '11px',
                bgColor: 0x2ed573,
                borderColor: 0x1a8f4a,
                strokeColor: '#0a5a2a',
                cornerRadius: 11,
                onClick: () => this.onPurchaseTopUp(item),
            });
            this.contentContainer.add(freeBtn);
        } else {
            const costPill = UIHelpers.createCurrencyPill(this, x, y + h / 2 - 12, costIconKey, item.cost, {
                width: w - 12,
                height: 22,
                bgColor: 0x0d2033,
                borderColor: 0x2a7a9a,
                fontSize: '11px',
                iconScale: 0.16,
            });
            this.contentContainer.add(costPill);

            const hit = this.add.rectangle(x, y + h / 2 - 12, w - 12, 22, 0x000000, 0);
            hit.setInteractive({ useHandCursor: true });
            hit.on('pointerup', () => this.onPurchaseTopUp(item));
            this.contentContainer.add(hit);
        }
    }

    onPurchaseTopUp(item) {
        this.cameras.main.flash(150, 255, 215, 0);
        this.playerCurrency[item.currencyType] = (this.playerCurrency[item.currencyType] || 0) + item.amount;
        this.showResult(`+${UIHelpers.formatNumber(item.amount)} ${item.currencyType}!`, '#2ed573');
    }

    // --- LOGIC: Handle draw ---
    onDraw(count, currencyType, cost) {
        const current = this.playerCurrency[currencyType] || 0;

        if (current < cost) {
            this.showResult(`Not enough ${currencyType}!`, '#ff4757');
            this.cameras.main.shake(100, 0.003);
            return;
        }

        this.playerCurrency[currencyType] -= cost;

        this.cameras.main.flash(200, 123, 47, 247);
        this.showResult(`Drew ${count}x! Check your inventory.`, '#2ed573');

        console.log(`[ShopScene] Drew ${count}x for ${cost} ${currencyType}. Remaining: ${this.playerCurrency[currencyType]}`);
    }

    showResult(message, color) {
        const { width } = this.scale;
        const resultText = this.add.text(width / 2, this.bannerHeight + 10, message, {
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            color: color,
            fontStyle: 'bold',
            wordWrap: { width: width - 60 },
            align: 'center',
        }).setOrigin(0.5).setDepth(2000);

        this.tweens.add({
            targets: resultText,
            y: resultText.y - 20,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => resultText.destroy(),
        });
    }
}
