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
                speed: 30,
                wanderRadius: 100,
                flockRadius: 80,
                scareRadius: 60,
                health: 1,
                points: 5
            },
            chicken: {
                speed: 120,
                wanderRadius: 150,
                fleeRadius: 80,
                scareRadius: 50,
                health: 1,
                points: 3
            },
            tractor: {
                speed: 50,
                patrolDistance: 200,
                blockRadius: 40,
                health: 999, // Indestructible
                points: 0
            }
        };
        
        // Obstacle groups for different behaviors
        this.sheepGroup = this.scene.add.group();
        this.chickenGroup = this.scene.add.group();
        this.tractorGroup = this.scene.add.group();
        
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
        this.createSheepHerd(600, GROUND_Y, 3);
        this.createChickenGroup(1100, GROUND_Y, 4);
        this.createSheepHerd(1700, GROUND_Y, 2);
        
        // Transition zone obstacles (2000-4000px)
        this.createChickenGroup(2400, GROUND_Y, 5);
        this.createSheepHerd(2900, GROUND_Y, 4);
        this.createTractor(3300, GROUND_Y, 3500);
        this.createChickenGroup(3700, GROUND_Y, 3);
        
        // Söke zone obstacles (4000-6000px)
        this.createSheepHerd(4400, GROUND_Y, 3);
        this.createTractor(4800, GROUND_Y, 5000);
        this.createChickenGroup(5200, GROUND_Y, 4);
        this.createSheepHerd(5600, GROUND_Y, 2);
        
        const totalSheep = this.sheepGroup.children.size;
        const totalChickens = this.chickenGroup.children.size;
        const totalTractors = this.tractorGroup.children.size;
        
        console.log(`Created obstacles: ${totalSheep} sheep, ${totalChickens} chickens, ${totalTractors} tractors at Y=${GROUND_Y}`);
    }
    
    /**
     * Create a herd of sheep
     */
    createSheepHerd(centerX, centerY, count) {
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 80;
            const offsetY = (Math.random() - 0.5) * 40;
            const sheep = this.createSheep(centerX + offsetX, centerY + offsetY, centerX, centerY);
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
        sheep.setScale(1.2);
        sheep.setDepth(window.gameData.DEPTHS.CHARACTERS);
        
        // Convert to static body immediately to prevent any falling
        sheep.body.setImmovable(true);
        sheep.body.moves = false; // Completely static
        sheep.body.setSize(28, 24);
        
        sheep.setData('type', 'sheep');
        sheep.setData('homeX', homeX);
        sheep.setData('homeY', homeY);
        sheep.setData('wanderTimer', 0);
        sheep.setData('isScared', false);
        sheep.setData('scareTimer', 0);
        
        // Add gentle idle animation
        this.scene.tweens.add({
            targets: sheep,
            scaleX: 1.1,
            duration: 2000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.add(sheep);
        return sheep;
    }
    
    /**
     * Create a group of chickens
     */
    createChickenGroup(centerX, centerY, count) {
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 60;
            const offsetY = (Math.random() - 0.5) * 30;
            const chicken = this.createChicken(centerX + offsetX, centerY + offsetY, centerX, centerY);
            this.chickenGroup.add(chicken);
            this.add(chicken);
        }
    }
    
    /**
     * Create a single chicken - FIXED: NO MORE FLOATING
     */
    createChicken(x, y, homeX, homeY) {
        const chicken = this.scene.physics.add.sprite(x, y, 'chicken');
        chicken.setOrigin(0.5, 1);
        chicken.setScale(1.3); // FIXED: Scale up for better visibility
        chicken.setDepth(window.gameData.DEPTHS.CHARACTERS); // FIXED: Use constant
        
        // FIXED: Make chicken static so they don't fall
        chicken.body.setImmovable(true);
        chicken.body.setGravityY(-window.gameData.gravity); // Counteract gravity
        chicken.body.setSize(16, 20);
        
        chicken.setData('type', 'chicken');
        chicken.setData('homeX', homeX);
        chicken.setData('homeY', homeY);
        chicken.setData('wanderTimer', 0);
        chicken.setData('isScared', false);
        chicken.setData('scareTimer', 0);
        chicken.setData('peckTimer', 0);
        
        // Add pecking animation
        this.scene.tweens.add({
            targets: chicken,
            y: y - 5,
            duration: 800 + Math.random() * 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        return chicken;
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
        tractor.body.setImmovable(true);
        tractor.body.setGravityY(-window.gameData.gravity); // Counteract gravity
        tractor.body.setSize(48, 32);
        
        tractor.setData('type', 'tractor');
        tractor.setData('startX', x);
        tractor.setData('patrolEndX', patrolEndX);
        tractor.setData('direction', 1);
        tractor.setData('speed', 30);
        tractor.setData('pauseTimer', 0);
        
        return tractor;
    }
    
    /**
     * Update all obstacles
     */
    update(player, companion) {
        this.updateSheep(player, companion);
        this.updateChickens(player, companion);
        this.updateTractors();
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
     * Update chicken behavior
     */
    updateChickens(player, companion) {
        this.chickenGroup.children.entries.forEach(chicken => {
            const data = this.obstacleData.chicken;
            const currentTime = this.scene.time.now;
            
            // Check if scared by player or companion
            const playerDistance = Phaser.Math.Distance.Between(chicken.x, chicken.y, player.x, player.y);
            const companionDistance = Phaser.Math.Distance.Between(chicken.x, chicken.y, companion.x, companion.y);
            
            const isScaredByPlayer = playerDistance < data.fleeRadius;
            const isScaredByCompanion = companionDistance < data.fleeRadius;
            
            if (isScaredByPlayer || isScaredByCompanion) {
                // Scared behavior - run away quickly
                chicken.setData('isScared', true);
                chicken.setData('scareTimer', currentTime + 2000); // Scared for 2 seconds
                
                // Run away from the closest threat
                let fleeFromX, fleeFromY;
                if (playerDistance < companionDistance) {
                    fleeFromX = player.x;
                    fleeFromY = player.y;
                } else {
                    fleeFromX = companion.x;
                    fleeFromY = companion.y;
                }
                
                const fleeAngle = Phaser.Math.Angle.Between(fleeFromX, fleeFromY, chicken.x, chicken.y);
                chicken.setVelocity(
                    Math.cos(fleeAngle) * data.speed,
                    Math.sin(fleeAngle) * data.speed * 0.5
                );
                
                chicken.setTint(0xFFFFAA); // Yellowish tint when scared
                chicken.setFlipX(fleeFromX > chicken.x);
                
                // Make companion chase chickens
                if (isScaredByCompanion && companion.reactToChickens) {
                    companion.reactToChickens([chicken]);
                }
                
            } else if (chicken.getData('isScared') && currentTime > chicken.getData('scareTimer')) {
                // Stop being scared
                chicken.setData('isScared', false);
                chicken.setTint(0xFFFFFF); // Normal color
                
                // Return to pecking/wandering
                this.wanderAnimal(chicken, data);
                
            } else if (!chicken.getData('isScared')) {
                // Normal pecking and wandering behavior
                this.wanderAnimal(chicken, data);
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
            const endX = tractor.getData('endX');
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
        
        if (currentTime > wanderTimer) {
            // Set new wander direction
            const homeX = animal.getData('homeX');
            const homeY = animal.getData('homeY');
            const distanceFromHome = Phaser.Math.Distance.Between(animal.x, animal.y, homeX, homeY);
            
            if (distanceFromHome > data.wanderRadius) {
                // Return towards home
                const homeAngle = Phaser.Math.Angle.Between(animal.x, animal.y, homeX, homeY);
                animal.setVelocity(
                    Math.cos(homeAngle) * data.speed * 0.5,
                    Math.sin(homeAngle) * data.speed * 0.3
                );
            } else {
                // Random wandering
                const wanderAngle = Math.random() * Math.PI * 2;
                animal.setVelocity(
                    Math.cos(wanderAngle) * data.speed * 0.3,
                    Math.sin(wanderAngle) * data.speed * 0.2
                );
            }
            
            animal.setFlipX(animal.body.velocity.x < 0);
            
            // Set next wander time
            animal.setData('wanderTimer', currentTime + 2000 + Math.random() * 3000);
        }
    }
    
    /**
     * Handle collision with player
     */
    handlePlayerCollision(player, obstacle) {
        const type = obstacle.getData('type');
        
        switch (type) {
            case 'sheep':
                // Sheep just get scared and run away
                this.scareAnimal(obstacle, player);
                break;
                
            case 'chicken':
                // Chickens flee quickly and make noise
                this.scareAnimal(obstacle, player);
                this.scene.events.emit('chicken-disturbed', obstacle);
                break;
                
            case 'tractor':
                // Tractor blocks movement but doesn't hurt
                console.log('Player blocked by tractor');
                break;
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
            chickens: this.chickenGroup.children.size,
            tractors: this.tractorGroup.children.size,
            total: this.children.size
        };
    }
}