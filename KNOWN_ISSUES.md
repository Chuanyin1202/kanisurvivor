# Known Issues - 已知問題

## iPhone 相容性問題 (iPhone Compatibility Issues)

### 🔴 高優先級問題 (High Priority)

#### 1. 按鈕點擊無反應 (Button Click Unresponsive)
- **影響設備**: iPhone (iOS Safari/Chrome)
- **正常設備**: iPad, Android, PC
- **症狀**: 
  - 主選單按鈕點擊後無反應
  - 遊戲內暫停/重新開始按鈕失效
  - 遊戲結束後無法返回選單
- **疑似原因**: 
  - iOS Safari 的觸控事件處理機制差異
  - `touchend` 事件在 iPhone 上的行為與 iPad 不同
  - 可能與 iOS 的 `touch-action` CSS 屬性有關

#### 2. 音效系統無聲 (Audio System Silent)
- **影響設備**: iPhone (iOS Safari/Chrome)
- **正常設備**: iPad, Android, PC
- **症狀**:
  - 所有音效無法播放
  - Web Audio API 初始化可能失敗
  - 用戶互動檢測可能無效
- **疑似原因**:
  - iPhone 對 Web Audio API 的安全限制更嚴格
  - 需要更明確的用戶互動才能啟動音頻上下文
  - 可能需要特別處理 iPhone 的 AudioContext 狀態

### 🟡 中優先級問題 (Medium Priority)

#### 3. 手機控制系統 (Mobile Control Issues)
- **影響設備**: 部分 iPhone 型號
- **症狀**:
  - DPAD 控制器偶爾會卡住
  - 觸控響應延遲
- **狀態**: 需要進一步測試確認

## 技術分析 (Technical Analysis)

### iPhone vs iPad 差異分析
```javascript
// iPhone 可能需要的特別處理
if (navigator.userAgent.includes('iPhone')) {
    // 特別的觸控事件處理
    // 更嚴格的音頻初始化
}
```

### 可能的解決方案 (Potential Solutions)

1. **觸控事件改進**:
   - 使用 `touchstart` 取代 `touchend` 進行按鈕觸發
   - 添加 `touch-action: manipulation` CSS 屬性
   - 實現更精確的觸控座標檢測

2. **音效系統改進**:
   - 為 iPhone 實現特別的音頻初始化流程
   - 添加多重備用音頻啟動機制
   - 實現音效降級方案

3. **用戶體驗改善**:
   - 添加 iPhone 特定的操作提示
   - 實現音效狀態指示器
   - 提供手動音效啟動選項

## 測試矩陣 (Test Matrix)

| 設備類型 | 觸控操作 | 音效系統 | 遊戲操作 | 整體狀態 |
|---------|---------|---------|---------|---------|
| iPhone  | ❌      | ❌      | ❌      | 不可用   |
| iPad    | ✅      | ✅      | ✅      | 正常     |
| Android | ✅      | ✅      | ✅      | 正常     |
| PC      | ✅      | ✅      | ✅      | 正常     |

## 下一步行動 (Next Steps)

1. **緊急修復 (Emergency Fix)**:
   - 為 iPhone 實現特別的事件處理機制
   - 添加音效系統的降級方案

2. **長期改善 (Long-term Improvement)**:
   - 全面重構手機觸控系統
   - 實現更強健的音效管理機制
   - 添加設備特定的最佳化

3. **測試需求 (Testing Requirements)**:
   - 需要更多 iPhone 型號的測試
   - 不同 iOS 版本的相容性測試
   - Safari vs Chrome 行為差異分析

---

**最後更新**: 2024-07-08
**負責人**: Claude Code Team
**優先級**: 高