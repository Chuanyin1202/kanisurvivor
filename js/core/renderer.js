/**
 * 渲染器
 * 統一管理 Canvas 2D 渲染操作
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 設定固定的遊戲尺寸
        this.width = 800;
        this.height = 600;
        
        this.camera = new Vector2(0, 0);
        this.shake = new Vector2(0, 0);
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.pixelRatio = window.devicePixelRatio || 1;
        
        this.setupCanvas();
        this.setupDefaultSettings();
    }

    // 設定 Canvas 支援高解析度顯示
    setupCanvas() {
        // 設定 Canvas 的實際尺寸
        this.canvas.width = this.width * this.pixelRatio;
        this.canvas.height = this.height * this.pixelRatio;
        
        // 設定 Canvas 的 CSS 尺寸
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        
        // 縮放 context 以支援高解析度
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        
        // 設定像素完美渲染
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        // 調試輸出
        console.log('Canvas 設定:', {
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            cssWidth: this.canvas.style.width,
            cssHeight: this.canvas.style.height,
            pixelRatio: this.pixelRatio
        });
    }

    // 設定預設渲染設定
    setupDefaultSettings() {
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.font = '16px Arial';
    }

    // 清除畫布
    clear(color = '#000000') {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    // 開始渲染幀
    beginFrame() {
        this.ctx.save();
        
        // 應用相機變換
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // 應用螢幕震動
        if (this.shakeDuration > 0) {
            this.ctx.translate(this.shake.x, this.shake.y);
        }
    }

    // 結束渲染幀
    endFrame() {
        this.ctx.restore();
    }

    // 繪製矩形
    drawRect(x, y, width, height, color = '#ffffff', filled = true) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        
        if (filled) {
            this.ctx.fillRect(x, y, width, height);
        } else {
            this.ctx.strokeRect(x, y, width, height);
        }
        
        this.ctx.restore();
    }

    // 繪製圓形
    drawCircle(x, y, radius, color = '#ffffff', filled = true) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (filled) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    // 繪製線段
    drawLine(x1, y1, x2, y2, color = '#ffffff', width = 1) {
        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    // 繪製文字
    drawText(text, x, y, color = '#ffffff', font = '16px Arial') {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }

    // 繪製帶描邊的文字
    drawTextWithOutline(text, x, y, color = '#ffffff', outlineColor = '#000000', font = '16px Arial', outlineWidth = 2) {
        this.ctx.save();
        this.ctx.font = font;
        this.ctx.lineWidth = outlineWidth;
        this.ctx.strokeStyle = outlineColor;
        this.ctx.fillStyle = color;
        
        this.ctx.strokeText(text, x, y);
        this.ctx.fillText(text, x, y);
        
        this.ctx.restore();
    }

    // 繪製圖像
    drawImage(image, x, y, width = null, height = null) {
        if (!image) return;
        
        this.ctx.save();
        
        if (width !== null && height !== null) {
            this.ctx.drawImage(image, x, y, width, height);
        } else {
            this.ctx.drawImage(image, x, y);
        }
        
        this.ctx.restore();
    }

    // 繪製旋轉的圖像
    drawRotatedImage(image, x, y, width, height, rotation, centerX = null, centerY = null) {
        if (!image) return;
        
        this.ctx.save();
        
        // 設定旋轉中心
        const cx = centerX !== null ? centerX : width / 2;
        const cy = centerY !== null ? centerY : height / 2;
        
        this.ctx.translate(x + cx, y + cy);
        this.ctx.rotate(rotation);
        this.ctx.drawImage(image, -cx, -cy, width, height);
        
        this.ctx.restore();
    }

    // 繪製圖像的一部分（精靈圖）
    drawSprite(image, sx, sy, sw, sh, dx, dy, dw, dh) {
        if (!image) return;
        
        this.ctx.save();
        this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        this.ctx.restore();
    }

    // 繪製帶透明度的圖像
    drawImageWithAlpha(image, x, y, width, height, alpha) {
        if (!image) return;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.drawImage(image, x, y, width, height);
        this.ctx.restore();
    }

    // 繪製帶透明度的圓形
    drawCircleWithAlpha(x, y, radius, color, alpha) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    // 繪製粒子效果
    drawParticle(x, y, size, color, alpha = 1) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    // 設定相機位置
    setCamera(x, y) {
        this.camera.set(x, y);
    }

    // 移動相機
    moveCamera(dx, dy) {
        this.camera.add(new Vector2(dx, dy));
    }

    // 讓相機跟隨目標
    followTarget(target, smoothing = 0.1) {
        const targetX = target.x - this.width / 2;
        const targetY = target.y - this.height / 2;
        
        this.camera.x += (targetX - this.camera.x) * smoothing;
        this.camera.y += (targetY - this.camera.y) * smoothing;
    }

    // 開始螢幕震動
    startShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    // 更新螢幕震動
    updateShake(deltaTime) {
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;
            
            if (this.shakeDuration <= 0) {
                this.shake.set(0, 0);
            } else {
                this.shake.x = (Math.random() - 0.5) * 2 * this.shakeIntensity;
                this.shake.y = (Math.random() - 0.5) * 2 * this.shakeIntensity;
            }
        }
    }

    // 獲取滑鼠在世界座標系中的位置
    getWorldMousePosition(mouseX, mouseY) {
        return new Vector2(
            mouseX + this.camera.x,
            mouseY + this.camera.y
        );
    }

    // 世界座標轉換為螢幕座標
    worldToScreen(worldX, worldY) {
        return new Vector2(
            worldX - this.camera.x,
            worldY - this.camera.y
        );
    }

    // 螢幕座標轉換為世界座標
    screenToWorld(screenX, screenY) {
        return new Vector2(
            screenX + this.camera.x,
            screenY + this.camera.y
        );
    }

    // 檢查物體是否在螢幕範圍內
    isVisible(x, y, width, height) {
        return !(x + width < this.camera.x || 
                x > this.camera.x + this.width ||
                y + height < this.camera.y || 
                y > this.camera.y + this.height);
    }

    // 調整 Canvas 大小
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.setupCanvas();
        this.setupDefaultSettings();
    }

    // 獲取渲染統計資訊
    getStats() {
        return {
            canvas: {
                width: this.width,
                height: this.height,
                pixelRatio: this.pixelRatio
            },
            camera: {
                x: this.camera.x,
                y: this.camera.y
            },
            shake: {
                intensity: this.shakeIntensity,
                duration: this.shakeDuration
            }
        };
    }
}

/**
 * 渲染層級管理器
 * 管理不同的渲染層級，確保正確的繪製順序
 */
