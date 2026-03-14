# ⚾ 棒球卡牌對戰 — QA 測試計畫書

**Baseball Card Duel — QA Test Plan**

版本 1.0 ｜ 2026 年 3 月

---

## 1. 測試策略總覽

### 1.1 測試層級

| 層級 | 覆蓋範圍 | 工具 | 執行時機 |
|------|----------|------|----------|
| **單元測試** | 核心邏輯模組 (core/) | GdUnit4 | 每次 commit |
| **整合測試** | 模組間互動 | GdUnit4 | 每次 PR merge |
| **功能測試** | 完整遊戲流程 | 自動化腳本 + 手動 | 每週 |
| **平衡性測試** | AI 對戰模擬 | 自訂 Monte Carlo 腳本 | Phase 1/3 |
| **效能測試** | FPS / 記憶體 / 載入時間 | Godot Profiler + 自訂 | Phase 2 結束 |
| **平台測試** | Steam / iOS / Android 相容 | 實機測試 | Phase 3 |
| **使用者測試** | 上手難度 / UX 問題 | 人工觀察 + 問卷 | Phase 3 |

### 1.2 覆蓋率目標

| 模組 | 目標覆蓋率 |
|------|-----------|
| core/ (所有邏輯模組) | ≥ 95% |
| cards/effects/ | ≥ 90% |
| ai/ | ≥ 80% |
| ui/ | ≥ 60%（互動邏輯部分） |
| network/ | ≥ 85% |

---

## 2. 單元測試案例

### 2.1 ball_count.gd — 球數系統

| 編號 | 測試案例 | 初始狀態 | 操作 | 預期結果 |
|------|----------|----------|------|----------|
| BC-001 | 初始化 | 新建 BallCount | — | balls=0, strikes=0 |
| BC-002 | 壞球累加 | balls=0 | add_ball() ×1 | balls=1 |
| BC-003 | 壞球累加至 3 | balls=0 | add_ball() ×3 | balls=3, 無 walk 信號 |
| BC-004 | 四壞保送 | balls=0 | add_ball() ×4 | balls=4, 觸發 walk 信號 |
| BC-005 | 好球累加 | strikes=0 | add_strike() ×1 | strikes=1 |
| BC-006 | 三振出局 | strikes=0 | add_strike() ×3 | strikes=3, 觸發 strikeout 信號 |
| BC-007 | 界外球加好球 (0好球) | strikes=0 | add_foul() | strikes=1 |
| BC-008 | 界外球加好球 (1好球) | strikes=1 | add_foul() | strikes=2 |
| BC-009 | 界外球不加好球 (2好球) | strikes=2 | add_foul() | strikes=2 (不變) |
| BC-010 | 界外球連打 (2好球後) | strikes=2 | add_foul() ×5 | strikes=2 (持續不變) |
| BC-011 | 滿球數判定 — 是 | balls=3, strikes=3 | is_full_count() | true |
| BC-012 | 滿球數判定 — 否 | balls=2, strikes=3 | is_full_count() | false |
| BC-013 | 歸零 | balls=3, strikes=2 | reset() | balls=0, strikes=0 |
| BC-014 | 歸零後再累加 | reset() 後 | add_ball(), add_strike() | balls=1, strikes=1 |
| BC-015 | 信號順序 — 保送 | balls=3 | add_ball() | 先 count_changed 再 walk |
| BC-016 | 信號順序 — 三振 | strikes=2 | add_strike() | 先 count_changed 再 strikeout |

### 2.2 base_runner.gd — 跑壘系統

