/**
 * Bilal & Köpüş: Mission Asena
 * Main game configuration and initialization
 */

class Game {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: 1280,
            height: 720,
            parent: 'game-container',
            backgroundColor: '#87CEEB', // Sky blue
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 800 },
                    debug: true // Set to true for development
                }
            },
            scene: [PreloadScene, GameScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 640,
                    height: 360
                },
                max: {
                    width: 1920,
                    height: 1080
                }
            },
            render: {
                antialias: false,
                pixelArt: true
            }
        };
        
        this.game = new Phaser.Game(this.config);
        this.setupGlobalGameData();
    }
    
    setupGlobalGameData() {
        // FIRST: Define ground constants
        const GROUND_Y = 670;          // Y coordinate for ground
        const GROUND_HEIGHT = 250;     // Height of ground collision area
        const GROUND_OFFSET = 8;      // Offset for player & companion sprites to align feet with ground
        
        // Global game state that persists across scenes
        window.gameData = {
            // Player progress
            currentSegment: 1,
            playerPosition: { x: 100, y: GROUND_Y - GROUND_OFFSET }, 
            companionPosition: { x: 50, y: GROUND_Y - GROUND_OFFSET },

            // Collectibles and inventory
            collectedItems: [],
            totalCollectibles: 0,
            
            // Checkpoints
            checkpoints: {
                segment1_mid: false,
                segment1_end: false
            },
            
            // Game settings
            audioEnabled: true,
            musicVolume: 0.6,
            effectsVolume: 0.8,
            debug: true, // Set to true to show debug information
            
            // Current game state
            currentZone: 'kusadasi', // Current environment zone
            
            // Technical specs
            gameWidth: 1280,
            gameHeight: 720,
            worldWidth: 30000, // Total game world width (5 segments × 6000px each)
            segment1Width: 6000, 
            segment2Width: 6000, 
            segment3Width: 6000, 
            segment4Width: 6000, 
            segment5Width: 6000, 
            
            // Physics constants
            playerSpeed: 300,
            jumpVelocity: -500,
            gravity: 800,
            companionSpeed: 250,
            companionCatchUpSpeed: 350,
            
            // Interaction constants
            interactionRadius: 40,
            followDistance: 80,
            dialogueDuration: 3000,
            
            // GROUND SYSTEM CONSTANTS
            GROUND_Y: GROUND_Y,
            GROUND_HEIGHT: GROUND_HEIGHT,
            GROUND_OFFSET: GROUND_OFFSET,  // Added for proper sprite alignment
            
            // Layer depths for proper rendering order
            DEPTHS: {
                BACKGROUND: -2,
                GROUND: -1,
                ENVIRONMENT: 0,
                CHARACTERS: 1,
                COLLECTIBLES: 2,
                UI: 10
            },
            
            // Parallax factors for background layers
            PARALLAX: {
                BACKGROUND: 0.2,
                MIDDLE: 0.5,
                FOREGROUND: 1.0
            }
        };
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new Game();
});

// Utility functions for game-wide use
window.GameUtils = {
    // Distance calculation between two points
    getDistance: (obj1, obj2) => {
        return Phaser.Math.Distance.Between(obj1.x, obj1.y, obj2.x, obj2.y);
    },
    
    // Save game progress to localStorage
    saveProgress: () => {
        try {
            localStorage.setItem('bilal_kopus_save', JSON.stringify({
                currentSegment: window.gameData.currentSegment,
                playerPosition: window.gameData.playerPosition,
                collectedItems: window.gameData.collectedItems,
                checkpoints: window.gameData.checkpoints,
                timestamp: Date.now()
            }));
            return true;
        } catch (error) {
            console.warn('Could not save game progress:', error);
            return false;
        }
    },
    
    // Load game progress from localStorage
    loadProgress: () => {
        try {
            const saveData = localStorage.getItem('bilal_kopus_save');
            if (saveData) {
                const parsed = JSON.parse(saveData);
                // Merge saved data with current gameData
                Object.assign(window.gameData, parsed);
                return true;
            }
        } catch (error) {
            console.warn('Could not load game progress:', error);
        }
        return false;
    }
};
