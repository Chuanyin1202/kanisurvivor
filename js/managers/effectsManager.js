/**
 * 特效管理器
 * 管理粒子效果、傷害數字等視覺特效
 */
class EffectsManager {
    constructor() {
        this.particles = [];
        this.damageNumbers = [];
        this.maxParticles = 200;
        this.maxDamageNumbers = 50;
    }

    // 添加粒子
    addParticle(config) {
        if (this.particles.length >= this.maxParticles) {
            // 移除最老的粒子
            this.particles.shift();
        }
        
        const particle = {
            position: config.position.copy(),
            velocity: config.velocity.copy(),
            life: config.life || 1.0,
            maxLife: config.life || 1.0,
            size: config.size || 4,
            color: config.color || '#ffffff',
            alpha: config.alpha || 1.0,
            gravity: config.gravity || 0,
            friction: config.friction || 0.98,
            fadeOut: config.fadeOut !== false,
            shrink: config.shrink || false
        };
        
        this.particles.push(particle);
        return particle;
    }

    // 添加傷害數字
    addDamageNumber(config) {
        if (this.damageNumbers.length >= this.maxDamageNumbers) {
            // 移除最老的傷害數字
            this.damageNumbers.shift();
        }
        
        const damageNumber = {
            position: config.position.copy(),
            damage: config.damage || 0,
            life: config.life || 2.0,
            maxLife: config.life || 2.0,
            velocity: config.velocity || new Vector2(0, -50),
            color: config.color || '#ffffff',
            fontSize: config.fontSize || 14,
            isCrit: config.isCrit || false,
            fadeOut: true
        };
        
        // 暴擊傷害特殊樣式 - 更加醒目的紅色和更大字體
        if (damageNumber.isCrit) {
            damageNumber.fontSize = 24; // 更大的字體（原18px）
            damageNumber.color = '#ff0000'; // 鮮紅色
            damageNumber.velocity.y *= 0.8; // 稍微減緩上升速度，讓效果更明顯
        }
        
        this.damageNumbers.push(damageNumber);
        return damageNumber;
    }

