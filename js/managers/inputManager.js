/**
 * 輸入管理器
 * 統一處理鍵盤、滑鼠、觸控輸入
 */
class InputManager {
    constructor() {
        // 鍵盤狀態
        this.keys = new Map();
        this.keysPressed = new Map();
        this.keysReleased = new Map();
        
        // 滑鼠狀態
        this.mouse = {
            x: 0,
            y: 0,
            worldX: 0,
            worldY: 0,
            leftDown: false,
            rightDown: false,
            middleDown: false,
            leftPressed: false,
            rightPressed: false,
            wheel: 0
        };
        
        // 觸控狀態
        this.touches = new Map();
        this.isTouchDevice = false;
        
        // 設定
        this.mouseSensitivity = 1.0;
        this.invertMouse = false;
        
        // 虛擬搖桿（觸控設備）
        this.virtualJoystick = {
            active: false,
            centerX: 0,
            centerY: 0,
            currentX: 0,
            currentY: 0,
            radius: 50,
            deadZone: 0.2
        };
        
        this.setupEventListeners();
        this.detectTouchDevice();
    }

    // 檢測觸控設備
    detectTouchDevice() {
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        // 暫時禁用虛擬控制自動創建
        // if (this.isTouchDevice) {
        //     this.setupVirtualControls();
        // }
    }

