export class Player {
    constructor(k, posX, posY, speed, jumpForce, setUpCollisionsUI) {
        this.speed = speed;
        this.scrollSpeed = this.speed * 7;
        this.jumpForce = jumpForce;

        // Store original position for scaling calculations
        this.originalPosX = posX;
        this.originalPosY = posY;

        this.setUpCollisionsUI = setUpCollisionsUI;

        this.makePlayer(k, posX, posY);
        this.playerControls();
    }

    makePlayer(k, posX, posY) {
        this.initialPlayerPositionX = posX,
            this.initialPlayerPositionY = posY,
            this.gameObject = add([
                sprite("player", { anim: "idle" }),
                area({
                    shape: new Rect(vec2(0, 10), 100, 220),
                }),
                body(),
                anchor("top"),
                pos(posX, posY),
                "player",   //With the get function of kaplay it pass you all the gameObject with a certain tag
            ]);

        this.updateInitialPosition(k);
    }

    // Method to set initial position and scale based on map scaling
    updateInitialPosition(k) {
        // Wait for the map scaling to be available
        const checkAndUpdate = () => {
            if (k.mapScale && k.mapOffsetY !== undefined) {
                const scaledX = this.originalPosX * k.mapScale;
                const scaledY = k.mapOffsetY + (this.originalPosY * k.mapScale);

                this.gameObject.pos.x = scaledX;
                this.gameObject.pos.y = scaledY;

                // Scale the player sprite to match the map scale
                this.gameObject.scale = k.vec2(this.originalScale * k.mapScale);

                // Also scale movement speed and jump force to match the new scale
                this.scaledSpeed = this.speed * k.mapScale;
                this.scaledScrollSpeed = this.scrollSpeed * k.mapScale;
                this.scaledJumpForce = this.jumpForce * k.mapScale;


                if(this.setUpCollisionsUI){
                    this.setUpCollisionsUI();
                }
            } else {
                // If scaling info not available yet, check again next frame
                wait(0.01, checkAndUpdate);
            }
        };
        checkAndUpdate();
    }

    playerControls() {

        const moveLeft = (speed) => {
            if (this.gameObject.curAnim() !== "run") {
                this.gameObject.play("run");
            }
            this.gameObject.flipX = true;
            this.gameObject.move(-speed, 0);
        }

        onKeyDown("left", () => moveLeft(this.speed));
        onKeyDown("a", () => moveLeft(this.speed));

        const moveRight = (speed) => {
            if (this.gameObject.curAnim() !== "run") {
                this.gameObject.play("run");
            }
            this.gameObject.flipX = false;
            this.gameObject.move(speed, 0);
        }

        onKeyDown("right", () => moveRight(this.speed))
        onKeyDown("d", () => moveRight(this.speed))

        window.addEventListener("wheel", (e) => {
            if (e.deltaY > 0) {
                // Scroll vers le bas = droite
                moveRight(this.scrollSpeed);
            } else if (e.deltaY < 0) {
                // Scroll vers le haut = gauche
                moveLeft(this.scrollSpeed);
            }
        });

        onKeyDown("space", () => {
            if (this.gameObject.isGrounded()) {
                this.gameObject.jump(this.jumpForce);
            }
        })

        onUpdate(() => {
            const leftPressed = isKeyDown("left") || isKeyDown("a");
            const rightPressed = isKeyDown("right") || isKeyDown("d");
            const isMoving = leftPressed || rightPressed;
            const isJumping = !this.gameObject.isGrounded() || isKeyDown("space");

            // Si le joueur ne bouge pas et ne saute pas, on joue l'anim idle
            if (!isMoving && !isJumping) {
                if (this.gameObject.curAnim() !== "idle") {
                    this.gameObject.play("idle");
                }
            }
        });

    }
}