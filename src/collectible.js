import { world } from "./animationManager.js";
import { soundManager } from "./soundManager.js";

export class Collectible {
    /**
     * Item (hot chocolate mug) the player can collect in the game to augment his energy/score.
     * It appears randomly in the level.
     * 
     * The collectible:
     * - Spawns using relative level ratios
     * - Scales with the level
     * - Animates to float vertically
     */

    /**
     * 
     * @param {Object} k            Kaplay game instance
     * @param {object} levelData    Current level dimensions and scale information 
     * @param {number} spawnXRatio  Horizontal position relative to level width (0–1)
     * @param {number} spawnYRatio  Vertical position relative to level height (0–1)
     */
    constructor(k, levelData, spawnXRatio, spawnYRatio) {
        this.k = k;
        this.levelData = levelData;

        // Relative spawn position (used for resize)
        this.spawnXRatio = spawnXRatio;
        this.spawnYRatio = spawnYRatio;

        // Base world position derived from ratios
        this.baseX = spawnXRatio * levelData.width;
        this.baseY = spawnYRatio * levelData.height;

        this.baseScale = 0.6;

        // Tracks whether the collectible has been picked up
        this.destroyed = false;

        // Create the game object in the world
        this.gameObject = world.add([
            k.sprite("collectible", { anim: "mug" }),
            k.area({  // Enables collision detection
                isSensor: true,
                collisionIgnore: ["enemy", "floor", "collectible", "citySign", "hologramCV", "hologramPortfolio", "hologramContact"],
            }),                       
            k.anchor("center"),
            k.scale(this.baseScale * this.levelData.scaleX * this.levelData.spriteScaleRatio,
                this.baseScale * this.levelData.scaleY * this.levelData.spriteScaleRatio),
            k.pos(this.baseX, this.baseY),
            k.z(1),
            k.offscreen({ hide: true }),                      // Auto-hide when off-screen
            "collectible"                                     // Tag for collision detection
        ]);

        // Start the mug animation
        this.gameObject.play("mug");
        this.update();
    }

    /**
    * Updates the collectible position and scale when the level is resized.
    * 
    * @param {object} levelData Current level dimensions and scale information
    */
    updateScale(levelData) {
        if (!this.destroyed && this.gameObject) {

            // Replace internal reference with updated level data
            this.levelData = levelData;

            // Recompute the scaled position
            this.baseX = this.spawnXRatio * levelData.width;
            this.baseY = this.spawnYRatio * levelData.height;

            this.gameObject.pos = this.k.vec2(this.baseX, this.baseY);

            // Recalculate the scale using spriteScaleRatio for visual consistency across sprite sets
            this.gameObject.scale = this.k.vec2(
                this.baseScale * this.levelData.scaleX * this.levelData.spriteScaleRatio,
                this.baseScale * this.levelData.scaleY * this.levelData.spriteScaleRatio
            );
        }
    }

    /**
     * Handles the vertical floating animation of the mug.
     */
    update() {

        this.gameObject.onUpdate(() => {
            if (this.destroyed || !this.gameObject) return;

            // Only animate if visible
            if (!this.gameObject.hidden) {

                // Creates a continuous sinusoidal up-and-down motion
                // - cos(t) oscillates between 1 and -1
                // - (1 - cos(t)) / 2 remaps it to [0 , 1]
                // - Result: movement only down from baseY
                const floatAmplitude = 20 * this.levelData.scaleY;
                const floatSpeed = 3;
                const offsetY = floatAmplitude * (1 - Math.cos(this.k.time() * floatSpeed)) / 2;

                this.gameObject.pos = this.k.vec2(this.gameObject.pos.x, this.baseY + offsetY);
            }
        });
    }

    /**
     * Handle collectible pickup by the player.
     * Destroy the gameObject.
     */
    collect() {
        if (!this.destroyed) {
            this.destroyed = true;
            // Disable collision to prevent double-collection
            if (this.gameObject.area) {
                this.gameObject.area.enabled = false;
            }
            soundManager.playSound("collectibleSFX");

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