import { gameState } from "./gameState.js";
import { k } from "./loader.js"
import { deviceInfo } from "./deviceInfo.js";

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
        this.isSoundSettingsPanelOpen = false;
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

        window.addEventListener('keydown', (e) => {
            if (e.key === "Escape") {
                if (this.isSoundSettingsPanelOpen) {
                    this.hidePanel("soundSettings");
                    return;
                }

                if (this.currentPanel && this.panels[this.currentPanel] && this.canvas) {
                    if (this.panels[this.currentPanel].style.display === "block") {
                        this.hidePanel(this.currentPanel);
                    }
                }
            }
        })
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

    createInteractionText(hologramTag) {
        this.removeInteractionText(hologramTag);

        const isMobile = deviceInfo.isMobile;
        const text = isMobile || deviceInfo.isTouchEnabled ? "Appuyez sur \n l'hologramme" : "Appuyez sur « Enter » \n ou Cliquez";
        const textSize = isMobile ? 25 : 20;

        const hologram = k.get(hologramTag)[0];
        if (!hologram) return;

        const interactionText = k.add([
            k.text(text, {
                size: textSize,
                font: "orbitron",
                align: "center",
            }),
            k.color(255, 255, 255),
            k.pos(hologram.pos.x, hologram.pos.y - 310),
            k.anchor("center"),
            k.z(1),
            `${hologramTag}TextInput`
        ]);

        this.interactionTexts[hologramTag] = interactionText;

        // interactionText.onUpdate(() => {
        //     const currentHologram = k.get(hologramTag)[0];
        //     if (currentHologram) {
        //         interactionText.pos.x = currentHologram.pos.x;
        //         interactionText.pos.y = currentHologram.pos.y - 310;
        //     }
        // });
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

            const hologramConfig = {
                cvHologram: "cv",
                portfolioHologram: "portfolio",
                contactHologram: "contact",
            };

            for (let hologram in hologramConfig) {
                gameState.player.gameObject.onCollide(hologram, () => {
                    this.currentInteraction = hologramConfig[hologram];
                    this.createInteractionText(hologram);
                });

                gameState.player.gameObject.onCollideEnd(hologram, () => {
                    if (this.currentInteraction === hologramConfig[hologram]) {
                        this.currentInteraction = null;
                    }
                    this.removeInteractionText(hologram);
                });

            };
        }
    }



    displayPanel(panelName) {
        if (!this.panels[panelName] || !this.canvas) return;


        requestAnimationFrame(() => {
            if (panelName === "soundSettings") {
                this.panels[panelName].style.display = "flex";
                gameState.addPauseFlag("soundSettings");
                this.isSoundSettingsPanelOpen = true;
                if (!this.currentPanel) {
                    this.canvas.style.filter = "brightness(70%)";
                }
                else {
                    this.panels[this.currentPanel].style.filter = "brightness(70%)";
                }
                return;
            }

            if (this.currentPanel == null && !this.isSoundSettingsPanelOpen) {
                this.currentPanel = panelName;
                this.panels[panelName].style.display = "block";
                this.canvas.style.filter = "brightness(70%)";
                // Pause the game when a panel is displayed
                gameState.addPauseFlag("panelOpen");
            }

        });

    }

    hidePanel(panelName) {
        if (!this.panels[panelName] || !this.canvas) return;

        requestAnimationFrame(() => {
            if (panelName === "soundSettings") {
                this.panels[panelName].style.display = "none";
                gameState.removePauseFlag("soundSettings");
                this.isSoundSettingsPanelOpen = false;

                if (!this.currentPanel) {
                    this.canvas.style.filter = "brightness(100%)";
                    this.canvas.focus();
                }
                else {
                    this.panels[this.currentPanel].style.filter = "brightness(100%)";
                }
                return;
            }

            if (this.currentPanel === panelName && !this.isSoundSettingsPanelOpen) {
                this.currentPanel = null;
                this.panels[panelName].style.display = "none";
                this.canvas.style.filter = "brightness(100%)";
                gameState.removePauseFlag("panelOpen");
                this.canvas.focus();
            }
        });
    }

    showPauseText() {
        if (!this.pauseText) {
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


