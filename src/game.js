export const COLS = 10;
export const ROWS = 20;

export const PIECES = {
  I: [[1,1,1,1]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1]],
  S: [[0,1,1],[1,1,0]],
  Z: [[1,1,0],[0,1,1]],
  J: [[1,0,0],[1,1,1]],
  L: [[0,0,1],[1,1,1]],
};

const TYPES = Object.keys(PIECES);
const SCORES = [0, 40, 100, 300, 1200];
const clone = (m) => m.map((r) => r.slice());

export function createBoard(rows = ROWS, cols = COLS) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export function rotateClockwise(matrix) {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());
}

export class PocketBricksGame {
  constructor(options = {}) {
    this.random = options.random || Math.random;
    this.reset();
  }

  reset() {
    this.board = createBoard();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.running = false;
    this.paused = false;
    this.gameOver = false;
    this.current = null;
    this.nextType = this.randomType();
  }

  start() {
    this.reset();
    this.running = true;
    this.spawn();
    return this.snapshot();
  }

  randomType() {
    return TYPES[Math.floor(this.random() * TYPES.length)];
  }

  spawn() {
    const type = this.nextType || this.randomType();
    this.nextType = this.randomType();
    const matrix = clone(PIECES[type]);
    this.current = { type, matrix, row: 0, col: Math.floor((COLS - matrix[0].length) / 2) };
    if (this.collides(this.current.row, this.current.col, this.current.matrix)) {
      this.running = false;
      this.gameOver = true;
    }
  }

  collides(row, col, matrix) {
    for (let y = 0; y < matrix.length; y += 1) {
      for (let x = 0; x < matrix[y].length; x += 1) {
        if (!matrix[y][x]) continue;
        const by = row + y;
        const bx = col + x;
        if (bx < 0 || bx >= COLS || by >= ROWS) return true;
        if (by >= 0 && this.board[by][bx]) return true;
      }
    }
    return false;
  }

  move(dx, dy = 0) {
    if (!this.canAct()) return false;
    const row = this.current.row + dy;
    const col = this.current.col + dx;
    if (this.collides(row, col, this.current.matrix)) return false;
    this.current.row = row;
    this.current.col = col;
    return true;
  }

  rotate() {
    if (!this.canAct()) return false;
    const rotated = rotateClockwise(this.current.matrix);
    for (const kick of [0, -1, 1, -2, 2]) {
      const col = this.current.col + kick;
      if (!this.collides(this.current.row, col, rotated)) {
        this.current.matrix = rotated;
        this.current.col = col;
        return true;
      }
    }
    return false;
  }

  tick() {
    if (!this.canAct()) return this.snapshot();
    if (!this.move(0, 1)) this.lock();
    return this.snapshot();
  }

  hardDrop() {
    if (!this.canAct()) return 0;
    let cells = 0;
    while (this.move(0, 1)) cells += 1;
    this.score += cells * 2;
    this.lock();
    return cells;
  }

  lock() {
    const p = this.current;
    for (let y = 0; y < p.matrix.length; y += 1) {
      for (let x = 0; x < p.matrix[y].length; x += 1) {
        if (p.matrix[y][x] && p.row + y >= 0) this.board[p.row + y][p.col + x] = p.type;
      }
    }
    const cleared = this.clearLines();
    if (cleared) {
      this.lines += cleared;
      this.level = Math.floor(this.lines / 10) + 1;
      this.score += SCORES[cleared] * this.level;
    }
    this.spawn();
  }

  clearLines() {
    let cleared = 0;
    this.board = this.board.filter((row) => {
      if (row.every(Boolean)) { cleared += 1; return false; }
      return true;
    });
    while (this.board.length < ROWS) this.board.unshift(Array(COLS).fill(0));
    return cleared;
  }

  pause() {
    if (!this.running || this.gameOver) return false;
    this.paused = !this.paused;
    return this.paused;
  }

  canAct() {
    return this.running && !this.paused && !this.gameOver && this.current;
  }

  getDropInterval() {
    return Math.max(90, 760 - (this.level - 1) * 55);
  }

  visibleBoard() {
    const board = this.board.map((row) => row.slice());
    const p = this.current;
    if (!p) return board;
    p.matrix.forEach((row, y) => row.forEach((v, x) => {
      if (v && p.row + y >= 0) board[p.row + y][p.col + x] = p.type;
    }));
    return board;
  }

  snapshot() {
    return { board: this.board.map((r) => r.slice()), visibleBoard: this.visibleBoard(), current: this.current ? { ...this.current, matrix: clone(this.current.matrix) } : null, nextType: this.nextType, score: this.score, lines: this.lines, level: this.level, running: this.running, paused: this.paused, gameOver: this.gameOver, dropInterval: this.getDropInterval() };
  }
}
