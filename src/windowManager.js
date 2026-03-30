import { uiManager } from "./uiManager.js";
import { soundManager } from "./soundManager.js";
import { gameState } from "./gameState.js";
import { deviceInfo } from "./deviceInfo.js";


class WindowManager {
    /**
    * Handles window-related utilities such as:
    * - Pausing/resuming the game when the window loses/regains focus
    * - Detecting device orientation and showing a portrait overlay
    *
    */

    constructor() {
        // Get the documentElement
        this.elem = document.documentElement;
        // Reference to the overlay and portrait-specific overlay in the DOM
        this.overlay = document.getElementById("overlay");
        this.orientationOverlay = document.getElementById("portraitSection");
        // Fullscreen button reference
        this.fullScreenBtn = document.getElementById("fullscreenBtn");
        // State 
        this.isGameFullScreen = false;
        // Optional callback to notify when orientation changes from portrait to landscape
        this.onOrientationChangeCallback = null;

        // Initialize event listeners for window focus and orientation changes
        this.initWindowEvents();

        this.initFullScreenEvents()

        // Check the current device orientation immediately
        this.checkOrientation();
    };

    /**
    * Initializes window focus-related event listeners.
    */
    initWindowEvents() {
        window.addEventListener('blur', this.looseWindowFocus);
        window.addEventListener('focus', this.handleWindowFocus);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handleWindowFocus();
            } else {
                this.looseWindowFocus();
            }
        });

        window.matchMedia("(orientation: portrait)").addEventListener("change", (event) => {
            this.checkOrientation();
        });
    }

    /**
     * Initialize all events to open and close fullscreen.
     * @see {@link https://www.geeksforgeeks.org/html/html-dom-fullscreenelement-property/}
     */
    initFullScreenEvents() {
        if (!this.fullScreenBtn) return;

        if (!this.canUseFullscreen()) {
            this.fullScreenBtn.style.display = "none";
            return;
        }

        this.fullScreenBtn.addEventListener("click", () => {
            this.fullScreenBtn.blur();
            this.isGameFullScreen ? this.closeFullscreen() : this.openFullscreen();
        })

        document.addEventListener('fullscreenchange', () => { this.isGameFullScreen = !!document.fullscreenElement });
        document.addEventListener('mozfullscreenchange', () => { this.isGameFullScreen = !!document.mozFullScreenElement });
        document.addEventListener('MSFullscreenChange', () => { this.isGameFullScreen = !!document.msFullscreenElement });
        document.addEventListener('webkitfullscreenchange', () => { this.isGameFullScreen = !!document.webkitFullscreenElement });
    }

    /**
    * Callback triggered when the browser window loses focus.
    * 
    * Pauses the game to prevent the player from continuing
    * to play while the tab or window is inactive.
    */
    looseWindowFocus() {
        gameState.addPauseFlag("windowBlur");
        if (gameState.gameStarted) {
            uiManager.showPauseText();
        }
        soundManager.addPauseFlagMusic("windowBlur");
    }

    /**
     * Callback triggered when the browser window regains focus.
     * 
     * Removes the pause related to window focus loss and resumes
     * the game only if no other pause sources are active.
     */
    handleWindowFocus() {
        gameState.removePauseFlag("windowBlur");
        if (gameState.gameStarted) {
            uiManager.hidePauseText();
        }
        soundManager.removePauseFlagMusic("windowBlur");
    }

    /**
     * Set a callback function that is called when the user rotates
     * the device from portrait to landscape, allowing the intro scene to start.
     */
    setOrientationChangeCallback(cb) {
        this.onOrientationChangeCallback = cb;
    }

    setIsClassicModeGetter(isClassicMode) {
        this.isClassicModeGetter = isClassicMode;
    }

    /**
     * Checks the current device orientation and shows/hides
     * the portrait overlay as needed.
     *
     * Also triggers the orientation change callback if moving from
     * portrait to landscape and the game hasn’t started yet
     */
    checkOrientation() {
        if (!this.orientationOverlay) return;
        // If the device is a PC no need to check the orientation
        if (!deviceInfo.isMobile && !deviceInfo.isTablet && !deviceInfo.isIpad) return;

        // Display the overlay if in portrait mode
        if (deviceInfo.isPortrait) {

            // We allow vertical mode for the classic portfolio
            if (uiManager.isClassicMode) return;

            gameState.addPauseFlag("portraitMode");
            this.showPortraitOverlay();
        }
        // Hide the overlay if not in portrait mode
        else {
            gameState.removePauseFlag("portraitMode");
            this.hidePortraitOverlay();

            if (!gameState.gameStarted && !gameState.isInIntroScene && this.onOrientationChangeCallback) {
                this.onOrientationChangeCallback();
            }
        }
    }

    /**
    * Display the overlay elements when in portrait mode
    */
    showPortraitOverlay() {
        this.overlay.style.display = "flex";
        this.orientationOverlay.style.display = "flex";
    }

    /**
     * Hide the overlay elements when leaving portrait mode
     */
    hidePortraitOverlay() {
        this.overlay.style.display = "none";
        this.orientationOverlay.style.display = "none";
    }

    /**
     * Is fullscreen supported and allowed
     * @returns {boolean}
     */
    canUseFullscreen() {
        return !!(
            document.documentElement.requestFullscreen ||
            document.documentElement.webkitRequestFullscreen ||
            document.documentElement.msRequestFullscreen
        );
    }

    /**
     * Displays the website in fullscreen mode.
     * @see {@link https://www.w3schools.com/howto/howto_js_fullscreen.asp}
     */
    openFullscreen() {
        if (this.elem.requestFullscreen) {
            this.elem.requestFullscreen();
            this.isGameFullScreen = true;
        } else if (this.elem.webkitRequestFullscreen) { // Safari 
            this.elem.webkitRequestFullscreen();
            this.isGameFullScreen = true;
        } else if (this.elem.msRequestFullscreen) { // IE11 
            this.elem.msRequestFullscreen();
            this.isGameFullScreen = true;
        }
    }

    /**
     * Exit fullscreen mode.
     */
    closeFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            this.isGameFullScreen = false;
        } else if (this.elem.webkitExitFullscreen) { // Safari
            document.webkitExitFullscreen();
            this.isGameFullScreen = false;
        } else if (this.elem.msExitFullscreen) { // IE11
            document.msExitFullscreen();
            this.isGameFullScreen = false;
        }
    }

}

// Export a single instance of WindowManager
export const windowManager = new WindowManager();