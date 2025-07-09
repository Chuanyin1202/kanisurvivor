/**
 * 槽位選擇器
 * 購買法術時選擇要裝備的槽位
 */
class SlotSelector {
    constructor() {
        this.isVisible = false;
        this.currentSpell = null;
        this.onSlotSelected = null; // 回調函數
        
        this.createUI();
        this.setupEventListeners();
        
        console.log('🎯 SlotSelector 初始化完成');
    }
    
    // 創建UI界面
    createUI() {
        const container = document.createElement('div');
        container.id = 'slotSelector';
        container.className = 'slot-selector hidden';
        
        container.innerHTML = `
            <div class="slot-selector-content">
                <div class="selector-header">
                    <h3>⚔️ 選擇法術槽位</h3>
                    <button id="closeSlotSelectorBtn" class="close-btn">×</button>
                </div>
                
                <div class="spell-info">
                    <div class="spell-preview-mini">
                        <div id="slotSpellIcon" class="spell-icon">🔮</div>
                        <div>
                            <h4 id="slotSpellName">法術名稱</h4>
                            <p id="slotSpellDescription">法術描述</p>
                        </div>
                    </div>
                </div>
                
                <div class="slot-grid">
                    <h4>選擇要替換的槽位：</h4>
                    <div class="slots-container">
                        <div class="slot-option" data-slot="0">
                            <div class="slot-number">1</div>
                            <div class="slot-info">
                                <div class="current-spell">
                                    <div id="slot0Icon" class="spell-icon">🔥</div>
                                    <div id="slot0Name" class="spell-name">火球術</div>
                                </div>
                            </div>
                            <div class="slot-key">按鍵: 1</div>
                        </div>
                        
                        <div class="slot-option" data-slot="1">
                            <div class="slot-number">2</div>
                            <div class="slot-info">
                                <div class="current-spell">
                                    <div id="slot1Icon" class="spell-icon">❄️</div>
                                    <div id="slot1Name" class="spell-name">冰霜箭</div>
                                </div>
                            </div>
                            <div class="slot-key">按鍵: 2</div>
                        </div>
                        
                        <div class="slot-option" data-slot="2">
                            <div class="slot-number">3</div>
                            <div class="slot-info">
                                <div class="current-spell">
                                    <div id="slot2Icon" class="spell-icon">⚡</div>
                                    <div id="slot2Name" class="spell-name">閃電</div>
                                </div>
                            </div>
                            <div class="slot-key">按鍵: 3</div>
                        </div>
                        
                        <div class="slot-option" data-slot="3">
                            <div class="slot-number">4</div>
                            <div class="slot-info">
                                <div class="current-spell">
                                    <div id="slot3Icon" class="spell-icon">🔮</div>
                                    <div id="slot3Name" class="spell-name">奧術飛彈</div>
                                </div>
                            </div>
                            <div class="slot-key">按鍵: 4</div>
                        </div>
                    </div>
                </div>
                
                <div class="selector-actions">
                    <button id="cancelSlotBtn" class="btn btn-secondary">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        this.container = container;
    }
    
    // 設定事件監聽器
    setupEventListeners() {
        // 關閉按鈕
        const closeBtn = document.getElementById('closeSlotSelectorBtn');
        closeBtn.addEventListener('click', () => this.hide());
        
        // 取消按鈕
        const cancelBtn = document.getElementById('cancelSlotBtn');
        cancelBtn.addEventListener('click', () => this.hide());
        
        // 槽位選擇
        const slotOptions = document.querySelectorAll('.slot-option');
        slotOptions.forEach(option => {
            option.addEventListener('click', () => {
                const slotIndex = parseInt(option.dataset.slot);
                this.selectSlot(slotIndex);
            });
        });
        
        // ESC 鍵關閉
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
        
        // 數字鍵 1-4 選擇槽位
        document.addEventListener('keydown', (e) => {
            if (this.isVisible && ['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
                const slotIndex = parseInt(e.code.replace('Digit', '')) - 1;
                this.selectSlot(slotIndex);
            }
        });
    }
    
    // 更新當前槽位顯示
    updateSlotDisplay() {
        if (!window.player) return;
        
        const spellSlots = player.getSpellSlots ? player.getSpellSlots() : [
            { type: 'fireball', name: '熱量分解式', icon: '🔥' },
            { type: 'frostbolt', name: '凍結構造式', icon: '❄️' },
            { type: 'lightning', name: '電磁脈動式', icon: '⚡' },
            { type: 'arcane', name: '虛空追跡式', icon: '🔮' }
        ];
        
        spellSlots.forEach((spell, index) => {
            const icon = document.getElementById(`slot${index}Icon`);
            const name = document.getElementById(`slot${index}Name`);
            
            if (icon && name) {
                icon.textContent = spell.icon || this.getSpellIcon(spell.type);
                name.textContent = spell.name || this.getSpellName(spell.type);
            }
        });
    }
    
    // 獲取法術圖標
    getSpellIcon(spellType) {
        const icons = {
            'fireball': '🔥',
            'frostbolt': '❄️', 
            'lightning': '⚡',
            'arcane': '🔮'
        };
        return icons[spellType] || '✨';
    }
    
    // 獲取語式片段名稱 - 殘響崩壞風格
    getSpellName(spellType) {
        const names = {
            'fireball': '熱量分解式',
            'frostbolt': '凍結構造式',
            'lightning': '電磁脈動式',
            'arcane': '虛空追跡式'
        };
        return names[spellType] || spellType;
    }
    
    // 獲取元素圖標
    getElementIcon(elements) {
        const iconMap = {
            'F': '🔥',
            'I': '❄️',
            'L': '⚡',
            'A': '🔮'
        };
        
        if (elements && elements.length > 0) {
            return elements.map(e => iconMap[e] || '✨').join('');
        }
        return '✨';
    }
    
    // 選擇槽位
    selectSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex > 3) {
            console.warn('⚠️ 無効スロットインデックス - INVALID SLOT INDEX:', slotIndex);
            return;
        }
        
        console.log(`🎯 スロット選択 - SLOT ${slotIndex + 1} SELECTED`);
        
        if (this.onSlotSelected) {
            this.onSlotSelected(slotIndex);
        }
        
        this.hide();
    }
    
    // 顯示槽位選擇器
    show(spell, callback) {
        this.currentSpell = spell;
        this.onSlotSelected = callback;
        
        // 更新法術信息顯示
        if (spell) {
            document.getElementById('slotSpellIcon').textContent = this.getElementIcon(spell.elementCombo);
            document.getElementById('slotSpellName').textContent = spell.name;
            document.getElementById('slotSpellDescription').textContent = spell.description;
        }
        
        // 更新當前槽位顯示
        this.updateSlotDisplay();
        
        this.container.classList.remove('hidden');
        this.isVisible = true;
        
        // 暫停遊戲
        if (window.game && game.isRunning) {
            game.pauseGame();
        }
        
        console.log('🎯 スロットセレクター起動 - SLOT SELECTOR ACTIVE');
    }
    
    // 隱藏槽位選擇器
    hide() {
        this.container.classList.add('hidden');
        this.isVisible = false;
        this.currentSpell = null;
        this.onSlotSelected = null;
        
        // 恢復遊戲
        if (window.game && game.isPaused) {
            game.resumeGame();
        }
        
        console.log('🎯 スロットセレクター停止 - SLOT SELECTOR DEACTIVATED');
    }
}

// 創建全域實例
const slotSelector = new SlotSelector();
window.slotSelector = slotSelector;