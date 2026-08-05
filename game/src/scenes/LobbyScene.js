/**
 * LobbyScene.js - Main lobby with side icons, character display, and Stage button
 */

class LobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LobbyScene' });
    }

    create() {
        const { width, height } = this.scale;

        // Background
        if (this.textures.exists('bg_lobby')) {
            const bg = this.add.image(width / 2, height / 2, 'bg_lobby');
            bg.setDisplaySize(width, height);
        } else {
            this.cameras.main.setBackgroundColor(UIHelpers.COLORS.DARK_BG);
        }

        // Top bar
        this.topBar = new TopBar(this, {
            name: 'Hero',
            level: 12,
            xp: 65,
            xpMax: 100,
            energy: 120,
            gold: 25000,
            diamonds: 500,
        });

        // Side icons (left + right columns, like reference)
        this.createSideIcons();

        // Central character display
        this.createCharacterDisplay();

        // Stage button
        this.createStageButton();

        // Bottom navigation bar
        this.bottomNav = new BottomNavBar(this, 'lobby');

        // Fade in
        UIHelpers.fadeInScene(this);
    }

    createSideIcons() {
        const { width } = this.scale;
        const startY = UIHelpers.CONTENT_Y_START + 55;
        const spacing = 68;

        const leftIcons = [
            { key: 'icon_ranking', label: 'Ranking', callback: () => this.onSideIconClick('ranking') },
            { key: 'icon_pass', label: 'Pass', callback: () => this.onSideIconClick('pass') },
            { key: 'icon_package', label: 'Pakage', callback: () => this.onSideIconClick('package') },
        ];

        const rightIcons = [
            { key: 'icon_mail', label: 'Mail', callback: () => this.onSideIconClick('mail') },
            { key: 'icon_mission', label: 'Mission', callback: () => this.onSideIconClick('mission') },
            { key: 'icon_notice', label: 'Notice', callback: () => this.onSideIconClick('notice') },
        ];

        const leftX = 34;
        const rightX = width - 34;

        leftIcons.forEach((iconData, index) => {
            const y = startY + index * spacing;
            UIHelpers.createMenuIconBox(this, leftX, y, iconData.key, iconData.label, {
                size: 50,
                onClick: iconData.callback,
            });
        });

        rightIcons.forEach((iconData, index) => {
            const y = startY + index * spacing;
            UIHelpers.createMenuIconBox(this, rightX, y, iconData.key, iconData.label, {
                size: 50,
                onClick: iconData.callback,
            });
        });
    }

    createCharacterDisplay() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2 - 40;

        // Character image
        let charKey = null;
        if (this.textures.exists('zoom_char_1')) {
            charKey = 'zoom_char_1';
        } else if (this.textures.exists('char_monster')) {
            charKey = 'char_monster';
        }

        if (charKey) {
            const character = this.add.image(centerX, centerY, charKey);
            character.setOrigin(0.5);
            // Box-fit to a fixed footprint instead of setScale(), since
            // source character art resolution varies wildly (some are
            // 1500x2700+) and a flat scale factor causes huge overflow.
            UIHelpers.fitImage(character, width * 0.62, height * 0.42);

            // Subtle idle float animation
            this.tweens.add({
                targets: character,
                y: centerY - 8,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
        } else {
            // Fallback placeholder character silhouette
            const silhouette = this.add.graphics();
            silhouette.fillStyle(UIHelpers.COLORS.ACCENT_PURPLE, 0.3);
            silhouette.fillEllipse(centerX, centerY, 120, 180);
        }
    }

    createStageButton() {
        const { width, height } = this.scale;
        const btnY = height - UIHelpers.BOTTOM_NAV_HEIGHT - 55;

        // Main stage button - red pill matching reference "STAGE 1" tag
        const stageBtn = UIHelpers.createPillButton(this, width / 2, btnY, 170, 44, 'STAGE 1', {
            fontSize: '18px',
            bgColor: 0xe32c2c,
            borderColor: 0x8a1414,
            strokeColor: '#7a0e0e',
            cornerRadius: 12,
            onClick: () => this.onStageStart(),
        });

        // Pulsing glow effect on stage button
        this.tweens.add({
            targets: stageBtn,
            scaleX: 1.04,
            scaleY: 1.04,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }

    onStageStart() {
        console.log('[LobbyScene] Starting Stage 1...');

        // Flash effect
        this.cameras.main.flash(200, 123, 47, 247);

        // Here you would transition to the actual game/stage scene
        // this.scene.start('GameScene');
    }

    onSideIconClick(iconName) {
        console.log(`[LobbyScene] Side icon clicked: ${iconName}`);

        // Visual feedback - brief camera shake
        this.cameras.main.shake(100, 0.002);

        // Placeholder: show a brief notification
        this.showToast(`${iconName.charAt(0).toUpperCase() + iconName.slice(1)} - Coming soon!`);
    }

    showToast(message) {
        const { width } = this.scale;
        const toast = this.add.container(width / 2, 100);

        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRoundedRect(-120, -16, 240, 32, 16);
        toast.add(bg);

        const text = this.add.text(0, 0, message, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
        }).setOrigin(0.5);
        toast.add(text);

        toast.setAlpha(0);
        toast.setDepth(2000);

        this.tweens.add({
            targets: toast,
            alpha: 1,
            y: 110,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.time.delayedCall(1500, () => {
                    this.tweens.add({
                        targets: toast,
                        alpha: 0,
                        y: 90,
                        duration: 300,
                        onComplete: () => toast.destroy(),
                    });
                });
            },
        });
    }
}
