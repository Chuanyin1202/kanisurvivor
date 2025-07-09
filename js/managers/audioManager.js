/**
 * 音效管理器
 * 管理背景音樂和音效播放
 */
class AudioManager {
    constructor() {
        // 音量設定
        this.masterVolume = 1.0;
        this.musicVolume = 0.7;
        this.sfxVolume = 1.0;
        this.isMuted = false;
        
        // 音效緩存
        this.audioCache = new Map();
        this.musicTracks = new Map();
        
        // 當前播放狀態
        this.currentMusic = null;
        this.currentMusicName = '';
        this.musicFadeInterval = null;
        
        // 音效池
        this.sfxPool = new Map();
        this.maxSfxInstances = 5;
        
        // 3D 音效設定
        this.listener = {
            x: 0,
            y: 0,
            maxDistance: 300,
            rolloffFactor: 0.5
        };
        
        // 音效冷卻
        this.sfxCooldowns = new Map();
        this.cooldownTime = 0.05; // 50ms
        
        // 用戶互動狀態
        this.userInteracted = false;
        this.audioInitialized = false;
        
        this.setupAudioContext();
        this.setupUserInteractionListeners();
    }

    // 設定音頻上下文
    setupAudioContext() {
        try {
            // 檢查瀏覽器支援
            this.isSupported = 'Audio' in window;
            
            if (!this.isSupported) {
                console.warn('Audio not supported in this browser');
                return;
            }
            
            // 預載入常用音效
            this.preloadCommonSounds();
            
            // 立即初始化音效系統
            this.audioInitialized = true;
            console.log('✅ 音效系統初始化完成');
            
        } catch (error) {
            console.error('Failed to setup audio context:', error);
            this.isSupported = false;
        }
    }

    // 設定用戶互動監聽器
    setupUserInteractionListeners() {
        const interactionEvents = ['click', 'touchstart', 'touchend', 'keydown'];
        
        const handleFirstInteraction = (e) => {
            if (!this.userInteracted) {
                console.log('🎵 用戶互動檢測到:', e.type);
                this.userInteracted = true;
                
                // 移除監聽器
                interactionEvents.forEach(event => {
                    document.removeEventListener(event, handleFirstInteraction, true);
                });
            }
        };
        
        // 添加全域監聽器
        interactionEvents.forEach(event => {
            document.addEventListener(event, handleFirstInteraction, true);
        });
        
        console.log('🎵 用戶互動監聽器已設定');
    }

    // 用戶互動後初始化音頻
    async initializeAudioOnInteraction() {
        // 不再需要特殊的初始化邏輯，交給 synthSoundGenerator 在需要時處理
        console.log('🎵 音效系統已就緒，等待使用');
    }

    // 預載入常用音效
    preloadCommonSounds() {
        // 使用合成音效生成器，不需要實際音效檔案
        console.log('🎵 使用合成音效生成器，跳過檔案預載入');
        
        // 初始化合成音效生成器
        if (window.synthSoundGenerator) {
            console.log('✅ 合成音效生成器已就緒');
        } else {
            console.warn('⚠️ 合成音效生成器未載入');
        }
    }

    // 預載入音效
    preloadSound(name, url) {
        if (!this.isSupported) return null;
        
        try {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.volume = 0; // 靜音預載入
            
            audio.addEventListener('canplaythrough', () => {
                this.audioCache.set(name, audio);
                console.log(`Audio loaded: ${name}`);
            });
            
            audio.addEventListener('error', (e) => {
                console.warn(`Failed to load audio: ${name}`, e);
            });
            
            audio.src = url;
            return audio;
            
        } catch (error) {
            console.warn(`Error preloading sound ${name}:`, error);
            return null;
        }
    }

    // 預載入音樂
    preloadMusic(name, url) {
        if (!this.isSupported) return null;
        
        try {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.loop = true;
            audio.volume = 0;
            
            audio.addEventListener('canplaythrough', () => {
                this.musicTracks.set(name, audio);
                console.log(`Music loaded: ${name}`);
            });
            
            audio.addEventListener('error', (e) => {
                console.warn(`Failed to load music: ${name}`, e);
            });
            
            audio.src = url;
            return audio;
            
        } catch (error) {
            console.warn(`Error preloading music ${name}:`, error);
            return null;
        }
    }

    // 播放音效
    playSound(soundName, volume = 1.0, position = null) {
        if (!this.isSupported || this.isMuted) return null;
        
        // 檢查冷卻時間
        if (this.isOnCooldown(soundName)) return null;
        
        try {
            let audio = this.getSoundInstance(soundName);
            if (!audio) return null;
            
            // 計算最終音量
            let finalVolume = this.masterVolume * this.sfxVolume * volume;
            
            // 3D 音效計算
            if (position) {
                finalVolume *= this.calculate3DVolume(position);
            }
            
            audio.volume = Math.max(0, Math.min(1, finalVolume));
            audio.currentTime = 0;
            
            const playPromise = audio.play();
            if (playPromise) {
                playPromise.catch(error => {
                    console.warn(`Failed to play sound ${soundName}:`, error);
                });
            }
            
            // 設定冷卻時間
            this.setCooldown(soundName);
            
            return audio;
            
        } catch (error) {
            console.warn(`Error playing sound ${soundName}:`, error);
            return null;
        }
    }

