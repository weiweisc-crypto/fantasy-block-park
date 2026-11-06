/*
 * 素材清單：網站用到的每一張圖和每一個音檔都列在這裡。
 * ------------------------------------------------------------
 * 換圖方法：用「file」寫的檔名，把新圖放進 assets/ 對應資料夾、覆蓋舊檔即可，不必改程式。
 * 還沒有檔案的項目，網站會自動用 fallback 寫的備用畫法，照常運作。
 * 可以打開 tools/assets-check.html 檢查每個檔案有沒有放對、尺寸對不對。
 *
 * 欄位
 *   file      相對於 assets/ 的路徑（檔名用小寫英文和連字號）
 *   size      建議尺寸（寬x高，像素）；背景類的圖請跟 bg.png 同尺寸
 *   format    格式；需要透明背景的一律 PNG
 *   purpose   在畫面上的用途
 *   source    user = 使用者已選定的素材，不可重畫或替換；gpt = 請 GPT 產生
 *   status    ready = 已有檔案；needed = 等 GPT 產生；optional = 有更好，沒有也能運作
 *   fallback  沒有檔案時的備用畫法
 */
export const ASSET_BASE = './assets/';

export const IMAGES = {
  // ---------- 第一關：彩虹飲品屋 ----------
  drinkShopBg: {
    file: 'images/drink-shop/bg.png',
    size: '1595x986', format: 'PNG',
    purpose: '飲品屋滿版背景。小禾（店主）和小兔（客人）都畫在這張圖裡。',
    source: 'user', status: 'ready'
  },
  rabbitHappy: {
    file: 'images/drink-shop/rabbit-happy.png',
    size: '1595x986', format: 'PNG',
    purpose: '答對後的同一場景，只有小兔改成開心拿著杯子。程式只取小兔那一塊疊在背景上。',
    source: 'user', status: 'ready'
  },

  // 每題專屬的「小兔拿著本題飲品」場景（選用）。有放就用，沒放就用 rabbitHappy＋杯中液體換色。
  rabbitHappyWater:      { file: 'images/drink-shop/rabbit-happy-water.png',      size: '1595x986', format: 'PNG', purpose: '答對「水」：小兔拿著一杯水',           source: 'gpt', status: 'ready' },
  rabbitHappyJuice:      { file: 'images/drink-shop/rabbit-happy-juice.png',      size: '1595x986', format: 'PNG', purpose: '答對「果汁」：小兔拿著一杯柳橙汁',     source: 'gpt', status: 'ready' },
  rabbitHappyMilk:       { file: 'images/drink-shop/rabbit-happy-milk.png',       size: '1595x986', format: 'PNG', purpose: '答對「牛奶」：小兔拿著牛奶盒',         source: 'gpt', status: 'ready' },
  rabbitHappySoy:        { file: 'images/drink-shop/rabbit-happy-soy.png',        size: '1595x986', format: 'PNG', purpose: '答對「豆漿」：小兔拿著豆漿瓶',         source: 'gpt', status: 'ready' },
  rabbitHappyYogurt:     { file: 'images/drink-shop/rabbit-happy-yogurt.png',     size: '1595x986', format: 'PNG', purpose: '答對「優酪乳」：小兔拿著優酪乳瓶',     source: 'gpt', status: 'ready' },
  rabbitHappyStrawberry: { file: 'images/drink-shop/rabbit-happy-strawberry.png', size: '1595x986', format: 'PNG', purpose: '答對「草莓牛奶」：小兔拿著草莓牛奶瓶', source: 'gpt', status: 'ready' },

  // ---------- 六種飲品圖示（思想泡泡和選項按鈕共用） ----------
  drinkWater:      { file: 'images/drinks/water.png',      size: '512x512', format: 'PNG 透明背景', purpose: '飲品：水（透明玻璃杯裝的水）',          source: 'gpt', status: 'ready', fallback: '程式畫的簡易杯子圖示' },
  drinkJuice:      { file: 'images/drinks/juice.png',      size: '512x512', format: 'PNG 透明背景', purpose: '飲品：果汁（玻璃杯裝的柳橙汁）',        source: 'gpt', status: 'ready', fallback: '程式畫的簡易杯子圖示' },
  drinkMilk:       { file: 'images/drinks/milk.png',       size: '512x512', format: 'PNG 透明背景', purpose: '飲品：牛奶（白藍色牛奶盒）',            source: 'gpt', status: 'ready', fallback: '程式畫的簡易牛奶盒圖示' },
  drinkSoy:        { file: 'images/drinks/soy.png',        size: '512x512', format: 'PNG 透明背景', purpose: '飲品：豆漿（米黃色豆漿瓶）',            source: 'gpt', status: 'ready', fallback: '程式畫的簡易瓶子圖示' },
  drinkYogurt:     { file: 'images/drinks/yogurt.png',     size: '512x512', format: 'PNG 透明背景', purpose: '飲品：優酪乳（淡紫色優酪乳瓶）',        source: 'gpt', status: 'ready', fallback: '程式畫的簡易瓶子圖示' },
  drinkStrawberry: { file: 'images/drinks/strawberry.png', size: '512x512', format: 'PNG 透明背景', purpose: '飲品：草莓牛奶（粉紅色瓶子，有草莓標誌）', source: 'gpt', status: 'ready', fallback: '程式畫的簡易瓶子圖示' }
};

