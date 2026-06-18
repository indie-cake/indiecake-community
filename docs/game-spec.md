# Game Specification

Community games should be fast, readable, and replayable.

Engine package: https://www.npmjs.com/package/indiecake-engine

## Core constraints

- Session target: under 8 seconds
- Single clear objective
- Immediate first interaction
- Works in modern desktop and mobile browsers
- Design for a `320x240` play area first

## Recommended states

- Boot
- Ready
- Playing
- Won or Lost
- Restart prompt

## Input design

- Primary action should be obvious
- Avoid complex combinations
- Support touch where practical

## Visual design

- Use high contrast for objective targets
- Keep HUD minimal
- Show state transitions clearly
- Make text, sprites, and hit targets readable at `320x240`

## Audio guidance

- Optional but useful
- Keep sounds short and lightweight

## Performance guidance

- Keep assets small
- Avoid large libraries for simple games
- Target smooth play on low-end devices

## Engine integration guidance

If you use Indie Cake runtime:

- Use the browser IIFE CDN asset in HTML
- Initialize once per round/session
- Use `320x240` as your default engine width/height unless the game has a strong reason to differ visually while preserving gameplay readability
- End with exactly one completion call:
  - `IndieCake.win()`
  - `IndieCake.lose()`
  - `IndieCake.complete(true|false)`
- Prefer pinned engine versions for jam submissions

## Inspiration resources

- [WarioWare, Inc.: Mega Microgame$! - All 213 Microgames on All Difficulties](https://www.youtube.com/watch?v=YSh1BXg20TA)
- [MarioWiki microgame list](https://www.mariowiki.com/List_of_WarioWare,_Inc.:_Mega_Microgame$!_microgames)
- [MarioWiki microgame overview](https://www.mariowiki.com/Microgame)

## Required files

- `index.html`
- `game.js`
- `indiecake.json`
- `README.md`

## Optional files

- `thumbnail.png`
- `assets/`

## Metadata schema

Example:

```json
{
  "title": "Catch It",
  "author": "creator-name",
  "objective": "Click the moving target before time runs out",
  "description": "A one-button reaction microgame.",
  "tags": ["reaction", "click"],
  "jam": "weekly-01",
  "engineVersion": "1.0.0",
  "durationSeconds": 6,
  "controls": "mouse or touch",
  "playUrl": "https://username.github.io/catch-it"
}
```

See also:

- [Engine Quick Reference](./engine-quick-reference.md)
