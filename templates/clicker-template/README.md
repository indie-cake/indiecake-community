# Clicker Template

Fast one-button template designed for game jams.

## Goal

Reach a tap target before time runs out.

## HTML Frame Convention

This template uses the `.game-frame` convention to fit a native `320x240` play area.

See [HTML Frame Convention](../../docs/html-frame-convention.md) for details and customization options.

## Standard script pattern

This template uses a consistent flow:

1. `start()` sets defaults (`taps`, timer start, UI text).
2. Click handler updates progress until win condition.
3. `loop()` enforces time limit.
4. `end(success, text)` stops input and reports result to Indie Cake.

Completion reporting pattern:

- `IndieCake.win()` for success
- `IndieCake.lose()` for failure
- fallback `IndieCake.complete(success)`

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

**Example:** Scale the timer and tap target by difficulty:

```javascript
function start() {
  const difficulty = getDifficultyScale();
  durationMs = Math.round(baseDurationMs * difficulty.timeMultiplier);
  needed = Math.round(baseNeeded * difficulty.speedMultiplier);
  // ...
}
```

## Customize

- needed in game.js
- durationMs in game.js
- colors and layout in index.html
- metadata in indiecake.json