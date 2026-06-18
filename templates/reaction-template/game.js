(function () {
  const signal = document.getElementById('signal');
  const tap = document.getElementById('tap');
  const status = document.getElementById('status');

  const baseWaitMinMs = 1500;
  const baseWaitMaxMs = 3500;
  const baseFailMs = 6000;
  const baseReactionThresholdMs = 450;

  let ready = false;
  let ended = false;
  let goTime = 0;
  let goTimer = null;
  let failTimer = null;
  let reactionThresholdMs = baseReactionThresholdMs;

  /**
   * Retrieves the current difficulty level from the Indie Cake engine or a global variable.
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
    status.textContent = text;
    tap.disabled = true;
    if (goTimer) {
      clearTimeout(goTimer);
      goTimer = null;
    }
    if (failTimer) {
      clearTimeout(failTimer);
      failTimer = null;
    }
    reportCompletion(success);
  }

  /**
   * Starts the game by initializing variables, setting up the UI, and starting the main loop.
   */
  function start() {
    const difficulty = getDifficultyScale();

    // Adjust the wait times and reaction threshold based on the difficulty level
    const waitMinMs = Math.max(
      700,
      Math.round(baseWaitMinMs / difficulty.speedMultiplier)
    );
    const waitMaxMs = Math.max(
      waitMinMs + 300,
      Math.round(baseWaitMaxMs / difficulty.speedMultiplier)
    );
    const failMs = Math.max(
      2500,
      Math.round(baseFailMs * difficulty.timeMultiplier)
    );
    reactionThresholdMs = Math.max(
      250,
      Math.round(baseReactionThresholdMs * difficulty.timeMultiplier)
    );

    ready = false;
    ended = false;
    goTime = 0;
    tap.disabled = false;
    signal.textContent = 'WAIT';
    signal.style.background = '#334155';
    status.textContent = 'Wait for GO, then tap instantly.';

    const delay = waitMinMs + Math.random() * (waitMaxMs - waitMinMs);

    // Set a timer to signal "GO" after the random delay
    goTimer = setTimeout(function () {
      if (ended) return;
      ready = true;
      goTime = performance.now();
      signal.textContent = 'GO';
      signal.style.background = '#16a34a';
    }, delay);

    failTimer = setTimeout(function () {
      if (!ended) end(false, 'No tap detected. Lose.');
    }, failMs);

    tap.addEventListener('click', function onTap() {
      if (ended) {
        tap.removeEventListener('click', onTap);
        return;
      }
      if (!ready) {
        tap.removeEventListener('click', onTap);
        end(false, 'Too early. Lose.');
        return;
      }
      const reactionMs = performance.now() - goTime;
      tap.removeEventListener('click', onTap);
      if (reactionMs <= reactionThresholdMs) {
        end(true, 'Win! Reaction: ' + Math.round(reactionMs) + 'ms');
      } else {
        end(false, 'Lose. Reaction: ' + Math.round(reactionMs) + 'ms');
      }
    });
  }

  start();
})();
