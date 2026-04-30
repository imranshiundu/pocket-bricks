import { COLS, ROWS, PIECES, PocketBricksGame } from './game.js';

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

const game = new PocketBricksGame();
let last = 0;
let elapsed = 0;
let raf = 0;
let best = Number(localStorage.getItem('pocket-bricks-best') || 0);
let soundEnabled = localStorage.getItem('pocket-bricks-sound') !== 'off';
let audioContext;

function pad(n, l = 6) { return String(n).padStart(l, '0'); }
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

function render() {
  const s = game.snapshot();
  drawBoard(s);
  drawNext(s.nextType);
  scoreEl.textContent = pad(s.score);
  best = Math.max(best, s.score);
  localStorage.setItem('pocket-bricks-best', String(best));
  bestEl.textContent = pad(best);
  linesEl.textContent = pad(s.lines, 3);
  levelEl.textContent = pad(s.level, 2);
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

function startGame() { elapsed = 0; game.start(); beep(520, 0.08); render(); }
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
  localStorage.setItem('pocket-bricks-sound', soundEnabled ? 'on' : 'off');
  soundBtn.textContent = soundEnabled ? 'SOUND ON' : 'SOUND OFF';
  if (soundEnabled) beep(440, 0.06);
});

window.addEventListener('keydown', (e) => {
  const map = { ArrowLeft: 'left', a: 'left', A: 'left', '4': 'left', ArrowRight: 'right', d: 'right', D: 'right', '6': 'right', ArrowDown: 'down', s: 'down', S: 'down', '8': 'down', ArrowUp: 'rotate', w: 'rotate', W: 'rotate', '5': 'rotate', ' ': 'drop', '0': 'drop' };
  if (e.key === 'Enter') { e.preventDefault(); startGame(); return; }
  if (e.key === 'p' || e.key === 'P') { e.preventDefault(); game.pause(); render(); return; }
  if (map[e.key]) { e.preventDefault(); action(map[e.key]); }
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
soundBtn.textContent = soundEnabled ? 'SOUND ON' : 'SOUND OFF';
render();
raf = requestAnimationFrame(loop);
window.addEventListener('beforeunload', () => cancelAnimationFrame(raf));
