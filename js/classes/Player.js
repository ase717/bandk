/**
 * Player class - Handles player character's movement, animations, and interactions
 * Uses layered character system with combined skin + clothing assets
 */
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // FIXED: Ensure texture exists before calling super()
        if (!scene.textures.exists('player_male')) {
            console.error('❌ player_male texture not found! Creating emergency fallback...');
            Player.createEmergencyFallback(scene);
        }

        super(scene, x, y, 'player_male');

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Initialize player properties
        this.scene = scene;
        this.setupPhysics();
        this.setupAnimations();
        this.setupInput();
        this.initializeState();

        this.inputState = {
            interact: false,
            left: false,
            right: false,
            up: false,
            down: false,
        };

        // Fixed: Align to ground IMMEDIATELY after physics setup
        this.alignToGround();
        this.debugPositioning();

        // Stop any conflicting tweens and ensure consistent scale
        this.stopAllAnimationTweens();

        // Add a delayed check to ensure proper grounding after physics settle
        this.scene.time.delayedCall(200, () => {
            this.checkGrounding();
        });

        // Start idle animation after everything is set up
        this.scene.time.delayedCall(100, () => {
            this.startIdleAnimation();
        });

        console.log(`Player character created at (${x}, ${y})`);
    }

    startIdleAnimation() {
        if (this.scene.anims.exists('player_idle')) {
            try {
                this.play('player_idle');
                console.log('player_idle animation played');
            } catch (error) {
                console.error('Error playing player_idle animation:', error);
            }
        } else {
            console.error('player_idle animation does not exist');
        }
    }

    // FIXED: Make this a static method so it can be called before super()
    static createEmergencyFallback(scene) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(0xFF0000); // Head
        graphics.fillRect(8, 2, 16, 12);
        graphics.fillStyle(0x00FF00); // Body
        graphics.fillRect(6, 14, 20, 12);
        graphics.fillStyle(0x0000FF); // Legs
        graphics.fillRect(8, 26, 16, 6);
        graphics.generateTexture('player_male', 32, 32);
        graphics.destroy();

        console.log('🚨 Emergency fallback texture created (64x64) - should be VERY visible!');
    }

    forceVisibility() {
        console.log('🔥 FORCING PLAYER VISIBILITY...');

        // Set maximum visibility with consistent scale
        this.setVisible(true);
        this.setAlpha(1.0);
        this.setScale(2.0); // 
        this.setDepth(999); // Put it on top of everything
        this.setTint(0xFFFFFF); // Remove any tinting

        // Position it in a very visible location
        this.setPosition(200, 150); // Center of screen

        // Add a bright background for testing
        const testBg = this.scene.add.rectangle(640, 360, 200, 200, 0xFF0000, 0.5);
        testBg.setDepth(998);

        console.log('🔥 Player should now be EXTREMELY visible at center of screen!');

        // Auto-remove the test background after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            testBg.destroy();
            // Return to normal position
            this.setPosition(window.gameData.playerPosition.x, window.gameData.playerPosition.y);
            this.setScale(2.0);
            this.setDepth(window.gameData.DEPTHS.CHARACTERS);
        });
    }

    debugVisibility() {
        console.log('🔍 Player character visibility check:');
        console.log(`- Texture exists: ${this.scene.textures.exists('player_male')}`);
        console.log(`- Sprite visible: ${this.visible}`);
        console.log(`- Sprite alpha: ${this.alpha}`);
        console.log(`- Sprite scale: ${this.scaleX}, ${this.scaleY}`);
        console.log(`- Sprite position: ${this.x}, ${this.y}`);
        console.log(`- Sprite depth: ${this.depth}`);


        // Force visibility and proper positioning
        this.setVisible(true);
        this.setAlpha(1);
        this.setScale(2.0);
        this.setDepth(window.gameData.DEPTHS.CHARACTERS);

        // Stop any conflicting tweens
        this.stopAllAnimationTweens();

        // Brief red flash to confirm visibility (no teleporting)
        this.setTint(0xff0000);
        this.scene.time.delayedCall(1000, () => {
            this.setTint(0xffffff); // Return to normal color
        });

        // Play idle animation to start
        if (this.scene.anims.exists('player_idle')) {
            this.play('player_idle');
        }

        console.log('🔴 Player character should now be pulsing RED and very visible!');

        // Debug camera position
        const camera = this.scene.cameras.main;
        console.log(`📷 Camera info:`);
        console.log(`- Camera position: ${camera.scrollX}, ${camera.scrollY}`);
        console.log(`- Camera zoom: ${camera.zoom}`);
        console.log(`- World bounds: ${this.scene.physics.world.bounds}`);
    }

    setupPhysics() {
        // Physics properties for 64x80 character sprites with scale 2
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.setScale(2.0); // Scale 2 for 64x80 sprites to make them bigger
        this.setOrigin(0.5, 1); // Bottom-center anchor for ground alignment
        this.setDepth(window.gameData.DEPTHS.CHARACTERS);

        // FIXED: Correct physics body setup for 64x80 sprite with scale 2
        const spriteWidth = 64;   // Base sprite width
        const spriteHeight = 80;  // Base sprite height

        // Physics body dimensions (smaller than sprite for better gameplay)
        const bodyWidth = 32;     // Narrower collision box
        const bodyHeight = 60;    // Shorter collision box (exclude head area)

        this.body.setSize(bodyWidth * 2, bodyHeight * 2);

        // Calculate offset in unscaled coordinates (Phaser will scale the offset too)
        const offsetX = (spriteWidth * 2 - bodyWidth * 2) / 2;  // Center horizontally: (64-32)/2 = 16
        const offsetY = spriteHeight * 2 - bodyHeight * 2;      // Align to bottom: 80-60 = 20

        this.body.setOffset(offsetX, offsetY);

        console.log(`✅ FIXED Physics setup for 64x80 sprite with scale 2:`);
        console.log(`- Base sprite: ${spriteWidth}x${spriteHeight}`);
        console.log(`- Displayed size: ${spriteWidth * 2}x${spriteHeight * 2}`);
        console.log(`- Body size: ${bodyWidth}x${bodyHeight}`);
        console.log(`- Body offset: (${offsetX}, ${offsetY}) - relative to unscaled sprite`);
        console.log(`- Origin: (0.5, 1) - bottom-center anchor`);

        // Movement properties
        this.movementSpeed = window.gameData.playerSpeed || 300;
        this.jumpVelocity = window.gameData.jumpVelocity || -500;
    }

    setupAnimations() {
        console.log('🎨 Setting up player animations from sprite sheet...');

        // Check if we have layered textures or should use base sprite sheet
        const hasLayeredTextures = this.scene.textures.exists('player_idle_1') &&
            this.scene.textures.exists('player_walk_1') &&
            this.scene.textures.exists('player_jump_1') &&
            this.scene.textures.exists('player_land_1');

        if (hasLayeredTextures) {
            console.log('✅ Using layered textures for animations');
            this.setupLayeredAnimations();
        } else {
            console.log('⚠️ Using base sprite sheet for animations');
            this.setupSpriteSheetAnimations();
        }

        // Animation state tracking
        this.animationState = {
            current: 'idle',
            isMoving: false,
            isRunning: false,
            isJumping: false,
            facingDirection: 'right',
            lastAnimation: null
        };

        this.frameCount = 0;
        console.log('✅ Player animations setup complete');
    }

    setupLayeredAnimations() {
        // IDLE ANIMATION - Single frame for stability
        if (!this.scene.anims.exists('player_idle')) {
            // Check if the idle texture exists
            if (this.scene.textures.exists('player_idle_1')) {
                this.scene.anims.create({
                    key: 'player_idle',
                    frames: [
                        { key: 'player_idle_1' },
                    ],
                    frameRate: 1,
                    repeat: -1
                });
                console.log('✅ Stable layered player_idle animation created');
            } else {
                console.warn('⚠️ player_idle_1 texture not found, using fallback');
                // Use the base texture as fallback
                this.setTexture('player_male');
            }
        }

        // WALKING ANIMATION - Natural leg movement with all 8 frames
        if (!this.scene.anims.exists('player_walk')) {
            this.scene.anims.create({
                key: 'player_walk',
                frames: [
                    { key: 'player_walk_1' },
                    { key: 'player_walk_2' },
                    { key: 'player_walk_3' },
                    { key: 'player_walk_4' },
                    { key: 'player_walk_5' },
                    { key: 'player_walk_6' },
                    { key: 'player_walk_7' },
                    { key: 'player_walk_8' },
                ],
                frameRate: 10, // Smooth walking with visible leg movement
                repeat: -1
            });
            console.log('✅ Complete layered player_walk animation with leg movement created');
        }

        // JUMPING ANIMATION - Visible throughout jump
        if (!this.scene.anims.exists('player_jump')) {
            this.scene.anims.create({
                key: 'player_jump',
                frames: [
                    { key: 'player_jump_1' }, // Use mid-jump frame that stays visible
                    { key: 'player_jump_2' }, // Use mid-jump frame that stays visible
                    { key: 'player_jump_3' }, // Use mid-jump frame that stays visible
                    { key: 'player_jump_4' }, // Use mid-jump frame that stays visible
                ],
                frameRate: 1, // Hold single frame throughout jump
                repeat: -1 // Keep playing to maintain visibility
            });
            console.log('✅ Visible layered player_jump animation created');
        }

        // LANDING ANIMATION - Quick transition
        if (!this.scene.anims.exists('player_land')) {
            this.scene.anims.create({
                key: 'player_land',
                frames: [
                    { key: 'player_land_1' }, // Landing frame
                    { key: 'player_land_2' }, // Landing frame
                    { key: 'player_idle_1' }, // Return to idle
                ],
                frameRate: 2,
                repeat: 0
            });
            console.log('✅ Quick layered player_land animation created');
        }
    }

    setupSpriteSheetAnimations() {
        const skinKey = 'male_skin'; // Base sprite sheet

        if (!this.scene.textures.exists(skinKey)) {
            console.error(`❌ Base sprite sheet ${skinKey} not found!`);
            return;
        }

        // IDLE ANIMATION - Row 1, frames 0-2
        if (!this.scene.anims.exists('player_idle')) {
            this.scene.anims.create({
                key: 'player_idle',
                frames: this.scene.anims.generateFrameNumbers(skinKey, { start: 0, end: 2 }),
                frameRate: 2,
                repeat: -1
            });
            console.log('✅ Sprite sheet player_idle animation created');
        }

        // WALKING ANIMATION - Row 2, frames 5-10 (key walking frames)
        if (!this.scene.anims.exists('player_walk')) {
            this.scene.anims.create({
                key: 'player_walk',
                frames: this.scene.anims.generateFrameNumbers(skinKey, { start: 8, end: 15 }),
                frameRate: 8,
                repeat: -1
            });
            console.log('✅ Sprite sheet player_walk animation created');
        }

        // JUMPING ANIMATION - Row 4, frames 21-23
        if (!this.scene.anims.exists('player_jump')) {
            this.scene.anims.create({
                key: 'player_jump',
                frames: this.scene.anims.generateFrameNumbers(skinKey, { start: 24, end: 27 }),
                frameRate: 4,
                repeat: 0
            });
            console.log('✅ Sprite sheet player_jump animation created');
        }

        // LANDING ANIMATION - Frame 24 + return to idle
        if (!this.scene.anims.exists('player_land')) {
            this.scene.anims.create({
                key: 'player_land',
                frames: this.scene.anims.generateFrameNumbers(skinKey, { start: 32, end: 33 }),
                frameRate: 4,
                repeat: 0
            });
            console.log('✅ Sprite sheet player_land animation created');
        }
        this.on('animationcomplete', this.onAnimationComplete, this);
    }

    onAnimationComplete(anim) {
        if (anim.key === 'player_land') {
            console.log('player_land animation completed');
            this.play('player_idle');
        }
    }

    setupInput() {
        // Get input from scene
        this.keys = this.scene.keys;
        this.cursors = this.scene.cursors;

        // REMOVED: Shift key support - no longer needed
        if (!this.keys) {
            this.keys = this.scene.input.keyboard.addKeys('W,S,A,D');
        }

        if (!this.cursors) {
            this.cursors = this.scene.input.keyboard.createCursorKeys();
        }

        console.log('Player: Input system configured for walking only (no running)');
    }

    initializeState() {
        // Player state machine
        this.state = {
            current: 'idle', // idle, running, jumping, falling
            previous: 'idle',
            onGround: true,
            canJump: true,
            interacting: false
        };

        // Movement tracking
        this.movement = {
            isMoving: false,
            direction: 0, // -1 left, 0 none, 1 right
            velocity: { x: 0, y: 0 }
        };
    }

    update() {
        if (!this.body) return;

        this.frameCount++;

        // FIXED: Remove constant visibility checks that cause flickering
        // Only check visibility if there's actually a problem
        if (this.frameCount % 60 === 0) { // Once per second instead of every 10 frames
            this.ensureVisibilityOnlyIfNeeded();
        }

        this.handleMovement();
        this.updateAnimations();
        this.updateGameData();
    }

    ensureVisibilityOnlyIfNeeded() {
        // Only fix if there's actually a problem - prevents flickering
        if (!this.visible) {
            this.setVisible(true);
            console.log('🔧 Fixed visibility');
        }

        if (this.alpha < 1) {
            this.setAlpha(1);
            console.log('🔧 Fixed alpha');
        }

        // FIXED: Don't constantly adjust scale - this was causing flickering
        // Only fix if scale is significantly wrong
        if (Math.abs(this.scaleX - 2.0) > 0.1 || Math.abs(this.scaleY - 2.0) > 0.1) {
            this.setScale(1.0);
            console.log('🔧 Fixed scale');
        }
    }

    handleMovement() {
        if (!this.cursors || !this.keys) {
            console.error('Player: Input keys not available!');
            return;
        }

        let isMoving = false;
        let directionChanged = false;

        // FIXED: Movement handling with proper state updates
        if (this.cursors.left.isDown || (this.keys.A && this.keys.A.isDown)) {
            this.setVelocityX(-this.movementSpeed);

            if (this.flipX) {
                this.setFlipX(false);
                this.animationState.facingDirection = 'left';
                directionChanged = true;
            }
            isMoving = true;
        } else if (this.cursors.right.isDown || (this.keys.D && this.keys.D.isDown)) {
            this.setVelocityX(this.movementSpeed);

            if (!this.flipX) {
                this.setFlipX(true);
                this.animationState.facingDirection = 'right';
                directionChanged = true;
            }
            isMoving = true;
        } else {
            this.setVelocityX(0);
            isMoving = false;
        }

        // Jumping logic
        if ((this.cursors.up.isDown || (this.keys.W && this.keys.W.isDown)) && this.body.touching.down && this.state.canJump) {
            this.setVelocityY(this.jumpVelocity);
            this.animationState.isJumping = true;
            this.state.canJump = false;
            this.state.onGround = false;
        }

        // Reset jump ability when touching ground
        if (this.body.touching.down) {
            this.state.canJump = true;
            this.state.onGround = true;
            if (this.animationState.isJumping) {
                this.animationState.isJumping = false;
            }
        }

        // CRITICAL FIX: Update movement state immediately
        const wasMoving = this.animationState.isMoving;
        this.animationState.isMoving = isMoving;
        this.movement.isMoving = isMoving;

        // Debug movement state
        if (wasMoving !== isMoving) {
            console.log(`🏃 Movement state changed: ${wasMoving ? 'moving' : 'idle'} → ${isMoving ? 'moving' : 'idle'}`);
            console.log(`🏃 Velocity: ${this.body.velocity.x}`);
        }

        // Force animation update when movement state changes
        if (wasMoving !== isMoving || directionChanged) {
            this.animationState.current = null; // Force animation change
        }
    }

    updateAnimations() {
        const state = this.animationState;
        let newAnimation = null;

        // FIXED: Simplified animation logic
        if (!this.state.onGround) {
            // In air
            if (this.body.velocity.y < 0) {
                newAnimation = 'player_jump'; // Going up
            } else {
                newAnimation = 'player_land'; // Falling down
            }
            state.wasInAir = true;
        } else {
            // On ground
            if (state.wasInAir) {
                // Just landed - play idle briefly
                newAnimation = 'player_idle';
                state.wasInAir = false;
            } else if (state.isMoving && Math.abs(this.body.velocity.x) > 10) {
                // Moving and actually has velocity
                newAnimation = 'player_walk';
            } else {
                // Standing still
                newAnimation = 'player_idle';
            }
        }

        // Only change animation if it's different
        if (state.current !== newAnimation) {
            if (this.scene.anims.exists(newAnimation)) {
                try {
                    this.anims.play(newAnimation, true);
                    state.current = newAnimation;
                    console.log(`🎬 Animation: ${newAnimation} (velocity: ${this.body.velocity.x.toFixed(1)})`);
                } catch (error) {
                    console.error(`Error playing animation ${newAnimation}:`, error);
                    // Fallback to texture
                    if (this.scene.textures.exists('player_idle_1')) {
                        this.setTexture('player_idle_1');
                    }
                }
            } else {
                console.warn(`Animation ${newAnimation} does not exist!`);
                // Create fallback animation if needed
                this.createFallbackAnimations();
            }
        }
    }


    // Animation methods - no scale tweens to prevent flickering
    startWalkingAnimation() {
        if (this.scene.anims.exists('player_walk')) {
            this.play('player_walk');
        }
    }

    startIdleAnimation() {
        if (this.scene.anims.exists('player_idle')) {
            this.play('player_idle');
        }
    }

    stopWalkingAnimation() {
        // Simply return to idle animation
        this.startIdleAnimation();
    }

    stopAllAnimationTweens() {
        this.scene.tweens.killTweensOf(this);
        // Don't change scale here - it's already set correctly
        console.log('🔧 Stopped all animation tweens');
    }

    updateState() {
        // Update state machine
        this.state.previous = this.state.current;

        if (!this.state.onGround) {
            if (this.body.velocity.y < 0) {
                this.state.current = 'jumping';
            } else {
                this.state.current = 'falling';
            }
        } else if (this.movement.isMoving) {
            this.state.current = 'running';
        } else {
            this.state.current = 'idle';
        }
    }

    updateGameData() {
        // Track position changes (removed unused variables)

        // Update global game data with player position
        if (window.gameData.playerPosition) {
            window.gameData.playerPosition.x = this.x;
            window.gameData.playerPosition.y = this.y - this.body.height;
        }

        // Update movement velocity for game data
        this.movement.velocity.x = this.body.velocity.x;
        this.movement.velocity.y = this.body.velocity.y;
    }

    // Interaction methods
    interact() {
        if (this.inputState.interact) {
            // FIXED: Simple interaction feedback without scale changes
            this.setTint(0xFFFFFF);
            this.scene.time.delayedCall(100, () => {
                this.setTint(0xFFFFFF);
            });

            if (this.scene.npcs && this.scene.npcs.interactWithNearestNPC) {
                const npcInteracted = this.scene.npcs.interactWithNearestNPC(this);
                if (npcInteracted) {
                    console.log('Player interacted with NPC');
                    return true;
                }
            }

            this.scene.events.emit('player-interact', {
                x: this.x,
                y: this.y,
                radius: window.gameData.interactionRadius || 50,
                character: 'Player'
            });

            console.log('Player interaction triggered');
            return true;
        }
        return false;
    }

    // Utility methods
    getState() {
        return this.state.current;
    }

    getFullState() {
        return {
            position: { x: this.x, y: this.y },
            velocity: this.movement.velocity,
            state: this.state.current,
            onGround: this.state.onGround,
            direction: this.movement.direction
        };
    }

    isOnGround() {
        return this.state.onGround;
    }

    // FIXED: Method to ensure player is properly positioned on ground
    alignToGround() {
        // Get ground level from game data or use default
        const groundY = window.gameData?.GROUND_Y || 670;

        // CRITICAL FIX: With origin (0.5, 1), the sprite's Y position IS the ground level
        // The sprite bottom automatically aligns with the Y coordinate
        this.setPosition(this.x, groundY);

        if (this.body) {
            this.body.velocity.y = 0; // Stop any falling velocity

            // IMPORTANT: Update physics world immediately to sync body position
            this.scene.physics.world.update(0, 0);
        }

        // Force the character to be grounded
        this.state.onGround = true;

        console.log(`✅ Player aligned to ground at Y=${groundY} with origin (0.5, 1)`);

        // Verification after physics update
        this.scene.time.delayedCall(50, () => {
            if (!this.body) return;

            const spriteBottom = this.y; // With origin (0.5, 1), y IS the bottom
            const bodyBottom = this.body.y + this.body.height;

            console.log(`✅ Ground alignment verification:`);
            console.log(`- Sprite Y (bottom): ${this.y}`);
            console.log(`- Body Y: ${this.body.y}`);
            console.log(`- Body bottom: ${bodyBottom}`);
            console.log(`- Ground Y: ${groundY}`);
            console.log(`- Body offset: (${this.body.offset.x}, ${this.body.offset.y})`);

            // Check if body is properly positioned relative to ground
            const bodyGroundDiff = Math.abs(bodyBottom - groundY);
            if (bodyGroundDiff > 5) {
                console.warn(`⚠️ Body alignment issue: body bottom ${bodyBottom} vs ground ${groundY} (diff: ${bodyGroundDiff})`);
                // Force correct body position if needed
                this.body.y = groundY - this.body.height;
            } else {
                console.log(`✅ Perfect ground alignment achieved! Body properly follows sprite.`);
            }
        });
    }

    testVisibility() {
        console.log('🔍 VISIBILITY TEST:');
        console.log(`- Sprite position: (${this.x}, ${this.y})`);
        console.log(`- Sprite scale: ${this.scaleX}x${this.scaleY}`);
        console.log(`- Sprite visible: ${this.visible}`);
        console.log(`- Sprite alpha: ${this.alpha}`);
        console.log(`- Sprite depth: ${this.depth}`);
        console.log(`- Sprite tint: 0x${this.tint.toString(16)}`);

        // Get the actual rendered bounds
        const bounds = this.getBounds();
        console.log(`- Rendered bounds: x=${bounds.x}, y=${bounds.y}, w=${bounds.width}, h=${bounds.height}`);

        // Check if the sprite is within the camera view
        const camera = this.scene.cameras.main;
        const cameraView = {
            left: camera.scrollX,
            right: camera.scrollX + camera.width,
            top: camera.scrollY,
            bottom: camera.scrollY + camera.height
        };

        console.log(`- Camera view: left=${cameraView.left}, right=${cameraView.right}, top=${cameraView.top}, bottom=${cameraView.bottom}`);

        const inView = bounds.x < cameraView.right && bounds.right > cameraView.left &&
            bounds.y < cameraView.bottom && bounds.bottom > cameraView.top;

        console.log(`- Player in camera view: ${inView}`);

        if (!inView) {
            console.log('⚠️ Player is outside camera view!');
        }
    }

    checkGrounding() {
        if (!this.body) return;

        const groundY = window.gameData?.GROUND_Y || 670;
        const bodyBottom = this.body.y + this.body.height;
        const spriteBottom = this.y; // With origin (0.5, 1)

        console.log(`🔍 Grounding check:`);
        console.log(`- Sprite bottom (Y): ${spriteBottom}`);
        console.log(`- Body bottom: ${bodyBottom}`);
        console.log(`- Ground Y: ${groundY}`);
        console.log(`- Touching down: ${this.body.touching.down}`);

        // Check if sprite is floating above ground
        if (spriteBottom < groundY - 5) {
            console.log(`🔧 Sprite floating: moving from ${spriteBottom} to ${groundY}`);
            this.setY(groundY);
            this.body.setVelocityY(0);
        }

        // Check if body is misaligned with ground
        if (Math.abs(bodyBottom - groundY) > 10) {
            console.log(`🔧 Body misaligned: body bottom ${bodyBottom} vs ground ${groundY}`);
            // Let the sprite position drive the body position through physics
            this.setY(groundY);
            this.body.setVelocityY(0);
        }

        // Update grounded state based on actual physics
        this.state.onGround = this.body.touching.down || Math.abs(bodyBottom - groundY) < 5;
    }

    // Enhanced debug method for positioning
    debugPositioning() {
        console.log('🔍 Player positioning debug:');
        console.log(`- Position: (${this.x}, ${this.y})`);
        console.log(`- Ground Y: ${window.gameData?.GROUND_Y || 'undefined'}`);
        console.log(`- Scale: ${this.scaleX}x${this.scaleY}`);
        if (this.body) {
            console.log(`- Body position: (${this.body.x}, ${this.body.y})`);
            console.log(`- Body size: ${this.body.width}x${this.body.height}`);
            console.log(`- Body offset: (${this.body.offset.x}, ${this.body.offset.y})`);
            console.log(`- Body bottom: ${this.body.y + this.body.height}`);
            console.log(`- Touching down: ${this.body.touching.down}`);
            console.log(`- Velocity: (${this.body.velocity.x}, ${this.body.velocity.y})`);
        }
        console.log(`- Origin: (${this.originX}, ${this.originY})`);
        console.log(`- Movement speed: ${this.movementSpeed}`);
        console.log(`- Jump velocity: ${this.jumpVelocity}`);
    }

    // NEW: Method to visualize collision box for debugging
    showCollisionBox() {
        // Remove existing debug graphics
        if (this.debugGraphics) {
            this.debugGraphics.destroy();
        }

        // Create debug graphics to show collision box
        this.debugGraphics = this.scene.add.graphics();
        this.debugGraphics.setDepth(1000); // Above everything else

        // Draw collision box outline
        this.debugGraphics.lineStyle(2, 0xFF0000, 1); // Red outline
        this.debugGraphics.strokeRect(
            this.body.x,
            this.body.y,
            this.body.width,
            this.body.height
        );

        // Draw sprite bounds for comparison
        this.debugGraphics.lineStyle(2, 0x00FF00, 0.5); // Green outline
        const spriteBounds = this.getBounds();
        this.debugGraphics.strokeRect(
            spriteBounds.x,
            spriteBounds.y,
            spriteBounds.width,
            spriteBounds.height
        );

        console.log('🔍 Collision box visualization:');
        console.log(`- RED box: Physics body (${this.body.x}, ${this.body.y}, ${this.body.width}x${this.body.height})`);
        console.log(`- GREEN box: Visible sprite bounds`);

        // Auto-remove after 5 seconds
        this.scene.time.delayedCall(5000, () => {
            if (this.debugGraphics) {
                this.debugGraphics.destroy();
                this.debugGraphics = null;
            }
        });
    }

    // NEW: Method to test and validate collision fixes
    testCollisionFixes() {
        console.log('🧪 TESTING COLLISION FIXES...');

        const groundY = window.gameData?.GROUND_Y || 670;

        // Test 1: Ground alignment
        this.alignToGround();

        // Test 2: Show collision box
        this.showCollisionBox();

        // Test 3: Movement test
        console.log('🧪 Testing movement...');
        const originalX = this.x;

        // Move right
        this.setVelocityX(200);
        this.scene.time.delayedCall(500, () => {
            console.log(`Movement test: moved from ${originalX} to ${this.x}`);
            console.log(`Body follows: body.x = ${this.body.x}`);

            // Stop and return
            this.setVelocityX(0);
            this.setPosition(originalX, groundY);
        });

        // Test 4: Jump test
        this.scene.time.delayedCall(1000, () => {
            console.log('🧪 Testing jump...');
            this.setVelocityY(-400);

            this.scene.time.delayedCall(1000, () => {
                console.log('Jump test complete - checking ground alignment...');
                this.checkGrounding();
            });
        });

        console.log('🧪 Collision fix tests initiated. Watch console for results.');
        return true;
    }

    getVelocity() {
        return {
            x: this.body?.velocity.x || 0,
            y: this.body?.velocity.y || 0
        };
    }

    // Character information methods
    getCharacterInfo() {
        return {
            character: 'Player',
            texture: 'player_male (layered character)',
            animations: {
                current: this.animationState.current,
                isMoving: this.animationState.isMoving,
                isJumping: this.animationState.isJumping,
                isLanding: this.animationState.isLanding,
                facingDirection: this.animationState.facingDirection
            },
            physics: {
                bodySize: this.body ? `${this.body.width}x${this.body.height}` : 'undefined',
                offset: this.body ? `${this.body.offset.x}, ${this.body.offset.y}` : 'undefined'
            }
        };
    }

    // Debug information
    getDebugInfo() {
        return {
            character: 'Player',
            position: `(${Math.round(this.x)}, ${Math.round(this.y)})`,
            velocity: this.body ? `(${Math.round(this.body.velocity.x)}, ${Math.round(this.body.velocity.y)})` : '(0, 0)',
            state: this.state.current,
            animation: this.animationState.current,
            onGround: this.state.onGround,
            direction: this.movement.direction,
            flipX: this.flipX,
            scale: `${this.scaleX}x${this.scaleY}`
        };
    }

    // NEW: Method to fix animation flickering and texture issues
    fixAnimationFlickering() {
        console.log('🔧 Fixing animation flickering and texture issues...');

        // Stop all current animations to prevent conflicts
        this.anims.stop();

        // Ensure we have a stable, visible texture
        if (this.scene.textures.exists('player_idle_1')) {
            this.setTexture('player_idle_1');
            console.log('✅ Set stable layered idle texture');
        } else if (this.scene.textures.exists('player_male')) {
            this.setTexture('player_male');
            console.log('✅ Set fallback base texture');
        } else {
            console.error('❌ No valid player texture found!');
            return;
        }

        // Ensure proper visibility and positioning
        this.setVisible(true);
        this.setAlpha(1);
        this.setScale(2.0);
        this.setDepth(window.gameData.DEPTHS.CHARACTERS);

        // Align to ground properly
        this.alignToGround();

        // Start idle animation after a brief delay to ensure stability
        this.scene.time.delayedCall(100, () => {
            if (this.scene.anims.exists('player_idle')) {
                try {
                    this.play('player_idle');
                    console.log('✅ Restarted stable idle animation');
                } catch (error) {
                    console.error('Error playing idle animation:', error);
                }
            }
        });

        console.log('✅ Animation flickering fix applied');
    }

    // NEW: Quick test method for collision and animation fixes
    testAllFixes() {
        console.log('🧪 TESTING ALL FIXES...');

        // Fix animation issues
        this.fixAnimationFlickering();

        // Show collision box for visual verification
        this.showCollisionBox();

        // Debug current state
        this.debugPositioning();

        console.log('🧪 All fixes tested. Check visual results and console output.');
        return true;
    }

    createFallbackTexture(scene) {
        console.log('🔄 Creating player fallback texture...');
        const graphics = scene.add.graphics();

        // Draw a simple but visible 32x40 character
        graphics.fillStyle(0xDEB887); // Skin
        graphics.fillRect(16, 4, 32, 24); // Head

        graphics.fillStyle(0x8B4513); // Hair
        graphics.fillRect(12, 0, 40, 12); // Hair

        graphics.fillStyle(0x000000); // Eyes
        graphics.fillRect(20, 12, 4, 4); // Left eye
        graphics.fillRect(36, 12, 4, 4); // Right eye

        graphics.fillStyle(0x4682B4); // Shirt
        graphics.fillRect(12, 28, 40, 24); // Shirt

        graphics.fillStyle(0x1E3A8A); // Pants
        graphics.fillRect(16, 52, 32, 12); // Pants

        graphics.generateTexture('player_male', 64, 80);
        graphics.destroy();

        console.log('✅ Player fallback texture created (64x64)');
    }

    createFallbackAnimations() {
        console.log('🔄 Creating fallback animations for 64x80 sprite...');

        // Use the main texture for all animations as fallback
        if (this.scene.textures.exists('player_male')) {
            if (!this.scene.anims.exists('player_idle')) {
                this.scene.anims.create({
                    key: 'player_idle',
                    frames: [{ key: 'player_male', frame: 0 }],
                    frameRate: 1,
                    repeat: -1
                });
            }

            if (!this.scene.anims.exists('player_walk')) {
                this.scene.anims.create({
                    key: 'player_walk',
                    frames: [{ key: 'player_male', frame: 0 }],
                    frameRate: 1,
                    repeat: -1
                });
            }

            if (!this.scene.anims.exists('player_jump')) {
                this.scene.anims.create({
                    key: 'player_jump',
                    frames: [{ key: 'player_male', frame: 0 }],
                    frameRate: 1,
                    repeat: 0
                });
            }

            console.log('✅ Fallback animations created');
        }
    }

    // Debug method that can be called from browser console
    debugPlayer() {
        console.log('🔍 COMPLETE PLAYER DEBUG:');
        console.log('='.repeat(50));

        // Basic info
        console.log(`Position: (${this.x}, ${this.y})`);
        console.log(`Scale: ${this.scaleX}x${this.scaleY}`);
        console.log(`Visible: ${this.visible}, Alpha: ${this.alpha}`);
        console.log(`FlipX: ${this.flipX}, Depth: ${this.depth}`);

        // Physics info
        if (this.body) {
            console.log(`Body position: (${this.body.x}, ${this.body.y})`);
            console.log(`Body size: ${this.body.width}x${this.body.height}`);
            console.log(`Body offset: (${this.body.offset.x}, ${this.body.offset.y})`);
            console.log(`Body bottom: ${this.body.y + this.body.height}`);
            console.log(`Touching down: ${this.body.touching.down}`);
            console.log(`Velocity: (${this.body.velocity.x}, ${this.body.velocity.y})`);
        }

        // Game data
        console.log(`Ground Y: ${window.gameData?.GROUND_Y}`);
        console.log(`Animation: ${this.animationState.current}`);
        console.log(`State: ${this.state.current}`);

        // Texture info
        console.log(`Texture exists: ${this.scene.textures.exists('player_male')}`);

        console.log('='.repeat(50));

        // Force visibility test
        this.forceVisibility();

        // Check if player is being clipped by world bounds or camera
        this.checkWorldBounds();

        // Validate all fixes are working
        this.validateFixes();
    }

    validateFixes() {
        console.log('🔍 VALIDATING ALL FIXES:');
        console.log('='.repeat(50));

        // Check physics dimensions
        const expectedBodySize = { width: 64, height: 80 };
        const actualBodySize = { width: this.body.width, height: this.body.height };
        const bodySizeCorrect = actualBodySize.width === expectedBodySize.width &&
            actualBodySize.height === expectedBodySize.height;

        console.log(`✅ Body size: ${actualBodySize.width}x${actualBodySize.height} (expected: ${expectedBodySize.width}x${expectedBodySize.height}) - ${bodySizeCorrect ? 'CORRECT' : 'WRONG'}`);

        // Check body position relative to ground
        const groundY = window.gameData.GROUND_Y;
        const bodyBottom = this.body.y + this.body.height;
        const groundContactGood = Math.abs(bodyBottom - groundY) < 20;

        console.log(`✅ Ground contact: body bottom=${bodyBottom}, ground=${groundY}, diff=${Math.abs(bodyBottom - groundY)}px - ${groundContactGood ? 'GOOD' : 'BAD'}`);

        // Check sprite visibility - FIXED: Use 2.0 scale for 32x40 sprites
        const spriteVisible = this.visible && this.alpha >= 1 && this.scaleX === 2.0 && this.scaleY === 2.0;
        console.log(`✅ Sprite visibility: visible=${this.visible}, alpha=${this.alpha}, scale=${this.scaleX}x${this.scaleY} - ${spriteVisible ? 'GOOD' : 'BAD'}`);

        // Check input system
        const inputWorking = this.cursors && this.keys;
        console.log(`✅ Input system: cursors=${!!this.cursors}, keys=${!!this.keys} - ${inputWorking ? 'WORKING' : 'BROKEN'}`);

        // Overall status
        const allGood = bodySizeCorrect && groundContactGood && spriteVisible && inputWorking;
        console.log('='.repeat(50));
    }

    validateSetup() {
        console.log('🔍 VALIDATING PLAYER SETUP:');
        console.log('='.repeat(40));

        // Check visibility
        const bounds = this.getBounds();
        console.log(`- Sprite bounds: x=${bounds.x.toFixed(1)}, y=${bounds.y.toFixed(1)}, w=${bounds.width.toFixed(1)}, h=${bounds.height.toFixed(1)}`);
        console.log(`- Visible: ${this.visible}, Alpha: ${this.alpha}, Scale: ${this.scaleX}x${this.scaleY}`);

        // Check positioning
        console.log(`- Position: (${this.x}, ${this.y})`);
        console.log(`- Ground level: 670`);
        console.log(`- Distance from ground: ${this.y - 670} (should be 0 for origin 0.5,1)`);

        // Check physics
        console.log(`- Body: (${this.body.x}, ${this.body.y}) size ${this.body.width}x${this.body.height}`);
        console.log(`- Body bottom: ${this.body.y + this.body.height} (should be ~670)`);
        console.log(`- Movement speed: ${this.movementSpeed}`);

        // Force visibility if needed
        if (!this.visible || this.alpha < 1 || bounds.width < 50) {
            console.warn('⚠️ Character not visible! Forcing visibility...');
            this.setVisible(true);
            this.setAlpha(1);
            this.setScale(2.0);
            this.setDepth(999);
        }

        // Check if positioned correctly
        if (Math.abs(this.y - 670) > 5) {
            console.warn('⚠️ Character not on ground! Repositioning...');
            this.alignToGround();
        }

        console.log('✅ Player setup validation complete');
    }

    validatePhysicsAlignment() {
        console.log('🔍 PHYSICS ALIGNMENT VALIDATION:');
        console.log('='.repeat(50));

        // Sprite information
        const spriteBounds = this.getBounds();
        console.log('SPRITE:');
        console.log(`- Position: (${this.x}, ${this.y})`);
        console.log(`- Origin: (${this.originX}, ${this.originY})`);
        console.log(`- Scale: ${this.scaleX}x${this.scaleY}`);
        console.log(`- Visual bounds: x=${spriteBounds.x.toFixed(1)}, y=${spriteBounds.y.toFixed(1)}, w=${spriteBounds.width.toFixed(1)}, h=${spriteBounds.height.toFixed(1)}`);
        console.log(`- Visual bottom: ${(spriteBounds.y + spriteBounds.height).toFixed(1)}`);

        // Physics body information
        console.log('\nPHYSICS BODY:');
        console.log(`- Body position: (${this.body.x}, ${this.body.y})`);
        console.log(`- Body size: ${this.body.width}x${this.body.height}`);
        console.log(`- Body offset: (${this.body.offset.x}, ${this.body.offset.y})`);
        console.log(`- Body bottom: ${this.body.y + this.body.height}`);
        console.log(`- Body center: (${this.body.x + this.body.width / 2}, ${this.body.y + this.body.height / 2})`);

        // Ground alignment
        const groundY = 670;
        const bodyBottom = this.body.y + this.body.height;
        const spriteBottom = spriteBounds.y + spriteBounds.height;

        console.log('\nGROUND ALIGNMENT:');
        console.log(`- Ground level: ${groundY}`);
        console.log(`- Sprite bottom: ${spriteBottom.toFixed(1)} (distance from ground: ${(spriteBottom - groundY).toFixed(1)})`);
        console.log(`- Body bottom: ${bodyBottom} (distance from ground: ${bodyBottom - groundY})`);

        // Validation results
        const bodyAligned = Math.abs(bodyBottom - groundY) <= 5;
        const spriteAligned = Math.abs(spriteBottom - groundY) <= 5;
        const bodyWithinSprite = this.body.x >= spriteBounds.x &&
            this.body.x + this.body.width <= spriteBounds.x + spriteBounds.width;

        console.log('\nVALIDATION RESULTS:');
        console.log(`✅ Body aligned with ground (±5px): ${bodyAligned ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Sprite aligned with ground (±5px): ${spriteAligned ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Body within sprite bounds: ${bodyWithinSprite ? 'PASS' : 'FAIL'}`);

        const allPassed = bodyAligned && spriteAligned && bodyWithinSprite;
        console.log(`\n🎯 OVERALL PHYSICS ALIGNMENT: ${allPassed ? 'PERFECT!' : 'NEEDS FIXING'}`);

        return {
            bodyAligned,
            spriteAligned,
            bodyWithinSprite,
            allPassed
        };
    }
}