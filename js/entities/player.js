/**
 * 玩家角色類別 - Kani 魔法貓咪
 * 處理玩家的移動、法術施放、屬性等
 */
class Player {
    constructor(x, y) {
        // 位置和物理屬性
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.size = new Vector2(32, 32);
        this.radius = gameBalance.getValue('player', 'radius');
        
        // 基礎屬性
        this.level = 1;
        this.experience = 0;
        this.experienceToNext = gameBalance.getValue('player', 'levelUp', 'experienceBase');
        
        // 生命值和魔法值
        this.maxHealth = gameBalance.getValue('player', 'baseHealth');
        this.health = this.maxHealth;
        this.maxMana = gameBalance.getValue('player', 'baseMana');
        this.mana = this.maxMana;
        
        // 戰鬥屬性
        this.attack = gameBalance.getValue('player', 'baseAttack');
        this.defense = gameBalance.getValue('player', 'baseDefense');
        this.critChance = gameBalance.getValue('player', 'baseCritChance');
        this.critDamage = gameBalance.getValue('player', 'baseCritDamage');
        this.speed = gameBalance.getValue('player', 'baseSpeed');
        
        // 法術系統
        this.selectedSpell = 'fireball';
        this.spellCooldown = 0;
        this.lastSpellCast = 0;
        this.selectedSlot = 0; // 當前選中的法術槽位
        
        // 法術槽位系統 (4個槽位) - 機甲魔法風格
        this.spellSlots = [
            { type: 'fireball', name: '烈焰砲擊 - BLAZE CANNON', icon: '🔥', isCustom: false },
            { type: 'frostbolt', name: '氷結射撃 - FREEZE SHOT', icon: '❄️', isCustom: false },
            { type: 'lightning', name: '雷撃衝動 - THUNDER IMPULSE', icon: '⚡', isCustom: false },
            { type: 'arcane', name: '魔導追尾 - MAGI HOMING', icon: '🔮', isCustom: false }
        ];
        
        // 移動系統
        this.moveDirection = new Vector2(0, 0);
        this.isMoving = false;
        this.facing = 0; // 面向角度
        
        // 衝刺系統
        this.dashCooldown = 0;
        this.isDashing = false;
        this.dashDirection = new Vector2(0, 0);
        this.dashTimeRemaining = 0;
        this.isInvincible = false;
        this.invincibilityTime = 0;
        
        // 視覺效果
        this.animation = {
            state: 'idle', // idle, cast, dash, hit
            frame: 0,
            time: 0,
            speed: 0.1
        };
        
        // 統計資料
        this.stats = {
            kills: 0,
            damageDealt: 0,
            damageTaken: 0,
            spellsCast: 0,
            maxCombo: 0,
            currentCombo: 0,
            comboTimer: 0,
            survivalTime: 0
        };
        
        // 裝備
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
        
        // 狀態效果
        this.statusEffects = [];
        
        // 無人機系統
        this.drones = [];
        this.maxDrones = 0;
        
        // 輸入狀態
        this.input = {
            moveX: 0,
            moveY: 0,
            mouseX: 0,
            mouseY: 0,
            spellPressed: false,
            dashPressed: false
        };
        
        // 生命狀態
        this.isAlive = true;
        
        // 載入法術配置
        this.loadSpellConfiguration();
    }

    // 更新玩家
    update(deltaTime) {
        // 如果玩家已死亡，停止更新
        if (!this.isAlive) {
            return;
        }
        
        this.updateMovement(deltaTime);
        this.updateSpells(deltaTime);
        this.updateDash(deltaTime);
        this.updateStatusEffects(deltaTime);
        this.updateStats(deltaTime);
        this.updateAnimation(deltaTime);
        this.updateCooldowns(deltaTime);
        this.updateRegeneration(deltaTime);
        this.updateDrones(deltaTime);
    }

