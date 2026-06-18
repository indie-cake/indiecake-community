# Hidden Object Template

Find one highlighted target among decoys.

## Standard script pattern

This template uses:

1. `start()` to reset state and rebuild the board.
2. `buildBoard()` to place decoys and one target.
3. `tick()` to enforce a short round timer.
4. `end(success, text)` to finalize and report result.

Engine completion pattern:

- `IndieCake.win()`
- `IndieCake.lose()`
- fallback `IndieCake.complete(success)`

## HTML Frame Convention

This template uses the `.game-frame` convention to fit a native `320x240` play area. The board dynamically sizes to fill available space.

See [HTML Frame Convention](../../docs/html-frame-convention.md) for details and customization options.

## Good for

- visual search jams
- pattern recognition challenges
- short puzzle rounds

## Adjust

- number of decoys
- color contrast
- board size and timer

## Engine include

```html
<script src="https://cdn.jsdelivr.net/npm/indiecake-engine@latest/dist/indiecake-engine.iife.min.js"></script>
```

## Difficulty scaling

This template includes helpers to scale gameplay by difficulty level:

```javascript
function getDifficultyLevel()     // Returns 1-5 (default 2)
function getDifficultyScale()     // Returns { level, timeMultiplier, speedMultiplier }
```

**Difficulty levels:**
- **Level 1 (Casual)**: time=1.3x, speed=0.7x
- **Level 2 (Standard)**: time=1.0x, speed=0.8x
- **Level 3 (Challenging)**: time=0.9x, speed=1.0x
- **Level 4 (Expert)**: time=0.8x, speed=1.1x
- **Level 5 (Legendary)**: time=0.7x, speed=1.2x

**Example:** Scale timer and decoy count by difficulty:

```javascript
function start() {
  const difficulty = getDifficultyScale();
  durationMs = Math.round(baseDurationMs * difficulty.timeMultiplier);
  decoyCount = Math.round(baseDecoys * difficulty.speedMultiplier);
  // ...
}
```