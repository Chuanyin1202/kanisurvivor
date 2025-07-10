/**
 * 能力管理器
 * 處理能力選擇、激活和效果應用
 */
class AbilityManager {
    constructor() {
        this.playerAbilities = []; // 玩家已獲得的能力
        this.activeEffects = {}; // 當前生效的被動效果
        this.abilityPool = this.buildAbilityPool(); // 可選擇的能力池
        this.excludedAbilities = new Set(); // 已獲得的能力（避免重複）
        
        console.log('🎯 AbilityManager 初始化完成');
        console.log('📊 能力池大小:', this.abilityPool.length);
    }
    
    // 構建能力池（展平所有類別的能力）
    buildAbilityPool() {
        const pool = [];
        
        // 檢查AbilityDatabase是否存在
        if (typeof AbilityDatabase === 'undefined') {
            console.error('❌ AbilityDatabase 未加載，能力池為空');
            return pool;
        }
        
        // 遍歷所有類別
        Object.values(AbilityDatabase).forEach(category => {
            Object.values(category).forEach(ability => {
                pool.push(ability);
            });
        });
        
        return pool;
    }
    
    // 生成三選一的能力選項
    generateAbilityChoices(count = 3) {
        const choices = [];
        const availableAbilities = this.abilityPool.filter(ability => 
            !this.excludedAbilities.has(ability.id) && 
            this.isAbilityAvailable(ability)
        );
        
        if (availableAbilities.length === 0) {
            console.warn('⚠️ 沒有可用的能力選項');
            return [];
        }
        
        // 根據稀有度權重選擇能力
        for (let i = 0; i < count && availableAbilities.length > 0; i++) {
            const selectedAbility = this.selectRandomAbilityByRarity(availableAbilities);
            choices.push(selectedAbility);
            
            // 移除已選擇的能力，避免重複
            const index = availableAbilities.indexOf(selectedAbility);
            availableAbilities.splice(index, 1);
        }
        
        console.log('🎲 生成能力選項:', choices.map(a => `${a.icon} ${a.name}`).join(', '));
        return choices;
    }
    
    // 根據稀有度權重隨機選擇能力
    selectRandomAbilityByRarity(abilities) {
        // 檢查AbilityRarityWeights是否存在
        if (typeof AbilityRarityWeights === 'undefined') {
            console.warn('⚠️ AbilityRarityWeights 未定義，使用隨機選擇');
            return abilities[Math.floor(Math.random() * abilities.length)];
        }
        
        // 計算總權重
        let totalWeight = 0;
        const weightedAbilities = abilities.map(ability => {
            const weight = AbilityRarityWeights[ability.rarity] || 1;
            totalWeight += weight;
            return { ability, weight };
        });
        
        // 隨機選擇
        let randomValue = Math.random() * totalWeight;
        
        for (const item of weightedAbilities) {
            randomValue -= item.weight;
            if (randomValue <= 0) {
                return item.ability;
            }
        }
        
        // 備選：如果出現意外，返回第一個
        return abilities[0];
    }
    
    // 檢查能力是否可用（檢查前置需求）
    isAbilityAvailable(ability) {
        // 檢查法術需求
        if (ability.spellRequirement) {
            // 這裡可以檢查玩家是否有對應的法術
            // 暫時返回true，後續可以擴展
            return true;
        }
        
        // 檢查其他需求
        return true;
    }
    
    // 選擇並激活能力
    selectAbility(abilityId) {
        const ability = this.abilityPool.find(a => a.id === abilityId);
        if (!ability) {
            console.error('❌ 找不到能力:', abilityId);
            return false;
        }
        
        // 添加到玩家能力列表
        this.playerAbilities.push(ability);
        this.excludedAbilities.add(ability.id);
        
        // 應用能力效果
        this.applyAbilityEffects(ability);
        
        console.log(`✨ 獲得新能力: ${ability.icon} ${ability.name}`);
        console.log(`📝 ${ability.description}`);
        console.log(`🔧 能力效果:`, ability.effects);
        
        // 顯示生效的被動效果總覽
        console.log('🎯 當前所有生效的能力效果:', this.activeEffects);
        
        return true;
    }
    
