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
const updatePanel = $('#updatePanel');
const updateBtn = $('#updateBtn');
const updateHelp = $('#updateHelp');
const settingsBtn = $('#settingsBtn');
const closeSettingsBtn = $('#closeSettingsBtn');
const settingsPanel = $('#settingsPanel');
const startLevelSelect = $('#startLevelSelect');
const settingsMemory = $('#settingsMemory');
const apkInstallBtn = $('#apkInstallBtn');
const releasesBtn = $('#releasesBtn');
const repoBtn = $('#repoBtn');
const webInstallBtn = $('#webInstallBtn');
const resetMemoryBtn = $('#resetMemoryBtn');

const APP_VERSION = '1.1.3';
const REPO_URL = 'https://github.com/imranshiundu/pocket-bricks';
const RELEASES_URL = `${REPO_URL}/releases`;
const LATEST_RELEASE_API = 'https://api.github.com/repos/imranshiundu/pocket-bricks/releases/latest';
const MEMORY_KEY = 'pocket-bricks-memory-v1';
const oldBest = Number(localStorage.getItem('pocket-bricks-best') || 0);
const defaultMemory = {
  bestScore: oldBest,
  lastScore: 0,
  gamesPlayed: 0,
  bestLevel: 1,
  bestLines: 0,
  startLevel: 1,
  sound: localStorage.getItem('pocket-bricks-sound') !== 'off',
  lastUpdateCheck: 0,
  latestVersionSeen: APP_VERSION,
};
const loadMemory = () => {
  try { return { ...defaultMemory, ...JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}') }; }
  catch { return { ...defaultMemory }; }
};
let memory = loadMemory();
const saveMemory = () => localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
const game = new PocketBricksGame({ startLevel: memory.startLevel || 1 });
let last = 0;
let elapsed = 0;
let raf = 0;
let soundEnabled = memory.sound;
let audioContext;
let finalSavedForRound = false;
let previousLines = 0;
let previousGameOver = false;
let deferredInstallPrompt = null;

function getNativePlugin(name) { return window.Capacitor?.Plugins?.[name] || null; }
function pad(n, l = 6) { return String(n).padStart(l, '0'); }
function isNativeAndroid() { return window.Capacitor?.getPlatform?.() === 'android'; }
function isStandalone() { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true || window.Capacitor?.isNativePlatform?.(); }
function versionNumber(tag) { return String(tag || '0').replace(/^v/i, '').split('.').reduce((n, part, i) => n + (Number(part) || 0) * Math.pow(100, 2 - i), 0); }
function hasNewerVersion(latest, current) { return versionNumber(latest) > versionNumber(current); }
function showUpdatePanel(tag) {
  if (!updatePanel || !tag) return;
  updateHelp.textContent = `New APK available: ${tag}. Your app: v${APP_VERSION}.`;
  updatePanel.classList.add('is-visible');
}
async function openExternal(url) {
  const Browser = getNativePlugin('Browser');
  if (Browser?.open) await Browser.open({ url });
  else window.open(url, '_blank', 'noopener,noreferrer');
}
function ensureAudio() {
  if (!soundEnabled) return null;
  const AudioApi = window.AudioContext || window.webkitAudioContext;
  if (!AudioApi) return null;
  audioContext ||= new AudioApi();
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  return audioContext;
}
function tone(freq = 330, duration = 0.045, volume = 0.032, delay = 0) {
  const ctx = ensureAudio();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + delay;
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.012);
  } catch {}
}
const audio = {
  boot: () => [523, 659, 784].forEach((f, i) => tone(f, 0.055, 0.035, i * 0.06)),
  move: () => tone(278, 0.022, 0.018),
  down: () => tone(205, 0.024, 0.017),
  rotate: () => tone(392, 0.035, 0.025),
  drop: () => { tone(160, 0.045, 0.03); tone(112, 0.035, 0.022, 0.045); },
  lock: () => tone(145, 0.028, 0.018),
  line: (count = 1) => { for (let i = 0; i < Math.min(count, 4); i += 1) tone(440 + i * 110, 0.055, 0.035, i * 0.055); },
  pause: () => tone(330, 0.04, 0.02),
  over: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.075, 0.032, i * 0.075)),
};
function tap() { getNativePlugin('Haptics')?.impact?.({ style: 'LIGHT' }).catch(() => {}); }

