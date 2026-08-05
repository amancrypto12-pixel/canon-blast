/**
 * TalentScene.js - Skill talent grid with 16 skill tiles and upgrade button
 */

class TalentScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TalentScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Background
        if (this.textures.exists('bg_talent')) {
            const bg = this.add.image(width / 2, height / 2, 'bg_talent');
            bg.setDisplaySize(width, height);
        } else {
            this.cameras.main.setBackgroundColor(UIHelpers.COLORS.DARK_BG);
        }

        // Top bar
        this.topBar = new TopBar(this);

        // Title
        this.add.text(width / 2, UIHelpers.CONTENT_Y_START + 20, 'Talent Skills', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Player gold (for upgrade cost tracking)
        this.playerGold = 25000;
        this.selectedSkill = null;

        // Skill data
        this.skillsData = this.getSkillsData();

        // Create skill grid
        this.createSkillGrid();

        // Selected skill info panel
        this.createInfoPanel();

        // Upgrade button
        this.createUpgradeButton();

        // Bottom nav
        this.bottomNav = new BottomNavBar(this, 'talent');

        UIHelpers.fadeInScene(this);
    }

    getSkillsData() {
        return [
            { id: 0, name: 'Attack Power', iconKey: 'skill_attack', level: 5, maxLevel: 20, cost: 10000, color: 0xff4757 },
            { id: 1, name: 'Critical Hit', iconKey: 'skill_critical', level: 3, maxLevel: 20, cost: 10000, color: 0xff6b35 },
            { id: 2, name: 'Speed Boost', iconKey: 'skill_speed', level: 7, maxLevel: 20, cost: 10000, color: 0x00d4ff },
            { id: 3, name: 'Health Regen', iconKey: 'skill_health', level: 4, maxLevel: 20, cost: 10000, color: 0x2ed573 },
            { id: 4, name: 'Mana Pool', iconKey: 'skill_mana', level: 2, maxLevel: 20, cost: 10000, color: 0x3498db },
            { id: 5, name: 'Shield Wall', iconKey: 'skill_shield', level: 6, maxLevel: 20, cost: 10000, color: 0x9b59b6 },
            { id: 6, name: 'Iron Defense', iconKey: 'skill_defense', level: 1, maxLevel: 20, cost: 10000, color: 0x7f8c8d },
            { id: 7, name: 'Helm Guard', iconKey: 'skill_range_def', level: 3, maxLevel: 20, cost: 10000, color: 0x2c3e50 },
            { id: 8, name: 'Poison Strike', iconKey: 'skill_poison', level: 0, maxLevel: 20, cost: 10000, color: 0x27ae60 },
            { id: 9, name: 'Lucky Star', iconKey: 'skill_luck', level: 4, maxLevel: 20, cost: 10000, color: 0xf1c40f },
            { id: 10, name: 'Time Warp', iconKey: 'skill_time', level: 2, maxLevel: 20, cost: 10000, color: 0xe67e22 },
            { id: 11, name: 'Crystal Burst', iconKey: 'skill_blue_crystal', level: 5, maxLevel: 20, cost: 10000, color: 0x00d4ff },
            { id: 12, name: 'Aegis Shield', iconKey: 'skill_blue_shield', level: 1, maxLevel: 20, cost: 10000, color: 0x2980b9 },
            { id: 13, name: 'Wind Walk', iconKey: 'skill_boot_wings', level: 8, maxLevel: 20, cost: 10000, color: 0xf39c12 },
            { id: 14, name: 'Fire Storm', iconKey: 'skill_attack', level: 3, maxLevel: 20, cost: 10000, color: 0xe74c3c },
            { id: 15, name: 'Frost Nova', iconKey: 'skill_blue_crystal', level: 0, maxLevel: 20, cost: 10000, color: 0x1abc9c },
        ];
    }

    createSkillGrid() {
        const { width } = this.scale;
        const columns = 4;
        const rows = 4;
        const tileSize = 74;
        const gap = 10;
        const gridWidth = columns * tileSize + (columns - 1) * gap;
        const startX = (width - gridWidth) / 2 + tileSize / 2;
        const startY = UIHelpers.CONTENT_Y_START + 60;

        this.skillTiles = [];

        this.skillsData.forEach((skill, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = startX + col * (tileSize + gap);
            const y = startY + row * (tileSize + gap);

            const tile = UIHelpers.createSkillTile(this, x, y, skill, {
                size: tileSize,
                onClick: (data) => this.onSkillSelect(data, index),
            });

            this.skillTiles.push(tile);
        });
    }

    createInfoPanel() {
        const { width } = this.scale;
        const panelY = UIHelpers.CONTENT_Y_START + 420;

        // Info panel background
        this.infoPanelBg = UIHelpers.createPanel(this, width / 2, panelY, width - 40, 90, {
            bgColor: 0x1a1a2e,
            alpha: 0.9,
            borderColor: UIHelpers.COLORS.SLOT_BORDER,
        });

        // Default info text
        this.infoTitle = this.add.text(width / 2, panelY - 20, 'Select a skill to upgrade', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.infoDetail = this.add.text(width / 2, panelY + 8, 'Tap any skill tile above', {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GRAY,
        }).setOrigin(0.5);

        this.infoLevel = this.add.text(width / 2, panelY + 28, '', {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GOLD,
        }).setOrigin(0.5);
    }

    createUpgradeButton() {
        const { width, height } = this.scale;
        const btnY = height - UIHelpers.BOTTOM_NAV_HEIGHT - 50;

        // Gold cost display
        this.costDisplay = this.add.container(width / 2, btnY - 25);
        const costIcon = this.textures.exists('currency_gold')
            ? this.add.image(-40, 0, 'currency_gold').setScale(0.2)
            : this.add.graphics().fillStyle(UIHelpers.COLORS.ACCENT_GOLD, 1).fillCircle(-40, 0, 8);
        this.costDisplay.add(costIcon);

        this.costText = this.add.text(-20, 0, '10,000', {
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GOLD,
            fontStyle: 'bold',
        }).setOrigin(0, 0.5);
        this.costDisplay.add(this.costText);
        this.costDisplay.setAlpha(0.5);

        // Upgrade button
        this.upgradeBtn = UIHelpers.createButton(this, width / 2, btnY + 10, 200, 46, 'UPGRADE', {
            fontSize: '16px',
            bgColor: UIHelpers.COLORS.ACCENT_GOLD,
            hoverColor: 0xffe44d,
            activeColor: 0xccaa00,
            cornerRadius: 23,
            onClick: () => this.onUpgradeClick(),
        });
        this.upgradeBtn.setAlpha(0.5); // Disabled until skill selected
    }

    onSkillSelect(skillData, index) {
        this.selectedSkill = skillData;
        this.selectedIndex = index;

        // Update info panel
        this.infoTitle.setText(skillData.name);
        this.infoTitle.setColor('#ffffff');

        const nextLevel = skillData.level + 1;
        if (skillData.level >= skillData.maxLevel) {
            this.infoDetail.setText('MAX LEVEL REACHED');
            this.infoDetail.setColor('#ffd700');
            this.infoLevel.setText(`Level: ${skillData.level}/${skillData.maxLevel}`);
            this.upgradeBtn.setAlpha(0.3);
            this.costDisplay.setAlpha(0.3);
        } else {
            this.infoDetail.setText(`Increases effect by +${nextLevel * 5}%`);
            this.infoDetail.setColor(UIHelpers.COLORS.TEXT_GRAY);
            this.infoLevel.setText(`Level: ${skillData.level} → ${nextLevel} / ${skillData.maxLevel}`);
            this.costText.setText(UIHelpers.formatNumber(skillData.cost));
            this.upgradeBtn.setAlpha(1);
            this.costDisplay.setAlpha(1);
        }

        // Highlight selected tile
        this.highlightSelectedTile(index);
    }

    highlightSelectedTile(activeIndex) {
        // Visual pulse on selected tile
        this.skillTiles.forEach((tile, i) => {
            tile.setScale(i === activeIndex ? 1.08 : 1.0);
        });

        if (this.selectedTween) this.selectedTween.stop();
        this.selectedTween = this.tweens.add({
            targets: this.skillTiles[activeIndex],
            scaleX: 1.12,
            scaleY: 1.12,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    onUpgradeClick() {
        if (!this.selectedSkill) {
            this.showFeedback('Select a skill first!', '#ff4757');
            return;
        }

        if (this.selectedSkill.level >= this.selectedSkill.maxLevel) {
            this.showFeedback('Already at max level!', '#ffd700');
            return;
        }

        if (this.playerGold < this.selectedSkill.cost) {
            this.showFeedback('Not enough Gold!', '#ff4757');
            this.cameras.main.shake(100, 0.003);
            return;
        }

        // Deduct gold
        this.playerGold -= this.selectedSkill.cost;
        this.topBar.updateCurrency('gold', this.playerGold);

        // Level up the skill
        this.selectedSkill.level += 1;

        // Visual feedback
        this.cameras.main.flash(150, 255, 215, 0);
        this.showFeedback(`${this.selectedSkill.name} upgraded to Lv.${this.selectedSkill.level}!`, '#2ed573');

        // Refresh display
        this.onSkillSelect(this.selectedSkill, this.selectedIndex);

        // Rebuild skill grid to show updated levels
        this.skillTiles.forEach(tile => tile.destroy());
        this.skillTiles = [];
        this.createSkillGrid();
        this.highlightSelectedTile(this.selectedIndex);
    }

    showFeedback(message, color) {
        const { width } = this.scale;
        const feedback = this.add.text(width / 2, UIHelpers.CONTENT_Y_START + 400, message, {
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            color: color,
            fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(2000);

        this.tweens.add({
            targets: feedback,
            y: feedback.y - 30,
            alpha: 0,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => feedback.destroy(),
        });
    }
}
