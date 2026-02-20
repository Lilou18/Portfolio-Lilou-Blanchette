import { getSpriteSizeCategory } from "./loader.js";
import { createWorld } from "./animationManager.js";

export let levelControl = null;

class Level {
    /**
     * Main class to manage level logic and rendering
     * Handles responsive layout, holograms, player, and colliders
     */

    /**
     *  Initializes a new instance of the level
     * @param {Object} k - Kaplay instance
     */
    constructor(k) {
        this.k = k;
        // Kaplay world containing all level objects
        this.world = createWorld();

        // Current sprite size category ('large' or 'medium')
        this.currentSpriteSize = getSpriteSizeCategory();
        this.player = null;

        this.playerRelativeX = 0;   // Player relative position in X (ratio relative to total level width)
        this.lastScaleX = 1;        // Last scale in X used during layout

        this.k.setGravity(1400);

        // Initialize configs and states
        this.initializeConfigs();
        this.initializeLevelObjects();

        this.createHolograms();
        this.layoutLevel();
    }

    /**
     * Initializes all level configurations.
     */
    initializeConfigs() {
        // Real dimensions of sprites in pixels
        this.spriteDimensions = {
            large: { width: 2176, height: 1024 },
            medium: { width: 1024, height: 482 }
        };

        this.largeSprite = this.spriteDimensions.large;
        this.currentSprite = this.spriteDimensions[this.currentSpriteSize];

        // Scale ratio of current sprite compared to the large sprite
        // Keep sprite size consistent across all devices regardless of source sprite
        this.spriteScaleRatio = this.currentSprite.width / this.largeSprite.width;

        // Player configuration for each sprite size
        this.playerConfigs = {
            large: {
                partIndex: 0,
                xRatio: 0.3,
                yRatio: 0.2,
                spriteScale: 1,
                speedMultiplier: 1,
            },
            medium: {
                partIndex: 0,
                xRatio: 0.3,
                yRatio: 0.2,
                spriteScale: this.spriteScaleRatio,      // Keep sprite size consistent regardless of source sprite
                speedMultiplier: this.spriteScaleRatio,  // Scales player movement speed to match visual scale
            }
        };

        // Active player configuration based on current sprite size
        this.activePlayerConfig = this.playerConfigs[this.currentSpriteSize];

        // Hologram configuration for each sprite size
        this.hologramConfig = {
            large: [
                { partIndex: 0, xRatio: 0.415, yRatio: 0.44, type: "citySign", scale: 1, anim: {} },
                { partIndex: 1, xRatio: 0.225, yRatio: 0.6, type: "hologramCV", scale: 0.6, anim: { anim: "hologram" } },
                { partIndex: 1, xRatio: 0.96, yRatio: 0.6, type: "hologramPortfolio", scale: 0.6, anim: { anim: "hologram" } },
                { partIndex: 2, xRatio: 0.57, yRatio: 0.6, type: "hologramContact", scale: 0.6, anim: { anim: "hologram" } },
            ],
            medium: [
                { partIndex: 0, xRatio: 0.42, yRatio: 0.43, type: "citySign", scale: 1.2, anim: {} },
                { partIndex: 1, xRatio: 0.225, yRatio: 0.59, type: "hologramCV", scale: 0.6, anim: { anim: "hologram" } },
                { partIndex: 1, xRatio: 0.96, yRatio: 0.59, type: "hologramPortfolio", scale: 0.6, anim: { anim: "hologram" } },
                { partIndex: 2, xRatio: 0.57, yRatio: 0.59, type: "hologramContact", scale: 0.6, anim: { anim: "hologram" } },
            ]
        };

        // Active hologram configuration based on current sprite size
        this.activeHologramConfig = this.hologramConfig[this.currentSpriteSize];
    }

    /**
     * Creates all level objects (p1, p2, p3, floor, walls).
     */
    initializeLevelObjects() {
        // Container for all level objects
        this.levelObjects = {
            p1: null,
            p2: null,
            p3: null,
            floor: null,
            leftWall: null,
            rightWall: null,
            holograms: []
        };

        this.floorOffsetRatio = 0.22; // Floor position ratio relative to the bottom of the sprite (0 to 1)
        this.floorHeight = 90; // Height of the floor collider in pixels

        // Create background sprites
        this.levelObjects.p1 = this.world.add([this.k.sprite("levelP1"), this.k.pos(0, 0), this.k.anchor("topleft")]);
        this.levelObjects.p2 = this.world.add([this.k.sprite("levelP2"), this.k.pos(0, 0), this.k.anchor("topleft")]);
        this.levelObjects.p3 = this.world.add([this.k.sprite("levelP3"), this.k.pos(0, 0), this.k.anchor("topleft")]);

        this.createFloor();
        this.createWalls();

    }

