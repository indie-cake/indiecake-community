# Indie Cake Community

Welcome to the official Indie Cake Community Repository!

This repository is home to community-created games, game jam entries, starter templates, documentation, and resources for the Indie Cake ecosystem.

Whether you're a developer, designer, game creator, or someone with a fun idea for a 5-second challenge, you're welcome here.

> 🎮 Indie Cake is a platform for creating and playing fast-paced microgames inspired by WarioWare. Each game has a simple objective, lasts only a few seconds, and is designed to be immediately playable.

## 🚀 What Can I Do Here?
- 🎮 Create and share microgames
- 🏆 Participate in community game jams
- 📚 Learn how to build Indie Cake-compatible games
- 🧩 Contribute templates and starter projects
- 🐛 Report issues and suggest improvements
- 🐳 Join the Indie Cake Discord and participate in Mr. Whale's Weekly Jams

## 📂 Repository Structure

```
indiecake-community/
│
├── games/
│   ├── click-the-button/
│   ├── reveal-the-star/
│   └── whale-wedge/
│
├── jams/
│   └── weekly-01-shrinking/
│
├── templates/
│   ├── reaction-template/
│   ├── vanilla-game/
│   ├── clicker-template/
│   └── hidden-object-template/
│
├── sandbox/
│
├── docs/
│
└── game-index.json
```

## 🧭 Quick Navigation

- [docs/README.md](./docs/README.md)
- [docs/getting-started.md](./docs/getting-started.md)
- [docs/game-spec.md](./docs/game-spec.md)
- [docs/submission-checklist.md](./docs/submission-checklist.md)
- [docs/engine-quick-reference.md](./docs/engine-quick-reference.md)
- [templates/vanilla-game](./templates/vanilla-game/)
- [templates/clicker-template](./templates/clicker-template/)
- [templates/hidden-object-template](./templates/hidden-object-template/)
- [templates/reaction-template](./templates/reaction-template/)
- [games/click-the-button](./games/click-the-button/)
- [games/reveal-the-star](./games/reveal-the-star/)
- [games/whale-wedge](./games/whale-wedge/)

## 🎮 Creating a Game

Every game should be contained in its own folder:

```
my-game/
│
├── index.html
├── game.js
├── indiecake.json
├── thumbnail.png
└── README.md
```

Games should target a `320x240` play area first. That is the core Indie Cake gameplay resolution to optimize for.

## 📄 indiecake.json

Every game must include a `indiecake.json` file describing the game.

Example:

```json
{
  "title": "Shrinking Whale",
  "author": "ttbowen",
  "objective": "Feed the whale",
  "description": "Mr. Whale is shrinking. Feed him before he disappears.",
  "tags": [
    "shrinking",
    "clicker"
  ],
  "jam": "shrinking",
  "engineVersion": "0.1.0",
  "playUrl": "https://ttbowen.github.io/shrinking-whale"
}
```

## 🕹️ Indie Cake Design Guidelines

Indie Cake games should be:

- ✅ Easy to understand
- ✅ Playable in under 8 seconds
- ✅ Focused on a single objective
- ✅ Playable immediately
- ✅ Suitable for desktop and mobile browsers
- ✅ Readable and playable at 320x240


Examples:

```
Click the Star
Reveal
Catch It
Avoid Red
Feed the Whale
```

## 🏆 Mr. Whale's Weekly Jam

Every week, Mr. Whale emerges from the abyss with a new challenge.

Example:

```
🐋 Weekly Jam #1

🎯 Theme: Shrinking
```

Participants can:

- Build a game
- Submit an idea
- Share a prototype
- Discuss concepts

## 🌐 Hosting Your Game

We recommend hosting games using:

### GitHub Pages

```
https://username.github.io/my-game
```

### Itch.io
```
https://username.itch.io/my-game
```

### CodePen
```
https://codepen.io/username
```

## ⚙️ Indie Cake Engine

Games can use the official Indie Cake Engine CDN.

Package links:

- [npm](https://www.npmjs.com/package/indiecake-engine)
- [jsDelivr](https://www.jsdelivr.com/package/npm/indiecake-engine)

Example:

```html
<script src="https://cdn.jsdelivr.net/npm/indiecake-engine@latest/dist/indiecake-engine.iife.min.js"></script>
```

For jam submissions or long-lived hosted games, prefer pinning a version (for example `@0.1.0`) instead of `@latest`.

Example API:

```javascript
IndieCake.complete(true|false)

IndieCake.win() // Alias for IndieCake.complete(true)

IndieCake.lose() // Alias for IndieCake.complete(false)
```

The engine sends completion events to the sandbox viewer when games are run in an iframe.

See the documentation in [docs](./docs/engine-quick-reference.md) for the full API reference.

Recommended engine init baseline:

```javascript
window.IndieCake.init({
  canvas: 'gameCanvas',
  width: 320,
  height: 240,
  debug: false,
});
```

## 🧪 Sandbox

The community repository includes a tiny local sandbox environment for testing games.

The sandbox can:

- Browse community games
- Load local games
- Validate metadata
- Preview games in an iframe
- Test Indie Cake Engine integration

Run locally:

```sh
npm run sandbox
```

Then open the URL printed in the terminal. By default it starts at port 4173 and will move to the next free port if needed.

Example:

```text
http://localhost:4173
```

The sandbox reads [game-index.json](./game-index.json) and launches the selected entry in an iframe.

## 📚 Starter Templates

Starter templates are available in:

```
templates/
```

Available templates include:

- Vanilla HTML Game
- Clicker Game
- Hidden Object Game
- Reaction Game

## Useful External Resources

For design inspiration and pacing references:

- [WarioWare, Inc.: Mega Microgame$! - All 213 Microgames on All Difficulties](https://www.youtube.com/watch?v=YSh1BXg20TA)
- [MarioWiki microgame list](https://www.mariowiki.com/List_of_WarioWare,_Inc.:_Mega_Microgame$!_microgames)
- [MarioWiki microgame overview](https://www.mariowiki.com/Microgame)

## 🤝 Contributing

We welcome contributions of all kinds.

| Contribution Type | Examples         
| ------------------| ------------------- |
| 🎮 Games         | New microgames       | 
| 📚 Documentation | Guides and tutorials | 
| 🧩 Templates     | Starter projects  | 
| 🎨 Assets        | Sprites, sounds, icons   | 
| 🐛 Fixes         | Bug reports and improvements    |
| 💡 Ideas         | Jam themes and game concepts


Please read our `CONTRIBUTING.md` before submitting a pull request.

## 🏁 Running as a Standalone Community Repo

You can use this repository independently of the Indie Cake platform.

Suggested flow:

1. Create a new jam folder in `jams/`.
2. Ask creators to copy a template from `templates/`.
3. Accept submissions as game folders under `games/`.
4. Keep `game-index.json` updated for discovery.
5. Host games with GitHub Pages, Itch.io, or other static hosting.

## 🏅 Founding Contributors

Thank you to everyone helping shape the future of Indie Cake.

Community contributors may receive:

- 🌟 Founding Contributor role
- 🎮 Featured Creator status
- 🏆 Hall of Fame recognition