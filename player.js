import { gameState } from "../gameState.js";
import { world } from "./animationManager.js";

export class Player {
    /**
     * Manages the player creation, the player movement with the keyboard input, mouse wheel scrolling and mobile touch controls.
     * Handles animations and collision shape adjustments during a fall.
     */

    /**
     * 
     * @param {Object} k Kaplay game instance
     * @param {number} posX Initial X position in world coordinates
     * @param {number} posY Initial Y position in world coordinates
     * @param {number} speed Base movement speed
     * @param {number} jumpForce Base jump force
     */
    constructor(k, posX, posY, speed, jumpForce) {
        this.k = k;

        // Movement properties
        this.baseSpeed = speed;                         // Original movement speed
        this.speed = speed;                             // Current movement speed (scaled)
        this.baseScrollSpeed = speed * 5;               // Original movement speed when scrolling
        this.scrollSpeed = this.baseScrollSpeed;        // Current scroll speed (scaled)

        // Jump properties
        this.baseJumpForce = jumpForce;                 // Original jump force
        this.jumpForce = jumpForce;                     // Current jump force (scaled)

        // Scrolling state
        this.isScrolling = false;                       // Is player currently moving via scroll
        this.scrollTimeout = null;                      // Timeout for scroll momentum fade-out
        this.currentScaleX = 1;

        // Initialize game systems
        this.makePlayer(k, posX, posY);
        this.playerControls();
        this.playerMobileControls();
    }

    /**
     * Create the player game object with Kaplay.
     * 
     * @param {Object} k Kaplay game instance
     * @param {number} posX Initial X position
     * @param {number} posY Initial Y position
     */
    makePlayer(k, posX, posY) {
        this.initialPlayerPositionX = posX;
        this.initialPlayerPositionY = posY;

        this.gameObject = world.add([
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
            k.body(),                                   // Enable physics/gravity
            k.doubleJump(1),                            // Does not allow double jump
            k.anchor("top"),
            k.pos(posX, posY),
            k.color(),
            k.z(10),
            "player",                                   // Tag for collision detection
        ]);

    }

    /**
     * Setup keyboard input handling for player movement
     * Manages keyboard events, mouse wheel scrolling, and game loop update for the player
     */
    playerControls() {

        // Object tracking which keys are currently pressed
        let keysPressed = {
            left: false,
            right: false,
            a: false,
            d: false,
            space: false
        };

        // Object tracking if the player is jumping
        const jumpState = {
            isJumping: false
        }

        this.setupKeyboardInput(keysPressed, jumpState);

        // Object tracking all scroll data and logic
        const scrollState = {
            scrollDelta: 0,         // Current momentum value (-1 to 1)
            isScrolling: false,     // Whether the user is scrolling
            lastScrollTime: 0,      // Timestamp of last mouse wheel event
            lastDeltaValue: 0       // Previous deltaY value (used for slowing detection)
        };

        this.setupScrollInput(scrollState);

        // ============== Player collider shape ====================
        // Array of points representing the player collider shape
        const baseColliderShape = [
            this.k.vec2(-40, 0),
            this.k.vec2(40, 0),
            this.k.vec2(40, 100),
            this.k.vec2(40, 220),
            this.k.vec2(-40, 220),
            this.k.vec2(-40, 100),
        ];

        // Collider shape when player is falling and walking to the right
        const fallColliderShapeRight = [
            this.k.vec2(-40, 0),
            this.k.vec2(40, 0),
            this.k.vec2(40, 100),
            this.k.vec2(15, 100),
            this.k.vec2(50, 215),
            this.k.vec2(10, 215),
            this.k.vec2(-15, 100),
            this.k.vec2(-40, 100),
        ];

        // Collider shape when player is falling and walking to the left
        const fallColliderShapeLeft = [
            this.k.vec2(-40, 0),
            this.k.vec2(40, 0),
            this.k.vec2(40, 100),
            this.k.vec2(15, 100),
            this.k.vec2(-10, 215),
            this.k.vec2(-50, 215),
            this.k.vec2(-15, 100),
            this.k.vec2(-40, 100),
        ];
        // ==========================================================

        this.setupGroundAndFallEvents(keysPressed, jumpState, baseColliderShape);

        this.update(keysPressed, jumpState, scrollState, baseColliderShape, fallColliderShapeRight, fallColliderShapeLeft);
    }

