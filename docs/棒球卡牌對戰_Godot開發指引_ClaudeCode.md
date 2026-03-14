# ⚾ 棒球卡牌對戰 — Godot 開發指引（Claude Code 專用）

**Baseball Card Duel — Full Development Specification for Claude Code**

版本 1.0 ｜ 2026 年 3 月
目標平台：Steam (Windows/macOS/Linux) ｜ iOS ｜ Android

---

## 0. 給 Claude Code 的總體指令

你正在開發一款名為《棒球卡牌對戰 Baseball Card Duel》的雙人策略卡牌遊戲。請嚴格遵循本文件的架構、命名規範與實作細節。開發過程中：

- 使用 **Godot 4.3+**，腳本語言為 **GDScript**
- 專案結構、場景樹、信號命名必須與本文件一致
- 所有 UI 文字使用繁體中文，程式碼中的變數與函式名使用英文 snake_case
- 每完成一個模組，先寫單元測試再提交
- Commit message 格式：`[模組名] 簡述`，例如 `[card_system] 實作反應鏈結算邏輯`

---

## 1. 專案結構

```
baseball_card_duel/
├── project.godot
├── export_presets.cfg
│
├── assets/
│   ├── cards/                  # 卡牌圖片資源
│   │   ├── card_back.png
│   │   ├── ball.png
│   │   ├── strike.png
│   │   ├── hit.png
│   │   ├── ground_ball.png
│   │   ├── ground_out.png
│   │   ├── outfield_slugging.png
│   │   ├── fly_out.png
│   │   ├── bunt.png
│   │   ├── uncaught_third_strike.png
│   │   ├── steal.png
│   │   ├── thrown_out.png
│   │   ├── pick_out.png
│   │   ├── passed_ball.png
│   │   ├── foul_ball.png
│   │   ├── error.png
│   │   ├── nice_play.png
│   │   └── home_run.png
│   ├── board/                  # 棒球場圖板
│   │   ├── field_board.png
│   │   └── base_marker.png
│   ├── ui/                     # UI 元素
│   │   ├── fonts/
│   │   │   ├── noto_sans_tc_bold.ttf
│   │   │   └── noto_sans_tc_regular.ttf
│   │   ├── buttons/
│   │   ├── panels/
│   │   └── icons/
│   ├── audio/
│   │   ├── bgm/
│   │   ├── sfx/
│   │   │   ├── card_play.ogg
│   │   │   ├── card_draw.ogg
│   │   │   ├── strike_out.ogg
│   │   │   ├── home_run.ogg
│   │   │   ├── crowd_cheer.ogg
│   │   │   ├── out.ogg
│   │   │   └── error_whistle.ogg
│   │   └── voice/              # 預留語音播報
│   └── animations/
│       ├── card_flip.tres
│       └── home_run_effect.tres
│
├── src/
│   ├── main/
│   │   ├── main.gd             # 程式進入點
│   │   ├── main.tscn
│   │   └── game_config.gd      # 全域設定 (autoload)
│   │
│   ├── data/
│   │   ├── card_database.gd    # 卡牌資料定義 (autoload)
│   │   ├── card_data.tres       # 卡牌資源檔
│   │   └── enums.gd            # 全域列舉 (autoload)
│   │
│   ├── core/                   # 核心遊戲邏輯（純邏輯，不依賴場景）
│   │   ├── game_state.gd       # 遊戲狀態機
│   │   ├── turn_manager.gd     # 回合管理
│   │   ├── ball_count.gd       # 球數系統
│   │   ├── base_runner.gd      # 跑壘系統
│   │   ├── deck_manager.gd     # 牌庫管理
│   │   ├── hand_manager.gd     # 手牌管理
│   │   ├── reaction_chain.gd   # 反應鏈結算
│   │   ├── score_manager.gd    # 計分系統
│   │   └── rule_validator.gd   # 規則驗證器
│   │
│   ├── cards/                  # 卡牌相關
│   │   ├── card.gd             # 卡牌基礎類別
│   │   ├── card.tscn
│   │   ├── card_effect.gd      # 卡牌效果基礎類別
│   │   └── effects/            # 各卡牌效果實作
│   │       ├── ball_effect.gd
│   │       ├── strike_effect.gd
│   │       ├── hit_effect.gd
│   │       ├── ground_ball_effect.gd
│   │       ├── ground_out_effect.gd
│   │       ├── outfield_slugging_effect.gd
│   │       ├── fly_out_effect.gd
│   │       ├── bunt_effect.gd
│   │       ├── uncaught_third_strike_effect.gd
│   │       ├── steal_effect.gd
│   │       ├── thrown_out_effect.gd
│   │       ├── pick_out_effect.gd
│   │       ├── passed_ball_effect.gd
│   │       ├── foul_ball_effect.gd
│   │       ├── error_effect.gd
│   │       ├── nice_play_effect.gd
│   │       └── home_run_effect.gd
│   │
│   ├── ai/                     # AI 對手
│   │   ├── ai_controller.gd    # AI 基礎介面
│   │   ├── ai_easy.gd          # 初級 AI
│   │   ├── ai_medium.gd        # 中級 AI
│   │   └── ai_hard.gd          # 高級 AI
│   │
│   ├── ui/                     # UI 場景與腳本
│   │   ├── screens/
│   │   │   ├── title_screen.gd
│   │   │   ├── title_screen.tscn
│   │   │   ├── game_screen.gd
│   │   │   ├── game_screen.tscn
│   │   │   ├── result_screen.gd
│   │   │   ├── result_screen.tscn
│   │   │   ├── settings_screen.gd
│   │   │   └── settings_screen.tscn
│   │   ├── components/
│   │   │   ├── hand_display.gd         # 手牌區
│   │   │   ├── hand_display.tscn
│   │   │   ├── field_display.gd        # 球場顯示
│   │   │   ├── field_display.tscn
│   │   │   ├── scoreboard.gd           # 計分板
│   │   │   ├── scoreboard.tscn
│   │   │   ├── ball_count_display.gd   # 球數顯示 (BSO)
│   │   │   ├── ball_count_display.tscn
│   │   │   ├── deck_pile.gd            # 牌庫/棄牌堆
│   │   │   ├── deck_pile.tscn
│   │   │   ├── reaction_chain_ui.gd    # 反應鏈視覺化
│   │   │   ├── reaction_chain_ui.tscn
│   │   │   ├── turn_indicator.gd       # 攻守指示器
│   │   │   ├── turn_indicator.tscn
│   │   │   ├── card_tooltip.gd         # 卡牌說明浮窗
│   │   │   └── card_tooltip.tscn
│   │   └── dialogs/
│   │       ├── pause_dialog.gd
│   │       ├── pause_dialog.tscn
│   │       ├── tutorial_dialog.gd
│   │       └── tutorial_dialog.tscn
│   │
│   ├── network/                # 連線對戰（Phase 2）
│   │   ├── network_manager.gd
│   │   ├── lobby.gd
│   │   ├── lobby.tscn
│   │   ├── matchmaking.gd
│   │   └── sync_manager.gd
│   │
│   └── platform/               # 平台適配
│       ├── platform_manager.gd # 平台偵測與適配 (autoload)
│       ├── steam_integration.gd
│       ├── ios_integration.gd
│       └── android_integration.gd
│
├── tests/                      # 單元測試 (GdUnit4)
│   ├── test_ball_count.gd
│   ├── test_base_runner.gd
│   ├── test_deck_manager.gd
│   ├── test_reaction_chain.gd
│   ├── test_rule_validator.gd
│   ├── test_turn_manager.gd
│   ├── test_card_effects.gd
│   └── test_ai_controller.gd
│
└── addons/
    ├── gdunit4/                # 測試框架
    └── godot_steam/            # Steam SDK 整合 (GodotSteam)
```

---

