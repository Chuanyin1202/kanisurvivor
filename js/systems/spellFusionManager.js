/**
 * 元素法術合成管理器
 * 管理元素組合、技能生成和屬性計算
 */
class SpellFusionManager {
    constructor() {
        this.skillTemplates = null;
        this.fusionTable = null;
        this.elementEffects = null;
        this.playerSpells = []; // 玩家已購買的合成法術
        this.equippedSpells = [null, null, null, null]; // 4個技能槽位
        
        this.isLoaded = false;
        this.loadData();
        
        console.log('🧙‍♂️ SpellFusionManager 初始化完成');
    }
    
    // 載入合成系統資料
    async loadData() {
        try {
            // 載入技能模板
            const templatesResponse = await fetch('assets/data/SkillTemplates.json');
            this.skillTemplates = await templatesResponse.json();
            
            // 載入合成表
            const fusionResponse = await fetch('assets/data/SpellFusionTable_20.json');
            this.fusionTable = await fusionResponse.json();
            
            // 載入元素效果表
            const effectsResponse = await fetch('assets/data/ElementEffectsTable.json');
            this.elementEffects = await effectsResponse.json();
            
            this.isLoaded = true;
            console.log('✅ 法術合成系統資料載入完成');
            console.log(`📚 技能模板: ${this.skillTemplates.skills.length} 種`);
            console.log(`🔗 合成組合: ${Object.keys(this.fusionTable).length} 種`);
            
        } catch (error) {
            console.error('❌ 法術合成系統載入失敗:', error);
            this.isLoaded = false;
        }
        
        // 載入保存的進度
        this.loadProgress();
    }
    
    // 根據元素組合獲取合成結果
    getFusionResult(elements) {
        if (!this.isLoaded) {
            console.warn('⚠️ 法術合成系統尚未載入完成');
            return null;
        }
        
        // 標準化元素組合順序（確保F+I = I+F）
        const sortedElements = elements.sort();
        const fusionKey = sortedElements.join('+');
        
        // 在合成表中查找匹配的組合
        for (const [key, fusionData] of Object.entries(this.fusionTable)) {
            const keyElements = key.split('_')[0].split('+').sort();
            if (keyElements.join('+') === fusionKey) {
                return fusionData;
            }
        }
        
        console.warn(`⚠️ 找不到元素組合: ${fusionKey}`);
        return null;
    }
    
    // 計算元素等級對技能屬性的影響
    computeStatsFromElement(baseStats, elementCombo, levelCombo) {
        if (!this.isLoaded || !this.elementEffects) {
            return baseStats;
        }
        
        let computed = { ...baseStats };
        const levelSum = Object.values(levelCombo).reduce((a, b) => a + b, 0);
        
        for (const [elem, level] of Object.entries(levelCombo)) {
            const effect = this.elementEffects[elem];
            if (!effect || level <= 0) continue;
            
            // 傷害加成
            if (effect.damage && computed.damage) {
                computed.damage = Math.round(computed.damage * (1 + (effect.damage - 1) * level));
            }
            
            // 連鎖效果
            if (effect.chain) {
                computed.chain = (computed.chain || 0) + effect.chain * level;
            }
            
            // 冷卻時間縮減
            if (effect.cooldownReduction && computed.cooldown) {
                computed.cooldown = Math.max(0.3, computed.cooldown * (1 - effect.cooldownReduction * level));
            }
            
            // 範圍效果
            if (effect.aoeMultiplier && computed.aoe) {
                computed.aoe = Math.round(computed.aoe * (1 + effect.aoeMultiplier * level));
            }
            
            // 布林屬性
            const booleanEffects = ['ignite', 'stun', 'tracking', 'piercing'];
            booleanEffects.forEach(key => {
                if (effect[key]) {
                    computed[key] = true;
                }
            });
            
            // 持續時間效果
            const durationEffects = ['burnDuration', 'slowDuration', 'stunDuration'];
            durationEffects.forEach(key => {
                if (effect[key]) {
                    computed[key] = effect[key] * level;
                }
            });
            
            // 減速效果
            if (effect.slow) {
                computed.slow = Math.min(0.8, effect.slow * level);
            }
            
            // 追蹤速度加成
            if (effect.projectileSpeedBoost && computed.speed) {
                computed.speed = Math.round(computed.speed * effect.projectileSpeedBoost);
            }
        }
        
        return computed;
    }
    
    // 完整的法術合成函數
    fuseSpell(elements, levels) {
        if (!this.isLoaded) {
            console.warn('⚠️ 法術合成系統尚未載入完成');
            return null;
        }
        
        // 獲取合成結果
        const fusionResult = this.getFusionResult(elements);
        if (!fusionResult) {
            return null;
        }
        
        // 計算最終屬性
        const computedStats = this.computeStatsFromElement(
            fusionResult.baseStats,
            elements,
            levels
        );
        
        // 創建完整的法術物件
        const spell = {
            id: `fused_${elements.join('')}_${Object.values(levels).join('')}`,
            name: fusionResult.name,
            description: fusionResult.description,
            visual: fusionResult.template,
            baseStats: fusionResult.baseStats,
            computedStats: computedStats,
            elementCombo: elements,
            elementLevels: levels,
            type: 'fused',
            cost: this.calculateSpellCost(computedStats, levels)
        };
        
        console.log(`✨ 合成法術: ${spell.name}`, spell.computedStats);
        return spell;
    }
    
