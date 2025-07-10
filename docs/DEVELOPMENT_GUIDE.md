# 🛠️ 開發指南 - Development Guide

## 📋 專案概述 (Project Overview)

**專案名稱**: Kani: Pixel Mage Survivor  
**技術棧**: Vanilla JavaScript + Canvas API + Web Audio API  
**目標平台**: Web (桌面 + 手機)
**設計風格**: EVA風格機甲魔導共鳴崩壞主題

> 詳細的專案進度和狀態請參考 [PROGRESS.md](./PROGRESS.md)  
> 已知問題和解決方案請參考 [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)

## 🚀 開發環境設定

### 必要工具
- 現代文字編輯器（VS Code 推薦）
- 現代瀏覽器（開發者工具）
- Git 版本控制
- HTTP 伺服器（用於測試）

### 推薦擴展（VS Code）
- Live Server
- JavaScript (ES6) code snippets
- Bracket Pair Colorizer
- GitLens

### 本地開發設置
```bash
# 克隆專案
git clone https://github.com/Chuanyin1202/kanisurvivor.git
cd kanisurvivor

# 啟動本地伺服器
python -m http.server 8000
# 或使用 VS Code Live Server

# 開啟瀏覽器
# http://localhost:8000
```

## 📁 專案結構說明

### 核心檔案
- `index.html` - 主遊戲頁面
- `js/main.js` - 遊戲主控制器
- `js/config/gameBalance.js` - 遊戲平衡配置

### 關鍵類別
- `Game` - 主遊戲循環
- `Player` - 玩家角色
- `Enemy` - 敵人基類
- `Projectile` - 投射物系統
- `WaveManager` - 波次管理

### 完整目錄結構
```
kanisurvivor/
├── index.html                    # 主遊戲頁面
├── CLAUDE.md                     # Claude Code 專用指令
├── README.md                     # 專案介紹
├── js/                           # 核心程式碼
│   ├── main.js                   # 遊戲主控制器
│   ├── core/                     # 核心系統
│   │   ├── gameState.js          # 遊戲狀態管理
│   │   ├── renderer.js           # 渲染引擎
│   │   └── assetLoader.js        # 資源載入器
│   ├── entities/                 # 遊戲實體
│   │   ├── player.js             # 玩家角色
│   │   ├── enemy.js              # 敵人系統
│   │   ├── projectile.js         # 投射物系統
│   │   ├── drone.js              # 無人機系統
│   │   └── loot.js               # 戰利品系統
│   ├── managers/                 # 管理器系統
│   │   ├── pixelAnimationManager.js  # 像素動畫管理
│   │   ├── waveManager.js        # 波次管理
│   │   ├── enemyManager.js       # 敵人管理
│   │   ├── inputManager.js       # 輸入管理
│   │   ├── uiManager.js          # UI管理
│   │   ├── simpleUIUpdater.js    # 簡化UI更新
│   │   ├── audioManager.js       # 音效管理
│   │   └── effectsManager.js     # 特效管理
│   ├── systems/                  # 遊戲系統
│   │   ├── abilityDatabase.js    # 能力資料庫
│   │   ├── abilityManager.js     # 能力管理
│   │   ├── spellFusionManager.js # 法術融合
│   │   ├── elementSelector.js    # 元素選擇
│   │   ├── slotSelector.js       # 槽位選擇
│   │   ├── summonManager.js      # 召喚管理
│   │   ├── debugManager.js       # 調試管理
│   │   ├── mobileControls.js     # 手機控制
│   │   ├── achievementSystem.js  # 成就系統
│   │   ├── equipmentSystem.js    # 裝備系統
│   │   ├── shopSystem.js         # 商店系統
│   │   └── evaFontSystem.js      # EVA字體系統
│   ├── utils/                    # 工具類
│   │   ├── vector2.js            # 向量運算
│   │   ├── objectPool.js         # 物件池
│   │   ├── storage.js            # 本地儲存
│   │   └── synthSoundGenerator.js # 音效生成
│   ├── config/                   # 配置檔案
│   │   ├── gameBalance.js        # 遊戲平衡
│   │   └── settings.js           # 遊戲設定
│   └── data/                     # 資料定義
│       └── pixelAnimations.js    # 像素動畫資料
├── styles/                       # 樣式系統
│   └── main.css                  # EVA風格主要樣式
├── assets/                       # 遊戲資源
│   ├── images/                   # 圖片資源
│   ├── audio/                    # 音效資源
│   └── data/                     # 遊戲資料
├── reference/                    # 參考資料
└── docs/                         # 文檔
    ├── PROGRESS.md               # 開發進度
    ├── KNOWN_ISSUES.md           # 已知問題
    ├── GAME_DESIGN.md            # 遊戲設計
    ├── TECHNICAL_SPECS.md        # 技術規格
    └── legacy/                   # 歷史文檔
        └── PIXEL_ART_LEGACY.md   # 像素藝術歷史
```

