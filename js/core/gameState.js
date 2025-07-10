/**
 * 遊戲狀態管理器
 * 管理遊戲的不同狀態和狀態之間的轉換
 */
class GameStateManager {
    constructor() {
        this.states = new Map();
        this.currentState = null;
        this.previousState = null;
        this.stateStack = [];
        this.listeners = new Map();
    }

    // 註冊狀態
    registerState(name, state) {
        this.states.set(name, state);
        
        // 如果狀態有初始化方法，呼叫它
        if (state.initialize) {
            state.initialize();
        }
    }

    // 切換到指定狀態
    changeState(stateName, ...args) {
        const newState = this.states.get(stateName);
        if (!newState) {
            console.error(`State '${stateName}' not found`);
            return false;
        }

        // 離開當前狀態
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit();
        }

        // 儲存前一個狀態
        this.previousState = this.currentState;
        this.currentState = newState;

        // 進入新狀態
        if (this.currentState.enter) {
            this.currentState.enter(...args);
        }

        // 觸發狀態改變事件
        this.emit('stateChanged', {
            from: this.previousState,
            to: this.currentState,
            stateName: stateName
        });

        return true;
    }

    // 推送狀態到堆疊（用於暫停等情況）
    pushState(stateName, ...args) {
        if (this.currentState) {
            this.stateStack.push(this.currentState);
            
            // 暫停當前狀態
            if (this.currentState.pause) {
                this.currentState.pause();
            }
        }

        return this.changeState(stateName, ...args);
    }

    // 從堆疊彈出狀態
    popState() {
        if (this.stateStack.length === 0) {
            return false;
        }

        // 離開當前狀態
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit();
        }

        // 恢復前一個狀態
        this.previousState = this.currentState;
        this.currentState = this.stateStack.pop();

        // 恢復狀態
        if (this.currentState.resume) {
            this.currentState.resume();
        }

        return true;
    }

    // 返回上一個狀態
    returnToPreviousState() {
        if (this.previousState) {
            return this.changeState(this.previousState.name);
        }
        return false;
    }

    // 更新當前狀態
    update(deltaTime) {
        if (this.currentState && this.currentState.update) {
            this.currentState.update(deltaTime);
        }
    }

    // 渲染當前狀態
    render(renderer) {
        if (this.currentState && this.currentState.render) {
            this.currentState.render(renderer);
        }
    }

    // 處理輸入
    handleInput(input) {
        if (this.currentState && this.currentState.handleInput) {
            this.currentState.handleInput(input);
        }
    }

    // 獲取當前狀態名稱
    getCurrentStateName() {
        for (const [name, state] of this.states) {
            if (state === this.currentState) {
                return name;
            }
        }
        return null;
    }

    // 檢查是否為指定狀態
    isCurrentState(stateName) {
        return this.getCurrentStateName() === stateName;
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

/**
 * 基礎遊戲狀態類別
 */
class BaseGameState {
    constructor(name) {
        this.name = name;
    }

    // 初始化狀態
    initialize() {
        // 子類別可以覆寫此方法
    }

    // 進入狀態
    enter(...args) {
        // 子類別可以覆寫此方法
    }

    // 離開狀態
    exit() {
        // 子類別可以覆寫此方法
    }

    // 暫停狀態
    pause() {
        // 子類別可以覆寫此方法
    }

    // 恢復狀態
    resume() {
        // 子類別可以覆寫此方法
    }

    // 更新狀態
    update(deltaTime) {
        // 子類別可以覆寫此方法
    }

    // 渲染狀態
    render(renderer) {
        // 子類別可以覆寫此方法
    }

    // 處理輸入
    handleInput(input) {
        // 子類別可以覆寫此方法
    }
}

/**
 * 主選單狀態
 */
class MainMenuState extends BaseGameState {
    constructor() {
        super('mainMenu');
    }

    enter() {
        console.log('進入主選單');
        // 顯示主選單 UI
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('gameUI').classList.add('hidden');
        document.getElementById('gameCanvas').style.display = 'none';
        
        // 更新主選單的統計顯示
        this.updateMainMenuUI();
    }
    
    // 更新主選單 UI
    updateMainMenuUI() {
        console.log('🎮 更新主選單 UI');
        
        if (window.gameData) {
            const playerStats = window.gameData.getPlayerStats();
            const currentGold = window.gameData.getGold();
            
            console.log('📊 載入的統計數據:', playerStats);
            console.log('💰 當前金幣:', currentGold);
            
            // 更新統計顯示
            const goldDisplay = document.getElementById('goldDisplay');
            const totalKillsDisplay = document.getElementById('totalKillsDisplay');
            const bestTimeDisplay = document.getElementById('bestTimeDisplay');
            
            if (goldDisplay) {
                goldDisplay.textContent = currentGold;
                console.log('💰 金幣顯示已更新:', currentGold);
            }
            if (totalKillsDisplay) {
                totalKillsDisplay.textContent = playerStats.totalKills;
                console.log('⚔️ 總擊殺顯示已更新:', playerStats.totalKills);
            }
            if (bestTimeDisplay) {
                const bestTime = playerStats.bestSurvivalTime;
                const minutes = Math.floor(bestTime / 60);
                const seconds = bestTime % 60;
                const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                bestTimeDisplay.textContent = timeText;
                console.log('⏱️ 最佳時間顯示已更新:', timeText);
            }
        } else {
            console.error('❌ gameData 不可用，無法更新主選單 UI');
        }
    }

    exit() {
        console.log('離開主選單');
        // 隱藏主選單 UI
        document.getElementById('mainMenu').classList.add('hidden');
    }

    handleInput(input) {
        // 處理主選單輸入
    }
}

/**
 * 遊戲進行狀態
 */
class GamePlayState extends BaseGameState {
    constructor() {
        super('gamePlay');
        this.isPaused = false;
    }

    enter() {
        console.log('開始遊戲');
        // 顯示遊戲 UI
        document.getElementById('gameUI').classList.remove('hidden');
        document.getElementById('gameCanvas').style.display = 'block';
        this.isPaused = false;
    }

    exit() {
        console.log('結束遊戲');
        // 隱藏遊戲 UI
        document.getElementById('gameUI').classList.add('hidden');
        document.getElementById('gameCanvas').style.display = 'none';
    }

    pause() {
        this.isPaused = true;
        console.log('遊戲暫停');
    }

    resume() {
        this.isPaused = false;
        console.log('遊戲恢復');
    }

    update(deltaTime) {
        if (!this.isPaused) {
            // 更新遊戲邏輯
            if (window.player) {
                window.player.update(deltaTime);
            }
            
            if (window.enemyManager) {
                window.enemyManager.update(deltaTime);
            }
            
            if (window.waveManager) {
                window.waveManager.update(deltaTime);
            }
            
            // 更新其他遊戲系統
            if (window.effectsManager) {
                window.effectsManager.update(deltaTime);
            }
            
            if (window.summonManager) {
                window.summonManager.update(deltaTime);
            }
        }
    }

    render(renderer) {
        if (!this.isPaused) {
            // 渲染遊戲畫面
            if (window.player) {
                window.player.render(renderer);
            }
            
            if (window.enemyManager) {
                window.enemyManager.render(renderer);
            }
            
            if (window.effectsManager) {
                window.effectsManager.render(renderer);
            }
            
            if (window.summonManager) {
                window.summonManager.render(renderer);
            }
        }
    }
}

/**
 * 暫停狀態
 */
class PauseState extends BaseGameState {
    constructor() {
        super('pause');
    }

    enter() {
        console.log('遊戲暫停');
        document.getElementById('pauseMenu').classList.remove('hidden');
    }

    exit() {
        console.log('取消暫停');
        document.getElementById('pauseMenu').classList.add('hidden');
    }
}

/**
 * 遊戲結束狀態
 */
class GameOverState extends BaseGameState {
    constructor() {
        super('gameOver');
    }

    enter(stats) {
        console.log('遊戲結束', stats);
        
        // 隱藏遊戲UI，顯示遊戲結束選單
        document.getElementById('gameUI').classList.add('hidden');
        document.getElementById('gameOverMenu').classList.remove('hidden');
        
        // 更新遊戲結束統計
        if (stats) {
            document.getElementById('finalTime').textContent = this.formatTime(stats.survivalTime);
            document.getElementById('finalKills').textContent = stats.kills;
            document.getElementById('finalCombo').textContent = stats.maxCombo;
            document.getElementById('goldEarned').textContent = stats.goldEarned;
            
            // 保存遊戲統計到持久化資料
            this.saveGameStats(stats);
        }
    }

    // 保存遊戲統計數據
    saveGameStats(stats) {
        console.log('📊 嘗試保存遊戲統計:', stats);
        
        if (window.gameData) {
            console.log('✅ gameData 可用，開始保存...');
            const currentStats = window.gameData.getPlayerStats();
            console.log('📈 當前統計:', currentStats);
            
            // 更新統計數據
            const updatedStats = {
                totalKills: currentStats.totalKills + (stats.kills || 0),
                totalPlayTime: currentStats.totalPlayTime + (stats.survivalTime || 0),
                bestSurvivalTime: Math.max(currentStats.bestSurvivalTime, stats.survivalTime || 0),
                gamesPlayed: currentStats.gamesPlayed + 1,
                highestLevel: Math.max(currentStats.highestLevel, stats.level || 1),
                totalGoldEarned: currentStats.totalGoldEarned + (stats.goldEarned || 0)
            };
            
            // 保存到持久化儲存
            window.gameData.updatePlayerStats(updatedStats);
            
            // 添加獲得的金幣
            if (stats.goldEarned > 0) {
                const currentGold = window.gameData.getGold();
                window.gameData.addGold(stats.goldEarned);
                console.log(`💰 金幣更新: ${currentGold} -> ${currentGold + stats.goldEarned}`);
            }
            
            console.log('✅ 遊戲統計已保存:', updatedStats);
        } else {
            console.error('❌ gameData 不可用，無法保存統計');
        }
    }

    exit() {
        document.getElementById('gameOverMenu').classList.add('hidden');
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// 全域遊戲狀態管理器
const gameStateManager = new GameStateManager();
window.gameStateManager = gameStateManager;