/*
 * 第一關「彩虹飲品屋」：六題「我＋要＋飲品」。
 * 題目與文字：config/level-one.js　圖片與音檔：config/assets.js
 *
 * 流程：入口 → 歡迎 → 作答（六題）→ 每題答對 → 全部完成
 */
import { LEVEL_ONE as L } from '../config/level-one.js';
import { VOICE_STATUS } from '../config/assets.js';
import { imageUrl, checkImages } from './assets.js';
import { playVoice, stopVoice, setVoiceProblemHandler } from './voice.js';

const DRINKS = L.drinks;
const ORDER = ['wo', 'yao', 'drink'];

// ---------- 進度紀錄 ----------
let memoryCompleted = [];
function readCompleted() {
  try {
    const data = JSON.parse(localStorage.getItem(L.storageKey) || '[]');
    if (Array.isArray(data)) memoryCompleted = data.filter(id => DRINKS.some(d => d.id === id));
  } catch {}
  return new Set(memoryCompleted);
}
function writeCompleted(set) {
  memoryCompleted = [...set];
  try { localStorage.setItem(L.storageKey, JSON.stringify(memoryCompleted)); } catch {}
}
export function getFirstLevelStars() { return readCompleted().size; }

// ---------- 圖片 ----------
let has = {};   // 每個圖片項目是否已有檔案
const imageKeys = ['drinkShopBg', 'rabbitHappy', ...DRINKS.flatMap(d => [d.icon, d.happy])];

// 沒有 GPT 飲品圖時，用程式畫的簡易圖示（原版的畫法）
function fallbackIcon(d) {
  const { color, symbol, shape } = d.fallback;
  const body = shape === 'carton'
    ? '<path d="M22 17 L27 9 H47 L52 17 Z" fill="#79aed5"/><path d="M22 17 H52 V54 Q52 59 47 59 H27 Q22 59 22 54 Z" fill="#fffdf6" stroke="#c8d9db" stroke-width="2"/>'
    : shape === 'bottle'
      ? `<path d="M31 11 H43 V18 Q43 22 48 27 L51 53 Q51 60 44 60 H30 Q23 60 23 53 L26 27 Q31 22 31 18 Z" fill="${color}" stroke="#e3d4c9" stroke-width="2"/><rect x="30" y="8" width="14" height="6" rx="2" fill="#d8a7ab"/>`
      : `<path d="M20 16 H54 L50 55 Q49 60 45 60 H29 Q25 60 24 55 Z" fill="${color}" fill-opacity=".85" stroke="#d0e3df" stroke-width="2"/><path d="M24 28 H50 L48 54 Q47 57 44 57 H30 Q27 57 26 54 Z" fill="${color}"/>`;
  return `<svg viewBox="0 0 74 68" aria-hidden="true">${body}<text x="37" y="45" text-anchor="middle" font-size="17">${symbol}</text></svg>`;
}
function drinkIcon(d) {
  return has[d.icon] ? `<img class="fl-drink-img" src="${imageUrl(d.icon)}" alt="" aria-hidden="true">` : fallbackIcon(d);
}

function starMarkup(completed) {
  return DRINKS.map((d, i) => `<span class="fl-star ${completed.has(d.id) ? 'is-earned' : ''}" aria-label="第${i + 1}顆星${completed.has(d.id) ? '已獲得' : '尚未獲得'}">★</span>`).join('');
}

// ---------- 狀態 ----------
let root, callbacks, returnFocus = null;
let phase = 'entrance', completed, round = 0, step = 0, hint = false, practice = false, earnedNew = false;
let choiceOrder = ORDER;   // 本題三個選項的排列順序

function shuffledChoices() {
  let a;
  do {
    a = ORDER.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  } while (a.every((v, i) => v === ORDER[i]));   // 不要剛好排成正確順序
  return a;
}

function ensureRoot() {
  if (root) return root;
  root = document.createElement('section');
  root.className = 'first-level';
  root.id = 'firstLevel';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', '第一關：彩虹飲品屋');
  document.body.appendChild(root);
  root.addEventListener('click', handleClick);
  root.addEventListener('keydown', e => { if (e.key === 'Escape') closeLevel(); });
  setVoiceProblemHandler(setNote);
  return root;
}

function setNote(message) { const note = root?.querySelector('#flNote'); if (note) note.textContent = message; }
function headingFocus() { requestAnimationFrame(() => root.querySelector('[data-focus]')?.focus()); }
function pct(v) { return v + '%'; }

