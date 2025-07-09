/**
 * 簡化的UI更新器
 * 完全獨立於現有的UIManager，使用直接的DOM操作
 */
class SimpleUIUpdater {
    constructor() {
        this.updateInterval = null;
        this.lastUpdateTime = 0;
        this.isActive = false;
        
        // 緩存DOM元素
        this.elements = {
            healthValue: null,
            healthBarFill: null,
            manaValue: null,
            manaBarFill: null,
            gameTimer: null,
            simpleComboDisplay: null,
            simpleComboValue: null,
            versionDisplay: null
        };
        
        console.log('🔄 SimpleUIUpdater 已創建');
    }
    
    // 初始化並緩存DOM元素
    init() {
        this.elements.healthValue = document.getElementById('healthValue');
        this.elements.healthBarFill = document.getElementById('healthBarFill');
        this.elements.manaValue = document.getElementById('manaValue');
        this.elements.manaBarFill = document.getElementById('manaBarFill');
        this.elements.gameTimer = document.getElementById('gameTimer');
        this.elements.simpleComboDisplay = document.getElementById('simpleComboDisplay');
        this.elements.simpleComboValue = document.getElementById('simpleComboValue');
        this.elements.versionDisplay = document.getElementById('versionDisplay');
        
        console.log('🔄 SimpleUIUpdater 元素緩存完成:', this.elements);
    }
    
    // 開始更新
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.init();
        
        // 使用requestAnimationFrame而不是setInterval，確保流暢更新
        this.updateLoop();
        
        console.log('🔄 SimpleUIUpdater 已啟動');
    }
    
    // 停止更新
    stop() {
        this.isActive = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        console.log('🔄 SimpleUIUpdater 已停止');
    }
    
    // 更新循環
    updateLoop() {
        if (!this.isActive) return;
        
        const currentTime = Date.now();
        
        // 限制更新頻率為每100ms一次
        if (currentTime - this.lastUpdateTime >= 100) {
            this.updateAll();
            this.lastUpdateTime = currentTime;
        }
        
        requestAnimationFrame(() => this.updateLoop());
    }
    
    // 更新所有UI元素
    updateAll() {
        if (!window.player || !window.player.isAlive) return;
        
        try {
            const playerData = window.player.getInfo();
            
            // 更新HP
            this.updateHealth(playerData.health, playerData.maxHealth);
            
            // 更新MP
            this.updateMana(playerData.mana, playerData.maxMana);
            
            // 更新時間
            this.updateTime(playerData.stats.survivalTime);
            
            // 更新連擊
            this.updateCombo(playerData.stats.currentCombo);
            
            // 更新版本顯示
            this.updateVersion();
            
        } catch (error) {
            console.error('🔄 SimpleUIUpdater 更新錯誤:', error);
        }
    }
    
    // 更新血量
    updateHealth(health, maxHealth) {
        if (this.elements.healthValue) {
            this.elements.healthValue.textContent = Math.round(health);
        }
        
        if (this.elements.healthBarFill) {
            const percentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));
            this.elements.healthBarFill.style.width = `${percentage}%`;
        }
    }
    
    // 更新魔力
    updateMana(mana, maxMana) {
        if (this.elements.manaValue) {
            this.elements.manaValue.textContent = Math.round(mana);
        }
        
        if (this.elements.manaBarFill) {
            const percentage = Math.max(0, Math.min(100, (mana / maxMana) * 100));
            this.elements.manaBarFill.style.width = `${percentage}%`;
        }
    }
    
    // 更新時間
    updateTime(survivalTime) {
        if (this.elements.gameTimer) {
            const minutes = Math.floor(survivalTime / 60);
            const seconds = Math.floor(survivalTime % 60);
            this.elements.gameTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    // 更新連擊
    updateCombo(combo) {
        if (this.elements.simpleComboDisplay && this.elements.simpleComboValue) {
            if (combo > 2) {
                this.elements.simpleComboDisplay.classList.remove('hidden');
                this.elements.simpleComboValue.textContent = combo;
            } else {
                this.elements.simpleComboDisplay.classList.add('hidden');
            }
        }
    }
    
    // 更新版本顯示
    updateVersion() {
        if (this.elements.versionDisplay && !window.gameVersion) {
            window.gameVersion = this.generateVersionNumber();
            this.elements.versionDisplay.textContent = `v${window.gameVersion}`;
        }
    }
    
    // 生成版本號
    generateVersionNumber() {
        const now = new Date();
        const year = now.getFullYear();
        
        // 計算週數
        const startOfYear = new Date(year, 0, 1);
        const pastDaysOfYear = (now - startOfYear) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
        
        // 構建次數
        const buildKey = `build_${year}_${weekNumber}`;
        let buildCount = localStorage.getItem(buildKey) || 0;
        buildCount++;
        localStorage.setItem(buildKey, buildCount);
        
        // 格式化時間
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}${minutes}`;
        
        return `${year}.${weekNumber}_${buildCount}.${timeString}`;
    }
    
    // 獲取狀態
    getStatus() {
        return {
            isActive: this.isActive,
            elementsFound: Object.keys(this.elements).filter(key => this.elements[key] !== null).length,
            totalElements: Object.keys(this.elements).length
        };
    }
}

// 創建全域實例
const simpleUIUpdater = new SimpleUIUpdater();
window.simpleUIUpdater = simpleUIUpdater;