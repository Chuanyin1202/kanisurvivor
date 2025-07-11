/**
 * 混沌引擎 - 將視覺DNA轉換為實際的視覺效果
 * 基於DNA基因生成動態、不可預測的視覺組件
 */
class ChaosEngine {
    constructor(canvas, particleRenderer) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particleRenderer = particleRenderer;
        
        // 引擎狀態
        this.isActive = false;
        this.animationId = null;
        this.startTime = 0;
        
        // 當前渲染的DNA
        this.currentDNA = null;
        this.visualElements = [];
        
        // 生命週期模式
        this.lifecycleMode = false;
        this.lifecycleState = null;
        
        // 性能監控
        this.frameCount = 0;
        this.lastFPSTime = 0;
        this.currentFPS = 0;
        
        // 混沌狀態
        this.chaosState = {
            time: 0,
            entropy: 0,
            complexity: 0,
            mutationProbability: 0
        };
        
        console.log('🌀 混沌引擎初始化完成');
    }
    
    // 開始渲染DNA
    startRendering(dna) {
        if (!dna) {
            console.error('❌ 無效的DNA序列');
            return;
        }
        
        // 性能檢查：警告高複雜度
        if (dna.genes?.shapeGenes?.complexity > 5) {
            console.warn(`⚠️ 性能警告：形狀複雜度為 ${dna.genes.shapeGenes.complexity}，可能導致渲染性能問題！`);
        }
        
        this.currentDNA = dna;
        this.isActive = true;
        this.startTime = performance.now();
        
        // 生成視覺元素
        this.generateVisualElements();
        
        // 開始動畫循環
        this.animate();
        
        console.log('🎨 開始渲染DNA:', dna.getSequenceString());
        console.log('📊 視覺元素數量:', this.visualElements.length);
        console.log('🎯 Canvas尺寸:', this.canvas.width, 'x', this.canvas.height);
        if (dna.genes?.shapeGenes?.complexity) {
            console.log('🔶 形狀複雜度:', dna.genes.shapeGenes.complexity);
        }
    }
    
    // 開始生命週期渲染
    startLifecycleRendering(dna, lifecycleState) {
        this.currentDNA = dna;
        this.lifecycleMode = true;
        this.lifecycleState = lifecycleState;
        this.isActive = true;
        this.startTime = performance.now();
        
        // 生成視覺元素
        this.generateVisualElements();
        
        // 開始動畫循環
        this.animate();
        
        console.log('🚀 開始生命週期渲染:', dna.getSequenceString());
    }
    
    // 停止渲染（保留最後一幀）
    stopRendering(clearCanvas = false) {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // 清理所有視覺元素以防止記憶體洩漏
        this.visualElements = [];
        
        // 重置性能統計
        this.frameCount = 0;
        this.lastFPSTime = 0;
        this.currentFPS = 0;
        
        // 重置混沌狀態
        this.chaosState = {
            time: 0,
            entropy: 0,
            complexity: 0,
            mutationProbability: 0
        };
        
        // 只有明確要求時才清空畫面
        if (clearCanvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            console.log('🛑 停止渲染並清空畫面');
        } else {
            console.log('⏸️ 暫停渲染（保留視覺效果）');
        }
    }
    
    // 生成視覺元素
    generateVisualElements() {
        if (!this.currentDNA) return;
        
        this.visualElements = [];
        const genes = this.currentDNA.genes;
        
        // 根據形狀基因生成核心形狀
        const coreShape = this.createCoreShape(genes.shapeGenes);
        if (coreShape) {
            this.visualElements.push(coreShape);
        }
        
        // 根據運動基因生成運動軌跡
        const motionEffect = this.createMotionEffect(genes.motionGenes);
        if (motionEffect) {
            this.visualElements.push(motionEffect);
        }
        
        // 根據特效基因生成特效層
        const effectLayer = this.createEffectLayer(genes.fxGenes);
        if (effectLayer) {
            this.visualElements.push(effectLayer);
        }
        
        // 根據混沌基因生成混沌元素
        const chaosElement = this.createChaosElement(genes.chaosGenes);
        if (chaosElement) {
            this.visualElements.push(chaosElement);
        }
        
        // 根據粒子基因生成粒子系統
        const particleSystem = this.createParticleSystem(genes.particleGenes);
        if (particleSystem) {
            this.visualElements.push(particleSystem);
        }
        
        console.log(`🎭 生成了 ${this.visualElements.length} 個視覺元素`);
    }
    
    // 創建核心形狀
    createCoreShape(shapeGenes) {
        return {
            type: 'coreShape',
            shape: shapeGenes.coreShape,
            size: shapeGenes.coreSize,
            complexity: shapeGenes.complexity,
            symmetry: shapeGenes.symmetry,
            isDeforming: shapeGenes.isDeforming,
            deformSpeed: shapeGenes.deformSpeed,
            deformIntensity: shapeGenes.deformIntensity,
            dimension: shapeGenes.dimension,
            depth: shapeGenes.depth,
            position: { x: this.canvas.width / 2, y: this.canvas.height / 2 },
            rotation: 0,
            scale: 1,
            render: (ctx, time) => this.renderCoreShape(ctx, time, shapeGenes)
        };
    }
    
    // 創建運動效果（移除軌跡系統）
    createMotionEffect(motionGenes) {
        return {
            type: 'motionEffect',
            speed: motionGenes.speed,
            rotationSpeed: motionGenes.rotationSpeed,
            scaling: motionGenes.scaling,
            pulsing: motionGenes.pulsing,
            hasGravity: motionGenes.hasGravity,
            timeDistortion: motionGenes.timeDistortion,
            spaceWarping: motionGenes.spaceWarping,
            render: (ctx, time) => this.renderMotionEffect(ctx, time, motionGenes)
        };
    }
    
    // 創建特效層
    createEffectLayer(fxGenes) {
        return {
            type: 'effectLayer',
            hasGlow: fxGenes.hasGlow,
            glowIntensity: fxGenes.glowIntensity,
            glowRadius: fxGenes.glowRadius,
            hasBlur: fxGenes.hasBlur,
            hasDistortion: fxGenes.hasDistortion,
            distortionType: fxGenes.distortionType,
            hasLighting: fxGenes.hasLighting,
            hasTimeEffect: fxGenes.hasTimeEffect,
            timeStretch: fxGenes.timeStretch,
            render: (ctx, time) => this.renderEffectLayer(ctx, time, fxGenes)
        };
    }
    
    // 創建混沌元素
    createChaosElement(chaosGenes) {
        return {
            type: 'chaosElement',
            chaosLevel: chaosGenes.chaosLevel,
            unpredictability: chaosGenes.unpredictability,
            canRandomMutate: chaosGenes.canRandomMutate,
            hasQuantumEffects: chaosGenes.hasQuantumEffects,
            attractorType: chaosGenes.attractorType,
            attractorStrength: chaosGenes.attractorStrength,
            hasNonlinearDynamics: chaosGenes.hasNonlinearDynamics,
            bifurcationPoint: chaosGenes.bifurcationPoint,
            render: (ctx, time) => this.renderChaosElement(ctx, time, chaosGenes)
        };
    }
    
    // 動畫循環
    animate() {
        if (!this.isActive) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.startTime;
        
        // 更新混沌狀態
        this.updateChaosState(deltaTime);
        
        // 清空畫面並設置背景
        this.ctx.fillStyle = '#0a0a0a'; // 更暗的背景以增加對比
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 重置全域設定
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1;
        
        // Debug 測試元素已移除
        
        // 統一渲染系統
        this.renderUnifiedSpellSystem(deltaTime);
        
        // 更新性能統計
        this.updatePerformanceStats(currentTime);
        
        // 隨機突變檢查
        this.checkRandomMutation();
        
        // 繼續動畫
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    // 更新混沌狀態
    updateChaosState(time) {
        this.chaosState.time = time;
        
        if (this.currentDNA) {
            const chaosGenes = this.currentDNA.genes.chaosGenes;
            
            // 基於時間的熵變化
            this.chaosState.entropy = (Math.sin(time * 0.001) + 1) / 2 * chaosGenes.chaosLevel;
            
            // 複雜度計算
            this.chaosState.complexity = this.currentDNA.calculateComplexity();
            
            // 突變概率
            this.chaosState.mutationProbability = chaosGenes.mutationIntensity * this.chaosState.entropy;
        }
    }
    
    // 渲染核心形狀
    renderCoreShape(ctx, time, shapeGenes) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // 顏色基因
        const colorGenes = this.currentDNA.genes.colorGenes;
        const color = this.getCurrentColor(colorGenes, time);
        
        // 變形效果
        let size = shapeGenes.coreSize;
        if (shapeGenes.isDeforming) {
            size += Math.sin(time * shapeGenes.deformSpeed) * shapeGenes.deformIntensity * 10;
        }
        
        // 脈衝效果
        if (colorGenes.isPulsing) {
            size += Math.sin(time * 0.003) * 5;
        }
        
        // 確保size不為負數，且至少為1
        size = Math.max(1, size);
        
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        
        // 添加輪廓使形狀更明顯
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // 已移除高頻渲染日誌以提升性能
        
        // 根據形狀類型渲染
        switch (shapeGenes.coreShape) {
            case 'circle':
                this.drawEnhancedCircle(ctx, centerX, centerY, size, time, shapeGenes);
                break;
            case 'star':
                this.drawEnhancedStar(ctx, centerX, centerY, size, shapeGenes.symmetry, time, shapeGenes);
                break;
            case 'diamond':
                this.drawEnhancedDiamond(ctx, centerX, centerY, size, time, shapeGenes);
                break;
            case 'triangle':
                this.drawEnhancedTriangle(ctx, centerX, centerY, size, time, shapeGenes);
                break;
            case 'square':
                this.drawEnhancedSquare(ctx, centerX, centerY, size, time, shapeGenes);
                break;
            case 'hexagon':
                this.drawEnhancedHexagon(ctx, centerX, centerY, size, time, shapeGenes);
                break;
            case 'spiral':
                this.drawEnhancedSpiral(ctx, centerX, centerY, size, time, shapeGenes);
                break;
            case 'wave':
                this.drawEnhancedWave(ctx, centerX, centerY, size, time, shapeGenes);
                break;
            case 'crystal':
                this.drawEnhancedCrystal(ctx, centerX, centerY, size, shapeGenes.complexity, time, shapeGenes);
                break;
            case 'blob':
                this.drawEnhancedBlob(ctx, centerX, centerY, size, time, shapeGenes);
                break;
            case 'fractal':
                this.drawEnhancedFractal(ctx, centerX, centerY, size, shapeGenes.complexity, time, shapeGenes);
                break;
            case 'chaos':
                this.drawEnhancedChaos(ctx, centerX, centerY, size, time, shapeGenes);
                break;
            default:
                this.drawEnhancedCircle(ctx, centerX, centerY, size, time, shapeGenes);
        }
        
        // 清除陰影設定
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }
    
    // 渲染運動軌跡
    renderMotionEffect(ctx, time, motionGenes) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // 脈衝效果
        if (motionGenes.pulsing) {
            const pulse = Math.sin(time * motionGenes.pulseSpeed * 0.01) * 0.3 + 0.7;
            const currentColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, time);
            
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.3;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, 30 * pulse, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.globalAlpha = 1;
        }
        
        // 旋轉效果
        if (motionGenes.rotationSpeed !== 0) {
            const rotation = time * motionGenes.rotationSpeed * 0.001;
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);
            ctx.translate(-centerX, -centerY);
            
            // 渲染旋轉指示器
            const currentColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, time);
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4;
            
            ctx.beginPath();
            ctx.moveTo(centerX - 20, centerY);
            ctx.lineTo(centerX + 20, centerY);
            ctx.stroke();
            
            ctx.restore();
            ctx.globalAlpha = 1;
        }
    }
    
    // 渲染特效層
    renderEffectLayer(ctx, time, fxGenes) {
        let centerX, centerY;
        
        // 根據生命週期狀態決定特效中心位置
        if (this.lifecycleState?.projectilePosition) {
            centerX = this.lifecycleState.projectilePosition.x;
            centerY = this.lifecycleState.projectilePosition.y;
        } else {
            centerX = this.canvas.width / 2;
            centerY = this.canvas.height / 2;
        }
        
        // 性能保護：檢查是否同時有 distortion 和 quantumEffects
        const hasQuantum = this.currentDNA?.genes?.chaosGenes?.hasQuantumEffects;
        const shouldSkipDistortion = fxGenes.hasDistortion && hasQuantum;
        
        if (shouldSkipDistortion) {
            if (window.dnaLab?.settings?.debugMode) {
                console.warn('⚠️ 渲染層檢測到性能問題組合，跳過 Distortion 渲染');
            }
        }
        
        // 光暈效果
        if (fxGenes.hasGlow) {
            const glowColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, time);
            this.drawEnhancedGlow(ctx, centerX, centerY, fxGenes.glowRadius * fxGenes.glowIntensity, glowColor, time);
        }
        
        // 模糊效果
        if (fxGenes.hasBlur) {
            this.applyBlurEffect(ctx, fxGenes.blurAmount, time);
        }
        
        // 失真效果（性能保護：與量子效果互斥）
        if (fxGenes.hasDistortion && !shouldSkipDistortion) {
            this.applyEnhancedDistortion(ctx, fxGenes.distortionType, fxGenes.distortionIntensity, time);
        }
        
        // 光照效果
        if (fxGenes.hasLighting) {
            this.applyLightingEffect(ctx, centerX, centerY, fxGenes.lightingType, fxGenes.lightIntensity, time);
        }
        
        // 時間效果
        if (fxGenes.hasTimeEffect) {
            this.applyTimeEffect(ctx, fxGenes.timeStretch, time);
        }
        
        // 空間效果
        if (fxGenes.hasSpaceEffect) {
            this.applySpaceEffect(ctx, fxGenes.dimensionShift, time);
        }
    }
    
    // 渲染混沌元素
    renderChaosElement(ctx, time, chaosGenes) {
        if (!chaosGenes.hasQuantumEffects) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // 量子效應
        this.renderQuantumEffects(ctx, centerX, centerY, time, chaosGenes);
        
        // 混沌吸引子
        this.renderChaosAttractor(ctx, chaosGenes.attractorType, chaosGenes.attractorStrength, time);
        
        // 非線性動力學
        if (chaosGenes.hasNonlinearDynamics) {
            this.renderNonlinearDynamics(ctx, chaosGenes.bifurcationPoint, time);
        }
    }
    
    // 獲取當前顏色
    getCurrentColor(colorGenes, time) {
        let color = colorGenes.primary;
        
        if (colorGenes.isShifting) {
            const shift = Math.sin(time * colorGenes.shiftSpeed * 0.001) * 0.5 + 0.5;
            color = this.interpolateColor(colorGenes.primary, colorGenes.secondary, shift);
        }
        
        // 確保顏色值有效
        const r = Math.round(Math.max(0, Math.min(255, color.r || 255)));
        const g = Math.round(Math.max(0, Math.min(255, color.g || 255)));
        const b = Math.round(Math.max(0, Math.min(255, color.b || 255)));
        const a = Math.max(0, Math.min(1, color.a || 1));
        
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    
    // 顏色插值
    interpolateColor(color1, color2, factor) {
        return {
            r: Math.round(color1.r + (color2.r - color1.r) * factor),
            g: Math.round(color1.g + (color2.g - color1.g) * factor),
            b: Math.round(color1.b + (color2.b - color1.b) * factor),
            a: color1.a + (color2.a - color1.a) * factor
        };
    }
    
    // 繪製基本形狀
    drawCircle(ctx, x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke(); // 添加描邊
    }
    
    drawStar(ctx, x, y, radius, points) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const r = i % 2 === 0 ? radius : radius * 0.5;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }
    
    drawDiamond(ctx, x, y, size) {
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke(); // 添加描邊
    }
    
    drawTriangle(ctx, x, y, size) {
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x - size, y + size);
        ctx.closePath();
        ctx.fill();
    }
    
    drawSquare(ctx, x, y, size) {
        ctx.fillRect(x - size/2, y - size/2, size, size);
    }
    
    drawHexagon(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }
    
    drawSpiral(ctx, x, y, size, time) {
        ctx.beginPath();
        const turns = 3;
        const steps = 100;
        
        for (let i = 0; i <= steps; i++) {
            const angle = (i / steps) * Math.PI * 2 * turns + time * 0.001;
            const radius = (i / steps) * size;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
    
    drawWave(ctx, x, y, size, time) {
        ctx.beginPath();
        const wavelength = size * 0.5;
        const amplitude = size * 0.3;
        
        for (let i = -size; i <= size; i += 2) {
            const waveY = y + Math.sin((i / wavelength) + time * 0.001) * amplitude;
            if (i === -size) ctx.moveTo(x + i, waveY);
            else ctx.lineTo(x + i, waveY);
        }
        ctx.stroke();
    }
    
    drawCrystal(ctx, x, y, size, complexity) {
        for (let i = 0; i < complexity; i++) {
            const angle = (i / complexity) * Math.PI * 2;
            const length = size * (0.5 + Math.random() * 0.5);
            const endX = x + Math.cos(angle) * length;
            const endY = y + Math.sin(angle) * length;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }
    
    drawBlob(ctx, x, y, size, time) {
        ctx.beginPath();
        const points = 12;
        
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const noise = Math.sin(time * 0.001 + angle * 3) * 0.3 + 1;
            const radius = size * noise;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }
    
    drawFractal(ctx, x, y, size, depth) {
        if (depth <= 0) return;
        
        this.drawTriangle(ctx, x, y, size);
        
        if (depth > 1) {
            const newSize = size * 0.6;
            this.drawFractal(ctx, x - size/2, y + size/2, newSize, depth - 1);
            this.drawFractal(ctx, x + size/2, y + size/2, newSize, depth - 1);
            this.drawFractal(ctx, x, y - size/2, newSize, depth - 1);
        }
    }
    
    drawChaosShape(ctx, x, y, size, time) {
        ctx.beginPath();
        const points = 20;
        
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const chaos = Math.sin(time * 0.003 + angle * 7) * 0.5 +
                         Math.sin(time * 0.007 + angle * 3) * 0.3 +
                         Math.sin(time * 0.011 + angle * 11) * 0.2;
            const radius = size * (1 + chaos);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
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
            console.warn('⚠️ createRadialGradient: 修正了無效參數', {
                original: { x0, y0, r0, x1, y1, r1 },
                safe: { x0: safeX0, y0: safeY0, r0: safeR0, x1: safeX1, y1: safeY1, r1: safeR1 }
            });
        }
        
        try {
            return ctx.createRadialGradient(safeX0, safeY0, safeR0, safeX1, safeY1, safeR1);
        } catch (error) {
            // 只在debug模式下記錄錯誤
            if (window.dnaLab?.settings?.debugMode) {
                console.error('❌ createRadialGradient 失敗:', error);
            }
            // 返回一個簡單的線性漸變作為備用
            return ctx.createLinearGradient(safeX0, safeY0, safeX1, safeY1);
        }
    }
    
    // 繪製光暈
    drawGlow(ctx, x, y, radius, color) {
        // 確保所有參數都是有效的數值
        const safeX = isFinite(x) ? x : 0;
        const safeY = isFinite(y) ? y : 0;
        const safeRadius = isFinite(radius) && radius > 0 ? radius : 1;
        
        const gradient = ctx.createRadialGradient(safeX, safeY, 0, safeX, safeY, safeRadius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(safeX - safeRadius, safeY - safeRadius, safeRadius * 2, safeRadius * 2);
    }
    
    // 應用失真
    applyDistortion(ctx, type, intensity, time) {
        // 失真效果的實現（簡化版）
        const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        // 這裡可以添加具體的失真算法
    }
    
    // 應用時間效果
    applyTimeEffect(ctx, timeStretch, time) {
        // 時間效果的實現（簡化版）
        ctx.globalAlpha *= Math.sin(time * 0.001 * timeStretch) * 0.3 + 0.7;
    }
    
    // 渲染量子效應
    renderQuantumEffects(ctx, x, y, time, chaosGenes) {
        const quantumStates = this.currentDNA.entropy.quantumEntropy.states;
        
        quantumStates.forEach((state, i) => {
            if (state.superposition) {
                const offsetX = Math.sin(time * 0.001 + state.uncertainty) * 20;
                const offsetY = Math.cos(time * 0.001 + state.uncertainty) * 20;
                
                ctx.globalAlpha = 0.3;
                this.drawCircle(ctx, x + offsetX, y + offsetY, 5);
                ctx.globalAlpha = 1;
            }
        });
    }
    
    // 渲染混沌吸引子
    renderChaosAttractor(ctx, attractorType, strength, time) {
        // 簡化的混沌吸引子可視化
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        const points = 1000;
        let x = 0.1, y = 0.1, z = 0.1;
        
        ctx.beginPath();
        for (let i = 0; i < points; i++) {
            // Lorenz吸引子方程（簡化）
            const dt = 0.01;
            const dx = 10 * (y - x) * dt;
            const dy = (x * (28 - z) - y) * dt;
            const dz = (x * y - (8/3) * z) * dt;
            
            x += dx;
            y += dy;
            z += dz;
            
            const screenX = this.canvas.width / 2 + x * 10;
            const screenY = this.canvas.height / 2 + y * 10;
            
            if (i === 0) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
        }
        ctx.stroke();
    }
    
    // 渲染非線性動力學
    renderNonlinearDynamics(ctx, bifurcationPoint, time) {
        // 簡化的非線性動力學可視化
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
        ctx.lineWidth = 2;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < 5; i++) {
            const radius = 50 + i * 20;
            const phase = time * 0.001 + i * Math.PI / 3;
            const x = centerX + Math.cos(phase) * radius;
            const y = centerY + Math.sin(phase * bifurcationPoint) * radius;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // 檢查隨機突變
    checkRandomMutation() {
        if (!this.currentDNA || !this.currentDNA.genes.chaosGenes.canRandomMutate) return;
        
        const mutationChance = this.chaosState.mutationProbability * 0.001;
        if (Math.random() < mutationChance) {
            console.log('🧬 隨機突變觸發！');
            
            // 觸發突變事件
            const event = new CustomEvent('randomMutation', {
                detail: { dna: this.currentDNA, chaosState: this.chaosState }
            });
            document.dispatchEvent(event);
        }
    }
    
    // 更新性能統計
    updatePerformanceStats(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFPSTime >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFPSTime = currentTime;
            
            // 更新UI顯示
            const fpsElement = document.getElementById('renderFPS');
            if (fpsElement) {
                fpsElement.textContent = `${this.currentFPS} FPS`;
            }
            
            const complexityElement = document.getElementById('currentComplexity');
            if (complexityElement) {
                complexityElement.textContent = this.chaosState.complexity;
            }
        }
    }
    
    // 獲取引擎狀態
    getStatus() {
        return {
            isActive: this.isActive,
            currentFPS: this.currentFPS,
            chaosState: this.chaosState,
            elementCount: this.visualElements.length,
            currentDNA: this.currentDNA ? this.currentDNA.getSequenceString() : null
        };
    }
    
    // 調整混沌等級
    setChaosLevel(level) {
        if (this.currentDNA) {
            this.currentDNA.genes.chaosGenes.chaosLevel = Math.max(0, Math.min(1, level));
            console.log(`🌀 混沌等級調整為: ${(level * 100).toFixed(0)}%`);
        }
    }
    
    // 偵錯函數 - 直接測試Canvas渲染
    debugRender() {
        console.log('🔍 開始除錯渲染測試');
        
        // 清空畫面
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 測試基本形狀
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(100, 100, 100, 100);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.arc(300, 200, 50, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#0000ff';
        this.ctx.beginPath();
        this.ctx.moveTo(500, 150);
        this.ctx.lineTo(550, 250);
        this.ctx.lineTo(450, 250);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 測試文字
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '32px Arial';
        this.ctx.fillText('渲染測試成功', 200, 300);
        
        console.log('✅ 除錯渲染測試完成');
    }
    
    // 強制重新生成視覺元素
    regenerateVisuals() {
        if (this.currentDNA) {
            this.generateVisualElements();
            console.log('🔄 視覺元素已重新生成');
        }
    }
    
    // 渲染生命週期模式
    renderLifecycleMode(deltaTime) {
        const currentTime = performance.now();
        const phase = this.getLifecyclePhase(currentTime);
        
        // 更新生命週期狀態中的相位
        if (window.dnaLab && dnaLab.lifecycleState) {
            dnaLab.lifecycleState.phase = phase;
        }
        
        switch (phase) {
            case 'gathering':
                this.renderGatheringPhase(deltaTime);
                break;
            case 'burst':
                this.renderBurstPhase(deltaTime);
                break;
            case 'aftermath':
                this.renderAftermathPhase(deltaTime);
                break;
            default:
                // 正常渲染
                this.visualElements.forEach(element => {
                    this.ctx.save();
                    element.render(this.ctx, deltaTime);
                    this.ctx.restore();
                });
        }
    }
    
    // 獲取當前生命週期階段
    getLifecyclePhase(currentTime) {
        // 從 dnaLab 獲取生命週期狀態
        const lifecycleState = window.dnaLab ? dnaLab.lifecycleState : this.lifecycleState;
        if (!lifecycleState) return 'launch';
        
        const elapsed = currentTime - lifecycleState.startTime;
        
        if (elapsed < 2000) return 'gathering';   // 0-2秒：凝聚階段
        if (elapsed < 3000) return 'burst';      // 2-3秒：爆發階段
        if (elapsed < 5000) return 'aftermath';  // 3-5秒：餘韻階段
        
        // 5秒後結束生命週期演示
        if (window.dnaLab && dnaLab.isLifecycleMode) {
            setTimeout(() => {
                dnaLab.stopCurrentExperiment();
            }, 100);
        }
        
        return 'complete';
    }
    
    // 渲染凝聚階段
    renderGatheringPhase(deltaTime) {
        const lifecycleState = window.dnaLab ? dnaLab.lifecycleState : this.lifecycleState;
        if (!lifecycleState) return;
        
        const currentTime = performance.now();
        const gatheringStartTime = lifecycleState.startTime;
        const gatheringElapsed = currentTime - gatheringStartTime;
        const gatheringDuration = 2000; // 2秒凝聚時間
        const progress = Math.min(gatheringElapsed / gatheringDuration, 1);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // 渲染能量凝聚效果
        this.renderEnergyGathering(centerX, centerY, progress, deltaTime);
        
        // 使用統一的法術渲染，但加上縮放效果
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(0.2 + progress * 0.8, 0.2 + progress * 0.8);
        this.ctx.translate(-centerX, -centerY);
        
        // 使用當前法術類型的渲染方法
        const spellType = this.currentDNA.genes.complexGenes.spellType;
        this.renderSpellByType(spellType, deltaTime);
        
        this.ctx.restore();
    }
    
    // 渲染爆發階段
    renderBurstPhase(deltaTime) {
        const lifecycleState = window.dnaLab ? dnaLab.lifecycleState : this.lifecycleState;
        if (!lifecycleState) return;
        
        const currentTime = performance.now();
        const burstStartTime = lifecycleState.startTime + 2000;
        const burstElapsed = currentTime - burstStartTime;
        const burstDuration = 1000; // 1秒爆發時間
        const progress = Math.min(burstElapsed / burstDuration, 1);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // 渲染爆發效果
        this.renderSpellBurst(centerX, centerY, progress, deltaTime);
        
        // 使用統一的法術渲染，加上爆發縮放
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        const scale = 1.0 + Math.sin(progress * Math.PI) * 0.5; // 爆發時變大
        this.ctx.scale(scale, scale);
        this.ctx.translate(-centerX, -centerY);
        
        // 使用當前法術類型的渲染方法
        const spellType = this.currentDNA.genes.complexGenes.spellType;
        this.renderSpellByType(spellType, deltaTime);
        
        this.ctx.restore();
    }
    
    // 渲染餘韻階段
    renderAftermathPhase(deltaTime) {
        const lifecycleState = window.dnaLab ? dnaLab.lifecycleState : this.lifecycleState;
        if (!lifecycleState) return;
        
        const currentTime = performance.now();
        const aftermathStartTime = lifecycleState.startTime + 3000;
        const aftermathElapsed = currentTime - aftermathStartTime;
        const aftermathDuration = 2000; // 2秒餘韻時間
        const progress = Math.min(aftermathElapsed / aftermathDuration, 1);
        const alpha = 1 - progress;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // 渲染餘韻效果
        this.renderSpellAftermath(centerX, centerY, progress, deltaTime);
        
        // 使用統一的法術渲染，加上消散效果
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalAlpha = alpha;
        const scale = 1.2 - progress * 0.4; // 逐漸縮小
        this.ctx.scale(scale, scale);
        this.ctx.translate(-centerX, -centerY);
        
        // 使用當前法術類型的渲染方法
        const spellType = this.currentDNA.genes.complexGenes.spellType;
        this.renderSpellByType(spellType, deltaTime);
        
        this.ctx.restore();
        this.ctx.globalAlpha = 1;
    }
    
    // 渲染發射特效
    renderLaunchEffects(x, y, deltaTime) {
        const glowColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, deltaTime);
        
        // 發射光環
        this.drawGlow(this.ctx, x, y, 30, glowColor);
        
        // 能量聚集效果
        const pulse = Math.sin(deltaTime * 0.01) * 0.3 + 0.7;
        this.ctx.globalAlpha = pulse;
        this.drawGlow(this.ctx, x, y, 50, glowColor);
        
        // 能量束效果（從法杖到法術）
        this.ctx.strokeStyle = glowColor;
        this.ctx.lineWidth = 3;
        this.ctx.globalAlpha = pulse * 0.6;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 10, y + 5); // 法杖根部
        this.ctx.lineTo(x, y); // 法術位置
        this.ctx.stroke();
        
        this.ctx.globalAlpha = 1;
    }
    
    // 渲染飛行軌跡
    renderFlightTrail(currentPos, progress, lifecycleState, startPos = null) {
        this.ctx.strokeStyle = this.getCurrentColor(this.currentDNA.genes.colorGenes, performance.now());
        this.ctx.lineWidth = 3;
        this.ctx.globalAlpha = 0.6;
        
        if (lifecycleState && lifecycleState.flightPath && lifecycleState.flightPath.length > 0) {
            // 渲染從起點到當前位置的完整軌跡
            const currentIndex = Math.floor(progress * (lifecycleState.flightPath.length - 1));
            
            this.ctx.beginPath();
            for (let i = 0; i <= currentIndex; i++) {
                const point = lifecycleState.flightPath[i];
                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            }
            this.ctx.stroke();
            
            // 漸變軌跡效果
            this.ctx.globalAlpha = 0.3;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
        } else if (startPos && currentPos) {
            // 直線軌跡（從法杖到當前位置）
            this.ctx.beginPath();
            this.ctx.moveTo(startPos.x, startPos.y);
            this.ctx.lineTo(currentPos.x, currentPos.y);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    // 渲染爆炸特效
    renderImpactEffects(x, y, deltaTime) {
        const impactColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, deltaTime);
        
        // 爆炸環
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const radius = 40 + Math.sin(deltaTime * 0.02) * 20;
            const endX = x + Math.cos(angle) * radius;
            const endY = y + Math.sin(angle) * radius;
            
            this.ctx.strokeStyle = impactColor;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.8;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1;
    }
    
    // 渲染消散特效
    renderFadeEffects(x, y, alpha, deltaTime) {
        const fadeColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, deltaTime);
        
        // 消散粒子
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const radius = Math.max(0, 60 * (1 - alpha));
            const particleX = x + Math.cos(angle) * radius;
            const particleY = y + Math.sin(angle) * radius;
            
            this.ctx.fillStyle = fadeColor;
            this.ctx.globalAlpha = alpha * 0.5;
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, Math.max(0, 3 * alpha), 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }
    
    // 渲染玩家角色（Kani）
    renderPlayer(x, y, deltaTime) {
        this.ctx.save();
        
        // 放大角色尺寸（1.5倍）
        const scale = 1.5;
        
        // 玩家主體（簡化的貓咪造型）
        this.ctx.fillStyle = '#e0e0e0'; // 灰白色
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 2;
        
        // 身體（橢圓形）
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 12 * scale, 16 * scale, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 頭部（圓形）
        this.ctx.beginPath();
        this.ctx.arc(x, y - 10 * scale, 8 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 耳朵（折耳造型）
        this.ctx.fillStyle = '#cccccc';
        this.ctx.beginPath();
        this.ctx.ellipse(x - 5 * scale, y - 15 * scale, 3 * scale, 4 * scale, -0.3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.ellipse(x + 5 * scale, y - 15 * scale, 3 * scale, 4 * scale, 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 眼睛
        this.ctx.fillStyle = '#333333';
        this.ctx.beginPath();
        this.ctx.arc(x - 3 * scale, y - 12 * scale, 1.5 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x + 3 * scale, y - 12 * scale, 1.5 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 法杖（調整位置和角度）
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 12 * scale, y - 5 * scale);
        this.ctx.lineTo(x + 25 * scale, y - 20 * scale);
        this.ctx.stroke();
        
        // 法杖頂端寶石（這是法術發射點）
        this.ctx.fillStyle = '#4169E1';
        this.ctx.strokeStyle = '#1E90FF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x + 25 * scale, y - 20 * scale, 4 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 魔法光環（微弱發光效果）
        const pulse = Math.sin(deltaTime * 0.005) * 0.2 + 0.3;
        this.ctx.globalAlpha = pulse;
        this.ctx.fillStyle = '#00ff9f';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
        
        // 返回法杖頂端位置（法術發射點）
        return {
            x: x + 25 * scale,
            y: y - 20 * scale
        };
    }
    
    // 增強版形狀繪製函數
    
    // 增強圓形
    drawEnhancedCircle(ctx, x, y, size, time, shapeGenes) {
        // 確保輸入 size 是正值
        const safeSize = Math.max(1, size);
        const animatedSize = Math.max(1, safeSize + (shapeGenes.isDeforming ? Math.sin(time * shapeGenes.deformSpeed) * shapeGenes.deformIntensity * 10 : 0));
        const pulseEffect = Math.max(0.1, this.currentDNA.genes.colorGenes.isPulsing ? Math.sin(time * 0.005) * 0.3 + 1 : 1);
        
        // 多層圓環效果
        for (let i = 0; i < shapeGenes.complexity; i++) {
            const layerSize = Math.max(0, animatedSize * (1 - i * 0.15) * pulseEffect);
            const alpha = Math.max(0, 1 - (i * 0.2));
            
            // 只在半徑為正值時才繪製
            if (layerSize > 0 && alpha > 0) {
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(x, y, layerSize, 0, Math.PI * 2);
                ctx.fill();
                
                if (i === 0) {
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
    }
    
    // 增強星形
    drawEnhancedStar(ctx, x, y, size, points, time, shapeGenes) {
        const rotation = time * 0.001;
        const safeSize = Math.max(1, size);
        const animatedSize = Math.max(1, safeSize + (shapeGenes.isDeforming ? Math.sin(time * shapeGenes.deformSpeed) * shapeGenes.deformIntensity * 10 : 0));
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        // 多層星形
        for (let layer = 0; layer < Math.max(1, shapeGenes.complexity / 2); layer++) {
            const layerSize = animatedSize * (1 - layer * 0.2);
            const layerPoints = Math.max(3, points - layer);
            
            ctx.globalAlpha = 1 - layer * 0.3;
            ctx.beginPath();
            
            for (let i = 0; i <= layerPoints * 2; i++) {
                const angle = (i * Math.PI) / layerPoints;
                const radius = i % 2 === 0 ? layerSize : layerSize * 0.5;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            if (layer === 0) ctx.stroke();
        }
        
        ctx.restore();
        ctx.globalAlpha = 1;
    }
    
    // 增強水晶
    drawEnhancedCrystal(ctx, x, y, size, complexity, time, shapeGenes) {
        const facets = Math.max(6, complexity * 2);
        const rotation = time * 0.0005;
        const sparkle = Math.sin(time * 0.01) * 0.5 + 0.5;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        // 主體水晶
        ctx.beginPath();
        for (let i = 0; i < facets; i++) {
            const angle = (i / facets) * Math.PI * 2;
            const radius = size * (0.8 + Math.sin(angle * 3 + time * 0.002) * 0.2);
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 內部反射
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        for (let i = 0; i < facets; i++) {
            const angle = (i / facets) * Math.PI * 2;
            const radius = size * 0.5;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        
        // 閃爍效果
        if (sparkle > 0.7) {
            ctx.globalAlpha = sparkle;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        ctx.globalAlpha = 1;
    }
    
    // 增強液體變形
    drawEnhancedBlob(ctx, x, y, size, time, shapeGenes) {
        const points = 8;
        const noise = shapeGenes.deformIntensity || 0.3;
        
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const baseRadius = size;
            const noiseValue = Math.sin(time * 0.003 + angle * 3) * noise + 
                             Math.sin(time * 0.007 + angle * 5) * noise * 0.5;
            const radius = baseRadius * (1 + noiseValue);
            
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 內部氣泡效果
        for (let i = 0; i < shapeGenes.complexity; i++) {
            const bubbleX = x + (Math.sin(time * 0.002 + i) * size * 0.3);
            const bubbleY = y + (Math.cos(time * 0.003 + i) * size * 0.3);
            const bubbleSize = size * 0.1 * (1 + Math.sin(time * 0.004 + i) * 0.5);
            
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    
    // 增強分形
    drawEnhancedFractal(ctx, x, y, size, depth, time, shapeGenes) {
        if (depth <= 0) return;
        
        const rotation = time * 0.001;
        const scale = 0.7;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        // 主分形形狀
        this.drawEnhancedTriangle(ctx, 0, 0, size, time, shapeGenes);
        
        if (depth > 1) {
            const newSize = size * scale;
            const offset = size * 0.4;
            
            // 遞歸繪製子分形
            ctx.globalAlpha = 0.8;
            this.drawEnhancedFractal(ctx, -offset, offset, newSize, depth - 1, time, shapeGenes);
            this.drawEnhancedFractal(ctx, offset, offset, newSize, depth - 1, time, shapeGenes);
            this.drawEnhancedFractal(ctx, 0, -offset, newSize, depth - 1, time, shapeGenes);
        }
        
        ctx.restore();
        ctx.globalAlpha = 1;
    }
    
    // 增強混沌形狀
    drawEnhancedChaos(ctx, x, y, size, time, shapeGenes) {
        const points = 20 + (shapeGenes.complexity || 0) * 2;
        const chaosLevel = this.currentDNA.genes.chaosGenes.chaosLevel || 0.5;
        
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            
            // 多重混沌頻率
            const chaos1 = Math.sin(time * 0.003 + angle * 7) * chaosLevel;
            const chaos2 = Math.sin(time * 0.007 + angle * 3) * chaosLevel * 0.5;
            const chaos3 = Math.sin(time * 0.011 + angle * 11) * chaosLevel * 0.3;
            
            const totalChaos = chaos1 + chaos2 + chaos3;
            const radius = size * (1 + totalChaos);
            
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 混沌粒子效果
        if (chaosLevel > 0.7) {
            for (let i = 0; i < 5; i++) {
                const particleAngle = (time * 0.005 + i * 2) % (Math.PI * 2);
                const particleRadius = size * (1.2 + Math.sin(time * 0.008 + i) * 0.3);
                const particleX = x + Math.cos(particleAngle) * particleRadius;
                const particleY = y + Math.sin(particleAngle) * particleRadius;
                
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    }
    
    // 增強其他形狀的簡化版本（基於原有函數）
    drawEnhancedDiamond(ctx, x, y, size, time, shapeGenes) {
        const safeSize = Math.max(1, size);
        const pulse = this.currentDNA.genes.colorGenes.isPulsing ? Math.sin(time * 0.005) * 0.2 + 1 : 1;
        this.drawDiamond(ctx, x, y, Math.max(1, safeSize * pulse));
    }
    
    drawEnhancedTriangle(ctx, x, y, size, time, shapeGenes) {
        const safeSize = Math.max(1, size);
        const rotation = shapeGenes.isDeforming ? time * shapeGenes.deformSpeed : 0;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        this.drawTriangle(ctx, 0, 0, safeSize);
        ctx.restore();
    }
    
    drawEnhancedSquare(ctx, x, y, size, time, shapeGenes) {
        const safeSize = Math.max(1, size);
        const pulse = this.currentDNA.genes.colorGenes.isPulsing ? Math.sin(time * 0.005) * 0.2 + 1 : 1;
        this.drawSquare(ctx, x, y, Math.max(1, safeSize * pulse));
    }
    
    drawEnhancedHexagon(ctx, x, y, size, time, shapeGenes) {
        const safeSize = Math.max(1, size);
        const rotation = time * 0.001;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        this.drawHexagon(ctx, 0, 0, safeSize);
        ctx.restore();
    }
    
    drawEnhancedSpiral(ctx, x, y, size, time, shapeGenes) {
        const safeSize = Math.max(1, size);
        this.drawSpiral(ctx, x, y, safeSize, time);
    }
    
    drawEnhancedWave(ctx, x, y, size, time, shapeGenes) {
        this.drawWave(ctx, x, y, size, time);
    }
    
    // 清空畫面
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('🧹 畫面已清空');
    }
    
    // 創建粒子系統
    createParticleSystem(particleGenes) {
        return {
            type: 'particleSystem',
            particles: [],
            particleGenes: particleGenes,
            emissionTimer: 0,
            lastUpdateTime: 0,
            render: (ctx, deltaTime) => {
                // 這個方法會被 renderEnhancedParticleSystem 替代
            }
        };
    }
    
    // 渲染增強粒子系統
    renderEnhancedParticleSystem(ctx, deltaTime, particleGenes) {
        const particleSystem = this.visualElements.find(e => e.type === 'particleSystem');
        if (!particleSystem) return;
        
        // 更新粒子狀態
        this.updateParticles(particleSystem, deltaTime, particleGenes);
        
        // 渲染粒子
        particleSystem.particles.forEach(particle => {
            this.renderParticle(ctx, particle, particleGenes);
        });
    }
    
    // 更新粒子狀態
    updateParticles(particleSystem, deltaTime, particleGenes) {
        particleSystem.lastUpdateTime = particleSystem.lastUpdateTime || performance.now();
        const realDeltaTime = performance.now() - particleSystem.lastUpdateTime;
        particleSystem.lastUpdateTime = performance.now();
        
        // 生成新粒子
        particleSystem.emissionTimer = (particleSystem.emissionTimer || 0) + realDeltaTime;
        const emissionInterval = 1000 / (particleGenes.emissionRate || 1);
        
        if (particleSystem.emissionTimer > emissionInterval) {
            this.emitParticles(particleSystem, particleGenes);
            particleSystem.emissionTimer = 0;
        }
        
        // 更新現有粒子
        particleSystem.particles = particleSystem.particles.filter(particle => {
            this.updateParticle(particle, realDeltaTime, particleGenes);
            return particle.life > 0;
        });
    }
    
    // 發射粒子
    emitParticles(particleSystem, particleGenes) {
        let centerX, centerY;
        
        // 只有在生命週期模式中才使用lifecycleState的位置
        if (this.lifecycleMode && this.lifecycleState?.projectilePosition) {
            centerX = this.lifecycleState.projectilePosition.x;
            centerY = this.lifecycleState.projectilePosition.y;
        } else {
            centerX = this.canvas.width / 2;
            centerY = this.canvas.height / 2;
        }
        
        for (let i = 0; i < (particleGenes.burstSize || 1); i++) {
            const particle = {
                x: centerX + (Math.random() - 0.5) * 10,
                y: centerY + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100,
                life: (particleGenes.lifespan || 1) * 1000,
                maxLife: (particleGenes.lifespan || 1) * 1000,
                size: (particleGenes.size || 3) * (1 + (Math.random() - 0.5) * (particleGenes.sizeVariation || 0)),
                color: this.getCurrentColor(this.currentDNA.genes.colorGenes, performance.now()),
                behavior: particleGenes.behavior || 'drift',
                age: 0,
                trail: particleGenes.hasTrails ? [] : null
            };
            
            // 根據行為模式設置初始屬性
            this.initializeParticleBehavior(particle, particleGenes);
            
            particleSystem.particles.push(particle);
        }
    }
    
    // 初始化粒子行為
    initializeParticleBehavior(particle, particleGenes) {
        switch (particle.behavior) {
            case 'explode':
                const explodeAngle = Math.random() * Math.PI * 2;
                const explodeSpeed = 50 + Math.random() * 100;
                particle.vx = Math.cos(explodeAngle) * explodeSpeed;
                particle.vy = Math.sin(explodeAngle) * explodeSpeed;
                break;
            case 'implode':
                const implodeAngle = Math.random() * Math.PI * 2;
                const implodeSpeed = 30 + Math.random() * 50;
                particle.vx = -Math.cos(implodeAngle) * implodeSpeed;
                particle.vy = -Math.sin(implodeAngle) * implodeSpeed;
                break;
            case 'swirl':
                particle.angle = Math.random() * Math.PI * 2;
                particle.radius = 20 + Math.random() * 30;
                particle.angularVelocity = 0.02 + Math.random() * 0.05;
                break;
            case 'drift':
                particle.vx = (Math.random() - 0.5) * 20;
                particle.vy = (Math.random() - 0.5) * 20;
                break;
            case 'chase':
                if (this.lifecycleMode && this.lifecycleState?.targetPosition) {
                    particle.targetX = this.lifecycleState.targetPosition.x;
                    particle.targetY = this.lifecycleState.targetPosition.y;
                } else {
                    particle.targetX = this.canvas.width - 60;
                    particle.targetY = this.canvas.height / 2;
                }
                break;
            case 'orbit':
                particle.orbitCenterX = particle.x;
                particle.orbitCenterY = particle.y;
                particle.orbitRadius = 30 + Math.random() * 50;
                particle.orbitAngle = Math.random() * Math.PI * 2;
                particle.orbitSpeed = 0.02 + Math.random() * 0.03;
                break;
            case 'spiral':
                particle.spiralRadius = 10;
                particle.spiralAngle = 0;
                particle.spiralSpeed = 0.05 + Math.random() * 0.05;
                particle.spiralExpansion = 0.5 + Math.random() * 1;
                break;
            case 'bounce':
                particle.vx = (Math.random() - 0.5) * 80;
                particle.vy = (Math.random() - 0.5) * 80;
                particle.bounceCount = 0;
                break;
            case 'flow':
                particle.flowDirection = Math.random() * Math.PI * 2;
                particle.flowSpeed = 30 + Math.random() * 40;
                particle.flowTurbulence = 0.1 + Math.random() * 0.1;
                break;
            case 'chaos':
                particle.chaosState = {
                    x: Math.random(),
                    y: Math.random(),
                    z: Math.random()
                };
                break;
        }
    }
    
    // 更新單個粒子
    updateParticle(particle, deltaTime, particleGenes) {
        particle.age += deltaTime;
        particle.life -= deltaTime;
        
        const dt = deltaTime * 0.001;
        
        // 根據行為模式更新位置
        switch (particle.behavior) {
            case 'explode':
                particle.x += particle.vx * dt;
                particle.y += particle.vy * dt;
                particle.vx *= 0.98; // 減速
                particle.vy *= 0.98;
                break;
                
            case 'implode':
                let centerX, centerY;
                if (this.lifecycleMode && this.lifecycleState?.projectilePosition) {
                    centerX = this.lifecycleState.projectilePosition.x;
                    centerY = this.lifecycleState.projectilePosition.y;
                } else {
                    centerX = this.canvas.width / 2;
                    centerY = this.canvas.height / 2;
                }
                const implodeDx = centerX - particle.x;
                const implodeDy = centerY - particle.y;
                particle.x += implodeDx * 0.02;
                particle.y += implodeDy * 0.02;
                break;
                
            case 'swirl':
                particle.angle += particle.angularVelocity;
                particle.radius += Math.sin(particle.age * 0.001) * 0.5;
                let swirlCenterX, swirlCenterY;
                if (this.lifecycleMode && this.lifecycleState?.projectilePosition) {
                    swirlCenterX = this.lifecycleState.projectilePosition.x;
                    swirlCenterY = this.lifecycleState.projectilePosition.y;
                } else {
                    swirlCenterX = this.canvas.width / 2;
                    swirlCenterY = this.canvas.height / 2;
                }
                particle.x = swirlCenterX + Math.cos(particle.angle) * particle.radius;
                particle.y = swirlCenterY + Math.sin(particle.angle) * particle.radius;
                break;
                
            case 'drift':
                particle.x += particle.vx * dt;
                particle.y += particle.vy * dt;
                // 添加隨機擾動
                particle.vx += (Math.random() - 0.5) * 5;
                particle.vy += (Math.random() - 0.5) * 5;
                break;
                
            case 'chase':
                const chaseDx = particle.targetX - particle.x;
                const chaseDy = particle.targetY - particle.y;
                const chaseDistance = Math.sqrt(chaseDx * chaseDx + chaseDy * chaseDy);
                if (chaseDistance > 1) {
                    particle.x += (chaseDx / chaseDistance) * 50 * dt;
                    particle.y += (chaseDy / chaseDistance) * 50 * dt;
                }
                break;
                
            case 'orbit':
                particle.orbitAngle += particle.orbitSpeed;
                particle.x = particle.orbitCenterX + Math.cos(particle.orbitAngle) * particle.orbitRadius;
                particle.y = particle.orbitCenterY + Math.sin(particle.orbitAngle) * particle.orbitRadius;
                break;
                
            case 'spiral':
                particle.spiralAngle += particle.spiralSpeed;
                particle.spiralRadius += particle.spiralExpansion;
                let spiralCenterX, spiralCenterY;
                if (this.lifecycleMode && this.lifecycleState?.projectilePosition) {
                    spiralCenterX = this.lifecycleState.projectilePosition.x;
                    spiralCenterY = this.lifecycleState.projectilePosition.y;
                } else {
                    spiralCenterX = this.canvas.width / 2;
                    spiralCenterY = this.canvas.height / 2;
                }
                particle.x = spiralCenterX + Math.cos(particle.spiralAngle) * particle.spiralRadius;
                particle.y = spiralCenterY + Math.sin(particle.spiralAngle) * particle.spiralRadius;
                break;
                
            case 'bounce':
                particle.x += particle.vx * dt;
                particle.y += particle.vy * dt;
                // 邊界反彈
                if (particle.x < 0 || particle.x > this.canvas.width) {
                    particle.vx = -particle.vx;
                    particle.bounceCount++;
                }
                if (particle.y < 0 || particle.y > this.canvas.height) {
                    particle.vy = -particle.vy;
                    particle.bounceCount++;
                }
                break;
                
            case 'flow':
                particle.flowDirection += particle.flowTurbulence * (Math.random() - 0.5);
                particle.x += Math.cos(particle.flowDirection) * particle.flowSpeed * dt;
                particle.y += Math.sin(particle.flowDirection) * particle.flowSpeed * dt;
                break;
                
            case 'chaos':
                // 使用混沌映射
                const a = 1.4;
                const b = 0.3;
                const newX = 1 - a * particle.chaosState.x * particle.chaosState.x + particle.chaosState.y;
                const newY = b * particle.chaosState.x;
                particle.chaosState.x = newX;
                particle.chaosState.y = newY;
                particle.x += newX * 20;
                particle.y += newY * 20;
                break;
        }
        
        // 更新軌跡
        if (particle.trail) {
            particle.trail.push({ x: particle.x, y: particle.y, alpha: particle.life / particle.maxLife });
            if (particle.trail.length > (particleGenes.trailLength || 0.5) * 10) {
                particle.trail.shift();
            }
        }
    }
    
    // 渲染單個粒子
    renderParticle(ctx, particle, particleGenes) {
        const alpha = Math.max(0, particle.life / particle.maxLife);
        
        // 渲染軌跡
        if (particle.trail && particle.trail.length > 1) {
            ctx.strokeStyle = particle.color.replace(/[\d\.]+(?=\))/, String(alpha * 0.3));
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
            for (let i = 1; i < particle.trail.length; i++) {
                ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
            }
            ctx.stroke();
        }
        
        // 渲染粒子本體
        ctx.fillStyle = particle.color.replace(/[\d\.]+(?=\))/, String(alpha));
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, Math.max(0, particle.size * alpha), 0, Math.PI * 2);
        ctx.fill();
        
        // 電子效果
        if (particleGenes.isElectric && Math.random() < 0.1) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.x + (Math.random() - 0.5) * 20, particle.y + (Math.random() - 0.5) * 20);
            ctx.stroke();
        }
        
        // 磁性效果
        if (particleGenes.isMagnetic) {
            ctx.strokeStyle = particle.color.replace(/[\d\.]+(?=\))/, String(alpha * 0.5));
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // 增強光暈效果
    drawEnhancedGlow(ctx, x, y, radius, color, time) {
        const glowLayers = 3;
        const pulseFactor = 1 + Math.sin(time * 0.003) * 0.3;
        
        // 確保所有參數都是有效的數值
        const safeX = isFinite(x) ? x : 0;
        const safeY = isFinite(y) ? y : 0;
        const safeRadius = isFinite(radius) && radius > 0 ? radius : 1;
        const safeTime = isFinite(time) ? time : 0;
        
        for (let i = 0; i < glowLayers; i++) {
            const layerRadius = safeRadius * (1 + i * 0.3) * pulseFactor;
            const layerAlpha = 0.8 / (i + 1);
            
            // 確保 layerRadius 是有效數值
            if (!isFinite(layerRadius) || layerRadius <= 0) {
                if (window.dnaLab?.settings?.debugMode && Math.random() < 0.1) {
                    console.warn('⚠️ 跳過無效的光暈層:', { layerRadius, safeRadius, pulseFactor, i });
                }
                continue;
            }
            
            const gradient = ctx.createRadialGradient(safeX, safeY, 0, safeX, safeY, layerRadius);
            gradient.addColorStop(0, color.replace(/[\d\.]+(?=\))/, String(layerAlpha)));
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(safeX - layerRadius, safeY - layerRadius, layerRadius * 2, layerRadius * 2);
        }
    }
    
    // 模糊效果
    applyBlurEffect(ctx, blurAmount, time) {
        const dynamicBlur = blurAmount * (1 + Math.sin(time * 0.002) * 0.3);
        ctx.filter = `blur(${dynamicBlur}px)`;
        // 需要重新繪製來應用濾鏡
        setTimeout(() => {
            ctx.filter = 'none';
        }, 50);
    }
    
    // 增強失真效果
    applyEnhancedDistortion(ctx, distortionType, intensity, time) {
        const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        switch (distortionType) {
            case 'wave':
                this.applyWaveDistortion(data, width, height, intensity, time);
                break;
            case 'ripple':
                this.applyRippleDistortion(data, width, height, intensity, time);
                break;
            case 'twist':
                this.applyTwistDistortion(data, width, height, intensity, time);
                break;
            case 'bend':
                this.applyBendDistortion(data, width, height, intensity, time);
                break;
            case 'stretch':
                this.applyStretchDistortion(data, width, height, intensity, time);
                break;
            case 'shatter':
                this.applyShatterDistortion(data, width, height, intensity, time);
                break;
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    // 波浪失真
    applyWaveDistortion(data, width, height, intensity, time) {
        const waveFreq = 0.02;
        const waveAmp = intensity * 10;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const offset = Math.sin(x * waveFreq + time * 0.001) * waveAmp;
                const newY = y + offset;
                
                if (newY >= 0 && newY < height) {
                    const srcIndex = (Math.floor(newY) * width + x) * 4;
                    const dstIndex = (y * width + x) * 4;
                    
                    data[dstIndex] = data[srcIndex];
                    data[dstIndex + 1] = data[srcIndex + 1];
                    data[dstIndex + 2] = data[srcIndex + 2];
                    data[dstIndex + 3] = data[srcIndex + 3];
                }
            }
        }
    }
    
    // 漣漪失真
    applyRippleDistortion(data, width, height, intensity, time) {
        const centerX = width / 2;
        const centerY = height / 2;
        const rippleRadius = (time * 0.05) % 200;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                const rippleEffect = Math.sin(distance * 0.1 - time * 0.005) * intensity * 5;
                
                const newX = x + rippleEffect;
                const newY = y + rippleEffect;
                
                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    const srcIndex = (Math.floor(newY) * width + Math.floor(newX)) * 4;
                    const dstIndex = (y * width + x) * 4;
                    
                    data[dstIndex] = data[srcIndex];
                    data[dstIndex + 1] = data[srcIndex + 1];
                    data[dstIndex + 2] = data[srcIndex + 2];
                    data[dstIndex + 3] = data[srcIndex + 3];
                }
            }
        }
    }
    
    // 扭曲失真
    applyTwistDistortion(data, width, height, intensity, time) {
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) / 2;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                
                const twistAmount = (1 - distance / maxRadius) * intensity * Math.sin(time * 0.002);
                const newAngle = angle + twistAmount;
                
                const newX = centerX + Math.cos(newAngle) * distance;
                const newY = centerY + Math.sin(newAngle) * distance;
                
                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    const srcIndex = (Math.floor(newY) * width + Math.floor(newX)) * 4;
                    const dstIndex = (y * width + x) * 4;
                    
                    data[dstIndex] = data[srcIndex];
                    data[dstIndex + 1] = data[srcIndex + 1];
                    data[dstIndex + 2] = data[srcIndex + 2];
                    data[dstIndex + 3] = data[srcIndex + 3];
                }
            }
        }
    }
    
    // 光照效果
    applyLightingEffect(ctx, x, y, lightingType, intensity, time) {
        switch (lightingType) {
            case 'point':
                this.applyPointLight(ctx, x, y, intensity, time);
                break;
            case 'directional':
                this.applyDirectionalLight(ctx, intensity, time);
                break;
            case 'ambient':
                this.applyAmbientLight(ctx, intensity, time);
                break;
        }
    }
    
    // 點光源
    applyPointLight(ctx, x, y, intensity, time) {
        // 確保所有參數都是有效的數值
        const safeX = isFinite(x) ? x : 0;
        const safeY = isFinite(y) ? y : 0;
        const safeIntensity = isFinite(intensity) && intensity > 0 ? intensity : 0.1;
        const safeTime = isFinite(time) ? time : 0;
        
        const lightRadius = 100 * safeIntensity;
        const lightIntensity = safeIntensity * (1 + Math.sin(safeTime * 0.004) * 0.2);
        
        // 確保 lightRadius是有效數值
        if (!isFinite(lightRadius) || lightRadius <= 0) {
            if (window.dnaLab?.settings?.debugMode && Math.random() < 0.1) {
                console.warn('⚠️ 跳過無效的點光源:', { lightRadius, safeIntensity });
            }
            return;
        }
        
        const gradient = ctx.createRadialGradient(safeX, safeY, 0, safeX, safeY, lightRadius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${lightIntensity * 0.5})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = gradient;
        ctx.fillRect(safeX - lightRadius, safeY - lightRadius, lightRadius * 2, lightRadius * 2);
        ctx.globalCompositeOperation = 'source-over';
    }
    
    // 定向光
    applyDirectionalLight(ctx, intensity, time) {
        const lightDirection = time * 0.001;
        const gradient = ctx.createLinearGradient(
            0, 0,
            Math.cos(lightDirection) * this.canvas.width,
            Math.sin(lightDirection) * this.canvas.height
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.3})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.globalCompositeOperation = 'source-over';
    }
    
    // 環境光
    applyAmbientLight(ctx, intensity, time) {
        const ambientIntensity = intensity * (1 + Math.sin(time * 0.002) * 0.1);
        
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255, 255, 255, ${ambientIntensity * 0.1})`;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.globalCompositeOperation = 'source-over';
    }
    
    // 空間效果
    applySpaceEffect(ctx, dimensionShift, time) {
        const shiftAmount = dimensionShift * Math.sin(time * 0.003);
        
        // 空間扭曲效果
        ctx.save();
        ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        ctx.scale(1 + shiftAmount * 0.1, 1 + shiftAmount * 0.1);
        ctx.rotate(shiftAmount * 0.01);
        ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
        
        // 重新繪製當前內容
        const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        ctx.putImageData(imageData, 0, 0);
        
        ctx.restore();
    }
    
    // 簡化的失真方法（為了兼容性）
    applyBendDistortion(data, width, height, intensity, time) {
        // 簡化的彎曲效果
        const bendAmount = intensity * 0.1;
        for (let y = 0; y < height; y++) {
            const bend = Math.sin(y * 0.01 + time * 0.001) * bendAmount;
            for (let x = 0; x < width; x++) {
                const newX = x + bend;
                if (newX >= 0 && newX < width) {
                    const srcIndex = (y * width + Math.floor(newX)) * 4;
                    const dstIndex = (y * width + x) * 4;
                    
                    data[dstIndex] = data[srcIndex];
                    data[dstIndex + 1] = data[srcIndex + 1];
                    data[dstIndex + 2] = data[srcIndex + 2];
                    data[dstIndex + 3] = data[srcIndex + 3];
                }
            }
        }
    }
    
    applyStretchDistortion(data, width, height, intensity, time) {
        // 簡化的拉伸效果
        const stretchX = 1 + Math.sin(time * 0.001) * intensity * 0.1;
        const stretchY = 1 + Math.cos(time * 0.001) * intensity * 0.1;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const newX = x * stretchX;
                const newY = y * stretchY;
                
                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    const srcIndex = (Math.floor(newY) * width + Math.floor(newX)) * 4;
                    const dstIndex = (y * width + x) * 4;
                    
                    data[dstIndex] = data[srcIndex];
                    data[dstIndex + 1] = data[srcIndex + 1];
                    data[dstIndex + 2] = data[srcIndex + 2];
                    data[dstIndex + 3] = data[srcIndex + 3];
                }
            }
        }
    }
    
    applyShatterDistortion(data, width, height, intensity, time) {
        // 簡化的破碎效果
        const shardSize = 20 * intensity;
        const shardOffset = Math.sin(time * 0.002) * intensity * 5;
        
        for (let y = 0; y < height; y += shardSize) {
            for (let x = 0; x < width; x += shardSize) {
                const offsetX = (Math.random() - 0.5) * shardOffset;
                const offsetY = (Math.random() - 0.5) * shardOffset;
                
                // 移動小塊區域
                for (let dy = 0; dy < shardSize && y + dy < height; dy++) {
                    for (let dx = 0; dx < shardSize && x + dx < width; dx++) {
                        const srcX = x + dx;
                        const srcY = y + dy;
                        const dstX = Math.max(0, Math.min(width - 1, srcX + offsetX));
                        const dstY = Math.max(0, Math.min(height - 1, srcY + offsetY));
                        
                        const srcIndex = (srcY * width + srcX) * 4;
                        const dstIndex = (Math.floor(dstY) * width + Math.floor(dstX)) * 4;
                        
                        data[dstIndex] = data[srcIndex];
                        data[dstIndex + 1] = data[srcIndex + 1];
                        data[dstIndex + 2] = data[srcIndex + 2];
                        data[dstIndex + 3] = data[srcIndex + 3];
                    }
                }
            }
        }
    }
    
    // ========== 新的複雜渲染系統 ==========
    
    // 複雜生命週期渲染模式
    renderComplexLifecycleMode(deltaTime) {
        if (!this.currentDNA || !this.lifecycleState) return;
        
        const genes = this.currentDNA.genes;
        const currentTime = performance.now();
        const stageTime = currentTime - this.lifecycleState.phaseStartTime;
        
        // 確定當前應該渲染的階段
        const currentStage = this.determineCurrentStage(stageTime, genes.stageGenes);
        
        // 多層次渲染
        this.renderMultiLayerEffect(currentStage, deltaTime, genes);
    }
    
    // 確定當前階段
    determineCurrentStage(stageTime, stageGenes) {
        if (!stageGenes) {
            // 如果沒有階段基因，使用簡單的階段劃分
            return this.lifecycleState.phase;
        }
        
        let totalTime = 0;
        const stages = ['generation', 'launch', 'flight', 'impact', 'dissipation'];
        const durations = [
            stageGenes.generationDuration || 300,
            stageGenes.launchDuration || 150,
            2000, // flight階段較長
            stageGenes.impactDuration || 200,
            stageGenes.dissipationDuration || 400
        ];
        
        for (let i = 0; i < stages.length; i++) {
            if (stageTime <= totalTime + durations[i]) {
                return {
                    name: stages[i],
                    progress: (stageTime - totalTime) / durations[i],
                    stageTime: stageTime - totalTime
                };
            }
            totalTime += durations[i];
        }
        
        return { name: 'dissipation', progress: 1, stageTime: stageTime };
    }
    
    // 多層次效果渲染
    renderMultiLayerEffect(stage, deltaTime, genes) {
        const ctx = this.ctx;
        const elementalGenes = genes.elementalGenes;
        const complexGenes = genes.complexGenes;
        const materialGenes = genes.materialGenes;
        
        // 計算渲染位置
        const position = this.calculateSpellPosition(stage);
        
        // 層次1: 背景能量場
        if (complexGenes?.hasEnergyField) {
            this.renderEnergyField(ctx, position, stage, elementalGenes, complexGenes);
        }
        
        // 層次2: 空間扭曲效果
        if (complexGenes?.hasSpacialDistortion) {
            this.renderSpatialDistortion(ctx, position, stage, complexGenes);
        }
        
        // 層次3: 元素核心
        if (elementalGenes?.hasElementalCore) {
            this.renderElementalCore(ctx, position, stage, elementalGenes, materialGenes);
        }
        
        // 層次4: 多層粒子系統
        this.renderMultiLayerParticles(ctx, position, stage, genes);
        
        // 層次5: 元素光環
        if (elementalGenes?.hasElementalAura) {
            this.renderElementalAura(ctx, position, stage, elementalGenes);
        }
        
        // 層次6: 複合幾何結構
        this.renderComplexGeometry(ctx, position, stage, genes);
        
        // 層次7: 材質效果
        this.renderMaterialEffects(ctx, position, stage, materialGenes);
        
        // 層次8: 元素軌跡
        if (elementalGenes?.hasElementalTrail && stage.name === 'flight') {
            this.renderElementalTrail(ctx, position, stage, elementalGenes);
        }
    }
    
    // 計算法術位置
    calculateSpellPosition(stage) {
        // 只有在生命週期模式中才使用lifecycleState的位置
        if (this.lifecycleMode && this.lifecycleState?.projectilePosition) {
            return {
                x: this.lifecycleState.projectilePosition.x,
                y: this.lifecycleState.projectilePosition.y
            };
        }
        // 否則永遠使用畫面中心
        return {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
    }
    
    // 渲染能量場
    renderEnergyField(ctx, position, stage, elementalGenes, complexGenes) {
        const radius = complexGenes.fieldRadius * (0.5 + stage.progress * 0.5);
        const intensity = complexGenes.fieldIntensity * this.getElementalIntensity(elementalGenes);
        const pulsation = 1 + Math.sin(performance.now() * 0.003 + complexGenes.fieldPulsation * 10) * 0.3;
        
        // 根據元素類型選擇能量場顏色和效果
        const fieldColor = this.getElementalColor(elementalGenes.primaryElement, intensity);
        
        // 創建多層漸變
        for (let i = 0; i < 3; i++) {
            const layerRadius = radius * pulsation * (1 + i * 0.3);
            const layerAlpha = intensity * 0.3 / (i + 1);
            
            const gradient = this.createSafeRadialGradient(
                ctx, position.x, position.y, 0,
                position.x, position.y, layerRadius
            );
            
            gradient.addColorStop(0, fieldColor.replace(/[\d\.]+(?=\))/, String(layerAlpha)));
            gradient.addColorStop(1, 'transparent');
            
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = gradient;
            ctx.fillRect(
                position.x - layerRadius, position.y - layerRadius,
                layerRadius * 2, layerRadius * 2
            );
            ctx.globalCompositeOperation = 'source-over';
        }
    }
    
    // 渲染空間扭曲
    renderSpatialDistortion(ctx, position, stage, complexGenes) {
        const distortionRadius = 50 + stage.progress * 30;
        const distortionIntensity = 0.1 + stage.progress * 0.2;
        
        // 創建扭曲效果的視覺提示
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 5; i++) {
            const radius = distortionRadius + i * 10;
            const distortion = Math.sin(performance.now() * 0.002 + i) * distortionIntensity * 10;
            
            ctx.beginPath();
            for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
                const r = radius + Math.sin(angle * 6 + performance.now() * 0.003) * distortion;
                const x = position.x + Math.cos(angle) * r;
                const y = position.y + Math.sin(angle) * r;
                
                if (angle === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }
    }
    
    // 渲染元素核心
    renderElementalCore(ctx, position, stage, elementalGenes, materialGenes) {
        const element = elementalGenes.primaryElement;
        const coreSize = 15 + stage.progress * 10;
        const intensity = elementalGenes.elementalIntensity;
        
        ctx.save();
        
        switch (element) {
            case 'fire':
                this.renderFireCore(ctx, position, coreSize, intensity, stage);
                break;
            case 'ice':
                this.renderIceCore(ctx, position, coreSize, intensity, stage);
                break;
            case 'lightning':
                this.renderLightningCore(ctx, position, coreSize, intensity, stage);
                break;
            case 'shadow':
                this.renderShadowCore(ctx, position, coreSize, intensity, stage);
                break;
            case 'light':
                this.renderLightCore(ctx, position, coreSize, intensity, stage);
                break;
            default:
                this.renderEnergyCore(ctx, position, coreSize, intensity, stage);
        }
        
        ctx.restore();
    }
    
    // 渲染多層粒子系統
    renderMultiLayerParticles(ctx, position, stage, genes) {
        // 主粒子層
        this.renderPrimaryParticles(ctx, position, stage, genes.particleGenes, genes.elementalGenes);
        
        // 輔助粒子層
        this.renderSecondaryParticles(ctx, position, stage, genes.particleGenes, genes.elementalGenes);
        
        // 環境粒子層
        this.renderEnvironmentalParticles(ctx, position, stage, genes.elementalGenes);
    }
    
    // 獲取元素顏色
    getElementalColor(element, intensity = 1) {
        const colors = {
            fire: `rgba(255, ${100 + intensity * 100}, 0, ${intensity})`,
            ice: `rgba(100, 200, 255, ${intensity})`,
            lightning: `rgba(255, 255, 150, ${intensity})`,
            shadow: `rgba(100, 50, 150, ${intensity})`,
            light: `rgba(255, 255, 200, ${intensity})`,
            nature: `rgba(100, 255, 100, ${intensity})`,
            void: `rgba(50, 0, 100, ${intensity})`,
            crystal: `rgba(200, 150, 255, ${intensity})`,
            plasma: `rgba(255, 100, 255, ${intensity})`,
            quantum: `rgba(150, 255, 255, ${intensity})`
        };
        return colors[element] || `rgba(255, 255, 255, ${intensity})`;
    }
    
    // 獲取元素強度
    getElementalIntensity(elementalGenes) {
        if (!elementalGenes) return 1;
        return elementalGenes.elementalIntensity * elementalGenes.elementalPurity;
    }
    
    // 元素核心渲染方法（將在下一步實現）
    renderFireCore(ctx, position, size, intensity, stage) {
        // 火焰核心：燃燒效果 + 火舌
        const coreColor = `rgba(255, ${150 + intensity * 100}, 0, ${intensity})`;
        const flameHeight = size * (1 + Math.sin(performance.now() * 0.01) * 0.3);
        
        // 火焰核心
        const gradient = this.createSafeRadialGradient(
            ctx, position.x, position.y, 0,
            position.x, position.y, size
        );
        gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
        gradient.addColorStop(0.3, coreColor);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // 火舌效果
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + performance.now() * 0.002;
            const length = size * 0.5 + Math.random() * size * 0.3;
            const x = position.x + Math.cos(angle) * length;
            const y = position.y + Math.sin(angle) * length;
            
            ctx.strokeStyle = `rgba(255, ${100 + Math.random() * 155}, 0, 0.7)`;
            ctx.lineWidth = 2 + Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(position.x, position.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
    
    renderIceCore(ctx, position, size, intensity, stage) {
        // 冰晶核心：結晶結構 + 寒霧
        const coreColor = `rgba(150, 220, 255, ${intensity})`;
        
        // 冰晶核心
        ctx.fillStyle = coreColor;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        
        // 六角形冰晶
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = position.x + Math.cos(angle) * size;
            const y = position.y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 冰晶紋理
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(position.x, position.y);
            ctx.lineTo(
                position.x + Math.cos(angle) * size,
                position.y + Math.sin(angle) * size
            );
            ctx.stroke();
        }
    }
    
    renderLightningCore(ctx, position, size, intensity, stage) {
        // 閃電核心：電弧 + 電場
        const coreColor = `rgba(255, 255, 150, ${intensity})`;
        
        // 電場核心
        const gradient = this.createSafeRadialGradient(
            ctx, position.x, position.y, 0,
            position.x, position.y, size
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, coreColor);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // 電弧效果
        for (let i = 0; i < 12; i++) {
            if (Math.random() < 0.3) { // 隨機電弧
                const angle = Math.random() * Math.PI * 2;
                const length = size * 0.8 + Math.random() * size * 0.4;
                
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.lineWidth = 1 + Math.random() * 2;
                ctx.beginPath();
                ctx.moveTo(position.x, position.y);
                
                // 鋸齒狀電弧
                let currentX = position.x;
                let currentY = position.y;
                const targetX = position.x + Math.cos(angle) * length;
                const targetY = position.y + Math.sin(angle) * length;
                const segments = 5;
                
                for (let j = 1; j <= segments; j++) {
                    const progress = j / segments;
                    const x = currentX + (targetX - currentX) * progress + (Math.random() - 0.5) * 5;
                    const y = currentY + (targetY - currentY) * progress + (Math.random() - 0.5) * 5;
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        }
    }
    
    renderShadowCore(ctx, position, size, intensity, stage) {
        // 暗影核心：虛空效果 + 扭曲
        ctx.globalCompositeOperation = 'multiply';
        
        const gradient = this.createSafeRadialGradient(
            ctx, position.x, position.y, 0,
            position.x, position.y, size
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.5, `rgba(50, 0, 100, ${intensity})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalCompositeOperation = 'source-over';
        
        // 暗影觸手
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + performance.now() * 0.001;
            const length = size * 0.6 + Math.sin(performance.now() * 0.003 + i) * size * 0.2;
            
            ctx.strokeStyle = `rgba(100, 50, 150, ${intensity * 0.6})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(position.x, position.y);
            
            // 波浪狀觸手
            for (let j = 0; j <= 10; j++) {
                const progress = j / 10;
                const x = position.x + Math.cos(angle) * length * progress;
                const y = position.y + Math.sin(angle) * length * progress + 
                          Math.sin(progress * Math.PI * 4 + performance.now() * 0.005) * 3;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    
    renderLightCore(ctx, position, size, intensity, stage) {
        // 光明核心：聖光效果 + 光線
        ctx.globalCompositeOperation = 'screen';
        
        const gradient = this.createSafeRadialGradient(
            ctx, position.x, position.y, 0,
            position.x, position.y, size
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, `rgba(255, 255, 200, ${intensity})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // 光線輻射
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const length = size * 1.5;
            
            ctx.strokeStyle = `rgba(255, 255, 200, ${intensity * 0.5})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(position.x, position.y);
            ctx.lineTo(
                position.x + Math.cos(angle) * length,
                position.y + Math.sin(angle) * length
            );
            ctx.stroke();
        }
        
        ctx.globalCompositeOperation = 'source-over';
    }
    
    renderEnergyCore(ctx, position, size, intensity, stage) {
        // 通用能量核心
        const gradient = this.createSafeRadialGradient(
            ctx, position.x, position.y, 0,
            position.x, position.y, size
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
        gradient.addColorStop(0.5, `rgba(100, 200, 255, ${intensity * 0.8})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 渲染元素光環
    renderElementalAura(ctx, position, stage, elementalGenes) {
        const element = elementalGenes.primaryElement;
        const auraRadius = 40 + stage.progress * 20;
        const intensity = elementalGenes.elementalIntensity * 0.6;
        
        // 根據元素類型創建不同的光環效果
        switch (element) {
            case 'fire':
                this.renderFireAura(ctx, position, auraRadius, intensity);
                break;
            case 'ice':
                this.renderIceAura(ctx, position, auraRadius, intensity);
                break;
            case 'lightning':
                this.renderLightningAura(ctx, position, auraRadius, intensity);
                break;
            case 'shadow':
                this.renderShadowAura(ctx, position, auraRadius, intensity);
                break;
            case 'light':
                this.renderLightAura(ctx, position, auraRadius, intensity);
                break;
            default:
                this.renderEnergyAura(ctx, position, auraRadius, intensity);
        }
    }
    
    // 各種元素光環
    renderFireAura(ctx, position, radius, intensity) {
        // 火焰光環：閃爍的橙紅色環
        const flickerIntensity = 1 + Math.sin(performance.now() * 0.01) * 0.3;
        
        ctx.strokeStyle = `rgba(255, ${100 + intensity * 100}, 0, ${intensity * flickerIntensity})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    renderIceAura(ctx, position, radius, intensity) {
        // 冰霜光環：結晶狀的藍色環
        ctx.strokeStyle = `rgba(150, 220, 255, ${intensity})`;
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const innerRadius = radius * 0.8;
            const outerRadius = radius * 1.2;
            
            ctx.beginPath();
            ctx.moveTo(
                position.x + Math.cos(angle) * innerRadius,
                position.y + Math.sin(angle) * innerRadius
            );
            ctx.lineTo(
                position.x + Math.cos(angle) * outerRadius,
                position.y + Math.sin(angle) * outerRadius
            );
            ctx.stroke();
        }
    }
    
    renderLightningAura(ctx, position, radius, intensity) {
        // 閃電光環：電弧環繞
        ctx.strokeStyle = `rgba(255, 255, 150, ${intensity})`;
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 8; i++) {
            if (Math.random() < 0.4) {
                const angle = (i / 8) * Math.PI * 2;
                const arcRadius = radius + (Math.random() - 0.5) * 10;
                
                ctx.beginPath();
                ctx.arc(position.x, position.y, arcRadius, angle, angle + Math.PI / 4);
                ctx.stroke();
            }
        }
    }
    
    renderShadowAura(ctx, position, radius, intensity) {
        // 暗影光環：波動的暗紫色環
        ctx.globalCompositeOperation = 'multiply';
        
        for (let i = 0; i < 3; i++) {
            const waveRadius = radius + Math.sin(performance.now() * 0.003 + i) * 5;
            ctx.strokeStyle = `rgba(100, 50, 150, ${intensity / (i + 1)})`;
            ctx.lineWidth = 4 - i;
            
            ctx.beginPath();
            ctx.arc(position.x, position.y, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.globalCompositeOperation = 'source-over';
    }
    
    renderLightAura(ctx, position, radius, intensity) {
        // 光明光環：聖光環繞
        ctx.globalCompositeOperation = 'screen';
        
        const pulseIntensity = 1 + Math.sin(performance.now() * 0.005) * 0.2;
        ctx.strokeStyle = `rgba(255, 255, 200, ${intensity * pulseIntensity})`;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 內部光環
        ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.globalCompositeOperation = 'source-over';
    }
    
    renderEnergyAura(ctx, position, radius, intensity) {
        // 通用能量光環
        ctx.strokeStyle = `rgba(100, 200, 255, ${intensity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // 渲染複合幾何結構
    renderComplexGeometry(ctx, position, stage, genes) {
        const complexGenes = genes.complexGenes;
        const shapeGenes = genes.shapeGenes;
        
        if (!complexGenes || !shapeGenes) return;
        
        const geometrySize = shapeGenes.coreSize * (1 + stage.progress * 0.5);
        const complexity = complexGenes.geometricComplexity;
        
        // 根據組合類型渲染不同的幾何結構
        switch (complexGenes.combinationType) {
            case 'nested':
                this.renderNestedGeometry(ctx, position, geometrySize, complexity);
                break;
            case 'spiral':
                this.renderSpiralGeometry(ctx, position, geometrySize, complexity);
                break;
            case 'orbital':
                this.renderOrbitalGeometry(ctx, position, geometrySize, complexity);
                break;
            case 'interference':
                this.renderInterferenceGeometry(ctx, position, geometrySize, complexity);
                break;
            default:
                this.renderBasicGeometry(ctx, position, geometrySize, complexity);
        }
    }
    
    // 幾何結構渲染方法
    renderNestedGeometry(ctx, position, size, complexity) {
        for (let i = 0; i < complexity; i++) {
            const layerSize = size * (1 - i * 0.2);
            const rotation = performance.now() * 0.001 * (i + 1);
            
            ctx.save();
            ctx.translate(position.x, position.y);
            ctx.rotate(rotation);
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 / (i + 1)})`;
            ctx.lineWidth = 2;
            
            this.drawPolygon(ctx, 0, 0, layerSize, 6 + i);
            
            ctx.restore();
        }
    }
    
    renderSpiralGeometry(ctx, position, size, complexity) {
        const turns = complexity * 2;
        const points = turns * 20;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2 * turns + performance.now() * 0.002;
            const radius = (i / points) * size;
            const x = position.x + Math.cos(angle) * radius;
            const y = position.y + Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    renderOrbitalGeometry(ctx, position, size, complexity) {
        for (let i = 0; i < complexity; i++) {
            const orbitRadius = size * 0.3 * (i + 1);
            const angle = performance.now() * 0.001 * (i + 1) + (i * Math.PI * 2 / complexity);
            
            const x = position.x + Math.cos(angle) * orbitRadius;
            const y = position.y + Math.sin(angle) * orbitRadius;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${0.6 / (i + 1)})`;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderInterferenceGeometry(ctx, position, size, complexity) {
        // 干涉模式
        const waveCount = complexity;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < waveCount; i++) {
            const angle = (i / waveCount) * Math.PI * 2;
            const waveLength = size / 5;
            
            ctx.beginPath();
            for (let j = 0; j < size; j += 2) {
                const x = position.x + Math.cos(angle) * j;
                const y = position.y + Math.sin(angle) * j;
                const waveY = y + Math.sin(j / waveLength + performance.now() * 0.005) * 5;
                
                if (j === 0) ctx.moveTo(x, waveY);
                else ctx.lineTo(x, waveY);
            }
            ctx.stroke();
        }
    }
    
    renderBasicGeometry(ctx, position, size, complexity) {
        const sides = 3 + complexity;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(performance.now() * 0.001);
        
        this.drawPolygon(ctx, 0, 0, size, sides);
        
        ctx.restore();
    }
    
    // 輔助方法：繪製多邊形
    drawPolygon(ctx, x, y, radius, sides) {
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
    
    // 渲染材質效果
    renderMaterialEffects(ctx, position, stage, materialGenes) {
        if (!materialGenes) return;
        
        // 發光效果
        if (materialGenes.hasEmission) {
            this.renderEmissionEffect(ctx, position, materialGenes, stage);
        }
        
        // 彩虹色澤效果
        if (materialGenes.hasIridescence) {
            this.renderIridescenceEffect(ctx, position, materialGenes, stage);
        }
        
        // 反射效果
        if (materialGenes.hasReflection) {
            this.renderReflectionEffect(ctx, position, materialGenes, stage);
        }
        
        // 粒子發射
        if (materialGenes.hasParticleEmission) {
            this.renderMaterialParticles(ctx, position, materialGenes, stage);
        }
    }
    
    renderEmissionEffect(ctx, position, materialGenes, stage) {
        const intensity = materialGenes.emissionIntensity;
        const pulsation = 1 + Math.sin(performance.now() * 0.003 * materialGenes.emissionPulsation) * 0.4;
        const color = materialGenes.emissionColor;
        
        const gradient = this.createSafeRadialGradient(
            ctx, position.x, position.y, 0,
            position.x, position.y, 30 * pulsation
        );
        
        const hsl = `hsla(${color.h}, ${color.s * 100}%, ${color.l * 100}%, ${intensity * pulsation})`;
        gradient.addColorStop(0, hsl);
        gradient.addColorStop(1, 'transparent');
        
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = gradient;
        ctx.fillRect(
            position.x - 30 * pulsation, position.y - 30 * pulsation,
            60 * pulsation, 60 * pulsation
        );
        ctx.globalCompositeOperation = 'source-over';
    }
    
    renderIridescenceEffect(ctx, position, materialGenes, stage) {
        const shift = materialGenes.iridescenceShift;
        const time = performance.now() * 0.001;
        
        for (let i = 0; i < 3; i++) {
            const hue = (time * shift * 100 + i * 120) % 360;
            const radius = 15 + i * 5;
            
            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.3)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    renderReflectionEffect(ctx, position, materialGenes, stage) {
        const intensity = materialGenes.reflectionIntensity;
        
        // 簡單的反射高光
        ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.5})`;
        ctx.beginPath();
        ctx.arc(position.x - 5, position.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderMaterialParticles(ctx, position, materialGenes, stage) {
        const emissionRate = materialGenes.particleEmissionRate;
        
        for (let i = 0; i < emissionRate; i++) {
            if (Math.random() < 0.1) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 20 + 10;
                const x = position.x + Math.cos(angle) * distance;
                const y = position.y + Math.sin(angle) * distance;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // 渲染元素軌跡
    renderElementalTrail(ctx, position, stage, elementalGenes) {
        const element = elementalGenes.primaryElement;
        const trailLength = 50;
        
        // 根據元素類型渲染不同的軌跡效果
        switch (element) {
            case 'fire':
                this.renderFireTrail(ctx, position, trailLength);
                break;
            case 'ice':
                this.renderIceTrail(ctx, position, trailLength);
                break;
            case 'lightning':
                this.renderLightningTrail(ctx, position, trailLength);
                break;
            default:
                this.renderEnergyTrail(ctx, position, trailLength);
        }
    }
    
    renderFireTrail(ctx, position, length) {
        // 火焰軌跡：燃燒的尾跡
        for (let i = 0; i < length; i++) {
            const alpha = (length - i) / length;
            const size = alpha * 3;
            
            ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(
                position.x - i * 2 + (Math.random() - 0.5) * 4,
                position.y + (Math.random() - 0.5) * 4,
                size, 0, Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    renderIceTrail(ctx, position, length) {
        // 冰霜軌跡：結晶軌跡
        for (let i = 0; i < length; i += 3) {
            const alpha = (length - i) / length;
            
            ctx.strokeStyle = `rgba(150, 220, 255, ${alpha * 0.4})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(position.x - i * 2, position.y - 2);
            ctx.lineTo(position.x - i * 2, position.y + 2);
            ctx.moveTo(position.x - i * 2 - 2, position.y);
            ctx.lineTo(position.x - i * 2 + 2, position.y);
            ctx.stroke();
        }
    }
    
    renderLightningTrail(ctx, position, length) {
        // 閃電軌跡：電弧軌跡
        ctx.strokeStyle = 'rgba(255, 255, 150, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        let lastX = position.x;
        let lastY = position.y;
        
        for (let i = 1; i < length; i += 2) {
            const x = position.x - i * 2 + (Math.random() - 0.5) * 6;
            const y = position.y + (Math.random() - 0.5) * 6;
            
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            
            lastX = x;
            lastY = y;
        }
        ctx.stroke();
    }
    
    renderEnergyTrail(ctx, position, length) {
        // 通用能量軌跡
        for (let i = 0; i < length; i++) {
            const alpha = (length - i) / length;
            const size = alpha * 2;
            
            ctx.fillStyle = `rgba(100, 200, 255, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(position.x - i * 2, position.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 多層粒子渲染方法（簡化版本）
    renderPrimaryParticles(ctx, position, stage, particleGenes, elementalGenes) {
        // 主粒子層 - 使用現有的粒子系統
        this.renderEnhancedParticleSystem(ctx, performance.now(), particleGenes);
    }
    
    renderSecondaryParticles(ctx, position, stage, particleGenes, elementalGenes) {
        // 輔助粒子層 - 環境特效
        if (!elementalGenes) return;
        
        const element = elementalGenes.primaryElement;
        const particleCount = 5;
        
        for (let i = 0; i < particleCount; i++) {
            if (Math.random() < 0.3) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 30 + 20;
                const x = position.x + Math.cos(angle) * distance;
                const y = position.y + Math.sin(angle) * distance;
                
                const color = this.getElementalColor(element, 0.4);
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    renderEnvironmentalParticles(ctx, position, stage, elementalGenes) {
        // 環境粒子層 - 氛圍效果
        if (!elementalGenes) return;
        
        const element = elementalGenes.primaryElement;
        
        // 根據元素類型產生環境粒子
        switch (element) {
            case 'fire':
                this.renderFireEnvironment(ctx, position);
                break;
            case 'ice':
                this.renderIceEnvironment(ctx, position);
                break;
            case 'shadow':
                this.renderShadowEnvironment(ctx, position);
                break;
        }
    }
    
    renderFireEnvironment(ctx, position) {
        // 火花和灰燼
        for (let i = 0; i < 8; i++) {
            if (Math.random() < 0.2) {
                const x = position.x + (Math.random() - 0.5) * 100;
                const y = position.y + (Math.random() - 0.5) * 100;
                
                ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, 0.3)`;
                ctx.beginPath();
                ctx.arc(x, y, 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    renderIceEnvironment(ctx, position) {
        // 冰晶和霜霧
        for (let i = 0; i < 6; i++) {
            if (Math.random() < 0.15) {
                const x = position.x + (Math.random() - 0.5) * 80;
                const y = position.y + (Math.random() - 0.5) * 80;
                
                ctx.strokeStyle = 'rgba(150, 220, 255, 0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x - 2, y);
                ctx.lineTo(x + 2, y);
                ctx.moveTo(x, y - 2);
                ctx.lineTo(x, y + 2);
                ctx.stroke();
            }
        }
    }
    
    renderShadowEnvironment(ctx, position) {
        // 暗影粒子
        for (let i = 0; i < 4; i++) {
            if (Math.random() < 0.1) {
                const x = position.x + (Math.random() - 0.5) * 120;
                const y = position.y + (Math.random() - 0.5) * 120;
                
                ctx.fillStyle = 'rgba(50, 0, 100, 0.2)';
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // 統一渲染系統
    renderUnifiedSpellSystem(deltaTime) {
        if (!this.currentDNA) return;
        
        // 無論是生命週期模式還是正常模式，都使用相同的法術類型渲染邏輯
        const spellType = this.currentDNA.genes.complexGenes.spellType;
        this.renderSpellByType(spellType, deltaTime);
        
        // 渲染粒子系統
        if (this.particleRenderer) {
            // 發射粒子 (根據 DNA 參數)
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const particleGenes = this.currentDNA.genes.particleGenes;
            
            // 每幀發射一些粒子
            if (deltaTime % 100 < 16) { // 大約每 100ms 發射一次
                this.particleRenderer.emitParticles(centerX, centerY, 
                    particleGenes.emissionRate || 5, particleGenes);
            }
            
            // 渲染所有粒子
            this.particleRenderer.render(this.ctx, 'high');
        }
        
        // 如果是生命週期模式，添加額外的階段效果
        if (this.lifecycleMode && this.lifecycleState) {
            this.renderLifecycleStageEffects(deltaTime);
        }
    }
    
    // 渲染生命週期階段效果（基於DNA）
    renderLifecycleStageEffects(deltaTime) {
        if (!this.lifecycleState || !this.currentDNA) return;
        
        const phase = this.lifecycleState.phase;
        const time = performance.now() - this.lifecycleState.phaseStartTime;
        const position = this.calculateSpellPosition('burst');
        
        // 從 DNA 取得基本屬性
        const elementalGenes = this.currentDNA.genes.elementalGenes;
        const colorGenes = this.currentDNA.genes.colorGenes;
        const particleGenes = this.currentDNA.genes.particleGenes;
        const primaryElement = elementalGenes?.primaryElement || 'neutral';
        const primaryColor = elementalGenes?.primaryColor || colorGenes?.primary || {r: 255, g: 255, b: 255};
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        switch (phase) {
            case 'gathering':
                // 基於 DNA 元素的聚集效果
                const gatherIntensity = Math.sin(time * 0.005) * 0.5 + 0.5;
                const gatherRings = Math.min(8, Math.max(3, particleGenes?.count / 2 || 5));
                
                // 主聚集光環 - 使用 DNA 顏色
                for (let ring = 0; ring < gatherRings; ring++) {
                    const radius = Math.max(1, 80 - ring * 12 + Math.sin(time * 0.008 + ring) * 8);
                    const alpha = Math.max(0, (0.9 - ring * 0.12) * gatherIntensity);
                    
                    // 根據元素類型調整顏色
                    let elementColor;
                    switch(primaryElement) {
                        case 'fire':
                            elementColor = `rgba(${primaryColor.r}, ${Math.max(0, primaryColor.g - 50)}, 0, ${alpha})`;
                            break;
                        case 'ice':
                            elementColor = `rgba(100, ${primaryColor.g}, ${primaryColor.b}, ${alpha})`;
                            break;
                        case 'lightning':
                            elementColor = `rgba(${primaryColor.r}, ${primaryColor.g}, 100, ${alpha})`;
                            break;
                        default:
                            elementColor = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${alpha})`;
                    }
                    
                    this.ctx.strokeStyle = elementColor;
                    this.ctx.lineWidth = Math.max(1, 4 - ring * 0.4);
                    this.ctx.beginPath();
                    this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                
                // 旋轉的聚集粒子 - 數量和速度基於 DNA
                const particleCount = particleGenes?.count || 20;
                const motionSpeed = this.currentDNA.genes.motionGenes?.speed || 100;
                
                for (let i = 0; i < particleCount; i++) {
                    const angle = time * (motionSpeed * 0.00003) + (i * Math.PI * 2) / particleCount;
                    const spiralRadius = Math.max(0, 120 - (time * 0.02) % 120);
                    const x = position.x + Math.cos(angle) * spiralRadius;
                    const y = position.y + Math.sin(angle) * spiralRadius;
                    const particleAlpha = Math.max(0, (1 - spiralRadius / 120) * 0.8);
                    
                    this.ctx.fillStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${particleAlpha})`;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, Math.max(1, particleGenes?.size || 3), 0, Math.PI * 2);
                    this.ctx.fill();
                }
                break;
                
            case 'burst':
                // 基於 DNA 元素的爆發效果
                const burstTime = time;
                const complexity = this.currentDNA.genes.shapeGenes?.complexity || 4;
                const waveCount = Math.min(6, Math.max(2, complexity));
                const spellType = this.currentDNA.genes.complexGenes?.spellType || 'burst';
                
                // 主爆發波紋 - 根據元素調整演化速度
                let expansionSpeed = 0.3;
                if (primaryElement === 'lightning') expansionSpeed = 0.5;
                else if (primaryElement === 'ice') expansionSpeed = 0.2;
                
                for (let wave = 0; wave < waveCount; wave++) {
                    const waveRadius = Math.max(0, burstTime * expansionSpeed + wave * 25);
                    const waveAlpha = Math.max(0, (1 - waveRadius / 200) * 0.9);
                    
                    // 使用 DNA 顏色而非固定色彩
                    const intensity = 1 - (wave * 0.2);
                    const burstColor = `rgba(${Math.round(primaryColor.r * intensity)}, ${Math.round(primaryColor.g * intensity)}, ${Math.round(primaryColor.b * intensity)}, ${waveAlpha})`;
                    
                    this.ctx.strokeStyle = burstColor;
                    this.ctx.lineWidth = Math.max(1, 8 - wave * 1.2);
                    this.ctx.beginPath();
                    this.ctx.arc(position.x, position.y, waveRadius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                
                // 輻射光線 - 數量基於對稱性
                const rayCount = this.currentDNA.genes.shapeGenes?.symmetry || 8;
                for (let ray = 0; ray < rayCount; ray++) {
                    const angle = (ray * Math.PI * 2) / rayCount;
                    const rayLength = Math.max(0, burstTime * expansionSpeed * 1.3);
                    const rayAlpha = Math.max(0, 0.8 - burstTime * 0.002);
                    
                    // 元素特定的光線效果
                    if (primaryElement === 'lightning') {
                        // 電弧效果
                        for (let segment = 0; segment < 5; segment++) {
                            const segmentLength = rayLength / 5;
                            const x = position.x + Math.cos(angle) * segmentLength * (segment + Math.random() * 0.3);
                            const y = position.y + Math.sin(angle) * segmentLength * (segment + Math.random() * 0.3);
                            
                            this.ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, 100, ${rayAlpha})`;
                            this.ctx.lineWidth = 3;
                            this.ctx.beginPath();
                            this.ctx.moveTo(position.x, position.y);
                            this.ctx.lineTo(x, y);
                            this.ctx.stroke();
                        }
                    } else {
                        // 一般光線
                        this.ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${rayAlpha})`;
                        this.ctx.lineWidth = 4;
                        this.ctx.beginPath();
                        this.ctx.moveTo(position.x, position.y);
                        this.ctx.lineTo(
                            position.x + Math.cos(angle) * rayLength,
                            position.y + Math.sin(angle) * rayLength
                        );
                        this.ctx.stroke();
                    }
                }
                break;
                
            case 'aftermath':
                // 基於 DNA 元素的餘波效果
                const aftermathTime = time;
                const chaosLevel = this.currentDNA.genes.chaosGenes?.chaosLevel || 0.3;
                const aftermathRings = Math.max(2, Math.min(5, Math.round(chaosLevel * 6)));
                
                // 主消散光環 - 使用 DNA 顏色
                for (let ring = 0; ring < aftermathRings; ring++) {
                    const radius = Math.max(0, aftermathTime * 0.08 + ring * 20);
                    const alpha = Math.max(0, (0.7 - aftermathTime * 0.0008) * (1 - ring * 0.15));
                    
                    // 根據元素類型調整餘波顏色
                    let afterglowColor;
                    switch(primaryElement) {
                        case 'fire':
                            afterglowColor = `rgba(${primaryColor.r}, ${Math.max(50, primaryColor.g - 100)}, 50, ${alpha})`;
                            break;
                        case 'ice':
                            afterglowColor = `rgba(150, ${primaryColor.g}, ${primaryColor.b}, ${alpha})`;
                            break;
                        case 'shadow':
                        case 'void':
                            afterglowColor = `rgba(${Math.max(50, primaryColor.r - 100)}, ${Math.max(50, primaryColor.g - 100)}, ${primaryColor.b}, ${alpha})`;
                            break;
                        default:
                            afterglowColor = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${alpha * 0.7})`;
                    }
                    
                    this.ctx.strokeStyle = afterglowColor;
                    this.ctx.lineWidth = Math.max(0.5, 3 - ring * 0.4);
                    this.ctx.beginPath();
                    this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                
                // 漂浮的殘留粒子 - 數量和行為基於 DNA
                const floatingParticleCount = Math.round((particleGenes?.count || 20) * 1.5);
                const driftSpeed = this.currentDNA.genes.motionGenes?.speed || 100;
                
                for (let i = 0; i < floatingParticleCount; i++) {
                    const angle = (i * Math.PI * 2) / floatingParticleCount + aftermathTime * (driftSpeed * 0.000015);
                    const distance = Math.max(0, aftermathTime * 0.12 + Math.sin(aftermathTime * 0.002 + i) * 25);
                    const x = position.x + Math.cos(angle) * distance;
                    const y = position.y + Math.sin(angle) * distance + Math.sin(aftermathTime * 0.003 + i) * 18;
                    const particleAlpha = Math.max(0, 0.8 - aftermathTime * 0.0015);
                    const size = Math.max(1, (particleGenes?.size || 2) + Math.sin(aftermathTime * 0.004 + i) * 1);
                    
                    // 使用 DNA 顏色而非隨機顏色
                    const fadedColor = `rgba(${Math.round(primaryColor.r * 0.8)}, ${Math.round(primaryColor.g * 0.8)}, ${Math.round(primaryColor.b * 0.8)}, ${particleAlpha})`;
                    this.ctx.fillStyle = fadedColor;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                break;
        }
        
        this.ctx.restore();
    }
    
    // 根據法術類型渲染
    renderSpellByType(spellType, deltaTime) {
        switch (spellType) {
            case 'burst':
                this.renderBurstSpell(deltaTime);
                break;
            case 'continuous':
                this.renderContinuousSpell(deltaTime);
                break;
            case 'enhancement':
                this.renderEnhancementSpell(deltaTime);
                break;
            case 'summoning':
                this.renderSummoningSpell(deltaTime);
                break;
            default:
                // 預設渲染
                this.visualElements.forEach(element => {
                    this.ctx.save();
                    element.render(this.ctx, deltaTime);
                    this.ctx.restore();
                });
        }
    }
    
    // 新3階段效果渲染方法
    
    // 渲染能量凝聚效果
    renderEnergyGathering(x, y, progress, deltaTime) {
        const currentColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, deltaTime);
        
        // 能量螺旋
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + deltaTime * 0.002;
            const radius = 60 * (1 - progress) + 20;
            const spiralX = x + Math.cos(angle) * radius;
            const spiralY = y + Math.sin(angle) * radius;
            
            this.ctx.fillStyle = currentColor;
            this.ctx.globalAlpha = 0.6 * progress;
            this.ctx.beginPath();
            this.ctx.arc(spiralX, spiralY, 3 * progress, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 中心漩渦
        this.ctx.strokeStyle = currentColor;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.8;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15 * progress, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.globalAlpha = 1;
    }
    
    // 渲染法術爆發效果
    renderSpellBurst(x, y, progress, deltaTime) {
        const currentColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, deltaTime);
        
        // 爆發光環
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const burstRadius = 80 * progress;
            const burstX = x + Math.cos(angle) * burstRadius;
            const burstY = y + Math.sin(angle) * burstRadius;
            
            this.ctx.strokeStyle = currentColor;
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = 0.8 * (1 - progress * 0.5);
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(burstX, burstY);
            this.ctx.stroke();
        }
        
        // 爆發衝擊波
        this.ctx.strokeStyle = currentColor;
        this.ctx.lineWidth = 4;
        this.ctx.globalAlpha = 0.6;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 50 * progress, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.globalAlpha = 1;
    }
    
    // 渲染法術餘韻效果
    renderSpellAftermath(x, y, progress, deltaTime) {
        const currentColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, deltaTime);
        
        // 餘韻粒子
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const driftRadius = 40 + progress * 60;
            const driftX = x + Math.cos(angle) * driftRadius + Math.sin(deltaTime * 0.001 + i) * 10;
            const driftY = y + Math.sin(angle) * driftRadius + Math.cos(deltaTime * 0.001 + i) * 10;
            
            this.ctx.fillStyle = currentColor;
            this.ctx.globalAlpha = 0.4 * (1 - progress);
            this.ctx.beginPath();
            this.ctx.arc(driftX, driftY, Math.max(0, 2 * (1 - progress)), 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 餘韻光暈
        this.ctx.strokeStyle = currentColor;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3 * (1 - progress);
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30 + progress * 20, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.globalAlpha = 1;
    }
    
    // 法術類型特殊渲染方法
    
    // 渲染爆發型法術
    renderBurstSpell(deltaTime) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const complexGenes = this.currentDNA.genes.complexGenes;
        const elementalGenes = this.currentDNA.genes.elementalGenes;
        
        // 爆發核心
        this.renderBurstCore(centerX, centerY, deltaTime);
        
        // 爆發環
        this.renderBurstRings(centerX, centerY, deltaTime);
        
        // 爆發粒子
        this.renderBurstParticles(centerX, centerY, deltaTime);
        
        // 衝擊波效果
        this.renderShockwave(centerX, centerY, deltaTime);
        
        // 元素特效
        this.renderElementalBurst(centerX, centerY, elementalGenes, deltaTime);
        
        // 基礎視覺元素
        this.visualElements.forEach(element => {
            this.ctx.save();
            element.render(this.ctx, deltaTime);
            this.ctx.restore();
        });
    }
    
    // 渲染爆發核心
    renderBurstCore(x, y, deltaTime) {
        const currentColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, deltaTime);
        const pulse = Math.sin(deltaTime * 0.008) * 0.5 + 0.5;
        
        // 內核
        const gradient = this.createSafeRadialGradient(this.ctx, x, y, 0, x, y, 25 + pulse * 10);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, currentColor);
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillRect(x - 35, y - 35, 70, 70);
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 渲染爆發環
    renderBurstRings(x, y, deltaTime) {
        const currentColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, deltaTime);
        
        for (let i = 0; i < 3; i++) {
            const ringRadius = 40 + i * 25 + Math.sin(deltaTime * 0.006 + i) * 15;
            const alpha = 0.6 - i * 0.2;
            
            this.ctx.strokeStyle = currentColor.replace(/[\d\.]+(?=\))/, String(alpha));
            this.ctx.lineWidth = 4 - i;
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.beginPath();
            this.ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 渲染爆發粒子
    renderBurstParticles(x, y, deltaTime) {
        const currentColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, deltaTime);
        
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            const distance = 60 + Math.sin(deltaTime * 0.01 + i * 0.5) * 30;
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            this.ctx.fillStyle = currentColor;
            this.ctx.globalAlpha = 0.8;
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1;
    }
    
    // 渲染衝擊波
    renderShockwave(x, y, deltaTime) {
        const currentColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, deltaTime);
        const wave = Math.sin(deltaTime * 0.012) * 0.5 + 0.5;
        const waveRadius = 80 + wave * 40;
        
        this.ctx.strokeStyle = currentColor.replace(/[\d\.]+(?=\))/, String(0.4));
        this.ctx.lineWidth = 6;
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.beginPath();
        this.ctx.arc(x, y, waveRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 渲染元素爆發特效
    renderElementalBurst(x, y, elementalGenes, deltaTime) {
        const element = elementalGenes.primaryElement;
        
        switch (element) {
            case 'fire':
                this.renderFireBurst(x, y, deltaTime);
                break;
            case 'ice':
                this.renderIceBurst(x, y, deltaTime);
                break;
            case 'lightning':
                this.renderLightningBurst(x, y, deltaTime);
                break;
            case 'shadow':
                this.renderShadowBurst(x, y, deltaTime);
                break;
            case 'light':
                this.renderLightBurst(x, y, deltaTime);
                break;
        }
    }
    
    // 火焰爆發
    renderFireBurst(x, y, deltaTime) {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + deltaTime * 0.002;
            const flameX = x + Math.cos(angle) * (50 + Math.random() * 30);
            const flameY = y + Math.sin(angle) * (50 + Math.random() * 30);
            
            this.ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, 0.6)`;
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.beginPath();
            this.ctx.arc(flameX, flameY, 4 + Math.random() * 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 冰霜爆發
    renderIceBurst(x, y, deltaTime) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const iceX = x + Math.cos(angle) * 70;
            const iceY = y + Math.sin(angle) * 70;
            
            this.ctx.strokeStyle = 'rgba(150, 220, 255, 0.8)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(iceX - 8, iceY - 8);
            this.ctx.lineTo(iceX + 8, iceY + 8);
            this.ctx.moveTo(iceX + 8, iceY - 8);
            this.ctx.lineTo(iceX - 8, iceY + 8);
            this.ctx.stroke();
        }
    }
    
    // 閃電爆發
    renderLightningBurst(x, y, deltaTime) {
        for (let i = 0; i < 16; i++) {
            if (Math.random() < 0.3) {
                const angle = Math.random() * Math.PI * 2;
                const length = 40 + Math.random() * 40;
                
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                this.ctx.lineWidth = 2;
                this.ctx.globalCompositeOperation = 'screen';
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                
                const segments = 4;
                let currentX = x;
                let currentY = y;
                
                for (let j = 1; j <= segments; j++) {
                    const progress = j / segments;
                    const targetX = x + Math.cos(angle) * length * progress;
                    const targetY = y + Math.sin(angle) * length * progress;
                    const zigzagX = targetX + (Math.random() - 0.5) * 10;
                    const zigzagY = targetY + (Math.random() - 0.5) * 10;
                    
                    this.ctx.lineTo(zigzagX, zigzagY);
                }
                this.ctx.stroke();
            }
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 暗影爆發
    renderShadowBurst(x, y, deltaTime) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 60;
            const shadowX = x + Math.cos(angle) * distance;
            const shadowY = y + Math.sin(angle) * distance;
            
            this.ctx.fillStyle = 'rgba(50, 0, 100, 0.4)';
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.beginPath();
            this.ctx.arc(shadowX, shadowY, 5 + Math.random() * 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 光明爆發
    renderLightBurst(x, y, deltaTime) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const rayLength = 80 + Math.sin(deltaTime * 0.01 + i) * 20;
            const rayX = x + Math.cos(angle) * rayLength;
            const rayY = y + Math.sin(angle) * rayLength;
            
            this.ctx.strokeStyle = 'rgba(255, 255, 200, 0.7)';
            this.ctx.lineWidth = 4;
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(rayX, rayY);
            this.ctx.stroke();
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 渲染持續型法術
    renderContinuousSpell(deltaTime) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const complexGenes = this.currentDNA.genes.complexGenes;
        const elementalGenes = this.currentDNA.genes.elementalGenes;
        
        // 持續能量核心
        this.renderContinuousCore(centerX, centerY, deltaTime);
        
        // 持續光束/射線
        this.renderContinuousBeams(centerX, centerY, deltaTime);
        
        // 能量流
        this.renderEnergyStream(centerX, centerY, deltaTime);
        
        // 持續粒子流
        this.renderContinuousParticleStream(centerX, centerY, deltaTime);
        
        // 元素特化持續效果
        this.renderElementalContinuous(centerX, centerY, elementalGenes, deltaTime);
        
        // 基礎視覺元素
        this.visualElements.forEach(element => {
            this.ctx.save();
            element.render(this.ctx, deltaTime);
            this.ctx.restore();
        });
    }
    
    // 渲染持續核心
    renderContinuousCore(x, y, deltaTime) {
        const currentColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, deltaTime);
        const rotation = deltaTime * 0.002;
        
        // 旋轉核心
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        
        // 內層核心
        const gradient = this.createSafeRadialGradient(this.ctx, 0, 0, 0, 0, 0, 30);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, currentColor);
        gradient.addColorStop(1, currentColor.replace(/[\d\.]+(?=\))/, '0.3'));
        
        this.ctx.fillStyle = gradient;
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillRect(-40, -40, 80, 80);
        
        // 旋轉符文
        this.ctx.strokeStyle = currentColor;
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const r1 = 20;
            const r2 = 35;
            this.ctx.beginPath();
            this.ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
            this.ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 渲染持續光束
    renderContinuousBeams(x, y, deltaTime) {
        const currentColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, deltaTime);
        const beamCount = 8;
        const time = deltaTime * 0.001;
        
        for (let i = 0; i < beamCount; i++) {
            const angle = (i / beamCount) * Math.PI * 2 + time;
            const beamLength = 150 + Math.sin(time * 2 + i) * 30;
            const beamWidth = 8 + Math.sin(time * 3 + i * 0.5) * 4;
            
            const endX = x + Math.cos(angle) * beamLength;
            const endY = y + Math.sin(angle) * beamLength;
            
            // 創建光束漸變
            const beamGradient = this.ctx.createLinearGradient(x, y, endX, endY);
            beamGradient.addColorStop(0, currentColor);
            beamGradient.addColorStop(0.7, currentColor.replace(/[\d\.]+(?=\))/, '0.5'));
            beamGradient.addColorStop(1, 'transparent');
            
            this.ctx.strokeStyle = beamGradient;
            this.ctx.lineWidth = beamWidth;
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 渲染能量流
    renderEnergyStream(x, y, deltaTime) {
        const currentColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, deltaTime);
        const time = deltaTime * 0.001;
        
        // 螺旋能量流
        this.ctx.strokeStyle = currentColor.replace(/[\d\.]+(?=\))/, '0.6');
        this.ctx.lineWidth = 3;
        this.ctx.globalCompositeOperation = 'screen';
        
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            for (let t = 0; t < Math.PI * 4; t += 0.1) {
                const radius = 40 + t * 5 + i * 15;
                const angle = t + time + i * (Math.PI * 2 / 3);
                const streamX = x + Math.cos(angle) * radius;
                const streamY = y + Math.sin(angle) * radius;
                
                if (t === 0) {
                    this.ctx.moveTo(streamX, streamY);
                } else {
                    this.ctx.lineTo(streamX, streamY);
                }
            }
            this.ctx.stroke();
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 渲染持續粒子流
    renderContinuousParticleStream(x, y, deltaTime) {
        const currentColor = this.getCurrentColor(this.currentDNA.genes.colorGenes, deltaTime);
        const time = deltaTime * 0.001;
        
        // 噴射粒子流
        for (let stream = 0; stream < 4; stream++) {
            const streamAngle = (stream / 4) * Math.PI * 2 + time * 0.5;
            
            for (let i = 0; i < 20; i++) {
                const distance = i * 8 + (time * 50) % 160;
                const particleX = x + Math.cos(streamAngle) * distance;
                const particleY = y + Math.sin(streamAngle) * distance;
                const size = Math.max(0.1, 4 - (distance / 160) * 3);
                const alpha = 1 - (distance / 160);
                
                this.ctx.fillStyle = currentColor.replace(/[\d\.]+(?=\))/, String(alpha));
                this.ctx.globalCompositeOperation = 'screen';
                this.ctx.beginPath();
                this.ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 渲染元素持續效果
    renderElementalContinuous(x, y, elementalGenes, deltaTime) {
        const element = elementalGenes.primaryElement;
        
        switch (element) {
            case 'fire':
                this.renderFireStream(x, y, deltaTime);
                break;
            case 'ice':
                this.renderFrostBeam(x, y, deltaTime);
                break;
            case 'lightning':
                this.renderLightningChain(x, y, deltaTime);
                break;
            case 'shadow':
                this.renderShadowDrain(x, y, deltaTime);
                break;
            case 'light':
                this.renderHolyBeam(x, y, deltaTime);
                break;
        }
    }
    
    // 火焰噴射
    renderFireStream(x, y, deltaTime) {
        const time = deltaTime * 0.001;
        
        for (let i = 0; i < 30; i++) {
            const angle = Math.sin(time) * 0.5 + (Math.random() - 0.5) * 0.3;
            const distance = 50 + i * 5 + Math.random() * 20;
            const flameX = x + Math.cos(angle) * distance;
            const flameY = y + Math.sin(angle) * distance - i * 2;
            
            const size = 8 - i * 0.2;
            const heat = 1 - (i / 30);
            
            this.ctx.fillStyle = `rgba(255, ${150 - i * 3}, ${50 - i * 2}, ${heat * 0.6})`;
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.beginPath();
            this.ctx.arc(flameX, flameY, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 冰霜射線
    renderFrostBeam(x, y, deltaTime) {
        const time = deltaTime * 0.001;
        const beamEnd = x + 200;
        
        // 主射線
        const gradient = this.ctx.createLinearGradient(x, y, beamEnd, y);
        gradient.addColorStop(0, 'rgba(150, 220, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(50, 150, 255, 0.2)');
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 20 + Math.sin(time * 2) * 5;
        this.ctx.lineCap = 'round';
        this.ctx.globalCompositeOperation = 'screen';
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(beamEnd, y);
        this.ctx.stroke();
        
        // 冰晶粒子
        for (let i = 0; i < 10; i++) {
            const crystalX = x + (beamEnd - x) * Math.random();
            const crystalY = y + (Math.random() - 0.5) * 30;
            
            this.ctx.strokeStyle = 'rgba(200, 240, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(crystalX - 5, crystalY);
            this.ctx.lineTo(crystalX + 5, crystalY);
            this.ctx.moveTo(crystalX, crystalY - 5);
            this.ctx.lineTo(crystalX, crystalY + 5);
            this.ctx.stroke();
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 閃電鏈
    renderLightningChain(x, y, deltaTime) {
        // 創建多條跳躍的閃電
        for (let chain = 0; chain < 3; chain++) {
            if (Math.random() < 0.7) { // 閃電的間歇性
                const targetAngle = (chain / 3) * Math.PI * 2 + Math.random() * 0.5;
                const targetDistance = 100 + Math.random() * 50;
                const targetX = x + Math.cos(targetAngle) * targetDistance;
                const targetY = y + Math.sin(targetAngle) * targetDistance;
                
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                this.ctx.lineWidth = 3;
                this.ctx.globalCompositeOperation = 'screen';
                this.ctx.beginPath();
                
                let currentX = x;
                let currentY = y;
                const segments = 8;
                
                for (let i = 0; i <= segments; i++) {
                    const progress = i / segments;
                    const nextX = currentX + (targetX - currentX) * (1 / segments) + (Math.random() - 0.5) * 15;
                    const nextY = currentY + (targetY - currentY) * (1 / segments) + (Math.random() - 0.5) * 15;
                    
                    if (i === 0) {
                        this.ctx.moveTo(currentX, currentY);
                    } else {
                        this.ctx.lineTo(nextX, nextY);
                    }
                    
                    currentX = nextX;
                    currentY = nextY;
                }
                this.ctx.stroke();
            }
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 暗影吸取
    renderShadowDrain(x, y, deltaTime) {
        const time = deltaTime * 0.001;
        
        // 吸取漩渦
        for (let i = 0; i < 20; i++) {
            const angle = time * 2 + (i / 20) * Math.PI * 2;
            const radius = 100 - i * 3;
            const spiralX = x + Math.cos(angle) * radius;
            const spiralY = y + Math.sin(angle) * radius;
            
            this.ctx.fillStyle = `rgba(50, 0, 100, ${0.3 - i * 0.01})`;
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.beginPath();
            this.ctx.arc(spiralX, spiralY, 10 - i * 0.4, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    // 神聖光束
    renderHolyBeam(x, y, deltaTime) {
        const time = deltaTime * 0.001;
        
        // 垂直光柱
        const gradient = this.ctx.createLinearGradient(x, 0, x, this.canvas.height);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 200, 0.3)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.5)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 200, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillRect(x - 40, 0, 80, this.canvas.height);
        
        // 神聖符文
        this.ctx.strokeStyle = 'rgba(255, 255, 200, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(time);
        
        // 繪製十字
        this.ctx.beginPath();
        this.ctx.moveTo(-30, 0);
        this.ctx.lineTo(30, 0);
        this.ctx.moveTo(0, -30);
        this.ctx.lineTo(0, 30);
        this.ctx.stroke();
        
        this.ctx.restore();
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    renderEnhancementSpell(deltaTime) {
        if (!this.currentDNA) return;
        
        const time = performance.now() - this.startTime;
        const position = this.calculateSpellPosition('burst');
        const centerX = position.x;
        const centerY = position.y;
        
        // 基因資料
        const elementalGenes = this.currentDNA.genes.elementalGenes;
        const complexGenes = this.currentDNA.genes.complexGenes;
        
        // 繪製增強型法術特效
        this.drawEnhancementCore(centerX, centerY, time, elementalGenes, complexGenes);
        
        // 預設渲染
        this.visualElements.forEach(element => {
            this.ctx.save();
            element.render(this.ctx, deltaTime);
            this.ctx.restore();
        });
    }
    
    // 繪製增強型法術核心效果
    drawEnhancementCore(centerX, centerY, time, elementalGenes, complexGenes) {
        // 1. 多重防護環
        this.drawProtectionRings(centerX, centerY, time, elementalGenes);
        
        // 2. 旋轉聖符
        this.drawRotatingRunes(centerX, centerY, time, elementalGenes);
        
        // 3. 能量屏障
        this.drawEnergyBarrier(centerX, centerY, time, elementalGenes);
        
        // 4. 增強粒子效果
        this.drawEnhancementParticles(centerX, centerY, time, elementalGenes);
        
        // 5. 元素特化效果
        this.drawEnhancementElementalVariations(centerX, centerY, time, elementalGenes);
    }
    
    // 繪製多重防護環
    drawProtectionRings(centerX, centerY, time, elementalGenes) {
        // 安全檢查：確保 elementalGenes 和 primaryColor 存在
        if (!elementalGenes || !elementalGenes.primaryColor) {
            // 使用預設顏色作為後備方案
            const defaultColor = { r: 100, g: 150, b: 255 };
            const primaryColor = elementalGenes?.primaryColor || defaultColor;
            elementalGenes = { ...elementalGenes, primaryColor };
        }
        
        const energyRings = 3;
        
        for (let i = 0; i < energyRings; i++) {
            const radius = 60 + i * 25;
            const rotation = (time * 0.001 + i * Math.PI / 3) % (Math.PI * 2);
            const alpha = 0.3 + Math.sin(time * 0.002 + i) * 0.2;
            
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(rotation * (i % 2 === 0 ? 1 : -1));
            
            // 環形漸變
            const gradient = this.createSafeRadialGradient(this.ctx, 0, 0, radius - 10, 0, 0, radius + 10);
            gradient.addColorStop(0, `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, 0)`);
            gradient.addColorStop(0.5, `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, 0)`);
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 3;
            this.ctx.globalCompositeOperation = 'screen';
            
            // 繪製環
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // 繪製環上的小光點
            for (let j = 0; j < 8; j++) {
                const angle = (j * Math.PI * 2) / 8;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                this.ctx.fillStyle = `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        }
    }
    
    // 繪製旋轉聖符
    drawRotatingRunes(centerX, centerY, time, elementalGenes) {
        const runeCount = 6;
        const orbitRadius = 40;
        
        for (let i = 0; i < runeCount; i++) {
            const angle = (time * 0.001 + i * Math.PI * 2 / runeCount) % (Math.PI * 2);
            const x = centerX + Math.cos(angle) * orbitRadius;
            const y = centerY + Math.sin(angle) * orbitRadius;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle + time * 0.002);
            
            // 聖符顏色
            const runeAlpha = 0.6 + Math.sin(time * 0.003 + i) * 0.3;
            this.ctx.fillStyle = `rgba(${elementalGenes.secondaryColor.r}, ${elementalGenes.secondaryColor.g}, ${elementalGenes.secondaryColor.b}, ${runeAlpha})`;
            this.ctx.strokeStyle = `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, ${runeAlpha})`;
            this.ctx.lineWidth = 1;
            this.ctx.globalCompositeOperation = 'screen';
            
            // 繪製聖符 (複雜幾何形狀)
            this.ctx.beginPath();
            this.ctx.moveTo(0, -8);
            this.ctx.lineTo(6, -3);
            this.ctx.lineTo(8, 3);
            this.ctx.lineTo(0, 8);
            this.ctx.lineTo(-8, 3);
            this.ctx.lineTo(-6, -3);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // 聖符中心
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    // 繪製能量屏障
    drawEnergyBarrier(centerX, centerY, time, elementalGenes) {
        const segments = 16;
        const barrierRadius = 90;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalCompositeOperation = 'screen';
        
        for (let i = 0; i < segments; i++) {
            const angle = (i * Math.PI * 2) / segments;
            const nextAngle = ((i + 1) * Math.PI * 2) / segments;
            
            // 屏障強度變化
            const strength = 0.3 + Math.sin(time * 0.002 + i * 0.5) * 0.2;
            const innerRadius = barrierRadius - 5;
            const outerRadius = barrierRadius + 5;
            
            // 漸變填充
            const gradient = this.createSafeRadialGradient(this.ctx, 0, 0, innerRadius, 0, 0, outerRadius);
            gradient.addColorStop(0, `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, 0)`);
            gradient.addColorStop(0.5, `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, ${strength})`);
            gradient.addColorStop(1, `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, 0)`);
            
            this.ctx.fillStyle = gradient;
            
            // 繪製屏障片段
            this.ctx.beginPath();
            this.ctx.arc(0, 0, innerRadius, angle, nextAngle);
            this.ctx.arc(0, 0, outerRadius, nextAngle, angle, true);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    // 繪製增強粒子效果
    drawEnhancementParticles(centerX, centerY, time, elementalGenes) {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (time * 0.0005 + i * Math.PI * 2 / particleCount) % (Math.PI * 2);
            const radius = 70 + Math.sin(time * 0.001 + i) * 20;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            const size = 1 + Math.sin(time * 0.003 + i) * 1;
            const alpha = 0.4 + Math.sin(time * 0.002 + i) * 0.3;
            
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.fillStyle = `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, ${alpha})`;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    // 繪製元素特化效果
    drawEnhancementElementalVariations(centerX, centerY, time, elementalGenes) {
        const element = elementalGenes.dominantElement;
        
        switch (element) {
            case 'fire':
                this.drawFireEnhancement(centerX, centerY, time, elementalGenes);
                break;
            case 'ice':
                this.drawIceEnhancement(centerX, centerY, time, elementalGenes);
                break;
            case 'lightning':
                this.drawLightningEnhancement(centerX, centerY, time, elementalGenes);
                break;
            case 'shadow':
                this.drawShadowEnhancement(centerX, centerY, time, elementalGenes);
                break;
            case 'holy':
                this.drawHolyEnhancement(centerX, centerY, time, elementalGenes);
                break;
        }
    }
    
    // 火焰增強效果
    drawFireEnhancement(centerX, centerY, time, elementalGenes) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalCompositeOperation = 'screen';
        
        // 火焰護盾
        const flameHeight = 15 + Math.sin(time * 0.01) * 5;
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12;
            const x = Math.cos(angle) * 95;
            const y = Math.sin(angle) * 95;
            
            const gradient = this.ctx.createLinearGradient(x, y, x, y - flameHeight);
            gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 150, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 200, 0, 0.2)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x - 3, y - flameHeight);
            this.ctx.lineTo(x + 3, y - flameHeight);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    // 冰霜增強效果
    drawIceEnhancement(centerX, centerY, time, elementalGenes) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalCompositeOperation = 'screen';
        
        // 冰晶護甲
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const x = Math.cos(angle) * 85;
            const y = Math.sin(angle) * 85;
            
            this.ctx.fillStyle = 'rgba(150, 200, 255, 0.6)';
            this.ctx.strokeStyle = 'rgba(100, 150, 255, 0.8)';
            this.ctx.lineWidth = 1;
            
            // 冰晶形狀
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 10);
            this.ctx.lineTo(x + 5, y - 3);
            this.ctx.lineTo(x + 8, y + 5);
            this.ctx.lineTo(x, y + 10);
            this.ctx.lineTo(x - 8, y + 5);
            this.ctx.lineTo(x - 5, y - 3);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    // 閃電增強效果
    drawLightningEnhancement(centerX, centerY, time, elementalGenes) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalCompositeOperation = 'screen';
        
        // 電弧護盾
        for (let i = 0; i < 6; i++) {
            const angle = (time * 0.005 + i * Math.PI / 3) % (Math.PI * 2);
            const startX = Math.cos(angle) * 80;
            const startY = Math.sin(angle) * 80;
            const endX = Math.cos(angle + Math.PI) * 80;
            const endY = Math.sin(angle + Math.PI) * 80;
            
            this.ctx.strokeStyle = 'rgba(255, 255, 100, 0.8)';
            this.ctx.lineWidth = 2;
            
            // 閃電線條
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            
            const segments = 5;
            for (let j = 1; j < segments; j++) {
                const t = j / segments;
                const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 20;
                const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 20;
                this.ctx.lineTo(x, y);
            }
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    // 暗影增強效果
    drawShadowEnhancement(centerX, centerY, time, elementalGenes) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalCompositeOperation = 'multiply';
        
        // 暗影漩渦
        const vortexRadius = 100;
        const spiralTurns = 3;
        
        for (let i = 0; i < 50; i++) {
            const t = i / 50;
            const angle = t * Math.PI * 2 * spiralTurns + time * 0.001;
            const radius = vortexRadius * (1 - t);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            const alpha = 0.3 * (1 - t);
            this.ctx.fillStyle = `rgba(50, 0, 100, ${alpha})`;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    // 神聖增強效果
    drawHolyEnhancement(centerX, centerY, time, elementalGenes) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalCompositeOperation = 'screen';
        
        // 神聖光環
        const haloRadius = 110;
        const gradient = this.createSafeRadialGradient(this.ctx, 0, 0, haloRadius - 10, 0, 0, haloRadius + 10);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, haloRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 神聖十字
        this.ctx.strokeStyle = 'rgba(255, 255, 200, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -30);
        this.ctx.lineTo(0, 30);
        this.ctx.moveTo(-30, 0);
        this.ctx.lineTo(30, 0);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    renderSummoningSpell(deltaTime) {
        if (!this.currentDNA) return;
        
        const time = performance.now() - this.startTime;
        const position = this.calculateSpellPosition('burst');
        const centerX = position.x;
        const centerY = position.y;
        
        // 基因資料
        const elementalGenes = this.currentDNA.genes.elementalGenes;
        const complexGenes = this.currentDNA.genes.complexGenes;
        
        // 繪製召喚型法術特效
        this.drawSummoningCore(centerX, centerY, time, elementalGenes, complexGenes);
        
        // 預設渲染
        this.visualElements.forEach(element => {
            this.ctx.save();
            element.render(this.ctx, deltaTime);
            this.ctx.restore();
        });
    }
    
    // 繪製召喚型法術核心效果
    drawSummoningCore(centerX, centerY, time, elementalGenes, complexGenes) {
        // 1. 召喚法陣
        this.drawSummoningCircle(centerX, centerY, time, elementalGenes);
        
        // 2. 能量柱
        this.drawSummoningBeam(centerX, centerY, time, elementalGenes);
        
        // 3. 符文刻印
        this.drawSummoningRunes(centerX, centerY, time, elementalGenes);
        
        // 4. 召喚門戶
        this.drawSummoningPortal(centerX, centerY, time, elementalGenes);
        
        // 5. 元素特化召喚效果
        this.drawSummoningElementalVariations(centerX, centerY, time, elementalGenes);
    }
    
    // 繪製召喚法陣
    drawSummoningCircle(centerX, centerY, time, elementalGenes) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalCompositeOperation = 'screen';
        
        // 主要法陣
        const mainRadius = 80;
        const rotation = time * 0.0005;
        
        this.ctx.rotate(rotation);
        
        // 外圈
        this.ctx.strokeStyle = `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, 0.8)`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, mainRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 內圈
        this.ctx.strokeStyle = `rgba(${elementalGenes.secondaryColor.r}, ${elementalGenes.secondaryColor.g}, ${elementalGenes.secondaryColor.b}, 0.6)`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, mainRadius * 0.7, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 幾何紋路
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const x1 = Math.cos(angle) * mainRadius * 0.5;
            const y1 = Math.sin(angle) * mainRadius * 0.5;
            const x2 = Math.cos(angle) * mainRadius * 0.9;
            const y2 = Math.sin(angle) * mainRadius * 0.9;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
        
        // 中心核心
        const coreAlpha = 0.4 + Math.sin(time * 0.005) * 0.3;
        this.ctx.fillStyle = `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, ${coreAlpha})`;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    // 繪製能量柱
    drawSummoningBeam(centerX, centerY, time, elementalGenes) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalCompositeOperation = 'screen';
        
        // 向上能量柱
        const beamHeight = 120;
        const beamWidth = 20 + Math.sin(time * 0.003) * 5;
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, -beamHeight);
        gradient.addColorStop(0, `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, 0.8)`);
        gradient.addColorStop(0.5, `rgba(${elementalGenes.secondaryColor.r}, ${elementalGenes.secondaryColor.g}, ${elementalGenes.secondaryColor.b}, 0.6)`);
        gradient.addColorStop(1, `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, 0.1)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(-beamWidth / 2, -beamHeight, beamWidth, beamHeight);
        
        // 能量流動效果
        for (let i = 0; i < 5; i++) {
            const flowY = -beamHeight + ((time * 0.1 + i * 20) % beamHeight);
            const flowAlpha = 0.5 + Math.sin(time * 0.01 + i) * 0.3;
            
            this.ctx.fillStyle = `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, ${flowAlpha})`;
            this.ctx.fillRect(-beamWidth / 4, flowY, beamWidth / 2, 8);
        }
        
        this.ctx.restore();
    }
    
    // 繪製符文刻印
    drawSummoningRunes(centerX, centerY, time, elementalGenes) {
        const runePositions = [
            { x: -60, y: -60 }, { x: 60, y: -60 },
            { x: -60, y: 60 }, { x: 60, y: 60 },
            { x: 0, y: -80 }, { x: 0, y: 80 },
            { x: -80, y: 0 }, { x: 80, y: 0 }
        ];
        
        runePositions.forEach((pos, index) => {
            this.ctx.save();
            this.ctx.translate(centerX + pos.x, centerY + pos.y);
            this.ctx.rotate(time * 0.001 + index * Math.PI / 4);
            
            const runeAlpha = 0.6 + Math.sin(time * 0.002 + index) * 0.4;
            this.ctx.fillStyle = `rgba(${elementalGenes.secondaryColor.r}, ${elementalGenes.secondaryColor.g}, ${elementalGenes.secondaryColor.b}, ${runeAlpha})`;
            this.ctx.strokeStyle = `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, ${runeAlpha})`;
            this.ctx.lineWidth = 1;
            this.ctx.globalCompositeOperation = 'screen';
            
            // 繪製復雜符文
            this.ctx.beginPath();
            this.ctx.moveTo(0, -10);
            this.ctx.lineTo(5, -5);
            this.ctx.lineTo(10, -7);
            this.ctx.lineTo(8, 0);
            this.ctx.lineTo(12, 5);
            this.ctx.lineTo(0, 10);
            this.ctx.lineTo(-12, 5);
            this.ctx.lineTo(-8, 0);
            this.ctx.lineTo(-10, -7);
            this.ctx.lineTo(-5, -5);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // 符文中心點
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    // 繪製召喚門戶
    drawSummoningPortal(centerX, centerY, time, elementalGenes) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalCompositeOperation = 'screen';
        
        // 門戶漩渦
        const portalRadius = 50;
        const spiralTurns = 4;
        
        for (let i = 0; i < 60; i++) {
            const t = i / 60;
            const angle = t * Math.PI * 2 * spiralTurns + time * 0.002;
            const radius = portalRadius * (1 - t) + Math.sin(time * 0.005 + i) * 5;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            const alpha = 0.5 * t + 0.3;
            this.ctx.fillStyle = `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, ${alpha})`;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, Math.max(0, 2 * (1 - t)), 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 門戶邊緣
        this.ctx.strokeStyle = `rgba(${elementalGenes.primaryColor.r}, ${elementalGenes.primaryColor.g}, ${elementalGenes.primaryColor.b}, 0.8)`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, portalRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    // 繪製元素特化召喚效果
    drawSummoningElementalVariations(centerX, centerY, time, elementalGenes) {
        const element = elementalGenes.dominantElement;
        
        switch (element) {
            case 'fire':
                this.drawFireSummoning(centerX, centerY, time, elementalGenes);
                break;
            case 'ice':
                this.drawIceSummoning(centerX, centerY, time, elementalGenes);
                break;
            case 'lightning':
                this.drawLightningSummoning(centerX, centerY, time, elementalGenes);
                break;
            case 'shadow':
                this.drawShadowSummoning(centerX, centerY, time, elementalGenes);
                break;
            case 'holy':
                this.drawHolySummoning(centerX, centerY, time, elementalGenes);
                break;
        }
    }
    
    // 火焰召喚效果
    drawFireSummoning(centerX, centerY, time, elementalGenes) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalCompositeOperation = 'screen';
        
        // 火焰噴發
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const distance = 100 + Math.sin(time * 0.01 + i) * 20;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            // 火焰效果
            const flameSize = 10 + Math.sin(time * 0.02 + i) * 5;
            const gradient = this.createSafeRadialGradient(this.ctx, x, y, 0, x, y, flameSize);
            gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 150, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 200, 0, 0.1)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, flameSize, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    // 冰霜召喚效果
    drawIceSummoning(centerX, centerY, time, elementalGenes) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalCompositeOperation = 'screen';
        
        // 冰晶生成
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12;
            const distance = 90 + Math.sin(time * 0.003 + i) * 15;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            this.ctx.fillStyle = 'rgba(150, 200, 255, 0.7)';
            this.ctx.strokeStyle = 'rgba(100, 150, 255, 0.9)';
            this.ctx.lineWidth = 1;
            
            // 冰晶形狀
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(time * 0.002 + i);
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, -12);
            this.ctx.lineTo(6, -6);
            this.ctx.lineTo(12, 0);
            this.ctx.lineTo(6, 6);
            this.ctx.lineTo(0, 12);
            this.ctx.lineTo(-6, 6);
            this.ctx.lineTo(-12, 0);
            this.ctx.lineTo(-6, -6);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }
    
    // 閃電召喚效果
    drawLightningSummoning(centerX, centerY, time, elementalGenes) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalCompositeOperation = 'screen';
        
        // 閃電節點
        const nodeCount = 6;
        const nodePositions = [];
        
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i * Math.PI * 2) / nodeCount;
            const distance = 100;
            nodePositions.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        }
        
        // 繪製閃電連接
        this.ctx.strokeStyle = 'rgba(255, 255, 100, 0.9)';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < nodeCount; i++) {
            const start = nodePositions[i];
            const end = nodePositions[(i + 1) % nodeCount];
            
            this.ctx.beginPath();
            this.ctx.moveTo(start.x, start.y);
            
            // 閃電鋸齒效果
            const segments = 8;
            for (let j = 1; j < segments; j++) {
                const t = j / segments;
                const x = start.x + (end.x - start.x) * t + (Math.random() - 0.5) * 15;
                const y = start.y + (end.y - start.y) * t + (Math.random() - 0.5) * 15;
                this.ctx.lineTo(x, y);
            }
            this.ctx.lineTo(end.x, end.y);
            this.ctx.stroke();
        }
        
        // 閃電節點
        nodePositions.forEach(pos => {
            this.ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.restore();
    }
    
    // 暗影召喚效果
    drawShadowSummoning(centerX, centerY, time, elementalGenes) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalCompositeOperation = 'multiply';
        
        // 暗影觸手
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8 + time * 0.001;
            const length = 80 + Math.sin(time * 0.005 + i) * 30;
            
            this.ctx.strokeStyle = `rgba(50, 0, 100, 0.6)`;
            this.ctx.lineWidth = 8;
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            
            // 彎曲觸手
            for (let j = 1; j <= 10; j++) {
                const t = j / 10;
                const x = Math.cos(angle) * length * t + Math.sin(time * 0.01 + i + j) * 20;
                const y = Math.sin(angle) * length * t + Math.cos(time * 0.01 + i + j) * 20;
                this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    // 神聖召喚效果
    drawHolySummoning(centerX, centerY, time, elementalGenes) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.globalCompositeOperation = 'screen';
        
        // 神聖光柱
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI * 2) / 4;
            const distance = 80;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            const gradient = this.ctx.createLinearGradient(x, y, x, y - 60);
            gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 150, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 255, 100, 0.1)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x - 5, y - 60, 10, 60);
        }
        
        // 神聖符號
        this.ctx.strokeStyle = 'rgba(255, 255, 200, 0.9)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -40);
        this.ctx.lineTo(0, 40);
        this.ctx.moveTo(-40, 0);
        this.ctx.lineTo(40, 0);
        this.ctx.stroke();
        
        // 神聖環
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 60, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
}

console.log('🌀 混沌引擎系統載入完成');