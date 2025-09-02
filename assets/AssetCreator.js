class AssetCreator {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Create all visual assets for the game
     */
    async createAllAssets(progressCallback) {
        console.log('🎨 AssetCreator: Starting Prince of Persia style asset creation...');

        // Environment assets (backgrounds loaded from files in PreloadScene)
        await this.createSignboard(progressCallback);
        await this.createProps(progressCallback);

        // NPC assets
        await this.createNPCs(progressCallback);

        // Obstacle assets
        await this.createObstacles(progressCallback);

        console.log('🎨 AssetCreator: All assets created successfully!');
    }

    /**
     * Create layered character sprites from individual asset layers
     * Combines skin + clothing layers into complete character textures
     */
    async createLayeredCharacters(progressCallback) {
        if (progressCallback) progressCallback(5, 'Creating layered characters...');
        await this.delay(300);
        
    }

    /**
     * Create environmental props
     */
    async createProps(progressCallback) {
        if (progressCallback) progressCallback(70, 'Creating Mediterranean props...');
        await this.delay(300);

        // Olive tree
        const oliveGraphics = this.scene.add.graphics();
        oliveGraphics.fillStyle(0x5D4037); // Brown trunk
        oliveGraphics.fillRect(28, 40, 8, 40); // Trunk
        oliveGraphics.fillStyle(0x689F38); // Olive green foliage
        oliveGraphics.fillEllipse(32, 30, 30, 25); // Main foliage
        oliveGraphics.fillEllipse(25, 35, 15, 12); // Left branch
        oliveGraphics.fillEllipse(39, 35, 15, 12); // Right branch
        oliveGraphics.generateTexture('olive_tree', 64, 80);
        oliveGraphics.destroy();

        // Stone fence (Turkish style)
        const fenceGraphics = this.scene.add.graphics();
        fenceGraphics.fillStyle(0x8D6E63); // Stone color
        fenceGraphics.fillRect(0, 0, 64, 32);
        fenceGraphics.fillStyle(0x6D4C41); // Darker stones
        for (let i = 0; i < 8; i++) {
            fenceGraphics.fillRect(i * 8, 0, 7, 16);
            fenceGraphics.fillRect(i * 8, 16, 7, 16);
        }
        fenceGraphics.generateTexture('stone_fence', 64, 32);
        fenceGraphics.destroy();

    }

    /**
     * Create collectible items (16x16)
     */
    async createCollectibles(progressCallback) {
        if (progressCallback) progressCallback(85, 'Creating collectible items...');
        await this.delay(300);
    }
    /**
     * Create NPC sprites (32x48)
     */
    async createNPCs(progressCallback) {
        if (progressCallback) progressCallback(90, 'Creating Turkish NPCs...');
        await this.delay(300);

        // Tea house dayı (traditional Turkish tea house owner)
        const dayiGraphics = this.scene.add.graphics();
        // Head and face
        dayiGraphics.fillStyle(0xD2B48C); // Tan skin
        dayiGraphics.fillRect(8, 4, 16, 12); // Head
        dayiGraphics.fillStyle(0x8B4513); // Brown hair/mustache
        dayiGraphics.fillRect(6, 2, 20, 4); // Hair
        dayiGraphics.fillRect(10, 12, 12, 2); // Mustache
        // Eyes
        dayiGraphics.fillStyle(0x000000);
        dayiGraphics.fillRect(10, 8, 2, 2); // Left eye
        dayiGraphics.fillRect(20, 8, 2, 2); // Right eye
        // Traditional vest
        dayiGraphics.fillStyle(0x8B0000); // Dark red vest
        dayiGraphics.fillRect(6, 16, 20, 16); // Vest
        dayiGraphics.fillStyle(0xFFD700); // Gold buttons
        dayiGraphics.fillRect(15, 18, 2, 2);
        dayiGraphics.fillRect(15, 22, 2, 2);
        dayiGraphics.fillRect(15, 26, 2, 2);
        // Arms
        dayiGraphics.fillStyle(0xD2B48C); // Skin
        dayiGraphics.fillRect(2, 18, 4, 12); // Left arm
        dayiGraphics.fillRect(26, 18, 4, 12); // Right arm
        // Pants
        dayiGraphics.fillStyle(0x2F4F4F); // Dark grey pants
        dayiGraphics.fillRect(8, 32, 16, 16); // Legs
        dayiGraphics.generateTexture('npc_tea_house_dayi', 32, 48);
        dayiGraphics.destroy();

        // Farmer NPC
        const farmerGraphics = this.scene.add.graphics();
        // Head
        farmerGraphics.fillStyle(0xCD853F); // Tanned skin
        farmerGraphics.fillRect(8, 4, 16, 12);
        farmerGraphics.fillStyle(0x654321); // Brown hair
        farmerGraphics.fillRect(6, 2, 20, 4);
        // Eyes
        farmerGraphics.fillStyle(0x000000);
        farmerGraphics.fillRect(10, 8, 2, 2);
        farmerGraphics.fillRect(20, 8, 2, 2);
        // Work shirt
        farmerGraphics.fillStyle(0x4682B4); // Blue work shirt
        farmerGraphics.fillRect(6, 16, 20, 16);
        // Arms
        farmerGraphics.fillStyle(0xCD853F);
        farmerGraphics.fillRect(2, 18, 4, 12);
        farmerGraphics.fillRect(26, 18, 4, 12);
        // Work pants
        farmerGraphics.fillStyle(0x8B4513); // Brown work pants
        farmerGraphics.fillRect(8, 32, 16, 16);
        farmerGraphics.generateTexture('npc_farmer', 32, 48);
        farmerGraphics.destroy();

        // Villager NPC
        const villagerGraphics = this.scene.add.graphics();
        // Head
        villagerGraphics.fillStyle(0xDEB887); // Light skin
        villagerGraphics.fillRect(8, 4, 16, 12);
        villagerGraphics.fillStyle(0x2F4F4F); // Dark hair
        villagerGraphics.fillRect(6, 2, 20, 4);
        // Eyes
        villagerGraphics.fillStyle(0x000000);
        villagerGraphics.fillRect(10, 8, 2, 2);
        villagerGraphics.fillRect(20, 8, 2, 2);
        // Casual shirt
        villagerGraphics.fillStyle(0x228B22); // Green shirt
        villagerGraphics.fillRect(6, 16, 20, 16);
        // Arms
        villagerGraphics.fillStyle(0xDEB887);
        villagerGraphics.fillRect(2, 18, 4, 12);
        villagerGraphics.fillRect(26, 18, 4, 12);
        // Casual pants
        villagerGraphics.fillStyle(0x000080); // Navy pants
        villagerGraphics.fillRect(8, 32, 16, 16);
        villagerGraphics.generateTexture('npc_villager', 32, 48);
        villagerGraphics.destroy();

        console.log('🎨 Turkish NPC sprites created (dayı, farmer, villager)');
    }

    /**
     * Create obstacle sprites
     */
    async createObstacles(progressCallback) {
        if (progressCallback) progressCallback(95, 'Creating farm obstacles...');
        await this.delay(300);


        console.log('🎨 Farm obstacle sprites created (tractor)');
    }

    /**
     * Create NPC sprites (48x64) - Turkish characters
     */
    async createNPCs(progressCallback) {
        if (progressCallback) progressCallback(90, 'Creating Turkish NPCs...');
        await this.delay(300);

        // Tea house dayı (older Turkish man)
        const dayiGraphics = this.scene.add.graphics();

        // Head & Hair (grey hair, mustache)
        dayiGraphics.fillStyle(0xD2B48C); // Tan skin
        dayiGraphics.fillRect(16, 8, 16, 14); // Head
        dayiGraphics.fillStyle(0x808080); // Grey hair
        dayiGraphics.fillRect(14, 6, 20, 6); // Hair
        dayiGraphics.fillRect(12, 10, 3, 6); // Side hair left
        dayiGraphics.fillRect(33, 10, 3, 6); // Side hair right

        // Face details
        dayiGraphics.fillStyle(0x000000);
        dayiGraphics.fillRect(19, 12, 2, 2); // Left eye
        dayiGraphics.fillRect(27, 12, 2, 2); // Right eye
        dayiGraphics.fillRect(22, 16, 4, 1); // Nose
        dayiGraphics.fillRect(20, 19, 8, 1); // Mouth

        // Traditional mustache
        dayiGraphics.fillStyle(0x808080);
        dayiGraphics.fillRect(18, 18, 12, 2);

        // Traditional vest and shirt
        dayiGraphics.fillStyle(0xFFFFFF); // White shirt
        dayiGraphics.fillRect(12, 22, 24, 18); // Torso
        dayiGraphics.fillStyle(0x8B4513); // Brown vest
        dayiGraphics.fillRect(14, 24, 20, 14); // Vest
        dayiGraphics.fillStyle(0xFFD700); // Gold buttons
        dayiGraphics.fillRect(23, 26, 2, 2);
        dayiGraphics.fillRect(23, 30, 2, 2);
        dayiGraphics.fillRect(23, 34, 2, 2);

        // Arms
        dayiGraphics.fillStyle(0xFFFFFF);
        dayiGraphics.fillRect(6, 24, 6, 14); // Left arm
        dayiGraphics.fillRect(36, 24, 6, 14); // Right arm
        dayiGraphics.fillStyle(0xD2B48C); // Hands
        dayiGraphics.fillRect(6, 34, 6, 6); // Left hand
        dayiGraphics.fillRect(36, 34, 6, 6); // Right hand

        // Dark pants
        dayiGraphics.fillStyle(0x2F2F2F);
        dayiGraphics.fillRect(14, 40, 20, 18); // Legs

        // Black shoes
        dayiGraphics.fillStyle(0x000000);
        dayiGraphics.fillRect(12, 54, 10, 6); // Left shoe
        dayiGraphics.fillRect(26, 54, 10, 6); // Right shoe

        dayiGraphics.generateTexture('npc_tea_house_dayi', 48, 64);
        dayiGraphics.destroy();

        // Farmer (working clothes)
        const farmerGraphics = this.scene.add.graphics();

        // Head & Hair (brown hair, weathered)
        farmerGraphics.fillStyle(0xC19A6B); // Weathered skin
        farmerGraphics.fillRect(16, 8, 16, 14); // Head
        farmerGraphics.fillStyle(0x5D4037); // Brown hair
        farmerGraphics.fillRect(14, 6, 20, 6); // Hair

        // Face details
        farmerGraphics.fillStyle(0x000000);
        farmerGraphics.fillRect(19, 12, 2, 2); // Left eye
        farmerGraphics.fillRect(27, 12, 2, 2); // Right eye
        farmerGraphics.fillRect(22, 16, 4, 1); // Nose
        farmerGraphics.fillRect(20, 19, 8, 1); // Mouth

        // Work clothes
        farmerGraphics.fillStyle(0x4CAF50); // Green work shirt
        farmerGraphics.fillRect(12, 22, 24, 18); // Torso
        farmerGraphics.fillStyle(0x2E7D32); // Darker green details
        farmerGraphics.fillRect(12, 22, 24, 2); // Collar

        // Arms
        farmerGraphics.fillStyle(0x4CAF50);
        farmerGraphics.fillRect(6, 24, 6, 14); // Left arm
        farmerGraphics.fillRect(36, 24, 6, 14); // Right arm
        farmerGraphics.fillStyle(0xC19A6B); // Hands
        farmerGraphics.fillRect(6, 34, 6, 6); // Left hand
        farmerGraphics.fillRect(36, 34, 6, 6); // Right hand

        // Work pants
        farmerGraphics.fillStyle(0x795548);
        farmerGraphics.fillRect(14, 40, 20, 18); // Legs

        // Work boots
        farmerGraphics.fillStyle(0x3E2723);
        farmerGraphics.fillRect(12, 54, 10, 6); // Left boot
        farmerGraphics.fillRect(26, 54, 10, 6); // Right boot

        farmerGraphics.generateTexture('npc_farmer', 48, 64);
        farmerGraphics.destroy();

        // Villager (casual clothes)
        const villagerGraphics = this.scene.add.graphics();

        // Head & Hair (black hair, younger)
        villagerGraphics.fillStyle(0xD2B48C); // Normal skin
        villagerGraphics.fillRect(16, 8, 16, 14); // Head
        villagerGraphics.fillStyle(0x2C1810); // Black hair
        villagerGraphics.fillRect(14, 6, 20, 6); // Hair

        // Face details
        villagerGraphics.fillStyle(0x000000);
        villagerGraphics.fillRect(19, 12, 2, 2); // Left eye
        villagerGraphics.fillRect(27, 12, 2, 2); // Right eye
        villagerGraphics.fillRect(22, 16, 4, 1); // Nose
        villagerGraphics.fillRect(20, 19, 8, 1); // Mouth

        // Casual shirt
        villagerGraphics.fillStyle(0x2196F3); // Blue shirt
        villagerGraphics.fillRect(12, 22, 24, 18); // Torso

        // Arms
        villagerGraphics.fillStyle(0x2196F3);
        villagerGraphics.fillRect(6, 24, 6, 14); // Left arm
        villagerGraphics.fillRect(36, 24, 6, 14); // Right arm
        villagerGraphics.fillStyle(0xD2B48C); // Hands
        villagerGraphics.fillRect(6, 34, 6, 6); // Left hand
        villagerGraphics.fillRect(36, 34, 6, 6); // Right hand

        // Casual pants
        villagerGraphics.fillStyle(0x424242);
        villagerGraphics.fillRect(14, 40, 20, 18); // Legs

        // Casual shoes
        villagerGraphics.fillStyle(0x5D4037);
        villagerGraphics.fillRect(12, 54, 10, 6); // Left shoe
        villagerGraphics.fillRect(26, 54, 10, 6); // Right shoe

        villagerGraphics.generateTexture('npc_villager', 48, 64);
        villagerGraphics.destroy();

        console.log('🎨 Turkish NPC characters created (dayı, farmer, villager)');
    }

    /**
     * Create obstacle sprites - Animals and farm equipment
     */
    async createObstacles(progressCallback) {
        if (progressCallback) progressCallback(95, 'Creating farm obstacles...');
        await this.delay(300);
    

        // Tractor (64x48) - Green farm tractor
        const tractorGraphics = this.scene.add.graphics();

        // Tractor body (green)
        tractorGraphics.fillStyle(0x4CAF50); // Green body
        tractorGraphics.fillRect(8, 16, 48, 20); // Main body

        // Tractor cab
        tractorGraphics.fillStyle(0x2E7D32); // Darker green cab
        tractorGraphics.fillRect(32, 8, 24, 16); // Cab

        // Windows
        tractorGraphics.fillStyle(0x87CEEB); // Light blue windows
        tractorGraphics.fillRect(34, 10, 8, 6); // Front window
        tractorGraphics.fillRect(46, 10, 8, 6); // Side window

        // Engine/hood
        tractorGraphics.fillStyle(0x1B5E20); // Very dark green
        tractorGraphics.fillRect(8, 18, 16, 12); // Engine compartment

        // Exhaust pipe
        tractorGraphics.fillStyle(0x424242); // Dark grey
        tractorGraphics.fillRect(20, 8, 3, 12); // Exhaust pipe

        // Wheels (large back, small front)
        tractorGraphics.fillStyle(0x2C2C2C); // Dark grey tires
        tractorGraphics.fillCircle(16, 40, 8); // Front wheel
        tractorGraphics.fillCircle(48, 42, 12); // Back wheel (larger)

        // Wheel rims
        tractorGraphics.fillStyle(0x757575); // Light grey rims
        tractorGraphics.fillCircle(16, 40, 4); // Front rim
        tractorGraphics.fillCircle(48, 42, 6); // Back rim

        tractorGraphics.generateTexture('tractor', 64, 48);
        tractorGraphics.destroy();

        console.log('🎨 Farm obstacles created (tractor)');
    }

    /**
     * Create a signboard with text
     */
    createSignboard(text, textureKey) {
        const graphics = this.scene.add.graphics();

        // Wooden post
        graphics.fillStyle(0x5D4037); // Brown wood
        graphics.fillRect(30, 20, 4, 40); // Post

        // Sign board (Turkish style)
        graphics.fillStyle(0x8BC34A); // Green background
        graphics.fillRect(8, 15, 48, 20);
        graphics.fillStyle(0xFFFFFF); // White border
        graphics.strokeRect(10, 17, 44, 16);

        // Create text effect (simplified)
        graphics.fillStyle(0x000000); // Black text
        const textWidth = Math.min(text.length * 3, 40);
        graphics.fillRect(12 + (40 - textWidth) / 2, 20, textWidth, 2);
        graphics.fillRect(12 + (40 - textWidth) / 2, 24, textWidth, 2);
        graphics.fillRect(12 + (40 - textWidth) / 2, 28, textWidth, 2);

        graphics.generateTexture(textureKey, 64, 60);
        graphics.destroy();
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other scripts
window.AssetCreator = AssetCreator;