    // 獲取音效實例
    getSoundInstance(soundName) {
        // 先檢查緩存中是否有預載入的音效
        if (this.audioCache.has(soundName)) {
            const originalAudio = this.audioCache.get(soundName);
            
            // 創建新的實例來支援重疊播放
            const audioClone = originalAudio.cloneNode();
            return audioClone;
        }
        
        // 如果沒有預載入，嘗試動態載入
        console.warn(`Sound not preloaded: ${soundName}`);
        return null;
    }

    // 播放音樂 (使用合成音樂)
    playMusic(musicName, fadeInTime = 1.0) {
        if (!this.isSupported || this.isMuted) return;
        
        // 使用合成音樂生成器
        if (window.synthSoundGenerator) {
            synthSoundGenerator.playBackgroundMusic(musicName);
        }
        
        // 更新當前音樂名稱
        this.currentMusicName = musicName;
        
        console.log(`🎵 播放合成音樂: ${musicName}`);
    }

    // 停止音樂
    stopMusic(fadeOutTime = 1.0) {
        if (!this.currentMusic) return;
        
        if (fadeOutTime > 0) {
            this.fadeOutMusic(fadeOutTime);
        } else {
            this.currentMusic.pause();
            this.currentMusic = null;
            this.currentMusicName = '';
        }
    }

    // 音樂淡入
    fadeInMusic(duration) {
        if (!this.currentMusic) return;
        
        const targetVolume = this.masterVolume * this.musicVolume;
        const step = targetVolume / (duration * 60); // 假設 60 FPS
        
        this.musicFadeInterval = setInterval(() => {
            if (!this.currentMusic) {
                clearInterval(this.musicFadeInterval);
                return;
            }
            
            this.currentMusic.volume = Math.min(targetVolume, this.currentMusic.volume + step);
            
            if (this.currentMusic.volume >= targetVolume) {
                clearInterval(this.musicFadeInterval);
            }
        }, 1000 / 60);
    }

    // 音樂淡出
    fadeOutMusic(duration) {
        if (!this.currentMusic) return;
        
        const step = this.currentMusic.volume / (duration * 60);
        
        this.musicFadeInterval = setInterval(() => {
            if (!this.currentMusic) {
                clearInterval(this.musicFadeInterval);
                return;
            }
            
            this.currentMusic.volume = Math.max(0, this.currentMusic.volume - step);
            
            if (this.currentMusic.volume <= 0) {
                this.currentMusic.pause();
                this.currentMusic = null;
                this.currentMusicName = '';
                clearInterval(this.musicFadeInterval);
            }
        }, 1000 / 60);
    }

    // 計算 3D 音效音量
    calculate3DVolume(position) {
        const distance = Math.sqrt(
            Math.pow(position.x - this.listener.x, 2) + 
            Math.pow(position.y - this.listener.y, 2)
        );
        
        if (distance > this.listener.maxDistance) {
            return 0;
        }
        
        const volume = 1.0 - (distance / this.listener.maxDistance) * this.listener.rolloffFactor;
        return Math.max(0, Math.min(1, volume));
    }

    // 設定監聽器位置（通常是玩家位置）
    setListenerPosition(x, y) {
        this.listener.x = x;
        this.listener.y = y;
    }

    // 檢查冷卻時間
    isOnCooldown(soundName) {
        const lastPlayed = this.sfxCooldowns.get(soundName);
        if (!lastPlayed) return false;
        
        return (Date.now() - lastPlayed) < (this.cooldownTime * 1000);
    }

    // 設定冷卻時間
    setCooldown(soundName) {
        this.sfxCooldowns.set(soundName, Date.now());
    }

