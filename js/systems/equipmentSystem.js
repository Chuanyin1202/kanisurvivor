/**
 * 模組系統 - MODULE SYSTEM
 * 管理同步體的模組配置和屬性加成
 */
class EquipmentSystem {
    constructor() {
        // 模組槽位
        this.equipmentSlots = new Map();
        
        // 當前配置
        this.equipped = new Map();
        
        // 模組庫存
        this.inventory = new Map();
        
        // 事件監聽器
        this.listeners = new Map();
        
        this.initializeSlots();
    }
    
    // 初始化模組槽位
    initializeSlots() {
        // 定義模組槽位
        this.equipmentSlots.set('weapon', {
            name: '語式模組',
            type: 'weapon',
            icon: '⚡',
            required: true
        });
        
        this.equipmentSlots.set('armor', {
            name: '防護框架',
            type: 'armor',
            icon: '🛡️',
            required: false
        });
        
        this.equipmentSlots.set('accessory1', {
            name: '共鳴器件1',
            type: 'accessory',
            icon: '💎',
            required: false
        });
        
        this.equipmentSlots.set('accessory2', {
            name: '共鳴器件2',
            type: 'accessory',
            icon: '💎',
            required: false
        });
        
        // 初始化空槽位
        for (const slotId of this.equipmentSlots.keys()) {
            this.equipped.set(slotId, null);
        }
    }
    
    // 裝備物品
    equipItem(itemId, slotId = null) {
        // 從商店系統獲取物品資訊
        if (!window.shopSystem) {
            return { success: false, message: '商店系統未初始化' };
        }
        
        const item = shopSystem.items.get(itemId);
        if (!item) {
            return { success: false, message: '物品不存在' };
        }
        
        if (!item.owned) {
            return { success: false, message: '物品未擁有' };
        }
        
        // 自動選擇槽位
        if (!slotId) {
            slotId = this.findSuitableSlot(item);
            if (!slotId) {
                return { success: false, message: '沒有合適的槽位' };
            }
        }
        
        // 檢查槽位是否存在
        if (!this.equipmentSlots.has(slotId)) {
            return { success: false, message: '槽位不存在' };
        }
        
        // 檢查物品類型是否匹配槽位
        const slot = this.equipmentSlots.get(slotId);
        if (slot.type !== item.type) {
            return { success: false, message: '物品類型不匹配' };
        }
        
        // 卸下當前裝備
        const previousItem = this.equipped.get(slotId);
        if (previousItem) {
            this.unequipItem(slotId, false); // 不觸發事件，避免重複
        }
        
        // 裝備新物品
        this.equipped.set(slotId, itemId);
        
        // 觸發事件
        this.emit('itemEquipped', {
            itemId: itemId,
            slotId: slotId,
            previousItem: previousItem
        });
        
        console.log(`已裝備: ${item.name} 到 ${slot.name}`);
        return { success: true, message: '裝備成功' };
    }
    
    // 卸下物品
    unequipItem(slotId, triggerEvent = true) {
        if (!this.equipmentSlots.has(slotId)) {
            return { success: false, message: '槽位不存在' };
        }
        
        const itemId = this.equipped.get(slotId);
        if (!itemId) {
            return { success: false, message: '槽位為空' };
        }
        
        // 卸下物品
        this.equipped.set(slotId, null);
        
        // 觸發事件
        if (triggerEvent) {
            this.emit('itemUnequipped', {
                itemId: itemId,
                slotId: slotId
            });
        }
        
        const slot = this.equipmentSlots.get(slotId);
        console.log(`已卸下: ${slotId} 的物品`);
        return { success: true, message: '卸下成功' };
    }
    
    // 尋找合適的槽位
    findSuitableSlot(item) {
        // 優先找到空槽位
        for (const [slotId, slot] of this.equipmentSlots) {
            if (slot.type === item.type && !this.equipped.get(slotId)) {
                return slotId;
            }
        }
        
        // 沒有空槽位時，找第一個匹配的槽位
        for (const [slotId, slot] of this.equipmentSlots) {
            if (slot.type === item.type) {
                return slotId;
            }
        }
        
        return null;
    }
    
    // 獲取當前裝備
    getEquippedItem(slotId) {
        const itemId = this.equipped.get(slotId);
        if (!itemId || !window.shopSystem) return null;
        
        return shopSystem.items.get(itemId);
    }
    
    // 獲取所有裝備
    getAllEquipped() {
        const equipped = {};
        
        for (const [slotId, itemId] of this.equipped) {
            if (itemId && window.shopSystem) {
                equipped[slotId] = shopSystem.items.get(itemId);
            }
        }
        
        return equipped;
    }
    
    // 計算總屬性
    getTotalStats() {
        const totalStats = {};
        
        if (!window.shopSystem) return totalStats;
        
        for (const [slotId, itemId] of this.equipped) {
            if (itemId) {
                const itemStats = shopSystem.getItemStats(itemId);
                
                for (const [stat, value] of Object.entries(itemStats)) {
                    totalStats[stat] = (totalStats[stat] || 0) + value;
                }
            }
        }
        
        return totalStats;
    }
    
    // 獲取裝備等級
    getEquipmentLevel() {
        let totalLevel = 0;
        let equippedCount = 0;
        
        if (!window.shopSystem) return 0;
        
        for (const [slotId, itemId] of this.equipped) {
            if (itemId) {
                const item = shopSystem.items.get(itemId);
                if (item) {
                    totalLevel += item.level || 1;
                    equippedCount++;
                }
            }
        }
        
        return equippedCount > 0 ? Math.floor(totalLevel / equippedCount) : 0;
    }
    
