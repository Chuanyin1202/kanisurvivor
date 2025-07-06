/**
 * 遊戲設定管理器
 * 管理遊戲的各種設定選項
 */
class GameSettings {
    constructor() {
        this.defaultSettings = {
            // 音效設定
            audio: {
                masterVolume: 1.0,
                musicVolume: 0.7,
                sfxVolume: 1.0,
                muteAll: false
            },
            
            // 圖形設定
            graphics: {
                quality: 'medium', // low, medium, high
                showFPS: false,
                showDamageNumbers: true,
                screenShake: true,
                particleEffects: true,
                maxParticles: 200,
                vsync: true
            },
            
            // 遊戲控制
            controls: {
                mouseSensitivity: 1.0,
                invertMouse: false,
                autoFire: false,
                showCursor: true,
                pauseOnFocusLoss: true
            },
            
            // 介面設定
            ui: {
                hudScale: 1.0,
                showMinimap: true,
                showHealthBar: true,
                showManaBar: true,
                showExperienceBar: true,
                showComboCounter: true,
                showTimer: true,
                fontSize: 'medium' // small, medium, large
            },
            
            // 無障礙設定
            accessibility: {
                colorBlindMode: 'none', // none, deuteranopia, protanopia, tritanopia
                highContrast: false,
                reducedMotion: false,
                screenReader: false,
                subtitles: false
            },
            
            // 遊戲性設定
            gameplay: {
                difficulty: 'normal', // easy, normal, hard, nightmare
                autoSave: true,
                showTutorial: true,
                fastMode: false,
                debug: false
            },
            
            // 效能設定
            performance: {
                targetFPS: 60,
                adaptiveQuality: true,
                backgroundProcessing: true,
                preloadAssets: true,
                compressTextures: false
            }
        };
        
        this.currentSettings = {};
        this.listeners = new Map();
        this.settingsKey = 'game_settings';
        
        this.initialize();
    }

    // 初始化設定
    initialize() {
        this.loadSettings();
        this.applySettings();
    }

