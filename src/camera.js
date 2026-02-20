export class Camera {
    /**
     * Camera controller.
     * 
     * Controls the game camera to follow the player horizontally while keeping the camera
     * centered vertically on the level. The camera respects level boundaries and adapts to
     * window resize events.
     * 
     */


    /**
     * 
     * @param {GameObject} gameObject The game object to follow (the player)
     * @param {Object} levelControls Helper object used to retrieve level data
     */
    constructor(gameObject, levelControls) {
        this.followedGameObject = gameObject;
        this.levelControls = levelControls;
        this.levelCenterY = null;                 // Vertical center of the level coordinates.
        this.levelParts = [];                     // References to the sprites composing the level.

        this.setLevelParts();
        this.follow();
        this.handleResize();
    }

    /**
     * Set the level parts and calculate vertical centering.
     */
    setLevelParts() {
        this.levelParts = this.levelControls.getLevelParts();
        this.calculateLevelCenterY();
    }

    /**
     * 
     * Calculate the vertical center of the level based on the sprite height and current scale.
     * This ensures the camera is always centered vertically on the level regardless of scaling.
     */
    calculateLevelCenterY() {
        if (this.levelParts.length === 0) return;

        // Get the first level sprite (they all have same height)
        const levelSprite = this.levelParts[0];
        // Calculate total level height with current scaling applied
        const levelHeight = levelSprite.height * levelSprite.scale.y;

        // The center is halfway through the level height
        this.levelCenterY = levelHeight / 2;
    }

    /**
     * Get the total width of the level, including all parts, with the current scale.
     * 
     * @returns {Number} The scaled width of the entire level
     */
    getScaledLevelWidth() {
        return this.levelControls.getScaledLevelWidth();
    }

    /**
     *  Handle window resize events.
     *  Recalculates level center Y when window is resized (browser scaling changes).
     */
    handleResize() {
        onResize(() => {
            // Delay calculation to let browser finish resize operations
            setTimeout(() => {
                this.calculateLevelCenterY();
            }, 50);
        });
    }

    /**
     * Update camera position every frame to follow the player within level boundaries.
     * 
     */
    follow() {
        onUpdate(() => {
            if (this.levelCenterY === null) return;

            const screenWidth = width();
            const playerPosX = this.followedGameObject.pos.x;

            const halfScreen = screenWidth / 2;
            const scaledLevelWidth = this.getScaledLevelWidth();

            // Calculate camera X position with boundary constraints
            let posX;

            // If the player is near the left edge of the level: pin camera to the left boundary
            if (playerPosX < halfScreen) {
                posX = halfScreen;
            }
            // If the player is near the right edge: pin camera to the right boundary
            else if (playerPosX > scaledLevelWidth - halfScreen) {
                posX = scaledLevelWidth - halfScreen;
            }
            // Otherwise: center camera on the player
            else {
                posX = playerPosX;
            }
            //(X follows the player, Y stays centered on the level)
            setCamPos(posX, this.levelCenterY);
        });
    }
}