import { gameState } from "./gameState.js";
import { k } from "./loader.js";

/**
 *  Animation utilities and global animation container.
 */

export let world = null;    // Global container for animated game objects.

/**
 * Creates (if needed) and returns the global world container.
 * 
 * The world object is responsible for pausing and resuming
 * all its child animations based on the current game state.
 * 
 * @returns {GameObject}
 */
export function createWorld() {
    if (!world) {
        world = k.add([
            k.timer(),
        ]);

        // Update to sync animation pause state with the game state
        k.onUpdate(() => {
            if (!world) return;
            // Pause all animations attached to the world when the game is paused
            world.paused = gameState.isGamePaused;
        });
    }
    return world;
}

export function resetWorld() {
    world = null;
}