| 編號 | 測試案例 | 初始狀態 | 操作 | 預期結果 |
|------|----------|----------|------|----------|
| BR-001 | 空壘判定 | 全空壘 | has_any_runner() | false |
| BR-002 | 放置一壘跑者 | 全空壘 | place_runner(FIRST) | FIRST=true |
| BR-003 | 打者上一壘 (空壘) | 全空壘 | batter_reaches(FIRST) | FIRST=true, 回傳 runs=0 |
| BR-004 | 打者上一壘 (一壘有人) | FIRST=true | batter_reaches(FIRST) | FIRST=true, SECOND=true, runs=0 |
| BR-005 | 打者上一壘 (滿壘) | 一二三壘皆有人 | batter_reaches(FIRST) | 三壘→得分, runs=1 |
| BR-006 | 打者上二壘 (空壘) | 全空壘 | batter_reaches(SECOND) | SECOND=true, runs=0 |
| BR-007 | 打者上二壘 (一壘有人) | FIRST=true | batter_reaches(SECOND) | SECOND=true, THIRD=true, runs=0 |
| BR-008 | 打者上二壘 (二三壘有人) | SECOND=true, THIRD=true | batter_reaches(SECOND) | 三壘→得分, SECOND=true, runs=1 |
| BR-009 | 全壘打 (空壘) | 全空壘 | home_run() | 全空壘, runs=1 |
| BR-010 | 全壘打 (一壘有人) | FIRST=true | home_run() | 全空壘, runs=2 |
| BR-011 | 全壘打 (滿壘) | 一二三壘皆有人 | home_run() | 全空壘, runs=4（滿貫） |
| BR-012 | 推進全部 1 壘 | FIRST=true, THIRD=true | advance_all(1) | SECOND=true, runs=1 |
| BR-013 | 推進全部 2 壘 | FIRST=true, SECOND=true | advance_all(2) | THIRD=true, runs=1 |
| BR-014 | 盜壘 (一壘) | FIRST=true | steal_advance() | SECOND=true, FIRST=false |
| BR-015 | 盜壘 (三壘) | THIRD=true | steal_advance() | runs=1, THIRD=false |
| BR-016 | 盜壘 (多人 — 只推最前者) | FIRST=true, THIRD=true | steal_advance() | THIRD→得分, FIRST 不動 |
| BR-017 | 清壘 | 一二三壘有人 | clear_all() | 全空壘 |
| BR-018 | 移除跑者 | FIRST=true | remove_runner(FIRST) | FIRST=false |
| BR-019 | 得分信號計數 | 滿壘 | home_run() | runner_scored 信號觸發 4 次 |

### 2.3 deck_manager.gd — 牌庫管理

| 編號 | 測試案例 | 操作 | 預期結果 |
|------|----------|------|----------|
| DM-001 | 建構牌組總數 | build_deck() | draw_pile.size() == 111 |
| DM-002 | 各牌數量正確 | build_deck() | BALL=16, STRIKE=12, HIT=6, ... HOME_RUN=3 |
| DM-003 | 洗牌後數量不變 | shuffle() | draw_pile.size() == 111 |
| DM-004 | 洗牌隨機性 | shuffle() ×2 | 兩次順序不同（統計機率測試） |
| DM-005 | 抽 1 張 | draw(1) | 回傳 1 張, draw_pile 少 1 |
| DM-006 | 抽 7 張 | draw(7) | 回傳 7 張, draw_pile 少 7 |
| DM-007 | 抽完牌庫 | draw(111) | 回傳 111 張, draw_pile=0 |
| DM-008 | 牌庫空再抽 (有棄牌) | draw_pile=0, discard 有牌 | 自動回收棄牌洗牌再抽 |
| DM-009 | 牌庫空再抽 (無棄牌) | draw_pile=0, discard=0 | 觸發 deck_empty, 回傳空陣列 |
| DM-010 | 棄牌 | discard(BALL) | discard_pile 增加 1 張 BALL |
| DM-011 | 回收至底部 | recycle_to_bottom(HIT, 2) | draw_pile 尾端增加 2 張 HIT |
| DM-012 | 剩餘數查詢 | draw(10) 後 | remaining() == 101 |

### 2.4 reaction_chain.gd — 反應鏈

| 編號 | 測試案例 | 操作 | 預期結果 |
|------|----------|------|----------|
| RC-001 | 啟動鏈 | start_chain(GROUND_BALL, 0) | is_active=true, chain.size()=1 |
| RC-002 | 單層反應 | start→add(GROUND_OUT, 1) | chain.size()=2, last=GROUND_OUT |
| RC-003 | 多層反應 | start(OUTFIELD)→add(FLY_OUT)→add(ERROR)→add(NICE_PLAY) | chain.size()=4 |
| RC-004 | 生效牌 — 無反應 | start(HIT) → resolve | effective=HIT |
| RC-005 | 生效牌 — 被接殺 | start(OUTFIELD)→add(FLY_OUT) → resolve | effective=FLY_OUT |
| RC-006 | 生效牌 — 失誤逆轉 | start(OUTFIELD)→add(FLY_OUT)→add(ERROR) → resolve | effective=ERROR |
| RC-007 | 生效牌 — 美技再逆轉 | ...→add(ERROR)→add(NICE_PLAY) → resolve | effective=NICE_PLAY |
| RC-008 | 清除鏈 | resolve 後 | is_active=false, chain 清空 |
| RC-009 | 可反應檢查 — 合法 | chain last=GROUND_BALL | can_react_with(GROUND_OUT) → true |
| RC-010 | 可反應檢查 — 非法 | chain last=GROUND_BALL | can_react_with(FLY_OUT) → false |
| RC-011 | 信號觸發 | start→add→resolve | chain_started, card_added, chain_resolved 各觸發一次 |

