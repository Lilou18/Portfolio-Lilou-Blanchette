export class Camera {
    constructor(gameObject, offsetX, offsetY, mapWidth, mapHeight) {
        this.followedGameObject = gameObject;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.originalMapWidth = mapWidth;
        this.originalMapHeight = mapHeight;
        this.initialCameraPosY = getCamPos().y;
        this.follow();
    }

    getScaledMapWidth() {
        // Calculate the same scale that's used in your level's onDraw
        const scale = height() / this.originalMapHeight;
        return this.originalMapWidth * scale;
    }

    follow() {
        onUpdate(() => {
            if (!this.followedGameObject) {
                alert("CRITICAL: followedGameObject is NULL in Camera!");
                return;
            }
            const screenWidth = width();
            const playerPosX = this.followedGameObject.pos.x + this.offsetX;
            const halfScreen = screenWidth / 2;

            // Use the scaled map width for calculations
            const scaledMapWidth = this.getScaledMapWidth();

            //console.log("Screen width:", screenWidth);
            //console.log("Scaled map width:", scaledMapWidth);

            let posX;

            // Left boundary: camera can't go further left than halfScreen
            if (playerPosX < halfScreen) {
                posX = halfScreen;
            }
            // Right boundary: camera can't go further right than scaledMapWidth - halfScreen
            else if (playerPosX > scaledMapWidth - halfScreen) {
                posX = scaledMapWidth - halfScreen;
            }
            // Normal following
            else {
                posX = playerPosX;
            }

            setCamPos(posX, this.initialCameraPosY + this.offsetY);

            //console.log("Camera from", posX - halfScreen, "to", posX + halfScreen);
            //console.log("Map ends at:", scaledMapWidth);
        })
    }
}