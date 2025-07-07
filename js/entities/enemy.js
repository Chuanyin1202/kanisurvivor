/**
 * 敵人基礎類別
 * 所有敵人類型的基礎實作
 */
class Enemy {
    constructor(x, y, type = 'slime') {
        this.type = type;
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.target = null; // 追擊目標（通常是玩家）
        
        // 從配置獲取基礎屬性
        const enemyData = gameBalance.getValue('enemies', type);
        
        if (!enemyData) {
            console.warn(`敵人類型 '${type}' 配置未找到，使用預設值`);
            this.maxHealth = 30;
            this.health = this.maxHealth;
            this.speed = 50;
            this.damage = 10;
            this.experienceReward = 10;
            this.goldReward = 5;
            this.size = 20;
            this.radius = this.size / 2;
        } else {
            this.maxHealth = enemyData.health;
            this.health = this.maxHealth;
            this.speed = enemyData.speed;
            this.damage = enemyData.damage;
            this.experienceReward = enemyData.experienceReward;
            this.goldReward = enemyData.goldReward;
            this.size = enemyData.size || 20;
            this.radius = this.size / 2;
        }
        
        // 狀態
        this.isAlive = true;
        this.isActive = true;
        this.spawnTime = Date.now();
        
        // AI 行為
        this.aiState = 'chase'; // chase, attack, idle, flee
        this.aiTimer = 0;
        this.lastAttackTime = 0;
        this.attackCooldown = 0.3; // 攻擊冷卻時間（秒） - 大幅減少提高威脅
        this.detectionRange = 300; // 偵測範圍
        this.attackRange = 25; // 攻擊範圍
        
        // 移動相關
        this.moveDirection = new Vector2(0, 0);
        this.lastPosition = this.position.copy();
        this.stuckTimer = 0;
        this.stuckThreshold = 2.0; // 卡住判定時間
        
        // 視覺效果
        this.animation = {
            state: 'idle',
            frame: 0,
            time: 0,
            speed: 0.2
        };
        this.flashTime = 0; // 受傷閃爍時間
        this.deathTime = 0; // 死亡動畫時間
        
        // 狀態效果
        this.statusEffects = [];
        
        // 特殊行為（首領等）
        this.specialAbilities = [];
        this.specialCooldowns = {};
        
        // 碰撞相關
        this.lastCollisionTime = 0;
        this.collisionCooldown = 0.2; // 碰撞冷卻時間 - 減少冷卻提高連續傷害
    }

    // 更新敵人
    update(deltaTime) {
        if (!this.isAlive) {
            this.updateDeathAnimation(deltaTime);
            return;
        }

        this.updateAI(deltaTime);
        this.updateMovement(deltaTime);
        this.updateStatusEffects(deltaTime);
        this.updateAnimation(deltaTime);
        this.updateSpecialAbilities(deltaTime);
        this.updateTimers(deltaTime);
    }

    // 更新 AI 行為
    updateAI(deltaTime) {
        this.aiTimer += deltaTime;
        
        // 尋找目標
        if (!this.target || this.target.health <= 0) {
            this.findTarget();
        }
        
        if (!this.target) {
            this.aiState = 'idle';
            return;
        }
        
        // 檢查目標位置是否有效
        if (!this.target.position || isNaN(this.target.position.x) || isNaN(this.target.position.y)) {
            console.warn('目標位置無效:', this.target.position);
            this.target = null;
            this.aiState = 'idle';
            return;
        }
        
        const distanceToTarget = this.position.distanceTo(this.target.position);
        
        // 檢查距離計算結果
        if (isNaN(distanceToTarget)) {
            console.warn('距離計算結果為NaN:', {
                enemyPos: this.position,
                targetPos: this.target.position
            });
            this.aiState = 'idle';
            return;
        }
        
        switch (this.aiState) {
            case 'chase':
                this.updateChaseAI(deltaTime, distanceToTarget);
                break;
            case 'attack':
                this.updateAttackAI(deltaTime, distanceToTarget);
                break;
            case 'flee':
                this.updateFleeAI(deltaTime, distanceToTarget);
                break;
            case 'idle':
                this.updateIdleAI(deltaTime);
                break;
        }
    }

