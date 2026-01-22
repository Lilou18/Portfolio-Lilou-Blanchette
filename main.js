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
//import { level } from "./level.js";
// import { gameState } from "./gameState.js";
// import { Player } from "./player.js";
// import { Camera } from "./camera.js";
// import { uiManager } from "./uiManager.js";
// import { applicationManager } from "./applicationManager.js";
import { createWorld } from "./animationManager.js";

k.scene("level", async () => {
    // Load level data
    const levelData = await fetch("level2.json");
    const dataLevel = await levelData.json();

    // Debug stats
    // let debugStats = {
    //     fps: 0,
    //     memory: 0,
    //     gcCount: 0,
    //     objects: 0,
    //     lastMemory: 0,
    //     frameCount: 0,
    //     lastTime: Date.now(),
    //     enabled: true
    // };
    // const world = createWorld();

    // // Initialize the level
    //const levelControl = level(k, levelDataJson);

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

        k.setGravity(1400);

        let mapParts = [];
        let colliderObjects = [];
        let player = null;
        let borders = null;
        let holograms = [];
        let gameManager = null;
        const FIXED_VIEW_WIDTH = 1820;


        // // Initialisation unique
        // function initializeMap() {
        //     // Créer les trois parties du background une seule fois
        const mapPart1 = k.add([pos(0, 0), sprite("levelP1"), k.z(0),]);
        //const mapPart2 = k.add([pos(0, 0), sprite("levelP2"), k.z(0),]);
        //const mapPart3 = k.add([pos(0, 0), sprite("levelP3"), k.z(0),]);

        //mapParts = [mapPart1, mapPart2, mapPart3];

        // Créer les colliders une seule fois
        const levelLayers = dataLevel.layers;
        const colliders = [];
        for (const layer of levelLayers) {
            if (layer.name === "colliders") {
                colliders.push(...layer.objects);
                break;
            }
        }

        colliderObjects = setMapColliders(k, colliders);

        function setMapColliders(k, colliders) {
            const colliderObjects = [];

            for (const collider of colliders) {
                const colliderObj = k.add([
                    k.pos(collider.x, collider.y),
                    k.area({
                        shape: new k.Rect(k.vec2(0), collider.width, collider.height)
                    }),
                    k.body({ isStatic: true }),
                    "collider"
                ]);
                colliderObjects.push(colliderObj);
            }

            return colliderObjects;
        }


        //     // levelControl = {
        //     //     getCurrentScale,
        //     //     getScaledMapWidth() {
        //     //         if (mapParts.length === 0) return 0;
        //     //         const { scaleX } = getCurrentScale();
        //     //         return (mapParts[0].width + mapParts[1].width + mapParts[2].width) * scaleX;
        //     //     },
        //     //     getMapParts() {
        //     //         return mapParts;
        //     //     },
        //     //     getMapOffsetY() {
        //     //         const mapParts = this.getMapParts();
        //     //         const { scaleY } = this.getCurrentScale();
        //     //         const mapHeight = mapParts[0].height * scaleY;
        //     //         const canvasHeight = k.height();
        //     //         return canvasHeight - mapHeight;
        //     //     }
        //     // };

        //     // Appliquer le scaling initial
        //     updateScaling();
        // }

        // // Fonction pour calculer et appliquer le scaling
        // function updateScaling() {
        //     const canvasWidth = width();
        //     const canvasHeight = height();

        //     if (mapParts.length === 0) return;

        //     const scaleY = canvasHeight / mapParts[0].height;
        //     const scaleX = canvasWidth / FIXED_VIEW_WIDTH;

        //     // Mettre à jour l'échelle et la position sans détruire
        //     mapParts.forEach((part, index) => {
        //         part.scale = vec2(scaleX, scaleY);
        //     });

        //     // Repositionner les parties
        //     mapParts[0].pos = vec2(0, 0);
        //     if (mapParts[1]) {
        //         mapParts[1].pos = vec2(mapParts[0].width * scaleX, 0);
        //     }
        //     if (mapParts[2]) {
        //         mapParts[2].pos = vec2((mapParts[0].width + mapParts[1].width) * scaleX, 0);
        //     }

        //     k.setGravity(1400 * scaleY);

        // }

        // // Initialisation
        // initializeMap();


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

        // uiManager.initializeMobileControls();

    });

    let lastTime = performance.now();
    let frames = 0;
    let fps = 0;

    // Affichage dans Kaplay
    const fpsText = k.add([
        k.text("FPS: 0"),
        k.pos(10, 10),
        k.fixed(),
        k.z(1000),
    ]);

    function updateFPS() {
        frames++;
        const now = performance.now();

        if (now - lastTime >= 1000) {
            fps = frames;
            frames = 0;
            lastTime = now;
            fpsText.text = `FPS: ${fps}`;
        }

        requestAnimationFrame(updateFPS);
    }

    updateFPS();

    //     // Debug overlay UI
    //     const debugText = k.add([
    //         k.text(""),
    //         k.pos(10, 10),
    //         k.fixed(),
    //         k.z(1000),
    //         k.color(255, 255, 0),
    //     ]);

    //     // Update debug stats
    //     k.onUpdate(() => {
    //         if (!debugStats.enabled) return;

    //         debugStats.frameCount++;
    //         const now = Date.now();

    //         // Calcul FPS
    //         if (now - debugStats.lastTime > 1000) {
    //             debugStats.fps = debugStats.frameCount;
    //             debugStats.frameCount = 0;
    //             debugStats.lastTime = now;
    //         }

    //         // Mémoire et GC
    //         if (performance.memory) {
    //             const current = performance.memory.usedJSHeapSize;
    //             const delta = current - debugStats.lastMemory;

    //             // Si la mémoire baisse de plus de 2MB = GC
    //             if (delta < -2000000) {
    //                 debugStats.gcCount++;
    //                 console.log(`🗑️ GC Event #${debugStats.gcCount}`);
    //             }

    //             debugStats.memory = (current / 1024 / 1024).toFixed(1);
    //             debugStats.lastMemory = current;
    //         }

    //         // Nombre d'objets
    //         debugStats.objects = k.get("*").length;
    //     });

    //     // Draw debug overlay
    //     k.onDraw(() => {
    //         if (!debugStats.enabled) return;

    //         const text = `FPS: ${debugStats.fps}
    // Memory: ${debugStats.memory}MB
    // GC: ${debugStats.gcCount}
    // Objects: ${debugStats.objects}`;

    //         debugText.text = text;
    //     });

    //     // Toggle avec un tap/clic
    //     k.onMousePress(() => {
    //         debugStats.enabled = !debugStats.enabled;
    //     });

});

k.go("level");