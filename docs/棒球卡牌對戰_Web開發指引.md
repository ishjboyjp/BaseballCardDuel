# ⚾ 棒球卡牌對戰 — Web HTML5 開發指引

**版本 1.0 | 2026 年 3 月**
目標平台：瀏覽器 (Chrome/Safari/Firefox/Edge)

---

## 0. 總體指令

開發一款雙人策略卡牌遊戲，使用原生 Web 技術：
- **HTML5** + **CSS3** + **JavaScript (ES6+)**
- 無需額外框架，保持輕量
- UI 使用繁體中文，程式碼使用英文 snake_case
- Commit 格式：`[模組] 簡述`

---

## 1. 專案結構

```
BaseballCardDuel/
├── index.html          # 遊戲主頁面
├── rules.html          # 規則說明頁面
├── css/
│   └── style.css       # 樣式
├── js/
│   ├── game.js         # 遊戲主邏輯
│   ├── cards.js        # 卡牌定義
│   ├── ai.js           # AI 控制器
│   ├── reaction.js     # 反應鏈系統
│   └── validator.js    # 規則驗證
├── assets/
│   ├── cards/          # 卡牌圖片
│   └── sounds/         # 音效
└── docs/
    └── 遊戲開發企劃書.md
```

---

## 2. 卡牌定義 (cards.js)

```javascript
// 卡牌類型
const CARD_TYPE = {
    BALL: 'ball',              // 壞球
    STRIKE: 'strike',          // 好球
    HIT: 'hit',                // 安打
    GROUND_BALL: 'ground_ball', // 內野滾地
    GROUND_OUT: 'ground_out',  // 內野封殺
    OUTFIELD_SLUGGING: 'outfield_slugging', // 外野高飛
    FLY_OUT: 'fly_out',        // 外野接殺
    BUNT: 'bunt',              // 觸擊短打
    UNCAUGHT_THIRD: 'uncaught_third', // 不死三振
    STEAL: 'steal',            // 盜壘
    THROWN_OUT: 'thrown_out',  // 牽制出局
    PICK_OUT: 'pick_out',      // 捕手阻殺
    PASSED_BALL: 'passed_ball', // 暴投
    FOUL_BALL: 'foul_ball',   // 界外球
    ERROR: 'error',            // 失誤
    NICE_PLAY: 'nice_play',   // 美技
    HOME_RUN: 'home_run',      // 全壘打
};

// 卡牌分類
const CARD_CATEGORY = {
    BASE: 'base',         // 基礎牌
    ATTACK: 'attack',     // 攻擊牌
    DEFENSE: 'defense',   // 防守牌
    SPECIAL: 'special',   // 特殊牌
};

// 卡牌資料
const CARD_DATA = {
    [CARD_TYPE.BALL]: {
        name: '壞球',
        category: CARD_CATEGORY.BASE,
        count: 16,
    },
    [CARD_TYPE.STRIKE]: {
        name: '好球',
        category: CARD_CATEGORY.BASE,
        count: 12,
    },
    [CARD_TYPE.HIT]: {
        name: '安打',
        category: CARD_CATEGORY.ATTACK,
        count: 6,
    },
    // ... 其他卡牌
};
```

---

## 3. 遊戲狀態 (game.js)

```javascript
class BaseballCardGame {
    constructor() {
        // 分數
        this.homeScore = 0;   // 玩家
        this.awayScore = 0;   // AI
        
        // 局數
        this.inning = 1;
        this.isTop = true;    // 上半局
        
        // 出局/球數
        this.outs = 0;
        this.balls = 0;
        this.strikes = 0;
        
        // 壘包 [一壘, 二壘, 三壘]
        this.bases = [false, false, false];
        
        // 遊戲狀態
        this.isPlayerTurn = true;
        this.pendingDefense = null;
        this.gameOver = false;
        this.lastCard = null;
        
        // 手牌
        this.playerHand = [];
        this.aiHand = [];
        this.deck = [];
        this.discardPile = [];
        
        // 系統
        this.ai = new AIController(AI_LEVEL.MEDIUM);
        this.reaction = new ReactionChain();
    }
    
    // 初始化遊戲
    init() {
        this.deck = this.createDeck();
        this.playerHand = this.deck.splice(0, 7);
        this.aiHand = this.deck.splice(0, 7);
        this.render();
    }
    
    // 建立牌組
    createDeck() {
        let deck = [];
        for (let [type, data] of Object.entries(CARD_DATA)) {
            for (let i = 0; i < data.count; i++) {
                deck.push(type);
            }
        }
        return this.shuffle(deck);
    }
    
    // 洗牌
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
```

