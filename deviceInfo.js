/**
 * Device detection utilities
 * @readonly
 */
export const deviceInfo = {
    /**
    * Whether the device is a mobile device (phone or tablet).
    * @type {boolean}
    * @see {@link https://dev.to/baasmurdo/js-detect-mobile-device-b15}
    */
    isMobile: /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),

    /**
     * Whether the device has a touchscreen.
     */
    isTouchEnabled: ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0),


    /**
     * Whether the device is running iOS (iPhone, iPad, or iPod).
     * @type {boolean}
     * @see {@link https://stackoverflow.com/questions/9038625/detect-if-device-is-ios}
     */
    isIOS: !window.MSStream && /iPad|iPhone|iPod/.test(navigator.userAgent),

    /**
     * Whether the device is currently in portrait orientation.
     * @returns {boolean}
     */
    get isPortrait() {
        return window.matchMedia("(orientation: portrait)").matches;
    },
};