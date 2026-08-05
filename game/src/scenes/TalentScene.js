/**
 * TalentScene.js - Skill talent grid with 16 skill tiles and upgrade button
 */

class TalentScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TalentScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Dark background (matches reference "Talent Skill" screen)
        this.cameras.main.setBackgroundColor(0x232323);

        // Top bar
        this.topBar = new TopBar(this);

        // Title strip
        const titleBg = this.add.graphics();
        titleBg.fillStyle(0x2a2a2a, 1);
        titleBg.fillRect(0, UIHelpers.CONTENT_Y_START - 4, width, 34);
        UIHelpers.createOutlineText(this, width / 2, UIHelpers.CONTENT_Y_START + 13, 'Talent Skill', {
            fontSize: '19px',
            strokeThickness: 4,
        });

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
        const tileSize = 76;
        const gap = 14;
        const gridWidth = columns * tileSize + (columns - 1) * gap;
        const startX = (width - gridWidth) / 2 + tileSize / 2;
        const startY = UIHelpers.CONTENT_Y_START + 60;

        this.skillTiles = [];

        this.skillsData.forEach((skill, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = startX + col * (tileSize + gap);
            const y = startY + row * (tileSize + gap);

            const tile = this.createPlainSkillTile(x, y, skill, index);
            this.skillTiles.push(tile);
        });
    }

    /**
     * Plain gray rounded-square tile with just the icon centered
     * (matches the clean "Talent Skill" reference grid - no level text
     * on the tile face, selection is shown via border highlight instead).
     */
    createPlainSkillTile(x, y, skillData, index) {
        const size = 68;
        const container = this.add.container(x, y);

        const bg = this.add.graphics();
        bg.fillStyle(0x3a3a3a, 1);
        bg.fillRoundedRect(-size / 2, -size / 2, size, size, 10);
        container.add(bg);

        if (skillData.iconKey && this.textures.exists(skillData.iconKey)) {
            const icon = this.add.image(0, 0, skillData.iconKey).setScale(0.45);
            container.add(icon);
        }

        const hit = this.add.rectangle(0, 0, size, size, 0x000000, 0);
        hit.setInteractive({ useHandCursor: true });
        container.add(hit);

        hit.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x4a4a4a, 1);
            bg.fillRoundedRect(-size / 2, -size / 2, size, size, 10);
        });
        hit.on('pointerout', () => {
            if (this.selectedIndex === index) return;
            bg.clear();
            bg.fillStyle(0x3a3a3a, 1);
            bg.fillRoundedRect(-size / 2, -size / 2, size, size, 10);
        });
        hit.on('pointerup', () => this.onSkillSelect(skillData, index));

        container.bg = bg;
        container.size = size;
        return container;
    }

    highlightTileBg(index, active) {
        const tile = this.skillTiles[index];
        if (!tile) return;
        tile.bg.clear();
        if (active) {
            tile.bg.fillStyle(0x5a4a1a, 1);
            tile.bg.fillRoundedRect(-tile.size / 2, -tile.size / 2, tile.size, tile.size, 10);
            tile.bg.lineStyle(3, UIHelpers.COLORS.ACCENT_GOLD, 1);
            tile.bg.strokeRoundedRect(-tile.size / 2, -tile.size / 2, tile.size, tile.size, 10);
        } else {
            tile.bg.fillStyle(0x3a3a3a, 1);
            tile.bg.fillRoundedRect(-tile.size / 2, -tile.size / 2, tile.size, tile.size, 10);
        }
    }

    createInfoPanel() {
        const { width } = this.scale;
        const panelY = UIHelpers.CONTENT_Y_START + 420;

        this.infoTitle = this.add.text(width / 2, panelY - 10, 'Select a skill to upgrade', {
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GRAY,
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.infoLevel = this.add.text(width / 2, panelY + 12, '', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GOLD,
        }).setOrigin(0.5);
    }

    createUpgradeButton() {
        const { width, height } = this.scale;
        const btnY = height - UIHelpers.BOTTOM_NAV_HEIGHT - 46;

        // Large gold pill button showing cost, matches reference "10000" button
        this.upgradeBtn = UIHelpers.createPillButton(this, width / 2, btnY, 220, 52, '10000', {
            fontSize: '24px',
            bgColor: UIHelpers.COLORS.ACCENT_GOLD,
            borderColor: 0x8a5a00,
            strokeColor: '#7a4a00',
            cornerRadius: 26,
            iconKey: this.textures.exists('currency_gold') ? 'currency_gold' : null,
            iconScale: 0.22,
            onClick: () => this.onUpgradeClick(),
        });
        this.upgradeBtn.setAlpha(0.5); // Disabled until skill selected
        this.upgradeCostLabel = this.upgradeBtn.label;
    }

    onSkillSelect(skillData, index) {
        const prevIndex = this.selectedIndex;
        this.selectedSkill = skillData;
        this.selectedIndex = index;

        // Update info text
        this.infoTitle.setText(skillData.name);
        this.infoTitle.setColor('#ffffff');

        const nextLevel = skillData.level + 1;
        if (skillData.level >= skillData.maxLevel) {
            this.infoLevel.setText('MAX LEVEL REACHED');
            this.infoLevel.setColor('#ffd700');
            this.upgradeBtn.setAlpha(0.3);
        } else {
            this.infoLevel.setText(`Level: ${skillData.level} \u2192 ${nextLevel} / ${skillData.maxLevel}`);
            this.infoLevel.setColor(UIHelpers.COLORS.TEXT_GOLD);
            this.upgradeCostLabel.setText(UIHelpers.formatNumber(skillData.cost));
            this.upgradeBtn.setAlpha(1);
        }

        // Highlight selected tile border, un-highlight previous
        if (prevIndex !== undefined && prevIndex !== index) {
            this.highlightTileBg(prevIndex, false);
        }
        this.highlightTileBg(index, true);
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
