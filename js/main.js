/**
 * Kani: Pixel Mage Survivor - 主遊戲檔案
 * 遊戲的入口點和主要控制邏輯
 */
class Game {
    constructor() {
        this.canvas = null;
        this.renderer = null;
        this.player = null;
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        
        // 遊戲統計
        this.frameCount = 0;
        this.fps = 0;
        this.fpsTimer = 0;
        
        // 初始化標記
        this.isInitialized = false;
        this.assetsLoaded = false;
    }

    // 初始化遊戲
    async initialize() {
        console.log('🎮 初始化 Kani: Pixel Mage Survivor...');
        
        try {
            // 初始化 Canvas 和渲染器
            this.initializeCanvas();
            
            // 初始化遊戲資料
            gameData.initialize();
            
            // 設定遊戲狀態
            this.setupGameStates();
            
            // 設定 UI 事件監聽
            this.setupUIEventListeners();
            
            // 載入資產
            await this.loadAssets();
            
            // 創建玩家
            this.createPlayer();
            
            // 初始化物件池
            this.initializeObjectPools();
            
            // 初始化管理器
            this.initializeManagers();
            
            this.isInitialized = true;
            console.log('✅ 遊戲初始化完成');
            
            // 開始遊戲循環
            this.start();
            
        } catch (error) {
            console.error('❌ 遊戲初始化失敗:', error);
            this.showErrorMessage('遊戲初始化失敗，請重新整理頁面');
        }
    }

