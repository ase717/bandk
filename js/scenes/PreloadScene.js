/**
 * PreloadScene - VISUAL OVERHAUL: Uses AssetCreator for modular asset generation
 * Turkish Aegean Coast Theme with Realistic Proportions
 */
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        console.log('A Road to Asena..');

        // Get loading screen elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingProgress = document.getElementById('loading-progress');
        this.loadingText = document.getElementById('loading-text');

        if (!this.loadingScreen) {
            console.error('❌ Loading screen elements not found!');
            return;
        }

        // Load ground tiles
        console.log('🎨 Loading ground tiles...');
        this.load.image('floor_tiles', 'assets/tiles/FloorTiles.png');

        // Load character assets
        console.log('🎨 Loading character assets...');

        console.log('Loading character sprite sheet..')
        // Male character (base + clothes all as sprite sheets) - FIXED: Using 64x64 frames
        this.load.spritesheet('male_skin', 'assets/sprites/male_character/Male_Skin.png', {
            frameWidth: 64,
            frameHeight: 80,
        });

        this.load.spritesheet('male_hair', 'assets/sprites/male_character/Male_Hair.png', {
            frameWidth: 64,
            frameHeight: 80,
        });

        this.load.spritesheet('male_shirt', 'assets/sprites/male_character/Male_Shirt.png', {
            frameWidth: 64,
            frameHeight: 80,
        });

        this.load.spritesheet('male_pants', 'assets/sprites/male_character/Male_Pants.png', {
            frameWidth: 64,
            frameHeight: 80,
        });

        this.load.spritesheet('male_boots', 'assets/sprites/male_character/Male_Boots.png', {
            frameWidth: 64,
            frameHeight: 80,
        });

        // Load companion dog asset
        console.log('🎨 Loading companion dog asset...');
        // Note: If kopus.png doesn't exist, we'll create it programmatically in create()

        // Load new collectible assets
        console.log('🎨 Loading collectible assets...');
        this.load.image('beer', 'assets/sprites/collectibles/beer.png');
        this.load.image('white_cheese', 'assets/sprites/collectibles/white_cheese.png');
        this.load.image('wine_red', 'assets/sprites/collectibles/wine_red.png');

        // Load your existing background assets
        console.log('🎨 Loading sea, forest and cottonfield theme backgrounds from assets folder...');

        // Load Sea Theme Assets (4 layers: sky, far, mid, near)
        this.load.image('sea_sky', 'assets/backgrounds/sea/sea1.png');
        this.load.image('sea_far', 'assets/backgrounds/sea/sea2.png');
        this.load.image('sea_mid', 'assets/backgrounds/sea/sea3.png');
        this.load.image('sea_near', 'assets/backgrounds/sea/sea4.png');

        // Load Forest Theme Assets (4 layers: sky, far, mid, near)
        this.load.image('forest_sky', 'assets/backgrounds/forest/forest1.png');
        this.load.image('forest_far', 'assets/backgrounds/forest/forest2.png');
        this.load.image('forest_mid', 'assets/backgrounds/forest/forest3.png');
        this.load.image('forest_near', 'assets/backgrounds/forest/forest4.png');

        // Load Cottonfield Theme Assets (4 layers: sky, far, mid, near)
        this.load.image('cottonfield_sky', 'assets/backgrounds/cotton_field/cottonfield1.png');
        this.load.image('cottonfield_far', 'assets/backgrounds/cotton_field/cottonfield2.png');
        this.load.image('cottonfield_mid', 'assets/backgrounds/cotton_field/cottonfield3.png');
        this.load.image('cottonfield_near', 'assets/backgrounds/cotton_field/cottonfield4.png');

        // Load Turkey Assets
        this.load.spritesheet('turkey', 'assets/sprites/animals/turkey_anim.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
        this.load.spritesheet('sheep', 'assets/sprites/animals/sheep_anim.png', {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet('companion_dog_idle', 'assets/sprites/kopus/companion_dog_idle.png', {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet('companion_dog_walk', 'assets/sprites/kopus/companion_dog_walk.png', {
            frameWidth: 32,
            frameHeight: 32,
        });


        // Set up loading progress
        this.load.on('progress', (percentage) => {
            this.updateProgress(Math.floor(percentage * 20), 'Loading background assets...');
        });

        console.log('🎨 Preparing Turkish Aegean coast asset creation...');
    }

    create() {
        console.log('🎨 Creating player texture first...');
        this.createPlayerTexture();
        this.createAssetsWithProgress();
    }

    async createAssetsWithProgress() {
        // Create AssetCreator instance
        this.assetCreator = new AssetCreator(this);

        // Progress callback function
        const progressCallback = (percentage, message) => {
            this.updateProgress(percentage, message);
        };

        try {
            // Create all assets using the modular AssetCreator
            await this.assetCreator.createAllAssets(progressCallback);

            // Final setup
            this.updateProgress(100, 'Turkish Aegean assets ready!');
            console.log('🎨 VISUAL OVERHAUL COMPLETE: Prince of Persia style pixel art created');

            await this.delay(500);
            this.hideLoadingAndStart();

        } catch (error) {
            console.error('❌ Error creating assets:', error);
            this.updateProgress(100, 'Error loading assets');
        }
    }

    async hideLoadingAndStart() {
        console.log('🎨 Starting game with modular visual assets...');

        // Verify critical textures exist before starting game
        const criticalTextures = ['player_male', 'companion_dog'];
        const missingTextures = criticalTextures.filter(texture => !this.textures.exists(texture));

        if (missingTextures.length > 0) {
            console.error('❌ Critical textures missing:', missingTextures);
            // Create emergency fallbacks for missing textures
            missingTextures.forEach(texture => {
                if (texture === 'player_male') {
                    this.createReliableFallback();
                }
            });
        }

        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
            setTimeout(() => {
                this.loadingScreen.classList.add('completely-hidden');
            }, 600);
        }

        // Add small delay to ensure all textures are properly registered
        await this.delay(100);
        this.scene.start('GameScene');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateProgress(percentage, message) {
        console.log(`🎨 Loading: ${percentage}% - ${message}`);
        if (this.loadingProgress && this.loadingText) {
            this.loadingProgress.style.width = percentage + '%';
            this.loadingText.textContent = percentage + '%';
        }
    }

    createPlayerTexture() {
        console.log('🎨 Creating layered player textures from sprite sheets...');
        
        // Check if all required sprite sheets exist
        const requiredLayers = ['male_skin', 'male_hair', 'male_shirt', 'male_pants', 'male_boots'];
        const missingLayers = requiredLayers.filter(layer => !this.textures.exists(layer));
        
        if (missingLayers.length > 0) {
            console.warn(`⚠️ Missing sprite sheet layers: ${missingLayers.join(', ')}`);
            console.warn('⚠️ Using fallback - animations will use single sprite sheet');
            return;
        }

        try {
            // Create layered textures for key animation frames
            
            // IDLE FRAMES (Row 1: frames 0-2)
            this.createLayeredFrame('player_idle_1', requiredLayers, 0);
            this.createLayeredFrame('player_idle_2', requiredLayers, 1);
            this.createLayeredFrame('player_idle_3', requiredLayers, 2);
            this.createLayeredFrame('player_idle_4', requiredLayers, 3);
            this.createLayeredFrame('player_idle_5', requiredLayers, 4);
            
            // WALKING FRAMES (Row 2: frames 5-12, use key walking frames)
            this.createLayeredFrame('player_walk_1', requiredLayers, 8);
            this.createLayeredFrame('player_walk_2', requiredLayers, 9);
            this.createLayeredFrame('player_walk_3', requiredLayers, 10);
            this.createLayeredFrame('player_walk_4', requiredLayers, 11);
            this.createLayeredFrame('player_walk_5', requiredLayers, 12);
            this.createLayeredFrame('player_walk_6', requiredLayers, 13);
            this.createLayeredFrame('player_walk_7', requiredLayers, 14);
            this.createLayeredFrame('player_walk_8', requiredLayers, 15);
            
            
            // JUMPING FRAMES (Row 4: frames 21-24)
            this.createLayeredFrame('player_jump_1', requiredLayers, 24); // Jump start
            this.createLayeredFrame('player_jump_2', requiredLayers, 25); // Jump mid
            this.createLayeredFrame('player_jump_3', requiredLayers, 26); // Jump 
            this.createLayeredFrame('player_jump_4', requiredLayers, 27); // Jump peak

            // LANDING FRAMES (Row 5: frames 25-26)
            this.createLayeredFrame('player_land_1', requiredLayers, 32); // Landing frame
            this.createLayeredFrame('player_land_2', requiredLayers, 33); // Return to idle

            
            // Main player texture (idle frame 0)
            this.createLayeredFrame('player_male', requiredLayers, 0);
            
            console.log('✅ Layered player textures created from sprite sheet frames');
            
        } catch (error) {
            console.error('❌ Failed to create layered textures:', error);
            console.warn('⚠️ Falling back to single sprite sheet animations');
        }
    }


    createLayeredFrame(textureKey, layers, frameIndex) {
        // Check if texture already exists
        if (this.textures.exists(textureKey)) {
            console.warn(`⚠️ Texture ${textureKey} already exists, skipping`);
            return true;
        }

        const width = 64;
        const height = 80;

        try {
            // Create render texture
            const renderTexture = this.add.renderTexture(0, 0, width, height);
            renderTexture.clear();
            renderTexture.setPosition(-500, -500); // Move far offscreen

            const tempSprites = [];
            
            // Create all layer sprites first
            layers.forEach(layerKey => {
                if (this.textures.exists(layerKey)) {
                    const sprite = this.add.image(0, 0, layerKey, frameIndex);
                    // CRITICAL FIX: Set origin to (0, 0) to ensure consistent positioning
                    sprite.setOrigin(0, 0);
                    // Position all sprites at exactly (0, 0) - no offset variations
                    sprite.setPosition(0, 0);
                    tempSprites.push(sprite);
                } else {
                    console.warn(`Layer ${layerKey} not found for frame ${frameIndex}`);
                }
            });

            // CRITICAL FIX: Draw sprites at (0, 0) with no position variations
            tempSprites.forEach(sprite => {
                // Draw each sprite at exactly the same position (0, 0) in the render texture
                // This ensures all frames have identical positioning
                renderTexture.draw(sprite, 0, 0);
            });

            // Save the texture
            renderTexture.saveTexture(textureKey);

            // Clean up temp sprites
            tempSprites.forEach(sprite => sprite.destroy());
            renderTexture.destroy();

            if (this.textures.exists(textureKey)) {
                console.log(`✅ Created layered texture: ${textureKey} from frame ${frameIndex} (consistent positioning)`);
                return true;
            } else {
                console.error(`❌ Failed to create texture: ${textureKey}`);
                return false;
            }
        } catch (error) {
            console.error(`❌ Error creating layered frame ${textureKey}:`, error);
            return false;
        }
    }

    createReliableFallback() {
        console.log('🔧 Creating reliable fallback texture for 64x80...');
        
        // FIXED: Check if texture already exists
        if (this.textures.exists('player_male')) {
            console.warn('⚠️ player_male texture already exists, skipping fallback creation');
            return;
        }
        
        const graphics = this.add.graphics();
        
        // Create a complete, visible 64x80 character
        // Background (for visibility testing)
        graphics.fillStyle(0x000000, 0.1);
        graphics.fillRect(0, 0, 64, 80);
        
        // Head (tan skin) - properly sized for 64x80
        graphics.fillStyle(0xDEB887);
        graphics.fillRect(12, 4, 40, 28);
        
        // Hair (brown)
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(8, 0, 48, 16);
        
        // Eyes (black)
        graphics.fillStyle(0x000000);
        graphics.fillRect(20, 12, 4, 4);
        graphics.fillRect(36, 12, 4, 4);
        
        // Nose
        graphics.fillStyle(0xCD853F);
        graphics.fillRect(30, 20, 4, 4);
        
        // Shirt (blue) - full torso
        graphics.fillStyle(0x4682B4);
        graphics.fillRect(8, 32, 48, 28);
        
        // Arms
        graphics.fillStyle(0xDEB887);
        graphics.fillRect(0, 36, 8, 24);  // Left arm
        graphics.fillRect(56, 36, 8, 24); // Right arm
        
        // Pants (dark blue)
        graphics.fillStyle(0x1E3A8A);
        graphics.fillRect(12, 60, 40, 20);
        
        graphics.generateTexture('player_male', 64, 80);
        graphics.destroy();
        
        console.log('✅ Reliable 64x80 fallback created - should be VERY visible');
    }

    createSimpleFallback(key) {
        // FIXED: Check if texture already exists
        if (this.textures.exists(key)) {
            console.warn(`⚠️ Texture ${key} already exists, skipping fallback creation`);
            return;
        }

        const graphics = this.add.graphics();
        
        // Background for visibility
        graphics.fillStyle(0x000000, 0.1);
        graphics.fillRect(0, 0, 64, 80);
        
        // Head - scaled for 64x80
        graphics.fillStyle(0xDEB887);
        graphics.fillRect(12, 4, 80, 56);
        
        // Hair
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(8, 0, 96, 32);
        
        // Eyes
        graphics.fillStyle(0x000000);
        graphics.fillRect(32, 24, 12, 12);
        graphics.fillRect(84, 24, 12, 12);
        
        // Shirt
        graphics.fillStyle(0x4682B4);
        graphics.fillRect(8, 32, 96, 40);
        
        // Arms - scaled for 64x80
        graphics.fillStyle(0xDEB887);
        graphics.fillRect(0, 36, 16, 32);
        graphics.fillRect(112, 36, 16, 32);
        
        // Pants - scaled for 64x80
        graphics.fillStyle(0x1E3A8A);
        graphics.fillRect(12, 52, 80, 24);
        
        graphics.generateTexture(key, 64, 80);
        graphics.destroy();
        
        console.log(`✅ Created 64x80 fallback for ${key}`);
    }

    createBrightFallback() {
        // This method is kept for backward compatibility but improved
        this.createReliableFallback();
    }

}