(function () {
  const engine = window.IndieCake;
  const defaultWidth = 320;
  const defaultHeight = 240;
  const fallbackCanvas = document.getElementById('gameCanvas');
  const fallbackContext =
    fallbackCanvas && typeof fallbackCanvas.getContext === 'function'
      ? fallbackCanvas.getContext('2d')
      : null;

  if (!engine) {
    console.error('Indie Cake engine not available');
    return;
  }

  let gameStarted = false;
  let gameCompleted = false;
  let lastMoveTime = 0;
  let moveInterval = 1000;
  let buttonSize = 150;
  let moveSpeed = 800;

  const button = {
    x: 160,
    y: 120,
    size: buttonSize,
    targetX: 160,
    targetY: 120,
    moving: false,
  };

  /**
   * Retrieves the current difficulty level from the Indie Cake engine or falls back to a default value.
   */
  function getDifficultyLevel() {
    let level = 2;

    try {
      // Check if the Indie Cake engine is available and has the difficulty methods
      if (
        engine.difficulty &&
        typeof engine.difficulty.getLevel === 'function'
      ) {
        level = engine.difficulty.getLevel();
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
      if (engine.difficulty) {
        // Retrieve timeMultiplier and speedMultiplier from the Indie Cake engine if available
        // Otherwise, use the fallback values based on the current level
        const timeMultiplier =
          typeof engine.difficulty.getTimeMultiplier === 'function'
            ? engine.difficulty.getTimeMultiplier()
            : fallback[level].timeMultiplier;
        const speedMultiplier =
          typeof engine.difficulty.getSpeedMultiplier === 'function'
            ? engine.difficulty.getSpeedMultiplier()
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
    if (success && typeof engine.win === 'function') {
      engine.win();
      return;
    }

    if (!success && typeof engine.lose === 'function') {
      engine.lose();
      return;
    }

    if (typeof engine.complete === 'function') {
      engine.complete(success);
    }
  }

  /**
   * Returns the graphics subsystem when the required methods exist.
   */
  function getGraphics() {
    if (!engine.graphics || typeof engine.graphics.getContext !== 'function') {
      return null;
    }

    return engine.graphics;
  }

  /**
   * Returns the active graphics context when available.
   */
  function getGraphicsContext() {
    const graphics = getGraphics();
    if (graphics) {
      return graphics.getContext();
    }

    return fallbackContext;
  }

  /**
   * Safely gets the current canvas width.
   */
  function getCanvasWidth() {
    if (fallbackCanvas && fallbackCanvas.width) {
      return fallbackCanvas.width;
    }

    const graphics = getGraphics();
    if (!graphics || typeof graphics.getWidth !== 'function') {
      return defaultWidth;
    }
    return graphics.getWidth();
  }

  /**
   * Safely gets the current canvas height.
   */
  function getCanvasHeight() {
    if (fallbackCanvas && fallbackCanvas.height) {
      return fallbackCanvas.height;
    }

    const graphics = getGraphics();
    if (!graphics || typeof graphics.getHeight !== 'function') {
      return defaultHeight;
    }
    return graphics.getHeight();
  }

  /**
   * Computes distance using the engine helper when available, with a Math fallback.
   * @param {number} x1 - First point x coordinate.
   * @param {number} y1 - First point y coordinate.
   * @param {number} x2 - Second point x coordinate.
   * @param {number} y2 - Second point y coordinate.
   */
  function getDistance(x1, y1, x2, y2) {
    if (typeof engine.distance === 'function') {
      return engine.distance(x1, y1, x2, y2);
    }

    return Math.hypot(x2 - x1, y2 - y1);
  }

  /**
   * Initializes the Indie Cake engine.
   */
  function initEngine() {
    if (typeof engine.init !== 'function') {
      console.error('Indie Cake engine init() not available');
      return false;
    }

    try {
      engine.init({
        canvas: 'gameCanvas',
        debug: false,
      });

      return true;
    } catch (error) {
      console.error('Indie Cake engine failed to initialize', error);
      return false;
    }
  }

  /**
   * Locks the movement tuning for the selected difficulty.
   */
  function initDifficulty() {
    const difficulty = getDifficultyScale();

    if (difficulty.level <= 1) {
      moveInterval = 1200;
      buttonSize = 180;
      moveSpeed = 800;
    } else if (difficulty.level === 2) {
      moveInterval = 1000;
      buttonSize = 150;
      moveSpeed = 800;
    } else if (difficulty.level === 3) {
      moveInterval = 900;
      buttonSize = 130;
      moveSpeed = 600;
    } else {
      moveInterval = 700;
      buttonSize = 100;
      moveSpeed = 400;
    }

    moveInterval = Math.max(300, moveInterval / difficulty.speedMultiplier);
    moveSpeed = Math.max(200, moveSpeed / difficulty.speedMultiplier);
    button.size = buttonSize;
  }

  /**
   * Draws the stylized circular button.
   * @param {number} x - Button center x coordinate.
   * @param {number} y - Button center y coordinate.
   * @param {number} size - Button diameter.
   */
  function drawStyledButton(x, y, size) {
    const context = getGraphicsContext();
    if (!context) {
      return;
    }

    const radius = size / 2;
    const shadowGradient = context.createRadialGradient(
      x,
      y + 15,
      0,
      x,
      y + 15,
      radius + 20
    );
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = shadowGradient;
    context.beginPath();
    context.arc(x, y + 15, radius + 20, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = 'rgb(183, 9, 0)';
    context.beginPath();
    context.arc(x, y + 8, radius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = 'red';
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();

    const highlightGradient = context.createLinearGradient(x, y - radius, x, y);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = highlightGradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();

    const fontSize = Math.max(14, size / 8);
    context.font = `800 ${fontSize}px Avenir, Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillStyle = 'rgba(122, 17, 8, 0.8)';
    context.fillText('CLICK ME', x, y + 3);

    context.fillStyle = 'white';
    context.fillText('CLICK ME', x, y);
  }

  /**
   * Draws the gradient background.
   */
  function drawBackground() {
    const context = getGraphicsContext();
    if (!context) {
      return;
    }

    const width = getCanvasWidth();
    const height = getCanvasHeight();
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#3a86ff');
    gradient.addColorStop(1, '#8338ec');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }

  /**
   * Sets a new random target position for the button.
   */
  function moveButton() {
    const padding = button.size / 2;
    const maxX = getCanvasWidth() - padding * 2;
    const maxY = getCanvasHeight() - padding * 2;

    button.targetX = padding + Math.random() * maxX;
    button.targetY = padding + Math.random() * maxY;
    button.moving = true;
    lastMoveTime = Date.now();
  }

  /**
   * Updates the moving button each frame.
   * @param {number} currentTime - Current timestamp in ms.
   */
  function updateButton(currentTime) {
    if (button.moving) {
      const timeSinceStart = currentTime - lastMoveTime;
      const progress = Math.min(1, timeSinceStart / moveSpeed);
      const easeProgress = progress * progress * (3 - 2 * progress);

      button.x = button.x + (button.targetX - button.x) * easeProgress;
      button.y = button.y + (button.targetY - button.y) * easeProgress;

      const distance = Math.sqrt(
        (button.targetX - button.x) ** 2 + (button.targetY - button.y) ** 2
      );

      if (distance < 5 || progress >= 1) {
        button.x = button.targetX;
        button.y = button.targetY;
        button.moving = false;
      }
    }

    if (!button.moving && currentTime - lastMoveTime > moveInterval) {
      moveButton();
    }
  }

  /**
   * Handles a click or touch attempt on the moving button.
   * @param {number} clickX - Input x coordinate.
   * @param {number} clickY - Input y coordinate.
   */
  function handlePress(clickX, clickY) {
    if (!gameStarted || gameCompleted) {
      return;
    }

    const distance = getDistance(clickX, clickY, button.x, button.y);
    if (distance > button.size / 2) {
      return;
    }

    gameCompleted = true;
    gameStarted = false;
    reportCompletion(true);
  }

  /**
   * Registers engine input handlers.
   */
  function bindInput() {
    if (!engine.input || typeof engine.input.addEventListener !== 'function') {
      console.error('Indie Cake input system not available');
      return;
    }

    engine.input.addEventListener((event) => {
      if (event.type === 'mousedown') {
        handlePress(event.x, event.y);
        return;
      }

      if (
        event.type === 'touchstart' &&
        event.touches &&
        event.touches.length > 0
      ) {
        const touch = event.touches[0];
        handlePress(touch.x, touch.y);
      }
    });
  }

  /**
   * Main game loop that updates the button and renders the scene.
   */
  function gameLoop() {
    const currentTime = Date.now();

    if (gameStarted && !gameCompleted) {
      updateButton(currentTime);
    }

    const graphics = getGraphics();
    if (graphics && typeof graphics.clear === 'function') {
      graphics.clear();
    } else if (fallbackContext) {
      fallbackContext.clearRect(0, 0, getCanvasWidth(), getCanvasHeight());
    }

    drawBackground();
    drawStyledButton(button.x, button.y, button.size);

    requestAnimationFrame(gameLoop);
  }

  /**
   * Starts a fresh game session.
   */
  function start() {
    gameStarted = true;
    gameCompleted = false;
    moveButton();
    gameLoop();
  }

  /**
   * Initializes the game by setting up the engine, difficulty, input, and starting the game loop.
   */
  function init() {
    if (!initEngine()) {
      return;
    }

    initDifficulty();
    bindInput();
    start();
  }

  init();
})();
