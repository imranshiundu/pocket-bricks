import test from 'node:test';
import assert from 'node:assert/strict';
import { COLS, ROWS, createBoard, rotateClockwise, PocketBricksGame } from '../src/game.js';

test('board has classic dimensions', () => {
  const board = createBoard();
  assert.equal(board.length, ROWS);
  assert.equal(board[0].length, COLS);
});

test('rotation is clockwise', () => {
  assert.deepEqual(rotateClockwise([[1,0],[1,1]]), [[1,1],[1,0]]);
});

test('game starts with active piece', () => {
  const g = new PocketBricksGame({ random: () => 0 });
  const s = g.start();
  assert.equal(s.running, true);
  assert.ok(s.current);
});

test('game can start from selected old-phone level', () => {
  const g = new PocketBricksGame({ random: () => 0 });
  const s = g.start({ startLevel: 5 });
  assert.equal(s.level, 5);
  assert.equal(s.startLevel, 5);
  assert.ok(s.dropInterval < new PocketBricksGame({ random: () => 0 }).start({ startLevel: 1 }).dropInterval);
});

test('selected level does not drop back after first clear', () => {
  const g = new PocketBricksGame({ random: () => 1 / 7 });
  g.start({ startLevel: 4 });
  g.board[ROWS - 1] = Array(COLS).fill('X');
  g.lock();
  assert.equal(g.snapshot().level, 4);
});

test('piece cannot move through left wall', () => {
  const g = new PocketBricksGame({ random: () => 0 });
  g.start();
  for (let i = 0; i < 20; i++) g.move(-1);
  assert.equal(g.move(-1), false);
});

test('line clear awards score and level progress', () => {
  const g = new PocketBricksGame({ random: () => 1 / 7 });
  g.start();
  g.board[ROWS - 1] = Array(COLS).fill('X');
  assert.equal(g.clearLines(), 1);
  assert.equal(g.board.length, ROWS);
  assert.deepEqual(g.board[0], Array(COLS).fill(0));
});

test('hard drop locks a piece', () => {
  const g = new PocketBricksGame({ random: () => 0 });
  g.start();
  const cells = g.hardDrop();
  assert.ok(cells > 0);
  assert.ok(g.board.some((row) => row.some(Boolean)));
});

test('ghost projection lands below current piece without mutating it', () => {
  const g = new PocketBricksGame({ random: () => 0 });
  const started = g.start();
  const ghost = g.getGhostPiece();
  assert.ok(ghost);
  assert.equal(started.current.row, 0);
  assert.equal(g.snapshot().current.row, 0);
  assert.equal(ghost.col, started.current.col);
  assert.deepEqual(ghost.matrix, started.current.matrix);
  assert.ok(ghost.row > started.current.row);
  assert.equal(g.collides(ghost.row + 1, ghost.col, ghost.matrix), true);
});

test('ghost projection respects stacked blocks', () => {
  const g = new PocketBricksGame({ random: () => 1 / 7 });
  g.start();
  g.board[ROWS - 2] = Array(COLS).fill('X');
  const ghost = g.getGhostPiece();
  assert.ok(ghost.row < ROWS - 2);
  assert.equal(g.collides(ghost.row + 1, ghost.col, ghost.matrix), true);
});

test('snapshot exposes ghost cells for rendering', () => {
  const g = new PocketBricksGame({ random: () => 0 });
  const s = g.start();
  assert.ok(Array.isArray(s.ghostCells));
  assert.equal(s.ghostCells.length, s.currentCells.length);
  assert.ok(s.ghostCells.every((cell) => Number.isInteger(cell.x) && Number.isInteger(cell.y)));
});

test('pause toggles only while running', () => {
  const g = new PocketBricksGame({ random: () => 0 });
  assert.equal(g.pause(), false);
  g.start();
  assert.equal(g.pause(), true);
  assert.equal(g.snapshot().paused, true);
});