## 2. 全域列舉與資料結構

### 2.1 enums.gd (Autoload)

```gdscript
# src/data/enums.gd
class_name Enums

enum CardType {
    BALL,
    STRIKE,
    HIT,
    GROUND_BALL,
    GROUND_OUT,
    OUTFIELD_SLUGGING,
    FLY_OUT,
    BUNT,
    UNCAUGHT_THIRD_STRIKE,
    STEAL,
    THROWN_OUT,
    PICK_OUT,
    PASSED_BALL,
    FOUL_BALL,
    ERROR,
    NICE_PLAY,
    HOME_RUN,
}

enum CardCategory {
    BASE,           # 基礎牌 (壞球、好球)
    ATTACK,         # 攻擊牌
    DEFENSE,        # 防守牌
    SPECIAL,        # 特殊牌
}

enum PlayerRole {
    OFFENSE,        # 攻方
    DEFENSE,        # 守方
}

enum Base {
    NONE = -1,
    HOME = 0,
    FIRST = 1,
    SECOND = 2,
    THIRD = 3,
}

enum GamePhase {
    SETUP,
    DRAW,           # 抽牌階段
    PLAY_CARD,      # 出牌階段
    REACTION,       # 反應鏈階段
    RESOLVE,        # 結算階段
    REFILL,         # 補牌階段
    HALF_INNING_END,
    INNING_END,
    GAME_OVER,
}

enum AILevel {
    EASY,
    MEDIUM,
    HARD,
}

enum Platform {
    STEAM,
    IOS,
    ANDROID,
}
```

### 2.2 card_database.gd (Autoload)

```gdscript
# src/data/card_database.gd
extends Node

# 卡牌定義資料結構
class CardDef:
    var type: Enums.CardType
    var name_zh: String          # 中文名
    var name_en: String          # 英文名
    var category: Enums.CardCategory
    var total_count: int         # 牌組中的張數
    var used_count: int          # 使用後回收張數（0 = 不回收）
    var ball_cost: int           # 需要的球數 (0 = 無門檻)
    var resets_count: bool       # 使用後球數是否歸零
    var conditions: Array[Enums.CardType]  # 前置條件（需要場上存在的牌）
    var state_conditions: Callable        # 場況條件檢查函式
    var countered_by: Array[Enums.CardType]  # 會被哪些牌失效
    var texture_path: String

    func _init(p_type, p_name_zh, p_name_en, p_category, p_total, p_used,
               p_ball_cost, p_resets, p_conditions, p_state_cond,
               p_countered_by, p_texture):
        type = p_type
        name_zh = p_name_zh
        name_en = p_name_en
        category = p_category
        total_count = p_total
        used_count = p_used
        ball_cost = p_ball_cost
        resets_count = p_resets
        conditions = p_conditions
        state_conditions = p_state_cond
        countered_by = p_countered_by
        texture_path = p_texture

var cards: Dictionary = {}  # CardType -> CardDef

func _ready():
    _register_all_cards()

func _register_all_cards():
    _reg(Enums.CardType.BALL, "壞球", "Ball",
        Enums.CardCategory.BASE, 16, 1, 0, false,
        [], Callable(), [],
        "res://assets/cards/ball.png")

    _reg(Enums.CardType.STRIKE, "好球", "Strike",
        Enums.CardCategory.BASE, 12, 1, 0, false,
        [], Callable(), [],
        "res://assets/cards/strike.png")

    _reg(Enums.CardType.HIT, "安打", "Hit",
        Enums.CardCategory.ATTACK, 6, 2, 2, true,
        [], Callable(), [],
        "res://assets/cards/hit.png")

    _reg(Enums.CardType.GROUND_BALL, "內野滾地", "Ground Ball",
        Enums.CardCategory.ATTACK, 6, 2, 2, true,
        [], Callable(),
        [Enums.CardType.GROUND_OUT, Enums.CardType.FOUL_BALL],
        "res://assets/cards/ground_ball.png")

    _reg(Enums.CardType.GROUND_OUT, "內野封殺", "Ground Out",
        Enums.CardCategory.DEFENSE, 6, 2, 2, false,
        [Enums.CardType.GROUND_BALL], Callable(),
        [Enums.CardType.ERROR],
        "res://assets/cards/ground_out.png")

    _reg(Enums.CardType.OUTFIELD_SLUGGING, "外野高飛", "Outfield Slugging",
        Enums.CardCategory.ATTACK, 6, 2, 2, true,
        [], Callable(),
        [Enums.CardType.FLY_OUT, Enums.CardType.FOUL_BALL],
        "res://assets/cards/outfield_slugging.png")

    _reg(Enums.CardType.FLY_OUT, "外野接殺", "Fly Out",
        Enums.CardCategory.DEFENSE, 6, 2, 2, false,
        [Enums.CardType.OUTFIELD_SLUGGING], Callable(),
        [Enums.CardType.ERROR],
        "res://assets/cards/fly_out.png")

    _reg(Enums.CardType.BUNT, "觸擊短打", "Bunt",
        Enums.CardCategory.ATTACK, 6, 2, 2, true,
        [], _cond_runners_on_base.bind(),
        [Enums.CardType.FOUL_BALL],
        "res://assets/cards/bunt.png")

    _reg(Enums.CardType.UNCAUGHT_THIRD_STRIKE, "不死三振", "Uncaught 3rd Strike",
        Enums.CardCategory.SPECIAL, 6, 2, 2, false,
        [], _cond_uncaught_third_strike.bind(),
        [Enums.CardType.THROWN_OUT],
        "res://assets/cards/uncaught_third_strike.png")

    _reg(Enums.CardType.STEAL, "盜壘", "Steal",
        Enums.CardCategory.SPECIAL, 6, 2, 2, false,
        [], _cond_runners_on_first_or_second.bind(),
        [Enums.CardType.THROWN_OUT],
        "res://assets/cards/steal.png")

    _reg(Enums.CardType.THROWN_OUT, "補手防盜", "Thrown Out",
        Enums.CardCategory.DEFENSE, 6, 2, 2, false,
        [Enums.CardType.STEAL, Enums.CardType.UNCAUGHT_THIRD_STRIKE],
        Callable(),
        [Enums.CardType.ERROR],
        "res://assets/cards/thrown_out.png")

    _reg(Enums.CardType.PICK_OUT, "投手牽制", "Pick Out",
        Enums.CardCategory.DEFENSE, 6, 2, 2, false,
        [], _cond_runners_on_base.bind(),
        [Enums.CardType.ERROR],
        "res://assets/cards/pick_out.png")

    _reg(Enums.CardType.PASSED_BALL, "暴投補逸", "Passed Ball",
        Enums.CardCategory.SPECIAL, 6, 2, 2, false,
        [], _cond_runners_on_base.bind(),
        [Enums.CardType.THROWN_OUT],
        "res://assets/cards/passed_ball.png")

    _reg(Enums.CardType.FOUL_BALL, "界外球", "Foul Ball",
        Enums.CardCategory.DEFENSE, 6, 2, 2, false,
        [Enums.CardType.BUNT, Enums.CardType.GROUND_BALL,
         Enums.CardType.OUTFIELD_SLUGGING, Enums.CardType.HOME_RUN],
        Callable(), [],
        "res://assets/cards/foul_ball.png")

    _reg(Enums.CardType.ERROR, "失誤", "Error",
        Enums.CardCategory.SPECIAL, 6, 2, 2, false,
        [Enums.CardType.GROUND_OUT, Enums.CardType.FLY_OUT,
         Enums.CardType.THROWN_OUT, Enums.CardType.PICK_OUT,
         Enums.CardType.NICE_PLAY],
        Callable(),
        [Enums.CardType.NICE_PLAY],
        "res://assets/cards/error.png")

    _reg(Enums.CardType.NICE_PLAY, "美技", "Nice Play",
        Enums.CardCategory.SPECIAL, 6, 2, 2, false,
        [Enums.CardType.ERROR], Callable(),
        [Enums.CardType.ERROR],
        "res://assets/cards/nice_play.png")

    _reg(Enums.CardType.HOME_RUN, "全壘打", "Home Run",
        Enums.CardCategory.ATTACK, 3, 3, 3, true,
        [], _cond_full_count.bind(),
        [Enums.CardType.FOUL_BALL],
        "res://assets/cards/home_run.png")

func _reg(type, name_zh, name_en, category, total, used, ball_cost,
          resets, conditions, state_cond, countered_by, texture):
    cards[type] = CardDef.new(type, name_zh, name_en, category, total, used,
        ball_cost, resets, conditions, state_cond, countered_by, texture)

# ── 場況條件函式 ──

func _cond_runners_on_base(game_state) -> bool:
    return game_state.base_runner.has_any_runner()

func _cond_runners_on_first_or_second(game_state) -> bool:
    return (game_state.base_runner.has_runner(Enums.Base.FIRST) or
            game_state.base_runner.has_runner(Enums.Base.SECOND))

func _cond_uncaught_third_strike(game_state) -> bool:
    return (game_state.outs == 2 and
            not game_state.base_runner.has_runner(Enums.Base.FIRST) and
            game_state.ball_count.strikes == 3)

func _cond_full_count(game_state) -> bool:
    return (game_state.ball_count.balls >= 3 and
            game_state.ball_count.strikes >= 3)
```