    /**
     * Setup keyboard event listeners for arrow keys and WASD
     * Updates keysPressed state on keydown/keyup
     * Resets all keys when window loses focus
     * 
     * @param {Object} keysPressed - Object tracking which keys are currently pressed
     * @param {Object} jumpState - Object tracking jump state
     */
    setupKeyboardInput(keysPressed, jumpState) {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'arrowleft') keysPressed.left = true;
            if (key === 'arrowright') keysPressed.right = true;
            if (key === 'a') keysPressed.a = true;
            if (key === 'd') keysPressed.d = true;
            if (key === ' ') {
                keysPressed.space = true;
                jumpState.isJumping = false;
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
                jumpState.isJumping = false;

            }
        });

        // Reset all keys when window loses focus
        window.addEventListener('blur', () => {
            keysPressed.left = false;
            keysPressed.right = false;
            keysPressed.a = false;
            keysPressed.d = false;
            keysPressed.space = false;

            if (this.gameObject.isGrounded()) {
                this.gameObject.play("idle");
            }
        });

    }

    /**
     * Setup mouse wheel scrolling for player movement
     * Detects touchpad vs mouse wheel and applies different momentum logic
     * Updates scrollState object that is used in the update loop
     * 
     * @param {Object} scrollState Object containing all scroll data and logic
     */
    setupScrollInput(scrollState) {
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
                // Touchpad mode: smooth accumulation with momentum
                const direction = Math.sign(e.deltaY);
                const isSlowing = currentDelta < Math.abs(scrollState.lastDeltaValue);

                if (isSlowing) {
                    scrollState.scrollDelta = 0;
                    scrollState.isScrolling = false;
                    this.isScrolling = false;
                    return;
                }
                // scrollDelta += direction; // Quantité fixe par événement

                //ANCIEN SCROLL
                // scrollDelta = scrollDelta * 0.8 + direction * 1;
                // scrollDelta = Math.max(-400, Math.min(scrollDelta, 400));

                // Exponential smoothing for momentum effect
                scrollState.scrollDelta = scrollState.scrollDelta * 0.8 + direction * 0.25;
                // Clamp momentum between -1 and 1 to prevent excessive speed
                scrollState.scrollDelta = Math.max(-1, Math.min(scrollState.scrollDelta, 1));


                scrollState.lastDeltaValue = scrollState.scrollDelta;
            } else {
                // Mouse wheel mode: discrete scrolls with cooldown
                const scrollCooldown = 70;

                if (now - scrollState.lastScrollTime < scrollCooldown) {
                    return; // Ignore rapid consecutive events
                }

                scrollState.lastScrollTime = now;
                const direction = Math.sign(e.deltaY);
                //ANCIEN SCROLL
                // scrollDelta += direction * 250; // Distance fixe par cran
                // scrollDelta = Math.max(-400, Math.min(scrollDelta, 400));
                scrollState.scrollDelta += direction;
                // Clamp between -1 and 1 to prevent speed accumulation
                scrollState.scrollDelta = Math.max(-1, Math.min(scrollState.scrollDelta, 1));

            }

            console.log(`Delta: ${currentDelta},Last Delta: ${scrollState.lastDeltaValue}, Mode: ${isTouchpad ? 'Touchpad' : 'Molette'}, ScrollDelta: ${scrollState.scrollDelta}`);

            scrollState.isScrolling = true;
            this.isScrolling = true;

            if (scrollState.scrollTimeout) clearTimeout(scrollState.scrollTimeout);

            const timeoutDuration = isTouchpad ? 100 : 150;

            // After user stops scrolling, gradually fade out the momentum
            // This prevents the player from continuing to move indefinitely
            scrollState.scrollTimeout = setTimeout(() => {
                scrollState.isScrolling = false;
                this.isScrolling = false;
                scrollState.scrollDelta = 0;
                if (this.gameObject.isGrounded() && this.gameObject.curAnim() !== "idle") {
                    this.gameObject.play("idle");
                }
            }, timeoutDuration);
        }, { passive: false });
    }

    /**
     * Setup ground and fall event handlers
     * Resets collider shape and plays idle animation when landing
     * Plays fall animation when airborne
     * 
     * @param {Object} keysPressed - Object tracking which keys are currently pressed
     * @param {Object} jumpState - Jump state
     * @param {Array} baseColliderShape - Base collision polygon points
     */
    setupGroundAndFallEvents(keysPressed, jumpState, baseColliderShape) {

        // Reset collider and animation when player hits the ground
        this.gameObject.onGround(() => {
            if (!gameState.isGamePaused) {
                const leftPressed = keysPressed.left || keysPressed.a || this.mobileControls.left;
                const rightPressed = keysPressed.right || keysPressed.d || this.mobileControls.right;
                const isMoving = leftPressed || rightPressed || this.isScrolling;

                if (!isMoving && this.gameObject.curAnim() !== "idle" && this.gameObject.isGrounded() && !jumpState.isJumping) {
                    this.gameObject.play("idle");
                    jumpState.isJumping = true;
                }

                // Reset to base collider shape when landing
                this.gameObject.area.shape = new this.k.Polygon(baseColliderShape);
            }
        });

        this.gameObject.onFall(() => {
            if (!gameState.isGamePaused && this.gameObject.curAnim() !== "fall") {
                this.gameObject.play("fall");
            }
        });
    }

    /**
    * Helper functions for player movement
    * moveLeft: Move player left with run animation
    * moveRight: Move player right with run animation
    * 
    * @param {number} speed Movement speed of the player
    */
    moveLeft(speed) {
        if (!gameState.isGamePaused) {
            if (this.gameObject.isGrounded() && this.gameObject.curAnim() !== "run") {
                this.gameObject.play("run");
            }
            this.gameObject.flipX = true;
            this.gameObject.move(-speed * 1.4, 0);
        }
    }

    // Allows the player to move to the right
    moveRight(speed) {
        if (!gameState.isGamePaused) {
            if (this.gameObject.isGrounded() && this.gameObject.curAnim() !== "run") {
                this.gameObject.play("run");
            }
            this.gameObject.flipX = false;
            this.gameObject.move(speed, 0);
        }
    }

    /**
     * Update player speeds and jump force based on the map scaling.
     * 
     * @param {number} scaleX Horizontal scale factor of the map
     * @param {number} scaleY Vertical scale factor of the map
     */
    updateSpeeds(scaleX, scaleY) {
        this.currentScaleX = scaleX;
        this.speed = this.baseSpeed * scaleX;                       // Horizontal movement scales with X
        this.scrollSpeed = this.baseScrollSpeed * scaleX;           // Scroll speed scales with X
        this.jumpForce = this.baseJumpForce * scaleY;               // Jump force scales with Y (gravity)
    }

    /**
     * Setup mobile touch controls for left, right, and jump buttons.
     * Creates touch event handlers that update the mobileControls state object
     * to reflect which buttons are currently pressed. Also provides visual feedback
     * by changing button colors when pressed.
     */
    playerMobileControls() {
        const btnLeft = document.getElementById("btnLeft");
        const btnRight = document.getElementById("btnRight");
        const btnJump = document.getElementById("btnJump");

        // Track which mobile buttons are currently pressed
        // Used in the main update loop to determine player movement and jump
        this.mobileControls = {
            left: false,
            right: false,
            jump: false
        };

        // Style states for button visual feedback
        const activeStyle = {
            color: 'rgb(8, 45, 103)',
            background: 'rgba(0, 255, 255, 0.7)',
            borderColor: 'rgb(8, 45, 103)'
        };

        const inactiveStyle = {
            color: 'rgb(0, 255, 255)',
            background: 'rgba(8, 45, 103, 0.8)',
            borderColor: 'rgb(0, 255, 255)'
        };

        /**
         * Create touch event handlers for mobile control buttons.
         * Updates the mobileControls state when buttons are pressed/released
         * and also change the style for feedback.
         * 
         * @param {HTMLElement} btn The button DOM element to attach handlers to
         * @param {string} controlKey The key in mobileControls to update ('left', 'right', 'jump')
         * @returns 
         */
        const createTouchHandler = (btn, controlKey) => {
            if (!btn) return;

            // Helper to apply style object to button
            const applyStyle = (style) => {
                Object.assign(btn.style, style);
            }

            // Event to update mobileControls state and show visual feedback
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!gameState.isGamePaused) {
                    this.mobileControls[controlKey] = true;
                    applyStyle(activeStyle);
                }
            });

            // Update mobileControls state and restore default style
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileControls[controlKey] = false;
                applyStyle(inactiveStyle);
            });

            // Same as touchend
            btn.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.mobileControls[controlKey] = false;
                applyStyle(inactiveStyle);
            });
        }

        // Create touch handlers for all three buttons
        createTouchHandler(btnLeft, 'left');
        createTouchHandler(btnRight, 'right');
        createTouchHandler(btnJump, 'jump');
    }

    /**
     * Handles scroll movement, keyboard movement, collision shape changes during fall and
     * jump input.
     * 
     * @param {Object} keysPressed Object tracking which keys are currently pressed
     * @param {Object} jumpState Object tracking jump state
     * @param {Object} scrollState Object containing all scroll data and logic
     * @param {Array} baseColliderShape Array of points representing the idle player collider shape
     * @param {Array} fallColliderShapeRight Array of points representing the falling to the right player collider shape
     * @param {Array} fallColliderShapeLeft  Array of points representing the falling to the left player collider shape
     */
    update(keysPressed, jumpState, scrollState, baseColliderShape, fallColliderShapeRight, fallColliderShapeLeft) {
        this.k.onUpdate(() => {
            if (gameState.isGamePaused) {
                if (this.gameObject.curAnim() !== "idle" && this.gameObject.isGrounded()) {
                    this.gameObject.play("idle");
                }
                return;
            }

            // Scroll movement
            if (scrollState.isScrolling && Math.abs(scrollState.scrollDelta) > 0) {
                //const scrollSpeed = this.scrollSpeed;
                // Augmente le multiplicateur pour un mouvement plus rapide
                // const moveAmount = Math.sign(scrollDelta) * Math.abs(scrollDelta) * 3; //Math.min(Math.abs(scrollDelta) * 3, scrollSpeed);
                // const moveAmount = Math.sign(scrollDelta) * Math.abs(scrollDelta) * 4;

                //ANCIEN SCROLL
                //const moveAmount = Math.sign(scrollDelta) * Math.abs(scrollDelta) * 4;
                const moveAmount = scrollState.scrollDelta * this.scrollSpeed;

                console.log(scrollState.scrollDelta);


                if (moveAmount < 0) {
                    this.moveLeft(Math.abs(moveAmount));
                } else {
                    this.moveRight(moveAmount);
                }

                // Gradually reduce the delta for smooth movement
                scrollState.scrollDelta *= 0.90;

                if (Math.abs(scrollState.scrollDelta) < 0.5) {
                    scrollState.scrollDelta = 0;
                }
            }

            // Keybard movement
            const leftPressed = keysPressed.left || keysPressed.a || this.mobileControls.left;
            const rightPressed = keysPressed.right || keysPressed.d || this.mobileControls.right;

            if (leftPressed) {
                this.moveLeft(this.speed);
            }
            if (rightPressed) {
                this.moveRight(this.speed);
            }

            if (!gameState.isGamePaused && this.gameObject.curAnim() === "fall") {

                // The collider shape depends on the player's movement direction
                const colliderShape = !this.gameObject.flipX ? fallColliderShapeRight : fallColliderShapeLeft;

                this.gameObject.area.shape = new this.k.Polygon(colliderShape);
            }

            // Player jump
            if ((keysPressed.space || this.mobileControls.jump) && this.gameObject.isGrounded()) {
                this.gameObject.jump(this.jumpForce);
                this.gameObject.play("jump");
            }

            const isMoving = leftPressed || rightPressed || scrollState.isScrolling;
            const isFalling = !this.gameObject.isGrounded();

            // If the player is not moving or jumping then we play the idle animation
            if (!isMoving && !isFalling && this.gameObject.curAnim() !== "idle") {
                if (this.gameObject.curAnim() !== "idle") {
                    this.gameObject.play("idle");
                }
            }
        });
    }
}