---

## 4. 核心系統

### 4.1 球數系統 (ball_count)

```javascript
// 球數管理
const MAX_BALLS = 4;
const MAX_STRIKES = 3;
const MAX_OUTS = 3;

function addBall(game) {
    game.balls++;
    if (game.balls >= MAX_BALLS) {
        game.balls = 0;
        game.strikes = 0;
        return 'walk'; // 四壞
    }
    return 'ball';
}

function addStrike(game) {
    game.strikes++;
    if (game.strikes >= MAX_STRIKES) {
        game.strikes = 0;
        game.balls = 0;
        return 'strikeout'; // 三振
    }
    return 'strike';
}

function addFoul(game) {
    if (game.strikes < 2) {
        game.strikes++;
    }
    return 'foul';
}
```

### 4.2 跑壘系統 (base_runner)

```javascript
// 推進跑者
function advanceRunners(game, bases) {
    let runs = 0;
    let newBases = [false, false, false];
    
    // 從三壘開始
    for (let i = 2; i >= 0; i--) {
        if (game.bases[i]) {
            let newPos = i + bases;
            if (newPos >= 3) {
                runs++; // 得分
            } else {
                newBases[newPos] = true;
            }
        }
    }
    
    game.bases = newBases;
    return runs;
}

// 全壘打
function homeRun(game) {
    let runs = 1; // 打者自己
    for (let i = 0; i < 3; i++) {
        if (game.bases[i]) {
            runs++;
            game.bases[i] = false;
        }
    }
    return runs;
}
```

### 4.3 反應鏈系統 (reaction.js)

```javascript
class ReactionChain {
    constructor() {
        this.chain = [];
        this.isActive = false;
    }
    
    start(card, player) {
        this.chain = [{card, player}];
        this.isActive = true;
    }
    
    add(card, player) {
        this.chain.push({card, player});
    }
    
    // 取得最終生效的牌
    getEffectiveCard() {
        if (this.chain.length === 0) return null;
        return this.chain[this.chain.length - 1].card;
    }
    
    // 檢查是否可以反應
    canReact(cardType) {
        if (!this.isActive || this.chain.length === 0) return false;
        const lastCard = this.getEffectiveCard();
        return REACTION_RULES[lastCard]?.includes(cardType);
    }
    
    resolve() {
        this.isActive = false;
    }
    
    clear() {
        this.chain = [];
        this.isActive = false;
    }
}
```

### 4.4 規則驗證器 (validator.js)

```javascript
// 可出牌檢查
function canPlayCard(game, cardType, isPlayer) {
    // 檢查手牌
    const hand = isPlayer ? game.playerHand : game.aiHand;
    if (!hand.includes(cardType)) {
        return {valid: false, reason: '手中沒有這張牌'};
    }
    
    // 檢查是否在反應鏈中
    if (game.reaction.isActive) {
        if (!game.reaction.canReact(cardType)) {
            return {valid: false, reason: '無法在此反應鏈中出這張牌'};
        }
    }
    
    // 全壘打需要滿球數
    if (cardType === CARD_TYPE.HOME_RUN) {
        if (game.balls < 3 || game.strikes < 3) {
            return {valid: false, reason: '全壘打需要 3-3 滿球數'};
        }
    }
    
    return {valid: true};
}

// 反應規則
const REACTION_RULES = {
    [CARD_TYPE.HIT]: [CARD_TYPE.FOUL_BALL],
    [CARD_TYPE.GROUND_BALL]: [CARD_TYPE.GROUND_OUT, CARD_TYPE.FOUL_BALL],
    [CARD_TYPE.OUTFIELD_SLUGGING]: [CARD_TYPE.FLY_OUT, CARD_TYPE.FOUL_BALL],
    [CARD_TYPE.BUNT]: [CARD_TYPE.FOUL_BALL],
    [CARD_TYPE.STEAL]: [CARD_TYPE.THROWN_OUT],
    [CARD_TYPE.UNCAUGHT_THIRD]: [CARD_TYPE.THROWN_OUT],
    [CARD_TYPE.GROUND_OUT]: [CARD_TYPE.ERROR],
    [CARD_TYPE.FLY_OUT]: [CARD_TYPE.ERROR],
    [CARD_TYPE.ERROR]: [CARD_TYPE.NICE_PLAY],
};
```

