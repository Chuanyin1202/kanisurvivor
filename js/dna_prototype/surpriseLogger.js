/**
 * 驚喜記錄器 - 品質檢測和用戶反饋收集系統
 * 用於識別和記錄優質的視覺DNA組合，過濾掉不良效果
 */
class SurpriseLogger {
    constructor() {
        this.experiments = [];
        this.surprises = [];
        this.maxSurpriseSize = 10;
        this.qualityMetrics = {
            beauty: 0,
            creativity: 0,
            uniqueness: 0,
            stability: 0,
            performance: 0
        };
        
        // 實驗統計
        this.stats = {
            totalExperiments: 0,
            successfulExperiments: 0,
            averageRating: 0,
            topComplexity: 0,
            surpriseRate: 0
        };
        
        // 機器學習模型參數
        this.qualityModel = {
            weights: {
                complexity: 0.2,
                colorHarmony: 0.25,
                motionFlow: 0.2,
                visualBalance: 0.2,
                uniqueness: 0.15
            },
            thresholds: {
                excellent: 0.8,
                good: 0.6,
                acceptable: 0.4,
                poor: 0.2
            }
        };
        
        // 用戶反饋收集
        this.feedbackCollection = {
            emotions: new Map(),
            tags: new Map(),
            ratings: [],
            intentions: new Map()
        };
        
        this.setupEventListeners();
        this.loadStoredData();
        
        console.log('📊 驚喜記錄器初始化完成');
    }
    
