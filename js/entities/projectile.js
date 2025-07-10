/**
 * 投射物類別
 * 處理玩家法術和其他投射物的行為
 */

// 注意：像素圖案和調色板已移至統一的像素動畫架構 (pixelAnimations.js)
// 這個檔案現在將使用 pixelAnimationManager 來處理所有的像素渲染

class Projectile {
    constructor(config) {
        // 基本屬性
        this.position = new Vector2(config.x || 0, config.y || 0);
        this.velocity = new Vector2(config.velX || 0, config.velY || 0);
        this.damage = config.damage || 10;
        this.isCritical = config.isCritical || false;
        this.radius = config.radius || 5;
        this.range = config.range || 300;
        this.distanceTraveled = 0;
        
        // 投射物類型和所有者
        this.type = config.type || 'fireball';
        this.owner = config.owner || null;
        
        // 狀態
        this.isActive = true;
        this.isAlive = true;
        this.canPierce = config.canPierce || false;
        this.pierceCount = 0;
        this.maxPierceCount = config.maxPierceCount || 1;
        this.hitTargets = new Set(); // 已命中的目標
        
        // 特殊效果
        this.areaOfEffect = config.areaOfEffect || 0;
        this.statusEffect = config.statusEffect || null;
        this.statusDuration = config.statusDuration || 0;
        this.statusData = config.statusData || {};
        
        // 歸航導彈
        this.isHoming = config.isHoming || false;
        this.homingStrength = config.homingStrength || 0.1;
        this.homingTarget = null;
        this.homingRange = config.homingRange || 150;
        
        // 視覺效果
        this.color = this.getProjectileColor();
        this.size = config.size || this.radius;
        this.trail = [];
        this.maxTrailLength = 8;
        this.glowIntensity = 1.0;
        
        // 動畫系統
        this.animation = {
            frame: 0,
            time: 0,
            speed: 0.1,
            state: 'normal', // normal, critical, dying
            lastUpdate: 0,
            updateInterval: 0.016 // 60fps
        };
        
        // 生命週期
        this.lifeTime = config.lifeTime || 5.0; // 最大存活時間
        this.age = 0;
        
        // 物理效果
        this.gravity = config.gravity || 0;
        this.friction = config.friction || 1.0;
        this.bounce = config.bounce || false;
        this.bounceCount = 0;
        this.maxBounces = config.maxBounces || 0;
        
        this.setupProjectileProperties();
    }

    // 根據類型設定投射物屬性
    setupProjectileProperties() {
        const spellData = gameBalance.getValue('spells', this.type);
        if (!spellData) return;
        
        // 重要：不要覆蓋已經計算好的傷害（包含爆擊）
        // 只在沒有設定傷害時才使用基礎傷害
        if (this.damage === 10) { // 預設傷害值
            this.damage = spellData.damage;
        }
        
        this.radius = spellData.size;
        this.range = spellData.range;
        this.canPierce = spellData.piercing || false;
        this.areaOfEffect = spellData.areaOfEffect || 0;
        this.statusEffect = spellData.statusEffect;
        this.statusDuration = spellData.statusDuration || 0;
        
        // 特殊屬性
        switch (this.type) {
            case 'fireball':
                this.statusData = { damage: spellData.statusDamage || 2 };
                break;
            case 'frostbolt':
                this.statusData = { multiplier: spellData.slowMultiplier || 0.6 };
                break;
            case 'lightning':
                this.maxPierceCount = spellData.chainTargets || 3;
                this.statusData = { damageReduction: spellData.chainDamageReduction || 0.8 };
                break;
            case 'arcane':
                this.isHoming = true;
                this.homingStrength = spellData.homingStrength || 0.1;
                break;
        }
    }

    // 獲取投射物顏色
    getProjectileColor() {
        const colors = {
            fireball: '#ff6b35',
            frostbolt: '#4fb3d9',
            lightning: '#f7d794',
            arcane: '#a55eea',
            default: '#ffffff'
        };
        
        return colors[this.type] || colors.default;
    }

    // 更新投射物
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.age += deltaTime;
        
        // 檢查生命週期
        if (this.age >= this.lifeTime) {
            this.destroy();
            return;
        }
        
        // 更新歸航系統
        if (this.isHoming) {
            this.updateHoming(deltaTime);
        }
        
