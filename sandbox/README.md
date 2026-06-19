# Sandbox

The sandbox is a lightweight local viewer for testing community games and templates.

It serves files from this repository, opens games in an iframe, and injects helper scripts for:

- viewport scaling
- difficulty selection and propagation
- engine loading when needed

## What It Is For

- Quickly preview games from the community repository
- Validate that metadata and play URLs resolve correctly
- Test behavior across different difficulty levels
- Verify Indie Cake Engine integration in iframe context

## Prerequisites

- Node.js 18+
- npm 9+

## Run The Sandbox

From the repository root:

```sh
npm run sandbox
```

The server starts at port 4173 by default. If that port is in use, it automatically tries the next port.

Example output:

```text
Indie Cake community sandbox running at http://localhost:4173
```

Then open the printed URL in your browser.

## How It Loads Games

- Game entries come from `game-index.json`
- The viewer loads each game in an iframe
- The selected difficulty is sent via URL query param: `indiecake-difficulty`
- The sandbox also sets `window.__indiecake_difficulty` inside the iframe

## Engine Injection Behavior

For game and template HTML files, the sandbox can inject support scripts:

- difficulty bridge script
- viewport scaling style/script
- Indie Cake Engine CDN script if no engine script is detected

This helps games run in a consistent local testing environment.

## Troubleshooting

### Multiple "sandbox running" lines

If you see multiple startup lines (4173, 4174, 4175, ...), previous Node processes are likely still running.

On Windows PowerShell:

```powershell
Get-Process node | Stop-Process -Force
```

Then run `npm run sandbox` again.

### Difficulty not updating in a game

- Reload the iframe/game from the viewer
- Confirm the selected difficulty changed in the UI
- Verify the game reads the injected difficulty or applies engine difficulty after engine availability

### Script changes not reflected

- Hard refresh the browser
- Restart the sandbox process

## Related Files

- `sandbox/server.js` - local HTTP server and HTML injection logic
- `sandbox/public/index.html` - viewer UI shell
- `sandbox/public/viewer.js` - viewer behavior and iframe loading