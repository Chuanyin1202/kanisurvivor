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
        
        this.setupAudioContext();
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
            
        } catch (error) {
            console.error('Failed to setup audio context:', error);
            this.isSupported = false;
        }
    }

    // 預載入常用音效
    preloadCommonSounds() {
        // 這些是佔位符，實際專案中會有真實的音效檔案
        const commonSounds = [
            'button_click',
            'button_hover',
            'spell_fire',
            'spell_ice',
            'spell_lightning',
            'spell_arcane',
            'enemy_hit',
            'enemy_death',
            'player_hit',
            'levelup',
            'coin',
            'achievement'
        ];
        
        commonSounds.forEach(soundName => {
            this.preloadSound(soundName, `assets/audio/sfx/${soundName}.mp3`);
        });
        
        // 預載入音樂
        this.preloadMusic('menu', 'assets/audio/music/menu.mp3');
        this.preloadMusic('game', 'assets/audio/music/game.mp3');
        this.preloadMusic('boss', 'assets/audio/music/boss.mp3');
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

    // 播放音樂
    playMusic(musicName, fadeInTime = 1.0) {
        if (!this.isSupported || this.isMuted) return;
        
        const music = this.musicTracks.get(musicName);
        if (!music) {
            console.warn(`Music track not found: ${musicName}`);
            return;
        }
        
        // 如果已經在播放相同音樂，忽略
        if (this.currentMusicName === musicName && this.currentMusic && !this.currentMusic.paused) {
            return;
        }
        
        // 停止當前音樂
        this.stopMusic(1.0);
        
        // 開始播放新音樂
        this.currentMusic = music;
        this.currentMusicName = musicName;
        
        music.volume = 0;
        music.currentTime = 0;
        
        const playPromise = music.play();
        if (playPromise) {
            playPromise.catch(error => {
                console.warn(`Failed to play music ${musicName}:`, error);
            });
        }
        
        // 淡入效果
        this.fadeInMusic(fadeInTime);
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

    // 便捷音效播放方法
    playButtonClick() {
        this.playSound('button_click', 0.5);
    }

    playButtonHover() {
        this.playSound('button_hover', 0.3);
    }

    playSpellSound(spellType, position = null) {
        this.playSound(`spell_${spellType}`, 0.8, position);
    }

    playEnemyHit(position = null) {
        this.playSound('enemy_hit', 0.6, position);
    }

    playEnemyDeath(position = null) {
        this.playSound('enemy_death', 0.7, position);
    }

    playPlayerHit() {
        this.playSound('player_hit', 0.8);
    }

    playLevelUp() {
        this.playSound('levelup', 1.0);
    }

    playCoinCollect(position = null) {
        this.playSound('coin', 0.4, position);
    }

    playAchievement() {
        this.playSound('achievement', 0.9);
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
            loadedMusic: this.musicTracks.size
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