/**
 * 棒球卡牌對戰 - 遊戲引擎 (Phase 1 升級版)
 */

class BaseballCardGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.aiHand = [];
        
        this.homeScore = 0;  // 玩家
        this.awayScore = 0;  // AI
        this.inning = 1;
        this.isTop = true;
        this.outs = 0;
        this.balls = 0;
        this.strikes = 0;
        this.bases = [false, false, false];
        this.isPlayerTurn = true;
        this.pendingDefense = null;
        this.gameOver = false;
        this.lastCard = null; // 上一張打出的牌
        
        // AI 控制器
        this.ai = new AIController(AI_LEVEL.MEDIUM);
        
        // 反應鏈
        this.reaction = new ReactionChain();
        
        this.init();
    }
    
    init() {
        this.deck = shuffle(createDeck());
        this.playerHand = this.deck.splice(0, 7);
        this.aiHand = this.deck.splice(0, 7);
        
        document.getElementById('draw-btn').addEventListener('click', () => this.drawCard());
        
        // AI 難度選擇
        document.getElementById('ai-difficulty').addEventListener('change', (e) => {
            this.setAIDifficulty(e.target.value);
        });
        
        this.renderHand();
        this.updateDisplay();
        this.message('⚾ 遊戲開始！選擇難度後點擊卡牌出牌');
        
        console.log('初始化完成 - AI Level:', this.ai.level);
    }
    
    /**
     * 設定 AI 難度
     */
    setAIDifficulty(level) {
        this.ai = new AIController(level);
        this.message(`AI 難度已設定為: ${level}`);
    }
    
    drawCard() {
        if (this.deck.length === 0) {
            this.message('牌庫已空！');
            return;
        }
        
        const card = this.deck.pop();
        
        if (this.isPlayerTurn) {
            this.playerHand.push(card);
            this.renderHand();
            this.message(`抽到: ${card.name}`);
        }
    }
    
    /**
     * 玩家出牌
     */
    playCard(index) {
        if (!this.isPlayerTurn || this.gameOver) return;
        
        const card = this.playerHand[index];
        
        // 驗證是否可以出牌
        const validation = RuleValidator.canPlayCard(card, this.getGameState());
        if (!validation.valid) {
            this.message(`⚠️ ${validation.reason}`);
            return;
        }
        
        // 移除手牌
        this.playerHand.splice(index, 1);
        this.renderHand();
        
        this.message(`你: ${card.name}`);
        this.showPlay(card, null, '');
        
        // 執行效果
        if (card.resetCount) {
            this.balls = 0;
            this.strikes = 0;
        }
        
        card.effect(this);
        
        // 記錄上一張牌
        this.lastCard = card;
        
        if (this.gameOver) return;
        
        // 檢查是否有反應
        const validReactions = this.reaction.getValidReactions(card, this.aiHand);
        
        if (validReactions.length > 0) {
            // AI 可以選擇反應
            this.pendingDefense = card.id;
            this.updateDisplay();
            
            setTimeout(() => this.aiDefense(card), 800);
        } else {
            // 沒有反應，換 AI
            this.isPlayerTurn = false;
            this.updateDisplay();
            
            setTimeout(() => this.aiTurn(), 800);
        }
    }
    
    /**
     * AI 防禦/反應
     */
    aiDefense(attackCard) {
        const defenseCard = this.ai.selectDefense(this.aiHand, attackCard);
        
        if (defenseCard) {
            // 檢查是否可以被失效
            const counters = this.reaction.getCounters(defenseCard, this.playerHand);
            
            if (counters.length > 0 && Math.random() > 0.5) {
                // 被失效
                const counterCard = counters[0];
                this.aiHand = this.aiHand.filter(c => c.id !== counterCard.id);
                this.message(`🤖 ${defenseCard.name} → 被 ${counterCard.name} 失效！`);
                this.showPlay(null, defenseCard, `${counterCard.name} 失效`);
                
                // 攻擊牌效果生效
                attackCard.effect(this);
            } else {
                // 防禦成功
                this.aiHand = this.aiHand.filter(c => c.id !== defenseCard.id);
                this.message(`🤖 ${defenseCard.name} 擋住了你的 ${attackCard.name}！`);
                this.showPlay(null, defenseCard, '防禦成功');
                
                defenseCard.effect(this);
            }
        } else {
            this.message(`🤖 無法防禦你的 ${attackCard.name}`);
        }
        
        this.lastCard = defenseCard;
        
        if (this.gameOver) return;
        
        // 補牌並換回玩家
        this.fillHands();
        
        this.isPlayerTurn = true;
        this.pendingDefense = null;
        this.updateDisplay();
        this.message('👈 輪到你了！');
    }
    
    /**
     * AI 回合
     */
    aiTurn() {
        if (this.gameOver || this.isPlayerTurn) return;
        
        // AI 抽牌
        if (this.deck.length > 0 && this.aiHand.length < 7) {
            this.aiHand.push(this.deck.pop());
        }
        
        // AI 選擇出牌
        const card = this.ai.selectCard(this.aiHand, this.getGameState());
        
        if (!card) {
            this.message('🤖 沒有可出的牌');
            this.isPlayerTurn = true;
            this.updateDisplay();
            return;
        }
        
        this.aiHand = this.aiHand.filter(c => c.id !== card.id);
        this.message(`🤖 AI: ${card.name}`);
        this.showPlay(null, card, '');
        
        // 執行效果
        if (card.resetCount) {
            this.balls = 0;
            this.strikes = 0;
        }
        
        card.effect(this);
        this.lastCard = card;
        
        if (this.gameOver) return;
        
        // 檢查玩家是否可以反應
        const validReactions = this.reaction.getValidReactions(card, this.playerHand);
        
        if (validReactions.length > 0) {
            this.pendingDefense = card.id;
            this.updateDisplay();
            this.message('⚠️ 你可以反擊！');
        } else {
            // 補牌並換回玩家
            this.fillHands();
            
            this.isPlayerTurn = true;
            this.updateDisplay();
            
            if (!this.pendingDefense) {
                this.message('👈 輪到你了！');
            }
        }
    }
    
    /**
     * 補牌
     */
    fillHands() {
        while (this.playerHand.length < 7 && this.deck.length > 0) {
            this.playerHand.push(this.deck.pop());
        }
        while (this.aiHand.length < 7 && this.deck.length > 0) {
            this.aiHand.push(this.deck.pop());
        }
        this.renderHand();
    }
    
    /**
     * 獲取遊戲狀態（供 AI 和驗證器使用）
     */
    getGameState() {
        return {
            balls: this.balls,
            strikes: this.strikes,
            outs: this.outs,
            bases: [...this.bases],
            inning: this.inning,
            isTop: this.isTop,
            homeScore: this.homeScore,
            awayScore: this.awayScore,
            lastCard: this.lastCard,
            pendingDefense: this.pendingDefense
        };
    }
    
    advanceRunners(bases) {
        let scored = 0;
        const newBases = [false, false, false];
        
        for (let i = 2; i >= 0; i--) {
            if (this.bases[i]) {
                if (i + bases >= 3) {
                    scored++;
                } else {
                    newBases[i + bases] = true;
                }
            }
        }
        
        for (let i = bases - 1; i >= 0; i--) {
            if (!newBases[i]) {
                newBases[i] = true;
                break;
            }
        }
        
        this.bases = newBases;
        
        if (scored > 0) {
            this.homeScore += scored;
            this.message(`🏃 ${scored}分！`);
        }
    }
    
    resetCount() {
        this.balls = 0;
        this.strikes = 0;
    }
    
    nextInning() {
        this.outs = 0;
        this.bases = [false, false, false];
        this.resetCount();
        
        if (this.isTop) {
            this.isTop = false;
            this.message('===== 下半局 =====');
        } else {
            this.inning++;
            if (this.inning > 3) {
                this.gameOver = true;
                this.endGame();
                return;
            }
            this.isTop = true;
            this.message(`===== 第${this.inning}局 上半局 =====`);
        }
        
        this.nextBatter();
        this.updateDisplay();
    }
    
    nextBatter() {
        while (this.playerHand.length < 7 && this.deck.length > 0) {
            this.playerHand.push(this.deck.pop());
            this.renderHand();
        }
    }
    
    endGame() {
        let result = '';
        if (this.homeScore > this.awayScore) {
            result = '🎉 你獲勝！';
        } else if (this.awayScore > this.homeScore) {
            result = '💀 你輸了...';
        } else {
            result = '⚖️ 平手！';
        }
        
        this.message(`遊戲結束！${result} ${this.homeScore} - ${this.awayScore}`);
        document.getElementById('draw-btn').disabled = true;
    }
    
    message(text) {
        document.getElementById('message-area').innerHTML = 
            `<div class="message">${text}</div>`;
    }
    
    showPlay(playerCard, aiCard, resultText) {
        const playerZone = document.getElementById('player-play');
        playerZone.innerHTML = '';
        if (playerCard) {
            const cardEl = document.createElement('div');
            cardEl.className = `card ${playerCard.type || ''}`;
            cardEl.innerHTML = `<div class="card-name">${playerCard.name}</div>`;
            playerZone.appendChild(cardEl);
        }
        
        const aiZone = document.getElementById('ai-play');
        aiZone.innerHTML = '';
        if (aiCard) {
            const cardEl = document.createElement('div');
            cardEl.className = `card ${aiCard.type || ''}`;
            cardEl.innerHTML = `<div class="card-name">${aiCard.name}</div>`;
            aiZone.appendChild(cardEl);
        }
        
        document.getElementById('last-play').textContent = resultText || '';
    }
    
    updateDisplay() {
        document.getElementById('home-score').textContent = this.homeScore;
        document.getElementById('away-score').textContent = this.awayScore;
        document.getElementById('inning').textContent = `第${this.inning}局`;
        document.getElementById('inning-half').textContent = this.isTop ? '上' : '下';
        
        // 壞球
        const ballsDots = document.querySelectorAll('#bso-display .balls .bso-dot');
        ballsDots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < this.balls);
        });
        
        // 好球
        const strikesDots = document.querySelectorAll('#bso-display .strikes .bso-dot');
        strikesDots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < this.strikes);
        });
        
        // 出局
        const outsDots = document.querySelectorAll('#bso-display .outs .bso-dot');
        outsDots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < this.outs);
        });
        
        // 壘包
        document.getElementById('base-1').classList.toggle('occupied', this.bases[0]);
        document.getElementById('base-2').classList.toggle('occupied', this.bases[1]);
        document.getElementById('base-3').classList.toggle('occupied', this.bases[2]);
    }
    
    renderHand() {
        const container = document.getElementById('hand-cards');
        container.innerHTML = '';
        
        const gameState = this.getGameState();
        
        this.playerHand.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = `card ${card.type || ''}`;
            
            // 檢查是否可出
            const validation = RuleValidator.canPlayCard(card, gameState);
            if (!validation.valid) {
                cardEl.style.opacity = '0.5';
                cardEl.title = validation.reason;
            }
            
            cardEl.innerHTML = `
                <div class="card-name">${card.name}</div>
            `;
            cardEl.addEventListener('click', () => this.playCard(index));
            container.appendChild(cardEl);
        });
    }
}

window.onload = () => {
    window.game = new BaseballCardGame();
};