// // Controls for player movement
//     playerControls() {

//         let keysPressed = {
//             left: false,
//             right: false,
//             a: false,
//             d: false,
//             space: false
//         };

//         let isJumping = false;

//         // Event to control player movement
//         window.addEventListener('keydown', (e) => {
//             const key = e.key.toLowerCase();
//             if (key === 'arrowleft') keysPressed.left = true;
//             if (key === 'arrowright') keysPressed.right = true;
//             if (key === 'a') keysPressed.a = true;
//             if (key === 'd') keysPressed.d = true;
//             if (key === ' ') {
//                 keysPressed.space = true;
//                 isJumping = false;
//             }
//         });

//         // Event to ensure that released keys are properly registered
//         window.addEventListener('keyup', (e) => {
//             const key = e.key.toLowerCase();
//             if (key === 'arrowleft') keysPressed.left = false;
//             if (key === 'arrowright') keysPressed.right = false;
//             if (key === 'a') keysPressed.a = false;
//             if (key === 'd') keysPressed.d = false;
//             if (key === ' ') {
//                 keysPressed.space = false;
//                 isJumping = false;

//             }
//         });

//         // Reset all keys when window loses focus
//         window.addEventListener('blur', () => {

//             // Reset keys
//             keysPressed = {
//                 left: false,
//                 right: false,
//                 a: false,
//                 d: false,
//                 space: false
//             };

