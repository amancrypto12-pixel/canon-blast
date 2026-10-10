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
        
        // UI Icons
        this.load.image('hatch', 'assets/hatch.png');
        this.load.image('merge', 'assets/merge.png');
        this.load.image('stake', 'assets/stake.png');
    }

    create() {
        const { width, height } = this.scale;
        const textStyle = { fontSize: '20px', fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold' };

        // Currency UI
        this.pearlsText = this.add.text(20, 20, '', textStyle);
        this.dmdText = this.add.text(20, 50, '', textStyle);
        this.eggsText = this.add.text(20, 80, '', textStyle);

        // Rarity & State
        this.rarityText = this.add.text(width / 2, 80, '', { ...textStyle, fontSize: '24px', fill: '#ffff00' }).setOrigin(0.5);
        this.stateText = this.add.text(width / 2, 110, '', { ...textStyle, fontSize: '18px', fill: '#00ffff' }).setOrigin(0.5);

        // Dolphin Sprite
        this.dolphinSprite = this.add.sprite(width / 2, height / 2, 'common')
            .setInteractive({ useHandCursor: true })
            .setScale(0.5);

        // Progress UI
        this.progressText = this.add.text(width / 2, height - 200, '', textStyle).setOrigin(0.5);
        this.costText = this.add.text(width / 2, height - 170, '', { ...textStyle, fontSize: '18px', fill: '#ffaa00' }).setOrigin(0.5);

        // Slot Navigation
        this.prevBtn = this.add.text(50, height / 2, '<', { fontSize: '64px', fill: '#fff', fontStyle: 'bold' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.nextBtn = this.add.text(width - 50, height / 2, '>', { fontSize: '64px', fill: '#fff', fontStyle: 'bold' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Action Buttons (Bottom)
        this.createBottomMenu(width, height);

        // Events
        this.dolphinSprite.on('pointerdown', this.feedDolphin, this);
        this.prevBtn.on('pointerdown', () => this.switchSlot(-1));
        this.nextBtn.on('pointerdown', () => this.switchSlot(1));

        window.addEventListener('gameStateLoaded', () => this.updateUI());

        this.scale.on('resize', this.resize, this);
        this.updateUI();
    }

    createBottomMenu(width, height) {
        const btnY = height - 80;
        
        // Hatch Button
        const hatchBtn = this.add.sprite(width / 4, btnY, 'hatch').setScale(0.3).setInteractive({ useHandCursor: true });
        this.add.text(width / 4, btnY + 40, 'Hatch', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
        hatchBtn.on('pointerdown', () => this.hatchAction());

        // Merge Button
        const mergeBtn = this.add.sprite(width / 2, btnY, 'merge').setScale(0.3).setInteractive({ useHandCursor: true });
        this.add.text(width / 2, btnY + 40, 'Merge', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
        mergeBtn.on('pointerdown', () => this.mergeAction());

        // Stake Button
        const stakeBtn = this.add.sprite((width / 4) * 3, btnY, 'stake').setScale(0.3).setInteractive({ useHandCursor: true });
        this.add.text((width / 4) * 3, btnY + 40, 'Stake', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
        stakeBtn.on('pointerdown', () => this.stakeAction());
    }

    switchSlot(dir) {
        const data = this.gameState.data;
        if (data.slots.length === 0) return;
        
        this.currentSlotIndex += dir;
        if (this.currentSlotIndex < 0) this.currentSlotIndex = data.slots.length - 1;
        if (this.currentSlotIndex >= data.slots.length) this.currentSlotIndex = 0;
        
        this.animateDolphinSwitch();
        this.updateUI();
    }

    animateDolphinSwitch() {
        this.dolphinSprite.setScale(0.1);
        this.tweens.add({
            targets: this.dolphinSprite,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 300,
            ease: 'Back.easeOut'
        });
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
            this.showFloatingText(pointer.x, pointer.y, `Dolphin is ${dolphin.state}`, '#ff0000');
            return;
        }

        if (dolphin.taps >= rType.maxTaps) {
            dolphin.state = 'READY';
            this.gameState.save();
            this.updateUI();
            this.showFloatingText(pointer.x, pointer.y, "Full! Ready!", '#00ffff');
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
                this.showFloatingText(pointer.x, pointer.y - 80, "+1 Heart Pearl!", '#ff66ff');
            }
            
            this.gameState.save();

            this.tweens.add({
                targets: this.dolphinSprite,
                scaleX: 0.45,
                scaleY: 0.45,
                duration: 50,
                yoyo: true,
            });

            this.showFloatingText(pointer.x, pointer.y, `+${rType.reward} DMD`, '#00ff00');
            this.updateUI();
        } else {
            this.showFloatingText(pointer.x, pointer.y, "Not enough Pearls!", '#ff0000');
            this.shakeDolphin();
        }
    }

    hatchAction() {
        if (this.gameState.data.heartPearls > 0) {
            if (this.gameState.data.slots.length >= this.gameState.data.maxSlots) {
                alert("No empty slots available!");
                return;
            }
            const success = this.gameState.hatchEgg();
            if (success) {
                this.currentSlotIndex = this.gameState.data.slots.length - 1;
                this.animateDolphinSwitch();
                this.updateUI();
                this.showFloatingText(this.scale.width/2, this.scale.height/2, "Hatched new Dolphin!", '#ff00ff');
            }
        } else {
            alert("No Heart Pearls (Eggs) to hatch!");
        }
    }

    mergeAction() {
        const data = this.gameState.data;
        if (data.slots.length === 0) return;
        
        let dolphin = data.slots[this.currentSlotIndex];
        let rType = RARITIES[dolphin.rarity];

        if (dolphin.state === 'READY') {
            if (!rType.next) {
                alert("Legendary cannot be merged further!");
                return;
            }
            
            // Check if we have another READY dolphin of the same rarity
            let partnerIndex = data.slots.findIndex((d, idx) => idx !== this.currentSlotIndex && d.state === 'READY' && d.rarity === dolphin.rarity);
            
            if (partnerIndex !== -1) {
                // Merge them!
                data.slots.splice(Math.max(this.currentSlotIndex, partnerIndex), 1);
                data.slots.splice(Math.min(this.currentSlotIndex, partnerIndex), 1);
                
                // Add new merged dolphin
                data.slots.push(this.gameState.createNewDolphin(rType.next));
                this.currentSlotIndex = data.slots.length - 1;
                this.gameState.save();
                this.animateDolphinSwitch();
                this.updateUI();
                this.showFloatingText(this.scale.width/2, this.scale.height/2, `Merged to ${rType.next}!`, '#00ffff');
            } else {
                alert(`Need another READY ${dolphin.rarity} Dolphin to merge!`);
            }
        } else {
            alert("Dolphin must be fully fed (READY) to merge!");
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
            this.showFloatingText(this.scale.width/2, this.scale.height/2, "Dolphin Staked!", '#ffff00');
        } else if (dolphin.state === 'STAKING') {
            dolphin.state = 'READY'; // Unstake
            this.gameState.save();
            this.updateUI();
            this.showFloatingText(this.scale.width/2, this.scale.height/2, "Dolphin Unstaked!", '#ffff00');
        } else {
            alert("Dolphin must be fully fed (READY) to stake!");
        }
    }

    shakeDolphin() {
        this.tweens.add({
            targets: this.dolphinSprite,
            x: this.dolphinSprite.x + 10,
            duration: 50,
            yoyo: true,
            repeat: 3
        });
    }

    showFloatingText(x, y, message, color) {
        const fText = this.add.text(x, y, message, { fontSize: '20px', fill: color, fontStyle: 'bold' }).setOrigin(0.5);
        this.tweens.add({
            targets: fText,
            y: y - 100,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => fText.destroy()
        });
    }

    updateUI() {
        const data = this.gameState.data;
        this.pearlsText.setText(`Pearls: ${data.pearls}`);
        this.dmdText.setText(`$DMD: ${data.dmdTokens.toFixed(2)}`);
        this.eggsText.setText(`Heart Pearls: ${data.heartPearls}`);
        
        if (data.slots.length === 0) {
            this.dolphinSprite.setVisible(false);
            this.rarityText.setText("No Dolphins!");
            this.progressText.setText("");
            this.costText.setText("");
            this.stateText.setText("");
            return;
        }

        this.dolphinSprite.setVisible(true);
        let dolphin = data.slots[this.currentSlotIndex];
        let rType = RARITIES[dolphin.rarity];
        
        this.dolphinSprite.setTexture(rType.key);
        
        this.rarityText.setText(`${dolphin.rarity} (Slot ${this.currentSlotIndex + 1}/${data.slots.length})`);
        this.stateText.setText(`State: ${dolphin.state}`);
        
        this.progressText.setText(`Fed: ${dolphin.taps}/${rType.maxTaps}`);
        
        if (dolphin.state !== 'FEEDING') {
            this.costText.setText(dolphin.state === 'STAKING' ? `Earning passive DMD...` : `Ready for Merge/Stake`);
            this.costText.setFill('#00ffff');
        } else {
            this.costText.setText(`Cost: ${this.getFeedingCost(dolphin.taps)} Pearl(s)`);
            this.costText.setFill('#ffaa00');
        }
    }

    resize(gameSize) {
        const { width, height } = gameSize;
        
        this.progressText.setPosition(width / 2, height - 200);
        this.costText.setPosition(width / 2, height - 170);
        this.dolphinSprite.setPosition(width / 2, height / 2);
        this.rarityText.setPosition(width / 2, 80);
        this.stateText.setPosition(width / 2, 110);
        this.prevBtn.setPosition(50, height / 2);
        this.nextBtn.setPosition(width - 50, height / 2);
    }

    update(time, delta) {
        // Handle passive income from staking
        const data = this.gameState.data;
        let earned = false;
        
        data.slots.forEach(dolphin => {
            if (dolphin.state === 'STAKING') {
                let rType = RARITIES[dolphin.rarity];
                // Earn 10% of their tap reward per second
                data.dmdTokens += (rType.reward * 0.1) * (delta / 1000);
                earned = true;
            }
        });

        if (earned) {
            this.dmdText.setText(`$DMD: ${data.dmdTokens.toFixed(2)}`);
            // Periodically save
            if (Math.random() < 0.01) this.gameState.save();
        }
    }
}
