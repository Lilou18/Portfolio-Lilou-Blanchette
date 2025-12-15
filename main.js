import { k } from "./loader.js"
import { level } from "./level.js"
import { Player } from "./entities/player.js";
import { Camera } from "./Camera.js";
import { gameState } from "./gameState.js";
import { uiManager } from "./uiManager.js";
import { deviceInfo } from "./deviceInfo.js";
import { stopProgressBarAnimation } from "./animationManager.js";
import { soundManager } from "./soundManager.js";
import { initWindowEvents } from "./windowManager.js";
import { openFullscreen } from "./windowManager.js";

let isInIntro = false;

function isOrientationOverlayDisplayed(overlay) {
    const portraitSection = document.getElementById("portraitSection");
    const isPortrait = deviceInfo.isPortrait;

    if (isPortrait) {

        overlay.style.display = "flex";
        portraitSection.style.display = "flex";
        if (gameState.gameStarted) {
            gameState.addPauseFlag("portraitMode");
        }
        return true;
    }
    else {
        portraitSection.style.display = "none";
        if (gameState.gameStarted) {
            gameState.removePauseFlag("portraitMode");
        }
        return false;
    }

}

function isFullScreenOverlayDisplayed(overlay) {
    if (deviceInfo.isIOS) return false;

    const fullScreenSection = document.getElementById("fullScreenSection");
    const isFullScreen = (
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
    );;

    if (!isFullScreen) {
        if (gameState.gameStarted) {
            gameState.addPauseFlag("notFullScreen");
        }
        overlay.style.display = "flex";
        fullScreenSection.style.display = "flex";
        return true;
    }
    else {
        if (gameState.gameStarted) {
            gameState.removePauseFlag("notFullScreen");
        }
        fullScreenSection.style.display = "none";
        return false;
    }

}

function updateOverlayDisplay() {
    const isMobile = deviceInfo.isMobile;


    if (!isMobile) {
        if (!gameState.gameStarted && !isInIntro) {
            isInIntro = true;
            k.go("intro");
        }
        return;
    }

    const overlay = document.getElementById("overlay");

    const needLandscape = isOrientationOverlayDisplayed(overlay);

    const needFullScreen = isFullScreenOverlayDisplayed(overlay);

    if (!needLandscape) {

        if (!needFullScreen) {
            overlay.style.display = "none";
            if (!gameState.gameStarted && !isInIntro) {
                k.go("intro");
                isInIntro = true;


            }
        }
    }
}

function setupFullScreenBtn() {
    if (!deviceInfo.isIOS) {
        const fullScreenBtn = document.getElementById("fullscreenBtn");
        fullScreenBtn.addEventListener("click", () => {
            const elem = document.documentElement;
            openFullscreen(elem);
            updateOverlayDisplay();
        });
    }

}

k.scene("level", async () => {

    // console.log("=== LEVEL SCENE STARTING ===");
    const canvas = document.getElementById("gameCanvas");
    if (canvas) {
        canvas.focus();
    }

    const mobileControls = document.getElementById("mobileControls");
    if (mobileControls && (deviceInfo.isMobile || deviceInfo.isTouchEnabled)) {
        // console.log(deviceInfo.isTouchEnabled);
        mobileControls.style.display = "flex";
    }


    // Load level data
    const levelData = await fetch("./map/level2.json");
    const levelDataJson = await levelData.json();

    // Initialize the level
    level(k, levelDataJson, () => {
        // Create the player
        let playerPosition = levelDataJson.layers[6].objects[0];
        const player = new Player(k, playerPosition.x, playerPosition.y, 400, 670);

        gameState.player = player;
        // uiManager.setUpCollisionsUI();

        // // Setup the camera
        // const mapWidth = levelDataJson.width * levelDataJson.tilewidth;
        // const mapHeight = levelDataJson.height * levelDataJson.tileheight;
        // const camera = new Camera(player.gameObject, 0, 0, mapWidth, mapHeight);

        // player.hidden = true;
        // player.paused = true;

    });
});

k.scene("intro", () => {
    const startButton = document.getElementById("start-button");
    const startMenu = document.getElementById("start-menu");
    if (startButton && startMenu) {
        startMenu.style.display = "flex";
        startButton.addEventListener("click", () => startGame(startMenu), { once: true });
    }
});

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

function initEventListeners() {
    window.matchMedia("(orientation: portrait)").addEventListener("change", (event) => {
        updateOverlayDisplay();
    });

    if (!deviceInfo.isIOS) {
        document.addEventListener('fullscreenchange', () => { updateOverlayDisplay(); });
        document.addEventListener('mozfullscreenchange', updateOverlayDisplay);
        document.addEventListener('MSFullscreenChange', updateOverlayDisplay);
        document.addEventListener('webkitfullscreenchange', updateOverlayDisplay);
    }


}

k.onLoad(() => {
    initEventListeners();
    initWindowEvents();
    setupFullScreenBtn();
    updateOverlayDisplay();
});