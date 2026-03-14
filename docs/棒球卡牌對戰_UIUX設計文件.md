# ⚾ 棒球卡牌對戰 — UI/UX 設計文件

**Baseball Card Duel — UI/UX Design Specification**

版本 1.0 ｜ 2026 年 3 月
適用平台：Steam (1920×1080) ｜ iPad (2388×1668) ｜ iPhone (2796×1290) ｜ Android 手機/平板

---

## 0. 設計原則

**核心體驗目標：** 讓玩家感覺自己正在一座小型球場裡打一場手牌棒球。

1. **一眼掌握全局** — 球數、壘包、比分、出局數永遠可見，不需翻頁查找。
2. **觸手可及** — 手牌在螢幕最下方，拇指自然觸及；所有互動元素 ≥ 48dp。
3. **節奏感** — 出牌→反應→結算的動畫時長總和 ≤ 2.5 秒，保持緊湊。
4. **視覺層級** — 用色彩與大小區分「此刻該看什麼」和「背景資訊」。
5. **零文字也能玩** — 圖示優先，文字輔助；色盲安全配色。

---

## 1. 色彩系統

### 1.1 主色板

| 名稱 | 色碼 | 用途 |
|------|------|------|
| **深綠 Primary** | `#1B4332` | 主色調、標題、重要文字 |
| **草地綠 Field** | `#2D6A4F` | 球場底色、表頭 |
| **淺綠 Surface** | `#B7E4C7` | 卡牌可出狀態高亮 |
| **金色 Accent** | `#D4A017` | 強調色、全壘打特效、得分 |
| **紅土 Dirt** | `#A0522D` | 內野區域、壘包周圍 |
| **白色 White** | `#FAFDF6` | 卡牌底色、文字 |
| **深灰 Dark** | `#1A1A1A` | 正文文字 |
| **中灰 Muted** | `#6B7280` | 次要資訊、不可操作狀態 |
| **警告紅** | `#C0392B` | 出局標記、三振、錯誤提示 |
| **安全藍** | `#2471A3` | 壞球標記、保送提示 |

### 1.2 語義色

| 狀態 | 顏色 | 說明 |
|------|------|------|
| 可互動 | `#B7E4C7` 邊框發光 | 該牌可以出 |
| 已選中 | `#D4A017` 金邊 + 上浮 40px | 玩家已點選 |
| 不可操作 | 降低至 40% 不透明度 | 該牌條件不符 |
| 對手回合 | 全場蒙上 `rgba(0,0,0,0.15)` | 提示等待中 |
| 反應鏈啟動 | 場中央展開鏈條區塊 | 攻守互動時段 |

### 1.3 色盲安全

所有紅/綠對比元素同時使用形狀區分：壞球 = 圓形（●），好球 = 三角形（▲），出局 = 叉形（✕）。BSO 指示器同時標注 B/S/O 文字。

---

## 2. 字型系統

| 層級 | 字型 | 字重 | 大小 (PC) | 大小 (手機) | 用途 |
|------|------|------|-----------|-------------|------|
| H1 | Noto Sans TC | Bold | 36px | 28px | 畫面標題 |
| H2 | Noto Sans TC | Bold | 28px | 22px | 區塊標題 |
| H3 | Noto Sans TC | Bold | 22px | 18px | 子標題 |
| Body | Noto Sans TC | Regular | 18px | 15px | 說明文字 |
| Caption | Noto Sans TC | Regular | 14px | 12px | 次要資訊 |
| Number | Noto Sans Mono | Bold | 48px | 36px | 比分數字 |
| Card Title | Noto Sans TC | Bold | 16px | 13px | 卡片名稱 |
| Card Desc | Noto Sans TC | Regular | 12px | 10px | 卡片說明 |

---

## 3. 遊戲流程總覽

### 3.1 全局流程圖

```
┌──────────┐
│ 啟動畫面  │ ← 品牌 Logo + 載入
└────┬─────┘
     ▼
┌──────────┐
│ 標題畫面  │ ← 主選單
└────┬─────┘
     ├──────────────┬──────────────┬──────────────┐
     ▼              ▼              ▼              ▼
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ 單人對戰 │  │ 本地雙人  │  │ 線上對戰  │  │   設定    │
│ (vs AI) │  │ (同機)   │  │ (Phase4) │  │          │
└────┬────┘  └────┬─────┘  └────┬─────┘  └──────────┘
     │            │             │
     ▼            ▼             ▼
┌──────────────────────────────────┐
│         遊戲設定畫面              │ ← 局數/難度/先攻後攻
└───────────────┬──────────────────┘
                ▼
┌──────────────────────────────────┐
│         教學引導（首次）          │ ← 可跳過
└───────────────┬──────────────────┘
                ▼
┌──────────────────────────────────┐
│          遊戲主畫面               │ ← 核心遊玩
│  ┌─────────────────────────┐     │
│  │  回合循環               │     │
│  │  抽牌→出牌→反應→結算→補牌│     │
│  └─────────────────────────┘     │
└───────────────┬──────────────────┘
                ▼
┌──────────────────────────────────┐
│          結算畫面                 │ ← 勝敗/統計
└───────────────┬──────────────────┘
                ├────────────┐
                ▼            ▼
          ┌──────────┐ ┌──────────┐
          │  再來一場  │ │ 回主選單  │
          └──────────┘ └──────────┘
```

### 3.2 單回合流程（遊戲核心循環）

```
                    ┌─────────────┐
                    │   抽牌階段   │
                    │ 攻方抽 1 張  │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │   出牌階段   │
                    │ 攻方選牌打出 │◄─── 守方可打「投手牽制」
                    └──────┬──────┘
                           ▼
                   ┌───────────────┐
                   │ 是否為攻擊牌？ │
                   └───┬───────┬───┘
                   否  │       │ 是
                       ▼       ▼
              ┌──────────┐ ┌──────────────┐
              │ 直接結算  │ │  反應鏈階段   │
              │(壞球/好球)│ │ 守方可回應？  │
              └────┬─────┘ └──┬───────┬───┘
                   │      是  │       │ 否/跳過
                   │          ▼       │
                   │   ┌────────────┐ │
                   │   │ 守方出防守牌│ │
                   │   └──────┬─────┘ │
                   │          ▼       │
                   │   ┌────────────┐ │
                   │   │ 攻方可反制？│ │
                   │   └──┬─────┬───┘ │
                   │   是 │     │否    │
                   │      ▼     │      │
                   │ ┌────────┐ │      │
                   │ │攻方出牌│ │      │
                   │ │(失誤等)│ │      │
                   │ └───┬────┘ │      │
                   │     ▼      ▼      ▼
                   │  ┌─────────────────┐
                   │  │    結算階段      │
                   │  │ 最後生效牌執行   │
                   │  └────────┬────────┘
                   │           │
                   ▼           ▼
                ┌─────────────────┐
                │    補牌階段      │
                │ 雙方補至 7 張    │
                └────────┬────────┘
                         ▼
                ┌─────────────────┐
                │  出局數 ≥ 3？    │
                └──┬──────────┬───┘
                否 │          │ 是
                   ▼          ▼
            回到「抽牌」  ┌──────────┐
                         │ 半局結束  │
                         │ 攻守交換  │
                         └──────────┘
```

