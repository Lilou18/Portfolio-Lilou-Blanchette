import { k } from "./loader.js"
import { level } from "./level.js"
import { Player } from "./entities/player.js";
import { Camera } from "./Camera.js";
import { gameState } from "./gameState.js";
import { uiManager } from "./uiManager.js";

let gameStarted = false;
function checkOrientation() {
    const overlay = document.getElementById("overlay");
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const isMobile = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log("IS PORTRAIT:" + isPortrait);
    if (isPortrait && isMobile) {

        overlay.style.display = "flex";

        if(gameStarted){
            gameState.addPauseFlag("portraitMode");
        }


    } else {

        if (!gameStarted) {
            k.go("level");
            gameStarted = true;
        }else{
            gameState.removePauseFlag("portraitMode");
        }

        overlay.style.display = "none";
    }


}

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

window.matchMedia("(orientation: portrait)").addEventListener("change", (event) => {
    checkOrientation();
});

k.onLoad(() => {
    checkOrientation();
    // k.go("level");
});