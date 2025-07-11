/**
 * DNA實驗室主控器 - 統合所有系統組件
 * 管理用戶界面和系統協調
 */
class DNALab {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particleRenderer = null;
        this.chaosEngine = null;
        this.surpriseLogger = null;
        
        // 實驗室狀態
        this.isInitialized = false;
        this.isExperimentRunning = false;
        this.isViewingMode = false; // 展示模式：實驗完成後觀賞動態效果
        this.isLifecycleMode = false; // 生命週期演示模式
        this.currentExperiment = null;
        this.currentDNA = null;
        
        // 生命週期狀態（簡化版）
        this.lifecycleState = {
            phase: 'idle', // idle, gathering, burst, aftermath
            startTime: 0,
            phaseStartTime: 0
        };
        
        // 實驗歷史
        this.experimentHistory = [];
        this.maxHistorySize = 10;
        
        // 設定參數
        this.settings = {
            complexity: 5,
            chaosLevel: 0.5,
            mutationRate: 0.3,
            autoMode: false,
            experimentDuration: 10000, // 10秒
            debugMode: false // Debug 模式開關
        };
        
        // 元素增強器
        this.elementEnhancers = {
            fire: { level: 1, active: false },
            ice: { level: 1, active: false },
            lightning: { level: 1, active: false },
            chaos: { level: 1, active: false },
            void: { level: 1, active: false },
            quantum: { level: 1, active: false }
        };
        
        // 實驗計時器
        this.experimentTimer = null;
        this.experimentStartTime = 0;
        
