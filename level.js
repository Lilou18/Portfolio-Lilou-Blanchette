// import { gameState } from "./gameState.js";

// export function level(k, dataLevel) {

//     k.setGravity(1400);

//     let mapParts = [];
//     let colliderObjects = [];
//     let player = null;
//     let borders = null;
//     const FIXED_VIEW_WIDTH = 1820;

//     // Fonction pour calculer le scale actuel
//     function getCurrentScale() {
//         if (mapParts.length === 0) return { scaleX: 1, scaleY: 1 };

//         const canvasWidth = width();
//         const canvasHeight = height();
//         const scaleY = canvasHeight / mapParts[0].height;
//         const scaleX = canvasWidth / FIXED_VIEW_WIDTH;

//         return { scaleX, scaleY };
//     }

//     // Fonction pour calculer et appliquer le scaling
//     function updateScaling() {
//         const canvasWidth = width();
//         const canvasHeight = height();

//         if (mapParts.length === 0) return;

//         const scaleY = canvasHeight / mapParts[0].height;
//         const scaleX = canvasWidth / FIXED_VIEW_WIDTH;

//         console.log("Canvas:", canvasWidth, "x", canvasHeight);
//         console.log("Scale:", scaleX, "x", scaleY);
//         console.log("MapPart height:", mapParts[0].height);

//         // Mettre à jour l'échelle et la position sans détruire
//         mapParts.forEach((part, index) => {
//             part.scale = vec2(scaleX, scaleY);
//         });

//         // Repositionner les parties
//         mapParts[0].pos = vec2(0, 0);
//         if (mapParts[1]) {
//             mapParts[1].pos = vec2(mapParts[0].width * scaleX, 0);
//         }
//         if (mapParts[2]) {
//             mapParts[2].pos = vec2((mapParts[0].width + mapParts[1].width) * scaleX, 0);
//         }

//         updateBorders(scaleX, scaleY);

//         // Mettre à jour les colliders si nécessaire
//         //updateColliders(scaleX, scaleY);

//         // Mettre à jour le player
//         updatePlayer(scaleX, scaleY);
//     }

//     // Fonction pour mettre à jour les colliders
//     function updateColliders(scaleX, scaleY) {
//         colliderObjects.forEach(colliderObj => {
//             colliderObj.scale = vec2(scaleX, scaleY);
//         });
//     }

//     // Fonction pour mettre à jour les bordures
//     function updateBorders(scaleX, scaleY) {
//         if (!borders) return;

//         const canvasHeight = height();
//         const mapTotalWidth = (mapParts[0].width + mapParts[1].width + mapParts[2].width) * scaleX;
//         const borderWidth = 128 * scaleX;

//         // Bordure gauche
//         borders.left.width = borderWidth;
//         borders.left.height = canvasHeight;
//         borders.left.pos = vec2(-borderWidth, 0);

//         // Bordure droite
//         borders.right.width = borderWidth;
//         borders.right.height = canvasHeight;
//         borders.right.pos = vec2(mapTotalWidth, 0);
//     }

//     // Fonction pour mettre à jour le player
//     function updatePlayer(scaleX, scaleY) {
//         if (player && player.gameObject) {
//             console.log("RESIZE PLAYER");
//             // Utiliser la moyenne des deux scales pour un scaling uniforme
//             const uniformScale = (scaleX + scaleY) / 2;
//             player.gameObject.scale = vec2(uniformScale);

//             // Mettre à jour la position du player proportionnellement
//             const scaledX = player.originalPosX * scaleX;
//             const scaledY = player.originalPosY * scaleY;
//             player.gameObject.pos = vec2(scaledX, scaledY);
//         }
//     }

//     // Initialisation unique
//     function initializeMap() {
//         // Créer les trois parties du background une seule fois
//         const mapPart1 = add([pos(0, 0), sprite("levelP1")]);
//         const mapPart2 = add([pos(0, 0), sprite("levelP2")]);
//         const mapPart3 = add([pos(0, 0), sprite("levelP3")]);

//         mapParts = [mapPart1, mapPart2, mapPart3];

