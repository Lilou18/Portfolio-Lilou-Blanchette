export class StartMenuAnimationManager {
    /**
     * Manages all the animation and event related to the start menu.
     */
    constructor() {
        let intervalId;

        this.consoleBar = document.getElementById("consoleBar");
        this.characterImg = document.querySelector(".character-display");
        this.hotChocolatBar = document.querySelector(".hot-chocolat-bar");
        this.performanceAnalysisBtn = document.getElementById("performanceAnalysis");
        this.graphPanel = document.getElementById("graphPanel");
        this.portoflioClassicBtn = document.getElementById("portfolioClassic");
        this.portfolioGamingBtn = document.getElementById("start-button");
        this.signalBar = document.getElementById("signalBar");
        this.signalScore = document.getElementById("signalScore");

        // Flags for the signal
        this.signal = 0;
        this.signalFull = false;
        this.graphDone = false;
        this.hoverClassicDone = false;
        this.hoverGamingDone = false;
        this.characterDone = false;
        this.hotChocolatBarDone = false;

        this.initEventListeners();
    }

    /**
     * Initialize event listeners for all the interactives elements in the start menu.
     */
    initEventListeners() {
        this.characterImg?.addEventListener("click", () => {
            if (!this.characterDone) {
                this.characterDone = true;
                this.addSignal();
            }
            this.consoleBar.textContent = "// Identité confirmée - Bonjour !";
        });

        this.hotChocolatBar?.addEventListener("click", ()=>{
            if(!this.hotChocolatBarDone){
                this.hotChocolatBarDone = true;
                this.addSignal();
            }
            this.hotChocolatBar.classList.toggle("playing");
        });

        this.performanceAnalysisBtn?.addEventListener("click", () => {
            this.consoleBar.textContent = "// Analyse en cours...";
            this.graphPanel.classList.add("active");

            setTimeout(() => {
                if (!this.graphDone) {
                    this.graphDone = true;
                    this.addSignal();
                }
                this.graphPanel.classList.remove("active");
                this.consoleBar.textContent = "// Analyse terminée ! - Prête à travailler"
            }, 5000);
        });

        this.portoflioClassicBtn?.addEventListener("mouseover", () => {
            if(!this.hoverClassicDone){
                this.hoverClassicDone = true;
                this.addSignal();
            }
            this.consoleBar.textContent = "// Mode classique - Navigation standard du portfolio";
        });

        this.portoflioClassicBtn?.addEventListener("mouseout", () => {
            this.consoleBar.textContent = "// En attente — Choisissez votre interface pour le portfolio";
        });

        this.portfolioGamingBtn?.addEventListener("mouseover", () => {
            if(!this.hoverGamingDone){
                this.hoverGamingDone = true;
                this.addSignal();
            }
            this.consoleBar.textContent = "// Mode intéractif - Expérience ludique";
        });

        this.portfolioGamingBtn?.addEventListener("mouseout", () => {
            this.consoleBar.textContent = "// En attente — Choisissez votre interface pour le portfolio";
        });
    }

    /**
     * Update visually the signal bar when an interactive element has been found.
     */
    addSignal() {
        if (this.signalFull) return;
        this.signal += 20;

        this.signalBar.style.width = this.signal + "%";
        this.signalScore.textContent = this.signal + "%";

        if (this.signal >= 100) {
            this.signalFull = true;
            this.signalBar.classList.add("signal-full");
            this.consoleBar.textContent = "// Signal établi - Bienvenue dans mon portfolio !"
        }
    }
}