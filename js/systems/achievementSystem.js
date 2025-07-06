/**
 * 成就系統
 * 管理遊戲成就的解鎖和進度追蹤
 */
class AchievementSystem {
    constructor() {
        // 成就資料
        this.achievements = new Map();
        this.unlockedAchievements = new Set();
        this.progressData = new Map();
        
        // 事件監聽器
        this.listeners = new Map();
        
        this.initializeAchievements();
        this.loadProgress();
    }

    // 初始化成就資料
    initializeAchievements() {
        // 擊殺類成就
        this.addAchievement('first_kill', {
            name: '初次擊殺',
            description: '擊殺第一個敵人',
            type: 'kills',
            target: 1,
            reward: { gold: 10 },
            icon: '⚔️'
        });

        this.addAchievement('killer', {
            name: '殺手',
            description: '累計擊殺50個敵人',
            type: 'kills',
            target: 50,
            reward: { gold: 50 },
            icon: '💀'
        });

        this.addAchievement('slaughter', {
            name: '屠殺者',
            description: '累計擊殺200個敵人',
            type: 'kills',
            target: 200,
            reward: { gold: 100 },
            icon: '🗡️'
        });

        this.addAchievement('massacre', {
            name: '大屠殺',
            description: '累計擊殺500個敵人',
            type: 'kills',
            target: 500,
            reward: { gold: 200 },
            icon: '⚡'
        });

        // 生存類成就
        this.addAchievement('survivor', {
            name: '生存者',
            description: '生存1分鐘',
            type: 'survival',
            target: 60,
            reward: { gold: 25 },
            icon: '🛡️'
        });

        this.addAchievement('veteran', {
            name: '老兵',
            description: '生存5分鐘',
            type: 'survival',
            target: 300,
            reward: { gold: 100 },
            icon: '🏅'
        });

        this.addAchievement('legend', {
            name: '傳奇',
            description: '生存10分鐘',
            type: 'survival',
            target: 600,
            reward: { gold: 250 },
            icon: '👑'
        });

        this.addAchievement('immortal', {
            name: '不朽',
            description: '生存20分鐘',
            type: 'survival',
            target: 1200,
            reward: { gold: 500 },
            icon: '🌟'
        });

        // 連擊類成就
        this.addAchievement('combo_10', {
            name: '連擊新手',
            description: '達成10連擊',
            type: 'combo',
            target: 10,
            reward: { gold: 20 },
            icon: '🔥'
        });

        this.addAchievement('combo_25', {
            name: '連擊高手',
            description: '達成25連擊',
            type: 'combo',
            target: 25,
            reward: { gold: 50 },
            icon: '💥'
        });

        this.addAchievement('combo_50', {
            name: '連擊大師',
            description: '達成50連擊',
            type: 'combo',
            target: 50,
            reward: { gold: 100 },
            icon: '⚡'
        });

        this.addAchievement('combo_100', {
            name: '連擊之神',
            description: '達成100連擊',
            type: 'combo',
            target: 100,
            reward: { gold: 200 },
            icon: '🌪️'
        });

        // 金幣類成就
        this.addAchievement('collector', {
            name: '收集者',
            description: '收集100金幣',
            type: 'gold',
            target: 100,
            reward: { gold: 25 },
            icon: '💰'
        });

        this.addAchievement('rich', {
            name: '富有',
            description: '收集500金幣',
            type: 'gold',
            target: 500,
            reward: { gold: 100 },
            icon: '💎'
        });

        this.addAchievement('wealthy', {
            name: '富豪',
            description: '收集1000金幣',
            type: 'gold',
            target: 1000,
            reward: { gold: 200 },
            icon: '👑'
        });

        this.addAchievement('millionaire', {
            name: '百萬富翁',
            description: '收集5000金幣',
            type: 'gold',
            target: 5000,
            reward: { gold: 500 },
            icon: '🏆'
        });

        // 特殊成就
        this.addAchievement('speed_demon', {
            name: '速度惡魔',
            description: '在2分鐘內擊殺50個敵人',
            type: 'special',
            target: { kills: 50, time: 120 },
            reward: { gold: 100 },
            icon: '🚀'
        });

        this.addAchievement('pacifist', {
            name: '和平主義者',
            description: '生存1分鐘而不攻擊',
            type: 'special',
            target: { survival: 60, attacks: 0 },
            reward: { gold: 150 },
            icon: '🕊️'
        });

        // 白金獎杯
        this.addAchievement('platinum', {
            name: '白金獎杯',
            description: '解鎖所有其他成就',
            type: 'platinum',
            target: this.achievements.size - 1, // 除了自己之外的所有成就
            reward: { gold: 1000 },
            icon: '🏆'
        });
    }

    // 添加成就
    addAchievement(id, data) {
        this.achievements.set(id, {
            id: id,
            unlocked: false,
            progress: 0,
            unlockedAt: null,
            ...data
        });
    }

    // 載入進度
    loadProgress() {
        if (window.gameData) {
            const achievementData = gameData.getAchievements();
            
            for (const [id, data] of Object.entries(achievementData)) {
                if (this.achievements.has(id)) {
                    const achievement = this.achievements.get(id);
                    achievement.unlocked = data.unlocked;
                    achievement.unlockedAt = data.unlockedAt;
                    achievement.progress = data.progress || 0;
                    
                    if (data.unlocked) {
                        this.unlockedAchievements.add(id);
                    }
                }
            }
        }
    }

