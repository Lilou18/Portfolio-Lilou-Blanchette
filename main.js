import { k } from "./loader.js"
import { level } from "./level.js"
import { Player } from "./entities/player.js";
import { Camera } from "./Camera.js";
import { gameState } from "./gameState.js";
import { uiManager } from "./uiManager.js";
import { orientationManager } from "./orientationManager.js";
import { stopProgressBarAnimation } from "./animationManager.js";
import { soundManager } from "./soundManager.js";
import { initWindowEvents } from "./windowManager.js";
import { openFullscreen } from "./windowManager.js";

// function checkOrientation() {





//     if (isPortrait && isMobile) {

//         overlay.style.display = "flex";
//         if (gameState.gameStarted) {
//             gameState.addPauseFlag("portraitMode");
//         }
//     } else {

//         if (!gameState.gameStarted) {
//             k.go("intro");
//         } else {
//             gameState.removePauseFlag("portraitMode");
//         }

//         overlay.style.display = "none";
//     }


// }

let isInIntro = false;

function isOrientationOverlayDisplayed(overlay) {
    const portraitSection = document.getElementById("portraitSection");
    const isPortrait = orientationManager.isPortrait;

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
    // console.log("updateOverlayDisplay");
    const isMobile = orientationManager.isMobile;


    if (!isMobile) {
        if (!gameState.gameStarted && !isInIntro) {
            isInIntro = true;
            console.log("TRY TO GO INTO INTRO!");
            // safeGo("intro");
            k.go("intro");
        }
        return;
    }

    // console.log("TESTESTEST");
    const overlay = document.getElementById("overlay");

    const needLandscape = isOrientationOverlayDisplayed(overlay);
    // console.log(needLandscape + " Land");

    const needFullScreen = isFullScreenOverlayDisplayed(overlay);
    // console.log(needFullScreen + " Full");

    if (!needLandscape) {

        overlay.style.display = "none";
        // if (!gameState.gameStarted && !isInIntro) {
        //     k.go("intro");
        //     isInIntro = true;
        //     console.log("TRY TO GO INTO INTRO!");
        //     // safeGo("intro");
        // }
        if (!needFullScreen) {
            overlay.style.display = "none";
            if (!gameState.gameStarted && !isInIntro) {
                k.go("intro");
                isInIntro = true;
                console.log("TRY TO GO INTO INTRO!");
                //safeGo("intro");
            }
        }
    }
}

function setupFullScreenBtn() {
    const fullScreenBtn = document.getElementById("fullscreenBtn");
    fullScreenBtn.addEventListener("click", () => {
        const elem = document.documentElement;
        openFullscreen(elem);
        // isFullScreen = true;
        updateOverlayDisplay();
    });
}

k.scene("level", async () => {

    console.log("=== LEVEL SCENE STARTING ===");
    const canvas = document.getElementById("gameCanvas");
    if (canvas) {
        canvas.focus();
    }

    const mobileControls = document.getElementById("mobileControls");
    if (mobileControls && orientationManager.isMobile) {
        mobileControls.style.display = "flex";
        console.log("Mobile controls displayed");
    }

    console.log("Loading level data...");
    // Load level data
    const levelData = await fetch("./map/level2.json");
    const levelDataJson = await levelData.json();
    console.log("Level data loaded:", levelDataJson);

    console.log("Initializing level...");
    // Initialize the level
    level(k, levelDataJson, () => {
        // Create the player
        let playerPosition = levelDataJson.layers[6].objects[0];
        console.log("Creating player at:", playerPosition);
        const player = new Player(k, playerPosition.x, playerPosition.y, 400, 670);

        gameState.player = player;
        uiManager.setUpCollisionsUI();

        // Setup the camera
        const mapWidth = levelDataJson.width * levelDataJson.tilewidth;
        const mapHeight = levelDataJson.height * levelDataJson.tileheight;
        const camera = new Camera(player.gameObject, 0, 0, mapWidth, mapHeight);
        console.log("Camera setup complete");

    });
    console.log("Level initialized");
    console.log("=== LEVEL SCENE COMPLETE ===");
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
    console.log("ONLY ONCE!");
    gameState.gameStarted = true;
    // k.go("level");
    // soundManager.playBackgroundMusic();
    startMenu.style.display = "none";


    try {
        stopProgressBarAnimation();
        console.log("Progress bar animation stopped");
    } catch (error) {
        console.error("Error stopping progress bar:", error);
    }

    console.log("GOGOGOGO");
    console.log("TRY TO GO INTO LEVEL!");
    // safeGo("level");
    k.go("level");
    soundManager.playBackgroundMusic();

    setTimeout(() => {
        console.log("Going to level scene...");
        // k.go("level");
        // soundManager.playBackgroundMusic();
    }, 100);
}

function initEventListeners() {
    window.matchMedia("(orientation: portrait)").addEventListener("change", (event) => {
        updateOverlayDisplay();
    });

    document.addEventListener('fullscreenchange', () => { updateOverlayDisplay(); });
    document.addEventListener('mozfullscreenchange', updateOverlayDisplay);
    document.addEventListener('MSFullscreenChange', updateOverlayDisplay);
    document.addEventListener('webkitfullscreenchange', updateOverlayDisplay);
}

// let isSwitchingScene = false;

// function safeGo(sceneName) {
//     if (isSwitchingScene) return;

//     isSwitchingScene = true;
//     k.go(sceneName);

//     // petit delay le temps que Kaboom initialise
//     setTimeout(() => {
//         isSwitchingScene = false;
//     }, 100);
// }


k.onLoad(() => {
    initEventListeners();
    initWindowEvents();
    setupFullScreenBtn();
    updateOverlayDisplay();
    // k.go("level");
});