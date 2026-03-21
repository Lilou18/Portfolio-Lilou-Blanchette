import { k } from "./loader.js";
import { uiManager } from "./uiManager.js";
import { deviceInfo } from "./deviceInfo.js";

class SoundManager {
    constructor() {
        this.musicVolume = 0.7;
        this.sfxVolume = 0.6;
        this.backgroundMusic = null;
        this.soundBtn = null;

        this.pauseFlags = new Set();
        this.setupUI();
    }

    /**
     * Event listener for sound settings panel button and sliders.
     */
    setupUI() {
        // IOS can't change the volume with Javascript
        if (deviceInfo.isIOS || deviceInfo.isIpad) return;

        this.musicSlider = document.getElementById("sliderMusic");
        this.musicSlider.value = this.musicVolume;
        this.musicValue = document.getElementById("musicValue");
        this.musicValue.textContent = this.musicVolume * 10;

        this.sfxSlider = document.getElementById("sliderSFX");
        this.sfxSlider.value = this.sfxVolume;
        this.sfxValue = document.getElementById("sfxValue");
        this.sfxValue.textContent = this.sfxVolume * 10;

        this.btnClosePanel = document.getElementById("btnCloseSoundSettings");
        this.btnClosePanel.addEventListener("click", () => this.closeSettings());

        this.musicSlider.addEventListener("input", () => this.changeMusicVolume());
        this.sfxSlider.addEventListener("input", () => this.changeSFXVolume());

    }

    /**
     * Event listener for sound settings button.
     */
    addSoundSettingsBtn() {
        this.soundBtn = document.getElementById("soundBtn");
        // IOS can't change the volume with Javascript
        if (deviceInfo.isIOS || deviceInfo.isIpad) {
            this.soundBtn.style.display = "none";
            return;
        }

        this.soundBtn.addEventListener("click", () => {
            this.soundBtn.blur();
            this.toggleSettings();
        });
    }

    /**
     * Open or close sound settings depending on state.
     */
    toggleSettings() {
        if (uiManager.isSoundSettingsPanelOpen) {
            this.closeSettings();
        }
        else {
            this.openSettings();
        }
    }

    /**
     * Open the sound settings panel.
     */
    openSettings() {
        uiManager.displayPanel("soundSettings");
    }

    /**
     * Close the sound settings panel.
     */
    closeSettings() {
        uiManager.hidePanel("soundSettings");
    }

    /**
    * Add a pause flag to the background music and stop the background music. 
    * @param {string} flag windowBlur or videoPlaying
    */
    addPauseFlagMusic(flag) {
        this.pauseFlags.add(flag);
        this.backgroundMusic?.pause();
    }

    /**
     * Remove a pause flag to the background music. If there is no more pause flag, the music is resumed.
     * @param {string} flag
     */
    removePauseFlagMusic(flag) {
        this.pauseFlags.delete(flag);
        if (this.pauseFlags.size === 0 && this.backgroundMusic) {
            this.backgroundMusic.play();
        }
    }

    /**
     * Play a specefic sound.
     * 
     * @param {string} soundName 
     */
    playSound(soundName) {
        k.play(soundName, { volume: this.sfxVolume });
    }

    /**
     * Play the background music when the game start.
     */
    playBackgroundMusic() {
        if (!this.backgroundMusic) {
            this.backgroundMusic = new Audio("src/sounds/funky-quirky-upbeat-commercial-music-392401_eUPATFbC.mp3");
            this.backgroundMusic.volume = this.musicVolume;
            this.backgroundMusic.loop = true;
            this.backgroundMusic.play();
        }
    }

    /**
    * Stop the background music and reset it so it can be replayed.
    */
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic = null;
        }
        this.pauseFlags.clear();
    }

    /**
     * Modify SFX volume with the slider.
     */
    changeSFXVolume() {
        this.sfxVolume = this.sfxSlider.value;
        this.sfxValue.textContent = this.sfxVolume * 10;
    }

    /**
     * Modifiy the music volume with the slider.
     */
    changeMusicVolume() {
        this.backgroundMusic.volume = this.musicSlider.value;
        this.musicVolume = this.musicSlider.value;
        this.musicValue.textContent = this.musicVolume * 10;
    }
}

export const soundManager = new SoundManager();