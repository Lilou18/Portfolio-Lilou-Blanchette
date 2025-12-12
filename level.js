import { GameManager } from "./gameManager.js";
import { pauseAnimation } from "./animationManager.js";
import { soundManager } from "./soundManager.js";
import { deviceInfo } from "./deviceInfo.js";
export function level(k, dataLevel, onScalingReady) {


    // ===== FPS COUNTER OPTIMISÉ =====
    // let fps = 60;
    // let frames = 0;
    // let lastTime = performance.now();

    // const fpsText = k.add([
    //     k.text("FPS: 60", { size: 20 }),
    //     k.pos(10, 10),
    //     k.fixed(),
    //     k.z(1000),
    //     k.color(0, 255, 0)
    // ]);

    // // Un SEUL onUpdate pour le FPS
    // k.onUpdate(() => {
    //     frames++;
    //     const now = performance.now();

    //     // Mettre à jour seulement toutes les 500ms
    //     if (now >= lastTime + 500) {
    //         fps = Math.round((frames * 1000) / (now - lastTime));
    //         frames = 0;
    //         lastTime = now;

    //         fpsText.text = `FPS: ${fps}`;

    //         // Couleur selon performance
    //         if (fps < 30) {
    //             fpsText.color = k.rgb(255, 0, 0);
    //         } else if (fps < 50) {
    //             fpsText.color = k.rgb(255, 255, 0);
    //         } else {
    //             fpsText.color = k.rgb(0, 255, 0);
    //         }
    //     }
    // });

    // ===== FIN FPS COUNTER =====
    // debug.inspect = true
    //k.setCamPos(0, 0);
    //let posTest = k.getCamPos();
    //console.log(posTest);
    //k.setCamPos(526.5,560);
    k.setGravity(1400);

    const levelLayers = dataLevel.layers;

    const mapPart1 = k.add([k.pos(0, 0), k.sprite("levelP1")]);
    const mapPart2 = k.add([k.pos(2176, 0), k.sprite("levelP2")]);
    const mapPart3 = k.add([k.pos(4352, 0), k.sprite("levelP3")]);

    const mapParts = [mapPart1, mapPart2, mapPart3];

    const colliders = [];
    for (const layer of levelLayers) {
        if (layer.name === "colliders") {
            colliders.push(...layer.objects);
            break;
        }
    }

    const mapWidth = dataLevel.width * dataLevel.tilewidth;
    const mapHeight = dataLevel.height * dataLevel.tileheight;
    const gameManager = new GameManager(k, mapWidth, mapHeight, dataLevel.tilewidth, dataLevel.tileheight);

    soundManager.addSoundSettingsBtn();

    let borderLeft = null;
    let borderRight = null;
    let holograms = [];

    // k.mapScale = 1;
    // k.mapOffsetY = 0;

    let scalingInitialized = false;

    k.onDraw(() => {
        // if (map.width > 0 && map.height > 0 && !scalingInitialized) {
        if (mapPart1.height > 0 && mapPart2.height > 0 && mapPart3.height && !scalingInitialized) {

            const scale = k.height() / mapPart1.height;

            mapParts.forEach((part, index) => {
                part.scale = k.vec2(scale);
                // Adjust the position with the new scale
                part.pos.x = (index * 2176) * scale;

                // Align the bottom of the map with the bottom of the screen
                part.pos.y = k.height() - (part.height * scale);
            });

            const newHeight = mapPart1.height * scale;
            const mapOffsetY = k.height() - newHeight;
            // map.scale = k.vec2(scale);

            // Align the bottom of the map with the bottom of the screen
            // const newHeight = map.height * scale;
            // map.pos.y = k.height() - newHeight;

            const scaledMapWidth = mapWidth * scale;
            const scaledMapHeight = mapHeight * scale;

            // Update or create borders with scaled dimensions
            if (borderLeft) {
                borderLeft.pos.x = -128;
                borderLeft.pos.y = k.height() - scaledMapHeight;
                borderLeft.width = dataLevel.tilewidth;
                borderLeft.height = scaledMapHeight;
            }

            if (borderRight) {
                borderRight.pos.x = scaledMapWidth;
                borderRight.pos.y = k.height() - scaledMapHeight;
                borderRight.width = dataLevel.tilewidth;
                borderRight.height = scaledMapHeight;
            }

            if (holograms) {
                // Update hologram positions
                updateHologramPositions(k, holograms, scale, mapOffsetY);

            }
            if (gameManager) {
                gameManager.updateScale(scale, mapOffsetY);
            }

            // Store the current scale and map offset for other objects to use
            k.mapScale = scale;
            k.mapOffsetY = mapOffsetY;
            // k.mapOffsetY = map.pos.y;

            // Call the callback only once when scaling is first initialized
            if (!scalingInitialized && onScalingReady) {
                scalingInitialized = true;
                // console.log("Scaling initialized - calling callback");
                // Use k.wait to ensure it's called in the next frame
                k.wait(0, onScalingReady);
            }

            const player = k.get("player")[0];
            if (player) {
                player.scale = k.vec2(scale);
            }

        }

    });

    setMapColliders(k, mapPart1, colliders);
    // Create borders and store references
    const borders = setMapBorders(k, dataLevel.tilewidth, mapHeight, mapWidth);
    borderLeft = borders.left;
    borderRight = borders.right;

    //setHologram(k, levelLayers[2].objects);
    holograms = setHologram(k, levelLayers[6].objects);

    // gameManager.initiateSpawn();
}

