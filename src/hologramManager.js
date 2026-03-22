import { k } from "./loader.js";
import { world } from "./animationManager.js";
import { gameState } from "./gameState.js";
import { deviceInfo } from "./deviceInfo.js";

export class HologramManager {
    /**
    * Manages hologram interactions, interaction texts, and collision detection.
    */

    /**
    * @param {UIManager} uiManager Reference to the main UI manager
    * @param {Object} levelControl Reference to the level control object
    */
    constructor(uiManager, levelControl) {
        this.uiManager = uiManager;
        this.levelControl = levelControl;

        this.currentInteraction = null;             // Current hologram being interacted with
        this.interactionTexts = {};                 // Map of hologram tags to text objects
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
                // When the player collides with a hologram we display the interaction text
                gameState.player.gameObject.onCollide(hologram, () => {
                    this.currentInteraction = hologramConfig[hologram];
                    this.uiManager.currentInteraction = this.currentInteraction;
                    this.displayInteractionText(hologram);
                });

                // When the player stops colliding with the hologram we remove the interaction text
                gameState.player.gameObject.onCollideEnd(hologram, () => {
                    if (this.currentInteraction === hologramConfig[hologram]) {
                        this.currentInteraction = null;
                        this.uiManager.currentInteraction = null;
                    }
                    this.removeInteractionText(hologram);
                });
            }
        }
    }

    /**
    * Setup click handlers for hologram gameObject.
    * Clicking a hologram directly opens its associated panel.
    */
    setUpHologramClicks() {
        k.onClick("hologramCV", () => this.uiManager.displayPanel("cv"));
        k.onClick("hologramPortfolio", () => this.uiManager.displayPanel("portfolio"));
        k.onClick("hologramContact", () => this.uiManager.displayPanel("contact"));
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
        const TEXT_OFFSET_Y = 160;

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
}