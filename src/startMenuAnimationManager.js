export class StartMenuAnimationManager {
    constructor() {
        let intervalId;

        this.consoleBar = document.getElementById("consoleBar");
        this.characterImg = document.querySelector(".character-display");
        this.performanceAnalysisBtn = document.getElementById("performanceAnalysis");
        this.graphPanel = document.getElementById("graphPanel");
        this.portoflioClassicBtn = document.getElementById("portfolioClassic");
        this.portfolioGamingBtn = document.getElementById("start-button");
        // Automatically start the menu energy bar animation
        // this.progressBarAnimation();

        this.initEventListeners();
    }

    initEventListeners() {
        this.characterImg?.addEventListener("click", () => {
            this.consoleBar.textContent = "// Identité confirmée - Bonjour !";
        });

        this.performanceAnalysisBtn?.addEventListener("click", () => {
            this.consoleBar.textContent = "// Analyse en cours...";
            this.graphPanel.classList.add("active");

            setTimeout(() => {
                this.graphPanel.classList.remove("active");
                this.consoleBar.textContent = "// Analyse terminée ! - Prête à travailler."
            }, 5000);
        });

        this.portoflioClassicBtn?.addEventListener("mouseover", () => {
            this.consoleBar.textContent = "// Mode classique - Navigation standard du portfolio";
        });

        this.portoflioClassicBtn?.addEventListener("mouseout", () => {
            this.consoleBar.textContent = "// En attente — Choisissez votre interface pour le portfolio";
        });

        this.portfolioGamingBtn?.addEventListener("mouseover", () => {
            this.consoleBar.textContent = "// Mode intéractif - Expérience ludique";
        });

        this.portfolioGamingBtn?.addEventListener("mouseout", () => {
            this.consoleBar.textContent = "// En attente — Choisissez votre interface pour le portfolio";
        });
    }


    /**
     * Starts the looping animation of the energy bar in the start menu.
     */
    progressBarAnimation() {
        const energyBar = document.getElementById("energyBar");
        let width = 1;
        let barDirection = 1;
        intervalId = setInterval(() => {
            width += barDirection;
            energyBar.style.width = width + "%";

            // Reverse direction when reaching bounds
            if (width >= 100 || width <= 0) {
                barDirection *= -1;
            }
        }, 20);
    }

    /**
     * Stops the energy bar animation when leaving the start menu
     */
    stopProgressBarAnimation() {
        clearInterval(intervalId);
    }
}