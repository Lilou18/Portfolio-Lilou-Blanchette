import { gameState } from "./gameState.js";
import { world } from "./animationManager.js";
// import { soundManager } from "../soundManager.js";

export class Collectible {
    /**
     * Item (hot chocolate mug) the player can collect in the game to augment his energy/score.
     * It appears randomly in the map.
     */

    /**
     * 
     * @param {Object} k Kaplay game instance
     * @param {number} x Initial x position in world coordinates
     * @param {number} y Initial y position in world coordinates
     */
    constructor(k, x, y) {
        this.k = k;
        // Original spawn position (used as reference for scaling)
        this.originalX = x;
        this.originalY = y;
        // this.originalScale = 0.2;
        this.originalScale = 0.6;
        this.scaledY = y;

        // State tracking
        this.destroyed = false;

        // Animation properties
        this.animationTime = 0;                                 // Elapsed time for floating animation
        this.variationMovement = Math.random() * Math.PI * 2;   // Random between 0 and 2PI

        // Create the game object in the world
        this.gameObject = world.add([
            k.sprite("collectible", { anim: "mug" }),
            k.area({ isSensor: true }),                                           // Enables collision detection
            k.anchor("center"),
            k.scale(this.originalScale),
            k.pos(x, y),
            k.z(1),
            k.offscreen({ hide: true}),
            // k.offscreen({ hidden: true }),                   // Auto-hide when off-screen
            "collectible"                                       // Tag for collision detection
        ]);


        this.lastScaleY = 1;                                    // Tracking for scale

        // Start the mug animation
        this.gameObject.play("mug");
        this.update();

    }

    /**
     * Update collectible position and scale when the map is resized or scaled.
     * 
     * @param {number} scaleX Horizontal scale factor of the map
     * @param {number} scaleY Vertical scale factor of the map
     * @param {number} mapOffsetY Vertical offset of the map
     */
    updateScale(scaleX, scaleY, mapOffsetY) {
        if (!this.destroyed && this.gameObject) {
            // Calculate new position using original position, not current position
            // This prevents animation offsets from accumulating during scaling
            const scaledX = this.originalX * scaleX;
            this.scaledY = mapOffsetY + (this.originalY * scaleY);

            this.gameObject.pos.x = scaledX;
            this.gameObject.pos.y = this.scaledY;

            // Scale the sprite proportionally with the map
            this.gameObject.scale = this.k.vec2(this.originalScale * scaleX, this.originalScale * scaleY);

            // Store scale values to use in the floating animation
            this.lastScaleY = scaleY;
        }
    }

    /**
     * Manage the floating animation for the mug.
     */
    update() {

        this.gameObject.onUpdate(() => {
            if (this.destroyed || !this.gameObject) return;

            // Only animate if visible
            if (!this.gameObject.hidden) {
                // Creates a continuous sinusoidal up-and-down motion
                this.animationTime += this.k.dt();
                const scaledAmplitude = 10 * this.lastScaleY;
                const amount = Math.sin(this.animationTime * 3 + this.variationMovement) * scaledAmplitude;

                // Apply animation offset to scaled Y position
                // this.gameObject.pos.y = this.scaledY + amount;
                this.gameObject.pos = this.k.vec2(this.gameObject.pos.x,  this.scaledY + amount);
            }
        });
    }

    /**
     * Handle collectible pickup by the player.
     */
    collect() {
        if (!this.destroyed) {
            this.destroyed = true;
            // Disable collision to prevent double-collection
            if (this.gameObject.area) {
                this.gameObject.area.enabled = false;
            }
            // soundManager.playSound("collectibleSFX");

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