---

## 5. AI 系統 (ai.js)

```javascript
// AI 難度
const AI_LEVEL = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
};

class AIController {
    constructor(level = AI_LEVEL.MEDIUM) {
        this.level = level;
    }
    
    // 選擇出牌
    chooseCard(hand, game, isDefense = false) {
        switch (this.level) {
            case AI_LEVEL.EASY:
                return this.easyAI(hand, game, isDefense);
            case AI_LEVEL.MEDIUM:
                return this.mediumAI(hand, game, isDefense);
            case AI_LEVEL.HARD:
                return this.hardAI(hand, game, isDefense);
        }
    }
    
    // 簡單 AI：隨機
    easyAI(hand, game, isDefense) {
        return hand[Math.floor(Math.random() * hand.length)];
    }
    
    // 中等 AI：簡單策略
    mediumAI(hand, game, isDefense) {
        // 攻擊時優先全壘打
        if (!isDefense && game.balls >= 3 && game.strikes >= 3) {
            if (hand.includes(CARD_TYPE.HOME_RUN)) {
                return CARD_TYPE.HOME_RUN;
            }
        }
        
        // 防守時優先出局
        if (isDefense && hand.includes(CARD_TYPE.GROUND_OUT)) {
            return CARD_TYPE.GROUND_OUT;
        }
        
        return hand[Math.floor(Math.random() * hand.length)];
    }
    
    // 困難 AI：權重評分
    hardAI(hand, game, isDefense) {
        let bestCard = hand[0];
        let bestScore = -Infinity;
        
        for (const card of hand) {
            let score = this.evaluateCard(card, game, isDefense);
            if (score > bestScore) {
                bestScore = score;
                bestCard = card;
            }
        }
        
        return bestCard;
    }
    
    // 評分函數
    evaluateCard(card, game, isDefense) {
        let score = 0;
        
        if (!isDefense) {
            // 攻擊方
            switch (card) {
                case CARD_TYPE.HOME_RUN:
                    score = 10 + this.countRunners(game.bases) * 5;
                    break;
                case CARD_TYPE.OUTFIELD_SLUGGING:
                    score = 5 + this.countRunners(game.bases) * 2;
                    break;
                case CARD_TYPE.HIT:
                    score = 3 + this.countRunners(game.bases);
                    break;
                case CARD_TYPE.BALL:
                    score = 0.5;
                    break;
                default:
                    score = 1;
            }
        } else {
            // 防守方
            switch (card) {
                case CARD_TYPE.STRIKE:
                    score = 2 + game.strikes * 1.5;
                    break;
                case CARD_TYPE.GROUND_OUT:
                    score = 3;
                    break;
                case CARD_TYPE.FLY_OUT:
                    score = 3;
                    break;
                default:
                    score = 1;
            }
        }
        
        // 隨機因素
        score *= 0.9 + Math.random() * 0.2;
        
        return score;
    }
    
    countRunners(bases) {
        return bases.filter(b => b).length;
    }
}
```

---

## 6. UI 架構 (index.html)

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>棒球卡牌對戰</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="game-container">
        <!-- 標題列 -->
        <header class="game-header">
            <h1>⚾ 棒球卡牌對戰</h1>
            <div class="game-info">
                <span id="inning">第1局 上半</span>
                <select id="ai-difficulty">
                    <option value="easy">簡單</option>
                    <option value="medium" selected>中等</option>
                    <option value="hard">困難</option>
                </select>
            </div>
        </header>
        
        <!-- 計分板 -->
        <section class="scoreboard">
            <div class="team away">
                <span class="team-name">客隊 (AI)</span>
                <span class="score" id="away-score">0</span>
            </div>
            <div class="team home">
                <span class="team-name">主隊 (你)</span>
                <span class="score" id="home-score">0</span>
            </div>
        </section>
        
        <!-- 球場 -->
        <section class="field">
            <div class="baseball-field" id="field">
                <div class="base first" id="base-1"></div>
                <div class="base second" id="base-2"></div>
                <div class="base third" id="base-3"></div>
                <div class="base home" id="base-home"></div>
            </div>
        </section>
        
        <!-- 球數顯示 -->
        <section class="bso-display">
            <div class="balls">
                <span>壞球：</span>
                <span id="ball-count">○○○○</span>
            </div>
            <div class="strikes">
                <span>好球：</span>
                <span id="strike-count">○○○</span>
            </div>
            <div class="outs">
                <span>出局：</span>
                <span id="out-count">○○○</span>
            </div>
        </section>
        
        <!-- 訊息 -->
        <section class="message-area">
            <p id="game-message">遊戲開始！選擇難度後點擊卡牌出牌</p>
        </section>
        
        <!-- AI 手牌（隱藏） -->
        <section class="ai-hand" id="ai-hand">
            <!-- 卡牌由 JS 生成 -->
        </section>
        
        <!-- 玩家手牌 -->
        <section class="player-hand" id="player-hand">
            <!-- 卡牌由 JS 生成 -->
        </section>
        
        <!-- 牌組資訊 -->
        <section class="deck-info">
            <span>牌庫：<span id="deck-count">0</span></span>
            <span>棄牌：<span id="discard-count">0</span></span>
        </section>
    </div>
    
    <script src="js/cards.js"></script>
    <script src="js/validator.js"></script>
    <script src="js/reaction.js"></script>
    <script src="js/ai.js"></script>
    <script src="js/game.js"></script>