//         // Créer les colliders une seule fois
//         const levelLayers = dataLevel.layers;
//         const colliders = [];
//         for (const layer of levelLayers) {
//             if (layer.name === "colliders") {
//                 colliders.push(...layer.objects);
//                 break;
//             }
//         }
//         colliderObjects = setMapColliders(k, mapPart1, colliders);

//         // Créer les bordures invisibles
//         borders = setMapBorders(k, 128, height(), mapPart1.width);

//         // Appliquer le scaling initial
//         updateScaling();
//     }

//     // Initialisation
//     initializeMap();

//     // Sur resize, juste mettre à jour le scaling
//     onResize(() => {
//         updateScaling();
//     });

//     return {
//         setPlayer: (playerInstance) => {
//             player = playerInstance;
//             const { scaleX, scaleY } = getCurrentScale();
//             updatePlayer(scaleX, scaleY);
//         },
//         getCurrentScale,
//         getScaledMapWidth() {
//             if (mapParts.length === 0) return 0;
//             const { scaleX } = getCurrentScale();
//             return (mapParts[0].width + mapParts[1].width + mapParts[2].width) * scaleX;
//         },
//         getMapParts() {
//             return mapParts;
//         }
//     };

// }

// // export function initializePlayer() {

// //     const { scaleX, scaleY } = getCurrentScale();
// //     player = gameState.player;
// //     updatePlayer(scaleX, scaleY);

// // }

// function setMapColliders(k, mapPart, colliders) {
//     const colliderObjects = [];

//     for (const collider of colliders) {
//         const colliderObj = mapPart.add([
//             k.pos(collider.x, collider.y),
//             k.area({
//                 shape: new k.Rect(k.vec2(0), collider.width, collider.height)
//             }),
//             k.body({ isStatic: true }),
//             "collider"
//         ]);
//         colliderObjects.push(colliderObj);
//     }

//     return colliderObjects;
// }

// function setMapBorders(k, tilewidth, mapheight, mapWidth) {
//     const borderLeft = k.add([
//         k.rect(tilewidth, mapheight),
//         k.area(),
//         k.opacity(0),
//         k.body({ isStatic: true }),
//         k.pos(-128, 0),
//         "borderLeft",
//     ]);

//     const borderRight = k.add([
//         k.rect(tilewidth, mapheight),
//         k.area(),
//         k.opacity(0),
//         k.body({ isStatic: true }),
//         k.pos(mapWidth, 0),
//         "border",
//     ]);


//     // Return references to the borders so they can be updated
//     return { left: borderLeft, right: borderRight };
// }



import { gameState } from "./gameState.js";
import { deviceInfo } from "./deviceInfo.js";
import { uiManager } from "./uiManager.js";
import { GameManager } from "./gameManager.js";
import { world } from "./animationManager.js";

export let levelControl = null;

