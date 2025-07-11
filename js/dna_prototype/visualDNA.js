/**
 * 視覺DNA系統 - 核心基因生成器
 * 創造真正不可預測的視覺效果
 */
class VisualDNA {
    constructor(entropy = null) {
        // 多重熵源確保真正隨機
        this.entropy = entropy || this.generateEntropy();
        
        // 基因序列
        this.genes = this.generateFromChaos();
        
        // 進化計數器
        this.generation = 0;
        this.mutationHistory = [];
        
        // 品質標記
        this.qualityScore = 0;
        this.isUsable = true;
        
        console.log('🧬 新DNA序列生成:', this.getSequenceString());
    }
    
    // 生成多重熵源
    generateEntropy() {
        const now = Date.now();
        const entropy = {
            timestamp: now,
            microseconds: now % 1000,
            random: Math.random(),
            mouseEntropy: this.getMouseEntropy(),
            systemEntropy: this.getSystemEntropy(),
            quantumEntropy: this.getQuantumEntropy()
        };
        
        // 生成混沌種子
        entropy.chaosSeed = this.generateChaosSeed(entropy);
        
        return entropy;
    }
    
    // 獲取滑鼠軌跡熵
    getMouseEntropy() {
        if (typeof window !== 'undefined' && window.mouseTracker) {
            return window.mouseTracker.getEntropy();
        }
        return {
            x: Math.random() * 1000,
            y: Math.random() * 1000,
            velocity: Math.random() * 100
        };
    }
    
    // 獲取系統熵
    getSystemEntropy() {
        return {
            performance: performance.now() % 1000,
            memory: navigator.deviceMemory || Math.random() * 8,
            screen: (screen.width * screen.height) % 10000,
            userAgent: navigator.userAgent.length % 100
        };
    }
    
    // 量子熵 (基於不可預測的物理現象模擬)
    getQuantumEntropy() {
        const quantumStates = [];
        for (let i = 0; i < 10; i++) {
            // 模擬量子疊加態
            const superposition = Math.random() > 0.5;
            const uncertainty = Math.random() * Math.PI * 2;
            quantumStates.push({ superposition, uncertainty });
        }
        
        return {
            states: quantumStates,
            coherence: Math.random(),
            entanglement: Math.random() * Math.random() // 量子糾纏效應
        };
    }
    
    // 生成混沌種子
    generateChaosSeed(entropy) {
        let seed = 0;
        
        // 混合所有熵源
        seed += entropy.timestamp * 37;
        seed += entropy.random * 73;
        seed += entropy.microseconds * 97;
        seed += entropy.mouseEntropy.x * 13;
        seed += entropy.systemEntropy.performance * 23;
        
        // 應用量子效應
        entropy.quantumEntropy.states.forEach((state, i) => {
            seed += state.uncertainty * (i + 1) * 17;
            if (state.superposition) {
                seed *= 1.618; // 黃金比例
            }
        });
        
        return seed % 1000000;
    }
    
    // 從混沌中生成基因
    generateFromChaos() {
        const seed = this.entropy.chaosSeed;
        
        const genes = {
            // 元素主題基因組 (新增)
            elementalGenes: this.generateElementalGenes(seed),
            
            // 複合特效基因組 (新增)
            complexGenes: this.generateComplexGenes(seed * 0.7),
            
            // 多階段演化基因組 (新增)
            stageGenes: this.generateStageGenes(seed * 0.8),
            
            // 材質基因組 (新增)
            materialGenes: this.generateMaterialGenes(seed * 0.9),
            
            // 顏色基因組 (增強)
            colorGenes: this.generateColorGenes(seed),
            
            // 形狀基因組 (增強)
            shapeGenes: this.generateShapeGenes(seed * 1.1),
            
            // 運動基因組
            motionGenes: this.generateMotionGenes(seed * 1.2),
            
            // 粒子基因組 (將重構為多層次)
            particleGenes: this.generateParticleGenes(seed * 1.3),
            
            // 特效基因組
            fxGenes: this.generateFXGenes(seed * 1.4),
            
            // 進化基因組
            evolutionGenes: this.generateEvolutionGenes(seed * 1.5),
            
            // 混沌基因
            chaosGenes: this.generateChaosGenes(seed * 1.618)
        };
        
        // 性能保護：防止 distortion 和 quantumEffects 同時啟用
        if (genes.fxGenes.hasDistortion && genes.chaosGenes.hasQuantumEffects) {
            console.log('⚠️ [generateFromChaos] 檢測到性能問題組合：Distortion + QuantumEffects，自動關閉其中一個');
            // 隨機選擇關閉其中一個
            if (Math.random() > 0.5) {
                genes.fxGenes.hasDistortion = false;
                console.log('  → 已關閉 Distortion 效果');
            } else {
                genes.chaosGenes.hasQuantumEffects = false;
                console.log('  → 已關閉 QuantumEffects 效果');
            }
        } else {
            console.log('✅ [generateFromChaos] 性能檢查通過 - Distortion:', genes.fxGenes.hasDistortion, 'QuantumEffects:', genes.chaosGenes.hasQuantumEffects);
        }
        
        return genes;
    }
    