    // 初始化 Canvas
    initializeCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('找不到遊戲 Canvas 元素');
        }
        
        this.renderer = new Renderer(this.canvas);
        window.renderer = this.renderer; // 全域存取
        
        console.log('📺 Canvas 初始化完成');
    }

    // 設定遊戲狀態
    setupGameStates() {
        gameStateManager.registerState('mainMenu', new MainMenuState());
        gameStateManager.registerState('gamePlay', new GamePlayState());
        gameStateManager.registerState('pause', new PauseState());
        gameStateManager.registerState('gameOver', new GameOverState());
        
        // 開始時進入主選單
        gameStateManager.changeState('mainMenu');
        
        console.log('🎯 遊戲狀態管理器設定完成');
    }

    // 設定 UI 事件監聽
    setupUIEventListeners() {
        // 主選單按鈕
        document.getElementById('startBtn')?.addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('shopBtn')?.addEventListener('click', () => {
            this.showShop();
        });
        
        document.getElementById('achievementsBtn')?.addEventListener('click', () => {
            this.showAchievements();
        });
        
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.showSettings();
        });

        // 遊戲中按鈕
        document.getElementById('pauseBtn')?.addEventListener('click', () => {
            this.pauseGame();
        });

        // 暫停選單按鈕
        document.getElementById('resumeBtn')?.addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('restartBtn')?.addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('mainMenuBtn')?.addEventListener('click', () => {
            this.returnToMainMenu();
        });

        // 遊戲結束按鈕
        document.getElementById('playAgainBtn')?.addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('backToMenuBtn')?.addEventListener('click', () => {
            this.returnToMainMenu();
        });

        // 商店按鈕
        document.getElementById('closeShopBtn')?.addEventListener('click', () => {
            this.hideShop();
        });

        // 成就按鈕
        document.getElementById('closeAchievementsBtn')?.addEventListener('click', () => {
            this.hideAchievements();
        });

        // 鍵盤事件
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });

        // 視窗失焦暫停
        window.addEventListener('blur', () => {
            if (gameStateManager.isCurrentState('gamePlay') && gameSettings.get('controls', 'pauseOnFocusLoss')) {
                this.pauseGame();
            }
        });

        console.log('🎮 UI 事件監聽器設定完成');
    }

    // 載入資產
    async loadAssets() {
        console.log('📦 開始載入遊戲資產...');
        
        // 顯示載入畫面
        document.getElementById('loadingScreen').classList.remove('hidden');
        
        // 設定載入進度監聽
        assetLoader.on('assetLoaded', (data) => {
            this.updateLoadingProgress(data.progress);
        });
        
        assetLoader.on('loadComplete', () => {
            this.onAssetsLoaded();
        });
        
        assetLoader.on('loadError', (error) => {
            console.error('資產載入錯誤:', error);
            this.showErrorMessage('資產載入失敗');
        });
        
        // 開始載入預設資產
        return loadDefaultAssets();
    }

    // 更新載入進度
    updateLoadingProgress(progress) {
        const percentage = Math.round(progress * 100);
        const loadingText = document.querySelector('#loadingScreen p');
        if (loadingText) {
            loadingText.textContent = `載入中... ${percentage}%`;
        }
    }

    // 資產載入完成
    onAssetsLoaded() {
        this.assetsLoaded = true;
        document.getElementById('loadingScreen').classList.add('hidden');
        console.log('✅ 所有資產載入完成');
    }

    // 創建玩家
    createPlayer() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.player = new Player(centerX, centerY);
        window.player = this.player; // 全域存取
        
        console.log('🧙 玩家角色創建完成');
    }

    // 初始化物件池
    initializeObjectPools() {
        // 註冊各種物件池
        poolManager.registerPool('projectiles', 
            () => ({}), // 創建函數
            (obj) => { // 重置函數
                obj.active = false;
                obj.position = new Vector2();
                obj.velocity = new Vector2();
            },
            50 // 初始大小
        );
        
        poolManager.registerPool('enemies', 
            () => ({}),
            (obj) => {
                obj.active = false;
                obj.health = 0;
            },
            30
        );
        
        poolManager.registerPool('particles',
            () => ({}),
            (obj) => {
                obj.active = false;
                obj.life = 0;
            },
            100
        );
        
        console.log('🏊 物件池初始化完成');
    }

    // 初始化管理器
    initializeManagers() {
        // 創建投射物管理器（如果還沒創建）
        if (!window.projectileManager) {
            window.projectileManager = {
                projectiles: [],
                update: function(deltaTime) {
                    for (let i = this.projectiles.length - 1; i >= 0; i--) {
                        const projectile = this.projectiles[i];
                        if (projectile.active) {
                            projectile.update(deltaTime);
                        } else {
                            this.projectiles.splice(i, 1);
                        }
                    }
                },
                render: function(renderer) {
                    for (const projectile of this.projectiles) {
                        if (projectile.active) {
                            projectile.render(renderer);
                        }
                    }
                },
                addProjectile: function(projectile) {
                    this.projectiles.push(projectile);
                },
                reset: function() {
                    this.projectiles = [];
                }
            };
        }

        // 確保管理器存在
        if (!window.waveManager) {
            console.error('❌ WaveManager 未初始化');
        }
        
        if (!window.enemyManager) {
            console.error('❌ EnemyManager 未初始化');
        }

        console.log('🎮 管理器初始化完成');
        console.log('🌊 WaveManager 已就緒:', !!window.waveManager);
        console.log('👹 EnemyManager 已就緒:', !!window.enemyManager);
    }

    // 開始遊戲
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
        
        console.log('🚀 遊戲循環開始');
    }

    // 停止遊戲
    stop() {
        this.isRunning = false;
        console.log('⏹️ 遊戲循環停止');
    }

    // 主遊戲循環
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000; // 轉換為秒
        this.lastTime = currentTime;
        
        // 限制 deltaTime 避免大跳躍
        this.deltaTime = Math.min(this.deltaTime, 1/30); // 最大 30fps
        
        // 更新和渲染
        this.update(this.deltaTime);
        this.render();
        
        // 更新 FPS
        this.updateFPS();
        
        // 請求下一幀
        requestAnimationFrame(() => this.gameLoop());
    }

    // 更新遊戲邏輯
    update(deltaTime) {
        if (!this.isInitialized || this.isPaused) return;
        
        // 更新遊戲狀態
        gameStateManager.update(deltaTime);
        
        // 如果在遊戲進行狀態，更新遊戲物件
        if (gameStateManager.isCurrentState('gamePlay')) {
            if (this.player) {
                this.player.update(deltaTime);
            }
            
            // 更新敵人管理器
            if (window.enemyManager) {
                enemyManager.update(deltaTime);
            }
            
            // 更新投射物管理器
            if (window.projectileManager) {
                projectileManager.update(deltaTime);
            }
            
            // 更新波次管理器
            if (window.waveManager) {
                waveManager.update(deltaTime);
                
                // 調試輸出
                if (Math.random() < 0.01) { // 每 100 幀輸出一次
                    console.log('Debug - 敵人數量:', window.enemyManager ? enemyManager.enemies.length : 'N/A');
                    console.log('Debug - 波次狀態:', waveManager.getWaveInfo());
                }
            }
            
            // 更新 UI
            this.updateGameUI();
        }
        
        // 更新渲染器效果（如螢幕震動）
        this.renderer.updateShake(deltaTime);
    }

    // 渲染遊戲
    render() {
        if (!this.isInitialized) return;
        
        // 清除畫布
        this.renderer.clear('#1a1a2e');
        
        // 開始渲染幀
        this.renderer.beginFrame();
        
        // 渲染遊戲狀態
        gameStateManager.render(this.renderer);
        
        // 如果在遊戲進行狀態，渲染遊戲物件
        if (gameStateManager.isCurrentState('gamePlay')) {
            // 渲染敵人
            if (window.enemyManager) {
                enemyManager.render(this.renderer);
            }
            
            // 渲染投射物
            if (window.projectileManager) {
                projectileManager.render(this.renderer);
            }
            
            // 渲染玩家（在最上層）
            if (this.player) {
                this.player.render(this.renderer);
            }
        }
        
        // 結束渲染幀
        this.renderer.endFrame();
        
        // 渲染 FPS（如果啟用）
        if (gameSettings.get('graphics', 'showFPS')) {
            this.renderFPS();
        }
    }

    // 更新 FPS
    updateFPS() {
        this.frameCount++;
        this.fpsTimer += this.deltaTime;
        
        if (this.fpsTimer >= 1.0) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = 0;
            
            // 自動調整畫質
            gameSettings.autoAdjustQuality(this.fps);
        }
    }

    // 渲染 FPS
    renderFPS() {
        this.renderer.drawText(`FPS: ${this.fps}`, 10, 10, '#ffffff', '16px monospace');
    }

    // 開始新遊戲
    startNewGame() {
        console.log('🎯 開始新遊戲');
        
        // 重置玩家
        if (this.player) {
            this.createPlayer();
        }
        
        // 重置遊戲管理器
        if (window.enemyManager) {
            enemyManager.reset();
        }
        
        if (window.projectileManager) {
            projectileManager.reset();
        }
        
        if (window.waveManager) {
            waveManager.reset();
        }
        
        // 清除所有物件池
        poolManager.releaseAll();
        
        // 切換到遊戲狀態
        gameStateManager.changeState('gamePlay');
        
        // 開始第一波
        if (window.waveManager) {
            waveManager.startWave(1);
        }
        
        // 更新 UI
        this.updateGameUI();
    }

    // 暫停遊戲
    pauseGame() {
        if (gameStateManager.isCurrentState('gamePlay')) {
            gameStateManager.pushState('pause');
            this.isPaused = true;
            console.log('⏸️ 遊戲暫停');
        }
    }

    // 恢復遊戲
    resumeGame() {
        if (gameStateManager.isCurrentState('pause')) {
            gameStateManager.popState();
            this.isPaused = false;
            console.log('▶️ 遊戲恢復');
        }
    }

    // 重新開始遊戲
    restartGame() {
        console.log('🔄 重新開始遊戲');
        this.startNewGame();
    }

    // 返回主選單
    returnToMainMenu() {
        console.log('🏠 返回主選單');
        this.isPaused = false;
        gameStateManager.changeState('mainMenu');
        this.updateMainMenuUI();
    }

    // 顯示商店
    showShop() {
        document.getElementById('shopMenu').classList.remove('hidden');
        // 這裡會在商店系統實作時添加更多邏輯
    }

    // 隱藏商店
    hideShop() {
        document.getElementById('shopMenu').classList.add('hidden');
    }

    // 顯示成就
    showAchievements() {
        document.getElementById('achievementsMenu').classList.remove('hidden');
        // 這裡會在成就系統實作時添加更多邏輯
    }

    // 隱藏成就
    hideAchievements() {
        document.getElementById('achievementsMenu').classList.add('hidden');
    }

    // 顯示設定
    showSettings() {
        // 這裡會在設定系統實作時添加邏輯
        console.log('設定選單尚未實作');
    }

    // 更新遊戲 UI
    updateGameUI() {
        if (!this.player) return;
        
        const playerInfo = this.player.getInfo();
        
        // 更新血量條
        const healthBar = document.getElementById('healthBar');
        const healthText = document.getElementById('healthText');
        if (healthBar && healthText) {
            const healthPercent = (playerInfo.health / playerInfo.maxHealth) * 100;
            healthBar.style.width = `${healthPercent}%`;
            healthText.textContent = `${Math.round(playerInfo.health)}/${playerInfo.maxHealth}`;
        }
        
        // 更新魔法條
        const manaBar = document.getElementById('manaBar');
        if (manaBar) {
            const manaPercent = (playerInfo.mana / playerInfo.maxMana) * 100;
            manaBar.style.width = `${manaPercent}%`;
        }
        
        // 更新經驗條
        const expBar = document.getElementById('expBar');
        const levelText = document.getElementById('levelText');
        if (expBar && levelText) {
            const expPercent = (playerInfo.experience / playerInfo.experienceToNext) * 100;
            expBar.style.width = `${expPercent}%`;
            levelText.textContent = `Lv.${playerInfo.level}`;
        }
        
        // 更新統計
        const killCount = document.getElementById('killCount');
        const combo = document.getElementById('combo');
        const gameTimer = document.getElementById('gameTimer');
        
        if (killCount) killCount.textContent = `擊殺: ${playerInfo.stats.kills}`;
        if (combo) combo.textContent = `連擊: ${playerInfo.stats.currentCombo}`;
        if (gameTimer) {
            const minutes = Math.floor(playerInfo.stats.survivalTime / 60);
            const seconds = Math.floor(playerInfo.stats.survivalTime % 60);
            gameTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // 更新主選單 UI
    updateMainMenuUI() {
        const playerStats = gameData.getPlayerStats();
        const currentGold = gameData.getGold();
        
        // 更新統計顯示
        document.getElementById('goldDisplay').textContent = currentGold;
        document.getElementById('totalKillsDisplay').textContent = playerStats.totalKills;
        
        const bestTime = playerStats.bestSurvivalTime;
        const minutes = Math.floor(bestTime / 60);
        const seconds = bestTime % 60;
        document.getElementById('bestTimeDisplay').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // 處理鍵盤按下
    handleKeyDown(event) {
        switch (event.code) {
            case 'Escape':
                if (gameStateManager.isCurrentState('gamePlay')) {
                    this.pauseGame();
                } else if (gameStateManager.isCurrentState('pause')) {
                    this.resumeGame();
                }
                event.preventDefault();
                break;
        }
    }

    // 顯示錯誤訊息
    showErrorMessage(message) {
        alert(message); // 暫時使用 alert，之後可以改為自定義對話框
    }

    // 設定目標 FPS
    setTargetFPS(fps) {
        this.targetFPS = Math.max(30, Math.min(120, fps));
        this.frameTime = 1000 / this.targetFPS;
    }

    // 獲取遊戲統計
    getStats() {
        return {
            fps: this.fps,
            deltaTime: this.deltaTime,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            currentState: gameStateManager.getCurrentStateName()
        };
    }
}

// 全域遊戲實例
let game = null;

// 當頁面載入完成時初始化遊戲
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌟 Kani: Pixel Mage Survivor 正在啟動...');
    
    try {
        game = new Game();
        window.game = game; // 全域存取
        await game.initialize();
    } catch (error) {
        console.error('💥 遊戲啟動失敗:', error);
    }
});

// 處理頁面卸載
window.addEventListener('beforeunload', () => {
    if (game) {
        game.stop();
    }
});