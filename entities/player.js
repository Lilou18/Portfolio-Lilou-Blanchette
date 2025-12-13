import { gameState } from "../gameState.js";

export class Player {
    constructor(k, posX, posY, speed, jumpForce) {
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

        // this.setUpCollisionsUI = setUpCollisionsUI;


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


                // if (this.setUpCollisionsUI) {
                //     this.setUpCollisionsUI();
                // }
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

        let isJumping = false;

        // Event to control player movement
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'arrowleft') keysPressed.left = true;
            if (key === 'arrowright') keysPressed.right = true;
            if (key === 'a') keysPressed.a = true;
            if (key === 'd') keysPressed.d = true;
            if (key === ' ') {
                keysPressed.space = true;
                isJumping = false;
            }
        });

        // Event to ensure that released keys are properly registered
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'arrowleft') keysPressed.left = false;
            if (key === 'arrowright') keysPressed.right = false;
            if (key === 'a') keysPressed.a = false;
            if (key === 'd') keysPressed.d = false;
            if (key === ' ') {
                keysPressed.space = false;
                isJumping = false;

            }
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
        let scrollDelta = 0;
        let isScrolling = false;
        let scrollTimeout = null;
        let lastScrollTime = 0;
        let lastDeltaValue = 0;
        let consecutiveSmallDeltas = 0;

        window.addEventListener('wheel', (e) => {
            if (gameState.isGamePaused) return;

            e.preventDefault();

            const now = Date.now();
            const currentDelta = Math.abs(e.deltaY);


            // Détection du type d'input
            // Touchpad : valeurs petites et fluides (< 50 généralement)
            // Molette : valeurs plus grandes et discrètes (> 50)
            // https://stackoverflow.com/questions/10744645/detect-touchpad-vs-mouse-in-javascript?utm_source=chatgpt.com
            const isTouchpad = currentDelta < 50;

            if (isTouchpad) {
                // Mode touchpad : accumulation fluide
                const direction = Math.sign(e.deltaY);
                const isSlowing = currentDelta < Math.abs(lastDeltaValue);
                if(currentDelta < 10 && isSlowing){
                    scrollDelta = 0;
                    isScrolling = false;
                    this.isScrolling = false;
                    return;
                }
                // scrollDelta += direction; // Quantité fixe par événement
                scrollDelta = scrollDelta * 0.8 + direction * 1;
                scrollDelta = Math.max(-400, Math.min(scrollDelta, 400));

                lastDeltaValue = scrollDelta;
            } else {
                // Mode molette : avec cooldown pour éviter les doubles événements
                const scrollCooldown = 70;

                if (now - lastScrollTime < scrollCooldown) {
                    return; // Ignore les événements trop rapprochés
                }

                lastScrollTime = now;
                const direction = Math.sign(e.deltaY);
                scrollDelta += direction * 250; // Distance fixe par cran
                scrollDelta = Math.max(-400, Math.min(scrollDelta, 400));
            }

            console.log(`Delta: ${currentDelta},Last Delta: ${lastDeltaValue}, Mode: ${isTouchpad ? 'Touchpad' : 'Molette'}, ScrollDelta: ${scrollDelta}`);

            isScrolling = true;
            this.isScrolling = true;

            if (scrollTimeout) clearTimeout(scrollTimeout);

            const timeoutDuration = isTouchpad ? 100 : 150;

            scrollTimeout = setTimeout(() => {
                isScrolling = false;
                this.isScrolling = false;
                scrollDelta = 0;
                if (this.gameObject.isGrounded() && this.gameObject.curAnim() !== "idle") {
                    this.gameObject.play("idle");
                }
            }, timeoutDuration);
        }, { passive: false });

        // // Scrolling event to move the player
        // let scrollDelta = 0;
        // let isScrolling = false;
        // let scrollTimeout = null;

        // window.addEventListener('wheel', (e) => {
        //     if (gameState.isGamePaused) return;

        //     e.preventDefault();

        //     const direction = Math.sign(e.deltaX || e.deltaY);
        //     let normalizedDelta = 0;

        //     // Normalize
        //     switch (e.deltaMode) {
        //         case 0: // DOM_DELTA_PIXEL
        //             console.log("PIXELS")
        //             normalizedDelta = direction * 100;
        //             break;
        //         case 1: // DOM_DELTA_LINE
        //             console.log("LINE");
        //             normalizedDelta = direction * 50;
        //             break;
        //         case 2: // DOM_DELTA_PAGE
        //             console.log("PAGE");
        //             normalizedDelta = direction * 50;
        //             break;
        //     }

        //     scrollDelta += normalizedDelta;

        //     console.log(scrollDelta);

        //     // scrollDelta += normalizedDelta;

        //     // // Accumule le scroll (horizontal et vertical)
        //     // scrollDelta += e.deltaX || e.deltaY;

        //     // scrollDelta = Math.max(-400, Math.min(scrollDelta, 400));

        //     // console.log(scrollDelta);


        //     isScrolling = true;
        //     this.isScrolling = true;

        //     // Clear le timeout précédent
        //     if (scrollTimeout) clearTimeout(scrollTimeout);

        //     // Arrête le scroll après 150ms d'inactivité
        //     scrollTimeout = setTimeout(() => {
        //         isScrolling = false;
        //         this.isScrolling = false;
        //         scrollDelta = 0;
        //         if (this.gameObject.isGrounded() && this.gameObject.curAnim() !== "idle") {
        //             this.gameObject.play("idle");
        //         }
        //     }, 150);
        // }, { passive: false });


        // Reset collider and animation when player hits the ground
        this.gameObject.onGround(() => {
            if (!gameState.isGamePaused) {
                const leftPressed = keysPressed.left || keysPressed.a || this.mobileControls.left;
                const rightPressed = keysPressed.right || keysPressed.d || this.mobileControls.right;
                const isMoving = leftPressed || rightPressed || this.isScrolling;

                if (!isMoving && this.gameObject.curAnim() !== "idle" && this.gameObject.isGrounded() && !isJumping) {
                    this.gameObject.play("idle");
                    isJumping = true;
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

                // // Is the player walking on the right
                // if (!this.gameObject.flipX) {
                //     // Change collider shape when player is falling and walking to the right
                //     this.gameObject.area.shape = new this.k.Polygon([
                //         this.k.vec2(-40, 0),
                //         this.k.vec2(40, 0),
                //         this.k.vec2(40, 100),
                //         this.k.vec2(15, 100),
                //         this.k.vec2(50, 215),
                //         this.k.vec2(10, 215),
                //         this.k.vec2(-15, 100),
                //         this.k.vec2(-40, 100),
                //     ]);

                // }
                // // The player is walking to the left
                // else {
                //     // Change collider shape when player is falling and walking to the left
                //     this.gameObject.area.shape = new this.k.Polygon([
                //         this.k.vec2(-40, 0),
                //         this.k.vec2(40, 0),
                //         this.k.vec2(40, 100),
                //         this.k.vec2(15, 100),
                //         this.k.vec2(-10, 215),
                //         this.k.vec2(-50, 215),
                //         this.k.vec2(-15, 100),
                //         this.k.vec2(-40, 100),
                //     ]);

                // }

            }
        });

        this.k.onUpdate(() => {
            if (gameState.isGamePaused) {
                if (this.gameObject.curAnim() !== "idle" && this.gameObject.isGrounded()) {
                    this.gameObject.play("idle");
                }
                return;
            }

            if (isScrolling && Math.abs(scrollDelta) > 0) {
                const scrollSpeed = this.scrollSpeed;
                // Augmente le multiplicateur pour un mouvement plus rapide
                // const moveAmount = Math.sign(scrollDelta) * Math.abs(scrollDelta) * 3; //Math.min(Math.abs(scrollDelta) * 3, scrollSpeed);
                // const moveAmount = Math.sign(scrollDelta) * Math.abs(scrollDelta) * 4;
                const moveAmount = Math.sign(scrollDelta) * Math.abs(scrollDelta) * 4;

                if (moveAmount < 0) {
                    moveLeft(Math.abs(moveAmount));
                } else {
                    moveRight(moveAmount);
                }

                // Réduit progressivement le delta pour un mouvement fluide
                scrollDelta *= 0.90;

                // Si le delta devient trop petit, on le remet à 0
                if (Math.abs(scrollDelta) < 0.5) {
                    scrollDelta = 0;
                }
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

            if (!gameState.isGamePaused && this.gameObject.curAnim() === "fall") {

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

            // Player jump
            if ((keysPressed.space || this.mobileControls.jump) && this.gameObject.isGrounded()) {
                this.gameObject.jump(this.jumpForce);
                this.gameObject.play("jump");
                // We don't want double jump
                // keysPressed.space = false;
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