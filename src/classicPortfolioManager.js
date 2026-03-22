export class ClassicPortfolioManager {
    /**
     * Manages the classic portfolio mode.
     * Handles tab navigation, panel switching, and classic nav display.
     */

    /**
     * @param {UIManager} uiManager Reference to the main UI manager
     */
    constructor(uiManager) {
        this.uiManager = uiManager;
    }

    /**
    * Activates classic portfolio mode.
    * Loads all iframes upfront, shows the CV panel by default,
    * init tab listeners, and disables game-specific panel behaviour.
    */
    displayClassicPortfolio() {
        this.uiManager.isClassicMode = true;

        document.body.classList.add("classic-mode");

        if (this.uiManager.nav) this.uiManager.nav.style.display = "none";
        const classicNav = document.getElementById("classicNav");
        if (classicNav) classicNav.style.display = "flex";

        document.getElementById("classicTabCV")?.addEventListener("click", () => this.classicSwitchPanel("cv"));
        document.getElementById("classicTabPortfolio")?.addEventListener("click", () => this.classicSwitchPanel("portfolio"));
        document.getElementById("classicTabContact")?.addEventListener("click", () => this.classicSwitchPanel("contact"));

        // Load iframes immediately
        this.uiManager.loadPortfolioIframes();

        this.classicSwitchPanel("cv");
    }

    /**
     * Switches the visible panel in classic mode and updates the active tab.     * 
     * @param {string} panelName - "cv" | "portfolio" | "contact"
     */
    classicSwitchPanel(panelName) {
        // Hide only the currently visible panel
        if (this.uiManager.currentPanel && this.uiManager.currentPanel !== panelName) {
            const current = this.uiManager.panels[this.uiManager.currentPanel];
            if (current) current.style.display = "none";
        }

        this.uiManager.currentPanel = panelName;
        if (this.uiManager.panels[panelName]) this.uiManager.panels[panelName].style.display = "block";

        document.getElementById("classicTabCV")?.classList.toggle("classic-active-tab", panelName === "cv");
        document.getElementById("classicTabPortfolio")?.classList.toggle("classic-active-tab", panelName === "portfolio");
        document.getElementById("classicTabContact")?.classList.toggle("classic-active-tab", panelName === "contact");
    }

    /**
     * Deactivates classic portfolio mode and returns to the start menu.
     * Hides the current panel, hides the classic nav, shows the start menu.
     */
    exitClassicPortfolio() {
        this.uiManager.isClassicMode = false;
        document.body.classList.remove("classic-mode");

        // Hide only the currently visible panel
        if (this.uiManager.currentPanel && this.uiManager.panels[this.uiManager.currentPanel]) {
            this.uiManager.panels[this.uiManager.currentPanel].style.display = "none";
        }
        this.uiManager.currentPanel = null;

        // Swap navs
        const classicNav = document.getElementById("classicNav");
        if (classicNav) classicNav.style.display = "none";

        // Show start menu again
        const startMenu = document.getElementById("start-menu");
        if (startMenu) startMenu.style.display = "flex";
    }
}