    // 生成顏色基因
    generateColorGenes(seed) {
        const methods = [
            () => this.generateRainbowChaos(seed),
            () => this.generateTemperatureColor(seed),
            () => this.generateEmotionColor(seed),
            () => this.generateCosmicColor(seed),
            () => this.generateQuantumColor(seed),
            () => this.generateDimensionalColor(seed)
        ];
        
        const methodIndex = Math.floor((seed * 0.001) % methods.length);
        const baseColors = methods[methodIndex]();
        
        return {
            primary: baseColors.primary,
            secondary: baseColors.secondary,
            accent: baseColors.accent,
            background: baseColors.background,
            
            // 動態屬性
            isShifting: (seed % 13) > 6,
            shiftSpeed: (seed % 100) / 100,
            blendMode: this.selectBlendMode(seed),
            saturation: 0.3 + ((seed % 70) / 100),
            brightness: 0.4 + ((seed % 60) / 100),
            
            // 特殊效果
            hasAura: (seed % 7) === 0,
            isQuantum: (seed % 17) === 0,
            isPulsing: (seed % 11) > 5
        };
    }
    
    // 彩虹混沌色彩生成
    generateRainbowChaos(seed) {
        const hue = (seed * 137.5) % 360; // 黃金角度
        const hue2 = (hue + 180) % 360;
        const hue3 = (hue + 90) % 360;
        const hue4 = (hue + 270) % 360;
        
        return {
            primary: this.hslToRgb(hue / 360, 0.8, 0.5),
            secondary: this.hslToRgb(hue2 / 360, 0.7, 0.5),
            accent: this.hslToRgb(hue3 / 360, 0.9, 0.6),
            background: this.hslToRgb(hue4 / 360, 0.3, 0.2)
        };
    }
    
    // 溫度色彩生成
    generateTemperatureColor(seed) {
        const temp = (seed % 100) / 100; // 0-1 溫度值
        
        let r, g, b;
        if (temp < 0.5) {
            // 冷色系
            r = Math.floor(0 + temp * 100);
            g = Math.floor(100 + temp * 155);
            b = Math.floor(200 + temp * 55);
        } else {
            // 暖色系
            r = Math.floor(200 + (temp - 0.5) * 110);
            g = Math.floor(100 - (temp - 0.5) * 100);
            b = Math.floor(50 - (temp - 0.5) * 50);
        }
        
        return {
            primary: { r, g, b, a: 0.8 },
            secondary: { r: Math.floor(r * 0.8), g: Math.floor(g * 0.8), b: Math.floor(b * 0.8), a: 0.6 },
            accent: { r: Math.min(255, r + 50), g: Math.min(255, g + 50), b: Math.min(255, b + 50), a: 0.9 },
            background: { r: Math.floor(r * 0.2), g: Math.floor(g * 0.2), b: Math.floor(b * 0.2), a: 0.3 }
        };
    }
    
    // 情感色彩生成
    generateEmotionColor(seed) {
        const emotions = [
            { name: 'joy', colors: [[255, 200, 0], [255, 150, 0], [255, 255, 100], [255, 100, 0]] },
            { name: 'calm', colors: [[100, 150, 255], [150, 200, 255], [200, 220, 255], [50, 100, 200]] },
            { name: 'energy', colors: [[255, 0, 100], [255, 100, 0], [255, 0, 200], [150, 0, 50]] },
            { name: 'mystery', colors: [[100, 0, 200], [150, 0, 255], [200, 100, 255], [50, 0, 100]] },
            { name: 'nature', colors: [[0, 200, 100], [100, 255, 100], [0, 150, 50], [0, 100, 50]] }
        ];
        
        // 確保seed為有效數值
        const safeSeed = Math.abs(Math.floor(seed || 0));
        const emotion = emotions[safeSeed % emotions.length];
        
        // 安全檢查emotion和colors屬性
        if (!emotion || !emotion.colors || !Array.isArray(emotion.colors)) {
            console.warn('❌ emotion或colors無效，使用默認顏色');
            return {
                primary: { r: 255, g: 255, b: 255, a: 0.8 },
                secondary: { r: 200, g: 200, b: 200, a: 0.6 },
                accent: { r: 150, g: 150, b: 150, a: 0.9 },
                background: { r: 100, g: 100, b: 100, a: 0.3 }
            };
        }
        
        const colors = emotion.colors;
        
        return {
            primary: { r: colors[0][0], g: colors[0][1], b: colors[0][2], a: 0.8 },
            secondary: { r: colors[1][0], g: colors[1][1], b: colors[1][2], a: 0.6 },
            accent: { r: colors[2][0], g: colors[2][1], b: colors[2][2], a: 0.9 },
            background: { r: colors[3][0], g: colors[3][1], b: colors[3][2], a: 0.3 }
        };
    }
    
    // 維度色彩生成
    generateDimensionalColor(seed) {
        // 基於維度理論的色彩
        const dimension = (seed % 7) + 1; // 1-7維
        const phase = (seed % 360) * Math.PI / 180;
        
        const r = Math.floor(128 + 127 * Math.sin(phase * dimension));
        const g = Math.floor(128 + 127 * Math.sin(phase * dimension + Math.PI * 2/3));
        const b = Math.floor(128 + 127 * Math.sin(phase * dimension + Math.PI * 4/3));
        
        return {
            primary: { r, g, b, a: 0.8 },
            secondary: { 
                r: Math.floor(r * 0.7 + 50), 
                g: Math.floor(g * 0.7 + 50), 
                b: Math.floor(b * 0.7 + 50), 
                a: 0.6 
            },
            accent: { 
                r: Math.min(255, r + 100), 
                g: Math.min(255, g + 100), 
                b: Math.min(255, b + 100), 
                a: 0.9 
            },
            background: { 
                r: Math.floor(r * 0.3), 
                g: Math.floor(g * 0.3), 
                b: Math.floor(b * 0.3), 
                a: 0.3 
            }
        };
    }
    
