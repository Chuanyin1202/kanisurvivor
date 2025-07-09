/**
 * 元素選擇器UI
 * 提供4種元素選擇和等級調整界面
 */
class ElementSelector {
    constructor() {
        this.selectedElements = ['F', 'I']; // 預設選擇火和冰
        this.elementLevels = { F: 1, I: 1, L: 1, A: 1 }; // 各元素等級
        this.previewSpell = null;
        this.isVisible = false;
        
        this.createUI();
        this.setupEventListeners();
        
        console.log('🎨 ElementSelector 初始化完成');
    }
    
    // 創建UI界面
    createUI() {
        // 主容器
        const container = document.createElement('div');
        container.id = 'elementSelector';
        container.className = 'element-selector hidden';
        container.innerHTML = `
            <div class="element-selector-content">
                <div class="selector-header">
                    <h3>⚡ 語式片段合成</h3>
                    <button id="closeSelectorBtn" class="close-btn">×</button>
                </div>
                
                <div class="element-selection">
                    <h4>選擇兩種元素組合</h4>
                    <div class="element-grid">
                        <div class="element-option" data-element="F">
                            <div class="element-icon">🔥</div>
                            <div class="element-name">火焰 (F)</div>
                            <div class="element-level">
                                <label>等級:</label>
                                <input type="range" min="1" max="5" value="1" class="level-slider" data-element="F">
                                <span class="level-display">1</span>
                            </div>
                        </div>
                        
                        <div class="element-option" data-element="I">
                            <div class="element-icon">❄️</div>
                            <div class="element-name">冰霜 (I)</div>
                            <div class="element-level">
                                <label>等級:</label>
                                <input type="range" min="1" max="5" value="1" class="level-slider" data-element="I">
                                <span class="level-display">1</span>
                            </div>
                        </div>
                        
                        <div class="element-option" data-element="L">
                            <div class="element-icon">⚡</div>
                            <div class="element-name">閃電 (L)</div>
                            <div class="element-level">
                                <label>等級:</label>
                                <input type="range" min="1" max="5" value="1" class="level-slider" data-element="L">
                                <span class="level-display">1</span>
                            </div>
                        </div>
                        
                        <div class="element-option" data-element="A">
                            <div class="element-icon">🔮</div>
                            <div class="element-name">奧術 (A)</div>
                            <div class="element-level">
                                <label>等級:</label>
                                <input type="range" min="1" max="5" value="1" class="level-slider" data-element="A">
                                <span class="level-display">1</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="spell-preview">
                    <h4>合成預覽</h4>
                    <div id="spellPreviewContent">
                        <div class="preview-placeholder">選擇兩種元素查看合成結果</div>
                    </div>
                </div>
                
                <div class="selector-actions">
                    <button id="purchaseSpellBtn" class="btn btn-success" disabled>購買語式</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        this.container = container;
        
        // 預設選中火和冰元素
        this.updateElementSelection();
    }
    
    // 設定事件監聽器
    setupEventListeners() {
        // 關閉按鈕
        const closeBtn = document.getElementById('closeSelectorBtn');
        closeBtn.addEventListener('click', () => this.hide());
        
        // 元素選擇
        const elementOptions = document.querySelectorAll('.element-option');
        elementOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const element = option.dataset.element;
                this.toggleElementSelection(element);
            });
        });
        
        // 等級調整
        const levelSliders = document.querySelectorAll('.level-slider');
        levelSliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const element = slider.dataset.element;
                const level = parseInt(e.target.value);
                this.setElementLevel(element, level);
                
                // 更新顯示
                const display = slider.parentNode.querySelector('.level-display');
                display.textContent = level;
                
                // 更新預覽
                this.updatePreview();
            });
        });
        
        // 購買按鈕
        const purchaseBtn = document.getElementById('purchaseSpellBtn');
        purchaseBtn.addEventListener('click', () => this.purchaseSpell());
        
        // ESC 鍵關閉
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }
    
    // 切換元素選擇
    toggleElementSelection(element) {
        const index = this.selectedElements.indexOf(element);
        
        if (index > -1) {
            // 如果已選中，取消選擇（但至少要有一個元素）
            if (this.selectedElements.length > 1) {
                this.selectedElements.splice(index, 1);
            }
        } else {
            // 如果未選中，添加選擇（最多兩個元素）
            if (this.selectedElements.length < 2) {
                this.selectedElements.push(element);
            } else {
                // 替換第一個元素
                this.selectedElements[0] = element;
            }
        }
        
        this.updateElementSelection();
        this.updatePreview();
    }
    
    // 更新元素選擇UI
    updateElementSelection() {
        const options = document.querySelectorAll('.element-option');
        options.forEach(option => {
            const element = option.dataset.element;
            if (this.selectedElements.includes(element)) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    // 設定元素等級
    setElementLevel(element, level) {
        this.elementLevels[element] = Math.max(1, Math.min(5, level));
    }
    
    // 更新法術預覽
    updatePreview() {
        if (!window.spellFusionManager || !spellFusionManager.isLoaded) {
            this.showPreviewError('法術合成系統尚未載入');
            return;
        }
        
        if (this.selectedElements.length !== 2) {
            this.showPreviewPlaceholder('請選擇兩種元素');
            return;
        }
        
        // 獲取當前選中元素的等級
        const levels = {};
        this.selectedElements.forEach(element => {
            levels[element] = this.elementLevels[element];
        });
        
        // 合成法術
        const spell = spellFusionManager.fuseSpell(this.selectedElements, levels);
        
        if (!spell) {
            this.showPreviewError('無法合成該元素組合');
            return;
        }
        
        this.previewSpell = spell;
        this.showSpellPreview(spell);
        
        // 啟用按鈕
        document.getElementById('purchaseSpellBtn').disabled = false;
    }
    
    // 顯示法術預覽
    showSpellPreview(spell) {
        const content = document.getElementById('spellPreviewContent');
        const stats = spell.computedStats;
        
        content.innerHTML = `
            <div class="spell-preview-card">
                <div class="spell-header">
                    <h5>${spell.name}</h5>
                    <div class="spell-cost">💰 ${spell.cost}</div>
                </div>
                <p class="spell-description">${spell.description}</p>
                
                <div class="spell-stats">
                    ${stats.damage ? `<div class="stat-item">傷害: ${stats.damage}</div>` : ''}
                    ${stats.cooldown ? `<div class="stat-item">冷卻: ${stats.cooldown.toFixed(1)}s</div>` : ''}
                    ${stats.aoe ? `<div class="stat-item">範圍: ${stats.aoe}</div>` : ''}
                    ${stats.chain ? `<div class="stat-item">連鎖: ${stats.chain}</div>` : ''}
                    ${stats.piercing ? `<div class="stat-item">穿透: ✓</div>` : ''}
                    ${stats.tracking ? `<div class="stat-item">追蹤: ✓</div>` : ''}
                    ${stats.ignite ? `<div class="stat-item">點燃: ✓</div>` : ''}
                    ${stats.slow ? `<div class="stat-item">減速: ${(stats.slow * 100).toFixed(0)}%</div>` : ''}
                    ${stats.stun ? `<div class="stat-item">眩暈: ✓</div>` : ''}
                </div>
                
                <div class="element-combo">
                    元素組合: ${this.selectedElements.map(e => this.getElementName(e)).join(' + ')}
                    (等級: ${this.selectedElements.map(e => this.elementLevels[e]).join(' + ')})
                </div>
            </div>
        `;
    }
    
    // 顯示預覽佔位符
    showPreviewPlaceholder(message) {
        const content = document.getElementById('spellPreviewContent');
        content.innerHTML = `<div class="preview-placeholder">${message}</div>`;
        
        // 禁用按鈕
        document.getElementById('purchaseSpellBtn').disabled = true;
    }
    
    // 顯示預覽錯誤
    showPreviewError(message) {
        const content = document.getElementById('spellPreviewContent');
        content.innerHTML = `<div class="preview-error">❌ ${message}</div>`;
        
        // 禁用按鈕
        document.getElementById('purchaseSpellBtn').disabled = true;
    }
    
    // 獲取元素名稱
    getElementName(element) {
        const names = {
            'F': '火焰',
            'I': '冰霜', 
            'L': '閃電',
            'A': '奧術'
        };
        return names[element] || element;
    }
    
    // 購買法術
    purchaseSpell() {
        if (!this.previewSpell) return;
        
        // 檢查玩家金幣
        const playerGold = window.gameData ? gameData.getGold() : 0;
        
        if (playerGold < this.previewSpell.cost) {
            alert(`金幣不足！需要 ${this.previewSpell.cost} 金幣，目前擁有 ${playerGold} 金幣。`);
            return;
        }
        
        // 隱藏元素選擇器
        this.hide();
        
        // 顯示槽位選擇器
        if (window.slotSelector) {
            slotSelector.show(this.previewSpell, (slotIndex) => {
                this.confirmPurchaseAndEquip(slotIndex);
            });
        } else {
            console.error('❌ 槽位選擇器未載入');
            alert('❌ 槽位選擇器未載入！');
        }
    }
    
    // 確認購買並裝備到槽位
    confirmPurchaseAndEquip(slotIndex) {
        if (!this.previewSpell) return;
        
        const playerGold = window.gameData ? gameData.getGold() : 0;
        
        // 購買法術
        const success = spellFusionManager.purchaseSpell(this.previewSpell, playerGold);
        
        if (success) {
            // 扣除金幣
            if (window.gameData) {
                gameData.addGold(-this.previewSpell.cost);
            }
            
            // 裝備到指定槽位
            if (window.player && player.equipSpellToSlot) {
                player.equipSpellToSlot(slotIndex, this.previewSpell);
            }
            
            // 保存進度
            spellFusionManager.saveProgress();
            
            alert(`✅ 成功購買法術: ${this.previewSpell.name}！已裝備到槽位 ${slotIndex + 1}`);
            
            // 觸發購買事件
            const event = new CustomEvent('spellPurchased', { 
                detail: { spell: this.previewSpell, slotIndex: slotIndex } 
            });
            document.dispatchEvent(event);
            
        } else {
            alert('❌ 購買失敗！可能已經擁有相同法術。');
        }
        
        // 清理預覽法術
        this.previewSpell = null;
    }
    
    // 顯示選擇器
    show() {
        this.container.classList.remove('hidden');
        this.isVisible = true;
        this.updatePreview();
        
        // 暫停遊戲
        if (window.game && game.isRunning) {
            game.pauseGame();
        }
        
        console.log('🎨 元素選擇器已顯示');
    }
    
    // 隱藏選擇器
    hide() {
        this.container.classList.add('hidden');
        this.isVisible = false;
        
        // 恢復遊戲
        if (window.game && game.isPaused) {
            game.resumeGame();
        }
        
        console.log('🎨 元素選擇器已隱藏');
    }
    
    // 切換顯示/隱藏
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// 創建全域實例
const elementSelector = new ElementSelector();
window.elementSelector = elementSelector;