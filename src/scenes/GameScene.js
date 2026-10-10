import Phaser from 'phaser';

const RARITIES = [
    { name: 'COMMON', key: 'common', maxTaps: 100, reward: 0.01 },
    { name: 'UNCOMMON', key: 'uncommon', maxTaps: 150, reward: 0.02 },
    { name: 'RARE', key: 'rare', maxTaps: 200, reward: 0.04 },
    { name: 'EPIC', key: 'epic', maxTaps: 250, reward: 0.5 },
    { name: 'LEGENDARY', key: 'legendary', maxTaps: 300, reward: 1.6 }
];

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        // Global State
        this.pearls = 10000;
        this.dmdTokens = 0;
        this.heartPearls = 0;
        
        // Slot State
        this.currentSlot = 0;
        this.dolphins = RARITIES.map(r => ({
            ...r,
            taps: 0,
            level: 1,
            feedingCost: 1
        }));
    }

    preload() {
        // Load assets
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

        const textStyle = { fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold' };
        
        // Top UI
        this.pearlsText = this.add.text(20, 20, '', textStyle);
        this.dmdText = this.add.text(20, 50, '', textStyle);
        this.eggsText = this.add.text(20, 80, '', textStyle);
        
        // Rarity Info
        this.rarityText = this.add.text(width / 2, 80, '', { ...textStyle, fontSize: '28px', fill: '#ffff00' }).setOrigin(0.5);

        // Progress UI
        this.progressText = this.add.text(width / 2, height - 120, '', textStyle).setOrigin(0.5);
        this.costText = this.add.text(width / 2, height - 80, '', { ...textStyle, fontSize: '20px', fill: '#ffaa00' }).setOrigin(0.5);

        // Dolphin Sprite
        this.dolphinSprite = this.add.sprite(width / 2, height / 2, this.dolphins[this.currentSlot].key)
            .setInteractive({ useHandCursor: true })
            .setScale(0.5);

        // Navigation
        this.prevBtn = this.add.text(50, height / 2, '<', { fontSize: '64px', fill: '#ffffff', fontStyle: 'bold' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.nextBtn = this.add.text(width - 50, height / 2, '>', { fontSize: '64px', fill: '#ffffff', fontStyle: 'bold' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Events
        this.dolphinSprite.on('pointerdown', this.feedDolphin, this);
        this.prevBtn.on('pointerdown', () => this.switchSlot(-1));
        this.nextBtn.on('pointerdown', () => this.switchSlot(1));

        this.scale.on('resize', this.resize, this);

        this.updateUI();
    }

    switchSlot(dir) {
        this.currentSlot += dir;
        if (this.currentSlot < 0) this.currentSlot = this.dolphins.length - 1;
        if (this.currentSlot >= this.dolphins.length) this.currentSlot = 0;
        
        this.dolphinSprite.setTexture(this.dolphins[this.currentSlot].key);
        // Small bounce animation on switch
        this.dolphinSprite.setScale(0.1);
        this.tweens.add({
            targets: this.dolphinSprite,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 300,
            ease: 'Back.easeOut'
        });

        this.updateUI();
    }

    getFeedingCost(taps) {
        // Based on Duck guide approximate step increases per 20 taps
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
        let dolphin = this.dolphins[this.currentSlot];

        if (dolphin.taps >= dolphin.maxTaps) {
            this.showFloatingText(pointer.x, pointer.y, "Full! Ready to Breed!", '#ff0000');
            return;
        }

        dolphin.feedingCost = this.getFeedingCost(dolphin.taps);

        if (this.pearls >= dolphin.feedingCost) {
            this.pearls -= dolphin.feedingCost;
            this.dmdTokens += dolphin.reward;
            dolphin.taps += 1;
            
            // Re-eval cost for next tap UI
            dolphin.feedingCost = this.getFeedingCost(dolphin.taps);

            // 5% Egg Drop
            if (Phaser.Math.FloatBetween(0, 1) < 0.05) {
                this.heartPearls += 1;
                this.showFloatingText(pointer.x, pointer.y - 80, "+1 Heart Pearl!", '#ff66ff');
            }

            this.tweens.add({
                targets: this.dolphinSprite,
                scaleX: 0.45,
                scaleY: 0.45,
                duration: 50,
                yoyo: true,
            });

            this.showFloatingText(pointer.x, pointer.y, `+${dolphin.reward} DMD`, '#00ff00');
            this.updateUI();
        } else {
            this.showFloatingText(pointer.x, pointer.y, "Not enough Pearls!", '#ff0000');
            this.tweens.add({
                targets: this.dolphinSprite,
                x: this.dolphinSprite.x + 10,
                duration: 50,
                yoyo: true,
                repeat: 3
            });
        }
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
        this.pearlsText.setText(`Pearls: ${this.pearls}`);
        this.dmdText.setText(`$DMD: ${this.dmdTokens.toFixed(2)}`);
        this.eggsText.setText(`Heart Pearls: ${this.heartPearls}`);
        
        let dolphin = this.dolphins[this.currentSlot];
        this.rarityText.setText(`${dolphin.name} DOLPHIN (Lvl ${dolphin.level})`);
        
        this.progressText.setText(`Fed: ${dolphin.taps}/${dolphin.maxTaps}`);
        
        if (dolphin.taps >= dolphin.maxTaps) {
            this.costText.setText(`Max level reached!`);
            this.costText.setFill('#ff0000');
        } else {
            this.costText.setText(`Cost: ${dolphin.feedingCost} Pearl(s)`);
            this.costText.setFill('#ffaa00');
        }
    }

    resize(gameSize) {
        const { width, height } = gameSize;
        
        this.progressText.setPosition(width / 2, height - 120);
        this.costText.setPosition(width / 2, height - 80);
        this.dolphinSprite.setPosition(width / 2, height / 2);
        this.rarityText.setPosition(width / 2, 80);
        this.prevBtn.setPosition(50, height / 2);
        this.nextBtn.setPosition(width - 50, height / 2);
    }
}
