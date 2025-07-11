/**
 * 粒子渲染系統 - 根據DNA基因生成動態粒子效果
 * 實現複雜的粒子行為和視覺效果
 */
class ParticleRenderer {
    constructor() {
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = 1000;
        this.activeParticles = 0;
        
        // 粒子系統狀態
        this.isActive = false;
        this.emissionRate = 20; // 增加預設發射率
        this.lastEmissionTime = 0;
        
        // Canvas尺寸
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        
        // 性能優化
        this.performanceMode = 'auto'; // 'low', 'medium', 'high', 'auto'
        this.targetFPS = 60;
        this.currentFPS = 60;
        
        // 預計算資源
        this.precomputedSin = [];
        this.precomputedCos = [];
        this.initPrecomputedTables();
        
        console.log('✨ 粒子渲染系統初始化完成');
    }
    
    // 初始化預計算表
    initPrecomputedTables() {
        const steps = 360;
        for (let i = 0; i < steps; i++) {
            const angle = (i / steps) * Math.PI * 2;
            this.precomputedSin[i] = Math.sin(angle);
            this.precomputedCos[i] = Math.cos(angle);
        }
    }
    
    // 獲取預計算的三角函數值
    fastSin(angle) {
        const index = Math.floor(((angle % (Math.PI * 2)) / (Math.PI * 2)) * 360);
        return this.precomputedSin[index] || 0;
    }
    
    fastCos(angle) {
        const index = Math.floor(((angle % (Math.PI * 2)) / (Math.PI * 2)) * 360);
        return this.precomputedCos[index] || 0;
    }
    
    // 安全創建徑向漸變的輔助函數
    createSafeRadialGradient(ctx, x0, y0, r0, x1, y1, r1) {
        // 確保所有參數都是有效的數值
        const safeX0 = isFinite(x0) ? x0 : 0;
        const safeY0 = isFinite(y0) ? y0 : 0;
        const safeR0 = isFinite(r0) && r0 >= 0 ? r0 : 0;
        const safeX1 = isFinite(x1) ? x1 : 0;
        const safeY1 = isFinite(y1) ? y1 : 0;
        const safeR1 = isFinite(r1) && r1 > 0 ? r1 : 1;
        
        // 只在debug模式下記錄警告，並且節流輸出
        if ((x0 !== safeX0 || y0 !== safeY0 || r0 !== safeR0 || x1 !== safeX1 || y1 !== safeY1 || r1 !== safeR1) && 
            window.dnaLab?.settings?.debugMode && 
            Math.random() < 0.01) { // 只有1%的機率輸出警告
            console.warn('⚠️ ParticleRenderer createRadialGradient: 修正了無效參數', {
                original: { x0, y0, r0, x1, y1, r1 },
                safe: { x0: safeX0, y0: safeY0, r0: safeR0, x1: safeX1, y1: safeY1, r1: safeR1 }
            });
        }
        
        try {
            return ctx.createRadialGradient(safeX0, safeY0, safeR0, safeX1, safeY1, safeR1);
        } catch (error) {
            // 只在debug模式下記錄錯誤
            if (window.dnaLab?.settings?.debugMode) {
                console.error('❌ ParticleRenderer createRadialGradient 失敗:', error);
            }
            // 返回一個簡單的線性漸變作為備用
            return ctx.createLinearGradient(safeX0, safeY0, safeX1, safeY1);
        }
    }
    
    // 創建粒子
    createParticle(x, y, particleGenes) {
        let particle = this.particlePool.pop();
        
        if (!particle) {
            particle = {
                x: 0, y: 0, vx: 0, vy: 0,
                life: 1, maxLife: 1,
                size: 1, alpha: 1,
                color: { r: 255, g: 255, b: 255 },
                age: 0,
                rotation: 0, rotationSpeed: 0,
                scale: 1, scaleSpeed: 0,
                behavior: 'drift',
                isActive: false,
                trail: [],
                magneticForce: { x: 0, y: 0 },
                electricCharge: 0,
                quantumState: null
            };
        }
        
        // 重置粒子屬性
        particle.x = x;
        particle.y = y;
        particle.isActive = true;
        particle.age = 0;
        particle.trail = [];
        
        // 根據基因設定粒子屬性
        this.initializeParticleFromGenes(particle, particleGenes);
        
        return particle;
    }
    
