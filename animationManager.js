import { gameState } from "./gameState.js";

export function pauseAnimation(gameObject) {
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

let intervalId;
// Animation of the energy bar in start menu
function progressBarAnimation() {
    const energyBar = document.getElementById("energyBar");
    let width = 1;
    let barDirection = 1;
    intervalId = setInterval(() => {
        width += barDirection;
        energyBar.style.width = width + "%";

        if(width >= 100 || width <= 0){
            barDirection *= -1;
        }
    }, 20);




}

export function stopProgressBarAnimation() {
    clearInterval(intervalId);
}
progressBarAnimation();