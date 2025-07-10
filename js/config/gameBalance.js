/**
 * 遊戲平衡參數配置
 * 包含所有遊戲平衡相關的數值設定
 */
const GameBalance = {
    // 玩家基礎屬性
    player: {
        baseHealth: 100,
        baseMana: 80,
        baseSpeed: 120, // 像素/秒
        baseAttack: 10,
        baseDefense: 5,
        baseCritChance: 0.10, // 10% (大幅提升爽快感)
        baseCritDamage: 2.0, // 200% (更高暴擊傷害)
        
        // 等級成長
        levelUp: {
            experienceBase: 100,
            experienceGrowth: 1.2,
            healthGrowth: 10,
            manaGrowth: 5,
            attackGrowth: 2,
            defenseGrowth: 1
        },
        
        // 技能冷卻
        spellCooldown: 0.8, // 秒 (調整以修復發射頻率過高問題)
        dashCooldown: 2.0, // 秒
        dashDistance: 80, // 像素
        dashInvincibilityTime: 0.3, // 秒
        
        // 生命恢復
        healthRegen: 0.0, // 每秒 (移除自然恢復，增加挑戰性)
        manaRegen: 8.0, // 每秒 (大幅提升以支持連續戰鬥)
        
        // 碰撞
        radius: 16 // 像素
    },

    // 法術系統
    spells: {
        // 火球術
        fireball: {
            damage: 20, // +33% 傷害
            manaCost: 5,
            speed: 200,
            range: 300,
            size: 8,
            piercing: false,
            areaOfEffect: 0,
            statusEffect: 'burn',
            statusDuration: 3,
            statusDamage: 2
        },
        
        // 冰霜箭
        frostbolt: {
            damage: 16, // +33% 傷害
            manaCost: 4,
            speed: 180,
            range: 250,
            size: 6,
            piercing: false,
            areaOfEffect: 0,
            statusEffect: 'slow',
            statusDuration: 2,
            slowMultiplier: 0.6
        },
        
        // 閃電
        lightning: {
            damage: 26, // +30% 傷害
            manaCost: 8,
            speed: 400,
            range: 200,
            size: 4,
            piercing: true,
            chainTargets: 5, // 增加連鎖目標
            chainDamageReduction: 0.9 // 減少傷害衰減
        },
        
        // 奧術飛彈  
        arcane: {
            damage: 11, // +37% 傷害
            manaCost: 2,
            speed: 250,
            range: 280,
            size: 5,
            piercing: false,
            areaOfEffect: 0,
            homingStrength: 0.1
        }
    },

    // 敵人配置
    enemies: {
        // 史萊姆 - 基礎敵人 🟢
        slime: {
            health: 20,
            speed: 50,
            damage: 12,
            experienceReward: 10,
            goldReward: 2,
            size: 16,
            spawnWeight: 1.0,
            minWave: 1
        },
        
        // 哥布林 - 平衡型戰士 👹
        goblin: {
            health: 35,
            speed: 65,
            damage: 18,
            experienceReward: 15,
            goldReward: 3,
            size: 18,
            spawnWeight: 0.8,
            minWave: 2
        },
        
        // 弓箭手 - 遠程攻擊，血少但傷害高 🏹
        archer: {
            health: 25,
            speed: 45,
            damage: 25,
            experienceReward: 18,
            goldReward: 4,
            size: 16,
            spawnWeight: 0.6,
            minWave: 3
        },
        
        // 狼 - 快速但脆弱 🐺
        wolf: {
            health: 30,
            speed: 85,
            damage: 16,
            experienceReward: 20,
            goldReward: 3,
            size: 18,
            spawnWeight: 0.7,
            minWave: 4
        },
        
        // 獸人 - 重型單位 🐗
        orc: {
            health: 70,
            speed: 40,
            damage: 32,
            experienceReward: 25,
            goldReward: 5,
            size: 24,
            spawnWeight: 0.4,
            minWave: 5
        },
        
        // 祭司 - 支援型，低攻擊但有特殊能力 👨‍⚕️
        priest: {
            health: 50,
            speed: 35,
            damage: 8,
            experienceReward: 35,
            goldReward: 8,
            size: 18,
            spawnWeight: 0.2,
            minWave: 7
        },
        
        // 首領
        boss: {
            health: 200,
            speed: 35, // +17% 移動速度
            damage: 45, // +29% 傷害
            experienceReward: 100,
            goldReward: 25,
            size: 40,
            spawnWeight: 0.1,
            minWave: 10,
            specialAttacks: ['charge', 'summon']
        }
    },

    // 波次系統
    waves: {
        // 基礎設定
        baseSpawnRate: 5.0, // 每秒生成敵人數 (大幅增加)
        spawnRateGrowth: 0.3, // 每波成長 (增加)
        maxSpawnRate: 20.0, // 最大生成速率 (大幅增加)
        
        // 波次時間
        waveDuration: 45, // 秒 (增加)
        waveGrowthRate: 1.05, // 每波時間係數 (增加時間而非減少)
        minWaveDuration: 20, // 最小波次時間 (增加)
        
        // 敵人數量
        baseEnemyCount: 25, // 基礎敵人數量 (大幅增加)
        enemyCountGrowth: 1.3, // 敵人數量成長率 (增加)
        maxEnemyCount: 120, // 最大敵人數量 (大幅增加)
        
        // 首領波次
        bossWaveInterval: 5, // 每5波出現首領 (更頻繁)
        bossWaveMultiplier: 2.0, // 首領波次的敵人數量倍數 (增加)
        
        // 特殊波次
        specialWaves: {
            15: { type: 'speed', multiplier: 1.5 }, // 速度波
            25: { type: 'health', multiplier: 2.0 }, // 血量波
            35: { type: 'swarm', multiplier: 3.0 }   // 蟲群波
        }
    },

    // 裝備系統
    equipment: {
        // 武器類型
        weapons: {
            // 基礎法杖
            basicStaff: {
                attack: 5,
                critChance: 0.02,
                manaCost: 0.9,
                cost: 50,
                rarity: 'common'
            },
            
            // 火焰法杖
            fireStaff: {
                attack: 8,
                critChance: 0.03,
                fireDamage: 3,
                cost: 150,
                rarity: 'uncommon'
            },
            
            // 冰霜法杖
            iceStaff: {
                attack: 7,
                critChance: 0.04,
                slowChance: 0.15,
                cost: 150,
                rarity: 'uncommon'
            },
            
            // 奧術法杖
            arcaneStaff: {
                attack: 12,
                critChance: 0.08,
                manaRegen: 1.0,
                cost: 300,
                rarity: 'rare'
            }
        },
        
        // 護甲類型
        armor: {
            // 布甲
            clothArmor: {
                defense: 3,
                health: 10,
                cost: 40,
                rarity: 'common'
            },
            
            // 皮甲
            leatherArmor: {
                defense: 6,
                health: 20,
                speed: 5,
                cost: 120,
                rarity: 'uncommon'
            },
            
            // 法師袍
            mageRobe: {
                defense: 4,
                health: 15,
                mana: 20,
                manaRegen: 0.5,
                cost: 200,
                rarity: 'rare'
            }
        },
        
        // 飾品類型
        accessories: {
            // 力量戒指
            powerRing: {
                attack: 5,
                cost: 100,
                rarity: 'common'
            },
            
            // 敏捷項鍊
            agilityNecklace: {
                speed: 20,
                critChance: 0.05,
                cost: 180,
                rarity: 'uncommon'
            },
            
            // 智慧護符
            wisdomAmulet: {
                mana: 30,
                manaRegen: 1.5,
                cost: 250,
                rarity: 'rare'
            }
        },
        
        // 套裝效果
        sets: {
            // 初學者套裝
            beginnerSet: {
                items: ['basicStaff', 'clothArmor', 'powerRing'],
                bonus: {
                    2: { attack: 3, health: 15 },
                    3: { attack: 5, health: 25, manaRegen: 0.5 }
                }
            },
            
            // 火焰套裝
            fireSet: {
                items: ['fireStaff', 'mageRobe', 'powerRing'],
                bonus: {
                    2: { fireDamage: 5, burnDuration: 1 },
                    3: { fireDamage: 10, burnDuration: 2, fireResistance: 0.5 }
                }
            }
        }
    },

    // 法術系統
    spells: {
        // 火球術
        fireball: {
            damage: 15,
            manaCost: 8,
            speed: 250,
            size: 8,
            range: 400,
            statusEffect: 'burn',
            statusDuration: 3.0,
            statusDamage: 3,
            areaOfEffect: 25
        },
        
        // 冰霜箭
        frostbolt: {
            damage: 12,
            manaCost: 6,
            speed: 300,
            size: 6,
            range: 450,
            statusEffect: 'slow',
            statusDuration: 2.0,
            slowMultiplier: 0.6
        },
        
        // 閃電箭
        lightning: {
            damage: 10,
            manaCost: 5,
            speed: 400,
            size: 4,
            range: 350,
            piercing: true,
            chainTargets: 3,
            chainDamageReduction: 0.8
        },
        
        // 奧術飛彈
        arcane: {
            damage: 18,
            manaCost: 12,
            speed: 200,
            size: 10,
            range: 500,
            homingStrength: 0.15
        }
    },

    // 經濟系統
    economy: {
        // 金幣掉落
        goldDrop: {
            baseAmount: 1,
            randomRange: 2,
            bossMultiplier: 5,
            waveMultiplier: 0.1 // 每波增加
        },
        
        // 經驗值
        experience: {
            killMultiplier: 1.0,
            comboMultiplier: 0.1, // 每個連擊增加
            survivalBonus: 0.5    // 每分鐘生存獎勵
        },
        
        // 商店價格
        shopPrices: {
            priceInflation: 1.1, // 每次購買價格增加
            maxInflation: 2.0,   // 最大價格倍數
            refreshCost: 10      // 商店重新整理費用
        }
    },

    // 成就系統
    achievements: {
        // 擊殺類成就
        kills: {
            firstKill: { threshold: 1, reward: 10 },
            killer: { threshold: 50, reward: 50 },
            slaughter: { threshold: 200, reward: 100 },
            massacre: { threshold: 500, reward: 200 }
        },
        
        // 生存類成就
        survival: {
            survivor: { threshold: 60, reward: 25 },    // 1分鐘
            veteran: { threshold: 300, reward: 100 },   // 5分鐘
            legend: { threshold: 600, reward: 250 },    // 10分鐘
            immortal: { threshold: 1200, reward: 500 }  // 20分鐘
        },
        
        // 連擊類成就
        combo: {
            combo10: { threshold: 10, reward: 20 },
            combo25: { threshold: 25, reward: 50 },
            combo50: { threshold: 50, reward: 100 },
            combo100: { threshold: 100, reward: 200 }
        },
        
        // 金幣類成就
        wealth: {
            collector: { threshold: 100, reward: 25 },
            rich: { threshold: 500, reward: 100 },
            wealthy: { threshold: 1000, reward: 200 },
            millionaire: { threshold: 5000, reward: 500 }
        }
    },

    // 視覺效果
    effects: {
        // 傷害數字
        damageNumbers: {
            duration: 2.0,
            speed: 50,
            fontSize: 14,
            critFontSize: 18,
            normalColor: '#ffffff',
            critColor: '#ffff00',
            healColor: '#00ff00'
        },
        
        // 粒子效果
        particles: {
            bloodSplatter: {
                count: 5,
                speed: 100,
                life: 1.0,
                size: 3,
                color: '#ff0000'
            },
            
            goldSparkle: {
                count: 8,
                speed: 80,
                life: 1.5,
                size: 2,
                color: '#ffd700'
            },
            
            levelUpBurst: {
                count: 20,
                speed: 150,
                life: 2.0,
                size: 4,
                color: '#00ffff'
            }
        },
        
        // 螢幕震動
        screenShake: {
            playerHit: { intensity: 5, duration: 0.3 },
            bossHit: { intensity: 8, duration: 0.5 },
            levelUp: { intensity: 3, duration: 0.8 }
        }
    },

    // 音效設定
    audio: {
        // 主音量
        masterVolume: 1.0,
        musicVolume: 0.7,
        sfxVolume: 1.0,
        
        // 音效間隔（避免過度播放）
        sfxCooldown: 0.05,
        
        // 3D 音效設定
        spatialAudio: {
            maxDistance: 300,
            rolloffFactor: 0.5
        }
    },

    // 效能設定
    performance: {
        // 物件池初始大小
        poolSizes: {
            projectiles: 50,
            enemies: 30,
            particles: 100,
            damageNumbers: 20
        },
        
        // 更新頻率
        updateFrequency: 60, // FPS
        
        // 渲染最佳化
        cullingDistance: 100, // 超出螢幕多少像素後不渲染
        maxParticles: 200,
        maxDamageNumbers: 50
    }
};

