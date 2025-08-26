Game Fix Task – Collectibles, NPC Placement, Animals, Dog, and Backgrounds

1. Collectibles
   - Collectibles (beer, cigarette packs, etc.) are still falling from above.
   - Fix so that collectibles stay fixed in place (either floating slightly or resting on the ground).
   - Disable gravity on collectibles completely; they should not move until collected.

2. NPCs (Dayılar)
   - Too many dayılar are currently spawned, all standing on the road.
   - Adjust placement:
     - One dayı should be in a truck.
     - Two dayılar should be sitting at a coffeehouse (kahvehane).
     - Reduce the number of random dayılar on the road.

3. Sheep and Animals
   - Sheep still fall below the screen at game start.
   - Fix sheep spawn positions so they stay on the ground with proper physics.
   - Ensure all animals spawn aligned with the ground.

4. Dog Positioning
   - The dog is not on the same ground level as Bilal (the main character).
   - Fix dog positioning so both Bilal and the dog share the exact same ground Y-level.

5. Background by Zone
   - Currently only the sea background is visible.
   - Implement correct backgrounds per zone:
     - **Kuşadası Start:** Coastal scenery (sea, beaches, palm trees)
     - **Mid-Segment:** Olive groves, small village roads, fig orchards
     - **Söke Arrival:** Cotton fields and farmland
   - Background should transition when entering a new zone (not stay the same everywhere).

6. Ground & Underwater Area
   - At the bottom of the screen, there is visible sea under the ground.
   - Remove the underwater sea layer beneath the ground.
   - Replace with proper solid ground only (no sea below the level floor).

Goal: After these fixes, collectibles stay in place, NPCs are fewer and context-placed, sheep stay on ground, the dog aligns with Bilal, backgrounds change correctly per zone, and the sea under the ground is removed.
