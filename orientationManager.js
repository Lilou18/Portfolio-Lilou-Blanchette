export const orientationManager = {
    get isPortrait(){
        return window.matchMedia("(orientation: portrait)").matches;
    },

    get isMobile(){
        return /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
};