---

## 4. 各畫面詳細規格

### 4.1 啟動畫面 (Splash Screen)

**用途：** 品牌展示 + 資源載入

**停留時間：** 最短 1.5 秒，最長至載入完成

**佈局：**

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                                             │
│              [品牌 Logo]                     │
│              ⚾ 棒球卡牌對戰                  │
│                                             │
│            ────────────────                  │
│            [Loading Bar 60%]                 │
│                                             │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

**元件：**

| 元件 | 規格 | 說明 |
|------|------|------|
| Logo | 256×256px, 居中 | 棒球+卡牌組合圖標 |
| 遊戲名稱 | H1, `#FAFDF6`, 置中 | Logo 下方 24px |
| 載入條 | 寬 40% 螢幕, 高 6px, 圓角 3px | 背景 `#2D6A4F`, 進度 `#D4A017` |
| 背景 | 漸層 `#1B4332` → `#0B2920` | 由上而下 |

**動畫：** Logo 淡入 (0.5s) → 載入條推進 → 完成後整體淡出 (0.3s)

---

### 4.2 標題畫面 (Title Screen)

**用途：** 主選單入口

**佈局：**

```
┌─────────────────────────────────────────────┐
│  [v1.0]                          [⚙ 設定]   │
│                                             │
│              ⚾                              │
│          棒球卡牌對戰                         │
│       BASEBALL CARD DUEL                    │
│                                             │
│       ┌───────────────────┐                 │
│       │   ⚔ 單人對戰      │                 │
│       └───────────────────┘                 │
│       ┌───────────────────┐                 │
│       │   👥 本地雙人      │                 │
│       └───────────────────┘                 │
│       ┌───────────────────┐                 │
│       │   🌐 線上對戰      │  ← 灰色鎖定     │
│       └───────────────────┘                 │
│       ┌───────────────────┐                 │
│       │   📖 遊戲規則      │                 │
│       └───────────────────┘                 │
│                                             │
│              © 2026 Studio                  │
└─────────────────────────────────────────────┘
```

**元件規格：**

| 元件 | 尺寸 | 互動 |
|------|------|------|
| 遊戲標題 | H1 + 副標 Body | 無，裝飾用 |
| 選單按鈕 | 360×64px, 圓角 12px | Hover: 放大 1.05x + 金色邊框；Press: 縮小 0.95x |
| 設定齒輪 | 48×48px, 右上角 padding 24px | 點擊進入設定畫面 |
| 版本號 | Caption, 左上角 | 靜態文字 |
| 線上對戰 | 同上但 opacity 0.4 | 點擊彈出提示「即將開放」 |

**背景：** 球場遠景模糊圖 + 深綠漸層覆蓋（`rgba(27,67,50,0.7)`）

**動畫：**
- 進場：Logo 從上方滑入 (0.4s) → 按鈕依序由下方彈入 (間隔 0.1s)
- 閒置：Logo 微呼吸縮放 (0.98–1.02, 循環 3s)

---

### 4.3 遊戲設定畫面 (Pre-Game Setup)

**用途：** 選擇遊戲參數後開始比賽

**佈局：**

```
┌─────────────────────────────────────────────┐
│  [← 返回]           遊戲設定                 │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  對戰模式    [vs AI ▼]              │    │
│  │  AI 難度     [● 初級 ○ 中級 ○ 高級] │    │
│  │  比賽局數    [○ 3局  ● 5局  ○ 9局]  │    │
│  │  先攻選擇    [● 客隊(先攻) ○ 主隊]   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  📋 牌組總覽                         │    │
│  │  壞球×16  好球×12  安打×6  ...       │    │
│  │           [展開完整列表 ▼]            │    │
│  └─────────────────────────────────────┘    │
│                                             │
│       ┌───────────────────────────┐         │
│       │      ⚾ 開始比賽！         │         │
│       └───────────────────────────┘         │
│                                             │
└─────────────────────────────────────────────┘
```

**元件規格：**

| 元件 | 類型 | 說明 |
|------|------|------|
| 返回按鈕 | IconButton `←` 48×48 | 回標題畫面 |
| 對戰模式 | OptionButton (下拉選單) | vs AI / 本地雙人 |
| AI 難度 | RadioButton 群組 | 僅 vs AI 時顯示 |
| 比賽局數 | RadioButton 群組 | 3/5/9 局 |
| 先攻選擇 | RadioButton 群組 | 客隊先攻/主隊後攻 |
| 牌組總覽 | 可摺疊面板 | 展示所有卡牌張數，讓新手了解牌組 |
| 開始按鈕 | 480×72px, 金色漸層 | Press 後 1s 過場進入遊戲 |

**動畫：** 設定面板由左側滑入 (0.3s)；開始按鈕按下後全場放射光效 (0.5s) → 過場

---

### 4.4 遊戲主畫面 (Game Screen) — 核心畫面

**用途：** 整場比賽的操作主畫面

#### 4.4.1 整體佈局 (PC/平板 1920×1080)

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 第1局 上半  │  客隊 0 : 0 主隊  │  牌庫:78  │  ⏸ 暫停  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────┐  ┌─────┐ │
│  │          [ 對手手牌 — 7 張牌背 ]              │  │ B●○ │ │
│  │          🂠 🂠 🂠 🂠 🂠 🂠 🂠                 │  │ S○○ │ │
│  └──────────────────────────────────────────────┘  │ O○○ │ │
│                                                    └─────┘ │
│                                                             │
│                       ┌───────┐                             │
│                       │  二壘  │                             │
│                  ┌────┘       └────┐                        │
│                  │                 │                         │
│              ┌───┴──┐         ┌───┴──┐                     │
│              │ 三壘  │         │ 一壘  │                     │
│              └───┬──┘         └───┬──┘                     │
│                  │                 │                         │
│                  └────┐       ┌────┘                        │
│                       │ 本壘  │                             │
│                       └───────┘                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              [ 反應鏈展示區 — 預設隱藏 ]               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [安打] [內野滾地] [外野高飛] [壞球] [好球] [盜壘] [失誤]│   │
│  │                  [ 我的手牌 ]                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   ▶ 出牌          │  │   ⏭ 跳過     │  │  📖 規則     │  │
│  └──────────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### 4.4.2 手機版佈局 (iPhone 2796×1290 橫向)

