# Testing

Run:

```bash
npm test
```

The Node test suite focuses on the pure game engine so the rules remain stable even when the UI changes.

Current checks:

- Board dimensions
- Rotation
- Game start
- Wall collision
- Line clearing
- Hard drop
- Pause behavior

For UI changes, test manually on a smartphone browser because thumb reach and viewport behavior matter.
