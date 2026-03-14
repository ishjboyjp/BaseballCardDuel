/**
 * AI 控制器 - 三種難度
 */

const AI_LEVEL = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
};

/**
 * AI 控制器類別
 */
class AIController {
    constructor(level = AI_LEVEL.MEDIUM) {
        this.level = level;
    }
    
    /**
     * 選擇要出的卡牌
     * @param {Array} hand - AI 手牌
     * @param {Object} gameState - 遊戲狀態
     * @returns {Object|null} 選擇的卡牌
     */
    selectCard(hand, gameState) {
        switch (this.level) {
            case AI_LEVEL.EASY:
                return this.selectEasy(hand, gameState);
            case AI_LEVEL.MEDIUM:
                return this.selectMedium(hand, gameState);
            case AI_LEVEL.HARD:
                return this.selectHard(hand, gameState);
            default:
                return this.selectMedium(hand, gameState);
        }
    }
    
    /**
     * EASY: 隨機選擇
     */
    selectEasy(hand, gameState) {
        const playable = hand.filter(card => this.canPlay(card, gameState));
        if (playable.length === 0) return null;
        return playable[Math.floor(Math.random() * playable.length)];
    }
    
    /**
     * MEDIUM: 簡單策略
     */
    selectMedium(hand, gameState) {
        const playable = hand.filter(card => this.canPlay(card, gameState));
        if (playable.length === 0) return null;
        
        // 優先：全壘打（3-3 球數）
        const hrCards = playable.filter(c => c.id === 'HOME_RUN');
        if (hrCards.length > 0 && gameState.balls === 3 && gameState.strikes === 3) {
            return hrCards[0];
        }
        
        // 優先：盜壘（壘上有人）
        const stealCards = playable.filter(c => c.id === 'STEAL');
        if (stealCards.length > 0 && (gameState.bases[0] || gameState.bases[1])) {
            return stealCards[0];
        }
        
        // 優先：不死三振（2出局，滿球數）
        const uncaughtCards = playable.filter(c => c.id === 'UNCAUGHT_THIRD_STRIKE');
        if (uncaughtCards.length > 0 && gameState.outs === 2) {
            return uncaughtCards[0];
        }
        
        // 優先：暴投（壘上有人）
        const passedCards = playable.filter(c => c.id === 'PASSED_BALL');
        if (passedCards.length > 0 && (gameState.bases[0] || gameState.bases[1] || gameState.bases[2])) {
            return passedCards[0];
        }
        
        // 攻擊牌優先
        const attackCards = playable.filter(c => 
            c.category === 'ATTACK' || c.category === 'SPECIAL'
        );
        if (attackCards.length > 0) {
            return attackCards[0];
        }
        
        // 防禦牌
        const defenseCards = playable.filter(c => c.category === 'DEFENSE');
        if (defenseCards.length > 0) {
            return defenseCards[0];
        }
        
        // 基礎牌
        return playable[0];
    }
    
    /**
     * HARD: 完整策略（期望值最大化）
     */
    selectHard(hand, gameState) {
        const playable = hand.filter(card => this.canPlay(card, gameState));
        if (playable.length === 0) return null;
        
        // 評估每張牌的期望值
        let bestCard = null;
        let bestScore = -Infinity;
        
        for (const card of playable) {
            const score = this.evaluateCard(card, gameState);
            if (score > bestScore) {
                bestScore = score;
                bestCard = card;
            }
        }
        
        return bestCard;
    }
    
    /**
     * 評估卡牌期望值
     */
    evaluateCard(card, gameState) {
        let score = 0;
        
        // 卡牌類型評分
        switch (card.id) {
            case 'HOME_RUN':
                // 全壘打：高優先（3-3 時極高）
                score = 100;
                if (gameState.balls === 3 && gameState.strikes === 3) {
                    score += 200;
                }
                break;
                
            case 'HIT':
                // 安打：中優先
                score = 50;
                // 壘上有人時加分
                if (gameState.bases[0] || gameState.bases[1] || gameState.bases[2]) {
                    score += 30;
                }
                break;
                
            case 'STEAL':
                // 盜壘：壘上有人時高優先
                score = 10;
                if (gameState.bases[1]) {
                    score += 60; // 二壘盜壘最有價值
                } else if (gameState.bases[0]) {
                    score += 40;
                }
                break;
                
            case 'UNCAUGHT_THIRD_STRIKE':
                // 不死三振：2出局時高優先
                score = 20;
                if (gameState.outs === 2) {
                    score += 80;
                }
                break;
                
            case 'PASSED_BALL':
                // 暴投：壘上有人時
                score = 15;
                if (gameState.bases[0] || gameState.bases[1] || gameState.bases[2]) {
                    score += 40;
                }
                break;
                
            case 'GROUND_BALL':
            case 'OUTFIELD_SLUGGING':
            case 'BUNT':
                score = 30 + Math.random() * 10;
                break;
                
            case 'GROUND_OUT':
            case 'FLY_OUT':
                // 防禦牌：高出局數時優先
                score = 5;
                if (gameState.outs < 2) {
                    score += 25;
                }
                break;
                
            case 'FOUL_BALL':
                // 界外球：好球數高時有價值
                score = 5;
                if (gameState.strikes < 2) {
                    score += 15;
                }
                break;
                
            case 'ERROR':
            case 'NICE_PLAY':
                score = 10 + Math.random() * 5;
                break;
                
            case 'BALL':
                score = -10; // 盡量避免
                break;
                
            case 'STRIKE':
                score = 0; // 中性
                break;
                
            default:
                score = 10;
        }
        
        // 添加隨機因素（模擬不完全理性）
        score += (Math.random() - 0.5) * 10;
        
        return score;
    }
    
    /**
     * 檢查是否可以出牌
     */
    canPlay(card, gameState) {
        if (card.condition && !card.condition(gameState)) {
            return false;
        }
        return true;
    }
    
    /**
     * 選擇防禦/反應牌
     */
    selectDefense(hand, attackCard) {
        const playable = hand.filter(card => 
            card.counter && card.counter.includes(attackCard.id)
        );
        
        if (playable.length === 0) return null;
        
        // 簡單策略：選擇效果最好的
        return playable[0];
    }
}
