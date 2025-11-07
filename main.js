import { k } from "./loader.js"
import { level } from "./level.js"
import { Player } from "./entities/player.js";
import { Camera } from "./Camera.js";
import { gameState } from "./gameState.js";
import { uiManager } from "./uiManager.js";

k.scene("level", async () => {
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

k.onLoad(() => {
    k.go("level");
});