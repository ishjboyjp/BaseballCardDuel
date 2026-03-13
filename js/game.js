/**
 * 棒球卡牌對戰 - 遊戲引擎
 */

class BaseballCardGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.aiHand = [];
        
        // 分數
        this.homeScore = 0;
        this.awayScore = 0;
        
        // 局數
        this.inning = 1;
        this.isTop = true; // 上半局
        this.outs = 0;
        
        // 球數
        this.balls = 0;
        this.strikes = 0;
        
        // 壘包 [一壘, 二壘, 三壘]
        this.bases = [false, false, false];
        
        // 當前玩家
        this.isPlayerTurn = true;
        
        // 待防禦
        this.pendingDefense = null;
        
        // 遊戲狀態
        this.gameOver = false;
        
        this.init();
    }
    
    init() {
        // 創建並洗牌
        this.deck = shuffle(createDeck());
        
        // 發牌
        this.playerHand = this.deck.splice(0, 7);
        this.aiHand = this.deck.splice(0, 7);
        
        // 綁定按鈕
        document.getElementById('draw-btn').addEventListener('click', () => this.drawCard());
        document.getElementById('end-turn-btn').addEventListener('click', () => this.endTurn());
        
        // 渲染手牌
        this.renderHand();
        
        // 更新顯示
        this.updateDisplay();
        
        this.message('遊戲開始！你的回合');
        
        console.log('⚾ 棒球卡牌對戰 初始化完成');
        console.log('玩家手牌:', this.playerHand.map(c => c.name));
    }
    
    // 抽牌
    drawCard() {
        if (this.deck.length === 0) {
            this.message('牌庫已空！');
            return;
        }
        
        const card = this.deck.pop();
        
        if (this.isPlayerTurn) {
            this.playerHand.push(card);
            this.renderHand();
        } else {
            this.aiHand.push(card);
        }
        
        this.message(`抽到: ${card.name}`);
    }
    
    // 出牌
    playCard(cardIndex) {
        if (!this.isPlayerTurn) return;
        
        const card = this.playerHand[cardIndex];
        
        // 檢查條件
        if (card.condition && !card.condition(this)) {
            this.message(`無法使用 ${card.name}！`);
            return;
        }
        
        // 移除手牌
        this.playerHand.splice(cardIndex, 1);
        this.renderHand();
        
        // 執行效果
        this.message(`打出: ${card.name}`);
        
        if (card.resetCount) {
            this.balls = 0;
            this.strikes = 0;
        }
        
        card.effect(this);
        
        // 檢查遊戲結束
        if (this.gameOver) return;
        
        // 如果沒有待防禦，換AI
        if (!this.pendingDefense) {
            setTimeout(() => this.aiTurn(), 1000);
        } else {
            this.updateDisplay();
        }
    }
    
    // AI 回合
    aiTurn() {
        if (this.gameOver) return;
        
        this.isPlayerTurn = false;
        
        // AI 抽牌
        if (this.deck.length > 0) {
            this.aiHand.push(this.deck.pop());
        }
        
        // AI 選擇出牌
        setTimeout(() => {
            // 優先處理待防禦
            if (this.pendingDefense) {
                const defenseCards = this.aiHand.filter(c => 
                    c.counter && c.counter.includes(this.pendingDefense)
                );
                
                if (defenseCards.length > 0) {
                    const card = defenseCards[0];
                    const idx = this.aiHand.findIndex(c => c.id === card.id);
                    this.aiHand.splice(idx, 1);
                    this.message(`🤖 AI 打出: ${card.name}`);
                    card.effect(this);
                } else {
                    this.message('🤖 AI 無法防禦，跳過');
                    this.pendingDefense = null;
                    this.isPlayerTurn = true;
                }
            } else {
                // 隨機出牌
                const idx = Math.floor(Math.random() * this.aiHand.length);
                const card = this.aiHand[idx];
                this.aiHand.splice(idx, 1);
                
                this.message(`🤖 AI 打出: ${card.name}`);
                
                if (card.resetCount) {
                    this.balls = 0;
                    this.strikes = 0;
                }
                
                card.effect(this);
            }
            
            if (!this.pendingDefense) {
                // 補牌
                while (this.aiHand.length < 7 && this.deck.length > 0) {
                    this.aiHand.push(this.deck.pop());
                }
                while (this.playerHand.length < 7 && this.deck.length > 0) {
                    this.playerHand.push(this.deck.pop());
                    this.renderHand();
                }
                
                this.isPlayerTurn = true;
                this.message('你的回合！');
            }
            
            this.updateDisplay();
        }, 1000);
    }
    
    // 結束回合
    endTurn() {
        if (!this.isPlayerTurn) return;
        this.aiTurn();
    }
    
    // 推進壘包
    advanceRunners(bases) {
        for (let i = 2; i >= 0; i--) {
            if (this.bases[i]) {
                if (i + bases >= 3) {
                    this.homeScore++;
                    this.message('跑者回本壘得分！');
                } else {
                    this.bases[i + bases] = true;
                }
                this.bases[i] = false;
            }
        }
        // 最後打者上壘
        for (let i = Math.min(bases - 1, 2); i >= 0; i--) {
            if (!this.bases[i]) {
                this.bases[i] = true;
                break;
            }
        }
    }
    
    // 重置球數
    resetCount() {
        this.balls = 0;
        this.strikes = 0;
    }
    
    // 下一位打者
    nextBatter() {
        // 補牌
        while (this.playerHand.length < 7 && this.deck.length > 0) {
            this.playerHand.push(this.deck.pop());
            this.renderHand();
        }
    }
    
    // 下一局
    nextInning() {
        this.outs = 0;
        this.bases = [false, false, false];
        this.resetCount();
        
        if (this.isTop) {
            this.isTop = false;
            this.message('===== 下半局 =====');
        } else {
            this.inning++;
            this.isTop = true;
            
            if (this.inning > 3) {
                this.gameOver = true;
                this.endGame();
                return;
            }
            this.message(`===== 第${this.inning}局 上半局 =====`);
        }
        
        // 補牌
        while (this.playerHand.length < 7 && this.deck.length > 0) {
            this.playerHand.push(this.deck.pop());
            this.renderHand();
        }
        
        this.updateDisplay();
    }
    
    // 遊戲結束
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
        document.getElementById('end-turn-btn').disabled = true;
    }
    
    // 顯示訊息
    message(text) {
        const area = document.getElementById('message-area');
        area.innerHTML = `<div class="message">${text}</div>`;
    }
    
    // 更新顯示
    updateDisplay() {
        // 分數
        document.getElementById('home-score').textContent = this.homeScore;
        document.getElementById('away-score').textContent = this.awayScore;
        
        // 局數
        document.getElementById('inning').textContent = `第${this.inning}局`;
        document.getElementById('inning-half').textContent = this.isTop ? '上' : '下';
        
        // 壞球 B
        const ballsDots = document.querySelectorAll('#bso-display .balls .bso-dot');
        ballsDots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < this.balls);
        });
        
        // 好球 S
        const strikesDots = document.querySelectorAll('#bso-display .strikes .bso-dot');
        strikesDots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < this.strikes);
        });
        
        // 出局 O
        const outsDots = document.querySelectorAll('#bso-display .outs .bso-dot');
        outsDots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < this.outs);
        });
        
        // 壘包指示器
        document.getElementById('base-ind-1').classList.toggle('filled', this.bases[0]);
        document.getElementById('base-ind-2').classList.toggle('filled', this.bases[1]);
        document.getElementById('base-ind-3').classList.toggle('filled', this.bases[2]);
        
        // 壘包
        document.getElementById('base-1').classList.toggle('occupied', this.bases[0]);
        document.getElementById('base-2').classList.toggle('occupied', this.bases[1]);
        document.getElementById('base-3').classList.toggle('occupied', this.bases[2]);
        
        // 待防禦提示
        if (this.pendingDefense) {
            this.message(`⚠️ 等待回應: ${this.pendingDefense}`);
        }
    }
    
    // 渲染手牌
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

// 啟動遊戲
window.onload = () => {
    window.game = new BaseballCardGame();
};