    /**
     * Creates the floor collider.
     */
    createFloor() {
        this.levelObjects.floor = this.k.add([
            this.k.pos(0, 800),
            this.k.area({ shape: new this.k.Rect(this.k.vec2(0), 10, 10) }),
            this.k.body({ isStatic: true }),
            "floor"
        ]);
    }

    /**
     * Creates the left and right wall colliders.
     */
    createWalls() {
        this.levelObjects.leftWall = this.k.add([
            this.k.pos(0, 0),
            this.k.area({ shape: new this.k.Rect(this.k.vec2(0), 10, 10) }),
            this.k.body({ isStatic: true }),
            "borderLeft",
        ]);

        this.levelObjects.rightWall = this.k.add([
            this.k.pos(0, 0),
            this.k.area({ shape: new this.k.Rect(this.k.vec2(0), 10, 10) }),
            this.k.body({ isStatic: true }),
            "borderRight",
        ]);
    }

    /**
     * Creates all holograms and their interactions.
     */
    createHolograms() {
        // Destroy old holograms if needed
        this.levelObjects.holograms.forEach(h => h.destroy());
        this.levelObjects.holograms = [];

        this.activeHologramConfig.forEach((holoConfig) => {
            const holoObj = this.world.add([
                this.k.sprite(holoConfig.type, holoConfig.anim),
                this.k.pos(0, 0),
                this.k.area({
                    isSensor: true,
                    collisionIgnore: ["enemy", "floor", "collectible"],
                }),
                this.k.anchor("center"),
                this.k.offscreen({ hide: true, distance: 500 }),
                this.k.scale(holoConfig.scale),
                holoConfig.type,
            ]);
            this.levelObjects.holograms.push(holoObj);

            // If not a city sign then we want a pointer cursor when user hover the hologram
            if (holoConfig.type !== "citySign") {
                holoObj.onHover(() => this.k.setCursor("pointer"));
                holoObj.onHoverEnd(() => this.k.setCursor("default"));
            }
            else {
                this.setupCitySignAnimation(holoObj);
            }
        });
    }

    setupCitySignAnimation(holoObj) {
        const delay = 5;

        holoObj.onAnimEnd(() => {
            this.k.wait(delay, () => {
                if (holoObj.exists()) {
                    holoObj.play("hologram")
                }
            })
        })

        holoObj.play("hologram")
    }

    /**
     * Updates position and scale of all holograms.
     * 
     * @param {number} scaleX Scale in X
     * @param {number} scaleY Scale in Y
     */
    updateHologramsPosition(scaleX, scaleY) {
        this.activeHologramConfig.forEach((holoConfig, index) => {
            if (this.levelObjects.holograms[index]) {
                this.positionObjectOnLevel(
                    this.levelObjects.holograms[index],
                    holoConfig.partIndex,
                    holoConfig.xRatio,
                    holoConfig.yRatio,
                    scaleX,
                    scaleY
                );

                // Adjust the scale of the hologram to the new scale
                this.levelObjects.holograms[index].scale = this.k.vec2(scaleX * holoConfig.scale, scaleY * holoConfig.scale);
            }
        });
    }

    /**
     * Positions an object on the level using ratios.
     * 
     * @param {Object} obj The object to position
     * @param {number} partIndex Index of the part (0=p1, 1=p2, 2=p3)
     * @param {number} xRatio Horizontal ratio (0 to 1)
     * @param {number} yRatio Vertical ratio (0 to 1)
     * @param {number} scaleX Scale in X of the part
     * @param {number} scaleY Scale in Y of the part
     */
    positionObjectOnLevel(obj, partIndex, xRatio, yRatio, scaleX, scaleY) {
        const parts = [this.levelObjects.p1, this.levelObjects.p2, this.levelObjects.p3];
        const part = parts[partIndex];

        // Calculate absolute X position
        // Start at the part's X position, then add the offset within the scaled part
        let absoluteX = 0;
        absoluteX += part.pos.x + (part.width * scaleX * xRatio);

        // Calculate absolute Y position
        // Start at the part's Y position, then add the offset within the scaled part
        const absoluteY = part.pos.y + (part.height * scaleY * yRatio);

        obj.pos = this.k.vec2(absoluteX, absoluteY);
    }

