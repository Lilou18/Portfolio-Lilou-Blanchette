import { gameState } from "./gameState.js";

export class UIManager {
    constructor() {
        this.panels = {
            cv: document.getElementById("cvPanel"),
            portfolio: document.getElementById("portfolioPanel"),
            contact: document.getElementById("contact")
        }
        this.canvas = document.getElementById("gameCanvas");//document.querySelector("canvas");
        this.currentPanel = null;
        this.currentInteraction = null;
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
        //console.log("BUTTONS " + closeButtons.length);
        closeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const panelName = button.getAttribute("data-close-panel");
                this.hidePanel(panelName);
            });
        });

        //this.setUpEnterInput();
        // this.canvas.addEventListener("click", () => {
        //     this.canvas.focus();
        // })
    }

    setUpEnterInput() {
        onKeyDown("enter", () => {
            console.log("ENTER!!!");
            if (this.currentInteraction) {
                this.displayPanel(this.currentInteraction);
            }
        });
    };

    setUpCollisionsUI() {
        if (gameState.player) {
            this.setUpEnterInput();

            gameState.player.gameObject.onCollide("cvHologram", () => {
                debug.log("Appuie sur ENTRÉE pour voir le CV");
                this.currentInteraction = "cv";
                // onKeyDown("enter", () => {
                //     this.displayPanel("cv");
                //     //document.getElementById("cvPanel").style.display = "block";

                // })
            });

            gameState.player.gameObject.onCollideEnd("cvHologram", () => {
                if (this.currentInteraction === "cv") {
                    this.currentInteraction = null;
                }
            });

            gameState.player.gameObject.onCollide("portfolioHologram", () => {
                debug.log("Appuie sur ENTRÉE pour voir le Portfolio");
                this.currentInteraction = "portfolio";
                // onKeyDown("enter", () => {
                //     this.displayPanel("portfolio");
                //     //document.getElementById("portfolioPanel").style.display = "block";

                // })
            });

            gameState.player.gameObject.onCollideEnd("portfolioHologram", () => {
                if (this.currentInteraction === "portfolio") {
                    this.currentInteraction = null;
                }
            });

            gameState.player.gameObject.onCollide("contactHologram", () => {
                debug.log("Appuie sur ENTRÉE pour voir Contact");
                this.currentInteraction = "contact";

            });

            gameState.player.gameObject.onCollideEnd("contactHologram", () => {
                if (this.currentInteraction === "contact") {
                    this.currentInteraction = null;
                }
            });



        }
    }


    displayPanel(panelName) {
        if (this.panels[panelName] && this.canvas) {
            this.panels[panelName].style.display = "block";
            this.canvas.style.filter = "brightness(70%)";

            //this.canvas.blur();
        }

    }

    hidePanel(panelName) {
        if (this.panels[panelName] && this.canvas) {
            this.panels[panelName].style.display = "none";
            this.canvas.style.filter = "brightness(100%)";

            this.canvas.focus();
        }
    }

}

// Create a global instance
export const uiManager = new UIManager();