export function level(k, dataLevel) {

    k.setGravity(1400);

    let mapParts = [];
    let colliderObjects = [];
    let player = null;
    let borders = null;
    let holograms = [];
    let gameManager = null;
    const FIXED_VIEW_WIDTH = 1820;

    // Fonction pour calculer le scale actuel
    function getCurrentScale() {
        if (mapParts.length === 0) return { scaleX: 1, scaleY: 1 };

        const canvasWidth = width();
        const canvasHeight = height();
        const scaleY = canvasHeight / mapParts[0].height;
        const scaleX = canvasWidth / FIXED_VIEW_WIDTH;

        return { scaleX, scaleY };
    }

    // Fonction pour calculer et appliquer le scaling
    function updateScaling() {
        const canvasWidth = width();
        const canvasHeight = height();

        if (mapParts.length === 0) return;

        const scaleY = canvasHeight / mapParts[0].height;
        const scaleX = canvasWidth / FIXED_VIEW_WIDTH;

        // Mettre à jour l'échelle et la position sans détruire
        mapParts.forEach((part, index) => {
            part.scale = vec2(scaleX, scaleY);
        });

        // Repositionner les parties
        mapParts[0].pos = vec2(0, 0);
        if (mapParts[1]) {
            mapParts[1].pos = vec2(mapParts[0].width * scaleX, 0);
        }
        if (mapParts[2]) {
            mapParts[2].pos = vec2((mapParts[0].width + mapParts[1].width) * scaleX, 0);
        }

        // Mettre à jour les bordures
        updateBorders(scaleX, scaleY);

        // Mettre à jour le player
        updatePlayer(scaleX, scaleY);

        // Update Holograms
        updateHolograms(scaleX, scaleY);

        if (gameManager) {
            gameManager.updateScale();
        }

        k.setGravity(1400 * scaleY);

        // update text over the holograms
        //uiManager.updateInteractionTextsOnResize();
    }

    // Fonction pour mettre à jour les bordures
    function updateBorders(scaleX, scaleY) {
        if (!borders) return;

        const canvasHeight = height();
        const mapTotalWidth = (mapParts[0].width + mapParts[1].width + mapParts[2].width) * scaleX;
        const borderWidth = 128 * scaleX;

        // Bordure gauche
        borders.left.width = borderWidth;
        borders.left.height = canvasHeight;
        borders.left.pos = vec2(-borderWidth, 0);

        // Bordure droite
        borders.right.width = borderWidth;
        borders.right.height = canvasHeight;
        borders.right.pos = vec2(mapTotalWidth, 0);
    }

    // Stocker la position relative du joueur
    let playerRelativePos = null;
    let lastScaleX = null;
    let lastScaleY = null;

    // Fonction pour mettre à jour le player
    function updatePlayer(scaleX, scaleY) {
        if (player && player.gameObject) {
            //console.log("RESIZE PLAYER - scaleX:", scaleX, "scaleY:", scaleY);

            // Première fois: mémoriser la position originale du joueur
            if (!playerRelativePos && player.originalPosX === undefined) {
                playerRelativePos = {
                    //originalX: player.originalPosX,
                    //originalY: player.originalPosY
                    originalX: player.initialPlayerPositionX,
                    originalY: player.initialPlayerPositionY
                };
                //console.log("Position originale mémorisée:", playerRelativePos);
            }

            // Si le scale a changé (resize), recalculer la position relative en fonction de la position actuelle
            if (lastScaleX !== null && (lastScaleX !== scaleX || lastScaleY !== scaleY)) {
                // Avant le resize, mémoriser la position relative actuelle
                playerRelativePos = {
                    originalX: player.gameObject.pos.x / lastScaleX,
                    originalY: player.gameObject.pos.y / lastScaleY
                };
                //console.log("Position relative mise à jour avant resize:", playerRelativePos);
            }

            // Utiliser la moyenne des deux scales pour un scaling uniforme
            const uniformScale = (scaleX + scaleY) / 2;
            player.gameObject.scale = vec2(uniformScale);

            // Recalculer la position avec le nouveau scale
            if (playerRelativePos) {
                player.gameObject.pos = vec2(
                    playerRelativePos.originalX * scaleX,
                    playerRelativePos.originalY * scaleY
                );
                //console.log("Nouvelle position du joueur:", player.gameObject.pos);
            }

            player.updateSpeeds(scaleX, scaleY);

            // Mémoriser le scale actuel
            lastScaleX = scaleX;
            lastScaleY = scaleY;

            //console.log("UPDATE PLAYER POSITION : " + player.gameObject.pos);
        }
    }

    // Fonction pour mettre à jour les holograms
    // function updateHolograms(scaleX, scaleY) {
    //     if (!holograms || holograms.length === 0) return;

    //     // Calculer mapOffsetY comme dans ta version originale
    //     const mapHeight = mapParts[0].height * scaleY;
    //     const canvasHeight = height();
    //     const mapOffsetY = canvasHeight - mapHeight;

    //     for (const hologramData of holograms) {
    //         // Positionner les holograms comme ta version originale
    //         hologramData.object.pos.x = hologramData.originalX * scaleX;
    //         hologramData.object.pos.y = mapOffsetY + (hologramData.originalY * scaleY);

    //         // Mettre à jour le scale avec la moyenne des deux scales
    //         const uniformScale = (scaleX + scaleY) / 2;
    //         hologramData.object.scale = vec2(hologramData.originalScale * uniformScale);
    //     }
    // }
    function updateHolograms(scaleX, scaleY) {
        if (!holograms || holograms.length === 0) return;

        const mapHeight = mapParts[0].height * scaleY;
        const canvasHeight = height();
        const mapOffsetY = canvasHeight - mapHeight;

        for (const data of holograms) {
            // Position map → écran
            data.object.pos.x = data.originalX * scaleX;
            data.object.pos.y = mapOffsetY + (data.originalY * scaleY);

            // SCALE NON UNIFORME COMME LA MAP
            data.object.scale = vec2(
                data.originalScale * scaleX,
                data.originalScale * scaleY
            );
        }
    }

    // Initialisation unique
    function initializeMap() {
        // Créer les trois parties du background une seule fois
        const mapPart1 = k.add([pos(0, 0), sprite("levelP1"), k.z(0),]);
        const mapPart2 = k.add([pos(0, 0), sprite("levelP2"), k.z(0),]);
        const mapPart3 = k.add([pos(0, 0), sprite("levelP3"), k.z(0),]);

        mapParts = [mapPart1, mapPart2, mapPart3];

        // Créer les colliders une seule fois
        const levelLayers = dataLevel.layers;
        const colliders = [];
        for (const layer of levelLayers) {
            if (layer.name === "colliders") {
                colliders.push(...layer.objects);
                break;
            }
        }
        colliderObjects = setMapColliders(k, mapPart1, colliders);

        // Créer les bordures invisibles
        borders = setMapBorders(k, 128, height(), mapPart1.width);

        // Create the holograms
        holograms = setHolograms(k, levelLayers[6].objects, FIXED_VIEW_WIDTH);

        levelControl = {
            setPlayer: (playerInstance) => {
                player = playerInstance;
                const { scaleX, scaleY } = getCurrentScale();
                updatePlayer(scaleX, scaleY);
            },
            getCurrentScale,
            getScaledMapWidth() {
                if (mapParts.length === 0) return 0;
                const { scaleX } = getCurrentScale();
                return (mapParts[0].width + mapParts[1].width + mapParts[2].width) * scaleX;
            },
            getMapParts() {
                return mapParts;
            },
            getMapOffsetY() {
                const mapParts = this.getMapParts();
                const { scaleY } = this.getCurrentScale();
                const mapHeight = mapParts[0].height * scaleY;
                const canvasHeight = k.height();
                return canvasHeight - mapHeight;
            }
        };

        // Create the gameManager
        const mapWidth = dataLevel.width * dataLevel.tilewidth;
        const mapHeight = dataLevel.height * dataLevel.tileheight;
        gameManager = new GameManager(k, mapWidth, mapHeight, dataLevel.tilewidth, dataLevel.tileheight);
        gameManager.setLevelControl(levelControl);
        uiManager.setLevelControl(levelControl);

        // Appliquer le scaling initial
        updateScaling();
    }

    // Initialisation
    initializeMap();

    // Sur resize, juste mettre à jour le scaling
    const resizeHandler = onResize(() => {
        console.log("RESIZE EVENT TRIGGERED");
        updateScaling();
    });



    return levelControl;
}