        // 應用物理效果
        this.updatePhysics(deltaTime);
        
        // 更新位置
        this.updatePosition(deltaTime);
        
        // 更新軌跡
        this.updateTrail();
        
        // 檢查碰撞
        this.checkCollisions();
        
        // 檢查是否超出範圍
        this.checkRange();
        
        // 更新動畫
        this.updateAnimation(deltaTime);
    }

    // 更新歸航系統
    updateHoming(deltaTime) {
        // 尋找目標
        if (!this.homingTarget || !this.homingTarget.isAlive) {
            this.findHomingTarget();
        }
        
        if (this.homingTarget) {
            const targetDirection = Vector2.subtract(this.homingTarget.position, this.position);
            const distance = targetDirection.length();
            
            if (distance > 0 && distance <= this.homingRange) {
                targetDirection.normalize();
                
                // 平滑轉向目標
                this.velocity.lerp(
                    Vector2.multiply(targetDirection, this.velocity.length()),
                    this.homingStrength
                );
            }
        }
    }

    // 尋找歸航目標
    findHomingTarget() {
        if (!window.enemyManager) return;
        
        const enemies = enemyManager.findEnemiesInRange(this.position, this.homingRange);
        const availableEnemies = enemies.filter(enemy => !this.hitTargets.has(enemy));
        
        if (availableEnemies.length > 0) {
            // 選擇最近的敵人
            this.homingTarget = availableEnemies.reduce((closest, enemy) => {
                const distToCurrent = this.position.distanceTo(enemy.position);
                const distToClosest = this.position.distanceTo(closest.position);
                return distToCurrent < distToClosest ? enemy : closest;
            });
        }
    }

    // 更新物理效果
    updatePhysics(deltaTime) {
        // 重力
        if (this.gravity !== 0) {
            this.velocity.y += this.gravity * deltaTime;
        }
        
        // 摩擦力
        if (this.friction !== 1.0) {
            this.velocity.multiply(Math.pow(this.friction, deltaTime));
        }
    }

    // 更新位置
    updatePosition(deltaTime) {
        const oldPosition = this.position.copy();
        this.position.add(Vector2.multiply(this.velocity, deltaTime));
        this.distanceTraveled += oldPosition.distanceTo(this.position);
        
        // 檢查邊界反彈
        if (this.bounce && this.bounceCount < this.maxBounces) {
            this.checkBounce();
        }
    }

    // 檢查邊界反彈
    checkBounce() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        let bounced = false;
        
        if (this.position.x <= this.radius || this.position.x >= canvas.width - this.radius) {
            this.velocity.x = -this.velocity.x;
            this.position.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.position.x));
            bounced = true;
        }
        
        if (this.position.y <= this.radius || this.position.y >= canvas.height - this.radius) {
            this.velocity.y = -this.velocity.y;
            this.position.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.position.y));
            bounced = true;
        }
        
        if (bounced) {
            this.bounceCount++;
            this.createBounceEffect();
        }
    }

    // 更新軌跡
    updateTrail() {
        this.trail.unshift(this.position.copy());
        
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }
    }

    // 檢查碰撞
    checkCollisions() {
        if (!window.enemyManager) return;
        
        const enemies = enemyManager.findEnemiesInRange(this.position, this.radius + 20);
        
        for (const enemy of enemies) {
            if (!enemy.isAlive || this.hitTargets.has(enemy)) continue;
            
            if (this.checkCollisionWithEnemy(enemy)) {
                this.hitEnemy(enemy);
                
                if (!this.canPierce) {
                    this.destroy();
                    return;
                } else {
                    this.pierceCount++;
                    if (this.pierceCount >= this.maxPierceCount) {
                        this.destroy();
                        return;
                    }
                }
            }
        }
    }

    // 檢查與敵人的碰撞
    checkCollisionWithEnemy(enemy) {
        const distance = this.position.distanceTo(enemy.position);
        return distance <= (this.radius + enemy.radius);
    }

    // 命中敵人
    hitEnemy(enemy) {
        this.hitTargets.add(enemy);
        
        // 計算最終傷害（包含爆擊判定）
        let damage = this.damage;
        let isCritical = false;
        
        // 在命中時才進行爆擊判定
        if (this.owner && this.owner.calculateFinalDamage) {
            const finalDamageInfo = this.owner.calculateFinalDamage(this.damage);
            damage = finalDamageInfo.damage;
            isCritical = finalDamageInfo.isCritical;
        } else if (this.owner && this.owner.critChance) {
            // 向後兼容：直接在這裡進行爆擊判定
            const critRoll = Math.random();
            if (critRoll < this.owner.critChance) {
                damage *= this.owner.critDamage || 2.0;
                isCritical = true;
                console.log(`💥 爆擊觸發! 隨機值: ${critRoll.toFixed(3)}, 爆擊率: ${(this.owner.critChance * 100).toFixed(1)}%`);
            }
        }
        
        // 閃電鏈式傷害遞減
        if (this.type === 'lightning' && this.pierceCount > 0) {
            const oldDamage = damage;
            damage *= Math.pow(this.statusData.damageReduction || 0.8, this.pierceCount);
        }
        
        // 造成傷害（傳遞爆擊信息）
        enemy.takeDamage(Math.round(damage), true, isCritical);
        
        // 應用狀態效果
        if (this.statusEffect && this.statusDuration > 0) {
            enemy.addStatusEffect(this.statusEffect, this.statusDuration, this.statusData);
        }
        
        // 創建命中效果
        this.createHitEffect(enemy.position);
        
        // 區域傷害
        if (this.areaOfEffect > 0) {
            this.dealAreaDamage(enemy.position);
        }
        
        console.log(`${this.type} 命中 ${enemy.type}，造成 ${Math.round(damage)} 傷害`);
    }

    // 區域傷害
    dealAreaDamage(center) {
        if (!window.enemyManager) return;
        
        const enemies = enemyManager.findEnemiesInRange(center, this.areaOfEffect);
        
        enemies.forEach(enemy => {
            if (!enemy.isAlive || this.hitTargets.has(enemy)) return;
            
            const distance = center.distanceTo(enemy.position);
            const damageRatio = 1.0 - (distance / this.areaOfEffect);
            const areaDamage = Math.round(this.damage * 0.5 * damageRatio);
            
            if (areaDamage > 0) {
                // 區域傷害不會爆擊
                enemy.takeDamage(areaDamage, true, false);
                this.hitTargets.add(enemy);
                
                // 狀態效果
                if (this.statusEffect && this.statusDuration > 0) {
                    enemy.addStatusEffect(this.statusEffect, this.statusDuration * 0.5, this.statusData);
                }
            }
        });
        
        // 創建區域效果
        this.createAreaEffect(center);
    }

    // 檢查射程
    checkRange() {
        if (this.distanceTraveled >= this.range) {
            this.destroy();
        }
    }

    // 更新動畫
    updateAnimation(deltaTime) {
        this.animation.time += deltaTime;
        this.animation.lastUpdate += deltaTime;
        
        // 更新動畫狀態
        this.updateAnimationState();
        
        // 更新動畫幀
        if (this.animation.lastUpdate >= this.animation.updateInterval) {
            this.animation.frame++;
            this.animation.lastUpdate = 0;
        }
        
        // 更新發光強度
        this.glowIntensity = 0.8 + 0.4 * Math.sin(this.age * 8);
    }
    
    // 更新動畫狀態
    updateAnimationState() {
        // 根據投射物狀態更新動畫狀態
        if (this.isCritical) {
            this.animation.state = 'critical';
        } else if (this.age > this.lifeTime * 0.8) {
            this.animation.state = 'dying';
        } else {
            this.animation.state = 'normal';
        }
    }

    // 創建命中效果
    createHitEffect(position) {
        if (!window.effectsManager) return;
        
        // 命中粒子
        for (let i = 0; i < 3; i++) {
            const particle = {
                position: position.copy(),
                velocity: Vector2.random(80),
                life: 0.5,
                size: 4,
                color: this.color
            };
            effectsManager.addParticle(particle);
        }
        
        // 特殊效果
        switch (this.type) {
            case 'fireball':
                this.createFireEffect(position);
                break;
            case 'frostbolt':
                this.createIceEffect(position);
                break;
            case 'lightning':
                this.createLightningEffect(position);
                break;
        }
    }

    // 創建火焰效果
    createFireEffect(position) {
        if (!window.effectsManager) return;
        
        for (let i = 0; i < 5; i++) {
            const particle = {
                position: position.copy(),
                velocity: Vector2.random(60),
                life: 1.0,
                size: 6,
                color: '#ff4757'
            };
            effectsManager.addParticle(particle);
        }
    }

    // 創建冰霜效果
    createIceEffect(position) {
        if (!window.effectsManager) return;
        
        for (let i = 0; i < 4; i++) {
            const particle = {
                position: position.copy(),
                velocity: Vector2.random(40),
                life: 1.5,
                size: 4,
                color: '#74b9ff'
            };
            effectsManager.addParticle(particle);
        }
    }

    // 創建閃電效果
    createLightningEffect(position) {
        if (!window.effectsManager) return;
        
        for (let i = 0; i < 6; i++) {
            const particle = {
                position: position.copy(),
                velocity: Vector2.random(100),
                life: 0.3,
                size: 2,
                color: '#feca57'
            };
            effectsManager.addParticle(particle);
        }
    }

    // 創建區域效果
    createAreaEffect(center) {
        if (!window.effectsManager) return;
        
        // 爆炸環
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const direction = Vector2.fromAngle(angle, this.areaOfEffect);
            const particle = {
                position: Vector2.add(center, Vector2.multiply(direction, 0.3)),
                velocity: Vector2.multiply(direction, 0.8),
                life: 1.0,
                size: 8,
                color: this.color
            };
            effectsManager.addParticle(particle);
        }
    }

    // 創建反彈效果
    createBounceEffect() {
        if (!window.effectsManager) return;
        
        for (let i = 0; i < 3; i++) {
            const particle = {
                position: this.position.copy(),
                velocity: Vector2.random(50),
                life: 0.5,
                size: 3,
                color: this.color
            };
            effectsManager.addParticle(particle);
        }
    }

    // 銷毀投射物
    destroy() {
        this.isActive = false;
        this.isAlive = false;
        
        // 銷毀時的效果
        this.createDestroyEffect();
    }

    // 創建銷毀效果
    createDestroyEffect() {
        if (!window.effectsManager) return;
        
        // 消散粒子
        for (let i = 0; i < this.trail.length; i++) {
            const trailPos = this.trail[i];
            const particle = {
                position: trailPos.copy(),
                velocity: Vector2.random(30),
                life: 0.8,
                size: 2,
                color: this.color
            };
            effectsManager.addParticle(particle);
        }
    }

    // 渲染投射物
    render(renderer) {
        if (!this.isActive) return;
        
        // 渲染軌跡
        this.renderTrail(renderer);
        
        // 渲染主體
        this.renderProjectile(renderer);
        
        // 渲染發光效果
        if (this.glowIntensity > 0.5) {
            this.renderGlow(renderer);
        }
    }

    // 渲染軌跡
    renderTrail(renderer) {
        // 基本軌跡渲染
        for (let i = 1; i < this.trail.length; i++) {
            const alpha = (this.trail.length - i) / this.trail.length;
            const size = Math.max(1, Math.floor(this.radius * alpha * 0.5));
            
            if (size >= 1) {
                renderer.drawPixelRectWithAlpha(
                    this.trail[i].x - size / 2, 
                    this.trail[i].y - size / 2, 
                    size,
                    size,
                    this.color, 
                    alpha * 0.6
                );
            }
        }
    }

    // 渲染投射物主體
    renderProjectile(renderer) {
        // 使用新的像素動畫管理器渲染投射物
        if (window.pixelAnimationManager && pixelAnimationManager.isInitialized) {
            const frameIndex = pixelAnimationManager.calculateFrameIndex(
                this.animation.time, 
                'projectile', 
                this.type
            );
            
            // 根據投射物狀態選擇圖案
            let pattern = 'core';
            if (this.animation.state === 'critical') {
                pattern = 'enhanced';
            } else if (this.animation.state === 'dying') {
                pattern = 'small';
            }
            
            // 映射投射物類型到動畫數據中的類型
            const typeMapping = {
                'fireball': 'fire',
                'frostbolt': 'frost',
                'lightning': 'lightning',
                'arcane': 'arcane'
            };
            
            const animationType = typeMapping[this.type] || this.type;
            
            const success = pixelAnimationManager.renderProjectileAnimation(
                renderer,
                this.position.x,
                this.position.y,
                animationType,
                pattern,
                frameIndex
            );
            
            if (success) return;
        }
        
        // 回退渲染：簡單的圓形
        const baseColor = this.getProjectileColor();
        const glowSize = this.animation.state === 'critical' ? this.radius * 1.5 : this.radius;
        
        // 繪製發光效果
        renderer.drawCircleWithAlpha(
            this.position.x, 
            this.position.y, 
            glowSize, 
            baseColor, 
            0.6
        );
        
        // 繪製核心
        renderer.drawCircle(
            this.position.x, 
            this.position.y, 
            this.radius * 0.7, 
            baseColor
        );
    }

    // 渲染發光效果
    renderGlow(renderer) {
        const glowRadius = this.radius * (2 + this.glowIntensity);
        const glowAlpha = this.glowIntensity * 0.3;
        
        renderer.drawCircleWithAlpha(
            this.position.x, 
            this.position.y, 
            glowRadius, 
            this.color, 
            glowAlpha
        );
    }

    // 獲取投射物資訊
    getInfo() {
        return {
            type: this.type,
            position: this.position.copy(),
            velocity: this.velocity.copy(),
            damage: this.damage,
            isActive: this.isActive,
            distanceTraveled: this.distanceTraveled,
            range: this.range,
            age: this.age,
            hitCount: this.hitTargets.size
        };
    }
}

