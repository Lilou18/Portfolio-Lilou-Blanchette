import { k } from "./loader.js";
import { uiManager } from "./uiManager.js";
//import { soundManager } from "./soundManager.js";
import { gameState } from "./gameState.js";
import { deviceInfo } from "./deviceInfo.js";

class ApplicationManager {
    constructor() {
        this.isInIntroScene = false;
        this.init();
    }

    init() {
        // À RETIRÉ À NE PAS OUBLIER!!!!
        gameState.gameStarted = true;
        this.initWindowEvents();
    }

    /**
    * Initializes window focus-related event listeners.
    */
    initWindowEvents() {
        window.addEventListener('blur', () => this.looseWindowFocus());
        window.addEventListener('focus', () => this.handleWindowFocus());

        window.matchMedia("(orientation: portrait)").addEventListener("change", () => {
            this.updateOverlayDisplay();
        });

        if (!deviceInfo.isIOS) {
            document.addEventListener('fullscreenchange', () => { this.updateOverlayDisplay(); });
            document.addEventListener('mozfullscreenchange', () => { this.updateOverlayDisplay(); });
            document.addEventListener('MSFullscreenChange', () => { this.updateOverlayDisplay(); });
            document.addEventListener('webkitfullscreenchange', () => { this.updateOverlayDisplay(); });
        }

        this.setupFullScreenBtn();
    }

    /**
    * Callback triggered when the browser window loses focus.
    * 
    * Pauses the game to prevent the player from continuing
    * to play while the tab or window is inactive.
    */
    looseWindowFocus() {
        gameState.addPauseFlag("windowBlur");
        uiManager.showPauseText();
        //soundManager.pauseUnpauseBackgroundMusic();
    }

    /**
     * Callback triggered when the browser window regains focus.
     * 
     * Removes the pause related to window focus loss and resumes
     * the game only if no other pause sources are active.
     */
    handleWindowFocus() {
        gameState.removePauseFlag("windowBlur");
        uiManager.hidePauseText();
        //soundManager.pauseUnpauseBackgroundMusic();
    }

    /**
     * Displays a DOM element in fullscreen mode.
     * @param {HTMLElement} elem 
     * @see {@link https://www.w3schools.com/howto/howto_js_fullscreen.asp}
     */
    openFullscreen(elem) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    }

    /**
    * Check if device is in portrait mode and display the overlay if needed.
    * Pause the game until the device is no longer in portrait.
    * 
    * @param {HTMLElement} overlay  Overlay displayed on top of the game canvas
    *                                to block gameplay and start menu.
    * 
    * @returns {boolean} True if the orientation overlay is displayed (portrait),
    *                    false otherwise (landscape).
    */
    isOrientationOverlayDisplayed(overlay) {
        // DOM element that instructs the user to rotate the device to landscape mode
        const portraitSection = document.getElementById("portraitSection");
        const isPortrait = deviceInfo.isPortrait;

        if (isPortrait) {
            // Show overlay and orientation instructions
            overlay.style.display = "flex";
            portraitSection.style.display = "flex";
            // Pause the game if it has already started
            if (gameState.gameStarted) {
                gameState.addPauseFlag("portraitMode");
            }
            return true;
        }
        // Hide orientation instructions when back in landscape mode
        else {
            portraitSection.style.display = "none";
            // Resume the game if it was paused due to portrait mode
            if (gameState.gameStarted) {
                gameState.removePauseFlag("portraitMode");
            }
            return false;
        }
    }

    /**
     * Check if the game is in fullscreen mode and display the overlay if not.
     * Pauses the game until the user enters fullscreen mode.
     * 
     * @param {HTMLElement} overlay Overlay displayed on top of the game canvas
     *                              to block gameplay and start menu.
     * @returns {boolean} True if the fullscreen overlay is displayed,
     *                    false if fullscreen mode is already enabled
     *                    or not required (iOS).
     */
    isFullScreenOverlayDisplayed(overlay) {
        // Fullscreen request does no work on IOS device so we don't ask
        if (deviceInfo.isIOS) {
            
            return false;
        }

        // DOM element that instructs the user to enable fullscreen mode
        const fullScreenSection = document.getElementById("fullScreenSection");
        const isFullScreen = (
            document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement
        );

        // Check fullscreen status across browsers
        if (!isFullScreen) {
            
            // Pause the game while fullscreen is not enabled
            if (gameState.gameStarted) {
                gameState.addPauseFlag("notFullScreen");
            }
            
            // Display fullscreen instructions
            overlay.style.display = "flex";
            fullScreenSection.style.display = "flex";
            return true;
        }
        else {
            // Remove fullscreen pause flag and hide instructions
            if (gameState.gameStarted) {
                gameState.removePauseFlag("notFullScreen");
            }
            fullScreenSection.style.display = "none";
            return false;
        }

    }

    /**
     * Sets up the fullscreen button functionality for non-iOS devices.
     * When clicked, the button requests fullscreen mode and updates the overlays.
     * 
     * Fullscreen is skipped on iOS devices since it is not supported.
     */
    setupFullScreenBtn() {
        // Skip fullscreen setup for iOS devices
        if (!deviceInfo.isIOS) {

            // Add click listener to request fullscreen for the fullscreen button from the DOM
            const fullScreenBtn = document.getElementById("fullscreenBtn");
            fullScreenBtn.addEventListener("click", () => {
                const elem = document.documentElement;
                this.openFullscreen(elem);
                this.updateOverlayDisplay();
            });
        }

    }

    /**
    * This function ensures that mobile players are blocked by an overlay
    * when requirements are not met: 
    * - the device must be in landscape orientation
    * - fullscreen must be allowed for non-iOS users
    */
    updateOverlayDisplay() {
        const isMobile = deviceInfo.isMobile;

        // Desktop behavior: no overlay needed
        if (!isMobile) {
            // If the game has not started yet, ensure we enter the intro scene
            if (!gameState.gameStarted && !this.isInIntroScene) {
                this.isInIntroScene = true;
                //k.go("intro");

            }
            return;
        }

        // Overlay that blocks gameplay on mobile when conditions are not met
        const overlay = document.getElementById("overlay");

        // Check if landscape mode is required and display orientation overlay if needed
        const needLandscape = this.isOrientationOverlayDisplayed(overlay);

        const needFullScreen = this.isFullScreenOverlayDisplayed(overlay);

        if (!needLandscape) {

            if (!needFullScreen) {
                // If all mobile requirements are met, hide the overlay
                overlay.style.display = "none";
                // If the game has not started yet, ensure we enter the intro scene
                if (!gameState.gameStarted && !this.isInIntroScene) {
                    //k.go("intro");
                    this.isInIntroScene = true;


                }
            }
        }
    }

}

export const applicationManager = new ApplicationManager();