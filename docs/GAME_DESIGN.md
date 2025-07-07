# Kani: Pixel Mage Survivor - 遊戲設計文檔

## 📋 基本資訊

- **遊戲名稱**: Kani: Pixel Mage Survivor
- **遊戲類型**: 2D Bullet-hell Roguelike Survivor
- **平台**: HTML5 (Web)
- **輸入方式**: 滑鼠/觸控
- **遊戲時長**: 10-15分鐘/局

## 🧙 主角設定

### Kani (主角)
- **外觀**: 灰白漸層摺耳貓，圓臉，表情豐富的眉毛
- **職業**: 魔法師
- **武器**: 魔法杖
- **風格**: 英國短毛貓 + 塔羅牌風格

## 🎮 核心玩法

### 移動系統
- **控制方式**: 角色自動跟隨滑鼠移動
- **移動速度**: 固定速度，不受距離影響
- **衝刺**: Space鍵，有冷卻時間和無敵幀

### 戰鬥系統
- **攻擊方式**: 自動攻擊最近敵人
- **法術切換**: 1-4數字鍵
- **傷害顯示**: 浮動傷害數字

## 🔮 法術系統

### 1. 火球術 (Fireball) 🔥
```javascript
damage: 15
manaCost: 8
speed: 200
range: 300
size: 8
statusEffect: 'burn'
statusDuration: 3秒
statusDamage: 2/秒
```
- **總傷害**: 15 + (2×3) = 21
- **傷害效率**: 2.625 (總傷害/魔力)
- **特點**: 中等傷害，燃燒DOT，適合血厚敵人

### 2. 冰霜箭 (Frostbolt) ❄️
```javascript
damage: 12
manaCost: 6
speed: 180
range: 250
size: 6
statusEffect: 'slow'
statusDuration: 2秒
slowMultiplier: 0.6 (降速40%)
```
- **傷害效率**: 2.0
- **特點**: 最省魔，減速控制，風筝戰術

### 3. 閃電 (Lightning) ⚡
```javascript
damage: 20
manaCost: 12
speed: 400
range: 200
size: 4
piercing: true
chainTargets: 3
chainDamageReduction: 0.8
```
- **傷害效率**: 1.67 (不含連鎖)
- **特點**: 最高單體傷害，穿透+連鎖，清群利器

### 4. 奧術飛彈 (Arcane) 🌟
```javascript
damage: 8
manaCost: 4
speed: 250
range: 280
size: 5
homingStrength: 0.1
```
- **傷害效率**: 2.0
- **特點**: 最省魔，輕微追蹤，高頻率

## ⚔️ 戰鬥計算

### 傷害計算公式
```javascript
baseDamage = spell.damage * (1 + player.attack/100)
isCritical = Math.random() < player.critChance
finalDamage = isCritical ? baseDamage * player.critDamage : baseDamage
```

### 玩家基礎屬性
```javascript
baseHealth: 100
baseMana: 50
baseAttack: 10     // +10% 法術傷害
baseDefense: 5     // 減少5點傷害
baseCritChance: 0.05   // 5% 爆擊率
baseCritDamage: 1.5    // 150% 爆擊傷害
baseSpeed: 120
```

### 狀態效果
- **燃燒 (Burn)**: 每秒造成固定傷害，紅色顯示
- **減速 (Slow)**: 降低移動速度，藍色顯示  
- **中毒 (Poison)**: 每0.5秒造成傷害，綠色顯示
- **冰凍 (Freeze)**: 完全停止移動

## 👹 敵人系統

### 史萊姆 (Slime)
```javascript
health: 20
speed: 40
damage: 8
experienceReward: 10
goldReward: 2
attackRange: 25
attackCooldown: 2.0
```

### AI 狀態機
1. **閒置 (Idle)**: 隨機移動
2. **追擊 (Chase)**: 朝玩家移動
3. **攻擊 (Attack)**: 停止移動，執行攻擊
4. **逃跑 (Flee)**: 遠離玩家 (已禁用)

