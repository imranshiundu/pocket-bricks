import { COLS, PIECES, PocketBricksGame } from './game.js';

const $ = (s) => document.querySelector(s);
const boardCanvas = $('#board');
const nextCanvas = $('#next');
const boardCtx = boardCanvas.getContext('2d');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = $('#score');
const bestEl = $('#best');
const linesEl = $('#lines');
const levelEl = $('#level');
const statusEl = $('#status');
const startBtn = $('#startBtn');
const pauseBtn = $('#pauseBtn');
const soundBtn = $('#soundBtn');
const lastScoreEl = $('#lastScore');
const gamesPlayedEl = $('#gamesPlayed');
const bestLevelEl = $('#bestLevel');
const installPanel = $('#installPanel');
const installBtn = $('#installBtn');
const installHelp = $('#installHelp');

const MEMORY_KEY = 'pocket-bricks-memory-v1';
const INSTALL_DISMISSED_KEY = 'pocket-bricks-install-dismissed-v1';
const oldBest = Number(localStorage.getItem('pocket-bricks-best') || 0);
const defaultMemory = { bestScore: oldBest, lastScore: 0, gamesPlayed: 0, bestLevel: 1, bestLines: 0, sound: localStorage.getItem('pocket-bricks-sound') !== 'off' };
const loadMemory = () => {
  try { return { ...defaultMemory, ...JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}') }; }
  catch { return { ...defaultMemory }; }
};
const saveMemory = () => localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));

const game = new PocketBricksGame();
let last = 0;
let elapsed = 0;
let raf = 0;
let memory = loadMemory();
let soundEnabled = memory.sound;
let audioContext;
let finalSavedForRound = false;
let deferredInstallPrompt = null;

