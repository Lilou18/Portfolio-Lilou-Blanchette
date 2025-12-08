export const deviceInfo = {
    get isPortrait(){
        return window.matchMedia("(orientation: portrait)").matches;
    },
    // https://dev.to/baasmurdo/js-detect-mobile-device-b15
    get isMobile(){
        return /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    // https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
    get isIOS(){
        return !window.MSStream && /iPad|iPhone|iPod/.test(navigator.userAgent);
    },
};