    // HSL轉RGB輔助函數
    hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
            a: 0.8
        };
    }
    
    // 量子色彩生成
    generateQuantumColor(seed) {
        const uncertainty = this.entropy.quantumEntropy.coherence;
        
        return {
            primary: {
                r: Math.floor((seed * 37) % 256),
                g: Math.floor((seed * 73) % 256),
                b: Math.floor((seed * 97) % 256),
                a: 0.7 + uncertainty * 0.3
            },
            secondary: {
                r: Math.floor((seed * 101) % 256),
                g: Math.floor((seed * 103) % 256),
                b: Math.floor((seed * 107) % 256),
                a: 0.5 + uncertainty * 0.5
            },
            accent: {
                r: Math.floor((seed * 109) % 256),
                g: Math.floor((seed * 113) % 256),
                b: Math.floor((seed * 127) % 256),
                a: 0.8
            },
            background: {
                r: Math.floor((seed * 131) % 256),
                g: Math.floor((seed * 137) % 256),
                b: Math.floor((seed * 139) % 256),
                a: 0.2
            }
        };
    }
    
    // 宇宙色彩生成
    generateCosmicColor(seed) {
        const cosmicPalettes = [
            // 星雲色調
            { base: [255, 100, 200], variance: 80 },
            // 深空色調
            { base: [50, 0, 100], variance: 60 },
            // 恆星色調
            { base: [255, 200, 100], variance: 100 },
            // 黑洞色調
            { base: [20, 20, 40], variance: 30 }
        ];
        
        const paletteIndex = Math.abs(Math.floor(seed)) % cosmicPalettes.length;
        const palette = cosmicPalettes[paletteIndex];
        
        return {
            primary: this.generateColorVariant(palette.base, palette.variance, seed),
            secondary: this.generateColorVariant(palette.base, palette.variance, seed * 1.1),
            accent: this.generateColorVariant(palette.base, palette.variance, seed * 1.2),
            background: this.generateColorVariant([0, 0, 0], 50, seed * 1.3)
        };
    }
    
    // 生成顏色變異
    generateColorVariant(base, variance, seed) {
        return {
            r: Math.max(0, Math.min(255, base[0] + ((seed % variance) - variance/2))),
            g: Math.max(0, Math.min(255, base[1] + (((seed * 1.1) % variance) - variance/2))),
            b: Math.max(0, Math.min(255, base[2] + (((seed * 1.2) % variance) - variance/2))),
            a: 0.5 + ((seed % 50) / 100)
        };
    }
    
    // 生成形狀基因
    generateShapeGenes(seed) {
        const shapes = [
            'circle', 'star', 'diamond', 'triangle', 'square', 'hexagon',
            'spiral', 'wave', 'crystal', 'blob', 'fractal', 'chaos'
        ];
        
        const coreShape = shapes[Math.floor((seed * 0.001) % shapes.length)];
        
        return {
            coreShape: coreShape,
            coreSize: 30 + ((seed % 50)), // 增加基礎大小從10-40到30-80
            complexity: 1 + ((seed % 9)),
            symmetry: (seed % 8) + 1,
            
            // 變形屬性
            isDeforming: (seed % 13) > 7,
            deformSpeed: (seed % 100) / 200,
            deformIntensity: (seed % 50) / 100,
            
            // 分裂屬性
            canSplit: (seed % 17) === 0,
            splitCount: 2 + (seed % 4),
            
            // 維度屬性
            dimension: (seed % 23) > 15 ? '3D' : '2D',
            depth: (seed % 100) / 100
        };
    }
    
    // 生成運動基因
    generateMotionGenes(seed) {
        // 移除軌跡系統，改為直接效果
        return {
            speed: 50 + ((seed % 150)),
            acceleration: -50 + ((seed % 100)),
            
            // 旋轉屬性
            rotationSpeed: -5 + ((seed % 10)),
            rotationAxis: [(seed % 2), ((seed * 1.1) % 2), ((seed * 1.2) % 2)],
            
            // 縮放屬性
            scaling: 0.5 + ((seed % 100) / 100),
            pulsing: (seed % 11) > 5,
            pulseSpeed: (seed % 50) / 100,
            
            // 物理屬性
            hasGravity: (seed % 13) > 8,
            hasBounce: (seed % 17) > 12,
            friction: (seed % 50) / 1000,
            
            // 時空屬性
            timeDistortion: (seed % 23) === 0,
            spaceWarping: (seed % 29) === 0
        };
    }
    
    // 生成粒子基因
    generateParticleGenes(seed) {
        return {
            count: 5 + ((seed % 20)),
            size: 2 + ((seed % 8)),
            sizeVariation: (seed % 50) / 100,
            
            // 生命週期
            lifespan: 1.0 + ((seed % 300) / 100),
            fadeRate: (seed % 100) / 100,
            
            // 行為模式
            behavior: this.selectParticleBehavior(seed),
            cohesion: (seed % 100) / 100,
            separation: (seed % 100) / 100,
            
            // 生成模式
            emissionRate: (seed % 50) / 10,
            burstSize: 1 + (seed % 10),
            
            // 特殊效果
            hasTrails: (seed % 7) > 3,
            trailLength: (seed % 100) / 100,
            isElectric: (seed % 13) === 0,
            isMagnetic: (seed % 17) === 0
        };
    }
    
    // 選擇粒子行為
    selectParticleBehavior(seed) {
        const behaviors = [
            'explode', 'implode', 'swirl', 'drift', 'chase',
            'orbit', 'spiral', 'bounce', 'flow', 'chaos'
        ];
        return behaviors[Math.floor((seed * 0.001) % behaviors.length)];
    }
    
    // 生成特效基因
    generateFXGenes(seed) {
        return {
            hasGlow: (seed % 5) > 2,
            glowIntensity: (seed % 100) / 100,
            glowRadius: 5 + (seed % 15),
            
            hasBlur: (seed % 7) > 4,
            blurAmount: (seed % 20) / 10,
            
            hasDistortion: (seed % 11) > 7,
            distortionType: this.selectDistortionType(seed),
            distortionIntensity: (seed % 50) / 100,
            
            hasLighting: (seed % 13) > 8,
            lightingType: 'point',
            lightIntensity: (seed % 100) / 100,
            
            // 時間效果
            hasTimeEffect: (seed % 17) === 0,
            timeStretch: 0.5 + ((seed % 100) / 100),
            
            // 空間效果
            hasSpaceEffect: (seed % 19) === 0,
            dimensionShift: (seed % 3) / 2
        };
    }
    
    // 選擇失真類型
    selectDistortionType(seed) {
        const types = ['wave', 'ripple', 'twist', 'bend', 'stretch', 'shatter'];
        return types[Math.floor((seed * 0.001) % types.length)];
    }
    
    // 生成進化基因
    generateEvolutionGenes(seed) {
        return {
            mutationRate: (seed % 50) / 100,
            adaptability: (seed % 100) / 100,
            stability: (seed % 100) / 100,
            
            // 進化傾向
            evolutionBias: this.selectEvolutionBias(seed),
            generationLimit: 5 + (seed % 10),
            
            // 自我修復
            canSelfRepair: (seed % 13) > 9,
            repairRate: (seed % 50) / 1000,
            
            // 學習能力
            hasMemory: (seed % 17) > 12,
            memoryCapacity: 3 + (seed % 7)
        };
    }
    
    // 選擇進化偏向
    selectEvolutionBias(seed) {
        const biases = ['beauty', 'complexity', 'efficiency', 'chaos', 'harmony', 'survival'];
        return biases[Math.floor((seed * 0.001) % biases.length)];
    }
    
    // 生成混沌基因
    generateChaosGenes(seed) {
        return {
            chaosLevel: (seed % 100) / 100,
            unpredictability: (seed % 100) / 100,
            
            // 隨機突變
            canRandomMutate: (seed % 7) > 4,
            mutationIntensity: (seed % 100) / 100,
            
            // 量子效應
            hasQuantumEffects: (seed % 11) > 7,
            quantumCoherence: this.entropy.quantumEntropy.coherence,
            
            // 混沌吸引子
            attractorType: this.selectChaosAttractor(seed),
            attractorStrength: (seed % 100) / 100,
            
            // 非線性動力學
            hasNonlinearDynamics: (seed % 13) === 0,
            bifurcationPoint: (seed % 100) / 100
        };
    }
    
    // 選擇混沌吸引子
    selectChaosAttractor(seed) {
        const attractors = ['lorenz', 'rossler', 'henon', 'logistic', 'mandelbrot'];
        return attractors[Math.floor((seed * 0.001) % attractors.length)];
    }
    
    // 選擇混合模式
    selectBlendMode(seed) {
        const modes = [
            'normal', 'multiply', 'screen', 'overlay', 'soft-light',
            'hard-light', 'color-dodge', 'color-burn', 'difference', 'exclusion'
        ];
        return modes[Math.floor((seed * 0.001) % modes.length)];
    }
    
    // DNA突變
    mutate(mutationRate = 0.3) {
        this.generation++;
        const mutatedDNA = new VisualDNA();
        
        // 複製當前基因
        mutatedDNA.genes = JSON.parse(JSON.stringify(this.genes));
        mutatedDNA.generation = this.generation;
        
        // 應用突變
        this.applyMutations(mutatedDNA, mutationRate);
        
        // 性能保護：防止 distortion 和 quantumEffects 同時啟用
        if (mutatedDNA.genes.fxGenes?.hasDistortion && mutatedDNA.genes.chaosGenes?.hasQuantumEffects) {
            console.log('⚠️ 突變後檢測到性能問題組合：Distortion + QuantumEffects，自動關閉其中一個');
            // 隨機選擇關閉其中一個
            if (Math.random() > 0.5) {
                mutatedDNA.genes.fxGenes.hasDistortion = false;
                console.log('  → 已關閉 Distortion 效果');
            } else {
                mutatedDNA.genes.chaosGenes.hasQuantumEffects = false;
                console.log('  → 已關閉 QuantumEffects 效果');
            }
        }
        
        // 簡化突變歷史 - 只保留最後 3 筆記錄
        const recentHistory = this.mutationHistory.slice(-2); // 只保留最近2筆
        mutatedDNA.mutationHistory = [...recentHistory, {
            generation: this.generation,
            mutationRate: mutationRate,
            timestamp: Date.now()
        }];
        
        console.log(`🧬 DNA突變 (第${this.generation}代):`, mutatedDNA.getSequenceString());
        
        return mutatedDNA;
    }
    
    // 應用突變
    applyMutations(dna, rate) {
        const geneGroups = Object.keys(dna.genes);
        
        geneGroups.forEach(groupKey => {
            const group = dna.genes[groupKey];
            Object.keys(group).forEach(geneKey => {
                if (Math.random() < rate) {
                    this.mutateGene(group, geneKey);
                }
            });
        });
    }
    
    // 突變單個基因 (增強版)
    mutateGene(group, geneKey) {
        const oldValue = group[geneKey];
        
        if (typeof oldValue === 'number') {
            // 數值突變 - 增強變化幅度
            let variance, newValue;
            
            if (geneKey.includes('Color') || geneKey === 'r' || geneKey === 'g' || geneKey === 'b') {
                // 顏色突變 - 使用更大的變化範圍
                variance = 60 + Math.random() * 120; // 60-180 的變化
                newValue = oldValue + (Math.random() - 0.5) * variance;
                group[geneKey] = Math.max(0, Math.min(255, newValue));
            } else if (geneKey === 'a' || geneKey.includes('Rate') || geneKey.includes('Intensity') || geneKey.includes('Level')) {
                // 比率值突變 - 使用更大的變化
                variance = 0.3 + Math.random() * 0.4; // 0.3-0.7 的變化
                newValue = oldValue + (Math.random() - 0.5) * variance;
                group[geneKey] = Math.max(0, Math.min(1, newValue));
            } else if (geneKey.includes('Size') || geneKey.includes('Radius') || geneKey.includes('Scale')) {
                // 尺寸突變 - 更有劇性的變化
                variance = Math.abs(oldValue) * 0.8 + 20; // 更大的變化範圍
                newValue = oldValue + (Math.random() - 0.5) * variance;
                group[geneKey] = Math.max(1, newValue); // 保持正值
            } else if (geneKey.includes('Speed') || geneKey.includes('Velocity')) {
                // 速度突變 - 增強動態效果
                variance = Math.abs(oldValue) * 1.0 + 15;
                newValue = oldValue + (Math.random() - 0.5) * variance;
                group[geneKey] = newValue; // 允許負值速度
            } else {
                // 其他數值 - 使用增強的預設變化
                variance = Math.abs(oldValue) * 0.6 + 25;
                newValue = oldValue + (Math.random() - 0.5) * variance;
                group[geneKey] = newValue;
            }
        } else if (typeof oldValue === 'boolean') {
            // 布爾突變 - 增加變化機率
            group[geneKey] = Math.random() > 0.3; // 增加變化機率
        } else if (typeof oldValue === 'string') {
            // 字符串突變 - 隨機選擇新值
            if (geneKey === 'spellType') {
                const spellTypes = ['projectile', 'beam', 'aura', 'burst', 'shield', 'summon'];
                group[geneKey] = spellTypes[Math.floor(Math.random() * spellTypes.length)];
            } else if (geneKey === 'primaryElement') {
                const elements = ['fire', 'ice', 'lightning', 'earth', 'water', 'air', 'light', 'shadow'];
                group[geneKey] = elements[Math.floor(Math.random() * elements.length)];
            } else if (geneKey.includes('Mode') || geneKey.includes('Type')) {
                // 其他類型字符串保持不變或隨機選擇
            }
        }
    }
    
    // DNA雜交
    crossover(otherDNA) {
        const childDNA = new VisualDNA();
        childDNA.generation = Math.max(this.generation, otherDNA.generation) + 1;
        
        // 混合基因
        const geneGroups = Object.keys(this.genes);
        geneGroups.forEach(groupKey => {
            childDNA.genes[groupKey] = {};
            const thisGroup = this.genes[groupKey];
            const otherGroup = otherDNA.genes[groupKey];
            
            Object.keys(thisGroup).forEach(geneKey => {
                // 隨機選擇父本或母本的基因
                if (Math.random() > 0.5) {
                    childDNA.genes[groupKey][geneKey] = thisGroup[geneKey];
                } else {
                    childDNA.genes[groupKey][geneKey] = otherGroup[geneKey];
                }
            });
        });
        
        // 性能保護：防止 distortion 和 quantumEffects 同時啟用
        if (childDNA.genes.fxGenes?.hasDistortion && childDNA.genes.chaosGenes?.hasQuantumEffects) {
            console.log('⚠️ 交配後檢測到性能問題組合：Distortion + QuantumEffects，自動關閉其中一個');
            // 隨機選擇關閉其中一個
            if (Math.random() > 0.5) {
                childDNA.genes.fxGenes.hasDistortion = false;
                console.log('  → 已關閉 Distortion 效果');
            } else {
                childDNA.genes.chaosGenes.hasQuantumEffects = false;
                console.log('  → 已關閉 QuantumEffects 效果');
            }
        }
        
        // 簡化雜交歷史 - 只保留當前交配記錄，不繼承父本歷史
        childDNA.mutationHistory = [{
            type: 'crossover',
            generation: childDNA.generation,
            parents: [this.getSequenceString().slice(-20), otherDNA.getSequenceString().slice(-20)], // 只保留簡短識別碼
            timestamp: Date.now()
        }];
        
        console.log('🧬 DNA雜交產生新個體:', childDNA.getSequenceString());
        
        return childDNA;
    }
    
    // 獲取基因序列字符串
    getSequenceString() {
        const core = this.genes.shapeGenes.coreShape;
        const color = this.genes.colorGenes.primary;
        const motion = this.genes.motionGenes.speed;
        const chaos = Math.floor(this.genes.chaosGenes.chaosLevel * 100);
        
        return `${core}-${color.r}${color.g}${color.b}-S${motion}-C${chaos}`;
    }
    
    // 計算複雜度
    calculateComplexity() {
        let complexity = 0;
        
        // 基於各種基因的複雜度
        complexity += this.genes.shapeGenes.complexity * 10;
        complexity += this.genes.particleGenes.count * 2;
        complexity += this.genes.fxGenes.hasGlow ? 10 : 0;
        complexity += this.genes.motionGenes.hasGravity ? 15 : 0;
        complexity += this.genes.chaosGenes.chaosLevel * 20;
        
        return Math.floor(complexity);
    }
    
    // 序列化DNA (用於保存和載入)
    serialize() {
        return {
            genes: this.genes,
            generation: this.generation,
            mutationHistory: this.mutationHistory,
            entropy: this.entropy,
            qualityScore: this.qualityScore,
            isUsable: this.isUsable,
            timestamp: Date.now()
        };
    }
    
    // 從序列化數據載入DNA
    static deserialize(data) {
        const dna = new VisualDNA();
        dna.genes = data.genes;
        dna.generation = data.generation || 0;
        dna.mutationHistory = data.mutationHistory || [];
        dna.entropy = data.entropy;
        dna.qualityScore = data.qualityScore || 0;
        dna.isUsable = data.isUsable !== undefined ? data.isUsable : true;
        
        return dna;
    }
    
    // 複製DNA
    clone() {
        return VisualDNA.deserialize(this.serialize());
    }
    
    // ========== 新增的基因生成方法 ==========
    
    // 生成元素主題基因
    generateElementalGenes(seed) {
        const elements = [
            'fire', 'ice', 'lightning', 'shadow', 'light', 'nature', 
            'void', 'crystal', 'plasma', 'quantum'
        ];
        
        const primaryElement = elements[Math.floor((seed * 0.001) % elements.length)];
        const secondaryElement = elements[Math.floor((seed * 0.002) % elements.length)];
        
        // 根據主要元素生成對應顏色
        const elementColors = this.getElementalColors(primaryElement, seed);
        
        return {
            primaryElement: primaryElement,
            secondaryElement: secondaryElement,
            elementalPurity: (seed % 100) / 100, // 元素純度：0完全混合，1純元素
            elementalIntensity: 0.3 + ((seed % 70) / 100), // 元素強度
            elementalStability: (seed % 100) / 100, // 元素穩定性
            
            // 元素顏色
            primaryColor: elementColors.primary,
            secondaryColor: elementColors.secondary,
            accentColor: elementColors.accent,
            
            // 元素特殊屬性
            hasElementalCore: (seed % 7) > 4, // 是否有元素核心
            hasElementalAura: (seed % 11) > 6, // 是否有元素光環
            hasElementalTrail: (seed % 13) > 8, // 是否有元素軌跡
            hasElementalReaction: (seed % 17) > 12, // 是否有元素反應
            
            // 元素變化
            isElementalShifting: (seed % 19) > 14, // 元素是否會變化
            elementalEvolution: (seed % 23) > 18, // 元素是否會進化
            
            // 元素互動
            elementalResonance: (seed % 50) / 100, // 元素共鳴強度
            elementalConflict: (seed % 30) / 100 // 元素衝突程度
        };
    }
    
    // 根據元素類型生成對應的顏色組合
    getElementalColors(element, seed) {
        const colorVariance = (seed % 50) / 100; // 0-0.5 的顏色變異
        
        switch (element) {
            case 'fire':
                return {
                    primary: { r: 255, g: 100 + Math.floor(colorVariance * 100), b: 30 },
                    secondary: { r: 255, g: 150, b: 0 },
                    accent: { r: 255, g: 50, b: 0 }
                };
            case 'ice':
                return {
                    primary: { r: 100, g: 200 + Math.floor(colorVariance * 55), b: 255 },
                    secondary: { r: 150, g: 220, b: 255 },
                    accent: { r: 200, g: 240, b: 255 }
                };
            case 'lightning':
                return {
                    primary: { r: 255, g: 255, b: 100 + Math.floor(colorVariance * 100) },
                    secondary: { r: 200, g: 200, b: 255 },
                    accent: { r: 255, g: 255, b: 255 }
                };
            case 'shadow':
                return {
                    primary: { r: 50 + Math.floor(colorVariance * 50), g: 50, b: 100 },
                    secondary: { r: 100, g: 50, b: 150 },
                    accent: { r: 150, g: 100, b: 200 }
                };
            case 'light':
            case 'holy':
                return {
                    primary: { r: 255, g: 255, b: 200 + Math.floor(colorVariance * 55) },
                    secondary: { r: 255, g: 240, b: 180 },
                    accent: { r: 255, g: 255, b: 255 }
                };
            case 'nature':
                return {
                    primary: { r: 50 + Math.floor(colorVariance * 100), g: 200, b: 50 },
                    secondary: { r: 100, g: 255, b: 100 },
                    accent: { r: 150, g: 255, b: 200 }
                };
            case 'void':
                return {
                    primary: { r: 20, g: 20, b: 20 + Math.floor(colorVariance * 50) },
                    secondary: { r: 50, g: 30, b: 80 },
                    accent: { r: 100, g: 50, b: 150 }
                };
            case 'crystal':
                return {
                    primary: { r: 200, g: 255, b: 200 + Math.floor(colorVariance * 55) },
                    secondary: { r: 150, g: 200, b: 255 },
                    accent: { r: 255, g: 255, b: 255 }
                };
            case 'plasma':
                return {
                    primary: { r: 255, g: 100 + Math.floor(colorVariance * 100), b: 255 },
                    secondary: { r: 200, g: 50, b: 200 },
                    accent: { r: 255, g: 0, b: 255 }
                };
            case 'quantum':
                return {
                    primary: { 
                        r: 100 + Math.floor(colorVariance * 155), 
                        g: 100 + Math.floor(colorVariance * 155), 
                        b: 100 + Math.floor(colorVariance * 155) 
                    },
                    secondary: { r: 255, g: 200, b: 255 },
                    accent: { r: 200, g: 255, b: 200 }
                };
            default:
                // 預設使用隨機顏色
                return {
                    primary: { 
                        r: 100 + Math.floor(colorVariance * 155), 
                        g: 100 + Math.floor((seed * 0.1) % 155), 
                        b: 100 + Math.floor((seed * 0.2) % 155) 
                    },
                    secondary: { r: 150, g: 150, b: 150 },
                    accent: { r: 200, g: 200, b: 200 }
                };
        }
    }
    
    // 生成複合特效基因
    generateComplexGenes(seed) {
        return {
            // 法術類型 (新增)
            spellType: this.selectSpellType(seed),
            
            // 層次結構
            layerCount: 2 + (seed % 4), // 2-5層效果
            layerComplexity: (seed % 100) / 100,
            layerInteraction: (seed % 100) / 100,
            
            // 組合效果類型
            combinationType: this.selectCombinationType(seed),
            
            // 空間效果
            hasSpacialDistortion: (seed % 7) > 4,
            hasTimeDistortion: (seed % 11) > 7,
            hasRealityRift: (seed % 13) > 10,
            
            // 能量場效果
            hasEnergyField: (seed % 5) > 2,
            fieldRadius: 30 + (seed % 100),
            fieldIntensity: (seed % 100) / 100,
            fieldPulsation: (seed % 100) / 100,
            
            // 幾何複雜性
            geometricComplexity: 1 + (seed % 5),
            fractionalDimension: 2 + ((seed % 100) / 100), // 2.0-3.0維度
            
            // 動態變形
            morphingSpeed: (seed % 100) / 200,
            morphingIntensity: (seed % 100) / 100,
            
            // 共鳴效果
            hasResonance: (seed % 9) > 6,
            resonanceFrequency: (seed % 100) / 100,
            resonanceAmplitude: (seed % 100) / 100
        };
    }
    
    // 選擇法術類型
    selectSpellType(seed) {
        const types = [
            'burst',      // 爆發型 - AOE瞬間爆炸
            'continuous', // 持續型 - 持續輸出傷害  
            'enhancement', // 增強型 - 增益效果
            'summoning'   // 召喚型 - 召喚物/陷阱
        ];
        return types[Math.floor((seed * 0.001) % types.length)];
    }
    
    // 選擇組合類型
    selectCombinationType(seed) {
        const types = [
            'nested', 'parallel', 'sequential', 'spiral', 'orbital',
            'interference', 'cascade', 'explosion', 'implosion', 'fusion'
        ];
        return types[Math.floor((seed * 0.001) % types.length)];
    }
    
    // 生成多階段演化基因
    generateStageGenes(seed) {
        return {
            // 階段定義
            stageCount: 3 + (seed % 3), // 3-5個階段
            
            // 生成階段 (Generation Stage)
            generationDuration: 200 + (seed % 300), // ms
            generationStyle: this.selectGenerationStyle(seed),
            generationIntensity: (seed % 100) / 100,
            
            // 發射階段 (Launch Stage)  
            launchDuration: 100 + (seed % 200),
            launchStyle: this.selectLaunchStyle(seed),
            launchForce: (seed % 100) / 100,
            
            // 飛行階段 (Flight Stage)
            flightEvolution: (seed % 100) / 100, // 飛行中的變化程度
            flightTrailComplexity: 1 + (seed % 4),
            flightEnvironmentInteraction: (seed % 100) / 100,
            
            // 命中階段 (Impact Stage)
            impactDuration: 150 + (seed % 250),
            impactStyle: this.selectImpactStyle(seed),
            impactExpansion: (seed % 100) / 100,
            
            // 消散階段 (Dissipation Stage)
            dissipationDuration: 300 + (seed % 500),
            dissipationStyle: this.selectDissipationStyle(seed),
            dissipationComplexity: (seed % 100) / 100,
            
            // 階段轉換
            stageTransitionSmooth: (seed % 7) > 3,
            stageOverlap: (seed % 50) / 100, // 階段重疊程度
            
            // 動態階段調整
            adaptiveStaging: (seed % 11) > 7, // 是否根據環境調整階段
            stageAmplification: (seed % 100) / 100 // 階段放大效果
        };
    }
    
    // 階段樣式選擇方法
    selectGenerationStyle(seed) {
        const styles = ['gathering', 'crystallization', 'summoning', 'charging', 'materialization'];
        return styles[Math.floor((seed * 0.001) % styles.length)];
    }
    
    selectLaunchStyle(seed) {
        const styles = ['burst', 'acceleration', 'teleport', 'phase', 'eruption'];
        return styles[Math.floor((seed * 0.002) % styles.length)];
    }
    
    selectImpactStyle(seed) {
        const styles = ['explosion', 'penetration', 'spreading', 'absorption', 'transformation'];
        return styles[Math.floor((seed * 0.003) % styles.length)];
    }
    
    selectDissipationStyle(seed) {
        const styles = ['fade', 'scatter', 'absorption', 'evaporation', 'crystallization'];
        return styles[Math.floor((seed * 0.004) % styles.length)];
    }
    
    // 生成材質基因
    generateMaterialGenes(seed) {
        return {
            // 基礎材質類型
            materialType: this.selectMaterialType(seed),
            
            // 光學屬性
            opacity: 0.3 + ((seed % 70) / 100),
            transparency: (seed % 100) / 100,
            refractiveIndex: 1.0 + ((seed % 50) / 100),
            
            // 發光屬性
            hasEmission: (seed % 5) > 2,
            emissionIntensity: (seed % 100) / 100,
            emissionColor: this.generateEmissionColor(seed),
            emissionPulsation: (seed % 100) / 100,
            
            // 表面效果
            hasReflection: (seed % 7) > 4,
            reflectionIntensity: (seed % 100) / 100,
            hasIridescence: (seed % 11) > 7, // 彩虹色澤
            iridescenceShift: (seed % 100) / 100,
            
            // 動態材質
            isDynamic: (seed % 9) > 6,
            dynamicSpeed: (seed % 100) / 200,
            materialFlow: (seed % 100) / 100,
            
            // 粒子材質
            hasParticleEmission: (seed % 13) > 9,
            particleEmissionRate: (seed % 50) / 10,
            particleMaterialType: this.selectParticleMaterial(seed),
            
            // 能量場材質
            hasEnergyField: (seed % 17) > 12,
            energyFieldType: this.selectEnergyFieldType(seed),
            energyFieldIntensity: (seed % 100) / 100,
            
            // 扭曲效果
            hasDistortion: (seed % 19) > 14,
            distortionType: this.selectDistortionType(seed),
            distortionIntensity: (seed % 100) / 100
        };
    }
    
    // 材質類型選擇方法
    selectMaterialType(seed) {
        const types = [
            'energy', 'plasma', 'crystal', 'liquid', 'gas', 'ethereal',
            'metallic', 'organic', 'quantum', 'void'
        ];
        return types[Math.floor((seed * 0.001) % types.length)];
    }
    
    selectParticleMaterial(seed) {
        const types = ['spark', 'ember', 'ice', 'energy', 'void', 'light'];
        return types[Math.floor((seed * 0.002) % types.length)];
    }
    
    selectEnergyFieldType(seed) {
        const types = ['aurora', 'electromagnetic', 'gravitational', 'temporal', 'quantum'];
        return types[Math.floor((seed * 0.003) % types.length)];
    }
    
    generateEmissionColor(seed) {
        const hue = (seed * 137.5) % 360;
        return {
            h: hue,
            s: 0.7 + ((seed % 30) / 100),
            l: 0.5 + ((seed % 40) / 100)
        };
    }
}

