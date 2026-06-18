# Reveal the Star

Pick tiles to find a hidden star.

## Objective

Reveal the star within 3 picks.

## Difficulty scaling

The star is shown for a difficulty-adjusted duration before being hidden:

| Level | Reveal time |
|-------|-------------|
| 1 Casual | ~1300ms |
| 2 Standard | 1000ms |
| 3 Challenging | ~900ms |
| 4 Expert | ~800ms |
| 5 Legendary | ~700ms |

Uses `getDifficultyScale()` with engine-first detection and a fallback multiplier table.

## Notes

- Uses `IndieCake.win` and `IndieCake.lose` when available.
- Falls back to `IndieCake.complete(success)`.