/**
 * 商店系統
 * 管理遊戲中的商店功能，包括物品購買、升級等
 */
class ShopSystem {
    constructor() {
        // 商店物品
        this.items = new Map();
        this.categories = new Map();
        
        // 購買記錄
        this.purchaseHistory = [];
        
        // 事件監聽器
        this.listeners = new Map();
        
        this.initializeShop();
    }
    
    // 初始化商店
    initializeShop() {
        this.setupCategories();
        this.setupItems();
        this.loadPurchaseHistory();
    }
    
    // 設定商店類別
    setupCategories() {
        this.categories.set('weapons', {
            name: '武器',
            icon: '⚔️',
            description: '提升攻擊力和法術威力'
        });
        
        this.categories.set('armor', {
            name: '防具',
            icon: '🛡️',
            description: '增加防禦力和生命值'
        });
        
        this.categories.set('accessories', {
            name: '飾品',
            icon: '💍',
            description: '特殊效果和屬性加成'
        });
        
        this.categories.set('consumables', {
            name: '消耗品',
            icon: '🧪',
            description: '一次性使用的增益道具'
        });
    }
    
    // 設定商店物品
    setupItems() {
        // 武器類
        this.addItem('basic_wand', {
            name: '基礎法杖',
            category: 'weapons',
            type: 'weapon',
            rarity: 'common',
            price: 50,
            stats: {
                attack: 5,
                magicPower: 10
            },
            description: '一把簡單的法杖，適合新手使用',
            icon: '🪄',
            unlocked: true
        });
        
        this.addItem('fire_wand', {
            name: '火焰法杖',
            category: 'weapons',
            type: 'weapon',
            rarity: 'uncommon',
            price: 150,
            stats: {
                attack: 8,
                magicPower: 15,
                fireBonus: 20
            },
            description: '增強火系法術威力',
            icon: '🔥',
            unlocked: false,
            unlockRequirement: { totalKills: 50 }
        });
        
        this.addItem('ice_wand', {
            name: '冰霜法杖',
            category: 'weapons',
            type: 'weapon',
            rarity: 'uncommon',
            price: 150,
            stats: {
                attack: 8,
                magicPower: 15,
                iceBonus: 20
            },
            description: '增強冰系法術威力',
            icon: '❄️',
            unlocked: false,
            unlockRequirement: { totalKills: 50 }
        });
        
        // 防具類
        this.addItem('cloth_robe', {
            name: '布袍',
            category: 'armor',
            type: 'armor',
            rarity: 'common',
            price: 40,
            stats: {
                defense: 3,
                maxHealth: 20
            },
            description: '基本的法師袍',
            icon: '👘',
            unlocked: true
        });
        
        this.addItem('magic_robe', {
            name: '魔法袍',
            category: 'armor',
            type: 'armor',
            rarity: 'uncommon',
            price: 120,
            stats: {
                defense: 5,
                maxHealth: 35,
                magicPower: 8
            },
            description: '注入魔力的法袍',
            icon: '🧙',
            unlocked: false,
            unlockRequirement: { totalKills: 30 }
        });
        
        // 飾品類
        this.addItem('health_ring', {
            name: '生命戒指',
            category: 'accessories',
            type: 'accessory',
            rarity: 'common',
            price: 80,
            stats: {
                maxHealth: 50,
                healthRegen: 1
            },
            description: '增加生命值和恢復能力',
            icon: '💚',
            unlocked: true
        });
        
        this.addItem('speed_boots', {
            name: '疾速靴',
            category: 'accessories',
            type: 'accessory',
            rarity: 'uncommon',
            price: 100,
            stats: {
                movementSpeed: 20
            },
            description: '增加移動速度',
            icon: '👟',
            unlocked: false,
            unlockRequirement: { bestSurvivalTime: 300 }
        });
        
        // 消耗品類
        this.addItem('health_potion', {
            name: '生命藥水',
            category: 'consumables',
            type: 'consumable',
            rarity: 'common',
            price: 10,
            effect: {
                type: 'heal',
                value: 50
            },
            description: '立即恢復50點生命值',
            icon: '🧪',
            unlocked: true,
            stackable: true,
            maxStack: 5
        });
        
        this.addItem('mana_potion', {
            name: '魔力藥水',
            category: 'consumables',
            type: 'consumable',
            rarity: 'common',
            price: 10,
            effect: {
                type: 'mana',
                value: 50
            },
            description: '立即恢復50點魔力值',
            icon: '🔮',
            unlocked: true,
            stackable: true,
            maxStack: 5
        });
    }
    