---

## 3. 核心遊戲邏輯

### 3.1 game_state.gd — 遊戲狀態機

```gdscript
# src/core/game_state.gd
class_name GameState
extends RefCounted

signal phase_changed(new_phase: Enums.GamePhase)
signal score_changed(team: int, score: int)
signal outs_changed(outs: int)
signal inning_changed(inning: int, is_top: bool)
signal game_over(winner: int)

# ── 遊戲設定 ──
var total_innings: int = 3           # 預設 3 局（可設 5 / 9）
var max_hand_size: int = 7

# ── 遊戲狀態 ──
var current_phase: Enums.GamePhase = Enums.GamePhase.SETUP
var current_inning: int = 1          # 目前局數
var is_top_inning: bool = true       # true = 上半局, false = 下半局
var outs: int = 0                    # 目前出局數
var scores: Array[int] = [0, 0]      # [客隊, 主隊]

# ── 子系統 ──
var ball_count: BallCount
var base_runner: BaseRunner
var deck_manager: DeckManager
var hands: Array[HandManager]        # [玩家0手牌, 玩家1手牌]
var reaction_chain: ReactionChain
var score_manager: ScoreManager
var rule_validator: RuleValidator
var turn_manager: TurnManager

# ── 角色對應 ──
# 上半局：player 0 = 攻方(客隊), player 1 = 守方(主隊)
# 下半局：player 0 = 守方, player 1 = 攻方(主隊)
var offense_player: int:
    get: return 0 if is_top_inning else 1
var defense_player: int:
    get: return 1 if is_top_inning else 0

func _init():
    ball_count = BallCount.new()
    base_runner = BaseRunner.new()
    deck_manager = DeckManager.new()
    hands = [HandManager.new(), HandManager.new()]
    reaction_chain = ReactionChain.new()
    score_manager = ScoreManager.new(self)
    rule_validator = RuleValidator.new(self)
    turn_manager = TurnManager.new(self)

func start_game():
    deck_manager.build_deck()
    deck_manager.shuffle()
    for i in range(2):
        var drawn = deck_manager.draw(max_hand_size)
        hands[i].add_cards(drawn)
    set_phase(Enums.GamePhase.DRAW)

func set_phase(phase: Enums.GamePhase):
    current_phase = phase
    phase_changed.emit(phase)

func add_out(count: int = 1):
    outs += count
    outs_changed.emit(outs)
    if outs >= 3:
        end_half_inning()

func end_half_inning():
    ball_count.reset()
    base_runner.clear_all()
    outs = 0
    if is_top_inning:
        is_top_inning = false
    else:
        is_top_inning = true
        if current_inning >= total_innings:
            if scores[0] != scores[1]:
                _end_game()
                return
            # 平手 → 延長賽，不增加 total_innings 上限
        current_inning += 1
    inning_changed.emit(current_inning, is_top_inning)
    set_phase(Enums.GamePhase.DRAW)

func add_score(team: int, runs: int = 1):
    scores[team] += runs
    score_changed.emit(team, scores[team])

func _end_game():
    var winner = 0 if scores[0] > scores[1] else 1
    set_phase(Enums.GamePhase.GAME_OVER)
    game_over.emit(winner)
```

### 3.2 ball_count.gd — 球數系統

```gdscript
# src/core/ball_count.gd
class_name BallCount
extends RefCounted

signal count_changed(balls: int, strikes: int)
signal walk()          # 四壞保送
signal strikeout()     # 三振

const MAX_BALLS: int = 4
const MAX_STRIKES: int = 3

var balls: int = 0
var strikes: int = 0

func add_ball():
    balls += 1
    count_changed.emit(balls, strikes)
    if balls >= MAX_BALLS:
        walk.emit()

func add_strike():
    strikes += 1
    count_changed.emit(balls, strikes)
    if strikes >= MAX_STRIKES:
        strikeout.emit()

func add_foul():
    # 界外球：好球數未滿 2 時加 1，已滿 2 不加
    if strikes < 2:
        strikes += 1
        count_changed.emit(balls, strikes)

func reset():
    balls = 0
    strikes = 0
    count_changed.emit(balls, strikes)

func is_full_count() -> bool:
    return balls >= 3 and strikes >= 3
```

### 3.3 base_runner.gd — 跑壘系統

```gdscript
# src/core/base_runner.gd
class_name BaseRunner
extends RefCounted

signal runner_moved(from_base: int, to_base: int)
signal runner_scored()
signal runner_out(base: int)

# bases[1] = 一壘, bases[2] = 二壘, bases[3] = 三壘
# true = 有跑者
var bases: Dictionary = {
    Enums.Base.FIRST: false,
    Enums.Base.SECOND: false,
    Enums.Base.THIRD: false,
}

func has_runner(base: Enums.Base) -> bool:
    return bases.get(base, false)

func has_any_runner() -> bool:
    return bases[Enums.Base.FIRST] or bases[Enums.Base.SECOND] or bases[Enums.Base.THIRD]

func count_runners() -> int:
    var count = 0
    for base in bases.values():
        if base: count += 1
    return count

func place_runner(base: Enums.Base):
    bases[base] = true

func remove_runner(base: Enums.Base):
    bases[base] = false

## 所有跑者向前推進 advance_count 個壘包
## 回傳得分數（跑回本壘的人數）
func advance_all(advance_count: int) -> int:
    var runs_scored = 0

    # 從三壘開始結算（避免碰撞）
    for base_idx in [Enums.Base.THIRD, Enums.Base.SECOND, Enums.Base.FIRST]:
        if bases[base_idx]:
            var new_base = base_idx + advance_count
            bases[base_idx] = false
            if new_base > 3:
                runs_scored += 1
                runner_scored.emit()
            else:
                bases[new_base] = true
                runner_moved.emit(base_idx, new_base)

    return runs_scored

## 打者上壘（推擠機制：如果該壘有人就往前推）
func batter_reaches(target_base: Enums.Base) -> int:
    var runs = advance_all(target_base)
    bases[target_base] = true
    return runs

## 全壘打：所有跑者 + 打者回本壘
func home_run() -> int:
    var runs = 0
    for base in [Enums.Base.FIRST, Enums.Base.SECOND, Enums.Base.THIRD]:
        if bases[base]:
            bases[base] = false
            runs += 1
            runner_scored.emit()
    # 打者自己也得分
    runs += 1
    runner_scored.emit()
    return runs

## 清壘（半局結束時）
func clear_all():
    for base in bases.keys():
        bases[base] = false

## 盜壘：指定壘上跑者前進 1 壘
func steal_advance() -> int:
    # 從最前面的跑者開始推進
    var runs = 0
    for base_idx in [Enums.Base.THIRD, Enums.Base.SECOND, Enums.Base.FIRST]:
        if bases[base_idx]:
            bases[base_idx] = false
            var new_base = base_idx + 1
            if new_base > 3:
                runs += 1
                runner_scored.emit()
            else:
                bases[new_base] = true
                runner_moved.emit(base_idx, new_base)
            break  # 盜壘一次只推進一位跑者
    return runs
```

