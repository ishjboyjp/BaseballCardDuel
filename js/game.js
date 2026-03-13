/**
 * 棒球卡牌對戰 - 遊戲引擎 (修復版)
 */

class BaseballCardGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.aiHand = [];
        
        this.homeScore = 0;
        this.awayScore = 0;
        this.inning = 1;
        this.isTop = true;
        this.outs = 0;
        this.balls = 0;
        this.strikes = 0;
        this.bases = [false, false, false];
        this.isPlayerTurn = true;
        this.pendingDefense = null;
        this.gameOver = false;
        
        this.init();
    }
    
    init() {
        this.deck = shuffle(createDeck());
        this.playerHand = this.deck.splice(0, 7);
        this.aiHand = this.deck.splice(0, 7);
        
        document.getElementById('draw-btn').addEventListener('click', () => this.drawCard());
        
        this.renderHand();
        this.updateDisplay();
        this.message('⚾ 遊戲開始！點擊卡牌出牌');
        
        console.log('初始化完成');
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
    
    playCard(index) {
        if (!this.isPlayerTurn || this.gameOver) return;
        
        const card = this.playerHand[index];
        
        // 檢查條件
        if (card.condition && !card.condition(this)) {
            this.message(`⚠️ ${card.name} 需要特定條件`);
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
        
        let result = '';
        // 執行並取得結果訊息
        card.effect(this);
        
        if (this.gameOver) return;
        
        // 換 AI
        this.isPlayerTurn = false;
        this.updateDisplay();
        
        // AI 延遲出牌
        setTimeout(() => this.aiTurn(), 800);
    }
    
    aiTurn() {
        if (this.gameOver || this.isPlayerTurn) return;
        
        // AI 抽牌
        if (this.deck.length > 0 && this.aiHand.length < 7) {
            this.aiHand.push(this.deck.pop());
        }
        
        // 優先處理防禦
        if (this.pendingDefense) {
            const defenseCards = this.aiHand.filter(c => 
                c.counter && c.counter.includes(this.pendingDefense)
            );
            
            if (defenseCards.length > 0) {
                const idx = this.aiHand.findIndex(c => c.id === defenseCards[0].id);
                const card = this.aiHand.splice(idx, 1)[0];
                this.message(`🤖 AI: ${card.name}`);
                this.showPlay(null, card, "");
                
                if (card.resetCount) {
                    this.balls = 0;
                    this.strikes = 0;
                }
                card.effect(this);
                
                if (this.gameOver) return;
            } else {
                this.message('🤖 無法防禦');
                this.pendingDefense = null;
            }
        } else {
            // 隨機出牌
            const idx = Math.floor(Math.random() * this.aiHand.length);
            const card = this.aiHand.splice(idx, 1)[0];
            
            this.message(`🤖 AI: ${card.name}`);
            this.showPlay(null, card, "");
            
            if (card.resetCount) {
                this.balls = 0;
                this.strikes = 0;
            }
            card.effect(this);
        }
        
        if (this.gameOver) return;
        
        // 補牌
        while (this.playerHand.length < 7 && this.deck.length > 0) {
            this.playerHand.push(this.deck.pop());
        }
        while (this.aiHand.length < 7 && this.deck.length > 0) {
            this.aiHand.push(this.deck.pop());
        }
        
        this.renderHand();
        
        // 換回玩家
        this.isPlayerTurn = true;
        this.updateDisplay();
        
        if (!this.pendingDefense) {
            this.message('👈 輪到你了！');
        }
    }
    
    advanceRunners(bases) {
        let scored = 0;
        
        // 推進
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
        
        // 打者
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
    
    nextBatter() {
        while (this.playerHand.length < 7 && this.deck.length > 0) {
            this.playerHand.push(this.deck.pop());
            this.renderHand();
        }
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
    
    message(text, isResult = false) {
        document.getElementById('message-area').innerHTML = 
            `<div class="message">${text}</div>`;
        if (isResult) {
            document.getElementById('result-text').textContent = text;
        }
    }
    
    // 顯示雙方出牌
    showPlay(playerCard, aiCard, resultText) {
        // 玩家出牌
        const playerZone = document.getElementById('player-play');
        playerZone.innerHTML = '';
        if (playerCard) {
            const cardEl = document.createElement('div');
            cardEl.className = `card ${playerCard.type || ''}`;
            cardEl.innerHTML = `<div class="card-name">${playerCard.name}</div>`;
            playerZone.appendChild(cardEl);
        }
        
        // AI 出牌
        const aiZone = document.getElementById('ai-play');
        aiZone.innerHTML = '';
        if (aiCard) {
            const cardEl = document.createElement('div');
            cardEl.className = `card ${aiCard.type || ''}`;
            cardEl.innerHTML = `<div class="card-name">${aiCard.name}</div>`;
            aiZone.appendChild(cardEl);
        }
        
        // 結果
        document.getElementById('last-play').textContent = resultText || '';
    }
    
    updateDisplay() {
        document.getElementById('home-score').textContent = this.homeScore;
        document.getElementById('away-score').textContent = this.awayScore;
        document.getElementById('inning').textContent = `第${this.inning}局`;
        document.getElementById('inning-half').textContent = this.isTop ? '上' : '下';
        
        // B 壞球
        const ballsDots = document.querySelectorAll('#bso-display .balls .bso-dot');
        ballsDots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < this.balls);
        });
        
        // S 好球
        const strikesDots = document.querySelectorAll('#bso-display .strikes .bso-dot');
        strikesDots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < this.strikes);
        });
        
        // O 出局
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
        
        this.playerHand.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = `card ${card.type || ''}`;
            cardEl.innerHTML = `
                <div class="card-name">${card.name}</div>
                <div class="card-type">${card.nameEn}</div>
            `;
            cardEl.addEventListener('click', () => this.playCard(index));
            container.appendChild(cardEl);
        });
    }
}

window.onload = () => {
    window.game = new BaseballCardGame();
};
