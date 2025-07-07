/**
 * 召喚物管理器
 * 管理環繞玩家的魔法劍、火元素等召喚物
 */
class SummonManager {
    constructor() {
        this.orbitingSwords = [];
        this.fireElementals = [];
        this.iceShields = [];
        this.lastUpdateTime = 0;
    }
    
    // 更新所有召喚物
    update(deltaTime) {
        this.updateOrbitingSwords(deltaTime);
        this.updateFireElementals(deltaTime);
        this.updateIceShields(deltaTime);
    }
    
    // 更新環繞魔法劍
    updateOrbitingSwords(deltaTime) {
        if (!window.player || !window.abilityManager) return;
        
        const targetCount = abilityManager.activeEffects.orbitingSwords || 0;
        const swordDamage = abilityManager.activeEffects.swordDamage || 20;
        const swordSpeed = abilityManager.activeEffects.swordSpeed || 2.0;
        
        // 調整劍的數量
        while (this.orbitingSwords.length < targetCount) {
            this.addOrbitingSword(swordDamage, swordSpeed);
        }
        while (this.orbitingSwords.length > targetCount) {
            this.orbitingSwords.pop();
        }
        
        // 更新每把劍的位置和攻擊
        this.orbitingSwords.forEach((sword, index) => {
            const player = window.player;
            const radius = 60;
            const angleOffset = (Math.PI * 2 / this.orbitingSwords.length) * index;
            const currentTime = Date.now() / 1000;
            const angle = currentTime * swordSpeed + angleOffset;
            
            sword.position.x = player.position.x + Math.cos(angle) * radius;
            sword.position.y = player.position.y + Math.sin(angle) * radius;
            sword.angle = angle + Math.PI / 2; // 劍尖朝外
            
            // 檢查攻擊
            sword.attackTimer -= deltaTime;
            if (sword.attackTimer <= 0) {
                this.swordAttack(sword);
                sword.attackTimer = 0.5; // 每0.5秒攻擊一次
            }
        });
    }
    
    // 添加環繞劍
    addOrbitingSword(damage, speed) {
        const sword = {
            position: new Vector2(0, 0),
            angle: 0,
            damage: damage,
            speed: speed,
            attackTimer: 0,
            radius: 15
        };
        this.orbitingSwords.push(sword);
        console.log('⚔️ 召喚魔法飛劍');
    }
    
    // 劍攻擊敵人
    swordAttack(sword) {
        if (!window.enemyManager) return;
        
        const enemies = enemyManager.enemies.filter(enemy => 
            enemy.isAlive && 
            enemy.isActive && 
            enemy.position.distanceTo(sword.position) <= sword.radius + enemy.radius
        );
        
        enemies.forEach(enemy => {
            enemy.takeDamage(sword.damage, true, false);
            console.log(`⚔️ 魔法劍攻擊 ${enemy.type}，造成 ${sword.damage} 傷害`);
            
            // 創建劍光效果
            if (window.effectsManager) {
                effectsManager.addParticle({
                    position: sword.position.copy(),
                    velocity: Vector2.random(50),
                    life: 0.5,
                    size: 8,
                    color: '#ffff00'
                });
            }
        });
    }
    
    // 更新火元素
    updateFireElementals(deltaTime) {
        if (!window.player || !window.abilityManager) return;
        
        const hasFireElemental = abilityManager.activeEffects.fireElemental;
        const elementalDamage = abilityManager.activeEffects.elementalDamage || 30;
        const attackInterval = abilityManager.activeEffects.elementalAttackInterval || 2.0;
        
        if (hasFireElemental && this.fireElementals.length === 0) {
            this.addFireElemental(elementalDamage, attackInterval);
        } else if (!hasFireElemental) {
            this.fireElementals = [];
        }
        
        // 更新火元素
        this.fireElementals.forEach(elemental => {
            const player = window.player;
            
            // 跟隨玩家，保持一定距離
            const targetPos = Vector2.add(player.position, new Vector2(40, -20));
            const moveSpeed = 100;
            const direction = Vector2.subtract(targetPos, elemental.position);
            if (direction.length() > 5) {
                direction.normalize().multiply(moveSpeed * deltaTime);
                elemental.position.add(direction);
            }
            
            // 攻擊計時
            elemental.attackTimer -= deltaTime;
            if (elemental.attackTimer <= 0) {
                this.fireElementalAttack(elemental);
                elemental.attackTimer = elemental.attackInterval;
            }
        });
    }
    
