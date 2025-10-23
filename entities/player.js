import { gameState } from "../gameState.js";

export class Player {
    constructor(k, posX, posY, speed, jumpForce, setUpCollisionsUI) {
        this.speed = speed;
        this.scrollSpeed = this.speed * 7;
        this.isScrolling = false;
        this.scrollTimeout = null;
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
                    shape: new Polygon([
                        // vec2(-40, 0),
                        // vec2(40, 0),
                        // vec2(40, 100),
                        // vec2(40, 200),
                        // vec2(-40, 200),
                        // vec2(-40, 100),
                        // vec2(-40, 0)

                        vec2(-40, 0),
                        vec2(40, 0),
                        vec2(40, 100),
                        vec2(40, 220),
                        vec2(-40, 220),
                        vec2(-40, 100),

                        // vec2(-40, 0),
                        // vec2(40, 0),
                        // vec2(40, 100),
                        // vec2(15, 100),
                        // vec2(40, 215),
                        // vec2(-40, 215),
                        // vec2(-15, 100),
                        // vec2(-40, 100),

                        // vec2(-60, 0),
                        // vec2(60, 0),
                        // vec2(60, 100),
                        // vec2(15, 100),
                        // vec2(15, 215),
                        // vec2(-15, 215),
                        // vec2(-15, 100),
                        // vec2(-60, 100),

                        // vec2(0,0),
                        // vec2(100,0),
                        // vec2(100,100),
                        // vec2(0,100),
                    ]),
                    offset: vec2(0, 10),
                    //shape: new Rect(vec2(0, 10), 80, 220),
                }),
                body(),
                doubleJump(1),
                anchor("top"),
                pos(posX, posY),
                color(),
                z(10),
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


                if (this.setUpCollisionsUI) {
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

        let pauseText = null;

        let keysPressed = {
            left: false,
            right: false,
            a: false,
            d: false,
            space: false
        };

        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'arrowleft') keysPressed.left = true;
            if (key === 'arrowright') keysPressed.right = true;
            if (key === 'a') keysPressed.a = true;
            if (key === 'd') keysPressed.d = true;
            if (key === ' ') keysPressed.space = true;
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'arrowleft') keysPressed.left = false;
            if (key === 'arrowright') keysPressed.right = false;
            if (key === 'a') keysPressed.a = false;
            if (key === 'd') keysPressed.d = false;
            if (key === ' ') keysPressed.space = false;
        });

        window.addEventListener('blur', () => {
            gameState.isGamePaused = true;

            // Reset keys
            keysPressed = {
                left: false,
                right: false,
                a: false,
                d: false,
                space: false
            };

            if (this.gameObject.isGrounded()) {
                this.gameObject.play("idle");
            }

            if (!pauseText) {
                pauseText = add([
                    text("PAUSED", { size: 48 }),
                    pos(center()),
                    anchor("center"),
                    z(100),
                ]);
            }
        });

        window.addEventListener('focus', () => {
            gameState.isGamePaused = false;
            if (pauseText) {
                destroy(pauseText);
                pauseText = null;
            }
        });

        const moveLeft = (speed) => {
            if (!gameState.isGamePaused) {
                if (this.gameObject.isGrounded() && this.gameObject.curAnim() !== "run") {
                    this.gameObject.play("run");
                }
                this.gameObject.flipX = true;
                this.gameObject.move(-speed * 1.2, 0);
            }
        }

        // onKeyDown("left", () => moveLeft(this.speed));
        // onKeyDown("a", () => moveLeft(this.speed));

        const moveRight = (speed) => {
            if (!gameState.isGamePaused) {
                if (this.gameObject.isGrounded() && this.gameObject.curAnim() !== "run") {
                    this.gameObject.play("run");
                }
                this.gameObject.flipX = false;
                this.gameObject.move(speed, 0);
            }
        }

        // onKeyDown("right", () => moveRight(this.speed))
        // onKeyDown("d", () => moveRight(this.speed))

        window.addEventListener("wheel", (e) => {
            if (gameState.isGamePaused) return;

            this.isScrolling = true;

            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }
            if (e.deltaY > 0) {
                // Scroll vers le bas = droite
                moveRight(this.scrollSpeed);
            } else if (e.deltaY < 0) {
                // Scroll vers le haut = gauche
                moveLeft(this.scrollSpeed);
            }

            this.scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
            }, 200);
        });

        this.gameObject.onGround(() => {
            if (!gameState.isGamePaused) {
                // const leftPressed = isKeyDown("left") || isKeyDown("a");
                // const rightPressed = isKeyDown("right") || isKeyDown("d");
                const leftPressed = keysPressed.left || keysPressed.a;
                const rightPressed = keysPressed.right || keysPressed.d;
                const isMoving = leftPressed || rightPressed || this.isScrolling;

                if (!isMoving && this.gameObject.curAnim() !== "idle" && this.gameObject.isGrounded()) {
                    this.gameObject.play("idle");
                }

                this.gameObject.area.shape = new Polygon([
                    vec2(-40, 0),
                    vec2(40, 0),
                    vec2(40, 100),
                    vec2(40, 220),
                    vec2(-40, 220),
                    vec2(-40, 100),
                ]);//new Rect(vec2(0, 10), 80, 220);
            }
        });

        this.gameObject.onFall(() => {
            if (!gameState.isGamePaused && this.gameObject.curAnim() !== "fall") {
                this.gameObject.play("fall");

                // Is the player walking on the right
                if (!this.gameObject.flipX) {
                    this.gameObject.area.shape = new Polygon([
                        vec2(-40, 0),
                        vec2(40, 0),
                        vec2(40, 100),
                        vec2(15, 100),
                        vec2(50, 215),
                        vec2(10, 215),
                        vec2(-15, 100),
                        vec2(-40, 100),
                    ]);

                }
                else {
                    this.gameObject.area.shape = new Polygon([
                        vec2(-40, 0),
                        vec2(40, 0),
                        vec2(40, 100),
                        vec2(15, 100),
                        vec2(-10, 215),
                        vec2(-50, 215),
                        vec2(-15, 100),
                        vec2(-40, 100),
                    ]);

                }

            }
        });

        // onKeyDown("space", () => {
        //     if (!gameState.isGamePaused) {
        //         if (this.gameObject.isGrounded()) {
        //             this.gameObject.jump(this.jumpForce);
        //             this.gameObject.play("jump");

        //             //this.gameObject.area.shape = new Rect(vec2(-15, 10), 80, 220);
        //         }
        //     }
        // });

        onUpdate(() => {
            if (gameState.isGamePaused) {
                if (this.gameObject.curAnim() !== "idle" && this.gameObject.isGrounded()) {
                    this.gameObject.play("idle");
                }
                return;
            }

            const leftPressed = keysPressed.left || keysPressed.a;
            const rightPressed = keysPressed.right || keysPressed.d;

            if (leftPressed) {
                moveLeft(this.speed);
            }
            if (rightPressed) {
                moveRight(this.speed);
            }

            // Player jump
            if (keysPressed.space && this.gameObject.isGrounded()) {
                this.gameObject.jump(this.jumpForce);
                this.gameObject.play("jump");
                // We don't want double jump
                keysPressed.space = false;
            }

            const isMoving = leftPressed || rightPressed || this.isScrolling;
            const isJumping = !this.gameObject.isGrounded();

            // If the player is not moving or jumping then we play the idle animation
            if (!isMoving && !isJumping) {
                if (this.gameObject.curAnim() !== "idle") {
                    this.gameObject.play("idle");
                }
            }
        });
    }
}