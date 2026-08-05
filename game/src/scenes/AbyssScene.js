/**
 * AbyssScene.js - Abyss dungeon scene (Fire Beast theme)
 * Displays the abyss gate, dungeon info, and entry button
 */

class AbyssScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AbyssScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Background - Fiery cave/abyss
        if (this.textures.exists('bg_abyss')) {
            const bg = this.add.image(width / 2, height / 2, 'bg_abyss');
            bg.setDisplaySize(width, height);
        } else {
            this.cameras.main.setBackgroundColor(0x1a0505);
        }

        // Dark overlay for readability
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.3);
        overlay.fillRect(0, 0, width, height);

        // Top bar
        this.topBar = new TopBar(this);

        // Title
        this.add.text(width / 2, UIHelpers.CONTENT_Y_START + 25, 'THE ABYSS', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            color: '#ff4757',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(width / 2, UIHelpers.CONTENT_Y_START + 50, 'Endless dungeon of fire and darkness', {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffaa99',
        }).setOrigin(0.5);

        // Abyss gate/monster display
        this.createAbyssGate();

        // Dungeon floors info
        this.createFloorInfo();

        // Enter button
        this.createEnterButton();

        // Bottom nav
        this.bottomNav = new BottomNavBar(this, 'abyss');

        UIHelpers.fadeInScene(this);
    }

    createAbyssGate() {
        const { width } = this.scale;
        const centerX = width / 2;
        const gateY = UIHelpers.CONTENT_Y_START + 180;

        // Monster/gate image
        if (this.textures.exists('char_monster')) {
            const monster = this.add.image(centerX, gateY, 'char_monster');
            monster.setScale(0.7);

            // Breathing/pulsing animation
            this.tweens.add({
                targets: monster,
                scaleX: 0.73,
                scaleY: 0.73,
                duration: 2500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });

            // Red glow effect behind monster
            const glow = this.add.graphics();
            glow.fillStyle(0xff4757, 0.15);
            glow.fillCircle(centerX, gateY, 100);
            glow.setDepth(-1);

            this.tweens.add({
                targets: glow,
                alpha: 0.3,
                duration: 1500,
                yoyo: true,
                repeat: -1,
            });
        } else {
            // Placeholder fiery gate
            const gate = this.add.graphics();
            gate.fillStyle(0xff4757, 0.3);
            gate.fillCircle(centerX, gateY, 80);
            gate.lineStyle(3, 0xff4757, 0.8);
            gate.strokeCircle(centerX, gateY, 80);

            const gateText = this.add.text(centerX, gateY, '🔥', {
                fontSize: '48px',
            }).setOrigin(0.5);
        }
    }

    createFloorInfo() {
        const { width } = this.scale;
        const centerX = width / 2;
        const infoY = UIHelpers.CONTENT_Y_START + 330;

        // Floor info panel
        const panelBg = UIHelpers.createPanel(this, centerX, infoY, width - 40, 120, {
            bgColor: 0x1a0a0a,
            alpha: 0.85,
            borderColor: 0x662222,
            borderWidth: 1,
        });

        // Floor stats
        const stats = [
            { label: 'Current Floor', value: '23', color: '#ff4757' },
            { label: 'Best Floor', value: '47', color: '#ffd700' },
            { label: 'Reward Tier', value: 'A', color: '#9b4dff' },
        ];

        const statSpacing = (width - 40) / stats.length;
        const startX = 40;

        stats.forEach((stat, i) => {
            const sx = startX + i * statSpacing;

            this.add.text(sx, infoY - 20, stat.label, {
                fontSize: '10px',
                fontFamily: 'Arial, sans-serif',
                color: UIHelpers.COLORS.TEXT_GRAY,
            }).setOrigin(0.5);

            this.add.text(sx, infoY + 5, stat.value, {
                fontSize: '22px',
                fontFamily: 'Arial, sans-serif',
                color: stat.color,
                fontStyle: 'bold',
            }).setOrigin(0.5);
        });

        // Energy cost info
        this.add.text(centerX, infoY + 40, 'Entry Cost: 10 Energy per floor', {
            fontSize: '10px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffaa99',
        }).setOrigin(0.5);
    }

    createEnterButton() {
        const { width, height } = this.scale;
        const btnY = height - UIHelpers.BOTTOM_NAV_HEIGHT - 60;

        // Enter Abyss button
        const enterBtn = UIHelpers.createButton(this, width / 2, btnY, 200, 50, 'ENTER ABYSS', {
            fontSize: '16px',
            bgColor: 0xcc2233,
            hoverColor: 0xff3344,
            activeColor: 0x991122,
            cornerRadius: 25,
            onClick: () => this.onEnterAbyss(),
        });

        // Pulsing effect
        this.tweens.add({
            targets: enterBtn,
            scaleX: 1.03,
            scaleY: 1.03,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Sweep rewards text
        const sweepBtn = UIHelpers.createButton(this, width / 2, btnY + 50, 120, 32, 'SWEEP', {
            fontSize: '12px',
            bgColor: 0x4a4a6a,
            hoverColor: 0x6a6a8a,
            cornerRadius: 16,
            onClick: () => this.onSweep(),
        });
    }

    onEnterAbyss() {
        console.log('[AbyssScene] Entering the Abyss...');
        this.cameras.main.flash(300, 255, 50, 50);

        // Placeholder: would transition to abyss gameplay scene
        this.showToast('Entering Floor 24...');
    }

    onSweep() {
        console.log('[AbyssScene] Sweeping floors...');
        this.cameras.main.flash(150, 255, 215, 0);
        this.showToast('Swept 5 floors! Rewards collected.');
    }

    showToast(message) {
        const { width } = this.scale;
        const toast = this.add.container(width / 2, UIHelpers.CONTENT_Y_START + 80);

        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.85);
        bg.fillRoundedRect(-130, -16, 260, 32, 16);
        toast.add(bg);

        const text = this.add.text(0, 0, message, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
        }).setOrigin(0.5);
        toast.add(text);

        toast.setAlpha(0).setDepth(2000);

        this.tweens.add({
            targets: toast,
            alpha: 1,
            duration: 300,
            onComplete: () => {
                this.time.delayedCall(1500, () => {
                    this.tweens.add({
                        targets: toast,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => toast.destroy(),
                    });
                });
            },
        });
    }
}