    // 更新移動
    updateMovement(deltaTime) {
        if (this.isDashing) {
            // 衝刺期間不接受移動輸入
            return;
        }

        // PC控制邏輯：WASD移動 + 滑鼠瞄準
        const canvas = document.getElementById('gameCanvas');
        if (canvas && window.renderer) {
            const worldMouse = renderer.screenToWorld(this.input.mouseX, this.input.mouseY);
            
            // 獲取WASD鍵盤輸入（純移動控制）
            let keyboardDirection = new Vector2(0, 0);
            if (window.inputManager) {
                keyboardDirection = inputManager.getMovementInput();
            }
            
            // 移動邏輯：只使用鍵盤控制
            if (keyboardDirection.length() > 0) {
                this.moveDirection = keyboardDirection.normalize();
                this.isMoving = true;
                
                const currentSpeed = this.getEffectiveSpeed();
                this.velocity.copyFrom(this.moveDirection).multiply(currentSpeed);
                
                // 更新位置
                this.position.add(this.velocity.copy().multiply(deltaTime));
            } else {
                // 沒有鍵盤輸入時停止移動
                this.isMoving = false;
                this.moveDirection.set(0, 0);
                this.velocity.set(0, 0);
            }
            
            // 瞄準邏輯：滑鼠或手機攻擊方向控制
            if (window.mobileControls && mobileControls.isEnabled) {
                const attackDirection = mobileControls.getAttackDirection();
                if (attackDirection) {
                    // 使用手機攻擊方向 dpad
                    this.facing = Math.atan2(attackDirection.y, attackDirection.x);
                } else {
                    // 沒有攻擊輸入時保持當前朝向
                    // this.facing 保持不變
                }
            } else {
                // 桌面端：始終朝向滑鼠（用於射擊方向）
                this.facing = this.position.angleTo(worldMouse);
            }
        }

        // 限制在遊戲邊界內
        this.clampToGameBounds();
    }

    // 更新法術施放
    updateSpells(deltaTime) {
        let shouldCast = false;
        
        // 手機控制：按住攻擊方向時施法
        if (window.mobileControls && mobileControls.isEnabled) {
            shouldCast = mobileControls.isAttacking();
        } else {
            // 桌面端：自動攻擊附近敵人
            const nearbyEnemy = this.findNearestEnemy();
            shouldCast = (nearbyEnemy !== null);
        }
        
        if (shouldCast && this.canCastSpell()) {
            this.castSpell();
        }
    }

    // 更新衝刺
    updateDash(deltaTime) {
        if (this.input.dashPressed && this.canDash()) {
            this.startDash();
        }

        if (this.isDashing) {
            this.dashTimeRemaining -= deltaTime;
            
            if (this.dashTimeRemaining <= 0) {
                this.endDash();
            } else {
                // 衝刺移動
                const dashSpeed = gameBalance.getValue('player', 'dashDistance') / 0.2; // 0.2秒內完成衝刺
                this.position.add(Vector2.multiply(this.dashDirection, dashSpeed * deltaTime));
            }
        }

        // 更新無敵時間
        if (this.isInvincible) {
            this.invincibilityTime -= deltaTime;
            if (this.invincibilityTime <= 0) {
                this.isInvincible = false;
            }
        }
    }

    // 更新狀態效果
    updateStatusEffects(deltaTime) {
        for (let i = this.statusEffects.length - 1; i >= 0; i--) {
            const effect = this.statusEffects[i];
            effect.duration -= deltaTime;
            
            // 應用效果
            if (effect.type === 'burn') {
                effect.damageTimer -= deltaTime;
                if (effect.damageTimer <= 0) {
                    this.takeDamage(effect.damage, false);
                    effect.damageTimer = 1.0; // 每秒造成傷害
                }
            }
            
            if (effect.duration <= 0) {
                this.removeStatusEffect(i);
            }
        }
    }

    // 更新統計資料
    updateStats(deltaTime) {
        this.stats.survivalTime += deltaTime;
        
        // 更新連擊計時器
        if (this.stats.comboTimer > 0) {
            this.stats.comboTimer -= deltaTime;
            if (this.stats.comboTimer <= 0) {
                this.stats.currentCombo = 0;
            }
        }
    }

    // 更新動畫
    updateAnimation(deltaTime) {
        this.animation.time += deltaTime;
        
        if (this.animation.time >= this.animation.speed) {
            this.animation.frame++;
            this.animation.time = 0;
        }
        
        // 根據狀態設定動畫
        if (this.isDashing) {
            this.animation.state = 'dash';
        } else if (this.spellCooldown > 0) {
            this.animation.state = 'cast';
        } else if (this.isMoving) {
            this.animation.state = 'move';
        } else {
            this.animation.state = 'idle';
        }
    }

    // 更新冷卻時間
    updateCooldowns(deltaTime) {
        if (this.spellCooldown > 0) {
            this.spellCooldown -= deltaTime;
        }
        
        if (this.dashCooldown > 0) {
            this.dashCooldown -= deltaTime;
        }
    }

