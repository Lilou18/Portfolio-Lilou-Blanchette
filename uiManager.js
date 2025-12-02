import { gameState } from "./gameState.js";
import { k } from "./loader.js"
import { soundManager } from "./soundManager.js";

// Manages user interface interactions and display
export class UIManager {
    constructor() {
        this.panels = {
            cv: document.getElementById("cvPanel"),
            portfolio: document.getElementById("portfolioPanel"),
            contact: document.getElementById("contact"),
            soundSettings: document.getElementById("soundSettingsPanel")
        };
        this.canvas = document.getElementById("gameCanvas");//document.querySelector("canvas");
        this.currentPanel = null;
        this.currentInteraction = null;
        this.interactionTexts = {};
        this.pauseText = null;
        this.backgroundColor = null;
        this.setupEventListeners();
    };

    setupEventListeners() {
        if (document.readyState === "loading") {
            document.addEventListener('DOMContentLoaded', () => this.initEventListeners());
        }
        else {
            this.initEventListeners();
        }
    }

    initEventListeners() {
        const closeButtons = document.querySelectorAll("[data-close-panel]");
        closeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const panelName = button.getAttribute("data-close-panel");
                this.hidePanel(panelName);
            });
        });
    }

    setUpEnterInput() {
        k.onKeyDown("enter", () => {
            if (this.currentInteraction) {                
                this.displayPanel(this.currentInteraction);
            }
        });

        k.onKeyDown("escape", () => {
            if (this.currentInteraction && this.panels[this.currentInteraction] && this.canvas) {
                if (this.panels[this.currentInteraction].style.display === "block") {                    
                    this.hidePanel(this.currentInteraction);
                }
            }
        });
    };

    setUpHologramClicks() {

        // k.onClick("cvHologram", () => this.displayPanel("cv"));
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

    createInteractionText(hologramTag, text) {
        this.removeInteractionText(hologramTag);

        const hologram = get(hologramTag)[0];
        if (!hologram) return;

        const interactionText = k.add([
            k.text(text, {
                size: 20,
                font: "orbitron",
                align: "center",
            }),
            k.color(255, 255, 255),
            k.pos(hologram.pos.x, hologram.pos.y - 300),
            k.anchor("center"),
            k.z(1),
            `${hologramTag}TextInput`
        ]);

        this.interactionTexts[hologramTag] = interactionText;

        interactionText.onUpdate(() => {
            const currentHologram = get(hologramTag)[0];
            if (currentHologram) {
                interactionText.pos.x = currentHologram.pos.x;
                interactionText.pos.y = currentHologram.pos.y - 300;
            }
        });
    }

    removeInteractionText(hologramTag) {
        if (this.interactionTexts[hologramTag]) {
            this.interactionTexts[hologramTag].destroy();
            delete this.interactionTexts[hologramTag];
        }
    }

    setUpCollisionsUI() {
        if (gameState.player) {
            this.setUpEnterInput();
            this.setUpHologramClicks();

            gameState.player.gameObject.onCollide("cvHologram", () => {
                //debug.log("Appuie sur ENTRÉE pour voir le CV");
                this.currentInteraction = "cv";
                this.createInteractionText("cvHologram", "Appuyez sur Enter \n ou Cliquez");
                // onKeyDown("enter", () => {
                //     this.displayPanel("cv");
                //     //document.getElementById("cvPanel").style.display = "block";

                // })
            });

            gameState.player.gameObject.onCollideEnd("cvHologram", () => {
                if (this.currentInteraction === "cv") {
                    this.currentInteraction = null;
                }
                this.removeInteractionText("cvHologram");
            });

            gameState.player.gameObject.onCollide("portfolioHologram", () => {
                //debug.log("Appuie sur ENTRÉE pour voir le Portfolio");
                this.currentInteraction = "portfolio";
                this.createInteractionText("portfolioHologram", "Appuyez sur Enter \n ou Cliquez");
                // onKeyDown("enter", () => {
                //     this.displayPanel("portfolio");
                //     //document.getElementById("portfolioPanel").style.display = "block";

                // })
            });

            gameState.player.gameObject.onCollideEnd("portfolioHologram", () => {
                if (this.currentInteraction === "portfolio") {
                    this.currentInteraction = null;
                }
                this.removeInteractionText("portfolioHologram");
            });

            gameState.player.gameObject.onCollide("contactHologram", () => {
                //debug.log("Appuie sur ENTRÉE pour voir Contact");
                this.currentInteraction = "contact";
                this.createInteractionText("contactHologram", "Appuyez sur Enter \n ou Cliquez");

            });

            gameState.player.gameObject.onCollideEnd("contactHologram", () => {
                if (this.currentInteraction === "contact") {
                    this.currentInteraction = null;
                }
                this.removeInteractionText("contactHologram");
            });



        }
    }

    displayPanel(panelName) {
        if (this.panels[panelName] && this.canvas && this.currentPanel == null && !soundManager.isSoundSettingsPanelOpen) {
            this.currentPanel = panelName;
            this.panels[panelName].style.display = "block";
            this.canvas.style.filter = "brightness(70%)";
            // Pause the game when a panel is displayed
            gameState.addPauseFlag("panelOpen");
            //gameState.isGamePaused = true;

            //this.canvas.blur();
        }

    }

    hidePanel(panelName) {
        if (this.panels[panelName] && this.canvas && !soundManager.isSoundSettingsPanelOpen) {
            this.currentPanel = null;
            this.panels[panelName].style.display = "none";
            this.canvas.style.filter = "brightness(100%)";
            gameState.removePauseFlag("panelOpen");
            //gameState.isGamePaused = false;

            this.canvas.focus();
        }
    }

    showPauseText() {
        if (!this.pauseText) {
            this.pauseText = add([
                text("PAUSED", {
                    size: 64,
                    font: "orbitron",
                }),
                pos(center()),
                anchor("center"),
                fixed(),
                color(0, 255, 255),
                z(100),
            ]);

            this.backgroundColor = add([
                k.rect(350, 80, { radius: 8 }),
                k.pos(center()),
                k.color(8, 45, 103),
                anchor("center"),
                k.opacity(0.7),
                k.fixed(),
                k.outline(4, rgb(0, 255, 255)),
                z(99),
            ])
        }
    }

    hidePauseText() {
        if (this.pauseText) {
            destroy(this.pauseText);
            this.pauseText = null;
        }
        if(this.backgroundColor){
            destroy(this.backgroundColor);
            this.backgroundColor = null;
        }
    }

}

// Create a global instance
export const uiManager = new UIManager();



