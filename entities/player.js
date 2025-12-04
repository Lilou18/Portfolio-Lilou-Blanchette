import { gameState } from "../gameState.js";

export class Player {
    constructor(k, posX, posY, speed, jumpForce, setUpCollisionsUI) {
        this.k = k;
        this.speed = speed;
        this.scrollSpeed = this.speed * 7;
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.jumpForce = jumpForce;
        this.originalScale = 1

        // Store original position for scaling calculations
        this.originalPosX = posX;
        this.originalPosY = posY;

        this.setUpCollisionsUI = setUpCollisionsUI;

        this.makePlayer(k, posX, posY);
        this.playerControls();
        this.playerMobileControls();
    }

    // Create player gameObject with Kaplay
    makePlayer(k, posX, posY) {
        this.initialPlayerPositionX = posX;
        this.initialPlayerPositionY = posY;
        this.gameObject = k.add([
            k.sprite("player", { anim: "idle" }),
            k.area({
                shape: new k.Polygon([
                    k.vec2(-40, 0),
                    k.vec2(40, 0),
                    k.vec2(40, 100),
                    k.vec2(40, 220),
                    k.vec2(-40, 220),
                    k.vec2(-40, 100),
                ]),
                offset: k.vec2(0, 10),
            }),
            k.body(),
            k.doubleJump(1),
            k.anchor("top"),
            k.pos(posX, posY),
            k.color(),
            k.z(10),
            "player",
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
                // this.scaledSpeed = this.speed * k.mapScale;
                // this.scaledScrollSpeed = this.scrollSpeed * k.mapScale;
                // this.scaledJumpForce = this.jumpForce * k.mapScale;


                if (this.setUpCollisionsUI) {
                    this.setUpCollisionsUI();
                }
            } else {
                // If scaling info not available yet, check again next frame
                k.wait(0.01, checkAndUpdate);
            }
        };
        checkAndUpdate();
    }