/**
 * 投射物管理器
 */
class ProjectileManager {
    constructor() {
        this.projectiles = [];
        this.maxProjectiles = 200;
    }

    // 添加投射物
    addProjectile(config) {
        if (this.projectiles.length < this.maxProjectiles) {
            const projectile = new Projectile(config);
            this.projectiles.push(projectile);
            return projectile;
        }
        return null;
    }

    // 創建法術投射物
    createSpellProjectile(type, startPos, direction, owner) {
        const spellData = gameBalance.getValue('spells', type);
        if (!spellData) return null;
        
        const velocity = Vector2.multiply(direction.normalize(), spellData.speed);
        
        // 計算基礎傷害（不包含爆擊）
        let baseDamage = spellData.damage;
        if (owner && owner.calculateBaseSpellDamage) {
            baseDamage = owner.calculateBaseSpellDamage(spellData.damage);
        } else if (owner && owner.calculateSpellDamage) {
            // 向後兼容
            const legacyDamageInfo = owner.calculateSpellDamage(spellData.damage);
            baseDamage = legacyDamageInfo.damage;
        }
        
        const config = {
            x: startPos.x,
            y: startPos.y,
            velX: velocity.x,
            velY: velocity.y,
            type: type,
            owner: owner,
            damage: baseDamage,
            isCritical: false // 爆擊判定延遲到實際命中時進行
        };
        
        return this.addProjectile(config);
    }

