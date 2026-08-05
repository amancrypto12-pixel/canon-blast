/**
 * EquipScene.js - Equipment/Character scene with sub-tabs and gear slots
 * Redesigned to match reference art: purple radial-glow header with 6
 * outlined equipment slot placeholders, a dark Character/Equip/Skill tab
 * bar (yellow active pill + underline), and a Grade/Fuse button row.
 */

class EquipScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EquipScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Dark base background
        this.cameras.main.setBackgroundColor(0x2a2a2a);

        // Top bar
        this.topBar = new TopBar(this);

        this.glowAreaY = UIHelpers.CONTENT_Y_START;
        this.glowAreaHeight = 300;

        // Purple radial-glow panel with 6 equipment slot placeholders
        this.createGlowPanel();
        this.createEquipSlots();

        // Character / Equip / Skill tab bar
        this.tabBarY = this.glowAreaY + this.glowAreaHeight + 22;
        this.activeSubTab = 0;
        this.createSubTabs();

        // Grade / Fuse button row
        this.gradeFuseY = this.tabBarY + 38;
        this.createGradeFuseRow();

        // Content area (below Grade/Fuse row) - default to "Character" tab
        this.contentY = this.gradeFuseY + 40;
        this.contentContainer = this.add.container(0, 0);
        this.showCharacterPanel();

        // Bottom nav
        this.bottomNav = new BottomNavBar(this, 'equip');

        UIHelpers.fadeInScene(this);
    }

    createGlowPanel() {
        const { width } = this.scale;
        const centerX = width / 2;
        const centerY = this.glowAreaY + this.glowAreaHeight / 2;

        // Dark backing so the glow reads clearly against the scene bg
        const backing = this.add.graphics();
        backing.fillStyle(0x1c1c1c, 1);
        backing.fillRect(0, this.glowAreaY, width, this.glowAreaHeight);

        // Mask the glow to the panel area
        const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
        maskShape.fillRect(0, this.glowAreaY, width, this.glowAreaHeight);

        const glow = UIHelpers.createRadialGlow(this, centerX, centerY, {
            radius: width * 0.75,
            steps: 8,
            color: UIHelpers.COLORS.ACCENT_PURPLE,
            maxAlpha: 0.9,
        });
        glow.setMask(maskShape.createGeometryMask());

        // Base purple wash so corners aren't pure black
        const wash = this.add.graphics();
        wash.fillStyle(0x5a1fb0, 0.5);
        wash.fillRect(0, this.glowAreaY, width, this.glowAreaHeight);
        wash.setDepth(-1);
    }

    /**
     * 6 outlined "empty" equipment slot placeholders positioned like the
     * reference: hat (TL), necklace (TR), ring (ML), pouch/belt (MR),
     * shirt (BL), boots (BR).
     */
    createEquipSlots() {
        const { width } = this.scale;
        const size = 66;
        const leftX = 20 + size / 2 + 6;
        const rightX = width - 20 - size / 2 - 6;
        const rowGap = 92;
        const topY = this.glowAreaY + 40 + size / 2;

        this.equipSlotDefs = [
            { key: 'hat', icon: 'equip_hat', x: leftX, y: topY },
            { key: 'necklace', icon: 'equip_necklace', x: rightX, y: topY },
            { key: 'ring', icon: 'equip_ring', x: leftX, y: topY + rowGap },
            { key: 'belt', icon: 'equip_belt', x: rightX, y: topY + rowGap },
            { key: 'shirt', icon: 'equip_shirt', x: leftX, y: topY + rowGap * 2 },
            { key: 'boots', icon: 'equip_boots', x: rightX, y: topY + rowGap * 2 },
        ];

        this.equipSlots = this.equipSlotDefs.map((slot) => this.createGhostSlot(slot, size));
    }

    createGhostSlot(slot, size) {
        const container = this.add.container(slot.x, slot.y);

        const bg = this.add.graphics();
        bg.lineStyle(2, 0xffffff, 0.55);
        bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 10);
        container.add(bg);

        if (slot.icon && this.textures.exists(slot.icon)) {
            const icon = this.add.image(0, 0, slot.icon).setScale(0.5).setAlpha(0.55);
            container.add(icon);
        }

        const hit = this.add.rectangle(0, 0, size, size, 0x000000, 0);
        hit.setInteractive({ useHandCursor: true });
        container.add(hit);

        hit.on('pointerover', () => bg.setAlpha(1));
        hit.on('pointerout', () => bg.setAlpha(0.75));
        hit.on('pointerup', () => this.onEquipSlotClick(slot.key));

        return container;
    }

    createSubTabs() {
        const { width } = this.scale;
        const tabs = [
            { label: 'Character' },
            { label: 'Equip' },
            { label: 'Skill' },
        ];

        // Dark strip behind the tabs
        const strip = this.add.graphics();
        strip.fillStyle(0x000000, 0.6);
        strip.fillRect(0, this.tabBarY - 18, width, 36);
        // Yellow underline
        strip.fillStyle(UIHelpers.COLORS.ACCENT_GOLD, 1);
        strip.fillRect(0, this.tabBarY + 18, width, 2);

        this.tabBar = UIHelpers.createTabBar(this, width / 2, this.tabBarY, tabs, {
            tabWidth: width / 3,
            tabHeight: 34,
            gap: 0,
            activeIndex: 0,
            fontSize: '14px',
            activeColor: UIHelpers.COLORS.ACCENT_GOLD,
            inactiveColor: 0x000000,
            showInactiveBg: false,
            activeTextColor: '#3a2a00',
            inactiveTextColor: '#ffffff',
            onTabChange: (index, tab) => this.onSubTabChange(index, tab),
        });
    }

    createGradeFuseRow() {
        const { width } = this.scale;
        const y = this.gradeFuseY;

        this.gradeBtn = UIHelpers.createPillButton(this, 70, y, 120, 32, 'Grade', {
            fontSize: '15px',
            bgColor: UIHelpers.COLORS.ACCENT_GOLD,
            borderColor: 0x8a5a00,
            strokeColor: '#7a4a00',
            cornerRadius: 16,
            onClick: () => this.showGradePanel(),
        });

        this.fuseBtn = UIHelpers.createPillButton(this, width - 70, y, 120, 32, 'Fuse', {
            fontSize: '15px',
            bgColor: UIHelpers.COLORS.ACCENT_GOLD,
            borderColor: 0x8a5a00,
            strokeColor: '#7a4a00',
            cornerRadius: 16,
            onClick: () => this.showFusePanel(),
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
        }
    }

    showCharacterPanel() {
        const { width } = this.scale;
        const centerX = width / 2;

        // Stats panel
        const statsY = this.contentY + 30;
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
        const infoY = this.contentY + 40;

        const infoBg = UIHelpers.createPanel(this, centerX, infoY, width - 40, 90, {
            bgColor: 0x1a1a2e,
            alpha: 0.85,
            borderColor: UIHelpers.COLORS.SLOT_BORDER,
        });
        this.contentContainer.add(infoBg);

        const infoText = this.add.text(centerX, infoY, 'Tap an equipment slot above to view details', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GRAY,
            align: 'center',
            wordWrap: { width: width - 80 },
        }).setOrigin(0.5);
        this.contentContainer.add(infoText);

        this.equipInfoText = infoText;
    }

    showSkillPanel() {
        const { width } = this.scale;
        const centerX = width / 2;

        const titleText = this.add.text(centerX, this.contentY, 'Equipped Skills', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.contentContainer.add(titleText);

        // 4 skill slots
        const slotSize = 64;
        const gap = 15;
        const totalW = 4 * slotSize + 3 * gap;
        const startX = centerX - totalW / 2 + slotSize / 2;

        const skillIcons = ['skill_attack', 'skill_critical', 'skill_speed', 'skill_shield'];

        for (let i = 0; i < 4; i++) {
            const sx = startX + i * (slotSize + gap);
            const slot = UIHelpers.createEquipSlot(this, sx, this.contentY + 55, `skill_slot_${i}`, {
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
        this.contentContainer.destroy();
        this.contentContainer = this.add.container(0, 0);

        const { width } = this.scale;
        const centerX = width / 2;
        const contentY = this.contentY;

        const text = this.add.text(centerX, contentY, 'Grade Up', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.contentContainer.add(text);

        const desc = this.add.text(centerX, contentY + 26, 'Upgrade your character grade\nto unlock new abilities', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GRAY,
            align: 'center',
        }).setOrigin(0.5);
        this.contentContainer.add(desc);

        // Grade progress bar
        const barY = contentY + 70;
        const barWidth = width - 80;
        const barBg = this.add.graphics();
        barBg.fillStyle(0x2a2a4a, 1);
        barBg.fillRoundedRect(centerX - barWidth / 2, barY, barWidth, 16, 8);
        this.contentContainer.add(barBg);

        const barFill = this.add.graphics();
        barFill.fillStyle(UIHelpers.COLORS.ACCENT_GOLD, 1);
        barFill.fillRoundedRect(centerX - barWidth / 2, barY, barWidth * 0.6, 16, 8);
        this.contentContainer.add(barFill);

        const gradeText = this.add.text(centerX, barY + 26, 'Grade B \u2192 Grade A  (60%)', {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GOLD,
        }).setOrigin(0.5);
        this.contentContainer.add(gradeText);

        // Upgrade button
        const upgradeBtn = UIHelpers.createPillButton(this, centerX, barY + 66, 160, 42, 'GRADE UP', {
            fontSize: '14px',
            bgColor: UIHelpers.COLORS.ACCENT_GOLD,
            borderColor: 0x8a5a00,
            strokeColor: '#7a4a00',
            onClick: () => console.log('Grade Up clicked'),
        });
        this.contentContainer.add(upgradeBtn);
    }

    showFusePanel() {
        this.contentContainer.destroy();
        this.contentContainer = this.add.container(0, 0);

        const { width } = this.scale;
        const centerX = width / 2;
        const contentY = this.contentY;

        const text = this.add.text(centerX, contentY, 'Fuse Equipment', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.contentContainer.add(text);

        const desc = this.add.text(centerX, contentY + 26, 'Combine duplicate equipment\nto create stronger versions', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GRAY,
            align: 'center',
        }).setOrigin(0.5);
        this.contentContainer.add(desc);

        // Fuse slots (2 source + 1 result)
        const slotY = contentY + 90;
        const sourceSlot1 = UIHelpers.createEquipSlot(this, centerX - 80, slotY, 'fuse_src_1', {
            size: 60,
            label: 'Source 1',
            onClick: () => console.log('Fuse source 1'),
        });
        this.contentContainer.add(sourceSlot1);

        const plus = this.add.text(centerX, slotY, '+', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        this.contentContainer.add(plus);

        const sourceSlot2 = UIHelpers.createEquipSlot(this, centerX + 80, slotY, 'fuse_src_2', {
            size: 60,
            label: 'Source 2',
            onClick: () => console.log('Fuse source 2'),
        });
        this.contentContainer.add(sourceSlot2);

        const arrow = this.add.text(centerX, slotY + 55, '\u25bc', {
            fontSize: '20px',
            color: UIHelpers.COLORS.TEXT_GOLD,
        }).setOrigin(0.5);
        this.contentContainer.add(arrow);

        const resultSlot = UIHelpers.createEquipSlot(this, centerX, slotY + 105, 'fuse_result', {
            size: 66,
            label: 'Result',
            onClick: () => console.log('Fuse result'),
        });
        this.contentContainer.add(resultSlot);

        const fuseBtn = UIHelpers.createPillButton(this, centerX, slotY + 175, 160, 42, 'FUSE', {
            fontSize: '14px',
            bgColor: UIHelpers.COLORS.ACCENT_PURPLE,
            borderColor: 0x4a1a8a,
            strokeColor: '#3a1470',
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