    // 更新生命和魔法恢復
    updateRegeneration(deltaTime) {
        const healthRegen = gameBalance.getValue('player', 'healthRegen');
        let manaRegen = gameBalance.getValue('player', 'manaRegen');
        
        // 戰鬥中MP回復速度提升50%
        const inCombat = this.stats.currentCombo > 0;
        if (inCombat) {
            manaRegen *= 1.5;
        }
        
        this.health = Math.min(this.maxHealth, this.health + healthRegen * deltaTime);
        this.mana = Math.min(this.maxMana, this.mana + manaRegen * deltaTime);
    }

    // 更新無人機
    updateDrones(deltaTime) {
        this.drones.forEach(drone => {
            drone.update(deltaTime);
        });
        
        // 移除已銷毀的無人機
        this.drones = this.drones.filter(drone => !drone.isDestroyed);
    }

    // 施放法術
    castSpell() {
        const spellData = gameBalance.getValue('spells', this.selectedSpell);
        
        // 應用能力效果修正法術消耗
        let manaCost = spellData.manaCost;
        if (window.abilityManager) {
            const costMultiplier = abilityManager.checkAbilityTrigger('manaCost');
            manaCost = Math.ceil(manaCost * costMultiplier);
        }
        
        if (this.mana < manaCost) {
            return false;
        }
        
        // 消耗魔法值
        this.mana -= manaCost;
        
        // 應用能力效果修正冷卻時間
        let cooldownTime = gameBalance.getValue('player', 'spellCooldown');
        if (window.abilityManager) {
            const cooldownMultiplier = abilityManager.checkAbilityTrigger('spellCooldown');
            cooldownTime *= cooldownMultiplier;
        }
        this.spellCooldown = cooldownTime;
        
        // 創建法術投射物
        this.createProjectile(spellData);
        
        // 檢查是否觸發額外投射物
        if (window.abilityManager) {
            const extraProjectiles = abilityManager.checkAbilityTrigger('extraProjectile');
            extraProjectiles.forEach((_, index) => {
                // 立即發射額外投射物，但稍微改變角度
                const spreadAngle = (Math.PI / 12) * (index + 1); // 15度間隔
                const leftDirection = Vector2.fromAngle(this.facing - spreadAngle);
                const rightDirection = Vector2.fromAngle(this.facing + spreadAngle);
                
                // 創建額外的投射物
                projectileManager.createSpellProjectile(
                    this.selectedSpell,
                    this.position,
                    leftDirection,
                    this
                );
                projectileManager.createSpellProjectile(
                    this.selectedSpell,
                    this.position,
                    rightDirection,
                    this
                );
                
                console.log('🎯 額外投射物觸發！');
            });
            
            // 檢查法術回音效果
            const echoEffects = abilityManager.checkAbilityTrigger('spellEcho');
            echoEffects.forEach(() => {
                // 立即發射回音法術（稍微延遲以產生視覺效果）
                setTimeout(() => {
                    console.log('✨ 法術回音觸發！');
                    this.createProjectile(spellData);
                }, 100);
            });
        }
        
        // 更新統計
        this.stats.spellsCast++;
        
        return true;
    }

    // 創建法術投射物
    createProjectile(spellData) {
        if (!window.projectileManager) return;
        
        // 檢查是否有自動瞄準能力
        let hasAutoTargeting = false;
        if (window.abilityManager && abilityManager.activeEffects.arcaneHoming) {
            hasAutoTargeting = true;
        }
        
        let direction;
        
        if (hasAutoTargeting) {
            // 有自動瞄準能力時才追擊敵人
            const nearestEnemy = this.findNearestEnemy();
            if (nearestEnemy) {
                direction = Vector2.subtract(nearestEnemy.position, this.position).normalize();
            } else {
                direction = Vector2.fromAngle(this.facing);
            }
        } else {
            // 預設朝滑鼠方向射擊
            direction = Vector2.fromAngle(this.facing);
        }
        
        projectileManager.createSpellProjectile(
            this.selectedSpell,
            this.position,
            direction,
            this
        );
    }

