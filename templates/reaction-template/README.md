# Reaction Template

Wait for signal, then act quickly.

## Standard script pattern

This template follows a consistent sequence:

1. `start()` initializes UI and schedules timers.
2. Random delay flips signal from `WAIT` to `GO`.
3. Tap handler checks early tap vs reaction speed.
4. `end(success, text)` clears timers, disables input, and reports completion.

Engine completion pattern:

- `IndieCake.win()`
- `IndieCake.lose()`
- fallback `IndieCake.complete(success)`

## HTML Frame Convention

This template uses the `.game-frame` convention to fit a native `320x240` play area.

See [HTML Frame Convention](../../docs/html-frame-convention.md) for details and customization options.

## Core mechanic

- random wait phase
- single reaction input
- clear pass or fail threshold

## Good for

- one-button jams
- reflex mini-games
- tournament tie-breakers

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

**Example:** Scale reaction window and threshold by difficulty:

```javascript
function start() {
  const difficulty = getDifficultyScale();
  waitWindow = Math.round(baseWaitWindow * difficulty.speedMultiplier);
  threshold = Math.round(baseThreshold * difficulty.timeMultiplier);
  // ...
}
```