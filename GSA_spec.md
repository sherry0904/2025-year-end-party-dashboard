# High-Fidelity Year-End Party Dashboard (Weiya)
### Vue 3 (ESM) • No Build Step • Naval Command Center UI

---

# 1. Role & Objective
You are a **Lead Creative Frontend Developer**。
你的任務是建立一套 **高擬真、高質感的尾牙 Dashboard**，並以 **Vue 3（ESM 無編譯流程）** 來實作。

目前專案階段：**Production Implementation（正式串接 Google Apps Script API）**。

API 會回傳：
- `roster`：所有員工名單
- `checkIns`：現場報到紀錄

---

# 2. Architecture – No-Build ES Modules
整個專案由三個檔案組成：

1. **index.html**
   - HTML 結構
   - CDN 資源
   - import map（Vue ESM）

2. **style.css**
   - 所有樣式、色票、Glassmorphism 效果
   - 動畫、HUD 裝飾

3. **app.js**
   - Vue 3 App
   - GSAP 動畫
   - tsParticles 背景效果
   - API Polling 與 Diffing 邏輯

---

# 3. Tech Stack & Libraries（CDN 方式載入）
- **Framework:** Vue 3（ES Module build）
- **Animation:** GSAP（用於 UI entrance、Pulse 效果）
- **Visual FX:** tsParticles（深海氣泡/懸浮粒子）
- **Fonts:**
  - *Orbitron* — 標題與數字
  - *Share Tech Mono* — 資料列表、Log、指揮中心風格

---

# 4. Visual Style – “Naval Command Center”
深海科幻指揮中心 UI。

## Color Palette
- 背景：深海藍 `#020c1b`
- 邊框/強調色：霓虹青 `#64ffda`
- Pulse/Active：雷達綠 `#0aff00`
- 缺席/未報到：灰 `#8892b0`

## Glassmorphism HUD Panel
```
background: rgba(17, 34, 64, 0.75);
border: 1px solid rgba(100, 255, 218, 0.3);
backdrop-filter: blur(12px);
```
可加入 HUD 風角標 SVG、霓虹線條、科幻邊框裝飾。

---

# 5. Layout Specification（CSS Grid）
採用三欄 Dashboard，滿版高度 `100vh`，不捲動。

```
| Left 25% | Center 45% | Right 30% |
```

## 左側 25% — Crew Manifest（報到 Log）
- 顯示最新報到紀錄（最多 10 筆）
- 動畫：TransitionGroup Slide-Down

## 中間 45% — Sonar Radar（主要狀態）
- 雷達動畫（CSS infinite rotation）
- 總報到人數
- 新增報到時：GSAP Pulse 效果

## 右側 30% — Comm Channel（員工祝福訊息）
- 顯示最新訊息（最多 5 筆）
- 動畫：TransitionGroup Slide-Up 堆疊

## 隱藏層 — Admin Roster Modal（按 `M` 顯示）
- 全螢幕 Overlay
- 顯示 roster 全員工
- ARRIVED → 綠色、MISSING → 灰色
- 上方顯示 Missing/Total 統計

---

# 6. Application Logic（app.js）

## 6.1 API Configuration
```js
const API_URL = 'PLACEHOLDER_FOR_GAS_URL';
```
由你後續人工填入 GAS 網址。

---

## 6.2 Expected JSON Structure
```json
{
  "roster": [ { "id": "1167", "name": "Luffy", "dept": "Captain" } ],
  "checkIns": [ { "id": "1167", "message": "Meat!", "timestamp": "..." } ]
}
```

---

# 6.3 Data Processing（Diffing Logic）
每 **3000ms** 執行一次 Polling：

1. 從 API 取得 `roster` 與 `checkIns`
2. 產生 `rosterMap = Map(id → employeeData)`
3. 維護 `processedIds: Set`

### For each check-in:
若該 id **不在 processedIds** → 表示新報到：

- 新增到 processedIds
- 使用 rosterMap 找到 name/department
- 更新 Left Panel（unshift，最多 10 筆）
- 更新 Right Panel（push，最多 5 筆）
- Center Panel totalCount++
- 觸發 GSAP Pulse 動畫

---

# 6.4 Admin Feature（按 `M` 鍵）
- 監聽 `keydown`
- 按 `M` → 切換 Modal 顯示/隱藏
- Modal 內容：
  - roster 全員工 Grid
  - 若 id 在 processedIds → 顯示綠色（ARRIVED）
  - 否則顯示灰色（MISSING）
  - Header 顯示：`Missing: X / Total: Y`

---

# 7. Animation Details
- **Left Log**：TransitionGroup Slide-Down
- **Right Wishes**：TransitionGroup Slide-Up 堆疊動畫
- **Radar**：CSS 旋轉 + GSAP Pulse
- **Background**：tsParticles 緩速上升的深海氣泡

---

# 8. Output Requirement
請提供以下三個完整檔案內容：

1. `index.html`
   - HTML 結構、CDN 資源、importmap、載入 app.js
   - 必須包含：
     ```html
     <script type="module" src="./app.js"></script>
     ```

2. `style.css`
   - 色票、Glassmorphism Panels
   - Radar、TransitionGroup 動畫
   - tsParticles 背景定位

3. `app.js`
   - Vue App + State
   - Polling + Diffing
   - GSAP Pulse
   - tsParticles 設定
   - Admin Modal 切換