function pad(n, l = 6) { return String(n).padStart(l, '0'); }
function isStandalone() { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; }
function isIos() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
function showInstallPanel(text, buttonText = 'INSTALL APP') {
  if (!installPanel || isStandalone() || localStorage.getItem(INSTALL_DISMISSED_KEY) === 'yes') return;
  installHelp.textContent = text;
  installBtn.textContent = buttonText;
  installPanel.classList.add('is-visible');
}
function hideInstallPanel() { installPanel?.classList.remove('is-visible'); }
function beep(freq = 330, duration = 0.05) {
  if (!soundEnabled) return;
  audioContext ||= new AudioContext();
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'square';
  osc.frequency.value = freq;
  gain.gain.value = 0.025;
  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

function drawCell(ctx, x, y, size, filled) {
  ctx.fillStyle = filled ? '#142318' : 'rgba(20,35,24,0.11)';
  ctx.fillRect(x, y, size - 1, size - 1);
  if (filled) {
    ctx.fillStyle = 'rgba(225,239,194,0.16)';
    ctx.fillRect(x + 1, y + 1, size - 3, 2);
  }
}

function drawBoard(state) {
  const cell = boardCanvas.width / COLS;
  boardCtx.fillStyle = '#b5c88e';
  boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
  state.visibleBoard.forEach((row, y) => row.forEach((v, x) => drawCell(boardCtx, x * cell, y * cell, cell, Boolean(v))));
}

function drawNext(type) {
  nextCtx.fillStyle = '#b5c88e';
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  const m = PIECES[type] || [];
  const cell = 15;
  const ox = Math.floor((nextCanvas.width - m[0].length * cell) / 2);
  const oy = Math.floor((nextCanvas.height - m.length * cell) / 2);
  m.forEach((row, y) => row.forEach((v, x) => drawCell(nextCtx, ox + x * cell, oy + y * cell, cell, Boolean(v))));
}

function saveFinishedGame(state) {
  if (finalSavedForRound || !state.gameOver) return;
  finalSavedForRound = true;
  memory.lastScore = state.score;
  memory.bestScore = Math.max(memory.bestScore, state.score);
  memory.bestLevel = Math.max(memory.bestLevel, state.level);
  memory.bestLines = Math.max(memory.bestLines, state.lines);
  memory.gamesPlayed += 1;
  localStorage.setItem('pocket-bricks-best', String(memory.bestScore));
  saveMemory();
}

function render() {
  const s = game.snapshot();
  saveFinishedGame(s);
  memory.bestScore = Math.max(memory.bestScore, s.score);
  drawBoard(s);
  drawNext(s.nextType);
  scoreEl.textContent = pad(s.score);
  bestEl.textContent = pad(memory.bestScore);
  linesEl.textContent = pad(s.lines, 3);
  levelEl.textContent = pad(s.level, 2);
  lastScoreEl.textContent = pad(memory.lastScore);
  gamesPlayedEl.textContent = pad(memory.gamesPlayed, 3);
  bestLevelEl.textContent = pad(memory.bestLevel, 2);
  pauseBtn.textContent = s.paused ? 'RESUME' : 'PAUSE';
  statusEl.textContent = s.gameOver ? 'GAME OVER — PRESS START' : s.paused ? 'PAUSED' : s.running ? 'PLAYING — KEEP STACK LOW' : 'READY — PRESS START';
}

function loop(time = 0) {
  const s = game.snapshot();
  if (s.running && !s.paused && !s.gameOver) {
    elapsed += time - last;
    if (elapsed >= s.dropInterval) { game.tick(); elapsed = 0; beep(185, 0.025); }
  }
  last = time;
  render();
  raf = requestAnimationFrame(loop);
}

function startGame() { elapsed = 0; finalSavedForRound = false; game.start(); beep(520, 0.08); render(); }
function action(name) {
  if (!game.snapshot().running && name !== 'start') startGame();
  if (name === 'left' && game.move(-1)) beep(260, 0.025);
  if (name === 'right' && game.move(1)) beep(260, 0.025);
  if (name === 'down' && game.move(0, 1)) beep(210, 0.025);
  if (name === 'rotate' && game.rotate()) beep(360, 0.035);
  if (name === 'drop') { game.hardDrop(); beep(150, 0.045); }
  render();
}

document.querySelectorAll('[data-action]').forEach((btn) => {
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); action(btn.dataset.action); });
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', () => { game.pause(); render(); });
soundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  memory.sound = soundEnabled;
  localStorage.setItem('pocket-bricks-sound', soundEnabled ? 'on' : 'off');
  saveMemory();
  soundBtn.textContent = soundEnabled ? 'SOUND ON' : 'SOUND OFF';
  if (soundEnabled) beep(440, 0.06);
});
installBtn?.addEventListener('click', async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice.catch(() => null);
    deferredInstallPrompt = null;
    hideInstallPanel();
    return;
  }
  if (isIos()) {
    installHelp.textContent = 'On iPhone: tap Share, then Add to Home Screen.';
  } else {
    installHelp.textContent = 'Open the browser menu and choose Install app or Add to Home screen.';
  }
});

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  showInstallPanel('Install to home screen for full app mode.');
});
window.addEventListener('appinstalled', () => {
  localStorage.setItem(INSTALL_DISMISSED_KEY, 'yes');
  deferredInstallPrompt = null;
  hideInstallPanel();
});

window.addEventListener('keydown', (e) => {
  const map = { ArrowLeft: 'left', a: 'left', A: 'left', '4': 'left', ArrowRight: 'right', d: 'right', D: 'right', '6': 'right', ArrowDown: 'down', s: 'down', S: 'down', '8': 'down', ArrowUp: 'rotate', w: 'rotate', W: 'rotate', '5': 'rotate', ' ': 'drop', '0': 'drop' };
  if (e.key === 'Enter') { e.preventDefault(); startGame(); return; }
  if (e.key === 'p' || e.key === 'P') { e.preventDefault(); game.pause(); render(); return; }
  if (map[e.key]) { e.preventDefault(); action(map[e.key]); }
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
if (isIos()) showInstallPanel('iPhone: tap Share, then Add to Home Screen.', 'HOW TO INSTALL');
soundBtn.textContent = soundEnabled ? 'SOUND ON' : 'SOUND OFF';
render();
raf = requestAnimationFrame(loop);
window.addEventListener('beforeunload', () => cancelAnimationFrame(raf));