</body>
</html>
```

---

## 7. CSS 樣式 (style.css)

```css
/* 基礎設定 */
:root {
    --primary-color: #1B4332;
    --accent-color: #FFD700;
    --text-color: #333;
    --card-width: 80px;
    --card-height: 120px;
}

body {
    font-family: 'Noto Sans TC', sans-serif;
    background: linear-gradient(135deg, #1B4332, #2D6A4F);
    color: var(--text-color);
    margin: 0;
    min-height: 100vh;
}

.game-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

/* 卡牌 */
.card {
    width: var(--card-width);
    height: var(--card-height);
    background: white;
    border-radius: 8px;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 5px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.card:hover {
    transform: translateY(-10px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.card.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 卡牌顏色 */
.card.ball { background: #4CAF50; color: white; }
.card.strike { background: #F44336; color: white; }
.card.attack { background: #2196F3; color: white; }
.card.defense { background: #FF9800; color: white; }
.card.special { background: #9C27B0; color: white; }
.card.home-run { background: #FFD700; color: #333; }

/* 壘包 */
.base {
    width: 30px;
    height: 30px;
    background: white;
    border: 2px solid #333;
    border-radius: 50%;
    position: absolute;
}

.base.occupied {
    background: #FFD700;
}
```

---

## 8. 開發順序

### 第一週：基礎建設
- [x] 建立 HTML 結構
- [x] 卡牌定義 (cards.js)
- [x] 牌組建立與洗牌

### 第二週：核心邏輯
- [x] 球數系統 (B/S/O)
- [x] 跑壘系統
- [x] 出牌與結算

### 第三週：反應系統
- [x] 反應鏈邏輯
- [x] 規則驗證
- [x] 防守牌處理

### 第四週：AI 與 UI
- [x] AI 系統（3 種難度）
- [x] 畫面更新
- [x] 測試與優化

---

## 9. 命名規範

| 類別 | 規範 | 範例 |
|------|------|------|
| 檔案 | snake_case.js | `game_manager.js` |
| 類別 | PascalCase | `BaseballCardGame` |
| 函式 | camelCase | `initGame()` |
| 常數 | UPPER_SNAKE_CASE | `MAX_BALLS` |
| 變數 | camelCase | `playerHand` |
| Commit | `[模組] 簡述` | `[core] 修復球數計算` |

---

## 10. 現有檔案對照

| 功能 | 檔案 | 狀態 |
|------|------|------|
| 卡牌定義 | js/cards.js | ✅ 現有 |
| 遊戲主邏輯 | js/game.js | ✅ 現有 |
| AI 控制器 | js/ai.js | ✅ 現有 |
| 反應鏈 | js/reaction.js | ✅ 現有 |
| 規則驗證 | js/validator.js | ✅ 現有 |
| 樣式 | css/style.css | ✅ 現有 |

---

## 11. 後續優化

1. **卡牌圖片** - 使用 SDXL 生成 17 張卡牌
2. **音效** - 添加抽牌、出牌、歡呼等音效
3. **動畫** - 卡牌飛出、跑者移動動畫
4. **教學** - 新手引導流程
5. **存檔** - 使用 localStorage 儲存進度
