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
            // Pause all animations attached to the world when the game is paused
            world.paused = gameState.isGamePaused;
        });
    }
    return world;
}


// let intervalId;
// /**
//  * Starts the looping animation of the energy bar in the start menu.
//  */
// function progressBarAnimation() {
//     const energyBar = document.getElementById("energyBar");
//     let width = 1;
//     let barDirection = 1;
//     intervalId = setInterval(() => {
//         width += barDirection;
//         energyBar.style.width = width + "%";

//         // Reverse direction when reaching bounds
//         if (width >= 100 || width <= 0) {
//             barDirection *= -1;
//         }
//     }, 20);




// }

// /**
//  * Stops the energy bar animation when leaving the start menu
//  */
// export function stopProgressBarAnimation() {
//     clearInterval(intervalId);
// }


// // Automatically start the menu energy bar animation
// progressBarAnimation();