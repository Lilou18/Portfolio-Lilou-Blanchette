import { gameState } from "./gameState.js";
import { k } from "./loader.js"
import { deviceInfo } from "./deviceInfo.js";
import { world } from "./animationManager.js";

// Manages user interface interactions and display panels
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

        // UI State tracking
        this.currentPanel = null;                   // Currently open panel name
        this.isSoundSettingsPanelOpen = false;      // Sound settings panel state
        this.currentInteraction = null;             // Current hologram being interacted with
        this.interactionTexts = {};                 // Map of hologram tags to text objects

        // Pause overlay elements
        this.pauseText = null;
        this.backgroundColor = null;

        // Game level reference for scaling calculations
        this.levelControl = null

        // Lazy-loading flag
        this.iframesLoaded = false;

        this.setupEventListeners();
    };

    /**
     * Set the levelControl reference for accessing scaling and map data
     * 
     * @param {GameObject} levelControl Reference to the level control object
     */
    setLevelControl(levelControl) {
        this.levelControl = levelControl;
    }

    /**
     * Setup event listeners for DOM elements
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
     * Initialize event listeners for the buttons to close the panels
     */
    initEventListeners() {
        const closeButtons = document.querySelectorAll("[data-close-panel]");
        closeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const panelName = button.getAttribute("data-close-panel");
                this.hidePanel(panelName);
            });
        });
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
     * Setup keyboard input for panel navigation
     * 
     * Keyboard controls:
     * - Enter key: Open the panel of the currently interacted hologram
     * - Escape key: Close panels (prioritizes sound settings > open panel)
     */
    setupPanelKeyboardControls() {
        k.onKeyDown("enter", () => {
            if (this.currentInteraction) {
                this.displayPanel(this.currentInteraction);
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === "Escape") {
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
     * Setup click handlers for hologram gameObject
     * Clicking a hologram directly opens its associated panel
     */
    setUpHologramClicks() {
        k.onClick("cvHologram", () => {
            this.displayPanel("cv");
        });

        k.onClick("portfolioHologram", () => {
            this.displayPanel("portfolio");
        });

        k.onClick("contactHologram", () => {
            this.displayPanel("contact");
        });
    }

    /**
     * Create the instruction text that is displayed over the hologram
     * 
     * @param {string} hologramTag 
     *
     */
    createInteractionText(hologramTag) {
        // Remove any text that might be left
        this.removeInteractionText(hologramTag);

        // Adjust text content and text size if it's on a mobile device or touchscreen device
        const isMobile = deviceInfo.isMobile;
        const text = isMobile || deviceInfo.isTouchEnabled ? "Appuyez sur \n l'hologramme" : "Appuyez sur « Enter » \n ou Cliquez";
        const textSize = isMobile ? 25 : 20;

        const hologram = world.get(hologramTag)[0];
        if (!hologram) return;

        // Scale of the map
        const { scaleX, scaleY } = this.levelControl.getCurrentScale();
        const uniformScale = (scaleX + scaleY) / 2;

        // Find the original hologram position (before any scaling)
        // Original hologram position = actual position / scale
        const mapOffsetY = this.levelControl.getMapOffsetY();
        const originalX = hologram.pos.x / scaleX;
        const originalY = (hologram.pos.y - mapOffsetY) / scaleY;

        // Calculate the position with offset and scale
        const newX = originalX * scaleX;
        const newY = mapOffsetY + ((originalY - 310) * scaleY);

        const interactionText = k.add([
            k.text(text, {
                size: textSize,
                font: "orbitron",
                align: "center",
            }),
            k.color(255, 255, 255),
            k.pos(newX, newY),
            k.anchor("center"),
            k.z(1),
            `${hologramTag}TextInput`
        ]);

        interactionText.scale = k.vec2(uniformScale);

        // Save a reference of the gameObject created
        this.interactionTexts[hologramTag] = {
            object: interactionText,
            hologramTag: hologramTag,
            originalX: originalX,
            originalY: originalY
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
            this.interactionTexts[hologramTag].object.destroy();
            delete this.interactionTexts[hologramTag];
        }
    }

    /**
     * Update interaction text position and scale when the window size is changed
     */
    updateInteractionTextsOnResize() {
        // New scale to apply
        const { scaleX, scaleY } = this.levelControl.getCurrentScale();
        const uniformScale = (scaleX + scaleY) / 2;
        const mapOffsetY = this.levelControl.getMapOffsetY();

        // Update the interaction text of each hologram
        for (const hologramTag in this.interactionTexts) {
            const textData = this.interactionTexts[hologramTag];
            const hologram = world.get(textData.hologramTag)[0];

            if (hologram && textData.object) {
                const newX = textData.originalX * scaleX;
                const newY = mapOffsetY + ((textData.originalY - 310) * scaleY);

                textData.object.pos.x = newX;
                textData.object.pos.y = newY;
                textData.object.scale = k.vec2(uniformScale);
            }
        }
    }

    /**
     * Setup all interaction handlers for holograms and panels.
     * Initializes keyboard input, click handlers, and collision detection.
     */
    setUpHologramInteractions() {
        if (gameState.player) {
            // Setup keyboard and click events
            this.setupPanelKeyboardControls();
            this.setUpHologramClicks();

            const hologramConfig = {
                cvHologram: "cv",
                portfolioHologram: "portfolio",
                contactHologram: "contact",
            };

            // Register collision and collision-end handlers for each hologram
            for (let hologram in hologramConfig) {
                // When the player collides with an hologram we display the interaction text
                gameState.player.gameObject.onCollide(hologram, () => {
                    this.currentInteraction = hologramConfig[hologram];
                    this.createInteractionText(hologram);
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
        });
        this.iframesLoaded = true;
    }

    /**
     *  Display a panel (CV, Portfolio, Contact, or Sound Settings)
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
     * Hide a panel
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
     * Display the pause overlay
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
    }

    /**
     * Hide the pause overlay
     */
    hidePauseText() {
        if (this.pauseText) {
            k.destroy(this.pauseText);
            this.pauseText = null;
        }
        if (this.backgroundColor) {
            k.destroy(this.backgroundColor);
            this.backgroundColor = null;
        }
    }


}

// Create a global instance
export const uiManager = new UIManager();