    // 計算法術傷害
    calculateSpellDamage(baseDamage) {
        let damage = baseDamage + this.attack;
        let isCritical = false;
        
        // 詳細的傷害計算調試輸出
        const debugMode = window.debugManager && debugManager.isEnabled;
        if (debugMode) {
            console.log(`🎯 傷害計算開始 - 基礎: ${baseDamage}, 攻擊力: ${this.attack}, 初始傷害: ${damage}`);
            console.log(`⚡ 爆擊設定 - 爆擊率: ${(this.critChance * 100).toFixed(1)}%, 爆擊倍數: ${this.critDamage}x`);
        }
        
        // 應用能力效果修正法術傷害
        if (window.abilityManager) {
            const spellDamageMultiplier = abilityManager.checkAbilityTrigger('spellDamage');
            const oldDamage = damage;
            damage *= spellDamageMultiplier;
            
            if (debugMode && spellDamageMultiplier !== 1) {
                console.log(`✨ 能力效果: 法術傷害倍數 ${spellDamageMultiplier}x, ${oldDamage} -> ${damage}`);
            }
        }
        
        // 暴擊檢查
        const critRoll = Math.random();
        if (critRoll < this.critChance) {
            const oldDamage = damage;
            damage *= this.critDamage;
            isCritical = true;
            
            // 增強爆擊調試信息，始終顯示
            console.log(`💥 爆擊觸發! 隨機值: ${critRoll.toFixed(3)}, 爆擊率: ${(this.critChance * 100).toFixed(1)}%, 倍數: ${this.critDamage}x`);
            console.log(`💥 爆擊傷害: ${oldDamage.toFixed(1)} -> ${damage.toFixed(1)} (+${(damage - oldDamage).toFixed(1)})`);
            
            // 暴擊時觸發螢幕震動
            if (window.renderer) {
                renderer.startShake(8, 0.4); // 強度8，持續0.4秒
            }
        } else {
            if (debugMode) {
                console.log(`⚪ 未爆擊 - 隨機值: ${critRoll.toFixed(3)}, 需要: <${this.critChance.toFixed(3)}`);
            }
        }
        
        // 裝備加成
        const equipmentMultiplier = this.getEquipmentDamageMultiplier();
        if (equipmentMultiplier !== 1) {
            const oldDamage = damage;
            damage *= equipmentMultiplier;
            if (debugMode) {
                console.log(`⚔️ 裝備加成: ${equipmentMultiplier}x, ${oldDamage} -> ${damage}`);
            }
        }
        
        // 最終傷害輸出 - 總是顯示以便調試
        console.log(`🏆 最終傷害: ${Math.round(damage)} ${isCritical ? '(💥爆擊💥)' : '(普通)'} | 基礎:${baseDamage} + 攻擊:${this.attack}`);
        
        return {
            damage: Math.round(damage),
            isCritical: isCritical
        };
    }

    // 開始衝刺
    startDash() {
        this.isDashing = true;
        this.dashTimeRemaining = 0.2; // 0.2秒衝刺時間
        this.dashCooldown = gameBalance.getValue('player', 'dashCooldown');
        
        // 設定衝刺方向
        if (this.moveDirection.length() > 0) {
            this.dashDirection.copyFrom(this.moveDirection);
        } else {
            // 如果沒有移動輸入，朝滑鼠方向衝刺
            const canvas = document.getElementById('gameCanvas');
            if (canvas && window.renderer) {
                const worldMouse = renderer.screenToWorld(this.input.mouseX, this.input.mouseY);
                this.dashDirection = Vector2.subtract(worldMouse, this.position).normalize();
            }
        }
        
        // 短暫無敵
        this.isInvincible = true;
        this.invincibilityTime = gameBalance.getValue('player', 'dashInvincibilityTime');
    }

    // 結束衝刺
    endDash() {
        this.isDashing = false;
        this.dashTimeRemaining = 0;
    }

