/**
 * 敵人管理器
 * 管理所有敵人的生成、更新和銷毀
 */
class EnemyManager {
    constructor() {
        this.enemies = [];
        this.maxEnemies = 200; // 最大敵人數量
        this.enemyTypes = ['slime', 'goblin', 'orc', 'boss'];
        
        // 統計資料
        this.totalSpawned = 0;
        this.totalKilled = 0;
        
        console.log('🎯 EnemyManager 初始化完成');
    }

    // 添加敵人
    addEnemy(enemy) {
        if (this.enemies.length >= this.maxEnemies) {
            console.warn('敵人數量已達上限，忽略新生成');
            return false;
        }
        
        this.enemies.push(enemy);
        this.totalSpawned++;
        return true;
    }

    // 生成敵人
    spawnEnemy(type, x, y) {
        const enemy = new Enemy(x, y, type);
        return this.addEnemy(enemy) ? enemy : null;
    }

    // 移除敵人
    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            if (!enemy.isAlive) {
                this.totalKilled++;
            }
            return true;
        }
        return false;
    }

    // 獲取存活敵人數量
    getAliveEnemyCount() {
        return this.enemies.filter(enemy => enemy.isAlive && enemy.isActive).length;
    }

    // 獲取總敵人數量
    getTotalEnemyCount() {
        return this.enemies.length;
    }

    // 更新所有敵人
    update(deltaTime) {
        // 更新所有敵人
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (enemy.isActive) {
                enemy.update(deltaTime);
                
                // 檢查與玩家的碰撞
                if (enemy.isAlive && window.player && this.checkPlayerCollision(enemy)) {
                    this.handlePlayerCollision(enemy);
                }
            } else {
                // 移除不活動的敵人
                this.enemies.splice(i, 1);
            }
        }
    }

    // 渲染所有敵人
    render(renderer) {
        this.enemies.forEach(enemy => {
            if (enemy.isActive) {
                enemy.render(renderer);
            }
        });
    }

    // 檢查與玩家的碰撞
    checkPlayerCollision(enemy) {
        if (!window.player || !enemy.isAlive) return false;
        
        const distance = enemy.position.distanceTo(window.player.position);
        return distance <= (enemy.radius + window.player.radius);
    }

    // 處理與玩家的碰撞
    handlePlayerCollision(enemy) {
        const currentTime = Date.now();
        
        // 檢查碰撞冷卻時間
        if (currentTime - enemy.lastCollisionTime < enemy.collisionCooldown * 1000) {
            return;
        }
        
        enemy.lastCollisionTime = currentTime;
        
        // 對玩家造成傷害
        if (window.player && window.player.takeDamage) {
            const damage = Math.max(1, enemy.damage - window.player.defense);
            window.player.takeDamage(damage);
            
            // 擊退效果
            const knockbackDirection = Vector2.subtract(window.player.position, enemy.position).normalize();
            const knockbackForce = 30;
            window.player.position.add(knockbackDirection.multiply(knockbackForce));
            
            console.log(`玩家受到 ${enemy.type} 攻擊，傷害: ${damage}`);
        }
    }

    // 尋找範圍內的敵人
    findEnemiesInRange(position, range) {
        return this.enemies.filter(enemy => 
            enemy.isAlive && 
            enemy.isActive && 
            enemy.position.distanceTo(position) <= range
        );
    }

    // 尋找最近的敵人
    findNearestEnemy(position, maxRange = Infinity) {
        let nearestEnemy = null;
        let minDistance = maxRange;
        
        for (const enemy of this.enemies) {
            if (enemy.isAlive && enemy.isActive) {
                const distance = enemy.position.distanceTo(position);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestEnemy = enemy;
                }
            }
        }
        
        return nearestEnemy;
    }

    // 對範圍內敵人造成傷害
    damageEnemiesInRange(position, range, damage, damageType = 'spell') {
        const enemiesInRange = this.findEnemiesInRange(position, range);
        const damagedEnemies = [];
        
        enemiesInRange.forEach(enemy => {
            if (enemy.takeDamage(damage, true)) {
                damagedEnemies.push(enemy);
            }
        });
        
        return damagedEnemies;
    }

    // 清除所有敵人
    clearAllEnemies() {
        this.enemies.forEach(enemy => {
            enemy.isActive = false;
        });
        this.enemies = [];
        console.log('清除所有敵人');
    }

    // 清除死亡敵人
    clearDeadEnemies() {
        const beforeCount = this.enemies.length;
        this.enemies = this.enemies.filter(enemy => enemy.isAlive || enemy.isActive);
        const removedCount = beforeCount - this.enemies.length;
        
        if (removedCount > 0) {
            console.log(`清除了 ${removedCount} 個死亡敵人`);
        }
    }

    // 暫停所有敵人
    pauseAllEnemies() {
        this.enemies.forEach(enemy => {
            enemy.isPaused = true;
        });
    }

    // 恢復所有敵人
    resumeAllEnemies() {
        this.enemies.forEach(enemy => {
            enemy.isPaused = false;
        });
    }

    // 獲取統計資料
    getStats() {
        const aliveCount = this.getAliveEnemyCount();
        const deadCount = this.enemies.length - aliveCount;
        
        const typeCount = {};
        this.enemies.forEach(enemy => {
            if (enemy.isAlive && enemy.isActive) {
                typeCount[enemy.type] = (typeCount[enemy.type] || 0) + 1;
            }
        });
        
        return {
            total: this.enemies.length,
            alive: aliveCount,
            dead: deadCount,
            totalSpawned: this.totalSpawned,
            totalKilled: this.totalKilled,
            typeBreakdown: typeCount
        };
    }

    // 重置管理器
    reset() {
        this.clearAllEnemies();
        this.totalSpawned = 0;
        this.totalKilled = 0;
        console.log('🎯 EnemyManager 已重置');
    }

    // 調試信息
    debugInfo() {
        const stats = this.getStats();
        console.log('EnemyManager 狀態:', stats);
        return stats;
    }
}

// 全域敵人管理器
const enemyManager = new EnemyManager();
window.enemyManager = enemyManager;