手機版將頂部資訊壓縮為單行，球場縮小至螢幕中上方，手牌區佔據下方 40% 高度以利拇指操作。

```
┌───────────────────────────────────────┐
│ 1局上 │ 0:0 │ B●○ S○○ O○○ │ ⏸     │  ← 壓縮頂欄 48px
├───────────────────────────────────────┤
│  🂠🂠🂠🂠🂠🂠🂠  (對手手牌 - 縮小)       │  ← 對手牌列 64px
├───────────────────────────────────────┤
│                                       │
│          ◇ 二壘                        │
│      ◇ 三壘    ◇ 一壘                  │  ← 球場區 40%
│          ◇ 本壘                        │
│                                       │
├───────────────────────────────────────┤
│  [反應鏈區 — 需要時浮現]               │
├───────────────────────────────────────┤
│                                       │
│  [安打][滾地][高飛][壞球][好球][盜壘][失]│  ← 手牌 40%
│                                       │  ← 可左右滑動
│     [ ▶ 出牌 ]    [ ⏭ 跳過 ]          │
└───────────────────────────────────────┘
```

#### 4.4.3 各元件詳細規格

##### A. 頂部資訊列 (Top Bar)

| 元件 | 規格 | 更新時機 |
|------|------|----------|
| 局數顯示 | H3, `#FAFDF6` | 每半局切換時 |
| 比分 | Number 字型, `#D4A017` | 每次得分時（數字跳動動畫 0.3s） |
| 牌庫剩餘 | Caption, `#6B7280` | 每次抽牌時 |
| 暫停按鈕 | 48×48 圖示 | 點擊彈出暫停面板 |

**高度：** PC 64px / 手機 48px
**背景：** `rgba(27,67,50,0.9)` 半透明

##### B. BSO 球數指示器 (Ball-Strike-Out)

```
  B ● ● ○ ○      ← 壞球：藍色實心圓 #2471A3
  S ● ○ ○        ← 好球：紅色三角 #C0392B
  O ● ○ ○        ← 出局：紅色叉 #C0392B
```

| 元件 | 規格 |
|------|------|
| 位置 | PC: 右側面板；手機: 頂欄內 |
| 圓點大小 | PC 20px / 手機 14px |
| 亮燈動畫 | 縮放彈跳 0→1.2→1.0 (0.2s) |
| 歸零動畫 | 所有燈同時淡出 (0.3s) |

**互動：** 長按 BSO 區域顯示文字說明「壞球 2 / 好球 1 / 出局 1」

##### C. 球場區域 (Field Area)

| 元素 | 規格 | 說明 |
|------|------|------|
| 球場底圖 | 菱形鑽石場地，草地綠+紅土 | 45° 旋轉菱形，頂點為二壘 |
| 壘包標記 | 32×32px 菱形方塊 | 空壘: `#6B7280` 半透明；有人: `#D4A017` 金色發光 |
| 跑者圖標 | 24×24px 人形剪影 | 出現在對應壘包旁 |
| 本壘 | 五角形，特殊標記 | 得分時閃光動畫 |

**壘包動畫：**
- 跑者上壘：圖標從前一壘滑動到目標壘 (0.4s, ease-out)
- 跑者得分：圖標滑入本壘 → 爆發金色粒子 → 比分+1 跳動
- 全壘打：所有跑者依序衝回本壘 (每人間隔 0.2s) → 全場閃金光

**手機適配：** 球場佔螢幕寬度 60%，高度依比例縮放；壘包觸控區擴大至 64×64dp

##### D. 對手手牌區 (Opponent Hand)

| 元件 | 規格 |
|------|------|
| 牌張顯示 | 牌背朝上，扇形微展開 |
| 卡牌大小 | PC: 80×112px / 手機: 48×67px |
| 數量標示 | 右下角小數字 badge「×7」 |
| 動畫 | 對手出牌時，一張牌翻轉飛到場中央 |

##### E. 我方手牌區 (Player Hand)

| 元件 | 規格 |
|------|------|
| 卡牌大小 | PC: 120×168px / 手機: 90×126px |
| 排列 | 水平排列，微扇形展開（中間牌最高） |
| 可出牌 | 邊框綠色發光 `#B7E4C7`，可點擊 |
| 不可出牌 | 灰化 (opacity 0.4)，點擊無反應 |
| 已選中 | 上浮 40px + 金色邊框 `#D4A017` + 放大 1.1x |
| 手機滑動 | 卡牌超過螢幕寬度時可左右滑動瀏覽 |

**手牌互動流程：**

```
  點擊牌 → 牌上浮 (選中)
         → 再點同一張 → 確認出牌（或點「出牌」按鈕）
         → 點另一張 → 切換選中
         → 長按牌 → 顯示卡牌詳細說明 (Tooltip)
  手機：
         → 拖曳牌向上滑出 → 出牌
         → 單點 → 選中 + 顯示 Tooltip
         → 點「出牌」按鈕 → 確認出牌
```

##### F. 反應鏈展示區 (Reaction Chain UI)

反應鏈啟動時，從畫面下方手牌區與球場之間展開一個橫向卡牌條。

```
┌──────────────────────────────────────────────────┐
│  攻：[外野高飛] ──→ 守：[外野接殺] ──→ 攻：[失誤] │
│                                    [等待守方...]  │
└──────────────────────────────────────────────────┘
```

| 元件 | 規格 |
|------|------|
| 容器 | 全寬橫條，高 120px，背景 `rgba(0,0,0,0.6)` |
| 鏈中卡牌 | 80×112px 縮略圖，依序排列 |
| 箭頭 | 卡牌間 `→` 符號，`#6B7280` |
| 標記 | 每張牌上方標注「攻」/「守」 |
| 等待提示 | 鏈尾閃爍文字「等待守方回應...」或「你可以回應！」 |

**動畫：**
- 展開：由下方滑入 (0.3s)
- 新牌加入：從出牌方飛入鏈尾 (0.3s)
- 收合結算：所有牌收攏至生效牌 → 放大高亮 → 執行效果

