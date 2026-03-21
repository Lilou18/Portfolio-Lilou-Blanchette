import { gameState } from "./gameState.js";
import { k } from "./loader.js"
import { deviceInfo } from "./deviceInfo.js";
import { world } from "./animationManager.js";
import { soundManager } from "./soundManager.js";
import { resetWorld } from "./animationManager.js";
import { setupCopyButtons } from "./utils.js";

// Manages user interface interactions and display panels.
export class UIManager {
    constructor() {
        // References to HTML panels
        this.panels = {
            cv: document.getElementById("cvPanel"),
            portfolio: document.getElementById("portfolioPanel"),
            contact: document.getElementById("contact"),
            soundSettings: document.getElementById("soundSettingsPanel")
        };
        this.canvas = document.getElementById("gameCanvas");

        // Buttons to move the player when the user is on mobile.
        this.mobileControls = document.getElementById("mobileControls");

        // Nav bar displayed in game
        this.nav = document.getElementById("gameNav");

        // UI State tracking
        this.currentPanel = null;                   // Currently open panel name
        this.isSoundSettingsPanelOpen = false;      // Sound settings panel state
        this.currentInteraction = null;             // Current hologram being interacted with
        this.interactionTexts = {};                 // Map of hologram tags to text objects

        // Classic portfolio mode flag — disables game-specific panel behaviour
        this.isClassicMode = false;

        // Pause overlay elements
        this.pauseText = null;
        this.backgroundColor = null;

        // Game level reference for scaling calculations
        this.levelControl = null

        // Lazy-loading flag
        this.iframesLoaded = false;
        this.iframeStates = {};

        this.setupEventListeners();
    };

    /**
     * Set the levelControl reference for accessing scaling and level data.
     * 
     * @param {GameObject} levelControl Reference to the level control object
     */
    setLevelControl(levelControl) {
        this.levelControl = levelControl;
    }

    /**
     * Setup event listeners for DOM elements.
     */
    setupEventListeners() {
        if (document.readyState === "loading") {
            document.addEventListener('DOMContentLoaded', () => this.initEventListeners());
        }
        else {
            this.initEventListeners();
        }
    }