### 3.4 reaction_chain.gd — 反應鏈結算

```gdscript
# src/core/reaction_chain.gd
class_name ReactionChain
extends RefCounted

signal chain_started(initial_card: Enums.CardType)
signal card_added_to_chain(card_type: Enums.CardType, by_player: int)
signal chain_resolved(final_card: Enums.CardType)

var chain: Array[Dictionary] = []
# 每個 entry: { "card_type": CardType, "player": int }

var is_active: bool = false

func start_chain(card_type: Enums.CardType, player: int):
    chain.clear()
    chain.append({"card_type": card_type, "player": player})
    is_active = true
    chain_started.emit(card_type)

func add_reaction(card_type: Enums.CardType, player: int):
    chain.append({"card_type": card_type, "player": player})
    card_added_to_chain.emit(card_type, player)

func get_last_card() -> Enums.CardType:
    if chain.is_empty():
        return Enums.CardType.BALL  # fallback
    return chain[-1]["card_type"]

func get_effective_card() -> Enums.CardType:
    ## 從鏈尾回溯，找到最終生效的卡牌
    ## 規則：後出的牌若能反制前一張，則前一張無效
    ## 最終生效的是鏈中最後一張未被反制的牌
    if chain.is_empty():
        return Enums.CardType.BALL

    # 反應鏈的最後一張牌即為最終生效牌
    # 因為每張反應牌都是對前一張的反制
    return chain[-1]["card_type"]

func get_initial_card() -> Enums.CardType:
    if chain.is_empty():
        return Enums.CardType.BALL
    return chain[0]["card_type"]

func resolve():
    var effective = get_effective_card()
    is_active = false
    chain_resolved.emit(effective)

func get_chain_length() -> int:
    return chain.size()

func clear():
    chain.clear()
    is_active = false

## 檢查某個玩家是否可以在目前的鏈上出指定的牌
func can_react_with(card_type: Enums.CardType, card_db: Node) -> bool:
    if chain.is_empty():
        return false
    var last_card = get_last_card()
    var card_def = card_db.cards.get(card_type)
    if card_def == null:
        return false
    return last_card in card_def.conditions
```

### 3.5 deck_manager.gd — 牌庫管理

```gdscript
# src/core/deck_manager.gd
class_name DeckManager
extends RefCounted

signal deck_shuffled()
signal cards_drawn(count: int)
signal deck_empty()

var draw_pile: Array[Enums.CardType] = []
var discard_pile: Array[Enums.CardType] = []

func build_deck():
    draw_pile.clear()
    discard_pile.clear()
    var card_db = Engine.get_singleton("CardDatabase")
    if card_db == null:
        # fallback: 手動建構
        _build_deck_manual()
        return
    for card_type in card_db.cards:
        var def = card_db.cards[card_type]
        for i in range(def.total_count):
            draw_pile.append(card_type)

func _build_deck_manual():
    var counts = {
        Enums.CardType.BALL: 16,
        Enums.CardType.STRIKE: 12,
        Enums.CardType.HIT: 6,
        Enums.CardType.GROUND_BALL: 6,
        Enums.CardType.GROUND_OUT: 6,
        Enums.CardType.OUTFIELD_SLUGGING: 6,
        Enums.CardType.FLY_OUT: 6,
        Enums.CardType.BUNT: 6,
        Enums.CardType.UNCAUGHT_THIRD_STRIKE: 6,
        Enums.CardType.STEAL: 6,
        Enums.CardType.THROWN_OUT: 6,
        Enums.CardType.PICK_OUT: 6,
        Enums.CardType.PASSED_BALL: 6,
        Enums.CardType.FOUL_BALL: 6,
        Enums.CardType.ERROR: 6,
        Enums.CardType.NICE_PLAY: 6,
        Enums.CardType.HOME_RUN: 3,
    }
    for card_type in counts:
        for i in range(counts[card_type]):
            draw_pile.append(card_type)

func shuffle():
    draw_pile.shuffle()
    deck_shuffled.emit()

func draw(count: int = 1) -> Array[Enums.CardType]:
    var drawn: Array[Enums.CardType] = []
    for i in range(count):
        if draw_pile.is_empty():
            _recycle_discard()
        if draw_pile.is_empty():
            deck_empty.emit()
            break
        drawn.append(draw_pile.pop_front())
    cards_drawn.emit(drawn.size())
    return drawn

func discard(card_type: Enums.CardType):
    discard_pile.append(card_type)

## 將部分使用過的牌回收至牌庫底部（攻擊牌回收機制）
func recycle_to_bottom(card_type: Enums.CardType, count: int):
    for i in range(count):
        draw_pile.append(card_type)

func _recycle_discard():
    if discard_pile.is_empty():
        return
    draw_pile = discard_pile.duplicate()
    discard_pile.clear()
    shuffle()

func remaining() -> int:
    return draw_pile.size()
```

### 3.6 rule_validator.gd — 規則驗證器

```gdscript
# src/core/rule_validator.gd
class_name RuleValidator
extends RefCounted

var game_state: GameState

func _init(p_game_state: GameState):
    game_state = p_game_state

## 檢查某張牌在目前狀態下是否可以打出
func can_play_card(card_type: Enums.CardType, player: int,
                   card_db_ref) -> Dictionary:
    # 回傳 { "valid": bool, "reason": String }
    var def = card_db_ref.cards.get(card_type)
    if def == null:
        return {"valid": false, "reason": "未知卡牌"}

    var phase = game_state.current_phase

    # ── 階段檢查 ──
    if phase == Enums.GamePhase.PLAY_CARD:
        if player != game_state.offense_player:
            # 守方在出牌階段只能打投手牽制
            if card_type != Enums.CardType.PICK_OUT:
                return {"valid": false, "reason": "目前是攻方出牌階段"}

    if phase == Enums.GamePhase.REACTION:
        if not game_state.reaction_chain.can_react_with(card_type, card_db_ref):
            return {"valid": false, "reason": "無法在目前反應鏈中使用此牌"}

    # ── 球數門檻 ──
    if def.ball_cost > 0:
        var total_pitches = game_state.ball_count.balls + game_state.ball_count.strikes
        if total_pitches < def.ball_cost:
            return {"valid": false,
                    "reason": "球數不足（需要 %d，目前 %d）" % [def.ball_cost, total_pitches]}

    # ── 全壘打特殊條件：需要 3-3 滿球數 ──
    if card_type == Enums.CardType.HOME_RUN:
        if not game_state.ball_count.is_full_count():
            return {"valid": false, "reason": "全壘打需要 3-3 滿球數"}

    # ── 前置卡牌條件（反應鏈中）──
    if not def.conditions.is_empty() and phase == Enums.GamePhase.REACTION:
        if not game_state.reaction_chain.can_react_with(card_type, card_db_ref):
            return {"valid": false, "reason": "需要先有對應的卡牌"}

    # ── 場況條件 ──
    if def.state_conditions.is_valid():
        if not def.state_conditions.call(game_state):
            return {"valid": false, "reason": "場況條件不符"}

    return {"valid": true, "reason": ""}

## 取得玩家手牌中所有可出的牌
func get_playable_cards(player: int, card_db_ref) -> Array[Enums.CardType]:
    var playable: Array[Enums.CardType] = []
    for card in game_state.hands[player].cards:
        var result = can_play_card(card, player, card_db_ref)
        if result["valid"]:
            playable.append(card)
    return playable
```

