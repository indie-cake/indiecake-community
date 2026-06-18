# Submission Checklist

Use this checklist before opening a pull request.

## Gameplay

- Objective is understood in under 3 seconds
- Round ends in a clear win or lose
- Round duration is short and intentional
- Game can be replayed quickly

## Technical

- Runs in latest Chrome and Firefox
- Mobile input works (touch)
- No blocking errors in console
- Files are organized in one game folder
- If using the engine CDN, script URL uses `indiecake-engine.iife.min.js`
- Win/Lose completion is triggered exactly once per round

## Content

- No unlicensed copyrighted content
- No hateful, explicit, or unsafe material
- Description and objective match gameplay

## Metadata

- indiecake.json exists and is valid JSON
- Required fields are present
- Tags are relevant and useful
- playUrl is correct if hosted
- engineVersion is set when using the engine runtime

## Repo integration

- Added or updated `game-index.json` entry
- Added `README.md` with controls and objective
- Included `thumbnail.png` (recommended)