function setMapColliders(k, mapPart, colliders) {
    for (const collider of colliders) {
        mapPart.add([
            k.pos(collider.x, collider.y),
            k.area({
                shape: new k.Rect(k.vec2(0), collider.width, collider.height)
            }),
            k.body({ isStatic: true }),
            "collider"
        ]);
    }

}

function setMapBorders(k, tilewidth, mapheight, mapWidth) {
    const borderLeft = k.add([
        k.rect(tilewidth, mapheight),
        k.area(),
        k.opacity(0), // Make invisible (was opacity(1))
        k.body({ isStatic: true }),
        k.pos(-128, 0),
        "borderLeft",
    ]);

    const borderRight = k.add([
        k.rect(tilewidth, mapheight),
        k.area(),
        k.opacity(0), // Make invisible (was opacity(1))
        k.body({ isStatic: true }),
        k.pos(mapWidth, 0),
        "border",
    ]);

    // console.log("Initial map width:", mapWidth);

    // Return references to the borders so they can be updated
    return { left: borderLeft, right: borderRight };
}

function setHologram(k, mapPositions) {
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

    for (const position of mapPositions) {
        const config = hologramsConfig[position.name];

        if (!config) continue; // Ignore positions not in the config

        const hologram = k.add([
            k.sprite(config.sprite, position.name === "citySign" ? {} : { anim: "hologram" }),
            k.area(),
            k.anchor("bot"),
            k.pos(position.x, position.y), // Initial position from Tiled
            k.scale(config.scale),
            config.sprite,
        ]);

        // If not a city sign then we when a pointer cursor when user hover the gameobject
        if (position.name !== "citySign") {
            hologram.onHover(() => {
                k.setCursor("pointer");
            });

            hologram.onHoverEnd(() => {
                k.setCursor("default");
            });
        }
        else {
            // Special animation for citySign
            k.wait(0.1, () => {
                delayedLoop(k, hologram, "hologram", 5);
            });
        }

        // Store both the hologram object and its original Tiled position
        holograms.push({
            object: hologram,
            originalX: position.x,
            originalY: position.y + config.yOffset,
            scale: config.scale,
        });
    }

    holograms.forEach(hologram => {
        pauseAnimation(hologram.object);
    });

    return holograms;
}

function delayedLoop(k, animatedObject, animationName, delayInSeconds) {
    if (!animatedObject.exists()) return;
    animatedObject.play(animationName);

    k.loop(delayInSeconds, () => {

        animatedObject.play(animationName);
    })
}

function updateHologramPositions(k, holograms, scale, mapOffsetY) {
    for (const hologramData of holograms) {
        // Calculate the scaled position relative to the map's new position
        hologramData.object.pos.x = hologramData.originalX * scale;
        hologramData.object.pos.y = mapOffsetY + (hologramData.originalY * scale);

        // Update scale - combine the original scale (0.6) with the map scale
        hologramData.object.scale = k.vec2(hologramData.scale * scale);
    }
}