Technical Requirements (Updated)
Project Name: Bilal & Köpüş: Mission Asena

Platform & Engine

Engine: Phaser 3 (JavaScript-based 2D HTML5 game framework)

Provides built-in physics, sprite management, scene system, and animation support.

Platform: Web browser (desktop & mobile compatible)

Rendering: Canvas/WebGL (auto selection)

Physics: Arcade Physics (built-in)

Deployment

Hosting via GitHub Pages, Netlify, or Vercel (static HTML/JS/CSS files).

Must run directly in a browser without any installations.

Core Technical Features

Single Continuous Map:

One long horizontal scrolling map with smooth parallax scrolling.

District transitions marked by signboards and changes in scenery.

Character Control:

Move Right: D key

Move Left (optional): A key

Jump: W key

Companion dog (Köpüş) automatically follows the player, performing simple AI actions.

Mobile touch buttons optional for movement and jump.

Obstacles & Collisions:

Physics-based collisions for platforms, enemies, and collectibles.

Separate collision layers for character, dog, and environment.

Parallax Backgrounds:

Multi-layer backgrounds for depth effect: distant mountains, orchards, fences, etc.

Asset Loading & Organization:

Recommended folder structure:

assets/characters/ → Bilal, Köpüş

assets/backgrounds/ → Parallax layers

assets/ui/ → UI elements, signs

Audio:

Background music and sound effects (dog bark, chicken cluck, train).

Frame Rate / Canvas:

Resolution example: 1280x720 (16:9)

Target frame rate: 60 FPS

Assets:

Can be sourced from free online repositories:

OpenGameArt.org

itch.io Free Assets

Kenney.nl

Lospec Pixel Art Assets

Alternatively, AI-generated assets can be used for characters, dog, and backgrounds.