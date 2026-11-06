/*
 * 第一關「彩虹飲品屋」設定：題目、文字、對話框位置。
 * 位置都是「背景圖寬高的百分比」，背景圖換成同尺寸的新版本時不用改。
 */
export const LEVEL_ONE = {
  storageKey: 'rainbow-drinks-level-one-v1',   // 沿用原版的進度紀錄，舊進度不會消失

  drinks: [
    { id: 'water',      name: '水',       icon: 'drinkWater',      happy: 'rabbitHappyWater',      word: 'drinkWater',      sentence: 'sentenceWater',      liquid: '#b9e8f1', fallback: { color: '#b9e8f1', symbol: '💧', shape: 'glass' } },
    { id: 'juice',      name: '果汁',     icon: 'drinkJuice',      happy: 'rabbitHappyJuice',      word: 'drinkJuice',      sentence: 'sentenceJuice',      liquid: '#ff9e1f', fallback: { color: '#f9bb60', symbol: '🍊', shape: 'glass' } },
    { id: 'milk',       name: '牛奶',     icon: 'drinkMilk',       happy: 'rabbitHappyMilk',       word: 'drinkMilk',       sentence: 'sentenceMilk',       liquid: '#fffdf3', fallback: { color: '#d5e7f8', symbol: '🐄', shape: 'carton' } },
    { id: 'soy',        name: '豆漿',     icon: 'drinkSoy',        happy: 'rabbitHappySoy',        word: 'drinkSoy',        sentence: 'sentenceSoy',        liquid: '#f3dba6', fallback: { color: '#f7df9f', symbol: '🫘', shape: 'bottle' } },
    { id: 'yogurt',     name: '優酪乳',   icon: 'drinkYogurt',     happy: 'rabbitHappyYogurt',     word: 'drinkYogurt',     sentence: 'sentenceYogurt',     liquid: '#ddc8f0', fallback: { color: '#e5d8f5', symbol: '🥄', shape: 'bottle' } },
    { id: 'strawberry', name: '草莓牛奶', icon: 'drinkStrawberry', happy: 'rabbitHappyStrawberry', word: 'drinkStrawberry', sentence: 'sentenceStrawberry', liquid: '#f39fb6', fallback: { color: '#f9c5d0', symbol: '🍓', shape: 'bottle' } }
  ],

  // 句子順序：我 → 要 → 飲品。每題只出現這三個選項，畫面上會打亂排列。
  words: {
    wo:  { text: '我', audio: 'wordWo' },
    yao: { text: '要', audio: 'wordYao' }
  },

  text: {
    xiaoheAsk: '你要什麼呢？',
    rabbitThanks: '謝謝！',
    entranceKicker: '第一關 · 歡樂商店街',
    entranceBody: '小禾在店裡等你。一起走進飲品屋，幫小兔說出想喝的飲品吧！',
    welcomeKicker: '歡迎來到飲品屋'
  },

  // 疊在背景圖上的元素位置（背景圖寬高的百分比）
  overlay: {
    thought:      { left: 32.6, top: 48 },     // 小兔頭上的思想泡泡（底部中央對準這一點）
    xiaoheSpeech: { left: 53,   top: 33 },     // 小禾的「你要什麼呢？」
    rabbitSpeech: { left: 25,   top: 38 },     // 小兔的「謝謝！」
    // 從 rabbit-happy.png 取出小兔那一塊的範圍（多邊形頂點）
    rabbitClip: '24% 39%, 32% 38%, 37% 50%, 37% 69%, 29% 72%, 24% 60%',
    // rabbit-happy.png 裡小兔手上杯子的位置，用來換成本題飲品的顏色
    liquid: { left: 35.05, top: 64.1, width: 2.15, height: 3.7 }
  }
};
