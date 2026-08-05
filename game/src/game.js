/**
 * game.js - Main Phaser 3 game configuration
 */

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: UIHelpers.GAME_WIDTH,
    height: UIHelpers.GAME_HEIGHT,
    backgroundColor: '#1a1a2e',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
        PreloaderScene,
        LobbyScene,
        EquipScene,
        TalentScene,
        ShopScene,
        AbyssScene,
    ],
};

const game = new Phaser.Game(config);
