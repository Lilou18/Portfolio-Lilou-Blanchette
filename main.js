// import kaplay from "https://unpkg.com/kaplay@4000.0.0-alpha.23/dist/kaplay.mjs";

// export const k = kaplay({
//     background: "#5ba675",
//     // width: 1920,
//     // height:1080,
//     // letterbox:false,
// });

// loadSprite("levelP1", "levelP1.png");
// loadSprite("levelP2", "levelP2.png");
// loadSprite("levelP3", "levelP3.png");

// loadSprite("cvHologram", "hologramCVMobile.png", {
//     sliceX: 3,
//     sliceY: 3,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 8,
//             speed: 8,
//             loop: true,
//         }
//     }
// });

// loadSprite("portfolioHologram", "hologramPortfolioMobile.png", {
//     sliceX: 3,
//     sliceY: 3,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 8,
//             speed: 8,
//             loop: true,
//         }
//     }
// });

// loadSprite("contactHologram", "hologramContactMobile.png", {
//     sliceX: 3,
//     sliceY: 3,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 8,
//             speed: 8,
//             loop: true,
//         }
//     }
// });

// loadSprite("citySign", "citySign.png", {
//     sliceX: 5,
//     sliceY: 4,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 16,
//             speed: 15,
//             loop: false,
//         }
//     }
// });

// loadSprite("citySignMobile", "citySignMobile.png", {
//     sliceX: 3,
//     sliceY: 3,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 6,
//             speed: 10,
//             loop: false,
//         }
//     }
// });

// scene("level", async () => {
//     const levelData = await fetch("level2.json");
//     const levelDataJson = await levelData.json();
//     level(levelDataJson);
// });

// go("level");



// function level(dataLevel) {
//     let mapParts = [];

//     function updateBackground() {
//         const canvasWidth = width();
//         const canvasHeight = height();

//         // Supprimer les anciens éléments
//         mapParts.forEach(part => part.destroy());
//         mapParts = [];

//         // Créer les trois parties du background
//         const mapPart1 = add([pos(0, 0), sprite("levelP1")]);
//         const mapPart2 = add([pos(0, 0), sprite("levelP2")]);
//         const mapPart3 = add([pos(0, 0), sprite("levelP3")]);

//         mapParts = [mapPart1, mapPart2, mapPart3];

//         // Calculer l'échelle basée sur la hauteur du canvas
//         const scale = canvasHeight / mapPart1.height;

//         // Appliquer l'échelle à tous les éléments
//         mapParts.forEach(part => {
//             part.scale = vec2(scale);
//         });

//         // Positionner les parties côte à côte
//         mapPart1.pos = vec2(0, 0);
//         mapPart2.pos = vec2(mapPart1.width * scale, 0);
//         mapPart3.pos = vec2((mapPart1.width + mapPart2.width) * scale, 0);
//     }

//     // Première initialization
//     updateBackground();

//     onResize(() => {
//         updateBackground();
//     })
// };

// import kaplay from "https://unpkg.com/kaplay@4000.0.0-alpha.23/dist/kaplay.mjs";

// export const k = kaplay({
//     background: "#5ba675",
//     // width: 1920,
//     // height:1080,
//     // letterbox:false,
// });

// loadSprite("levelP1", "levelP1.png");
// loadSprite("levelP2", "levelP2.png");
// loadSprite("levelP3", "levelP3.png");

// loadSprite("cvHologram", "hologramCVMobile.png", {
//     sliceX: 3,
//     sliceY: 3,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 8,
//             speed: 8,
//             loop: true,
//         }
//     }
// });

// loadSprite("portfolioHologram", "hologramPortfolioMobile.png", {
//     sliceX: 3,
//     sliceY: 3,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 8,
//             speed: 8,
//             loop: true,
//         }
//     }
// });