//             if (this.gameObject.isGrounded()) {
//                 this.gameObject.play("idle");
//             }
//         });

//         // // Allows the player to move to the left
//         // const moveLeft = (speed) => {
//         //     if (!gameState.isGamePaused) {
//         //         if (this.gameObject.isGrounded() && this.gameObject.curAnim() !== "run") {
//         //             this.gameObject.play("run");
//         //         }
//         //         this.gameObject.flipX = true;
//         //         this.gameObject.move(-speed * 1.4, 0);
//         //     }
//         // }

//         // // Allows the player to move to the right
//         // const moveRight = (speed) => {
//         //     if (!gameState.isGamePaused) {
//         //         if (this.gameObject.isGrounded() && this.gameObject.curAnim() !== "run") {
//         //             this.gameObject.play("run");
//         //         }
//         //         this.gameObject.flipX = false;
//         //         this.gameObject.move(speed, 0);
//         //     }
//         // }

//         // Scrolling event to move the player
//         let scrollDelta = 0;
//         let isScrolling = false;
//         let scrollTimeout = null;
//         let lastScrollTime = 0;
//         let lastDeltaValue = 0;

//         window.addEventListener('wheel', (e) => {
//             if (gameState.isGamePaused) return;

//             e.preventDefault();

//             const now = Date.now();
//             const currentDelta = Math.abs(e.deltaY);