    /**
     * Repositions the player to their initial position based on config.
     * 
     * @param {number} scaleX Scale in X
     * @param {number} scaleY Scale in Y
     */
    updatePlayerPosition(scaleX, scaleY) {
        if (!this.player) return;

        const parts = [this.levelObjects.p1, this.levelObjects.p2, this.levelObjects.p3];
        const part = parts[this.activePlayerConfig.partIndex];

        // Add up the width of all parts before the player's part
        let initialX = 0;
        for (let i = 0; i < this.activePlayerConfig.partIndex; i++) {
            initialX += parts[i].width * scaleX;
        }
        // Add the offset within the player's starting part
        initialX += part.pos.x + (part.width * scaleX * this.activePlayerConfig.xRatio);

        // Calculate Y position based on the part's height and yRatio
        const initialY = part.pos.y + (part.height * scaleY * this.activePlayerConfig.yRatio);

        this.player.gameObject.pos = this.k.vec2(initialX, initialY);
    }

    /**
     * Returns the current scales of the level based on screen size.
     * Used to adapts the level to fit different screen sizes
     * 
     * @returns {{scaleX: number, scaleY: number}} Scales in X and Y
     */
    getCurrentScale() {
        const screenWidth = this.k.width();
        const screenHeight = this.k.height();
        const scaleX = screenWidth / this.levelObjects.p1.width;
        const scaleY = screenHeight / this.levelObjects.p1.height;
        return { scaleX, scaleY };
    }

    /**
     * Updates scale and position of the three level parts.
     * 
     * @param {number} scaleX Scale in X
     * @param {number} scaleY Scale in Y
     */
    updateLevelPartsScale(scaleX, scaleY) {
        // Since we use: texFilter: "linear" in the kapaly instance to get good sprite quality,
        // when we use the medium sprite it creates a pixel between each level parts so we fix it
        // with the seam fix who moves the level parts of one pixel.
        const seamFix = this.currentSpriteSize === "medium" ? 1 : 0;

        // p1 is always at origin (0, 0)
        this.levelObjects.p1.scale = this.k.vec2(scaleX, scaleY);
        this.levelObjects.p1.pos = this.k.vec2(0, 0);

        // p2 is positioned right after p1's scaled width
        this.levelObjects.p2.scale = this.k.vec2(scaleX, scaleY);
        this.levelObjects.p2.pos = this.k.vec2(Math.round(this.levelObjects.p1.width * scaleX - seamFix), 0);

        // p3 is positioned right after p2's scaled width
        this.levelObjects.p3.scale = this.k.vec2(scaleX, scaleY);
        this.levelObjects.p3.pos = this.k.vec2(Math.round(this.levelObjects.p2.pos.x + this.levelObjects.p2.width * scaleX - seamFix), 0);
    }

    /**
     * Updates the floor collider with the new scale.
     * 
     * @param {number} scaleX Scale in X
     * @param {number} scaleY Scale in Y
     */
    updateFloorCollider(scaleX, scaleY) {
        // Position the floor at the correct height (offset from bottom of p1)
        this.levelObjects.floor.pos = this.k.vec2(
            0,
            this.levelObjects.p1.pos.y + this.levelObjects.p1.height * scaleY * (1 - this.floorOffsetRatio)
        );

        // Make the floor width match the total level width (all three parts)
        this.levelObjects.floor.area.shape.width = this.getTotalLevelWidth(scaleX);

        this.levelObjects.floor.area.shape.height = this.floorHeight;
    }

    /**
     * Updates the left and right wall colliders.
     * 
     * @param {number} scaleX Scale in X
     */
    updateWallColliders(scaleX) {
        // Calculate total level width (all three parts combined)
        const totalLevelWidth = this.getTotalLevelWidth(scaleX);

        // Wall height extends from top of screen to bottom of floor
        const wallHeight = this.levelObjects.floor.pos.y + this.floorHeight;

        // Left wall outside of visible level to keep player from leaving
        this.levelObjects.leftWall.pos = this.k.vec2(-10, 0);
        this.levelObjects.leftWall.area.shape.width = 10;
        this.levelObjects.leftWall.area.shape.height = wallHeight; // hauteur jusqu'au sol

        // Right wall outside of visible level to keep player from leaving
        this.levelObjects.rightWall.pos = this.k.vec2(totalLevelWidth, 0);
        this.levelObjects.rightWall.area.shape.width = 10;
        this.levelObjects.rightWall.area.shape.height = wallHeight;
    }

