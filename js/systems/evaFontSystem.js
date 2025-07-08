/**
 * EVA情感字體系統
 * 管理基於遊戲狀態的動態字體效果和情緒響應
 */
class EVAFontSystem {
    constructor() {
        this.currentSyncRate = 100; // 同步率 (0-100)
        this.emotionalState = 'calm'; // calm, tense, panic
        this.systemStatus = 'normal'; // normal, alert, critical
        
        // UI元素緩存
        this.uiElements = new Map();
        this.scanlineElement = null;
        
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
        
        // 緩存掃描線元素
        this.scanlineElement = document.querySelector('.eva-scanline');
        
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
    
    // 獲取當前狀態信息
    getStatus() {
        return {
            syncRate: this.currentSyncRate,
            emotionalState: this.emotionalState,
            systemStatus: this.systemStatus,
            elementsManaged: this.uiElements.size
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