class RenderLayerManager {
    constructor() {
        this.layers = new Map();
        this.layerOrder = [];
    }

    // 添加渲染層
    addLayer(name, zIndex = 0) {
        if (!this.layers.has(name)) {
            this.layers.set(name, {
                objects: [],
                zIndex: zIndex,
                visible: true
            });
            
            // 插入到正確的位置以保持排序
            this.layerOrder.push(name);
            this.layerOrder.sort((a, b) => {
                return this.layers.get(a).zIndex - this.layers.get(b).zIndex;
            });
        }
    }

    // 添加物件到指定層
    addToLayer(layerName, object) {
        if (this.layers.has(layerName)) {
            this.layers.get(layerName).objects.push(object);
        } else {
            console.warn(`Layer '${layerName}' not found`);
        }
    }

    // 從指定層移除物件
    removeFromLayer(layerName, object) {
        if (this.layers.has(layerName)) {
            const layer = this.layers.get(layerName);
            const index = layer.objects.indexOf(object);
            if (index > -1) {
                layer.objects.splice(index, 1);
            }
        }
    }

    // 清除指定層的所有物件
    clearLayer(layerName) {
        if (this.layers.has(layerName)) {
            this.layers.get(layerName).objects = [];
        }
    }

    // 設定層的可見性
    setLayerVisible(layerName, visible) {
        if (this.layers.has(layerName)) {
            this.layers.get(layerName).visible = visible;
        }
    }

    // 渲染所有層
    render(renderer) {
        for (const layerName of this.layerOrder) {
            const layer = this.layers.get(layerName);
            if (layer.visible) {
                for (const object of layer.objects) {
                    if (object.render) {
                        object.render(renderer);
                    }
                }
            }
        }
    }

    // 清除所有層
    clearAll() {
        for (const layer of this.layers.values()) {
            layer.objects = [];
        }
    }
}