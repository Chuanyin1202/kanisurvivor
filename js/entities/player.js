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
        
        this.setupEventListeners();
    }

    // 設定事件監聽
    setupEventListeners() {
        // 滑鼠移動
        document.addEventListener('mousemove', (event) => {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            this.input.mouseX = event.clientX - rect.left;
            this.input.mouseY = event.clientY - rect.top;
        });

        // 滑鼠點擊（施放法術）
        document.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // 左鍵
                this.input.spellPressed = true;
            }
        });

        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                this.input.spellPressed = false;
            }
        });

        // 鍵盤控制
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.input.moveY = -1;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.input.moveY = 1;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.input.moveX = -1;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.input.moveX = 1;
                    break;
                case 'Space':
                    this.input.dashPressed = true;
                    event.preventDefault();
                    break;
                case 'Digit1':
                    this.selectedSpell = 'fireball';
                    break;
                case 'Digit2':
                    this.selectedSpell = 'frostbolt';
                    break;
                case 'Digit3':
                    this.selectedSpell = 'lightning';
                    break;
                case 'Digit4':
                    this.selectedSpell = 'arcane';
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                case 'KeyS':
                case 'ArrowDown':
                    this.input.moveY = 0;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                case 'KeyD':
                case 'ArrowRight':
                    this.input.moveX = 0;
                    break;
                case 'Space':
                    this.input.dashPressed = false;
                    break;
            }
        });
    }

    // 更新玩家
    update(deltaTime) {
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

        // 設定移動方向
        this.moveDirection.set(this.input.moveX, this.input.moveY);
        
        // 正規化對角線移動
        if (this.moveDirection.length() > 0) {
            this.moveDirection.normalize();
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }

        // 計算速度
        const currentSpeed = this.getEffectiveSpeed();
        this.velocity.copyFrom(this.moveDirection).multiply(currentSpeed);

        // 更新位置
        this.position.add(this.velocity.copy().multiply(deltaTime));

        // 更新面向角度（朝向滑鼠）
        const canvas = document.getElementById('gameCanvas');
        if (canvas && window.renderer) {
            const worldMouse = renderer.screenToWorld(this.input.mouseX, this.input.mouseY);
            this.facing = this.position.angleTo(worldMouse);
        }

        // 限制在遊戲邊界內
        this.clampToGameBounds();
    }

    // 更新法術施放
    updateSpells(deltaTime) {
        // 自動攻擊：如果附近有敵人就自動施法
        if (this.canCastSpell()) {
            const nearbyEnemy = this.findNearestEnemy();
            if (nearbyEnemy) {
                this.castSpell();
            }
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
        const manaRegen = gameBalance.getValue('player', 'manaRegen');
        
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
        
        if (this.mana < spellData.manaCost) {
            return false;
        }
        
        // 消耗魔法值
        this.mana -= spellData.manaCost;
        
        // 設定冷卻時間
        this.spellCooldown = gameBalance.getValue('player', 'spellCooldown');
        
        // 創建法術投射物
        this.createProjectile(spellData);
        
        // 更新統計
        this.stats.spellsCast++;
        
        return true;
    }

    // 創建法術投射物
    createProjectile(spellData) {
        if (!window.projectileManager) return;
        
        // 自動瞄準最近的敵人
        const nearestEnemy = this.findNearestEnemy();
        let direction;
        
        if (nearestEnemy) {
            // 朝最近的敵人射擊
            direction = Vector2.subtract(nearestEnemy.position, this.position).normalize();
        } else {
            // 沒有敵人時朝面向方向射擊
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
        
        // 暴擊檢查
        if (Math.random() < this.critChance) {
            damage *= this.critDamage;
        }
        
        // 裝備加成
        damage *= this.getEquipmentDamageMultiplier();
        
        return Math.round(damage);
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
        
        let actualDamage = damage;
        
        if (canBlock) {
            // 計算防禦減傷
            actualDamage = Math.max(1, damage - this.defense);
        }
        
        this.health -= actualDamage;
        this.stats.damageTaken += actualDamage;
        
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

    // 升級
    levelUp() {
        this.experience -= this.experienceToNext;
        this.level++;
        
        // 計算下一級所需經驗
        const baseExp = gameBalance.getValue('player', 'levelUp', 'experienceBase');
        const growth = gameBalance.getValue('player', 'levelUp', 'experienceGrowth');
        this.experienceToNext = Math.floor(baseExp * Math.pow(growth, this.level - 1));
        
        // 屬性成長
        const healthGrowth = gameBalance.getValue('player', 'levelUp', 'healthGrowth');
        const manaGrowth = gameBalance.getValue('player', 'levelUp', 'manaGrowth');
        const attackGrowth = gameBalance.getValue('player', 'levelUp', 'attackGrowth');
        const defenseGrowth = gameBalance.getValue('player', 'levelUp', 'defenseGrowth');
        
        this.maxHealth += healthGrowth;
        this.maxMana += manaGrowth;
        this.attack += attackGrowth;
        this.defense += defenseGrowth;
        
        // 完全恢復生命和魔法
        this.health = this.maxHealth;
        this.mana = this.maxMana;
        
        // 視覺效果
        if (window.renderer) {
            renderer.startShake(3, 0.8);
        }
        
        console.log(`等級提升！現在是 ${this.level} 級`);
    }

    // 增加擊殺數
    addKill() {
        this.stats.kills++;
        this.stats.currentCombo++;
        this.stats.comboTimer = 3.0; // 3秒內沒有擊殺就重置連擊
        
        if (this.stats.currentCombo > this.stats.maxCombo) {
            this.stats.maxCombo = this.stats.currentCombo;
        }
    }

    // 死亡
    die() {
        console.log('玩家死亡');
        
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
        const canvas = document.getElementById('gameCanvas');
        
        if (canvas) {
            this.position.x = Math.max(margin, Math.min(canvas.width - margin, this.position.x));
            this.position.y = Math.max(margin, Math.min(canvas.height - margin, this.position.y));
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