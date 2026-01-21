import { gameState } from "./gameState.js";
import { world } from "./animationManager.js";

export class GroundEnemy {
    /**
     * Create an enemy that walks across the ground from right to left.
     * There is 3 different type of enemy possible.
     */

    /**
     * 
     * @param {Object} k Kaplay game instance
     * @param {number} x Initial x position in world coordinates
     * @param {number} y Initial y position in world coordinates
     */
    constructor(k, x, y) {
        this.k = k;

        // Original spawn position (used as reference for scaling calculations)
        this.originalX = x;
        this.originalY = y;

         // Distance traveled from spawn position
        this.distanceTraveled = 0;

        // State tracking
        this.destroyed = false;

        // Enemy difficulty tiers with speed and visual properties
        const enemyTypes = [
            { speed: 220, color: [255, 255, 0], name: "normal" }, // Normal - Yellow 250
            { speed: 290, color: [255, 165, 0], name: "fast" },   // Fast - Orange 350
            { speed: 560, color: [255, 0, 0], name: "veryFast" } // Very fast - Red 500
        ];

        // Sprite names for each enemy type
        const enemySprites = {
            normal: "enemyNormal",
            fast: "enemyFast",
            veryFast: "enemyVeryFast",
        };

        // Randomly select an enemy type
        this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        this.speed = this.enemyType.speed;

        // Create the game object in the world
        this.gameObject = world.add([
            k.sprite(enemySprites[this.enemyType.name], { anim: "walk" }),
            area({
                // shape: new Rect(vec2(0, 0), 90, 100),
                // shape: new k.Polygon([k.vec2(-45, 0), k.vec2(-45, -100), k.vec2(45, -100), k.vec2(45, 0)]),
                // Custom polygon shape for accurate collision detection
                // Matches the enemy sprite visual bounds
                shape: new k.Polygon([k.vec2(-45, 0), k.vec2(-45, -100), k.vec2(0, -100), k.vec2(45, -30), k.vec2(45, 0)]),
                isSensor: true,
            }),
            k.anchor("bot"),
            k.scale(1),
            k.z(1),
            k.pos(x, y),
            k.offscreen({ hide: true}),     // Auto-hide when off-screen for performance
            "enemy"                         // Tag for collision detection
        ]);

        // Tracking for scale and offset
        this.lastScaleX = 1;
        this.lastScaleY = 1;
        this.lastMapOffsetY = 0;

        this.update();
    }

    /**
     * The enemy walk from right to left at a constant speed.
     */
    update() {
        this.gameObject.onUpdate(() => {
            if (this.destroyed || !this.gameObject) return;

            // Adjust movement speed based on current map horizontal scaling
            const scaledSpeed = this.speed * this.lastScaleX;
            // Calculate the distance to move this frame (based on delta time)
            const movement = scaledSpeed * this.k.dt();
            // Track the total distance traveled (used for offset calculations during resize)
            this.distanceTraveled += movement;
            // Move the enemy to the left
            this.gameObject.move(- scaledSpeed, 0)
        });
    }

    /**
     * Update enemy position and scale when the map is resized or scaled.
     * 
     * @param {number} scaleX Horizontal scale factor of the map
     * @param {number} scaleY Vertical scale factor of the map
     * @param {number} mapOffsetY Vertical offset of the map
     */
    updateScale(scaleX, scaleY, mapOffsetY) {
        if (!this.destroyed && this.gameObject) {
            
            // Convert current world position back to map coordinates
            // This accounts for the previous scaling to get the actual position on the map
            const currentMapX = this.lastScaleX ? (this.gameObject.pos.x / this.lastScaleX) : this.originalX;
            const currentMapY = this.lastScaleY ? ((this.gameObject.pos.y - this.lastMapOffsetY) / this.lastScaleY) : this.originalY;

            // Apply the new scale to map coordinates to get world position
            const scaledX = currentMapX * scaleX;
            const scaledY = mapOffsetY + (currentMapY * scaleY);

            // Update the gameObject position with the new scaling position
            this.gameObject.pos.x = scaledX;
            this.gameObject.pos.y = scaledY;

            // Scale the sprite proportionally with the map
            this.gameObject.scale = this.k.vec2(1 * scaleX, 1 * scaleY);

            // Update the distance traveled to stay synchronized with the position changes
            this.distanceTraveled = this.originalX - currentMapX;

            // Store current scale values for next update
            this.lastScaleX = scaleX;
            this.lastScaleY = scaleY;
            this.lastMapOffsetY = mapOffsetY;
        }
    }


    /**
     * Destroy the enemy when hit by the player
     */
    destroy() {
        if (!this.destroyed) {
            this.destroyed = true;

            // Disable collision to prevent double-damage
            if (this.gameObject.area) {
                this.gameObject.area.enabled = false;
            }

            // Shrink effect
            this.k.tween(
                this.gameObject.scale,
                this.k.vec2(0),
                0.2,
                (val) => { this.gameObject.scale = val },
                this.k.easings.easeOutBack
            ).then(() => {
                // After the animation completes, destroy the object
                this.gameObject.destroy();
            });
        }
    }
}