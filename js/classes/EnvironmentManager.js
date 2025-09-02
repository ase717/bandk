/**
 * EnvironmentManager - Parallax Background System with Theme Transitions
 * Implements three-stack system (A/B/C) with smooth theme transitions
 */
class EnvironmentManager {
    constructor(scene) {
        this.scene = scene;
        this.worldWidth = window.gameData.segment1Width; // 6000px
        this.worldHeight = window.gameData.gameHeight; // 720px

        // Three-stack system for smooth theme transitions
        this.stackA = { // Active stack
            sky: null,
            far: null,
            mid: null,
            near: null,
            ground: null,
            alpha: 1
        };

        this.stackB = { // Next theme stack (starts invisible)
            sky: null,
            far: null,
            mid: null,
            near: null,
            ground: null,
            alpha: 0
        };    

        this.stackC = {
            sky: null,
            far: null,
            mid: null,
            near: null,
            ground: null,
            alpha: 0
        };

        // Available themes
        this.themes = ['sea', 'forest', 'cottonfield'];
        this.currentThemeIndex = 0;

        // Parallax speeds
        this.parallaxSpeeds = {
            sky: 0.1,
            far: 0.3,
            mid: 0.6,
            near: 1.0
        };

        // Transition system
        this.transitionDistance = 2000; // Distance before starting transition
        this.transitionDuration = 2000; // 2 seconds in milliseconds
        this.lastTransitionX = 0;
        this.isTransitioning = false;
        this.transitionStartTime = 0;

        console.log('🎨 EnvironmentManager initialized with two-stack parallax system');
    }

    create() {
        console.log('🎨 Creating three-stack parallax background system...');

        // Initialize Stack A with first theme (sea)
        this.createThemeStack(this.stackA, this.themes[0]);

        // Initialize Stack B with second theme (forest) - starts invisible
        this.createThemeStack(this.stackB, this.themes[1]);
        this.stackB.alpha = 0;
        this.setStackAlpha(this.stackB, 0);

        this.createThemeStack(this.stackC, this.themes[2]);
        this.stackC.alpha = 0;
        this.setStackAlpha(this.stackC, 0);


        console.log('✅ Two-stack parallax system created with smooth theme transitions');
    }

    createThemeStack(stack, theme) {
        console.log(`🎨 Creating ${theme} theme stack...`);

        // Create layers for the theme
        if (theme === 'sea') {
            this.createSeaTheme(stack);
        } else if (theme === 'forest') {
            this.createForestTheme(stack);
        } else if (theme === 'cottonfield') {
            this.createCottonfieldTheme(stack);
        }

        // Set parallax scroll factors and depths for all children in groups
        this.setGroupProperties(stack.sky, this.parallaxSpeeds.sky, -4);
        this.setGroupProperties(stack.far, this.parallaxSpeeds.far, -3);
        this.setGroupProperties(stack.mid, this.parallaxSpeeds.mid, -2);
        this.setGroupProperties(stack.near, this.parallaxSpeeds.near, -1);

        // Ground tiles move at full speed (1.0) and are at ground depth
        if (stack.ground) {
            this.setGroupProperties(stack.ground, 1.0, window.gameData.DEPTHS.GROUND);
        }
    }

    setGroupProperties(group, scrollFactor, depth) {
        if (group && group.children) {
            group.children.entries.forEach(child => {
                child.setScrollFactor(scrollFactor, 1);
                child.setDepth(depth);
            });
        }
    }

    createSeaTheme(stack) {
        // Use your existing sea background assets with proper aspect ratio fitting
        this.createThemeWithProperFitting(stack, 'sea', {
            sky: 'sea_sky',
            far: 'sea_far',
            mid: 'sea_mid',
            near: 'sea_near'
        });

        // Create ground tiles for sea theme
        this.createGroundTiles(stack, 'sea');
    }

    createForestTheme(stack) {
        // Use your existing forest background assets with proper aspect ratio fitting
        this.createThemeWithProperFitting(stack, 'forest', {
            sky: 'forest_sky',
            far: 'forest_far',
            mid: 'forest_mid',
            near: 'forest_near'
        });

        // Create ground tiles for forest theme
        this.createGroundTiles(stack, 'forest');
    }

    createCottonfieldTheme(stack) {
        this.createThemeWithProperFitting(stack, 'cottonfield', {
            sky: 'cottonfield_sky',
            far: 'cottonfield_far',
            mid: 'cottonfield_mid',
            near: 'cottonfield_near'
        });

        // Create ground tiles for cottonfield theme
        this.createGroundTiles(stack, 'cottonfield');
    }

