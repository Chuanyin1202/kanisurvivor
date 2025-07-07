# Kani: Pixel Mage Survivor - 技術規格文檔

## 🏗️ 系統架構

### 核心架構
```
Game (main.js)
├── Renderer (renderer.js)
├── Player (player.js)
├── Managers/
│   ├── WaveManager
│   ├── EnemyManager
│   ├── EffectsManager
│   ├── LootManager
│   └── InputManager
└── Systems/
    ├── GameStateManager
    ├── EquipmentSystem
    └── AchievementSystem
```

### 檔案結構
```
js/
├── main.js              # 主遊戲入口
├── config/
│   ├── gameBalance.js   # 數值配置
│   └── settings.js      # 遊戲設定
├── core/
│   ├── renderer.js      # 渲染引擎
│   ├── gameState.js     # 狀態管理
│   └── assetLoader.js   # 資源載入
├── entities/
│   ├── player.js        # 玩家邏輯
│   ├── enemy.js         # 敵人AI
│   ├── projectile.js    # 投射物
│   └── loot.js          # 戰利品
├── managers/
│   ├── waveManager.js   # 波次管理
│   ├── enemyManager.js  # 敵人管理
│   ├── effectsManager.js # 特效管理
│   ├── lootManager.js   # 戰利品管理
│   └── inputManager.js  # 輸入處理
└── utils/
    ├── vector2.js       # 向量運算
    ├── objectPool.js    # 物件池
    └── storage.js       # 本地存儲
```

## 🎮 遊戲循環

### 主循環 (60 FPS)
```javascript
gameLoop() {
    deltaTime = calculateDeltaTime();
    
    // 更新邏輯
    update(deltaTime);
    
    // 渲染畫面
    render();
    
    // 請求下一幀
    requestAnimationFrame(gameLoop);
}
```

### 更新順序
1. **玩家更新**: 移動、攻擊、狀態
2. **敵人更新**: AI、移動、攻擊
3. **投射物更新**: 物理、碰撞
4. **波次管理**: 生成、檢查完成
5. **特效更新**: 粒子、傷害數字
6. **戰利品更新**: 磁鐵、收集
7. **UI更新**: 血條、經驗條

### 渲染順序
1. **清除畫布**: 黑色背景
2. **敵人渲染**: 血條、狀態效果
3. **投射物渲染**: 法術彈道
4. **戰利品渲染**: 金幣、經驗寶石
5. **玩家渲染**: 角色、面向指示
6. **特效渲染**: 粒子、傷害數字

## 📊 數據流

### 玩家數據
```javascript
Player {
    // 位置與物理
    position: Vector2(x, y)
    velocity: Vector2(x, y)
    size: Vector2(32, 32)
    radius: 16
    
    // 屬性
    level: 1
    health: 100
    maxHealth: 100
    mana: 50
    maxMana: 50
    experience: 0
    
    // 戰鬥屬性
    attack: 10           // +10% 法術傷害
    defense: 5           // -5 受到傷害
    critChance: 0.05     // 5% 爆擊率
    critDamage: 1.5      // 150% 爆擊傷害
    speed: 120           // 移動速度
    
    // 法術系統
    selectedSpell: 'fireball'
    spellCooldown: 0
    
    // 狀態
    isDashing: false
    isInvincible: false
    statusEffects: []
}
```

### 敵人數據
```javascript
Enemy {
    // 基礎屬性
    type: 'slime'
    health: 20
    maxHealth: 20
    speed: 40
    damage: 8
    
    // AI狀態
    aiState: 'chase'     // idle, chase, attack, flee
    target: Player
    lastAttackTime: 0
    attackCooldown: 2.0
    
    // 獎勵
    experienceReward: 10
    goldReward: 2
    
    // 視覺效果
    flashTime: 0         // 受傷閃爍
    isElite: false       // 精英怪
    statusEffects: []    // 狀態效果
}
```

### 法術數據
```javascript
Spell {
    damage: 15           // 基礎傷害
    manaCost: 8          // 魔力消耗
    speed: 200           // 飛行速度
    range: 300           // 射程
    size: 8              // 碰撞大小
    piercing: false      // 是否穿透
    areaOfEffect: 0      // 範圍傷害
    
    // 狀態效果
    statusEffect: 'burn'
    statusDuration: 3
    statusDamage: 2
    
    // 特殊屬性
    chainTargets: 0      // 連鎖目標數
    homingStrength: 0    // 追蹤強度
}
```

## 🎯 碰撞檢測

### 圓形碰撞
```javascript
function checkCircleCollision(obj1, obj2) {
    const distance = obj1.position.distanceTo(obj2.position);
    return distance <= (obj1.radius + obj2.radius);
}
```