// ---------- 畫面 ----------
function artMarkup(d) {
  const O = L.overlay;
  const success = phase === 'success';
  let layers = '';
  if (phase === 'playing') {
    layers = `<div class="fl-thought" style="left:${pct(O.thought.left)};top:${pct(O.thought.top)}" role="img" aria-label="小兔想要${d.name}">${drinkIcon(d)}</div>`
           + `<div class="fl-xiaohe-speech" style="left:${pct(O.xiaoheSpeech.left)};top:${pct(O.xiaoheSpeech.top)}">${L.text.xiaoheAsk}</div>`;
  }
  if (success) {
    const own = has[d.happy];   // 有本題專屬的開心圖就用它，否則用通用開心圖＋液體換色
    layers = `<img class="fl-happy-bunny" src="${imageUrl(own ? d.happy : 'rabbitHappy')}" style="clip-path:polygon(${O.rabbitClip})" alt="" aria-hidden="true">`
           + `<div class="fl-rabbit-speech" style="left:${pct(O.rabbitSpeech.left)};top:${pct(O.rabbitSpeech.top)}">${L.text.rabbitThanks}</div>`
           + (own ? '' : `<span class="fl-liquid" style="--liquid:${d.liquid};left:${pct(O.liquid.left)};top:${pct(O.liquid.top)};width:${pct(O.liquid.width)};height:${pct(O.liquid.height)}" aria-hidden="true"></span>`);
  }
  const alt = success ? `小兔開心地拿著${d.name}，小禾在櫃檯後方` : '小禾在彩虹飲品屋的櫃檯後方，兔子客人在前方';
  return `<div class="fl-art"><div class="fl-art-blur" style="background-image:url('${imageUrl('drinkShopBg')}')"></div><div class="fl-image-plane"><img src="${imageUrl('drinkShopBg')}" alt="${alt}">${layers}</div></div>`;
}

function headerMarkup() {
  return `<header class="fl-header"><button class="fl-back" type="button" data-action="exit" aria-label="返回樂園地圖">← <span>樂園地圖</span></button>`
       + `<div class="fl-header-title"><span>LEVEL 01</span><strong>彩虹飲品屋</strong></div>`
       + `<div class="fl-progress" aria-label="已收集 ${completed.size} 顆星，共 6 顆"><div class="fl-progress-stars">${starMarkup(completed)}</div><span>${completed.size} / 6</span></div></header>`;
}

function renderEntrance() {
  root.innerHTML = `<div class="fl-entry"><div class="fl-entry-image" style="background-image:url('${imageUrl('drinkShopBg')}')"></div><div class="fl-entry-shade"></div>`
    + `<button class="fl-entry-back" type="button" data-action="exit">← 返回樂園</button>`
    + `<div class="fl-entry-card"><span class="fl-kicker">${L.text.entranceKicker}</span><h1 data-focus tabindex="-1">彩虹飲品屋</h1><p>${L.text.entranceBody}</p>`
    + `<div class="fl-entry-stars" aria-label="已收集 ${completed.size} 顆星，共六顆">${starMarkup(completed)}</div>`
    + `<button class="fl-primary" type="button" data-action="enter">走進飲品屋 <span>→</span></button></div></div>`;
  headingFocus();
}

function choiceButton(role, d) {
  const hinted = hint && ORDER[step] === role ? 'is-hinted' : '';
  if (role === 'drink') {
    return `<button type="button" class="fl-drink ${hinted}" data-action="drink" data-value="${d.id}" aria-label="${d.name}">${drinkIcon(d)}<span>${d.name}</span></button>`;
  }
  return `<button type="button" class="fl-word ${hinted}" data-action="word" data-value="${role}">${L.words[role].text}</button>`;
}

