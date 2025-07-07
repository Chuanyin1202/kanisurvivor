/**
 * 無人機/寵物系統
 * 跟隨玩家並提供輔助攻擊的無人機
 */
class Drone {
    constructor(owner, type = 'basic') {
        this.owner = owner;
        this.type = type;
        this.position = new Vector2(owner.position.x, owner.position.y);
        this.velocity = new Vector2(0, 0);
        this.target = null;
        
        // 基本屬性
        this.health = 50;
        this.maxHealth = 50;
        this.damage = 5;
        this.attackRange = 120;
        this.speed = 80;
        this.size = 8;
        
        // 跟隨行為
        this.followDistance = 40;
        this.orbitAngle = Math.random() * Math.PI * 2;
        this.orbitSpeed = 2.0;
        
        // 攻擊系統
        this.attackCooldown = 1.5;
        this.lastAttackTime = 0;
        this.projectileSpeed = 150;
        
        // 狀態
        this.isAlive = true;
        this.isDestroyed = false;
        
        // 視覺效果
        this.color = this.getDroneColor();
        this.glowIntensity = 1.0;
        
        console.log(`${type} 無人機已部署`);
    }

    // 獲取無人機顏色
    getDroneColor() {
        const colors = {
            basic: '#4ecdc4',
            fire: '#ff6b35',
            ice: '#74b9ff',
            lightning: '#feca57',
            healing: '#00b894'
        };
        return colors[this.type] || colors.basic;
    }

    // 更新無人機
    update(deltaTime) {
        if (!this.isAlive) return;
        
        this.updateFollowBehavior(deltaTime);
        this.updateAttackBehavior(deltaTime);
        this.updateTimers(deltaTime);
        this.updateVisualEffects(deltaTime);
    }

    // 更新跟隨行為
    updateFollowBehavior(deltaTime) {
        if (!this.owner) return;
        
        // 軌道跟隨
        this.orbitAngle += this.orbitSpeed * deltaTime;
        
        const targetX = this.owner.position.x + Math.cos(this.orbitAngle) * this.followDistance;
        const targetY = this.owner.position.y + Math.sin(this.orbitAngle) * this.followDistance;
        const targetPos = new Vector2(targetX, targetY);
        
        // 平滑移動到目標位置
        const direction = Vector2.subtract(targetPos, this.position);
        const distance = direction.length();
        
        if (distance > 5) {
            direction.normalize().multiply(this.speed * deltaTime);
            this.position.add(direction);
        }
    }

    // 更新攻擊行為
    updateAttackBehavior(deltaTime) {
        // 尋找目標
        this.findTarget();
        
        // 攻擊目標
        if (this.target && this.canAttack()) {
            this.attackTarget();
        }
    }

    // 尋找攻擊目標
    findTarget() {
        if (!window.enemyManager) return;
        
        const enemies = enemyManager.findEnemiesInRange(this.position, this.attackRange);
        const aliveEnemies = enemies.filter(enemy => enemy.isAlive);
        
        if (aliveEnemies.length > 0) {
            // 選擇最近的敵人
            this.target = aliveEnemies.reduce((closest, enemy) => {
                const distToCurrent = this.position.distanceTo(enemy.position);
                const distToClosest = this.position.distanceTo(closest.position);
                return distToCurrent < distToClosest ? enemy : closest;
            });
        } else {
            this.target = null;
        }
    }

    // 檢查是否可以攻擊
    canAttack() {
        return this.lastAttackTime <= 0 && this.target && this.target.isAlive;
    }

    // 攻擊目標
    attackTarget() {
        this.lastAttackTime = this.attackCooldown;
        
        // 創建投射物
        this.createProjectile();
        
        console.log(`${this.type} 無人機攻擊了 ${this.target.type}`);
    }

