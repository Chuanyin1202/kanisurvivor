/**
 * 召喚物管理器
 * 管理環繞玩家的魔法劍、火元素等召喚物
 */
class SummonManager {
    constructor() {
        this.orbitingSwords = [];
        this.fireElementals = [];
        this.iceShields = [];
        this.lightningStorms = [];
        this.frostDomains = [];
        this.lastUpdateTime = 0;
    }
    
    // 更新所有召喚物
    update(deltaTime) {
        this.updateOrbitingSwords(deltaTime);
        this.updateFireElementals(deltaTime);
        this.updateIceShields(deltaTime);
        this.updateLightningStorms(deltaTime);
        this.updateFrostDomains(deltaTime);
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
    
    // 添加冰晶護盾
    addIceShield(shieldCount, reflectDamage) {
        const player = window.player;
        if (!player) return;
        
        for (let i = 0; i < shieldCount; i++) {
            const shield = {
                position: player.position.copy(),
                angle: (Math.PI * 2 / shieldCount) * i,
                health: 50,
                maxHealth: 50,
                reflectDamage: reflectDamage || 25,
                radius: 40,
                rotationSpeed: 1.5,
                isActive: true
            };
            this.iceShields.push(shield);
        }
        console.log(`❄️ 召喚 ${shieldCount} 個冰晶護盾`);
    }
    
    // 更新冰晶護盾
    updateIceShields(deltaTime) {
        const player = window.player;
        if (!player) return;
        
        this.iceShields.forEach((shield, index) => {
            if (!shield.isActive) return;
            
            // 更新護盾位置（環繞玩家）
            shield.angle += shield.rotationSpeed * deltaTime;
            shield.position.x = player.position.x + Math.cos(shield.angle) * shield.radius;
            shield.position.y = player.position.y + Math.sin(shield.angle) * shield.radius;
            
            // 檢查是否與敵人碰撞
            if (window.enemyManager) {
                enemyManager.enemies.forEach(enemy => {
                    if (!enemy.isAlive || !enemy.isActive) return;
                    
                    const distance = shield.position.distanceTo(enemy.position);
                    if (distance < 15) { // 護盾碰撞半徑
                        // 護盾受傷
                        shield.health -= enemy.damage;
                        
                        // 反彈傷害給敵人
                        enemy.takeDamage(shield.reflectDamage, false, true);
                        enemy.addStatusEffect('slow', 2.0, { multiplier: 0.5 });
                        
                        // 創建冰霜爆炸效果
                        this.createIceExplosion(shield.position);
                        
                        console.log(`❄️ 冰晶護盾反彈 ${shield.reflectDamage} 傷害給 ${enemy.type}`);
                        
                        // 護盾被摧毀
                        if (shield.health <= 0) {
                            shield.isActive = false;
                            console.log('💔 冰晶護盾被摧毀');
                        }
                    }
                });
            }
        });
        
        // 移除被摧毀的護盾
        this.iceShields = this.iceShields.filter(shield => shield.isActive);
    }
    
    // 創建冰霜爆炸效果
    createIceExplosion(position) {
        if (!window.effectsManager) return;
        
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const velocity = Vector2.fromAngle(angle, 60 + Math.random() * 40);
            
            effectsManager.addParticle({
                position: position.copy(),
                velocity: velocity,
                life: 1.5,
                size: 4 + Math.random() * 4,
                color: '#74b9ff',
                gravity: 20,
                friction: 0.95
            });
        }
    }
    