##### G. 行動按鈕 (Action Buttons)

| 按鈕 | 顯示時機 | 尺寸 | 顏色 |
|------|----------|------|------|
| **出牌** | 有選中的可出牌時 | 200×56px | `#2D6A4F` 綠底白字 |
| **跳過** | 反應鏈中 / 無可出牌時 | 160×56px | `#6B7280` 灰底白字 |
| **規則** | 永遠可見 | 48×48 圖示 | `#6B7280` |

**狀態變化：**
- 攻方回合：顯示「出牌」＋「規則」
- 反應階段（我方可回應）：顯示「出牌」＋「跳過」
- 反應階段（等待對方）：按鈕全部灰化
- 對手回合：顯示「等待對手...」文字

##### H. 卡牌資訊浮窗 (Card Tooltip)

長按或 hover 卡牌時顯示。

```
┌─────────────────────────┐
│  ⚾ 外野高飛              │  ← H3, 卡牌名稱
│  Outfield Slugging       │  ← Caption, 英文名
│─────────────────────────│
│  效果：打者上二壘         │
│  　　　壘上跑者推進 2 壘  │
│─────────────────────────│
│  使用條件：球數 ≥ 2      │
│  　　　　  使用後球數歸零 │
│─────────────────────────│
│  可被反制：外野接殺、界外球│
│─────────────────────────│
│  💡 長打牌，適合壘上有人  │  ← 策略提示
│     時使用推進跑者。      │
└─────────────────────────┘
```

| 元件 | 規格 |
|------|------|
| 面板 | 320×自適應高度, 圓角 12px, 陰影 |
| 背景 | `#FAFDF6` 白底 |
| 位置 | 跟隨滑鼠/手指，不超出螢幕邊界 |
| 出現動畫 | 淡入 + 微縮放 (0.15s) |
| 策略提示 | 淺黃底色 `#FFF8E1`, 💡 圖標 |

##### I. 回合提示器 (Turn Indicator)

```
  ┌────────────────────┐
  │  ⚾ 你的攻擊回合！   │  ← 攻方回合：金色
  └────────────────────┘

  ┌────────────────────┐
  │  🛡 等待守備回應...  │  ← 等待：灰色
  └────────────────────┘

  ┌────────────────────┐
  │  🛡 你可以防守反應！ │  ← 守方可反應：紅色
  └────────────────────┘
```

| 狀態 | 文字 | 顏色 | 位置 |
|------|------|------|------|
| 攻方回合 | 「你的攻擊回合！」 | `#D4A017` | 畫面中上方，球場上方 |
| 等待對方 | 「等待對手...」 | `#6B7280` | 同上 |
| 可反應 | 「你可以防守反應！」 | `#C0392B` | 同上，附帶脈衝動畫 |
| 半局切換 | 「攻守交換！」 | `#FAFDF6` | 全螢幕置中，大字 (1.5s) |

---

### 4.5 暫停面板 (Pause Dialog)

**觸發：** 點擊暫停按鈕 / 手機按返回鍵

```
┌───────────────────────────┐
│         ⏸ 暫停             │
│                           │
│    [▶ 繼續比賽]            │
│    [🔊 音效設定]            │
│    [📖 查看規則]            │
│    [🏳 投降認輸]            │
│    [🚪 回到主選單]          │
│                           │
└───────────────────────────┘
```

**背景：** 全螢幕 `rgba(0,0,0,0.6)` 遮罩
**面板：** 400×360px, 居中, 圓角 16px, `#FAFDF6`
**動畫：** 遮罩淡入 + 面板由上方落入 (0.3s)

---

### 4.6 結算畫面 (Result Screen)

**佈局：**

```
┌─────────────────────────────────────────────┐
│                                             │
│              🏆 勝利！                       │
│          （或 😔 落敗...）                    │
│                                             │
│        ┌───────────────────────┐            │
│        │   客隊  3  :  1  主隊  │            │
│        └───────────────────────┘            │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  比賽統計                            │   │
│   │─────────────────────────────────────│   │
│   │  局數明細    1局  2局  3局  合計      │   │
│   │  客隊        1    0    2    3        │   │
│   │  主隊        0    1    0    1        │   │
│   │─────────────────────────────────────│   │
│   │  安打數      5    3                  │   │
│   │  全壘打      1    0                  │   │
│   │  三振數      2    4                  │   │
│   │  失誤數      1    2                  │   │
│   │  最長反應鏈  3 層                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│    [🔄 再來一場]         [🏠 回主選單]        │
│                                             │
└─────────────────────────────────────────────┘
```

**勝利動畫：** 金色粒子從上方灑落 + 獎盃圖示放大彈入 + 比分數字逐位跳動
**落敗動畫：** 畫面色調微暗 + 結果文字輕輕落入

**統計項目：**

| 統計 | 說明 |
|------|------|
| 局數明細 | 每局雙方得分 |
| 安打數 | 攻擊牌成功生效次數 |
| 全壘打 | 全壘打成功次數 |
| 三振數 | 被三振的人次 |
| 失誤數 | 失誤牌使用次數 |
| 最長反應鏈 | 該場最長的反應鏈層數 |

---

### 4.7 設定畫面 (Settings Screen)

