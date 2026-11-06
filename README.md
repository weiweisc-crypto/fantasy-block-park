# 奇幻積木樂園

3D 積木遊樂園＋第一關「彩虹飲品屋」（六題「我＋要＋飲品」）。
程式由 GPT 原版整理而來，畫面與功能不變，改成「素材集中、一個設定檔管理」的架構：GPT 只要產圖，放進資料夾就能直接替換。

## 資料夾

```
index.html                 網站入口（3D 遊樂園，第一關從這裡開啟）
config/                    ← 平常只需要改這裡
  assets.js                素材清單：每張圖、每個音檔的檔名、尺寸、用途、狀態
  level-one.js             第一關：六種飲品、文字、對話框與思想泡泡的位置
  park-zones.js            3D 樂園十個設施的名稱、說明、任務
assets/                    ← GPT 的圖放這裡（檔名照 config/assets.js）
  images/drink-shop/       bg.png（選定背景，不可換）、rabbit-happy.png、rabbit-happy-*.png（選用）
  images/drinks/           六種飲品圖示（等 GPT 產生；沒有時用程式畫的簡易圖示）
  audio/voice/             語音音檔（目前為臺灣國語合成聲，暫代）
js/                        程式（park.js 3D 樂園、level-one.js 第一關、assets.js、voice.js）
css/                       樣式
vendor/three/              Three.js 0.163（放在本機，不依賴外部 CDN）
tools/assets-check.html    素材檢查頁：哪些圖已放、哪些缺、尺寸對不對
docs/GPT產圖需求清單.md     要貼給 GPT 的產圖清單
docs/original-backup/      GPT 原始版本的完整備份
```

## 換圖片

1. 照 `docs/GPT產圖需求清單.md` 請 GPT 產圖。
2. 用清單上的檔名存進 `assets/images/` 對應資料夾（同名覆蓋）。
3. 打開 `tools/assets-check.html` 確認變成「已放入」。

不需要改任何程式。

## 換語音

用 `config/assets.js` 裡 AUDIO 的檔名，把新音檔放進 `assets/audio/voice/` 覆蓋即可。
**目前所有音檔都是臺灣國語合成聲，不是真人感兒童 AI 語音**；換好真正的角色語音後，再把 `VOICE_STATUS` 的文字改掉。

## 在電腦上預覽

網站用到 JavaScript 模組，不能直接雙擊 index.html 打開，要用簡易伺服器：

```
cd 這個資料夾
python3 -m http.server 8000
```

再用瀏覽器開 http://localhost:8000 。

## 上線

網站部署在 Cloudflare Pages，連接這個 GitHub repo：推到 `main` 就會自動更新。
不需要建置：Build command 留空，Build output directory 填 `/`。
上傳後請實際玩完六題、確認星星與語音，再宣稱網站已更新。

## 與 GPT 原版的差異

- 素材與文字集中到 `config/`，素材檢查頁、產圖清單是新增的。
- 每題三個選項（我、要、本題飲品）改為**每題打亂排列**；原版固定是「要、飲品、我」。
- 有 GPT 飲品圖時改用圖片，沒有時沿用原版的簡易圖示。
- 第一關歡迎畫面標示目前是合成語音（暫代）。
- 直式手機重新取景，讓小兔、思想泡泡和小禾的對話框都留在畫面內。
- Three.js 改放本機，不再從外部 CDN 載入。
- 背景圖使用使用者 2026-10-28 上傳的版本（櫃檯飲品細節與原版 zip 略有不同，原版已備份在 docs/original-backup/）。