    // 計算法術購買成本
    calculateSpellCost(stats, levels) {
        const baseCost = 100;
        const levelSum = Object.values(levels).reduce((a, b) => a + b, 0);
        const statMultiplier = (stats.damage || 10) / 10;
        
        return Math.round(baseCost * (1 + levelSum * 0.5) * statMultiplier);
    }
    
    // 購買法術
    purchaseSpell(spell, playerGold) {
        if (playerGold < spell.cost) {
            console.log('💰 金幣不足，無法購買法術');
            return false;
        }
        
        // 檢查是否已經擁有相同法術
        const existingSpell = this.playerSpells.find(s => s.id === spell.id);
        if (existingSpell) {
            console.log('⚠️ 已經擁有相同的法術');
            return false;
        }
        
        this.playerSpells.push(spell);
        console.log(`✅ 購買法術成功: ${spell.name} (-${spell.cost} 金幣)`);
        return true;
    }
    
    // 裝備法術到指定槽位
    equipSpell(slotIndex, spellId) {
        if (slotIndex < 0 || slotIndex >= 4) {
            console.error('❌ 技能槽位索引無效:', slotIndex);
            return false;
        }
        
        const spell = this.playerSpells.find(s => s.id === spellId);
        if (!spell) {
            console.error('❌ 找不到指定的法術:', spellId);
            return false;
        }
        
        this.equippedSpells[slotIndex] = spell;
        console.log(`⚔️ 法術已裝備到槽位 ${slotIndex + 1}: ${spell.name}`);
        return true;
    }
    
    // 卸下指定槽位的法術
    unequipSpell(slotIndex) {
        if (slotIndex < 0 || slotIndex >= 4) {
            console.error('❌ 技能槽位索引無效:', slotIndex);
            return false;
        }
        
        const spell = this.equippedSpells[slotIndex];
        if (spell) {
            console.log(`🗑️ 卸下法術: ${spell.name}`);
        }
        
        this.equippedSpells[slotIndex] = null;
        return true;
    }
    
    // 獲取已裝備的法術
    getEquippedSpell(slotIndex) {
        if (slotIndex < 0 || slotIndex >= 4) {
            return null;
        }
        return this.equippedSpells[slotIndex];
    }
    
    // 獲取所有已購買的法術
    getPlayerSpells() {
        return [...this.playerSpells];
    }
    
    // 獲取可用的元素組合預覽
    getElementCombinations() {
        const elements = ['F', 'I', 'L', 'A'];
        const combinations = [];
        
        for (let i = 0; i < elements.length; i++) {
            for (let j = i + 1; j < elements.length; j++) {
                const combo = [elements[i], elements[j]];
                const fusionResult = this.getFusionResult(combo);
                if (fusionResult) {
                    combinations.push({
                        elements: combo,
                        name: fusionResult.name,
                        description: fusionResult.description,
                        baseStats: fusionResult.baseStats
                    });
                }
            }
        }
        
        return combinations;
    }
    
    // 保存進度到localStorage
    saveProgress() {
        const saveData = {
            playerSpells: this.playerSpells,
            equippedSpells: this.equippedSpells
        };
        
        localStorage.setItem('spellFusionProgress', JSON.stringify(saveData));
        console.log('💾 法術合成進度已保存');
    }
    
    // 從localStorage載入進度
    loadProgress() {
        try {
            const saveData = localStorage.getItem('spellFusionProgress');
            if (saveData) {
                const data = JSON.parse(saveData);
                this.playerSpells = data.playerSpells || [];
                this.equippedSpells = data.equippedSpells || [null, null, null, null];
                console.log(`📂 法術合成進度已載入: ${this.playerSpells.length} 個法術`);
            }
        } catch (error) {
            console.error('❌ 載入法術合成進度失敗:', error);
        }
    }
    
    // 重置法術合成系統
    reset() {
        this.playerSpells = [];
        this.equippedSpells = [null, null, null, null];
        console.log('🔄 法術合成系統已重置');
    }
    
    // 獲取系統狀態
    getStatus() {
        return {
            isLoaded: this.isLoaded,
            playerSpellCount: this.playerSpells.length,
            equippedCount: this.equippedSpells.filter(s => s !== null).length,
            availableCombinations: this.isLoaded ? this.getElementCombinations().length : 0
        };
    }
}

// 創建全域實例
const spellFusionManager = new SpellFusionManager();
window.spellFusionManager = spellFusionManager;