```
┌─────────────────────────────────────────────┐
│  [← 返回]              設定                  │
│                                             │
│  🔊 音效                                    │
│     主音量     [━━━━━━━━●━━] 80%            │
│     背景音樂   [━━━━━━●━━━━] 60%            │
│     音效       [━━━━━━━━━●━] 90%            │
│                                             │
│  🎮 遊戲                                    │
│     動畫速度   [○ 正常  ● 快速  ○ 跳過]     │
│     自動補牌   [ON ●━━━━━━━○ OFF]           │
│     卡牌提示   [ON ●━━━━━━━○ OFF]           │
│                                             │
│  🌐 語言                                    │
│     [● 繁體中文  ○ English  ○ 日本語]       │
│                                             │
│  📱 顯示                                    │
│     螢幕方向   [● 橫向  ○ 自動]             │
│                                             │
│  ℹ️ 關於                                    │
│     版本 1.0.0 │ 授權 │ 隱私政策             │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 4.8 教學引導 (Tutorial Dialog)

首次遊玩時自動觸發，共 8 步驟。以半透明遮罩 + 高亮聚焦區域的方式引導。

| 步驟 | 聚焦元素 | 說明文字 | 指示 |
|------|----------|----------|------|
| 1 | 手牌區 | 「這是你的手牌！每回合從中選一張出牌。」 | 箭頭指向手牌 |
| 2 | BSO 指示器 | 「這裡顯示球數。壞球 4 個保送，好球 3 個三振。」 | 高亮 BSO |
| 3 | 球場壘包 | 「打者上壘後會出現在壘包上。推到本壘就得分！」 | 高亮球場 |
| 4 | 計分板 | 「雙方得分在這裡。3 局結束分數高的贏。」 | 高亮比分 |
| 5 | 一張可出的牌 | 「綠色發光的牌代表現在可以出。試試點擊這張牌！」 | 互動教學 |
| 6 | 出牌按鈕 | 「選好牌後，點這裡確認出牌。」 | 互動教學 |
| 7 | 反應鏈區 | 「對手可能會防守反應！你也可以再回應形成反應鏈。」 | 動畫演示 |
| 8 | 跳過按鈕 | 「如果不想回應，點跳過讓對手的牌生效。準備好了嗎？」 | 結束教學 |

**可跳過：** 任意步驟可按「跳過教學」結束
**可重啟：** 設定畫面中可重新觸發教學

---

## 5. 互動動線總表

### 5.1 攻方出牌動線

```
[玩家手牌]
    │
    ├─ 點擊可出的牌 ──→ 牌上浮(選中) ──→ 顯示 Tooltip
    │                                      │
    │                          ┌────────────┤
    │                          │            │
    │                    再點同一張牌    點「出牌」按鈕
    │                          │            │
    │                          └─────┬──────┘
    │                                │
    │                          牌飛出動畫
    │                                │
    │                     ┌──────────┴──────────┐
    │                     │                     │
    │               壞球/好球               攻擊牌/特殊牌
    │                     │                     │
    │              直接結算效果           進入反應鏈階段
    │                     │                     │
    │              BSO 更新動畫         反應鏈區展開
    │                     │                     │
    │              補牌動畫              等待守方回應
    │                     │                     │
    └─────────────────────┴─────────────────────┘
```

### 5.2 守方反應動線

```
[反應鏈啟動 — 「你可以防守反應！」]
    │
    ├─ 手牌中可用的反應牌高亮
    │
    ├─ 點擊反應牌 ──→ 牌上浮 ──→ 確認出牌
    │                              │
    │                        牌飛入反應鏈
    │                              │
    │                        等待攻方回應
    │                        (攻方可出失誤)
    │
    └─ 點「跳過」──→ 反應鏈結算
                          │
                    播放結算動畫
                          │
                    執行生效牌效果
                          │
                    更新壘包/比分/出局
                          │
                    補牌 → 下一回合
```

### 5.3 全壘打特殊動線

```
[攻方出「全壘打」牌（需 3-3 滿球數）]
    │
    ├─ 反應鏈啟動（守方可出「界外球」）
    │     │
    │     ├─ 守方出界外球 → 全壘打無效 → 好球+1 → 繼續
    │     │
    │     └─ 守方跳過 → 全壘打生效！
    │                       │
    │                 特殊全壘打演出：
    │                 ① 畫面微慢動作 (0.3s)
    │                 ② 卡牌放大至螢幕中央 (0.4s)
    │                 ③ 金色衝擊波特效 (0.5s)
    │                 ④ 所有跑者依序衝回本壘 (每人 0.3s)
    │                 ⑤ 計分板數字跳動 + 歡呼音效
    │                 ⑥ 「全壘打！！！」大字浮現 (1s)
    │                 ⑦ 回復正常 → 補牌 → 下一回合
```

### 5.4 半局結束動線

```
[第三個出局完成]
    │
    ├─ BSO 出局欄全滿
    │
    ├─ 畫面中央浮現「三出局！攻守交換」(1.2s)
    │
    ├─ 球場跑者圖標淡出
    │
    ├─ 手牌區上下翻轉動畫（表示攻守交換）
    │     上方(對手)牌背翻為牌面
    │     下方(我方)牌面翻為牌背
    │     → 其實就是視角切換
    │
    ├─ BSO 歸零
    │
    └─ 新半局開始 → 抽牌階段
```

---

## 6. 動畫規格總表

| 動畫名稱 | 觸發時機 | 時長 | 緩動曲線 | 說明 |
|----------|----------|------|----------|------|
| 卡牌 hover | 滑鼠移上 | 0.1s | ease-out | Y 軸上移 20px |
| 卡牌選中 | 點擊 | 0.15s | ease-out | Y 軸上移 40px + 放大 1.1x |
| 卡牌出牌 | 確認出牌 | 0.4s | ease-in-out | 飛到場中央 + 翻轉 |
| 卡牌抽取 | 抽牌階段 | 0.3s | ease-out | 從牌庫飛入手牌最右側 |
| BSO 亮燈 | 壞球/好球/出局 | 0.2s | bounce | 縮放 0→1.2→1.0 |
| BSO 歸零 | 球數重置 | 0.3s | ease-in | 所有燈淡出 |
| 跑者移動 | 跑壘推進 | 0.4s | ease-in-out | 從原壘滑到目標壘 |
| 跑者得分 | 回本壘 | 0.5s | ease-in | 滑入本壘 + 金色粒子爆發 |
| 反應鏈展開 | 進入反應 | 0.3s | ease-out | 區塊從下方滑入 |
| 反應鏈新牌 | 反應出牌 | 0.3s | ease-out | 牌飛入鏈尾 |
| 反應鏈結算 | 結算 | 0.5s | ease-in-out | 牌收攏 → 生效牌放大高亮 |
| 全壘打特效 | 全壘打結算 | 2.0s | custom | 慢動作+衝擊波+粒子+文字 |
| 三振動畫 | 三振出局 | 0.8s | ease-in | 「K」字母旋轉飛入 + 打者灰化 |
| 比分跳動 | 得分 | 0.3s | bounce | 數字放大 1.3x → 回 1.0x |
| 半局過場 | 攻守交換 | 1.5s | ease-in-out | 文字浮現 + 手牌翻轉 |
| 勝利灑落 | 遊戲結束(贏) | 持續 3s | — | 金色粒子從上方灑落 |

---

## 7. 特效粒子規格

| 特效 | 粒子數 | 壽命 | 形狀 | 顏色 | 用途 |
|------|--------|------|------|------|------|
| 得分爆發 | 30 | 0.8s | 圓形 | `#D4A017`, `#F1C40F` | 跑者回本壘 |
| 全壘打衝擊波 | 60 | 1.2s | 星形+圓形 | `#D4A017`, `#FFFFFF` | 全壘打結算 |
| 三振火花 | 20 | 0.5s | 線段 | `#C0392B`, `#E74C3C` | 三振出局 |
| 勝利灑落 | 80 | 3.0s | 矩形(碎紙) | 多色隨機 | 結算勝利 |
| 卡牌可出光暈 | 5 | 循環 | 圓環 | `#B7E4C7` 30% opacity | 手牌高亮 |

