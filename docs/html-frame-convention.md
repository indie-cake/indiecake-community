# HTML Frame Convention

All community games target a native **320x240** play area. Use the `.game-frame` container convention to ensure your game fits the sandbox iframe without overflow.

## Quick start

Add this CSS to your `<head>`:

```css
:root {
  --frame-width: 320px;
  --frame-height: 240px;
}

body {
  margin: 0;
  font-family: sans-serif;
  background: #111;
  color: #fff;
  display: grid;
  place-items: center;
  min-height: 100vh;
}

.game-frame {
  width: var(--frame-width);
  height: var(--frame-height);
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
}
```

Wrap your game in this HTML:

```html
<body>
  <main class="game-frame">
    <h1>Your Game Title</h1>
    <!-- Game content here -->
  </main>
  <script src="..."></script>
</body>
```

## Why this matters

- **320x240 is the target resolution** for Indie Cake microgames.
- **Consistent framing** prevents overflow in the sandbox viewer.
- **All example games** (vanilla-game, clicker-template, hidden-object-template, reaction-template, reveal-the-star) use this convention.

## Customization

- Adjust `padding` to control internal spacing.
- Use `gap` to space flex children.
- Use `flex: 1` on game boards/containers to fill available space.
- Set `overflow: hidden` on internal elements to prevent overflow.

## Example: Dynamic board sizing

If your game has a board that grows or shrinks, use `flex: 1` and measure dimensions from the container:

```css
#board {
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}
```

In JavaScript:

```javascript
const board = document.getElementById('board');
const maxX = board.clientWidth - dotSize;
const maxY = board.clientHeight - dotSize;
```

## Sandbox fallbacks

The sandbox server injects a viewport-fit shim as a fallback for any game that still exceeds the frame. However, native **320x240** pages are preferred.
