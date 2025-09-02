/**
 * CompanionDog class - Handles Köpüş AI, following behavior, and interactions
 */
class CompanionDog extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'companion_dog');
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Initialize companion properties
        this.scene = scene;
        this.setupPhysics();
        this.setupAnimations();
        this.initializeAI();
        
        console.log(`Companion dog created at (${x}, ${y})`);
    }

    createCompanion(homeX, homeY) {
            console.log('🎨 Creating companion dog...');
        
            this.setOrigin(0.5, 1);
            this.setScale(1.3);
            this.setDepth(window.gameData.DEPTHS.CHARACTERS);
        
            // Sadece spawn ile ilgili veri ayarları
            this.setData('type', 'companion_dog');
            this.setData('homeX', homeX);
            this.setData('homeY', homeY);
            this.setData('wanderTimer', 0);
            this.setData('isScared', false);
            this.setData('scareTimer', 0);
        
            // Collider ekle
            this.scene.physics.add.collider(this, this.scene.ground);
        
            // Idle animasyonu başlat
            this.play('companion_dog_idle');
        
            console.log('✅ Companion dog created and initialized');
    }
    
    setupPhysics() {
        // FIXED: Physics properties to match player character scale (64x64)
        this.setCollideWorldBounds(true);
        this.setBounce(0.2);
        this.setScale(1.3); // Same scale as player (no scaling for 64x64)
        this.setOrigin(0.5, 1); // Bottom-center anchor - EXACTLY same as player
        
        // FIXED: Proper collision body for 64x64 dog sprite (proportional to player)
        const dogBodyWidth = 14;  // Narrower than player (20)
        const dogBodyHeight = 24; // Shorter than player (40) - dog proportions
        
        this.body.setSize(dogBodyWidth, dogBodyHeight);
        
        // FIXED: Proper offset calculation matching player's system
        const spriteWidth = 32;
        const spriteHeight = 32;
        const offsetX = (spriteWidth - dogBodyWidth) / 2;   // Center horizontally
        const offsetY = spriteHeight - dogBodyHeight;       // Align body bottom to sprite bottom
        
        this.body.setOffset(offsetX, offsetY);
        
        console.log(`✅ Companion physics setup (matches player system):`);
        console.log(`- Sprite: ${spriteWidth}x${spriteHeight} (same as player)`);
        console.log(`- Body: ${dogBodyWidth}x${dogBodyHeight} (dog proportions)`);
        console.log(`- Offset: (${offsetX}, ${offsetY})`);
        console.log(`- Expected body bottom at ground when sprite Y = ${window.gameData.GROUND_Y}`);
        
        // Set up collision groups for better obstacle handling
        this.setupCollisionGroups();
        
        console.log('Companion physics aligned exactly with player ground level');
        
        // Ensure companion starts at proper ground level IMMEDIATELY
        this.scene.time.delayedCall(10, () => {
            this.alignToGround();
        });
    }
    
    alignToGround() {
        if (window.gameData && window.gameData.GROUND_Y) {
            const groundY = window.gameData.GROUND_Y;
            this.setY(groundY); // EXACTLY same as player - sprite Y = ground Y with origin (0.5, 1)
            
            // Ensure companion body is positioned correctly
            if (this.body) {
                this.body.setVelocityY(0);
                
                // Verify alignment like player does
                this.scene.time.delayedCall(16, () => {
                    const bodyBottom = this.body.y + this.body.height;
                    console.log(`✅ Companion ground alignment:`);
                    console.log(`- Sprite Y: ${this.y} (should equal ground: ${groundY})`);
                    console.log(`- Body bottom: ${bodyBottom} (should be near ground: ${groundY})`);
                    
                    const alignmentError = Math.abs(bodyBottom - groundY);
                    if (alignmentError > 5) {
                        console.warn(`⚠️ Companion alignment issue: ${alignmentError}px off from ground`);
                    } else {
                        console.log(`✅ Companion properly aligned to ground (${alignmentError}px tolerance)`);
                    }
                });
            }
        }
    }
    
    setupCollisionGroups() {
        // Create collision categories for different object types
        // This will be used when we implement obstacles
        this.collisionCategories = {
            COMPANION: 1,
            OBSTACLES: 2,
            COLLECTIBLES: 4,
            ENVIRONMENT: 8
        };
        
        // Set companion collision category
        if (this.body) {
            // Companion collides with obstacles and environment, but not collectibles
            this.body.setCollisionCategory(this.collisionCategories.COMPANION);
            this.body.setCollidesWith([
                this.collisionCategories.OBSTACLES,
                this.collisionCategories.ENVIRONMENT
            ]);
        }
    }
    
    setupAnimations() {
        
            // Animasyonu başlat
            if (!this.scene.anims.exists('companion_dog_idle')) {
                this.scene.anims.create({
                    key: 'companion_dog_idle',
                    frames: this.scene.anims.generateFrameNumbers('companion_dog_idle', { start: 0, end: 3 }),
                    frameRate: 3,
                    repeat: -1
                });
            }
    
            if (!this.scene.anims.exists('companion_dog_walk')) {
                this.scene.anims.create({
                    key: 'companion_dog_walk',
                    frames: this.scene.anims.generateFrameNumbers('companion_dog_walk', { start: 0, end: 5 }),
                    frameRate: 6,
                    repeat: -1
                });
            }
    
        console.log('✅ Companion dog animations created');
    }
    
    initializeAI() {
        // AI properties from game data
        this.followDistance = window.gameData.followDistance; // 80px
        this.normalSpeed = window.gameData.companionSpeed; // 180px/s
        this.catchUpSpeed = window.gameData.companionCatchUpSpeed; // 250px/s
        this.followThreshold = 120; // Distance before starting to follow
        this.maxDistance = 200; // Distance before catch-up speed
        this.teleportDistance = 300; // Distance for safety teleportation
        
        // AI state - FIXED: Added missing stuckTimer and stuckThreshold
        this.aiState = {
            current: 'idle', // idle, following, catching_up, barking
            target: null,
            isFollowing: true,
            lastPlayerPosition: { x: 0, y: 0 },
            catchUpTimer: 0,
            barkCooldown: 0,
            teleportCooldown: 0,
            stuckTimer: 0,          // FIXED: Track stuck time
            stuckThreshold: 2000    // FIXED: 2 seconds before considering stuck
        };
        
        // Movement state - FIXED: Initialize movement state
        this.movement = {
            isMoving: false,
            direction: { x: 0, y: 0 },
            speed: this.normalSpeed
        };
        
        // State tracking - FIXED: Initialize state tracking
        this.state = {
            onGround: true,
            canMove: true,
            isInteracting: false
        };
        
        // FIXED: Initialize animation state to prevent undefined errors
        this.animationState = {
            isRunning: false,
            isJumping: false,
            isIdle: true,
            runningTween: null
        };
        
        // FIXED: Initialize pathfinding system to prevent undefined errors
        this.pathfinding = {
            obstacleAvoidanceActive: false,
            lastObstacleTime: 0,
            alternativePathDirection: 1,
            avoidanceTimeout: 1500, // 1.5 seconds
            checkInterval: 100 // Check every 100ms
        };
        
        // FIXED: Initialize behavior system to prevent undefined errors
        this.behavior = {
            canBark: true,
            lastBarkTime: 0,
            barkCooldown: 2000, // 2 seconds between barks
            chickenChaseDistance: 100, // Distance to react to chickens
            isChasing: false,
            chaseTarget: null
        };
        
        // FIXED: Initialize jump behavior to prevent undefined errors
        this.jumpBehavior = {
            canJump: true,
            lastJumpTime: 0,
            jumpCooldown: 1000, // 1 second between jumps
            jumpForce: -300, // Jump velocity
            minJumpHeight: 10 // Minimum height needed to trigger jump
        };
        
        // FIXED: Initialize stuck prevention system
        this.stuckPrevention = {
            lastPosition: { x: this.x, y: this.y },
            lastMoveTime: 0,
            stuckThreshold: 50, // If same position for 50ms, consider stuck
            stuckCounter: 0,
            maxStuckTime: 1000 // Max time stuck before teleporting
        };
        
        console.log('Companion AI initialized with all systems');
    }
    
    update(player) {
        if (!player) return;
        
        // Update AI logic
        this.updateAI(player);
        
        // Update animations
        this.updateAnimations();
        
        // Update game data
        this.updateGameData();
        
        // Check for stuck state
        this.checkStuckState(player);
    }
    
    updateAI(player) {
        const distance = window.GameUtils.getDistance(this, player);
        
        // Store player reference
        this.aiState.target = player;
        
        // Calculate target position (behind player)
        const targetX = player.x - (player.flipX ? -this.followDistance : this.followDistance);
        const targetY = player.y;
        
        // Check if companion should jump (when player jumps and companion is following)
        this.handleJumpingLogic(player, distance);
        
        // Determine AI state based on distance
        if (distance > this.teleportDistance) {
            this.handleTeleportation(player);
        } else if (distance > this.maxDistance) {
            this.aiState.current = 'catching_up';
            this.moveTowardsTarget(targetX, targetY, this.catchUpSpeed);
        } else if (distance > this.followThreshold) {
            this.aiState.current = 'following';
            this.moveTowardsTarget(targetX, targetY, this.normalSpeed);
        } else {
            this.aiState.current = 'idle';
            this.setVelocityX(0);
        }
        
        // Store last player position for stuck detection
        this.aiState.lastPlayerPosition.x = player.x;
        this.aiState.lastPlayerPosition.y = player.y;
    }
    
    handleJumpingLogic(player, distance) {
        // Check if player is jumping/falling and companion should follow
        const playerIsInAir = !player.body.touching.down;
        const companionOnGround = this.body.touching.down;
        const shouldJump = playerIsInAir && companionOnGround && distance > 60;
        
        // Jump if player is in air and companion is far enough behind
        if (shouldJump && this.canJump()) {
            this.jump();
        }
        
        // Also jump if companion is stuck behind an obstacle while trying to follow
        if (this.isStuckBehindObstacle(player) && companionOnGround) {
            this.jump();
        }
    }
    
    canJump() {
        const currentTime = this.scene.time.now;
        return this.jumpBehavior.canJump && 
               this.state.onGround && 
               (currentTime - this.jumpBehavior.lastJumpTime) > this.jumpBehavior.jumpCooldown;
    }
    
    jump() {
        if (this.body.touching.down) {
            this.setVelocityY(-300); // Companion jump is smaller than player jump
            this.lastJumpTime = this.scene.time.now;
            
            // Emit jump event for potential sound effects
            this.scene.events.emit('companion-jump');
            
            console.log('Companion jumped to follow player');
        }
    }
    
    isStuckBehindObstacle(player) {
        // Check if companion is trying to move but not making progress
        const isMovingHorizontally = Math.abs(this.body.velocity.x) > 10;
        const isNotMakingProgress = Math.abs(this.x - this.aiState.lastPlayerPosition.x) < 5;
        const playerIsAhead = Math.abs(player.x - this.x) > this.followThreshold;
        
        return isMovingHorizontally && isNotMakingProgress && playerIsAhead;
    }
    
    moveTowardsTarget(targetX, targetY, speed) {
        const deltaX = targetX - this.x;
        const threshold = 10; // Minimum distance to consider "reached"
        
        if (Math.abs(deltaX) > threshold) {
            const direction = deltaX > 0 ? 1 : -1;
            
            // Try advanced pathfinding first
            if (this.handleAdvancedPathfinding(targetX, speed)) {
                return; // Pathfinding is handling movement
            }
            
            // Check for obstacles in the path
            const obstacleAhead = this.checkForObstaclesAhead(direction);
            
            if (obstacleAhead && this.body.touching.down) {
                // Try to jump over obstacle
                this.jump();
                // Continue moving while jumping
                this.setVelocityX(direction * speed * 0.7); // Reduced speed while jumping
            } else {
                // Normal movement
                this.setVelocityX(direction * speed);
            }
            
            this.setFlipX(direction < 0);
        } else {
            this.setVelocityX(0);
        }
    }
    
    checkForObstaclesAhead(direction) {
        // Enhanced obstacle detection with pathfinding
        const intendedVelocity = direction * this.normalSpeed;
        const actualVelocity = this.body.velocity.x;
        const isBlocked = Math.abs(actualVelocity) < Math.abs(intendedVelocity) * 0.5;
        const currentTime = this.scene.time.now;
        
        if (isBlocked && this.body.touching.down) {
            // Activate obstacle avoidance if not already active
            if (!this.pathfinding.obstacleAvoidanceActive) {
                this.pathfinding.obstacleAvoidanceActive = true;
                this.pathfinding.lastObstacleTime = currentTime;
                this.pathfinding.alternativePathDirection = Math.random() > 0.5 ? 1 : -1;
                console.log('Companion detected obstacle, activating avoidance');
            }
            
            // Check if we should timeout the pathfinding attempt
            if (currentTime - this.pathfinding.lastObstacleTime > this.pathfinding.pathfindingTimeout) {
                console.log('Companion pathfinding timeout, trying teleportation');
                this.pathfinding.obstacleAvoidanceActive = false;
                return false; // This will trigger teleportation in the main AI logic
            }
            
            return true;
        } else {
            // Clear obstacle avoidance when moving freely
            this.pathfinding.obstacleAvoidanceActive = false;
        }
        
        return false;
    }
    
    handleAdvancedPathfinding(targetX, speed) {
        // Advanced pathfinding when obstacles are detected
        if (this.pathfinding.obstacleAvoidanceActive) {
            const currentTime = this.scene.time.now;
            
            // Try alternative path direction
            const alternativeSpeed = speed * 0.6; // Slower when pathfinding
            this.setVelocityX(this.pathfinding.alternativePathDirection * alternativeSpeed);
            this.setFlipX(this.pathfinding.alternativePathDirection < 0);
            
            // Try jumping periodically while pathfinding
            if ((currentTime - this.pathfinding.lastObstacleTime) % 800 < 100) {
                this.jump();
            }
            
            return true; // Pathfinding is handling movement
        }
        
        return false; // Use normal movement
    }
    
    handleTeleportation(player) {
        // Safety teleportation if too far behind
        const teleportX = player.x - this.followDistance;
        const teleportY = player.y;
        
        this.x = teleportX;
        this.y = teleportY;
        this.setVelocity(0, 0);
        
        console.log('Companion teleported to catch up');
        
        // Emit teleportation event
        this.scene.events.emit('companion-teleported', {
            from: { x: this.x, y: this.y },
            to: { x: teleportX, y: teleportY }
        });
    }
    
    updateAnimations() {
        if (!this.body) return;

    const isMoving = Math.abs(this.body.velocity.x) > 10;
    const onGround = this.body.touching.down;

    if (isMoving) {
        this.anims.play('companion_dog_walk', true);
    } else {
        this.anims.play('companion_dog_idle', true);
    }
}
    
    startRunningAnimation() {
        // Stop any existing running animation
        this.stopRunningAnimation();
        
        // Create subtle running animation - FIXED: Less aggressive scaling to prevent jittering
        this.animationState.runningTween = this.scene.tweens.add({
            targets: this,
            scaleX: this.flipX ? -1.6 : 1.6, // Subtle scale change for 32x32 sprite
            scaleY: 1.4,
            duration: 200, // Slower, smoother animation
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    stopRunningAnimation() {
        if (this.animationState.runningTween) {
            this.animationState.runningTween.destroy();
            this.animationState.runningTween = null;
        }
        // Reset to normal scale (maintaining flip direction)
        this.setScale(this.flipX ? -1.5 : 1.5, 1.5);
    }
    
    checkStuckState(player) {
        // Check if companion is stuck (not moving towards player for too long)
        const distance = window.GameUtils.getDistance(this, player);
        const isMoving = Math.abs(this.body.velocity.x) > 5;
        
        if (distance > this.followThreshold && !isMoving) {
            this.aiState.stuckTimer += this.scene.game.loop.delta;
            
            if (this.aiState.stuckTimer > this.aiState.stuckThreshold) {
                // Companion is stuck, try to unstuck
                this.handleStuckState(player);
                this.aiState.stuckTimer = 0;
            }
        } else {
            this.aiState.stuckTimer = 0;
        }
    }
    
    handleStuckState(player) {
        console.log('Companion appears stuck, attempting to unstuck');
        
        // Try jumping to get unstuck
        if (this.body.touching.down) {
            this.setVelocityY(-300); // Small jump
        }
        
        // If still stuck after jump attempt, teleport
        this.scene.time.delayedCall(500, () => {
            const distance = window.GameUtils.getDistance(this, player);
            if (distance > this.followThreshold && Math.abs(this.body.velocity.x) < 5) {
                this.handleTeleportation(player);
            }
        });
    }
    
    updateGameData() {
        // Update global game data with companion position
        window.gameData.companionPosition.x = this.x;
        window.gameData.companionPosition.y = this.y;
    }
    
    // Interaction methods
    bark(duration = 1000) {
        const currentTime = this.scene.time.now;
        
        if (this.behavior.canBark && (currentTime - this.behavior.lastBarkTime) > this.behavior.barkCooldown) {
            this.aiState.current = 'barking';
            this.behavior.lastBarkTime = currentTime;
            
            // Play bark sound effect (will be implemented in audio task)
            this.scene.events.emit('companion-bark');
            
            // Return to previous state after barking
            this.scene.time.delayedCall(duration, () => {
                if (this.aiState.current === 'barking') {
                    this.aiState.current = 'idle';
                }
            });
            
            console.log('Companion barked');
            return true;
        }
        return false;
    }
    
    reactToChickens(chickens) {
        // React to nearby chickens (will be expanded when chickens are implemented)
        if (chickens && chickens.length > 0) {
            const nearbyChicken = chickens.find(chicken => {
                return window.GameUtils.getDistance(this, chicken) < this.behavior.chickenChaseDistance;
            });
            
            if (nearbyChicken) {
                this.bark(500); // Short bark at chickens
                return true;
            }
        }
        return false;
    }
    
    // Utility methods
    getAIState() {
        return {
            current: this.aiState.current,
            distance: this.aiState.target ? window.GameUtils.getDistance(this, this.aiState.target) : 0,
            isFollowing: this.aiState.isFollowing,
            canBark: this.behavior.canBark
        };
    }
    
    setFollowing(enabled) {
        this.aiState.isFollowing = enabled;
        if (!enabled) {
            this.setVelocityX(0);
            this.aiState.current = 'idle';
        }
    }
    
    // Debug information
    getDebugInfo() {
        return {
            position: `(${Math.round(this.x)}, ${Math.round(this.y)})`,
            velocity: `(${Math.round(this.body.velocity.x)}, ${Math.round(this.body.velocity.y)})`,
            aiState: this.aiState.current,
            distance: this.aiState.target ? Math.round(window.GameUtils.getDistance(this, this.aiState.target)) : 0,
            isFollowing: this.aiState.isFollowing,
            onGround: this.body.touching.down,
            pathfinding: this.pathfinding.obstacleAvoidanceActive ? 'ACTIVE' : 'OFF',
            canJump: this.canJump()
        };
    }
}
