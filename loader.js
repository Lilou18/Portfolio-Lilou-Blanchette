import kaplay from "https://unpkg.com/kaplay@4000.0.0-alpha.26/dist/kaplay.mjs";

export const k = kaplay({
    canvas: document.getElementById("gameCanvas"),
    background: "#5ba675",
    texFilter: "linear",
    crisp: false,
    touchToMouse: true,
    //pixelDensity: 2,
    maxFPS: 60,
    pixelDensity: 1,
});

loadSprite("levelP1", "./assets/levelP1.png");
loadSprite("levelP2", "./assets/levelP2.png");
loadSprite("levelP3", "./assets/levelP3.png");

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

// k.loadSprite("collectible", "./assets/collectible.png", {
//     sliceX: 6,
//     sliceY: 6,
//     anims: {
//         mug: {
//             from: 0,
//             to: 30,
//             speed: 12,
//             loop: true,
//         }
//     }
// });

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

loadSprite("cvHologram", "./assets/hologramCVMobile.png", {
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

loadSprite("portfolioHologram", "./assets/hologramPortfolioMobile.png", {
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

loadSprite("contactHologram", "./assets/hologramContactMobile.png", {
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

loadSprite("citySign", "./assets/citySign.png", {
    sliceX: 5,
    sliceY: 4,
    anims: {
        hologram: {
            from: 0,
            to: 16,
            speed: 15,
            loop: false,
        }
    }
});

loadSprite("citySignMobile", "./assets/citySignMobile.png", {
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

loadFont("orbitron", "./fonts/static/Orbitron-Regular.ttf");