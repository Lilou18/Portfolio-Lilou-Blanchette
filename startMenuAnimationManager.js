export class StartMenuAnimationManager {
    constructor() {
        let intervalId;

        // Automatically start the menu energy bar animation
        progressBarAnimation();
    }


    /**
     * Starts the looping animation of the energy bar in the start menu.
     */
    progressBarAnimation() {
        const energyBar = document.getElementById("energyBar");
        let width = 1;
        let barDirection = 1;
        intervalId = setInterval(() => {
            width += barDirection;
            energyBar.style.width = width + "%";

            // Reverse direction when reaching bounds
            if (width >= 100 || width <= 0) {
                barDirection *= -1;
            }
        }, 20);
    }

    /**
     * Stops the energy bar animation when leaving the start menu
     */
    stopProgressBarAnimation() {
        clearInterval(intervalId);
    }
}