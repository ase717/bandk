# Design Document

## Overview

Segment 1 implements a horizontal side-scrolling platformer using Phaser 3, featuring Bilal and his companion dog Köpüş traveling from Kuşadası to Söke. The design emphasizes smooth character movement, intelligent companion AI, immersive parallax environments, and interactive gameplay elements. The segment serves as the foundation for the complete game, establishing core systems that will be extended to subsequent segments.

## Architecture

### Game Engine Structure
- **Framework**: Phaser 3 with Arcade Physics
- **Scene Management**: Single continuous scene with camera following
- **Resolution**: 1280x720 (16:9 aspect ratio)
- **Target Performance**: 60 FPS on desktop, 30+ FPS on mobile

### Tilemap & Level Structure
- **Map Editor**: Tiled or similar map editor for level design
- **Segment 1 Map Size**: 6000px width × 720px height (continuous horizontal layout, ~5 minutes gameplay)
- **Map Format**: JSON export from Tiled with separate layers for:
  - Background decoration layer
  - Platform/collision layer
  - Object layer for collectibles, spawn points, and checkpoints
  - NPC interaction zones
- **Tile Size**: 32x32px standard tile size for consistent scaling
- **Layer Organization**: 
  - Collision layer for physics boundaries
  - Decoration layer for visual elements
  - Object layer for interactive elements

### Core Systems
1. **Player Controller**: Handles Bilal's movement, animation, and input
2. **Companion AI**: Manages Köpüş following behavior and interactions
3. **Environment Manager**: Controls parallax scrolling and background transitions
4. **Collectible System**: Manages item pickup and dialogue display
5. **Checkpoint System**: Handles progress saving and respawn points
6. **Audio Manager**: Controls background music and sound effects

## Components and Interfaces

### Player Character (Bilal)
```javascript
class Player extends Phaser.Physics.Arcade.Sprite {
  // Properties
  - movementSpeed: 200px/s
  - jumpVelocity: -400px/s
  - animations: idle, running, jumping
  - currentState: idle/running/jumping/falling
  
  // Methods
  - handleInput()
  - updateAnimation()
  - checkCollisions()
}
```

### Input Mapping Table
- **Desktop Controls**:
  - Move Left: A key
  - Move Right: D key
  - Jump: W key
  - Interact/Pickup: E key
- **Mobile Controls**:
  - On-screen directional buttons for left/right movement
  - Jump button (positioned for thumb access)
  - Interact button (appears when near collectibles)
  - Touch gesture support for basic movement

### Companion Dog (Köpüş)
```javascript
class CompanionDog extends Phaser.Physics.Arcade.Sprite {
  // Properties
  - followDistance: 80px behind player
  - catchUpSpeed: 250px/s
  - normalSpeed: 180px/s
  - interactionRadius: 60px
  
  // Methods
  - followPlayer()
  - handleChickenInteraction()
  - updateAI()
}
```

### Environment System
```javascript
class EnvironmentManager {
  // Parallax Layers
  - backgroundLayer: 0.2x scroll speed (mountains, sky)
  - middleLayer: 0.5x scroll speed (olive trees, buildings)
  - foregroundLayer: 1.0x scroll speed (fences, signs, platforms)
  
  // Environment Zones (adjusted for 5-minute gameplay)
  - kusadasiZone: 0-2000px (coastal scenery, beaches, palm trees)
  - transitionZone: 2000-4000px (olive groves, villages, rural roads)
  - sokeZone: 4000-6000px (cotton fields, farmland, approaching Söke)
}
```

### Collectible System
```javascript
class Collectible extends Phaser.Physics.Arcade.Sprite {
  // Types
  - beerCan: "Ah Tuborg, en sevdiği!"
  - cigarettePack: "Maarlboro, hem de touch blue!"
  - pizzaSlice: "Asena daha güzelini yapıyor ama neyse.."
  
  // Properties
  - interactionRadius: 40px
  - dialogueDuration: 3000ms
  - collectSound: pickup.mp3
}
```

## Data Models

### Game State
```javascript
gameState = {
  player: {
    x: number,
    y: number,
    health: number,
    collectedItems: array
  },
  companion: {
    x: number,
    y: number,
    currentBehavior: string
  },
  environment: {
    currentZone: string,
    scrollPosition: number
  },
  checkpoints: {
    midSegment: boolean,
    preSoke: boolean
  }
}
```

### Asset Format & Size Standards
- **Sprite Format**: PNG with transparent background (WebP optional for optimization)
- **Character Sprite Dimensions**: 
  - Bilal: 64x64px consistent frame size
  - Köpüş: 32x32px consistent frame size
- **Pivot/Anchor Points**: Uniform anchor points for animation alignment (center-bottom for characters)
- **Background Layers**: Optimized for 1280x720 resolution with parallax scaling considerations
- **Tilemap Assets**: 32x32px tile size for consistent scaling with character sprites
- **Audio Format**: MP3 or OGG for cross-browser compatibility
- **Optimization**: All assets web-optimized for fast loading

