import { k } from "./loader.js"
import { level } from "./level.js"
import { Player } from "./entities/player.js";
import { Camera } from "./Camera.js";
import { gameState } from "./gameState.js";
import { uiManager } from "./uiManager.js";
import { orientationManager } from "./orientationManager.js";
import { stopProgressBarAnimation } from "./animationManager.js";

function checkOrientation() {
    const overlay = document.getElementById("overlay");
    const isPortrait = orientationManager.isPortrait;
    const isMobile = orientationManager.isMobile;

    if (isPortrait && isMobile) {

        overlay.style.display = "flex";
        if (gameState.gameStarted) {
            gameState.addPauseFlag("portraitMode");
        }
    } else {

        if (!gameState.gameStarted) {
            k.go("intro");
            console.log("Hello");
            // k.go("level");
            // k.play("backgroundMusic", {
            //     volume: 0.5,
            //     loop: true,
            // });
            // gameStarted = true;
        } else {
            gameState.removePauseFlag("portraitMode");
        }

        overlay.style.display = "none";
    }


}

k.scene("level", async () => {

    const canvas = document.getElementById("gameCanvas");
    if (canvas) {
        canvas.focus();
    }

    const mobileControls = document.getElementById("mobileControls");
    if (mobileControls && orientationManager.isMobile) {
        mobileControls.style.display = "flex";
    }

    // Load level data
    const levelData = await fetch("./map/level2.json");
    const levelDataJson = await levelData.json();

    // Initialize the level
    level(k, levelDataJson);

    // Create the player
    let playerPosition = levelDataJson.layers[6].objects[0];
    const player = new Player(k, playerPosition.x, playerPosition.y, 400, 670, () => {
        gameState.player = player;
        uiManager.setUpCollisionsUI();
    });

    // Setup the camera
    const mapWidth = levelDataJson.width * levelDataJson.tilewidth;
    const mapHeight = levelDataJson.height * levelDataJson.tileheight;
    const camera = new Camera(player.gameObject, 0, 0, mapWidth, mapHeight);
});

k.scene("intro", () => {
    const startButton = document.getElementById("start-button");
    const startMenu = document.getElementById("start-menu");
    if (startButton && startMenu) {
        startMenu.style.display = "flex";
        startButton.addEventListener("click", () => startGame(startMenu));
    }
});

function startGame(startMenu) {
    k.go("level");
    k.play("backgroundMusic", {
        volume: 0.3,
        loop: true,
    });
    gameState.gameStarted = true;
    startMenu.style.display = "none";
    stopProgressBarAnimation();
}

window.matchMedia("(orientation: portrait)").addEventListener("change", (event) => {
    checkOrientation();
});

k.onLoad(() => {
    checkOrientation();
    // k.go("level");
});