//             // Détection du type d'input
//             // Touchpad : valeurs petites et fluides (< 50 généralement)
//             // Molette : valeurs plus grandes et discrètes (> 50)
//             // https://stackoverflow.com/questions/10744645/detect-touchpad-vs-mouse-in-javascript?utm_source=chatgpt.com
//             const isTouchpad = currentDelta < 50;

//             if (isTouchpad) {
//                 // Mode touchpad : accumulation fluide
//                 const direction = Math.sign(e.deltaY);
//                 const isSlowing = currentDelta < Math.abs(lastDeltaValue);
//                 if (isSlowing) {
//                     scrollDelta = 0;
//                     isScrolling = false;
//                     this.isScrolling = false;
//                     return;
//                 }
//                 // scrollDelta += direction; // Quantité fixe par événement

//                 //ANCIEN SCROLL
//                 // scrollDelta = scrollDelta * 0.8 + direction * 1;
//                 // scrollDelta = Math.max(-400, Math.min(scrollDelta, 400));
//                 scrollDelta = scrollDelta * 0.8 + direction * 0.25;
//                 scrollDelta = Math.max(-1, Math.min(scrollDelta, 1));


//                 lastDeltaValue = scrollDelta;
//             } else {
//                 // Mode molette : avec cooldown pour éviter les doubles événements
//                 const scrollCooldown = 70;

//                 if (now - lastScrollTime < scrollCooldown) {
//                     return; // Ignore les événements trop rapprochés
//                 }

//                 lastScrollTime = now;
//                 const direction = Math.sign(e.deltaY);
//                 //ANCIEN SCROLL
//                 // scrollDelta += direction * 250; // Distance fixe par cran
//                 // scrollDelta = Math.max(-400, Math.min(scrollDelta, 400));
//                 scrollDelta += direction;
//                 scrollDelta = Math.max(-1, Math.min(scrollDelta, 1));

//             }

//             console.log(`Delta: ${currentDelta},Last Delta: ${lastDeltaValue}, Mode: ${isTouchpad ? 'Touchpad' : 'Molette'}, ScrollDelta: ${scrollDelta}`);

//             isScrolling = true;
//             this.isScrolling = true;

//             if (scrollTimeout) clearTimeout(scrollTimeout);

//             const timeoutDuration = isTouchpad ? 100 : 150;

//             scrollTimeout = setTimeout(() => {
//                 isScrolling = false;
//                 this.isScrolling = false;
//                 scrollDelta = 0;
//                 if (this.gameObject.isGrounded() && this.gameObject.curAnim() !== "idle") {
//                     this.gameObject.play("idle");
//                 }
//             }, timeoutDuration);
//         }, { passive: false });

