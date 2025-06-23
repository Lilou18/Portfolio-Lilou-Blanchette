import kaplay from "https://unpkg.com/kaplay@3001/dist/kaplay.mjs";

export const k = kaplay({
    canvas : document.getElementById("gameCanvas"),
    background: [115, 204, 255],
    // background: [61, 66, 74],
    // background: [68, 196, 242],
    width: window.innerWidth,
    height: window.innerHeight,
    //fit: true,
    stretch: true,
    pixelDensity: 2,
    //debug = false;
});

console.log("DISPLAY");
k.loadSprite("level", "./map/level.png");

k.loadSprite("player", "./assets/monsterWalking.png", {
    sliceX: 17,
    sliceY: 1,
    anims: {
        idle: 0,
        run: {
            from: 0,
            to: 16,
            speed: 20,
            loop: true,
        },
    },
});

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



k.loadFont("orbitron", "./fonts/static/Orbitron-Regular.ttf");