**手機效能限制：** 粒子總數上限 50，壽命減半，關閉碎紙物理。

---

## 8. 音效觸發對照表

| 事件 | 音效檔案 | 時長 | 音量 | 觸發時機 |
|------|----------|------|------|----------|
| 抽牌 | `card_draw.ogg` | 0.3s | 70% | 卡牌從牌庫飛出瞬間 |
| 出牌 | `card_play.ogg` | 0.5s | 80% | 卡牌飛到場中央時 |
| 壞球 | `ball_call.ogg` | 0.4s | 60% | BSO 壞球亮燈時 |
| 好球 | `strike_call.ogg` | 0.4s | 60% | BSO 好球亮燈時 |
| 出局 | `out.ogg` | 0.8s | 80% | 出局數增加時 |
| 三振 | `strike_out.ogg` | 1.2s | 90% | 第三好球時 |
| 保送 | `walk.ogg` | 0.6s | 70% | 第四壞球時 |
| 得分 | `score_run.ogg` | 0.8s | 85% | 跑者到本壘時 |
| 全壘打 | `home_run.ogg` | 3.0s | 100% | 全壘打結算開始 |
| 歡呼 | `crowd_cheer.ogg` | 2.0s | 60% | 全壘打/關鍵得分 |
| 失誤哨音 | `error_whistle.ogg` | 0.6s | 75% | 失誤牌打出 |
| 美技 | `nice_play.ogg` | 0.8s | 80% | 美技牌打出 |
| 反應鏈啟動 | `chain_start.ogg` | 0.3s | 50% | 反應鏈區展開 |
| 按鈕點擊 | `btn_click.ogg` | 0.1s | 40% | 任何按鈕按下 |
| 半局結束 | `inning_end.ogg` | 1.0s | 70% | 三出局時 |
| 遊戲結束(勝) | `victory.ogg` | 4.0s | 90% | 結算畫面(勝方) |
| 遊戲結束(敗) | `defeat.ogg` | 3.0s | 70% | 結算畫面(敗方) |
| 背景音樂 | `bgm_game.ogg` | 循環 | 40% | 遊戲進行中持續播放 |

---

## 9. 響應式適配規則

### 9.1 斷點定義

| 類別 | 寬度範圍 | 代表裝置 | 佈局策略 |
|------|----------|----------|----------|
| Desktop | ≥ 1920px | PC/Mac | 完整佈局，BSO 側邊欄 |
| Tablet | 1024–1919px | iPad | BSO 移入頂欄，球場略縮 |
| Phone | < 1024px | iPhone/Android | 壓縮頂欄，手牌可滑動 |

### 9.2 各斷點調整一覽

| 元件 | Desktop | Tablet | Phone |
|------|---------|--------|-------|
| 頂欄高度 | 64px | 56px | 48px |
| BSO 位置 | 右側獨立面板 | 頂欄內嵌 | 頂欄內嵌(縮小) |
| 球場佔比 | 高度 45% | 高度 40% | 高度 35% |
| 手牌卡片 | 120×168px | 100×140px | 90×126px |
| 手牌區高度 | 200px | 170px | 160px |
| 手牌排列 | 全展開 | 全展開 | 滑動式 |
| 對手手牌 | 80×112px | 64×90px | 48×67px |
| 反應鏈區高度 | 120px | 100px | 88px |
| 行動按鈕 | 底部橫排 | 底部橫排 | 手牌下方 |
| Tooltip | 滑鼠跟隨 | 觸控彈出 | 半屏底部彈出 |

### 9.3 安全區域 (Safe Area)

iPhone 需考慮瀏海與 Home Indicator：
- 頂部安全區：避開 47px（Dynamic Island）
- 底部安全區：避開 34px（Home Indicator）
- 手牌區底部 padding 至少 34px

Android 需考慮：
- 導航列（若為手勢導航則影響較小）
- 折疊螢幕：檢測 `DisplayServer.screen_get_size()` 動態調整

---

## 10. 圖片生成指引 (AI Art Generation Guide)

本節提供所有需要生成的遊戲美術資產規格，適用於 Stable Diffusion / FLUX / Midjourney 等 AI 圖像生成工具。

### 10.1 整體美術風格

**風格關鍵詞 (全局 Prompt 前綴)：**

```
japanese anime style, clean line art, vibrant colors, 
baseball theme, card game illustration, professional game art,
semi-realistic proportions, dynamic composition, 
warm lighting, studio ghibli inspired color palette
```

**禁止風格 (Negative Prompt)：**

```
photorealistic, 3d render, western comic style, 
chibi, super deformed, gore, violence, 
low quality, blurry, watermark, text, signature,
dark mood, horror, grotesque
```

**色彩基調：** 以綠色（草地）、棕色（紅土/手套）、白色（棒球/制服）為主色，搭配金色高光。天空為溫暖的黃昏或明亮的晴天色調。

### 10.2 卡牌插畫規格

**統一規格：**

| 屬性 | 數值 |
|------|------|
| 生成解析度 | 768×1024 px (3:4 比例) |
| 最終使用尺寸 | 240×336 px (遊戲內) |
| 匯出格式 | PNG, 透明背景 |
| 安全邊距 | 四邊各留 5% 空白供卡框使用 |

**卡牌版面結構（由程式疊加，非插畫本身）：**

```
┌─────────────────────┐
│  [卡牌名稱]     [球數] │  ← 程式疊加文字層
│                     │
│                     │
│    [  插  畫  ]      │  ← AI 生成的插畫
│    [  區  域  ]      │
│                     │
│                     │
│─────────────────────│
│  [效果說明文字]       │  ← 程式疊加文字層
│  [使用條件]          │
└─────────────────────┘
```

因此 AI 生成的插畫只需**純場景/動作畫面**，不需包含文字。

### 10.3 各卡牌插畫 Prompt

#### 基礎牌

**壞球 Ball**
```
prompt: a baseball pitcher on the mound throwing a ball that curves away 
from the strike zone, dramatic side angle view, stadium background with 
blurred crowd, warm afternoon lighting, dust particles in sunlight,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: pitcher occupying left 60% of frame, ball trajectory shown 
with motion blur arcing right, catcher visible in background right
```

