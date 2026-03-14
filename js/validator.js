/**
 * 規則驗證器
 */

// 卡牌條件定義
const CARD_CONDITIONS = {
    // 需要壘上有人
    'STEAL': (state) => state.bases[0] || state.bases[1],
    
    // 需要一二壘有人
    'BUNT': (state) => state.bases[0] || state.bases[1] || state.bases[2],
    
    // 需要壘上有人（任何）
    'PASSED_BALL': (state) => state.bases[0] || state.bases[1] || state.bases[2],
    
    // 需要 2 出局且一壘無跑者
    'UNCAUGHT_THIRD_STRIKE': (state) => state.outs === 2 && !state.bases[0],
    
    // 需要壘上有人
    'PICK_OUT': (state) => state.bases[0] || state.bases[1] || state.bases[2],
    
    // 投手丘
    'THROWN_OUT': (state) => state.bases[0] || state.bases[1] || state.bases[2],
    
    // 需要球數門檻
    'HOME_RUN': (state) => state.balls >= 2 && state.strikes >= 2,
    
    // 需要壘上有人
    'HIT': (state) => true, // 安打無條件
    
    // 需要特定攻擊牌
    'GROUND_OUT': (state) => state.lastCard && state.lastCard.id === 'GROUND_BALL',
    'FLY_OUT': (state) => state.lastCard && state.lastCard.id === 'OUTFIELD_SLUGGING',
    'FOUL_BALL': (state) => state.lastCard && 
        ['GROUND_BALL', 'OUTFIELD_SLUGGING', 'BUNT', 'HOME_RUN'].includes(state.lastCard.id)
};

/**
 * 規則驗證器
 */
class RuleValidator {
    /**
     * 檢查卡牌是否可以出
     * @param {Object} card - 卡牌
     * @param {Object} gameState - 遊戲狀態
     * @returns {Object} { valid: boolean, reason: string }
     */
    static canPlayCard(card, gameState) {
        // 檢查條件函式
        if (card.condition && !card.condition(gameState)) {
            return { 
                valid: false, 
                reason: card.conditionReason || `需要特定條件才能出 ${card.name}` 
            };
        }
        
        // 檢查預定義條件
        if (CARD_CONDITIONS[card.id]) {
            if (!CARD_CONDITIONS[card.id](gameState)) {
                return {
                    valid: false,
                    reason: card.conditionReason || this.getConditionReason(card.id)
                };
            }
        }
        
        return { valid: true, reason: '' };
    }
    
    /**
     * 獲取條件描述
     */
    static getConditionReason(cardId) {
        const reasons = {
            'STEAL': '需要一壘或二壘有人才能盜壘',
            'BUNT': '需要壘上有人才能觸擊',
            'PASSED_BALL': '需要壘上有人才能暴投',
            'UNCAUGHT_THIRD_STRIKE': '需要2出局且一壘無跑者',
            'PICK_OUT': '需要壘上有人',
            'THROWN_OUT': '需要壘上有人',
            'HOME_RUN': '需要至少 2 壞球 2 好球',
            'GROUND_OUT': '需要對手打出內野滾地',
            'FLY_OUT': '需要對手打出外野高飛',
            'FOUL_BALL': '需要對手打出攻擊牌'
        };
        return reasons[cardId] || '條件不符';
    }
    
    /**
     * 獲取所有可出的牌
     * @param {Array} hand - 手牌
     * @param {Object} gameState - 遊戲狀態
     * @returns {Array} 可出的牌
     */
    static getPlayableCards(hand, gameState) {
        return hand.filter(card => this.canPlayCard(card, gameState).valid);
    }
    
    /**
     * 檢查遊戲是否結束
     * @param {Object} gameState - 遊戲狀態
     * @returns {Object} { over: boolean, winner: string }
     */
    static checkGameOver(gameState) {
        // 3 局結束
        if (gameState.inning > 3) {
            if (gameState.homeScore > gameState.awayScore) {
                return { over: true, winner: 'player' };
            } else if (gameState.awayScore > gameState.homeScore) {
                return { over: true, winner: 'ai' };
            } else {
                return { over: true, winner: 'tie' };
            }
        }
        return { over: false, winner: null };
    }
    
    /**
     * 驗證球數
     * @param {Object} gameState - 遊戲狀態
     * @returns {Object} 球數變更
     */
    static validateBallCount(gameState) {
        let result = {
            balls: gameState.balls,
            strikes: gameState.strikes,
            outs: gameState.outs,
            walk: false,   // 保送
            strikeout: false, // 三振
            inningEnd: false
        };
        
        // 4 壞球 = 保送
        if (gameState.balls >= 4) {
            result.walk = true;
            result.balls = 0;
            result.strikes = 0;
        }
        
        // 3 好球 = 三振
        if (gameState.strikes >= 3) {
            result.strikeout = true;
            result.balls = 0;
            result.strikes = 0;
            result.outs++;
        }
        
        // 3 出局 = 換局
        if (result.outs >= 3) {
            result.inningEnd = true;
        }
        
        return result;
    }
}