    // 應用能力效果
    applyAbilityEffects(ability) {
        const effects = ability.effects;
        
        // 基礎數值修改
        if (effects.attackMultiplier) {
            this.activeEffects.attackMultiplier = (this.activeEffects.attackMultiplier || 1) * effects.attackMultiplier;
        }
        
        if (effects.maxHealthBonus) {
            this.activeEffects.maxHealthBonus = (this.activeEffects.maxHealthBonus || 0) + effects.maxHealthBonus;
        }
        
        if (effects.maxHealthMultiplier) {
            this.activeEffects.maxHealthMultiplier = (this.activeEffects.maxHealthMultiplier || 1) * effects.maxHealthMultiplier;
        }
        
        if (effects.maxManaMultiplier) {
            this.activeEffects.maxManaMultiplier = (this.activeEffects.maxManaMultiplier || 1) * effects.maxManaMultiplier;
        }
        
        if (effects.speedMultiplier) {
            this.activeEffects.speedMultiplier = (this.activeEffects.speedMultiplier || 1) * effects.speedMultiplier;
        }
        
        if (effects.critChanceBonus) {
            this.activeEffects.critChanceBonus = (this.activeEffects.critChanceBonus || 0) + effects.critChanceBonus;
        }
        
        if (effects.critDamageBonus) {
            this.activeEffects.critDamageBonus = (this.activeEffects.critDamageBonus || 0) + effects.critDamageBonus;
        }
        
        if (effects.spellDamageMultiplier) {
            this.activeEffects.spellDamageMultiplier = (this.activeEffects.spellDamageMultiplier || 1) * effects.spellDamageMultiplier;
        }
        
        if (effects.manaCostMultiplier) {
            this.activeEffects.manaCostMultiplier = (this.activeEffects.manaCostMultiplier || 1) * effects.manaCostMultiplier;
        }
        
        if (effects.spellCooldownMultiplier) {
            this.activeEffects.spellCooldownMultiplier = (this.activeEffects.spellCooldownMultiplier || 1) * effects.spellCooldownMultiplier;
        }
        
        // 特殊效果標記
        if (effects.extraProjectileChance) {
            this.activeEffects.extraProjectileChance = (this.activeEffects.extraProjectileChance || 0) + effects.extraProjectileChance;
        }
        
        if (effects.pierceBonus) {
            this.activeEffects.pierceBonus = (this.activeEffects.pierceBonus || 0) + effects.pierceBonus;
        }
        
        if (effects.dodgeChance) {
            this.activeEffects.dodgeChance = (this.activeEffects.dodgeChance || 0) + effects.dodgeChance;
        }
        
        if (effects.lifeStealOnKill) {
            this.activeEffects.lifeStealOnKill = (this.activeEffects.lifeStealOnKill || 0) + effects.lifeStealOnKill;
        }
        
        // 布爾值效果
        if (effects.arcaneHoming) {
            this.activeEffects.arcaneHoming = true;
        }
        
        if (effects.fireballMultishot) {
            this.activeEffects.fireballMultishot = effects.fireballMultishot;
            this.activeEffects.fireballSpread = effects.fireballSpread;
        }
        
        if (effects.frostExplosion) {
            this.activeEffects.frostExplosion = true;
            this.activeEffects.explosionRadius = effects.explosionRadius;
            this.activeEffects.explosionDamageMultiplier = effects.explosionDamageMultiplier;
        }
        
        // 特殊召喚物效果
        if (effects.orbitingSwords) {
            this.activeEffects.orbitingSwords = (this.activeEffects.orbitingSwords || 0) + effects.orbitingSwords;
            this.activeEffects.swordDamage = effects.swordDamage || 20;
            this.activeEffects.swordSpeed = effects.swordSpeed || 2.0;
        }
        
        if (effects.fireElemental) {
            this.activeEffects.fireElemental = true;
            this.activeEffects.elementalDamage = effects.elementalDamage || 30;
            this.activeEffects.elementalAttackInterval = effects.elementalAttackInterval || 2.0;
        }
        
        // 法術增強效果
        if (effects.spellEchoChance) {
            this.activeEffects.spellEchoChance = (this.activeEffects.spellEchoChance || 0) + effects.spellEchoChance;
        }
        
        if (effects.iceShield) {
            this.activeEffects.iceShield = true;
            this.activeEffects.shieldCount = effects.shieldCount || 3;
            this.activeEffects.reflectDamage = effects.reflectDamage || 25;
        }
        
        // 立即應用到玩家身上
        this.updatePlayerStats();
    }
    