### 血量顯示
- **正常**: 白色敵人
- **受傷**: 橘色閃爍
- **燃燒/中毒**: 紅色，持續扣血

## 🌊 波次系統

### 波次機制
- **敵人累積**: 時間到未清完的敵人會累積到下一波
- **無逃避**: 無法透過閃躲撐過波次
- **難度遞增**: 每波敵人數量和強度增加

### 波次完成條件
- **擊殺完成**: 殺光所有敵人 → 波次完成
- **時間到**: 3分鐘後強制開始下一波，敵人累積

## 💰 戰利品系統

### 金幣 (Gold)
- **掉落**: 敵人死亡時掉落1-3金幣
- **磁鐵範圍**: 60像素
- **收集範圍**: 20像素
- **持續時間**: 30秒後消失

### 經驗值寶石 (Exp)
- **掉落**: 敵人死亡時掉落5-15經驗
- **磁鐵範圍**: 80像素
- **自動收集**: 靠近自動收集

## 🎯 進度系統

### 經驗值與升級
```javascript
experienceBase: 50
experienceGrowth: 1.2  // 每級增加20%
levelUpHealthGain: 15
levelUpManaGain: 10
levelUpStatGain: 2
```

### 金幣與商店
- **持久化**: 金幣跨局保存
- **商店**: 購買武器、護甲、道具
- **裝備系統**: 影響角色屬性

## 🎨 視覺效果

### 特效系統
- **傷害數字**: 浮動顯示，暴擊黃色加粗
- **粒子效果**: 攻擊、死亡、收集特效
- **螢幕震動**: 受到大傷害時觸發
- **狀態顯示**: 不同狀態效果有對應顏色

### 渲染層級
1. 背景
2. 敵人
3. 投射物
4. 戰利品
5. 玩家
6. 特效 (最頂層)

## 🔧 技術架構

### 核心類別
- **Game**: 主遊戲循環
- **Player**: 玩家邏輯
- **Enemy**: 敵人AI
- **Projectile**: 投射物物理
- **Loot**: 戰利品系統

### 管理器
- **WaveManager**: 波次管理
- **EnemyManager**: 敵人管理
- **EffectsManager**: 特效管理
- **LootManager**: 戰利品管理
- **InputManager**: 輸入處理

### 渲染系統
- **Renderer**: 2D Canvas渲染
- **Canvas尺寸**: 800x600 邏輯像素
- **DPI支援**: 自動縮放支援高解析度

## 📱 平台支援

### PC版
- **輸入**: 滑鼠移動 + 鍵盤快捷鍵
- **ESC**: 暫停/恢復
- **數字鍵**: 切換法術
- **Space**: 衝刺

### 手機版
- **輸入**: 觸控移動 + 觸控攻擊
- **自動攻擊**: 無需手動點擊
- **響應式**: 自適應螢幕大小
- **已知問題**: 觸控座標精度需調整

## 🐛 已知問題

### 修復完成
- ✅ ESC鍵暫停功能
- ✅ 傷害數字顯示
- ✅ 金幣掉落系統
- ✅ 波次敵人累積
- ✅ Resume UI問題

### 待處理
- 🔄 手機版觸控座標精度
- 🔄 燃燒與中毒視覺區分
- 🔄 難度曲線調整
- 🔄 法術平衡性

## 📊 平衡數據

### 法術DPS (每秒傷害)
假設攻擊間隔1秒，魔力回復10/秒：

1. **奧術**: 8 DPS (可持續)
2. **冰霜箭**: 12 DPS (可持續) 
3. **火球**: 21 DPS (魔力限制)
4. **閃電**: 20+ DPS (魔力限制)

### 建議調整
- 閃電魔力消耗過高，建議降至10
- 冰霜箭減速效果可加強至0.5倍
- 奧術追蹤效果可提升至0.2

---

*最後更新: 2025-01-07*
*版本: v1.1.0*