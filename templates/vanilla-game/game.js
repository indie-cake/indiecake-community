(function () {
  const target = document.getElementById('target');
  const status = document.getElementById('status');

  let ended = false;
  let startTime = 0;
  const baseDurationMs = 5000;
  let roundDurationMs = baseDurationMs;

  /**
   * Retrieves the current difficulty level from the Indie Cake engine or falls back to a default value.
   */
  function getDifficultyLevel() {
    let level = 2;

    try {
      // Check if the Indie Cake engine is available and has the difficulty methods
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
   * Reports the completion status of the game to the Indie Cake engine.
   * @param {boolean} success - Whether the player succeeded or not.
   */
  function reportCompletion(success) {
    // Check if the Indie Cake engine is available and has the complete method
    if (!window.IndieCake || typeof window.IndieCake.complete !== 'function') {
      return;
    }

    // If the player succeeded and the win method is available, call it
    if (success && typeof window.IndieCake.win === 'function') {
      window.IndieCake.win();
      return;
    }

    // If the player failed and the lose method is available, call it
    if (!success && typeof window.IndieCake.lose === 'function') {
      window.IndieCake.lose();
      return;
    }

    // Fallback to the complete method if win/lose methods are not available
    window.IndieCake.complete(success);
  }

  /**
   * Ends the game and reports the result.
   * @param {boolean} success - Whether the player succeeded or not.
   * @param {string} message - The message to display to the player.
   */
  function end(success, message) {
    if (ended) return;
    ended = true;
    status.textContent = message;
    target.disabled = true;
    reportCompletion(success);
  }

  /**
   * Updates the game state on each animation frame.
   */
  function tick() {
    if (ended) return;
    const elapsed = performance.now() - startTime;
    const left = Math.max(0, roundDurationMs - elapsed);
    status.textContent = 'Time left: ' + (left / 1000).toFixed(1) + 's';

    if (left <= 0) {
      end(false, 'Too slow. You lose.');
      return;
    }

    requestAnimationFrame(tick);
  }

  /**
   * Starts the game by initializing variables and setting up event listeners.
   */
  function start() {
    const difficulty = getDifficultyScale();

    ended = false;
    target.disabled = false;
    startTime = performance.now();
    roundDurationMs = Math.max(
      2000,
      Math.round(baseDurationMs * difficulty.timeMultiplier)
    );

    target.addEventListener('click', function onTargetClick() {
      target.removeEventListener('click', onTargetClick);
      end(true, 'You win!');
    });

    tick();
  }

  start();
})();