### 2.5 rule_validator.gd — 規則驗證器

| 編號 | 測試案例 | 場況 | 嘗試打出 | 預期結果 |
|------|----------|------|----------|----------|
| RV-001 | 壞球隨時可出 | 任何狀態, 攻方 | BALL | valid=true |
| RV-002 | 好球隨時可出 | 任何狀態, 攻方 | STRIKE | valid=true |
| RV-003 | 安打需球數≥2 | balls+strikes=1 | HIT | valid=false |
| RV-004 | 安打球數足夠 | balls=1, strikes=1 | HIT | valid=true |
| RV-005 | 全壘打需 3-3 | balls=3, strikes=2 | HOME_RUN | valid=false |
| RV-006 | 全壘打 3-3 可出 | balls=3, strikes=3 | HOME_RUN | valid=true |
| RV-007 | 觸擊需壘上有人 | 全空壘 | BUNT | valid=false |
| RV-008 | 觸擊壘上有人 | FIRST=true | BUNT | valid=true |
| RV-009 | 盜壘需一/二壘有人 | 只有 THIRD | STEAL | valid=false |
| RV-010 | 盜壘一壘有人 | FIRST=true | STEAL | valid=true |
| RV-011 | 不死三振條件不符 (1出局) | outs=1, FIRST=false, strikes=3 | UNCAUGHT_3RD | valid=false |
| RV-012 | 不死三振條件不符 (一壘有人) | outs=2, FIRST=true, strikes=3 | UNCAUGHT_3RD | valid=false |
| RV-013 | 不死三振條件符合 | outs=2, FIRST=false, strikes=3 | UNCAUGHT_3RD | valid=true |
| RV-014 | 內野封殺需有內野滾地 | reaction 中無 GROUND_BALL | GROUND_OUT | valid=false |
| RV-015 | 外野接殺需有外野高飛 | reaction 中有 OUTFIELD | FLY_OUT | valid=true |
| RV-016 | 投手牽制需壘上有人 | 全空壘 | PICK_OUT | valid=false |
| RV-017 | 守方在攻方出牌階段 | PLAY_CARD phase, 守方 | HIT | valid=false |
| RV-018 | 界外球需對應攻擊牌 | reaction 中有 BUNT | FOUL_BALL | valid=true |
| RV-019 | 失誤需對應守備牌 | reaction 中有 FLY_OUT | ERROR | valid=true |
| RV-020 | 美技需有失誤 | reaction 中有 ERROR | NICE_PLAY | valid=true |

### 2.6 card_effects — 卡牌效果