//         // Reset collider and animation when player hits the ground
//         this.gameObject.onGround(() => {
//             if (!gameState.isGamePaused) {
//                 const leftPressed = keysPressed.left || keysPressed.a || this.mobileControls.left;
//                 const rightPressed = keysPressed.right || keysPressed.d || this.mobileControls.right;
//                 const isMoving = leftPressed || rightPressed || this.isScrolling;

//                 if (!isMoving && this.gameObject.curAnim() !== "idle" && this.gameObject.isGrounded() && !isJumping) {
//                     this.gameObject.play("idle");
//                     isJumping = true;
//                 }

//                 // Reset player collider
//                 this.gameObject.area.shape = new this.k.Polygon([
//                     this.k.vec2(-40, 0),
//                     this.k.vec2(40, 0),
//                     this.k.vec2(40, 100),
//                     this.k.vec2(40, 220),
//                     this.k.vec2(-40, 220),
//                     this.k.vec2(-40, 100),
//                 ]);
//             }
//         });

//         this.gameObject.onFall(() => {
//             if (!gameState.isGamePaused && this.gameObject.curAnim() !== "fall") {
//                 this.gameObject.play("fall");
//             }
//         });

//         this.k.onUpdate(() => {
//             if (gameState.isGamePaused) {
//                 if (this.gameObject.curAnim() !== "idle" && this.gameObject.isGrounded()) {
//                     this.gameObject.play("idle");
//                 }
//                 return;
//             }

//             if (isScrolling && Math.abs(scrollDelta) > 0) {
//                 //const scrollSpeed = this.scrollSpeed;
//                 // Augmente le multiplicateur pour un mouvement plus rapide
//                 // const moveAmount = Math.sign(scrollDelta) * Math.abs(scrollDelta) * 3; //Math.min(Math.abs(scrollDelta) * 3, scrollSpeed);
//                 // const moveAmount = Math.sign(scrollDelta) * Math.abs(scrollDelta) * 4;

//                 //ANCIEN SCROLL
//                 //const moveAmount = Math.sign(scrollDelta) * Math.abs(scrollDelta) * 4;
//                 const moveAmount = scrollDelta * this.scrollSpeed;


//                 if (moveAmount < 0) {
//                     this.moveLeft(Math.abs(moveAmount));
//                 } else {
//                     this.moveRight(moveAmount);
//                 }

//                 // Réduit progressivement le delta pour un mouvement fluide
//                 scrollDelta *= 0.90;

//                 // Si le delta devient trop petit, on le remet à 0
//                 if (Math.abs(scrollDelta) < 0.5) {
//                     scrollDelta = 0;
//                 }
//             }

//             // Check if the player should move
//             const leftPressed = keysPressed.left || keysPressed.a || this.mobileControls.left;
//             const rightPressed = keysPressed.right || keysPressed.d || this.mobileControls.right;

//             if (leftPressed) {
//                 this.moveLeft(this.speed);
//             }
//             if (rightPressed) {
//                 this.moveRight(this.speed);
//             }

//             if (!gameState.isGamePaused && this.gameObject.curAnim() === "fall") {

//                 // Is the player walking on the right
//                 if (!this.gameObject.flipX) {
//                     // Change collider shape when player is falling and walking to the right
//                     this.gameObject.area.shape = new this.k.Polygon([
//                         this.k.vec2(-40, 0),
//                         this.k.vec2(40, 0),
//                         this.k.vec2(40, 100),
//                         this.k.vec2(15, 100),
//                         this.k.vec2(50, 215),
//                         this.k.vec2(10, 215),
//                         this.k.vec2(-15, 100),
//                         this.k.vec2(-40, 100),
//                     ]);

//                 }
//                 // The player is walking to the left
//                 else {
//                     // Change collider shape when player is falling and walking to the left
//                     this.gameObject.area.shape = new this.k.Polygon([
//                         this.k.vec2(-40, 0),
//                         this.k.vec2(40, 0),
//                         this.k.vec2(40, 100),
//                         this.k.vec2(15, 100),
//                         this.k.vec2(-10, 215),
//                         this.k.vec2(-50, 215),
//                         this.k.vec2(-15, 100),
//                         this.k.vec2(-40, 100),
//                     ]);

