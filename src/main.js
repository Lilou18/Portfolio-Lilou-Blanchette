import { k } from "./loader.js";
import { level } from "./level.js";
import { Player } from "./player.js";
import { gameState } from "./gameState.js";
import { Camera } from "./camera.js";
import { GameManager } from "./gameManager.js";
import { uiManager } from "./uiManager.js";
import { soundManager } from "./soundManager.js";
import { windowManager } from "./windowManager.js";
import { stopProgressBarAnimation } from "./animationManager.js";

// Callback function that windowManager calls if we switched from portrait mode to landscape mode
// and we are yet to go into the intro scene.
windowManager.setOrientationChangeCallback(() => {
    // If the game is not started and we are in landscape mode
    if (!gameState.gameStarted) {
        k.go("intro");  // We can start the intro scene
    }
});

/**
 * Initialize the intro/start menu scene.
 */
k.scene("intro", () => {
    gameState.isInIntroScene = true;
    const startButton = document.getElementById("start-button");
    const startMenu = document.getElementById("start-menu");
    if (startButton && startMenu) {
        startMenu.style.display = "flex";
        startButton.addEventListener("click", () => startGame(startMenu), { once: true });
    }
});

/**
 * Start the game when button is pressed.
 * 
 * @param {HTMLElement} startMenu The start menu
 * @returns 
 */
function startGame(startMenu) {
    if (gameState.gameStarted) {
        return;
    }

    gameState.gameStarted = true;
    startMenu.style.display = "none";


    try {
        stopProgressBarAnimation();
    } catch (error) {
        console.error("Error stopping progress bar:", error);
    }

    k.go("level");
    soundManager.playBackgroundMusic();
}

k.scene("level", async () => {
    const levelInstance = level(k);

    // Create the player
    const player = new Player(k, 0, 0, 400, 670);
    gameState.player = player;
    levelInstance.setPlayer(player);

    // Create the camera tha follows the player
    const camera = new Camera(player.gameObject, levelInstance);

    const gameManager = new GameManager(k, levelInstance);

    // Initialise the UI
    uiManager.setLevelControl(levelInstance);
    uiManager.onGameplayStart();

    // Start background music
    soundManager.addSoundSettingsBtn();

    // When the canvas resizes, we update the scale and position of the gameObjects.
    k.onResize(() => {
        k.wait(0.01, () => {
            levelInstance.layoutLevel();
            gameManager.onResize();
            uiManager.updateInteractionTextsOnResize();
        });

    });

});

/**
 * Once everything is loaded in Kaplay we start the game.
 */
k.onLoad(() => {
    if (!gameState.isGamePaused) {
        k.go("intro");
    }
});

