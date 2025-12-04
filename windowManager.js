import { uiManager } from "./uiManager.js";
import { soundManager } from "./soundManager.js";
import { gameState } from "./gameState.js";

function looseWindowFocus() {
    // Pause the game when the window is no longer the focus
    gameState.addPauseFlag("windowBlur");
    uiManager.showPauseText();
    soundManager.pauseUnpauseBackgroundMusic();
}

function handleWindowFocus() {
    // Destroy the pause text when the window is the focus
    // If no panel is open then we resume the game
    gameState.removePauseFlag("windowBlur");
    uiManager.hidePauseText();
    soundManager.pauseUnpauseBackgroundMusic();
}

export function initWindowEvents() {
    window.addEventListener('blur', looseWindowFocus);
    window.addEventListener('focus', handleWindowFocus);
}

/*https://www.w3schools.com/howto/howto_js_fullscreen.asp*/
/* View in fullscreen */
export function openFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}