function drawCell(ctx, x, y, size, filled, ghost = false) {
  ctx.fillStyle = filled ? '#142318' : 'rgba(20,35,24,0.11)';
  ctx.fillRect(x, y, size - 1, size - 1);
  if (filled) {
    ctx.fillStyle = 'rgba(225,239,194,0.16)';
    ctx.fillRect(x + 1, y + 1, size - 3, 2);
  }
  if (ghost) {
    ctx.fillStyle = 'transparent';
    ctx.strokeStyle = 'rgba(20,35,24,0.38)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, size - 5, size - 5);
  }
}
function drawBoard(state) {
  const cell = boardCanvas.width / COLS;
  boardCtx.fillStyle = '#b5c88e';
  boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
  state.board.forEach((row, y) => row.forEach((v, x) => drawCell(boardCtx, x * cell, y * cell, cell, Boolean(v))));
  state.ghostCells.forEach(({ x, y }) => drawCell(boardCtx, x * cell, y * cell, cell, false, true));
  state.currentCells.forEach(({ x, y }) => drawCell(boardCtx, x * cell, y * cell, cell, true));
}
function drawNext(type) {
  nextCtx.fillStyle = '#b5c88e';
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  const m = PIECES[type] || [];
  if (!m.length) return;
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
function renderSettingsMemory() {
  if (!settingsMemory) return;
  settingsMemory.innerHTML = `
    <div><span>BEST SCORE</span><strong>${pad(memory.bestScore)}</strong></div>
    <div><span>LAST SCORE</span><strong>${pad(memory.lastScore)}</strong></div>
    <div><span>PLAYS</span><strong>${pad(memory.gamesPlayed, 3)}</strong></div>
    <div><span>BEST LINES</span><strong>${pad(memory.bestLines, 3)}</strong></div>
  `;
}
function render() {
  const s = game.snapshot();
  saveFinishedGame(s);
  if (s.score > memory.bestScore) {
    memory.bestScore = s.score;
    localStorage.setItem('pocket-bricks-best', String(memory.bestScore));
    saveMemory();
  }
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
  soundBtn.textContent = soundEnabled ? 'SOUND ON' : 'SOUND OFF';
  statusEl.textContent = s.gameOver ? 'GAME OVER — PRESS START' : s.paused ? 'PAUSED' : s.running ? 'PLAYING — KEEP STACK LOW' : 'READY — PRESS START';
  if (startLevelSelect) startLevelSelect.value = String(memory.startLevel || 1);
  renderSettingsMemory();
}
function loop(time = 0) {
  const s = game.snapshot();
  if (s.running && !s.paused && !s.gameOver) {
    elapsed += time - last;
    if (elapsed >= s.dropInterval) {
      game.tick();
      const next = game.snapshot();
      if (next.lines > previousLines) audio.line(next.lines - previousLines);
      else audio.lock();
      previousLines = next.lines;
      elapsed = 0;
    }
  }
  const latest = game.snapshot();
  if (latest.gameOver && !previousGameOver) audio.over();
  previousGameOver = latest.gameOver;
  last = time;
  render();
  raf = requestAnimationFrame(loop);
}
function startGame() {
  ensureAudio();
  elapsed = 0;
  finalSavedForRound = false;
  previousLines = 0;
  previousGameOver = false;
  game.start({ startLevel: memory.startLevel || 1 });
  tap();
  audio.boot();
  render();
}
function action(name) {
  ensureAudio();
  if (!game.snapshot().running && name !== 'start') startGame();
  tap();
  if (name === 'left' && game.move(-1)) audio.move();
  if (name === 'right' && game.move(1)) audio.move();
  if (name === 'down' && game.move(0, 1)) audio.down();
  if (name === 'rotate' && game.rotate()) audio.rotate();
  if (name === 'drop') { game.hardDrop(); audio.drop(); previousLines = game.snapshot().lines; }
  render();
}
async function checkForUpdates() {
  const now = Date.now();
  if (!isNativeAndroid() && !isStandalone()) return;
  if (now - Number(memory.lastUpdateCheck || 0) < 6 * 60 * 60 * 1000) {
    if (hasNewerVersion(memory.latestVersionSeen, APP_VERSION)) showUpdatePanel(memory.latestVersionSeen);
    return;
  }
  try {
    const res = await fetch(LATEST_RELEASE_API, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const latestTag = data.tag_name || data.name;
    memory.lastUpdateCheck = now;
    memory.latestVersionSeen = latestTag || APP_VERSION;
    saveMemory();
    if (hasNewerVersion(latestTag, APP_VERSION)) showUpdatePanel(latestTag);
  } catch {}
}
function openSettings() { settingsPanel?.classList.add('is-open'); settingsPanel?.setAttribute('aria-hidden', 'false'); render(); }
function closeSettings() { settingsPanel?.classList.remove('is-open'); settingsPanel?.setAttribute('aria-hidden', 'true'); }

document.querySelectorAll('[data-action]').forEach((btn) => {
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); action(btn.dataset.action); });
});
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', () => { ensureAudio(); tap(); const wasPaused = game.pause(); audio.pause(); render(); return wasPaused; });
soundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  memory.sound = soundEnabled;
  localStorage.setItem('pocket-bricks-sound', soundEnabled ? 'on' : 'off');
  saveMemory();
  tap();
  if (soundEnabled) { ensureAudio(); audio.boot(); }
  render();
});
settingsBtn?.addEventListener('click', openSettings);
closeSettingsBtn?.addEventListener('click', closeSettings);
settingsPanel?.addEventListener('click', (event) => { if (event.target === settingsPanel) closeSettings(); });
startLevelSelect?.addEventListener('change', () => { memory.startLevel = Number(startLevelSelect.value); saveMemory(); render(); });
resetMemoryBtn?.addEventListener('click', () => {
  const keepSound = memory.sound;
  const keepLevel = memory.startLevel;
  memory = { ...defaultMemory, sound: keepSound, startLevel: keepLevel, bestScore: 0 };
  localStorage.setItem('pocket-bricks-best', '0');
  saveMemory();
  render();
});
updateBtn?.addEventListener('click', () => openExternal(RELEASES_URL));
apkInstallBtn?.addEventListener('click', () => openExternal(RELEASES_URL));
releasesBtn?.addEventListener('click', () => openExternal(RELEASES_URL));
repoBtn?.addEventListener('click', () => openExternal(REPO_URL));
webInstallBtn?.addEventListener('click', async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice.catch(() => null);
    deferredInstallPrompt = null;
  } else {
    openExternal(location.href);
  }
});
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferredInstallPrompt = event; });
window.addEventListener('keydown', (e) => {
  const map = { ArrowLeft: 'left', a: 'left', A: 'left', '4': 'left', ArrowRight: 'right', d: 'right', D: 'right', '6': 'right', ArrowDown: 'down', s: 'down', S: 'down', '8': 'down', ArrowUp: 'rotate', w: 'rotate', W: 'rotate', '5': 'rotate', ' ': 'drop', '0': 'drop' };
  if (e.key === 'Enter') { e.preventDefault(); startGame(); return; }
  if (e.key === 'p' || e.key === 'P') { e.preventDefault(); game.pause(); audio.pause(); render(); return; }
  if (e.key === 'Escape') { closeSettings(); return; }
  if (map[e.key]) { e.preventDefault(); action(map[e.key]); }
});
if ('serviceWorker' in navigator && !window.Capacitor?.isNativePlatform?.()) navigator.serviceWorker.register('./sw.js').catch(() => {});
render();
checkForUpdates();
raf = requestAnimationFrame(loop);
window.addEventListener('beforeunload', () => cancelAnimationFrame(raf));