    // 受到傷害
    takeDamage(damage, canBlock = true) {
        if (this.isInvincible) {
            return false;
        }
        
        // 檢查閣避能力
        if (window.abilityManager) {
            const dodgeResults = abilityManager.checkAbilityTrigger('dodge');
            if (dodgeResults.length > 0) {
                console.log('✨ 閣避成功！');
                return false; // 完全閣避傷害
            }
        }
        
        let actualDamage = damage;
        
        if (canBlock) {
            // 計算防禦減傷
            actualDamage = Math.max(1, damage - this.defense);
        }
        
        this.health -= actualDamage;
        this.stats.damageTaken += actualDamage;
        
        // EVA字體系統：根據生命值變化調整同步率和情緒狀態
        if (window.evaFontSystem) {
            const healthPercent = (this.health / this.maxHealth) * 100;
            evaFontSystem.setSyncRate(healthPercent + Math.random() * 10 - 5); // 健康值+隨機波動
            
            if (healthPercent < 25) {
                evaFontSystem.setEmotionalState('panic');
                if (Math.random() < 0.3) { // 30%機率觸發警告
                    evaFontSystem.triggerFlashWarning();
                }
            } else if (healthPercent < 50) {
                evaFontSystem.setEmotionalState('tense');
            } else {
                evaFontSystem.setEmotionalState('calm');
            }
        }
        
        // 視覺效果
        this.animation.state = 'hit';
        
        // 螢幕震動
        if (window.renderer) {
            renderer.startShake(5, 0.3);
        }
        
        // 檢查死亡
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        
        return true;
    }

    // 治療
    heal(amount) {
        const actualHeal = Math.min(amount, this.maxHealth - this.health);
        this.health += actualHeal;
        return actualHeal;
    }

    // 恢復魔法
    restoreMana(amount) {
        const actualRestore = Math.min(amount, this.maxMana - this.mana);
        this.mana += actualRestore;
        return actualRestore;
    }

    // 增加經驗值
    addExperience(amount) {
        this.experience += amount;
        
        while (this.experience >= this.experienceToNext) {
            this.levelUp();
        }
    }

    // 升級 - 新的能力選擇系統
    levelUp() {
        this.experience -= this.experienceToNext;
        this.level++;
        
        // 計算下一級所需經驗
        const baseExp = gameBalance.getValue('player', 'levelUp', 'experienceBase');
        const growth = gameBalance.getValue('player', 'levelUp', 'experienceGrowth');
        this.experienceToNext = Math.floor(baseExp * Math.pow(growth, this.level - 1));
        
        // 完全恢復生命和魔法（保留這個升級獎勵）
        this.health = this.maxHealth;
        this.mana = this.maxMana;
        
        // 視覺效果
        if (window.renderer) {
            renderer.startShake(3, 0.8);
        }
        
        console.log(`🆙 等級提升！現在是 ${this.level} 級`);
        
        // 調試輸出
        console.log('📊 當前環境狀態:', {
            abilityManager: !!window.abilityManager,
            AbilityDatabase: typeof AbilityDatabase !== 'undefined',
            initFunc: typeof initializeAbilityManager === 'function'
        });
        
        // 觸發能力選擇界面
        this.triggerAbilitySelection();
    }
    
    // 觸發能力選擇界面
    triggerAbilitySelection() {
        // 嘗試初始化AbilityManager（如果還沒有的話）
        if (!window.abilityManager) {
            if (typeof initializeAbilityManager === 'function') {
                console.log('🔄 嘗試初始化 AbilityManager');
                initializeAbilityManager();
            }
        }
        
        if (!window.abilityManager) {
            console.error('❌ AbilityManager 未初始化，跳過升級選擇');
            // 恢復遊戲而不是卡住
            if (window.game) {
                game.resumeGame();
            }
            return;
        }
        
        // 隱藏法術選擇器
        if (window.mobileControls) {
            mobileControls.hideSpellSelector();
        }
        
        // 暫停遊戲
        if (window.game) {
            game.pauseGame();
        }
        
        // 生成三選一能力
        const abilityChoices = abilityManager.generateAbilityChoices(3);
        
        if (abilityChoices.length === 0) {
            console.warn('⚠️ 沒有可用的能力選項，跳過選擇');
            if (window.game) {
                game.resumeGame();
            }
            return;
        }
        
        // 顯示能力選擇UI
        this.showAbilitySelectionUI(abilityChoices);
    }
    
    // 顯示能力選擇UI
    showAbilitySelectionUI(choices) {
        // 創建或顯示升級選擇界面
        let levelUpModal = document.getElementById('levelUpModal');
        
        if (!levelUpModal) {
            levelUpModal = this.createLevelUpModal();
        }
        
        // 清空之前的選項
        const choicesContainer = levelUpModal.querySelector('.ability-choices');
        choicesContainer.innerHTML = '';
        
        // 顯示等級信息
        const levelInfo = levelUpModal.querySelector('.level-info');
        levelInfo.textContent = `恭喜升級到 ${this.level} 級！選擇一個新能力：`;
        
        // 創建能力選項按鈕
        choices.forEach((ability, index) => {
            const choiceButton = this.createAbilityChoiceButton(ability, index);
            choicesContainer.appendChild(choiceButton);
        });
        
        // 顯示模態框
        levelUpModal.classList.remove('hidden');
        levelUpModal.style.display = 'flex';
        
        console.log('🎯 顯示能力選擇界面');
    }
    