## 🎮 開發流程

### 1. 新功能開發流程
1. 在 `docs/PROGRESS.md` 中添加功能需求
2. 在 `docs/KNOWN_ISSUES.md` 中記錄已知限制
3. 創建功能分支：`git checkout -b feature/功能名稱`
4. 實現功能並添加適當的註釋
5. 測試功能在不同平台上的表現
6. 更新相關文檔
7. 提交代碼：`git commit -m "✨ 添加新功能: 功能描述"`

### 2. Bug 修復流程
1. 在 `docs/KNOWN_ISSUES.md` 中記錄問題
2. 創建修復分支：`git checkout -b fix/問題描述`
3. 重現問題並編寫測試用例
4. 實現修復方案
5. 驗證修復效果
6. 更新文檔中的問題狀態
7. 提交代碼：`git commit -m "🐛 修復問題: 問題描述"`

### 3. 代碼審查標準
- **功能性**: 功能是否按預期工作
- **相容性**: 是否在所有目標平台上正常運行
- **效能**: 是否對遊戲效能有負面影響
- **可讀性**: 代碼是否清晰易懂
- **文檔**: 是否有適當的註釋和文檔更新

## 🧪 測試指南

### 平台測試需求
| 平台 | 瀏覽器 | 測試重點 |
|------|-------|----------|
| PC | Chrome, Firefox, Edge | 基礎功能、效能 |
| iPad | Safari | 觸控操作、響應式UI |
| Android | Chrome | 觸控操作、音效 |
| iPhone | Safari | 觸控操作、音效相容性 |

### 功能測試清單
- [ ] 主選單導航
- [ ] 遊戲開始和暫停
- [ ] 法術切換和施放
- [ ] 敵人生成和AI
- [ ] 經驗值和升級
- [ ] 商店系統
- [ ] 成就系統
- [ ] 音效播放
- [ ] 觸控操作 (手機)

### 效能測試
```javascript
// 效能監控
console.time('gameUpdate');
game.update(deltaTime);
console.timeEnd('gameUpdate');

// FPS 監控
let fps = 1000 / deltaTime;
console.log(`FPS: ${fps.toFixed(1)}`);
```

## 🔧 調試工具

### 開發者控制台命令
```javascript
// 顯示遊戲狀態
game.getStatus()

// 切換調試模式
game.toggleDebugMode()

// 手動觸發敵人波次
waveManager.startNextWave()

// 測試音效系統
audioManager.testAllSounds()

// 顯示效能統計
game.getPerformanceStats()
```

### 常用調試技巧
1. **邊界框顯示**: 在 `renderer.js` 中啟用碰撞邊界顯示
2. **狀態機調試**: 監控敵人和玩家的狀態變化
3. **效能分析**: 使用瀏覽器的 Performance 工具
4. **記憶體監控**: 檢查物件池使用情況

## 📱 手機開發注意事項

### iOS Safari 特殊處理
```javascript
// iPhone 觸控事件處理
if (navigator.userAgent.includes('iPhone')) {
    button.addEventListener('touchstart', handleButtonClick);
    button.style.touchAction = 'manipulation';
}

// iOS 音效初始化
const initializeAudioForIOS = async () => {
    const audioContext = new AudioContext();
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
};
```

### 響應式設計
```css
/* 手機版適配 */
@media (max-width: 768px) {
    #gameCanvas {
        max-width: calc(100vw - 20px);
        max-height: calc(100vh - 20px);
        width: auto;
        height: auto;
    }
}

/* iPhone 特定優化 */
@media (max-width: 480px) {
    .btn {
        min-height: 44px; /* iOS 推薦的最小觸控區域 */
        font-size: 16px; /* 避免 iOS 自動縮放 */
    }
}
```

