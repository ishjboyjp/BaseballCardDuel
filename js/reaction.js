/**
 * 反應鏈系統
 */

// 反應映射表
const REACTION_MAP = {
    // 攻擊牌 -> 可反制的牌
    'OUTFIELD_SLUGGING': {
        counters: ['FLY_OUT', 'FOUL_BALL'],
        counteredBy: ['ERROR', 'NICE_PLAY']
    },
    'GROUND_BALL': {
        counters: ['GROUND_OUT', 'FOUL_BALL'],
        counteredBy: ['ERROR', 'NICE_PLAY']
    },
    'BUNT': {
        counters: ['FOUL_BALL'],
        counteredBy: ['ERROR', 'NICE_PLAY']
    },
    'HOME_RUN': {
        counters: ['FOUL_BALL'],
        counteredBy: ['ERROR', 'NICE_PLAY']
    },
    // 防禦牌 -> 可被失效的牌
    'GROUND_OUT': {
        counteredBy: ['ERROR', 'NICE_PLAY']
    },
    'FLY_OUT': {
        counteredBy: ['ERROR', 'NICE_PLAY']
    },
    // 特殊牌
    'STEAL': {
        counters: ['THROWN_OUT', 'PICK_OUT'],
        counteredBy: ['ERROR', 'NICE_PLAY']
    },
    'UNCAUGHT_THIRD_STRIKE': {
        counters: ['PICK_OUT'],
        counteredBy: ['ERROR']
    }
};

/**
 * 反應鏈管理器
 */
class ReactionChain {
    constructor() {
        this.chain = []; // 反應鏈
        this.pendingReaction = null; // 待回應的牌
    }
    
    /**
     * 檢查是否有可反應的牌
     * @param {Object} playedCard - 打出的牌
     * @param {Array} hand - 玩家手牌
     * @returns {Array} 可反應的牌列表
     */
    getValidReactions(playedCard, hand) {
        const reactions = [];
        const reactionDef = REACTION_MAP[playedCard.id];
        
        if (!reactionDef || !reactionDef.counters) {
            return reactions;
        }
        
        for (const card of hand) {
            if (card.counter && card.counter.includes(playedCard.id)) {
                reactions.push(card);
            }
        }
        
        return reactions;
    }
    
    /**
     * 檢查是否可以被失效（失誤/美技）
     * @param {Object} card - 卡牌
     * @param {Array} hand - 玩家手牌
     * @returns {Array} 可以失效的牌
     */
    getCounters(card, hand) {
        const counters = [];
        const reactionDef = REACTION_MAP[card.id];
        
        if (!reactionDef || !reactionDef.counteredBy) {
            return counters;
        }
        
        for (const c of hand) {
            if (reactionDef.counteredBy.includes(c.id)) {
                counters.push(c);
            }
        }
        
        return counters;
    }
    
    /**
     * 結算反應結果
     * @param {Object} attackCard - 攻擊牌
     * @param {Object|null} defenseCard - 防禦牌（可为 null）
     * @param {Object|null} counterCard - 失效牌（可为 null）
     * @returns {Object} 結果
     */
    resolveReaction(attackCard, defenseCard, counterCard = null) {
        let result = {
            success: false,
            message: '',
            type: 'none', // 'none', 'blocked', 'countered'
            effect: null
        };
        
        // 沒有防禦
        if (!defenseCard) {
            result.success = true;
            result.message = `${attackCard.name} 成功！`;
            result.type = 'none';
            result.effect = attackCard.effect;
            return result;
        }
        
        // 有防禦但被失效
        if (counterCard) {
            result.success = true;
            result.message = `${counterCard.name} 失效了 ${defenseCard.name}！${attackCard.name} 成功！`;
            result.type = 'countered';
            result.effect = attackCard.effect;
            return result;
        }
        
        // 防禦成功
        result.success = false;
        result.message = `${defenseCard.name} 擋住了 ${attackCard.name}！`;
        result.type = 'blocked';
        result.effect = defenseCard.effect;
        return result;
    }
    
    /**
     * 添加到反應鏈
     */
    add(card, player) {
        this.chain.push({ card, player, timestamp: Date.now() });
    }
    
    /**
     * 清除反應鏈
     */
    clear() {
        this.chain = [];
        this.pendingReaction = null;
    }
    
    /**
     * 獲取反應鏈描述
     */
    getDescription() {
        if (this.chain.length === 0) return '';
        
        const parts = this.chain.map(item => `${item.card.name}`);
        return parts.join(' → ');
    }
}

/**
 * 卡牌效果工廠
 */
class CardEffectFactory {
    /**
     * 創建標準效果回傳
     */
    static createResult(options = {}) {
        return {
            success: options.success !== false,
            message: options.message || '',
            runnersAdvanced: options.runnersAdvanced || 0,
            score: options.score || 0,
            out: options.out || false,
            resetCount: options.resetCount || false,
            balls: options.balls || 0,
            strikes: options.strikes || 0,
            nextTurn: options.nextTurn || 'ai'
        };
    }
}