    // 追擊 AI
    updateChaseAI(deltaTime, distanceToTarget) {
        if (distanceToTarget <= this.attackRange) {
            this.aiState = 'attack';
            return;
        }
        
        // 移除距離檢查，敵人應該一直追擊玩家
        // if (distanceToTarget > this.detectionRange) {
        //     this.aiState = 'idle';
        //     return;
        // }
        
        // 朝目標移動
        this.moveDirection = Vector2.subtract(this.target.position, this.position).normalize();
        
        // 避免重疊
        this.avoidOtherEnemies();
        
        if (Math.random() < 0.01) { // 偶爾調試輸出
            console.log(`敵人追擊中，距離: ${distanceToTarget.toFixed(1)}, 移動方向: ${this.moveDirection.x.toFixed(2)}, ${this.moveDirection.y.toFixed(2)}`);
        }
    }

    // 攻擊 AI
    updateAttackAI(deltaTime, distanceToTarget) {
        if (distanceToTarget > this.attackRange * 1.5) {
            this.aiState = 'chase';
            return;
        }
        
        // 停止移動準備攻擊
        this.moveDirection.set(0, 0);
        
        // 執行攻擊
        if (this.canAttack()) {
            this.performAttack();
        }
    }

    // 逃跑 AI（特殊情況下才觸發）
    updateFleeAI(deltaTime, distanceToTarget) {
        // 只有在特定條件下才逃跑，一般情況下切換回追擊
        if (this.health > this.maxHealth * 0.1) {
            this.aiState = 'chase';
            return;
        }
        
        // 遠離目標（只在極低血量時）
        this.moveDirection = Vector2.subtract(this.position, this.target.position).normalize();
    }

    // 閒置 AI
    updateIdleAI(deltaTime) {
        this.moveDirection.set(0, 0);
        
        // 偵測附近是否有目標
        if (this.aiTimer > 1.0) {
            this.findTarget();
            this.aiTimer = 0;
        }
    }

    // 更新移動
    updateMovement(deltaTime) {
        // 應用移動方向和速度
        const currentSpeed = this.getEffectiveSpeed();
        this.velocity.copyFrom(this.moveDirection).multiply(currentSpeed);
        
        // 更新位置
        this.position.add(this.velocity.copy().multiply(deltaTime));
        
        // 檢查是否卡住
        this.checkIfStuck(deltaTime);
        
        // 限制在遊戲邊界內
        this.clampToGameBounds();
    }

