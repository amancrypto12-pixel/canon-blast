/**
 * EquipScene.js - Equipment/Character scene with sub-tabs and gear slots
 * Sub-tabs: Character, Equip, Skill, Grade, Fuse
 */

class EquipScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EquipScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Background
        if (this.textures.exists('bg_equip')) {
            const bg = this.add.image(width / 2, height / 2, 'bg_equip');
            bg.setDisplaySize(width, height);
        } else {
            this.cameras.main.setBackgroundColor(UIHelpers.COLORS.DARK_BG);
        }

        // Top bar
        this.topBar = new TopBar(this);

        // Sub-tabs
        this.activeSubTab = 0;
        this.createSubTabs();

        // Content area - default to "Character" tab
        this.contentContainer = this.add.container(0, 0);
        this.showCharacterPanel();

        // Bottom nav
        this.bottomNav = new BottomNavBar(this, 'equip');

        UIHelpers.fadeInScene(this);
    }

    createSubTabs() {
        const { width } = this.scale;
        const tabs = [
            { label: 'Character' },
            { label: 'Equip' },
            { label: 'Skill' },
            { label: 'Grade' },
            { label: 'Fuse' },
        ];

        this.tabBar = UIHelpers.createTabBar(this, width / 2, UIHelpers.CONTENT_Y_START + 20, tabs, {
            tabWidth: 75,
            tabHeight: 32,
            gap: 4,
            activeIndex: 0,
            fontSize: '11px',
            onTabChange: (index, tab) => this.onSubTabChange(index, tab),
        });
    }

    onSubTabChange(index, tab) {
        this.activeSubTab = index;
        this.contentContainer.destroy();
        this.contentContainer = this.add.container(0, 0);

        switch (index) {
            case 0: this.showCharacterPanel(); break;
            case 1: this.showEquipPanel(); break;
            case 2: this.showSkillPanel(); break;
            case 3: this.showGradePanel(); break;
            case 4: this.showFusePanel(); break;
        }
    }

    showCharacterPanel() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const contentY = UIHelpers.CONTENT_Y_START + 60;

        // Character display
        let charKey = this.textures.exists('zoom_char_2') ? 'zoom_char_2' : 'zoom_char_1';
        if (this.textures.exists(charKey)) {
            const char = this.add.image(centerX, contentY + 180, charKey);
            char.setScale(0.55);
            this.contentContainer.add(char);
        }

        // Stats panel
        const statsY = contentY + 350;
        const stats = [
            { label: 'ATK', value: '1,250', color: '#ff4757' },
            { label: 'DEF', value: '840', color: '#2ed573' },
            { label: 'HP', value: '12,500', color: '#ff6b35' },
            { label: 'SPD', value: '120', color: '#00d4ff' },
        ];

        const statsPanel = UIHelpers.createPanel(this, centerX, statsY, width - 40, 80, {
            bgColor: 0x1a1a2e,
            alpha: 0.85,
            borderColor: UIHelpers.COLORS.SLOT_BORDER,
        });
        this.contentContainer.add(statsPanel);

        const statSpacing = (width - 40) / stats.length;
        const statStartX = 40;

        stats.forEach((stat, i) => {
            const sx = statStartX + i * statSpacing;
            const label = this.add.text(sx, statsY - 12, stat.label, {
                fontSize: '10px',
                fontFamily: 'Arial, sans-serif',
                color: UIHelpers.COLORS.TEXT_GRAY,
            }).setOrigin(0.5);
            this.contentContainer.add(label);

            const value = this.add.text(sx, statsY + 8, stat.value, {
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                color: stat.color,
                fontStyle: 'bold',
            }).setOrigin(0.5);
            this.contentContainer.add(value);
        });
    }

    showEquipPanel() {
        const { width } = this.scale;
        const centerX = width / 2;
        const contentY = UIHelpers.CONTENT_Y_START + 80;

        // Equipment slots layout (3x2 grid around character)
        const slots = [
            { key: 'hat', label: 'Hat', icon: 'equip_hat', x: -100, y: 0 },
            { key: 'necklace', label: 'Necklace', icon: 'equip_necklace', x: -100, y: 90 },
            { key: 'ring', label: 'Ring', icon: 'equip_ring', x: -100, y: 180 },
            { key: 'belt', label: 'Belt', icon: 'equip_belt', x: 100, y: 0 },
            { key: 'shirt', label: 'Armor', icon: 'equip_shirt', x: 100, y: 90 },
            { key: 'boots', label: 'Boots', icon: 'equip_boots', x: 100, y: 180 },
        ];

        // Character in center
        if (this.textures.exists('zoom_char_1')) {
            const char = this.add.image(centerX, contentY + 140, 'zoom_char_1');
            char.setScale(0.4);
            char.setAlpha(0.7);
            this.contentContainer.add(char);
        }

        // Equipment slots
        slots.forEach((slot) => {
            const slotWidget = UIHelpers.createEquipSlot(this, centerX + slot.x, contentY + slot.y + 50, slot.key, {
                size: 64,
                iconKey: slot.icon,
                iconScale: 0.45,
                label: slot.label,
                onClick: (key) => this.onEquipSlotClick(key),
            });
            this.contentContainer.add(slotWidget);
        });

        // Equipment info panel at bottom
        const infoY = contentY + 320;
        const infoBg = UIHelpers.createPanel(this, centerX, infoY, width - 40, 100, {
            bgColor: 0x1a1a2e,
            alpha: 0.85,
            borderColor: UIHelpers.COLORS.SLOT_BORDER,
        });
        this.contentContainer.add(infoBg);

        const infoText = this.add.text(centerX, infoY, 'Tap an equipment slot to view details', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GRAY,
        }).setOrigin(0.5);
        this.contentContainer.add(infoText);

        this.equipInfoText = infoText;
    }

    showSkillPanel() {
        const { width } = this.scale;
        const centerX = width / 2;
        const contentY = UIHelpers.CONTENT_Y_START + 80;

        const titleText = this.add.text(centerX, contentY, 'Equipped Skills', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.contentContainer.add(titleText);

        // 4 skill slots
        const slotSize = 70;
        const gap = 15;
        const totalW = 4 * slotSize + 3 * gap;
        const startX = centerX - totalW / 2 + slotSize / 2;

        const skillIcons = ['skill_attack', 'skill_critical', 'skill_speed', 'skill_shield'];

        for (let i = 0; i < 4; i++) {
            const sx = startX + i * (slotSize + gap);
            const slot = UIHelpers.createEquipSlot(this, sx, contentY + 60, `skill_slot_${i}`, {
                size: slotSize,
                iconKey: skillIcons[i],
                iconScale: 0.4,
                label: `Slot ${i + 1}`,
                onClick: () => console.log(`Skill slot ${i + 1} clicked`),
            });
            this.contentContainer.add(slot);
        }
    }

    showGradePanel() {
        const { width } = this.scale;
        const centerX = width / 2;
        const contentY = UIHelpers.CONTENT_Y_START + 120;

        const text = this.add.text(centerX, contentY, 'Grade Up', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.contentContainer.add(text);

        const desc = this.add.text(centerX, contentY + 30, 'Upgrade your character grade\nto unlock new abilities', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GRAY,
            align: 'center',
        }).setOrigin(0.5);
        this.contentContainer.add(desc);

        // Grade progress bar
        const barY = contentY + 80;
        const barWidth = width - 80;
        const barBg = this.add.graphics();
        barBg.fillStyle(0x2a2a4a, 1);
        barBg.fillRoundedRect(centerX - barWidth / 2, barY, barWidth, 16, 8);
        this.contentContainer.add(barBg);

        const barFill = this.add.graphics();
        barFill.fillStyle(UIHelpers.COLORS.ACCENT_GOLD, 1);
        barFill.fillRoundedRect(centerX - barWidth / 2, barY, barWidth * 0.6, 16, 8);
        this.contentContainer.add(barFill);

        const gradeText = this.add.text(centerX, barY + 30, 'Grade B → Grade A  (60%)', {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GOLD,
        }).setOrigin(0.5);
        this.contentContainer.add(gradeText);

        // Upgrade button
        const upgradeBtn = UIHelpers.createButton(this, centerX, barY + 80, 160, 42, 'GRADE UP', {
            fontSize: '14px',
            bgColor: UIHelpers.COLORS.ACCENT_GOLD,
            hoverColor: 0xffe44d,
            activeColor: 0xccaa00,
            onClick: () => console.log('Grade Up clicked'),
        });
        this.contentContainer.add(upgradeBtn);
    }

    showFusePanel() {
        const { width } = this.scale;
        const centerX = width / 2;
        const contentY = UIHelpers.CONTENT_Y_START + 120;

        const text = this.add.text(centerX, contentY, 'Fuse Equipment', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.contentContainer.add(text);

        const desc = this.add.text(centerX, contentY + 30, 'Combine duplicate equipment\nto create stronger versions', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GRAY,
            align: 'center',
        }).setOrigin(0.5);
        this.contentContainer.add(desc);

        // Fuse slots (2 source + 1 result)
        const slotY = contentY + 110;
        const sourceSlot1 = UIHelpers.createEquipSlot(this, centerX - 80, slotY, 'fuse_src_1', {
            size: 64,
            label: 'Source 1',
            onClick: () => console.log('Fuse source 1'),
        });
        this.contentContainer.add(sourceSlot1);

        // Plus sign
        const plus = this.add.text(centerX, slotY, '+', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.contentContainer.add(plus);

        const sourceSlot2 = UIHelpers.createEquipSlot(this, centerX + 80, slotY, 'fuse_src_2', {
            size: 64,
            label: 'Source 2',
            onClick: () => console.log('Fuse source 2'),
        });
        this.contentContainer.add(sourceSlot2);

        // Arrow down
        const arrow = this.add.text(centerX, slotY + 60, '▼', {
            fontSize: '20px',
            color: UIHelpers.COLORS.TEXT_GOLD,
        }).setOrigin(0.5);
        this.contentContainer.add(arrow);

        // Result slot
        const resultSlot = UIHelpers.createEquipSlot(this, centerX, slotY + 120, 'fuse_result', {
            size: 72,
            label: 'Result',
            onClick: () => console.log('Fuse result'),
        });
        this.contentContainer.add(resultSlot);

        // Fuse button
        const fuseBtn = UIHelpers.createButton(this, centerX, slotY + 200, 160, 42, 'FUSE', {
            fontSize: '14px',
            bgColor: UIHelpers.COLORS.ACCENT_PURPLE,
            onClick: () => console.log('Fuse clicked'),
        });
        this.contentContainer.add(fuseBtn);
    }

    onEquipSlotClick(slotKey) {
        console.log(`[EquipScene] Equipment slot clicked: ${slotKey}`);
        if (this.equipInfoText) {
            const names = {
                hat: 'Wizard Hat +5 (ATK +120)',
                necklace: 'Diamond Pendant (CRIT +8%)',
                ring: 'Power Ring (ATK +80)',
                belt: 'Dragon Belt (DEF +100)',
                shirt: 'Mythic Armor (HP +2000)',
                boots: 'Swift Boots (SPD +25)',
            };
            this.equipInfoText.setText(names[slotKey] || `Selected: ${slotKey}`);
            this.equipInfoText.setColor(UIHelpers.COLORS.TEXT_GOLD);
        }
    }
}
