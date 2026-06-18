(function () {
  const tiles = document.querySelectorAll('.tile');
  const starIndex = Math.floor(Math.random() * tiles.length);
  let clicked = false;
  let gameStarted = false;

  const baseRevealMs = 1000;

  /**
   * Retrieves the current difficulty level from the Indie Cake engine or falls back to a default value.
   */
  function getDifficultyLevel() {
    let level = 2;
    try {
      // Check if the Indie Cake engine is available and retrieve the difficulty level
      if (
        window.IndieCake &&
        window.IndieCake.difficulty &&
        typeof window.IndieCake.difficulty.getLevel === 'function'
      ) {
        level = window.IndieCake.difficulty.getLevel();
      } else if (typeof window.__indiecake_difficulty !== 'undefined') {
        level = Number(window.__indiecake_difficulty);
      }
    } catch (error) {
      level = 2;
    }

    // Ensure the level is between 1 and 5
    return Math.max(1, Math.min(5, Math.floor(level || 2)));
  }

  /**
   * Retrieves the difficulty scale based on the current difficulty level.
   * @returns {Object} An object containing the level, timeMultiplier, and speedMultiplier.
   */
  function getDifficultyScale() {
    const level = getDifficultyLevel();

    // Define fallback values for timeMultiplier and speedMultiplier based on the difficulty level
    const fallback = {
      1: { timeMultiplier: 1.3, speedMultiplier: 0.7 },
      2: { timeMultiplier: 1.0, speedMultiplier: 0.8 },
      3: { timeMultiplier: 0.9, speedMultiplier: 1.0 },
      4: { timeMultiplier: 0.8, speedMultiplier: 1.1 },
      5: { timeMultiplier: 0.7, speedMultiplier: 1.2 },
    };
    try {
      if (window.IndieCake && window.IndieCake.difficulty) {
        // Retrieve timeMultiplier and speedMultiplier from the Indie Cake engine if available
        // Otherwise, use the fallback values based on the current level
        const timeMultiplier =
          typeof window.IndieCake.difficulty.getTimeMultiplier === 'function'
            ? window.IndieCake.difficulty.getTimeMultiplier()
            : fallback[level].timeMultiplier;
        const speedMultiplier =
          typeof window.IndieCake.difficulty.getSpeedMultiplier === 'function'
            ? window.IndieCake.difficulty.getSpeedMultiplier()
            : fallback[level].speedMultiplier;
        return { level, timeMultiplier, speedMultiplier };
      }
    } catch (error) {
      // If an error occurs while accessing the Indie Cake engine, return the fallback values
      return { level, ...fallback[level] };
    }

    // If the Indie Cake engine is not available, return the fallback values based on the current level
    return { level, ...fallback[level] };
  }

  /**
   * Ends the game and communicates the result to the Indie Cake engine.
   */
  function end(success) {
    if (window.IndieCake && typeof window.IndieCake.complete === 'function') {
      if (success && typeof window.IndieCake.win === 'function') {
        window.IndieCake.win();
      } else if (!success && typeof window.IndieCake.lose === 'function') {
        window.IndieCake.lose();
      } else {
        window.IndieCake.complete(success);
      }
    }
  }

  /**
   * Starts the memory game by revealing the star tile for a brief moment.
   */
  function start() {
    const difficulty = getDifficultyScale();
    // Adjust the reveal time based on the difficulty level
    const revealMs = Math.max(
      200,
      Math.round(baseRevealMs * difficulty.timeMultiplier)
    );

    // Reveal the star tile
    tiles[starIndex].innerText = '⭐';
    tiles[starIndex].style.background = '#e6f3ff';
    tiles[starIndex].style.borderColor = '#0096ff';
    tiles[starIndex].style.animation =
      'pulse 0.5s ease-in-out infinite alternate';

    // Hide it after difficulty-adjusted time and enable clicking
    setTimeout(() => {
      tiles[starIndex].innerText = '?';
      tiles[starIndex].style.background = '#555';
      tiles[starIndex].style.borderColor = '#999';
      tiles[starIndex].style.animation = 'none';
      gameStarted = true;

      // Add a subtle indication that clicking is now enabled
      tiles.forEach((tile) => {
        tile.style.cursor = 'pointer';
        tile.style.opacity = '1';
      });
    }, revealMs);
  }

  tiles.forEach((tile, i) => {
    // Initially disable clicking
    tile.style.cursor = 'not-allowed';
    tile.style.opacity = '0.7';

    tile.addEventListener('click', () => {
      if (clicked || !gameStarted) return;
      clicked = true;

      // Reveal all tiles
      tiles.forEach((t, index) => {
        t.innerText = index === starIndex ? '⭐' : '💀';
        t.style.background = index === starIndex ? '#90EE90' : '#FF6B6B';
        t.style.borderColor = index === starIndex ? '#32CD32' : '#FF0000';
        t.style.cursor = 'default';
      });

      // Complete the game after showing result
      setTimeout(() => {
        end(clicked && i === starIndex);
      }, 300);
    });
  });

  // Start the game
  start();
})();
