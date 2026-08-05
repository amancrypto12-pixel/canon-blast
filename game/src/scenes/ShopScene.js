/**
 * ShopScene.js - Shop with sub-tabs (Special, Gear, Skill, Top Up)
 * Draw 1x/10x buttons and Top-Up packs with currency deduction
 */

class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Background
        if (this.textures.exists('bg_shop')) {
            const bg = this.add.image(width / 2, height / 2, 'bg_shop');
            bg.setDisplaySize(width, height);
        } else {
            this.cameras.main.setBackgroundColor(UIHelpers.COLORS.DARK_BG);
        }

        // Top bar
        this.topBar = new TopBar(this);

        // Player currency state
        this.playerCurrency = {
            gold: 25000,
            diamonds: 500,
            energy: 120,
        };

        // Sub-tabs
        this.activeSubTab = 0;
        this.createSubTabs();

        // Content area
        this.contentContainer = this.add.container(0, 0);
        this.showSpecialPanel();

        // Bottom nav
        this.bottomNav = new BottomNavBar(this, 'shop');

        UIHelpers.fadeInScene(this);
    }

    createSubTabs() {
        const { width } = this.scale;
        const tabs = [
            { label: 'Special' },
            { label: 'Gear' },
            { label: 'Skill' },
            { label: 'Top Up' },
        ];

        this.tabBar = UIHelpers.createTabBar(this, width / 2, UIHelpers.CONTENT_Y_START + 20, tabs, {
            tabWidth: 90,
            tabHeight: 32,
            gap: 6,
            activeIndex: 0,
            fontSize: '12px',
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

    // --- SPECIAL PANEL (Featured draws) ---
    showSpecialPanel() {
        const { width } = this.scale;
        const centerX = width / 2;
        const contentY = UIHelpers.CONTENT_Y_START + 65;

        // Banner area
        const bannerBg = UIHelpers.createPanel(this, centerX, contentY + 80, width - 30, 160, {
            bgColor: 0x1a0a30,
            alpha: 0.9,
            borderColor: UIHelpers.COLORS.ACCENT_PURPLE,
            borderWidth: 2,
        });
        this.contentContainer.add(bannerBg);

        // Featured item title
        const title = this.add.text(centerX, contentY + 20, '★ Limited Time Draw ★', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GOLD,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.contentContainer.add(title);

        // Featured item image
        if (this.textures.exists('crystal_purple')) {
            const featured = this.add.image(centerX, contentY + 80, 'crystal_purple');
            featured.setScale(0.5);
            this.contentContainer.add(featured);

            // Spin animation
            this.tweens.add({
                targets: featured,
                angle: 360,
                duration: 8000,
                repeat: -1,
                ease: 'Linear',
            });
        }

        const desc = this.add.text(centerX, contentY + 130, 'Chance to get Legendary Equipment!', {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GRAY,
        }).setOrigin(0.5);
        this.contentContainer.add(desc);

        // Draw buttons
        this.createDrawButtons(contentY + 200, 'diamonds', 50, 450);
    }

    // --- GEAR PANEL (Equipment draws) ---
    showGearPanel() {
        const { width } = this.scale;
        const centerX = width / 2;
        const contentY = UIHelpers.CONTENT_Y_START + 65;

        const title = this.add.text(centerX, contentY, 'Gear Draw', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.contentContainer.add(title);

        // Showcase equipment icons
        const equipIcons = ['equip_hat', 'equip_necklace', 'equip_sword', 'equip_shirt', 'equip_boots'];
        const spacing = 60;
        const startX = centerX - ((equipIcons.length - 1) * spacing) / 2;

        equipIcons.forEach((key, i) => {
            if (this.textures.exists(key)) {
                const icon = this.add.image(startX + i * spacing, contentY + 60, key);
                icon.setScale(0.35);
                this.contentContainer.add(icon);

                // Gentle bounce
                this.tweens.add({
                    targets: icon,
                    y: icon.y - 5,
                    duration: 1000 + i * 200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                });
            }
        });

        // Info text
        const info = this.add.text(centerX, contentY + 110, 'Draw for powerful gear upgrades', {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GRAY,
        }).setOrigin(0.5);
        this.contentContainer.add(info);

        // Draw buttons
        this.createDrawButtons(contentY + 160, 'gold', 5000, 45000);
    }

    // --- SKILL PANEL (Skill draws) ---
    showSkillPanel() {
        const { width } = this.scale;
        const centerX = width / 2;
        const contentY = UIHelpers.CONTENT_Y_START + 65;

        const title = this.add.text(centerX, contentY, 'Skill Draw', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.contentContainer.add(title);

        // Showcase skill icons
        const skillIcons = ['skill_attack', 'skill_shield', 'skill_speed', 'skill_luck', 'skill_poison'];
        const spacing = 60;
        const startX = centerX - ((skillIcons.length - 1) * spacing) / 2;

        skillIcons.forEach((key, i) => {
            if (this.textures.exists(key)) {
                const icon = this.add.image(startX + i * spacing, contentY + 60, key);
                icon.setScale(0.35);
                this.contentContainer.add(icon);
            }
        });

        const info = this.add.text(centerX, contentY + 110, 'Draw for rare skill scrolls', {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GRAY,
        }).setOrigin(0.5);
        this.contentContainer.add(info);

        // Draw buttons
        this.createDrawButtons(contentY + 160, 'gold', 3000, 27000);
    }

    // --- TOP UP PANEL (Purchase packs) ---
    showTopUpPanel() {
        const { width } = this.scale;
        const centerX = width / 2;
        const contentY = UIHelpers.CONTENT_Y_START + 65;

        const title = this.add.text(centerX, contentY, 'Top Up Packs', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.contentContainer.add(title);

        // Pack items
        const packs = [
            { name: 'Energy Pack', icon: 'currency_energy', reward: '+60 Energy', cost: 100, currency: 'diamonds', color: 0xff4757 },
            { name: 'Gold Pack', icon: 'currency_gold', reward: '+10,000 Gold', cost: 200, currency: 'diamonds', color: 0xffd700 },
            { name: 'Diamond Pack', icon: 'currency_diamond', reward: '+100 Diamonds', cost: 5000, currency: 'gold', color: 0x00d4ff },
            { name: 'Mega Pack', icon: 'crystal_purple', reward: 'All Resources', cost: 500, currency: 'diamonds', color: 0x9b59b6 },
        ];

        packs.forEach((pack, index) => {
            const py = contentY + 40 + index * 95;
            this.createPackCard(centerX, py, pack);
        });
    }

    // --- SHARED: Draw buttons ---
    createDrawButtons(y, currencyType, cost1x, cost10x) {
        const { width } = this.scale;
        const centerX = width / 2;

        // Draw 1x button
        const draw1Btn = UIHelpers.createButton(this, centerX - 70, y, 120, 44, 'Draw 1x', {
            fontSize: '13px',
            bgColor: UIHelpers.COLORS.ACCENT_PURPLE,
            hoverColor: UIHelpers.COLORS.BUTTON_HOVER,
            cornerRadius: 22,
            onClick: () => this.onDraw(1, currencyType, cost1x),
        });
        this.contentContainer.add(draw1Btn);

        // Cost label for 1x
        const cost1Label = this.add.text(centerX - 70, y + 30, `${UIHelpers.formatNumber(cost1x)} ${currencyType}`, {
            fontSize: '10px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GOLD,
        }).setOrigin(0.5);
        this.contentContainer.add(cost1Label);

        // Draw 10x button
        const draw10Btn = UIHelpers.createButton(this, centerX + 70, y, 120, 44, 'Draw 10x', {
            fontSize: '13px',
            bgColor: UIHelpers.COLORS.ACCENT_GOLD,
            hoverColor: 0xffe44d,
            activeColor: 0xccaa00,
            cornerRadius: 22,
            onClick: () => this.onDraw(10, currencyType, cost10x),
        });
        this.contentContainer.add(draw10Btn);

        // Cost label for 10x
        const cost10Label = this.add.text(centerX + 70, y + 30, `${UIHelpers.formatNumber(cost10x)} ${currencyType}`, {
            fontSize: '10px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GOLD,
        }).setOrigin(0.5);
        this.contentContainer.add(cost10Label);

        // Discount badge on 10x
        const badge = this.add.text(centerX + 120, y - 22, '-10%', {
            fontSize: '9px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            backgroundColor: '#ff4757',
            padding: { x: 4, y: 2 },
        }).setOrigin(0.5);
        this.contentContainer.add(badge);
    }

    // --- SHARED: Pack card for Top Up ---
    createPackCard(x, y, pack) {
        const { width } = this.scale;
        const cardWidth = width - 40;
        const cardHeight = 80;

        // Card background
        const cardBg = UIHelpers.createPanel(this, x, y + 35, cardWidth, cardHeight, {
            bgColor: 0x1a1a2e,
            alpha: 0.9,
            borderColor: pack.color,
            borderWidth: 1,
        });
        this.contentContainer.add(cardBg);

        // Pack icon
        if (this.textures.exists(pack.icon)) {
            const icon = this.add.image(x - cardWidth / 2 + 35, y + 35, pack.icon);
            icon.setScale(0.3);
            this.contentContainer.add(icon);
        }

        // Pack name & reward
        const nameText = this.add.text(x - cardWidth / 2 + 70, y + 22, pack.name, {
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        });
        this.contentContainer.add(nameText);

        const rewardText = this.add.text(x - cardWidth / 2 + 70, y + 40, pack.reward, {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GOLD,
        });
        this.contentContainer.add(rewardText);

        // Purchase button
        const buyBtn = UIHelpers.createButton(this, x + cardWidth / 2 - 55, y + 35, 80, 34, `${pack.cost}`, {
            fontSize: '12px',
            bgColor: pack.color,
            hoverColor: Phaser.Display.Color.IntegerToColor(pack.color).brighten(20).color,
            cornerRadius: 17,
            onClick: () => this.onPurchasePack(pack),
        });
        this.contentContainer.add(buyBtn);
    }

    // --- LOGIC: Handle draw ---
    onDraw(count, currencyType, cost) {
        const current = this.playerCurrency[currencyType] || 0;

        if (current < cost) {
            this.showResult(`Not enough ${currencyType}!`, '#ff4757');
            this.cameras.main.shake(100, 0.003);
            return;
        }

        // Deduct currency
        this.playerCurrency[currencyType] -= cost;
        this.topBar.updateCurrency(currencyType, this.playerCurrency[currencyType]);

        // Show draw result
        this.cameras.main.flash(200, 123, 47, 247);
        this.showResult(`Drew ${count}x! Check your inventory.`, '#2ed573');

        console.log(`[ShopScene] Drew ${count}x for ${cost} ${currencyType}. Remaining: ${this.playerCurrency[currencyType]}`);
    }

    // --- LOGIC: Handle pack purchase ---
    onPurchasePack(pack) {
        const current = this.playerCurrency[pack.currency] || 0;

        if (current < pack.cost) {
            this.showResult(`Not enough ${pack.currency}!`, '#ff4757');
            this.cameras.main.shake(100, 0.003);
            return;
        }

        // Deduct cost
        this.playerCurrency[pack.currency] -= pack.cost;
        this.topBar.updateCurrency(pack.currency, this.playerCurrency[pack.currency]);

        // Add reward
        switch (pack.name) {
            case 'Energy Pack':
                this.playerCurrency.energy += 60;
                this.topBar.updateCurrency('energy', this.playerCurrency.energy);
                break;
            case 'Gold Pack':
                this.playerCurrency.gold += 10000;
                this.topBar.updateCurrency('gold', this.playerCurrency.gold);
                break;
            case 'Diamond Pack':
                this.playerCurrency.diamonds += 100;
                this.topBar.updateCurrency('diamonds', this.playerCurrency.diamonds);
                break;
            case 'Mega Pack':
                this.playerCurrency.energy += 30;
                this.playerCurrency.gold += 5000;
                this.playerCurrency.diamonds += 50;
                this.topBar.updateCurrency('energy', this.playerCurrency.energy);
                this.topBar.updateCurrency('gold', this.playerCurrency.gold);
                this.topBar.updateCurrency('diamonds', this.playerCurrency.diamonds);
                break;
        }

        this.cameras.main.flash(150, 255, 215, 0);
        this.showResult(`${pack.name} purchased! ${pack.reward}`, '#2ed573');

        console.log(`[ShopScene] Purchased ${pack.name} for ${pack.cost} ${pack.currency}`);
    }

    showResult(message, color) {
        const { width } = this.scale;
        const resultText = this.add.text(width / 2, UIHelpers.CONTENT_Y_START + 50, message, {
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            color: color,
            fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(2000);

        this.tweens.add({
            targets: resultText,
            y: resultText.y - 25,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => resultText.destroy(),
        });
    }
}