    /**
     * Initialize event listeners for the buttons to close the panels.
     */
    initEventListeners() {
        const exitGameBtn = document.getElementById("exitGameBtn");
        exitGameBtn.addEventListener("click", () => {
            if (this.currentPanel) {
                gameState.removePauseFlag("panelOpen");
                this.panels[this.currentPanel].style.display = "none";
                this.currentPanel = null;
            }

            if (this.isSoundSettingsPanelOpen) {
                gameState.removePauseFlag("soundSettings");
                this.panels.soundSettings.style.display = "none";
                this.isSoundSettingsPanelOpen = false;
            }

            this.canvas.classList.remove("dimmed");

            if (this.nav) this.nav.style.display = "none";

            soundManager.stopBackgroundMusic();

            const scorePanel = document.getElementById("scorePanel");
            if (scorePanel) scorePanel.style.display = "none";

            gameState.gameStarted = false;

            resetWorld();

            k.go("intro");
        });

        const closeButtons = document.querySelectorAll("[data-close-panel]");
        closeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const panelName = button.getAttribute("data-close-panel");
                this.hidePanel(panelName);
            });
        });

        // In classic mode, the X returns to the start menu
        document.getElementById("classicExitBtn")?.addEventListener("click", () => this.exitClassicPortfolio())

        setupCopyButtons();

        // https://medium.com/@mihauco/youtube-iframe-api-without-youtube-iframe-api-f0ac5fcf7c74
        window.addEventListener("message", (event) => {
            if (!event.data) return;

            let data;

            try {
                data = JSON.parse(event.data);
            } catch {
                return;
            }

            if (data.event === "infoDelivery" && data.info?.playerState !== undefined) {
                const state = data.info.playerState;
                const videoId = data.info.videoData?.video_id;

                if (!videoId) return;

                // Check if the iframe is playing
                if (state === 1) {
                    this.iframeStates[videoId] = true;
                }
                // Check if the iframe is finished or paused
                else if (state === 0 || state === 2) {
                    this.iframeStates[videoId] = false;
                }

                const isVideoPlaying = Object.values(this.iframeStates).some(s => s === true)
                // If a video is playing then we pause the background music
                isVideoPlaying ? soundManager.addPauseFlagMusic("videoPlaying") : soundManager.removePauseFlagMusic("videoPlaying");
            }
        });

        this.setupPanelKeyboardControls();
    }

    /**
     * Initializes all UI elements required during gameplay.
     */
    onGameplayStart() {
        this.initializeMobileControls();
        this.setUpHologramInteractions();
        this.displayNavBar();
    }

    /**
     * Show or hide mobile controls based on the device type (phone or touchscreen).
     */
    initializeMobileControls() {
        if (this.mobileControls && (deviceInfo.isMobile || deviceInfo.isTouchEnabled)) {
            this.mobileControls.style.display = "flex";
        }
    }

    /**
     * Display the nav bar.
     */
    displayNavBar() {
        if (!this.nav) return;

        this.nav.style.display = "flex";
    }

    /**
     * Setup keyboard input for panel navigation.
     * 
     * Keyboard controls:
     * - Enter key: Open the panel of the currently interacted hologram
     * - Escape key: Close panels (prioritizes sound settings > open panel)
     */
    setupPanelKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (this.isClassicMode) return;
                this.displayPanel(this.currentInteraction);
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === "Escape") {

                // In classic mode, the Escape returns to the start menu
                if (this.isClassicMode) {
                    this.exitClassicPortfolio();
                    return;
                }

                // Close sound settings panel first if open
                if (this.isSoundSettingsPanelOpen) {
                    this.hidePanel("soundSettings");
                    return;
                }

                // Otherwise close any open panel
                if (this.currentPanel && this.panels[this.currentPanel] && this.canvas) {
                    if (this.panels[this.currentPanel].style.display === "block") {
                        this.hidePanel(this.currentPanel);
                    }
                }
            }
        })
    };

    /**
     * Setup click handlers for hologram gameObject.
     * Clicking a hologram directly opens its associated panel.
     */
    setUpHologramClicks() {
        k.onClick("hologramCV", () => {
            this.displayPanel("cv");
        });

        k.onClick("hologramPortfolio", () => {
            this.displayPanel("portfolio");
        });

        k.onClick("hologramContact", () => {
            this.displayPanel("contact");
        });
    }

    /**
     * Create the instruction text that is displayed over the hologram.
     * 
     * @param {string} hologramTag 
     *
     */
    displayInteractionText(hologramTag) {
        // Display the hologram text if it's already created
        if (this.interactionTexts[hologramTag]) {
            this.interactionTexts[hologramTag].object.opacity = 1;
            return;
        }

        // Adjust text content and text size if it's on a mobile device or touchscreen device
        const isMobile = deviceInfo.isMobile;
        const text = isMobile || deviceInfo.isTouchEnabled ? "Appuyez sur \n l'hologramme" : "Appuyez sur « Enter » \n ou Cliquez";
        const textSize = (isMobile || deviceInfo.isIpad || deviceInfo.isTablet) ? 30 : 20;

        const hologram = world.get(hologramTag)[0];
        if (!hologram) return;

        // Scale of the level
        const { scaleX, scaleY } = this.levelControl.getCurrentScale();

        // Y offset so the text appears on top of the hologram
        const TEXT_OFFSET_Y = 160;//isMobile || deviceInfo.isTouchEnabled ? -130 : -120;

        const interactionText = k.add([
            k.text(text, {
                size: textSize,
                font: "orbitron",
                align: "center",
            }),
            k.color(255, 255, 255),
            k.pos(hologram.pos.x, hologram.pos.y - (TEXT_OFFSET_Y * scaleY * this.levelControl.spriteScaleRatio)),
            k.anchor("center"),
            k.z(1),
            `${hologramTag}TextInput`
        ]);

        interactionText.scale = k.vec2(scaleX * this.levelControl.spriteScaleRatio, scaleY * this.levelControl.spriteScaleRatio);

        // Save a reference of the gameObject created
        this.interactionTexts[hologramTag] = {
            object: interactionText,
            hologramTag: hologramTag,
        };
    }

    /**
     * 
     * Remove the interaction text associated to the hologram
     * 
     * @param {string} hologramTag 
     */
    removeInteractionText(hologramTag) {
        if (this.interactionTexts[hologramTag]) {
            this.interactionTexts[hologramTag].object.opacity = 0;
        }
    }

    /**
     * Update interaction text position and scale when the window size is changed
     */
    updateInteractionTextsOnResize() {
        // New scale to apply
        const { scaleX, scaleY } = this.levelControl.getCurrentScale();
        const TEXT_OFFSET_Y = 160;


        // Update the interaction text of each hologram
        for (const hologramTag in this.interactionTexts) {
            const textData = this.interactionTexts[hologramTag];
            const hologram = world.get(textData.hologramTag)[0];

            if (hologram && textData.object) {

                textData.object.pos = k.vec2(hologram.pos.x, hologram.pos.y - (TEXT_OFFSET_Y * scaleY * this.levelControl.spriteScaleRatio));

                textData.object.scale = k.vec2(scaleX * this.levelControl.spriteScaleRatio, scaleY * this.levelControl.spriteScaleRatio);
            }
        }
    }

    /**
     * Setup all interaction handlers for holograms and panels.
     * Initializes keyboard input, click handlers, and collision detection.
     */
    setUpHologramInteractions() {
        if (gameState.player) {
            // Setup click events
            this.setUpHologramClicks();

            const hologramConfig = {
                hologramCV: "cv",
                hologramPortfolio: "portfolio",
                hologramContact: "contact",
            };

            // Register collision and collision-end handlers for each hologram
            for (let hologram in hologramConfig) {
                // When the player collides with an hologram we display the interaction text
                gameState.player.gameObject.onCollide(hologram, () => {
                    this.currentInteraction = hologramConfig[hologram];
                    this.displayInteractionText(hologram);
                });

                // When the player stop colliding with the hologram we destroy the interaction text
                gameState.player.gameObject.onCollideEnd(hologram, () => {
                    if (this.currentInteraction === hologramConfig[hologram]) {
                        this.currentInteraction = null;
                    }
                    this.removeInteractionText(hologram);
                });

            };
        }
    }

    /**
     * Lazy-load portfolio iframes.
     * Iframes are created with data-src instead of src for performance.
     * This function loads them when portfolio panel is first opened.
     */
    loadPortfolioIframes() {
        if (this.iframesLoaded) return;

        const iframes = this.panels.portfolio.querySelectorAll("iframe[data-src]");
        iframes.forEach((iframe) => {
            iframe.src = iframe.getAttribute("data-src");
            iframe.removeAttribute('data-src');
            iframe.dataset.ready = "false";

            iframe.addEventListener("load", () => {
                iframe.dataset.ready = "true";

                iframe.contentWindow.postMessage(
                    JSON.stringify({
                        event: "listening",
                        id: iframe.id
                    }),
                    "*"
                );
            });
        });
        this.iframesLoaded = true;
    }

    /**
     *  Display a panel (CV, Portfolio, Contact, or Sound Settings).
     * 
     * @param {string} panelName 
     * 
     */
    displayPanel(panelName) {
        if (!this.panels[panelName] || !this.canvas) return;

        if (panelName === "portfolio") {
            this.loadPortfolioIframes();
        }


        requestAnimationFrame(() => {
            // Sound settings panel can be open alongside other panels
            if (panelName === "soundSettings") {
                this.panels[panelName].style.display = "flex";
                // Dims the canvas background or the open panel and pauses the game
                gameState.addPauseFlag("soundSettings");
                this.isSoundSettingsPanelOpen = true;
                if (!this.currentPanel) {
                    this.canvas.classList.add('dimmed');
                }
                else {
                    this.panels[this.currentPanel].classList.add('dimmed');
                }
                return;
            }
            // Only one main panel can be open at a time
            if (this.currentPanel == null && !this.isSoundSettingsPanelOpen) {
                this.currentPanel = panelName;
                this.panels[panelName].style.display = "block";
                // Dims the canvas background and pauses the game
                this.canvas.classList.add('dimmed');
                gameState.addPauseFlag("panelOpen");
            }

        });

    }

    /**
     * Hide a panel.
     * 
     * @param {string} panelName 
     *
     */
    hidePanel(panelName) {
        if (!this.panels[panelName] || !this.canvas) return;

        requestAnimationFrame(() => {
            // Hide sound settings
            if (panelName === "soundSettings") {
                this.panels[panelName].style.display = "none";
                gameState.removePauseFlag("soundSettings");
                this.isSoundSettingsPanelOpen = false;

                // Remove the dimmed effect on the canvas or the open panel
                if (!this.currentPanel) {
                    this.canvas.classList.remove('dimmed');
                    this.canvas.focus();
                }
                else {
                    this.panels[this.currentPanel].classList.remove('dimmed');
                }
                return;
            }

            if (panelName === "portfolio") {
                // Pause the videos when we hide the panel
                this.pausePortfolioIframes();
                soundManager.removePauseFlagMusic("videoPlaying");
            }

            // Hide main panel
            if (this.currentPanel === panelName && !this.isSoundSettingsPanelOpen) {
                this.currentPanel = null;
                this.panels[panelName].style.display = "none";
                // Remove the dimmed effect on the canvas
                this.canvas.classList.remove('dimmed');
                gameState.removePauseFlag("panelOpen");
                this.canvas.focus();
            }
        });
    }

    /**
    * Pause all YouTube iframes in the portfolio panel.
    * @see {@link https://medium.com/@mihauco/youtube-iframe-api-without-youtube-iframe-api-f0ac5fcf7c74}
    */
    pausePortfolioIframes() {
        const iframes = this.panels.portfolio.querySelectorAll("iframe");
        iframes.forEach((iframe) => {
            // If the iframe is not ready we skip API call
            if (!iframe.src || iframe.dataset.ready !== "true") return;

            try {
                iframe.contentWindow.postMessage(
                    JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
                    "*"
                );
            } catch (e) {
                // Player pas encore prêt, on ignore
            }
        });
    }

    /**
     * Display the pause overlay.
     */
    showPauseText() {
        if (!this.pauseText) {
            // Create a "PAUSE" text
            this.pauseText = k.add([
                k.text("PAUSE", {
                    size: 64,
                    font: "orbitron",
                }),
                k.pos(k.center()),
                k.anchor("center"),
                k.fixed(),
                k.color(0, 255, 255),
                k.z(100),
            ]);
            // Create a background rectangle behind the text
            this.backgroundColor = k.add([
                k.rect(350, 80, { radius: 8 }),
                k.pos(k.center()),
                k.color(8, 45, 103),
                k.anchor("center"),
                k.opacity(0.7),
                k.fixed(),
                k.outline(4, k.rgb(0, 255, 255)),
                k.z(99),
            ])
        }
        else {
            this.pauseText.opacity = 1;
            this.backgroundColor.opacity = 1;
        }
    }

    /**
     * Hide the pause overlay.
     */
    hidePauseText() {
        if (this.pauseText) {
            this.pauseText.opacity = 0;
        }
        if (this.backgroundColor) {
            this.backgroundColor.opacity = 0;
        }
    }

    /**
     * Activates classic portfolio mode.
     * Loads all iframes upfront, shows the CV panel by default,
     * wires up tab listeners, and disables game-specific panel behaviour.
     */
    displayClassicPortfolio() {
        this.isClassicMode = true;

        document.body.classList.add("classic-mode");

        if (this.nav) this.nav.style.display = "none";
        const classicNav = document.getElementById("classicNav");
        if (classicNav) classicNav.style.display = "flex";

        document.getElementById("classicTabCV")?.addEventListener("click", () => this.classicSwitchPanel("cv"));
        document.getElementById("classicTabPortfolio")?.addEventListener("click", () => this.classicSwitchPanel("portfolio"));
        document.getElementById("classicTabContact")?.addEventListener("click", () => this.classicSwitchPanel("contact"));

        // Load iframes immediately — no need to wait for the portfolio tab
        this.loadPortfolioIframes();

        this.classicSwitchPanel("cv");
    }

    /**
     * Deactivates classic portfolio mode and returns to the start menu.
     * Hides the current panel, hides the classic nav, shows the start menu.
     */
    exitClassicPortfolio() {
        this.isClassicMode = false;
        document.body.classList.remove("classic-mode");

        // Hide only the currently visible panel
        if (this.currentPanel && this.panels[this.currentPanel]) {
            this.panels[this.currentPanel].style.display = "none";
        }
        this.currentPanel = null;

        // Swap navs
        const classicNav = document.getElementById("classicNav");
        if (classicNav) classicNav.style.display = "none";

        // Show start menu again
        const startMenu = document.getElementById("start-menu");
        if (startMenu) startMenu.style.display = "flex";
    }

    /**
     * Display a panel with the classic mode.
     * Only hides the currently active panel before showing the new one.
     * 
     * @param {string} panelName - "cv" | "portfolio" | "contact"
     */
    classicSwitchPanel(panelName) {
        // Hide only the currently visible panel
        if (this.currentPanel && this.currentPanel !== panelName) {
            const current = this.panels[this.currentPanel];
            if (current) current.style.display = "none";
        }

        this.currentPanel = panelName;
        if (this.panels[panelName]) this.panels[panelName].style.display = "block";

        document.getElementById("classicTabCV")?.classList.toggle("classic-active-tab", panelName === "cv");
        document.getElementById("classicTabPortfolio")?.classList.toggle("classic-active-tab", panelName === "portfolio");
        document.getElementById("classicTabContact")?.classList.toggle("classic-active-tab", panelName === "contact");
    }


}

// Create a global instance
export const uiManager = new UIManager();