### 碰撞類型
1. **玩家 vs 敵人**: 受到傷害
2. **投射物 vs 敵人**: 造成傷害
3. **玩家 vs 戰利品**: 收集物品
4. **邊界檢查**: 限制在遊戲區域內

## 🎨 渲染系統

### Canvas 設定
```javascript
// 邏輯尺寸
width: 800
height: 600

// 實際尺寸 (支援高DPI)
canvas.width = width * devicePixelRatio
canvas.height = height * devicePixelRatio

// CSS尺寸
canvas.style.width = width + 'px'
canvas.style.height = height + 'px'
```

### 座標系統
- **邏輯座標**: 800x600，用於遊戲邏輯
- **實際座標**: 乘以 devicePixelRatio
- **螢幕座標**: 滑鼠/觸控事件座標

### 座標轉換
```javascript
// 螢幕座標 → 邏輯座標
logicalX = screenX * canvas.width / rect.width / pixelRatio
logicalY = screenY * canvas.height / rect.height / pixelRatio
```

## 💾 數據持久化

### LocalStorage 結構
```javascript
kaniSurvivor_playerStats: {
    totalKills: 0,
    bestSurvivalTime: 0,
    totalGamesPlayed: 0,
    totalDeaths: 0
}

kaniSurvivor_gameData: {
    gold: 100,
    unlockedEquipment: [],
    equippedItems: {},
    achievements: {}
}

kaniSurvivor_settings: {
    graphics: { showFPS: false, showDamageNumbers: true },
    audio: { masterVolume: 1.0, musicVolume: 0.8 },
    controls: { mouseSensitivity: 1.0 }
}
```

## 🎵 音效系統

### 音效分類
```javascript
AudioManager {
    music: {
        mainTheme: 'assets/audio/music/main_theme.mp3',
        battleTheme: 'assets/audio/music/battle.mp3'
    },
    
    sfx: {
        fireball: 'assets/audio/sfx/fireball.wav',
        enemyHit: 'assets/audio/sfx/enemy_hit.wav',
        goldPickup: 'assets/audio/sfx/gold.wav',
        levelUp: 'assets/audio/sfx/levelup.wav'
    }
}
```

## 📱 響應式設計

### 螢幕適配
```css
/* 桌面版 */
#gameCanvas {
    width: 800px;
    height: 600px;
}

/* 手機版 */
@media (max-width: 768px) {
    #gameCanvas {
        max-width: calc(100vw - 20px);
        max-height: calc(100vh - 20px);
        width: auto;
        height: auto;
    }
}
```

### 輸入處理
```javascript
// PC版: 滑鼠 + 鍵盤
mousemove → player.input.mouseX/Y
keydown → player.input.dashPressed
click → player.input.spellPressed

// 手機版: 觸控
touchstart → player.input.mouseX/Y + spellPressed
touchmove → player.input.mouseX/Y
touchend → spellPressed = false
```

## ⚡ 效能優化

### 物件池系統
```javascript
ObjectPool {
    create: () => new Projectile(),
    reset: (obj) => obj.reset(),
    capacity: 50
}
```

### 渲染優化
1. **視錐剔除**: 只渲染螢幕內物件
2. **粒子限制**: 最多200個粒子
3. **幀率限制**: 目標60FPS，最低30FPS
4. **批次渲染**: 相同類型物件一起渲染

### 記憶體管理
1. **及時清理**: 死亡敵人立即回收
2. **引用計數**: 避免循環引用
3. **事件清理**: 離開狀態時清除監聽器

## 🔧 調試工具

### 控制台輸出
```javascript
// 敵人AI調試
console.log(`敵人追擊中，距離: ${distance}, 移動方向: ${direction}`)

// 波次調試  
console.log(`開始第 ${waveNumber} 波`)

// 傷害調試
console.log(`💥 顯示傷害數字: ${damage}`)
```

### 開發者模式
```javascript
// 顯示碰撞範圍
if (gameSettings.get('gameplay', 'debug')) {
    renderer.drawCircle(position.x, position.y, radius, '#ff0000', false);
}
```

## 🚀 部署規格

### 檔案大小
- **HTML**: ~8KB
- **JavaScript**: ~150KB
- **CSS**: ~20KB
- **資源**: ~2MB (圖片+音效)
- **總計**: ~2.2MB

### 瀏覽器支援
- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile**: iOS 12+, Android 7+

### 效能需求
- **CPU**: 雙核心 1.5GHz
- **RAM**: 1GB 可用記憶體
- **GPU**: 支援Canvas 2D硬體加速
- **網路**: 首次載入需要網路連線

---

*最後更新: 2025-01-07*
*版本: v1.1.0*