    createThemeWithProperFitting(stack, themeName, assetKeys) {
        // Get game screen dimensions
        const gameWidth = 1280;
        const gameHeight = 720;

        // Create groups for each layer
        stack.sky = this.scene.add.group();
        stack.far = this.scene.add.group();
        stack.mid = this.scene.add.group();
        stack.near = this.scene.add.group();

        // Process each layer individually for optimal fitting
        const layers = [
            { key: assetKeys.sky, group: stack.sky, name: 'sky' },
            { key: assetKeys.far, group: stack.far, name: 'far' },
            { key: assetKeys.mid, group: stack.mid, name: 'mid' },
            { key: assetKeys.near, group: stack.near, name: 'near' }
        ];

        layers.forEach(layer => {
            // Get dimensions for this specific layer
            const texture = this.scene.textures.get(layer.key);
            const originalWidth = texture.source[0].width;
            const originalHeight = texture.source[0].height;

            // Calculate scale to fit screen without breaking aspect ratio
            // Use Math.max to ensure full screen coverage (may crop edges)
            const scaleX = gameWidth / originalWidth;
            const scaleY = gameHeight / originalHeight;
            const scale = Math.max(scaleX, scaleY);

            // Calculate final dimensions after scaling
            const scaledWidth = originalWidth * scale;
            const scaledHeight = originalHeight * scale;

            // Calculate how many tiles needed to cover world width
            const tilesNeeded = Math.ceil(this.worldWidth / scaledWidth);

            // Calculate Y offset to center vertically if image is taller than screen
            const yOffset = scaledHeight > gameHeight ? -(scaledHeight - gameHeight) / 2 : 0;

            console.log(`🎨 ${themeName} ${layer.name}: ${originalWidth}x${originalHeight} → Scale: ${scale.toFixed(2)} → ${scaledWidth.toFixed(0)}x${scaledHeight.toFixed(0)}, Tiles: ${tilesNeeded}`);

            // Create tiles for this layer
            for (let i = 0; i < tilesNeeded; i++) {
                const x = i * scaledWidth;

                const tile = this.scene.add.image(x, yOffset, layer.key).setOrigin(0, 0);
                tile.setScale(scale);

                // Apply layer-specific fitting strategy
                this.applyLayerFitting(tile, layer.name, originalWidth, originalHeight, gameWidth, gameHeight, scale);

                layer.group.add(tile);
            }
        });

        console.log(`✅ ${themeName} theme created with proper aspect ratio fitting`);
    }

    createGroundTiles(stack, theme) {
        // Create ground layer using FloorTiles.png
        const groundY = window.gameData.GROUND_Y; // 640
        const tileSize = 32; // Assuming 32x32 tiles
        const tilesNeeded = Math.ceil(this.worldWidth / tileSize);

        // Add ground group to stack
        stack.ground = this.scene.add.group();

        for (let i = 0; i < tilesNeeded; i++) {
            const x = i * tileSize;

            // Try to use FloorTiles.png, fallback to generated tiles
            let tileKey = 'floor_tiles';
            if (!this.scene.textures.exists('floor_tiles')) {
                tileKey = 'floor_tiles_fallback';
            }

            // Create ground tile
            const groundTile = this.scene.add.image(x, groundY, tileKey).setOrigin(0, 0);

            // Apply theme-specific tinting
            if (theme === 'sea') {
                groundTile.setTint(0xF4E4BC); // Sandy beach color
            } else if (theme === 'forest') {
                groundTile.setTint(0x8FBC8F); // Forest floor color
            }

            groundTile.setDepth(window.gameData.DEPTHS.GROUND);
            stack.ground.add(groundTile);
        }

        console.log(`🎨 Ground tiles created for ${theme} theme`);
    }

    setStackAlpha(stack, alpha) {
        stack.alpha = alpha;

        // Set alpha for all layers
        const layers = ['sky', 'far', 'mid', 'near', 'ground'];

        layers.forEach(layerName => {
            const layer = stack[layerName];
            if (layer) {
                if (layer.children) {
                    layer.children.entries.forEach(child => child.setAlpha(alpha));
                } else {
                    layer.setAlpha(alpha);
                }
            }
        });
    }

    checkForTransition(playerX) {
        // Check if we should start a transition
        if (!this.isTransitioning && playerX - this.lastTransitionX >= this.transitionDistance) {
            this.startTransition();
            this.lastTransitionX = playerX;
        }
    }

