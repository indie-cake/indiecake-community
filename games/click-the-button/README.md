# Click the Button

Click the moving button before it slides away.

## Objective

A single click or tap on the moving button wins the round.

## Engine usage

This game uses the Indie Cake engine for canvas rendering and input.

**Initialization:**
```javascript
engine.init({ canvas: 'gameCanvas', debug: false });
```

**Graphics subsystem** - accessed via `engine.graphics`:
- `engine.graphics.getContext()` returns the `CanvasRenderingContext2D` for direct drawing
- `engine.graphics.getWidth()` / `getHeight()` returns canvas dimensions
- `engine.graphics.clear()` clears the canvas each frame

The game wraps these in defensive helpers (`getGraphics()`, `getGraphicsContext()`, `getCanvasWidth()`, `getCanvasHeight()`) that fall back to direct canvas access when the graphics subsystem is unavailable.

**Input subsystem** - accessed via `engine.input`:
- `engine.input.addEventListener(handler)` subscribes to `mousedown` and `touchstart` events

**Distance utility:**
- `engine.distance(x1, y1, x2, y2)` used for hit-testing the button; falls back to `Math.hypot`

**Completion:**
- `engine.win()` / `engine.lose()` with fallback `engine.complete(success)`

## Difficulty scaling

| Level | Button size | Move interval | Move speed |
|-------|------------|---------------|------------|
| 1 Casual | 180px | ~1200ms | ~800ms |
| 2 Standard | 150px | ~1000ms | ~800ms |
| 3 Challenging | 130px | ~900ms | ~600ms |
| 4+ Expert/Legendary | 100px | ~700ms | ~400ms |

All intervals are further scaled by `speedMultiplier`.