    // 添加物品到商店
    addItem(id, itemData) {
        this.items.set(id, {
            id: id,
            owned: false,
            level: 0,
            quantity: 0,
            ...itemData
        });
    }
    
    // 載入購買記錄
    loadPurchaseHistory() {
        if (window.gameData) {
            const shopData = gameData.getShopData();
            
            // 載入已購買的物品
            for (const [itemId, data] of Object.entries(shopData.purchasedItems || {})) {
                if (this.items.has(itemId)) {
                    const item = this.items.get(itemId);
                    item.owned = true;
                    item.level = data.level || 1;
                    item.quantity = data.quantity || 1;
                }
            }
            
            // 載入購買記錄
            this.purchaseHistory = shopData.purchaseHistory || [];
        }
    }
    
    // 儲存購買記錄
    savePurchaseHistory() {
        if (window.gameData) {
            const purchasedItems = {};
            
            for (const [itemId, item] of this.items) {
                if (item.owned) {
                    purchasedItems[itemId] = {
                        level: item.level,
                        quantity: item.quantity
                    };
                }
            }
            
            gameData.setShopData({
                purchasedItems: purchasedItems,
                purchaseHistory: this.purchaseHistory
            });
        }
    }
    
    // 獲取商店物品（按類別）
    getItemsByCategory(category) {
        const items = [];
        
        for (const item of this.items.values()) {
            if (item.category === category) {
                items.push(item);
            }
        }
        
        return items.sort((a, b) => a.price - b.price);
    }
    
    // 獲取所有可用物品
    getAvailableItems() {
        const items = [];
        
        for (const item of this.items.values()) {
            if (this.isItemUnlocked(item)) {
                items.push(item);
            }
        }
        
        return items;
    }
    
    // 檢查物品是否解鎖
    isItemUnlocked(item) {
        if (item.unlocked) return true;
        if (!item.unlockRequirement) return true;
        
        if (window.gameData) {
            const playerStats = gameData.getPlayerStats();
            const requirement = item.unlockRequirement;
            
            // 檢查解鎖條件
            for (const [key, value] of Object.entries(requirement)) {
                if ((playerStats[key] || 0) < value) {
                    return false;
                }
            }
            
            return true;
        }
        
        return false;
    }
    
    // 購買物品
    purchaseItem(itemId, quantity = 1) {
        const item = this.items.get(itemId);
        if (!item) {
            return { success: false, message: '物品不存在' };
        }
        
        if (!this.isItemUnlocked(item)) {
            return { success: false, message: '物品未解鎖' };
        }
        
        if (!window.gameData) {
            return { success: false, message: 'システムエラー - SYSTEM ERROR' };
        }
        
        const totalCost = item.price * quantity;
        const currentGold = gameData.getGold();
        
        if (currentGold < totalCost) {
            return { success: false, message: 'エネルギーユニット不足' };
        }
        
        // 檢查是否為消耗品且有堆疊限制
        if (item.stackable && item.maxStack) {
            if (item.quantity + quantity > item.maxStack) {
                return { success: false, message: 'スタック上限達成 - STACK LIMIT REACHED' };
            }
        }
        
        // 扣除金幣
        gameData.spendGold(totalCost);
        
        // 添加物品
        if (item.stackable) {
            item.quantity += quantity;
        } else {
            item.owned = true;
            item.level = item.level || 1;
        }
        
        // 記錄購買
        this.purchaseHistory.push({
            itemId: itemId,
            quantity: quantity,
            cost: totalCost,
            timestamp: Date.now()
        });
        
        // 觸發事件
        this.emit('itemPurchased', {
            item: item,
            quantity: quantity,
            cost: totalCost
        });
        
        // 儲存數據
        this.savePurchaseHistory();
        
        return { success: true, message: '裝備取得完了 - EQUIPMENT ACQUIRED' };
    }
    