### 3.7 turn_manager.gd — 回合管理

```gdscript
# src/core/turn_manager.gd
class_name TurnManager
extends RefCounted

signal waiting_for_player(player: int, phase: Enums.GamePhase)
signal card_played(player: int, card_type: Enums.CardType)
signal turn_resolved(result: Dictionary)

var game_state: GameState

func _init(p_game_state: GameState):
    game_state = p_game_state

## ── 抽牌階段 ──
func do_draw_phase():
    var offense = game_state.offense_player
    var drawn = game_state.deck_manager.draw(1)
    if not drawn.is_empty():
        game_state.hands[offense].add_cards(drawn)
    game_state.set_phase(Enums.GamePhase.PLAY_CARD)
    waiting_for_player.emit(offense, Enums.GamePhase.PLAY_CARD)

## ── 出牌 ──
func play_card(player: int, card_type: Enums.CardType):
    game_state.hands[player].remove_card(card_type)
    card_played.emit(player, card_type)

    var def = CardDatabase.cards[card_type]

    match def.category:
        Enums.CardCategory.BASE:
            _resolve_base_card(card_type)
        Enums.CardCategory.ATTACK:
            game_state.reaction_chain.start_chain(card_type, player)
            game_state.set_phase(Enums.GamePhase.REACTION)
            waiting_for_player.emit(game_state.defense_player, Enums.GamePhase.REACTION)
        Enums.CardCategory.DEFENSE, Enums.CardCategory.SPECIAL:
            if game_state.reaction_chain.is_active:
                game_state.reaction_chain.add_reaction(card_type, player)
                # 反應鏈繼續：等待對方回應
                var next_player = 1 - player
                waiting_for_player.emit(next_player, Enums.GamePhase.REACTION)
            else:
                # 非反應鏈中的防守/特殊牌（如投手牽制、盜壘）
                game_state.reaction_chain.start_chain(card_type, player)
                game_state.set_phase(Enums.GamePhase.REACTION)
                var next_player = 1 - player
                waiting_for_player.emit(next_player, Enums.GamePhase.REACTION)

    # 牌使用後處理回收
    _handle_card_recycle(card_type)

func pass_reaction(player: int):
    ## 玩家選擇不回應 → 結算反應鏈
    game_state.reaction_chain.resolve()
    _resolve_chain()

## ── 基礎牌結算（壞球/好球）──
func _resolve_base_card(card_type: Enums.CardType):
    match card_type:
        Enums.CardType.BALL:
            game_state.ball_count.add_ball()
        Enums.CardType.STRIKE:
            game_state.ball_count.add_strike()
    _do_refill_phase()

## ── 反應鏈結算 ──
func _resolve_chain():
    var effective = game_state.reaction_chain.get_effective_card()
    var initial = game_state.reaction_chain.get_initial_card()
    var result = _execute_card_effect(effective, initial)
    game_state.reaction_chain.clear()
    turn_resolved.emit(result)
    _do_refill_phase()

func _execute_card_effect(effective: Enums.CardType,
                          initial: Enums.CardType) -> Dictionary:
    var result = {"runs": 0, "outs": 0, "description": ""}
    var br = game_state.base_runner
    var offense = game_state.offense_player

    match effective:
        Enums.CardType.HIT:
            var runs = br.batter_reaches(Enums.Base.FIRST)
            result.runs = runs
            result.description = "安打！打者上一壘"
            game_state.ball_count.reset()

        Enums.CardType.GROUND_BALL:
            var runs = br.batter_reaches(Enums.Base.FIRST)
            result.runs = runs
            result.description = "內野滾地！打者上一壘"
            game_state.ball_count.reset()

        Enums.CardType.GROUND_OUT:
            game_state.add_out(1)
            result.outs = 1
            result.description = "內野封殺！出局"
            if br.has_runner(Enums.Base.FIRST):
                game_state.add_out(1)
                result.outs = 2
                result.description = "雙殺！"
                br.remove_runner(Enums.Base.FIRST)
            game_state.ball_count.reset()

        Enums.CardType.OUTFIELD_SLUGGING:
            var runs = br.batter_reaches(Enums.Base.SECOND)
            result.runs = runs
            result.description = "外野高飛（長打）！打者上二壘"
            game_state.ball_count.reset()

        Enums.CardType.FLY_OUT:
            game_state.add_out(1)
            result.outs = 1
            result.description = "外野接殺！出局"
            # 犧牲飛球
            if br.has_runner(Enums.Base.THIRD):
                br.remove_runner(Enums.Base.THIRD)
                result.runs = 1
                result.description += "（犧牲飛球，三壘跑者得分）"
                game_state.add_score(offense, 1)
            game_state.ball_count.reset()

        Enums.CardType.BUNT:
            game_state.add_out(1)
            result.outs = 1
            var runs = br.advance_all(1)
            result.runs = runs
            result.description = "觸擊短打！打者犧牲出局，跑者推進"
            game_state.ball_count.reset()

        Enums.CardType.UNCAUGHT_THIRD_STRIKE:
            br.place_runner(Enums.Base.FIRST)
            result.description = "不死三振！打者衝上一壘"

        Enums.CardType.STEAL:
            var runs = br.steal_advance()
            result.runs = runs
            result.description = "盜壘成功！"

        Enums.CardType.THROWN_OUT:
            game_state.add_out(1)
            result.outs = 1
            result.description = "補手防盜成功！跑者出局"

        Enums.CardType.PICK_OUT:
            game_state.add_out(1)
            result.outs = 1
            result.description = "投手牽制成功！跑者出局"

        Enums.CardType.PASSED_BALL:
            var runs = br.advance_all(1)
            result.runs = runs
            game_state.ball_count.add_ball()
            result.description = "暴投補逸！跑者推進，壞球+1"

        Enums.CardType.FOUL_BALL:
            game_state.ball_count.add_foul()
            result.description = "界外球！好球+1"
            # 兩好球觸擊短打出局的情況在初始牌為 BUNT 時處理
            if initial == Enums.CardType.BUNT and game_state.ball_count.strikes >= 2:
                game_state.add_out(1)
                result.outs = 1
                result.description = "兩好球觸擊界外！打者出局"

        Enums.CardType.HOME_RUN:
            var runs = br.home_run()
            result.runs = runs
            game_state.add_score(offense, runs)
            result.description = "全壘打！！！%d 分打點" % runs
            game_state.ball_count.reset()

        Enums.CardType.ERROR:
            # 失誤使守備無效 → 回溯到原始攻擊牌的效果
            result = _execute_card_effect(initial, initial)
            result.description = "失誤！守備無效，" + result.description

        Enums.CardType.NICE_PLAY:
            # 美技使失誤無效 → 守備牌生效
            # 需要找到鏈中的守備牌
            var chain = game_state.reaction_chain.chain
            if chain.size() >= 2:
                var defense_card = chain[1]["card_type"]
                result = _execute_card_effect(defense_card, initial)
                result.description = "美技！" + result.description

    # 得分結算
    if result.runs > 0 and effective != Enums.CardType.HOME_RUN:
        game_state.add_score(offense, result.runs)

    return result

func _handle_card_recycle(card_type: Enums.CardType):
    var def = CardDatabase.cards.get(card_type)
    if def == null:
        return
    var recycle_count = def.total_count - def.used_count
    if recycle_count > 0:
        game_state.deck_manager.recycle_to_bottom(card_type, recycle_count)
    game_state.deck_manager.discard(card_type)

func _do_refill_phase():
    game_state.set_phase(Enums.GamePhase.REFILL)
    for i in range(2):
        var deficit = game_state.max_hand_size - game_state.hands[i].count()
        if deficit > 0:
            var drawn = game_state.deck_manager.draw(deficit)
            game_state.hands[i].add_cards(drawn)
    game_state.set_phase(Enums.GamePhase.DRAW)
```