    // 更新玩家屬性
    updatePlayerStats() {
        if (!window.player) return;
        
        const player = window.player;
        const effects = this.activeEffects;
        
        // 重新計算基礎屬性（保存原始值並應用修飾符）
        if (!player.baseStats) {
            // 保存原始屬性
            player.baseStats = {
                maxHealth: player.maxHealth,
                maxMana: player.maxMana,
                attack: player.attack,
                defense: player.defense,
                speed: player.speed,
                critChance: player.critChance,
                critDamage: player.critDamage
            };
        }
        
        // 應用修飾符
        player.maxHealth = Math.floor(player.baseStats.maxHealth * (effects.maxHealthMultiplier || 1) + (effects.maxHealthBonus || 0));
        player.maxMana = Math.floor(player.baseStats.maxMana * (effects.maxManaMultiplier || 1));
        player.attack = Math.floor(player.baseStats.attack * (effects.attackMultiplier || 1));
        player.speed = Math.floor(player.baseStats.speed * (effects.speedMultiplier || 1));
        player.critChance = Math.min(0.95, player.baseStats.critChance + (effects.critChanceBonus || 0));
        player.critDamage = player.baseStats.critDamage + (effects.critDamageBonus || 0);
        
        // 確保當前血量和魔法不超過新的最大值
        player.health = Math.min(player.health, player.maxHealth);
        player.mana = Math.min(player.mana, player.maxMana);
        
        console.log('📊 玩家屬性已更新:', {
            health: `${player.health}/${player.maxHealth}`,
            mana: `${player.mana}/${player.maxMana}`,
            attack: player.attack,
            critChance: (player.critChance * 100).toFixed(1) + '%'
        });
    }
    
    // 檢查能力是否觸發
    checkAbilityTrigger(triggerType, data = {}) {
        const effects = this.activeEffects;
        const results = [];
        
        switch (triggerType) {
            case 'extraProjectile':
                if (effects.extraProjectileChance && Math.random() < effects.extraProjectileChance) {
                    results.push({ type: 'extraProjectile' });
                }
                break;
                
            case 'dodge':
                if (effects.dodgeChance && Math.random() < effects.dodgeChance) {
                    results.push({ type: 'dodge' });
                }
                break;
                
            case 'onKill':
                if (effects.lifeStealOnKill) {
                    const healAmount = window.player.maxHealth * effects.lifeStealOnKill;
                    results.push({ type: 'heal', amount: healAmount });
                }
                break;
                
            case 'spellDamage':
                let damageMultiplier = effects.spellDamageMultiplier || 1;
                return damageMultiplier;
                
            case 'manaCost':
                let costMultiplier = effects.manaCostMultiplier || 1;
                return costMultiplier;
                
            case 'spellCooldown':
                let cooldownMultiplier = effects.spellCooldownMultiplier || 1;
                return cooldownMultiplier;
                
            case 'spellEcho':
                if (effects.spellEchoChance && Math.random() < effects.spellEchoChance) {
                    results.push({ type: 'spellEcho' });
                }
                break;
                
            case 'onCrit':
                // 爆擊觸發效果（用於雙刃劍等技能）
                if (effects.critSelfDamage && data.isCritical) {
                    const selfDamage = data.damage * effects.critSelfDamage;
                    results.push({ type: 'selfDamage', damage: selfDamage });
                }
                if (effects.critChainExplosion && data.isCritical && Math.random() < effects.critChainExplosion) {
                    results.push({ type: 'explosion', position: data.position });
                }
                break;
                
            case 'onHit':
                // 受擊觸發效果（用於荊棘等技能）
                if (effects.thornsReflectChance && Math.random() < effects.thornsReflectChance) {
                    const reflectDamage = data.damage * (effects.thornsReflectMultiplier || 0.3);
                    results.push({ type: 'reflect', damage: reflectDamage, target: data.attacker });
                }
                if (effects.dodgeCounterAttack && Math.random() < effects.dodgeChance) {
                    results.push({ type: 'counterAttack', target: data.attacker });
                }
                break;
                
            case 'onCast':
                // 施法觸發效果（用於混沌法術等技能）
                if (effects.chaosSpellChance && Math.random() < effects.chaosSpellChance) {
                    const randomSpells = ['fireball', 'frostbolt', 'lightning', 'arcane'];
                    const randomSpell = randomSpells[Math.floor(Math.random() * randomSpells.length)];
                    results.push({ type: 'randomSpell', spellType: randomSpell });
                }
                if (effects.fortuneWheelChance && Math.random() < effects.fortuneWheelChance) {
                    const effects = ['damage', 'heal', 'mana', 'speed', 'curse'];
                    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
                    results.push({ type: 'randomEffect', effect: randomEffect });
                }
                break;
                
            case 'onMove':
                // 移動觸發效果（用於火焰足跡等技能）
                if (effects.fireTrailChance && data.isMoving && Math.random() < effects.fireTrailChance) {
                    results.push({ type: 'fireTrail', position: data.position });
                }
                if (effects.shadowCloneChance && data.isDashing && Math.random() < effects.shadowCloneChance) {
                    results.push({ type: 'shadowClone', position: data.position });
                }
                break;
        }
        
        return results;
    }
    