//                 }

//             }

//             // Player jump
//             if ((keysPressed.space || this.mobileControls.jump) && this.gameObject.isGrounded()) {
//                 this.gameObject.jump(this.jumpForce);
//                 this.gameObject.play("jump");
//                 // We don't want double jump
//                 // keysPressed.space = false;
//             }

//             const isMoving = leftPressed || rightPressed || this.isScrolling;
//             const isJumping = !this.gameObject.isGrounded();

//             // If the player is not moving or jumping then we play the idle animation
//             if (!isMoving && !isJumping) {
//                 if (this.gameObject.curAnim() !== "idle") {
//                     this.gameObject.play("idle");
//                 }
//             }
//         });
//     }








// if (btnLeft) {
//     btnLeft.addEventListener('touchstart', (e) => {
//         e.preventDefault();
//         if (!gameState.isGamePaused) {
//             this.mobileControls.left = true;
//             btnLeft.style.color = 'rgb(8, 45, 103)';
//             btnLeft.style.background = 'rgba(0, 255, 255, 0.7)';
//             btnLeft.style.borderColor = 'rgb(8, 45, 103)';
//         }
//     });

//     btnLeft.addEventListener('touchend', (e) => {
//         e.preventDefault();
//         this.mobileControls.left = false;
//         btnLeft.style.color = 'rgb(0, 255, 255)';
//         btnLeft.style.background = 'rgba(8, 45, 103, 0.8)';
//         btnLeft.style.borderColor = 'rgb(0, 255, 255)';
//     });
//     btnLeft.addEventListener('touchcancel', (e) => {
//         e.preventDefault();
//         this.mobileControls.left = false;
//         btnLeft.style.color = 'rgb(0, 255, 255)';
//         btnLeft.style.background = 'rgba(8, 45, 103, 0.8)';
//         btnLeft.style.borderColor = 'rgb(0, 255, 255)';
//     });
// }

// if (btnRight) {
//     btnRight.addEventListener('touchstart', (e) => {
//         e.preventDefault();
//         if (!gameState.isGamePaused) {
//             this.mobileControls.right = true;
//             btnRight.style.color = 'rgb(8, 45, 103)';
//             btnRight.style.background = 'rgba(0, 255, 255, 0.7)';
//             btnRight.style.borderColor = 'rgb(8, 45, 103)';
//         }
//     });

//     btnRight.addEventListener('touchend', (e) => {
//         e.preventDefault();
//         this.mobileControls.right = false;
//         btnRight.style.color = 'rgb(0, 255, 255)';
//         btnRight.style.background = 'rgba(8, 45, 103, 0.8)';
//         btnRight.style.borderColor = 'rgb(0, 255, 255)';
//     });

//     btnRight.addEventListener('touchcancel', (e) => {
//         e.preventDefault();
//         this.mobileControls.right = false;
//         btnRight.style.color = 'rgb(0, 255, 255)';
//         btnRight.style.background = 'rgba(8, 45, 103, 0.8)';
//         btnRight.style.borderColor = 'rgb(0, 255, 255)';
//     });
// }

// if (btnJump) {
//     btnJump.addEventListener('touchstart', (e) => {
//         e.preventDefault();
//         // No double jump
//         if (!gameState.isGamePaused && this.gameObject.isGrounded()) {
//             this.mobileControls.jump = true;
//             // this.gameObject.jump(this.jumpForce);
//             // this.gameObject.play("jump");
//             btnJump.style.color = 'rgb(8, 45, 103)';
//             btnJump.style.background = 'rgba(0, 255, 255, 0.7)';
//             btnJump.style.borderColor = 'rgb(8, 45, 103)';
//         }
//     });

//     btnJump.addEventListener('touchend', (e) => {
//         e.preventDefault();
//         this.mobileControls.jump = false;
//         btnJump.style.color = 'rgb(0, 255, 255)';
//         btnJump.style.background = 'rgba(8, 45, 103, 0.8)';
//         btnJump.style.borderColor = 'rgb(0, 255, 255)';
//     });

//     btnJump.addEventListener('touchcancel', (e) => {
//         e.preventDefault();
//         this.mobileControls.jump = false;
//         btnJump.style.color = 'rgb(0, 255, 255)';
//         btnJump.style.background = 'rgba(8, 45, 103, 0.8)';
//         btnJump.style.borderColor = 'rgb(0, 255, 255)';
//     });
// }