    // 檢查套裝效果
    getSetBonuses() {
        const setBonuses = {};
        const setCounts = {};
        
        if (!window.shopSystem) return setBonuses;
        
        // 計算每個套裝的裝備數量
        for (const [slotId, itemId] of this.equipped) {
            if (itemId) {
                const item = shopSystem.items.get(itemId);
                if (item && item.setId) {
                    setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
                }
            }
        }
        
        // 計算套裝效果
        for (const [setId, count] of Object.entries(setCounts)) {
            const setData = this.getSetData(setId);
            if (setData) {
                for (const [requiredCount, bonus] of Object.entries(setData.bonuses)) {
                    if (count >= parseInt(requiredCount)) {
                        setBonuses[setId] = bonus;
                    }
                }
            }
        }
        
        return setBonuses;
    }
    
    // 獲取套裝資料
    getSetData(setId) {
        // 這裡可以擴展套裝資料
        const setData = {
            'fire_set': {
                name: '火焰套裝',
                bonuses: {
                    2: { fireBonus: 25 },
                    3: { fireBonus: 50, magicPower: 20 }
                }
            },
            'ice_set': {
                name: '冰霜套裝',
                bonuses: {
                    2: { iceBonus: 25 },
                    3: { iceBonus: 50, magicPower: 20 }
                }
            },
            'defense_set': {
                name: '防禦套裝',
                bonuses: {
                    2: { defense: 10 },
                    3: { defense: 20, maxHealth: 100 }
                }
            }
        };
        
        return setData[setId] || null;
    }
    
    // 獲取推薦裝備
    getRecommendedEquipment() {
        const recommendations = [];
        
        if (!window.shopSystem) return recommendations;
        
        // 檢查每個槽位的推薦裝備
        for (const [slotId, slot] of this.equipmentSlots) {
            const currentItem = this.getEquippedItem(slotId);
            const availableItems = shopSystem.getItemsByCategory(
                slot.type === 'weapon' ? 'weapons' : 
                slot.type === 'armor' ? 'armor' : 'accessories'
            );
            
            // 找到最佳可用物品
            let bestItem = null;
            let bestScore = currentItem ? this.getItemScore(currentItem) : 0;
            
            for (const item of availableItems) {
                if (item.owned && this.getItemScore(item) > bestScore) {
                    bestItem = item;
                    bestScore = this.getItemScore(item);
                }
            }
            
            if (bestItem && bestItem.id !== currentItem?.id) {
                recommendations.push({
                    slotId: slotId,
                    item: bestItem,
                    reason: '更高的整體屬性'
                });
            }
        }
        
        return recommendations;
    }
    
    // 計算物品評分
    getItemScore(item) {
        if (!item || !window.shopSystem) return 0;
        
        const stats = shopSystem.getItemStats(item.id);
        let score = 0;
        
        // 根據屬性計算評分
        const statWeights = {
            attack: 2,
            magicPower: 2,
            defense: 1.5,
            maxHealth: 0.1,
            movementSpeed: 1,
            critChance: 3,
            critDamage: 2
        };
        
        for (const [stat, value] of Object.entries(stats)) {
            const weight = statWeights[stat] || 1;
            score += value * weight;
        }
        
        // 稀有度加成
        const rarityBonus = {
            common: 0,
            uncommon: 10,
            rare: 25,
            epic: 50,
            legendary: 100
        };
        
        score += rarityBonus[item.rarity] || 0;
        
        return score;
    }
    
    // 自動裝備最佳物品
    autoEquipBest() {
        const recommendations = this.getRecommendedEquipment();
        let equipped = 0;
        
        for (const rec of recommendations) {
            const result = this.equipItem(rec.item.id, rec.slotId);
            if (result.success) {
                equipped++;
            }
        }
        
        return {
            success: equipped > 0,
            message: `自動裝備了 ${equipped} 件物品`
        };
    }
    
    // 獲取裝備統計
    getStats() {
        const totalStats = this.getTotalStats();
        const equippedCount = Array.from(this.equipped.values()).filter(id => id !== null).length;
        const totalSlots = this.equipmentSlots.size;
        
        return {
            totalSlots: totalSlots,
            equippedCount: equippedCount,
            emptySlots: totalSlots - equippedCount,
            totalStats: totalStats,
            equipmentLevel: this.getEquipmentLevel(),
            setBonuses: this.getSetBonuses()
        };
    }
    
    // 獲取裝備資訊
    getEquipmentInfo() {
        const info = {
            slots: {},
            stats: this.getTotalStats(),
            setBonuses: this.getSetBonuses()
        };
        
        for (const [slotId, slot] of this.equipmentSlots) {
            const equippedItem = this.getEquippedItem(slotId);
            
            info.slots[slotId] = {
                name: slot.name,
                type: slot.type,
                icon: slot.icon,
                item: equippedItem,
                isEmpty: !equippedItem
            };
        }
        
        return info;
    }
    
    // 重置裝備
    reset() {
        for (const slotId of this.equipmentSlots.keys()) {
            this.equipped.set(slotId, null);
        }
        
        this.emit('equipmentReset');
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

// 全域裝備系統
const equipmentSystem = new EquipmentSystem();