    // 渲染所有召喚物
    render(renderer) {
        this.renderOrbitingSwords(renderer);
        this.renderFireElementals(renderer);
        this.renderIceShields(renderer);
        this.renderLightningStorms(renderer);
        this.renderFrostDomains(renderer);
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
        this.iceShields.forEach(shield => {
            if (!shield.isActive) return;
            
            const time = Date.now() / 1000;
            const intensity = 0.7 + 0.3 * Math.sin(time * 4);
            
            // 護盾主體 - 半透明冰晶
            renderer.drawCircle(
                shield.position.x, 
                shield.position.y, 
                12, 
                `rgba(116, 185, 255, ${intensity * 0.6})`
            );
            
            // 護盾外圈
            renderer.drawCircle(
                shield.position.x, 
                shield.position.y, 
                15, 
                `rgba(116, 185, 255, ${intensity * 0.3})`
            );
            
            // 生命值條
            if (shield.health < shield.maxHealth) {
                const healthPercent = shield.health / shield.maxHealth;
                const barWidth = 20;
                const barHeight = 3;
                const barX = shield.position.x - barWidth / 2;
                const barY = shield.position.y - 20;
                
                // 背景
                renderer.drawRect(barX, barY, barWidth, barHeight, '#333333');
                // 生命值
                renderer.drawRect(barX, barY, barWidth * healthPercent, barHeight, '#74b9ff');
            }
            
            // 冰晶效果
            for (let i = 0; i < 6; i++) {
                const crystalAngle = time * 2 + (Math.PI * 2 / 6) * i;
                const crystalX = shield.position.x + Math.cos(crystalAngle) * 8;
                const crystalY = shield.position.y + Math.sin(crystalAngle) * 8;
                
                renderer.drawCircle(crystalX, crystalY, 2, '#e3f2fd');
            }
        });
    }
    
    // 添加閃電風暴
    addLightningStorm(duration, damage, range) {
        const player = window.player;
        if (!player) return;
        
        const storm = {
            position: player.position.copy(),
            duration: duration || 10,
            damage: damage || 30,
            range: range || 150,
            strikeInterval: 0.5,
            strikeTimer: 0,
            isActive: true
        };
        this.lightningStorms.push(storm);
        console.log('⚡ 召喚閃電風暴');
    }
    
    // 更新閃電風暴
    updateLightningStorms(deltaTime) {
        this.lightningStorms.forEach((storm, index) => {
            if (!storm.isActive) return;
            
            storm.duration -= deltaTime;
            storm.strikeTimer -= deltaTime;
            
            // 定期閃電攻擊
            if (storm.strikeTimer <= 0) {
                this.lightningStrike(storm);
                storm.strikeTimer = storm.strikeInterval;
            }
            
            // 風暴結束
            if (storm.duration <= 0) {
                storm.isActive = false;
                console.log('⚡ 閃電風暴結束');
            }
        });
        
        this.lightningStorms = this.lightningStorms.filter(storm => storm.isActive);
    }
    
    // 閃電攻擊
    lightningStrike(storm) {
        if (!window.enemyManager) return;
        
        // 在風暴範圍內尋找敵人
        const enemies = enemyManager.enemies.filter(enemy => 
            enemy.isAlive && 
            enemy.isActive && 
            enemy.position.distanceTo(storm.position) <= storm.range
        );
        
        if (enemies.length === 0) return;
        
        // 隨機選擇一個敵人
        const target = enemies[Math.floor(Math.random() * enemies.length)];
        
        // 造成傷害
        target.takeDamage(storm.damage, false, true);
        target.addStatusEffect('stun', 0.5, {});
        
        // 創建閃電效果
        this.createLightningEffect(storm.position, target.position);
        
        console.log(`⚡ 閃電擊中 ${target.type}，造成 ${storm.damage} 傷害`);
    }
    
    // 創建閃電效果
    createLightningEffect(startPos, endPos) {
        if (!window.effectsManager) return;
        
        // 閃電粒子
        for (let i = 0; i < 10; i++) {
            const t = i / 10;
            const position = Vector2.lerp(startPos, endPos, t);
            position.add(Vector2.random(20)); // 添加隨機偏移
            
            effectsManager.addParticle({
                position: position,
                velocity: Vector2.random(30),
                life: 0.3,
                size: 3,
                color: '#feca57'
            });
        }
    }
    
    // 渲染閃電風暴
    renderLightningStorms(renderer) {
        this.lightningStorms.forEach(storm => {
            if (!storm.isActive) return;
            
            const time = Date.now() / 1000;
            const intensity = 0.5 + 0.5 * Math.sin(time * 8);
            
            // 風暴範圍指示
            renderer.drawCircle(
                storm.position.x,
                storm.position.y,
                storm.range,
                `rgba(254, 202, 87, ${intensity * 0.2})`
            );
            
            // 風暴中心
            renderer.drawCircle(
                storm.position.x,
                storm.position.y,
                15,
                `rgba(254, 202, 87, ${intensity * 0.8})`
            );
            
            // 閃電效果
            for (let i = 0; i < 4; i++) {
                const angle = time * 6 + (Math.PI * 2 / 4) * i;
                const x1 = storm.position.x + Math.cos(angle) * 10;
                const y1 = storm.position.y + Math.sin(angle) * 10;
                const x2 = storm.position.x + Math.cos(angle) * 25;
                const y2 = storm.position.y + Math.sin(angle) * 25;
                
                renderer.drawLine(x1, y1, x2, y2, '#feca57', 2);
            }
        });
    }
    
