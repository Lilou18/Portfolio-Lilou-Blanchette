import kaplay from "https://unpkg.com/kaplay@3001/dist/kaplay.mjs";
import { deviceInfo } from "./deviceInfo.js";

function getResolution() {
    const isTouchDevice = deviceInfo.isMobile || deviceInfo.isTouchEnabled;
    const screenWidth = window.innerWidth;

    let targetWidth, targetHeight;

    if (isTouchDevice) {
        // Tous les appareils touch : résolution réduite pour performance
        if (screenWidth < 768) {
            // Téléphones
            targetWidth = 960;
            targetHeight = 540;
        } else {
            // Tablettes (iPad, etc.)
            targetWidth = 1024;
            targetHeight = 576;
        }
    } else {
        // Desktop : pleine résolution
        targetWidth = 1920;
        targetHeight = 1080;
    }

    console.log(`🎮 Résolution du jeu: ${targetWidth}×${targetHeight}`);
    console.log(`📱 Touch device: ${isTouchDevice}`);
    console.log("SCREEN WIDTH " + screenWidth);

    return { width: targetWidth, height: targetHeight };
}

const resolution = getResolution();

export const k = kaplay({
    canvas: document.getElementById("gameCanvas"),
    background: [167, 234, 252],
    width: resolution.width,
    height: resolution.height,
    stretch: true,
    letterbox: false,
    crisp: false,
    pixelDensity: 1,
    touchToMouse: true,
    texFilter: "linear",
    //     //debug = false;
});

// ============ GESTION D'ERREURS GLOBALE ============

// Créer un div pour afficher les erreurs
const errorDiv = document.createElement('div');
errorDiv.id = 'error-display';
errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    color: #ff0000;
    font-family: monospace;
    padding: 20px;
    overflow: auto;
    z-index: 10000;
    display: none;
    font-size: 14px;
    white-space: pre-wrap;
    word-wrap: break-word;
`;
document.body.appendChild(errorDiv);

function displayError(title, message) {
    errorDiv.style.display = 'block';
    errorDiv.innerHTML += `<div style="margin-bottom: 20px; border-bottom: 1px solid #ff0000;">
        <strong style="color: #ffff00;">${title}</strong>
        <p>${message}</p>
    </div>`;
    console.error(`${title}: ${message}`);
}

window.onerror = function (msg, url, lineNo, columnNo, error) {
    const errorMsg = `
Message: ${msg}
File: ${url}
Line: ${lineNo}
Column: ${columnNo}
Stack: ${error ? error.stack : 'No stack'}`;

    displayError('❌ UNHANDLED ERROR', errorMsg);
    return false;
};

window.addEventListener('error', (event) => {
    displayError('❌ ERROR EVENT', `${event.message}\n${event.filename}:${event.lineno}\n${event.error?.stack || ''}`);
});

window.addEventListener('unhandledrejection', (event) => {
    displayError('❌ UNHANDLED PROMISE', String(event.reason));
});

// ============ FIN GESTION D'ERREURS ============


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