    // 創建升級模態框
    createLevelUpModal() {
        const modal = document.createElement('div');
        modal.id = 'levelUpModal';
        modal.className = 'screen-overlay modal';
        modal.innerHTML = `
            <div class="modal-content level-up-content">
                <h2 class="level-info">恭喜升級！</h2>
                <div class="ability-choices"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }
    
    // 創建能力選擇按鈕
    createAbilityChoiceButton(ability, index) {
        const button = document.createElement('div');
        button.className = 'ability-choice-btn';
        button.innerHTML = `
            <div class="ability-icon">${ability.icon}</div>
            <div class="ability-info">
                <h3 class="ability-name rarity-${ability.rarity}">${ability.name}</h3>
                <p class="ability-description">${ability.description}</p>
                <span class="ability-category">${AbilityCategories[ability.category] || ability.category}</span>
            </div>
        `;
        
        // 添加點擊事件
        button.addEventListener('click', () => {
            this.selectAbility(ability.id);
        });
        
        // 添加觸控事件支援（手機專用）
        button.addEventListener('touchstart', (event) => {
            event.preventDefault(); // 防止觸發 click 事件
            button.classList.add('touched'); // 視覺反饋
        });
        
        button.addEventListener('touchend', (event) => {
            event.preventDefault(); // 防止觸發 click 事件
            button.classList.remove('touched');
            this.selectAbility(ability.id);
        });
        
        button.addEventListener('touchcancel', (event) => {
            event.preventDefault();
            button.classList.remove('touched');
        });
        
        // 添加鍵盤事件（1, 2, 3 鍵）
        if (index < 3) {
            const handleKeyPress = (event) => {
                if (event.code === `Digit${index + 1}`) {
                    this.selectAbility(ability.id);
                    document.removeEventListener('keydown', handleKeyPress);
                }
            };
            document.addEventListener('keydown', handleKeyPress);
        }
        
        return button;
    }
    
    // 選擇能力
    selectAbility(abilityId) {
        if (!window.abilityManager) {
            console.error('❌ AbilityManager 未初始化');
            return;
        }
        
        // 激活選中的能力
        const success = abilityManager.selectAbility(abilityId);
        
        if (success) {
            // 隱藏選擇界面
            const levelUpModal = document.getElementById('levelUpModal');
            if (levelUpModal) {
                levelUpModal.classList.add('hidden');
                levelUpModal.style.display = 'none';
            }
            
            // 恢復遊戲
            if (window.game) {
                game.resumeGame();
            }
            
            // 重新顯示法術選擇器
            if (window.mobileControls && mobileControls.isEnabled) {
                mobileControls.showSpellSelector();
            }
            
            console.log('✅ 能力選擇完成，遊戲繼續');
        } else {
            console.error('❌ 能力選擇失敗');
        }
    }

    // 增加擊殺數
    addKill() {
        this.stats.kills++;
        this.stats.currentCombo++;
        this.stats.comboTimer = 3.0; // 3秒內沒有擊殺就重置連擊
        
        // 擊殺回復MP
        this.restoreMana(5);
        
        // 連擊獎勵MP回復 (每10連擊獎勵10MP)
        if (this.stats.currentCombo % 10 === 0) {
            this.restoreMana(10);
            console.log(`🔥 連擊 ${this.stats.currentCombo}！獲得額外MP回復！`);
        }
        
        // 檢查能力效果（吸血等）
        if (window.abilityManager) {
            const killEffects = abilityManager.checkAbilityTrigger('onKill');
            killEffects.forEach(effect => {
                if (effect.type === 'heal') {
                    this.heal(effect.amount);
                    console.log(`🧛 吸血效果：回復 ${effect.amount.toFixed(1)} 生命值`);
                }
            });
        }
        
        if (this.stats.currentCombo > this.stats.maxCombo) {
            this.stats.maxCombo = this.stats.currentCombo;
        }
    }

    // 死亡
    die() {
        if (!this.isAlive) {
            return; // 避免重複死亡
        }
        
        console.log('玩家死亡');
        this.isAlive = false;
        
        // EVA字體系統：死亡時觸發同步失衡
        if (window.evaFontSystem) {
            evaFontSystem.triggerSyncLoss();
            evaFontSystem.onGameStateChange('gameOver');
        }
        
        // 觸發遊戲結束
        if (window.gameStateManager) {
            gameStateManager.changeState('gameOver', {
                survivalTime: Math.floor(this.stats.survivalTime),
                kills: this.stats.kills,
                maxCombo: this.stats.maxCombo,
                goldEarned: this.calculateGoldEarned()
            });
        }
    }
    
    // ========== 法術槽位管理 ==========
    
    // 獲取法術槽位
    getSpellSlots() {
        return this.spellSlots;
    }
    
    // 獲取當前選中的法術
    getCurrentSpell() {
        return this.spellSlots[this.selectedSlot];
    }
    
    // 切換到指定槽位
    switchToSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex >= 4) {
            console.warn('⚠️ 無效的槽位索引:', slotIndex);
            return false;
        }
        
        this.selectedSlot = slotIndex;
        const currentSpell = this.spellSlots[slotIndex];
        
        // 更新selectedSpell以保持向下兼容
        this.selectedSpell = currentSpell.type;
        
        console.log(`🎯 切換到槽位 ${slotIndex + 1}: ${currentSpell.name}`);
        
        // 觸發UI更新事件
        const event = new CustomEvent('spellSlotChanged', {
            detail: { slotIndex: slotIndex, spell: currentSpell }
        });
        document.dispatchEvent(event);
        
        return true;
    }
    
    // 裝備法術到指定槽位
    equipSpellToSlot(slotIndex, spell) {
        if (slotIndex < 0 || slotIndex >= 4) {
            console.warn('⚠️ 無效的槽位索引:', slotIndex);
            return false;
        }
        
        // 如果是合成法術
        if (spell.type === 'fused') {
            this.spellSlots[slotIndex] = {
                type: spell.id,
                name: spell.name,
                icon: this.getElementIcon(spell.elementCombo),
                isCustom: true,
                fusedSpell: spell // 保存完整的合成法術數據
            };
        } else {
            // 基礎法術
            this.spellSlots[slotIndex] = {
                type: spell.type || spell.id,
                name: spell.name,
                icon: spell.icon || this.getSpellIcon(spell.type),
                isCustom: false
            };
        }
        
        console.log(`⚔️ 裝備法術到槽位 ${slotIndex + 1}: ${spell.name}`);
        
        // 如果是當前選中的槽位，更新selectedSpell
        if (this.selectedSlot === slotIndex) {
            this.selectedSpell = this.spellSlots[slotIndex].type;
        }
        
        // 觸發裝備事件
        const event = new CustomEvent('spellEquipped', {
            detail: { slotIndex: slotIndex, spell: this.spellSlots[slotIndex] }
        });
        document.dispatchEvent(event);
        
        this.saveSpellConfiguration();
        return true;
    }
    
    // 獲取法術圖標
    getSpellIcon(spellType) {
        const icons = {
            'fireball': '🔥',
            'frostbolt': '❄️', 
            'lightning': '⚡',
            'arcane': '🔮'
        };
        return icons[spellType] || '✨';
    }
    
    // 獲取元素圖標
    getElementIcon(elements) {
        const iconMap = {
            'F': '🔥',
            'I': '❄️',
            'L': '⚡',
            'A': '🔮'
        };
        
        if (elements && elements.length > 0) {
            return elements.map(e => iconMap[e] || '✨').join('');
        }
        return '✨';
    }
    
    // 保存法術配置
    saveSpellConfiguration() {
        const config = {
            spellSlots: this.spellSlots,
            selectedSlot: this.selectedSlot
        };
        
        localStorage.setItem('playerSpellConfig', JSON.stringify(config));
        console.log('💾 法術配置已保存');
    }
    
    // 載入法術配置
    loadSpellConfiguration() {
        try {
            const saved = localStorage.getItem('playerSpellConfig');
            if (saved) {
                const config = JSON.parse(saved);
                this.spellSlots = config.spellSlots || this.spellSlots;
                this.selectedSlot = config.selectedSlot || 0;
                this.selectedSpell = this.spellSlots[this.selectedSlot].type;
                console.log('📂 法術配置已載入');
            }
        } catch (error) {
            console.error('❌ 載入法術配置失敗:', error);
        }
    }

    // 計算獲得的金幣
    calculateGoldEarned() {
        return this.stats.kills * 2 + Math.floor(this.stats.survivalTime / 10);
    }

    // 檢查是否可以施放法術
    canCastSpell() {
        const spellData = gameBalance.getValue('spells', this.selectedSpell);
        return this.spellCooldown <= 0 && this.mana >= spellData.manaCost;
    }

    // 檢查是否可以衝刺
    canDash() {
        return this.dashCooldown <= 0 && !this.isDashing;
    }

    // 獲取有效速度
    getEffectiveSpeed() {
        let speed = this.speed;
        
        // 狀態效果影響
        this.statusEffects.forEach(effect => {
            if (effect.type === 'slow') {
                speed *= effect.multiplier;
            }
        });
        
        // 裝備加成
        speed += this.getEquipmentSpeedBonus();
        
        return speed;
    }

    // 獲取裝備傷害倍數
    getEquipmentDamageMultiplier() {
        let multiplier = 1.0;
        
        // 武器加成
        if (this.equipment.weapon) {
            multiplier += this.equipment.weapon.damageMultiplier || 0;
        }
        
        return multiplier;
    }

    // 獲取裝備速度加成
    getEquipmentSpeedBonus() {
        let bonus = 0;
        
        Object.values(this.equipment).forEach(item => {
            if (item && item.speed) {
                bonus += item.speed;
            }
        });
        
        return bonus;
    }

    // 限制在遊戲邊界內
    clampToGameBounds() {
        const margin = this.radius;
        // 使用渲染器的邏輯尺寸，而不是Canvas的實際尺寸
        if (window.renderer) {
            this.position.x = Math.max(margin, Math.min(window.renderer.width - margin, this.position.x));
            this.position.y = Math.max(margin, Math.min(window.renderer.height - margin, this.position.y));
        }
    }

    // 添加狀態效果
    addStatusEffect(type, duration, data = {}) {
        const effect = {
            type: type,
            duration: duration,
            ...data
        };
        
        if (type === 'burn') {
            effect.damageTimer = 0;
        }
        
        this.statusEffects.push(effect);
    }

    // 移除狀態效果
    removeStatusEffect(index) {
        this.statusEffects.splice(index, 1);
    }

    // 渲染玩家
    render(renderer) {
        // 無敵閃爍效果
        if (this.isInvincible && Math.floor(Date.now() / 100) % 2) {
            return;
        }
        
        // 繪製玩家（暫時用圓形代替）
        const color = this.isDashing ? '#00ffff' : '#ffffff';
        renderer.drawCircle(this.position.x, this.position.y, this.radius, color);
        
        // 繪製面向指示
        const faceDirection = Vector2.fromAngle(this.facing, this.radius + 10);
        const faceEnd = Vector2.add(this.position, faceDirection);
        renderer.drawLine(this.position.x, this.position.y, faceEnd.x, faceEnd.y, '#ffff00', 2);
        
        // 渲染無人機
        this.drones.forEach(drone => {
            drone.render(renderer);
        });
    }

    // 尋找最近的敵人
    findNearestEnemy() {
        if (!window.enemyManager || !enemyManager.enemies) {
            return null;
        }

        let nearestEnemy = null;
        let minDistance = Infinity;
        
        const spellData = gameBalance.getValue('spells', this.selectedSpell);
        const attackRange = spellData?.range || 400;
        
        if (!spellData && Math.random() < 0.01) { // 只偶爾輸出，避免洪水
            console.warn(`法術資料未找到: ${this.selectedSpell}`, gameBalance.getValue('spells'));
        }

        for (const enemy of enemyManager.enemies) {
            if (enemy.isAlive && enemy.isActive) {
                const distance = this.position.distanceTo(enemy.position);
                if (distance <= attackRange && distance < minDistance) {
                    minDistance = distance;
                    nearestEnemy = enemy;
                }
            }
        }

        return nearestEnemy;
    }

    // 獲取玩家資訊
    getInfo() {
        return {
            level: this.level,
            health: this.health,
            maxHealth: this.maxHealth,
            mana: this.mana,
            maxMana: this.maxMana,
            experience: this.experience,
            experienceToNext: this.experienceToNext,
            stats: { ...this.stats },
            position: this.position.copy(),
            selectedSpell: this.selectedSpell,
            spellCooldown: this.spellCooldown,
            dashCooldown: this.dashCooldown
        };
    }
}