    // 更新所有投射物
    update(deltaTime) {
        this.projectiles.forEach(projectile => {
            projectile.update(deltaTime);
        });
        
        // 移除不活動的投射物
        this.projectiles = this.projectiles.filter(projectile => projectile.isActive);
    }

    // 渲染所有投射物
    render(renderer) {
        this.projectiles.forEach(projectile => {
            projectile.render(renderer);
        });
    }

    // 清除所有投射物
    clearAll() {
        this.projectiles.forEach(projectile => {
            projectile.destroy();
        });
        this.projectiles = [];
    }

    // 獲取指定範圍內的投射物
    getProjectilesInRange(position, range) {
        return this.projectiles.filter(projectile => {
            return projectile.isActive && projectile.position.distanceTo(position) <= range;
        });
    }

    // 獲取統計資料
    getStats() {
        return {
            totalProjectiles: this.projectiles.length,
            activeProjectiles: this.projectiles.filter(p => p.isActive).length,
            typeBreakdown: this.getTypeBreakdown()
        };
    }

    // 獲取類型分布
    getTypeBreakdown() {
        const breakdown = {};
        this.projectiles.forEach(projectile => {
            breakdown[projectile.type] = (breakdown[projectile.type] || 0) + 1;
        });
        return breakdown;
    }

    // 重置管理器
    reset() {
        this.clearAll();
    }
}

// 全域投射物管理器
const projectileManager = new ProjectileManager();
window.projectileManager = projectileManager;