### Asset Configuration
```javascript
assetConfig = {
  characters: {
    bilal: {
      spriteSheet: 'assets/characters/bilal_sheet.png',
      frameSize: { width: 64, height: 64 },
      anchorPoint: { x: 0.5, y: 1.0 }, // center-bottom
      animations: {
        idle: { frames: [0, 1], frameRate: 2 },
        running: { frames: [2, 3, 4, 5, 6, 7], frameRate: 8 },
        jumping: { frames: [8, 9], frameRate: 4 }
      }
    },
    kopus: {
      spriteSheet: 'assets/characters/kopus_sheet.png',
      frameSize: { width: 32, height: 32 },
      anchorPoint: { x: 0.5, y: 1.0 }, // center-bottom
      animations: {
        idle: { frames: [0, 1], frameRate: 2 },
        running: { frames: [2, 3, 4, 5], frameRate: 6 },
        barking: { frames: [6, 7], frameRate: 4 }
      }
    }
  },
  backgrounds: {
    kusadasi: {
      layers: [
        'assets/backgrounds/kusadasi_sky.png',
        'assets/backgrounds/kusadasi_sea.png',
        'assets/backgrounds/kusadasi_coast.png'
      ]
    },
    transition: {
      layers: [
        'assets/backgrounds/inland_sky.png',
        'assets/backgrounds/olive_groves.png',
        'assets/backgrounds/village_road.png'
      ]
    },
    soke: {
      layers: [
        'assets/backgrounds/farmland_sky.png',
        'assets/backgrounds/cotton_fields.png',
        'assets/backgrounds/farm_foreground.png'
      ]
    }
  },
  audio: {
    backgroundMusic: 'assets/audio/aegean_melody.mp3',
    soundEffects: {
      jump: 'assets/audio/jump.mp3',
      pickup: 'assets/audio/pickup.mp3',
      dogBark: 'assets/audio/dog_bark.mp3',
      chickenCluck: 'assets/audio/chicken_cluck.mp3'
    }
  }
}
```

## Error Handling

### Asset Loading Failures
- Implement fallback placeholder sprites for missing character assets
- Display loading progress indicator during asset preload
- Graceful degradation for missing audio files (continue without sound)
- Error logging for debugging asset path issues

### Physics Edge Cases
- Prevent player from falling through world boundaries
- Handle companion dog getting stuck behind obstacles
- Implement safety teleportation if companion falls too far behind
- Collision boundary validation to prevent sprite overlap issues

### Performance Optimization
- Implement object pooling for collectibles and effects
- Cull off-screen sprites to reduce rendering load
- Optimize parallax layer updates based on scroll speed
- Memory management for audio assets (preload/unload as needed)

### Input Handling
- Debounce rapid key presses to prevent animation glitches
- Handle simultaneous key combinations (e.g., jump while running)
- Mobile touch input validation and gesture recognition
- Fallback controls if primary input methods fail

## Testing Strategy

### Unit Testing
- **Player Movement**: Test all movement states and transitions
- **Companion AI**: Verify following behavior and interaction logic
- **Collectible System**: Test pickup detection and dialogue triggering
- **Physics**: Validate collision detection and gravity application
- **Audio**: Confirm sound effect triggering and volume levels

### Integration Testing
- **Scene Transitions**: Test smooth environment zone changes
- **Checkpoint System**: Verify save/load functionality
- **Parallax Scrolling**: Test layer synchronization and performance
- **Cross-Platform**: Validate desktop and mobile compatibility
- **Asset Loading**: Test complete asset pipeline and error handling

### Performance Testing
- **Frame Rate**: Monitor FPS across different devices and browsers
- **Memory Usage**: Track memory consumption during extended gameplay
- **Asset Loading**: Measure load times and optimize bottlenecks
- **Mobile Performance**: Test touch controls and rendering on mobile devices

### User Experience Testing
- **Control Responsiveness**: Verify input lag and character response
- **Visual Clarity**: Test sprite visibility and animation smoothness
- **Audio Balance**: Ensure sound effects don't overpower music
- **Progression Flow**: Validate checkpoint placement and segment pacing

### Automated Testing Framework
```javascript
// Example test structure
describe('Segment 1 Core Systems', () => {
  test('Player movement responds to input', () => {
    // Test player movement mechanics
  });
  
  test('Companion follows player correctly', () => {
    // Test companion AI behavior
  });
  
  test('Collectibles trigger dialogue', () => {
    // Test interaction system
  });
  
  test('Parallax scrolling maintains performance', () => {
    // Test rendering performance
  });
});
```

This design provides a solid foundation for implementing Segment 1 while ensuring scalability for future segments and maintaining the asset standards you specified.