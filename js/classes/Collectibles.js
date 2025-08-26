/**
 * Collectibles class - Handles all collectible items in the game
 * Uses PNG textures: beer, white_cheese, wine_red with Turkish dialogue
 */
class Collectibles extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.scene = scene;

        // Updated collectible data to match PNG textures from PreloadScene
        this.collectibleData = {
            beer: {
                dialogue: "Ah bira, en sevdiği..",
                points: 10,
                sound: 'pickup_beer',
                texture: 'beer'
            },
            white_cheese: {
                dialogue: "Beyaz peynir, Asena'nın favorisi!",
                points: 15,
                sound: 'pickup_food',
                texture: 'white_cheese'
            },
            wine_red: {
                dialogue: "Kırmızı şarap, özel günler için..",
                points: 20,
                sound: 'pickup_wine',
                texture: 'wine_red'
            }
        };

        // Dialogue system
        this.currentDialogue = null;
        this.dialogueTimer = null;

        console.log('🎨 Collectibles system initialized with PNG textures');
    }

    /**
     * Create all 12 collectibles throughout Segment 1 using PNG textures
     */
    createSegment1Collectibles() {
        console.log('🎨 Creating 12 collectibles for Segment 1 with PNG textures...');

        const GROUND_Y = window.gameData.GROUND_Y; // 670
        const FLOAT_HEIGHT = 80; // Collectibles float 80px above ground for better visibility

        // Collectibles floating above ground level
        // Kuşadası zone collectibles (0-2000px) - 4 items
        this.createCollectible('beer', 300, GROUND_Y - FLOAT_HEIGHT);
        this.createCollectible('white_cheese', 800, GROUND_Y - FLOAT_HEIGHT + 10);
        this.createCollectible('wine_red', 1200, GROUND_Y - FLOAT_HEIGHT + 20);
        this.createCollectible('beer', 1600, GROUND_Y - FLOAT_HEIGHT + 5);

        // Transition zone collectibles (2000-4000px) - 4 items
        this.createCollectible('white_cheese', 2300, GROUND_Y - FLOAT_HEIGHT);
        this.createCollectible('wine_red', 2800, GROUND_Y - FLOAT_HEIGHT + 10);
        this.createCollectible('beer', 3200, GROUND_Y - FLOAT_HEIGHT + 20);
        this.createCollectible('white_cheese', 3600, GROUND_Y - FLOAT_HEIGHT + 5);

        // Söke zone collectibles (4000-6000px) - 4 items
        this.createCollectible('wine_red', 4200, GROUND_Y - FLOAT_HEIGHT);
        this.createCollectible('beer', 4600, GROUND_Y - FLOAT_HEIGHT + 10);
        this.createCollectible('white_cheese', 5000, GROUND_Y - FLOAT_HEIGHT + 20);
        this.createCollectible('wine_red', 5400, GROUND_Y - FLOAT_HEIGHT + 5);

        console.log(`🎨 Created ${this.children.size} collectibles using PNG textures at Y=${GROUND_Y - FLOAT_HEIGHT}`);
    }

    /**
     * Spawn multiple collectibles easily
     * @param {Array} collectibleList - Array of {type, x, y} objects
     */
    spawnCollectibles(collectibleList) {
        console.log(`🎨 Spawning ${collectibleList.length} collectibles...`);

        collectibleList.forEach(item => {
            this.createCollectible(item.type, item.x, item.y);
        });

        console.log(`🎨 Spawned ${collectibleList.length} collectibles successfully`);
    }

    /**
     * Get available collectible types
     */
    getAvailableTypes() {
        return Object.keys(this.collectibleData);
    }

    /**
     * Create a random collectible at specified position
     */
    createRandomCollectible(x, y) {
        const types = this.getAvailableTypes();
        const randomType = types[Math.floor(Math.random() * types.length)];
        return this.createCollectible(randomType, x, y);
    }

    /**
     * Create a single collectible item with proper Arcade Physics
     */
    createCollectible(type, x, y) {
        const data = this.collectibleData[type];
        if (!data) {
            console.error(`❌ Unknown collectible type: ${type}`);
            return null;
        }

        // Create physics sprite using the PNG texture
        const collectible = this.scene.physics.add.sprite(x, y, data.texture);

        // Set origin and scale for proper positioning
        collectible.setOrigin(0.5, 0.5); // Center origin for floating collectibles
        collectible.setScale(1.5); // Larger scale for better visibility
        collectible.setDepth(window.gameData.DEPTHS.COLLECTIBLES);

        // Configure Arcade Physics body
        collectible.body.immovable = true; // Correct property for Arcade Physics
        collectible.body.allowGravity = false; // Prevent falling
        collectible.body.setVelocity(0, 0); // No movement

        // Set collision box size (adjust based on sprite size)
        const bodySize = Math.min(collectible.width * 0.8, collectible.height * 0.8);
        collectible.body.setSize(bodySize, bodySize);
        collectible.body.setOffset(
            (collectible.width - bodySize) / 2,
            (collectible.height - bodySize) / 2
        );

        // Set data for collection system
        collectible.setData('type', type);
        collectible.setData('collected', false);
        collectible.setData('points', data.points);

        // Add floating animation (visual only, non-physics)
        this.scene.tweens.add({
            targets: collectible,
            y: y - 15,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add subtle glow effect
        this.scene.tweens.add({
            targets: collectible,
            alpha: 0.8,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add to group
        this.add(collectible);

        console.log(`🎨 Created ${type} collectible at (${x}, ${y}) using texture: ${data.texture} | Ground Y: ${window.gameData.GROUND_Y} | Float Y: ${y}`);
        return collectible;
    }

    /**
     * Handle collectible pickup
     */
    collectItem(player, collectible) {
        // Remove unused parameter warning
        player;
        if (collectible.getData('collected')) return;

        const type = collectible.getData('type');
        const data = this.collectibleData[type];

        // Mark as collected
        collectible.setData('collected', true);

        // Add to inventory
        window.gameData.collectedItems.push({
            type: type,
            timestamp: Date.now(),
            position: { x: collectible.x, y: collectible.y }
        });

        // Show dialogue
        this.showDialogue(data.dialogue, collectible.x, collectible.y - 50);

        // Play collection effect
        this.playCollectionEffect(collectible);

        // Emit collection event
        this.scene.events.emit('item-collected', {
            type: type,
            points: data.points,
            total: window.gameData.collectedItems.length
        });

        // Remove collectible with animation
        this.scene.tweens.add({
            targets: collectible,
            y: collectible.y - 30,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                collectible.destroy();
            }
        });

        console.log(`Collected ${type}: "${data.dialogue}"`);
    }

    /**
     * Show dialogue bubble
     */
    showDialogue(text, x, y) {
        // Remove existing dialogue
        if (this.currentDialogue) {
            this.currentDialogue.destroy();
            if (this.dialogueTimer) {
                this.dialogueTimer.remove();
            }
        }

        // Create dialogue background
        const dialogueBg = this.scene.add.graphics();
        dialogueBg.fillStyle(0x000000, 0.8);
        dialogueBg.fillRoundedRect(-5, -5, text.length * 8 + 10, 25, 5);

        // Create dialogue text
        const dialogueText = this.scene.add.text(0, 0, text, {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0, 0);

        // Create container
        this.currentDialogue = this.scene.add.container(x, y);
        this.currentDialogue.add([dialogueBg, dialogueText]);
        this.currentDialogue.setDepth(100); // Always on top

        // Animate dialogue appearance
        this.currentDialogue.setAlpha(0);
        this.currentDialogue.setScale(0.5);
        this.scene.tweens.add({
            targets: this.currentDialogue,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });

        // Auto-remove dialogue after 3 seconds
        this.dialogueTimer = this.scene.time.delayedCall(3000, () => {
            if (this.currentDialogue) {
                this.scene.tweens.add({
                    targets: this.currentDialogue,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        if (this.currentDialogue) {
                            this.currentDialogue.destroy();
                            this.currentDialogue = null;
                        }
                    }
                });
            }
        });
    }

    /**
     * Play collection visual effect
     */
    playCollectionEffect(collectible) {
        // Create sparkle particles
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.rectangle(
                collectible.x,
                collectible.y,
                3, 3,
                0xFFD700
            );
            particles.push(particle);

            const angle = (i / 8) * Math.PI * 2;
            const distance = 30;

            this.scene.tweens.add({
                targets: particle,
                x: collectible.x + Math.cos(angle) * distance,
                y: collectible.y + Math.sin(angle) * distance,
                alpha: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        // Screen flash effect
        const flash = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0xFFFFFF,
            0.3
        );
        flash.setScrollFactor(0);
        flash.setDepth(99);

        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 150,
            onComplete: () => flash.destroy()
        });
    }

    /**
     * Get collection statistics
     */
    getStats() {
        const stats = {
            total: this.children.size,
            collected: window.gameData.collectedItems.length,
            remaining: this.children.size - window.gameData.collectedItems.length
        };

        // Count by type
        stats.byType = {};
        window.gameData.collectedItems.forEach(item => {
            stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
        });

        return stats;
    }
}