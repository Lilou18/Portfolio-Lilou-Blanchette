import kaplay from "https://unpkg.com/kaplay@3001/dist/kaplay.mjs";
import { deviceInfo } from "./deviceInfo.js";

export const k = kaplay({
    canvas: document.getElementById("gameCanvas"),
    background: [167, 234, 252],
    width: 1920,
    height: 1080,
    stretch: true,
    letterbox: false,
    crisp: false,
    pixelDensity: Math.min(devicePixelRatio, 2),
    touchToMouse: true,
    texFilter: "linear",
    //     //debug = false;
});




k.loadSprite("levelP1", "./map/levelP1.png");

k.loadSprite("levelP2", "./map/levelP2.png");

k.loadSprite("levelP3", "./map/levelP3.png");

k.loadSprite("player", "./assets/monsterWalkingIdleJump.png", {
    sliceX: 6,
    sliceY: 5,
    anims: {
        idle: 17,
        run: {
            from: 0,
            to: 16,
            speed: 20,
            loop: true,
        },
        jump: {
            from: 18,
            to: 21,
            speed: 15,
        },
        fall: {
            from: 22,
            to: 25,
            speed: 15,
        }
    },
});

k.loadSprite("enemyNormal", "./assets/enemyYellow.png", {
    sliceX: 9,
    sliceY: 1,
    anims: {
        walk: {
            from: 0,
            to: 8,
            speed: 15,
            loop: true,
        },
    },
})

k.loadSprite("enemyFast", "./assets/enemyOrange.png", {
    sliceX: 9,
    sliceY: 1,
    anims: {
        walk: {
            from: 0,
            to: 8,
            speed: 15,
            loop: true,
        },
    },
})

k.loadSprite("enemyVeryFast", "./assets/enemyRed.png", {
    sliceX: 9,
    sliceY: 1,
    anims: {
        walk: {
            from: 0,
            to: 8,
            speed: 15,
            loop: true,
        },
    },
})

// k.loadSprite("portfolioHologram", "./assets/hologramPortfolio.png", {
//     sliceX: 19,
//     sliceY: 1,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 18,
//             speed: 15,
//             loop: true,
//         }
//     }
// });

// k.loadSprite("contactHologram", "./assets/hologramContact.png", {
//     sliceX: 19,
//     sliceY: 1,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 18,
//             speed: 15,
//             loop: true,
//         }
//     }
// });

// k.loadSprite("cvHologram", "./assets/hologramCV.png", {
//     sliceX: 19,
//     sliceY: 1,
//     anims: {
//         hologram: {
//             from: 0,
//             to: 18,
//             speed: 15,
//             loop: true,
//         }
//     }
// });

k.loadSprite("cvHologram", "./assets/hologramCVMobile.png", {
    sliceX: 3,
    sliceY: 3,
    anims: {
        hologram: {
            from: 0,
            to: 8,
            speed: 8,
            loop: true,
        }
    }
});

k.loadSprite("portfolioHologram", "./assets/hologramPortfolioMobile.png", {
    sliceX: 3,
    sliceY: 3,
    anims: {
        hologram: {
            from: 0,
            to: 8,
            speed: 8,
            loop: true,
        }
    }
});

k.loadSprite("contactHologram", "./assets/hologramContactMobile.png", {
    sliceX: 3,
    sliceY: 3,
    anims: {
        hologram: {
            from: 0,
            to: 8,
            speed: 8,
            loop: true,
        }
    }
});


k.loadSprite("collectible", "./assets/collectible.png", {
    sliceX: 31,
    sliceY: 1,
    anims: {
        mug: {
            from: 0,
            to: 30,
            speed: 12,
            loop: true,
        }
    }
});

k.loadSprite("citySign", "./assets/citySign.png", {
    sliceX: 17,
    sliceY: 1,
    anims: {
        hologram: {
            from: 0,
            to: 16,
            speed: 15,
            loop: false,
        }
    }
});

k.loadSprite("citySignMobile", "./assets/citySignMobile.png", {
    sliceX: 3,
    sliceY: 3,
    anims: {
        hologram: {
            from: 0,
            to: 6,
            speed: 10,
            loop: false,
        }
    }
});




k.loadFont("orbitron", "./fonts/static/Orbitron-Regular.ttf");

k.loadSound("backgroundMusic", "sounds/funky-quirky-upbeat-commercial-music-392401_eUPATFbC.mp3");

k.loadSound("hitSFX", "sounds/soft-body-impact-295404.mp3");

k.loadSound("collectibleSFX", "sounds/water-drip-45622.mp3");