    // Controls for player movement
    playerControls() {

        let keysPressed = {
            left: false,
            right: false,
            a: false,
            d: false,
            space: false
        };

        // Event to control player movement
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'arrowleft') keysPressed.left = true;
            if (key === 'arrowright') keysPressed.right = true;
            if (key === 'a') keysPressed.a = true;
            if (key === 'd') keysPressed.d = true;
            if (key === ' ') keysPressed.space = true;
        });

        // Event to ensure that released keys are properly registered
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'arrowleft') keysPressed.left = false;
            if (key === 'arrowright') keysPressed.right = false;
            if (key === 'a') keysPressed.a = false;
            if (key === 'd') keysPressed.d = false;
            if (key === ' ') keysPressed.space = false;
        });

        // Pause the game when the window is no longer the focus
        window.addEventListener('blur', () => {

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
        });

        // Allows the player to move to the left
        const moveLeft = (speed) => {
            if (!gameState.isGamePaused) {
                if (this.gameObject.isGrounded() && this.gameObject.curAnim() !== "run") {
                    this.gameObject.play("run");
                }
                this.gameObject.flipX = true;
                this.gameObject.move(-speed * 1.4, 0);
            }
        }

        // Allows the player to move to the right
        const moveRight = (speed) => {
            if (!gameState.isGamePaused) {
                if (this.gameObject.isGrounded() && this.gameObject.curAnim() !== "run") {
                    this.gameObject.play("run");
                }
                this.gameObject.flipX = false;
                this.gameObject.move(speed, 0);
            }
        }

        // Scrolling event to move the player
        window.addEventListener("wheel", (e) => {
            if (gameState.isGamePaused) return;

            this.isScrolling = true;

            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }
            if (e.deltaY > 0) {
                // Scroll down moves the player to the right
                moveRight(this.scrollSpeed);
            } else if (e.deltaY < 0) {
                // Scroll up moves the player to the left
                moveLeft(this.scrollSpeed);
            }

            // Small delay between scroll detection for a smooth walking animation
            this.scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
            }, 200);
        });

        // Reset collider and animation when player hits the ground
        this.gameObject.onGround(() => {
            if (!gameState.isGamePaused) {
                const leftPressed = keysPressed.left || keysPressed.a || this.mobileControls.left;
                const rightPressed = keysPressed.right || keysPressed.d || this.mobileControls.right;
                const isMoving = leftPressed || rightPressed || this.isScrolling;

                if (!isMoving && this.gameObject.curAnim() !== "idle" && this.gameObject.isGrounded()) {
                    this.gameObject.play("idle");
                }

                // Reset player collider
                this.gameObject.area.shape = new this.k.Polygon([
                    this.k.vec2(-40, 0),
                    this.k.vec2(40, 0),
                    this.k.vec2(40, 100),
                    this.k.vec2(40, 220),
                    this.k.vec2(-40, 220),
                    this.k.vec2(-40, 100),
                ]);
            }
        });

        this.gameObject.onFall(() => {
            if (!gameState.isGamePaused && this.gameObject.curAnim() !== "fall") {
                this.gameObject.play("fall");

                // Is the player walking on the right
                if (!this.gameObject.flipX) {
                    // Change collider shape when player is falling and walking to the right
                    this.gameObject.area.shape = new this.k.Polygon([
                        this.k.vec2(-40, 0),
                        this.k.vec2(40, 0),
                        this.k.vec2(40, 100),
                        this.k.vec2(15, 100),
                        this.k.vec2(50, 215),
                        this.k.vec2(10, 215),
                        this.k.vec2(-15, 100),
                        this.k.vec2(-40, 100),
                    ]);

                }
                // The player is walking to the left
                else {
                    // Change collider shape when player is falling and walking to the left
                    this.gameObject.area.shape = new this.k.Polygon([
                        this.k.vec2(-40, 0),
                        this.k.vec2(40, 0),
                        this.k.vec2(40, 100),
                        this.k.vec2(15, 100),
                        this.k.vec2(-10, 215),
                        this.k.vec2(-50, 215),
                        this.k.vec2(-15, 100),
                        this.k.vec2(-40, 100),
                    ]);

                }

            }
        });

        this.k.onUpdate(() => {
            if (gameState.isGamePaused) {
                if (this.gameObject.curAnim() !== "idle" && this.gameObject.isGrounded()) {
                    this.gameObject.play("idle");
                }
                return;
            }

            // Check if the player should move
            const leftPressed = keysPressed.left || keysPressed.a || this.mobileControls.left;
            const rightPressed = keysPressed.right || keysPressed.d || this.mobileControls.right;

            if (leftPressed) {
                moveLeft(this.speed);
            }
            if (rightPressed) {
                moveRight(this.speed);
            }

            // Player jump
            if ((keysPressed.space || this.mobileControls.jump) && this.gameObject.isGrounded()) {
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

    playerMobileControls() {
        const btnLeft = document.getElementById("btnLeft");
        const btnRight = document.getElementById("btnRight");
        const btnJump = document.getElementById("btnJump");

        this.mobileControls = {
            left: false,
            right: false,
            jump: false
        };

        if (btnLeft) {
            btnLeft.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileControls.left = true;
                btnLeft.style.color = 'rgb(8, 45, 103)';
                btnLeft.style.background = 'rgba(0, 255, 255, 0.7)';
                btnLeft.style.borderColor = 'rgb(8, 45, 103)';
            });

            btnLeft.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileControls.left = false;
                btnLeft.style.color = 'rgb(0, 255, 255)';
                btnLeft.style.background = 'rgba(8, 45, 103, 0.8)';
                btnLeft.style.borderColor = 'rgb(0, 255, 255)';
            });
            btnLeft.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.mobileControls.left = false;
                btnLeft.style.color = 'rgb(0, 255, 255)';
                btnLeft.style.background = 'rgba(8, 45, 103, 0.8)';
                btnLeft.style.borderColor = 'rgb(0, 255, 255)';
            });
        }

        if (btnRight) {
            btnRight.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileControls.right = true;
                btnRight.style.color = 'rgb(8, 45, 103)';
                btnRight.style.background = 'rgba(0, 255, 255, 0.7)';
                btnRight.style.borderColor = 'rgb(8, 45, 103)';
            });

            btnRight.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileControls.right = false;
                btnRight.style.color = 'rgb(0, 255, 255)';
                btnRight.style.background = 'rgba(8, 45, 103, 0.8)';
                btnRight.style.borderColor = 'rgb(0, 255, 255)';
            });

            btnRight.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.mobileControls.right = false;
                btnRight.style.color = 'rgb(0, 255, 255)';
                btnRight.style.background = 'rgba(8, 45, 103, 0.8)';
                btnRight.style.borderColor = 'rgb(0, 255, 255)';
            });
        }

        if (btnJump) {
            btnJump.addEventListener('touchstart', (e) => {
                e.preventDefault();
                // No double jump
                if (!gameState.isGamePaused && this.gameObject.isGrounded()) {
                    this.mobileControls.jump = true;
                    // this.gameObject.jump(this.jumpForce);
                    // this.gameObject.play("jump");
                    btnJump.style.color = 'rgb(8, 45, 103)';
                    btnJump.style.background = 'rgba(0, 255, 255, 0.7)';
                    btnJump.style.borderColor = 'rgb(8, 45, 103)';
                }
            });

            btnJump.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileControls.jump = false;
                btnJump.style.color = 'rgb(0, 255, 255)';
                btnJump.style.background = 'rgba(8, 45, 103, 0.8)';
                btnJump.style.borderColor = 'rgb(0, 255, 255)';
            });

            btnJump.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.mobileControls.jump = false;
                btnJump.style.color = 'rgb(0, 255, 255)';
                btnJump.style.background = 'rgba(8, 45, 103, 0.8)';
                btnJump.style.borderColor = 'rgb(0, 255, 255)';
            });
        }
    }
}