/**
 * 遊戲平衡管理器
 * 提供動態調整遊戲平衡的功能
 */
class GameBalanceManager {
    constructor() {
        this.difficultyMultiplier = 1.0;
        this.customSettings = {};
    }

    // 設定難度倍數
    setDifficultyMultiplier(multiplier) {
        this.difficultyMultiplier = Math.max(0.1, multiplier);
    }

    // 獲取調整後的數值
    getValue(category, property = null, subProperty = null) {
        let value;
        
        try {
            if (subProperty) {
                value = GameBalance[category]?.[property]?.[subProperty];
            } else if (property) {
                value = GameBalance[category]?.[property];
            } else {
                value = GameBalance[category];
            }
        } catch (error) {
            console.error(`Error getting game balance value: ${category}.${property}.${subProperty}`, error);
            return null;
        }

        // 應用自定義設定
        const customKey = `${category}.${property}${subProperty ? '.' + subProperty : ''}`;
        if (this.customSettings[customKey] !== undefined) {
            value = this.customSettings[customKey];
        }

        // 某些數值需要應用難度倍數
        if (this.shouldApplyDifficulty(category, property)) {
            value *= this.difficultyMultiplier;
        }

        return value;
    }

    // 設定自定義數值
    setCustomValue(path, value) {
        this.customSettings[path] = value;
    }

    // 重置自定義設定
    resetCustomSettings() {
        this.customSettings = {};
    }

    // 檢查是否應該應用難度倍數
    shouldApplyDifficulty(category, property) {
        const difficultyAffectedProperties = [
            'enemies.health',
            'enemies.damage',
            'enemies.speed',
            'waves.spawnRate',
            'waves.enemyCount'
        ];
        
        return difficultyAffectedProperties.includes(`${category}.${property}`);
    }

    // 導出當前設定
    exportSettings() {
        return {
            difficultyMultiplier: this.difficultyMultiplier,
            customSettings: { ...this.customSettings }
        };
    }

    // 導入設定
    importSettings(settings) {
        this.difficultyMultiplier = settings.difficultyMultiplier || 1.0;
        this.customSettings = { ...settings.customSettings } || {};
    }
}

// 全域遊戲平衡管理器
const gameBalance = new GameBalanceManager();