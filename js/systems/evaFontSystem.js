/**
 * EVA情感字體系統
 * 管理基於遊戲狀態的動態字體效果和情緒響應
 */
class EVAFontSystem {
    constructor() {
        this.currentSyncRate = 100; // 同步率 (0-100)
        this.emotionalState = 'calm'; // calm, tense, panic
        this.systemStatus = 'normal'; // normal, alert, critical
        this.battleState = 'idle'; // idle, active, intense
        
        // UI元素緩存
        this.uiElements = new Map();
        this.scanlineElement = null;
        this.hudElement = null;
        
        // 動畫控制
        this.animationIntervals = new Map();
        this.flashOverlay = null;
        
        console.log('🔤 EVA字體系統初期化完了 - EVA FONT SYSTEM INITIALIZED');
    }
    
    // 初始化系統
    initialize() {
        this.cacheUIElements();
        this.setupEventListeners();
        this.startScanlineEffect();
        this.updateAllElements();
    }
    
    // 緩存UI元素
    cacheUIElements() {
        // 收集所有帶有data屬性的UI元素
        const uiElements = document.querySelectorAll('.ui-element');
        uiElements.forEach(element => {
            const id = element.id || `element_${Math.random().toString(36).substr(2, 9)}`;
            this.uiElements.set(id, element);
        });
        
        // 緩存關鍵元素
        this.scanlineElement = document.querySelector('.eva-scanline');
        this.hudElement = document.querySelector('.hud');
        
        // 創建全屏閃白覆蓋層
        this.createFlashOverlay();
        
        console.log(`📦 UI要素キャッシュ完了 - ${this.uiElements.size} elements cached`);
    }
    