    // 根據基因初始化粒子
    initializeParticleFromGenes(particle, genes) {
        // 生命週期
        particle.life = genes.lifespan + (Math.random() - 0.5) * genes.lifespan * 0.5;
        particle.maxLife = particle.life;
        
        // 大小 - 增加基礎大小
        particle.size = Math.max(5, genes.size * 2 + (Math.random() - 0.5) * genes.size * genes.sizeVariation);
        particle.scale = 1;
        particle.scaleSpeed = (Math.random() - 0.5) * 0.02;
        
        // 速度 - 降低初始速度讓粒子更容易被看到
        const angle = Math.random() * Math.PI * 2;
        const speed = 10 + Math.random() * 30;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        
        // 旋轉
        particle.rotation = Math.random() * Math.PI * 2;
        particle.rotationSpeed = (Math.random() - 0.5) * 0.1;
        
        // 行為
        particle.behavior = genes.behavior;
        particle.cohesion = genes.cohesion;
        particle.separation = genes.separation;
        
        // 特殊效果
        particle.hasTrails = genes.hasTrails;
        particle.trailLength = genes.trailLength;
        particle.isElectric = genes.isElectric;
        particle.isMagnetic = genes.isMagnetic;
        
        // 電磁屬性
        if (particle.isElectric) {
            particle.electricCharge = (Math.random() - 0.5) * 2;
        }
        
        // 量子狀態
        if (Math.random() < 0.1) {
            particle.quantumState = {
                superposition: Math.random() > 0.5,
                entangled: null,
                coherence: Math.random()
            };
        }
        
        // 顏色（基於行為）
        particle.color = this.getParticleColor(particle.behavior);
        particle.alpha = 1;
    }
    
    // 獲取粒子顏色
    getParticleColor(behavior) {
        const colorMap = {
            'explode': { r: 255, g: 100, b: 50 },
            'implode': { r: 100, g: 100, b: 255 },
            'swirl': { r: 255, g: 255, b: 100 },
            'drift': { r: 200, g: 200, b: 200 },
            'chase': { r: 255, g: 50, b: 255 },
            'orbit': { r: 100, g: 255, b: 100 },
            'spiral': { r: 255, g: 150, b: 200 },
            'bounce': { r: 255, g: 255, b: 255 },
            'flow': { r: 100, g: 200, b: 255 },
            'chaos': { r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255 }
        };
        
        return colorMap[behavior] || { r: 255, g: 255, b: 255 };
    }
    
    // 更新粒子
    updateParticle(particle, deltaTime, genes, allParticles) {
        if (!particle.isActive) return;
        
        const dt = deltaTime * 0.001;
        particle.age += dt;
        
        // 生命週期
        particle.life -= dt * genes.fadeRate;
        if (particle.life <= 0) {
            this.killParticle(particle);
            return;
        }
        
        // 計算生命週期比例
        const lifeRatio = particle.life / particle.maxLife;
        particle.alpha = lifeRatio;
        
        // 更新位置
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        
        // 更新旋轉和縮放
        particle.rotation += particle.rotationSpeed;
        particle.scale += particle.scaleSpeed * dt;
        particle.scale = Math.max(0.1, Math.min(3, particle.scale));
        
        // 根據行為更新
        this.updateParticleBehavior(particle, deltaTime, genes, allParticles);
        
        // 特效更新
        this.updateParticleEffects(particle, deltaTime, genes);
        
        // 軌跡更新
        if (particle.hasTrails) {
            this.updateParticleTrail(particle, genes);
        }
        
        // 量子效應
        if (particle.quantumState) {
            this.updateQuantumState(particle, deltaTime);
        }
    }
    
