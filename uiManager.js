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
        this.setupEventListeners();
    };

    setupEventListeners(){
        if(document.readyState ==="loading"){
            document.addEventListener('DOMContentLoaded', () => this.initEventListeners());
        }
        else{
            this.initEventListeners();
        }

    }

    initEventListeners(){
        const closeButtons = document.querySelectorAll("[data-close-panel]");
        //console.log("BUTTONS " + closeButtons.length);
        closeButtons.forEach( (button) => {
            button.addEventListener("click", () => {
                const panelName = button.getAttribute("data-close-panel");
                this.hidePanel(panelName);
            });
        });

        // this.canvas.addEventListener("click", () => {
        //     this.canvas.focus();
        // })
    }

    setUpCollisionsUI() {
        if (gameState.player) {

            gameState.player.gameObject.onCollide("cvHologram", () => {
                debug.log("Appuie sur ENTRÉE pour voir le CV");
                onKeyDown("enter", () => {
                    this.displayPanel("cv");
                    //document.getElementById("cvPanel").style.display = "block";

                })
            });

            gameState.player.gameObject.onCollide("portfolioHologram", () => {
                debug.log("Appuie sur ENTRÉE pour voir le Portfolio");
                onKeyDown("enter", () => {
                    this.displayPanel("portfolio");
                    //document.getElementById("portfolioPanel").style.display = "block";

                })
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



