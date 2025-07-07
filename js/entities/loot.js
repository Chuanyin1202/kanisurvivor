/**
 * 戰利品系統
 * 處理金幣、經驗值寶石等掉落物品
 */
class Loot {
    constructor(x, y, type, value = 1) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60
        );
        this.type = type; // 'gold', 'exp', 'health', 'mana'
        this.value = value;
        
        // 物理屬性
        this.size = this.getLootSize();
        this.friction = 0.95;
        this.magnetRange = 50;
        this.collectRange = 15;
        
        // 狀態
        this.isActive = true;
        this.isCollected = false;
        this.age = 0;
        this.lifeTime = 30; // 30秒後消失
        
        // 磁鐵效果
        this.isMagnetic = false;
        this.magnetSpeed = 200;
        
        // 視覺效果
        this.color = this.getLootColor();
        this.bounceHeight = 0;
        this.bounceSpeed = 4;
        this.glowIntensity = 1.0;
        
        // 動畫
        this.rotationSpeed = 2.0;
        this.rotation = 0;
        
        this.setupLootProperties();
    }

    // 根據類型設定戰利品屬性
    setupLootProperties() {
        switch (this.type) {
            case 'gold':
                this.magnetRange = 60;
                this.collectRange = 20;
                break;
            case 'exp':
                this.magnetRange = 80;
                this.collectRange = 25;
                break;
            case 'health':
                this.magnetRange = 70;
                this.collectRange = 22;
                this.lifeTime = 15; // 血瓶消失得快一些
                break;
            case 'mana':
                this.magnetRange = 70;
                this.collectRange = 22;
                this.lifeTime = 15;
                break;
        }
    }

    // 獲取戰利品大小
    getLootSize() {
        const sizes = {
            gold: 6,
            exp: 8,
            health: 10,
            mana: 10
        };
        return sizes[this.type] || 6;
    }

    // 獲取戰利品顏色
    getLootColor() {
        const colors = {
            gold: '#f1c40f',
            exp: '#3498db',
            health: '#e74c3c',
            mana: '#9b59b6'
        };
        return colors[this.type] || '#ffffff';
    }

    // 更新戰利品
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.age += deltaTime;
        
        // 檢查生命週期
        if (this.age >= this.lifeTime) {
            this.destroy();
            return;
        }
        
        this.updatePhysics(deltaTime);
        this.updateMagnetism(deltaTime);
        this.updateCollection();
        this.updateVisualEffects(deltaTime);
    }

    // 更新物理效果
    updatePhysics(deltaTime) {
        // 應用摩擦力
        this.velocity.multiply(this.friction);
        
        // 更新位置
        this.position.add(this.velocity.copy().multiply(deltaTime));
        
        // 邊界檢查
        this.clampToGameBounds();
    }

    // 更新磁鐵效果
    updateMagnetism(deltaTime) {
        if (!window.player) return;
        
        const distanceToPlayer = this.position.distanceTo(window.player.position);
        
        // 檢查是否在磁鐵範圍內
        if (distanceToPlayer <= this.magnetRange) {
            this.isMagnetic = true;
            
            // 朝玩家移動
            const direction = Vector2.subtract(window.player.position, this.position);
            if (direction.length() > 0) {
                direction.normalize().multiply(this.magnetSpeed * deltaTime);
                this.velocity.add(direction);
            }
        }
    }

    // 更新收集檢查
    updateCollection() {
        if (!window.player) return;
        
        const distanceToPlayer = this.position.distanceTo(window.player.position);
        
        if (distanceToPlayer <= this.collectRange) {
            this.collect();
        }
    }

    // 更新視覺效果
    updateVisualEffects(deltaTime) {
        // 旋轉動畫
        this.rotation += this.rotationSpeed * deltaTime;
        
        // 彈跳動畫
        this.bounceHeight = Math.sin(this.age * this.bounceSpeed) * 3;
        
        // 發光效果
        this.glowIntensity = 0.8 + 0.4 * Math.sin(this.age * 6);
        
        // 接近消失時的閃爍效果
        const timeLeft = this.lifeTime - this.age;
        if (timeLeft < 5) {
            this.glowIntensity *= (0.5 + 0.5 * Math.sin(this.age * 10));
        }
    }

    // 收集戰利品
    collect() {
        if (this.isCollected) return;
        
        this.isCollected = true;
        this.isActive = false;
        
        // 應用效果到玩家
        this.applyEffect();
        
        // 創建收集效果
        this.createCollectEffect();
        
        console.log(`收集了 ${this.type}: ${this.value}`);
    }

    // 應用戰利品效果
    applyEffect() {
        if (!window.player) return;
        
        switch (this.type) {
            case 'gold':
                if (window.gameData) {
                    gameData.addGold(this.value);
                }
                break;
            case 'exp':
                window.player.addExperience(this.value);
                break;
            case 'health':
                window.player.heal(this.value);
                break;
            case 'mana':
                window.player.restoreMana(this.value);
                break;
        }
    }

    // 創建收集效果
    createCollectEffect() {
        if (!window.effectsManager) return;
        
        // 收集粒子
        for (let i = 0; i < 4; i++) {
            const particle = {
                position: this.position.copy(),
                velocity: Vector2.random(100),
                life: 0.8,
                size: 3,
                color: this.color
            };
            effectsManager.addParticle(particle);
        }
        
        // 特殊效果
        switch (this.type) {
            case 'gold':
                this.createGoldEffect();
                break;
            case 'exp':
                this.createExpEffect();
                break;
            case 'health':
                this.createHealEffect();
                break;
            case 'mana':
                this.createManaEffect();
                break;
        }
    }

    // 金幣收集效果
    createGoldEffect() {
        if (!window.effectsManager) return;
        
        for (let i = 0; i < 6; i++) {
            const particle = {
                position: this.position.copy(),
                velocity: Vector2.random(80),
                life: 1.2,
                size: 2,
                color: '#ffd700'
            };
            effectsManager.addParticle(particle);
        }
    }

    // 經驗值收集效果
    createExpEffect() {
        if (!window.effectsManager) return;
        
        for (let i = 0; i < 8; i++) {
            const particle = {
                position: this.position.copy(),
                velocity: Vector2.random(120),
                life: 1.0,
                size: 4,
                color: '#74b9ff'
            };
            effectsManager.addParticle(particle);
        }
    }

    // 治療收集效果
    createHealEffect() {
        if (!window.effectsManager) return;
        
        for (let i = 0; i < 5; i++) {
            const particle = {
                position: this.position.copy(),
                velocity: Vector2.random(60),
                life: 1.5,
                size: 5,
                color: '#00b894'
            };
            effectsManager.addParticle(particle);
        }
    }

    // 魔法收集效果
    createManaEffect() {
        if (!window.effectsManager) return;
        
        for (let i = 0; i < 5; i++) {
            const particle = {
                position: this.position.copy(),
                velocity: Vector2.random(60),
                life: 1.5,
                size: 5,
                color: '#a29bfe'
            };
            effectsManager.addParticle(particle);
        }
    }

    // 銷毀戰利品
    destroy() {
        this.isActive = false;
        
        // 創建消失效果
        this.createDisappearEffect();
    }

    // 創建消失效果
    createDisappearEffect() {
        if (!window.effectsManager) return;
        
        // 消失粒子
        for (let i = 0; i < 3; i++) {
            const particle = {
                position: this.position.copy(),
                velocity: Vector2.random(40),
                life: 0.5,
                size: 2,
                color: this.color
            };
            effectsManager.addParticle(particle);
        }
    }

    // 限制在遊戲邊界內
    clampToGameBounds() {
        // 使用渲染器的邏輯尺寸，而不是Canvas的實際尺寸
        if (!window.renderer) return;
        
        const margin = this.size;
        
        if (this.position.x < margin) {
            this.position.x = margin;
            this.velocity.x = Math.abs(this.velocity.x);
        } else if (this.position.x > window.renderer.width - margin) {
            this.position.x = window.renderer.width - margin;
            this.velocity.x = -Math.abs(this.velocity.x);
        }
        
        if (this.position.y < margin) {
            this.position.y = margin;
            this.velocity.y = Math.abs(this.velocity.y);
        } else if (this.position.y > window.renderer.height - margin) {
            this.position.y = window.renderer.height - margin;
            this.velocity.y = -Math.abs(this.velocity.y);
        }
    }

    // 渲染戰利品
    render(renderer) {
        if (!this.isActive) return;
        
        const renderY = this.position.y + this.bounceHeight;
        
        // 發光效果
        const glowRadius = this.size * (1.8 + this.glowIntensity * 0.5);
        renderer.drawCircleWithAlpha(
            this.position.x, 
            renderY, 
            glowRadius, 
            this.color, 
            0.3
        );
        
        // 主體
        renderer.drawCircle(this.position.x, renderY, this.size, this.color);
        
        // 根據類型繪製特殊圖案
        this.renderTypeSpecific(renderer, renderY);
        
        // 磁鐵範圍指示（調試用）
        if (gameSettings && gameSettings.get('gameplay', 'debug')) {
            renderer.drawCircle(this.position.x, renderY, this.magnetRange, this.color, false);
        }
    }

    // 渲染類型特定的圖案
    renderTypeSpecific(renderer, y) {
        switch (this.type) {
            case 'gold':
                // 金幣上的 $ 符號
                renderer.drawText('$', this.position.x - 4, y - 6, '#ffffff', '12px Arial');
                break;
            case 'exp':
                // 經驗值寶石的星形
                renderer.drawText('★', this.position.x - 5, y - 6, '#ffffff', '12px Arial');
                break;
            case 'health':
                // 血瓶的十字
                renderer.drawText('+', this.position.x - 4, y - 6, '#ffffff', '14px Arial');
                break;
            case 'mana':
                // 魔法瓶的菱形
                renderer.drawText('◆', this.position.x - 4, y - 6, '#ffffff', '12px Arial');
                break;
        }
    }

    // 獲取戰利品資訊
    getInfo() {
        return {
            type: this.type,
            value: this.value,
            position: this.position.copy(),
            isActive: this.isActive,
            age: this.age,
            timeLeft: this.lifeTime - this.age
        };
    }
}