        console.log('🔬 DNA實驗室主控器初始化');
    }
    
    // Debug 日誌輔助函數
    debugLog(message, force = false) {
        if (this.settings.debugMode || force) {
            console.log(message);
        }
    }
    
    // 初始化實驗室
    async init() {
        try {
            // 初始化Canvas
            this.initCanvas();
            
            // 初始化子系統
            await this.initSubsystems();
            
            // 設置UI事件
            this.setupUIEvents();
            
            // 載入設定
            this.loadSettings();
            
            // 載入實驗歷史
            this.loadExperimentHistory();
            
            // 初始化UI狀態
            this.updateUI();
            
            // 初始化右邊面板歷史顯示
            this.updateRightPanelHistory();
            
            this.isInitialized = true;
            console.log('✅ DNA實驗室初始化完成');
            
            // 顯示歡迎信息
            this.showWelcomeMessage();
            
            // Debug 測試已移除
            
        } catch (error) {
            console.error('❌ DNA實驗室初始化失敗:', error);
            this.showError('實驗室初始化失敗，請重新載入頁面');
        }
    }
    
    // 初始化Canvas
    initCanvas() {
        this.canvas = document.getElementById('chaosCanvas');
        if (!this.canvas) {
            throw new Error('找不到Canvas元素');
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // 設置Canvas大小
        this.resizeCanvas();
        
        // 監聽視窗大小變化
        window.addEventListener('resize', () => this.resizeCanvas());
        
        console.log('🎨 Canvas初始化完成');
    }
    
    // 調整Canvas大小
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // 設置canvas尺寸
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // 保持1:1像素比例，不做DPI縮放以避免座標問題
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Canvas 調整完成（日誌已簡化）
    }
    
    // 初始化子系統
    async initSubsystems() {
        // 初始化粒子渲染器
        this.particleRenderer = new ParticleRenderer();
        
        // 初始化混沌引擎
        this.chaosEngine = new ChaosEngine(this.canvas, this.particleRenderer);
        
        // 初始化驚喜記錄器
        this.surpriseLogger = new SurpriseLogger();
        
        // 等待所有系統就緒
        await this.waitForSystemsReady();
        
        console.log('🔧 子系統初始化完成');
    }
    
    // 等待系統就緒
    async waitForSystemsReady() {
        return new Promise((resolve) => {
            const checkReady = () => {
                if (this.particleRenderer && this.chaosEngine && this.surpriseLogger) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }
    
    // 設置UI事件
    setupUIEvents() {
        // 主要實驗按鈕
        document.getElementById('randomChaos')?.addEventListener('click', () => {
            this.startRandomExperiment();
        });
        
        document.getElementById('evolveBtn')?.addEventListener('click', () => {
            this.startEvolutionExperiment();
        });
        
        document.getElementById('crossoverBtn')?.addEventListener('click', () => {
            this.startCrossoverExperiment();
        });
        
        document.getElementById('surpriseBtn')?.addEventListener('click', () => {
            this.startSurpriseExperiment();
        });
        
        // 生命週期演示按鈕
        document.getElementById('lifecycleBtn')?.addEventListener('click', () => {
            this.startLifecycleDemo();
        });
        
        // 實驗控制按鈕
        document.getElementById('pauseBtn')?.addEventListener('click', () => {
            this.pauseExperiment();
        });
        
        document.getElementById('resumeBtn')?.addEventListener('click', () => {
            this.resumeExperiment();
        });
        
        document.getElementById('stopBtn')?.addEventListener('click', () => {
            this.stopCurrentExperiment(false);
        });
        
        
        // 歷史記錄按鈕（重新定義為切換右邊面板顯示）
        document.getElementById('historyBtn')?.addEventListener('click', () => {
            const feedbackPanel = document.querySelector('.feedback-panel');
            if (feedbackPanel) {
                feedbackPanel.style.display = feedbackPanel.style.display === 'none' ? 'block' : 'none';
            }
            this.updateRightPanelHistory();
        });
        
        // 設定滑桿
        document.getElementById('complexitySlider')?.addEventListener('input', (e) => {
            this.settings.complexity = parseInt(e.target.value);
            document.getElementById('complexityValue').textContent = e.target.value;
        });
        
        document.getElementById('chaosSlider')?.addEventListener('input', (e) => {
            this.settings.chaosLevel = parseInt(e.target.value) / 100;
            document.getElementById('chaosSettingDisplay').textContent = e.target.value + '%';
        });
        
        document.getElementById('mutationRate')?.addEventListener('input', (e) => {
            this.settings.mutationRate = parseInt(e.target.value) / 100;
            document.getElementById('mutationValue').textContent = e.target.value + '%';
        });
        
        // 元素增強器
        document.querySelectorAll('.element-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                const element = e.currentTarget.dataset.element;
                this.toggleElementEnhancer(element);
            });
        });
        
        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        // 突變事件監聽
        document.addEventListener('randomMutation', (e) => {
            this.handleRandomMutation(e.detail);
        });
        
        // 驚喜發現事件
        document.addEventListener('surpriseDiscovered', (e) => {
            this.handleSurpriseDiscovered(e.detail);
        });
        
        // 導入功能事件監聽
        document.getElementById('importData')?.addEventListener('click', () => {
            this.showImportDialog();
        });
        
        document.getElementById('importFile')?.addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        
        document.getElementById('importPaste')?.addEventListener('click', () => {
            this.showPasteArea();
        });
        
        document.getElementById('confirmPaste')?.addEventListener('click', () => {
            this.confirmPasteImport();
        });
        
        document.getElementById('cancelPaste')?.addEventListener('click', () => {
            this.hidePasteArea();
        });
        
        document.getElementById('closeImport')?.addEventListener('click', () => {
            this.hideImportDialog();
        });
        
        document.getElementById('fileInput')?.addEventListener('change', (e) => {
            this.handleFileImport(e);
        });
        
        console.log('⚙️ UI事件設置完成');
    }
    
    // 開始隨機實驗
    startRandomExperiment() {
        if (this.isExperimentRunning) {
            this.stopCurrentExperiment();
        }
        
        // 創建隨機DNA
        const dna = new VisualDNA();
        
        // 應用增強器
        this.applyElementEnhancers(dna);
        
        // 應用設定
        this.applySettings(dna);
        
        this.startExperiment(dna, 'random');
    }
    
    // 開始進化實驗
    startEvolutionExperiment() {
        if (!this.currentDNA) {
            this.showMessage('請先進行一次隨機實驗');
            return;
        }
        
        if (this.isExperimentRunning) {
            this.stopCurrentExperiment();
        }
        
        // 突變當前DNA - 使用增強的突變率
        const enhancedMutationRate = Math.max(this.settings.mutationRate, 0.5); // 最低 50% 突變率
        const mutatedDNA = this.currentDNA.mutate(enhancedMutationRate);
        
        console.log(`🔬 進化突變: 原始突變率 ${this.settings.mutationRate}, 增強後 ${enhancedMutationRate}`);
        
        this.startExperiment(mutatedDNA, 'evolution');
    }
    
    // 開始交配實驗
    startCrossoverExperiment() {
        if (!this.currentDNA) {
            this.showMessage('請先進行一次隨機實驗');
            return;
        }
        
        if (this.isExperimentRunning) {
            this.stopCurrentExperiment();
        }
        
        // 創建另一個隨機DNA進行交配
        const partnerDNA = new VisualDNA();
        const childDNA = this.currentDNA.crossover(partnerDNA);
        
        this.startExperiment(childDNA, 'crossover');
    }
    
    // 開始驚喜實驗
    startSurpriseExperiment() {
        if (this.isExperimentRunning) {
            this.stopCurrentExperiment();
        }
        
        // 創建高混沌度DNA
        const dna = new VisualDNA();
        dna.genes.chaosGenes.chaosLevel = 0.8 + Math.random() * 0.2;
        dna.genes.chaosGenes.unpredictability = 0.9 + Math.random() * 0.1;
        dna.genes.chaosGenes.canRandomMutate = true;
        dna.genes.chaosGenes.hasQuantumEffects = true;
        
        this.applyElementEnhancers(dna);
        
        this.startExperiment(dna, 'surprise');
    }
    
    // 開始生命週期演示
    startLifecycleDemo() {
        if (this.isExperimentRunning || this.isViewingMode) {
            this.stopCurrentExperiment();
        }
        
        // 如果沒有當前DNA，創建一個隨機的
        if (!this.currentDNA) {
            this.currentDNA = new VisualDNA();
            this.applyElementEnhancers(this.currentDNA);
            this.applySettings(this.currentDNA);
        }
        
        this.isLifecycleMode = true;
        
        // 簡化生命週期參數 - 不需要位置
        this.lifecycleState = {
            phase: 'gathering',
            startTime: performance.now(),
            phaseStartTime: performance.now()
        };
        
        // 開始生命週期渲染
        this.chaosEngine.startLifecycleRendering(this.currentDNA, this.lifecycleState);
        
        // 設置階段轉換計時器
        this.setupLifecyclePhaseTransitions();
        
        // 更新控制按鈕
        this.updateControlButtons('lifecycle');
        
        console.log('🚀 開始生命週期演示:', this.currentDNA.getSequenceString());
    }
    
    // 設置生命週期階段轉換
    setupLifecyclePhaseTransitions() {
        // 清除現有計時器
        if (this.lifecycleTimer) {
            clearTimeout(this.lifecycleTimer);
        }
        
        // 階段 1: 聚集 (2秒)
        setTimeout(() => {
            if (this.isLifecycleMode && this.lifecycleState.phase === 'gathering') {
                this.transitionToPhase('burst');
            }
        }, 2000);
        
        // 階段 2: 爆發 (1秒)
        setTimeout(() => {
            if (this.isLifecycleMode && this.lifecycleState.phase === 'burst') {
                this.transitionToPhase('aftermath');
            }
        }, 3000);
        
        // 階段 3: 餘波 (2秒)
        this.lifecycleTimer = setTimeout(() => {
            if (this.isLifecycleMode) {
                this.stopCurrentExperiment(false);
                console.log('🎆 生命週期演示完成');
            }
        }, 5000);
    }
    
    // 轉換到下一階段
    transitionToPhase(newPhase) {
        if (!this.isLifecycleMode || !this.lifecycleState) return;
        
        this.lifecycleState.phase = newPhase;
        this.lifecycleState.phaseStartTime = performance.now();
        
        // 更新 chaosEngine 的狀態
        if (this.chaosEngine.lifecycleState) {
            this.chaosEngine.lifecycleState.phase = newPhase;
            this.chaosEngine.lifecycleState.phaseStartTime = performance.now();
        }
        
        console.log(`🔄 生命週期轉換到: ${newPhase}`);
    }
    
    // 生成飛行路徑（從法杖到目標）
    
    // 開始實驗
    startExperiment(dna, type) {
        // 退出展示模式（如果在展示模式中）
        if (this.isViewingMode) {
            this.exitViewingMode();
        }
        
        this.currentDNA = dna;
        this.isExperimentRunning = true;
        this.experimentStartTime = performance.now();
        
        // 創建實驗記錄
        this.currentExperiment = {
            id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: type,
            dna: dna,
            startTime: this.experimentStartTime,
            settings: { ...this.settings },
            enhancers: { ...this.elementEnhancers }
        };
        
        // 更新UI
        this.showExperimentOverlay(true);
        this.updateChaosLevel();
        this.updateCurrentDNA();
        
        // 開始渲染
        this.chaosEngine.startRendering(dna);
        
        // 設置實驗計時器
        this.experimentTimer = setTimeout(() => {
            this.completeExperiment();
        }, this.settings.experimentDuration);
        
        // 更新控制按鈕顯示
        this.updateControlButtons(true);
        
        console.log(`🧪 開始 ${type} 實驗:`, dna.getSequenceString());
    }
    
    // 停止當前實驗
    stopCurrentExperiment(clearCanvas = false) {
        if (!this.isExperimentRunning && !this.isViewingMode && !this.isLifecycleMode) return;
        
        // 停止渲染（可選擇是否清空畫面）
        this.chaosEngine.stopRendering(clearCanvas);
        
        // 重置生命週期模式
        this.chaosEngine.lifecycleMode = false;
        this.chaosEngine.lifecycleState = null;
        this.isLifecycleMode = false;
        
        // 清除計時器
        if (this.experimentTimer) {
            clearTimeout(this.experimentTimer);
            this.experimentTimer = null;
        }
        
        // 清除生命週期計時器
        if (this.lifecycleTimer) {
            clearTimeout(this.lifecycleTimer);
            this.lifecycleTimer = null;
        }
        
        // 重置所有狀態
        this.isExperimentRunning = false;
        this.isViewingMode = false;
        this.isLifecycleMode = false;
        
        // 重置生命週期狀態（簡化版）
        this.lifecycleState = {
            phase: 'idle',
            startTime: 0,
            phaseStartTime: 0
        };
        
        // 隱藏覆蓋層
        this.showExperimentOverlay(false);
        
        // 更新控制按鈕顯示
        this.updateControlButtons(false);
        
        console.log(clearCanvas ? '🛑 實驗已停止並清空畫面' : '⏸️ 實驗已暫停（保留視覺效果）');
    }
    
    // 暫停實驗/展示
    pauseExperiment() {
        if (!this.isExperimentRunning && !this.isViewingMode) return;
        
        this.chaosEngine.stopRendering(false);
        
        // 如果是實驗中，清除計時器
        if (this.isExperimentRunning && this.experimentTimer) {
            clearTimeout(this.experimentTimer);
            this.experimentTimer = null;
        }
        
        // 更新狀態
        if (this.isExperimentRunning) {
            this.isExperimentRunning = false;
            this.updateControlButtons('paused');
            console.log('⏸️ 實驗已暫停');
        } else if (this.isViewingMode) {
            this.isViewingMode = false;
            this.updateControlButtons('paused');
            console.log('⏸️ 展示已暫停');
        }
    }
    
    // 繼續實驗/展示
    resumeExperiment() {
        if ((this.isExperimentRunning || this.isViewingMode) || !this.currentDNA) return;
        
        this.chaosEngine.startRendering(this.currentDNA);
        
        // 判斷恢復到哪種模式
        if (this.currentExperiment && this.currentExperiment.endTime) {
            // 如果實驗已完成，恢復到展示模式
            this.isViewingMode = true;
            this.updateControlButtons('viewing');
            console.log('▶️ 展示已繼續');
        } else {
            // 否則恢復實驗模式
            this.isExperimentRunning = true;
            
            // 重新設置計時器
            this.experimentTimer = setTimeout(() => {
                this.completeExperiment();
            }, this.settings.experimentDuration);
            
            this.updateControlButtons(true);
            console.log('▶️ 實驗已繼續');
        }
    }
    
    // 更新控制按鈕顯示
    updateControlButtons(state) {
        const pauseBtn = document.getElementById('pauseBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        if (state === true) {
            // 實驗運行中
            pauseBtn.style.display = 'flex';
            resumeBtn.style.display = 'none';
            stopBtn.style.display = 'flex';
        } else if (state === 'viewing') {
            // 展示模式：動畫運行，用戶觀賞
            pauseBtn.style.display = 'flex';
            resumeBtn.style.display = 'none';
            stopBtn.style.display = 'flex';
        } else if (state === 'lifecycle') {
            // 生命週期演示模式：只顯示停止按鈕
            pauseBtn.style.display = 'none';
            resumeBtn.style.display = 'none';
            stopBtn.style.display = 'flex';
        } else if (state === 'paused') {
            // 暫停狀態（實驗或展示）
            pauseBtn.style.display = 'none';
            resumeBtn.style.display = 'flex';
            stopBtn.style.display = 'flex';
        } else {
            // 完全停止
            pauseBtn.style.display = 'none';
            resumeBtn.style.display = 'none';
            stopBtn.style.display = 'none';
        }
    }
    
    // 完成實驗
    completeExperiment() {
        if (!this.isExperimentRunning || !this.currentExperiment) return;
        
        const endTime = performance.now();
        const duration = endTime - this.experimentStartTime;
        
        // 收集實驗數據
        const experimentData = {
            ...this.currentExperiment,
            endTime: endTime,
            duration: duration,
            complexity: this.currentDNA.calculateComplexity(),
            chaosLevel: this.settings.chaosLevel,
            fps: this.chaosEngine.currentFPS,
            particleCount: this.particleRenderer.activeParticles,
            renderTime: duration,
            memoryUsage: this.getMemoryUsage()
        };
        
        // 更新當前實驗記錄，標記為已完成
        this.currentExperiment = { ...experimentData };
        
        // 記錄實驗結果
        this.surpriseLogger.logExperiment(experimentData);
        
        // 保存實驗到歷史
        this.saveExperimentToHistory(experimentData);
        
        // 更新右邊面板歷史顯示
        this.updateRightPanelHistory();
        
        // 進入展示模式（保持動畫運行）
        this.enterViewingMode();
        
        // 顯示完成信息
        this.showCompletionMessage(experimentData);
        
        console.log('✅ 實驗完成，進入展示模式:', experimentData.id);
    }
    
    // 進入展示模式
    enterViewingMode() {
        // 更新狀態
        this.isExperimentRunning = false;
        this.isViewingMode = true;
        
        // 清除實驗計時器（但保持動畫運行）
        if (this.experimentTimer) {
            clearTimeout(this.experimentTimer);
            this.experimentTimer = null;
        }
        
        // 隱藏覆蓋層
        this.showExperimentOverlay(false);
        
        // 更新控制按鈕顯示
        this.updateControlButtons('viewing');
        
        console.log('🎭 進入展示模式 - 動畫繼續運行');
    }
    
    // 退出展示模式
    exitViewingMode() {
        this.isViewingMode = false;
        this.updateControlButtons(false);
        console.log('🚪 退出展示模式');
    }
    
    // 保存實驗到歷史
    saveExperimentToHistory(experiment) {
        const historyEntry = {
            id: experiment.id,
            timestamp: Date.now(),
            dna: experiment.dna.serialize(),
            type: experiment.type,
            isSurprise: false,
            preview: experiment.dna.getSequenceString()
        };
        
        // 檢查是否為驚喜發現
        if (experiment.surpriseScore && experiment.surpriseScore > 0.7) {
            historyEntry.isSurprise = true;
        }
        
        this.experimentHistory.unshift(historyEntry);
        
        // 限制歷史大小為 10 次
        if (this.experimentHistory.length > this.maxHistorySize) {
            this.experimentHistory = this.experimentHistory.slice(0, this.maxHistorySize);
        }
        
        // 保存到LocalStorage
        this.saveExperimentHistory();
        
        console.log('📚 實驗已保存到歷史:', historyEntry.id);
    }
    
    // 更新右邊面板歷史顯示
    updateRightPanelHistory() {
        const historyContainer = document.getElementById('experimentHistory');
        if (!historyContainer) return;
        
        // 清空容器
        historyContainer.innerHTML = '';
        
        if (this.experimentHistory.length === 0) {
            historyContainer.innerHTML = '<div class="history-placeholder">開始你的第一個實驗！</div>';
            return;
        }
        
        // 顯示最近的10次實驗
        this.experimentHistory.slice(0, this.maxHistorySize).forEach((entry, index) => {
            const historyItem = this.createSimpleHistoryItem(entry, index);
            historyContainer.appendChild(historyItem);
        });
        
        console.log('📋 右邊面板歷史已更新');
    }
    
    // 創建簡化的歷史項目（移除評分和反應按鈕）
    createSimpleHistoryItem(entry, index) {
        const item = document.createElement('div');
        item.className = `history-item ${entry.isSurprise ? 'surprise' : ''}`;
        
        const date = new Date(entry.timestamp);
        const timeStr = date.toLocaleTimeString('zh-TW', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const typeNames = {
            'random': '隨機',
            'evolution': '進化',
            'crossover': '雜交',
            'surprise': '驚喜',
            'replay': '回放',
            'lifecycle': '生命週期'
        };
        
        item.innerHTML = `
            <div class="history-item-header">
                <span class="history-type">${typeNames[entry.type] || entry.type}</span>
                <span class="history-time">${timeStr}</span>
                ${entry.isSurprise ? '<span class="surprise-badge">🎉</span>' : ''}
            </div>
            <div class="history-preview">${entry.preview.substring(0, 20)}...</div>
        `;
        
        // 設置整個項目可點擊，添加視覺提示
        item.style.cursor = 'pointer';
        item.title = '點擊回放此實驗';
        
        // 為整個項目添加點擊事件監聽器
        item.addEventListener('click', () => {
            this.replayExperiment(entry);
        });
        
        // 添加懸停效果
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = '';
        });
        
        return item;
    }
    
    // 回放實驗
    replayExperiment(historyEntry) {
        try {
            // 停止當前的實驗/展示
            this.stopCurrentExperiment(false);
            
            // 反序列化DNA（加強錯誤處理）
            if (!historyEntry.dna) {
                throw new Error('歷史記錄中沒有DNA數據');
            }
            
            const dna = VisualDNA.deserialize(historyEntry.dna);
            if (!dna) {
                throw new Error('無法反序列化DNA數據');
            }
            
            // 驗證DNA有效性
            if (!dna.genes || !dna.genes.complexGenes) {
                throw new Error('DNA數據不完整');
            }
            
            this.currentDNA = dna;
            this.currentExperiment = {
                id: `replay-${Date.now()}`,
                type: 'replay',
                startTime: Date.now(),
                dna: dna
            };
            
            // 更新UI
            this.updateCurrentDNA();
            
            // 開始渲染
            this.chaosEngine.startRendering(dna);
            
            // 更新狀態
            this.isExperimentRunning = false;
            this.isViewingMode = true;
            
            // 更新控制按鈕
            this.updateControlButtons('viewing');
            
            this.showMessage(`回放實驗: ${historyEntry.preview.substring(0, 15)}...`, 'info');
            console.log('🔄 回放實驗:', historyEntry.id);
            
        } catch (error) {
            console.error('❌ 回放實驗失敗:', error);
            this.showError('回放實驗失敗，請重試');
        }
    }
    
    // 保存實驗歷史到LocalStorage
    saveExperimentHistory() {
        try {
            localStorage.setItem('dnaLabHistory', JSON.stringify(this.experimentHistory));
        } catch (error) {
            console.error('❌ 保存實驗歷史失敗:', error);
        }
    }
    
    // 從LocalStorage載入實驗歷史
    loadExperimentHistory() {
        try {
            const saved = localStorage.getItem('dnaLabHistory');
            if (saved) {
                this.experimentHistory = JSON.parse(saved);
                console.log('📂 實驗歷史已載入:', this.experimentHistory.length, '筆記錄');
                // 載入後立即更新右邊面板顯示
                this.updateRightPanelHistory();
            }
        } catch (error) {
            console.error('❌ 載入實驗歷史失敗:', error);
            this.experimentHistory = [];
        }
    }
    
    // 應用元素增強器
    applyElementEnhancers(dna) {
        Object.entries(this.elementEnhancers).forEach(([element, enhancer]) => {
            if (!enhancer.active) return;
            
            const level = enhancer.level;
            
            switch (element) {
                case 'fire':
                    // 強化火焰效果
                    dna.genes.colorGenes.primary.r = Math.min(255, dna.genes.colorGenes.primary.r + level * 50);
                    dna.genes.colorGenes.secondary.r = Math.min(255, dna.genes.colorGenes.secondary.r + level * 40);
                    dna.genes.fxGenes.hasGlow = true;
                    dna.genes.fxGenes.glowIntensity = Math.min(1, dna.genes.fxGenes.glowIntensity + level * 0.4);
                    dna.genes.elementalGenes.dominantElement = 'fire';
                    break;
                case 'ice':
                    // 強化冰霜效果
                    dna.genes.colorGenes.primary.b = Math.min(255, dna.genes.colorGenes.primary.b + level * 50);
                    dna.genes.colorGenes.secondary.b = Math.min(255, dna.genes.colorGenes.secondary.b + level * 40);
                    dna.genes.motionGenes.speed = Math.max(10, dna.genes.motionGenes.speed - level * 30);
                    dna.genes.elementalGenes.dominantElement = 'ice';
                    break;
                case 'lightning':
                    // 強化閃電效果
                    dna.genes.colorGenes.primary.r = Math.min(255, dna.genes.colorGenes.primary.r + level * 40);
                    dna.genes.colorGenes.primary.g = Math.min(255, dna.genes.colorGenes.primary.g + level * 40);
                    dna.genes.particleGenes.isElectric = true;
                    dna.genes.motionGenes.speed = Math.min(300, dna.genes.motionGenes.speed + level * 50);
                    dna.genes.elementalGenes.dominantElement = 'lightning';
                    break;
                case 'chaos':
                    // 強化混沌效果
                    dna.genes.chaosGenes.chaosLevel = Math.min(1, dna.genes.chaosGenes.chaosLevel + level * 0.2);
                    dna.genes.chaosGenes.canRandomMutate = true;
                    dna.genes.chaosGenes.hasQuantumEffects = true;
                    dna.genes.elementalGenes.dominantElement = 'chaos';
                    break;
                case 'void':
                    // 強化虛空效果
                    dna.genes.colorGenes.primary.r = Math.max(0, dna.genes.colorGenes.primary.r - level * 30);
                    dna.genes.colorGenes.primary.g = Math.max(0, dna.genes.colorGenes.primary.g - level * 30);
                    dna.genes.colorGenes.primary.b = Math.max(0, dna.genes.colorGenes.primary.b - level * 30);
                    dna.genes.elementalGenes.dominantElement = 'shadow';
                    break;
                case 'quantum':
                    // 強化量子效果（性能優化：不同時啟用 distortion）
                    dna.genes.chaosGenes.hasQuantumEffects = true;
                    dna.genes.chaosGenes.quantumCoherence = Math.min(1, level * 0.5);
                    // 移除 distortion 避免性能問題
                    // dna.genes.fxGenes.hasDistortion = true;
                    dna.genes.elementalGenes.dominantElement = 'holy';
                    break;
            }
        });
    }
    
    // 應用設定
    applySettings(dna) {
        // 複雜度設定
        dna.genes.shapeGenes.complexity = Math.min(10, this.settings.complexity);
        dna.genes.particleGenes.count = Math.min(50, this.settings.complexity * 5);
        
        // 混沌度設定
        dna.genes.chaosGenes.chaosLevel = Math.max(dna.genes.chaosGenes.chaosLevel, this.settings.chaosLevel);
        
        // 突變率設定
        dna.genes.evolutionGenes.mutationRate = this.settings.mutationRate;
    }
    
    // 切換元素增強器
    toggleElementEnhancer(element) {
        const enhancer = this.elementEnhancers[element];
        if (!enhancer) return;
        
        enhancer.active = !enhancer.active;
        
        // 更新UI
        const slot = document.querySelector(`[data-element="${element}"]`);
        if (slot) {
            slot.classList.toggle('active', enhancer.active);
            
            // 更新等級顯示
            const levelSpan = slot.querySelector('.element-level span');
            if (levelSpan) {
                levelSpan.textContent = enhancer.level;
            }
        }
        
        console.log(`🧪 元素增強器 ${element}: ${enhancer.active ? '啟用' : '停用'}`);
    }
    
    // 處理鍵盤事件
    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT') return;
        
        switch (e.key) {
            case ' ':
                e.preventDefault();
                this.startRandomExperiment();
                break;
            case 'e':
                this.startEvolutionExperiment();
                break;
            case 'c':
                this.startCrossoverExperiment();
                break;
            case 's':
                this.startSurpriseExperiment();
                break;
            case 'Escape':
                this.stopCurrentExperiment(false); // 保留視覺效果
                break;
        }
    }
    
    
    // 處理隨機突變
    handleRandomMutation(detail) {
        if (!this.isExperimentRunning) return;
        
        console.log('🧬 隨機突變發生！');
        
        // 創建突變效果
        this.createMutationEffect();
        
        // 更新UI
        this.updateChaosLevel();
        this.showMessage('隨機突變發生！', 'success');
    }
    
    // 處理驚喜發現
    handleSurpriseDiscovered(detail) {
        const experiment = detail.experiment;
        
        console.log('🎉 驚喜發現！', experiment.surpriseReason);
        
        // 創建驚喜效果
        this.createSurpriseEffect();
        
        // 顯示驚喜通知
        this.showSurpriseNotification(experiment);
    }
    
    // 創建突變效果
    createMutationEffect() {
        if (this.particleRenderer) {
            this.particleRenderer.createQuantumExplosion(
                this.canvas.width / 2,
                this.canvas.height / 2,
                this.currentDNA.genes.particleGenes
            );
        }
    }
    
    // 創建驚喜效果
    createSurpriseEffect() {
        if (this.particleRenderer) {
            this.particleRenderer.createFirework(
                this.canvas.width / 2,
                this.canvas.height / 2,
                this.currentDNA.genes.particleGenes
            );
        }
    }
    
    // 顯示驚喜通知
    showSurpriseNotification(experiment) {
        const notification = document.createElement('div');
        notification.className = 'surprise-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🎉 驚喜發現！</h3>
                <p>${experiment.surpriseReason}</p>
                <p>品質分數: ${(experiment.surpriseScore * 100).toFixed(0)}%</p>
                <div class="notification-actions">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()">確定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 自動移除
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // 更新混沌等級顯示
    updateChaosLevel() {
        const chaosLevel = this.currentDNA ? this.currentDNA.genes.chaosGenes.chaosLevel : 0;
        const percentage = Math.round(chaosLevel * 100);
        
        const chaosBar = document.getElementById('chaosLevel');
        const chaosValue = document.getElementById('chaosValue');
        
        if (chaosBar) {
            chaosBar.style.width = percentage + '%';
            chaosBar.className = `chaos-bar ${this.getChaosLevelClass(percentage)}`;
        }
        
        if (chaosValue) {
            chaosValue.textContent = percentage + '%';
        }
    }
    
    // 獲取混沌等級樣式類
    getChaosLevelClass(percentage) {
        if (percentage >= 80) return 'extreme';
        if (percentage >= 60) return 'high';
        if (percentage >= 40) return 'medium';
        if (percentage >= 20) return 'low';
        return 'minimal';
    }
    
    // 更新當前DNA顯示
    updateCurrentDNA() {
        const dnaDisplay = document.getElementById('currentDNA');
        if (!dnaDisplay || !this.currentDNA) return;
        
        const sequence = this.currentDNA.getSequenceString();
        const complexity = this.currentDNA.calculateComplexity();
        
        dnaDisplay.innerHTML = `
            <div class="dna-sequence">${sequence}</div>
            <div class="dna-info">
                <div class="dna-generation">第${this.currentDNA.generation}代</div>
                <div class="dna-complexity">複雜度: ${complexity}</div>
            </div>
        `;
    }
    
    // 顯示實驗覆蓋層
    showExperimentOverlay(show) {
        const overlay = document.getElementById('experimentOverlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !show);
        }
    }
    
    // 顯示完成信息
    showCompletionMessage(experimentData) {
        const message = `實驗完成！\n品質分數: ${(experimentData.complexity || 0).toFixed(0)}\n持續時間: ${(experimentData.duration / 1000).toFixed(1)}s`;
        this.showMessage(message, 'success');
    }
    
    // 顯示歡迎信息
    showWelcomeMessage() {
        this.showMessage('歡迎來到視覺DNA實驗室！\n按空白鍵開始你的第一個實驗', 'info');
    }
    
    // 顯示消息
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `lab-message ${type}`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
    
    // 顯示錯誤
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    // 獲取記憶體使用量
    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
    }
    
    // 載入設定
    loadSettings() {
        try {
            const saved = localStorage.getItem('dnaLabSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.settings = { ...this.settings, ...settings };
                
                // 更新UI
                document.getElementById('complexitySlider').value = this.settings.complexity;
                document.getElementById('chaosSlider').value = this.settings.chaosLevel * 100;
                document.getElementById('mutationRate').value = this.settings.mutationRate * 100;
                
                console.log('⚙️ 設定已載入');
            }
        } catch (error) {
            console.error('❌ 載入設定失敗:', error);
        }
    }
    
    // 保存設定
    saveSettings() {
        try {
            localStorage.setItem('dnaLabSettings', JSON.stringify(this.settings));
            console.log('💾 設定已保存');
        } catch (error) {
            console.error('❌ 保存設定失敗:', error);
        }
    }
    
    // 更新UI
    updateUI() {
        // 更新設定顯示
        document.getElementById('complexityValue').textContent = this.settings.complexity;
        document.getElementById('chaosSettingDisplay').textContent = Math.round(this.settings.chaosLevel * 100) + '%';
        document.getElementById('mutationValue').textContent = Math.round(this.settings.mutationRate * 100) + '%';
        
        // 更新狀態顯示
        this.updateChaosLevel();
        this.updateCurrentDNA();
    }
    
    // 獲取系統狀態
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isExperimentRunning: this.isExperimentRunning,
            currentExperiment: this.currentExperiment,
            settings: this.settings,
            elementEnhancers: this.elementEnhancers,
            subsystems: {
                chaosEngine: this.chaosEngine?.getStatus(),
                particleRenderer: this.particleRenderer?.getStatus(),
                surpriseLogger: this.surpriseLogger?.getStatus()
            }
        };
    }
    
    // 銷毀實驗室
    destroy() {
        this.stopCurrentExperiment();
        this.saveSettings();
        
        // 清理事件監聽器
        document.removeEventListener('keydown', this.handleKeyboard);
        window.removeEventListener('resize', this.resizeCanvas);
        
        console.log('🗑️ DNA實驗室已銷毀');
    }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔬 初始化DNA實驗室...');
    
    // 創建全域實驗室實例
    window.dnaLab = new DNALab();
    
    // 初始化實驗室
    await window.dnaLab.init();
    
    console.log('✅ DNA實驗室已就緒');
});