// loadSprite("contactHologram", "hologramContactMobile.png", {
//     sliceX: 3,
//     sliceY: 3,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 8,
//             speed: 8,
//             loop: true,
//         }
//     }
// });

// loadSprite("citySign", "citySign.png", {
//     sliceX: 5,
//     sliceY: 4,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 16,
//             speed: 15,
//             loop: false,
//         }
//     }
// });

// loadSprite("citySignMobile", "citySignMobile.png", {
//     sliceX: 3,
//     sliceY: 3,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 6,
//             speed: 10,
//             loop: false,
//         }
//     }
// });

// scene("level", async () => {
//     const levelData = await fetch("level2.json");
//     const levelDataJson = await levelData.json();
//     level(levelDataJson);


// });

// go("level");



// function level(dataLevel) {
//     let mapParts = [];
//     const FIXED_VIEW_WIDTH = 1820; // Largeur fixe de la vue

//     function updateBackground() {
//         const canvasWidth = width();
//         const canvasHeight = height();

//         // Supprimer les anciens éléments
//         mapParts.forEach(part => part.destroy());
//         mapParts = [];

//         // Créer les trois parties du background
//         const mapPart1 = add([pos(0, 0), sprite("levelP1")]);
//         const mapPart2 = add([pos(0, 0), sprite("levelP2")]);
//         const mapPart3 = add([pos(0, 0), sprite("levelP3")]);

//         mapParts = [mapPart1, mapPart2, mapPart3];

//         // Calculer l'échelle basée sur la hauteur du canvas
//         const scaleY = canvasHeight / mapPart1.height;

//         // Calculer l'échelle nécessaire pour que FIXED_VIEW_WIDTH pixels 
//         // de l'image remplissent toute la largeur du canvas
//         const scaleX = canvasWidth / FIXED_VIEW_WIDTH;

//         // Appliquer l'échelle à tous les éléments
//         mapParts.forEach(part => {
//             part.scale = vec2(scaleX, scaleY);
//         });

//         // Positionner les parties côte à côte
//         mapPart1.pos = vec2(0, 0);
//         mapPart2.pos = vec2(mapPart1.width * scaleX, 0);
//         mapPart3.pos = vec2((mapPart1.width + mapPart2.width) * scaleX, 0);
//     }

//     // Première initialization
//     updateBackground();

//     onResize(() => {
//         updateBackground();
//     })
// };

// import kaplay from "https://unpkg.com/kaplay@4000.0.0-alpha.23/dist/kaplay.mjs";

// export const k = kaplay({
//     background: "#5ba675",
//     // width: 1920,
//     // height:1080,
//     // letterbox:false,
// });

// loadSprite("levelP1", "levelP1.png");
// loadSprite("levelP2", "levelP2.png");
// loadSprite("levelP3", "levelP3.png");

// loadSprite("cvHologram", "hologramCVMobile.png", {
//     sliceX: 3,
//     sliceY: 3,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 8,
//             speed: 8,
//             loop: true,
//         }
//     }
// });

// loadSprite("portfolioHologram", "hologramPortfolioMobile.png", {
//     sliceX: 3,
//     sliceY: 3,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 8,
//             speed: 8,
//             loop: true,
//         }
//     }
// });

// loadSprite("contactHologram", "hologramContactMobile.png", {
//     sliceX: 3,
//     sliceY: 3,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 8,
//             speed: 8,
//             loop: true,
//         }
//     }
// });

// loadSprite("citySign", "citySign.png", {
//     sliceX: 5,
//     sliceY: 4,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 16,
//             speed: 15,
//             loop: false,
//         }
//     }
// });

// loadSprite("citySignMobile", "citySignMobile.png", {
//     sliceX: 3,
//     sliceY: 3,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 6,
//             speed: 10,
//             loop: false,
//         }
//     }
// });

// scene("level", async () => {
//     const levelData = await fetch("level2.json");
//     const levelDataJson = await levelData.json();
//     level(levelDataJson);




// });

// go("level");



