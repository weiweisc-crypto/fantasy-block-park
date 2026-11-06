// 依 config/assets.js 找出每張圖的網址，並記住檔案是否真的存在。
import { ASSET_BASE, IMAGES } from '../config/assets.js';

const found = new Map();

export function imageUrl(key) {
  const entry = IMAGES[key];
  if (!entry) throw new Error(`config/assets.js 沒有這個圖片項目：${key}`);
  return ASSET_BASE + entry.file;
}

// 回傳 { found, width, height }；同一張圖只檢查一次
export function checkImage(key) {
  if (!found.has(key)) {
    found.set(key, new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve({ found: true, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ found: false });
      img.src = imageUrl(key);
    }));
  }
  return found.get(key);
}

// 一次檢查多張圖，回傳 { key: true/false }
export async function checkImages(keys) {
  const results = await Promise.all(keys.map(checkImage));
  return Object.fromEntries(keys.map((k, i) => [k, results[i].found]));
}