    // 儲存進度
    saveProgress() {
        if (window.gameData) {
            const achievementData = {};
            
            for (const [id, achievement] of this.achievements) {
                achievementData[id] = {
                    unlocked: achievement.unlocked,
                    unlockedAt: achievement.unlockedAt,
                    progress: achievement.progress
                };
            }
            
            gameData.storage.set('achievements', achievementData);
        }
    }

    // 更新進度
    updateProgress(type, value, additionalData = {}) {
        const newUnlocks = [];
        
        for (const [id, achievement] of this.achievements) {
            if (achievement.unlocked || achievement.type !== type) continue;
            
            let shouldUpdate = false;
            let newProgress = achievement.progress;
            
            switch (type) {
                case 'kills':
                case 'survival':
                case 'combo':
                case 'gold':
                    newProgress = Math.max(newProgress, value);
                    shouldUpdate = true;
                    break;
                    
                case 'special':
                    shouldUpdate = this.checkSpecialAchievement(achievement, value, additionalData);
                    if (shouldUpdate) {
                        newProgress = achievement.target;
                    }
                    break;
            }
            
            if (shouldUpdate) {
                achievement.progress = newProgress;
                
                // 檢查是否達成
                if (this.isAchievementComplete(achievement)) {
                    this.unlockAchievement(id);
                    newUnlocks.push(achievement);
                }
            }
        }
        
        // 檢查白金獎杯
        this.checkPlatinumTrophy();
        
        // 儲存進度
        this.saveProgress();
        
        return newUnlocks;
    }

    // 檢查特殊成就
    checkSpecialAchievement(achievement, value, additionalData) {
        switch (achievement.id) {
            case 'speed_demon':
                return additionalData.kills >= 50 && additionalData.time <= 120;
                
            case 'pacifist':
                return additionalData.survival >= 60 && additionalData.attacks === 0;
                
            default:
                return false;
        }
    }

    // 檢查成就是否完成
    isAchievementComplete(achievement) {
        if (typeof achievement.target === 'number') {
            return achievement.progress >= achievement.target;
        } else if (typeof achievement.target === 'object') {
            // 特殊成就的複雜條件已在 checkSpecialAchievement 中處理
            return achievement.progress >= 1;
        }
        return false;
    }

    // 解鎖成就
    unlockAchievement(id) {
        const achievement = this.achievements.get(id);
        if (!achievement || achievement.unlocked) return false;
        
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        this.unlockedAchievements.add(id);
        
        // 給予獎勵
        this.grantReward(achievement.reward);
        
        // 播放音效
        if (window.audioManager) {
            audioManager.playAchievement();
        }
        
        // 顯示通知
        if (window.uiManager) {
            uiManager.showNotification(
                `成就解鎖: ${achievement.name}`,
                'success',
                5000
            );
        }
        
        // 觸發事件
        this.emit('achievementUnlocked', achievement);
        
        console.log(`🏆 成就解鎖: ${achievement.name}`);
        return true;
    }

    // 檢查白金獎杯
    checkPlatinumTrophy() {
        const platinumAchievement = this.achievements.get('platinum');
        if (!platinumAchievement || platinumAchievement.unlocked) return;
        
        const totalAchievements = this.achievements.size - 1; // 除了白金本身
        const unlockedCount = this.unlockedAchievements.size;
        
        if (unlockedCount >= totalAchievements) {
            this.unlockAchievement('platinum');
        }
    }

    // 給予獎勵
    grantReward(reward) {
        if (!reward) return;
        
        if (reward.gold && window.gameData) {
            gameData.addGold(reward.gold);
            console.log(`獲得金幣獎勵: ${reward.gold}`);
        }
        
        // 可以擴展其他類型的獎勵
    }

    // 獲取成就列表
    getAchievements() {
        return Array.from(this.achievements.values());
    }

    // 獲取已解鎖成就
    getUnlockedAchievements() {
        return this.getAchievements().filter(achievement => achievement.unlocked);
    }

    // 獲取成就進度
    getAchievementProgress(id) {
        const achievement = this.achievements.get(id);
        if (!achievement) return null;
        
        return {
            current: achievement.progress,
            target: achievement.target,
            percentage: typeof achievement.target === 'number' 
                ? (achievement.progress / achievement.target) * 100 
                : achievement.unlocked ? 100 : 0
        };
    }

    // 獲取統計資料
    getStats() {
        const total = this.achievements.size;
        const unlocked = this.unlockedAchievements.size;
        
        return {
            total: total,
            unlocked: unlocked,
            completion: (unlocked / total) * 100,
            platinumUnlocked: this.unlockedAchievements.has('platinum')
        };
    }

    // 重置所有成就
    reset() {
        for (const achievement of this.achievements.values()) {
            achievement.unlocked = false;
            achievement.progress = 0;
            achievement.unlockedAt = null;
        }
        
        this.unlockedAchievements.clear();
        this.saveProgress();
    }

    // 事件監聽
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    // 觸發事件
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                callback(data);
            });
        }
    }

    // 便捷方法
    onKill(totalKills) {
        return this.updateProgress('kills', totalKills);
    }

    onSurvival(survivalTime) {
        return this.updateProgress('survival', survivalTime);
    }

    onCombo(comboCount) {
        return this.updateProgress('combo', comboCount);
    }

    onGoldCollected(totalGold) {
        return this.updateProgress('gold', totalGold);
    }

    onSpecialEvent(eventData) {
        return this.updateProgress('special', 1, eventData);
    }
}

// 全域成就系統
const achievementSystem = new AchievementSystem();