    startTransition() {
        console.log('🎨 Starting theme transition...');
        this.isTransitioning = true;
        this.transitionStartTime = this.scene.time.now;

        // Prepare next theme in Stack B
        this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
        const nextTheme = this.themes[this.currentThemeIndex];

        // Destroy old Stack B and create new theme
        this.destroyStack(this.stackB);
        this.createThemeStack(this.stackB, nextTheme);
        this.setStackAlpha(this.stackB, 0);
    }

    updateTransition() {
        if (!this.isTransitioning) return;

        const elapsed = this.scene.time.now - this.transitionStartTime;
        const progress = Math.min(elapsed / this.transitionDuration, 1);

        // Smooth fade transition
        const fadeOutAlpha = 1 - progress;
        const fadeInAlpha = progress;

        this.setStackAlpha(this.stackA, fadeOutAlpha);
        this.setStackAlpha(this.stackB, fadeInAlpha);
        this.setStackAlpha(this.stackC, fadeInAlpha);

        // Transition complete
        if (progress >= 1) {
            this.completeTransition();
        }
    }

    completeTransition() {
        console.log('🎨 Theme transition complete - swapping stacks');
        this.isTransitioning = false;

        // Swap stacks: A becomes B, B becomes A
        const tempStack = this.stackA;
        this.stackA = this.stackB;
        this.stackB = tempStack;

        // Ensure Stack A is fully visible, Stack B is invisible
        this.setStackAlpha(this.stackA, 1);
        this.setStackAlpha(this.stackB, 0);
        this.setStackAlpha(this.stackC, 0);

        // Prepare next theme for Stack B
        const nextThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
        const nextTheme = this.themes[nextThemeIndex];

        this.destroyStack(this.stackB);
        this.createThemeStack(this.stackB, nextTheme);
        this.setStackAlpha(this.stackB, 0);

        this.destroyStack(this.stackC);
        this.createThemeStack(this.stackC, nextTheme);
        this.setStackAlpha(this.stackC, 0);
    }

    destroyStack(stack) {
        const layers = ['sky', 'far', 'mid', 'near', 'ground'];

        layers.forEach(layerName => {
            if (stack[layerName]) {
                stack[layerName].destroy(true); // true destroys all children
                stack[layerName] = null;
            }
        });
    }


    update() {
        // Check for theme transitions based on player position
        if (this.scene.player) {
            this.checkForTransition(this.scene.player.x);
        }

        // Update ongoing transition
        this.updateTransition();

        // Animate wave effects in sea theme
        this.animateWaves();
    }

    animateWaves() {
        const time = this.scene.time.now * 0.001; // Convert to seconds
        const waveOffset = Math.sin(time * 2) * 3;

        // Animate Stack A sea waves
        if (this.stackA.mid && this.stackA.mid.children) {
            this.stackA.mid.children.entries.forEach(child => {
                if (child.texture.key === 'sea_mid') {
                    child.y = waveOffset;
                }
            });
        }

        // Animate Stack B sea waves
        if (this.stackB.mid && this.stackB.mid.children) {
            this.stackB.mid.children.entries.forEach(child => {
                if (child.texture.key === 'sea_mid') {
                    child.y = waveOffset;
                }
            });
        }
    }

    updateZone(playerX) {
        // This method is kept for compatibility but the new system
        // uses distance-based transitions instead of zone-based
        this.checkForTransition(playerX);
    }

    applyLayerFitting(tile, layerName, originalWidth, originalHeight, gameWidth, gameHeight, baseScale) {
        // Apply different fitting strategies based on layer type
        const scaledWidth = originalWidth * baseScale;
        const scaledHeight = originalHeight * baseScale;

        if (layerName === 'sky') {
            // Sky should always fill the top portion of the screen
            if (scaledHeight < gameHeight) {
                const heightScale = gameHeight / originalHeight;
                tile.setScale(baseScale, heightScale);
            }
        } else if (layerName === 'near') {
            // Near layer should align with ground level
            const groundY = window.gameData.GROUND_Y;
            if (scaledHeight < groundY) {
                // Scale to reach ground level
                const heightScale = groundY / originalHeight;
                tile.setScale(baseScale, heightScale);
            }
        } else {
            // Far and mid layers use proportional scaling
            if (scaledHeight < gameHeight * 0.8) {
                // Ensure minimum coverage of 80% screen height
                const minHeightScale = (gameHeight * 0.8) / originalHeight;
                tile.setScale(baseScale, Math.max(baseScale, minHeightScale));
            }
        }
    }
}