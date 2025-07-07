/**
 * 能力數據庫
 * 定義所有可升級的能力和效果
 */
const AbilityDatabase = {
    // 🔥 攻擊強化類
    attackEnhancement: {
        // 基礎傷害系
        brutalForce: {
            id: 'brutalForce',
            name: '暴力輸出',
            description: '攻擊力+30%，但魔法消耗+50%',
            icon: '💢',
            rarity: 'common',
            category: 'attack',
            effects: {
                attackMultiplier: 1.3,
                manaCostMultiplier: 1.5
            }
        },
        
        precisionShot: {
            id: 'precisionShot',
            name: '精準射擊',
            description: '爆擊率+15%，爆擊傷害+25%',
            icon: '🎯',
            rarity: 'common',
            category: 'attack',
            effects: {
                critChanceBonus: 0.15,
                critDamageBonus: 0.25
            }
        },
        
        magicSpecialist: {
            id: 'magicSpecialist',
            name: '魔法專精',
            description: '所有法術傷害+20%',
            icon: '🔮',
            rarity: 'common',
            category: 'attack',
            effects: {
                spellDamageMultiplier: 1.2
            }
        },
        
        elementalMaster: {
            id: 'elementalMaster',
            name: '元素大師',
            description: '火焰/冰霜/閃電傷害+40%',
            icon: '⚡',
            rarity: 'uncommon',
            category: 'attack',
            effects: {
                elementalDamageMultiplier: 1.4
            }
        },
        
        // 多重攻擊系
        dualCasting: {
            id: 'dualCasting',
            name: '雙重施法',
            description: '25%機率發射額外一發投射物',
            icon: '🔄',
            rarity: 'uncommon',
            category: 'attack',
            effects: {
                extraProjectileChance: 0.25
            }
        },
        
        tripleThreat: {
            id: 'tripleThreat',
            name: '三重奏',
            description: '火球術變成散射三發',
            icon: '🔥🔥🔥',
            rarity: 'rare',
            category: 'attack',
            spellRequirement: 'fireball',
            effects: {
                fireballMultishot: 3,
                fireballSpread: 30 // 度數
            }
        },
        
        chainLightningPlus: {
            id: 'chainLightningPlus',
            name: '閃電鏈增強',
            description: '閃電連鎖目標+2，傷害衰減-20%',
            icon: '⚡🔗',
            rarity: 'uncommon',
            category: 'attack',
            spellRequirement: 'lightning',
            effects: {
                lightningChainTargets: 2,
                lightningDamageReduction: -0.2
            }
        },
        
        frostNova: {
            id: 'frostNova',
            name: '冰霜新星',
            description: '冰霜箭擊中時周圍爆炸造成範圍傷害',
            icon: '❄️💥',
            rarity: 'rare',
            category: 'attack',
            spellRequirement: 'frostbolt',
            effects: {
                frostExplosion: true,
                explosionRadius: 60,
                explosionDamageMultiplier: 0.8
            }
        },
        
        // 創意攻擊系
        homingMissiles: {
            id: 'homingMissiles',
            name: '追蹤導彈',
            description: '奧術飛彈變成強力追蹤，傷害+50%',
            icon: '🚀',
            rarity: 'rare',
            category: 'attack',
            spellRequirement: 'arcane',
            effects: {
                arcaneHoming: true,
                arcaneDamageMultiplier: 1.5,
                homingStrength: 0.3
            }
        },
        
        pierceExpert: {
            id: 'pierceExpert',
            name: '穿透專家',
            description: '所有投射物穿透+1個敵人',
            icon: '🏹',
            rarity: 'uncommon',
            category: 'attack',
            effects: {
                pierceBonus: 1
            }
        },
        
        ricocheting: {
            id: 'ricocheting',
            name: '反彈大師',
            description: '投射物擊中牆壁或敵人後反彈1次',
            icon: '🎱',
            rarity: 'rare',
            category: 'attack',
            effects: {
                projectileBounce: 1
            }
        },
        
        chainExplosion: {
            id: 'chainExplosion',
            name: '連鎖爆炸',
            description: '擊殺敵人時15%機率在該位置爆炸',
            icon: '💀💥',
            rarity: 'uncommon',
            category: 'attack',
            effects: {
                explosionOnKillChance: 0.15,
                explosionRadius: 80,
                explosionDamage: 30
            }
        }
    },
    
    // 🛡️ 生存強化類
    survival: {
        // 血量防禦系
        ironBody: {
            id: 'ironBody',
            name: '鋼鐵之軀',
            description: '最大生命值+50，防禦力+3',
            icon: '🛡️',
            rarity: 'common',
            category: 'defense',
            effects: {
                maxHealthBonus: 50,
                defenseBonus: 3
            }
        },
        
        vampiric: {
            id: 'vampiric',
            name: '吸血鬼',
            description: '擊殺敵人回復5%最大生命值',
            icon: '🧛',
            rarity: 'uncommon',
            category: 'defense',
            effects: {
                lifeStealOnKill: 0.05
            }
        },
        
        thorns: {
            id: 'thorns',
            name: '荊棘護甲',
            description: '受到攻擊時反彈30%傷害給攻擊者',
            icon: '🌹',
            rarity: 'uncommon',
            category: 'defense',
            effects: {
                thornsDamage: 0.3
            }
        },
        
        secondChance: {
            id: 'secondChance',
            name: '不死之身',
            description: '致命攻擊時有20%機率保留1HP',
            icon: '💀🛡️',
            rarity: 'rare',
            category: 'defense',
            effects: {
                deathSaveChance: 0.2
            }
        },
        
        // 閃避機動系
        swiftness: {
            id: 'swiftness',
            name: '疾風步',
            description: '移動速度+25%，受到攻擊時10%機率完全閃避',
            icon: '💨',
            rarity: 'common',
            category: 'mobility',
            effects: {
                speedMultiplier: 1.25,
                dodgeChance: 0.1
            }
        },
        
        shadowClone: {
            id: 'shadowClone',
            name: '殘影',
            description: '衝刺後留下殘影，對接觸的敵人造成傷害',
            icon: '👤',
            rarity: 'uncommon',
            category: 'mobility',
            effects: {
                dashShadow: true,
                shadowDamage: 25,
                shadowDuration: 1.0
            }
        },
        
        blink: {
            id: 'blink',
            name: '瞬間移動',
            description: '衝刺變成短距離瞬移，無敵時間+0.2秒',
            icon: '✨',
            rarity: 'rare',
            category: 'mobility',
            effects: {
                dashTeleport: true,
                invincibilityBonus: 0.2
            }
        },
        
        lightningReflexes: {
            id: 'lightningReflexes',
            name: '閃電反射',
            description: '受到攻擊時30%機率自動衝刺到安全位置',
            icon: '⚡🏃',
            rarity: 'rare',
            category: 'mobility',
            effects: {
                autoDashChance: 0.3
            }
        }
    },
    
    // ⚡ 魔法系統類
    magic: {
        // 魔法資源系
        manaWell: {
            id: 'manaWell',
            name: '法力之井',
            description: '最大魔法值+100%，魔法恢復速度+50%',
            icon: '🌊',
            rarity: 'uncommon',
            category: 'magic',
            effects: {
                maxManaMultiplier: 2.0,
                manaRegenMultiplier: 1.5
            }
        },
        
        efficiency: {
            id: 'efficiency',
            name: '節能法師',
            description: '所有法術消耗-40%',
            icon: '💡',
            rarity: 'common',
            category: 'magic',
            effects: {
                manaCostMultiplier: 0.6
            }
        },
        
        battleMeditation: {
            id: 'battleMeditation',
            name: '戰鬥冥想',
            description: '戰鬥中魔法恢復速度額外+100%',
            icon: '🧘',
            rarity: 'uncommon',
            category: 'magic',
            effects: {
                combatManaRegenMultiplier: 2.0
            }
        },
        
        magicBurst: {
            id: 'magicBurst',
            name: '魔法爆發',
            description: '魔法值低於20%時，傷害+60%',
            icon: '🌟',
            rarity: 'rare',
            category: 'magic',
            effects: {
                lowManaDamageMultiplier: 1.6,
                lowManaThreshold: 0.2
            }
        },
        
        // 施法強化系
        rapidCasting: {
            id: 'rapidCasting',
            name: '快速施法',
            description: '施法冷卻時間-30%',
            icon: '⏰',
            rarity: 'common',
            category: 'magic',
            effects: {
                spellCooldownMultiplier: 0.7
            }
        },
        
        dualChanneling: {
            id: 'dualChanneling',
            name: '同時施法',
            description: '能同時維持2種不同法術的效果',
            icon: '🤹',
            rarity: 'rare',
            category: 'magic',
            effects: {
                simultaneousCasting: true
            }
        },
        
        spellEcho: {
            id: 'spellEcho',
            name: '法術回音',
            description: '15%機率重複上一次施法（不消耗魔法）',
            icon: '🔊',
            rarity: 'uncommon',
            category: 'magic',
            effects: {
                spellEchoChance: 0.15
            }
        },
        
        multicast: {
            id: 'multicast',
            name: '多重施法',
            description: '每次施法額外發射1發投射物',
            icon: '🎯🎯',
            rarity: 'rare',
            category: 'magic',
            effects: {
                extraProjectileChance: 1.0
            }
        },
        
        elementalResonance: {
            id: 'elementalResonance',
            name: '元素共鳴',
            description: '連續使用同種法術時，傷害逐步提升（最多+100%）',
            icon: '🎵',
            rarity: 'rare',
            category: 'magic',
            effects: {
                elementalResonance: true,
                maxResonanceStacks: 5,
                resonanceDamagePerStack: 0.2
            }
        }
    },
    
    // 🌟 特殊能力類
    special: {
        // 召喚系
        magicSword: {
            id: 'magicSword',
            name: '魔法飛劍',
            description: '自動圍繞玩家旋轉攻擊敵人的飛劍',
            icon: '⚔️',
            rarity: 'rare',
            category: 'summon',
            effects: {
                orbitingSwords: 1,
                swordDamage: 20,
                swordSpeed: 2.0
            }
        },
        
        fireElemental: {
            id: 'fireElemental',
            name: '火元素',
            description: '召喚跟隨玩家的火球，定期攻擊附近敵人',
            icon: '🔥👻',
            rarity: 'rare',
            category: 'summon',
            effects: {
                fireElemental: true,
                elementalDamage: 30,
                elementalAttackInterval: 2.0
            }
        },
        
        iceShield: {
            id: 'iceShield',
            name: '冰晶護盾',
            description: '圍繞玩家的冰晶，阻擋投射物並反擊',
            icon: '❄️🛡️',
            rarity: 'rare',
            category: 'summon',
            effects: {
                iceShield: true,
                shieldCount: 3,
                reflectDamage: 25
            }
        },
        
        lightningStorm: {
            id: 'lightningStorm',
            name: '閃電風暴',
            description: '定期在隨機位置降下閃電',
            icon: '⛈️',
            rarity: 'epic',
            category: 'summon',
            effects: {
                lightningStorm: true,
                stormInterval: 3.0,
                lightningDamage: 50
            }
        },
        
        // 環境操控系
        frostDomain: {
            id: 'frostDomain',
            name: '冰霜領域',
            description: '周圍區域持續造成減速和傷害',
            icon: '🌨️',
            rarity: 'epic',
            category: 'environment',
            effects: {
                frostAura: true,
                auraRadius: 100,
                auraDamage: 5,
                auraSlowMultiplier: 0.7
            }
        },
        
        fireTrail: {
            id: 'fireTrail',
            name: '火焰足跡',
            description: '移動時留下火焰痕跡傷害敵人',
            icon: '🔥👣',
            rarity: 'uncommon',
            category: 'environment',
            effects: {
                fireTrail: true,
                trailDamage: 10,
                trailDuration: 2.0
            }
        }
    },
    
    // 🎲 風險收益類
    risk: {
        glassCannon: {
            id: 'glassCannon',
            name: '玻璃大砲',
            description: '攻擊力+100%，最大生命值-50%',
            icon: '💥💔',
            rarity: 'rare',
            category: 'risk',
            effects: {
                attackMultiplier: 2.0,
                maxHealthMultiplier: 0.5
            }
        },
        
        berserker: {
            id: 'berserker',
            name: '狂戰士',
            description: '生命值越低傷害越高（最多+200%）',
            icon: '😡',
            rarity: 'uncommon',
            category: 'risk',
            effects: {
                berserkerMode: true,
                maxBerserkerDamage: 3.0
            }
        },
        
        nearDeath: {
            id: 'nearDeath',
            name: '險死求生',
            description: '生命值低於25%時移動速度+50%，攻擊速度+30%',
            icon: '💀⚡',
            rarity: 'uncommon',
            category: 'risk',
            effects: {
                lowHealthThreshold: 0.25,
                lowHealthSpeedMultiplier: 1.5,
                lowHealthAttackSpeedMultiplier: 1.3
            }
        },
        
        doubleedgedSword: {
            id: 'doubleedgedSword',
            name: '雙刃劍',
            description: '爆擊率+25%，但爆擊時也會對自己造成5%傷害',
            icon: '⚔️💔',
            rarity: 'uncommon',
            category: 'risk',
            effects: {
                critChanceBonus: 0.25,
                critSelfDamage: 0.05
            }
        },
        
        // 賭博系
        luckyStar: {
            id: 'luckyStar',
            name: '幸運之星',
            description: '10%機率造成5倍傷害',
            icon: '⭐',
            rarity: 'rare',
            category: 'gambling',
            effects: {
                luckyStrikeChance: 0.1,
                luckyStrikeDamage: 5.0
            }
        },
        
        chaosSpell: {
            id: 'chaosSpell',
            name: '混沌法術',
            description: '每次施法隨機選擇一種法術類型',
            icon: '🎲',
            rarity: 'rare',
            category: 'gambling',
            effects: {
                chaosSpellcasting: true
            }
        },
        
        fortuneWheel: {
            id: 'fortuneWheel',
            name: '命運輪盤',
            description: '擊殺敵人時隨機獲得：回血、回魔、短暫無敵之一',
            icon: '🎰',
            rarity: 'uncommon',
            category: 'gambling',
            effects: {
                fortuneWheel: true,
                fortuneEffects: ['heal', 'mana', 'invincible']
            }
        }
    },
    
    // 💎 進化傳奇類
    legendary: {
        timeControl: {
            id: 'timeControl',
            name: '時間操控',
            description: '可以短暫暫停時間',
            icon: '⏱️',
            rarity: 'legendary',
            category: 'ultimate',
            effects: {
                timeStop: true,
                timeStopDuration: 3.0,
                timeStopCooldown: 30.0
            }
        },
        
        clone: {
            id: 'clone',
            name: '分身術',
            description: '創造一個跟隨玩家的分身',
            icon: '👥',
            rarity: 'legendary',
            category: 'ultimate',
            effects: {
                playerClone: true,
                cloneDamageMultiplier: 0.5
            }
        },
        
        gravityControl: {
            id: 'gravityControl',
            name: '重力掌控',
            description: '可以吸引或排斥敵人',
            icon: '🌌',
            rarity: 'legendary',
            category: 'ultimate',
            effects: {
                gravityField: true,
                gravityRange: 150,
                gravityStrength: 100
            }
        },
        
        phoenixRebirth: {
            id: 'phoenixRebirth',
            name: '鳳凰重生',
            description: '死亡時復活並對周圍敵人造成巨額傷害',
            icon: '🔥🕊️',
            rarity: 'legendary',
            category: 'ultimate',
            effects: {
                phoenixRevive: true,
                reviveExplosionDamage: 200,
                reviveExplosionRadius: 200
            }
        }
    }
};

/**
 * 能力稀有度權重
 */
const AbilityRarityWeights = {
    common: 70,
    uncommon: 25,
    rare: 4,
    epic: 0.8,
    legendary: 0.2
};

/**
 * 能力類別
 */
const AbilityCategories = {
    attack: '攻擊',
    defense: '防禦',
    mobility: '機動',
    magic: '魔法',
    summon: '召喚',
    environment: '環境',
    risk: '風險',
    gambling: '賭博',
    ultimate: '終極'
};