/*
 * 語音清單（assets/audio/voice/）
 * 目前所有音檔都是臺灣國語「合成語音」，不是真人感的兒童 AI 語音。
 * 之後取得自然的角色語音，只要用同樣檔名覆蓋音檔即可。
 * 音檔無法播放時，會改用瀏覽器內建的 zh-TW 合成語音念 text。
 */
export const VOICE_STATUS = '目前語音：臺灣國語合成聲（暫代），尚未換成真人感兒童語音';

export const AUDIO = {
  intro:               { file: 'audio/voice/intro.wav',               speaker: '旁白', text: '看看小兔需要的飲品，依序選我、要和飲品名稱。' },
  questionKind:        { file: 'audio/voice/question-kind.wav',       speaker: '小禾', text: '你要什麼呢？' },
  thanks:              { file: 'audio/voice/thanks.wav',              speaker: '小兔', text: '謝謝！' },
  wordWo:              { file: 'audio/voice/word-wo.wav',             speaker: '小兔', text: '我' },
  wordYao:             { file: 'audio/voice/word-yao.wav',            speaker: '小兔', text: '要' },
  drinkWater:          { file: 'audio/voice/drink-water.wav',         speaker: '小兔', text: '水' },
  drinkJuice:          { file: 'audio/voice/drink-juice.wav',         speaker: '小兔', text: '果汁' },
  drinkMilk:           { file: 'audio/voice/drink-milk.wav',          speaker: '小兔', text: '牛奶' },
  drinkSoy:            { file: 'audio/voice/drink-soy.wav',           speaker: '小兔', text: '豆漿' },
  drinkYogurt:         { file: 'audio/voice/drink-yogurt.wav',        speaker: '小兔', text: '優酪乳' },
  drinkStrawberry:     { file: 'audio/voice/drink-strawberry.wav',    speaker: '小兔', text: '草莓牛奶' },
  sentenceWater:       { file: 'audio/voice/sentence-water.wav',      speaker: '小兔', text: '我要水。' },
  sentenceJuice:       { file: 'audio/voice/sentence-juice.wav',      speaker: '小兔', text: '我要果汁。' },
  sentenceMilk:        { file: 'audio/voice/sentence-milk.wav',       speaker: '小兔', text: '我要牛奶。' },
  sentenceSoy:         { file: 'audio/voice/sentence-soy.wav',        speaker: '小兔', text: '我要豆漿。' },
  sentenceYogurt:      { file: 'audio/voice/sentence-yogurt.wav',     speaker: '小兔', text: '我要優酪乳。' },
  sentenceStrawberry:  { file: 'audio/voice/sentence-strawberry.wav', speaker: '小兔', text: '我要草莓牛奶。' }
  // 原版還留有 question.wav 和 target-*.wav，目前畫面沒有用到，保留在資料夾裡備用。
};