| 編號 | 測試案例 | 場況 | 生效牌 | 預期結果 |
|------|----------|------|--------|----------|
| CE-001 | 壞球效果 | balls=2 | BALL | balls=3 |
| CE-002 | 四壞保送 | balls=3 | BALL | 打者上一壘, 球數歸零 |
| CE-003 | 三振出局 | strikes=2 | STRIKE | outs+1, 球數歸零 |
| CE-004 | 安打 (空壘) | 全空壘 | HIT | FIRST=true, runs=0, 球數歸零 |
| CE-005 | 安打 (一壘有人) | FIRST=true | HIT | FIRST=true, SECOND=true |
| CE-006 | 安打 (滿壘) | 一二三壘皆有 | HIT | runs=1 (三壘得分) |
| CE-007 | 內野封殺 (無跑者) | 全空壘 | GROUND_OUT | outs+1, 球數歸零 |
| CE-008 | 內野封殺 (一壘有人=雙殺) | FIRST=true | GROUND_OUT | outs+2, FIRST=false |
| CE-009 | 外野高飛 (空壘) | 全空壘 | OUTFIELD_SLUGGING | SECOND=true |
| CE-010 | 外野高飛 (一壘有人) | FIRST=true | OUTFIELD_SLUGGING | THIRD=true, SECOND=true |
| CE-011 | 外野接殺 (無三壘跑者) | FIRST=true | FLY_OUT | outs+1, runs=0 |
| CE-012 | 外野接殺 (三壘有人=犧飛) | THIRD=true | FLY_OUT | outs+1, runs=1 |
| CE-013 | 觸擊短打 | FIRST=true, SECOND=true | BUNT | outs+1, SECOND→THIRD, FIRST→SECOND |
| CE-014 | 全壘打 (空壘) | 全空壘 | HOME_RUN | runs=1, 球數歸零 |
| CE-015 | 全壘打 (滿壘=滿貫) | 一二三壘 | HOME_RUN | runs=4, 全空壘 |
| CE-016 | 盜壘 (一壘) | FIRST=true | STEAL | SECOND=true, FIRST=false |
| CE-017 | 補手防盜 | 盜壘後 | THROWN_OUT | outs+1 |
| CE-018 | 投手牽制 | FIRST=true | PICK_OUT | outs+1 |
| CE-019 | 暴投補逸 | FIRST=true | PASSED_BALL | SECOND=true, balls+1 |
| CE-020 | 界外球 (一般) | strikes=1 | FOUL_BALL | strikes=2 |
| CE-021 | 界外球 (兩好球觸擊=出局) | strikes=2, 初始牌=BUNT | FOUL_BALL | outs+1 |
| CE-022 | 失誤逆轉外野接殺 | 初始=OUTFIELD | ERROR (逆轉 FLY_OUT) | OUTFIELD 效果生效 |
| CE-023 | 美技逆轉失誤 | 鏈: OUTFIELD→FLY_OUT→ERROR→NICE_PLAY | NICE_PLAY | FLY_OUT 效果生效 |
| CE-024 | 不死三振 | outs=2, FIRST=false | UNCAUGHT_3RD | FIRST=true |

---

## 3. 整合測試案例

### 3.1 完整回合流程

| 編號 | 測試案例 | 步驟 | 預期結果 |
|------|----------|------|----------|
| IT-001 | 基本攻擊回合 | 抽牌→出安打→無反應→結算→補牌 | 打者上一壘, 雙方手牌=7 |
| IT-002 | 反應鏈完整流程 | 出外野高飛→守方接殺→攻方失誤→守方美技 | 接殺生效, outs+1 |
| IT-003 | 三振換人 | 出好球×3 | outs+1, 球數歸零, 下一打者 |
| IT-004 | 四壞保送 | 出壞球×4 | 打者上一壘, 球數歸零 |
| IT-005 | 三出局交換攻守 | 製造 3 出局 | 半局結束, 攻守交換, BSO 歸零 |
| IT-006 | 完整一局 | 上半局+下半局各三出局 | 局數+1, 雙方各完成攻守 |
| IT-007 | 三局結束判定勝負 | 打完 3 局, 比分不同 | 進入 GAME_OVER, 判定勝方 |
| IT-008 | 平手延長賽 | 3 局結束比分相同 | 進入第 4 局, 繼續比賽 |
| IT-009 | 牌庫耗盡回收 | 持續抽牌至牌庫空 | 棄牌堆自動回收洗牌 |
| IT-010 | 牌庫+棄牌皆空 | 兩者都空 | 半局立即結束 |

### 3.2 邊界條件

| 編號 | 測試案例 | 場況 | 預期結果 |
|------|----------|------|----------|
| ED-001 | 滿壘全壘打 (最大得分) | 一二三壘皆有人, 3-3 球數 | runs=4, 全空壘 |
| ED-002 | 兩出局滿壘被雙殺 | outs=2, FIRST=true, 內野滾地→封殺 | outs=4 → 只算到 3 即結束 |
| ED-003 | 第三出局同時得分 | outs=2, THIRD=true, 外野接殺 | outs=3, 犧飛得分仍算 |
| ED-004 | 第三出局非強迫得分 | outs=2, 觸擊出局 | outs=3, 跑者推進但半局已結束不算分 |
| ED-005 | 球數 3-2 後界外球 | balls=3, strikes=2 | strikes 維持 2, 不三振 |
| ED-006 | 手牌打完 | 手牌=0 | 只能在補牌後行動, 不會 crash |
| ED-007 | 同時多個信號 | 滿壘全壘打 | runner_scored ×4, score_changed 正確 |
| ED-008 | 延長賽無上限 | 連續平手 10 局 | 遊戲持續進行不中斷 |
| ED-009 | 下半局主隊超前即結束 | 最後一局下半主隊得分領先 | 立即結束, 不需三出局 |

