export const gameState = {
    /**
 * Global game state manager.
 */

    player: null,           // Reference to the player entity
    gameStarted: false,     //Indicates whether the game has started
    pauseFlags: new Set(),  // Collection of active pause flags

    /**
     * The game is considered paused as long as at least one
     * pause flag is active (e.g. window blur, menu open, wrong device orientation).
     * Returns true if the game is currently paused.
     * @returns {boolean}
     */
    get isGamePaused() {
        return this.pauseFlags.size > 0;
    },
    /**
     * Adds a pause flag to the game.
     * @param {string} flag Reason why the game is paused
     */
    addPauseFlag(flag) {
        this.pauseFlags.add(flag);
    },
    /**
     * // Removes a pause flag from the game.
     * @param {string} flag Reason why the game was paused
     */
    removePauseFlag(flag) {
        this.pauseFlags.delete(flag);
    },
    /**
     * Checks if the game is paused for a specific reason.
     * @param {string} flag Reason why the game is paused
     * @returns {boolean}
     */
    isGamePauseFor(flag) {
        return this.pauseFlags.has(flag);
    }
}