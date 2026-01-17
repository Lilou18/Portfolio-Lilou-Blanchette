import { uiManager } from "./uiManager.js";
//import { soundManager } from "./soundManager.js";
import { gameState } from "./gameState.js";

/**
 * Window-related utility functions.
 *
 * Provides helpers for handling window focus (pause/resume)
 * and enabling fullscreen mode.
 */

/**
 * Callback triggered when the browser window loses focus.
 * 
 * Pauses the game to prevent the player from continuing
 * to play while the tab or window is inactive.
 */
function looseWindowFocus() {
    gameState.addPauseFlag("windowBlur");
    uiManager.showPauseText();
    //soundManager.pauseUnpauseBackgroundMusic();
}

/**
 * Callback triggered when the browser window regains focus.
 * 
 * Removes the pause related to window focus loss and resumes
 * the game only if no other pause sources are active.
 */
function handleWindowFocus() {
    gameState.removePauseFlag("windowBlur");
    uiManager.hidePauseText();
    //soundManager.pauseUnpauseBackgroundMusic();
}

/**
 * Initializes window focus-related event listeners.
 */
export function initWindowEvents() {
    window.addEventListener('blur', looseWindowFocus);
    window.addEventListener('focus', handleWindowFocus);
}


/**
 * Displays a DOM element in fullscreen mode.
 * @param {Element} elem 
 * @see {@link https://www.w3schools.com/howto/howto_js_fullscreen.asp}
 */
export function openFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}