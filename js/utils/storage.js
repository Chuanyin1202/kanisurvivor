/**
 * 本地儲存管理系統
 * 用於管理玩家進度、設定、成就等持久化資料
 */
class StorageManager {
    constructor(keyPrefix = 'kani_survivor_') {
        this.keyPrefix = keyPrefix;
        this.cache = new Map();
        this.isSupported = this.checkSupport();
    }

    // 檢查瀏覽器是否支援 localStorage
    checkSupport() {
        try {
            const test = 'localStorage_test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage not supported');
            return false;
        }
    }

    // 生成完整的儲存鍵名
    getKey(key) {
        return this.keyPrefix + key;
    }

    // 儲存資料
    set(key, value) {
        const fullKey = this.getKey(key);
        const jsonValue = JSON.stringify(value);
        
        try {
            if (this.isSupported) {
                localStorage.setItem(fullKey, jsonValue);
            }
            this.cache.set(key, value);
            return true;
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            return false;
        }
    }

    // 讀取資料
    get(key, defaultValue = null) {
        // 先檢查快取
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const fullKey = this.getKey(key);
        
        try {
            if (this.isSupported) {
                const item = localStorage.getItem(fullKey);
                if (item !== null) {
                    const value = JSON.parse(item);
                    this.cache.set(key, value);
                    return value;
                }
            }
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
        }

        return defaultValue;
    }

    // 刪除資料
    remove(key) {
        const fullKey = this.getKey(key);
        
        try {
            if (this.isSupported) {
                localStorage.removeItem(fullKey);
            }
            this.cache.delete(key);
            return true;
        } catch (e) {
            console.error('Failed to remove from localStorage:', e);
            return false;
        }
    }

    // 檢查是否存在
    has(key) {
        if (this.cache.has(key)) {
            return true;
        }

        const fullKey = this.getKey(key);
        return this.isSupported && localStorage.getItem(fullKey) !== null;
    }

    // 清除所有資料
    clear() {
        try {
            if (this.isSupported) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.keyPrefix)) {
                        localStorage.removeItem(key);
                    }
                });
            }
            this.cache.clear();
            return true;
        } catch (e) {
            console.error('Failed to clear localStorage:', e);
            return false;
        }
    }

    // 獲取所有鍵名
    getKeys() {
        const keys = [];
        
        if (this.isSupported) {
            const storageKeys = Object.keys(localStorage);
            storageKeys.forEach(key => {
                if (key.startsWith(this.keyPrefix)) {
                    keys.push(key.replace(this.keyPrefix, ''));
                }
            });
        }

        return keys;
    }

    // 載入所有資料到快取
    loadAll() {
        const keys = this.getKeys();
        keys.forEach(key => {
            this.get(key); // 這會自動載入到快取
        });
    }

    // 儲存快取中的所有資料
    saveAll() {
        for (const [key, value] of this.cache) {
            this.set(key, value);
        }
    }

    // 獲取儲存使用量（概估）
    getUsage() {
        if (!this.isSupported) return 0;
        
        let totalSize = 0;
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.keyPrefix)) {
                totalSize += localStorage.getItem(key).length;
            }
        });
        
        return totalSize;
    }
}

/**
 * 遊戲資料管理器
 * 專門用於管理遊戲相關的持久化資料
 */
class GameDataManager {
    constructor() {
        this.storage = new StorageManager();
        this.defaultData = {
            playerStats: {
                totalKills: 0,
                totalPlayTime: 0,
                bestSurvivalTime: 0,
                gamesPlayed: 0,
                highestLevel: 1,
                totalGoldEarned: 0
            },
            currentGold: 0,
            unlockedEquipment: [],
            purchasedEquipment: [],
            equippedItems: {
                weapon: null,
                armor: null,
                accessory: null
            },
            achievements: {},
            settings: {
                soundVolume: 1.0,
                musicVolume: 0.7,
                showDamageNumbers: true,
                showFPS: false,
                graphics: 'medium'
            }
        };
    }

