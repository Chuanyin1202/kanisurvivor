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
        
        // 詳細的觸控事件追蹤
        this.touchEventLog = [];
        this.maxLogEntries = 50; // 保持最近50個日誌項目
        
        this.createControls();
        this.detectMobile();
        
        // 設置全域觸控事件監測
        this.setupGlobalTouchMonitoring();
        
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
        // 創建動態移動 dpad (隱藏)
        this.leftDpad = this.createDpad('movepad', 'left');
        this.leftDpad.innerHTML = this.generateDpadHTML('移動');
        
        // 創建動態攻擊方向 dpad (隱藏)
        this.rightDpad = this.createDpad('attackpad', 'right');
        this.rightDpad.innerHTML = this.generateDpadHTML('攻擊');
        
        // 創建法術選擇器 (右側垂直佈局)
        this.spellSelector = this.createSpellSelector();
        
        document.body.appendChild(this.leftDpad);
        document.body.appendChild(this.rightDpad);
        document.body.appendChild(this.spellSelector);
        
        this.setupDynamicDpadEvents();
        this.setupSpellSelectorEvents();
    }
    
    // 創建單個 dpad (初始90%透明)
    createDpad(id, side) {
        const dpad = document.createElement('div');
        dpad.id = id;
        dpad.className = `mobile-dpad ${side}`;
        dpad.style.opacity = '0.1'; // 初始90%透明狀態
        dpad.style.pointerEvents = 'none'; // 初始不可點擊
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
    
    // 創建法術選擇器 (右側垂直佈局)
    createSpellSelector() {
        const selector = document.createElement('div');
        selector.id = 'spellSelector';
        selector.className = 'mobile-spell-selector-vertical';
        
        // 獲取玩家法術槽位
        const spells = this.getPlayerSpellSlots();
        
        selector.innerHTML = `
            <div class="spell-buttons-container">
                ${spells.map((spell, index) => `
                    <div class="spell-button ${index === 0 ? 'active' : ''}" 
                         data-slot="${index}"
                         data-spell="${spell.type}">
                        <div class="spell-icon">${spell.icon}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        return selector;
    }
    
    // 獲取玩家法術槽位
    getPlayerSpellSlots() {
        if (window.player && player.getSpellSlots) {
            return player.getSpellSlots();
        }
        
        // 預設語式片段 - 殘響崩壞風格
        return [
            { type: 'fireball', name: '熱量分解式', icon: '🔥' },
            { type: 'frostbolt', name: '凍結構造式', icon: '❄️' },
            { type: 'lightning', name: '電磁脈動式', icon: '⚡' },
            { type: 'arcane', name: '虛空追跡式', icon: '🔮' }
        ];
    }
    
    // 更新法術選擇器顯示（修復重新開始同步問題）
    updateSpellSelector() {
        if (!this.spellSelector) {
            console.warn('⚠️ 法術選擇器不存在，無法更新');
            return;
        }
        
        const spells = this.getPlayerSpellSlots();
        const buttonsContainer = this.spellSelector.querySelector('.spell-buttons-container');
        
        if (!buttonsContainer) {
            console.warn('⚠️ 法術按鈕容器不存在');
            return;
        }
        
        // 獲取當前選中的槽位（確保從玩家狀態獲取最新資訊）
        let currentSlot = 0;
        if (window.player) {
            currentSlot = player.selectedSlot !== undefined ? player.selectedSlot : 0;
            // 確保槽位索引在有效範圍內
            currentSlot = Math.max(0, Math.min(currentSlot, spells.length - 1));
            console.log(`🔍 玩家當前槽位: ${currentSlot}, 法術: ${player.selectedSpell}`);
        }
        
        // 更新按鈕顯示
        buttonsContainer.innerHTML = spells.map((spell, index) => `
            <div class="spell-button ${index === currentSlot ? 'active' : ''}" 
                 data-slot="${index}"
                 data-spell="${spell.type}">
                <div class="spell-icon">${spell.icon}</div>
            </div>
        `).join('');
        
        // 重新綁定事件
        this.bindSpellButtonEvents();
        
        console.log(`📱 法術選擇器已更新，當前槽位: ${currentSlot}, 總槽位數: ${spells.length}`);
    }
    
    // 設置法術選擇器事件 (垂直按鈕)
    setupSpellSelectorEvents() {
        if (!this.spellSelector) return;
        
        // 綁定按鈕事件
        this.bindSpellButtonEvents();
        
        // 監聽法術槽位變化事件
        document.addEventListener('spellSlotChanged', () => {
            this.updateSpellSelector();
        });
        
        document.addEventListener('spellEquipped', () => {
            this.updateSpellSelector();
        });
        
        // 監聽遊戲重新開始事件以同步法術選擇器
        document.addEventListener('gameRestarted', () => {
            console.log('🔄 遊戲重新開始，同步法術選擇器');
            setTimeout(() => this.updateSpellSelector(), 100); // 稍微延遲以確保玩家狀態已更新
        });
        
        // 監聽遊戲狀態變化
        document.addEventListener('gameStateChanged', (event) => {
            if (event.detail && event.detail.newState === 'gamePlay') {
                console.log('🎮 遊戲狀態變更為遊戲中，更新法術選擇器');
                setTimeout(() => this.updateSpellSelector(), 150);
            }
        });
        
        // 監聽系統事件以預防意外的DPAD重置
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('🕵️ 頁面隱藏，但不重置DPAD狀態');
                // 不自動重置DPAD，讓用戶手動控制
            } else {
                console.log('👁️ 頁面顯示');
            }
        });
        
        window.addEventListener('blur', () => {
            console.log('🌫️ 窗口失去焦點，但不重置DPAD狀態');
            // 不自動重置
        });
        
        window.addEventListener('focus', () => {
            console.log('🎆 窗口獲得焦點');
        });
    }
    
    // 綁定法術按鈕事件 (加強事件隔離)
    bindSpellButtonEvents() {
        const spellButtons = this.spellSelector.querySelectorAll('.spell-button');
        
        spellButtons.forEach(button => {
            button.addEventListener('touchstart', (event) => {
                event.preventDefault();
                event.stopPropagation(); // 阻止事件冒泡到DPAD系統
                
                const slotIndex = parseInt(button.dataset.slot);
                
                // 移除所有活動狀態
                spellButtons.forEach(btn => btn.classList.remove('active'));
                
                // 設置當前按鈕為活動狀態
                button.classList.add('active');
                
                // 切換到指定槽位
                if (window.player) {
                    player.switchToSlot(slotIndex);
                    console.log(`📱 切換到槽位 ${slotIndex + 1}`);
                }
            });
            
            // 額外添加其他觸控事件的隔離
            button.addEventListener('touchmove', (event) => {
                event.preventDefault();
                event.stopPropagation(); // 防止干擾DPAD的touchmove
            });
            
            button.addEventListener('touchend', (event) => {
                event.preventDefault();
                event.stopPropagation(); // 防止干擾DPAD的touchend
            });
            
            button.addEventListener('touchcancel', (event) => {
                event.preventDefault();
                event.stopPropagation(); // 防止干擾DPAD的touchcancel
            });
        });
    }
    
    // 設置動態搖桿事件
    setupDynamicDpadEvents() {
        this.setupScreenTouchEvents();
        this.setupJoystickEvents(this.leftDpad, 'move');
        this.setupJoystickEvents(this.rightDpad, 'attack');
    }
    
    // 設置螢幕觸控事件（雙DPAD獨立控制）
    setupScreenTouchEvents() {
        // 雙DPAD獨立狀態管理
        let leftDpadState = {
            active: false,
            touchId: null,
            startPos: { x: 0, y: 0 },
            startTime: 0,
            longPressTimer: null
        };
        
        let rightDpadState = {
            active: false,
            touchId: null,
            startPos: { x: 0, y: 0 },
            startTime: 0,
            longPressTimer: null
        };
        
        const LONG_PRESS_THRESHOLD = 250; // 250ms長按閾值
        const DRAG_THRESHOLD = 8; // 8px拖拉閾值
        
        document.addEventListener('touchstart', (event) => {
            if (!this.isEnabled) return;
            
            // 檢查是否觸碰到法術選擇器
            if (this.spellSelector && this.spellSelector.contains(event.target)) {
                return; // 不處理法術選擇器的觸碰
            }
            
            // 注意：不在 touchstart 中檢查僵死狀態，以避免干擾正在運作的 DPAD
            // this.checkAndCleanupDeadStates(); // 移除此行以避免干擾
            
            // 處理所有新的觸控點（只處理 changedTouches）
            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i]; // 只處理新增的觸控點
                const screenCenter = window.innerWidth / 2;
                const isLeftSide = touch.clientX < screenCenter;
                
                // 選擇對應的DPAD狀態
                const dpadState = isLeftSide ? leftDpadState : rightDpadState;
                const targetDpad = isLeftSide ? this.leftDpad : this.rightDpad;
                
                // 檢查這個 DPAD 是否已經被其他觸控點激活
                if (dpadState.active && dpadState.touchId !== null && dpadState.touchId !== touch.identifier) {
                    // 如果這個 DPAD 已經被其他觸控點激活，忽略這個新的觸控點
                    console.log(`⚠️ ${isLeftSide ? '左' : '右'}DPAD已被觸控點 ${dpadState.touchId} 激活，忽略新觸控點 ${touch.identifier}`);
                    continue; // 跳過這個觸控點，不做任何操作
                }
                
                // 只有當 DPAD 未激活或是相同觸控點時才繼續處理
                if (dpadState.active && dpadState.touchId === touch.identifier) {
                    // 如果是相同觸控點的重新觸摸，重置狀態
                    console.log(`🔄 相同觸控點重新觸摸 ${isLeftSide ? '左' : '右'}DPAD`);
                    this.safeDpadReset(dpadState, targetDpad);
                }
                
                // 初始化觸控狀態
                dpadState.touchId = touch.identifier;
                dpadState.startPos.x = touch.clientX;
                dpadState.startPos.y = touch.clientY;
                dpadState.startTime = Date.now();
                
                // 設置長按計時器
                dpadState.longPressTimer = setTimeout(() => {
                    if (!dpadState.active && dpadState.touchId === touch.identifier) {
                        // 長按觸發：激活對應DPAD
                        this.activateDpadAt(touch.clientX, touch.clientY, isLeftSide);
                        dpadState.active = true;
                    }
                }, LONG_PRESS_THRESHOLD);
                
                console.log(`🎮 處理新觸控點 ${touch.identifier} 在 ${isLeftSide ? '左' : '右'}區域，當前狀態: ${dpadState.active ? '激活' : '未激活'}`);
            }
        });
        
        document.addEventListener('touchmove', (event) => {
            if (!this.isEnabled) return;
            
            // 處理所有觸控點的移動
            for (let i = 0; i < event.touches.length; i++) {
                const touch = event.touches[i];
                
                // 找到對應的DPAD狀態
                let dpadState = null;
                let isLeftSide = false;
                let targetDpad = null;
                
                if (leftDpadState.touchId === touch.identifier) {
                    dpadState = leftDpadState;
                    isLeftSide = true;
                    targetDpad = this.leftDpad;
                } else if (rightDpadState.touchId === touch.identifier) {
                    dpadState = rightDpadState;
                    isLeftSide = false;
                    targetDpad = this.rightDpad;
                }
                
                if (!dpadState) continue;
                
                // 計算移動距離
                const deltaX = touch.clientX - dpadState.startPos.x;
                const deltaY = touch.clientY - dpadState.startPos.y;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                if (!dpadState.active && distance > DRAG_THRESHOLD) {
                    // 拖拉觸發：清除長按計時器並激活DPAD
                    if (dpadState.longPressTimer) {
                        clearTimeout(dpadState.longPressTimer);
                        dpadState.longPressTimer = null;
                    }
                    this.activateDpadAt(dpadState.startPos.x, dpadState.startPos.y, isLeftSide);
                    dpadState.active = true;
                }
                
                // 如果DPAD已激活，更新控制
                if (dpadState.active && targetDpad) {
                    this.updateDpadControl(targetDpad, touch.clientX, touch.clientY);
                }
            }
        });
        
        // 統一的觸控結束處理函數
        const handleTouchEnd = (event, eventType = 'touchend') => {
            if (!this.isEnabled) return;
            
            console.log(`🎮 處理${eventType}事件`);
            
            // 處理所有結束的觸控點
            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                
                // 找到對應的DPAD狀態
                let dpadState = null;
                let targetDpad = null;
                
                if (leftDpadState.touchId === touch.identifier) {
                    dpadState = leftDpadState;
                    targetDpad = this.leftDpad;
                } else if (rightDpadState.touchId === touch.identifier) {
                    dpadState = rightDpadState;
                    targetDpad = this.rightDpad;
                }
                
                if (!dpadState) continue;
                
                // 清除長按計時器
                if (dpadState.longPressTimer) {
                    clearTimeout(dpadState.longPressTimer);
                    dpadState.longPressTimer = null;
                }
                
                // 如果DPAD已激活，停用它
                if (dpadState.active && targetDpad) {
                    this.deactivateDpad(targetDpad);
                    
                    // 重置對應的方向狀態
                    if (targetDpad === this.leftDpad) {
                        this.moveDirection = { x: 0, y: 0 };
                    } else {
                        this.attackDirection = { x: 0, y: 0 };
                    }
                }
                
                // 重置DPAD狀態
                dpadState.active = false;
                dpadState.touchId = null;
                dpadState.startPos = { x: 0, y: 0 };
                dpadState.startTime = 0;
                
                console.log(`🎮 ${targetDpad === this.leftDpad ? '左' : '右'}DPAD已重置`);
            }
        };
        
        // 監聽touchend事件
        document.addEventListener('touchend', (event) => {
            handleTouchEnd(event, 'touchend');
        });
        
        // 監聽touchcancel事件 (重要：處理意外中斷)
        document.addEventListener('touchcancel', (event) => {
            handleTouchEnd(event, 'touchcancel');
        });
        
        // 激活DPAD的函數（支援雙DPAD，修復中心點偏移）
        this.activateDpadAt = (x, y, isLeftSide) => {
            // 選擇對應的DPAD
            const targetDpad = isLeftSide ? this.leftDpad : this.rightDpad;
            const dpadType = isLeftSide ? '移動' : '攻擊';
            
            // 設置DPAD位置（使用最佳位置算法）
            const finalPosition = this.positionDpadAt(targetDpad, x, y);
            
            // 重要：設定真實的中心點為使用者觸摸的位置
            // 這樣可以確保控制跟手指位置一致
            targetDpad.dataset.centerX = x;
            targetDpad.dataset.centerY = y;
            targetDpad.dataset.visualCenterX = finalPosition.centerX; // 視覺中心
            targetDpad.dataset.visualCenterY = finalPosition.centerY; // 視覺中心
            
            // 激活並顯示DPAD
            targetDpad.classList.remove('inactive');
            targetDpad.classList.add('active');
            targetDpad.style.pointerEvents = 'auto';
            targetDpad.style.opacity = '0.1'; // 90%透明，微微可見
            targetDpad.style.visibility = 'visible'; // 完全可見
            
            console.log(`🎮 ${dpadType}DPAD激活: 觸摸(${x}, ${y}) 視覺(${finalPosition.centerX}, ${finalPosition.centerY})`);
        };
        
        // 停用DPAD的函數（立即隱藏）
        this.deactivateDpad = (dpad) => {
            if (!dpad) return;
            
            const dpadType = dpad === this.leftDpad ? '左DPAD' : '右DPAD';
            console.log(`📵 停用 ${dpadType}`);
            
            // 暫時移除過渡效果，立即隱藏
            const originalTransition = dpad.style.transition;
            dpad.style.transition = 'none';
            
            // 立即完全隱藏DPAD
            dpad.classList.remove('active', 'controlling');
            dpad.classList.add('inactive');
            dpad.style.pointerEvents = 'none';
            dpad.style.opacity = '0'; // 完全透明
            dpad.style.visibility = 'hidden'; // 完全隱藏
            
            // 重置搖桿位置
            const knob = dpad.querySelector('.joystick-knob');
            if (knob) {
                knob.style.transform = 'translate(-50%, -50%)';
            }
            
            // 恢復過渡效果（下次動畫用）
            setTimeout(() => {
                dpad.style.transition = originalTransition;
            }, 50);
            
            console.log(`🎮 ${dpadType} 已完全隱藏`);
        };
        
        // 輔助函數：根據ID查找觸控點
        this.findTouchById = (touchList, id) => {
            for (let i = 0; i < touchList.length; i++) {
                if (touchList[i].identifier === id) {
                    return touchList[i];
                }
            }
            return null;
        };
        
        // 檢查和清理僵死狀態（非常保守的版本）
        this.checkAndCleanupDeadStates = () => {
            // 更加保守的檢查：只有在明確沒有任何觸控點時才清理
            const hasTouches = document.touches && document.touches.length > 0;
            
            if (hasTouches) {
                // 如果還有觸控點，完全不做清理
                return;
            }
            
            // 只有在完全沒有觸控點時才考慮清理
            console.log('🔍 檢測到完全沒有觸控點，檢查DPAD狀態');
            
            // 檢查左DPAD狀態
            if (leftDpadState.active) {
                console.log('🔧 清理左DPAD僵死狀態（沒有觸控點）');
                this.safeDpadReset(leftDpadState, this.leftDpad);
            }
            
            // 檢查右DPAD狀態
            if (rightDpadState.active) {
                console.log('🔧 清理右DPAD僵死狀態（沒有觸控點）');
                this.safeDpadReset(rightDpadState, this.rightDpad);
            }
        };
        
        // 手動清理所有DPAD狀態（緊急情況使用）
        this.forceResetAllDpads = () => {
            console.log('🚑 緊急重置所有DPAD狀態');
            this.safeDpadReset(leftDpadState, this.leftDpad);
            this.safeDpadReset(rightDpadState, this.rightDpad);
        };
        
        // 調試狀態日誌
        this.logDpadStatus = () => {
            const leftStatus = leftDpadState.active ? `激活(觸控ID:${leftDpadState.touchId})` : '未激活';
            const rightStatus = rightDpadState.active ? `激活(觸控ID:${rightDpadState.touchId})` : '未激活';
            const totalTouches = document.touches ? document.touches.length : 0;
            
            console.log(`🗺 DPAD狀態: 左${leftStatus} | 右${rightStatus} | 總觸控點:${totalTouches}`);
        };
        
        // 全域觸控事件監測（用於追蹤意外的觸控結束）
        this.setupGlobalTouchMonitoring = () => {
            // 監測所有觸控事件
            ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(eventType => {
                document.addEventListener(eventType, (event) => {
                    this.logTouchEvent(eventType, event);
                }, { passive: false, capture: true }); // 使用capture以捕獲所有事件
            });
        };
        
        // 記錄觸控事件
        this.logTouchEvent = (eventType, event) => {
            const timestamp = Date.now();
            const touchIds = Array.from(event.touches || []).map(t => t.identifier);
            const changedTouchIds = Array.from(event.changedTouches || []).map(t => t.identifier);
            
            const logEntry = {
                timestamp,
                eventType,
                totalTouches: event.touches ? event.touches.length : 0,
                touchIds,
                changedTouchIds,
                leftDpadActive: leftDpadState ? leftDpadState.active : false,
                rightDpadActive: rightDpadState ? rightDpadState.active : false,
                leftDpadTouchId: leftDpadState ? leftDpadState.touchId : null,
                rightDpadTouchId: rightDpadState ? rightDpadState.touchId : null
            };
            
            this.touchEventLog.push(logEntry);
            
            // 保持日誌長度
            if (this.touchEventLog.length > this.maxLogEntries) {
                this.touchEventLog.shift();
            }
            
            // 检查意外情況
            if (eventType === 'touchend' || eventType === 'touchcancel') {
                changedTouchIds.forEach(touchId => {
                    if ((leftDpadState.active && leftDpadState.touchId === touchId) ||
                        (rightDpadState.active && rightDpadState.touchId === touchId)) {
                        console.log(`📝 捕獲到 ${eventType}: 觸控ID ${touchId} 結束`);
                    }
                });
            }
        };
        
        // 獲取觸控事件日誌
        this.getTouchEventLog = () => {
            return this.touchEventLog.slice(-10); // 返回最近10個事件
        };
        
        // 觸控點保活檢查（只記錄，不重置）
        this.checkTouchAliveness = () => {
            const currentTouchIds = new Set();
            if (document.touches) {
                for (let i = 0; i < document.touches.length; i++) {
                    currentTouchIds.add(document.touches[i].identifier);
                }
            }
            
            // 檢查左DPAD
            if (leftDpadState.active && leftDpadState.touchId !== null) {
                if (!currentTouchIds.has(leftDpadState.touchId)) {
                    console.warn(`⚠️ 左DPAD觸控點 ${leftDpadState.touchId} 似乎已消失，但不重置`);
                    // 不重置，只記錄
                }
            }
            
            // 檢查右DPAD
            if (rightDpadState.active && rightDpadState.touchId !== null) {
                if (!currentTouchIds.has(rightDpadState.touchId)) {
                    console.warn(`⚠️ 右DPAD觸控點 ${rightDpadState.touchId} 似乎已消失，但不重置`);
                    // 不重置，只記錄
                }
            }
        };
        
        // 雙擊法術選擇器快速重置機制
        this.setupQuickResetMechanism = () => {
            let lastTapTime = 0;
            const DOUBLE_TAP_THRESHOLD = 300; // 300ms內雙擊
            
            if (this.spellSelector) {
                this.spellSelector.addEventListener('touchstart', (event) => {
                    const currentTime = Date.now();
                    if (currentTime - lastTapTime < DOUBLE_TAP_THRESHOLD) {
                        // 雙擊法術選擇器重置所有DPAD
                        console.log('🔄 雙擊法術選擇器，重置所有DPAD');
                        this.forceResetAllDpads();
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    lastTapTime = currentTime;
                });
            }
        };
        
        // 啟用快速重置機制
        this.setupQuickResetMechanism();
        
        // 在window物件上暴露調試函數
        if (window.mobileControls === this) {
            window.resetDpads = this.forceResetAllDpads;
            window.logDpads = this.logDpadStatus;
            window.getTouchLog = this.getTouchEventLog;
            console.log('🎆 調試函數已暴露: resetDpads(), logDpads(), getTouchLog()');
            console.log('🔄 快速重置: 雙擊法術選擇器');
        }
        
        // 安全DPAD重置（不干擾其他DPAD）
        this.safeDpadReset = (dpadState, targetDpad) => {
            const dpadType = targetDpad === this.leftDpad ? '左DPAD' : '右DPAD';
            const touchId = dpadState.touchId;
            
            console.log(`🔧 安全重置 ${dpadType} (觸控ID: ${touchId})`);
            
            // 清除計時器
            if (dpadState.longPressTimer) {
                clearTimeout(dpadState.longPressTimer);
                dpadState.longPressTimer = null;
            }
            
            // 隱藏DPAD
            this.deactivateDpad(targetDpad);
            
            // 重置狀態
            dpadState.active = false;
            dpadState.touchId = null;
            dpadState.startPos = { x: 0, y: 0 };
            dpadState.startTime = 0;
            
            // 重置方向狀態
            if (targetDpad === this.leftDpad) {
                this.moveDirection = { x: 0, y: 0 };
            } else {
                this.attackDirection = { x: 0, y: 0 };
            }
            
            console.log(`🔧 ${dpadType} 狀態已安全重置`);
        };
        
        // 強制DPAD重置（用於緊急情況）
        this.forceDpadReset = (dpadState, targetDpad) => {
            // 清除計時器
            if (dpadState.longPressTimer) {
                clearTimeout(dpadState.longPressTimer);
                dpadState.longPressTimer = null;
            }
            
            // 強制隱藏DPAD
            this.deactivateDpad(targetDpad);
            
            // 重置狀態
            dpadState.active = false;
            dpadState.touchId = null;
            dpadState.startPos = { x: 0, y: 0 };
            dpadState.startTime = 0;
            
            // 重置方向狀態
            if (targetDpad === this.leftDpad) {
                this.moveDirection = { x: 0, y: 0 };
            } else {
                this.attackDirection = { x: 0, y: 0 };
            }
            
            console.log('🔧 DPAD狀態已強制重置');
        };
    }
    
    // 在指定位置定位DPAD（智能避讓算法）
    positionDpadAt(dpad, x, y) {
        if (!dpad) return;
        
        // 計算DPAD尺寸（搖桿容器大小）
        const dpadSize = 120; // 搖桿容器寬度
        const halfSize = dpadSize / 2;
        const padding = 15; // 避讓間距
        
        // 動態獲取HUD保護區域
        const protectedAreas = this.getProtectedAreas();
        
        // 基本邊界檢查
        const maxX = window.innerWidth - dpadSize;
        const maxY = window.innerHeight - dpadSize;
        
        // 初始位置（以觸控點為中心）
        let adjustedX = Math.max(0, Math.min(x - halfSize, maxX));
        let adjustedY = Math.max(0, Math.min(y - halfSize, maxY));
        
        // 智能避讓算法：找到最佳位置
        const bestPosition = this.findBestPosition(
            { x: adjustedX, y: adjustedY, width: dpadSize, height: dpadSize },
            protectedAreas,
            { x, y }, // 原始觸控點
            padding
        );
        
        adjustedX = bestPosition.x;
        adjustedY = bestPosition.y;
        
        // 設置DPAD位置
        dpad.style.left = adjustedX + 'px';
        dpad.style.top = adjustedY + 'px';
        dpad.style.position = 'fixed';
        
        // 計算最終的視覺中心位置
        const finalCenterX = adjustedX + halfSize;
        const finalCenterY = adjustedY + halfSize;
        
        console.log(`🎮 DPAD智能定位在 (${adjustedX}, ${adjustedY})`);
        
        // 返回最終位置訊息
        return {
            x: adjustedX,
            y: adjustedY,
            centerX: finalCenterX,
            centerY: finalCenterY
        };
    }
    
    // 獲取所有保護區域
    getProtectedAreas() {
        const areas = [];
        
        // 左上角HUD區域
        const hudLeft = document.querySelector('.hud-side.left');
        if (hudLeft) {
            const rect = hudLeft.getBoundingClientRect();
            areas.push({
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                name: 'HUD-Left'
            });
        } else {
            // 備用固定區域
            areas.push({ x: 0, y: 0, width: 300, height: 150, name: 'HUD-Left-Fallback' });
        }
        
        // 右上角HUD區域
        const hudRight = document.querySelector('.hud-side.right');
        if (hudRight) {
            const rect = hudRight.getBoundingClientRect();
            areas.push({
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                name: 'HUD-Right'
            });
        } else {
            // 備用固定區域
            areas.push({ x: window.innerWidth - 300, y: 0, width: 300, height: 150, name: 'HUD-Right-Fallback' });
        }
        
        // 法術選擇器區域
        if (this.spellSelector) {
            const rect = this.spellSelector.getBoundingClientRect();
            areas.push({
                x: rect.left - 10, // 額外間距
                y: rect.top,
                width: rect.width + 20,
                height: rect.height,
                name: 'SpellSelector'
            });
        }
        
        return areas;
    }
    
    // 找到最佳DPAD位置
    findBestPosition(dpadBounds, protectedAreas, originalTouch, padding) {
        const candidates = [];
        
        // 嘗試原始位置
        if (!this.hasAnyOverlap(dpadBounds, protectedAreas)) {
            return { x: dpadBounds.x, y: dpadBounds.y };
        }
        
        // 生成候選位置
        const directions = [
            { dx: 0, dy: padding },      // 向下
            { dx: 0, dy: -padding },     // 向上
            { dx: -padding, dy: 0 },     // 向左
            { dx: padding, dy: 0 },      // 向右
            { dx: -padding, dy: padding }, // 左下
            { dx: padding, dy: padding },  // 右下
            { dx: -padding, dy: -padding }, // 左上
            { dx: padding, dy: -padding }   // 右上
        ];
        
        for (const dir of directions) {
            const candidateX = Math.max(0, Math.min(dpadBounds.x + dir.dx, window.innerWidth - dpadBounds.width));
            const candidateY = Math.max(0, Math.min(dpadBounds.y + dir.dy, window.innerHeight - dpadBounds.height));
            
            const candidate = {
                x: candidateX,
                y: candidateY,
                width: dpadBounds.width,
                height: dpadBounds.height
            };
            
            if (!this.hasAnyOverlap(candidate, protectedAreas)) {
                const distance = this.calculateDistance(
                    { x: candidateX + dpadBounds.width/2, y: candidateY + dpadBounds.height/2 },
                    originalTouch
                );
                candidates.push({ ...candidate, distance });
            }
        }
        
        // 選擇距離原始觸控點最近的候選位置
        if (candidates.length > 0) {
            candidates.sort((a, b) => a.distance - b.distance);
            return candidates[0];
        }
        
        // 如果沒有找到合適位置，返回邊界安全位置
        return this.getFallbackPosition(dpadBounds, protectedAreas);
    }
    
    // 檢查是否與任何保護區域重疊
    hasAnyOverlap(rect, protectedAreas) {
        return protectedAreas.some(area => this.isOverlapping(rect, area));
    }
    
    // 計算兩點距離
    calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 獲取緊急備用位置
    getFallbackPosition(dpadBounds, protectedAreas) {
        // 嘗試屏幕中央下方
        const centerX = (window.innerWidth - dpadBounds.width) / 2;
        const centerY = window.innerHeight - dpadBounds.height - 50;
        
        const fallback = {
            x: centerX,
            y: centerY,
            width: dpadBounds.width,
            height: dpadBounds.height
        };
        
        if (!this.hasAnyOverlap(fallback, protectedAreas)) {
            return fallback;
        }
        
        // 最終備用：左下角
        return {
            x: 20,
            y: window.innerHeight - dpadBounds.height - 20
        };
    }
    
    // 檢查兩個矩形是否重疊（優化版本）
    isOverlapping(rect1, rect2) {
        // 快速邊界檢查
        if (!rect1 || !rect2) return false;
        
        return !(rect1.x + rect1.width <= rect2.x || 
                 rect2.x + rect2.width <= rect1.x || 
                 rect1.y + rect1.height <= rect2.y || 
                 rect2.y + rect2.height <= rect1.y);
    }
    
    // 更新DPAD控制（修復中心點偏移問題）
    updateDpadControl(dpad, touchX, touchY) {
        if (!dpad) return;
        
        // 使用實際觸摸中心點，而不是視覺中心點
        const centerX = parseFloat(dpad.dataset.centerX); // 實際觸摸中心
        const centerY = parseFloat(dpad.dataset.centerY); // 實際觸摸中心
        const visualCenterX = parseFloat(dpad.dataset.visualCenterX) || centerX; // 視覺中心
        const visualCenterY = parseFloat(dpad.dataset.visualCenterY) || centerY; // 視覺中心
        const maxRadius = 45; // 最大控制半徑
        
        // 使用實際觸摸中心點來計算控制方向
        const deltaX = touchX - centerX;
        const deltaY = touchY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // 限制在最大半徑內
        const clampedDistance = Math.min(distance, maxRadius);
        const angle = Math.atan2(deltaY, deltaX);
        
        const knobX = Math.cos(angle) * clampedDistance;
        const knobY = Math.sin(angle) * clampedDistance;
        
        // 但是搖桿視覺位置需要使用視覺中心點來偵移
        const knob = dpad.querySelector('.joystick-knob');
        if (knob) {
            // 計算相對於視覺中心的搖桿位置
            const visualDeltaX = touchX - visualCenterX;
            const visualDeltaY = touchY - visualCenterY;
            const visualDistance = Math.sqrt(visualDeltaX * visualDeltaX + visualDeltaY * visualDeltaY);
            const visualClampedDistance = Math.min(visualDistance, maxRadius);
            const visualAngle = Math.atan2(visualDeltaY, visualDeltaX);
            
            const visualKnobX = Math.cos(visualAngle) * visualClampedDistance;
            const visualKnobY = Math.sin(visualAngle) * visualClampedDistance;
            
            knob.style.transform = `translate(${visualKnobX - 15}px, ${visualKnobY - 15}px)`;
        }
        
        // 計算標準化方向向量
        const normalizedX = clampedDistance > 10 ? knobX / maxRadius : 0; // 死區設定
        const normalizedY = clampedDistance > 10 ? knobY / maxRadius : 0;
        
        // 判斷DPAD類型並更新方向
        const isLeftDpad = dpad === this.leftDpad;
        if (isLeftDpad) {
            this.moveDirection = { x: normalizedX, y: normalizedY };
        } else {
            this.attackDirection = { x: normalizedX, y: normalizedY };
        }
        
        // 設置控制狀態
        if (clampedDistance > 10) {
            dpad.classList.add('controlling');
            dpad.style.opacity = '0.15'; // 控制時稍微明顯一點
        } else {
            dpad.classList.remove('controlling');
            dpad.style.opacity = '0.1'; // 恢復基本透明度
        }
        
        // 調試輸出
        if (clampedDistance > 10) {
            const type = isLeftDpad ? '移動' : '攻擊';
            console.log(`🎮 ${type}: (${normalizedX.toFixed(2)}, ${normalizedY.toFixed(2)})`);
        }
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
            
            // 隱藏動態DPAD
            this.hideDpad(dpad);
            
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
        
        // 設置DPAD初始狀態為非活動
        if (this.leftDpad) {
            this.leftDpad.classList.add('inactive');
        }
        if (this.rightDpad) {
            this.rightDpad.classList.add('inactive');
        }
        
        // 啟用時創建強制同步機制
        this.setupForceSyncMechanism();
        
        console.log('📱 手機控制已啟用');
    }
    
    // 強制同步機制（避免狀態不同步）
    setupForceSyncMechanism() {
        // 定期檢查玩家狀態是否與UI同步
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(() => {
            // 檢查法術選擇器狀態同步
            if (window.player && this.spellSelector) {
                const currentButton = this.spellSelector.querySelector('.spell-button.active');
                const playerSlot = player.selectedSlot || 0;
                
                if (currentButton) {
                    const buttonSlot = parseInt(currentButton.dataset.slot);
                    if (buttonSlot !== playerSlot) {
                        console.log(`🔄 檢測到狀態不同步: UI槽位${buttonSlot} vs 玩家槽位${playerSlot}，強制同步`);
                        this.updateSpellSelector();
                    }
                } else if (this.spellSelector.querySelectorAll('.spell-button').length > 0) {
                    // 如果有按鈕但沒有活動狀態，強制更新
                    console.log('🔄 檢測到沒有活動按鈕，強制同步');
                    this.updateSpellSelector();
                }
            }
            
            // 完全停用自動清理，直到找到真正的原因
            // this.checkAndCleanupDeadStates(); // 完全停用
            
            // 增加調試資訊
            this.logDpadStatus();
            
            // 觸控點保活機制（不重置，只記錄）
            this.checkTouchAliveness();
        }, 5000); // 每5秒檢查一次（降低頻率以減少誤判）
    }
    
    // 禁用手機控制
    disable() {
        this.isEnabled = false;
        
        // 清理同步機制
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
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