// 導入功能
DNALab.prototype.showImportDialog = function() {
    document.getElementById('importDialog').classList.remove('hidden');
};

DNALab.prototype.hideImportDialog = function() {
    document.getElementById('importDialog').classList.add('hidden');
    this.hidePasteArea();
};

DNALab.prototype.showPasteArea = function() {
    document.getElementById('pasteArea').classList.remove('hidden');
};

DNALab.prototype.hidePasteArea = function() {
    document.getElementById('pasteArea').classList.add('hidden');
    document.getElementById('jsonTextarea').value = '';
};

DNALab.prototype.handleFileImport = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const jsonData = JSON.parse(e.target.result);
            this.importSpellData(jsonData);
            this.hideImportDialog();
        } catch (error) {
            this.showMessage('❌ 檔案格式錯誤：' + error.message);
        }
    };
    reader.readAsText(file);
};

DNALab.prototype.confirmPasteImport = function() {
    const jsonText = document.getElementById('jsonTextarea').value.trim();
    if (!jsonText) {
        this.showMessage('❌ 請輸入 JSON 數據');
        return;
    }
    
    try {
        const jsonData = JSON.parse(jsonText);
        this.importSpellData(jsonData);
        this.hideImportDialog();
    } catch (error) {
        this.showMessage('❌ JSON 格式錯誤：' + error.message);
    }
};

