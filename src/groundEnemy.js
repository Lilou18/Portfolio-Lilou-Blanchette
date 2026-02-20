import { gameState } from "./gameState.js";
import { world } from "./animationManager.js";

export class GroundEnemy {
    /**
     * Create an enemy that walks across the ground from right to left.
     * There is 3 different type of enemy possible.
     * 
     * - Position is stored relatively to the level width
     * - Visual scale and speed adapt to device & level
     */

    /**
     * 
     * @param {object} k            Kaplay game instance
     * @param {object} levelData    Current level and scale data 
     * @param {object} config       Enemy spawn configuration
     */
    constructor(k, levelData, config) {
        this.k = k;
        this.levelData = levelData;

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

        
        // Base (unscaled) gameplay values.
        this.baseSpeed = this.enemyType.speed;
        this.baseScale = 1;
        this.baseOffsetFromFloor = config.offsetFromFloor;
        this.spawnXRatio = config.spawnXRatio;

        // Variable used in runtime
        this.speed = this.baseSpeed;
        this.offsetFromFloor = this.baseOffsetFromFloor;

        /**
        * Relative horizontal position on the level.
        * 
        * Stored as a ratio instead of pixels so that:
        * - resize keeps the enemy at the same logical position
        * - movement can be recalculated on any device
        */
        this.relativeX = this.spawnXRatio;

        /**
         * Relative horizontal spawn position.
         * Example:
        * 0.5  → middle of the level
        * 1.1  → outside the right side (off-screen spawn)
        */
        const spawnX = config.spawnXRatio * this.levelData.width;

        // Create the game object in the world
        this.gameObject = world.add([
            k.sprite(enemySprites[this.enemyType.name], { anim: "walk" }),
            area({
                // Custom polygon shape for accurate collision detection
                // Matches the enemy sprite visual bounds
                shape: new k.Polygon([k.vec2(-45, 0), k.vec2(-45, -100), k.vec2(0, -100), k.vec2(45, -30), k.vec2(45, 0)]),
                isSensor: true,
                collisionIgnore: ["enemy", "borderRight", "floor", "collectible", "citySign", "hologramCV", "hologramPortfolio", "hologramContact"],
            }),
            k.anchor("bot"),
            k.scale(this.baseScale * this.levelData.scaleX * this.levelData.spriteScaleRatio, this.baseScale * this.levelData.scaleY * this.levelData.spriteScaleRatio),
            k.z(1),
            k.pos(spawnX, this.levelData.floorY),
            k.offscreen({ hide: true }),     // Auto-hide when off-screen for performance
            "enemy"                          // Tag for collision detection
        ]);

        
        // Vertical offset relative to the floor.
        // Offset is scaled to keep the enemy grounded visually.
        this.offsetFromFloor = this.baseOffsetFromFloor * this.levelData.scaleY * this.levelData.spriteScaleRatio;
        this.gameObject.pos.y = this.levelData.floorY - this.offsetFromFloor;

        // Convert ratio into absolute position
        this.relativeX = this.gameObject.pos.x / this.levelData.width;

        // Enemy speed
        // scaleX: ensures enemy moves same visual distance on any level width
        // speedMultiplier: global gameplay multiplier, same as player
        this.speed = this.baseSpeed * this.levelData.scaleX * this.levelData.speedMultiplier;

        this.update();
    }

    /**
     * The enemy walk from right to left at a constant speed.
     */
    update() {
        this.gameObject.onUpdate(() => {
            if (this.destroyed || !this.gameObject) return;

            this.gameObject.move(- this.speed, 0)
        });
    }

    /**
    * Update enemy position and scale when the level is resized or scaled.
    * 
    * @param {number} oldWidth      Width of the level before resize
    * @param {object} dataLevel     New level data
    */
    updateScale(oldWidth, dataLevel) {
        if (!this.destroyed && this.gameObject) {
            // Keep same relative position on new level width
            this.relativeX = this.gameObject.pos.x / oldWidth;
            const newX = this.relativeX * dataLevel.width;

            // Update vertical offset and position
            this.offsetFromFloor = this.baseOffsetFromFloor * dataLevel.scaleY;
            const newY = dataLevel.floorY - this.offsetFromFloor;

            this.gameObject.pos = this.k.vec2(newX, newY);


            // Scale sprite to maintain visual proportions
            // - scaleX / scaleY adapt to the level size
            // SpriteScaleRatio ensures consistent sprite proportions across devices
            this.gameObject.scale = this.k.vec2(dataLevel.scaleX * dataLevel.spriteScaleRatio, dataLevel.scaleY * dataLevel.spriteScaleRatio);

            // Adjust speed to maintain visual consistency
            this.speed = this.baseSpeed * dataLevel.speedMultiplier * dataLevel.scaleX;
        }
    }

    /**
     * Destroy the enemy
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