---

## 4. AI 測試

| 編號 | 測試案例 | 預期結果 |
|------|----------|----------|
| AI-001 | Easy AI 完成 3 局 | 遊戲正常結束, 無 crash |
| AI-002 | Medium AI 完成 3 局 | 遊戲正常結束, 無 crash |
| AI-003 | Hard AI 完成 3 局 | 遊戲正常結束, 無 crash |
| AI-004 | AI 永遠出合法牌 | 100 場模擬, AI 從不出 invalid 牌 |
| AI-005 | AI 反應鏈回應 | AI 在可反應時有機率回應(不永遠跳過) |
| AI-006 | AI 不卡死 | 1000 場模擬, 無無限迴圈 |
| AI-007 | Hard AI 勝率 | Hard AI vs Easy AI: 勝率 > 70% |
| AI-008 | Easy AI 不碾壓新手 | Easy AI vs Random: 勝率 40-60% |
| AI-009 | AI 手牌用完處理 | AI 手牌=0 時正確等待補牌 |
| AI-010 | AI 速度 | AI 決策時間 < 500ms |

---

## 5. 效能測試基準

| 指標 | Steam (PC) | iPad | iPhone | Android 中低階 |
|------|-----------|------|--------|---------------|
| 啟動至標題畫面 | < 3s | < 4s | < 4s | < 5s |
| 場景切換 | < 0.5s | < 0.8s | < 0.8s | < 1.0s |
| 遊戲中 FPS | ≥ 60 | ≥ 60 | ≥ 60 | ≥ 30 |
| 全壘打特效 FPS | ≥ 45 | ≥ 30 | ≥ 30 | ≥ 24 |
| 記憶體峰值 | < 512MB | < 400MB | < 300MB | < 256MB |
| APK / IPA 大小 | — | < 150MB | < 150MB | < 100MB |
| 電池消耗 (30分鐘) | — | < 8% | < 10% | < 12% |

---

## 6. 平台相容性測試清單

### 6.1 Steam

| 項目 | 測試內容 |
|------|----------|
| 解析度 | 1280×720, 1920×1080, 2560×1440, 3840×2160 |
| 視窗模式 | 全螢幕 / 視窗 / 無邊框視窗 |
| 螢幕比例 | 16:9, 21:9 (超寬螢幕) |
| 輸入 | 滑鼠 + 鍵盤 |
| Steam Overlay | 遊戲中呼叫 Steam overlay 不 crash |
| Steam 成就 | 成就正確觸發與解鎖 |
| Steam Cloud | 存檔正確上傳/下載 |
| 最低配置 | i5-6500 / GTX 750 Ti / 4GB RAM |

### 6.2 iOS

| 項目 | 測試內容 |
|------|----------|
| 裝置 | iPhone 13/14/15/16, iPad Air/Pro |
| iOS 版本 | iOS 15, 16, 17, 18 |
| 安全區域 | Dynamic Island / Home Indicator 不遮擋 |
| 觸控 | 單點、長按、滑動皆正常 |
| 背景切換 | 切到背景再回來, 遊戲狀態保留 |
| 低電量模式 | FPS 可降但不 crash |
| Game Center | 排行榜 / 成就正確整合 |

### 6.3 Android

| 項目 | 測試內容 |
|------|----------|
| 裝置 | Samsung Galaxy S22/S24, Pixel 7/8, 小米/OPPO 中階機 |
| Android 版本 | Android 12, 13, 14, 15 |
| 螢幕 | 手機 (6"), 平板 (10"), 折疊機 |
| 返回鍵 | 系統返回鍵正確觸發暫停 |
| 分割畫面 | 分割畫面模式不 crash |
| 權限 | 不請求任何不必要權限 |
| Google Play Games | 成就 / 排行榜整合 |

---

## 7. 自動化測試腳本規格

### 7.1 GdUnit4 測試模板

