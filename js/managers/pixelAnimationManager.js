/**
 * 像素動畫管理器
 * 統一管理程序化像素動畫的渲染和更新
 * 注意：這是新增的管理系統，與現有系統並存，不修改任何現有代碼
 */
class PixelAnimationManager {
    constructor() {
        this.isInitialized = false;
        this.animationData = null;
        this.pixelScale = 2; // 像素縮放倍數
        this.debugMode = false;
        
        this.init();
    }

    // 初始化動畫管理器
    init() {
        try {
            // 檢查是否存在像素動畫數據
            if (typeof window !== 'undefined' && window.PixelAnimationData) {
                this.animationData = window.PixelAnimationData;
                this.isInitialized = true;
                console.log('🎨 PixelAnimationManager 初始化成功 - 使用全域數據');
            } else {
                console.warn('⚠️ PixelAnimationData 未找到，PixelAnimationManager 將在數據載入後初始化');
                // 延遲初始化
                this.waitForData();
            }
        } catch (error) {
            console.error('❌ PixelAnimationManager 初始化失敗:', error);
            this.isInitialized = false;
        }
    }

    // 等待數據載入完成
    waitForData() {
        const checkInterval = setInterval(() => {
            if (typeof window !== 'undefined' && window.PixelAnimationData) {
                this.animationData = window.PixelAnimationData;
                this.isInitialized = true;
                console.log('🎨 PixelAnimationManager 延遲初始化成功');
                clearInterval(checkInterval);
            }
        }, 100);

        // 10秒後停止檢查
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!this.isInitialized) {
                console.error('❌ PixelAnimationData 載入超時');
            }
        }, 10000);
    }

    // 渲染玩家角色動畫
    renderPlayerAnimation(renderer, x, y, animationState = 'idle', frame = 0, direction = 'right', stateModifier = 'normal') {
        if (!this.isInitialized || !this.animationData) {
            return false;
        }

        const { PlayerPixelPatterns, ColorPalettes } = this.animationData;
        
        try {
            // 獲取動畫模式
            const patterns = PlayerPixelPatterns[animationState];
            if (!patterns || patterns.length === 0) return false;

            // 獲取當前幀
            const currentFrame = patterns[frame % patterns.length];
            if (!currentFrame) return false;

            // 獲取調色盤
            const palette = ColorPalettes.player[stateModifier] || ColorPalettes.player.normal;
            if (!palette) return false;

            // 渲染像素圖案
            this.renderPixelPattern(renderer, currentFrame, palette, x, y, direction);
            
            return true;

        } catch (error) {
            return false;
        }
    }

    // 渲染投射物動畫
    renderProjectileAnimation(renderer, x, y, projectileType = 'fire', pattern = 'core', frame = 0) {
        if (!this.isInitialized || !this.animationData) {
            return false;
        }

        const { ProjectilePixelPatterns, ColorPalettes } = this.animationData;
        
        try {
            // 獲取投射物圖案
            const patterns = ProjectilePixelPatterns[projectileType];
            if (!patterns || !patterns[pattern]) return false;

            const pixelPattern = patterns[pattern];
            
            // 獲取調色盤
            const palette = ColorPalettes.projectiles[projectileType];
            if (!palette) return false;

            // 渲染像素圖案
            this.renderPixelPattern(renderer, pixelPattern, palette, x, y);
            
            return true;

        } catch (error) {
            return false;
        }
    }

    // 渲染像素圖案的核心函數
    renderPixelPattern(renderer, pattern, palette, centerX, centerY, direction = 'right') {
        if (!pattern || !palette || !renderer) return;

        // 如果渲染器有現成的 drawPixelPattern 方法，直接使用
        if (renderer.drawPixelPattern) {
            // 根據方向決定是否翻轉圖案
            let finalPattern = pattern;
            if (direction === 'left') {
                // 水平翻轉圖案
                finalPattern = pattern.map(row => [...row].reverse());
            }
            
            renderer.drawPixelPattern(centerX, centerY, finalPattern, palette, this.pixelScale);
            return;
        }

        // 回退方法：手動逐像素繪製
        const rows = pattern.length;
        const cols = pattern[0] ? pattern[0].length : 0;
        
        if (rows === 0 || cols === 0) return;

        // 計算起始位置（居中）
        const startX = centerX - (cols * this.pixelScale) / 2;
        const startY = centerY - (rows * this.pixelScale) / 2;

        // 渲染每個像素
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const colorIndex = pattern[row][col];
                if (colorIndex === 0) continue; // 跳過透明像素

                const color = palette[colorIndex];
                if (!color || color === 'transparent') continue;

                // 根據方向調整列位置
                const actualCol = direction === 'left' ? (cols - 1 - col) : col;
                
                const pixelX = startX + actualCol * this.pixelScale;
                const pixelY = startY + row * this.pixelScale;

                // 繪製像素
                if (renderer.drawRect) {
                    renderer.drawRect(pixelX, pixelY, this.pixelScale, this.pixelScale, color);
                }
            }
        }
    }

    // 獲取動畫配置
    getAnimationConfig(type, animationState) {
        if (!this.isInitialized || !this.animationData) {
            return null;
        }

        const { AnimationConfigs } = this.animationData;
        return AnimationConfigs[type] ? AnimationConfigs[type][animationState] : null;
    }

    // 獲取動畫總幀數
    getAnimationFrameCount(type, animationState) {
        if (!this.isInitialized || !this.animationData) {
            return 1;
        }

        if (type === 'player') {
            const patterns = this.animationData.PlayerPixelPatterns[animationState];
            return patterns ? patterns.length : 1;
        } else if (type === 'projectile') {
            const config = this.getAnimationConfig('projectiles', animationState);
            return config ? config.frames : 1;
        }

        return 1;
    }

    // 計算動畫幀索引
    calculateFrameIndex(animationTime, type, animationState) {
        const config = this.getAnimationConfig(type, animationState);
        if (!config) return 0;

        const frameCount = this.getAnimationFrameCount(type, animationState);
        const frameDuration = config.speed;
        
        if (!config.loop) {
            // 非循環動畫
            const frameIndex = Math.floor(animationTime / frameDuration);
            return Math.min(frameIndex, frameCount - 1);
        } else {
            // 循環動畫
            const totalDuration = frameCount * frameDuration;
            const loopTime = animationTime % totalDuration;
            return Math.floor(loopTime / frameDuration);
        }
    }

    // 檢查動畫是否完成（對於非循環動畫）
    isAnimationComplete(animationTime, type, animationState) {
        const config = this.getAnimationConfig(type, animationState);
        if (!config || config.loop) return false;

        const frameCount = this.getAnimationFrameCount(type, animationState);
        const totalDuration = frameCount * config.speed;
        
        return animationTime >= totalDuration;
    }

    // 設置像素縮放
    setPixelScale(scale) {
        this.pixelScale = Math.max(1, scale);
    }

    // 設置調試模式
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`🐛 像素動畫調試模式: ${enabled ? '開啟' : '關閉'}`);
    }

    // 獲取系統狀態
    getStatus() {
        return {
            initialized: this.isInitialized,
            hasData: !!this.animationData,
            pixelScale: this.pixelScale,
            debugMode: this.debugMode,
            playerAnimations: this.isInitialized ? Object.keys(this.animationData.PlayerPixelPatterns) : [],
            projectileTypes: this.isInitialized ? Object.keys(this.animationData.ProjectilePixelPatterns) : []
        };
    }

    // 驗證系統完整性
    validateSystem() {
        if (!this.isInitialized) {
            return { valid: false, error: '系統未初始化' };
        }

        try {
            const { PlayerPixelPatterns, ProjectilePixelPatterns, ColorPalettes, AnimationConfigs } = this.animationData;
            
            // 檢查基本數據結構
            if (!PlayerPixelPatterns || !ProjectilePixelPatterns || !ColorPalettes || !AnimationConfigs) {
                return { valid: false, error: '缺少必要的數據結構' };
            }

            // 檢查玩家動畫
            const playerAnimCount = Object.keys(PlayerPixelPatterns).length;
            const playerPalettes = Object.keys(ColorPalettes.player || {}).length;
            
            // 檢查投射物動畫
            const projectileCount = Object.keys(ProjectilePixelPatterns).length;
            const projectilePalettes = Object.keys(ColorPalettes.projectiles || {}).length;

            return {
                valid: true,
                stats: {
                    playerAnimations: playerAnimCount,
                    playerPalettes: playerPalettes,
                    projectileTypes: projectileCount,
                    projectilePalettes: projectilePalettes
                }
            };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
}

// 創建全域實例（如果在瀏覽器環境中）
if (typeof window !== 'undefined') {
    window.pixelAnimationManager = new PixelAnimationManager();
    console.log('🎨 PixelAnimationManager 全域實例已創建');
}

// 導出（Node.js 環境支持）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PixelAnimationManager;
}