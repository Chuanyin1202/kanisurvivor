/**
 * 手機控制系統
 * 提供雙 dpad 控制：左側移動，右側攻擊方向
 */
class MobileControls {
    constructor() {
        this.isEnabled = false;
        this.leftDpad = null;
        this.rightDpad = null;
        
        // 移動控制狀態
        this.moveDirection = { x: 0, y: 0 };
        this.attackDirection = { x: 0, y: 0 };
        
        // 觸控追蹤
        this.activeTouches = new Map();
        
        this.createControls();
        this.detectMobile();
        
        console.log('📱 MobileControls 初始化完成');
    }
    
    // 檢測是否為手機設備
    detectMobile() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                         ('ontouchstart' in window) ||
                         (navigator.maxTouchPoints > 0);
        
        if (isMobile) {
            this.enable();
        } else {
            this.disable();
        }
        
        console.log(`📱 設備檢測: ${isMobile ? '手機' : '桌面'}`);
    }
    
    // 創建控制界面
    createControls() {
        // 創建移動 dpad (左側)
        this.leftDpad = this.createDpad('movepad', 'left');
        this.leftDpad.innerHTML = this.generateDpadHTML('移動');
        
        // 創建攻擊方向 dpad (右側)
        this.rightDpad = this.createDpad('attackpad', 'right');
        this.rightDpad.innerHTML = this.generateDpadHTML('攻擊');
        
        // 創建法術切換器
        this.spellSelector = this.createSpellSelector();
        
        document.body.appendChild(this.leftDpad);
        document.body.appendChild(this.rightDpad);
        document.body.appendChild(this.spellSelector);
        
        this.setupDpadEvents();
        this.setupSpellSelectorEvents();
    }
    
    // 創建單個 dpad
    createDpad(id, side) {
        const dpad = document.createElement('div');
        dpad.id = id;
        dpad.className = `mobile-dpad ${side}`;
        return dpad;
    }
    
    // 生成 360度搖桿 HTML 結構
    generateDpadHTML(label) {
        return `
            <div class="dpad-label">${label}</div>
            <div class="joystick-container">
                <div class="joystick-bg">
                    <div class="joystick-knob"></div>
                </div>
            </div>
        `;
    }
    
    // 創建法術選擇器
    createSpellSelector() {
        const selector = document.createElement('div');
        selector.id = 'spellSelector';
        selector.className = 'mobile-spell-selector';
        
        // 法術數據
        const spells = [
            { type: 'fireball', name: '火球術', icon: '🔥', color: '#ff6348' },
            { type: 'frostbolt', name: '冰霜箭', icon: '❄️', color: '#74b9ff' },
            { type: 'lightning', name: '閃電箭', icon: '⚡', color: '#feca57' },
            { type: 'arcane', name: '奧術飛彈', icon: '🔮', color: '#a55eea' }
        ];
        
        let currentSpellIndex = 0; // 預設選擇火球術
        
        selector.innerHTML = `
            <div class="spell-selector-container">
                <div class="current-spell" id="currentSpell">
                    <div class="spell-icon">${spells[0].icon}</div>
                    <div class="spell-name">${spells[0].name}</div>
                </div>
                <div class="spell-wheel hidden" id="spellWheel">
                    ${spells.map((spell, index) => `
                        <div class="spell-option ${index === 0 ? 'active' : ''}" 
                             data-spell="${spell.type}" 
                             data-index="${index}"
                             style="border-color: ${spell.color}">
                            <div class="spell-icon">${spell.icon}</div>
                            <div class="spell-name">${spell.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        return selector;
    }
    
    // 設置法術選擇器事件
    setupSpellSelectorEvents() {
        if (!this.spellSelector) return;
        
        const currentSpell = this.spellSelector.querySelector('#currentSpell');
        const spellWheel = this.spellSelector.querySelector('#spellWheel');
        const spellOptions = this.spellSelector.querySelectorAll('.spell-option');
        
        let isWheelOpen = false;
        
        // 點擊當前法術開啟/關閉選擇輪盤
        currentSpell.addEventListener('touchstart', (event) => {
            event.preventDefault();
            isWheelOpen = !isWheelOpen;
            
            if (isWheelOpen) {
                spellWheel.classList.remove('hidden');
                currentSpell.classList.add('selecting');
            } else {
                spellWheel.classList.add('hidden');
                currentSpell.classList.remove('selecting');
            }
        });
        
        // 選擇法術選項
        spellOptions.forEach(option => {
            option.addEventListener('touchstart', (event) => {
                event.preventDefault();
                
                const spellType = option.dataset.spell;
                const spellIndex = parseInt(option.dataset.index);
                
                // 更新玩家選中的法術
                if (window.player) {
                    player.selectedSpell = spellType;
                    console.log(`📱 切換法術: ${spellType}`);
                }
                
                // 更新視覺效果
                spellOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // 更新當前法術顯示
                const spellIcon = option.querySelector('.spell-icon').textContent;
                const spellName = option.querySelector('.spell-name').textContent;
                currentSpell.querySelector('.spell-icon').textContent = spellIcon;
                currentSpell.querySelector('.spell-name').textContent = spellName;
                
                // 關閉輪盤
                spellWheel.classList.add('hidden');
                currentSpell.classList.remove('selecting');
                isWheelOpen = false;
            });
        });
        
        // 點擊其他地方關閉輪盤
        document.addEventListener('touchstart', (event) => {
            if (!this.spellSelector.contains(event.target) && isWheelOpen) {
                spellWheel.classList.add('hidden');
                currentSpell.classList.remove('selecting');
                isWheelOpen = false;
            }
        });
    }
    
    // 設置搖桿事件（360度控制）
    setupDpadEvents() {
        this.setupJoystickEvents(this.leftDpad, 'move');
        this.setupJoystickEvents(this.rightDpad, 'attack');
    }
    
    // 設置單個搖桿的事件
    setupJoystickEvents(dpad, type) {
        const container = dpad.querySelector('.joystick-container');
        const bg = dpad.querySelector('.joystick-bg');
        const knob = dpad.querySelector('.joystick-knob');
        
        if (!container || !bg || !knob) return;
        
        let isActive = false;
        let startPos = { x: 0, y: 0 };
        let activeTouch = null; // 記錄當前控制這個搖桿的觸點
        const maxRadius = 45; // 最大移動半徑
        
        // 觸控開始
        const handleStart = (clientX, clientY, touchId = null) => {
            if (isActive) return; // 如果已經有觸點在控制，忽略新的觸點
            
            isActive = true;
            activeTouch = touchId;
            const rect = bg.getBoundingClientRect();
            startPos.x = rect.left + rect.width / 2;
            startPos.y = rect.top + rect.height / 2;
            
            container.classList.add('active');
            dpad.classList.add('active'); // 整個搖桿變為不透明
            this.updateJoystick(clientX, clientY, startPos, knob, maxRadius, type);
        };
        
        // 觸控移動
        const handleMove = (clientX, clientY, touchId = null) => {
            if (!isActive || (activeTouch !== null && activeTouch !== touchId)) return;
            this.updateJoystick(clientX, clientY, startPos, knob, maxRadius, type);
        };
        
        // 觸控結束
        const handleEnd = (touchId = null) => {
            if (!isActive || (activeTouch !== null && activeTouch !== touchId)) return;
            
            isActive = false;
            activeTouch = null;
            
            // 重置搖桿位置
            knob.style.transform = 'translate(-50%, -50%)';
            container.classList.remove('active');
            dpad.classList.remove('active'); // 整個搖桿變回半透明
            
            // 重置方向
            if (type === 'move') {
                this.moveDirection = { x: 0, y: 0 };
            } else if (type === 'attack') {
                this.attackDirection = { x: 0, y: 0 };
            }
        };
        
        // 多點觸控事件處理
        bg.addEventListener('touchstart', (event) => {
            event.preventDefault();
            
            // 尋找在當前搖桿區域內的觸點
            for (let i = 0; i < event.touches.length; i++) {
                const touch = event.touches[i];
                const rect = bg.getBoundingClientRect();
                
                // 檢查觸點是否在搖桿區域內
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    handleStart(touch.clientX, touch.clientY, touch.identifier);
                    break;
                }
            }
        });
        
        bg.addEventListener('touchmove', (event) => {
            event.preventDefault();
            
            // 尋找對應的觸點
            for (let i = 0; i < event.touches.length; i++) {
                const touch = event.touches[i];
                if (touch.identifier === activeTouch) {
                    handleMove(touch.clientX, touch.clientY, touch.identifier);
                    break;
                }
            }
        });
        
        bg.addEventListener('touchend', (event) => {
            event.preventDefault();
            
            // 檢查是否是當前控制的觸點結束了
            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                if (touch.identifier === activeTouch) {
                    handleEnd(touch.identifier);
                    break;
                }
            }
        });
        
        bg.addEventListener('touchcancel', (event) => {
            event.preventDefault();
            
            // 檢查是否是當前控制的觸點被取消了
            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                if (touch.identifier === activeTouch) {
                    handleEnd(touch.identifier);
                    break;
                }
            }
        });
        
        // 滑鼠事件（桌面測試用）
        bg.addEventListener('mousedown', (event) => {
            event.preventDefault();
            handleStart(event.clientX, event.clientY);
            
            const mouseMoveHandler = (e) => {
                handleMove(e.clientX, e.clientY);
            };
            
            const mouseUpHandler = () => {
                handleEnd();
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            };
            
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
    }
    
    // 更新搖桿位置和方向
    updateJoystick(clientX, clientY, startPos, knob, maxRadius, type) {
        const deltaX = clientX - startPos.x;
        const deltaY = clientY - startPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // 限制在最大半徑內
        const clampedDistance = Math.min(distance, maxRadius);
        const angle = Math.atan2(deltaY, deltaX);
        
        const knobX = Math.cos(angle) * clampedDistance;
        const knobY = Math.sin(angle) * clampedDistance;
        
        // 更新搖桿視覺位置
        knob.style.transform = `translate(${knobX - 15}px, ${knobY - 15}px)`;
        
        // 計算標準化方向向量
        const normalizedX = clampedDistance > 10 ? knobX / maxRadius : 0; // 死區設定
        const normalizedY = clampedDistance > 10 ? knobY / maxRadius : 0;
        
        // 更新方向狀態
        if (type === 'move') {
            this.moveDirection = { x: normalizedX, y: normalizedY };
        } else if (type === 'attack') {
            this.attackDirection = { x: normalizedX, y: normalizedY };
        }
        
        // 調試輸出
        if (clampedDistance > 10) {
            console.log(`🎮 ${type}: (${normalizedX.toFixed(2)}, ${normalizedY.toFixed(2)}) 角度: ${(angle * 180 / Math.PI).toFixed(0)}°`);
        }
    }
    
    
    // 啟用手機控制
    enable() {
        this.isEnabled = true;
        if (this.leftDpad) this.leftDpad.classList.remove('hidden');
        if (this.rightDpad) this.rightDpad.classList.remove('hidden');
        console.log('📱 手機控制已啟用');
    }
    
    // 禁用手機控制
    disable() {
        this.isEnabled = false;
        if (this.leftDpad) this.leftDpad.classList.add('hidden');
        if (this.rightDpad) this.rightDpad.classList.add('hidden');
        this.hideSpellSelector(); // 總是隱藏法術選擇器
        console.log('📱 手機控制已禁用');
    }
    
    // 顯示法術選擇器（僅在遊戲中）
    showSpellSelector() {
        if (this.isEnabled && this.spellSelector) {
            this.spellSelector.classList.remove('hidden');
        }
    }
    
    // 隱藏法術選擇器
    hideSpellSelector() {
        if (this.spellSelector) {
            this.spellSelector.classList.add('hidden');
            // 同時關閉選擇輪盤
            const spellWheel = this.spellSelector.querySelector('#spellWheel');
            const currentSpell = this.spellSelector.querySelector('#currentSpell');
            if (spellWheel) spellWheel.classList.add('hidden');
            if (currentSpell) currentSpell.classList.remove('selecting');
        }
    }
    
    // 獲取移動輸入（供 InputManager 使用）
    getMovementInput() {
        if (!this.isEnabled) return { x: 0, y: 0 };
        return new Vector2(this.moveDirection.x, this.moveDirection.y);
    }
    
    // 獲取攻擊方向（供玩家使用）
    getAttackDirection() {
        if (!this.isEnabled) return null;
        if (this.attackDirection.x === 0 && this.attackDirection.y === 0) return null;
        return new Vector2(this.attackDirection.x, this.attackDirection.y);
    }
    
    // 是否正在攻擊
    isAttacking() {
        return this.isEnabled && (this.attackDirection.x !== 0 || this.attackDirection.y !== 0);
    }
    
    // 更新函數（如果需要）
    update(deltaTime) {
        if (!this.isEnabled) return;
        
        // 這裡可以添加一些更新邏輯，比如手勢識別等
    }
    
    // 重置控制狀態
    reset() {
        this.moveDirection = { x: 0, y: 0 };
        this.attackDirection = { x: 0, y: 0 };
        this.activeTouches.clear();
        
        // 移除所有按鈕的 active 狀態
        document.querySelectorAll('.dpad-button.active').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    // 切換顯示/隱藏
    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }
}

// 創建全域手機控制器
const mobileControls = new MobileControls();
window.mobileControls = mobileControls;