    // 設定事件監聽器
    setupEventListeners() {
        // 鍵盤事件
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
        
        // 滑鼠事件
        document.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        document.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        document.addEventListener('mouseup', (event) => this.handleMouseUp(event));
        document.addEventListener('wheel', (event) => this.handleMouseWheel(event));
        
        // 觸控事件
        document.addEventListener('touchstart', (event) => this.handleTouchStart(event));
        document.addEventListener('touchmove', (event) => this.handleTouchMove(event));
        document.addEventListener('touchend', (event) => this.handleTouchEnd(event));
        
        // 防止預設的觸控行為
        document.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false });
        document.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
    }

    // 設定虛擬控制器
    setupVirtualControls() {
        // 創建虛擬搖桿 UI
        const joystickContainer = document.createElement('div');
        joystickContainer.id = 'virtualJoystick';
        joystickContainer.style.cssText = `
            position: fixed;
            bottom: 50px;
            left: 50px;
            width: 100px;
            height: 100px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.3);
            display: none;
            z-index: 1000;
        `;
        
        const joystickKnob = document.createElement('div');
        joystickKnob.id = 'virtualJoystickKnob';
        joystickKnob.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: none;
        `;
        
        joystickContainer.appendChild(joystickKnob);
        document.body.appendChild(joystickContainer);
        
        // 創建虛擬按鈕
        this.createVirtualButtons();
    }

    // 創建虛擬按鈕
    createVirtualButtons() {
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'virtualButtons';
        buttonContainer.style.cssText = `
            position: fixed;
            bottom: 50px;
            right: 50px;
            display: none;
            z-index: 1000;
        `;
        
        // 攻擊按鈕
        const attackButton = document.createElement('button');
        attackButton.id = 'virtualAttackBtn';
        attackButton.textContent = '攻擊';
        attackButton.style.cssText = `
            width: 60px;
            height: 60px;
            margin: 5px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 100, 100, 0.8);
            color: white;
            font-weight: bold;
        `;
        
        // 衝刺按鈕
        const dashButton = document.createElement('button');
        dashButton.id = 'virtualDashBtn';
        dashButton.textContent = '衝刺';
        dashButton.style.cssText = `
            width: 60px;
            height: 60px;
            margin: 5px;
            border-radius: 50%;
            border: none;
            background: rgba(100, 100, 255, 0.8);
            color: white;
            font-weight: bold;
        `;
        
        buttonContainer.appendChild(attackButton);
        buttonContainer.appendChild(dashButton);
        document.body.appendChild(buttonContainer);
        
        // 綁定虛擬按鈕事件
        this.bindVirtualButtonEvents();
    }

    // 綁定虛擬按鈕事件
    bindVirtualButtonEvents() {
        const attackBtn = document.getElementById('virtualAttackBtn');
        const dashBtn = document.getElementById('virtualDashBtn');
        
        if (attackBtn) {
            attackBtn.addEventListener('touchstart', () => {
                this.mouse.leftPressed = true;
                this.mouse.leftDown = true;
            });
            attackBtn.addEventListener('touchend', () => {
                this.mouse.leftDown = false;
            });
        }
        
        if (dashBtn) {
            dashBtn.addEventListener('touchstart', () => {
                this.setKeyPressed('Space');
            });
            dashBtn.addEventListener('touchend', () => {
                this.setKeyReleased('Space');
            });
        }
    }

    // 鍵盤按下事件
    handleKeyDown(event) {
        const key = event.code;
        
        if (!this.keys.get(key)) {
            this.keysPressed.set(key, true);
        }
        
        this.keys.set(key, true);
        
        // 防止某些按鍵的預設行為
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            event.preventDefault();
        }
    }

    // 鍵盤釋放事件
    handleKeyUp(event) {
        const key = event.code;
        this.keys.set(key, false);
        this.keysReleased.set(key, true);
    }

    // 滑鼠移動事件
    handleMouseMove(event) {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = (event.clientX - rect.left) * this.mouseSensitivity;
            this.mouse.y = (event.clientY - rect.top) * this.mouseSensitivity;
            
            if (this.invertMouse) {
                this.mouse.y = canvas.height - this.mouse.y;
            }
            
            // 計算世界座標
            if (window.renderer) {
                const worldPos = renderer.screenToWorld(this.mouse.x, this.mouse.y);
                this.mouse.worldX = worldPos.x;
                this.mouse.worldY = worldPos.y;
            }
        }
    }

    // 滑鼠按下事件
    handleMouseDown(event) {
        switch (event.button) {
            case 0: // 左鍵
                this.mouse.leftPressed = true;
                this.mouse.leftDown = true;
                break;
            case 1: // 中鍵
                this.mouse.middleDown = true;
                break;
            case 2: // 右鍵
                this.mouse.rightPressed = true;
                this.mouse.rightDown = true;
                break;
        }
        
        event.preventDefault();
    }

    // 滑鼠釋放事件
    handleMouseUp(event) {
        switch (event.button) {
            case 0: // 左鍵
                this.mouse.leftDown = false;
                break;
            case 1: // 中鍵
                this.mouse.middleDown = false;
                break;
            case 2: // 右鍵
                this.mouse.rightDown = false;
                break;
        }
    }

    // 滑鼠滾輪事件
    handleMouseWheel(event) {
        this.mouse.wheel = event.deltaY;
        event.preventDefault();
    }

    // 觸控開始事件
    handleTouchStart(event) {
        for (const touch of event.changedTouches) {
            this.touches.set(touch.identifier, {
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY
            });
        }
        
        // 暫時禁用虛擬控制顯示
        // this.showVirtualControls(true);
        
        // 處理虛擬搖桿
        this.updateVirtualJoystick(event);
    }

    // 觸控移動事件
    handleTouchMove(event) {
        for (const touch of event.changedTouches) {
            if (this.touches.has(touch.identifier)) {
                const touchData = this.touches.get(touch.identifier);
                touchData.x = touch.clientX;
                touchData.y = touch.clientY;
            }
        }
        
        this.updateVirtualJoystick(event);
        this.simulateMouseFromTouch(event);
    }

    // 觸控結束事件
    handleTouchEnd(event) {
        for (const touch of event.changedTouches) {
            this.touches.delete(touch.identifier);
        }
        
        if (this.touches.size === 0) {
            // this.showVirtualControls(false);
            this.resetVirtualJoystick();
        }
    }

    // 更新虛擬搖桿
    updateVirtualJoystick(event) {
        if (event.touches.length === 0) return;
        
        const touch = event.touches[0];
        const canvas = document.getElementById('gameCanvas');
        const joystick = document.getElementById('virtualJoystick');
        
        if (!canvas || !joystick) return;
        
        // 檢查觸控是否在搖桿區域
        const rect = joystick.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
            Math.pow(touch.clientX - centerX, 2) + 
            Math.pow(touch.clientY - centerY, 2)
        );
        
        if (distance <= this.virtualJoystick.radius || this.virtualJoystick.active) {
            this.virtualJoystick.active = true;
            
            const deltaX = touch.clientX - centerX;
            const deltaY = touch.clientY - centerY;
            const clampedDistance = Math.min(distance, this.virtualJoystick.radius);
            
            if (distance > 0) {
                this.virtualJoystick.currentX = (deltaX / distance) * clampedDistance;
                this.virtualJoystick.currentY = (deltaY / distance) * clampedDistance;
            }
            
            // 更新搖桿視覺
            const knob = document.getElementById('virtualJoystickKnob');
            if (knob) {
                knob.style.transform = `translate(${this.virtualJoystick.currentX - 20}px, ${this.virtualJoystick.currentY - 20}px)`;
            }
            
            // 模擬鍵盤輸入
            this.simulateKeyboardFromJoystick();
        }
    }

    // 重置虛擬搖桿
    resetVirtualJoystick() {
        this.virtualJoystick.active = false;
        this.virtualJoystick.currentX = 0;
        this.virtualJoystick.currentY = 0;
        
        const knob = document.getElementById('virtualJoystickKnob');
        if (knob) {
            knob.style.transform = 'translate(-50%, -50%)';
        }
        
        // 重置模擬的鍵盤輸入
        this.keys.set('KeyW', false);
        this.keys.set('KeyA', false);
        this.keys.set('KeyS', false);
        this.keys.set('KeyD', false);
    }

    // 從搖桿模擬鍵盤輸入
    simulateKeyboardFromJoystick() {
        const normalizedX = this.virtualJoystick.currentX / this.virtualJoystick.radius;
        const normalizedY = this.virtualJoystick.currentY / this.virtualJoystick.radius;
        
        // 應用死區
        const deadZone = this.virtualJoystick.deadZone;
        
        this.keys.set('KeyW', normalizedY < -deadZone);
        this.keys.set('KeyS', normalizedY > deadZone);
        this.keys.set('KeyA', normalizedX < -deadZone);
        this.keys.set('KeyD', normalizedX > deadZone);
    }

    // 從觸控模擬滑鼠
    simulateMouseFromTouch(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            const canvas = document.getElementById('gameCanvas');
            
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                this.mouse.x = touch.clientX - rect.left;
                this.mouse.y = touch.clientY - rect.top;
                
                // 計算世界座標
                if (window.renderer) {
                    const worldPos = renderer.screenToWorld(this.mouse.x, this.mouse.y);
                    this.mouse.worldX = worldPos.x;
                    this.mouse.worldY = worldPos.y;
                }
            }
        }
    }

    // 顯示/隱藏虛擬控制器
    showVirtualControls(show) {
        const joystick = document.getElementById('virtualJoystick');
        const buttons = document.getElementById('virtualButtons');
        
        if (joystick) {
            joystick.style.display = show && this.isTouchDevice ? 'block' : 'none';
        }
        
        if (buttons) {
            buttons.style.display = show && this.isTouchDevice ? 'block' : 'none';
        }
    }

    // 更新輸入狀態（每幀調用）
    update() {
        // 清除按鍵按下和釋放狀態
        this.keysPressed.clear();
        this.keysReleased.clear();
        this.mouse.leftPressed = false;
        this.mouse.rightPressed = false;
        this.mouse.wheel = 0;
    }

    // 檢查按鍵狀態
    isKeyDown(key) {
        return this.keys.get(key) || false;
    }

    isKeyPressed(key) {
        return this.keysPressed.get(key) || false;
    }

    isKeyReleased(key) {
        return this.keysReleased.get(key) || false;
    }

    // 手動設定按鍵狀態
    setKeyPressed(key) {
        this.keysPressed.set(key, true);
        this.keys.set(key, true);
    }

    setKeyReleased(key) {
        this.keysReleased.set(key, true);
        this.keys.set(key, false);
    }

    // 獲取移動輸入
    getMovementInput() {
        let x = 0;
        let y = 0;
        
        if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) x -= 1;
        if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) x += 1;
        if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) y -= 1;
        if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) y += 1;
        
        return new Vector2(x, y);
    }

    // 設定滑鼠靈敏度
    setMouseSensitivity(sensitivity) {
        this.mouseSensitivity = Math.max(0.1, Math.min(5.0, sensitivity));
    }

    // 設定滑鼠反轉
    setInvertMouse(invert) {
        this.invertMouse = invert;
    }

    // 獲取輸入統計
    getStats() {
        return {
            keysDown: Array.from(this.keys.entries()).filter(([key, down]) => down).map(([key]) => key),
            mousePosition: { x: this.mouse.x, y: this.mouse.y },
            worldMousePosition: { x: this.mouse.worldX, y: this.mouse.worldY },
            touchCount: this.touches.size,
            isTouchDevice: this.isTouchDevice,
            virtualJoystickActive: this.virtualJoystick.active
        };
    }
}

// 全域輸入管理器
const inputManager = new InputManager();