    // 初始化遊戲資料
    initialize() {
        this.storage.loadAll();
        
        // 確保所有預設資料都存在
        for (const [key, value] of Object.entries(this.defaultData)) {
            if (!this.storage.has(key)) {
                this.storage.set(key, value);
            }
        }
    }

    // 獲取玩家統計資料
    getPlayerStats() {
        return this.storage.get('playerStats', this.defaultData.playerStats);
    }

    // 更新玩家統計資料
    updatePlayerStats(stats) {
        const currentStats = this.getPlayerStats();
        const updatedStats = { ...currentStats, ...stats };
        this.storage.set('playerStats', updatedStats);
    }

    // 獲取當前金幣
    getGold() {
        return this.storage.get('currentGold', 0);
    }

    // 設定金幣
    setGold(amount) {
        this.storage.set('currentGold', Math.max(0, amount));
    }

    // 增加金幣
    addGold(amount) {
        const currentGold = this.getGold();
        this.setGold(currentGold + amount);
    }

    // 消費金幣
    spendGold(amount) {
        const currentGold = this.getGold();
        if (currentGold >= amount) {
            this.setGold(currentGold - amount);
            return true;
        }
        return false;
    }

    // 獲取已解鎖裝備
    getUnlockedEquipment() {
        return this.storage.get('unlockedEquipment', []);
    }

    // 解鎖裝備
    unlockEquipment(equipmentId) {
        const unlocked = this.getUnlockedEquipment();
        if (!unlocked.includes(equipmentId)) {
            unlocked.push(equipmentId);
            this.storage.set('unlockedEquipment', unlocked);
        }
    }

    // 獲取已購買裝備
    getPurchasedEquipment() {
        return this.storage.get('purchasedEquipment', []);
    }

    // 購買裝備
    purchaseEquipment(equipmentId, cost) {
        if (this.spendGold(cost)) {
            const purchased = this.getPurchasedEquipment();
            if (!purchased.includes(equipmentId)) {
                purchased.push(equipmentId);
                this.storage.set('purchasedEquipment', purchased);
            }
            return true;
        }
        return false;
    }

    // 獲取已裝備物品
    getEquippedItems() {
        return this.storage.get('equippedItems', this.defaultData.equippedItems);
    }

    // 裝備物品
    equipItem(slot, itemId) {
        const equipped = this.getEquippedItems();
        equipped[slot] = itemId;
        this.storage.set('equippedItems', equipped);
    }

    // 獲取成就資料
    getAchievements() {
        return this.storage.get('achievements', {});
    }

    // 解鎖成就
    unlockAchievement(achievementId) {
        const achievements = this.getAchievements();
        if (!achievements[achievementId]) {
            achievements[achievementId] = {
                unlocked: true,
                unlockedAt: Date.now()
            };
            this.storage.set('achievements', achievements);
            return true;
        }
        return false;
    }

    // 獲取商店資料
    getShopData() {
        return this.storage.get('shopData', {
            purchasedItems: {},
            purchaseHistory: []
        });
    }

    // 設定商店資料
    setShopData(shopData) {
        this.storage.set('shopData', shopData);
    }

    // 獲取設定
    getSettings() {
        return this.storage.get('settings', this.defaultData.settings);
    }

    // 更新設定
    updateSettings(newSettings) {
        const currentSettings = this.getSettings();
        const updatedSettings = { ...currentSettings, ...newSettings };
        this.storage.set('settings', updatedSettings);
    }

    // 重置遊戲資料
    reset() {
        this.storage.clear();
        this.initialize();
    }

    // 匯出資料
    exportData() {
        const data = {};
        for (const key of Object.keys(this.defaultData)) {
            data[key] = this.storage.get(key);
        }
        return JSON.stringify(data);
    }

    // 匯入資料
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            for (const [key, value] of Object.entries(data)) {
                if (this.defaultData.hasOwnProperty(key)) {
                    this.storage.set(key, value);
                }
            }
            return true;
        } catch (e) {
            console.error('Failed to import data:', e);
            return false;
        }
    }
}

// 全域遊戲資料管理器實例
const gameData = new GameDataManager();