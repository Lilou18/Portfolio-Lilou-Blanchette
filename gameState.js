export const gameState = {
    player: null,
    pauseFlags: new Set(),

    get isGamePaused() {
        return this.pauseFlags.size > 0;
    },
    addPauseFlag(flag){
        this.pauseFlags.add(flag);
    },
    removePauseFlag(flag){
        this.pauseFlags.delete(flag);
    },
    isGamePauseFor(flag){
        return this.pauseFlags.has(flag);
    }
}