    // 更新狀態效果
    updateStatusEffects(deltaTime) {
        for (let i = this.statusEffects.length - 1; i >= 0; i--) {
            const effect = this.statusEffects[i];
            effect.duration -= deltaTime;
            
            // 應用效果
            switch (effect.type) {
                case 'burn':
                    effect.damageTimer -= deltaTime;
                    if (effect.damageTimer <= 0) {
                        this.takeDamage(effect.damage, false);
                        effect.damageTimer = 1.0;
                    }
                    break;
                case 'freeze':
                    // 冰凍效果在 getEffectiveSpeed 中處理
                    break;
                case 'poison':
                    effect.damageTimer -= deltaTime;
                    if (effect.damageTimer <= 0) {
                        this.takeDamage(effect.damage, false);
                        effect.damageTimer = 0.5;
                    }
                    break;
            }
            
            if (effect.duration <= 0) {
                this.statusEffects.splice(i, 1);
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
        
        // 設定動畫狀態
        if (this.moveDirection.length() > 0.1) {
            this.animation.state = 'move';
        } else if (this.aiState === 'attack') {
            this.animation.state = 'attack';
        } else {
            this.animation.state = 'idle';
        }
        
        // 更新受傷閃爍
        if (this.flashTime > 0) {
            this.flashTime -= deltaTime;
        }
    }

    // 更新特殊能力
    updateSpecialAbilities(deltaTime) {
        this.specialAbilities.forEach(ability => {
            if (this.specialCooldowns[ability] > 0) {
                this.specialCooldowns[ability] -= deltaTime;
            }
        });
        
        // 首領特殊攻擊
        if (this.type === 'boss' && this.target) {
            this.updateBossAbilities(deltaTime);
        }
    }

    // 更新計時器
    updateTimers(deltaTime) {
        if (this.lastAttackTime > 0) {
            this.lastAttackTime -= deltaTime;
        }
        
        if (this.lastCollisionTime > 0) {
            this.lastCollisionTime -= deltaTime;
        }
    }

    // 首領特殊能力
    updateBossAbilities(deltaTime) {
        const distanceToTarget = this.position.distanceTo(this.target.position);
        
        // 衝鋒攻擊
        if (!this.specialCooldowns['charge'] || this.specialCooldowns['charge'] <= 0) {
            if (distanceToTarget > 100 && distanceToTarget < 200) {
                this.performCharge();
                this.specialCooldowns['charge'] = 5.0;
            }
        }
        
        // 召喚小兵
        if (!this.specialCooldowns['summon'] || this.specialCooldowns['summon'] <= 0) {
            if (this.health < this.maxHealth * 0.5) {
                this.performSummon();
                this.specialCooldowns['summon'] = 10.0;
            }
        }
    }

    // 尋找目標
    findTarget() {
        // 直接將玩家設為目標，不需要距離限制
        if (window.player && window.player.health > 0) {
            this.target = window.player;
            if (Math.random() < 0.01) { // 偶爾調試輸出
                const distance = this.position.distanceTo(window.player.position);
                console.log(`敵人找到目標，距離: ${distance.toFixed(1)}`);
            }
        } else {
            if (Math.random() < 0.01) {
                console.log('敵人無法找到玩家目標', !!window.player);
            }
        }
    }

    // 避免與其他敵人重疊
    avoidOtherEnemies() {
        if (!window.enemyManager) return;
        
        const enemies = enemyManager.enemies.filter(enemy => 
            enemy !== this && 
            enemy.isAlive && 
            enemy.isActive && 
            enemy.position.distanceTo(this.position) <= this.radius * 3
        );
        const avoidanceForce = new Vector2(0, 0);
        
        enemies.forEach(enemy => {
            if (enemy === this || !enemy.isAlive) return;
            
            const distance = this.position.distanceTo(enemy.position);
            if (distance < this.radius + enemy.radius + 10) {
                const direction = Vector2.subtract(this.position, enemy.position);
                if (direction.length() > 0) {
                    direction.normalize().multiply(1.0 / Math.max(distance, 1));
                    avoidanceForce.add(direction);
                }
            }
        });
        
        if (avoidanceForce.length() > 0) {
            avoidanceForce.normalize().multiply(0.3);
            this.moveDirection.add(avoidanceForce).normalize();
        }
    }

    // 檢查是否卡住
    checkIfStuck(deltaTime) {
        const distanceMoved = this.position.distanceTo(this.lastPosition);
        
        if (distanceMoved < 1.0 && this.moveDirection.length() > 0.1) {
            this.stuckTimer += deltaTime;
            
            if (this.stuckTimer > this.stuckThreshold) {
                // 隨機改變方向來擺脫卡住狀態
                const randomAngle = Math.random() * Math.PI * 2;
                this.moveDirection = Vector2.fromAngle(randomAngle);
                this.stuckTimer = 0;
            }
        } else {
            this.stuckTimer = 0;
        }
        
        this.lastPosition.copyFrom(this.position);
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

    // 檢查是否可以攻擊
    canAttack() {
        return this.lastAttackTime <= 0;
    }

    // 執行攻擊
    performAttack() {
        if (!this.target) return;
        
        this.lastAttackTime = this.attackCooldown;
        
        // 對玩家造成傷害
        if (this.target.takeDamage) {
            this.target.takeDamage(this.damage);
        }
        
        // 攻擊動畫和效果
        this.animation.state = 'attack';
        this.animation.frame = 0;
        
        console.log(`${this.type} 攻擊了目標，造成 ${this.damage} 傷害`);
    }

    // 首領衝鋒攻擊
    performCharge() {
        if (!this.target) return;
        
        const direction = Vector2.subtract(this.target.position, this.position).normalize();
        this.velocity.copyFrom(direction).multiply(this.speed * 3);
        
        console.log(`${this.type} 發動衝鋒攻擊！`);
    }

    // 首領召喚小兵
    performSummon() {
        if (!window.enemyManager) return;
        
        // 在周圍生成小兵
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 / 3) * i;
            const spawnPos = Vector2.add(this.position, Vector2.fromAngle(angle, 50));
            enemyManager.spawnEnemy('slime', spawnPos.x, spawnPos.y);
        }
        
        console.log(`${this.type} 召喚了小兵！`);
    }

    // 受到傷害
    takeDamage(damage, showEffect = true, isCritical = false) {
        if (!this.isAlive) return false;
        
        const oldHealth = this.health;
        this.health -= damage;
        this.flashTime = 0.2; // 受傷閃爍
        
        // 調試信息：完整傷害追蹤（使用 Debug 面板）
        // console.log(`🩸 ${this.type} 受到傷害: ${damage}, 爆擊: ${isCritical}, 血量: ${oldHealth.toFixed(1)} -> ${this.health.toFixed(1)}`);
        
        if (showEffect) {
            // 顯示傷害數字 - 現在正確傳遞爆擊信息
            // console.log(`📊 顯示傷害數字: 傷害=${damage}, 爆擊=${isCritical}`);
            this.showDamageNumber(damage, isCritical);
            
            // 擊退效果
            if (this.target) {
                const knockback = Vector2.subtract(this.position, this.target.position).normalize().multiply(20);
                this.position.add(knockback);
            }
        }
        
        // 檢查死亡
        if (this.health <= 0) {
            this.die();
            return true;
        }
        
        // 受傷後保持或切換到追擊狀態
        if (this.aiState === 'idle' || this.aiState === 'flee') {
            this.aiState = 'chase';
        }
        
        return true;
    }

    // 顯示傷害數字
    showDamageNumber(damage, isCritical = false) {
        // 檢查設定（如果設定不存在，預設顯示）
        if (window.gameSettings && !gameSettings.get('graphics', 'showDamageNumbers')) {
            return;
        }
        
        const damageNumber = {
            position: Vector2.add(this.position, new Vector2(Math.random() * 20 - 10, -20)),
            damage: Math.round(damage),
            life: 2.0,
            velocity: new Vector2(Math.random() * 40 - 20, -50),
            color: isCritical ? '#ff0000' : '#ffffff', // 爆擊用紅色
            fontSize: isCritical ? 24 : 14, // 爆擊用更大字體
            isCrit: isCritical
        };
        
        if (window.effectsManager) {
            effectsManager.addDamageNumber(damageNumber);
            console.log(isCritical ? '🔥 顯示爆擊傷害:' : '💥 顯示傷害數字:', damage);
        } else {
            console.warn('❌ EffectsManager 未就緒，無法顯示傷害數字');
        }
    }

    // 死亡
    die() {
        if (!this.isAlive) return;
        
        this.isAlive = false;
        this.deathTime = 0; // 初始化死亡動畫時間
        // 不立即設定 isActive = false，讓死亡動畫播放完畢
        
        // 給玩家經驗值和擊殺數
        if (this.target && this.target.addExperience) {
            this.target.addExperience(this.experienceReward);
            this.target.addKill();
        }
        
        // 掉落金幣
        this.dropGold();
        
        // 死亡效果
        this.createDeathEffects();
        
        console.log(`${this.type} 被擊敗了！`);
    }

    // 掉落金幣
    dropGold() {
        const goldAmount = this.goldReward + Math.floor(Math.random() * 3);
        
        if (window.lootManager) {
            lootManager.spawnGold(this.position.x, this.position.y, goldAmount);
        }
    }

    // 創建死亡效果
    createDeathEffects() {
        if (!window.effectsManager) return;
        
        // 血液粒子
        for (let i = 0; i < 5; i++) {
            const particle = {
                position: this.position.copy(),
                velocity: Vector2.random(100),
                life: 1.0,
                size: 3,
                color: '#ff0000'
            };
            effectsManager.addParticle(particle);
        }
    }

    // 更新死亡動畫
    updateDeathAnimation(deltaTime) {
        this.deathTime += deltaTime; // 修正：應該是增加而不是減少
        
        if (this.deathTime >= 1.0) { // 死亡動畫持續1秒後移除
            this.isActive = false; // 標記為可移除
        }
    }

    // 添加狀態效果
    addStatusEffect(type, duration, data = {}) {
        const effect = {
            type: type,
            duration: duration,
            ...data
        };
        
        if (type === 'burn' || type === 'poison') {
            effect.damageTimer = 0;
        }
        
        this.statusEffects.push(effect);
    }

    // 獲取有效速度
    getEffectiveSpeed() {
        let speed = this.speed;
        
        // 狀態效果影響
        this.statusEffects.forEach(effect => {
            switch (effect.type) {
                case 'slow':
                    speed *= 0.5;
                    break;
                case 'freeze':
                    speed *= 0.1;
                    break;
                case 'haste':
                    speed *= 1.5;
                    break;
            }
        });
        
        return speed;
    }

    // 檢查碰撞
    checkCollision(other) {
        if (!other || !other.position) return false;
        
        const distance = this.position.distanceTo(other.position);
        return distance < (this.radius + other.radius);
    }

    // 渲染敵人
    render(renderer) {
        if (!this.isActive || !this.isAlive) return;
        
        // 移除死亡淡出效果，死亡敵人直接不渲染
        let alpha = 1.0;
        
        // 受傷閃爍效果
        if (this.flashTime > 0 && Math.floor(Date.now() / 50) % 2) {
            return;
        }
        
        // 根據類型選擇顏色
        let color = '#ff6b6b'; // 預設紅色
        switch (this.type) {
            case 'slime':
                color = '#4ecdc4';
                break;
            case 'goblin':
                color = '#45b7d1';
                break;
            case 'orc':
                color = '#f9ca24';
                break;
            case 'boss':
                color = '#6c5ce7';
                break;
        }
        
        // 繪製敵人主體
        if (alpha < 1.0) {
            renderer.drawCircleWithAlpha(this.position.x, this.position.y, this.radius, color, alpha);
        } else {
            renderer.drawCircle(this.position.x, this.position.y, this.radius, color);
        }
        
        // 渲染狀態效果視覺
        this.renderStatusEffects(renderer);
        
        // 繪製血量條
        if (this.isAlive && this.health < this.maxHealth) {
            this.renderHealthBar(renderer);
        }
        
        // 首領特殊標記
        if (this.type === 'boss') {
            renderer.drawCircle(this.position.x, this.position.y, this.radius + 5, '#ffffff', false);
        }
    }

    // 渲染血量條
    renderHealthBar(renderer) {
        const barWidth = this.radius * 2;
        const barHeight = 4;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.radius - 10;
        
        // 背景
        renderer.drawRect(barX, barY, barWidth, barHeight, '#000000');
        
        // 血量
        const healthPercent = this.health / this.maxHealth;
        const healthWidth = barWidth * healthPercent;
        
        let healthColor = '#4ecdc4';
        if (healthPercent < 0.3) {
            healthColor = '#ff4757';
        } else if (healthPercent < 0.6) {
            healthColor = '#ffa502';
        }
        
        renderer.drawRect(barX, barY, healthWidth, barHeight, healthColor);
    }

    // 渲染狀態效果
    renderStatusEffects(renderer) {
        const time = Date.now() / 1000;
        
        // 燃燒效果 - 紅色火焰粒子
        if (this.hasStatusEffect('burn')) {
            this.renderBurnEffect(renderer, time);
        }
        
        // 中毒效果 - 綠色毒氣泡泡
        if (this.hasStatusEffect('poison')) {
            this.renderPoisonEffect(renderer, time);
        }
        
        // 冰凍效果 - 藍色冰晶
        if (this.hasStatusEffect('freeze') || this.hasStatusEffect('slow')) {
            this.renderFreezeEffect(renderer, time);
        }
    }

    // 渲染燃燒效果
    renderBurnEffect(renderer, time) {
        const fireIntensity = 0.7 + 0.3 * Math.sin(time * 8);
        
        // 外圈紅色光暈
        renderer.drawCircleWithAlpha(
            this.position.x, 
            this.position.y, 
            this.radius + 3, 
            '#ff4757', 
            0.3 * fireIntensity
        );
        
        // 內圈橙色光暈
        renderer.drawCircleWithAlpha(
            this.position.x, 
            this.position.y, 
            this.radius + 1, 
            '#ffa502', 
            0.5 * fireIntensity
        );
        
        // 火焰粒子效果
        for (let i = 0; i < 3; i++) {
            const angle = time * 2 + i * (Math.PI * 2 / 3);
            const x = this.position.x + Math.cos(angle) * (this.radius + 2);
            const y = this.position.y + Math.sin(angle) * (this.radius + 2) - Math.sin(time * 6) * 2;
            
            renderer.drawCircleWithAlpha(x, y, 2, '#ff6b35', 0.8);
        }
    }

    // 渲染中毒效果
    renderPoisonEffect(renderer, time) {
        const bubbleIntensity = 0.6 + 0.4 * Math.sin(time * 5);
        
        // 綠色毒氣光暈
        renderer.drawCircleWithAlpha(
            this.position.x, 
            this.position.y, 
            this.radius + 2, 
            '#10ac84', 
            0.4 * bubbleIntensity
        );
        
        // 毒氣泡泡效果
        for (let i = 0; i < 4; i++) {
            const bubbleTime = time * 3 + i * 0.8;
            const angle = i * (Math.PI * 2 / 4);
            const distance = this.radius + 1 + Math.sin(bubbleTime) * 3;
            const x = this.position.x + Math.cos(angle) * distance;
            const y = this.position.y + Math.sin(angle) * distance;
            const size = 1.5 + Math.sin(bubbleTime * 2) * 0.5;
            
            renderer.drawCircleWithAlpha(x, y, size, '#2ed573', 0.7);
        }
        
        // 中心毒霧
        renderer.drawCircleWithAlpha(
            this.position.x, 
            this.position.y, 
            this.radius - 2, 
            '#55a3ff', 
            0.2 * bubbleIntensity
        );
    }

    // 渲染冰凍效果
    renderFreezeEffect(renderer, time) {
        const crystalIntensity = 0.8 + 0.2 * Math.sin(time * 4);
        
        // 藍色冰霜光暈
        renderer.drawCircleWithAlpha(
            this.position.x, 
            this.position.y, 
            this.radius + 2, 
            '#74b9ff', 
            0.4 * crystalIntensity
        );
        
        // 冰晶效果
        for (let i = 0; i < 6; i++) {
            const angle = i * (Math.PI / 3) + time * 0.5;
            const distance = this.radius + 1;
            const x = this.position.x + Math.cos(angle) * distance;
            const y = this.position.y + Math.sin(angle) * distance;
            
            // 繪製冰晶形狀（簡化為小方塊）
            renderer.drawRect(x - 1, y - 1, 2, 2, '#a7d8ff');
        }
    }

    // 檢查是否有指定狀態效果
    hasStatusEffect(type) {
        return this.statusEffects.some(effect => effect.type === type);
    }

    // 獲取敵人資訊
    getInfo() {
        return {
            type: this.type,
            position: this.position.copy(),
            health: this.health,
            maxHealth: this.maxHealth,
            isAlive: this.isAlive,
            aiState: this.aiState,
            statusEffects: [...this.statusEffects]
        };
    }
}