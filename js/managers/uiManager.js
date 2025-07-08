/**
 * UI 管理器
 * 管理遊戲界面的顯示和交互
 */
class UIManager {
    constructor() {
        // UI 元素引用
        this.elements = new Map();
        this.updateCallbacks = new Map();
        
        // 狀態
        this.isInitialized = false;
        this.currentScreen = 'mainMenu';
        
        // 動畫
        this.animations = [];
        
        this.initialize();
    }

    // 初始化 UI 管理器
    initialize() {
        this.cacheUIElements();
        this.setupEventListeners();
        this.setupUpdateCallbacks();
        this.isInitialized = true;
        
        console.log('UI システム初期化完了 - UI SYSTEM INITIALIZED');
    }

    // 緩存 UI 元素引用
    cacheUIElements() {
        const elementIds = [
            // 主選單
            'mainMenu', 'startBtn', 'shopBtn', 'achievementsBtn', 'settingsBtn',
            'goldDisplay', 'bestTimeDisplay', 'totalKillsDisplay',
            
            // 遊戲中 UI
            'gameUI', 'healthBar', 'healthText', 'expBar', 'levelText',
            'gameTimer', 'killCount', 'combo', 'pauseBtn',
            
            // 選單和對話框
            'pauseMenu', 'resumeBtn', 'restartBtn', 'mainMenuBtn',
            'gameOverMenu', 'finalTime', 'finalKills', 'finalCombo', 'goldEarned',
            'playAgainBtn', 'backToMenuBtn', 'newAchievements',
            
            // 商店
            'shopMenu', 'shopItems', 'shopGold', 'closeShopBtn',
            
            // 成就
            'achievementsMenu', 'achievementsList', 'closeAchievementsBtn',
            
            // 其他
            'loadingScreen', 'damageNumbers'
        ];
        
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.elements.set(id, element);
            } else {
                console.warn(`UI element not found: ${id}`);
            }
        });
    }

    // 設定事件監聽器
    setupEventListeners() {
        // 為所有按鈕添加音效
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (window.audioManager) {
                    audioManager.playButtonHover();
                }
            });
            
            button.addEventListener('click', () => {
                if (window.audioManager) {
                    audioManager.playButtonClick();
                }
            });
        });
        
        // 商店標籤切換
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (event) => {
                this.switchShopTab(event.target.dataset.tab);
            });
        });
    }

    // 設定更新回調
    setupUpdateCallbacks() {
        // 遊戲 UI 更新
        this.updateCallbacks.set('gameUI', () => {
            this.updateGameUI();
        });
        
        // 主選單統計更新
        this.updateCallbacks.set('mainMenu', () => {
            this.updateMainMenuStats();
        });
    }

    // 更新 UI
    update(deltaTime) {
        // 執行當前螢幕的更新回調
        if (this.updateCallbacks.has(this.currentScreen)) {
            this.updateCallbacks.get(this.currentScreen)();
        }
        
        // 更新動畫
        this.updateAnimations(deltaTime);
    }

    // 更新遊戲中 UI
    updateGameUI() {
        if (!window.player) return;
        
        const playerInfo = window.player.getInfo();
        
        // 更新血量條
        this.updateHealthBar(playerInfo.health, playerInfo.maxHealth);
        
        // 更新經驗條
        this.updateExpBar(playerInfo.experience, playerInfo.experienceToNext, playerInfo.level);
        
        // 更新統計資料
        this.updateGameStats(playerInfo.stats);
        
        // 更新技能冷卻顯示
        this.updateSkillCooldowns(playerInfo);
    }

    // 更新血量條
    updateHealthBar(health, maxHealth) {
        const healthBar = this.elements.get('healthBar');
        const healthText = this.elements.get('healthText');
        
        if (healthBar) {
            const healthPercent = Math.max(0, (health / maxHealth) * 100);
            healthBar.style.width = `${healthPercent}%`;
            
            // 血量顏色變化
            if (healthPercent < 25) {
                healthBar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            } else if (healthPercent < 50) {
                healthBar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
            } else {
                healthBar.style.background = 'linear-gradient(90deg, #27ae60, #229954)';
            }
        }
        
        if (healthText) {
            healthText.textContent = `${Math.round(health)}/${maxHealth}`;
        }
    }

    // 更新經驗條
    updateExpBar(experience, experienceToNext, level) {
        const expBar = this.elements.get('expBar');
        const levelText = this.elements.get('levelText');
        
        if (expBar) {
            const expPercent = (experience / experienceToNext) * 100;
            expBar.style.width = `${expPercent}%`;
        }
        
        if (levelText) {
            levelText.textContent = `Lv.${level}`;
        }
    }

    // 更新遊戲統計
    updateGameStats(stats) {
        const killCount = this.elements.get('killCount');
        const combo = this.elements.get('combo');
        const gameTimer = this.elements.get('gameTimer');
        
        if (killCount) {
            killCount.textContent = `擊殺: ${stats.kills}`;
        }
        
        if (combo) {
            combo.textContent = `連擊: ${stats.currentCombo}`;
            
            // 連擊高亮效果
            if (stats.currentCombo > 10) {
                combo.style.color = '#f1c40f';
                combo.style.textShadow = '0 0 10px #f1c40f';
            } else {
                combo.style.color = '#ffffff';
                combo.style.textShadow = 'none';
            }
        }
        
        if (gameTimer) {
            const minutes = Math.floor(stats.survivalTime / 60);
            const seconds = Math.floor(stats.survivalTime % 60);
            gameTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // 更新技能冷卻顯示
    updateSkillCooldowns(playerInfo) {
        // 這裡可以添加技能冷卻時間的視覺指示
        // 例如在技能圖標上顯示冷卻進度
    }

    // 更新主選單統計
    updateMainMenuStats() {
        if (!window.gameData) return;
        
        const playerStats = gameData.getPlayerStats();
        const currentGold = gameData.getGold();
        
        const goldDisplay = this.elements.get('goldDisplay');
        const bestTimeDisplay = this.elements.get('bestTimeDisplay');
        const totalKillsDisplay = this.elements.get('totalKillsDisplay');
        
        if (goldDisplay) {
            goldDisplay.textContent = currentGold;
        }
        
        if (totalKillsDisplay) {
            totalKillsDisplay.textContent = playerStats.totalKills || 0;
        }
        
        if (bestTimeDisplay) {
            const bestTime = playerStats.bestSurvivalTime || 0;
            const minutes = Math.floor(bestTime / 60);
            const seconds = bestTime % 60;
            bestTimeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // 顯示傷害數字
    showDamageNumber(damage, x, y, isCrit = false, type = 'damage') {
        if (!gameSettings.get('graphics', 'showDamageNumbers')) return;
        
        const damageNumbersContainer = this.elements.get('damageNumbers');
        if (!damageNumbersContainer) return;
        
        const damageElement = document.createElement('div');
        damageElement.className = 'damage-number';
        damageElement.textContent = Math.round(damage);
        
        // 樣式設定
        let color = '#ffffff';
        let fontSize = '14px';
        
        switch (type) {
            case 'damage':
                color = isCrit ? '#ffff00' : '#ffffff';
                fontSize = isCrit ? '18px' : '14px';
                break;
            case 'heal':
                color = '#00ff00';
                break;
            case 'exp':
                color = '#00ffff';
                break;
        }
        
        damageElement.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-size: ${fontSize};
            font-weight: bold;
            pointer-events: none;
            z-index: 1000;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            animation: damageFloat 2s ease-out forwards;
        `;
        
        damageNumbersContainer.appendChild(damageElement);
        
        // 自動移除
        setTimeout(() => {
            if (damageElement.parentNode) {
                damageElement.parentNode.removeChild(damageElement);
            }
        }, 2000);
    }

    // 顯示通知
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: bold;
            z-index: 2000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        // 根據類型設定背景色
        switch (type) {
            case 'success':
                notification.style.background = '#27ae60';
                break;
            case 'warning':
                notification.style.background = '#f39c12';
                break;
            case 'error':
                notification.style.background = '#e74c3c';
                break;
            default:
                notification.style.background = '#3498db';
        }
        
        document.body.appendChild(notification);
        
        // 顯示動畫
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // 自動隱藏
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // 切換螢幕
    switchScreen(screenName) {
        // 隱藏所有螢幕
        const screens = ['mainMenu', 'gameUI', 'pauseMenu', 'gameOverMenu', 'shopMenu', 'achievementsMenu'];
        
        screens.forEach(screen => {
            const element = this.elements.get(screen);
            if (element) {
                element.classList.add('hidden');
            }
        });
        
        // 顯示目標螢幕
        const targetScreen = this.elements.get(screenName);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenName;
        }
    }

    // 顯示遊戲結束畫面
    showGameOver(stats) {
        const finalTime = this.elements.get('finalTime');
        const finalKills = this.elements.get('finalKills');
        const finalCombo = this.elements.get('finalCombo');
        const goldEarned = this.elements.get('goldEarned');
        
        if (finalTime) {
            const minutes = Math.floor(stats.survivalTime / 60);
            const seconds = stats.survivalTime % 60;
            finalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (finalKills) {
            finalKills.textContent = stats.kills;
        }
        
        if (finalCombo) {
            finalCombo.textContent = stats.maxCombo;
        }
        
        if (goldEarned) {
            goldEarned.textContent = stats.goldEarned;
        }
        
        this.switchScreen('gameOverMenu');
    }

    // 切換商店標籤
    switchShopTab(tabName) {
        // 更新標籤按鈕狀態
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        
        // 更新商店內容
        this.updateShopContent(tabName);
    }

    // 更新商店內容
    updateShopContent(category) {
        const shopItems = this.elements.get('shopItems');
        if (!shopItems) return;
        
        shopItems.innerHTML = '';
        
        // 這裡會根據類別顯示不同的商品
        // 實際實作會在商店系統中完成
        const placeholder = document.createElement('div');
        placeholder.textContent = `${category} 商品即將推出...`;
        placeholder.style.padding = '20px';
        placeholder.style.textAlign = 'center';
        placeholder.style.color = '#888';
        
        shopItems.appendChild(placeholder);
    }

    // 更新動畫
    updateAnimations(deltaTime) {
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const animation = this.animations[i];
            animation.time += deltaTime;
            
            if (animation.time >= animation.duration) {
                animation.onComplete?.();
                this.animations.splice(i, 1);
            } else {
                animation.onUpdate?.(animation.time / animation.duration);
            }
        }
    }

    // 添加動畫
    addAnimation(duration, onUpdate, onComplete) {
        this.animations.push({
            time: 0,
            duration: duration,
            onUpdate: onUpdate,
            onComplete: onComplete
        });
    }

    // 設定 UI 元素可見性
    setElementVisible(elementId, visible) {
        const element = this.elements.get(elementId);
        if (element) {
            if (visible) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    }

    // 設定 UI 縮放
    setUIScale(scale) {
        const gameUI = this.elements.get('gameUI');
        if (gameUI) {
            gameUI.style.transform = `scale(${scale})`;
        }
    }

    // 獲取 UI 統計
    getStats() {
        return {
            isInitialized: this.isInitialized,
            currentScreen: this.currentScreen,
            cachedElements: this.elements.size,
            activeAnimations: this.animations.length
        };
    }

    // 清理資源
    cleanup() {
        this.animations = [];
        this.elements.clear();
        this.updateCallbacks.clear();
    }
}

// 添加 CSS 動畫
const style = document.createElement('style');
style.textContent = `
    @keyframes damageFloat {
        0% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(-50px);
        }
    }
    
    .notification {
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
`;
document.head.appendChild(style);

// 全域 UI 管理器
const uiManager = new UIManager();