    // 更新粒子行為
    updateParticleBehavior(particle, deltaTime, genes, allParticles) {
        const dt = deltaTime * 0.001;
        
        switch (particle.behavior) {
            case 'explode':
                // 爆炸效果 - 向外擴散
                const explodeForce = 200 * (1 - particle.age / particle.maxLife);
                particle.vx += particle.vx * explodeForce * dt;
                particle.vy += particle.vy * explodeForce * dt;
                break;
                
            case 'implode':
                // 內爆效果 - 向中心收縮
                const implodeForce = 100 * particle.age / particle.maxLife;
                particle.vx -= particle.x * implodeForce * dt;
                particle.vy -= particle.y * implodeForce * dt;
                break;
                
            case 'swirl':
                // 漩渦效果
                const centerX = 400, centerY = 300;
                const dx = particle.x - centerX;
                const dy = particle.y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                
                particle.vx += -Math.sin(angle) * 100 * dt;
                particle.vy += Math.cos(angle) * 100 * dt;
                
                // 向中心拉力
                particle.vx -= dx * 0.5 * dt;
                particle.vy -= dy * 0.5 * dt;
                break;
                
            case 'drift':
                // 漂移效果 - 隨機游走
                particle.vx += (Math.random() - 0.5) * 50 * dt;
                particle.vy += (Math.random() - 0.5) * 50 * dt;
                
                // 限制速度
                const driftSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                if (driftSpeed > 100) {
                    particle.vx = (particle.vx / driftSpeed) * 100;
                    particle.vy = (particle.vy / driftSpeed) * 100;
                }
                break;
                
            case 'chase':
                // 追逐效果 - 跟隨其他粒子
                this.applyChase(particle, allParticles, dt);
                break;
                
            case 'orbit':
                // 軌道運動
                const orbitCenterX = 400, orbitCenterY = 300;
                const orbitDx = particle.x - orbitCenterX;
                const orbitDy = particle.y - orbitCenterY;
                const orbitAngle = Math.atan2(orbitDy, orbitDx);
                
                particle.vx = -Math.sin(orbitAngle) * 150;
                particle.vy = Math.cos(orbitAngle) * 150;
                break;
                
            case 'spiral':
                // 螺旋運動
                const spiralRadius = particle.age * 50;
                const spiralAngle = particle.age * 5;
                particle.vx = Math.cos(spiralAngle) * spiralRadius * 0.1;
                particle.vy = Math.sin(spiralAngle) * spiralRadius * 0.1;
                break;
                
            case 'bounce':
                // 彈跳效果
                if (particle.x < 0 || particle.x > 800) particle.vx *= -0.8;
                if (particle.y < 0 || particle.y > 600) particle.vy *= -0.8;
                
                // 重力
                particle.vy += 200 * dt;
                break;
                
            case 'flow':
                // 流動效果
                const flowField = this.getFlowField(particle.x, particle.y, deltaTime);
                particle.vx += flowField.x * 100 * dt;
                particle.vy += flowField.y * 100 * dt;
                break;
                
            case 'chaos':
                // 混沌運動
                const chaosStrength = 200;
                particle.vx += (Math.random() - 0.5) * chaosStrength * dt;
                particle.vy += (Math.random() - 0.5) * chaosStrength * dt;
                
                // 非線性阻尼
                const chaosSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                if (chaosSpeed > 300) {
                    const dampening = 0.8;
                    particle.vx *= dampening;
                    particle.vy *= dampening;
                }
                break;
        }
    }
    
    // 應用追逐行為
    applyChase(particle, allParticles, dt) {
        let nearestParticle = null;
        let minDistance = Infinity;
        
        for (const other of allParticles) {
            if (other === particle || !other.isActive) continue;
            
            const dx = other.x - particle.x;
            const dy = other.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance && distance > 0) {
                minDistance = distance;
                nearestParticle = other;
            }
        }
        
