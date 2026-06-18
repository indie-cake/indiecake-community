# Whale Wedge

Stop the spinning wedge and land Mr. Whale in the target zone.

## Objective

Click or tap to stop the rotating wedge when it is aligned with the right-side arrow.

## Difficulty scaling

This game reads difficulty from the engine and locks settings at round start:

- **Level 1-2**: wider wedge and more forgiving hit tolerance
- **Level 3-5**: narrower wedge and tighter hit tolerance
- Rotation speed scales with `speedMultiplier`

## Engine pattern

- `init()` boot flow for setup
- `initDifficulty()` for locked run settings
- `loadAssets()` using `IndieCake.assets`
- `reportCompletion()` using `IndieCake.win()` / `IndieCake.lose()` with `complete()` fallback

Game inspired by https://www.mariowiki.com/Wario_Whirled