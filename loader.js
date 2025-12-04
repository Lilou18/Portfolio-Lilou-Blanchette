import kaplay from "https://unpkg.com/kaplay@3001/dist/kaplay.mjs";

export const k = kaplay({
    canvas: document.getElementById("gameCanvas"),
    background: [167, 234, 252],
    width: 1920,
    height: 1080,
    stretch: true,
    letterbox: false,
    pixelDensity: 1, // IMPORTANT: Changé de 2 à 1 pour mobile
    touchToMouse: true,
});

// Variables pour tracker le chargement
let assetsLoaded = false;
const loadErrors = [];

// Wrapper pour tracker les erreurs de chargement
function safeLoadSprite(name, path, options) {
    try {
        k.loadSprite(name, path, options);
        console.log(`✓ Loading sprite: ${name}`);
        debug.log(`✓ Loading sprite: ${name}`);
    } catch (e) {
        console.error(`✗ Failed to load sprite ${name}:`, e);
        debug.log(`✗ Failed to load sprite ${name}:`, e);
        loadErrors.push({ type: 'sprite', name, path, error: e });
    }
}

function safeLoadSound(name, path) {
    try {
        k.loadSound(name, path);
        console.log(`✓ Loading sound: ${name}`);
    } catch (e) {
        console.error(`✗ Failed to load sound ${name}:`, e);
        loadErrors.push({ type: 'sound', name, path, error: e });
    }
}

// Chargement des sprites avec tracking
safeLoadSprite("level", "./map/level2.png");

safeLoadSprite("player", "./assets/monsterWalkingIdleJump.png", {
    sliceX: 28,
    sliceY: 1,
    anims: {
        idle: 17,
        run: { from: 0, to: 16, speed: 20, loop: true },
        jump: { from: 18, to: 21, speed: 15 },
        fall: { from: 22, to: 25, speed: 15 }
    },
});

safeLoadSprite("enemyNormal", "./assets/enemyYellow.png", {
    sliceX: 9,
    sliceY: 1,
    anims: { walk: { from: 0, to: 8, speed: 15, loop: true } }
});

safeLoadSprite("enemyFast", "./assets/enemyOrange.png", {
    sliceX: 9,
    sliceY: 1,
    anims: { walk: { from: 0, to: 8, speed: 15, loop: true } }
});

safeLoadSprite("enemyVeryFast", "./assets/enemyRed.png", {
    sliceX: 9,
    sliceY: 1,
    anims: { walk: { from: 0, to: 8, speed: 15, loop: true } }
});

safeLoadSprite("portfolioHologram", "./assets/hologramPortfolio.png", {
    sliceX: 19,
    sliceY: 1,
    anims: { hologram: { from: 0, to: 18, speed: 15, loop: true } }
});

safeLoadSprite("contactHologram", "./assets/hologramContact.png", {
    sliceX: 19,
    sliceY: 1,
    anims: { hologram: { from: 0, to: 18, speed: 15, loop: true } }
});

safeLoadSprite("cvHologram", "./assets/hologramCV.png", {
    sliceX: 19,
    sliceY: 1,
    anims: { hologram: { from: 0, to: 18, speed: 15, loop: true } }
});

safeLoadSprite("collectible", "./assets/collectible.png", {
    sliceX: 31,
    sliceY: 1,
    anims: { mug: { from: 0, to: 30, speed: 12, loop: true } }
});

safeLoadSprite("citySign", "./assets/citySign.png", {
    sliceX: 17,
    sliceY: 1,
    anims: { hologram: { from: 0, to: 16, speed: 15, loop: false } }
});

safeLoadSprite("citySignMobile", "./assets/citySignMobile.png", {
    sliceX: 17,
    sliceY: 1,
    anims: { hologram: { from: 0, to: 16, speed: 15, loop: false } }
});

k.loadFont("orbitron", "./fonts/static/Orbitron-Regular.ttf");

safeLoadSound("backgroundMusic", "sounds/funky-quirky-upbeat-commercial-music-392401_eUPATFbC.mp3");
safeLoadSound("hitSFX", "sounds/soft-body-impact-295404.mp3");
safeLoadSound("collectibleSFX", "sounds/water-drip-45622.mp3");

export function getLoadErrors() {
    return loadErrors;
}

export function isAssetsLoaded() {
    return assetsLoaded;
}

// Fonction simplifiée - ne crée PAS de nouvelle Promise avec k.onLoad
export function waitForAssets() {
    return new Promise((resolve) => {
        if (assetsLoaded) {
            resolve();
            return;
        }
        
        // Timeout de sécurité pour mobile
        const timeout = setTimeout(() => {
            console.warn("⚠️ Asset loading timeout - continuing anyway");
            if (loadErrors.length > 0) {
                console.error("Load errors:", loadErrors);
            }
            assetsLoaded = true;
            resolve();
        }, 10000); // 10 secondes max
        
        k.onLoad(() => {
            clearTimeout(timeout);
            assetsLoaded = true;
            console.log("✓ All assets loaded successfully!");
            if (loadErrors.length > 0) {
                console.error("⚠️ Some assets failed to load:", loadErrors);
                debug.log("ERROR Some assets failed to load:", loadErrors);
            }
            resolve();
        });
    });
}