function renderRoom() {
  const d = DRINKS[round];
  let panel = '';
  if (phase === 'welcome') {
    panel = `<div class="fl-panel fl-welcome"><span class="fl-kicker">${L.text.welcomeKicker}</span>`
          + `<button class="fl-primary" type="button" data-action="start">開始闖關 <span>→</span></button>`
          + `<p class="fl-voice-status">${VOICE_STATUS}</p><p class="fl-note" id="flNote" role="status"></p></div>`;
  } else if (phase === 'complete') {
    panel = `<div class="fl-panel fl-finished"><span class="fl-kicker">六種飲品都完成了</span><div class="fl-confetti">✦ 🐰 ✦</div>`
          + `<h2 data-focus tabindex="-1">太棒了！</h2><p>小兔把需要的飲品都告訴小禾了。你收集了六顆星！</p>`
          + `<div class="fl-big-stars" aria-label="六顆星">★★★★★★</div>`
          + `<button class="fl-primary" type="button" data-action="replay">再練習一次 <span>↻</span></button>`
          + `<button class="fl-secondary" type="button" data-action="exit">返回樂園地圖</button></div>`;
  } else if (phase === 'success') {
    const last = practice ? round === DRINKS.length - 1 : completed.size === DRINKS.length;
    panel = `<div class="fl-panel fl-success"><span class="fl-kicker">${earnedNew ? '獲得一顆星' : '完成練習'}</span><p>小兔開心地拿到${d.name}了。</p>`
          + `<button class="fl-primary fl-next" type="button" data-action="next">${last ? '完成第一關' : '下一杯飲品'} <span>→</span></button>`
          + `<p class="fl-note" id="flNote" role="status"></p></div>`;
  } else {
    const slots = [step > 0 ? L.words.wo.text : '', step > 1 ? L.words.yao.text : '', ''];
    const prompt = step === 0 ? '選出正確順序' : step === 1 ? '接著選下一個' : '最後選飲品';
    panel = `<div class="fl-panel fl-play"><div class="fl-question-top"><span class="fl-kicker">第 ${round + 1} / 6 杯</span>`
          + `<button type="button" class="fl-audio" data-action="listen" aria-label="重聽題目">🔊 聽題目</button></div>`
          + `<div class="fl-sentence" aria-label="句子：${slots.join('')}，共三個部分">${slots.map((s, i) => `<span class="fl-slot ${s ? 'filled' : ''} ${step === i ? 'current' : ''}">${s}</span>`).join('')}</div>`
          + `<div class="fl-prompt">${prompt}</div>`
          + `<div class="fl-choice-row">${choiceOrder.map(role => choiceButton(role, d)).join('')}</div>`
          + `<div class="fl-controls"><button type="button" class="fl-hint" data-action="hint">💡 給我提示</button></div>`
          + `<p class="fl-note" id="flNote" role="status" aria-live="polite"></p></div>`;
  }
  root.innerHTML = `<div class="fl-room">${headerMarkup()}<div class="fl-room-body"><div class="fl-scene">${artMarkup(d)}</div>${panel}</div></div>`;
  headingFocus();
}

function render() { phase === 'entrance' ? renderEntrance() : renderRoom(); }

// ---------- 作答 ----------
function beginRound(r) {
  round = r; step = 0; hint = false; phase = 'playing';
  choiceOrder = shuffledChoices();
  render();
  playVoice('questionKind');
}

function attemptWord(value) {
  if (phase !== 'playing') return;
  if (value !== ORDER[step]) {
    hint = true; renderRoom();
    setNote(step === 2 ? '請選小兔想喝的飲品。' : `先選「${L.words[ORDER[step]].text}」。`);
    return;
  }
  step++; hint = false;
  playVoice(L.words[value].audio);
  renderRoom();
}

function attemptDrink(id) {
  if (phase !== 'playing') return;
  const d = DRINKS[round];
  if (step !== 2 || id !== d.id) {
    hint = true; renderRoom();
    setNote(step < 2 ? '先選「我」，再選「要」。' : `再找找看「${d.name}」。`);
    playVoice(d.word);
    return;
  }
  step = 3; phase = 'success';
  earnedNew = !completed.has(d.id);
  completed.add(d.id);
  writeCompleted(completed);
  callbacks?.onProgress?.();
  renderRoom();
  playVoice(d.sentence, 'thanks');
}

function closeLevel() {
  stopVoice();
  root.classList.remove('is-open');
  root.hidden = true;
  callbacks?.onExit?.();
  returnFocus?.focus?.();
}

function handleClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'exit') return closeLevel();
  if (action === 'enter') { phase = 'welcome'; render(); playVoice('intro'); return; }
  if (action === 'start') {
    if (completed.size === DRINKS.length) practice = true;
    beginRound(practice ? 0 : Math.max(0, DRINKS.findIndex(d => !completed.has(d.id))));
    return;
  }
  if (action === 'replay') { practice = true; beginRound(0); return; }
  if (action === 'word') return attemptWord(button.dataset.value);
  if (action === 'drink') return attemptDrink(button.dataset.value);
  if (action === 'hint') {
    hint = true; renderRoom();
    setNote(step === 0 ? '請點亮起來的「我」。' : step === 1 ? '請點亮起來的「要」。' : `請點亮起來的「${DRINKS[round].name}」。`);
    return;
  }
  if (action === 'listen') { playVoice('questionKind'); return; }
  if (action === 'next') {
    if (practice) {
      if (round === DRINKS.length - 1) phase = 'complete'; else return beginRound(round + 1);
    } else if (completed.size === DRINKS.length) {
      phase = 'complete';
    } else {
      const next = DRINKS.findIndex(d => !completed.has(d.id));
      return beginRound(next < 0 ? 0 : next);
    }
    render();
  }
}

export async function startLevelOne(options = {}) {
  ensureRoot();
  callbacks = options;
  returnFocus = document.activeElement;
  completed = readCompleted();
  practice = false; round = 0; step = 0; hint = false; phase = 'entrance';
  has = await checkImages(imageKeys);
  root.hidden = false;
  root.classList.add('is-open');
  render();
}
