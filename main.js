import { k, waitForAssets, getLoadErrors } from "./loader.js"
import { level } from "./level.js"
import { Player } from "./entities/player.js";
import { Camera } from "./Camera.js";
import { gameState } from "./gameState.js";
import { uiManager } from "./uiManager.js";
import { orientationManager } from "./orientationManager.js";
import { soundManager } from "./soundManager.js";

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
    const levelData = await fetch("./map/level2.json");
    const levelDataJson = await levelData.json();
    console.log("Level data loaded:", levelDataJson);

    console.log("Initializing level...");
    level(k, levelDataJson);
    console.log("Level initialized");

    // Create the player
    let playerPosition = levelDataJson.layers[6].objects[0];
    console.log("Creating player at:", playerPosition);
    const player = new Player(k, playerPosition.x, playerPosition.y, 400, 670, () => {
        console.log("Player created callback");
        gameState.player = player;
        uiManager.setUpCollisionsUI();
    });

    // Setup the camera
    const mapWidth = levelDataJson.width * levelDataJson.tilewidth;
    const mapHeight = levelDataJson.height * levelDataJson.tileheight;
    const camera = new Camera(player.gameObject, 0, 0, mapWidth, mapHeight);
    console.log("Camera setup complete");
    console.log("=== LEVEL SCENE COMPLETE ===");
});

// Initialisation
(async () => {
    console.log("🚀 Starting game initialization...");
    
    await waitForAssets();
    
    const errors = getLoadErrors();
    if (errors.length > 0) {
        console.error("⚠️ Load errors detected:", errors);
        alert(`Warning: ${errors.length} assets failed to load. Check console for details.`);
    }
    
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
        loadingScreen.style.display = "none";
    }
    
    console.log("✓ Launching level scene...");
    k.go("level");
})();