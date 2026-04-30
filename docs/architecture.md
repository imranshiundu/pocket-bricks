# Architecture

Pocket Bricks is split into two layers.

## 1. Game engine

`src/game.js` contains the board, pieces, movement, rotation, collision, locking, line clearing, scoring, levels, pause state, and snapshots.

It is pure JavaScript and has no browser dependency. That makes it easy to test with Node.

## 2. Browser shell

`src/app.js` handles the canvas, touch controls, keyboard controls, sound, local storage, service worker registration, and rendering.

## Why no framework?

The app is intentionally tiny. A framework would add weight without improving the game. Static files make it easy to host anywhere and easy for new contributors to understand.

## PWA

The service worker caches the app shell so the game can load offline after the first visit.