---

## 4. AI 系統

### 4.1 ai_controller.gd — AI 基礎介面

```gdscript
# src/ai/ai_controller.gd
class_name AIController
extends RefCounted

var game_state: GameState
var player_index: int
var level: Enums.AILevel

func _init(p_game_state: GameState, p_player: int, p_level: Enums.AILevel):
    game_state = p_game_state
    player_index = p_player
    level = p_level

## 子類別覆寫此方法
func choose_card(playable_cards: Array[Enums.CardType]) -> Enums.CardType:
    return playable_cards[0]  # 預設選第一張

## 決定是否在反應鏈中回應
func should_react(playable_reactions: Array[Enums.CardType]) -> Enums.CardType:
    return Enums.CardType.BALL  # BALL 代表不回應 (pass)
```

### 4.2 ai_easy.gd — 隨機 AI

```gdscript
# src/ai/ai_easy.gd
class_name AIEasy
extends AIController

func choose_card(playable_cards: Array[Enums.CardType]) -> Enums.CardType:
    return playable_cards[randi() % playable_cards.size()]

func should_react(playable_reactions: Array[Enums.CardType]) -> Enums.CardType:
    # 50% 機率回應
    if randf() > 0.5 and not playable_reactions.is_empty():
        return playable_reactions[randi() % playable_reactions.size()]
    return Enums.CardType.BALL
```

### 4.3 ai_hard.gd — 策略 AI（權重評估）

```gdscript
# src/ai/ai_hard.gd
class_name AIHard
extends AIController

## 依據場況評估每張牌的價值，選擇最佳出牌
func choose_card(playable_cards: Array[Enums.CardType]) -> Enums.CardType:
    var best_card = playable_cards[0]
    var best_score = -999.0

    for card in playable_cards:
        var score = _evaluate_card(card)
        if score > best_score:
            best_score = score
            best_card = card

    return best_card

func should_react(playable_reactions: Array[Enums.CardType]) -> Enums.CardType:
    if playable_reactions.is_empty():
        return Enums.CardType.BALL

    # 評估是否值得反應
    for reaction in playable_reactions:
        var score = _evaluate_reaction(reaction)
        if score > 0.5:
            return reaction

    return Enums.CardType.BALL

func _evaluate_card(card: Enums.CardType) -> float:
    var score = 0.0
    var br = game_state.base_runner
    var bc = game_state.ball_count
    var is_offense = (player_index == game_state.offense_player)

    if is_offense:
        match card:
            Enums.CardType.HOME_RUN:
                score = 10.0 + br.count_runners() * 5.0
            Enums.CardType.OUTFIELD_SLUGGING:
                score = 5.0 + br.count_runners() * 2.0
            Enums.CardType.HIT:
                score = 3.0 + br.count_runners() * 1.5
            Enums.CardType.STEAL:
                score = 2.5 if br.has_runner(Enums.Base.SECOND) else 1.5
            Enums.CardType.BUNT:
                # 有三壘跑者時觸擊價值高
                score = 4.0 if br.has_runner(Enums.Base.THIRD) else 1.0
            Enums.CardType.BALL:
                score = 0.5
            _:
                score = 1.0
    else:
        match card:
            Enums.CardType.STRIKE:
                score = 2.0 + bc.strikes * 1.5  # 好球數越多越值得投
            Enums.CardType.BALL:
                score = 0.3
            Enums.CardType.PICK_OUT:
                score = 3.0 if br.has_any_runner() else 0.0
            _:
                score = 1.0

    # 加入隨機性（±10%）避免 AI 過於可預測
    score *= randf_range(0.9, 1.1)
    return score

func _evaluate_reaction(reaction: Enums.CardType) -> float:
    var br = game_state.base_runner
    match reaction:
        Enums.CardType.GROUND_OUT:
            return 3.0 + (2.0 if br.has_runner(Enums.Base.FIRST) else 0.0)
        Enums.CardType.FLY_OUT:
            return 3.0
        Enums.CardType.THROWN_OUT:
            return 2.5
        Enums.CardType.FOUL_BALL:
            return 2.0
        Enums.CardType.ERROR:
            return 4.0  # 失誤逆轉價值高
        Enums.CardType.NICE_PLAY:
            return 4.5  # 美技價值最高
        _:
            return 0.0
```

---

## 5. UI 場景架構

### 5.1 game_screen.tscn 場景樹

```
GameScreen (Control)
├── Background (TextureRect)
│
├── TopPanel (HBoxContainer)               # 頂部資訊列
│   ├── InningDisplay (Label)              # "第1局 上半"
│   ├── Spacer (Control)
│   └── PauseButton (Button)
│
├── Scoreboard (HBoxContainer)             # 計分板
│   ├── AwayTeamScore (VBoxContainer)
│   │   ├── TeamLabel (Label)              # "客隊"
│   │   └── ScoreLabel (Label)             # "0"
│   ├── Separator (VSeparator)
│   └── HomeTeamScore (VBoxContainer)
│       ├── TeamLabel (Label)              # "主隊"
│       └── ScoreLabel (Label)             # "0"
│
├── FieldArea (CenterContainer)            # 球場區域
│   ├── FieldBoard (TextureRect)           # 棒球場圖板
│   ├── FirstBaseMarker (Sprite2D)
│   ├── SecondBaseMarker (Sprite2D)
│   ├── ThirdBaseMarker (Sprite2D)
│   └── HomeBaseMarker (Sprite2D)
│
├── BallCountDisplay (HBoxContainer)       # BSO 球數顯示
│   ├── BallIndicators (HBoxContainer)     # ○○○○
│   ├── StrikeIndicators (HBoxContainer)   # ○○○
│   └── OutIndicators (HBoxContainer)      # ○○○
│
├── OpponentHand (HBoxContainer)           # 對手手牌（牌背朝上）
│
├── ReactionChainUI (VBoxContainer)        # 反應鏈顯示區
│   └── ChainCards (HBoxContainer)
│
├── PlayerHand (HBoxContainer)             # 玩家手牌
│
├── DeckArea (HBoxContainer)               # 牌庫區
│   ├── DrawPile (TextureRect + Label)     # 牌庫 + 剩餘數
│   └── DiscardPile (TextureRect + Label)  # 棄牌堆
│
├── ActionButtons (HBoxContainer)          # 行動按鈕
│   ├── PlayButton (Button)                # "出牌"
│   └── PassButton (Button)               # "跳過"
│
├── CardTooltip (PanelContainer)           # 卡牌資訊浮窗
│   ├── CardName (Label)
│   ├── CardEffect (RichTextLabel)
│   └── CardCondition (Label)
│
├── TurnIndicator (Label)                  # "你的回合" / "等待對手..."
│
└── AnimationLayer (CanvasLayer)           # 動畫層
    ├── CardAnimPlayer (AnimationPlayer)
    └── EffectParticles (GPUParticles2D)
```

### 5.2 手牌互動邏輯

