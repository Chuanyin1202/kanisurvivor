/**
 * Debug 管理器
 * 提供遊戲調試信息和統計數據顯示
 */
class DebugManager {
    constructor() {
        this.isEnabled = false;
        this.panel = null;
        this.updateInterval = 100; // 更新間隔（毫秒）
        this.lastUpdate = 0;
        
        this.createDebugPanel();
        this.setupKeyboardShortcuts();
        
        console.log('🐛 DebugManager 初始化完成');
    }
    
    // 創建調試面板
    createDebugPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'debugPanel';
        this.panel.className = 'debug-panel hidden';
        this.panel.innerHTML = `
            <div class="debug-header">
                <h3>🐛 Debug Mode</h3>
                <button id="debugCloseBtn" class="debug-close">×</button>
            </div>
            <div class="debug-content">
                <div class="debug-section">
                    <h4>⚔️ 戰鬥屬性</h4>
                    <div id="debugCombatStats"></div>
                </div>
                <div class="debug-section">
                    <h4>✨ 能力效果</h4>
                    <div id="debugAbilities"></div>
                </div>
                <div class="debug-section">
                    <h4>🎯 生成點信息</h4>
                    <div id="debugSpawnPoints"></div>
                </div>
                <div class="debug-section">
                    <h4>📊 系統狀態</h4>
                    <div id="debugSystemStatus"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.panel);
        
        // 設置關閉按鈕
        const closeBtn = document.getElementById('debugCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.toggle();
            });
        }
    }
    
    // 設置鍵盤快捷鍵
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // F12 或 Ctrl+D 切換 debug 模式
            if (event.key === 'F12' || (event.ctrlKey && event.key === 'd')) {
                event.preventDefault();
                this.toggle();
            }
        });
    }
    
    // 切換 debug 模式
    toggle() {
        this.isEnabled = !this.isEnabled;
        
        if (this.isEnabled) {
            this.panel.classList.remove('hidden');
            console.log('🐛 Debug 模式已開啟');
        } else {
            this.panel.classList.add('hidden');
            console.log('🐛 Debug 模式已關閉');
        }
    }
    
    // 更新調試信息
    update(deltaTime) {
        if (!this.isEnabled) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastUpdate < this.updateInterval) return;
        
        this.updateCombatStats();
        this.updateAbilityEffects();
        this.updateSpawnPointInfo();
        this.updateSystemStatus();
        
        this.lastUpdate = currentTime;
    }
    
    // 更新戰鬥屬性
    updateCombatStats() {
        const statsElement = document.getElementById('debugCombatStats');
        if (!statsElement || !window.player) return;
        
        const player = window.player;
        const baseStats = player.baseStats || {};
        
        statsElement.innerHTML = `
            <div class="stat-row">
                <span>攻擊力:</span>
                <span class="${player.attack !== (baseStats.attack || 10) ? 'modified' : ''}">
                    ${player.attack} ${baseStats.attack ? `(基礎: ${baseStats.attack})` : ''}
                </span>
            </div>
            <div class="stat-row">
                <span>生命值:</span>
                <span class="${player.maxHealth !== (baseStats.maxHealth || 100) ? 'modified' : ''}">
                    ${player.health}/${player.maxHealth} ${baseStats.maxHealth ? `(基礎: ${baseStats.maxHealth})` : ''}
                </span>
            </div>
            <div class="stat-row">
                <span>魔法值:</span>
                <span class="${player.maxMana !== (baseStats.maxMana || 80) ? 'modified' : ''}">
                    ${player.mana}/${player.maxMana} ${baseStats.maxMana ? `(基礎: ${baseStats.maxMana})` : ''}
                </span>
            </div>
            <div class="stat-row">
                <span>爆擊率:</span>
                <span class="${player.critChance !== (baseStats.critChance || 0.1) ? 'modified' : ''}">
                    ${(player.critChance * 100).toFixed(1)}% ${baseStats.critChance ? `(基礎: ${(baseStats.critChance * 100).toFixed(1)}%)` : ''}
                </span>
            </div>
            <div class="stat-row">
                <span>爆擊傷害:</span>
                <span class="${player.critDamage !== (baseStats.critDamage || 2.0) ? 'modified' : ''}">
                    ${player.critDamage.toFixed(1)}x ${baseStats.critDamage ? `(基礎: ${baseStats.critDamage.toFixed(1)}x)` : ''}
                </span>
            </div>
            <div class="stat-row">
                <span>移動速度:</span>
                <span class="${player.speed !== (baseStats.speed || 120) ? 'modified' : ''}">
                    ${player.speed} ${baseStats.speed ? `(基礎: ${baseStats.speed})` : ''}
                </span>
            </div>
        `;
    }
    
    // 更新能力效果
    updateAbilityEffects() {
        const abilitiesElement = document.getElementById('debugAbilities');
        if (!abilitiesElement || !window.abilityManager) return;
        
        const effects = abilityManager.activeEffects;
        const playerAbilities = abilityManager.playerAbilities;
        
        let abilitiesHTML = '<div class="abilities-list">';
        
        if (playerAbilities.length === 0) {
            abilitiesHTML += '<div class="no-abilities">尚未獲得任何能力</div>';
        } else {
            playerAbilities.forEach(ability => {
                abilitiesHTML += `
                    <div class="ability-item">
                        <span class="ability-icon">${ability.icon}</span>
                        <span class="ability-name">${ability.name}</span>
                    </div>
                `;
            });
        }
        
        abilitiesHTML += '</div><div class="effects-list">';
        
        const effectKeys = Object.keys(effects);
        if (effectKeys.length === 0) {
            abilitiesHTML += '<div class="no-effects">無生效的被動效果</div>';
        } else {
            effectKeys.forEach(key => {
                const value = effects[key];
                let displayValue = value;
                
                // 格式化不同類型的數值
                if (typeof value === 'number') {
                    if (key.includes('Multiplier')) {
                        displayValue = `${value.toFixed(2)}x`;
                    } else if (key.includes('Chance')) {
                        displayValue = `${(value * 100).toFixed(1)}%`;
                    } else {
                        displayValue = value.toFixed(1);
                    }
                } else if (typeof value === 'boolean') {
                    displayValue = value ? '✅' : '❌';
                }
                
                abilitiesHTML += `
                    <div class="effect-item">
                        <span class="effect-name">${key}:</span>
                        <span class="effect-value">${displayValue}</span>
                    </div>
                `;
            });
        }
        
        abilitiesHTML += '</div>';
        abilitiesElement.innerHTML = abilitiesHTML;
    }
    
    // 更新生成點信息
    updateSpawnPointInfo() {
        const spawnElement = document.getElementById('debugSpawnPoints');
        if (!spawnElement || !window.waveManager) return;
        
        const manager = window.waveManager;
        const points = manager.spawnPoints || [];
        
        // 統計各方向的生成點數量
        let topCount = 0, bottomCount = 0, leftCount = 0, rightCount = 0;
        
        points.forEach(point => {
            if (point.y < 0) topCount++;
            else if (point.y > 600) bottomCount++;
            else if (point.x < 0) leftCount++;
            else if (point.x > 800) rightCount++;
        });
        
        spawnElement.innerHTML = `
            <div class="spawn-stats">
                <div class="stat-row">
                    <span>總生成點:</span>
                    <span>${points.length}</span>
                </div>
                <div class="stat-row">
                    <span>上方:</span>
                    <span>${topCount}</span>
                </div>
                <div class="stat-row">
                    <span>下方:</span>
                    <span>${bottomCount}</span>
                </div>
                <div class="stat-row">
                    <span>左側:</span>
                    <span>${leftCount}</span>
                </div>
                <div class="stat-row">
                    <span>右側:</span>
                    <span>${rightCount}</span>
                </div>
                <div class="stat-row">
                    <span>當前波次:</span>
                    <span>${manager.currentWave}</span>
                </div>
                <div class="stat-row">
                    <span>生成速率:</span>
                    <span>${manager.spawnRate.toFixed(1)}/秒</span>
                </div>
            </div>
        `;
    }
    
    // 更新系統狀態
    updateSystemStatus() {
        const systemElement = document.getElementById('debugSystemStatus');
        if (!systemElement || !window.game) return;
        
        const gameStats = window.game.getStats();
        const enemyCount = window.enemyManager ? enemyManager.enemies.length : 0;
        const projectileCount = window.projectileManager ? projectileManager.projectiles.length : 0;
        
        systemElement.innerHTML = `
            <div class="stat-row">
                <span>FPS:</span>
                <span class="${gameStats.fps < 30 ? 'warning' : ''}">${gameStats.fps}</span>
            </div>
            <div class="stat-row">
                <span>Delta Time:</span>
                <span>${(gameStats.deltaTime * 1000).toFixed(1)}ms</span>
            </div>
            <div class="stat-row">
                <span>敵人數量:</span>
                <span>${enemyCount}</span>
            </div>
            <div class="stat-row">
                <span>投射物數量:</span>
                <span>${projectileCount}</span>
            </div>
            <div class="stat-row">
                <span>遊戲狀態:</span>
                <span>${gameStats.currentState}</span>
            </div>
            <div class="stat-row">
                <span>暫停狀態:</span>
                <span>${gameStats.isPaused ? '暫停' : '運行'}</span>
            </div>
        `;
    }
    
    // 重置調試信息
    reset() {
        // 可以在這裡重置一些調試統計數據
        console.log('🐛 Debug 信息已重置');
    }
}

// 創建全域調試管理器
const debugManager = new DebugManager();
window.debugManager = debugManager;