    // 創建投射物
    createProjectile() {
        if (!this.target || !window.projectileManager) return;
        
        const direction = Vector2.subtract(this.target.position, this.position).normalize();
        
        const config = {
            x: this.position.x,
            y: this.position.y,
            velX: direction.x * this.projectileSpeed,
            velY: direction.y * this.projectileSpeed,
            damage: this.damage,
            radius: 3,
            range: this.attackRange,
            type: 'drone_' + this.type,
            owner: this,
            color: this.color
        };
        
        projectileManager.addProjectile(config);
    }

    // 更新計時器
    updateTimers(deltaTime) {
        if (this.lastAttackTime > 0) {
            this.lastAttackTime -= deltaTime;
        }
    }

    // 更新視覺效果
    updateVisualEffects(deltaTime) {
        this.glowIntensity = 0.7 + 0.3 * Math.sin(Date.now() * 0.005);
    }

    // 受到傷害
    takeDamage(damage) {
        if (!this.isAlive) return false;
        
        this.health -= damage;
        
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        
        return true;
    }

    // 銷毀無人機
    destroy() {
        this.isAlive = false;
        this.isDestroyed = true;
        
        // 創建銷毀效果
        this.createDestroyEffect();
        
        console.log(`${this.type} 無人機已被銷毀`);
    }

    // 創建銷毀效果
    createDestroyEffect() {
        if (!window.effectsManager) return;
        
        // 爆炸粒子
        for (let i = 0; i < 6; i++) {
            const particle = {
                position: this.position.copy(),
                velocity: Vector2.random(80),
                life: 1.0,
                size: 4,
                color: this.color
            };
            effectsManager.addParticle(particle);
        }
    }

    // 渲染無人機
    render(renderer) {
        if (!this.isAlive) return;
        
        // 繪製發光效果
        const glowRadius = this.size * (1.5 + this.glowIntensity * 0.5);
        renderer.drawCircleWithAlpha(
            this.position.x, 
            this.position.y, 
            glowRadius, 
            this.color, 
            0.3
        );
        
        // 繪製主體
        renderer.drawCircle(this.position.x, this.position.y, this.size, this.color);
        
        // 繪製核心
        renderer.drawCircle(this.position.x, this.position.y, this.size * 0.5, '#ffffff');
        
        // 如果有目標，繪製攻擊線
        if (this.target && this.canAttack()) {
            renderer.drawLine(
                this.position.x, 
                this.position.y, 
                this.target.position.x, 
                this.target.position.y, 
                this.color, 
                1
            );
        }
    }

    // 獲取無人機資訊
    getInfo() {
        return {
            type: this.type,
            position: this.position.copy(),
            health: this.health,
            maxHealth: this.maxHealth,
            isAlive: this.isAlive,
            hasTarget: !!this.target
        };
    }
}

/**
 * 無人機管理器
 */
class DroneManager {
    constructor() {
        this.drones = [];
        this.maxDrones = 5;
    }

    // 部署無人機
    deployDrone(owner, type = 'basic') {
        if (this.drones.length < this.maxDrones) {
            const drone = new Drone(owner, type);
            this.drones.push(drone);
            return drone;
        }
        return null;
    }

    // 更新所有無人機
    update(deltaTime) {
        this.drones.forEach(drone => {
            drone.update(deltaTime);
        });
        
        // 移除已銷毀的無人機
        this.drones = this.drones.filter(drone => !drone.isDestroyed);
    }

    // 渲染所有無人機
    render(renderer) {
        this.drones.forEach(drone => {
            drone.render(renderer);
        });
    }

    // 移除所有無人機
    removeAllDrones() {
        this.drones.forEach(drone => {
            drone.destroy();
        });
        this.drones = [];
    }

    // 獲取存活無人機數量
    getAliveCount() {
        return this.drones.filter(drone => drone.isAlive).length;
    }

    // 重置管理器
    reset() {
        this.removeAllDrones();
    }
}

// 全域無人機管理器
const droneManager = new DroneManager();