// 滑鼠軌跡追蹤器 (用於增加熵源)
class MouseTracker {
    constructor() {
        this.positions = [];
        this.maxHistory = 100;
        this.lastTime = 0;
        
        this.setupTracking();
    }
    
    setupTracking() {
        if (typeof window !== 'undefined') {
            document.addEventListener('mousemove', (e) => {
                const now = performance.now();
                this.positions.push({
                    x: e.clientX,
                    y: e.clientY,
                    time: now,
                    velocity: this.calculateVelocity(e.clientX, e.clientY, now)
                });
                
                if (this.positions.length > this.maxHistory) {
                    this.positions.shift();
                }
                
                this.lastTime = now;
            });
        }
    }
    
    calculateVelocity(x, y, time) {
        if (this.positions.length === 0) return 0;
        
        const last = this.positions[this.positions.length - 1];
        const dx = x - last.x;
        const dy = y - last.y;
        const dt = time - last.time;
        
        return Math.sqrt(dx * dx + dy * dy) / (dt || 1);
    }
    
    getEntropy() {
        if (this.positions.length === 0) {
            return { x: Math.random() * 1000, y: Math.random() * 1000, velocity: 0 };
        }
        
        const recent = this.positions.slice(-10);
        const avgVelocity = recent.reduce((sum, pos) => sum + pos.velocity, 0) / recent.length;
        const lastPos = this.positions[this.positions.length - 1];
        
        return {
            x: lastPos.x,
            y: lastPos.y,
            velocity: avgVelocity,
            chaos: this.calculateChaosLevel()
        };
    }
    
    calculateChaosLevel() {
        if (this.positions.length < 5) return 0;
        
        // 計算軌跡的不規則程度
        let chaos = 0;
        for (let i = 2; i < this.positions.length; i++) {
            const p1 = this.positions[i - 2];
            const p2 = this.positions[i - 1];
            const p3 = this.positions[i];
            
            // 計算角度變化
            const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
            const angleDiff = Math.abs(angle2 - angle1);
            
            chaos += Math.min(angleDiff, Math.PI - angleDiff);
        }
        
        return Math.min(chaos / this.positions.length, 1);
    }
}

// 初始化滑鼠追蹤器
if (typeof window !== 'undefined') {
    window.mouseTracker = new MouseTracker();
}

console.log('🧬 VisualDNA系統載入完成');