function setMapColliders(k, mapPart, colliders) {
    const colliderObjects = [];

    for (const collider of colliders) {
        const colliderObj = mapPart.add([
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

function setMapBorders(k, tilewidth, mapheight, mapWidth) {
    const borderLeft = k.add([
        k.rect(tilewidth, mapheight),
        k.area(),
        k.opacity(0),
        k.body({ isStatic: true }),
        k.pos(-128, 0),
        "borderLeft",
    ]);

    const borderRight = k.add([
        k.rect(tilewidth, mapheight),
        k.area(),
        k.opacity(0),
        k.body({ isStatic: true }),
        k.pos(mapWidth, 0),
        "borderRight",
    ]);

    // Return references to the borders so they can be updated
    return { left: borderLeft, right: borderRight };
}

function setHolograms(k, hologramsMapPosition) {
    const holograms = [];

    const hologramsConfig = {
        hologramPortfolio: {
            sprite: "portfolioHologram",
            scale: 0.6,
            yOffset: 10,
        },
        hologramCV: {
            sprite: "cvHologram",
            scale: 0.6,
            yOffset: 10,
        },
        hologramContact: {
            sprite: "contactHologram",
            scale: 0.6,
            yOffset: 10,
        },
        citySign: {
            sprite: deviceInfo.isMobile || deviceInfo.isTouchEnabled ? "citySignMobile" : "citySign",
            scale: 1,
            yOffset: 0,
        },
    };

    for (const position of hologramsMapPosition) {
        const config = hologramsConfig[position.name];

        if (!config) continue; // Ignore positions not in the config
        //("---------------------------------------------------");
        //console.log(config.sprite);
        const hologram = world.add([
            k.sprite(config.sprite, position.name === "citySign" ? {} : { anim: "hologram" }),
            k.area(),
            k.anchor("bot"),
            k.pos(position.x, position.y), // Position originale de Tiled
            k.scale(config.scale),
            k.offscreen({ hidden: true, padding: 2000 }),
            k.z(1),
            config.sprite,
        ]);

        if (hologram.is(config.sprite)) {
            //debug.log("IT IS TRUE!");
        }

        const originalAnimSpeed = hologram.animSpeed || 1;

        // If not a city sign then we want a pointer cursor when user hover the gameobject
        if (position.name !== "citySign") {
            hologram.onHover(() => {
                k.setCursor("pointer");
            });

            hologram.onHoverEnd(() => {
                k.setCursor("default");
            });

            hologram.onEnterScreen(() => {
                hologram.hidden = false;
            });

            hologram.onExitScreen(() => {
                hologram.hidden = true;
            });
        }
        else {
            // Special animation for citySign
            k.wait(0.1, () => {
                delayedLoop(k, hologram, "hologram", 5);
            });
        }

        // Mémoriser la position originale et le scale
        holograms.push({
            object: hologram,
            originalX: position.x,
            originalY: position.y + config.yOffset,
            originalScale: config.scale,
        });
        //console.log(hologram.pos.x);
        //console.log(hologram.pos.y)
    }

    return holograms;
}

function delayedLoop(k, animatedObject, animationName, delayInSeconds) {
    if (!animatedObject.exists()) return;
    animatedObject.play(animationName);

    k.loop(delayInSeconds, () => {
        if (animatedObject.exists() && !gameState.isGamePaused) {
            animatedObject.play(animationName);
        }

    })
}
// for (const position of hologramsMapPosition) {
//     const config = hologramsConfig[position.name];

//     if (!config) continue; // Ignore positions not in the config

//     const hologram = k.add([
//         k.sprite(config.sprite, position.name === "citySign" ? {} : { anim: "hologram" }),
//         k.area(),
//         k.anchor("bot"),
//         k.pos(position.x, position.y), // Initial position from Tiled
//         k.scale(config.scale),
//         k.offscreen({ hidden: true, padding: 2000 }),
//         config.sprite,
//     ]);

//     const originalAnimSpeed = hologram.animSpeed || 1;

//     // If not a city sign then we want a pointer cursor when user hover the gameobject
//     if (position.name !== "citySign") {
//         hologram.onHover(() => {
//             k.setCursor("pointer");
//         });

//         hologram.onHoverEnd(() => {
//             k.setCursor("default");
//         });

//         hologram.onEnterScreen(() => {
//             hologram.hidden = false;


//         });

//         hologram.onExitScreen(() => {
//             hologram.hidden = true;
//         });
//     }
//     else {
//         // Special animation for citySign
//         // k.wait(0.1, () => {
//         //     delayedLoop(k, hologram, "hologram", 5);
//         // });
//     }

//     // Store both the hologram object and its original Tiled position
//     holograms.push({
//         object: hologram,
//         originalX: position.x,
//         originalY: position.y + config.yOffset,
//         scale: config.scale,
//     });
//     console.log(hologram.pos.x);
//     console.log(hologram.pos.y);
// }


//d}