    // 添加冰霜領域
    addFrostDomain(duration, slowEffect, damage) {
        const player = window.player;
        if (!player) return;
        
        const domain = {
            position: player.position.copy(),
            duration: duration || 8,
            slowEffect: slowEffect || 0.3,
            damage: damage || 5,
            range: 120,
            damageInterval: 1.0,
            damageTimer: 0,
            isActive: true
        };
        this.frostDomains.push(domain);
        console.log('❄️ 創建冰霜領域');
    }
    
    // 更新冰霜領域
    updateFrostDomains(deltaTime) {
        this.frostDomains.forEach((domain, index) => {
            if (!domain.isActive) return;
            
            domain.duration -= deltaTime;
            domain.damageTimer -= deltaTime;
            
            // 定期傷害範圍內敵人
            if (domain.damageTimer <= 0) {
                this.frostDomainEffect(domain);
                domain.damageTimer = domain.damageInterval;
            }
            
            // 領域結束
            if (domain.duration <= 0) {
                domain.isActive = false;
                console.log('❄️ 冰霜領域消失');
            }
        });
        
        this.frostDomains = this.frostDomains.filter(domain => domain.isActive);
    }
    
    // 冰霜領域效果
    frostDomainEffect(domain) {
        if (!window.enemyManager) return;
        
        // 影響範圍內的所有敵人
        enemyManager.enemies.forEach(enemy => {
            if (!enemy.isAlive || !enemy.isActive) return;
            
            const distance = enemy.position.distanceTo(domain.position);
            if (distance <= domain.range) {
                // 造成傷害
                enemy.takeDamage(domain.damage, false, false);
                
                // 施加緩速效果
                enemy.addStatusEffect('slow', 2.0, { multiplier: domain.slowEffect });
                
                // 創建冰霜粒子
                if (Math.random() < 0.3) {
                    this.createFrostParticles(enemy.position);
                }
            }
        });
    }
    
    // 創建冰霜粒子
    createFrostParticles(position) {
        if (!window.effectsManager) return;
        
        for (let i = 0; i < 3; i++) {
            effectsManager.addParticle({
                position: position.copy().add(Vector2.random(10)),
                velocity: Vector2.random(20),
                life: 1.0,
                size: 3,
                color: '#74b9ff',
                gravity: -10
            });
        }
    }
    
    // 渲染冰霜領域
    renderFrostDomains(renderer) {
        this.frostDomains.forEach(domain => {
            if (!domain.isActive) return;
            
            const time = Date.now() / 1000;
            const intensity = 0.3 + 0.2 * Math.sin(time * 3);
            
            // 領域範圍
            renderer.drawCircle(
                domain.position.x,
                domain.position.y,
                domain.range,
                `rgba(116, 185, 255, ${intensity})`
            );
            
            // 冰霜漩渦效果
            for (let i = 0; i < 8; i++) {
                const angle = time * 2 + (Math.PI * 2 / 8) * i;
                const radius = 30 + Math.sin(time * 4 + i) * 10;
                const x = domain.position.x + Math.cos(angle) * radius;
                const y = domain.position.y + Math.sin(angle) * radius;
                
                renderer.drawCircle(x, y, 4, `rgba(227, 242, 253, ${intensity * 2})`);
            }
        });
    }
    
    // 重置所有召喚物
    reset() {
        this.orbitingSwords = [];
        this.fireElementals = [];
        this.iceShields = [];
        this.lightningStorms = [];
        this.frostDomains = [];
        console.log('🔄 召喚物已重置');
    }
}

// 創建全域召喚物管理器
const summonManager = new SummonManager();
window.summonManager = summonManager;