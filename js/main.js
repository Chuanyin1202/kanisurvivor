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
        // 主選單按鈕 - 同時添加 click 和 touchend 事件
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('🎮 開始按鈕被點擊');
                this.startNewGame();
            });
            startBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                console.log('🎮 開始按鈕被觸控');
                this.startNewGame();
            });
        }
        
        const shopBtn = document.getElementById('shopBtn');
        if (shopBtn) {
            shopBtn.addEventListener('click', () => {
                this.showShop();
            });
            shopBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.showShop();
            });
        }
        
        const achievementsBtn = document.getElementById('achievementsBtn');
        if (achievementsBtn) {
            achievementsBtn.addEventListener('click', () => {
                this.showAchievements();
            });
            achievementsBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.showAchievements();
            });
        }
        
        const elementFusionBtn = document.getElementById('elementFusionBtn');
        if (elementFusionBtn) {
            elementFusionBtn.addEventListener('click', () => {
                this.showElementFusion();
            });
            elementFusionBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.showElementFusion();
            });
        }
        
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
            settingsBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.showSettings();
            });
        }

        // 遊戲中按鈕

        // 暫停選單按鈕
        const resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.resumeGame();
            });
            resumeBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.resumeGame();
            });
        }
        
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restartGame();
            });
            restartBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.restartGame();
            });
        }
        
        const mainMenuBtn = document.getElementById('mainMenuBtn');
        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', () => {
                this.returnToMainMenu();
            });
            mainMenuBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.returnToMainMenu();
            });
        }

        // 遊戲結束按鈕
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.startNewGame();
            });
            playAgainBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.startNewGame();
            });
        }
        
        const backToMenuBtn = document.getElementById('backToMenuBtn');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                this.returnToMainMenu();
            });
            backToMenuBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.returnToMainMenu();
            });
        }

        // 商店按鈕
        const closeShopBtn = document.getElementById('closeShopBtn');
        if (closeShopBtn) {
            closeShopBtn.addEventListener('click', () => {
                this.hideShop();
            });
            closeShopBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.hideShop();
            });
        }

        // 成就按鈕
        const closeAchievementsBtn = document.getElementById('closeAchievementsBtn');
        if (closeAchievementsBtn) {
            closeAchievementsBtn.addEventListener('click', () => {
                this.hideAchievements();
            });
            closeAchievementsBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.hideAchievements();
            });
        }

        // 玩家輸入事件（全域只註冊一次，直接操作 window.player）
        document.addEventListener('mousemove', (event) => {
            const canvas = document.getElementById('gameCanvas');
            if (!canvas || !window.player) return;
            const rect = canvas.getBoundingClientRect();
            window.player.input.mouseX = event.clientX - rect.left;
            window.player.input.mouseY = event.clientY - rect.top;
        });

        document.addEventListener('mousedown', (event) => {
            if (!window.player) return;
            if (event.button === 0) {
                window.player.input.spellPressed = true;
            }
        });
        document.addEventListener('mouseup', (event) => {
            if (!window.player) return;
            if (event.button === 0) {
                window.player.input.spellPressed = false;
            }
        });

        // 觸控事件支援（只在 Canvas 上）
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.addEventListener('touchstart', (event) => {
                if (!window.player) return;
                event.preventDefault(); // 防止頁面滾動
                
                const touch = event.touches[0];
                const rect = canvas.getBoundingClientRect();
                window.player.input.mouseX = touch.clientX - rect.left;
                window.player.input.mouseY = touch.clientY - rect.top;
                window.player.input.spellPressed = true;
            });

            canvas.addEventListener('touchmove', (event) => {
                if (!window.player) return;
                event.preventDefault(); // 防止頁面滾動
                
                const touch = event.touches[0];
                const rect = canvas.getBoundingClientRect();
                window.player.input.mouseX = touch.clientX - rect.left;
                window.player.input.mouseY = touch.clientY - rect.top;
            });

            canvas.addEventListener('touchend', (event) => {
                if (!window.player) return;
                event.preventDefault(); // 防止頁面滾動
                window.player.input.spellPressed = false;
            });
        }

        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'Escape':
                    // ESC 鍵切換暫停狀態
                    if (gameStateManager.isCurrentState('gamePlay')) {
                        this.pauseGame();
                    } else if (gameStateManager.isCurrentState('pause')) {
                        this.resumeGame();
                    }
                    event.preventDefault();
                    break;
            }
            
            if (!window.player) return;
            switch (event.code) {
                case 'Space':
                    window.player.input.dashPressed = true;
                    event.preventDefault();
                    break;
                case 'Digit1':
                    window.player.selectedSpell = 'fireball';
                    break;
                case 'Digit2':
                    window.player.selectedSpell = 'frostbolt';
                    break;
                case 'Digit3':
                    window.player.selectedSpell = 'lightning';
                    break;
                case 'Digit4':
                    window.player.selectedSpell = 'arcane';
                    break;
            }
        });
        document.addEventListener('keyup', (event) => {
            if (!window.player) return;
            switch (event.code) {
                case 'Space':
                    window.player.input.dashPressed = false;
                    break;
            }
        });

        // 視窗失焦暫停
        window.addEventListener('blur', () => {
            if (gameStateManager.isCurrentState('gamePlay') && gameSettings.get('controls', 'pauseOnFocusLoss')) {
                this.pauseGame();
            }
        });

        // 視窗大小變化監聽
        window.addEventListener('resize', () => {
            if (this.renderer) {
                this.renderer.setupCanvas();
                console.log('🖥️ 視窗大小已調整:', this.renderer.width, 'x', this.renderer.height);
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
        // 清理舊的玩家實例
        if (this.player) {
            this.player = null;
        }
        if (window.player) {
            window.player = null;
        }
        
        // 使用渲染器的邏輯尺寸而不是Canvas的實際尺寸
        let centerX, centerY;
        if (this.renderer) {
            centerX = this.renderer.width / 2;
            centerY = this.renderer.height / 2;
        } else {
            centerX = this.canvas.width / 2;
            centerY = this.canvas.height / 2;
        }
        
        this.player = new Player(centerX, centerY);
        window.player = this.player; // 全域存取
        
        console.log(`🧙 玩家角色創建完成，位置: (${centerX}, ${centerY})`);
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

        // 檢查管理器是否存在（管理器應該在各自的文件中設定window屬性）
        if (!window.waveManager) {
            console.error('❌ WaveManager 未初始化');
        }
        
        if (!window.enemyManager) {
            console.error('❌ EnemyManager 未初始化');
        }
        
        if (!window.effectsManager) {
            console.error('❌ EffectsManager 未初始化');
        }
        
        if (!window.lootManager) {
            console.error('❌ LootManager 未初始化');
        }
        
        if (!window.abilityManager) {
            console.error('❌ AbilityManager 未初始化');
            // 嘗試初始化
            if (typeof initializeAbilityManager === 'function') {
                console.log('🔄 嘗試初始化 AbilityManager');
                initializeAbilityManager();
            }
        }

        console.log('🎮 管理器初始化完成');
        console.log('🌊 WaveManager 已就緒:', !!window.waveManager);
        console.log('👹 EnemyManager 已就緒:', !!window.enemyManager);
        console.log('✨ EffectsManager 已就緒:', !!window.effectsManager);
        console.log('💰 LootManager 已就緒:', !!window.lootManager);
        console.log('🎯 AbilityManager 已就緒:', !!window.abilityManager);
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
        
        // 更新輸入管理器
        if (window.inputManager) {
            inputManager.update();
        }
        
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
            
            // 更新特效管理器
            if (window.effectsManager) {
                effectsManager.update(deltaTime);
            }
            
            // 更新戰利品管理器
            if (window.lootManager) {
                lootManager.update(deltaTime);
            }
            
            // 更新召喚物管理器
            if (window.summonManager) {
                summonManager.update(deltaTime);
            }
            
            // 更新 UI
            this.updateGameUI();
        }
        
        // 更新 Debug 管理器（總是更新，不受遊戲狀態影響）
        if (window.debugManager) {
            debugManager.update(deltaTime);
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
            
            // 渲染戰利品
            if (window.lootManager) {
                lootManager.render(this.renderer);
            }
            
            // 渲染召喚物
            if (window.summonManager) {
                summonManager.render(this.renderer);
            }
            
            // 渲染玩家（在最上層）
            if (this.player) {
                this.player.render(this.renderer);
            }
            
            // 渲染特效（在最頂層）
            if (window.effectsManager) {
                effectsManager.render(this.renderer);
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
        
        // 重置遊戲狀態
        this.isPaused = false;
        
        // 重建玩家實例
        this.createPlayer();
        
        // 重設所有管理器 (使用 window 確保正確引用)
        if (window.enemyManager) {
            window.enemyManager.reset();
        }
        
        if (window.projectileManager) {
            window.projectileManager.reset();
        }
        
        if (window.waveManager) {
            window.waveManager.reset();
        }
        
        if (window.effectsManager) {
            window.effectsManager.reset();
        }
        
        if (window.lootManager) {
            window.lootManager.reset();
        }
        
        // 重設能力管理器
        if (window.abilityManager) {
            window.abilityManager.reset();
        }
        
        // 重設召喚物管理器
        if (window.summonManager) {
            window.summonManager.reset();
        }
        
        // 清除所有物件池
        if (typeof poolManager !== 'undefined') {
            poolManager.releaseAll();
        }
        
        // 切換到遊戲狀態
        console.log('🔄 切換到遊戲狀態');
        gameStateManager.changeState('gamePlay');
        console.log('✅ 狀態已切換到 gamePlay');
        
        // 隱藏主選單和暫停選單，顯示遊戲UI
        const mainMenu = document.getElementById('mainMenu');
        const gameUI = document.getElementById('gameUI');
        const pauseMenu = document.getElementById('pauseMenu');
        
        if (mainMenu) {
            mainMenu.style.display = 'none';
            mainMenu.classList.add('hidden');
            console.log('🙈 主選單已隱藏');
        }
        
        if (gameUI) {
            gameUI.style.display = 'block';
            gameUI.classList.remove('hidden');
            console.log('👁️ 遊戲UI已顯示');
        }
        
        if (pauseMenu) {
            pauseMenu.style.display = 'none';
            pauseMenu.classList.add('hidden');
            console.log('⏸️ 暫停選單已重置');
        }
        
        // 強制更新生成點以確保正確的螢幕尺寸
        if (window.waveManager) {
            console.log('🔄 強制更新生成點');
            window.waveManager.setupSpawnPoints();
            console.log('🌊 開始第一波');
            window.waveManager.startWave(1);
        }
        
        // 顯示手機控制器法術選擇器（僅在遊戲中）
        if (window.mobileControls && mobileControls.isEnabled) {
            mobileControls.showSpellSelector();
        }
        
        // 更新 UI
        console.log('🔄 更新遊戲UI');
        this.updateGameUI();
        
        // 觸發遊戲重新開始事件（通知手機控制系統同步法術選擇器）
        setTimeout(() => {
            const gameRestartedEvent = new CustomEvent('gameRestarted', {
                detail: { timestamp: Date.now() }
            });
            document.dispatchEvent(gameRestartedEvent);
            console.log('📡 遊戲重新開始事件已觸發');
        }, 200); // 稍微延遲以確保玩家狀態已完全初始化
        
        // 確保遊戲運行
        if (!this.isRunning) {
            console.log('▶️ 啟動遊戲主循環');
            this.start();
        } else {
            console.log('✅ 遊戲主循環已在運行');
        }
    }

    // 暫停遊戲
    pauseGame() {
        if (gameStateManager.isCurrentState('gamePlay')) {
            gameStateManager.pushState('pause');
            this.isPaused = true;
            
            // 隱藏法術選擇器
            if (window.mobileControls) {
                mobileControls.hideSpellSelector();
            }
            
            // 確保暫停選單顯示
            const pauseMenu = document.getElementById('pauseMenu');
            if (pauseMenu) {
                pauseMenu.style.display = 'flex';
                pauseMenu.classList.remove('hidden');
                console.log('⏸️ 暫停選單已顯示');
            } else {
                console.error('❌ 找不到暫停選單元素');
            }
            
            console.log('⏸️ 遊戲暫停');
        }
    }

    // 恢復遊戲
    resumeGame() {
        if (gameStateManager.isCurrentState('pause')) {
            gameStateManager.popState();
            this.isPaused = false;
            
            // 顯示法術選擇器
            if (window.mobileControls && mobileControls.isEnabled) {
                mobileControls.showSpellSelector();
            }
            
            // 隱藏暫停選單
            const pauseMenu = document.getElementById('pauseMenu');
            if (pauseMenu) {
                pauseMenu.style.display = 'none';
                pauseMenu.classList.add('hidden');
                console.log('⏸️ 暫停選單已隱藏');
            }
            
            // 確保 Canvas 顯示
            const canvas = document.getElementById('gameCanvas');
            if (canvas) canvas.style.display = 'block';
            // 確保 UI 顯示正確
            document.getElementById('gameUI')?.classList.remove('hidden');
            
            // 調試玩家狀態
            if (window.player) {
                console.log('玩家位置:', window.player.position);
                console.log('玩家生命值:', window.player.health);
                
                // 如果玩家位置異常，重置到中心
                if (isNaN(window.player.position.x) || isNaN(window.player.position.y)) {
                    console.warn('玩家位置異常，重置到中心');
                    window.player.position.x = window.renderer.width / 2;
                    window.player.position.y = window.renderer.height / 2;
                }
            }
            
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
        
        // 顯示主選單UI
        const mainMenu = document.getElementById('mainMenu');
        const gameUI = document.getElementById('gameUI');
        const pauseMenu = document.getElementById('pauseMenu');
        
        if (mainMenu) {
            mainMenu.style.display = 'flex';
            mainMenu.classList.remove('hidden');
            console.log('🎮 主選單已顯示');
        }
        
        if (gameUI) {
            gameUI.style.display = 'none';
            gameUI.classList.add('hidden');
            console.log('🙈 遊戲UI已隱藏');
        }
        
        if (pauseMenu) {
            pauseMenu.style.display = 'none';
            pauseMenu.classList.add('hidden');
            console.log('⏸️ 暫停選單已隱藏');
        }
        
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

    // 顯示元素合成
    showElementFusion() {
        if (window.elementSelector) {
            elementSelector.show();
        } else {
            console.warn('⚠️ 元素選擇器尚未載入');
        }
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
        const manaText = document.getElementById('manaText');
        if (manaBar && manaText) {
            const manaPercent = (playerInfo.mana / playerInfo.maxMana) * 100;
            manaBar.style.width = `${manaPercent}%`;
            manaText.textContent = `${Math.round(playerInfo.mana)}/${playerInfo.maxMana}`;
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