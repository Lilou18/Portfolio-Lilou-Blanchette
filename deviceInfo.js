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
     * @see {@link https://stackoverflow.com/questions/56578799/tell-ipados-from-macos-on-the-web}
     */
    isIpad: (/iPad/.test(navigator.userAgent) || navigator.userAgent.match(/Mac/)) && navigator.maxTouchPoints && navigator.maxTouchPoints > 0,


    /**
     * @see {@link https://stackoverflow.com/questions/50195475/detect-if-device-is-tablet}
     */
    isTablet: /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(navigator.userAgent),


    /**
     * Whether the device is currently in portrait orientation.
     * @returns {boolean}
     */
    get isPortrait() {
        return window.matchMedia("(orientation: portrait)").matches;
    },
};