    // 設置事件監聽器
    setupEventListeners() {
        // 情感按鈕
        document.querySelectorAll('.emotion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emotion = e.target.dataset.emotion;
                this.recordEmotion(emotion);
                this.highlightButton(e.target);
            });
        });
        
        // 標籤按鈕
        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const tagName = e.target.dataset.tag;
                this.recordTag(tagName);
                this.toggleTag(e.target);
            });
        });
        
        // 評分系統
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.recordRating(rating);
                this.updateStarDisplay(rating);
            });
        });
        
        // 使用意願複選框
        document.querySelectorAll('.intention-item input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const intention = e.target.id;
                this.recordIntention(intention, e.target.checked);
            });
        });
        
        // 導出和重置按鈕
        document.getElementById('exportData')?.addEventListener('click', () => this.exportData());
        document.getElementById('resetLab')?.addEventListener('click', () => this.resetLab());
        
        // 監聽DNA實驗事件
        document.addEventListener('dnaExperiment', (e) => {
            this.logExperiment(e.detail);
        });
        
        document.addEventListener('randomMutation', (e) => {
            this.logMutation(e.detail);
        });
    }
    
    // 記錄實驗
    logExperiment(experimentData) {
        const experiment = {
            id: this.generateExperimentId(),
            timestamp: Date.now(),
            dna: experimentData.dna,
            complexity: experimentData.complexity || 0,
            
            // 自動品質檢測
            qualityScore: this.calculateQualityScore(experimentData),
            
            // 驚喜檢測
            isSurprise: false,
            surpriseReason: '',
            surpriseScore: 0
        };
        
        // 計算品質等級
        experiment.qualityGrade = this.getQualityGrade(experiment.qualityScore);
        
        // 更新實驗計數
        this.stats.totalExperiments++;
        
        // 驚喜檢測（提高門檻）
        this.detectSurprise(experiment);
        
        // 只保存驚喜發現
        if (experiment.isSurprise) {
            this.surprises.push(experiment);
            
            // 限制驚喜發現數量為 10 筆
            if (this.surprises.length > this.maxSurpriseSize) {
                this.surprises = this.surprises.slice(-this.maxSurpriseSize);
            }
            
            console.log(`🎉 驚喜發現: ${experiment.surpriseReason}`);
            
            // 更新驚喜日誌UI
            this.updateSurpriseLog(experiment);
            
            // 觸發驚喜發現事件
            const surpriseEvent = new CustomEvent('surpriseDiscovered', {
                detail: { experiment }
            });
            document.dispatchEvent(surpriseEvent);
        }
        
        // 更新統計並保存
        this.updateStats();
        this.saveStoredData();
        
        return experiment;
    }
    
    // 獲取品質等級
    getQualityGrade(qualityScore) {
        if (qualityScore >= 0.9) return 'S';
        if (qualityScore >= 0.8) return 'A';
        if (qualityScore >= 0.7) return 'B';
        if (qualityScore >= 0.6) return 'C';
        if (qualityScore >= 0.5) return 'D';
        return 'F';
    }
    
    // 計算品質分數
    calculateQualityScore(data) {
        const weights = this.qualityModel.weights;
        let score = 0;
        
        // 複雜度評分 (0-1)
        const complexity = Math.min(data.complexity / 100, 1);
        score += complexity * weights.complexity;
        
        // 色彩和諧度評分
        const colorHarmony = this.evaluateColorHarmony(data.dna);
        score += colorHarmony * weights.colorHarmony;
        
        // 運動流暢度評分
        const motionFlow = this.evaluateMotionFlow(data.dna);
        score += motionFlow * weights.motionFlow;
        
        // 視覺平衡評分
        const visualBalance = this.evaluateVisualBalance(data.dna);
        score += visualBalance * weights.visualBalance;
        
        // 獨特性評分
        const uniqueness = this.evaluateUniqueness(data.dna);
        score += uniqueness * weights.uniqueness;
        
        return Math.min(Math.max(score, 0), 1);
    }
    
    // 評估色彩和諧度
    evaluateColorHarmony(dna) {
        if (!dna || !dna.genes.colorGenes) return 0.5;
        
        const colors = dna.genes.colorGenes;
        const primary = colors.primary;
        const secondary = colors.secondary;
        
        // 色彩距離分析
        const colorDistance = Math.sqrt(
            Math.pow(primary.r - secondary.r, 2) +
            Math.pow(primary.g - secondary.g, 2) +
            Math.pow(primary.b - secondary.b, 2)
        );
        
        // 飽和度和亮度評分
        const saturationScore = Math.min(colors.saturation, 1);
        const brightnessScore = Math.min(colors.brightness, 1);
        
        // 和諧度計算
        const harmonyScore = (colorDistance / 441) * 0.5 + saturationScore * 0.3 + brightnessScore * 0.2;
        
        return Math.min(Math.max(harmonyScore, 0), 1);
    }
    
    // 評估運動流暢度
    evaluateMotionFlow(dna) {
        if (!dna || !dna.genes.motionGenes) return 0.5;
        
        const motion = dna.genes.motionGenes;
        
        // 速度平衡性
        const speedBalance = Math.min(motion.speed / 200, 1);
        
        // 軌跡複雜度
        const trajectoryScore = {
            'straight': 0.3,
            'wave': 0.7,
            'spiral': 0.8,
            'orbit': 0.6,
            'chaos': 0.9
        }[motion.trajectory] || 0.5;
        
        // 物理真實性
        const physicsScore = (motion.hasGravity ? 0.3 : 0) + (motion.hasBounce ? 0.2 : 0);
        
        return (speedBalance + trajectoryScore + physicsScore) / 3;
    }
    
    // 評估視覺平衡
    evaluateVisualBalance(dna) {
        if (!dna || !dna.genes.shapeGenes) return 0.5;
        
        const shape = dna.genes.shapeGenes;
        const fx = dna.genes.fxGenes;
        
        // 形狀複雜度
        const shapeComplexity = Math.min(shape.complexity / 10, 1);
        
        // 對稱性
        const symmetryScore = Math.min(shape.symmetry / 8, 1);
        
        // 特效平衡
        const effectBalance = (fx.hasGlow ? 0.2 : 0) + (fx.hasBlur ? 0.1 : 0) + (fx.hasDistortion ? 0.1 : 0);
        
        return (shapeComplexity + symmetryScore + effectBalance) / 3;
    }
    
    // 評估獨特性
    evaluateUniqueness(dna) {
        if (!dna) return 0.5;
        
        const sequence = dna.getSequenceString ? dna.getSequenceString() : dna.sequenceString || '';
        
        // 檢查是否與已有實驗重複
        const similar = this.experiments.filter(exp => 
            exp.dna && this.calculateSequenceSimilarity(exp.dna.getSequenceString ? exp.dna.getSequenceString() : exp.dna.sequenceString || '', sequence) > 0.8
        );
        
        // 獨特性分數
        const uniquenessScore = Math.max(0, 1 - (similar.length / Math.max(this.experiments.length, 1)));
        
        // 混沌度加成
        const chaosBonus = dna.genes.chaosGenes.chaosLevel * 0.3;
        
        return Math.min(uniquenessScore + chaosBonus, 1);
    }
    
    // 計算序列相似度
    calculateSequenceSimilarity(seq1, seq2) {
        if (!seq1 || !seq2) return 0;
        
        const len1 = seq1.length;
        const len2 = seq2.length;
        const matrix = [];
        
        // 編輯距離算法
        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                if (seq1.charAt(i - 1) === seq2.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        const distance = matrix[len1][len2];
        return 1 - (distance / Math.max(len1, len2));
    }
    
    // 獲取品質等級
    getQualityGrade(score) {
        const thresholds = this.qualityModel.thresholds;
        
        if (score >= thresholds.excellent) return 'EXCELLENT';
        if (score >= thresholds.good) return 'GOOD';
        if (score >= thresholds.acceptable) return 'ACCEPTABLE';
        if (score >= thresholds.poor) return 'POOR';
        return 'FAILED';
    }
    
    // 驚喜檢測（提高門檻）
    detectSurprise(experiment) {
        let surpriseScore = 0;
        let surpriseReasons = [];
        
        // 品質驚喜（提高門檻從0.8到0.85）
        if (experiment.qualityScore > 0.85) {
            surpriseScore += 0.4;
            surpriseReasons.push('卓越品質');
        }
        
        // 複雜度驚喜（大幅提升才算驚喜）
        if (experiment.complexity > this.stats.topComplexity * 1.2) {
            surpriseScore += 0.3;
            surpriseReasons.push('複雜度突破');
            this.stats.topComplexity = experiment.complexity;
        }
        
        // 獨特性驚喜（提高門檻從0.9到0.95）
        const uniquenessScore = this.evaluateUniqueness(experiment.dna);
        if (uniquenessScore > 0.95) {
            surpriseScore += 0.3;
            surpriseReasons.push('極高獨特性');
        }
        
        // 視覺突破
        if (experiment.dna.genes.chaosGenes.chaosLevel > 0.8 && experiment.qualityScore > 0.6) {
            surpriseScore += 0.15;
            surpriseReasons.push('混沌中的秩序');
        }
        
        // 量子效應驚喜
        if (experiment.dna.genes.chaosGenes.hasQuantumEffects && experiment.qualityScore > 0.7) {
            surpriseScore += 0.1;
            surpriseReasons.push('量子效應成功');
        }
        
        // 判定為驚喜（提高門檻從0.5到0.7）
        if (surpriseScore > 0.7) {
            experiment.isSurprise = true;
            experiment.surpriseScore = surpriseScore;
            experiment.surpriseReason = surpriseReasons.join(', ');
        }
    }
    
    // 記錄驚喜
    logSurprise(experiment) {
        console.log(`🎉 發現驚喜！${experiment.surpriseReason} (分數: ${experiment.surpriseScore.toFixed(2)})`);
        
        // 更新驚喜日誌UI
        this.updateSurpriseLog(experiment);
        
        // 更新統計
        this.stats.surpriseRate = (this.surprises.length / this.stats.totalExperiments) * 100;
        
        // 觸發驚喜事件
        const event = new CustomEvent('surpriseDiscovered', {
            detail: { experiment: experiment }
        });
        document.dispatchEvent(event);
    }
    
    // 記錄用戶情感反應
    recordEmotion(emotion) {
        const current = this.feedbackCollection.emotions.get(emotion) || 0;
        this.feedbackCollection.emotions.set(emotion, current + 1);
        
        // 更新當前實驗的反饋
        if (this.experiments.length > 0) {
            const lastExperiment = this.experiments[this.experiments.length - 1];
            lastExperiment.userFeedback.emotions.push({
                emotion: emotion,
                timestamp: Date.now()
            });
        }
        
        console.log(`😊 情感反饋: ${emotion}`);
    }
    
    // 記錄標籤
    recordTag(tagName) {
        const current = this.feedbackCollection.tags.get(tagName) || 0;
        this.feedbackCollection.tags.set(tagName, current + 1);
        
        if (this.experiments.length > 0) {
            const lastExperiment = this.experiments[this.experiments.length - 1];
            lastExperiment.userFeedback.tags.push(tagName);
        }
        
        console.log(`🏷️ 標籤記錄: ${tagName}`);
    }
    
    // 記錄評分
    recordRating(rating) {
        this.feedbackCollection.ratings.push(rating);
        
        if (this.experiments.length > 0) {
            const lastExperiment = this.experiments[this.experiments.length - 1];
            lastExperiment.userFeedback.rating = rating;
        }
        
        this.updateAverageRating();
        console.log(`⭐ 評分記錄: ${rating}`);
    }
    
    // 記錄使用意願
    recordIntention(intention, value) {
        this.feedbackCollection.intentions.set(intention, value);
        
        if (this.experiments.length > 0) {
            const lastExperiment = this.experiments[this.experiments.length - 1];
            lastExperiment.userFeedback.intentions[intention] = value;
        }
        
        console.log(`🎯 使用意願: ${intention} = ${value}`);
    }
    
    // 更新平均評分
    updateAverageRating() {
        const ratings = this.feedbackCollection.ratings;
        if (ratings.length > 0) {
            this.stats.averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        }
    }
    
    // 更新統計
    updateStats() {
        // 成功率計算
        const successfulExperiments = this.experiments.filter(exp => exp.qualityScore > 0.4).length;
        this.stats.successfulExperiments = successfulExperiments;
        
        // 更新UI統計
        this.updateStatsUI();
    }
    
    // 更新統計UI
    updateStatsUI() {
        const stats = this.stats;
        
        // 更新實驗計數（如果元素存在）
        const experimentCountElement = document.getElementById('experimentCount');
        if (experimentCountElement) {
            experimentCountElement.textContent = stats.totalExperiments;
        }
        
        const surpriseCountElement = document.getElementById('surpriseCount');
        if (surpriseCountElement) {
            surpriseCountElement.textContent = this.surprises.length;
        }
        
        const totalExperimentsElement = document.getElementById('totalExperiments');
        if (totalExperimentsElement) {
            totalExperimentsElement.textContent = stats.totalExperiments;
        }
        
        // 更新成功率（如果元素存在）
        const successRateElement = document.getElementById('successRate');
        if (successRateElement) {
            const successRate = stats.totalExperiments > 0 
                ? ((stats.successfulExperiments / stats.totalExperiments) * 100).toFixed(1)
                : '0';
            successRateElement.textContent = `${successRate}%`;
        }
        
        // 更新最高複雜度（如果元素存在）
        const maxComplexityElement = document.getElementById('maxComplexity');
        if (maxComplexityElement) {
            maxComplexityElement.textContent = 
                stats.topComplexity > 0 ? stats.topComplexity.toString() : '--';
        }
    }
    
    // 更新實驗歷史
    updateExperimentHistory() {
        const historyContainer = document.getElementById('experimentHistory');
        if (!historyContainer) return;
        
        const recentExperiments = this.experiments.slice(-5).reverse();
        
        if (recentExperiments.length === 0) {
            historyContainer.innerHTML = '<div class="history-placeholder">開始你的第一個實驗！</div>';
            return;
        }
        
        const historyHTML = recentExperiments.map(exp => `
            <div class="history-item ${exp.isSurprise ? 'surprise' : ''}" data-id="${exp.id}">
                <div class="history-header">
                    <span class="history-time">${this.formatTime(exp.timestamp)}</span>
                    <span class="history-grade grade-${exp.qualityGrade.toLowerCase()}">${exp.qualityGrade}</span>
                    ${exp.isSurprise ? '<span class="surprise-badge">🎉</span>' : ''}
                </div>
                <div class="history-details">
                    <div class="history-score">品質: ${(exp.qualityScore * 100).toFixed(0)}%</div>
                    <div class="history-complexity">複雜度: ${exp.complexity}</div>
                    <div class="history-sequence">${exp.dna ? (exp.dna.getSequenceString ? exp.dna.getSequenceString() : exp.dna.sequenceString || 'N/A') : 'N/A'}</div>
                </div>
            </div>
        `).join('');
        
        historyContainer.innerHTML = historyHTML;
    }
    
    // 更新驚喜日誌
    updateSurpriseLog(experiment) {
        const logContainer = document.getElementById('surpriseLog');
        if (!logContainer) return;
        
        if (this.surprises.length === 0) {
            logContainer.innerHTML = '<div class="log-placeholder">尚無驚喜發現...</div>';
            return;
        }
        
        const logHTML = this.surprises.slice(-this.maxSurpriseSize).reverse().map((exp, index) => `
            <div class="surprise-item" data-experiment-id="${exp.id}" style="cursor: pointer;" title="點擊回放此驚喜實驗">
                <div class="surprise-header">
                    <span class="surprise-time">${this.formatTime(exp.timestamp)}</span>
                    <span class="surprise-score">${(exp.surpriseScore * 100).toFixed(0)}%</span>
                </div>
                <div class="surprise-reason">${exp.surpriseReason}</div>
                <div class="surprise-sequence">${exp.dna ? (exp.dna.getSequenceString ? exp.dna.getSequenceString() : exp.dna.sequenceString || 'N/A') : 'N/A'}</div>
            </div>
        `).join('');
        
        logContainer.innerHTML = logHTML;
        
        // 為每個驚喜項目添加點擊事件
        logContainer.querySelectorAll('.surprise-item').forEach((item, index) => {
            const exp = this.surprises.slice(-3).reverse()[index];
            
            item.addEventListener('click', () => {
                this.replaySurpriseExperiment(exp);
            });
            
            // 添加懸停效果
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = '';
            });
        });
    }
    
    // 格式化時間
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('zh-TW', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    // 按鈕高亮效果
    highlightButton(button) {
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 500);
    }
    
    // 切換標籤狀態
    toggleTag(tag) {
        tag.classList.toggle('selected');
    }
    
    // 更新星星顯示
    updateStarDisplay(rating) {
        const stars = document.querySelectorAll('.star');
        const description = document.getElementById('ratingDescription');
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
        
        const descriptions = ['', '很差', '不好', '還行', '不錯', '很好'];
        description.textContent = descriptions[rating] || '點擊星星進行評分';
    }
    
    // 生成實驗ID
    generateExperimentId() {
        return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // 記錄突變
    logMutation(mutationData) {
        console.log('🧬 記錄突變:', mutationData);
        
        // 更新突變計數
        const mutationCount = document.getElementById('mutationCount');
        if (mutationCount) {
            const current = parseInt(mutationCount.textContent) || 0;
            mutationCount.textContent = current + 1;
        }
    }
    
    // 導出當前實驗的法術DNA數據
    exportData() {
        // 檢查是否有當前實驗
        if (!window.dnaLab || !window.dnaLab.currentDNA) {
            alert('請先進行一個實驗再導出法術DNA');
            return;
        }
        
        const dnaLab = window.dnaLab;
        const currentDNA = dnaLab.currentDNA;
        
        // 生成人類可讀的法術描述
        const spellDescription = this.generateSpellDescription(currentDNA);
        
        const spellData = {
            spellProfile: {
                id: `spell_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                name: spellDescription.name,
                description: spellDescription.description,
                visualDescription: spellDescription.visual,
                exportDate: new Date().toISOString()
            },
            dnaComponents: {
                element: {
                    primary: currentDNA.genes.elementalGenes?.primaryElement || 'neutral',
                    secondary: currentDNA.genes.elementalGenes?.secondaryElement || 'none',
                    intensity: currentDNA.genes.elementalGenes?.elementalIntensity || 0.5,
                    purity: currentDNA.genes.elementalGenes?.elementalPurity || 0.5,
                    colors: {
                        primary: currentDNA.genes.elementalGenes?.primaryColor || {r: 100, g: 100, b: 255},
                        secondary: currentDNA.genes.elementalGenes?.secondaryColor || {r: 150, g: 150, b: 150},
                        accent: currentDNA.genes.elementalGenes?.accentColor || {r: 200, g: 200, b: 200}
                    }
                },
                motion: {
                    pattern: currentDNA.genes.motionGenes?.trajectory || 'straight',
                    speed: currentDNA.genes.motionGenes?.speed || 100,
                    acceleration: currentDNA.genes.motionGenes?.acceleration || 0,
                    hasGravity: currentDNA.genes.motionGenes?.hasGravity || false,
                    hasBounce: currentDNA.genes.motionGenes?.hasBounce || false,
                    spin: currentDNA.genes.motionGenes?.spin || 0
                },
                particles: {
                    count: currentDNA.genes.particleGenes?.count || 10,
                    size: currentDNA.genes.particleGenes?.size || 'medium',
                    hasTrail: currentDNA.genes.particleGenes?.hasTrail || false,
                    hasExplosion: currentDNA.genes.particleGenes?.hasExplosion || false,
                    lifespan: currentDNA.genes.particleGenes?.lifespan || 1.0,
                    isElectric: currentDNA.genes.particleGenes?.isElectric || false
                },
                effects: {
                    glow: {
                        enabled: currentDNA.genes.fxGenes?.hasGlow || false,
                        intensity: currentDNA.genes.fxGenes?.glowIntensity || 0.5
                    },
                    blur: {
                        enabled: currentDNA.genes.fxGenes?.hasBlur || false,
                        amount: currentDNA.genes.fxGenes?.blurAmount || 0.3
                    },
                    distortion: {
                        enabled: currentDNA.genes.fxGenes?.hasDistortion || false,
                        amount: currentDNA.genes.fxGenes?.distortionAmount || 0.2
                    },
                    chaos: {
                        level: currentDNA.genes.chaosGenes?.chaosLevel || 0,
                        hasQuantumEffects: currentDNA.genes.chaosGenes?.hasQuantumEffects || false,
                        unpredictability: currentDNA.genes.chaosGenes?.unpredictability || 0
                    }
                },
                shape: {
                    complexity: currentDNA.genes.shapeGenes?.complexity || 5,
                    symmetry: currentDNA.genes.shapeGenes?.symmetry || 4,
                    vertices: currentDNA.genes.shapeGenes?.vertices || 6,
                    morphing: currentDNA.genes.shapeGenes?.isMorphing || false
                }
            },
            lifecycle: {
                enabled: true,
                phases: {
                    gathering: {
                        duration: 2000,
                        effects: {
                            elementBasedColors: true,
                            particleSpiral: true,
                            ringCount: Math.min(8, Math.max(3, (currentDNA.genes.particleGenes?.count || 10) / 2)),
                            spiralSpeed: (currentDNA.genes.motionGenes?.speed || 100) * 0.00003
                        }
                    },
                    burst: {
                        duration: 1000,
                        effects: {
                            elementalExpansion: true,
                            waveCount: Math.min(6, Math.max(2, currentDNA.genes.shapeGenes?.complexity || 4)),
                            rayCount: currentDNA.genes.shapeGenes?.symmetry || 8,
                            expansionSpeed: currentDNA.genes.elementalGenes?.primaryElement === 'lightning' ? 0.5 : (currentDNA.genes.elementalGenes?.primaryElement === 'ice' ? 0.2 : 0.3)
                        }
                    },
                    aftermath: {
                        duration: 2000,
                        effects: {
                            elementalAfterGlow: true,
                            floatingParticles: Math.round(((currentDNA.genes.particleGenes?.count || 20) * 1.5)),
                            driftSpeed: (currentDNA.genes.motionGenes?.speed || 100) * 0.000015,
                            ringCount: Math.max(2, Math.min(5, Math.round((currentDNA.genes.chaosGenes?.chaosLevel || 0.3) * 6)))
                        }
                    }
                },
                colorMapping: {
                    primaryElement: currentDNA.genes.elementalGenes?.primaryElement || 'neutral',
                    primaryColor: currentDNA.genes.elementalGenes?.primaryColor || currentDNA.genes.colorGenes?.primary || {r: 255, g: 255, b: 255},
                    elementalVariations: {
                        fire: 'enhanced_red_reduced_green',
                        ice: 'enhanced_blue_base_green',
                        lightning: 'enhanced_yellow_base_blue',
                        shadow: 'darkened_all_enhanced_blue',
                        void: 'darkened_all_enhanced_blue'
                    }
                }
            },
            labSettings: {
                enhancers: dnaLab.elementEnhancers,
                complexity: dnaLab.settings.complexity,
                chaosLevel: dnaLab.settings.chaosLevel,
                mutationRate: dnaLab.settings.mutationRate
            },
            gameplayData: {
                complexity: currentDNA.calculateComplexity ? currentDNA.calculateComplexity() : 50,
                qualityScore: this.calculateQualityScore({dna: currentDNA, complexity: 50}),
                generation: currentDNA.generation || 0,
                estimatedDamage: Math.round(50 + (currentDNA.calculateComplexity ? currentDNA.calculateComplexity() : 50) * 2),
                estimatedRange: Math.round(100 + (currentDNA.genes.motionGenes?.speed || 100)),
                estimatedManaCost: Math.round(20 + (currentDNA.calculateComplexity ? currentDNA.calculateComplexity() : 50) * 0.8)
            },
            technicalData: {
                rawDNA: currentDNA.getSequenceString ? currentDNA.getSequenceString() : 'N/A',
                timestamp: Date.now(),
                // 完整的基因資料用於導入還原
                fullGenes: currentDNA.genes
            }
        };
        
        const blob = new Blob([JSON.stringify(spellData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spell_${spellData.spellProfile.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('📤 法術DNA已導出:', spellData.spellProfile.name);
    }
    
    // 生成法術描述
    generateSpellDescription(dna) {
        const element = dna.genes.elementalGenes?.primaryElement || 'neutral';
        const motion = dna.genes.motionGenes?.trajectory || 'straight';
        const hasParticles = dna.genes.particleGenes?.count > 5;
        const hasGlow = dna.genes.fxGenes?.hasGlow;
        const chaosLevel = dna.genes.chaosGenes?.chaosLevel || 0;
        
        // 生成法術名稱
        const elementNames = {
            'fire': '火焰', 'ice': '冰霜', 'lightning': '閃電', 'shadow': '暗影',
            'light': '光明', 'nature': '自然', 'void': '虛無', 'crystal': '水晶',
            'plasma': '等離子', 'quantum': '量子', 'neutral': '中性'
        };
        
        const motionNames = {
            'straight': '直線', 'wave': '波動', 'spiral': '螺旋', 'orbit': '軌道', 'chaos': '混沌'
        };
        
        const elementName = elementNames[element] || '神秘';
        const motionName = motionNames[motion] || '特殊';
        
        let name = `${elementName}${motionName}`;
        if (hasParticles) name += '爆發';
        if (chaosLevel > 0.7) name += '混沌';
        name += '法術';
        
        // 生成描述
        let description = `一個以${elementName}元素為主的法術，`;
        if (motion === 'straight') {
            description += '以直線軌跡發射';
        } else if (motion === 'spiral') {
            description += '以螺旋軌跡移動';
        } else if (motion === 'wave') {
            description += '以波動軌跡前進';
        } else {
            description += `以${motionName}軌跡移動`;
        }
        
        if (hasParticles) {
            description += '，並產生粒子效果';
        }
        
        if (hasGlow) {
            description += '，具有發光效果';
        }
        
        if (chaosLevel > 0.5) {
            description += '，帶有混沌能量的不可預測性';
        }
        
        description += '。';
        
        // 生成視覺描述
        const primaryColor = dna.genes.elementalGenes?.primaryColor;
        let visual = '';
        
        if (primaryColor) {
            const {r, g, b} = primaryColor;
            if (r > 200 && g < 100) visual += '紅橙色的';
            else if (g > 200 && r < 100) visual += '綠色的';
            else if (b > 200 && r < 150) visual += '藍色的';
            else if (r > 200 && g > 200) visual += '黃色的';
            else if (r > 150 && b > 150) visual += '紫色的';
            else visual += '多彩的';
        } else {
            visual += '發光的';
        }
        
        visual += `${elementName}能量`;
        
        if (motion === 'spiral') {
            visual += '呈螺旋狀旋轉';
        } else if (motion === 'wave') {
            visual += '呈波浪狀起伏';
        } else {
            visual += '快速移動';
        }
        
        if (hasParticles) {
            visual += '，伴隨著能量粒子的飛散';
        }
        
        // 添加生命週期描述
        let lifecycleDesc = '施展過程分為三階段：';
        lifecycleDesc += `能量聚集（${elementName}元素向心渦渦）`;
        lifecycleDesc += ' → ';
        lifecycleDesc += `爆發釋放（多層${elementName}衝擊波）`;
        lifecycleDesc += ' → ';
        lifecycleDesc += `餘波效果（${elementName}粒子慢慢消散）`;
        
        return {
            name: name,
            description: description,
            visual: visual,
            lifecycle: lifecycleDesc
        };
    }
    
    // 清除歷史
    clearHistory() {
        if (confirm('確定要清除所有實驗記錄嗎？此操作無法恢復。')) {
            this.experiments = [];
            this.surprises = [];
            this.stats = {
                totalExperiments: 0,
                successfulExperiments: 0,
                averageRating: 0,
                topComplexity: 0,
                surpriseRate: 0
            };
            
            this.feedbackCollection.emotions.clear();
            this.feedbackCollection.tags.clear();
            this.feedbackCollection.ratings = [];
            this.feedbackCollection.intentions.clear();
            
            this.updateStatsUI();
            this.updateExperimentHistory();
            this.updateSurpriseLog();
            this.saveStoredData();
            
            console.log('🗑️ 歷史記錄已清除');
        }
    }
    
    // 重置實驗室
    resetLab() {
        if (confirm('確定要重置整個實驗室嗎？這將清除所有數據和設定。')) {
            this.clearHistory();
            
            // 重置UI元素
            document.querySelectorAll('.emotion-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tag').forEach(tag => tag.classList.remove('selected'));
            document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
            document.querySelectorAll('.intention-item input').forEach(cb => cb.checked = false);
            
            // 重置滑桿
            document.getElementById('complexitySlider').value = 5;
            document.getElementById('chaosSlider').value = 50;
            document.getElementById('mutationRate').value = 30;
            
            console.log('🔄 實驗室已重置');
        }
    }
    
    // 保存數據到localStorage
    saveStoredData() {
        const data = {
            experiments: this.experiments,
            surprises: this.surprises,
            stats: this.stats,
            feedbackCollection: {
                emotions: Object.fromEntries(this.feedbackCollection.emotions),
                tags: Object.fromEntries(this.feedbackCollection.tags),
                ratings: this.feedbackCollection.ratings,
                intentions: Object.fromEntries(this.feedbackCollection.intentions)
            }
        };
        
        localStorage.setItem('dnaLabData', JSON.stringify(data));
    }
    
    // 從localStorage載入數據
    loadStoredData() {
        try {
            const data = localStorage.getItem('dnaLabData');
            if (data) {
                const parsed = JSON.parse(data);
                
                this.experiments = parsed.experiments || [];
                this.surprises = parsed.surprises || [];
                this.stats = parsed.stats || this.stats;
                
                if (parsed.feedbackCollection) {
                    const fc = parsed.feedbackCollection;
                    this.feedbackCollection.emotions = new Map(Object.entries(fc.emotions || {}));
                    this.feedbackCollection.tags = new Map(Object.entries(fc.tags || {}));
                    this.feedbackCollection.ratings = fc.ratings || [];
                    this.feedbackCollection.intentions = new Map(Object.entries(fc.intentions || {}));
                }
                
                this.updateStatsUI();
                this.updateExperimentHistory();
                this.updateSurpriseLog();
                
                console.log('📂 驚喜記錄器數據已載入');
            }
        } catch (error) {
            console.error('❌ 載入記錄器數據失敗:', error);
            // 清除損壞的數據
            localStorage.removeItem('dnaLabData');
            console.log('🧹 已清除損壞的存儲數據');
        }
    }
    
    // 回放驚喜實驗
    replaySurpriseExperiment(surpriseExperiment) {
        try {
            // 檢查 dnaLab 是否可用
            if (!window.dnaLab) {
                console.error('❌ DNA Lab 實例不可用');
                return;
            }
            
            console.log('🎉 回放驚喜實驗:', surpriseExperiment.surpriseReason);
            
            // 將驚喜實驗數據轉換為歷史項目格式
            const historyEntry = {
                id: surpriseExperiment.id,
                timestamp: surpriseExperiment.timestamp,
                dna: surpriseExperiment.dna,
                type: 'surprise',
                isSurprise: true,
                preview: surpriseExperiment.dna ? (surpriseExperiment.dna.getSequenceString ? surpriseExperiment.dna.getSequenceString() : surpriseExperiment.dna.sequenceString || 'N/A') : 'N/A'
            };
            
            // 調用 dnaLab 的回放功能
            window.dnaLab.replayExperiment(historyEntry);
            
        } catch (error) {
            console.error('❌ 驚喜實驗回放失敗:', error);
        }
    }
    
    // 獲取系統狀態
    getStatus() {
        return {
            totalExperiments: this.experiments.length,
            surpriseCount: this.surprises.length,
            averageQuality: this.experiments.length > 0 
                ? this.experiments.reduce((sum, exp) => sum + exp.qualityScore, 0) / this.experiments.length
                : 0,
            topSurprises: this.surprises.slice(-5).reverse(),
            recentFeedback: {
                emotions: this.feedbackCollection.emotions.size,
                tags: this.feedbackCollection.tags.size,
                ratings: this.feedbackCollection.ratings.length
            }
        };
    }
}

console.log('📊 驚喜記錄器系統載入完成');