DNALab.prototype.importSpellData = function(spellData) {
    try {
        console.log('📥 開始導入法術數據:', spellData);
        
        // 驗證數據格式
        if (!spellData.dnaComponents) {
            throw new Error('缺少 dnaComponents 數據');
        }
        
        // 創建新的 DNA 物件
        const dna = new VisualDNA();
        
        // 將導入的數據轉換為內部 DNA 格式
        this.convertImportedDataToDNA(dna, spellData);
        
        // 開始實驗
        this.startExperiment(dna, 'imported');
        
        this.showMessage('✅ 法術導入成功！');
        console.log('✅ 法術導入完成');
        
    } catch (error) {
        console.error('❌ 導入失敗:', error);
        this.showMessage('❌ 導入失敗：' + error.message);
    }
};

DNALab.prototype.convertImportedDataToDNA = function(dna, spellData) {
    const components = spellData.dnaComponents;
    
    // 重新生成基因結構
    dna.genes = dna.generateFromChaos();
    
    // 設置基因數據
    if (components.element?.colors) {
        dna.genes.colorGenes.primary = components.element.colors.primary;
        dna.genes.colorGenes.secondary = components.element.colors.secondary;
        dna.genes.colorGenes.accent = components.element.colors.accent;
    }
    
    if (components.element) {
        dna.genes.elementalGenes.primaryElement = components.element.primary;
        dna.genes.elementalGenes.secondaryElement = components.element.secondary;
        dna.genes.elementalGenes.intensity = components.element.intensity;
        dna.genes.elementalGenes.purity = components.element.purity;
    }
    
    if (components.effects) {
        dna.genes.fxGenes.hasGlow = components.effects.glow?.enabled || false;
        dna.genes.fxGenes.glowIntensity = components.effects.glow?.intensity || 0;
        dna.genes.fxGenes.hasBlur = components.effects.blur?.enabled || false;
        dna.genes.fxGenes.blurAmount = components.effects.blur?.amount || 0;
        dna.genes.fxGenes.hasDistortion = components.effects.distortion?.enabled || false;
        dna.genes.fxGenes.distortionIntensity = components.effects.distortion?.amount || 0;
    }
    
    if (components.effects?.chaos) {
        dna.genes.chaosGenes.chaosLevel = components.effects.chaos.level || 0;
        dna.genes.chaosGenes.unpredictability = components.effects.chaos.unpredictability || 0;
        dna.genes.chaosGenes.hasQuantumEffects = components.effects.chaos.hasQuantumEffects || false;
    }
    
    if (components.shape) {
        dna.genes.shapeGenes.complexity = components.shape.complexity || 1;
        dna.genes.shapeGenes.symmetry = components.shape.symmetry || 1;
        dna.genes.shapeGenes.vertices = components.shape.vertices || 6;
        dna.genes.shapeGenes.morphing = components.shape.morphing || false;
    }
    
    // 性能保護：確保不會有問題組合
    if (dna.genes.fxGenes.hasDistortion && dna.genes.chaosGenes.hasQuantumEffects) {
        console.log('⚠️ [導入] 檢測到性能問題組合，自動關閉 Distortion');
        dna.genes.fxGenes.hasDistortion = false;
    }
    
    console.log('🔄 DNA 轉換完成:', dna.getSequenceString());
};

// 頁面卸載前清理
window.addEventListener('beforeunload', () => {
    if (window.dnaLab) {
        window.dnaLab.destroy();
    }
});

console.log('🔬 DNA實驗室主控器載入完成');