**好球 Strike**
```
prompt: close-up of a baseball crossing home plate through the strike zone, 
catcher's mitt framing the shot from behind, umpire's hand raised calling 
strike in background, speed lines emphasizing ball velocity,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: ball center frame with radial speed lines, home plate at bottom,
umpire silhouette upper right
```

#### 攻擊牌

**安打 Hit (Single)**
```
prompt: baseball batter making contact with the ball, bat connecting with 
baseball at the moment of impact, sparks and energy emanating from contact 
point, batter in dynamic swinging pose, low angle dramatic shot,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: batter center-left, contact point center with radial energy 
effect, ball trajectory upper right, dirt flying from home plate
```

**內野滾地 Ground Ball**
```
prompt: a baseball bouncing rapidly along the infield dirt between shortstop 
and third base positions, dust cloud trailing behind the ball, infielder 
diving to reach it, wide angle showing the diamond layout,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: ball lower center with motion trail, fielder diving from right 
side, infield dirt prominent, grass edge visible
```

**外野高飛 Outfield Slugging**
```
prompt: a baseball soaring high into the sky above the outfield, seen from 
behind the batter looking outward, ball trail arcing upward against blue sky 
with white clouds, outfield wall and warning track visible below,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: ball upper center with arc trail, sky occupying upper 60%, 
outfield grass and wall in lower portion, dramatic upward perspective
```

**觸擊短打 Bunt**
```
prompt: baseball batter in bunting stance holding bat horizontally in front 
of home plate, ball making gentle contact with the bat, subtle and 
controlled motion, close-up dramatic angle showing determination,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: batter's hands and bat center frame, ball just touching bat, 
face partially visible showing focused expression
```

**全壘打 Home Run**
```
prompt: epic moment of a baseball flying over the outfield wall into the 
stands, golden light burst emanating from the ball, fireworks in background, 
crowd celebrating with raised hands, batter beginning home run trot,
japanese anime style, clean line art, vibrant colors, baseball theme,
golden hour lighting, most dramatic and impactful illustration of the set

composition: ball upper center with golden aura breaking over wall, 
crowd silhouettes below, firework sparks in sky, warm golden tones dominating
```

#### 防守牌

**內野封殺 Ground Out**
```
prompt: infielder catching a ground ball and throwing to first base in one 
fluid motion, ball frozen mid-air between shortstop and first baseman, 
runner racing toward first base, intense competitive moment,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: fielder left throwing right, ball center with motion lines, 
first baseman stretching to catch on right, runner in between
```

**外野接殺 Fly Out**
```
prompt: outfielder making a spectacular leaping catch against the outfield 
wall, fully extended body reaching up with glove, ball about to land in 
the glove, warning track dirt flying, dramatic backlit silhouette,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: fielder center frame mid-leap, glove reaching upper portion,
wall behind, dramatic backlighting creating rim light effect
```

**補手防盜 Thrown Out**
```
prompt: baseball catcher in powerful throwing stance hurling ball to second 
base to catch a stealing runner, dynamic low angle from behind home plate, 
ball blazing toward second base with speed lines,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: catcher lower center in throw follow-through, ball trajectory 
to upper right, second base visible in background
```

**投手牽制 Pick Out**
```
prompt: baseball pitcher quickly pivoting to throw to first base in a 
pickoff attempt, runner diving back to the base, first baseman ready with 
glove, tense moment of surprise play, quick motion blur,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: pitcher left in mid-turn, ball going right, runner on right 
diving back headfirst, first baseman with glove ready
```

#### 特殊牌

**不死三振 Uncaught Third Strike**
```
prompt: dramatic scene of a batter sprinting toward first base after a wild 
pitch on strike three, catcher scrambling to retrieve the ball rolling away, 
dirt flying, unexpected chaos at home plate, high energy,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: batter running left to right in lower half, catcher reaching 
for ball behind home plate, umpire gesturing, dust and chaos
```

**盜壘 Steal**
```
prompt: baseball runner in explosive sprint from first base to second base, 
slide beginning with dirt spray, intense speed and determination, 
time frozen at the fastest moment of the steal attempt,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: runner center frame in full sprint, speed lines behind, 
second base ahead, dust trail, dynamic low angle
```

**暴投補逸 Passed Ball**
```
prompt: a baseball bouncing past the catcher's mitt and rolling to the 
backstop, catcher turning around in surprise, runner on base starting 
to advance, chaotic moment of defensive mistake,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: catcher center turning to chase ball, ball lower right 
rolling away, backstop fence visible, runner advancing in background
```

**界外球 Foul Ball**
```
prompt: a baseball flying at sharp angle into the stands past the foul line, 
foul pole visible on one side, crowd ducking and reaching for the ball, 
white chalk foul line prominently shown, split-second freeze frame,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: ball upper center going past foul pole, foul line diagonal 
across frame, crowd reaction in stands, dramatic angle
```

**失誤 Error**
```
prompt: baseball bouncing through fielder's legs in an embarrassing error, 
fielder's shocked expression and awkward posture, ball rolling away into 
outfield, comedic but sympathetic tone, warm lighting softening the moment,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: fielder center with ball going through legs, legs framing the 
escaping ball, face showing surprise, sympathetic rather than mocking tone
```

**美技 Nice Play**
```
prompt: spectacular diving catch by an infielder, body fully horizontal in 
mid-air, glove stretching to barely snag the ball, dirt explosion from the 
dive, freeze frame at the peak moment of the athletic feat, heroic,
japanese anime style, clean line art, vibrant colors, baseball theme

composition: fielder horizontal center frame, glove with ball on left 
stretched out, dirt spray beneath, dramatic lighting from above
```

### 10.4 球場圖板 (Field Board)

```
生成規格: 1920×1080 px
匯出格式: PNG

prompt: top-down overhead view of a baseball diamond infield, perfectly 
symmetrical, clean geometric layout, grass green outfield with neatly 
mowed stripes, brown dirt infield, white base paths clearly marked, 
white bases at corners of diamond, home plate pentagon at bottom center,
pitcher's mound at center, illustration style, game board aesthetic,
flat lighting without harsh shadows, slightly stylized not photorealistic

negative: perspective distortion, fisheye, people, players, crowd,
stands, walls, scoreboard, text, labels

composition: diamond oriented with home plate at bottom center, second 
base at top center, first base right, third base left, perfectly 
symmetrical, clean lines suitable for game board overlay
```

### 10.5 卡牌背面 (Card Back)