    /**
     * Updates player position, scale, and speeds during a resize.
     * 
     * @param {number} scaleX Scale in X
     * @param {number} scaleY Scale in Y 
     */
    updatePlayerOnResize(scaleX, scaleY) {
        if (!this.player) return;
        // Stop physics
        this.player.gameObject.unuse("doubleJump");
        this.player.gameObject.unuse("body");

        // Calculate player's relative position on the old level
        const totalLevelWidthOld = this.getTotalLevelWidth(this.lastScaleX);

        // Store player as a ratio of the old level width
        this.playerRelativeX = this.player.gameObject.pos.x / totalLevelWidthOld;

        // Update speeds
        this.player.updateSpeeds(
            scaleX * this.activePlayerConfig.speedMultiplier,
            scaleY * this.activePlayerConfig.speedMultiplier
        );

        // Update player scale
        this.player.gameObject.scale = this.k.vec2(
            scaleX * this.activePlayerConfig.spriteScale,
            scaleY * this.activePlayerConfig.spriteScale
        );

        // Calculate new level width with new scale
        const totalLevelWidthNew = this.getTotalLevelWidth(scaleX);
        // Calculate new player position relative to the new level width
        const newX = this.playerRelativeX * totalLevelWidthNew;

        // Position the player just above the floor
        const floorY = this.levelObjects.floor.pos.y;
        // Apply the relative position to the new level width
        const newY = floorY - (this.player.gameObject.height * scaleY * this.activePlayerConfig.spriteScale);

        this.player.gameObject.pos = this.k.vec2(newX, newY);

        // Add back the physics
        this.player.gameObject.use(this.k.body())
    }

    /**
     * Full level layout based on screen size
     * Updates all elements: level parts, colliders, holograms, player, gravity.
     */
    layoutLevel() {
        const { scaleX, scaleY } = this.getCurrentScale();

        this.updateLevelPartsScale(scaleX, scaleY);
        this.updateFloorCollider(scaleX, scaleY);
        this.updateWallColliders(scaleX);
        this.updateHologramsPosition(scaleX, scaleY);
        this.updatePlayerOnResize(scaleX, scaleY);

        // Update world gravity based on scale and the
        // speedMultiplier ensures consistent gravity no matter the screen size
        this.k.setGravity(1400 * scaleY * this.activePlayerConfig.speedMultiplier);

        // Save scale for th next window resize
        this.lastScaleX = scaleX;
    }

    /**
     * Sets the player instance and initializes it with the correct values.
     * 
     * @param {Object} playerInstance The player instance to add to the level
     */
    setPlayer(playerInstance) {
        this.player = playerInstance;
        const { scaleX, scaleY } = this.getCurrentScale();

        this.updatePlayerPosition(scaleX, scaleY);

        this.player.updateSpeeds(
            scaleX * this.activePlayerConfig.speedMultiplier,
            scaleY * this.activePlayerConfig.speedMultiplier
        );

        this.player.gameObject.scale = this.k.vec2(
            scaleX * this.activePlayerConfig.spriteScale,
            scaleY * this.activePlayerConfig.spriteScale
        );

    }

    /**
     * Returns the three level parts (p1, p2, p3).
     * 
     * @returns {Array<Object>} Array containing the three level sprites
     */
    getLevelParts() {
        return [this.levelObjects.p1, this.levelObjects.p2, this.levelObjects.p3];
    }

    /**
     * Returns the total width of the level with the given scale.
     * 
     * @param {number} scaleX Scale factor in X
     * @returns {number} Total scaled level width
     */
    getTotalLevelWidth(scaleX) {
        return (this.levelObjects.p1.width + this.levelObjects.p2.width + this.levelObjects.p3.width) * scaleX;
    }

    /**
     * Returns the current scaled width of the level.
     * 
     * @returns {number} Total scaled level width
     */
    getScaledLevelWidth() {
        if (this.levelObjects.length === 0) return 0;
        const { scaleX } = this.getCurrentScale();
        return this.levelObjects.p3.pos.x + (this.levelObjects.p3.width * scaleX);
    }

    /**
     * Returns the complete scaled dimensions of the level.
     * 
     * @returns {{width: number, height: number, floorY: number}} Object containing width, height, and floor Y position
     */
    getLevelDimensions() {
        const { scaleX, scaleY } = this.getCurrentScale();
        return {
            width: this.getTotalLevelWidth(scaleX),
            height: this.levelObjects.p1.height * scaleY,
            floorY: this.levelObjects.floor.pos.y
        };
    }

    getControl() {
        return {
            setPlayer: (playerInstance) => this.setPlayer(playerInstance),
            getLevelParts: () => this.getLevelParts(),
            getScaledLevelWidth: () => this.getScaledLevelWidth(),
            getCurrentScale: () => this.getCurrentScale(),
            getLevelDimensions: () => this.getLevelDimensions(),
            layoutLevel: () => this.layoutLevel(),
            spriteScaleRatio: this.spriteScaleRatio,
            speedMultiplier: this.spriteScaleRatio,
        };
    }

}

export function level(k) {
    const levelInstance = new Level(k);
    levelControl = levelInstance.getControl();
    return levelControl;
}