        if (nearestParticle && minDistance > 0) {
            const dx = nearestParticle.x - particle.x;
            const dy = nearestParticle.y - particle.y;
            const force = 100 / Math.max(minDistance, 1);
            
            particle.vx += (dx / minDistance) * force * dt;
            particle.vy += (dy / minDistance) * force * dt;
        }
    }
    
    // 獲取流場
    getFlowField(x, y, time) {
        const scale = 0.01;
        const timeScale = 0.001;
        
        return {
            x: Math.sin(x * scale + time * timeScale) * Math.cos(y * scale),
            y: Math.cos(x * scale + time * timeScale) * Math.sin(y * scale)
        };
    }
    
    // 更新粒子特效
    updateParticleEffects(particle, deltaTime, genes) {
        const dt = deltaTime * 0.001;
        
        // 電磁效應
        if (particle.isElectric) {
            // 電荷相互作用
            particle.magneticForce.x += Math.sin(particle.age * 10) * 20 * dt;
            particle.magneticForce.y += Math.cos(particle.age * 10) * 20 * dt;
            
            particle.vx += particle.magneticForce.x * dt;
            particle.vy += particle.magneticForce.y * dt;
        }
        
        if (particle.isMagnetic) {
            // 磁場效應
            const magneticStrength = 50;
            particle.vx += Math.sin(particle.age * 5) * magneticStrength * dt;
            particle.vy += Math.cos(particle.age * 5) * magneticStrength * dt;
        }
    }
    
    // 更新粒子軌跡
    updateParticleTrail(particle, genes) {
        // 添加當前位置到軌跡
        particle.trail.push({ x: particle.x, y: particle.y, alpha: particle.alpha });
        
        // 限制軌跡長度
        const maxTrailLength = Math.floor(genes.trailLength * 50);
        if (particle.trail.length > maxTrailLength) {
            particle.trail.shift();
        }
        
        // 更新軌跡透明度
        particle.trail.forEach((point, index) => {
            point.alpha = (index / particle.trail.length) * particle.alpha;
        });
    }
    
    // 更新量子狀態
    updateQuantumState(particle, deltaTime) {
        if (!particle.quantumState) return;
        
        const dt = deltaTime * 0.001;
        
        // 量子相干性衰減
        particle.quantumState.coherence -= dt * 0.1;
        
        if (particle.quantumState.coherence <= 0) {
            particle.quantumState = null;
            return;
        }
        
        // 量子疊加效應
        if (particle.quantumState.superposition) {
            // 在兩個位置之間疊加
            const uncertainty = 20 * particle.quantumState.coherence;
            particle.x += (Math.random() - 0.5) * uncertainty;
            particle.y += (Math.random() - 0.5) * uncertainty;
        }
        
        // 量子糾纏效應
        if (particle.quantumState.entangled) {
            const entangled = particle.quantumState.entangled;
            if (entangled.isActive) {
                // 同步某些屬性
                particle.rotation = entangled.rotation;
                particle.scale = entangled.scale;
            }
        }
    }
    
    // 殺死粒子
    killParticle(particle) {
        particle.isActive = false;
        particle.trail = [];
        particle.quantumState = null;
        this.particlePool.push(particle);
        this.activeParticles--;
    }
    
    // 發射粒子
    emitParticles(x, y, count, genes) {
        if (this.activeParticles >= this.maxParticles) return;
        
        const emitCount = Math.min(count, this.maxParticles - this.activeParticles);
        
        for (let i = 0; i < emitCount; i++) {
            const particle = this.createParticle(x, y, genes);
            this.particles.push(particle);
            this.activeParticles++;
        }
        
        // 已移除高頻粒子發射日誌以提升性能
    }
    
    // 爆發式發射
    burst(x, y, genes) {
        const burstSize = genes.burstSize || 10;
        this.emitParticles(x, y, burstSize, genes);
    }
    
    // 更新所有粒子
    update(deltaTime, genes) {
        const dt = deltaTime * 0.001;
        
        // 確保有發射率
        const emissionRate = genes.emissionRate || this.emissionRate || 10;
        
        // 持續發射
        const timeSinceLastEmission = deltaTime - this.lastEmissionTime;
        if (timeSinceLastEmission > (1000 / emissionRate)) {
            // 使用canvas的中心點而非固定座標
            const centerX = this.canvasWidth ? this.canvasWidth / 2 : 400;
            const centerY = this.canvasHeight ? this.canvasHeight / 2 : 300;
            this.emitParticles(centerX, centerY, 1, genes);
            this.lastEmissionTime = deltaTime;
        }
        
        // 更新所有粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (!particle.isActive) {
                this.particles.splice(i, 1);
                continue;
            }
            
            this.updateParticle(particle, deltaTime, genes, this.particles);
        }
        
        // 性能優化
        this.optimizePerformance();
    }
    
    // 渲染所有粒子
    render(ctx, deltaTime, genes) {
        if (this.particles.length === 0) return;
        
        // 更新canvas尺寸參考
        if (ctx.canvas) {
            this.canvasWidth = ctx.canvas.width;
            this.canvasHeight = ctx.canvas.height;
        }
        
        // 根據性能模式調整渲染質量
        const quality = this.getQualityLevel();
        
        for (const particle of this.particles) {
            if (!particle.isActive) continue;
            
            this.renderParticle(ctx, particle, quality);
        }
        
        // 更新粒子數量顯示
        this.updateParticleCount();
    }
    
    // 渲染單個粒子
    renderParticle(ctx, particle, quality) {
        ctx.save();
        
        // 設置透明度
        ctx.globalAlpha = particle.alpha;
        
        // 移動到粒子位置
        ctx.translate(particle.x, particle.y);
        
        // 旋轉
        ctx.rotate(particle.rotation);
        
        // 縮放
        ctx.scale(particle.scale, particle.scale);
        
        // 設置顏色
        ctx.fillStyle = `rgb(${particle.color.r}, ${particle.color.g}, ${particle.color.b})`;
        
        // 渲染軌跡
        if (particle.hasTrails && particle.trail.length > 1 && quality > 1) {
            this.renderTrail(ctx, particle.trail);
        }
        
        // 渲染粒子本體
        if (particle.isElectric && quality > 2) {
            this.renderElectricParticle(ctx, particle);
        } else if (particle.quantumState && quality > 2) {
            this.renderQuantumParticle(ctx, particle);
        } else {
            this.renderBasicParticle(ctx, particle);
        }
        
        ctx.restore();
    }
    
    // 渲染基本粒子
    renderBasicParticle(ctx, particle) {
        // 添加發光效果使粒子更明顯
        const gradient = this.createSafeRadialGradient(ctx, 0, 0, 0, 0, 0, particle.size * 2);
        gradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`);
        gradient.addColorStop(0.5, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 核心亮點
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 渲染電子粒子
    renderElectricParticle(ctx, particle) {
        // 電子光環
        const gradient = this.createSafeRadialGradient(ctx, 0, 0, 0, 0, 0, particle.size * 2);
        gradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.8)`);
        gradient.addColorStop(1, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 核心
        ctx.fillStyle = `rgb(${particle.color.r}, ${particle.color.g}, ${particle.color.b})`;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 電弧
        ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const angle = (particle.age * 5 + i * Math.PI / 1.5) % (Math.PI * 2);
            const x = Math.cos(angle) * particle.size * 1.5;
            const y = Math.sin(angle) * particle.size * 1.5;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
    
    // 渲染量子粒子
    renderQuantumParticle(ctx, particle) {
        const coherence = particle.quantumState.coherence;
        
        // 量子疊加效應
        if (particle.quantumState.superposition) {
            const uncertainty = 10 * coherence;
            
            for (let i = 0; i < 3; i++) {
                const offsetX = (Math.random() - 0.5) * uncertainty;
                const offsetY = (Math.random() - 0.5) * uncertainty;
                
                ctx.globalAlpha = particle.alpha * coherence * 0.3;
                ctx.beginPath();
                ctx.arc(offsetX, offsetY, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // 主要粒子
        ctx.globalAlpha = particle.alpha;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 相干性指示器
        ctx.strokeStyle = `rgba(255, 255, 255, ${coherence})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 2, 0, Math.PI * 2 * coherence);
        ctx.stroke();
    }
    
    // 渲染軌跡
    renderTrail(ctx, trail) {
        if (trail.length < 2) return;
        
        ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(trail[0].x - ctx.getTransform().e, trail[0].y - ctx.getTransform().f);
        
        for (let i = 1; i < trail.length; i++) {
            const point = trail[i];
            ctx.globalAlpha = point.alpha * 0.5;
            ctx.lineTo(point.x - ctx.getTransform().e, point.y - ctx.getTransform().f);
        }
        
        ctx.stroke();
    }
    
    // 獲取品質等級
    getQualityLevel() {
        if (this.performanceMode === 'auto') {
            if (this.currentFPS > 50) return 3;
            if (this.currentFPS > 30) return 2;
            return 1;
        }
        
        const qualityMap = { 'low': 1, 'medium': 2, 'high': 3 };
        return qualityMap[this.performanceMode] || 2;
    }
    
    // 性能優化
    optimizePerformance() {
        // 如果粒子數量過多，移除一些老粒子
        if (this.particles.length > this.maxParticles * 0.8) {
            this.particles.sort((a, b) => a.life - b.life);
            for (let i = 0; i < Math.floor(this.particles.length * 0.1); i++) {
                this.killParticle(this.particles[i]);
            }
        }
        
        // 動態調整發射率
        if (this.activeParticles > this.maxParticles * 0.9) {
            this.emissionRate *= 0.9;
        } else if (this.activeParticles < this.maxParticles * 0.3) {
            this.emissionRate *= 1.1;
        }
    }
    
    // 更新粒子數量顯示
    updateParticleCount() {
        const countElement = document.getElementById('particleCount');
        if (countElement) {
            countElement.textContent = this.activeParticles;
        }
    }
    
    // 清除所有粒子
    clear() {
        this.particles.forEach(particle => this.killParticle(particle));
        this.particles = [];
        this.activeParticles = 0;
        console.log('🧹 所有粒子已清除');
    }
    
    // 設置性能模式
    setPerformanceMode(mode) {
        this.performanceMode = mode;
        console.log(`⚙️ 粒子性能模式設置為: ${mode}`);
    }
    
    // 獲取系統狀態
    getStatus() {
        return {
            activeParticles: this.activeParticles,
            maxParticles: this.maxParticles,
            poolSize: this.particlePool.length,
            performanceMode: this.performanceMode,
            currentFPS: this.currentFPS,
            qualityLevel: this.getQualityLevel()
        };
    }
    
    // 創建特殊效果
    createFirework(x, y, genes) {
        const fireworkGenes = { ...genes };
        fireworkGenes.behavior = 'explode';
        fireworkGenes.burstSize = 20;
        fireworkGenes.lifespan = 3;
        
        this.burst(x, y, fireworkGenes);
    }
    
    createBlackHole(x, y, genes) {
        const blackHoleGenes = { ...genes };
        blackHoleGenes.behavior = 'implode';
        blackHoleGenes.emissionRate = 50;
        blackHoleGenes.lifespan = 5;
        
        this.emitParticles(x, y, 30, blackHoleGenes);
    }
    
    createQuantumExplosion(x, y, genes) {
        const quantumGenes = { ...genes };
        quantumGenes.behavior = 'chaos';
        quantumGenes.burstSize = 15;
        quantumGenes.lifespan = 4;
        
        // 創建量子糾纏對
        const particles = [];
        for (let i = 0; i < 6; i++) {
            const particle = this.createParticle(x, y, quantumGenes);
            particle.quantumState = {
                superposition: true,
                entangled: null,
                coherence: 1
            };
            particles.push(particle);
        }
        
        // 糾纏配對
        for (let i = 0; i < particles.length; i += 2) {
            if (i + 1 < particles.length) {
                particles[i].quantumState.entangled = particles[i + 1];
                particles[i + 1].quantumState.entangled = particles[i];
            }
        }
        
        particles.forEach(particle => {
            this.particles.push(particle);
            this.activeParticles++;
        });
    }
}

console.log('✨ 粒子渲染系統載入完成');