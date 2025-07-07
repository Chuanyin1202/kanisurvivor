/**
 * 波次管理器
 * 管理敵人生成、波次進度和難度調整
 */
class WaveManager {
    constructor() {
        this.currentWave = 0;
        this.waveStartTime = 0;
        this.waveEndTime = 0;
        this.waveDuration = 0;
        this.isWaveActive = false;
        this.waveCompleted = false;
        
        // 生成設定
        this.spawnRate = 0;
        this.enemiesThisWave = 0;
        this.enemiesSpawned = 0;
        this.enemiesRemaining = 0;
        this.spawnTimer = 0;
        this.spawnPoints = [];
        
        // 難度調整
        this.difficultyMultiplier = 1.0;
        this.eliteChance = 0.0; // 精英敵人出現機率
        this.bossWave = false;
        
        // 敵人類型權重
        this.enemyWeights = new Map();
        this.updateEnemyWeights();
        
        // 特殊波次配置
        this.specialWaves = gameBalance.getValue('waves', 'specialWaves');
        
        // 事件監聽器
        this.listeners = new Map();
        
        this.setupSpawnPoints();
    }

    // 設定生成點
    setupSpawnPoints() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        const margin = 50;
        const width = canvas.width;
        const height = canvas.height;
        
        // 螢幕邊緣的生成點
        this.spawnPoints = [
            // 上邊
            ...Array.from({length: 8}, (_, i) => new Vector2((width / 8) * (i + 0.5), -margin)),
            // 下邊
            ...Array.from({length: 8}, (_, i) => new Vector2((width / 8) * (i + 0.5), height + margin)),
            // 左邊
            ...Array.from({length: 6}, (_, i) => new Vector2(-margin, (height / 6) * (i + 0.5))),
            // 右邊
            ...Array.from({length: 6}, (_, i) => new Vector2(width + margin, (height / 6) * (i + 0.5)))
        ];
    }

    // 開始新波次
    startWave(waveNumber = null) {
        if (waveNumber !== null) {
            this.currentWave = waveNumber;
        } else {
            this.currentWave++;
        }
        
        console.log(`🌊 開始第 ${this.currentWave} 波`);
        
        // 計算波次參數
        this.calculateWaveParameters();
        
        // 設定波次狀態
        this.isWaveActive = true;
        this.waveCompleted = false;
        this.waveStartTime = Date.now();
        this.waveEndTime = this.waveStartTime + this.waveDuration * 1000;
        this.enemiesSpawned = 0;
        this.spawnTimer = 0;
        
        // 更新敵人權重
        this.updateEnemyWeights();
        
        // 檢查特殊波次
        this.checkSpecialWave();
        
        // 觸發波次開始事件
        this.emit('waveStart', {
            wave: this.currentWave,
            duration: this.waveDuration,
            enemyCount: this.enemiesThisWave,
            isBoss: this.bossWave
        });
    }

    // 計算波次參數
    calculateWaveParameters() {
        const waveConfig = gameBalance.getValue('waves');
        
        console.log('Wave config:', waveConfig);
        
        if (!waveConfig) {
            console.error('Wave config not found!');
            return;
        }
        
        // 計算波次持續時間
        this.waveDuration = Math.max(
            waveConfig.minWaveDuration,
            waveConfig.waveDuration * Math.pow(waveConfig.waveGrowthRate, this.currentWave - 1)
        );
        
        // 計算敵人數量
        this.enemiesThisWave = Math.min(
            waveConfig.maxEnemyCount,
            Math.floor(waveConfig.baseEnemyCount * Math.pow(waveConfig.enemyCountGrowth, this.currentWave - 1))
        );
        
        // 計算生成速率
        this.spawnRate = Math.min(
            waveConfig.maxSpawnRate,
            waveConfig.baseSpawnRate + (this.currentWave - 1) * waveConfig.spawnRateGrowth
        );
        
        // 檢查首領波次
        this.bossWave = (this.currentWave % waveConfig.bossWaveInterval === 0);
        
        if (this.bossWave) {
            this.enemiesThisWave = Math.floor(this.enemiesThisWave * waveConfig.bossWaveMultiplier);
        }
        
        // 難度倍數 (更激進的成長)
        this.difficultyMultiplier = 1.0 + (this.currentWave - 1) * 0.15;
        this.eliteChance = Math.min(0.4, (this.currentWave - 1) * 0.03);
    }

    // 更新敵人權重
    updateEnemyWeights() {
        this.enemyWeights.clear();
        
        try {
            const enemies = gameBalance.getValue('enemies');
            
            if (enemies && typeof enemies === 'object') {
                for (const [type, data] of Object.entries(enemies)) {
                    if (data && this.currentWave >= (data.minWave || 1)) {
                        this.enemyWeights.set(type, data.spawnWeight || 1.0);
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to update enemy weights:', error);
            // 設定預設權重
            this.enemyWeights.set('slime', 1.0);
        }
    }

    // 檢查特殊波次
    checkSpecialWave() {
        if (this.specialWaves[this.currentWave]) {
            const special = this.specialWaves[this.currentWave];
            
            switch (special.type) {
                case 'speed':
                    console.log('⚡ 速度波次！敵人移動速度增加');
                    break;
                case 'health':
                    console.log('💪 血量波次！敵人血量增加');
                    break;
                case 'swarm':
                    console.log('🐛 蟲群波次！敵人數量大幅增加');
                    break;
            }
            
            this.emit('specialWave', special);
        }
    }

    // 更新波次
    update(deltaTime) {
        if (!this.isWaveActive) return;
        
        const currentTime = Date.now();
        
        // 生成敵人
        if (this.enemiesSpawned < this.enemiesThisWave) {
            this.updateSpawning(deltaTime);
        }
        
        // 檢查波次結束條件
        this.checkWaveCompletion();
        
        // 波次時間結束
        if (currentTime >= this.waveEndTime && !this.waveCompleted) {
            this.endWave();
        }
    }

    // 更新敵人生成
    updateSpawning(deltaTime) {
        this.spawnTimer += deltaTime;
        
        if (this.spawnTimer >= 1.0 / this.spawnRate) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }
    }

    // 生成敵人
    spawnEnemy() {
        if (this.enemiesSpawned >= this.enemiesThisWave) return;
        
        // 選擇敵人類型
        const enemyType = this.selectEnemyType();
        
        // 選擇生成點
        const spawnPoint = this.selectSpawnPoint();
        
        // 創建敵人
        const enemy = this.createEnemy(enemyType, spawnPoint.x, spawnPoint.y);
        
        // 應用難度和特殊效果
        this.applyDifficultyModifiers(enemy);
        this.applySpecialWaveEffects(enemy);
        
        // 添加到敵人管理器
        if (window.enemyManager) {
            enemyManager.addEnemy(enemy);
        }
        
        this.enemiesSpawned++;
        
        console.log(`生成敵人: ${enemyType} (${this.enemiesSpawned}/${this.enemiesThisWave})`);
    }

    // 選擇敵人類型
    selectEnemyType() {
        // 首領波次優先生成首領
        if (this.bossWave && Math.random() < 0.3) {
            return 'boss';
        }
        
        // 根據權重隨機選擇
        const totalWeight = Array.from(this.enemyWeights.values()).reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (const [type, weight] of this.enemyWeights) {
            random -= weight;
            if (random <= 0) {
                return type;
            }
        }
        
        return 'slime'; // 預設類型
    }

    // 選擇生成點
    selectSpawnPoint() {
        // 避免在玩家附近生成
        const player = window.player;
        const safeSpawnPoints = this.spawnPoints.filter(point => {
            if (!player) return true;
            return point.distanceTo(player.position) > 100;
        });
        
        if (safeSpawnPoints.length === 0) {
            return this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
        }
        
        return safeSpawnPoints[Math.floor(Math.random() * safeSpawnPoints.length)];
    }

    // 創建敵人
    createEnemy(type, x, y) {
        return new Enemy(x, y, type);
    }

    // 應用難度修正
    applyDifficultyModifiers(enemy) {
        // 血量和傷害隨波次增加 (更激進)
        const healthMultiplier = Math.pow(1.2, this.currentWave - 1);
        const damageMultiplier = Math.pow(1.15, this.currentWave - 1);
        const speedMultiplier = 1 + (this.currentWave - 1) * 0.05;
        
        enemy.maxHealth = Math.floor(enemy.maxHealth * healthMultiplier);
        enemy.health = enemy.maxHealth;
        enemy.damage = Math.floor(enemy.damage * damageMultiplier);
        enemy.speed = enemy.speed * speedMultiplier;
        
        // 提升獎勵隨難度增加
        enemy.experienceReward = Math.floor(enemy.experienceReward * (1 + (this.currentWave - 1) * 0.1));
        enemy.goldReward = Math.floor(enemy.goldReward * (1 + (this.currentWave - 1) * 0.1));
        
        // 精英敵人
        if (Math.random() < this.eliteChance) {
            this.makeElite(enemy);
        }
        
        console.log(`波次 ${this.currentWave} 敵人強化: HP=${enemy.maxHealth}, DMG=${enemy.damage}, SPD=${enemy.speed.toFixed(1)}`);
    }

    // 製作精英敵人
    makeElite(enemy) {
        enemy.maxHealth = Math.floor(enemy.maxHealth * 1.5);
        enemy.health = enemy.maxHealth;
        enemy.damage = Math.floor(enemy.damage * 1.3);
        enemy.speed = enemy.speed * 1.2;
        enemy.experienceReward = Math.floor(enemy.experienceReward * 1.5);
        enemy.goldReward = Math.floor(enemy.goldReward * 2);
        enemy.isElite = true;
        
        console.log(`👑 精英 ${enemy.type} 已生成！`);
    }

    // 應用特殊波次效果
    applySpecialWaveEffects(enemy) {
        const special = this.specialWaves[this.currentWave];
        if (!special) return;
        
        switch (special.type) {
            case 'speed':
                enemy.speed *= special.multiplier;
                break;
            case 'health':
                enemy.maxHealth = Math.floor(enemy.maxHealth * special.multiplier);
                enemy.health = enemy.maxHealth;
                break;
            case 'swarm':
                // 蟲群波次在敵人數量上已經處理
                break;
        }
    }

    // 檢查波次完成
    checkWaveCompletion() {
        if (this.waveCompleted) return;
        
        // 所有敵人都已生成且場上沒有活著的敵人
        if (this.enemiesSpawned >= this.enemiesThisWave) {
            const aliveEnemies = this.getAliveEnemyCount();
            
            if (aliveEnemies === 0) {
                this.completeWave();
            }
        }
    }

    // 獲取存活敵人數量
    getAliveEnemyCount() {
        if (window.enemyManager) {
            return enemyManager.getAliveEnemyCount();
        }
        return 0;
    }

    // 完成波次
    completeWave() {
        if (this.waveCompleted) return;
        
        this.waveCompleted = true;
        this.isWaveActive = false;
        
        console.log(`✅ 第 ${this.currentWave} 波完成！`);
        
        // 給予波次完成獎勵
        this.giveWaveRewards();
        
        // 觸發波次完成事件
        this.emit('waveComplete', {
            wave: this.currentWave,
            timeTaken: (Date.now() - this.waveStartTime) / 1000,
            enemiesKilled: this.enemiesSpawned
        });
        
        // 短暫休息後開始下一波
        setTimeout(() => {
            this.startWave();
        }, 3000);
    }

    // 結束波次（時間到）
    endWave() {
        if (this.waveCompleted) return;
        
        console.log(`⏰ 第 ${this.currentWave} 波時間結束`);
        
        // 不清除敵人！讓敵人累積到下一波，增加難度
        console.log('🔥 敵人將累積到下一波，無法逃避戰鬥！');
        
        this.completeWave();
    }

    // 給予波次獎勵
    giveWaveRewards() {
        const player = window.player;
        if (!player) return;
        
        // 經驗值獎勵
        const expReward = this.currentWave * 10;
        player.addExperience(expReward);
        
        // 金幣獎勵
        const goldReward = this.currentWave * 5;
        if (window.gameData) {
            gameData.addGold(goldReward);
        }
        
        // 首領波次額外獎勵
        if (this.bossWave) {
            player.addExperience(expReward);
            if (window.gameData) {
                gameData.addGold(goldReward);
            }
        }
        
        console.log(`💰 波次獎勵: ${expReward} 經驗值, ${goldReward} 金幣`);
    }

    // 強制開始下一波
    forceNextWave() {
        if (this.isWaveActive) {
            this.endWave();
        } else {
            this.startWave();
        }
    }

    // 重置波次管理器
    reset() {
        this.currentWave = 0;
        this.isWaveActive = false;
        this.waveCompleted = false;
        this.enemiesSpawned = 0;
        this.spawnTimer = 0;
        this.difficultyMultiplier = 1.0;
        this.eliteChance = 0.0;
        this.bossWave = false;
        
        console.log('🔄 波次管理器已重置');
    }

    // 設定難度
    setDifficulty(multiplier) {
        this.difficultyMultiplier = Math.max(0.1, multiplier);
        console.log(`🎯 難度設定為: ${multiplier}x`);
    }

    // 跳過當前波次
    skipCurrentWave() {
        if (this.isWaveActive) {
            this.completeWave();
        }
    }

    // 暫停波次
    pauseWave() {
        // 這個功能可以在暫停系統中實作
        console.log('⏸️ 波次已暫停');
    }

    // 恢復波次
    resumeWave() {
        // 這個功能可以在暫停系統中實作
        console.log('▶️ 波次已恢復');
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

    // 獲取波次資訊
    getWaveInfo() {
        return {
            currentWave: this.currentWave,
            isActive: this.isWaveActive,
            completed: this.waveCompleted,
            duration: this.waveDuration,
            enemiesTotal: this.enemiesThisWave,
            enemiesSpawned: this.enemiesSpawned,
            enemiesRemaining: Math.max(0, this.enemiesThisWave - this.enemiesSpawned),
            spawnRate: this.spawnRate,
            difficultyMultiplier: this.difficultyMultiplier,
            isBoss: this.bossWave,
            timeRemaining: Math.max(0, (this.waveEndTime - Date.now()) / 1000)
        };
    }

    // 獲取統計資料
    getStats() {
        return {
            wavesCompleted: this.currentWave - (this.isWaveActive ? 1 : 0),
            totalEnemiesSpawned: this.enemiesSpawned,
            currentDifficulty: this.difficultyMultiplier,
            eliteChance: this.eliteChance
        };
    }
}

// 全域實例
const waveManager = new WaveManager();

// 設為全域變數
window.waveManager = waveManager;