    // 創建爆炸效果
    createExplosion(position, intensity = 1.0, color = '#ff6b35') {
        const particleCount = Math.floor(8 * intensity);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 80 + Math.random() * 40;
            const velocity = Vector2.fromAngle(angle, speed * intensity);
            
            this.addParticle({
                position: position.copy(),
                velocity: velocity,
                life: 0.8 + Math.random() * 0.4,
                size: 4 + Math.random() * 4,
                color: color,
                gravity: 20,
                friction: 0.95
            });
        }
    }

    // 創建血液飛濺效果
    createBloodSplatter(position, direction = null) {
        const particleCount = 5;
        
        for (let i = 0; i < particleCount; i++) {
            let velocity;
            if (direction) {
                const spread = Math.PI / 3; // 60度散布
                const angle = direction.angle() + (Math.random() - 0.5) * spread;
                velocity = Vector2.fromAngle(angle, 60 + Math.random() * 40);
            } else {
                velocity = Vector2.random(100);
            }
            
            this.addParticle({
                position: position.copy(),
                velocity: velocity,
                life: 1.0 + Math.random() * 0.5,
                size: 2 + Math.random() * 3,
                color: '#c0392b',
                gravity: 50,
                friction: 0.9
            });
        }
    }

    // 創建治療效果
    createHealEffect(position) {
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const velocity = Vector2.fromAngle(angle, 30 + Math.random() * 20);
            
            this.addParticle({
                position: position.copy(),
                velocity: velocity,
                life: 1.5,
                size: 3 + Math.random() * 2,
                color: '#00b894',
                gravity: -20, // 向上飄
                friction: 0.98
            });
        }
    }

    // 創建升級效果
    createLevelUpEffect(position) {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 60;
            const velocity = Vector2.fromAngle(angle, speed);
            
            this.addParticle({
                position: position.copy(),
                velocity: velocity,
                life: 2.0,
                size: 4 + Math.random() * 4,
                color: i % 2 === 0 ? '#f1c40f' : '#e74c3c',
                gravity: 0,
                friction: 0.95,
                shrink: true
            });
        }
    }

    // 創建魔法充能效果
    createMagicChargeEffect(position, color = '#a55eea') {
        const particleCount = 6;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const radius = 20 + Math.random() * 10;
            const startPos = Vector2.add(position, Vector2.fromAngle(angle, radius));
            const velocity = Vector2.subtract(position, startPos).normalize().multiply(40);
            
            this.addParticle({
                position: startPos,
                velocity: velocity,
                life: 0.8,
                size: 3,
                color: color,
                gravity: 0,
                friction: 1.0
            });
        }
    }

    // 創建拖尾效果
    createTrailEffect(startPos, endPos, color = '#ffffff', intensity = 1.0) {
        const distance = startPos.distanceTo(endPos);
        const particleCount = Math.floor(distance / 10 * intensity);
        
        for (let i = 0; i < particleCount; i++) {
            const t = i / particleCount;
            const position = Vector2.lerp(startPos, endPos, t);
            const velocity = Vector2.random(20);
            
            this.addParticle({
                position: position,
                velocity: velocity,
                life: 0.5,
                size: 2 + Math.random() * 2,
                color: color,
                gravity: 0,
                friction: 0.9
            });
        }
    }

    // 更新所有特效
    update(deltaTime) {
        this.updateParticles(deltaTime);
        this.updateDamageNumbers(deltaTime);
    }

    // 更新粒子
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // 更新生命週期
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // 更新物理
            particle.velocity.y += particle.gravity * deltaTime;
            particle.velocity.multiply(particle.friction);
            particle.position.add(particle.velocity.copy().multiply(deltaTime));
            
            // 更新視覺效果
            if (particle.fadeOut) {
                particle.alpha = particle.life / particle.maxLife;
            }
            
            if (particle.shrink) {
                const sizeRatio = particle.life / particle.maxLife;
                particle.currentSize = particle.size * sizeRatio;
            } else {
                particle.currentSize = particle.size;
            }
        }
    }

    // 更新傷害數字
    updateDamageNumbers(deltaTime) {
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const damageNumber = this.damageNumbers[i];
            
            // 更新生命週期
            damageNumber.life -= deltaTime;
            
            if (damageNumber.life <= 0) {
                this.damageNumbers.splice(i, 1);
                continue;
            }
            
            // 更新位置
            damageNumber.position.add(damageNumber.velocity.copy().multiply(deltaTime));
            
            // 減速效果
            damageNumber.velocity.multiply(0.95);
            
            // 透明度漸變
            if (damageNumber.fadeOut) {
                damageNumber.alpha = damageNumber.life / damageNumber.maxLife;
            }
        }
    }

    // 渲染所有特效
    render(renderer) {
        this.renderParticles(renderer);
        this.renderDamageNumbers(renderer);
    }

    // 渲染粒子
    renderParticles(renderer) {
        this.particles.forEach(particle => {
            if (particle.alpha > 0) {
                renderer.drawParticle(
                    particle.position.x,
                    particle.position.y,
                    particle.currentSize || particle.size,
                    particle.color,
                    particle.alpha
                );
            }
        });
    }

    // 渲染傷害數字
    renderDamageNumbers(renderer) {
        this.damageNumbers.forEach(damageNumber => {
            if (damageNumber.alpha > 0) {
                const font = `${damageNumber.fontSize}px Arial`;
                renderer.ctx.save();
                renderer.ctx.globalAlpha = damageNumber.alpha;
                
                // 暴擊特效
                if (damageNumber.isCrit) {
                    renderer.drawTextWithOutline(
                        damageNumber.damage.toString(),
                        damageNumber.position.x,
                        damageNumber.position.y,
                        damageNumber.color,
                        '#000000',
                        font,
                        2
                    );
                } else {
                    renderer.drawText(
                        damageNumber.damage.toString(),
                        damageNumber.position.x,
                        damageNumber.position.y,
                        damageNumber.color,
                        font
                    );
                }
                
                renderer.ctx.restore();
            }
        });
    }

    // 清除所有特效
    clearAll() {
        this.particles = [];
        this.damageNumbers = [];
    }

    // 清除特定類型的特效
    clearParticles() {
        this.particles = [];
    }

    clearDamageNumbers() {
        this.damageNumbers = [];
    }

    // 設定品質等級
    setQuality(quality) {
        switch (quality) {
            case 'low':
                this.maxParticles = 50;
                this.maxDamageNumbers = 20;
                break;
            case 'medium':
                this.maxParticles = 100;
                this.maxDamageNumbers = 30;
                break;
            case 'high':
                this.maxParticles = 200;
                this.maxDamageNumbers = 50;
                break;
        }
    }

    // 獲取統計資料
    getStats() {
        return {
            particleCount: this.particles.length,
            damageNumberCount: this.damageNumbers.length,
            maxParticles: this.maxParticles,
            maxDamageNumbers: this.maxDamageNumbers
        };
    }

    // 重置管理器
    reset() {
        this.clearAll();
    }
}

// 全域特效管理器
const effectsManager = new EffectsManager();
window.effectsManager = effectsManager;