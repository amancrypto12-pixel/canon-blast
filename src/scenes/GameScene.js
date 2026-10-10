import Phaser from 'phaser';
import { GameState, RARITIES } from '../GameState.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.gameState = new GameState();
        this.currentSlotIndex = 0;
    }

    preload() {
        this.load.image('common', 'assets/common.png');
        this.load.image('uncommon', 'assets/uncommon.png');
        this.load.image('rare', 'assets/rare.png');
        this.load.image('epic', 'assets/epic.png');
        this.load.image('legendary', 'assets/legendary.png');
        this.load.image('pearl', 'assets/pearl.png');
        this.load.image('heart_pearl', 'assets/heart_pearl.png');
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#101215');

        // Font style helpers
        this.textStyle = (size, color, align = 'left') => ({
            fontFamily: 'Oswald',
            fontSize: `${size}px`,
            fill: color,
            align: align,
            fontStyle: 'bold'
        });

        // ==========================================
        // UI LAYOUT CONSTANTS
        // ==========================================
        const headerY = 40;
        const navHeight = 80;
        const cardWidth = width * 0.75;
        const cardHeight = height * 0.55;
        const cardX = width / 2;
        const cardY = height / 2 - 20;

        // ==========================================
        // HEADER
        // ==========================================
        // Avatar placeholder
        this.add.circle(40, headerY, 20, 0x333333);
        this.add.text(40, headerY, '🧑', { fontSize: '20px' }).setOrigin(0.5);
        this.add.text(70, headerY, 'PACK', this.textStyle(16, '#fff')).setOrigin(0, 0.5);

        // Balances
        this.headerDmdText = this.add.text(width - 90, headerY, '0', this.textStyle(24, '#fff', 'right')).setOrigin(1, 0.5);
        this.add.text(width - 70, headerY, '⭐', { fontSize: '20px' }).setOrigin(0.5);
        this.add.text(width - 50, headerY, '38', this.textStyle(20, '#00ffff')).setOrigin(0, 0.5);

        // ==========================================
        // LEFT & RIGHT SIDEBARS
        // ==========================================
        const sideIconXLeft = 40;
        const sideIconXRight = width - 40;
        const sideY1 = cardY - 60;
        const sideY2 = cardY + 20;

        // Left Sidebar
        this.add.text(sideIconXLeft, sideY1, '👑', { fontSize: '24px' }).setOrigin(0.5);
        this.add.text(sideIconXLeft, sideY1 + 25, 'DUCKER\nPASS', this.textStyle(10, '#8b8e97', 'center')).setOrigin(0.5);

        this.add.text(sideIconXLeft, sideY2, '📋', { fontSize: '24px' }).setOrigin(0.5);
        this.add.text(sideIconXLeft, sideY2 + 25, 'DAILY\nTASKS', this.textStyle(10, '#8b8e97', 'center')).setOrigin(0.5);

        // Right Sidebar
        this.energyText = this.add.text(sideIconXRight, sideY1 - 25, '2000/2000', this.textStyle(12, '#8b8e97', 'center')).setOrigin(0.5);
        this.add.text(sideIconXRight, sideY1, '⚡', { fontSize: '24px' }).setOrigin(0.5);
        this.add.text(sideIconXRight, sideY1 + 25, '13:49:29', this.textStyle(10, '#8b8e97', 'center')).setOrigin(0.5);

        // ==========================================
        // MAIN CARD
        // ==========================================
        this.cardBg = this.add.graphics();
        this.cardBg.fillStyle(0x1a1c22, 1);
        this.cardBg.fillRoundedRect(cardX - cardWidth/2, cardY - cardHeight/2, cardWidth, cardHeight, 16);

        // Card Top Token text
        this.add.text(cardX - 60, cardY - cardHeight/2 - 30, '🐬', { fontSize: '32px' }).setOrigin(0.5);
        this.cardDmdText = this.add.text(cardX - 30, cardY - cardHeight/2 - 30, '238.10', this.textStyle(42, '#fff')).setOrigin(0, 0.5);

        // Rarity & Level
        this.lvlText = this.add.text(cardX - cardWidth/2 + 20, cardY - cardHeight/2 + 20, 'LVL 1', this.textStyle(18, '#8b8e97')).setOrigin(0, 0);
        this.rarityText = this.add.text(cardX + cardWidth/2 - 20, cardY - cardHeight/2 + 20, 'COMMON', this.textStyle(18, '#8b8e97')).setOrigin(1, 0);

        // Dolphin Sprite
        this.dolphinSprite = this.add.sprite(cardX, cardY, 'common').setScale(0.4).setInteractive({ useHandCursor: true });
        
        // Feed Button
        this.feedBtnBg = this.add.graphics();
        this.drawFeedBtn(cardX, cardY + cardHeight/2 - 40);
        
        // Button Text
        this.feedBtnText = this.add.text(cardX, cardY + cardHeight/2 - 40, 'TAP TO FEED 🌽 1', this.textStyle(20, '#000', 'center')).setOrigin(0.5);
        
        // Feed Button Interaction Zone
        const btnZone = this.add.zone(cardX, cardY + cardHeight/2 - 40, 200, 50).setInteractive({ useHandCursor: true });
        btnZone.on('pointerdown', (pointer) => this.feedDolphin(pointer));
        this.dolphinSprite.on('pointerdown', (pointer) => this.feedDolphin(pointer));

        // State/Timer text below button
        this.stateSubText = this.add.text(cardX, cardY + cardHeight/2 + 5, 'READY IN 7:53:40', this.textStyle(12, '#8b8e97', 'center')).setOrigin(0.5);

        // ==========================================
        // SLOTS UI (Carousel below card)
        // ==========================================
        this.slotsContainer = this.add.container(cardX, cardY + cardHeight/2 + 40);
        this.renderSlotsUI();

        // Slot Navigation (Invisible touch zones on left/right of card)
        this.add.zone(cardX - cardWidth/2 - 30, cardY, 60, cardHeight).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.switchSlot(-1));
        this.add.zone(cardX + cardWidth/2 + 30, cardY, 60, cardHeight).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.switchSlot(1));

        // ==========================================
        // BOTTOM NAVIGATION BAR
        // ==========================================
        const navY = height - navHeight / 2;
        this.add.graphics().fillStyle(0x1a1c22, 1).fillRect(0, height - navHeight, width, navHeight);
        
        const navItems = [
            { icon: '📈', label: 'MARKET', action: null },
            { icon: '🥚', label: 'EGGS', action: () => this.hatchAction() },
            { icon: '🐬', label: 'DUCKS', action: null, active: true },
            { icon: '🔱', label: 'GODS', action: null },
            { icon: '✅', label: 'TASKS', action: null }
        ];

        const sectionW = width / 5;
        navItems.forEach((item, i) => {
            const ix = sectionW * i + sectionW / 2;
            const color = item.active ? '#ff8800' : '#8b8e97';
            this.add.text(ix, navY - 10, item.icon, { fontSize: '24px' }).setOrigin(0.5);
            this.add.text(ix, navY + 15, item.label, this.textStyle(12, color, 'center')).setOrigin(0.5);
            
            if (item.action) {
                this.add.zone(ix, navY, sectionW, navHeight).setInteractive({ useHandCursor: true }).on('pointerdown', item.action);
            }
        });

        // Listen for state load
        window.addEventListener('gameStateLoaded', () => this.updateUI());
        this.updateUI();
    }

    drawFeedBtn(x, y) {
        this.feedBtnBg.clear();
        this.feedBtnBg.fillStyle(0xffd900, 1);
        this.feedBtnBg.fillRoundedRect(x - 100, y - 25, 200, 50, 25);
    }

    renderSlotsUI() {
        this.slotsContainer.removeAll(true);
        const data = this.gameState.data;
        const totalSlots = data.maxSlots;
        const startX = -((totalSlots - 1) * 30) / 2;

        for (let i = 0; i < totalSlots; i++) {
            const x = startX + i * 30;
            let icon = '🔒';
            let color = '#333333';
            
            if (i < data.slots.length) {
                const d = data.slots[i];
                if (d.state === 'FEEDING') {
                    icon = i === this.currentSlotIndex ? '🟠' : '⚫';
                } else if (d.state === 'READY') {
                    icon = '🤍';
                } else if (d.state === 'STAKING') {
                    icon = '👑';
                }
            } else {
                icon = '➕'; // Buy slot placeholder
            }
            
            // Draw a small background for active
            if (i === this.currentSlotIndex) {
                const bg = this.add.graphics().fillStyle(0xffffff, 0.1).fillCircle(x, 0, 12);
                this.slotsContainer.add(bg);
            }
            
            const t = this.add.text(x, 0, icon, { fontSize: '14px' }).setOrigin(0.5);
            this.slotsContainer.add(t);
        }
        
        // Add Breed/Stake quick buttons under slots
        const yOffset = 30;
        const mergeBtn = this.add.text(-50, yOffset, 'MERGE', this.textStyle(14, '#fff', 'center')).setOrigin(0.5).setInteractive({useHandCursor:true}).on('pointerdown', () => this.mergeAction());
        const stakeBtn = this.add.text(50, yOffset, 'STAKE', this.textStyle(14, '#fff', 'center')).setOrigin(0.5).setInteractive({useHandCursor:true}).on('pointerdown', () => this.stakeAction());
        this.slotsContainer.add([mergeBtn, stakeBtn]);
    }

    switchSlot(dir) {
        const data = this.gameState.data;
        if (data.slots.length === 0) return;
        
        this.currentSlotIndex += dir;
        if (this.currentSlotIndex < 0) this.currentSlotIndex = data.slots.length - 1;
        if (this.currentSlotIndex >= data.slots.length) this.currentSlotIndex = 0;
        
        this.dolphinSprite.setScale(0.1);
        this.tweens.add({
            targets: this.dolphinSprite,
            scaleX: 0.4,
            scaleY: 0.4,
            duration: 300,
            ease: 'Back.easeOut'
        });
        this.updateUI();
    }

    getFeedingCost(taps) {
        if (taps >= 140) return 8;
        if (taps >= 120) return 7;
        if (taps >= 100) return 6;
        if (taps >= 80) return 5;
        if (taps >= 60) return 4;
        if (taps >= 40) return 3;
        if (taps >= 20) return 2;
        return 1;
    }

    feedDolphin(pointer) {
        const data = this.gameState.data;
        if (data.slots.length === 0) return;
        
        let dolphin = data.slots[this.currentSlotIndex];
        let rType = RARITIES[dolphin.rarity];

        if (dolphin.state !== 'FEEDING') {
            this.showFloatingText(pointer.x, pointer.y, `Is ${dolphin.state}`, '#ff0000');
            return;
        }

        const cost = this.getFeedingCost(dolphin.taps);

        if (data.pearls >= cost) {
            data.pearls -= cost;
            data.dmdTokens += rType.reward;
            dolphin.taps += 1;

            if (dolphin.taps >= rType.maxTaps) {
                dolphin.state = 'READY';
            }

            if (Phaser.Math.FloatBetween(0, 1) < 0.05) {
                data.heartPearls += 1;
                this.showFloatingText(pointer.x, pointer.y - 80, "+1 🥚", '#ff66ff');
            }
            
            this.gameState.save();

            this.tweens.add({
                targets: this.dolphinSprite,
                scaleX: 0.35,
                scaleY: 0.35,
                duration: 50,
                yoyo: true,
            });

            this.showFloatingText(pointer.x, pointer.y, `+${rType.reward}`, '#00ff00');
            this.updateUI();
        } else {
            this.showFloatingText(pointer.x, pointer.y, "Need Pearls!", '#ff0000');
            this.tweens.add({ targets: this.dolphinSprite, x: this.dolphinSprite.x + 10, duration: 50, yoyo: true, repeat: 3 });
        }
    }

    hatchAction() {
        if (this.gameState.data.heartPearls > 0) {
            if (this.gameState.data.slots.length >= this.gameState.data.maxSlots) {
                alert("No slots!"); return;
            }
            if (this.gameState.hatchEgg()) {
                this.currentSlotIndex = this.gameState.data.slots.length - 1;
                this.updateUI();
                this.showFloatingText(this.scale.width/2, this.scale.height/2, "Hatched!", '#ff00ff');
            }
        } else {
            alert("No Eggs (Heart Pearls)!");
        }
    }

    mergeAction() {
        const data = this.gameState.data;
        if (data.slots.length === 0) return;
        let dolphin = data.slots[this.currentSlotIndex];
        let rType = RARITIES[dolphin.rarity];

        if (dolphin.state === 'READY') {
            if (!rType.next) { alert("Max Rarity!"); return; }
            let partnerIndex = data.slots.findIndex((d, idx) => idx !== this.currentSlotIndex && d.state === 'READY' && d.rarity === dolphin.rarity);
            if (partnerIndex !== -1) {
                data.slots.splice(Math.max(this.currentSlotIndex, partnerIndex), 1);
                data.slots.splice(Math.min(this.currentSlotIndex, partnerIndex), 1);
                data.slots.push(this.gameState.createNewDolphin(rType.next));
                this.currentSlotIndex = data.slots.length - 1;
                this.gameState.save();
                this.updateUI();
                this.showFloatingText(this.scale.width/2, this.scale.height/2, "Merged!", '#00ffff');
            } else {
                alert("Need another READY Dolphin of same rarity!");
            }
        } else {
            alert("Must be READY to merge!");
        }
    }

    stakeAction() {
        const data = this.gameState.data;
        if (data.slots.length === 0) return;
        let dolphin = data.slots[this.currentSlotIndex];
        if (dolphin.state === 'READY') {
            dolphin.state = 'STAKING';
            this.gameState.save();
            this.updateUI();
        } else if (dolphin.state === 'STAKING') {
            dolphin.state = 'READY';
            this.gameState.save();
            this.updateUI();
        } else {
            alert("Must be READY to stake!");
        }
    }

    showFloatingText(x, y, message, color) {
        const fText = this.add.text(x, y, message, this.textStyle(24, color, 'center')).setOrigin(0.5);
        this.tweens.add({ targets: fText, y: y - 100, alpha: 0, duration: 1000, onComplete: () => fText.destroy() });
    }

    updateUI() {
        const data = this.gameState.data;
        this.headerDmdText.setText(data.dmdTokens.toFixed(2));
        this.cardDmdText.setText(data.dmdTokens.toFixed(2));
        
        if (data.slots.length === 0) return;

        let dolphin = data.slots[this.currentSlotIndex];
        let rType = RARITIES[dolphin.rarity];
        
        this.dolphinSprite.setTexture(rType.key);
        this.lvlText.setText(`LVL ${dolphin.level}`);
        this.rarityText.setText(dolphin.rarity);
        
        if (dolphin.state === 'FEEDING') {
            this.feedBtnText.setText(`TAP TO FEED 🌽 ${this.getFeedingCost(dolphin.taps)}`);
            this.stateSubText.setText(`FED: ${dolphin.taps}/${rType.maxTaps}`);
            this.feedBtnBg.fillStyle(0xffd900, 1);
        } else if (dolphin.state === 'READY') {
            this.feedBtnText.setText(`READY`);
            this.stateSubText.setText(`MERGE OR STAKE`);
            this.feedBtnBg.fillStyle(0x00ff00, 1);
        } else if (dolphin.state === 'STAKING') {
            this.feedBtnText.setText(`STAKING`);
            this.stateSubText.setText(`EARNING $DMD`);
            this.feedBtnBg.fillStyle(0x00aaff, 1);
        }
        
        const cardX = this.scale.width / 2;
        const cardY = this.scale.height / 2 - 20;
        this.feedBtnBg.fillRoundedRect(cardX - 100, cardY + (this.scale.height * 0.55)/2 - 25 - 15, 200, 50, 25);
        
        this.renderSlotsUI();
    }

    update(time, delta) {
        const data = this.gameState.data;
        let earned = false;
        
        if (!this.pearlTimer) this.pearlTimer = 0;
        this.pearlTimer += delta;
        if (this.pearlTimer > 1000) {
            data.pearls += 1;
            this.pearlTimer = 0;
            // Update energy text to represent pearls for now
            this.energyText.setText(`🌽 ${data.pearls}`);
            earned = true;
        }

        data.slots.forEach(dolphin => {
            if (dolphin.state === 'STAKING') {
                let rType = RARITIES[dolphin.rarity];
                data.dmdTokens += (rType.reward * 0.1) * (delta / 1000);
                earned = true;
            }
        });

        if (earned) {
            this.headerDmdText.setText(data.dmdTokens.toFixed(2));
            this.cardDmdText.setText(data.dmdTokens.toFixed(2));
            if (Math.random() < 0.01) this.gameState.save();
        }
    }
}
