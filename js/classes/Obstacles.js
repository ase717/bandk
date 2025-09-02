/**
 * Obstacles class - Handles interactive obstacles
 * Sheep herds, chickens, and other environmental challenges
 */
class Obstacles extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        
        this.scene = scene;
        this.obstacleData = {
            sheep: {
                speed: 20,
                wanderRadius: 100,
                flockRadius: 80,
                scareRadius: 60,
                health: 1,
                points: 5
            },

            tractor: {
                speed: 50,
                patrolDistance: 200,
                blockRadius: 40,
                health: 999, // Indestructible
                points: 0
            },

            turkey: {
                speed: 20,
                wanderRadius: 100,
                fleeRadius: 80,
                scareRadius: 60,
                health: 1,
                points: 5
            }
        };
        
        // Obstacle groups for different behaviors
        this.sheepGroup = this.scene.add.group();
        this.tractorGroup = this.scene.add.group();
        this.turkeyGroup = this.scene.add.group();
        
        console.log('Obstacles system initialized');
    }
    
    /**
     * Create all obstacles throughout Segment 1 - FIXED: ALL animals grounded
     */
    createSegment1Obstacles() {
        console.log('Creating all obstacles for Segment 1...');
        
        const GROUND_Y = window.gameData.GROUND_Y; // Use the centralized constant (640)
        
        // All animals positioned at GROUND_Y
        // Kuşadası zone obstacles (0-2000px)
        this.createSheepHerd(600, GROUND_Y, 2);
        this.createSheepHerd(1700, GROUND_Y, 2);
        this.createTurkeyHerd(800, GROUND_Y, 3, 800, GROUND_Y);

        // Transition zone obstacles (2000-4000px)
        this.createSheepHerd(2900, GROUND_Y, 4);
        this.createTractor(3300, GROUND_Y, 3500);

        // Söke zone obstacles (4000-6000px)
        this.createSheepHerd(4400, GROUND_Y, 3);
        this.createTractor(4800, GROUND_Y, 5000);
        this.createSheepHerd(5600, GROUND_Y, 2);
        this.createTurkeyHerd(5600, GROUND_Y, 1, 5600, GROUND_Y);
        
        const totalSheep = this.sheepGroup.children.size;
        const totalTractors = this.tractorGroup.children.size;
        const totalTurkey = this.turkeyGroup.children.size;
        
        console.log(`Created obstacles: ${totalSheep} sheep, ${totalTurkey} turkeys, ${totalTractors} tractors at Y=${GROUND_Y}`);
    }
    
    /**
     * Create a herd of sheep
     */
    createSheepHerd(centerX, centerY, count) {
        const spacing = 40;
        const startX = centerX - (spacing * (count - 1)) / 2;
        for (let i = 0; i < count; i++) {
            const x = startX + i * spacing;
            const y = window.gameData.GROUND_Y;
            const sheep = this.createSheep(x, y, centerX, y);
            this.sheepGroup.add(sheep);
            this.add(sheep);
        }
    }
    
    /**
     * Create a single sheep - FIXED grounding and scaling
     */
    createSheep(x, y, homeX, homeY) {
        // Create sheep with static physics body to prevent falling
        const sheep = this.scene.physics.add.sprite(x, y, 'sheep');
        sheep.setOrigin(0.5, 1);
        sheep.setScale(1.6);
        sheep.setDepth(window.gameData.DEPTHS.CHARACTERS);
        
        // Convert to static body immediately to prevent any falling
        sheep.body.setImmovable(false);
        sheep.body.moves = true; // Completely static
        sheep.body.setSize(28, 24);
        sheep.body.setGravityY(window.gameData.gravity);
        sheep.body.setCollideWorldBounds(true);
        
        sheep.setData('type', 'sheep');
        sheep.setData('homeX', homeX);
        sheep.setData('homeY', homeY);
        sheep.setData('wanderTimer', 0);
        sheep.setData('isScared', false);
        sheep.setData('scareTimer', 0);

        this.scene.physics.add.collider(sheep, this.scene.ground);
        
        if (!this.scene.anims.exists('sheep_idle')) {
            this.scene.anims.create({
                key: 'sheep_idle',
                frames: this.scene.anims.generateFrameNumbers('sheep', { start: 0, end: 12 }),
                frameRate: 2,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists('sheep_walk')) {
            this.scene.anims.create({
                key: 'sheep_walk',
                frames: this.scene.anims.generateFrameNumbers('sheep', { start: 13, end: 21 }),
                frameRate: 6,
                repeat: -1
            });
        }

        sheep.play('sheep_idle');
        
        return sheep;
    }
    
    /**
     * Create a tractor obstacle - FIXED grounding and scaling
     */
    createTractor(x, y, patrolEndX) {
        const tractor = this.scene.physics.add.sprite(x, y, 'tractor');
        tractor.setOrigin(0.5, 1);
        tractor.setScale(1.2); // FIXED: Scale up for better visibility
        tractor.setDepth(window.gameData.DEPTHS.CHARACTERS); // FIXED: Use constant
        
        // FIXED: Make tractor static so it doesn't fall
        tractor.body.setImmovable(false);
        tractor.body.setSize(48, 32);
        
        tractor.setData('type', 'tractor');
        tractor.setData('patrolling', true);
        tractor.setData('startX', x);
        tractor.setData('patrolEndX', patrolEndX);
        tractor.setData('direction', 1);
        tractor.setData('speed', 30);
        tractor.setData('pauseTimer', 0);

        this.scene.physics.add.collider(tractor, this.scene.ground);

        return tractor;
    }

    createTurkeyHerd(x, y, count, homeX, homeY) {
        const spacing = 40;
        const startX = x - (spacing * (count - 1)) / 2;
        for (let i = 0; i < count; i++) {
            const x = startX + i * spacing;
            const y = window.gameData.GROUND_Y;
            const turkey = this.createTurkey(x, y, homeX, y);
            this.turkeyGroup.add(turkey);
        }
    }

    createTurkey(x, y, homeX, homeY) {
        const turkey = this.scene.physics.add.sprite(x, y, 'turkey');
        turkey.setOrigin(0.5, 1);
        turkey.setScale(1.3);
        turkey.setDepth(window.gameData.DEPTHS.CHARACTERS);

        turkey.body.setImmovable(false);
        turkey.body.setSize(28, 24);
        turkey.body.setGravityY(window.gameData.gravity);
        turkey.body.setCollideWorldBounds(true);
        turkey.body.moves = true;

        turkey.setData('type', 'turkey');
        turkey.setData('homeX', homeX);
        turkey.setData('homeY', homeY);
        turkey.setData('wanderTimer', 0);
        turkey.setData('isScared', false);
        turkey.setData('scareTimer', 0);

        this.scene.physics.add.collider(turkey, this.scene.ground);


        // Animasyonu başlat
    if (!this.scene.anims.exists('turkey_idle')) {
        this.scene.anims.create({
            key: 'turkey_idle',
            frames: this.scene.anims.generateFrameNumbers('turkey', { start: 0, end: 12 }),
            frameRate: 3,
            repeat: -1
        });
    }

    if (!this.scene.anims.exists('turkey_walk')) {
        this.scene.anims.create({
            key: 'turkey_walk',
            frames: this.scene.anims.generateFrameNumbers('turkey', { start: 13, end: 21 }),
            frameRate: 6,
            repeat: -1
        });
    }

    turkey.play('turkey_idle');

        return turkey;
    }

    updateTurkey(player, companion) {
        this.turkeyGroup.children.entries.forEach(turkey => {
            const data = this.obstacleData.turkey;
            const currentTime = this.scene.time.now;
    
            const playerDistance = Phaser.Math.Distance.Between(turkey.x, turkey.y, player.x, player.y);
            const companionDistance = Phaser.Math.Distance.Between(turkey.x, turkey.y, companion.x, companion.y);
    
            const isScaredByPlayer = playerDistance < data.scareRadius;
            const isScaredByCompanion = companionDistance < data.scareRadius;
    
            if (isScaredByPlayer || isScaredByCompanion) {
                // Kaçma
                turkey.setData('isScared', true);
                turkey.setData('scareTimer', currentTime + 3000);
    
                let fleeFromX = isScaredByPlayer ? player.x : companion.x;
                let fleeFromY = isScaredByPlayer ? player.y : companion.y;
    
                const fleeAngle = Phaser.Math.Angle.Between(fleeFromX, fleeFromY, turkey.x, turkey.y);
                turkey.setVelocity(
                    Math.cos(fleeAngle) * data.speed * 2,
                    Math.sin(fleeAngle) * data.speed
                );
    
                turkey.setTint(0xFFAAAA);
                turkey.setFlipX(fleeFromX > turkey.x);
    
            } else {
                // Normal wander
                turkey.setData('isScared', false);
                turkey.setTint(0xFFFFFF);
                this.wanderAnimal(turkey, data); // <-- her update çağrılıyor
            }
        });
    }
    
    
    /**
     * Update all obstacles
     */
    update(player, companion) {
        this.updateSheep(player, companion);
        this.updateTractors();
        this.updateTurkey(player, companion);
    }

    /**
     * Update sheep behavior
     */
    updateSheep(player, companion) {
        this.sheepGroup.children.entries.forEach(sheep => {
            const data = this.obstacleData.sheep;
            const currentTime = this.scene.time.now;
            
            // Check if scared by player or companion
            const playerDistance = Phaser.Math.Distance.Between(sheep.x, sheep.y, player.x, player.y);
            const companionDistance = Phaser.Math.Distance.Between(sheep.x, sheep.y, companion.x, companion.y);
            
            const isScaredByPlayer = playerDistance < data.scareRadius;
            const isScaredByCompanion = companionDistance < data.scareRadius;
            
            if (isScaredByPlayer || isScaredByCompanion) {
                // Scared behavior - run away
                sheep.setData('isScared', true);
                sheep.setData('scareTimer', currentTime + 3000); // Scared for 3 seconds
                
                // Run away from the closest threat
                let fleeFromX, fleeFromY;
                if (playerDistance < companionDistance) {
                    fleeFromX = player.x;
                    fleeFromY = player.y;
                } else {
                    fleeFromX = companion.x;
                    fleeFromY = companion.y;
                }
                
                const fleeAngle = Phaser.Math.Angle.Between(fleeFromX, fleeFromY, sheep.x, sheep.y);
                sheep.setVelocity(
                    Math.cos(fleeAngle) * data.speed * 2,
                    Math.sin(fleeAngle) * data.speed
                );
                
                sheep.setTint(0xFFAAAA); // Reddish tint when scared
                sheep.setFlipX(fleeFromX > sheep.x);
                
                // Make companion bark at sheep
                if (isScaredByCompanion && companion.bark) {
                    companion.bark(500);
                }
                
            } else if (sheep.getData('isScared') && currentTime > sheep.getData('scareTimer')) {
                // Stop being scared
                sheep.setData('isScared', false);
                sheep.setTint(0xFFFFFF); // Normal color
                
                // Gentle wandering behavior
                this.wanderAnimal(sheep, data);
                
            } else if (!sheep.getData('isScared')) {
                // Normal wandering behavior
                this.wanderAnimal(sheep, data);
            }
        });
    }
    
    /**
     * Update tractor behavior
     */
    updateTractors() {
        this.tractorGroup.children.entries.forEach(tractor => {
            if (!tractor.getData('patrolling')) return;
            
            const data = this.obstacleData.tractor;
            const startX = tractor.getData('startX');
            const endX = tractor.getData('patrolEndX');
            const direction = tractor.getData('direction');
            
            // Move tractor
            tractor.setVelocityX(direction * data.speed);
            tractor.setFlipX(direction < 0);
            
            // Check if reached patrol boundary
            if (direction > 0 && tractor.x >= endX) {
                tractor.setData('direction', -1);
            } else if (direction < 0 && tractor.x <= startX) {
                tractor.setData('direction', 1);
            }
        });
    }
    
    /**
     * Generic wandering behavior for animals
     */
    wanderAnimal(animal, data) {
        const currentTime = this.scene.time.now;
        const wanderTimer = animal.getData('wanderTimer');
        const type = animal.getData('type'); // sheep, turkey
        const idleAnim = type + '_idle';
        const walkAnim = type + '_walk';
        
        if (currentTime > wanderTimer) {
            const homeX = animal.getData('homeX');
            const homeY = animal.getData('homeY');
            const distanceFromHome = Phaser.Math.Distance.Between(animal.x, animal.y, homeX, homeY);
            
            if (distanceFromHome > data.wanderRadius) {
                const homeAngle = Phaser.Math.Angle.Between(animal.x, animal.y, homeX, homeY);
                animal.setVelocity(
                    Math.cos(homeAngle) * data.speed * 0.5,
                    Math.sin(homeAngle) * data.speed * 0.3
                );
            } else {
                const wanderAngle = Math.random() * Math.PI * 2;
                animal.setVelocity(
                    Math.cos(wanderAngle) * data.speed * 0.3,
                    Math.sin(wanderAngle) * data.speed * 0.2
                );
            }
            
            animal.setFlipX(animal.body.velocity.x < 0);
            animal.setData('wanderTimer', currentTime + 2000 + Math.random() * 3000);
    
            // Animasyonları hayvan türüne göre başlat
            if (animal.body.velocity.length() > 1) {
                if (this.scene.anims.exists(walkAnim)) animal.play(walkAnim, true);
            } else {
                if (this.scene.anims.exists(idleAnim)) animal.play(idleAnim, true);
            }
        }
    }
    

    
    /**
     * Scare an animal
     */
    scareAnimal(animal, scarer) {
        animal.setData('isScared', true);
        animal.setData('scareTimer', this.scene.time.now + 3000);
        
        const fleeAngle = Phaser.Math.Angle.Between(scarer.x, scarer.y, animal.x, animal.y);
        const data = this.obstacleData[animal.getData('type')];
        
        animal.setVelocity(
            Math.cos(fleeAngle) * data.speed * 2,
            Math.sin(fleeAngle) * data.speed
        );
    }
    
    /**
     * Get obstacle statistics
     */
    getStats() {
        return {
            sheep: this.sheepGroup.children.size,
            tractors: this.tractorGroup.children.size,
            turkeys: this.turkeyGroup.children.size,
            total: this.children.size
        };
    }
}