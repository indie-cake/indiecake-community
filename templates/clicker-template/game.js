(function () {
  const tapButton = document.getElementById('tap');
  const goal = document.getElementById('goal');
  const status = document.getElementById('status');

  const baseNeeded = 15;
  const baseDurationMs = 6000;
  let needed = baseNeeded;
  let durationMs = baseDurationMs;
  let taps = 0;
  let ended = false;
  let startedAt = 0;

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
   * Ends the game and reports the result to the Indie Cake engine.
   * @param {boolean} success - Whether the player succeeded or not.
   * @param {string} text - The text to display in the status element.
   */
  function end(success, text) {
    if (ended) return;
    ended = true;
    tapButton.disabled = true;
    status.textContent = text;
    reportCompletion(success);
  }

  /**
   * The main game loop that checks the elapsed time and determines if the player has won or lost.
   * This function uses requestAnimationFrame for smooth updates.
   */
  function loop() {
    if (ended) return;
    const elapsed = performance.now() - startedAt;
    if (elapsed >= durationMs) {
      end(
        taps >= needed,
        taps >= needed ? 'Win! You hit the target.' : 'Lose! Not enough taps.'
      );
      return;
    }
    requestAnimationFrame(loop);
  }

  /**
   * Starts the game by initializing variables, setting up the UI, and starting the main loop.
   */
  function start() {
    const difficulty = getDifficultyScale();

    durationMs = Math.max(
      2500,
      Math.round(baseDurationMs * difficulty.timeMultiplier)
    );
    needed = Math.max(8, Math.round(baseNeeded * difficulty.speedMultiplier));

    taps = 0;
    ended = false;
    startedAt = performance.now();
    goal.textContent =
      'Reach ' +
      needed +
      ' taps in ' +
      (durationMs / 1000).toFixed(1) +
      ' seconds.';
    tapButton.disabled = false;
    status.textContent = 'Taps: 0/' + needed;

    tapButton.addEventListener('click', function onTap() {
      if (ended) {
        tapButton.removeEventListener('click', onTap);
        return;
      }

      taps += 1;
      status.textContent = 'Taps: ' + taps + '/' + needed;
      if (taps >= needed) {
        tapButton.removeEventListener('click', onTap);
        end(true, 'Win! You hit the target.');
      }
    });

    loop();
  }

  start();
})();