    // 設定主音量
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateMusicVolume();
    }

    // 設定音樂音量
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateMusicVolume();
    }

    // 設定音效音量
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    // 更新音樂音量
    updateMusicVolume() {
        if (this.currentMusic) {
            this.currentMusic.volume = this.masterVolume * this.musicVolume;
        }
    }

    // 靜音/取消靜音
    setMuted(muted) {
        this.isMuted = muted;
        
        if (muted) {
            this.pauseAllAudio();
        } else {
            this.resumeMusic();
        }
    }

    // 暫停所有音效
    pauseAllAudio() {
        if (this.currentMusic) {
            this.currentMusic.pause();
        }
    }

    // 恢復音樂
    resumeMusic() {
        if (this.currentMusic && this.currentMusic.paused) {
            this.currentMusic.play().catch(error => {
                console.warn('Failed to resume music:', error);
            });
        }
    }

    // 便捷音效播放方法 (使用合成音效)
    playButtonClick() {
        if (this.canPlaySound()) {
            synthSoundGenerator.playButtonClick();
            console.log('🔊 播放按鈕點擊音效');
        }
    }

    playButtonHover() {
        if (this.canPlaySound()) {
            synthSoundGenerator.playButtonHover();
            console.log('🔊 播放按鈕懸停音效');
        }
    }

    // 檢查是否可以播放音效
    canPlaySound() {
        if (!window.synthSoundGenerator) {
            return false;
        }
        
        if (this.isMuted) {
            return false;
        }
        
        if (!this.userInteracted) {
            return false;
        }
        
        return true;
    }

    playSpellSound(spellType, position = null) {
        if (this.canPlaySound()) {
            // 根據法術類型播放不同音效
            switch(spellType) {
                case 'fire':
                    synthSoundGenerator.playSpellFire();
                    console.log('🔥 播放火焰法術音效');
                    break;
                case 'ice':
                    synthSoundGenerator.playSpellIce();
                    console.log('❄️ 播放冰霜法術音效');
                    break;
                case 'lightning':
                    synthSoundGenerator.playSpellLightning();
                    console.log('⚡ 播放閃電法術音效');
                    break;
                case 'arcane':
                    synthSoundGenerator.playSpellArcane();
                    console.log('🔮 播放奧術法術音效');
                    break;
                default:
                    synthSoundGenerator.playSpellFire(); // 預設音效
                    console.log('🔥 播放預設法術音效');
            }
        }
    }

    playEnemyHit(position = null) {
        if (this.canPlaySound()) {
            synthSoundGenerator.playEnemyHit();
            console.log('💥 播放敵人受擊音效');
        }
    }

    playEnemyDeath(position = null) {
        if (this.canPlaySound()) {
            synthSoundGenerator.playEnemyDeath();
            console.log('💀 播放敵人死亡音效');
        }
    }

    playPlayerHit() {
        if (this.canPlaySound()) {
            synthSoundGenerator.playPlayerHit();
            console.log('🩸 播放玩家受傷音效');
        }
    }

    playLevelUp() {
        if (this.canPlaySound()) {
            synthSoundGenerator.playLevelUp();
            console.log('🆙 播放升級音效');
        }
    }

    playCoinCollect(position = null) {
        if (this.canPlaySound()) {
            synthSoundGenerator.playCoinCollect();
            console.log('💰 播放金幣收集音效');
        }
    }

    playAchievement() {
        if (this.canPlaySound()) {
            synthSoundGenerator.playAchievement();
            console.log('🏆 播放成就音效');
        }
    }

    // 測試所有音效
    testAllSounds() {
        console.log('🔊 開始音效測試...');
        
        if (!this.canPlaySound()) {
            console.error('❌ 無法播放音效，請檢查系統狀態');
            return;
        }
        
        const testSequence = [
            { name: '按鈕點擊', fn: () => this.playButtonClick() },
            { name: '按鈕懸停', fn: () => this.playButtonHover() },
            { name: '火焰法術', fn: () => this.playSpellSound('fire') },
            { name: '冰霜法術', fn: () => this.playSpellSound('ice') },
            { name: '閃電法術', fn: () => this.playSpellSound('lightning') },
            { name: '奧術法術', fn: () => this.playSpellSound('arcane') },
            { name: '敵人受擊', fn: () => this.playEnemyHit() },
            { name: '敵人死亡', fn: () => this.playEnemyDeath() },
            { name: '玩家受傷', fn: () => this.playPlayerHit() },
            { name: '升級', fn: () => this.playLevelUp() },
            { name: '金幣收集', fn: () => this.playCoinCollect() },
            { name: '成就解鎖', fn: () => this.playAchievement() }
        ];
        
        testSequence.forEach((test, index) => {
            setTimeout(() => {
                console.log(`🎵 測試 ${index + 1}/${testSequence.length}: ${test.name}`);
                test.fn();
            }, index * 800);
        });
    }

    // 獲取音效狀態
    getStats() {
        return {
            isSupported: this.isSupported,
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            isMuted: this.isMuted,
            currentMusic: this.currentMusicName,
            loadedSounds: this.audioCache.size,
            loadedMusic: this.musicTracks.size,
            userInteracted: this.userInteracted,
            audioInitialized: this.audioInitialized,
            synthSoundGenerator: window.synthSoundGenerator ? {
                isInitialized: synthSoundGenerator.isInitialized,
                audioContextState: synthSoundGenerator.audioContext ? synthSoundGenerator.audioContext.state : 'not created',
                masterVolume: synthSoundGenerator.masterVolume
            } : null
        };
    }

    // 清理資源
    cleanup() {
        this.stopMusic(0);
        
        if (this.musicFadeInterval) {
            clearInterval(this.musicFadeInterval);
        }
        
        // 清理音效緩存
        for (const audio of this.audioCache.values()) {
            audio.src = '';
        }
        
        for (const music of this.musicTracks.values()) {
            music.src = '';
        }
        
        this.audioCache.clear();
        this.musicTracks.clear();
    }
}

// 全域音效管理器
const audioManager = new AudioManager();
window.audioManager = audioManager;