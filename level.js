import { GameManager } from "./gameManager.js";
export function level(k, dataLevel) {

    //k.setCamPos(0, 0);
    //let posTest = k.getCamPos();
    //console.log(posTest);
    //k.setCamPos(526.5,560);
    k.setGravity(1400);

    const levelLayers = dataLevel.layers;

    const map = k.add([k.pos(0, 0), k.sprite("level")]);

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

    let borderLeft = null;
    let borderRight = null;
    let holograms = [];

    k.onDraw(() => {
        if (map.width > 0 && map.height > 0) {

            const scale = k.height() / map.height;
            map.scale = k.vec2(scale);

            // Optionnel : centrer horizontalement
            //const newWidth = map.width * scale;
            //map.pos.x = (k.width() - newWidth) / 2;

            // Align the bottom of the map with the bottom of the screen
            const newHeight = map.height * scale;
            map.pos.y = k.height() - newHeight;

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
                updateHologramPositions(k, holograms, scale, map.pos.y);

            }
            if (gameManager) {
                gameManager.updateScale(scale, map.pos.y);
            }

            // Store the current scale and map offset for other objects to use
            k.mapScale = scale;
            k.mapOffsetY = map.pos.y;

            const player = k.get("player")[0];
            if (player) {
                player.scale = k.vec2(scale);
            }

        }

    });

    setMapColliders(k, map, colliders);
    // Create borders and store references
    const borders = setMapBorders(k, dataLevel.tilewidth, mapHeight, mapWidth);
    borderLeft = borders.left;
    borderRight = borders.right;

    //setHologram(k, levelLayers[2].objects);
    holograms = setHologram(k, levelLayers[5].objects);

    // gameManager.initiateSpawn();
}

function setMapColliders(k, map, colliders) {
    for (const collider of colliders) {
        map.add([
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

    console.log("Initial map width:", mapWidth);

    // Return references to the borders so they can be updated
    return { left: borderLeft, right: borderRight };
}

function setHologram(k, mapPositions) {
    const holograms = [];

    for (const position of mapPositions) {
        if (position.name === "hologramPortfolio") {
            const portfolioHologram = k.add([
                k.sprite("portfolioHologram", { anim: "hologram" }),
                k.area(),
                k.anchor("bot"),
                k.pos(position.x, position.y), // Initial position from Tiled
                k.scale(0.6),
                "portfolioHologram",
            ]);

            // Store both the hologram object and its original Tiled position
            holograms.push({
                object: portfolioHologram,
                originalX: position.x,
                originalY: position.y + 10
            });
        }
        else if (position.name === "cvPortfolio") {
            const portfolioHologram = k.add([
                k.sprite("portfolioHologram", { anim: "hologram" }),
                k.area(),
                k.anchor("bot"),
                k.pos(position.x, position.y), // Initial position from Tiled
                k.scale(0.6),
                "cvHologram",
            ]);

            // Store both the hologram object and its original Tiled position
            holograms.push({
                object: portfolioHologram,
                originalX: position.x,
                originalY: position.y + 10
            });

        }
        else if (position.name === "hologramContact") {
            const portfolioHologram = k.add([
                k.sprite("portfolioHologram", { anim: "hologram" }),
                k.area(),
                k.anchor("bot"),
                k.pos(position.x, position.y), // Initial position from Tiled
                k.scale(0.6),
                "contactHologram",
            ]);
            // Store both the hologram object and its original Tiled position
            holograms.push({
                object: portfolioHologram,
                originalX: position.x,
                originalY: position.y + 10
            });
        }
    }

    return holograms;
}

function updateHologramPositions(k, holograms, scale, mapOffsetY) {
    for (const hologramData of holograms) {
        // Calculate the scaled position relative to the map's new position
        hologramData.object.pos.x = hologramData.originalX * scale;
        hologramData.object.pos.y = mapOffsetY + (hologramData.originalY * scale);

        // Update scale - combine the original scale (0.6) with the map scale
        hologramData.object.scale = k.vec2(0.6 * scale);
    }
}