    // 載入設定
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem(this.settingsKey);
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                this.currentSettings = this.mergeSettings(this.defaultSettings, parsed);
            } else {
                this.currentSettings = this.deepCopy(this.defaultSettings);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.currentSettings = this.deepCopy(this.defaultSettings);
        }
    }

    // 儲存設定
    saveSettings() {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(this.currentSettings));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    // 獲取設定值
    get(category, property = null) {
        if (property === null) {
            return this.currentSettings[category];
        } else {
            return this.currentSettings[category]?.[property];
        }
    }

    // 設定值
    set(category, property, value = null) {
        if (value === null) {
            // 設定整個類別
            this.currentSettings[category] = property;
        } else {
            // 設定特定屬性
            if (!this.currentSettings[category]) {
                this.currentSettings[category] = {};
            }
            this.currentSettings[category][property] = value;
        }
        
        this.saveSettings();
        this.applySettings();
        this.emit('settingsChanged', { category, property, value });
    }

    // 重置設定到預設值
    reset(category = null) {
        if (category) {
            this.currentSettings[category] = this.deepCopy(this.defaultSettings[category]);
        } else {
            this.currentSettings = this.deepCopy(this.defaultSettings);
        }
        
        this.saveSettings();
        this.applySettings();
        this.emit('settingsReset', { category });
    }

    // 應用設定到遊戲中
    applySettings() {
        this.applyAudioSettings();
        this.applyGraphicsSettings();
        this.applyControlSettings();
        this.applyUISettings();
        this.applyAccessibilitySettings();
        this.applyPerformanceSettings();
    }

    // 應用音效設定
    applyAudioSettings() {
        const audio = this.get('audio');
        
        // 如果有音效管理器，應用音量設定
        if (window.audioManager) {
            audioManager.setMasterVolume(audio.muteAll ? 0 : audio.masterVolume);
            audioManager.setMusicVolume(audio.musicVolume);
            audioManager.setSFXVolume(audio.sfxVolume);
        }
    }

    // 應用圖形設定
    applyGraphicsSettings() {
        const graphics = this.get('graphics');
        
        // 設定畫質等級
        document.documentElement.setAttribute('data-quality', graphics.quality);
        
        // FPS 顯示
        const fpsCounter = document.getElementById('fpsCounter');
        if (fpsCounter) {
            fpsCounter.style.display = graphics.showFPS ? 'block' : 'none';
        }
        
        // 傷害數字
        document.documentElement.setAttribute('data-damage-numbers', graphics.showDamageNumbers);
        
        // 螢幕震動
        document.documentElement.setAttribute('data-screen-shake', graphics.screenShake);
        
        // 粒子效果
        document.documentElement.setAttribute('data-particles', graphics.particleEffects);
    }

    // 應用控制設定
    applyControlSettings() {
        const controls = this.get('controls');
        
        // 滑鼠靈敏度
        if (window.inputManager) {
            inputManager.setMouseSensitivity(controls.mouseSensitivity);
            inputManager.setInvertMouse(controls.invertMouse);
        }
        
        // 游標顯示
        document.body.style.cursor = controls.showCursor ? 'default' : 'none';
    }

    // 應用 UI 設定
    applyUISettings() {
        const ui = this.get('ui');
        
        // HUD 縮放
        const hud = document.getElementById('gameUI');
        if (hud) {
            hud.style.transform = `scale(${ui.hudScale})`;
        }
        
        // 字體大小
        document.documentElement.setAttribute('data-font-size', ui.fontSize);
        
        // UI 元素顯示/隱藏
        this.toggleUIElement('showHealthBar', ui.showHealthBar);
        this.toggleUIElement('showManaBar', ui.showManaBar);
        this.toggleUIElement('showExperienceBar', ui.showExperienceBar);
        this.toggleUIElement('showComboCounter', ui.showComboCounter);
        this.toggleUIElement('showTimer', ui.showTimer);
    }

    // 應用無障礙設定
    applyAccessibilitySettings() {
        const accessibility = this.get('accessibility');
        
        // 色盲模式
        document.documentElement.setAttribute('data-colorblind', accessibility.colorBlindMode);
        
        // 高對比模式
        document.documentElement.classList.toggle('high-contrast', accessibility.highContrast);
        
        // 減少動畫
        document.documentElement.classList.toggle('reduced-motion', accessibility.reducedMotion);
        
        // 螢幕閱讀器支援
        document.documentElement.setAttribute('data-screen-reader', accessibility.screenReader);
    }

    // 應用效能設定
    applyPerformanceSettings() {
        const performance = this.get('performance');
        
        // 設定目標 FPS
        if (window.game) {
            game.setTargetFPS(performance.targetFPS);
        }
        
        // 自適應畫質
        document.documentElement.setAttribute('data-adaptive-quality', performance.adaptiveQuality);
    }

    // 切換 UI 元素顯示
    toggleUIElement(elementId, show) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    }

    // 獲取畫質等級的具體設定
    getQualitySettings(quality = null) {
        const currentQuality = quality || this.get('graphics', 'quality');
        
        const qualitySettings = {
            low: {
                particleCount: 50,
                shadowQuality: 'off',
                textureQuality: 'low',
                antiAliasing: false,
                postProcessing: false
            },
            medium: {
                particleCount: 100,
                shadowQuality: 'medium',
                textureQuality: 'medium',
                antiAliasing: true,
                postProcessing: true
            },
            high: {
                particleCount: 200,
                shadowQuality: 'high',
                textureQuality: 'high',
                antiAliasing: true,
                postProcessing: true
            }
        };
        
        return qualitySettings[currentQuality] || qualitySettings.medium;
    }

    // 自動調整畫質（基於效能）
    autoAdjustQuality(averageFPS) {
        if (!this.get('performance', 'adaptiveQuality')) {
            return;
        }
        
        const targetFPS = this.get('performance', 'targetFPS');
        const currentQuality = this.get('graphics', 'quality');
        
        if (averageFPS < targetFPS * 0.8) {
            // 效能不足，降低畫質
            if (currentQuality === 'high') {
                this.set('graphics', 'quality', 'medium');
            } else if (currentQuality === 'medium') {
                this.set('graphics', 'quality', 'low');
            }
        } else if (averageFPS > targetFPS * 1.1) {
            // 效能充足，提升畫質
            if (currentQuality === 'low') {
                this.set('graphics', 'quality', 'medium');
            } else if (currentQuality === 'medium') {
                this.set('graphics', 'quality', 'high');
            }
        }
    }

    // 驗證設定值
    validateSetting(category, property, value) {
        const validators = {
            audio: {
                masterVolume: v => v >= 0 && v <= 1,
                musicVolume: v => v >= 0 && v <= 1,
                sfxVolume: v => v >= 0 && v <= 1
            },
            graphics: {
                quality: v => ['low', 'medium', 'high'].includes(v),
                maxParticles: v => v >= 10 && v <= 1000
            },
            controls: {
                mouseSensitivity: v => v >= 0.1 && v <= 5.0
            },
            ui: {
                hudScale: v => v >= 0.5 && v <= 2.0,
                fontSize: v => ['small', 'medium', 'large'].includes(v)
            }
        };
        
        const validator = validators[category]?.[property];
        return validator ? validator(value) : true;
    }

    // 深度複製物件
    deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // 合併設定物件
    mergeSettings(defaults, saved) {
        const result = this.deepCopy(defaults);
        
        for (const category in saved) {
            if (result[category]) {
                for (const property in saved[category]) {
                    if (this.validateSetting(category, property, saved[category][property])) {
                        result[category][property] = saved[category][property];
                    }
                }
            }
        }
        
        return result;
    }

    // 導出設定
    exportSettings() {
        return JSON.stringify(this.currentSettings, null, 2);
    }

    // 導入設定
    importSettings(settingsString) {
        try {
            const imported = JSON.parse(settingsString);
            this.currentSettings = this.mergeSettings(this.defaultSettings, imported);
            this.saveSettings();
            this.applySettings();
            this.emit('settingsImported');
            return true;
        } catch (error) {
            console.error('Failed to import settings:', error);
            return false;
        }
    }

    // 事件監聽
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    // 移除事件監聽
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // 觸發事件
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                callback(data);
            });
        }
    }
}

// 全域設定管理器
const gameSettings = new GameSettings();