```gdscript
# src/ui/components/hand_display.gd
extends HBoxContainer

signal card_selected(card_type: Enums.CardType, card_node: Node)
signal card_played(card_type: Enums.CardType)

@export var card_scene: PackedScene  # 預載入 card.tscn

var selected_card: Node = null
var playable_cards: Array[Enums.CardType] = []

func display_hand(cards: Array[Enums.CardType], playable: Array[Enums.CardType]):
    _clear_hand()
    playable_cards = playable

    for card_type in cards:
        var card_node = card_scene.instantiate()
        card_node.setup(card_type)
        card_node.set_playable(card_type in playable)
        card_node.card_clicked.connect(_on_card_clicked)
        card_node.card_hovered.connect(_on_card_hovered)
        add_child(card_node)

func _on_card_clicked(card_node: Node):
    if selected_card == card_node:
        # 雙擊出牌
        card_played.emit(card_node.card_type)
        return

    if selected_card:
        selected_card.deselect()

    selected_card = card_node
    card_node.select()
    card_selected.emit(card_node.card_type, card_node)

func _on_card_hovered(card_node: Node, is_hovered: bool):
    if is_hovered:
        # 顯示 tooltip
        var tooltip = get_node("../../CardTooltip")
        if tooltip:
            tooltip.show_card_info(card_node.card_type)
    else:
        var tooltip = get_node("../../CardTooltip")
        if tooltip:
            tooltip.hide()

func _clear_hand():
    for child in get_children():
        child.queue_free()
    selected_card = null
```

### 5.3 card.gd — 卡牌節點

```gdscript
# src/cards/card.gd
extends Control

signal card_clicked(card_node: Node)
signal card_hovered(card_node: Node, is_hovered: bool)

@onready var card_texture: TextureRect = $CardTexture
@onready var card_name_label: Label = $CardName
@onready var highlight: ColorRect = $Highlight

var card_type: Enums.CardType
var is_playable: bool = false
var is_selected: bool = false

const HOVER_OFFSET := Vector2(0, -20)
const SELECT_OFFSET := Vector2(0, -40)

func setup(p_card_type: Enums.CardType):
    card_type = p_card_type
    var def = CardDatabase.cards[card_type]
    card_name_label.text = def.name_zh
    var tex = load(def.texture_path)
    if tex:
        card_texture.texture = tex

func set_playable(playable: bool):
    is_playable = playable
    modulate = Color.WHITE if playable else Color(0.5, 0.5, 0.5, 0.8)

func select():
    is_selected = true
    var tween = create_tween()
    tween.tween_property(self, "position", position + SELECT_OFFSET, 0.15)
    highlight.visible = true

func deselect():
    is_selected = false
    var tween = create_tween()
    tween.tween_property(self, "position", position - SELECT_OFFSET, 0.15)
    highlight.visible = false

func _gui_input(event: InputEvent):
    if event is InputEventMouseButton and event.pressed:
        if is_playable:
            card_clicked.emit(self)

func _on_mouse_entered():
    card_hovered.emit(self, true)
    if not is_selected and is_playable:
        var tween = create_tween()
        tween.tween_property(self, "position", position + HOVER_OFFSET, 0.1)

func _on_mouse_exited():
    card_hovered.emit(self, false)
    if not is_selected:
        var tween = create_tween()
        tween.tween_property(self, "position", position - HOVER_OFFSET, 0.1)
```

---

## 6. 跨平台配置

### 6.1 project.godot 關鍵設定

```ini
[application]
config/name="棒球卡牌對戰"
config/name_localized={ "en": "Baseball Card Duel", "zh_TW": "棒球卡牌對戰" }
run/main_scene="res://src/main/main.tscn"
config/features=PackedStringArray("4.3")

[autoload]
Enums="*res://src/data/enums.gd"
CardDatabase="*res://src/data/card_database.gd"
GameConfig="*res://src/main/game_config.gd"
PlatformManager="*res://src/platform/platform_manager.gd"

[display]
window/size/viewport_width=1920
window/size/viewport_height=1080
window/stretch/mode="canvas_items"
window/stretch/aspect="expand"
window/handheld/orientation="landscape"

[input]
touch_tap={ "deadzone": 0.5, "events": [] }

[rendering]
renderer/rendering_method="mobile"
textures/vram_compression/import_etc2_astc=true
```

### 6.2 platform_manager.gd

```gdscript
# src/platform/platform_manager.gd
extends Node

var current_platform: Enums.Platform

func _ready():
    _detect_platform()
    _apply_platform_settings()

func _detect_platform():
    var os_name = OS.get_name()
    match os_name:
        "iOS":
            current_platform = Enums.Platform.IOS
        "Android":
            current_platform = Enums.Platform.ANDROID
        _:
            current_platform = Enums.Platform.STEAM

func _apply_platform_settings():
    match current_platform:
        Enums.Platform.IOS, Enums.Platform.ANDROID:
            _setup_mobile()
        Enums.Platform.STEAM:
            _setup_steam()

func _setup_mobile():
    # 啟用觸控優化
    get_viewport().gui_embed_subwindows = true
    # 調整 UI 縮放（手機螢幕較小）
    get_tree().root.content_scale_factor = _calculate_scale_factor()

func _setup_steam():
    # 初始化 Steam SDK
    if Engine.has_singleton("Steam"):
        var steam = Engine.get_singleton("Steam")
        steam.steamInit()
        print("Steam initialized: ", steam.isSteamRunning())

func _calculate_scale_factor() -> float:
    var screen_size = DisplayServer.screen_get_size()
    var min_dim = min(screen_size.x, screen_size.y)
    if min_dim < 720:
        return 0.75
    elif min_dim < 1080:
        return 0.85
    return 1.0

func is_mobile() -> bool:
    return current_platform in [Enums.Platform.IOS, Enums.Platform.ANDROID]

func is_steam() -> bool:
    return current_platform == Enums.Platform.STEAM
```

### 6.3 匯出設定摘要

| 平台 | 匯出模板 | 關鍵設定 |
|------|----------|----------|
| **Steam (Win/Mac/Linux)** | Godot 官方 Desktop 模板 | 搭配 GodotSteam plugin；需設定 `steam_appid.txt` |
| **iOS** | Godot 官方 iOS 模板 | Xcode 簽名；最低版本 iOS 15；需 Apple Developer 帳號 |
| **Android** | Godot 官方 Android 模板 | `minSdk=24`；`targetSdk=34`；需 keystore 簽名 |

---

## 7. 音效與動畫規格

### 7.1 音效清單

| 事件 | 檔案 | 格式 | 長度 |
|------|------|------|------|
| 抽牌 | `card_draw.ogg` | OGG Vorbis | 0.3s |
| 出牌 | `card_play.ogg` | OGG Vorbis | 0.5s |
| 三振出局 | `strike_out.ogg` | OGG Vorbis | 1.2s |
| 全壘打 | `home_run.ogg` | OGG Vorbis | 3.0s |
| 歡呼聲 | `crowd_cheer.ogg` | OGG Vorbis | 2.0s |
| 出局 | `out.ogg` | OGG Vorbis | 0.8s |
| 失誤哨音 | `error_whistle.ogg` | OGG Vorbis | 0.6s |
| 背景音樂 | `bgm_game.ogg` | OGG Vorbis | 循環 |

### 7.2 關鍵動畫

| 動畫 | 觸發時機 | 時長 | 說明 |
|------|----------|------|------|
| 卡牌翻轉 | 抽牌時 | 0.3s | Y 軸旋轉從牌背到牌面 |
| 卡牌飛出 | 出牌時 | 0.4s | 從手牌區飛到場中央 |
| 跑者移動 | 跑壘推進時 | 0.5s | 壘包標記滑動到下一壘 |
| 全壘打特效 | 全壘打結算時 | 2.0s | 粒子特效 + 畫面震動 + 慢動作 |
| 出局標記 | 出局時 | 0.3s | BSO 面板亮燈 |
| 反應鏈展開 | 進入反應階段 | 0.3s | 反應鏈 UI 由下方滑入 |

---

## 8. 開發順序與里程碑

### Phase 1：核心可玩（第 1–4 週）

