import { gameState } from "./gameState.js";

export function pauseAnimation(gameObject){
    let wasPaused = false;
    let originalAnimationSpeed = gameObject.animSpeed;

    gameObject.onUpdate(() => {
            if (!gameObject.destroyed) {

                // If the game is paused
                // we stop the animation
                if (gameState.isGamePaused) {
                    if (!wasPaused) {    
                        gameObject.animSpeed = 0;                    
                        wasPaused = true;
                    }
                    return;
                }

                // If the game is resumed
                // the animation is resumed
                if (wasPaused) {
                    gameObject.animSpeed = originalAnimationSpeed;                  
                    wasPaused = false;
                }                
            }
        });
}