```
生成規格: 768×1024 px
匯出格式: PNG

prompt: elegant card back design for a baseball card game, centered 
baseball with stitching detail, surrounded by crossed bats forming an X 
pattern, circular laurel wreath border, dark green background (#1B4332) 
with gold (#D4A017) accent lines, art deco inspired geometric patterns, 
repeating pattern suitable for card back, no text,
vintage baseball aesthetic meets modern clean design

composition: perfectly centered and symmetrical, baseball in exact center, 
decorative border filling edges, tileable pattern in background
```

### 10.6 UI 圖標

| 圖標 | 尺寸 | 風格 | Prompt 關鍵詞 |
|------|------|------|---------------|
| 壘包空 | 64×64 | 扁平線條 | `diamond shape base marker, empty, gray outline, flat icon style` |
| 壘包有人 | 64×64 | 扁平填充 | `diamond shape base marker, filled golden yellow, glowing, flat icon` |
| 跑者 | 48×48 | 剪影 | `running baseball player silhouette, side view, dynamic pose, flat icon` |
| 攻方標記 | 48×48 | 扁平 | `baseball bat crossed with ball icon, golden, flat minimal style` |
| 守方標記 | 48×48 | 扁平 | `baseball glove icon, green, flat minimal style` |
| 暫停 | 48×48 | 線條 | `pause button icon, two vertical bars, clean minimal` |
| 設定齒輪 | 48×48 | 線條 | `gear settings icon, clean line art, minimal` |
| 抽牌堆 | 128×180 | — | 使用卡牌背面圖的縮小版 + 數字 badge |
| 棄牌堆 | 128×180 | — | 卡牌背面淡化 (opacity 0.5) + 數字 badge |

### 10.7 App Icon

```
生成規格: 1024×1024 px (iOS 需要此尺寸)
匯出格式: PNG, 無透明背景

prompt: app icon for a baseball card game, centered baseball with dynamic 
motion lines, two playing cards fanned behind the baseball, green gradient 
background from #2D6A4F to #1B4332, golden accent highlights on cards 
and ball stitching, clean modern icon design, rounded corners safe zone,
no text, suitable for app store icon

composition: baseball center (slightly upper), two cards behind at angles,
motion lines suggesting action, all elements within center 80% safe area
for rounded corner cropping
```

### 10.8 Steam 素材

| 素材 | 尺寸 | 說明 |
|------|------|------|
| Header Capsule | 460×215 px | 遊戲標題 + 代表卡牌 + 球場背景 |
| Small Capsule | 231×87 px | 標題簡化版 |
| Main Capsule | 616×353 px | 展示遊戲畫面 + 標題 |
| Hero Graphic | 3840×1240 px | 商店頁橫幅，球場全景 + 卡牌散落 |
| Logo | 640×360 px | 白底/透明底 Logo |
| Library Capsule | 600×900 px | 垂直封面，全壘打插畫 + 標題 |
| Screenshot ×5 | 1920×1080 px | 遊戲截圖（各畫面） |

**Steam Hero Graphic Prompt:**
```
prompt: panoramic baseball stadium scene at golden hour, cards flying 
through the air above the diamond, dynamic and exciting composition, 
mix of realistic stadium elements with anime-style card illustrations,
warm golden lighting, crowd energy, epic sports moment atmosphere,
ultra wide 3:1 aspect ratio, baseball card game promotional art

composition: stadium from behind home plate looking out, cards swirling 
in sky area, diamond in lower third, crowd silhouettes at edges, 
golden sunset sky upper portion
```

### 10.9 生成注意事項

1. **一致性控制：** 同一批卡牌使用相同的 seed range 或 reference image 保持風格統一。
2. **手部修正：** AI 生成的手部（握棒、接球）需人工檢查，必要時用 inpainting 修正。
3. **文字避免：** 所有 prompt 加入 negative `text, letters, words, numbers, watermark` 避免 AI 生成文字。
4. **批次生成流程：** 先生成低解析度 (512px) 確認構圖 → 滿意後用 img2img upscale 至目標解析度。
5. **Checkpoint 建議：** 使用 anime/illustration 風格模型，如 Anything V5、Counterfeit V3.0、或 FLUX.1-dev anime LoRA。
6. **背景透明：** 卡牌插畫需後製去背，建議使用純色背景生成後以 rembg 工具去背。
7. **授權：** 確認使用的模型與 LoRA 授權允許商業用途。

---

## 11. 檔案命名與匯出規範

### 11.1 命名規則

```
assets/
├── cards/
│   ├── card_back.png              # 卡牌背面
│   ├── ball.png                   # 壞球插畫
│   ├── strike.png                 # 好球插畫
│   ├── hit.png                    # 安打插畫
│   ├── ground_ball.png            # 內野滾地插畫
│   ├── ground_out.png             # 內野封殺插畫
│   ├── outfield_slugging.png      # 外野高飛插畫
│   ├── fly_out.png                # 外野接殺插畫
│   ├── bunt.png                   # 觸擊短打插畫
│   ├── uncaught_third_strike.png  # 不死三振插畫
│   ├── steal.png                  # 盜壘插畫
│   ├── thrown_out.png             # 補手防盜插畫
│   ├── pick_out.png               # 投手牽制插畫
│   ├── passed_ball.png            # 暴投補逸插畫
│   ├── foul_ball.png              # 界外球插畫
│   ├── error.png                  # 失誤插畫
│   ├── nice_play.png              # 美技插畫
│   └── home_run.png               # 全壘打插畫
├── board/
│   └── field_board.png            # 球場圖板
├── ui/
│   ├── icons/
│   │   ├── icon_base_empty.png
│   │   ├── icon_base_occupied.png
│   │   ├── icon_runner.png
│   │   ├── icon_offense.png
│   │   ├── icon_defense.png
│   │   ├── icon_pause.png
│   │   └── icon_settings.png
│   └── store/
│       ├── app_icon_1024.png
│       ├── steam_header_460x215.png
│       ├── steam_hero_3840x1240.png
│       ├── steam_library_600x900.png
│       └── screenshot_01.png ~ 05.png
```

### 11.2 Godot Import 設定

| 資源類型 | 壓縮格式 | Filter | Mipmaps |
|----------|----------|--------|---------|
| 卡牌插畫 | VRAM (ETC2/ASTC) | Linear | Off |
| UI 圖標 | Lossless | Nearest | Off |
| 球場圖板 | VRAM (ETC2/ASTC) | Linear | On |
| 音效 | OGG Vorbis | — | — |
| BGM | OGG Vorbis (streaming) | — | — |
