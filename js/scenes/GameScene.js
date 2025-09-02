
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        console.log('GameScene: create() started');
        
        // Initialize scene properties
        this.setupWorld();
        this.createBackground();
        this.createGround();
        this.setupCamera();
        this.setupInput(); // Move input setup BEFORE creating player and companion
        this.createPlayer();
        this.createCompanion();
        this.createUI();

        // Initialize game systems
        this.initializeGameSystems();

        // Create zone transition markers
        this.createZoneMarkers();

        console.log('GameScene initialized - Segment 1: Kuşadası → Söke');
    }
    
    initializeGameSystems() {
        // Create collectibles system
        this.collectibles = new Collectibles(this);
        this.collectibles.createSegment1Collectibles();
        
        // Set up collectible collision
        this.physics.add.overlap(this.player, this.collectibles, (player, collectible) => {
            this.collectibles.collectItem(player, collectible);
        });
        
        // Create NPCs system
        this.npcs = new NPCs(this);
        this.npcs.createSegment1NPCs();
        
        // Create obstacles system
        this.obstacles = new Obstacles(this);
        this.obstacles.createSegment1Obstacles();
        this.physics.add.collider(this.obstacles, this.ground);
        
        
        // Initialize other systems
        this.checkpoints = this.add.group();
        
        // Listen for game events
        this.events.on('item-collected', this.handleItemCollected, this);
        this.events.on('npc-interaction', this.handleNPCInteraction, this);
        
        // Add NPC collision with ground
        this.physics.add.collider(this.npcs, this.ground);

        console.log('Game systems initialized with collectibles, NPCs, and obstacles');
    }
    
    handleItemCollected(data) {
        console.log(`Item collected: ${data.type} (+${data.points} points) | Total: ${data.total}`);
        
        // Update UI immediately
        this.updateCollectiblesUI();
        
        // Optional: Add score/points system later
        // window.gameData.score = (window.gameData.score || 0) + data.points;
    }
    
    updateCollectiblesUI() {
        const stats = this.collectibles.getStats();
        this.ui.collectiblesText.setText(`Items: ${stats.collected}/${stats.total}`);
    }
    
    handleNPCInteraction(data) {
        console.log(`NPC interaction: ${data.name} - "${data.dialogue}"`);
        
        // Optional: Add interaction counter or achievements later
        // window.gameData.npcInteractions = (window.gameData.npcInteractions || 0) + 1;
    }
    

    setupWorld() {
        // Set world bounds for Segment 1 (6000px for ~5 minutes gameplay)
        this.physics.world.setBounds(0, 0, window.gameData.segment1Width, window.gameData.gameHeight);

        // Store world dimensions
        this.worldWidth = window.gameData.segment1Width;
        this.worldHeight = window.gameData.gameHeight;

        // Define environment zones for 5-minute gameplay
        this.environmentZones = {
            kusadasi: { start: 0, end: 2000, name: 'Kuşadası Coast' },
            soke: { start: 2000, end: 4000, name: 'Söke Cotton Fields' }
        };

        console.log(`World bounds set: ${this.worldWidth}x${this.worldHeight} (5-minute gameplay design)`);
    }

    createBackground() {
        console.log('✅ Creating three-layer parallax background system...');
        
        // Create EnvironmentManager for advanced parallax and zone-specific environments
        this.environmentManager = new EnvironmentManager(this);
        this.environmentManager.create();

        console.log('✅ Three-layer parallax system created with zone-specific environments');
    }

    createGround() {
        console.log('🎨 Creating physics ground system...');
        
        const GROUND_Y = window.gameData.GROUND_Y;
        const GROUND_HEIGHT = window.gameData.GROUND_HEIGHT;
        const tileWidth = 32;
        
        // Create static physics ground (invisible)
        this.ground = this.physics.add.staticGroup();

        for (let x = 0; x < this.worldWidth; x += tileWidth) {
            const groundPhysics = this.add.rectangle(
                x + tileWidth / 2, 
                GROUND_Y, // Position rectangle so its BOTTOM edge is at GROUND_Y
                tileWidth, 
                GROUND_HEIGHT, 
                0x000000, 
                0 // Completely invisible
            );
            // Set origin to (0.5, 0) so the top of the rectangle is at GROUND_Y
            groundPhysics.setOrigin(0.5, 0);

             // Physics body ekle
            this.physics.add.existing(groundPhysics, true);
        
            // body hazır mı diye kontrol et
            if (groundPhysics.body) {
            groundPhysics.body.setSize(tileWidth, GROUND_HEIGHT);
            groundPhysics.body.setOffset(0, 0);
            }
            this.ground.add(groundPhysics);
        }

        console.log(`Ground physics created - Entities stand at Y=${GROUND_Y}, Ground collision top at Y=${GROUND_Y}`);
        
        // Debug: Add visible ground line in debug mode
        if (window.gameData.debug) {
            const debugGroundLine = this.add.graphics();
            debugGroundLine.lineStyle(2, 0xFF0000, 0.5);
            debugGroundLine.moveTo(0, GROUND_Y);
            debugGroundLine.lineTo(this.worldWidth, GROUND_Y);
            debugGroundLine.stroke();
            
            // Also show collision area
            const debugCollisionLine = this.add.graphics();
            debugCollisionLine.lineStyle(2, 0x00FF00, 0.3);
            debugCollisionLine.moveTo(0, GROUND_Y + GROUND_HEIGHT / 2);
            debugCollisionLine.lineTo(this.worldWidth, GROUND_Y + GROUND_HEIGHT / 2);
            debugCollisionLine.stroke();
            
            console.log('🔍 Debug lines: Red=Ground surface Y=' + GROUND_Y + ', Green=Collision center Y=' + (GROUND_Y + GROUND_HEIGHT / 2));
        }
    }

    setupCamera() {
        // Configure camera bounds for full game world (30,000px total)
        this.cameras.main.setBounds(0, 0, window.gameData.worldWidth, this.worldHeight);
        this.cameras.main.setZoom(1);

        // Camera will be configured to follow player after player creation
        console.log(`Camera configured - World bounds: ${window.gameData.worldWidth}x${this.worldHeight}`);
    }

    createPlayer() {
        console.log('GameScene: Creating player...');
        
        // Verify critical textures exist
        if (!this.textures.exists('player_male')) {
            console.error('❌ Critical error: player_male texture not found in GameScene!');
            // Try to create emergency fallback
            this.createEmergencyPlayerTexture();
        }
        
        const startX = window.gameData.playerPosition.x;
        const startY = window.gameData.GROUND_Y; // For origin (0.5, 1), Y should be ground level

        console.log('Player start position:', window.gameData.playerPosition);

        try {
            // FIXED: Ensure Player class is available
            if (typeof Player === 'undefined') {
                throw new Error('Player class is not defined. Check script loading order.');
            }

            this.player = new Player(this, startX, startY);
            // Make player accessible globally for debugging
            window.debugPlayer = this.player;
            console.log('Player created successfully - accessible as window.debugPlayer');
            
            // Add test methods for debugging
            window.testPlayerVisibility = () => {
                console.log('🧪 TESTING PLAYER VISIBILITY...');
                this.player.setPosition(400, 300); // Center of screen
                this.player.setScale(2.0); 
                this.player.setVisible(true);
                this.player.setAlpha(1);
                this.player.setDepth(999);
                this.player.setTint(0xFF0000); // Make it red
                console.log('🧪 Player should now be a big red sprite in center of screen');
            };
            
            // Add collision and animation testing methods
            window.testAllFixes = () => {
                return this.player.testAllFixes();
            };
            
            window.fixAnimationFlickering = () => {
                this.player.fixAnimationFlickering();
            };
            
            window.showCollisionBox = () => {
                this.player.showCollisionBox();
            };
            
            window.debugPlayerPosition = () => {
                this.player.debugPositioning();
            };
            
            // Add quick fix method
            window.fixPlayerNow = () => {
                console.log('🔧 APPLYING EMERGENCY FIXES...');
                this.player.setY(window.gameData.GROUND_Y);
                this.player.setScale(2.0);
                this.player.setVisible(true);
                this.player.setAlpha(1);
                this.player.checkGrounding();
                console.log('🔧 Emergency fixes applied');
            };
        } catch (error) {
            console.error('GameScene: Error creating player:', error);
            console.error('Error details:', error.message);
            console.error('Stack trace:', error.stack);
            
            // Log debugging information
            console.log('Available classes:', {
                Player: typeof Player,
                CompanionDog: typeof CompanionDog,
                Phaser: typeof Phaser
            });
            
            throw error;
        }

        // Player collision with ground
        this.physics.add.collider(this.player, this.ground);

        // Set up camera following
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(100, 50);

        this.setupCameraEffects();

        console.log(`Player created at position (${startX}, ${startY})`);
    }
    
    createEmergencyPlayerTexture() {
        console.log('🚨 Creating emergency player texture in GameScene...');
        const graphics = this.add.graphics();
        
        // Draw a bright, highly visible 32x40 character
        graphics.fillStyle(0xFF0000); // Bright red head
        graphics.fillRect(16, 4, 32, 24); // Head (scaled for 32x40)
        graphics.fillStyle(0x00FF00); // Bright green shirt
        graphics.fillRect(12, 28, 40, 24); // Shirt (scaled for 32x40)
        graphics.fillStyle(0x0000FF); // Bright blue pants
        graphics.fillRect(16, 52, 32, 12); // Pants (scaled for 32x40)
        
        graphics.generateTexture('player_male', 32, 40);
        graphics.destroy();
        
        console.log('🚨 Emergency player texture created in GameScene (32x40)');
    }
    
    createPlayerAnimations() {
        // Create simple animations using the frames we created
        this.anims.create({
            key: 'player_idle',
            frames: [
                { key: 'player_idle_1' },
                { key: 'player_idle_2' }
            ],
            frameRate: 2,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player_walk',
            frames: [
                { key: 'player_walk_1' },
                { key: 'player_walk_2' }
            ],
            frameRate: 8,
            repeat: -1
        });

    }

    setupCameraEffects() {
        // Initialize camera effects system
        this.cameraEffects = {
            shakeIntensity: 5,
            shakeDuration: 100,
            isShaking: false
        };

        // Listen for events that should trigger camera shake
        this.events.on('player-land-hard', this.triggerCameraShake, this);
        this.events.on('obstacle-collision', this.triggerCameraShake, this);

        console.log('Camera effects system initialized');
    }

    triggerCameraShake(intensity = 5, duration = 100) {
        if (!this.cameraEffects.isShaking) {
            this.cameraEffects.isShaking = true;
            this.cameras.main.shake(duration, intensity);

            // Reset shake state after duration
            this.time.delayedCall(duration, () => {
                this.cameraEffects.isShaking = false;
            });

            console.log(`Camera shake triggered: intensity=${intensity}, duration=${duration}ms`);
        }
    }



    createCompanion() {
        // Create companion using the CompanionDog class
        const companionStartX = window.gameData.companionPosition.x;
        const companionStartY = window.gameData.companionPosition.y;

        this.companion = new CompanionDog(this, companionStartX, companionStartY);

        // Companion collision with ground
        this.physics.add.collider(this.companion, this.ground);

        // Listen for companion events
        this.events.on('companion-bark', this.handleCompanionBark, this);
        this.events.on('companion-teleported', this.handleCompanionTeleport, this);
        this.events.on('companion-jump', this.handleCompanionJump, this);

        console.log(`Companion created using CompanionDog class at position (${companionStartX}, ${companionStartY}) with depth 1`);
    }

    handleCompanionBark() {
        // Handle companion barking event
        console.log('Companion barked - sound effect would play here');
        // This will be expanded when we implement audio system
    }

    handleCompanionTeleport(teleportData) {
        // Handle companion teleportation event
        console.log('Companion teleported:', teleportData);
        // Could add visual effects here
    }
    
    handleCompanionJump() {
        // Handle companion jumping event
        console.log('Companion jumped to follow player');
        // Could add jump sound effect here when audio system is implemented
        
        // Optional: Add small camera shake when companion jumps
        if (this.cameraEffects && !this.cameraEffects.isShaking) {
            this.triggerCameraShake(2, 50); // Very subtle shake
        }
    }

    setupInput() {
        // Create keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

    }

    createUI() {
        // Create UI elements
        this.ui = {
            // Collectibles counter (will be implemented in later task)
            collectiblesText: this.add.text(20, 20, 'Items: 0', {
                fontSize: '18px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setScrollFactor(0),

            // Debug info (can be removed in production)
            debugText: this.add.text(20, 50, '', {
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1
            }).setScrollFactor(0)
        };

        console.log('UI elements created');
    }

    update() {
        // Update player movement and animations
        this.updatePlayer();

        // Update companion AI
        this.updateCompanion();

        // Update NPCs
        this.updateNPCs();

        // Update obstacles
        this.updateObstacles();

        // FIXED: Update environment zones based on player position
        this.environmentManager.updateZone(this.player.x);
        this.environmentManager.update();

        // Update UI
        this.updateUI();

        // Update parallax backgrounds
        this.updateParallax();

        // Update camera following
        this.updateCamera();
    }

    updateCamera() {
        // Enhanced camera following logic
        const camera = this.cameras.main;
        const player = this.player;

        // Check if player is near world boundaries
        const worldBoundaryBuffer = 200;
        const isNearLeftBoundary = player.x < worldBoundaryBuffer;
        const isNearRightBoundary = player.x > (window.gameData.worldWidth - worldBoundaryBuffer);

        // Adjust camera behavior near boundaries
        if (isNearLeftBoundary || isNearRightBoundary) {
            // Reduce camera following speed near boundaries for smoother experience
            camera.startFollow(player, true, 0.05, 0.1);
        } else {
            // Normal camera following
            camera.startFollow(player, true, 0.1, 0.1);
        }

        // Update current zone based on camera position
        this.updateCurrentZone(camera.scrollX);
    }

    updateCurrentZone(scrollX) {
        // Update environment zone based on player position
        if (this.environmentManager) {
            this.environmentManager.updateZone(this.player.x);
        }
    }

    updatePlayer() {
        // Player class handles its own update logic including input
        this.player.update();

        // Handle player interactions
        if (this.player.interact()) {
            // Try to interact with nearby NPCs
            this.npcs.interactWithNearestNPC(this.player);
        }
    }

    updateCompanion() {
        // CompanionDog class handles its own update logic
        this.companion.update(this.player);
    }
    
    updateNPCs() {
        // Update NPCs (check for player proximity and interactions)
        this.npcs.update(this.player);
    }
    
    updateObstacles() {
        // Update obstacles (animal AI, tractor movement)
        this.obstacles.update(this.player, this.companion);
    }

    updateUI() {
        // Update collectibles counter (handled by updateCollectiblesUI when items are collected)
        // this.ui.collectiblesText.setText(`Items: ${window.gameData.collectedItems.length}`);

        // Update debug info
        if (window.gameData.debug) {
            const playerDebug = this.player.getDebugInfo();
            const companionDebug = this.companion.getDebugInfo();
            const companionAI = this.companion.getAIState();

            const currentZone = window.gameData.currentZone;
            const collectibleStats = this.collectibles.getStats();
            const obstacleStats = this.obstacles.getStats();
            
            this.ui.debugText.setText([
                `Player: ${playerDebug.position} [${playerDebug.state}] | Ground: ${this.player.isOnGround()}`,
                `Companion: ${companionDebug.position} [${companionAI.current}] | Dist: ${companionAI.distance}px`,
                `Items: ${collectibleStats.collected}/${collectibleStats.total} | Obstacles: ${obstacleStats.total} (🐑${obstacleStats.sheep} 🦃${obstacleStats.turkeys} 🚜${obstacleStats.tractors})`,
                `Zone: ${currentZone} | Camera: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
            ]);
        }
    }

    updateParallax() {
        // Update three-layer parallax system through EnvironmentManager
        if (this.environmentManager) {
            this.environmentManager.update();
        }
    }

    createZoneMarkers() {
        // Create visual markers for zone transitions
        this.zoneMarkers = this.add.group();

        // Transition zone marker at 2000px
        const transitionMarker = this.add.text(2000, this.worldHeight - 150, 'Entering Olive Groves', {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5, 0.5);
        this.zoneMarkers.add(transitionMarker);

        // Söke zone marker at 4000px
        const sokeMarker = this.add.text(4000, this.worldHeight - 150, 'Approaching Söke - Cotton Fields', {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5, 0.5);
        this.zoneMarkers.add(sokeMarker);

        // End of segment marker at 5800px
        const endMarker = this.add.text(5800, this.worldHeight - 150, 'Söke City Center - Segment Complete!', {
            fontSize: '28px',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3,
            backgroundColor: 'rgba(0, 100, 0, 0.8)',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5, 0.5);
        this.zoneMarkers.add(endMarker);

        console.log('Zone transition markers created');
    }
}