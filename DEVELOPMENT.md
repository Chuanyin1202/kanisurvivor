# 🛠️ 開發指南與未完成工作

## 📋 未完成工作清單

### 🎨 高優先級
1. **建立真實的遊戲資產**
   - 角色精靈圖（Kani 的不同狀態）
   - 敵人精靈圖（史萊姆、哥布林、獸人、頭目）
   - 法術效果動畫
   - UI 元素圖像
   - 背景和環境圖像

2. **優化遊戲平衡性**
   - 調整敵人血量和傷害
   - 平衡法術冷卻時間和傷害
   - 調整波次難度曲線
   - 經驗值和升級速度

### 🎮 中優先級
3. **完善商店系統 UI**
   - 美化商店界面
   - 添加物品預覽
   - 實現購買確認對話框
   - 添加物品比較功能

4. **實作更多敵人類型**
   - 遠程攻擊敵人
   - 特殊能力敵人（隱形、治療、召喚）
   - 迷你頭目
   - 環境障礙物

5. **擴展法術系統**
   - 新法術類型（治療、護盾、召喚）
   - 法術升級系統
   - 組合法術
   - 被動技能

6. **添加音效和音樂**
   - 背景音樂（主選單、遊戲中、頭目戰）
   - 法術音效
   - 敵人音效
   - UI 音效

7. **實作裝備套裝系統**
   - 套裝效果
   - 套裝收集進度
   - 特殊套裝獎勵

### 🎯 低優先級
8. **完善成就系統 UI**
   - 成就列表界面
   - 進度條顯示
   - 成就通知動畫

9. **行動端優化**
   - 虛擬搖桿
   - 觸控法術切換
   - 介面縮放

10. **實作無人機系統**
    - 跟隨無人機
    - 攻擊無人機
    - 無人機升級

11. **添加粒子效果**
    - 法術爆炸效果
    - 死亡效果
    - 升級效果
    - 環境粒子

12. **UI/UX 改進**
    - 動畫過渡
    - 響應式設計改進
    - 無障礙功能

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

## 📁 專案結構說明

### 核心檔案
- `index.html` - 主遊戲頁面
- `js/main.js` - 遊戲主控制器
- `js/config/gameBalance.js` - 遊戲平衡配置

### 關鍵類別
- `Game` - 主遊戲循環
- `Player` - 玩家角色
- `Enemy` - 敵人基類
- `WaveManager` - 波次管理
- `Renderer` - 渲染引擎

## 🔧 開發工作流程

### 添加新功能
1. 在 `gameBalance.js` 中添加配置
2. 創建或修改相關類別
3. 在 `main.js` 中整合
4. 測試功能
5. 更新文檔

### 添加新敵人類型
1. 在 `gameBalance.js` 的 `enemies` 中添加配置
2. 在 `Enemy` 類中添加特殊行為
3. 在 `WaveManager` 中配置生成規則
4. 添加對應的精靈圖

### 添加新法術
1. 在 `gameBalance.js` 的 `spells` 中添加配置
2. 在 `Projectile` 類中實作效果
3. 在 `Player` 類中添加切換邏輯
4. 添加視覺和音效

## 🐛 已知問題

### 效能問題
- 大量敵人時可能出現卡頓
- 粒子效果可能影響效能

### 平衡問題
- 某些法術可能過強或過弱
- 敵人生成速度需要調整

### UI 問題
- 某些螢幕尺寸下介面可能不完整
- 需要更好的行動端支援

## 📊 效能監控

### 重要指標
- FPS（目標：60fps）
- 記憶體使用量
- 物件池使用率
- 繪製調用次數

### 監控方法
```javascript
// 在瀏覽器開發者工具中
performance.mark('gameLoop-start');
// 遊戲邏輯
performance.mark('gameLoop-end');
performance.measure('gameLoop', 'gameLoop-start', 'gameLoop-end');
```

## 🧪 測試指南

### 功能測試
- 玩家移動和攻擊
- 敵人 AI 行為
- UI 互動
- 存檔載入

### 效能測試
- 長時間遊玩測試
- 大量敵人場景
- 不同裝置測試

### 瀏覽器兼容性
- Chrome（主要目標）
- Firefox
- Safari
- Edge

## 📚 參考資源

### 遊戲設計
- [Game Programming Patterns](http://gameprogrammingpatterns.com/)
- [Canvas API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### 像素藝術
- [Pixel Art Tutorials](https://lospec.com/pixel-art-tutorials)
- [Color Palette Tools](https://coolors.co/)

### 音效資源
- [Freesound](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)

---

**最後更新**: 2024-12-XX  
**維護者**: Claude Code AI Assistant