```
Week 1: 專案建立 + 資料層
  - [ ] 建立 Godot 專案與目錄結構
  - [ ] 實作 enums.gd, card_database.gd
  - [ ] 實作 ball_count.gd + 單元測試
  - [ ] 實作 base_runner.gd + 單元測試

Week 2: 遊戲邏輯核心
  - [ ] 實作 deck_manager.gd + 單元測試
  - [ ] 實作 hand_manager.gd
  - [ ] 實作 game_state.gd
  - [ ] 實作 rule_validator.gd + 單元測試

Week 3: 回合與反應鏈
  - [ ] 實作 reaction_chain.gd + 單元測試
  - [ ] 實作 turn_manager.gd + 整合測試
  - [ ] 實作所有 17 種卡牌的 effect 腳本
  - [ ] 核心邏輯完整可跑（純文字 debug 輸出）

Week 4: 基礎 UI
  - [ ] 建立 game_screen.tscn 場景樹
  - [ ] 實作手牌顯示與互動 (hand_display.gd)
  - [ ] 實作球場顯示 (field_display.gd)
  - [ ] 實作計分板與球數顯示
  - [ ] 可進行完整的本地雙人對戰
```

### Phase 2：AI 與完善（第 5–8 週）

```
Week 5-6: AI 系統
  - [ ] 實作 ai_easy.gd（隨機出牌）
  - [ ] 實作 ai_medium.gd（簡單策略）
  - [ ] 實作 ai_hard.gd（權重評估）
  - [ ] AI 對戰可正常進行

Week 7: UI 打磨
  - [ ] 卡牌動畫（翻轉、飛出、手牌展開）
  - [ ] 反應鏈視覺化展示
  - [ ] 音效整合
  - [ ] 標題畫面、設定畫面、結算畫面

Week 8: 教學與設定
  - [ ] 快速入門教學 (tutorial_dialog)
  - [ ] 遊戲設定（局數、音量、AI 難度）
  - [ ] 存檔/讀檔系統
  - [ ] Bug 修復與平衡調整
```

### Phase 3：跨平台上架（第 9–12 週）

```
Week 9-10: 平台適配
  - [ ] Steam 整合 (GodotSteam)
    - 成就系統
    - Steam Cloud 存檔
    - Rich Presence
  - [ ] iOS 適配
    - 觸控操作優化
    - 安全區域適配 (Safe Area)
    - Game Center 整合
  - [ ] Android 適配
    - 返回鍵處理
    - 螢幕適配（手機/平板）
    - Google Play Games 整合

Week 11: 測試
  - [ ] Steam Playtest 公開測試
  - [ ] iOS TestFlight 測試
  - [ ] Android 內部測試
  - [ ] 修復所有 Critical / Major bugs

Week 12: 上架
  - [ ] Steam 商店頁面上架
  - [ ] App Store 送審
  - [ ] Google Play 送審
  - [ ] 上架後監控與熱修復準備
```

### Phase 4：線上對戰（第 13–20 週，選配）

```
  - [ ] WebSocket 伺服器架設
  - [ ] 配對系統 (matchmaking.gd)
  - [ ] 遊戲狀態同步 (sync_manager.gd)
  - [ ] 排名積分系統
  - [ ] 反作弊機制（伺服器端驗證）
```

---

## 9. 測試規範

### 9.1 單元測試範例 (GdUnit4)

```gdscript
# tests/test_ball_count.gd
extends GdUnitTestSuite

var ball_count: BallCount

func before_test():
    ball_count = BallCount.new()

func test_initial_count():
    assert_int(ball_count.balls).is_equal(0)
    assert_int(ball_count.strikes).is_equal(0)

func test_add_ball():
    ball_count.add_ball()
    assert_int(ball_count.balls).is_equal(1)

func test_walk_on_four_balls():
    var walk_emitted = false
    ball_count.walk.connect(func(): walk_emitted = true)
    for i in range(4):
        ball_count.add_ball()
    assert_bool(walk_emitted).is_true()

func test_strikeout_on_three_strikes():
    var strikeout_emitted = false
    ball_count.strikeout.connect(func(): strikeout_emitted = true)
    for i in range(3):
        ball_count.add_strike()
    assert_bool(strikeout_emitted).is_true()

func test_foul_adds_strike_under_two():
    ball_count.add_foul()
    assert_int(ball_count.strikes).is_equal(1)
    ball_count.add_foul()
    assert_int(ball_count.strikes).is_equal(2)
    ball_count.add_foul()  # 兩好球後界外不加
    assert_int(ball_count.strikes).is_equal(2)

func test_full_count():
    for i in range(3):
        ball_count.add_ball()
        ball_count.add_strike()
    assert_bool(ball_count.is_full_count()).is_true()

func test_reset():
    ball_count.add_ball()
    ball_count.add_strike()
    ball_count.reset()
    assert_int(ball_count.balls).is_equal(0)
    assert_int(ball_count.strikes).is_equal(0)
```

### 9.2 測試覆蓋重點

| 模組 | 必測項目 |
|------|----------|
| `ball_count` | 四壞保送、三振、界外球好球上限、滿球數判定、歸零 |
| `base_runner` | 推進1壘/2壘、全壘打清壘、盜壘、打者上壘推擠、得分計算 |
| `deck_manager` | 洗牌隨機性、抽牌耗盡回收、棄牌回收、牌數正確性 |
| `reaction_chain` | 單層反應、多層反應鏈、最終生效牌判定、失誤→美技鏈 |
| `rule_validator` | 全壘打滿球數限制、觸擊需壘上有人、不死三振條件、防守牌前置條件 |
| `turn_manager` | 完整回合流程、半局交換、延長賽觸發、雙殺結算 |
| `card_effects` | 每張卡牌效果正確性、邊界情況 |
| `ai_controller` | AI 能正常完成整場比賽不卡住、不打出非法牌 |

---

## 10. 命名規範速查表

| 類別 | 規範 | 範例 |
|------|------|------|
| GDScript 檔案 | `snake_case.gd` | `ball_count.gd` |
| 場景檔案 | `snake_case.tscn` | `game_screen.tscn` |
| 類別名 | `PascalCase` | `BallCount` |
| 函式 | `snake_case` | `add_ball()` |
| 變數 | `snake_case` | `is_top_inning` |
| 常數 | `UPPER_SNAKE_CASE` | `MAX_BALLS` |
| 信號 | `snake_case`（過去式或名詞） | `card_played`, `phase_changed` |
| 列舉值 | `UPPER_SNAKE_CASE` | `CardType.HOME_RUN` |
| 場景節點 | `PascalCase` | `HandDisplay` |
| 資源路徑 | `snake_case` | `res://assets/cards/home_run.png` |
| Commit | `[module] description` | `[core] fix double play logic` |

---

## 11. 注意事項與限制

1. **Godot 4.3 相容性**：確認所有 API 使用 Godot 4.3 語法，避免 deprecated 方法。
2. **行動裝置效能**：粒子特效限制在 100 個粒子以內；紋理使用 ETC2/ASTC 壓縮。
3. **觸控適配**：所有可互動元素最小觸控區域 48×48 dp；卡牌拖曳需支援觸控。
4. **字型**：使用 Noto Sans TC 確保繁體中文正確顯示；英文可用 Noto Sans。
5. **螢幕方向**：固定橫向（Landscape）。
6. **存檔格式**：使用 JSON 格式，路徑 `user://save_data.json`。
7. **Steam 成就**：至少設計 10 個成就（首勝、全壘打、完封、連勝等）。
8. **無網路依賴**：單機模式不需要任何網路連線。線上對戰為獨立模組。
9. **本地化準備**：所有 UI 字串使用 Godot 內建 `TranslationServer`，預留英文/日文翻譯。
10. **隱私政策**：iOS/Android 上架需準備隱私政策頁面，遊戲不收集個人資料。