## 🎨 EVA 風格設計指南

### 色彩系統
```css
:root {
    /* EVA 主色調 */
    --eva-purple-primary: #6B46C1;
    --eva-purple-dark: #553C9A;
    --eva-orange-accent: #F59E0B;
    --eva-green-success: #10B981;
    
    /* 文字色彩 */
    --eva-text-primary: #E5E7EB;
    --eva-text-japanese: #A78BFA;
    --eva-text-code: #34D399;
}
```

### 字體系統
- **英文字體**: Orbitron (科技感)
- **日文字體**: M PLUS 1 Code
- **代碼字體**: Share Tech Mono
- **中文字體**: Noto Sans JP

### UI 元素設計
- **按鈕**: 發光邊框 + 科技感背景
- **進度條**: 漸變色彩 + 動畫效果
- **彈窗**: 半透明背景 + 邊框光效
- **文字**: 混合語言顯示 + 動態權重

## 🔊 音效系統開發

### Web Audio API 使用
```javascript
// 程式化音效生成
const generateSpellSound = (type) => {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // 設定法術特定的頻率和波形
    switch (type) {
        case 'fireball':
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
            break;
        case 'frostbolt':
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            break;
    }
    
    // 連接音效節點
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 播放音效
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
};
```

### 音效分類管理
- **UI 音效**: 按鈕點擊、懸停
- **法術音效**: 施放、命中、爆炸
- **戰鬥音效**: 受傷、死亡、升級
- **環境音效**: 背景音樂、氛圍音

## 🚀 部署指南

### 本地測試
```bash
# 使用 Python 簡單伺服器
python -m http.server 8000

# 使用 Node.js serve
npx serve .

# 使用 VS Code Live Server
# 右鍵 index.html → Open with Live Server
```

### 產品部署
1. **檢查資源路徑**: 確保所有資源使用相對路徑
2. **壓縮資源**: 優化圖片和音效檔案大小
3. **測試相容性**: 在目標瀏覽器上完整測試
4. **效能驗證**: 確保在低端設備上正常運行

### GitHub Pages 部署
```bash
# 推送到 gh-pages 分支
git checkout -b gh-pages
git push origin gh-pages

# 在 GitHub 設定中啟用 Pages
# Source: Deploy from a branch
# Branch: gh-pages / root
```

## 📚 參考資源

### 技術文檔
- [Canvas API 文檔](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Web Audio API 文檔](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Touch Events 文檔](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)

### 遊戲開發參考
- [HTML5 遊戲開發最佳實踐](https://developer.mozilla.org/en-US/docs/Games)
- [Canvas 效能優化](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [行動端遊戲開發指南](https://developers.google.com/web/fundamentals/native-hardware/touch-and-mouse)

### 設計資源
- [EVA 視覺風格參考](https://wiki.evageeks.org/)
- [科幻 UI 設計靈感](https://www.scifiinterfaces.com/)
- [遊戲 UI 設計案例](https://gameuidatabase.com/)

## 🤝 貢獻指南

### 如何貢獻
1. Fork 專案到你的 GitHub 帳號
2. 創建功能分支：`git checkout -b feature/amazing-feature`
3. 提交變更：`git commit -m '✨ Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 創建 Pull Request

### 代碼風格
- 使用 2 空格縮進
- 函數命名使用 camelCase
- 類別命名使用 PascalCase
- 常數命名使用 UPPER_CASE
- 添加有意義的註釋

### 提交訊息格式
```
類型(範圍): 簡短描述

詳細描述 (可選)

相關問題: #123
```

**類型**:
- ✨ `feat`: 新功能
- 🐛 `fix`: 修復 bug
- 📝 `docs`: 文檔更新
- 💄 `style`: 代碼格式化
- ♻️ `refactor`: 代碼重構
- ⚡ `perf`: 效能優化
- ✅ `test`: 測試相關
- 🔧 `chore`: 其他變更

## 📞 聯絡資訊

**專案維護者**: Claude Code Team  
**專案倉庫**: https://github.com/Chuanyin1202/kanisurvivor  
**問題回報**: GitHub Issues  
**討論區**: GitHub Discussions  

---

**最後更新**: 2025-01-10  
**文檔版本**: v2.0  
**適用於**: Kani: Pixel Mage Survivor v1.0+