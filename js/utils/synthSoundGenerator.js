/**
 * 合成音效生成器
 * 使用 Web Audio API 動態生成遊戲音效
 * 不需要外部音效檔案
 */
class SynthSoundGenerator {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isInitialized = false;
        
        // 音效設定
        this.masterVolume = 0.5;
        this.soundCache = new Map();
        
        this.initializeAudio();
    }

    // 初始化音頻上下文
    initializeAudio() {
        try {
            // 創建音頻上下文（兼容性處理）
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            
            // 立即嘗試創建 AudioContext
            if (!this.audioContext) {
                this.audioContext = new AudioContext();
                console.log('🎵 AudioContext 已創建，狀態:', this.audioContext.state);
            }
            
            // 創建主音量節點
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.audioContext.destination);
            
            this.isInitialized = true;
            console.log('🎵 SynthSoundGenerator 初始化成功');
            
        } catch (error) {
            console.error('❌ Web Audio API 初始化失敗:', error);
            this.isInitialized = false;
        }
    }

    // 確保音頻上下文處於運行狀態
    async ensureAudioContext() {
        try {
            // 如果 AudioContext 尚未創建，現在創建它
            if (!this.audioContext) {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
                
                // 重新創建主音量節點
                this.masterGain = this.audioContext.createGain();
                this.masterGain.gain.value = this.masterVolume;
                this.masterGain.connect(this.audioContext.destination);
                
                this.isInitialized = true;
                console.log('🎵 AudioContext 已創建，狀態:', this.audioContext.state);
            }
            
            // 如果上下文被暫停，恢復它
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            return this.audioContext.state === 'running';
            
        } catch (error) {
            console.error('❌ 音頻上下文初始化失敗:', error);
            return false;
        }
    }

    // 基礎音調生成
    createOscillator(frequency, type = 'sine', duration = 0.5) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        // 音量包絡（ADSR）
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.1, now + 0.1); // Decay
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Release
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        return { oscillator, gainNode };
    }

    // 創建噪音節點
    createNoiseBuffer(duration = 0.5) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }

    // 按鈕點擊音效
    playButtonClick() {
        this.ensureAudioContext().then((success) => {
            if (!success) return;
            
            const { oscillator, gainNode } = this.createOscillator(800, 'square', 0.1);
            
            // 快速頻率下降
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        });
    }

    // 按鈕懸停音效
    playButtonHover() {
        this.ensureAudioContext().then((success) => {
            if (!success) return;
            
            const { oscillator } = this.createOscillator(600, 'sine', 0.05);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.05);
        });
    }

    // 火焰法術音效
    playSpellFire() {
        if (!this.isInitialized) return;
        
        this.ensureAudioContext().then(() => {
            // 低頻噪音 + 高頻震動
            const noiseBuffer = this.createNoiseBuffer(0.3);
            const noiseSource = this.audioContext.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            noiseSource.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            noiseSource.start();
            noiseSource.stop(this.audioContext.currentTime + 0.3);
        });
    }

    // 冰霜法術音效
    playSpellIce() {
        if (!this.isInitialized) return;
        
        this.ensureAudioContext().then(() => {
            // 高頻結晶音效
            const { oscillator, gainNode } = this.createOscillator(1200, 'sine', 0.4);
            
            // 頻率調制
            const lfo = this.audioContext.createOscillator();
            lfo.frequency.value = 8;
            lfo.type = 'sine';
            
            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.value = 100;
            
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            
            oscillator.start();
            lfo.start();
            
            oscillator.stop(this.audioContext.currentTime + 0.4);
            lfo.stop(this.audioContext.currentTime + 0.4);
        });
    }

    // 閃電法術音效
    playSpellLightning() {
        if (!this.isInitialized) return;
        
        this.ensureAudioContext().then(() => {
            // 高頻噪音脈衝
            const noiseBuffer = this.createNoiseBuffer(0.2);
            const noiseSource = this.audioContext.createBufferSource();
            noiseSource.buffer = noiseBuffer;
            
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 2000;
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.6, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            noiseSource.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            noiseSource.start();
            noiseSource.stop(this.audioContext.currentTime + 0.2);
        });
    }

    // 奧術法術音效
    playSpellArcane() {
        if (!this.isInitialized) return;
        
        this.ensureAudioContext().then(() => {
            // 多重音調和聲
            const frequencies = [440, 554, 659]; // A, C#, E 和弦
            
            frequencies.forEach((freq, index) => {
                const { oscillator, gainNode } = this.createOscillator(freq, 'triangle', 0.5);
                
                // 相位延遲
                const delay = index * 0.05;
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
                gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + delay + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.5);
                
                oscillator.start(this.audioContext.currentTime + delay);
                oscillator.stop(this.audioContext.currentTime + delay + 0.5);
            });
        });
    }

    // 敵人受擊音效
    playEnemyHit() {
        if (!this.isInitialized) return;
        
        this.ensureAudioContext().then(() => {
            const { oscillator, gainNode } = this.createOscillator(200, 'sawtooth', 0.1);
            
            // 頻率快速下降
            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        });
    }

    // 敵人死亡音效
    playEnemyDeath() {
        if (!this.isInitialized) return;
        
        this.ensureAudioContext().then(() => {
            // 下降的音調序列
            const frequencies = [400, 300, 200, 100];
            
            frequencies.forEach((freq, index) => {
                const { oscillator, gainNode } = this.createOscillator(freq, 'square', 0.1);
                
                const delay = index * 0.05;
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime + delay);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.1);
                
                oscillator.start(this.audioContext.currentTime + delay);
                oscillator.stop(this.audioContext.currentTime + delay + 0.1);
            });
        });
    }

    // 玩家受傷音效
    playPlayerHit() {
        if (!this.isInitialized) return;
        
        this.ensureAudioContext().then(() => {
            const { oscillator, gainNode } = this.createOscillator(150, 'sawtooth', 0.3);
            
            // 震動效果
            const tremolo = this.audioContext.createOscillator();
            tremolo.frequency.value = 20;
            tremolo.type = 'sine';
            
            const tremoloGain = this.audioContext.createGain();
            tremoloGain.gain.value = 0.5;
            
            tremolo.connect(tremoloGain);
            tremoloGain.connect(gainNode.gain);
            
            oscillator.start();
            tremolo.start();
            
            oscillator.stop(this.audioContext.currentTime + 0.3);
            tremolo.stop(this.audioContext.currentTime + 0.3);
        });
    }

    // 升級音效
    playLevelUp() {
        if (!this.isInitialized) return;
        
        this.ensureAudioContext().then(() => {
            // 上升的音階
            const frequencies = [440, 554, 659, 880]; // A, C#, E, A (八度)
            
            frequencies.forEach((freq, index) => {
                const { oscillator, gainNode } = this.createOscillator(freq, 'sine', 0.2);
                
                const delay = index * 0.1;
                gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime + delay);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.2);
                
                oscillator.start(this.audioContext.currentTime + delay);
                oscillator.stop(this.audioContext.currentTime + delay + 0.2);
            });
        });
    }

    // 金幣收集音效
    playCoinCollect() {
        if (!this.isInitialized) return;
        
        this.ensureAudioContext().then(() => {
            const { oscillator, gainNode } = this.createOscillator(800, 'sine', 0.1);
            
            // 快速上升再下降
            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.05);
            oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        });
    }

    // 成就解鎖音效
    playAchievement() {
        if (!this.isInitialized) return;
        
        this.ensureAudioContext().then(() => {
            // 勝利音效（大三和弦）
            const frequencies = [523, 659, 784, 1047]; // C, E, G, C
            
            frequencies.forEach((freq, index) => {
                const { oscillator, gainNode } = this.createOscillator(freq, 'sine', 0.8);
                
                const delay = index * 0.1;
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime + delay);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.8);
                
                oscillator.start(this.audioContext.currentTime + delay);
                oscillator.stop(this.audioContext.currentTime + delay + 0.8);
            });
        });
    }

    // 簡單的背景音調生成
    createBackgroundTone(frequency, duration = 2.0) {
        if (!this.isInitialized) return null;
        
        const { oscillator, gainNode } = this.createOscillator(frequency, 'sine', duration);
        
        // 非常輕柔的音量
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime + duration - 0.5);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
        
        return oscillator;
    }

    // 播放簡單的背景音樂
    playBackgroundMusic(type = 'calm') {
        if (!this.isInitialized) return;
        
        this.ensureAudioContext().then(() => {
            switch (type) {
                case 'menu':
                    this.playMenuMusic();
                    break;
                case 'game':
                    this.playGameMusic();
                    break;
                case 'boss':
                    this.playBossMusic();
                    break;
                default:
                    this.playMenuMusic();
            }
        });
    }

    // 選單音樂 (安靜的和弦)
    playMenuMusic() {
        const frequencies = [220, 277, 330]; // A, C#, E
        
        frequencies.forEach((freq, index) => {
            const { oscillator, gainNode } = this.createOscillator(freq, 'sine', 4.0);
            
            // 非常輕柔的音量
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + 1.0);
            gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime + 3.0);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 4.0);
            
            const delay = index * 0.2;
            oscillator.start(this.audioContext.currentTime + delay);
            oscillator.stop(this.audioContext.currentTime + delay + 4.0);
        });
    }

    // 遊戲音樂 (更有動感)
    playGameMusic() {
        const frequencies = [440, 554, 659, 880]; // A, C#, E, A
        
        frequencies.forEach((freq, index) => {
            const { oscillator, gainNode } = this.createOscillator(freq, 'triangle', 2.0);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.015, this.audioContext.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.015, this.audioContext.currentTime + 1.5);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2.0);
            
            const delay = index * 0.3;
            oscillator.start(this.audioContext.currentTime + delay);
            oscillator.stop(this.audioContext.currentTime + delay + 2.0);
        });
    }

    // Boss 音樂 (更緊張)
    playBossMusic() {
        const frequencies = [110, 147, 196, 220]; // 低音和弦
        
        frequencies.forEach((freq, index) => {
            const { oscillator, gainNode } = this.createOscillator(freq, 'sawtooth', 3.0);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime + 2.5);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 3.0);
            
            const delay = index * 0.1;
            oscillator.start(this.audioContext.currentTime + delay);
            oscillator.stop(this.audioContext.currentTime + delay + 3.0);
        });
    }

    // 設定主音量
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }

    // 獲取狀態
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            audioContextState: this.audioContext ? this.audioContext.state : 'not created',
            masterVolume: this.masterVolume,
            sampleRate: this.audioContext ? this.audioContext.sampleRate : 0
        };
    }

    // 清理資源
    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.masterGain = null;
        this.isInitialized = false;
        this.soundCache.clear();
    }
}

// 全域合成音效生成器
const synthSoundGenerator = new SynthSoundGenerator();
window.synthSoundGenerator = synthSoundGenerator;