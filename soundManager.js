import { k } from "./loader.js";
import { gameState } from "./gameState.js";
import { uiManager } from "./uiManager.js";

class SoundManager {
    constructor() {
        this.musicVolume = 0.1;
        this.sfxVolume = 0.6;
        this.backgroundMusic = null;
        this.soundBtn = null;
        this.soundSettingsPanel = null;
        this.isSoundSettingsPanelOpen = false;

        this.soundSettingsPanel = document.getElementById("soundSettingsPanel");

        this.musicSlider = document.getElementById("sliderMusic");
        this.musicSlider.value = this.musicVolume;
        this.musicValue = document.getElementById("musicValue");
        this.musicValue.textContent = this.musicVolume * 10;

        this.sfxSlider = document.getElementById("sliderSFX");
        this.sfxSlider.value = this.sfxVolume;
        this.sfxValue = document.getElementById("sfxValue");
        this.sfxValue.textContent = this.sfxVolume * 10;

        this.btnClosePanel = document.getElementById("btnCloseSoundSettings");
        this.btnClosePanel.addEventListener("click", () => this.displayHideSoundSettingsPanel());

        this.musicSlider.addEventListener("input", () => this.changeMusicVolume());
        this.sfxSlider.addEventListener("input", () => this.changeSFXVolume());
    }

    playSound(soundName) {
        k.play(soundName, {volume: this.sfxVolume});
    }

    pauseUnpauseBackgroundMusic(){
        if(this.backgroundMusic){
            this.backgroundMusic.paused = !this.backgroundMusic.paused;
        }
    }

    playBackgroundMusic() {
        this.backgroundMusic = k.play("backgroundMusic", {
            volume: this.musicVolume,
            loop: true,
        });
    }

    addSoundSettingsIcon() {
        this.soundBtn = document.getElementById("soundBtn");
        this.soundBtn.style.display = "block";
        this.soundBtn.addEventListener("click", () => this.displayHideSoundSettingsPanel());
    }

    displayHideSoundSettingsPanel(){
        this.isSoundSettingsPanelOpen = !this.isSoundSettingsPanelOpen;

        if(this.isSoundSettingsPanelOpen){
            soundSettingsPanel.style.display = "flex";
            uiManager.canvas.style.filter = "brightness(70%)";
            gameState.addPauseFlag("soundSettings");
        }
        else{
            soundSettingsPanel.style.display = "none";
            uiManager.canvas.style.filter = "brightness(100%)";
            gameState.removePauseFlag("soundSettings");
        }
    }

    changeSFXVolume(){
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