/**
 * 戰利品管理器
 */
class LootManager {
    constructor() {
        this.loots = [];
        this.maxLoots = 100;
    }

    // 生成戰利品
    spawnLoot(type, x, y, value = null) {
        if (this.loots.length >= this.maxLoots) {
            // 移除最老的戰利品
            const oldestLoot = this.loots.reduce((oldest, loot) => 
                loot.age > oldest.age ? loot : oldest
            );
            this.removeLoot(oldestLoot);
        }
        
        // 設定預設值
        if (value === null) {
            value = this.getDefaultValue(type);
        }
        
        const loot = new Loot(x, y, type, value);
        this.loots.push(loot);
        return loot;
    }

    // 獲取預設值
    getDefaultValue(type) {
        const defaults = {
            gold: Math.floor(1 + Math.random() * 3),
            exp: Math.floor(5 + Math.random() * 10),
            health: Math.floor(10 + Math.random() * 20),
            mana: Math.floor(5 + Math.random() * 15)
        };
        return defaults[type] || 1;
    }

    // 生成金幣
    spawnGold(x, y, amount = null) {
        return this.spawnLoot('gold', x, y, amount);
    }

    // 生成經驗值寶石
    spawnExp(x, y, amount = null) {
        return this.spawnLoot('exp', x, y, amount);
    }

