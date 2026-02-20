import kaplay from "https://unpkg.com/kaplay@4000.0.0-alpha.26/dist/kaplay.mjs";
import { deviceInfo } from "./deviceInfo.js";

/**
 * Kaplay instance.
 */
export const k = kaplay({
    canvas: document.getElementById("gameCanvas"),
    background: "#60b07c",
    texFilter: "linear",
    crisp: false,
    touchToMouse: true,
    maxFPS: 60,
    pixelDensity: 1,
    narrowPhaseCollisionAlgorithm: "sat",
    broadPhaseCollisionAlgorithm: "sap",
});

k.loadFont("orbitron", "./src/fonts/static/Orbitron-Regular.ttf", { size: 128 });

/**
 * Sprites configurations.
 */
const spriteConfig = {
    levelP1: {
        medium: {
            src: "./src/assets/levelP1Medium.png",
            options: {},
        },
        large: {
            src: "./src/assets/levelP1.png",
            options: {},
        },
    },
    levelP2: {
        medium: {
            src: "./src/assets/levelP2Medium.png",
            options: {},
        },
        large: {
            src: "./src/assets/levelP2.png",
            options: {},
        },
    },
    levelP3: {
        medium: {
            src: "./src/assets/levelP3Medium.png",
            options: {},
        },
        large: {
            src: "./src/assets/levelP3.png",
            options: {},
        },
    },
    citySign: {
        medium: {
            src: "./src/assets/citySignMedium.png",
            options: {
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
            },
        },
        large: {
            src: "./src/assets/citySign.png",
            options: {
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
            },
        },
    },
    hologramCV: {
        medium: {
            src: "./src/assets/hologramCVMedium.png",
            options: {
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
            },
        },
        large: {
            src: "./src/assets/hologramCV.png",
            options: {
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
            },
        },
    },
    hologramPortfolio: {
        medium: {
            src: "./src/assets/hologramPortfolioMedium.png",
            options: {
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
            },
        },
        large: {
            src: "./src/assets/hologramPortfolio.png",
            options: {
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
            },
        },
    },
    hologramContact: {
        medium: {
            src: "./src/assets/hologramContactMedium.png",
            options: {
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
            },
        },
        large: {
            src: "./src/assets/hologramContact.png",
            options: {
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
            },
        },
    },
    collectible: {
        large: {
            src: "./src/assets/collectible.png",
            options: {
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
            },
        },
    },
    player: {
        large: {
            src: "./src/assets/monsterWalkingIdleJump.png",
            options: {
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
            },
        },
    },
    enemyNormal: {
        large: {
            src: "./src/assets/enemyNormal.png",
            options: {
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
            },
        },
    },
    enemyFast: {
        large: {
            src: "./src/assets/enemyFast.png",
            options: {
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
            },
        },
    },
    enemyVeryFast: {
        large: {
            src: "./src/assets/enemyVeryFast.png",
            options: {
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
            },
        },
    },
};

/**
 * If the device used is a cellphone or a tablet/Ipad then we use the
 * medium sprite otherwise we use the large sprite.
 * 
 * @returns {string} Size of the sprite
 */
export function getSpriteSizeCategory() {
    if (deviceInfo.isIpad || deviceInfo.isTablet || deviceInfo.isMobile) {
        return "medium";
    }
    else {
        // Desktop
        return "large";
    }
};

/**
 * Load the appropriate sprite for the device used.
 * 
 * @param {string} spriteName Name of the sprite to load
 * @returns 
 */
function loadAppropriateSprites(spriteName) {
    const sizeCategory = getSpriteSizeCategory();
    const config = spriteConfig[spriteName];

    if (!config) {
        console.warn(`Sprite ${spriteName} not found in config`);
        return `./src/assets/${spriteName}.png`; // fallback
    }

    const spriteData = config[sizeCategory] || config.large;

    k.loadSprite(spriteName, spriteData.src, spriteData.options);
};

/**
 * Load all the game sprites.
 */
loadAppropriateSprites("levelP1");
loadAppropriateSprites("levelP2");
loadAppropriateSprites("levelP3");

loadAppropriateSprites("citySign");
loadAppropriateSprites("hologramCV");
loadAppropriateSprites("hologramPortfolio");
loadAppropriateSprites("hologramContact");

loadAppropriateSprites("collectible");
loadAppropriateSprites("player");

loadAppropriateSprites("enemyNormal");
loadAppropriateSprites("enemyFast");
loadAppropriateSprites("enemyVeryFast");

/**
 * Load all sounds.
 */
k.loadSound("backgroundMusic", "src/sounds/funky-quirky-upbeat-commercial-music-392401_eUPATFbC.mp3");
k.loadSound("hitSFX", "src/sounds/soft-body-impact-295404.mp3");
k.loadSound("collectibleSFX", "src/sounds/water-drip-45622.mp3");