    // 升級物品
    upgradeItem(itemId) {
        const item = this.items.get(itemId);
        if (!item || !item.owned) {
            return { success: false, message: '物品未擁有' };
        }
        
        if (item.type === 'consumable') {
            return { success: false, message: '消耗品無法升級' };
        }
        
        const currentLevel = item.level || 1;
        const upgradeCost = this.getUpgradeCost(item, currentLevel);
        
        if (!window.gameData) {
            return { success: false, message: 'システムエラー - SYSTEM ERROR' };
        }
        
        const currentGold = gameData.getGold();
        if (currentGold < upgradeCost) {
            return { success: false, message: 'エネルギーユニット不足' };
        }
        
        // 扣除金幣
        gameData.spendGold(upgradeCost);
        
        // 升級物品
        item.level = currentLevel + 1;
        
        // 觸發事件
        this.emit('itemUpgraded', {
            item: item,
            newLevel: item.level,
            cost: upgradeCost
        });
        
        // 儲存數據
        this.savePurchaseHistory();
        
        return { success: true, message: 'アップグレード完了 - UPGRADE COMPLETE' };
    }
    
    // 計算升級成本
    getUpgradeCost(item, currentLevel) {
        const baseCost = item.price;
        return Math.floor(baseCost * 0.5 * currentLevel);
    }
    
    // 使用消耗品
    useConsumable(itemId) {
        const item = this.items.get(itemId);
        if (!item || !item.owned || item.type !== 'consumable') {
            return { success: false, message: 'アイテム使用不可 - ITEM UNUSABLE' };
        }
        
        if (item.quantity <= 0) {
            return { success: false, message: 'アイテム不足 - INSUFFICIENT ITEMS' };
        }
        
        // 減少數量
        item.quantity--;
        
        if (item.quantity <= 0) {
            item.owned = false;
        }
        
        // 觸發事件
        this.emit('consumableUsed', {
            item: item,
            effect: item.effect
        });
        
        // 儲存數據
        this.savePurchaseHistory();
        
        return { 
            success: true, 
            message: 'アイテム消費完了 - ITEM CONSUMED',
            effect: item.effect 
        };
    }
    
    // 獲取物品的有效屬性（考慮等級加成）
    getItemStats(itemId) {
        const item = this.items.get(itemId);
        if (!item || !item.owned) return {};
        
        const stats = { ...item.stats };
        const level = item.level || 1;
        
        // 計算等級加成
        if (level > 1) {
            const levelBonus = (level - 1) * 0.1; // 每級增加10%
            
            for (const [stat, value] of Object.entries(stats)) {
                stats[stat] = Math.floor(value * (1 + levelBonus));
            }
        }
        
        return stats;
    }
    
    // 獲取玩家所有裝備的總屬性
    getTotalStats() {
        const totalStats = {};
        
        for (const item of this.items.values()) {
            if (item.owned && item.type !== 'consumable') {
                const itemStats = this.getItemStats(item.id);
                
                for (const [stat, value] of Object.entries(itemStats)) {
                    totalStats[stat] = (totalStats[stat] || 0) + value;
                }
            }
        }
        
        return totalStats;
    }
    
    // 重置商店
    reset() {
        for (const item of this.items.values()) {
            item.owned = false;
            item.level = 0;
            item.quantity = 0;
        }
        
        this.purchaseHistory = [];
        this.savePurchaseHistory();
    }
    
    // 刷新商店
    refresh() {
        this.loadPurchaseHistory();
        
        // 檢查新解鎖的物品
        const newUnlocks = [];
        for (const item of this.items.values()) {
            if (!item.unlocked && this.isItemUnlocked(item)) {
                item.unlocked = true;
                newUnlocks.push(item);
            }
        }
        
        if (newUnlocks.length > 0) {
            this.emit('itemsUnlocked', newUnlocks);
        }
        
        console.log('商店已刷新');
    }
    
    // 獲取統計資料
    getStats() {
        const totalItems = this.items.size;
        const ownedItems = Array.from(this.items.values()).filter(item => item.owned).length;
        const totalSpent = this.purchaseHistory.reduce((sum, purchase) => sum + purchase.cost, 0);
        
        return {
            totalItems: totalItems,
            ownedItems: ownedItems,
            totalSpent: totalSpent,
            purchaseCount: this.purchaseHistory.length
        };
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
}

// 全域商店系統
const shopSystem = new ShopSystem();