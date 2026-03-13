/**
 * 棒球卡牌對戰 - 卡牌定義
 */

// ==================== 卡牌類型 ====================
const CARD_TYPES = {
    // 基礎牌
    BALL: 'ball',         // 壞球
    STRIKE: 'strike',     // 好球
    
    // 攻擊牌
    HIT: 'hit',            // 安打
    GROUND_BALL: 'ground', // 內野滾地
    FLING: 'fling',        // 外野高飛
    BUNT: 'bunt',         // 觸擊短打
    HOMERUN: 'homerun',   // 全壘打
    
    // 防守牌
    GROUND_OUT: 'ground_out',   // 內野封殺
    FLY_OUT: 'fly_out',         // 外野接殺
    THROWN_OUT: 'thrown_out',  // 補手防盜
    PICK_OUT: 'pick_out',      // 投手牽制
    
    // 特殊牌
    UNCAUGHT: 'uncaught',   // 不死三振
    STEAL: 'steal',         // 盜壘
    PASSED_BALL: 'passed',  // 暴投
    FOUL: 'foul',           // 界外球
    ERROR: 'error',         // 失誤
    NICE_PLAY: 'nice',       // 美技
};

// ==================== 卡牌資料 ====================
const CARDS = {
    // 壞球 (16張)
    [CARD_TYPES.BALL]: {
        name: '壞球',
        nameEn: 'Ball',
        count: 16,
        type: 'effect-ball',
        balls: 1,
        strikes: 0,
        resetCount: false,
        condition: null,
        effect: (game) => {
            game.balls++;
            if (game.balls >= 4) {
                game.message('保送！打者上一壘');
                game.advanceRunners(1);
                game.resetCount();
                game.nextBatter();
            } else {
                game.message(`壞球 +1 (${game.balls}/4)`);
            }
        },
        counter: null
    },
    
    // 好球 (12張)
    [CARD_TYPES.STRIKE]: {
        name: '好球',
        nameEn: 'Strike',
        count: 12,
        type: 'effect-strike',
        balls: 0,
        strikes: 1,
        resetCount: false,
        condition: null,
        effect: (game) => {
            game.strikes++;
            if (game.strikes >= 3) {
                game.message('三振出局！');
                game.outs++;
                game.resetCount();
                if (game.outs >= 3) {
                    game.nextInning();
                } else {
                    game.nextBatter();
                }
            } else {
                game.message(`好球 +1 (${game.strikes}/3)`);
            }
        },
        counter: null
    },
    
    // 安打 (6張)
    [CARD_TYPES.HIT]: {
        name: '安打',
        nameEn: 'Single',
        count: 6,
        type: 'effect-hit',
        balls: 0,
        strikes: 0,
        resetCount: true,
        condition: null,
        effect: (game) => {
            game.message('安打！打者上一壘');
            game.advanceRunners(1);
            game.nextBatter();
        },
        counter: null
    },
    
    // 內野滾地 (6張)
    [CARD_TYPES.GROUND_BALL]: {
        name: '內野滾地',
        nameEn: 'Ground Ball',
        count: 6,
        type: 'effect-hit',
        balls: 0,
        strikes: 0,
        resetCount: true,
        condition: null,
        effect: (game) => {
            game.message('內野滾地！');
            // 等待防守回應
            game.pendingDefense = 'ground';
        },
        counter: [CARD_TYPES.GROUND_OUT, CARD_TYPES.FOUL]
    },
    
    // 內野封殺 (6張)
    [CARD_TYPES.GROUND_OUT]: {
        name: '內野封殺',
        nameEn: 'Ground Out',
        count: 6,
        type: 'effect-defense',
        balls: 0,
        strikes: 0,
        resetCount: false,
        condition: (game) => game.pendingDefense === 'ground',
        effect: (game) => {
            game.message('封殺出局！');
            game.outs++;
            game.pendingDefense = null;
            if (game.outs >= 3) {
                game.nextInning();
            } else {
                game.nextBatter();
            }
        },
        counter: [CARD_TYPES.ERROR]
    },
    
    // 外野高飛 (6張)
    [CARD_TYPES.FLING]: {
        name: '外野高飛',
        nameEn: 'Fly Ball',
        count: 6,
        type: 'effect-hit',
        balls: 0,
        strikes: 0,
        resetCount: true,
        condition: null,
        effect: (game) => {
            game.message('外野高飛！');
            game.pendingDefense = 'fling';
        },
        counter: [CARD_TYPES.FLY_OUT, CARD_TYPES.FOUL]
    },
    
    // 外野接殺 (6張)
    [CARD_TYPES.FLY_OUT]: {
        name: '外野接殺',
        nameEn: 'Fly Out',
        count: 6,
        type: 'effect-defense',
        balls: 0,
        strikes: 0,
        resetCount: false,
        condition: (game) => game.pendingDefense === 'fling',
        effect: (game) => {
            // 犧牲飛球
            if (game.bases[2]) {
                game.message('高飛犧牲打！三壘跑者得分');
                game.homeScore++;
            }
            game.message('接殺出局！');
            game.outs++;
            game.pendingDefense = null;
            if (game.outs >= 3) {
                game.nextInning();
            } else {
                game.nextBatter();
            }
        },
        counter: [CARD_TYPES.ERROR]
    },
    
    // 觸擊短打 (6張)
    [CARD_TYPES.BUNT]: {
        name: '觸擊短打',
        nameEn: 'Bunt',
        count: 6,
        type: 'effect-hit',
        balls: 0,
        strikes: 0,
        resetCount: true,
        condition: (game) => game.bases.some(b => b), // 壘上有人
        effect: (game) => {
            game.message('觸擊短打！犧牲打');
            game.advanceRunners(1);
            game.outs++;
            if (game.outs >= 3) {
                game.nextInning();
            } else {
                game.nextBatter();
            }
        },
        counter: [CARD_TYPES.FOUL]
    },
    
    // 不死三振 (6張)
    [CARD_TYPES.UNCAUGHT]: {
        name: '不死三振',
        nameEn: 'Uncaught 3rd',
        count: 6,
        type: 'effect-special',
        balls: 0,
        strikes: 0,
        resetCount: false,
        condition: (game) => game.outs >= 2 && !game.bases[0],
        effect: (game) => {
            game.message('不死三振！打者上一壘');
            game.bases[0] = true;
            game.pendingDefense = 'steal';
        },
        counter: [CARD_TYPES.THROWN_OUT]
    },
    
    // 盜壘 (6張)
    [CARD_TYPES.STEAL]: {
        name: '盜壘',
        nameEn: 'Steal',
        count: 6,
        type: 'effect-special',
        balls: 0,
        strikes: 0,
        resetCount: false,
        condition: (game) => game.bases[0] || game.bases[1],
        effect: (game) => {
            game.message('盜壘！');
            game.pendingDefense = 'steal';
        },
        counter: [CARD_TYPES.THROWN_OUT]
    },
    
    // 補手防盜 (6張)
    [CARD_TYPES.THROWN_OUT]: {
        name: '補手防盜',
        nameEn: 'Thrown Out',
        count: 6,
        type: 'effect-defense',
        balls: 0,
        strikes: 0,
        resetCount: false,
        condition: (game) => game.pendingDefense === 'steal',
        effect: (game) => {
            game.message('盜壘失敗！出局');
            game.outs++;
            game.pendingDefense = null;
            if (game.outs >= 3) {
                game.nextInning();
            } else {
                game.nextBatter();
            }
        },
        counter: [CARD_TYPES.ERROR]
    },
    
    // 投手牽制 (6張)
    [CARD_TYPES.PICK_OUT]: {
        name: '投手牽制',
        nameEn: 'Pick Out',
        count: 6,
        type: 'effect-defense',
        balls: 0,
        strikes: 0,
        resetCount: false,
        condition: (game) => game.bases.some(b => b),
        effect: (game) => {
            game.message('牽制出局！');
            game.outs++;
            if (game.outs >= 3) {
                game.nextInning();
            } else {
                game.nextBatter();
            }
        },
        counter: [CARD_TYPES.ERROR]
    },
    
    // 暴投 (6張)
    [CARD_TYPES.PASSED_BALL]: {
        name: '暴投',
        nameEn: 'Passed Ball',
        count: 6,
        type: 'effect-special',
        balls: 0,
        strikes: 0,
        resetCount: false,
        condition: (game) => game.bases.some(b => b),
        effect: (game) => {
            game.message('暴投！壘上跑者推進');
            game.advanceRunners(1);
            game.balls++;
        },
        counter: [CARD_TYPES.THROWN_OUT]
    },
    
    // 界外球 (6張)
    [CARD_TYPES.FOUL]: {
        name: '界外球',
        nameEn: 'Foul Ball',
        count: 6,
        type: 'effect-special',
        balls: 0,
        strikes: 0,
        resetCount: false,
        condition: (game) => game.pendingDefense !== null,
        effect: (game) => {
            const defense = game.pendingDefense;
            game.message('界外球！攻擊無效');
            if (game.strikes < 2) {
                game.strikes++;
            }
            game.pendingDefense = null;
        },
        counter: null
    },
    
    // 失誤 (6張)
    [CARD_TYPES.ERROR]: {
        name: '失誤',
        nameEn: 'Error',
        count: 6,
        type: 'effect-special',
        balls: 0,
        strikes: 0,
        resetCount: false,
        condition: (game) => ['ground', 'fling', 'steal'].includes(game.pendingDefense),
        effect: (game) => {
            game.message('失誤！守備無效');
            game.pendingDefense = 'error';
        },
        counter: [CARD_TYPES.NICE_PLAY]
    },
    
    // 美技 (6張)
    [CARD_TYPES.NICE_PLAY]: {
        name: '美技',
        nameEn: 'Nice Play',
        count: 6,
        type: 'effect-special',
        balls: 0,
        strikes: 0,
        resetCount: false,
        condition: (game) => game.pendingDefense === 'error',
        effect: (game) => {
            game.message('美技！守住這局！');
            game.pendingDefense = null;
            game.outs++;
            if (game.outs >= 3) {
                game.nextInning();
            } else {
                game.nextBatter();
            }
        },
        counter: [CARD_TYPES.ERROR]
    },
    
    // 全壘打 (3張)
    [CARD_TYPES.HOMERUN]: {
        name: '全壘打',
        nameEn: 'HOME RUN!',
        count: 3,
        type: 'effect-homerun',
        balls: 0,
        strikes: 0,
        resetCount: true,
        condition: (game) => game.balls >= 3 && game.strikes >= 3,
        effect: (game) => {
            let runs = 1;
            game.bases.forEach(b => { if(b) runs++; });
            game.message(`全壘打！${runs}分！`);
            game.homeScore += runs;
            game.bases = [false, false, false];
            game.nextBatter();
        },
        counter: [CARD_TYPES.FOUL]
    },
};

// ==================== 牌組生成 ====================
function createDeck() {
    const deck = [];
    
    for (const [key, card] of Object.entries(CARDS)) {
        for (let i = 0; i < card.count; i++) {
            deck.push({
                id: key,
                ...card
            });
        }
    }
    
    return deck;
}

// 洗牌
function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}
