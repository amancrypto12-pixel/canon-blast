/**
 * PreloaderScene.js - Loads all UI assets and shows a loading bar
 */

class PreloaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloaderScene' });
    }

    preload() {
        this.createLoadingBar();
        this.loadBackgrounds();
        this.loadEquipmentIcons();
        this.loadSkillIcons();
        this.loadUIElements();
        this.loadCurrencyIcons();
        this.loadNavBarIcons();
        this.loadMiscAssets();
    }

    createLoadingBar() {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        // Dark background
        this.cameras.main.setBackgroundColor(0x1a1a2e);

        // Title
        this.add.text(centerX, centerY - 60, 'LOADING...', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Progress bar background
        const barBg = this.add.graphics();
        barBg.fillStyle(0x2a2a4a, 1);
        barBg.fillRoundedRect(centerX - 150, centerY - 10, 300, 20, 10);

        // Progress bar fill
        const barFill = this.add.graphics();

        // Percentage text
        const percentText = this.add.text(centerX, centerY + 30, '0%', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#aaaaaa',
        }).setOrigin(0.5);

        // Update progress bar on load progress
        this.load.on('progress', (value) => {
            barFill.clear();
            barFill.fillStyle(0x7b2ff7, 1);
            barFill.fillRoundedRect(centerX - 150, centerY - 10, 300 * value, 20, 10);
            percentText.setText(Math.floor(value * 100) + '%');
        });

        this.load.on('complete', () => {
            percentText.setText('100%');
        });
    }

    loadBackgrounds() {
        const basePath = '../New/';

        // Background images
        this.load.image('bg_lobby', basePath + 'Minimalist_game_UI_background_202607162055.jpeg');
        this.load.image('bg_equip', basePath + 'Minimalist_game_UI_background_202607162055_2.jpeg');
        this.load.image('bg_talent', basePath + 'Minimalist_game_UI_background_202607162055_3.jpeg');
        this.load.image('bg_shop', basePath + 'Minimalist_game_UI_background_202607162055_4.jpeg');
        this.load.image('bg_abyss', basePath + 'Stone_abyss_gate_fiery_cave_202607162055.jpeg');
        this.load.image('bg_glow', basePath + 'Minimalist_game_UI_background_glow_202607162055.jpeg');
        this.load.image('bg_dark', basePath + 'Minimalist_game_UI_background_202607162055_5.jpeg');
    }

    loadEquipmentIcons() {
        const basePath = '../New/';

        this.load.image('equip_hat', basePath + 'Fedora_hat_game_UI_icon_202607161809.png');
        this.load.image('equip_necklace', basePath + 'Chain_necklace_diamond_pendant_icon_202607161809.png');
        this.load.image('equip_ring', basePath + 'Ring_with_diamond_icon_202607161809.png');
        this.load.image('equip_belt', basePath + 'Belt_icon_game_asset_202607161809.png');
        this.load.image('equip_shirt', basePath + 'T-shirt_icon_representing_armor_202607161809.png');
        this.load.image('equip_boots', basePath + 'Combat_boots_UI_icon_202607161809.png');
        this.load.image('equip_sword', basePath + 'Chibi_sword_game_icon_202607161809.png');
    }

    loadSkillIcons() {
        const basePath = '../New/';

        this.load.image('skill_attack', basePath + 'Attack_power_game_icon_202608050028.png');
        this.load.image('skill_critical', basePath + 'Critical_power_game_icon_202608050028.png');
        this.load.image('skill_speed', basePath + 'Speed_boost_game_icon_202608050028.png');
        this.load.image('skill_health', basePath + 'Health_potion_game_icon_202608050028.png');
        this.load.image('skill_mana', basePath + 'Mana_potion_game_icon_202608050028.png');
        this.load.image('skill_shield', basePath + 'Magic_shield_energy_barrier_bubble_202608050028.png');
        this.load.image('skill_defense', basePath + 'Steel_tower_shield_game_icon_202608050028.png');
        this.load.image('skill_range_def', basePath + 'Range_defense_helmet_game_icon_202608050028.png');
        this.load.image('skill_poison', basePath + 'Poison_or_venom_game_icon_202608050028.png');
        this.load.image('skill_luck', basePath + 'Four-leaf_clover_game_icon_202608050028.png');
        this.load.image('skill_time', basePath + 'Golden_hourglass_game_icon_202608050028.png');
        this.load.image('skill_blue_crystal', basePath + 'Blue_crystal_bottle_game_icon_202608050028.png');
        this.load.image('skill_blue_shield', basePath + 'Blue_medieval_shield_game_icon_202608050028.png');
        this.load.image('skill_boot_wings', basePath + 'Winged_golden_boot_icon_202608050028.png');
    }

    loadCurrencyIcons() {
        const basePath = '../New/';

        this.load.image('currency_gold', basePath + 'Gold_coin_with_star_symbol_202608050028.png');
        this.load.image('currency_diamond', basePath + 'blue gem.png');
        this.load.image('currency_energy', basePath + 'Red_health_potion_bottle_icon_202607161809.png');
        this.load.image('crystal_purple', basePath + 'Glowing_purple_magic_crystal_icon_202607161809.png');
    }

    loadUIElements() {
        const basePath = '../New/';

        this.load.image('ui_frame', basePath + 'Blue_game_UI_frame_template_202607161809.png');
        this.load.image('ui_panel_dark', basePath + 'Change_UI_element_color_to_202607161809.png');
        this.load.image('ui_panel_dark2', basePath + 'Change_UI_element_color_to_202607161809_2.png');
        this.load.image('avatar_player', basePath + 'Аватарка - Edited.png');
    }

    loadNavBarIcons() {
        const basePath = '../New/';

        // Nav bar uses crystal/gem icons + character icon
        this.load.image('nav_shop', basePath + 'Glowing_purple_magic_crystal_icon_202607161809.png');
        this.load.image('nav_equip', basePath + 'ico.png');
        this.load.image('nav_lobby', basePath + 'Chibi_sword_game_icon_202607161809.png');
        this.load.image('nav_talent', basePath + 'Blue_crystal_bottle_game_icon_202608050028.png');
        this.load.image('nav_abyss', basePath + 'Monster_33_Cinder_Hound_202607161809.png');
    }

    loadMiscAssets() {
        const basePath = '../New/';

        this.load.image('char_monster', basePath + 'Monster_33_Cinder_Hound_202607161809.png');
        this.load.image('remove_bg_1', basePath + 'Remove_background_provide_PNG_202607141837.png');
        this.load.image('remove_bg_2', basePath + 'Remove_background_provide_PNG_202607141840.png');
        this.load.image('zoom_char_1', basePath + 'Zoom_image_remove_background_PNG_202607141816.png');
        this.load.image('zoom_char_2', basePath + 'Zoom_image_remove_background_PNG_202607141820.png');
        this.load.image('star_icon', basePath + 'ChatGPT Image Jul 13, 2026, 01_38_16 PM.png');
    }

    create() {
        // Generate any runtime placeholder textures for missing assets
        this.generatePlaceholders();

        // Transition to the Lobby scene
        this.time.delayedCall(500, () => {
            this.scene.start('LobbyScene');
        });
    }

    generatePlaceholders() {
        // Generate small colored placeholders for UI elements that may not have real assets yet
        const placeholders = [
            { key: 'icon_ranking', color: 0xffd700 },
            { key: 'icon_pass', color: 0x7b2ff7 },
            { key: 'icon_package', color: 0x2ed573 },
            { key: 'icon_mail', color: 0x00d4ff },
            { key: 'icon_mission', color: 0xff4757 },
            { key: 'icon_notice', color: 0xff6b35 },
            { key: 'icon_settings', color: 0xaaaaaa },
            { key: 'btn_stage', color: 0x7b2ff7 },
        ];

        placeholders.forEach(({ key, color }) => {
            if (!this.textures.exists(key)) {
                UIHelpers.generatePlaceholder(this, key, 40, 40, color);
            }
        });
    }
}