    // 設置事件監聽器
    setupEventListeners() {
        // 監聽遊戲狀態變化
        if (window.player) {
            // 綁定玩家生命值變化
            this.bindHealthChanges();
        }
        
        // 鍵盤快捷鍵 (調試用)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'F9') {
                this.cycleSyncRate();
            }
            if (e.code === 'F10') {
                this.cycleEmotionalState();
            }
            if (e.code === 'F11') {
                this.cycleBattleState();
            }
            if (e.code === 'F12') {
                this.triggerFlashWarning();
            }
        });
    }
    
    // 更新同步率
    setSyncRate(rate) {
        this.currentSyncRate = Math.max(0, Math.min(100, rate));
        
        // 根據同步率調整系統狀態
        if (this.currentSyncRate < 30) {
            this.systemStatus = 'critical';
        } else if (this.currentSyncRate < 60) {
            this.systemStatus = 'alert';
        } else {
            this.systemStatus = 'normal';
        }
        
        this.updateAllElements();
        console.log(`⚡ 同期率更新 - SYNC RATE: ${this.currentSyncRate}% [${this.systemStatus.toUpperCase()}]`);
    }
    
    // 設置情緒狀態
    setEmotionalState(state) {
        this.emotionalState = state;
        this.updateAllElements();
        console.log(`💭 感情状態遷移 - EMOTIONAL STATE: ${state.toUpperCase()}`);
    }
    
    // 更新所有UI元素
    updateAllElements() {
        this.uiElements.forEach((element, id) => {
            this.updateElementState(element);
        });
        
        this.updateScanlineIntensity();
    }
    
    // 更新單個元素狀態
    updateElementState(element) {
        // 設置同步率數據屬性
        if (this.currentSyncRate < 30) {
            element.setAttribute('data-sync-rate', 'critical');
        } else if (this.currentSyncRate < 60) {
            element.setAttribute('data-sync-rate', 'low');
        } else {
            element.setAttribute('data-sync-rate', 'normal');
        }
        
        // 設置情緒狀態數據屬性
        element.setAttribute('data-emotional-state', this.emotionalState);
        
        // 根據系統狀態調整字體類
        this.updateFontState(element);
    }
    
    // 更新字體狀態類
    updateFontState(element) {
        // 移除現有字體狀態類
        element.classList.remove('font-state-normal', 'font-state-alert', 'font-state-critical');
        
        // 添加新狀態類
        switch (this.systemStatus) {
            case 'critical':
                element.classList.add('font-state-critical');
                break;
            case 'alert':
                element.classList.add('font-state-alert');
                break;
            default:
                element.classList.add('font-state-normal');
        }
        
        // 為文字添加碎片效果 (危險狀態)
        if (this.systemStatus === 'critical') {
            this.addFragmentationEffect(element);
        } else {
            this.removeFragmentationEffect(element);
        }
    }
    
    // 添加文字碎片效果
    addFragmentationEffect(element) {
        const textElements = element.querySelectorAll('span, div');
        textElements.forEach(textEl => {
            if (textEl.textContent.trim()) {
                textEl.classList.add('eva-text-fragmented');
                textEl.setAttribute('data-text', textEl.textContent);
            }
        });
    }
    
    // 移除文字碎片效果
    removeFragmentationEffect(element) {
        const textElements = element.querySelectorAll('.eva-text-fragmented');
        textElements.forEach(textEl => {
            textEl.classList.remove('eva-text-fragmented');
            textEl.removeAttribute('data-text');
        });
    }
    
    // 啟動掃描線效果
    startScanlineEffect() {
        if (!this.scanlineElement) return;
        
        // 根據系統狀態調整掃描線速度
        this.updateScanlineIntensity();
    }
    
    // 更新掃描線強度
    updateScanlineIntensity() {
        if (!this.scanlineElement) return;
        
        let duration = '3s';
        let opacity = '0.3';
        
        switch (this.systemStatus) {
            case 'critical':
                duration = '0.8s';
                opacity = '0.8';
                break;
            case 'alert':
                duration = '1.5s';
                opacity = '0.6';
                break;
            default:
                duration = '3s';
                opacity = '0.3';
        }
        
        this.scanlineElement.style.animationDuration = duration;
        this.scanlineElement.style.opacity = opacity;
    }
    
    // 綁定生命值變化事件
    bindHealthChanges() {
        // 這將與player系統集成
        if (window.player && typeof window.player.on === 'function') {
            window.player.on('healthChanged', (healthPercent) => {
                // 根據生命值調整情緒狀態
                if (healthPercent < 25) {
                    this.setEmotionalState('panic');
                } else if (healthPercent < 50) {
                    this.setEmotionalState('tense');
                } else {
                    this.setEmotionalState('calm');
                }
                
                // 根據生命值調整同步率
                const syncRate = Math.max(20, healthPercent + Math.random() * 20 - 10);
                this.setSyncRate(syncRate);
            });
        }
    }
    
    // 觸發系統警告效果
    triggerSystemWarning(message, type = 'warning') {
        const warningElement = document.createElement('div');
        warningElement.className = `eva-system-warning font-system-warning font-state-critical`;
        warningElement.innerHTML = `
            <span class="eva-mixed-text">
                <span class="japanese">⚠️ 警告</span> - <span class="english">${type.toUpperCase()}</span>
            </span>
            <br>
            <span class="code">${message}</span>
        `;
        
        warningElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 64, 0.1);
            border: 3px solid var(--eva-red-primary);
            padding: 2rem;
            z-index: 10000;
            text-align: center;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(warningElement);
        
        // 3秒後自動移除
        setTimeout(() => {
            warningElement.remove();
        }, 3000);
    }
    
    // 調試功能：循環同步率
    cycleSyncRate() {
        const rates = [100, 75, 50, 25, 10];
        const currentIndex = rates.findIndex(r => r <= this.currentSyncRate);
        const nextIndex = (currentIndex + 1) % rates.length;
        this.setSyncRate(rates[nextIndex]);
    }
    
    // 調試功能：循環情緒狀態
    cycleEmotionalState() {
        const states = ['calm', 'tense', 'panic'];
        const currentIndex = states.indexOf(this.emotionalState);
        const nextIndex = (currentIndex + 1) % states.length;
        this.setEmotionalState(states[nextIndex]);
    }
    
    // 設置戰鬥狀態
    setBattleState(state) {
        this.battleState = state;
        this.updateBattleAnimations();
        console.log(`⚔️ 戦闘状態更新 - BATTLE STATE: ${state.toUpperCase()}`);
    }
    
    // 更新戰鬥動畫
    updateBattleAnimations() {
        if (!this.hudElement) return;
        
        // 移除現有戰鬥狀態類
        this.hudElement.classList.remove('eva-battle-active', 'eva-sync-unstable');
        this.hudElement.removeAttribute('data-battle-state');
        
        // 應用新戰鬥狀態
        switch (this.battleState) {
            case 'active':
                this.hudElement.setAttribute('data-battle-state', 'active');
                break;
            case 'intense':
                this.hudElement.setAttribute('data-battle-state', 'intense');
                break;
            default:
                // idle狀態，無需特殊動畫
                break;
        }
    }
    
    // 創建全屏閃白覆蓋層
    createFlashOverlay() {
        this.flashOverlay = document.createElement('div');
        this.flashOverlay.className = 'eva-flash-overlay';
        this.flashOverlay.style.display = 'none';
        document.body.appendChild(this.flashOverlay);
    }
    
    // 觸發全屏警告閃白
    triggerFlashWarning() {
        if (!this.flashOverlay) return;
        
        this.flashOverlay.style.display = 'block';
        this.flashOverlay.style.animation = 'eva-flash-warning 0.5s linear';
        
        // 播放警告音效（如果存在）
        if (window.audioManager && audioManager.playWarning) {
            audioManager.playWarning();
        }
        
        // 0.5秒後隱藏
        setTimeout(() => {
            this.flashOverlay.style.display = 'none';
        }, 500);
        
        console.log('⚠️ 緊急警告発動 - EMERGENCY WARNING TRIGGERED');
    }
    
    // 啟動戰鬥激烈模式
    startIntenseBattle() {
        this.setBattleState('intense');
        this.setEmotionalState('tense');
        
        // 如果同步率低，觸發額外效果
        if (this.currentSyncRate < 50) {
            this.triggerFlashWarning();
        }
    }
    
    // 停止戰鬥模式
    stopBattle() {
        this.setBattleState('idle');
        this.setEmotionalState('calm');
    }
    
    // 模擬同步失衡事件
    triggerSyncLoss() {
        const previousRate = this.currentSyncRate;
        this.setSyncRate(Math.max(10, this.currentSyncRate - 30));
        this.setEmotionalState('panic');
        this.triggerFlashWarning();
        
        // 3秒後部分恢復
        setTimeout(() => {
            this.setSyncRate(Math.min(previousRate, this.currentSyncRate + 15));
            if (this.currentSyncRate > 30) {
                this.setEmotionalState('tense');
            }
        }, 3000);
        
        console.log('💥 同期率急降下 - SYNC RATE CRITICAL DROP');
    }
    
    // 調試功能：循環戰鬥狀態
    cycleBattleState() {
        const states = ['idle', 'active', 'intense'];
        const currentIndex = states.indexOf(this.battleState);
        const nextIndex = (currentIndex + 1) % states.length;
        this.setBattleState(states[nextIndex]);
    }
    
    // 自動同步率波動（模擬真實戰鬥）
    startAutoSyncFluctuation() {
        if (this.animationIntervals.has('syncFluctuation')) return;
        
        const interval = setInterval(() => {
            if (this.battleState !== 'idle') {
                // 戰鬥時同步率會有微幅波動
                const fluctuation = (Math.random() - 0.5) * 10; // ±5%
                const newRate = Math.max(0, Math.min(100, this.currentSyncRate + fluctuation));
                this.setSyncRate(newRate);
            }
        }, 2000);
        
        this.animationIntervals.set('syncFluctuation', interval);
    }
    
    // 停止自動波動
    stopAutoSyncFluctuation() {
        const interval = this.animationIntervals.get('syncFluctuation');
        if (interval) {
            clearInterval(interval);
            this.animationIntervals.delete('syncFluctuation');
        }
    }
    
    // 與遊戲狀態集成
    onGameStateChange(gameState) {
        switch (gameState) {
            case 'playing':
                this.setBattleState('active');
                this.startAutoSyncFluctuation();
                break;
            case 'paused':
                this.setBattleState('idle');
                break;
            case 'gameOver':
                this.triggerSyncLoss();
                this.stopAutoSyncFluctuation();
                break;
            default:
                this.setBattleState('idle');
                this.stopAutoSyncFluctuation();
        }
    }
    
    // 獲取當前狀態信息
    getStatus() {
        return {
            syncRate: this.currentSyncRate,
            emotionalState: this.emotionalState,
            systemStatus: this.systemStatus,
            battleState: this.battleState,
            elementsManaged: this.uiElements.size,
            animationsActive: this.animationIntervals.size
        };
    }
}

// 創建全域實例
const evaFontSystem = new EVAFontSystem();
window.evaFontSystem = evaFontSystem;

// 在DOM加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    evaFontSystem.initialize();
});