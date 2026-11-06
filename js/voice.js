// 語音播放：先播 config/assets.js 列的音檔；音檔無法播放時，改用裝置內建的 zh-TW 合成語音念出文字。
import { ASSET_BASE, AUDIO } from '../config/assets.js';

let current = null, sequenceId = 0, onProblem = () => {};

export function setVoiceProblemHandler(fn) { onProblem = fn; }

export function stopVoice() {
  sequenceId++;
  if (current) { current.pause(); current.currentTime = 0; current = null; }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

function speakWithDevice(text) {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    onProblem('此裝置無法播放語音，可以看圖片和文字繼續遊戲。');
    return;
  }
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-TW'; u.rate = .82; u.pitch = 1;
    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.toLowerCase().startsWith('zh-tw')) || voices.find(v => v.lang.toLowerCase().startsWith('zh'));
    if (voice) u.voice = voice;
    u.onerror = () => onProblem('語音暫時無法播放，可以看圖片和文字繼續遊戲。');
    speechSynthesis.speak(u);
  } catch {
    onProblem('語音暫時無法播放，可以看圖片和文字繼續遊戲。');
  }
}

// 依序播放一串語音；keys 是 AUDIO 清單裡的名稱
export function playVoice(...keys) {
  stopVoice();
  const id = sequenceId;
  let index = 0;
  const next = () => {
    if (id !== sequenceId || index >= keys.length) return;
    const clip = AUDIO[keys[index++]];
    if (!clip) return next();
    try {
      current = new Audio(ASSET_BASE + clip.file);
      current.addEventListener('ended', next, { once: true });
      current.play()?.catch?.(() => { if (id === sequenceId) speakWithDevice(clip.text); });
    } catch {
      speakWithDevice(clip.text);
    }
  };
  next();
}
