# Contributing to Indie Cake Community

Thanks for helping build the Indie Cake creator ecosystem.

## What can be contributed

- New games in `games/`
- Starter templates in `templates/`
- Jam docs and resources in `jams/` and `docs/`
- Improvements to validation, metadata standards, and examples

## Basic rules

- Keep games browser-based and lightweight.
- Design for instant comprehension and short play sessions.
- Include required metadata in `indiecake.json`.
- Avoid copyrighted assets you do not own or have permission to use.
- Do not include harmful, hateful, or explicit content.

## Required game folder format

Each game must live in its own folder under `games/`.

`my-game/`
- `index.html`
- `game.js`
- `indiecake.json`
- `README.md`
- `thumbnail.png` (recommended)

## Metadata requirements

Required fields in indiecake.json:

- title
- author
- objective
- description
- tags (array)
- playUrl (or local path for testing)

Recommended fields:

- jam
- engineVersion
- durationSeconds
- controls

## Submission process

1. Fork the repo.
2. Add your game folder under `games/`.
3. Add or update entry in `game-index.json`.
4. Verify your game works locally in a browser.
5. Open a pull request with a short demo note.

## Pull request checklist

- Game loads without console errors.
- Game can be understood in under 3 seconds.
- Round can be completed or failed quickly.
- Mobile and desktop input both work.
- `indiecake.json` is valid JSON.

## Naming conventions

- Folder names use kebab-case.
- Keep filenames lowercase where possible.
- Prefer clear names over clever names.

## Code style

- Keep dependencies minimal.
- Avoid build steps unless template explicitly requires one.
- Keep scripts readable and commented where needed.

## License

By contributing, you agree your submission can be shared as part of the Indie Cake community collection.