import { k } from "./loader.js"
import { level } from "./level.js"
import { Player } from "./entities/player.js";
import { Camera } from "./Camera.js";
import { gameState } from "./gameState.js";
import { uiManager } from "./uiManager.js";
import { GameManager } from "./gameManager.js";

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
// k.go("level");


// async function main() {
//     const levelData = await fetch("./map/level2.json")
//     const levelDataJson = await (levelData.json());

//     k.scene("level", () => {
//         level(k, levelDataJson);
//         let playerPosition = levelDataJson.layers[6].objects[0];
//         const player = new Player(k, playerPosition.x, playerPosition.y, 400, 650, () => {
//             gameState.player = player;
//             uiManager.setUpCollisionsUI();
//         });

//         //const player = new Player(500, 450, 400, 650);  // InitialPosX, initialPosY, speed, jumpForce
//         const mapWidth = levelDataJson.width * levelDataJson.tilewidth;
//         const mapHeight = levelDataJson.height * levelDataJson.tileheight;
//         const camera = new Camera(player.gameObject, 0, 0, mapWidth, mapHeight);

//     });

//     k.onLoad(() => {
//         k.go("level");
//     });

//     // k.go("level");

//     // k.onLoad(() => {
//     //     k.go("level");
//     // });


// }

// main();

// k.onLoad(() => {
//     k.go("level");
// });


// k.scene("intro", () => {
//     k.onKeyPress("enter", () => {
//         k.go("level");

//     })
// })

// k.go("intro");