    // 添加火元素
    addFireElemental(damage, attackInterval) {
        const elemental = {
            position: window.player.position.copy(),
            damage: damage,
            attackInterval: attackInterval,
            attackTimer: 0,
            range: 120
        };
        this.fireElementals.push(elemental);
        console.log('🔥 召喚火元素');
    }
    
    // 火元素攻擊
    fireElementalAttack(elemental) {
        if (!window.enemyManager) return;
        
        // 尋找範圍內的敵人
        const enemies = enemyManager.enemies.filter(enemy => 
            enemy.isAlive && 
            enemy.isActive && 
            enemy.position.distanceTo(elemental.position) <= elemental.range
        );
        
        if (enemies.length === 0) return;
        
        // 攻擊最近的敵人
        const target = enemies.reduce((closest, enemy) => {
            const distToCurrent = elemental.position.distanceTo(enemy.position);
            const distToClosest = elemental.position.distanceTo(closest.position);
            return distToCurrent < distToClosest ? enemy : closest;
        });
        
        target.takeDamage(elemental.damage, true, false);
        target.addStatusEffect('burn', 3.0, { damage: 5 });
        
        console.log(`🔥 火元素攻擊 ${target.type}，造成 ${elemental.damage} 傷害`);
        
        // 創建火球效果
        if (window.effectsManager) {
            for (let i = 0; i < 5; i++) {
                effectsManager.addParticle({
                    position: target.position.copy(),
                    velocity: Vector2.random(80),
                    life: 1.0,
                    size: 6,
                    color: '#ff4757'
                });
            }
        }
    }
    
    // 更新冰晶護盾
    updateIceShields(deltaTime) {
        // 簡化實現，暫時跳過
    }
    
    // 渲染所有召喚物
    render(renderer) {
        this.renderOrbitingSwords(renderer);
        this.renderFireElementals(renderer);
        this.renderIceShields(renderer);
    }
    
    // 渲染環繞劍
    renderOrbitingSwords(renderer) {
        this.orbitingSwords.forEach(sword => {
            // 繪製劍的主體（簡化為線條）
            const swordLength = 20;
            const tipX = sword.position.x + Math.cos(sword.angle) * swordLength;
            const tipY = sword.position.y + Math.sin(sword.angle) * swordLength;
            const handleX = sword.position.x - Math.cos(sword.angle) * 5;
            const handleY = sword.position.y - Math.sin(sword.angle) * 5;
            
            renderer.drawLine(handleX, handleY, tipX, tipY, '#ffff00', 3);
            
            // 繪製劍柄
            renderer.drawCircle(handleX, handleY, 3, '#8B4513');
            
            // 繪製光暈效果
            renderer.drawCircle(sword.position.x, sword.position.y, 8, 'rgba(255, 255, 0, 0.3)');
        });
    }
    
    // 渲染火元素
    renderFireElementals(renderer) {
        this.fireElementals.forEach(elemental => {
            const time = Date.now() / 1000;
            const intensity = 0.8 + 0.4 * Math.sin(time * 6);
            
            // 火元素主體
            renderer.drawCircle(elemental.position.x, elemental.position.y, 12, '#ff6b35');
            renderer.drawCircle(elemental.position.x, elemental.position.y, 8, '#ff4757');
            
            // 火焰粒子效果
            for (let i = 0; i < 3; i++) {
                const angle = time * 4 + i * (Math.PI * 2 / 3);
                const x = elemental.position.x + Math.cos(angle) * 6;
                const y = elemental.position.y + Math.sin(angle) * 6 - Math.sin(time * 8) * 3;
                
                renderer.drawCircle(x, y, 3, `rgba(255, 100, 53, ${intensity})`);
            }
        });
    }
    
    // 渲染冰晶護盾
    renderIceShields(renderer) {
        // 暫時空實現
    }
    
    // 重置所有召喚物
    reset() {
        this.orbitingSwords = [];
        this.fireElementals = [];
        this.iceShields = [];
        console.log('🔄 召喚物已重置');
    }
}

// 創建全域召喚物管理器
const summonManager = new SummonManager();
window.summonManager = summonManager;