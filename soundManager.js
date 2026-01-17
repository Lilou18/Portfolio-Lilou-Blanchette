import { k } from "./loader.js";
import { uiManager } from "./uiManager.js";

class SoundManager {
    constructor() {
        this.musicVolume = 0.1;
        this.sfxVolume = 0.6;
        this.backgroundMusic = null;
        this.soundBtn = null;

        this.setupUI();
    }

    setupUI() {
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

    addSoundSettingsBtn() {
        this.soundBtn = document.getElementById("soundBtn");
        this.soundBtn.style.display = "block";
        this.soundBtn.addEventListener("click", () => this.toggleSettings());
    }

    toggleSettings() {
        if (uiManager.isSoundSettingsPanelOpen) {
            this.closeSettings();
        }
        else {
            this.openSettings();
        }
    }

    openSettings() {
        uiManager.displayPanel("soundSettings");
    }

    closeSettings() {
        uiManager.hidePanel("soundSettings");
    }

    playSound(soundName) {
        k.play(soundName, { volume: this.sfxVolume });
    }

    pauseUnpauseBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.paused = !this.backgroundMusic.paused;
        }
    }

    playBackgroundMusic() {
        this.backgroundMusic = k.play("backgroundMusic", {
            volume: this.musicVolume,
            loop: true,
        });
    }

    changeSFXVolume() {
        this.sfxVolume = this.sfxSlider.value;
        this.sfxValue.textContent = this.sfxVolume * 10;
    }

    changeMusicVolume() {
        this.backgroundMusic.volume = this.musicSlider.value;
        this.musicVolume = this.musicSlider.value;
        this.musicValue.textContent = this.musicVolume * 10;
    }
}

export const soundManager = new SoundManager();