(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 320;
  canvas.height = 240;

  // Game state
  let gameStarted = false;
  let gameCompleted = false;
  let success = false;
  let angle = 0;

  // Difficulty state
  const baseSpeed = 0.09;
  let gameSpeed = baseSpeed;
  let gameDifficultySettings = {
    level: 2,
    wedgeSize: Math.PI / 2,
    targetTolerance: Math.PI / 8,
  };

  // Asset state
  let whaleImage = null;

  // ─── Difficulty helpers ──────────────────────────────────────────────────

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

  // ─── Completion ──────────────────────────────────────────────────────────

  /**
   * Reports the completion status of the game to the Indie Cake engine.
   * @param {boolean} win - Whether the player succeeded or not.
   */
  function reportCompletion(win) {
    if (!window.IndieCake) return;
    if (win && typeof window.IndieCake.win === 'function') {
      window.IndieCake.win();
    } else if (!win && typeof window.IndieCake.lose === 'function') {
      window.IndieCake.lose();
    } else if (typeof window.IndieCake.complete === 'function') {
      window.IndieCake.complete(win);
    }
  }

  // ─── Initialization ──────────────────────────────────────────────────────

  /**
   * Reads difficulty from the engine and locks in wedge size and speed for the session.
   */
  function initDifficulty() {
    const difficulty = getDifficultyScale();

    // Adjust game speed based on the difficulty level
    gameSpeed = baseSpeed * difficulty.speedMultiplier;
    gameDifficultySettings.level = difficulty.level;

    // Adjust wedge size and target tolerance based on difficulty level
    if (difficulty.level <= 2) {
      gameDifficultySettings.wedgeSize = Math.PI / 2;
      gameDifficultySettings.targetTolerance = Math.PI / 8;
    } else {
      gameDifficultySettings.wedgeSize = Math.PI / 4;
      gameDifficultySettings.targetTolerance = Math.PI / 12;
    }
  }

  /**
   * Loads the whale image via IndieCake.assets, falling back to a plain Image if
   * the asset system is not available.
   * @returns {Promise<void>}
   */
  async function loadAssets() {
    try {
      if (window.IndieCake && window.IndieCake.assets) {
        const asset = await window.IndieCake.assets.loadAsset(
          'whale',
          './mr-whale.png',
          'image'
        );
        whaleImage = /** @type {HTMLImageElement} */ (asset.data);
      } else {
        // Fallback: load directly when the engine asset system is unavailable
        await new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            whaleImage = img;
            resolve();
          };
          img.onerror = resolve; // proceed without whale if missing
          img.src = './mr-whale.png';
        });
      }
    } catch (error) {
      // Non-fatal — the game runs without the whale sprite
      console.warn('Could not load whale image:', error);
    }
  }

  /**
   * Entry point: initializes difficulty and assets, then starts the game loop.
   */
  async function init() {
    initDifficulty();
    await loadAssets();
    start();
  }

  /**
   * Activates the game and kicks off the render loop.
   */
  function start() {
    gameStarted = true;
    gameLoop();
  }

  // ─── Drawing ─────────────────────────────────────────────────────────────

  /**
   * Draws a solid black circle with three concentric yellow target rings.
   */
  function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 1; i <= 3; i++) {
      ctx.strokeStyle = '#ff0';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, i * 33.33, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /**
   * Draws the rotating wedge (and whale sprite if loaded) at the given angle.
   * @param {number} angle - Current rotation angle in radians.
   */
  function drawWedge(angle) {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(
      0,
      0,
      100,
      -gameDifficultySettings.wedgeSize / 2,
      gameDifficultySettings.wedgeSize / 2
    );
    ctx.lineTo(0, 0);
    ctx.fill();

    // Draw the whale image if loaded, scaled with wedge size
    if (whaleImage) {
      const whaleDistance = 65;
      const whaleX = whaleDistance * Math.cos(0);
      const whaleY = whaleDistance * Math.sin(0);
      const wedgeWidthAtDistance =
        2 * whaleDistance * Math.sin(gameDifficultySettings.wedgeSize / 2);
      const whaleWidth = Math.min(250, wedgeWidthAtDistance * 0.9);
      ctx.drawImage(
        whaleImage,
        whaleX - whaleWidth / 2,
        whaleY - whaleWidth / 2,
        whaleWidth,
        whaleWidth
      );
    }

    ctx.restore();
  }

  /**
   * Draws the target arrow on the right side of the canvas.
   * @param {boolean} hit - Whether the last click was a hit (green) or miss (red).
   */
  function drawArrow(hit) {
    ctx.fillStyle = hit ? '#0f0' : '#f00';
    ctx.beginPath();
    ctx.moveTo(canvas.width - 30, canvas.height / 2 - 10);
    ctx.lineTo(canvas.width - 10, canvas.height / 2);
    ctx.lineTo(canvas.width - 30, canvas.height / 2 + 10);
    ctx.closePath();
    ctx.fill();
  }

  // ─── Game loop ───────────────────────────────────────────────────────────

  function gameLoop() {
    drawWheel();
    drawWedge(angle);
    drawArrow(success);
    if (gameStarted && !gameCompleted) {
      angle += gameSpeed;
    }
    requestAnimationFrame(gameLoop);
  }

  // ─── Input ───────────────────────────────────────────────────────────────

  canvas.addEventListener('click', () => {
    if (!gameStarted || gameCompleted) return;

    // Determine the current wedge center angle
    const wedgeCenter = angle % (Math.PI * 2);

    // Calculate the difference between the wedge center and the target angle (0 radians)
    let diff = Math.abs(wedgeCenter);
    diff = Math.min(diff, Math.abs(Math.PI * 2 - diff));

    gameCompleted = true;
    gameStarted = false;

    // Check if the click was within the target tolerance
    success = diff < gameDifficultySettings.targetTolerance;

    setTimeout(() => reportCompletion(success), 100);
  });

  // ─── Boot ────────────────────────────────────────────────────────────────

  init();
})();