// function level(dataLevel) {
//     let mapParts = [];
//     const FIXED_VIEW_WIDTH = 1820; // Largeur fixe de la vue

//     function updateBackground() {
//         const canvasWidth = width();
//         const canvasHeight = height();

//         // Supprimer les anciens éléments
//         mapParts.forEach(part => part.destroy());
//         mapParts = [];

//         // Créer les trois parties du background
//         const mapPart1 = add([pos(0, 0), sprite("levelP1")]);
//         const mapPart2 = add([pos(0, 0), sprite("levelP2")]);
//         const mapPart3 = add([pos(0, 0), sprite("levelP3")]);

//         mapParts = [mapPart1, mapPart2, mapPart3];

//         // Calculer l'échelle basée sur la hauteur du canvas
//         const scaleY = canvasHeight / mapPart1.height;

//         // Calculer l'échelle nécessaire pour que FIXED_VIEW_WIDTH pixels 
//         // de l'image remplissent toute la largeur du canvas
//         const scaleX = canvasWidth / FIXED_VIEW_WIDTH;

//         // Appliquer l'échelle à tous les éléments
//         mapParts.forEach(part => {
//             part.scale = vec2(scaleX, scaleY);
//         });

//         // Positionner les parties côte à côte
//         mapPart1.pos = vec2(0, 0);
//         mapPart2.pos = vec2(mapPart1.width * scaleX, 0);
//         mapPart3.pos = vec2((mapPart1.width + mapPart2.width) * scaleX, 0);

//         const levelLayers = dataLevel.layers;
//         const colliders = [];
//         for (const layer of levelLayers) {
//             if (layer.name === "colliders") {
//                 colliders.push(...layer.objects);
//                 break;
//             }
//         }
//         setMapColliders(k, mapPart1, colliders);
//     }

//     // Première initialization
//     updateBackground();

//     onResize(() => {
//         updateBackground();
//     })
// };

// function setMapColliders(k, mapPart, colliders) {
//     for (const collider of colliders) {
//         mapPart.add([
//             k.pos(collider.x, collider.y),
//             k.area({
//                 shape: new k.Rect(k.vec2(0), collider.width, collider.height)
//             }),
//             k.body({ isStatic: true }),
//             "collider"
//         ]);
//     }

// }







import { k } from "./loader.js";
import { level } from "./level.js";
import { gameState } from "./gameState.js";
import { Player } from "./player.js";
import { Camera } from "./camera.js";
import { uiManager } from "./uiManager.js";
import { applicationManager } from "./applicationManager.js";
import { createWorld } from "./animationManager.js";

k.scene("level", async () => {
    // Load level data
    const levelData = await fetch("level2.json");
    const levelDataJson = await levelData.json();

    // const world = createWorld();

    // // Initialize the level
    // const levelControl = level(k, levelDataJson);

    // // Create the player
    // let playerPosition = levelDataJson.layers[6].objects[0];
    // const player = new Player(k, playerPosition.x, playerPosition.y, 400, 670);
    // gameState.player = player;
    // levelControl.setPlayer(gameState.player);

    // // Setup the camera
    // const camera = new Camera(player.gameObject, levelControl);
    // camera.setMapParts(levelControl.getMapParts());

    // uiManager.setUpHologramInteractions();

    k.onLoad(() => {
        const world = createWorld();

        // Initialize the level
        const levelControl = level(k, levelDataJson);

        // Create the player
        let playerPosition = levelDataJson.layers[6].objects[0];
        const player = new Player(k, playerPosition.x, playerPosition.y, 400, 670);
        gameState.player = player;
        levelControl.setPlayer(gameState.player);

        // Setup the camera
        const camera = new Camera(player.gameObject, levelControl);
        camera.setMapParts(levelControl.getMapParts());

        uiManager.setUpHologramInteractions();

        uiManager.initializeMobileControls();

    });

});

k.go("level");