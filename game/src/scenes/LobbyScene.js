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

        // Side icons (left column)
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
        const icons = [
            { key: 'icon_ranking', label: 'Rank', callback: () => this.onSideIconClick('ranking') },
            { key: 'icon_pass', label: 'Pass', callback: () => this.onSideIconClick('pass') },
            { key: 'icon_package', label: 'Pack', callback: () => this.onSideIconClick('package') },
            { key: 'icon_mail', label: 'Mail', callback: () => this.onSideIconClick('mail') },
            { key: 'icon_mission', label: 'Mission', callback: () => this.onSideIconClick('mission') },
            { key: 'icon_notice', label: 'Notice', callback: () => this.onSideIconClick('notice') },
            { key: 'icon_settings', label: 'Settings', callback: () => this.onSideIconClick('settings') },
        ];

        const startY = UIHelpers.CONTENT_Y_START + 40;
        const spacing = 60;
        const x = 32;

        icons.forEach((iconData, index) => {
            const y = startY + index * spacing;
            UIHelpers.createIconButton(this, x, y, iconData.key, {
                scale: 0.5,
                label: iconData.label,
                labelFontSize: '9px',
                onClick: iconData.callback,
            });
        });
    }

    createCharacterDisplay() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2 - 20;

        // Character image
        let charKey = null;
        if (this.textures.exists('zoom_char_1')) {
            charKey = 'zoom_char_1';
        } else if (this.textures.exists('char_monster')) {
            charKey = 'char_monster';
        }

        if (charKey) {
            const character = this.add.image(centerX, centerY, charKey);
            character.setScale(0.6);
            character.setOrigin(0.5);

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

        // Power level display
        const powerContainer = this.add.container(centerX, centerY + 130);
        const powerBg = this.add.graphics();
        powerBg.fillStyle(0x000000, 0.5);
        powerBg.fillRoundedRect(-60, -14, 120, 28, 14);
        powerContainer.add(powerBg);

        const powerText = this.add.text(0, 0, '⚔ Power: 4,520', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GOLD,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        powerContainer.add(powerText);
    }

    createStageButton() {
        const { width, height } = this.scale;
        const btnY = height - UIHelpers.BOTTOM_NAV_HEIGHT - 60;

        // Main stage button
        const stageBtn = UIHelpers.createButton(this, width / 2, btnY, 180, 50, 'STAGE 1', {
            fontSize: '18px',
            bgColor: 0x7b2ff7,
            hoverColor: 0x9b4dff,
            activeColor: 0x5a1dbf,
            cornerRadius: 25,
            onClick: () => this.onStageStart(),
        });

        // Pulsing glow effect on stage button
        this.tweens.add({
            targets: stageBtn,
            scaleX: 1.03,
            scaleY: 1.03,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Stage info text below button
        this.add.text(width / 2, btnY + 38, 'Tap to begin adventure', {
            fontSize: '10px',
            fontFamily: 'Arial, sans-serif',
            color: UIHelpers.COLORS.TEXT_GRAY,
        }).setOrigin(0.5);
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