    // 重置所有能力（用於新遊戲）
    reset() {
        this.playerAbilities = [];
        this.activeEffects = {};
        this.excludedAbilities.clear();
        
        // 重置玩家屬性到基礎狀態
        if (window.player && window.player.baseStats) {
            const player = window.player;
            player.maxHealth = player.baseStats.maxHealth;
            player.maxMana = player.baseStats.maxMana;
            player.attack = player.baseStats.attack;
            player.defense = player.baseStats.defense;
            player.speed = player.baseStats.speed;
            player.critChance = player.baseStats.critChance;
            player.critDamage = player.baseStats.critDamage;
            
            delete player.baseStats;
        }
        
        console.log('🔄 AbilityManager 已重置');
    }
}

// 全域能力管理器 - 使用延遲初始化以確保依賴已加載
function initializeAbilityManager() {
    if (window.abilityManager) {
        console.log('✅ AbilityManager 已存在');
        return window.abilityManager;
    }
    
    try {
        console.log('🚀 正在初始化 AbilityManager...');
        
        // 檢查依賴
        if (typeof AbilityDatabase === 'undefined') {
            console.error('❌ AbilityDatabase 未定義');
            throw new Error('AbilityDatabase 未加載');
        }
        
        if (typeof AbilityRarityWeights === 'undefined') {
            console.error('❌ AbilityRarityWeights 未定義');
            throw new Error('AbilityRarityWeights 未加載');
        }
        
        console.log('✓ 依賴檢查通過');
        console.log('📊 AbilityDatabase 包含', Object.keys(AbilityDatabase).length, '個類別');
        console.log('⚖️ AbilityRarityWeights:', Object.keys(AbilityRarityWeights));
        
        const manager = new AbilityManager();
        window.abilityManager = manager;
        
        console.log('✅ AbilityManager 初始化成功');
        console.log('🎯 AbilityManager 可用方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(manager)));
        
        return manager;
        
    } catch (error) {
        console.error('❌ AbilityManager 初始化失敗:', error);
        console.error('📊 可用全域變數:', Object.keys(window).filter(k => k.includes('Ability')));
        
        // 創建一個最小的備用版本
        window.abilityManager = {
            generateAbilityChoices: () => {
                console.warn('⚠️ 使用備用 AbilityManager - generateAbilityChoices');
                return [];
            },
            selectAbility: () => {
                console.warn('⚠️ 使用備用 AbilityManager - selectAbility');
                return false;
            },
            reset: () => {
                console.warn('⚠️ 使用備用 AbilityManager - reset');
            },
            checkAbilityTrigger: () => {
                console.warn('⚠️ 使用備用 AbilityManager - checkAbilityTrigger');
                return [];
            }
        };
        
        console.log('🔄 已創建備用 AbilityManager');
        return null;
    }
}

// 立即嘗試初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeAbilityManager();
});

// 如果 DOM 已經載入，立即執行
if (document.readyState === 'loading') {
    // DOM 還在載入中，等待 DOMContentLoaded
} else {
    // DOM 已經載入完成，立即執行
    setTimeout(() => {
        initializeAbilityManager();
    }, 50); // 短暫延遲確保其他腳本已載入
}

// 導出初始化函數供其他地方調用
window.initializeAbilityManager = initializeAbilityManager;