```gdscript
# tests/test_template.gd
extends GdUnitTestSuite

# ── 每個測試前重建乾淨狀態 ──
var game_state: GameState

func before_test():
    game_state = GameState.new()
    game_state.start_game()

func after_test():
    game_state = null

# ── 輔助方法 ──

## 快速設定球數
func set_count(balls: int, strikes: int):
    for i in range(balls):
        game_state.ball_count.add_ball()
    for i in range(strikes):
        game_state.ball_count.add_strike()

## 快速設定壘上狀態
func set_bases(first: bool, second: bool, third: bool):
    if first: game_state.base_runner.place_runner(Enums.Base.FIRST)
    if second: game_state.base_runner.place_runner(Enums.Base.SECOND)
    if third: game_state.base_runner.place_runner(Enums.Base.THIRD)

## 快速設定出局數
func set_outs(count: int):
    game_state.outs = count

## 模擬打出一張牌並立即結算（無反應鏈）
func play_and_resolve(player: int, card_type: Enums.CardType):
    game_state.turn_manager.play_card(player, card_type)
    game_state.turn_manager.pass_reaction(1 - player)
```

### 7.2 自動化對戰模擬腳本

```gdscript
# tests/simulation/auto_play.gd
## 用於平衡性測試：AI vs AI 批次對戰
extends SceneTree

const SIMULATIONS = 1000

func _init():
    var stats = {
        "total_games": 0,
        "player0_wins": 0,
        "player1_wins": 0,
        "avg_score_p0": 0.0,
        "avg_score_p1": 0.0,
        "avg_innings": 0.0,
        "home_runs_total": 0,
        "strikeouts_total": 0,
        "errors_total": 0,
        "double_plays_total": 0,
        "max_reaction_chain": 0,
        "games_went_extra": 0,
    }

    for i in range(SIMULATIONS):
        var result = _run_one_game()
        _accumulate(stats, result)

    _print_report(stats)
    quit()

func _run_one_game() -> Dictionary:
    ## 建立遊戲狀態, 兩個 AI 對打至結束
    ## 回傳 { winner, scores, innings, events... }
    pass  # Claude Code 依據 core 模組實作

func _accumulate(stats: Dictionary, result: Dictionary):
    stats.total_games += 1
    # ... 累加各項數據

func _print_report(stats: Dictionary):
    print("=== 平衡性測試報告 (%d 場) ===" % stats.total_games)
    print("P0 勝率: %.1f%%" % (stats.player0_wins * 100.0 / stats.total_games))
    print("P1 勝率: %.1f%%" % (stats.player1_wins * 100.0 / stats.total_games))
    print("平均得分: P0=%.1f, P1=%.1f" % [stats.avg_score_p0, stats.avg_score_p1])
    print("延長賽比例: %.1f%%" % (stats.games_went_extra * 100.0 / stats.total_games))
    print("場均全壘打: %.2f" % (stats.home_runs_total * 1.0 / stats.total_games))
    print("場均三振: %.2f" % (stats.strikeouts_total * 1.0 / stats.total_games))
    print("最長反應鏈: %d" % stats.max_reaction_chain)
```

---

## 8. 回歸測試觸發條件

以下修改必須觸發完整回歸測試：

| 修改類型 | 觸發範圍 |
|----------|----------|
| core/ 任何檔案 | 全部單元測試 + 整合測試 |
| cards/effects/ 任何檔案 | card_effects 測試 + 整合測試 |
| 卡牌數量調整 | 平衡性模擬 (1000 場) |
| ai/ 任何檔案 | AI 測試 + 100 場模擬 |
| ui/ 互動邏輯 | 功能測試 (手動) |
| network/ | 連線測試 (手動) |
| 版本發布前 | 全部測試 + 平台測試 |

---

## 9. Bug 分級與處理時限

| 等級 | 定義 | 處理時限 | 範例 |
|------|------|----------|------|
| **P0 Critical** | 遊戲無法進行 / crash | 24 小時內修復 | 結算時 crash、無限迴圈 |
| **P1 Major** | 功能錯誤但可繞過 | 3 天內修復 | 雙殺計分錯誤、AI 卡死 |
| **P2 Minor** | 非核心問題 | 1 週內修復 | 動畫不順、Tooltip 位置偏移 |
| **P3 Trivial** | 美觀/建議 | 下個版本處理 | 字型大小微調、音效音量 |
