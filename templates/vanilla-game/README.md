# Vanilla Game Template

Minimal browser game starter using Indie Cake engine completion helpers.

## Includes

- `index.html`
- `game.js`
- `indiecake.json`

## HTML Frame Convention

This template uses the `.game-frame` convention to fit a native `320x240` play area.

See [HTML Frame Convention](../../docs/html-frame-convention.md) for details and customization options.

## Standard script pattern

Use this flow in `game.js`:

1. `start()` initializes round state and listeners.
2. `tick()` drives timer/frame updates.
3. `end(success, message)` finalizes once and reports result.
4. `reportCompletion(success)` sends result to engine:
	- `IndieCake.win()`
	- `IndieCake.lose()`
	- fallback `IndieCake.complete(success)`

## Engine include

```html
<script src="https://cdn.jsdelivr.net/npm/indiecake-engine@latest/dist/indiecake-engine.iife.min.js"></script>
```

Use a pinned version for jam submissions.

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

**Example:** Scale the timer by difficulty:

```javascript
function start() {
  const difficulty = getDifficultyScale();
  durationMs = Math.round(baseDurationMs * difficulty.timeMultiplier);
  // ...
}
```

## How to use

1. Copy this folder into `games/your-game-name`.
2. Edit metadata in `indiecake.json`.
3. Keep the `start()` / `end()` pattern and replace gameplay logic.
4. Test locally in a browser.