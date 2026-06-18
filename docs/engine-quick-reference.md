# Engine Quick Reference

For engine-based community games.

## Package links

- [npm package](https://www.npmjs.com/package/indiecake-engine)
- [jsDelivr package explorer](https://www.jsdelivr.com/package/npm/indiecake-engine)
- [API reference](https://www.npmjs.com/package/indiecake-engine#api-reference)

## Include engine

Use the browser IIFE build in `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/indiecake-engine@latest/dist/indiecake-engine.iife.min.js"></script>
```

Pinned example:

```html
<script src="https://cdn.jsdelivr.net/npm/indiecake-engine@0.1.0/dist/indiecake-engine.iife.min.js"></script>
```

Use `latest` for fast iteration in community experiments. Use a pinned version for jam submissions and long-lived hosted games.

## Initialize

```ts
window.IndieCake.init({
  canvas: 'gameCanvas',
  width: 320,
  height: 240,
  debug: false
});
```

Call `init` once when the game starts. Reuse the same runtime instance throughout the round.

## Completion helpers

Use one of these once per round:

- `IndieCake.win()`
- `IndieCake.lose()`
- `IndieCake.complete(true|false)`

Completion is one-shot per round. Trigger a win or lose path exactly once.

When running in the community sandbox iframe, the engine posts a `game-complete` event to the parent viewer automatically.

## Useful methods

- `IndieCake.platform.setScore(number)`
- `IndieCake.platform.getScore()`
- `IndieCake.time.getElapsed()`
- `IndieCake.input.isKeyPressed('Space')`

## Browser vs bundler usage

- Browser script tag: use `window.IndieCake`
- Bundler projects: `import { IndieCake } from 'indiecake-engine'`

## Minimal pattern

1. Initialize engine
2. Start gameplay
3. Track score and timer
4. Trigger win or lose exactly once

## Platform dimensions

- Target resolution: `320x240`
- Start by designing for `320x240`, then scale up for larger containers if needed
- Keep critical HUD and interaction targets readable at that base size

## Common pitfalls

- Use `indiecake-engine.iife.min.js` in browser HTML. The non-IIFE build may not expose the expected direct `window.IndieCake` API shape.
- Trigger exactly one completion call per round (`win`, `lose`, or `complete`).
- If sandbox round results do not update, first verify that your game is calling a completion helper.

## See also

- [Getting Started](./getting-started.md)
- [Game Specification](./game-spec.md)
- [Submission Checklist](./submission-checklist.md)
