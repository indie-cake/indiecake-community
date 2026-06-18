# Getting Started

This guide helps a creator ship a first community game quickly.

Engine package: https://www.npmjs.com/package/indiecake-engine

## 1) Copy a template

Pick a template from `templates/` and copy it to `games/your-game-name`.

## 2) Update metadata

Edit indiecake.json:

- title
- author
- objective
- description
- tags
- playUrl

## 3) Implement game loop

Keep each round short. A good target is 3 to 8 seconds.

Indie Cake games should be designed around a `320x240` play area. If you use a canvas, start with width `320` and height `240`.

If using the browser CDN runtime, include:

```html
<script src="https://cdn.jsdelivr.net/npm/indiecake-engine@latest/dist/indiecake-engine.iife.min.js"></script>
```

## 4) Add clear win and lose outcomes

If using the engine, call one of:

- `IndieCake.win()`
- `IndieCake.lose()`

Or call `IndieCake.complete(true/false)`. Only call one completion path once per round.

If not using the engine, expose a clear game-over state and feedback.

## 5) Test in browser

Open index.html locally and verify:

- no console errors
- objective is obvious
- input works on desktop and mobile
- layout still reads clearly at `320x240`

## 6) Add to index

Create or update `game-index.json` entry for discovery.

Make sure metadata has an `engineVersion` field when using Indie Cake runtime features.

## 7) Submit

Open a pull request with screenshots and a short gameplay note.

Next reads:

- [HTML Frame Convention](./html-frame-convention.md)
- [Engine Quick Reference](./engine-quick-reference.md)
- [Submission Checklist](./submission-checklist.md)

Inspiration:

- [WarioWare, Inc.: Mega Microgame$! - All 213 Microgames on All Difficulties](https://www.youtube.com/watch?v=YSh1BXg20TA)
- [MarioWiki microgame list](https://www.mariowiki.com/List_of_WarioWare,_Inc.:_Mega_Microgame$!_microgames)
- [MarioWiki microgame overview](https://www.mariowiki.com/Microgame)