    // 生成血瓶
    spawnHealth(x, y, amount = null) {
        return this.spawnLoot('health', x, y, amount);
    }

    // 生成魔法瓶
    spawnMana(x, y, amount = null) {
        return this.spawnLoot('mana', x, y, amount);
    }

    // 更新所有戰利品
    update(deltaTime) {
        this.loots.forEach(loot => {
            loot.update(deltaTime);
        });
        
        // 移除不活動的戰利品
        this.loots = this.loots.filter(loot => loot.isActive);
    }

    // 渲染所有戰利品
    render(renderer) {
        this.loots.forEach(loot => {
            loot.render(renderer);
        });
    }

    // 移除戰利品
    removeLoot(loot) {
        const index = this.loots.indexOf(loot);
        if (index > -1) {
            loot.destroy();
            this.loots.splice(index, 1);
        }
    }

    // 清除所有戰利品
    clearAll() {
        this.loots.forEach(loot => loot.destroy());
        this.loots = [];
    }

    // 收集範圍內的所有戰利品
    collectNearby(position, range) {
        const nearbyLoots = this.loots.filter(loot => 
            loot.isActive && loot.position.distanceTo(position) <= range
        );
        
        nearbyLoots.forEach(loot => loot.collect());
    }

    // 獲取統計資料
    getStats() {
        const typeCount = {};
        this.loots.forEach(loot => {
            typeCount[loot.type] = (typeCount[loot.type] || 0) + 1;
        });
        
        return {
            totalLoots: this.loots.length,
            typeBreakdown: typeCount,
            activeLoots: this.loots.filter(loot => loot.isActive).length
        };
    }

    // 重置管理器
    reset() {
        this.clearAll();
    }
}

// 全域戰利品管理器
const lootManager = new LootManager();
window.lootManager = lootManager;