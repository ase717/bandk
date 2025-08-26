/**
 * NPCs class - Handles Non-Player Characters
 * Turkish "dayılar" at tea houses with authentic dialogue
 */
class NPCs extends Phaser.Physics.Arcade.StaticGroup {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.scene = scene;
        this.npcData = {
            tea_house_dayi: {
                dialogues: [
                    "Anaa nereye koşupduru bu",
                    "Hoş geldin oğlum! Çay?",
                    "Söke'ye mi gidiyorsun?",
                ],
                interactionRadius: 60,
                cooldown: 5000 // 5 seconds between interactions
            },
            farmer: {
                dialogues: [
                    "Pamuk hasadı zamanı!",
                    "Toz ettin her yeri",
                    "Aydın'a kadar uzun yol."
                ],
                interactionRadius: 50,
                cooldown: 4000
            },
            villager: {
                dialogues: [
                    "Gel bi su verem çocuğum",
                    "Bu köpek senin mi?",
                    "Allah yolunu açık etsin."
                ],
                interactionRadius: 45,
                cooldown: 3000
            }
        };

        // Dialogue system
        this.activeDialogues = new Map();
        this.lastInteractions = new Map();

        console.log('NPCs system initialized with Turkish characters');
    }

    /**
     * Create all 11 NPCs throughout Segment 1 - FIXED positioning and scaling
     */
    createSegment1NPCs() {
        console.log('Creating all 11 NPCs for Segment 1...');

        const GROUND_Y = window.gameData.GROUND_Y; // Use centralized ground level
        
        // Kuşadası zone NPCs (0-2000px) - 4 NPCs
        this.createNPC('tea_house_dayi', 500, GROUND_Y, 'Coastal Tea House Dayı');
        this.createNPC('villager', 900, GROUND_Y, 'Beach Villager');
        this.createNPC('tea_house_dayi', 1300, GROUND_Y, 'Harbor Tea House');
        this.createNPC('villager', 1700, GROUND_Y, 'Local Fisherman');

        // Transition zone NPCs (2000-4000px) - 4 NPCs
        this.createNPC('farmer', 2200, GROUND_Y, 'Olive Grove Farmer');
        this.createNPC('tea_house_dayi', 2600, GROUND_Y, 'Village Tea House Dayı');
        this.createNPC('villager', 3000, GROUND_Y, 'Village Elder');
        this.createNPC('farmer', 3400, GROUND_Y, 'Olive Picker');

        // Söke zone NPCs (4000-6000px) - 3 NPCs
        this.createNPC('farmer', 4400, GROUND_Y, 'Cotton Field Farmer');
        this.createNPC('tea_house_dayi', 4800, GROUND_Y, 'Söke Tea House Dayı');
        this.createNPC('villager', 5200, GROUND_Y, 'Cotton Worker');

        console.log(`Created ${this.children.size} NPCs across Segment 1`);
    }

    /**
     * Create a single NPC - FIXED scaling and visibility
     */
    createNPC(type, x, y, name = '') {
        // Create NPC sprite
        const npc = this.scene.physics.add.staticSprite(x, y, 'npc_' + type);
        npc.setOrigin(0.5, 1);
        npc.body.setSize(32, 48);
        npc.setData('type', type);
        npc.setData('name', name);
        npc.setData('lastInteraction', 0);

        // SCALE UP for visibility
        npc.setScale(1.2);
        npc.body.setSize(32 * 1.2, 48 * 1.2);
        npc.setDepth(window.gameData.DEPTHS.CHARACTERS);
        
        console.log(`✅ FIXED: ${name} (${type}) scaled and positioned at (${x}, ${y})`);

        // Add subtle idle animation
        this.scene.tweens.add({
            targets: npc,
            scaleX: 1.15,
            duration: 2000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Create interaction indicator - SCALED
        const indicator = this.scene.add.text(x, y - 80, '💬', {
            fontSize: '20px'
        }).setOrigin(0.5, 0.5);
        indicator.setVisible(false);
        indicator.setDepth(10);
        npc.setData('indicator', indicator);

        this.add(npc);
        return npc;
    }

    /**
     * Update NPCs (check for player proximity)
     */
    update(player) {
        this.children.entries.forEach(npc => {
            const distance = Phaser.Math.Distance.Between(npc.x, npc.y, player.x, player.y);
            const data = this.npcData[npc.getData('type')];
            const indicator = npc.getData('indicator');

            // Show/hide interaction indicator
            if (distance <= data.interactionRadius) {
                indicator.setVisible(true);

                // Auto-interact when very close (optional)
                if (distance <= 30) {
                    this.tryInteraction(player, npc);
                }
            } else {
                indicator.setVisible(false);
            }
        });
    }

    /**
     * Handle NPC interaction
     */
    tryInteraction(player, npc) {
        const type = npc.getData('type');
        const data = this.npcData[type];
        const currentTime = this.scene.time.now;
        const lastInteraction = npc.getData('lastInteraction');

        // Check cooldown
        if (currentTime - lastInteraction < data.cooldown) {
            return false;
        }

        // Update last interaction time
        npc.setData('lastInteraction', currentTime);

        // Get random dialogue
        const dialogue = Phaser.Utils.Array.GetRandom(data.dialogues);

        // Show dialogue
        this.showNPCDialogue(npc, dialogue);

        // Make NPC face the player
        npc.setFlipX(player.x < npc.x);

        // Emit interaction event
        this.scene.events.emit('npc-interaction', {
            type: type,
            name: npc.getData('name'),
            dialogue: dialogue,
            position: { x: npc.x, y: npc.y }
        });

        console.log(`NPC interaction: ${npc.getData('name')} - "${dialogue}"`);
        return true;
    }

    /**
     * Show NPC dialogue bubble
     */
    showNPCDialogue(npc, text) {
        const npcId = npc.getData('name') || 'npc_' + npc.x;

        // Remove existing dialogue for this NPC
        if (this.activeDialogues.has(npcId)) {
            const oldDialogue = this.activeDialogues.get(npcId);
            if (oldDialogue.container) {
                oldDialogue.container.destroy();
            }
            if (oldDialogue.timer) {
                oldDialogue.timer.remove();
            }
        }

        // Create dialogue background with Turkish style
        const dialogueBg = this.scene.add.graphics();
        dialogueBg.fillStyle(0x8B4513, 0.9); // Brown background
        dialogueBg.lineStyle(2, 0xFFD700); // Gold border

        const padding = 10;
        const textWidth = text.length * 7;
        const textHeight = 20;

        dialogueBg.fillRoundedRect(-padding, -padding, textWidth + padding * 2, textHeight + padding * 2, 8);
        dialogueBg.strokeRoundedRect(-padding, -padding, textWidth + padding * 2, textHeight + padding * 2, 8);

        // Create dialogue text
        const dialogueText = this.scene.add.text(0, 0, text, {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0, 0);

        // Create speech bubble tail
        const tail = this.scene.add.graphics();
        tail.fillStyle(0x8B4513);
        tail.fillTriangle(textWidth / 2 - 5, textHeight + padding, textWidth / 2 + 5, textHeight + padding, textWidth / 2, textHeight + padding + 10);

        // Create container
        const container = this.scene.add.container(npc.x - textWidth / 2, npc.y - 80);
        container.add([dialogueBg, dialogueText, tail]);
        container.setDepth(100);

        // Animate appearance
        container.setAlpha(0);
        container.setScale(0.5);
        this.scene.tweens.add({
            targets: container,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Auto-remove after 4 seconds
        const timer = this.scene.time.delayedCall(4000, () => {
            this.scene.tweens.add({
                targets: container,
                alpha: 0,
                scaleY: 0,
                duration: 300,
                onComplete: () => {
                    container.destroy();
                    this.activeDialogues.delete(npcId);
                }
            });
        });

        // Store dialogue reference
        this.activeDialogues.set(npcId, { container, timer });
    }

    /**
     * Manual interaction trigger (for E key press)
     */
    interactWithNearestNPC(player) {
        let nearestNPC = null;
        let nearestDistance = Infinity;

        this.children.entries.forEach(npc => {
            const distance = Phaser.Math.Distance.Between(npc.x, npc.y, player.x, player.y);
            const data = this.npcData[npc.getData('type')];

            if (distance <= data.interactionRadius && distance < nearestDistance) {
                nearestDistance = distance;
                nearestNPC = npc;
            }
        });

        if (nearestNPC) {
            return this.tryInteraction(player, nearestNPC);
        }

        return false;
    }

    /**
     * Get NPC statistics
     */
    getStats() {
        const stats = {
            total: this.children.size,
            byType: {}
        };

        this.children.entries.forEach(npc => {
            const type = npc.getData('type');
            stats.byType[type] = (stats.byType[type] || 0) + 1;
        });

        return stats;
    }

    /**
     * Clean up all active dialogues
     */
    cleanup() {
        this.activeDialogues.forEach(dialogue => {
            if (dialogue.container) dialogue.container.destroy();
            if (dialogue.timer) dialogue.timer.remove();
        });
        this.activeDialogues.clear();
    }
}