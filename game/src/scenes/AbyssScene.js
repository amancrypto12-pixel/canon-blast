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

        // Background - Fiery cave/abyss gate with swirling portal
        if (this.textures.exists('bg_abyss')) {
            const bg = this.add.image(width / 2, height / 2, 'bg_abyss');
            bg.setDisplaySize(width, height);
        } else {
            this.cameras.main.setBackgroundColor(0x1a0505);
        }

        // Top bar
        this.topBar = new TopBar(this);

        // Swirling portal glow effect over the gate artwork
        this.createPortalGlow();

        // Play Abyss button (yellow pill, matches reference minimalism)
        this.createEnterButton();

        // Bottom nav
        this.bottomNav = new BottomNavBar(this, 'abyss');

        UIHelpers.fadeInScene(this);
    }

    createPortalGlow() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const portalY = height * 0.48;

        // Subtle dark swirl glow to animate over the static portal art
        const glow = this.add.graphics();
        glow.fillStyle(0x2a0a4a, 0.25);
        glow.fillCircle(centerX, portalY, 70);
        glow.setBlendMode(Phaser.BlendModes.ADD);

        this.tweens.add({
            targets: glow,
            alpha: 0.5,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    createEnterButton() {
        const { width, height } = this.scale;
        const btnY = height - UIHelpers.BOTTOM_NAV_HEIGHT - 55;

        // Play Abyss button - yellow pill matching reference "PLAY ABYSS"
        const enterBtn = UIHelpers.createPillButton(this, width / 2, btnY, 210, 46, 'PLAY ABYSS', {
            fontSize: '18px',
            bgColor: UIHelpers.COLORS.ACCENT_GOLD,
            borderColor: 0x8a5a00,
            strokeColor: '#7a4a00',
            cornerRadius: 12,
            onClick: () => this.onEnterAbyss(),
        });

        // Pulsing effect
        this.tweens.add({
            targets: enterBtn,
            scaleX: 1.04,
            scaleY: 1.04,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    onEnterAbyss() {
        console.log('[AbyssScene] Entering the Abyss...');
        this.cameras.main.flash(300, 255, 50, 50);

        // Placeholder: would transition to abyss gameplay scene
        this.showToast('Entering the Abyss...');
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
