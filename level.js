import { GameManager } from "./gameManager.js";
import { handlePauseAnimation } from "./animationManager.js";
import { soundManager } from "./soundManager.js";
import { deviceInfo } from "./deviceInfo.js";
import { gameState } from "./gameState.js";
export function level(k, dataLevel, onScalingReady) {


    let test = k.add([
        k.text(`FPS: `, {
            size: 30,
            font: "orbitron"
        }),
        k.pos(0, 0),
        k.color(0, 255, 0),
        k.fixed(),
        k.z(2),
        "test"
    ]);
    let timer = 0;
    let frames = 0;

    k.onUpdate(() => {
        timer += k.dt();
        frames++;

        if (timer >= 1) {
            test.text = "FPS: " + frames;
            frames = 0;
            timer = 0;
        }
    });

    // debug.inspect = true

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

    let scalingInitialized = false;

    k.onDraw(() => {
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
        "border",
    ]);


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
            k.offscreen({ hidden: true, padding: 2000 }),
            config.sprite,
        ]);

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

        // Store both the hologram object and its original Tiled position
        holograms.push({
            object: hologram,
            originalX: position.x,
            originalY: position.y + config.yOffset,
            scale: config.scale,
        });



        hologram.onUpdate(() => {
            if (handlePauseAnimation(hologram, originalAnimSpeed)) {
                return;
            }
        })
    }

    // holograms.forEach(hologram => {
    //     handlePauseAnimation(hologram.object);
    // });

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

function updateHologramPositions(k, holograms, scale, mapOffsetY) {
    for (const hologramData of holograms) {
        // Calculate the scaled position relative to the map's new position
        hologramData.object.pos.x = hologramData.originalX * scale;
        hologramData.object.pos.y = mapOffsetY + (hologramData.originalY * scale);

        // Update scale - combine the original scale (0.6) with the map scale
        hologramData.object.scale = k.vec2(hologramData.scale * scale);
    }
}