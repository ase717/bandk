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
        console.log('🚨 Creating emergency fallback texture for player...');
        const graphics = scene.add.graphics();

        // Draw a bright, highly visible 32x32 character
        graphics.fillStyle(0xFF0000); // Bright red head
        graphics.fillRect(16, 4, 32, 24); // Head (scaled for 32x32)

        graphics.fillStyle(0x00FF00); // Bright green body
        graphics.fillRect(12, 28, 40, 24); // Body (scaled for 32x32)

        graphics.fillStyle(0x0000FF); // Bright blue legs  
        graphics.fillRect(16, 52, 32, 12); // Legs (scaled for 32x32)

        graphics.generateTexture('player_male', 32, 32);
        graphics.destroy();

        console.log('🚨 Emergency fallback texture created (32x32) - should be VERY visible!');
    }

    forceVisibility() {
        console.log('🔥 FORCING PLAYER VISIBILITY...');

        // Set maximum visibility with consistent scale
        this.setVisible(true);
        this.setAlpha(1.0);
        this.setScale(1.0); // 
        this.setDepth(999); // Put it on top of everything
        this.setTint(0xFFFFFF); // Remove any tinting

        // Position it in a very visible location
        this.setPosition(400, 300); // Center of screen

        // Add a bright background for testing
        const testBg = this.scene.add.rectangle(640, 360, 100, 100, 0xFF0000, 0.5);
        testBg.setDepth(998);

        console.log('🔥 Player should now be EXTREMELY visible at center of screen!');

        // Auto-remove the test background after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            testBg.destroy();
            // Return to normal position
            this.setPosition(window.gameData.playerPosition.x, window.gameData.playerPosition.y);
            this.setScale(1.0); // FIXED: Maintain 1.0 scale for 64x64 sprites
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
        this.setScale(1.0); // FIXED: Use 1.0 scale for 64x64 sprites
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
        // Physics properties for 64x64 character sprites
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.setScale(1.0); //
        this.setOrigin(0.5, 1); // Bottom-center anchor for ground alignment
        this.setDepth(window.gameData.DEPTHS.CHARACTERS);

        // FIXED: Improved physics body setup for 64x64 sprite with perfect alignment
        const spriteWidth = 32;
        const spriteHeight = 32;
        
        // Character collision box - more accurate proportions
        const bodyWidth = 14;  // Narrower for more precise collision
        const bodyHeight = 24; // Better match for character height
        
        // Set body size first
        this.body.setSize(bodyWidth, bodyHeight);
        
        // CRITICAL FIX: Perfect offset calculation for origin (0.5, 1)
        // Since layered textures are centered, we need to account for this
        const offsetX = (spriteWidth - bodyWidth) / 2;  // Center horizontally: (64-20)/2 = 22
        const offsetY = spriteHeight - bodyHeight;      // Align body bottom to sprite bottom: 64-44 = 20
        
        this.body.setOffset(offsetX, offsetY);

        console.log(`✅ PERFECTED Physics setup for 64x64 sprites:`);
        console.log(`- Sprite: ${spriteWidth}x${spriteHeight} with origin (0.5, 1)`);
        console.log(`- Body: ${bodyWidth}x${bodyHeight} (precise character proportions)`);
        console.log(`- Offset: (${offsetX}, ${offsetY})`);
        console.log(`- Expected perfect collision alignment`);

        // Movement properties
        this.movementSpeed = window.gameData.playerSpeed || 150;
        this.jumpVelocity = window.gameData.jumpVelocity || -250;
    }

    setupAnimations() {
        console.log('🎨 Setting up player animations from sprite sheet...');

        // Check if we have layered textures or should use base sprite sheet
        const hasLayeredTextures = this.scene.textures.exists('player_idle_1') && 
                                   this.scene.textures.exists('player_walk_1') && 
                                   this.scene.textures.exists('player_jump_1');

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
            this.scene.anims.create({
                key: 'player_idle',
                frames: [
                    { key: 'player_idle_1' },
                ],
                frameRate: 1,
                repeat: -1
            });
            console.log('✅ Stable layered player_idle animation created');
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
                    { key: 'player_jump_2' }, // Use mid-jump frame that stays visible
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
                    { key: 'player_jump_4' }, // Landing frame
                    { key: 'player_idle_1' }, // Return to idle
                ],
                frameRate: 10,
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
                frames: this.scene.anims.generateFrameNumbers(skinKey, { start: 5, end: 10 }),
                frameRate: 8,
                repeat: -1
            });
            console.log('✅ Sprite sheet player_walk animation created');
        }

        // RUNNING ANIMATION - Row 3, frames 13-16
        if (!this.scene.anims.exists('player_run')) {
            this.scene.anims.create({
                key: 'player_run',
                frames: this.scene.anims.generateFrameNumbers(skinKey, { start: 13, end: 16 }),
                frameRate: 12,
                repeat: -1
            });
            console.log('✅ Sprite sheet player_run animation created');
        }

        // JUMPING ANIMATION - Row 4, frames 21-23
        if (!this.scene.anims.exists('player_jump')) {
            this.scene.anims.create({
                key: 'player_jump',
                frames: this.scene.anims.generateFrameNumbers(skinKey, { start: 21, end: 23 }),
                frameRate: 8,
                repeat: 0
            });
            console.log('✅ Sprite sheet player_jump animation created');
        }

        // LANDING ANIMATION - Frame 24 + return to idle
        if (!this.scene.anims.exists('player_land')) {
            this.scene.anims.create({
                key: 'player_land',
                frames: [
                    { key: skinKey, frame: 24 }, // Landing frame
                    { key: skinKey, frame: 0 },  // Return to idle
                ],
                frameRate: 10,
                repeat: 0
            });
            console.log('✅ Sprite sheet player_land animation created');
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
            onGround: false,
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
            this.setScale(2.0);
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

        // SIMPLIFIED: Movement handling - no more Shift/running logic
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
        }

        // Jumping logic
        if ((this.cursors.up.isDown || (this.keys.W && this.keys.W.isDown)) && this.body.touching.down && this.state.canJump) {
            this.setVelocityY(this.jumpVelocity);
            this.animationState.isJumping = true;
            this.state.canJump = false;
        }

        // Reset jump ability when touching ground
        if (this.body.touching.down) {
            this.state.canJump = true;
            if (this.animationState.isJumping) {
                this.animationState.isJumping = false;
            }
        }

        // CRITICAL FIX: Update animation state properly
        const wasMoving = this.animationState.isMoving;
        
        this.animationState.isMoving = isMoving;
        this.animationState.isRunning = false; // No running functionality
        this.movement.isMoving = isMoving;
        this.state.onGround = this.body.touching.down;

        // Force animation update when movement state changes
        if (wasMoving !== isMoving || directionChanged) {
            this.animationState.current = null; // Force animation change
        }
    }

    updateAnimations() {
        const state = this.animationState;
        let newAnimation = null;

        // IMPROVED: Clear animation logic for reliable walking and jumping
        if (state.isJumping || !this.state.onGround) {
            // Use consistent jump animation throughout
            newAnimation = 'player_jump';
        } else if (state.isMoving) {
            // ALWAYS show walking leg movement when moving
            newAnimation = 'player_walk';
        } else {
            newAnimation = 'player_idle';
        }

        // CRITICAL FIX: Always update animation when state changes
        if (newAnimation !== state.current) {
            if (this.scene.anims.exists(newAnimation)) {
                try {
                    this.play(newAnimation);
                    state.current = newAnimation;
                    
                    console.log(`🎬 Animation: ${newAnimation}`);
                } catch (error) {
                    console.error(`Error playing animation ${newAnimation}:`, error);
                    // IMPROVED: Better fallback to prevent disappearing
                    if (this.scene.textures.exists('player_idle_1')) {
                        this.setTexture('player_idle_1');
                    } else if (this.scene.textures.exists('male_skin')) {
                        this.setTexture('male_skin', 0);
                    }
                }
            } else {
                console.error(`Animation ${newAnimation} does not exist!`);
                // IMPROVED: Better fallback to prevent disappearing
                if (this.scene.textures.exists('player_idle_1')) {
                    this.setTexture('player_idle_1');
                }
            }
        }
    }

    // Animation methods - no scale tweens to prevent flickering
    startRunningAnimation() {
        if (this.scene.anims.exists('player_walk')) {
            this.play('player_walk');
        }
    }

    startIdleAnimation() {
        if (this.scene.anims.exists('player_idle')) {
            this.play('player_idle');
        }
    }

    stopRunningAnimation() {
        // Simply return to idle animation
        this.startIdleAnimation();
    }

    stopAllAnimationTweens() {
        this.scene.tweens.killTweensOf(this);
        // Don't change scale here - it's already set correctly
        console.log('🔧 Stopped all animation tweens');
    }

    resetToNormalScale() {
        // FIXED: Use correct scale for 64x64 sprites
        if (Math.abs(this.scaleX - 1.0) > 0.1) {
            this.setScale(1.0);
            console.log('🔧 Reset scale to 1.0 for 64x64 sprites');
        }
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
            window.gameData.playerPosition.y = this.y;
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

    // Fixed: Method to ensure player is properly positioned on ground
    alignToGround() {
        if (!window.gameData || !window.gameData.GROUND_Y) {
            const groundY = window.gameData.GROUND_Y;
            this.setY(groundY);
            if (this.body) this.body.setVelocityY(0);
            console.warn('Ground Y not defined in gameData');
            return;
        }

        const groundY = window.gameData.GROUND_Y;
        
        // FIXED: With origin (0.5, 1), sprite position should be exactly at groundY
        this.setY(groundY);

        if (this.body) {
            this.body.setVelocityY(0);
            
            // Wait a frame for physics to update, then check alignment
            this.scene.time.delayedCall(16, () => {
                const bodyBottom = this.body.y + this.body.height;
                console.log(`✅ Ground alignment verification:`);
                console.log(`- Sprite Y: ${this.y} (with origin 0.5, 1)`);
                console.log(`- Body Y: ${this.body.y}`);
                console.log(`- Body bottom: ${bodyBottom}`);
                console.log(`- Ground Y: ${groundY}`);
                console.log(`- Body bottom should be at or very close to ${groundY}`);
                
                // The body bottom should be at groundY for perfect contact
                if (Math.abs(bodyBottom - groundY) > 5) {
                    console.warn(`⚠️ Body alignment issue: body bottom ${bodyBottom} vs ground ${groundY}`);
                }
            });
        }
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
        if (!this.body || !window.gameData.GROUND_Y) return;

        const groundY = window.gameData.GROUND_Y;
        const bodyBottom = this.body.y + this.body.height;
        
        console.log(`🔍 Grounding check: body bottom=${bodyBottom}, ground=${groundY}, touching=${this.body.touching.down}`);

        // FIXED: Check if body bottom is properly aligned with ground
        if (bodyBottom > groundY + 10) { // Small tolerance
            console.log(`🔧 Adjusting player: body bottom ${bodyBottom} -> should be near ${groundY}`);
            // Calculate correct sprite Y position
            const correctSpriteY = groundY;
            this.setY(correctSpriteY);
            this.body.setVelocityY(0);
        }
    }

    // Enhanced debug method for positioning
    debugPositioning() {
        console.log('🔍 Player positioning debug:');
        console.log(`- Position: (${this.x}, ${this.y})`);
        console.log(`- Ground Y: ${window.gameData?.GROUND_Y || 'undefined'}`);
        console.log(`- Scale: ${this.scaleX}x${this.scaleY}`);
        if (this.body) {
            console.log(`- Body size: ${this.body.width}x${this.body.height}`);
            console.log(`- Body offset: ${this.body.offset.x}, ${this.body.offset.y}`);
            console.log(`- Touching down: ${this.body.touching.down}`);
            console.log(`- Velocity: ${this.body.velocity.x}, ${this.body.velocity.y}`);
        }
        console.log(`- Origin: ${this.originX}, ${this.originY}`);
        console.log(`- Movement speed: ${this.movementSpeed}`);
        console.log(`- Jump velocity: ${this.jumpVelocity}`);
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

    createFallbackTexture(scene) {
        console.log('🔄 Creating player fallback texture...');
        const graphics = scene.add.graphics();

        // Draw a simple but visible 64x64 character
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

        graphics.generateTexture('player_male', 64, 64);
        graphics.destroy();

        console.log('✅ Player fallback texture created (64x64)');
    }

    createFallbackAnimations() {
        console.log('🔄 Creating fallback animations...');

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
        const expectedBodySize = { width: 24, height: 48 }; // FIXED: Updated for 64x64 sprites
        const actualBodySize = { width: this.body.width, height: this.body.height };
        const bodySizeCorrect = actualBodySize.width === expectedBodySize.width && 
                               actualBodySize.height === expectedBodySize.height;
        
        console.log(`✅ Body size: ${actualBodySize.width}x${actualBodySize.height} (expected: ${expectedBodySize.width}x${expectedBodySize.height}) - ${bodySizeCorrect ? 'CORRECT' : 'WRONG'}`);
        
        // Check body position relative to ground
        const groundY = window.gameData.GROUND_Y;
        const bodyBottom = this.body.y + this.body.height;
        const groundContactGood = Math.abs(bodyBottom - groundY) < 20;
        
        console.log(`✅ Ground contact: body bottom=${bodyBottom}, ground=${groundY}, diff=${Math.abs(bodyBottom - groundY)}px - ${groundContactGood ? 'GOOD' : 'BAD'}`);
        
        // Check sprite visibility - FIXED: Use 1.0 scale for 64x64 sprites
        const spriteVisible = this.visible && this.alpha >= 1 && this.scaleX === 1.0 && this.scaleY === 1.0;
        console.log(`✅ Sprite visibility: visible=${this.visible}, alpha=${this.alpha}, scale=${this.scaleX}x${this.scaleY} - ${spriteVisible ? 'GOOD' : 'BAD'}`);
        
        // Check input system
        const inputWorking = this.cursors && this.keys;
        console.log(`✅ Input system: cursors=${!!this.cursors}, keys=${!!this.keys} - ${inputWorking ? 'WORKING' : 'BROKEN'}`);
        
        // Overall status
        const allGood = bodySizeCorrect && groundContactGood && spriteVisible && inputWorking;
        console.log('='.repeat(50));
    }
}