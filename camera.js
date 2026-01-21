export class Camera {
    /**
     * Camera controller.
     * 
     * Controls the game camera to follow the player horizontally while keeping the camera
     * centered vertically on the map. The camera respects level boundaries and adapts to
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
        this.mapCenterY = null;                 // Vertical center of the map coordinates.
        this.mapParts = [];                     // References to the sprites composing the map.
        this.follow();
        this.handleResize();
    }

    /**
     * Set the map parts and calculate vertical centering
     * @param {GameObject []} mapParts 
     */
    setMapParts(mapParts) {
        this.mapParts = mapParts;
        this.calculateMapCenterY();
    }

    /**
     * 
     * Calculate the vertical center of the map based on the sprite height and current scale
     * This ensures the camera is always centered vertically on the map regardless of scaling
     */
    calculateMapCenterY() {
        if (this.mapParts.length === 0) return;

        // Get the first map sprite (they all have same height)
        const mapSprite = this.mapParts[0];
        // Calculate total map height with current scaling applied
        const mapHeight = mapSprite.height * mapSprite.scale.y;

        // The center is halfway through the map height
        this.mapCenterY = mapHeight / 2;
    }

    /**
     * Get the total width of the map, including all parts, with the current scale
     * @returns {Number} The scaled width of the entire map
     */
    getScaledMapWidth() {
        return this.levelControls.getScaledMapWidth();
    }

    /**
     *  Handle window resize events.
     *  Recalculates map center Y when window is resized (browser scaling changes).
     */
    handleResize() {
        onResize(() => {
            // Delay calculation to let browser finish resize operations
            setTimeout(() => {
                this.calculateMapCenterY();
            }, 50);
        });
    }

    /**
     * Update camera position every frame to follow the player within map boundaries.
     * 
     */
    follow() {
        onUpdate(() => {
            if (this.mapCenterY === null) return;

            const screenWidth = width();
            const playerPosX = this.followedGameObject.pos.x;

            const halfScreen = screenWidth / 2;
            const scaledMapWidth = this.getScaledMapWidth();

            // Calculate camera X position with boundary constraints
            let posX;

            // If the player is near the left edge of the map: pin camera to the left boundary
            if (playerPosX < halfScreen) {
                posX = halfScreen;
            }
            // If the player is near the right edge: pin camera to the right boundary
            else if (playerPosX > scaledMapWidth - halfScreen) {
                posX = scaledMapWidth - halfScreen;
            }
            // Otherwise: center camera on the player
            else {
                posX = playerPosX;
            }
            //(X follows the player, Y stays centered on the map)
            setCamPos(posX, this.mapCenterY);
        });
    }
}