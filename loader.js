import kaplay from "https://unpkg.com/kaplay@3001/dist/kaplay.mjs";

export const k = kaplay({
    canvas : document.getElementById("gameCanvas"),
    //background: [115, 204, 255],
    background: [167, 234, 252],
    // background: [61, 66, 74],
    // background: [68, 196, 242],
    width: window.innerWidth,
    height: window.innerHeight,
    //fit: true,
    stretch: true,
    pixelDensity: 2,
    //debug = false;
});

k.loadSprite("level", "./map/level2.png");

k.loadSprite("player", "./assets/monsterWalkingIdleJump.png", {
    sliceX: 28,
    sliceY: 1,
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
    anims:{
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
    anims:{
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
    anims:{
        walk: {
            from: 0,
            to: 8,
            speed: 15,
            loop: true,
        },
    },
})

k.loadSprite("portfolioHologram", "./assets/hologramPortfolio.png", {
    sliceX: 19,
    sliceY: 1,
    anims: {
        hologram: {
            from: 0,
            to: 18,
            speed: 15,
            loop: true,
        }
    }
});

k.loadSprite("contactHologram", "./assets/hologramContact.png", {
    sliceX: 19,
    sliceY: 1,
    anims: {
        hologram: {
            from: 0,
            to: 18,
            speed: 15,
            loop: true,
        }
    }
});

k.loadSprite("cvHologram", "./assets/hologramCV.png", {
    sliceX: 19,
    sliceY: 1,
    anims: {
        hologram: {
            from: 0,
            to: 18,
            speed: 15,
            loop: true,
        }
    }
});

k.loadSprite("collectible", "./assets/collectible.png", {
    sliceX: 31,
    sliceY: 1,
    anims: {
        mug:{
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



k.loadFont("orbitron", "./fonts/static/Orbitron-Regular.ttf");