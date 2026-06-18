(function () {
  const state = {
    games: [],
    filteredGames: [],
    activeGame: null,
  };

  const gameList = document.getElementById('gameList');
  const frameContainer = document.getElementById('frameContainer');
  const gameTitle = document.getElementById('gameTitle');
  const gameDescription = document.getElementById('gameDescription');
  const gameMeta = document.getElementById('gameMeta');
  const resultBadge = document.getElementById('resultBadge');
  const resultDetails = document.getElementById('resultDetails');
  const search = document.getElementById('search');
  const reloadButton = document.getElementById('reload');
  const sourceMode = document.getElementById('sourceMode');
  const replayButton = document.getElementById('replay');
  const nextGameButton = document.getElementById('nextGame');
  const autoplayNextToggle = document.getElementById('autoplayNext');
  const difficultyInfo = document.getElementById('difficultyInfo');
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');

  const DIFFICULTY_SETTINGS = {
    1: { name: 'Casual', description: 'Take your time, learn the ropes' },
    2: { name: 'Standard', description: 'Normal difficulty, balanced challenge' },
    3: { name: 'Challenging', description: 'Less time, more pressure' },
    4: { name: 'Expert', description: 'Quick reflexes required' },
    5: { name: 'Legendary', description: 'Master level precision' },
  };

  let activeIframeWindow = null;
  let autoplayNextTimer = null;
  const AUTOPLAY_STORAGE_KEY = 'indiecake-sandbox-autoplay-next';
  const DIFFICULTY_STORAGE_KEY = 'indiecake-sandbox-difficulty';
  let currentDifficulty = 1;

  function normalizePath(path, mode) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path) || /^file:\/\//i.test(path)) {
      return path;
    }
    if (path.startsWith('/')) {
      return path;
    }
    if (path.startsWith('../')) {
      return path;
    }
    if (path.startsWith('./')) {
      return `/${path.slice(2)}`;
    }
    return `/${path}`;
  }

  function resolveGameUrl(entry, mode) {
    return normalizePath(entry.url || entry.playUrl || entry.path || '', mode);
  }

  function resolveMetadataUrl(entry, mode) {
    return normalizePath(entry.metadata || entry.metadataUrl || '', mode);
  }

  async function enrichEntryWithMetadata(entry, mode) {
    const normalizedEntry = {
      ...entry,
      url: resolveGameUrl(entry, mode),
      metadataUrl: resolveMetadataUrl(entry, mode),
    };

    if (!normalizedEntry.metadataUrl) {
      return normalizedEntry;
    }

    try {
      const response = await fetch(normalizedEntry.metadataUrl, { cache: 'no-store' });
      if (!response.ok) {
        return normalizedEntry;
      }

      const metadata = await response.json();
      if (!metadata || typeof metadata !== 'object') {
        return normalizedEntry;
      }

      return {
        ...metadata,
        ...normalizedEntry,
      };
    } catch (error) {
      console.warn('Failed to load metadata for entry:', normalizedEntry.title || normalizedEntry.url, error);
      return normalizedEntry;
    }
  }

  function renderMeta(entry) {
    const parts = [];
    if (entry.author) parts.push(`Author: ${entry.author}`);
    if (entry.jam) parts.push(`Jam: ${entry.jam}`);
    if (entry.engineVersion) parts.push(`Engine: ${entry.engineVersion}`);
    if (entry.durationSeconds) parts.push(`Target: ${entry.durationSeconds}s`);
    if (Array.isArray(entry.tags) && entry.tags.length > 0) {
      parts.push(`Tags: ${entry.tags.join(', ')}`);
    }
    return parts;
  }

  function resetRoundResult() {
    if (!resultBadge || !resultDetails) return;
    resultBadge.className = 'result-badge';
    resultBadge.textContent = 'Awaiting result';
    resultDetails.textContent = 'Launch a game and complete a round to see win/lose status here.';
  }

  function updateRoundResult(data) {
    if (!resultBadge || !resultDetails) return;

    const success = Boolean(data && data.success);
    const result = (data && data.result) || {};
    const score = typeof result.score === 'number' ? result.score : null;
    const timeElapsed = typeof result.timeElapsed === 'number' ? result.timeElapsed : null;

    resultBadge.className = success ? 'result-badge win' : 'result-badge lose';
    resultBadge.textContent = success ? 'Win' : 'Lose';

    const details = [];
    if (score !== null) {
      details.push(`Score: ${score}`);
    }
    if (timeElapsed !== null) {
      details.push(`Time: ${timeElapsed.toFixed(2)}s`);
    }

    if (details.length === 0) {
      resultDetails.textContent = success
        ? 'Round ended with a successful completion.'
        : 'Round ended in failure. Retry and beat your best run.';
      return;
    }

    resultDetails.textContent = details.join(' | ');
  }

  function parseMessageData(rawData) {
    if (!rawData) {
      return null;
    }

    if (typeof rawData === 'string') {
      try {
        return JSON.parse(rawData);
      } catch (error) {
        return null;
      }
    }

    if (typeof rawData === 'object') {
      return rawData;
    }

    return null;
  }

  function toGameCompletePayload(rawData) {
    const data = parseMessageData(rawData);
    if (!data) {
      return null;
    }

    if (data.type === 'game-complete') {
      return data;
    }

    if (data.type === 'indiecake-event' && data.event && data.event.type === 'game-complete') {
      return data.event;
    }

    if (data.eventType === 'game-complete') {
      return {
        type: 'game-complete',
        success: Boolean(data.success),
        result: data.result,
      };
    }

    return null;
  }

  function clearAutoplayTimer() {
    if (autoplayNextTimer) {
      clearTimeout(autoplayNextTimer);
      autoplayNextTimer = null;
    }
  }

  function isSameEntry(a, b) {
    if (!a || !b) {
      return false;
    }

    return (
      a === b ||
      (a.title === b.title && resolveGameUrl(a, sourceMode.value) === resolveGameUrl(b, sourceMode.value))
    );
  }

  function getActiveFilteredIndex() {
    if (!state.activeGame || state.filteredGames.length === 0) {
      return -1;
    }

    return state.filteredGames.findIndex((entry) => isSameEntry(entry, state.activeGame));
  }

  function replayActiveGame() {
    if (!state.activeGame) {
      return;
    }

    setActiveGame(state.activeGame);
  }

  function playNextGame() {
    if (state.filteredGames.length === 0) {
      return;
    }

    const currentIndex = getActiveFilteredIndex();
    const nextIndex = currentIndex < 0
      ? 0
      : (currentIndex + 1) % state.filteredGames.length;

    setActiveGame(state.filteredGames[nextIndex]);
  }

  function normalizeIframeIndieCakeApi(iframeWindow) {
    if (!iframeWindow || !iframeWindow.IndieCake) {
      return;
    }

    const candidate = iframeWindow.IndieCake;
    const hasDirectApi = typeof candidate.complete === 'function';
    if (hasDirectApi) {
      return;
    }

    const nestedApi =
      (candidate && candidate.IndieCake) ||
      (candidate && candidate.default);

    if (nestedApi && typeof nestedApi.complete === 'function') {
      iframeWindow.IndieCake = nestedApi;
    }
  }

  function setActiveGame(entry) {
    clearAutoplayTimer();
    state.activeGame = entry;
    activeIframeWindow = null;
    resetRoundResult();
    gameTitle.textContent = entry.title || 'Untitled Game';
    gameDescription.textContent = entry.description || entry.objective || 'No description provided.';

    gameMeta.innerHTML = '';
    renderMeta(entry).forEach((item) => {
      const pill = document.createElement('span');
      pill.className = 'pill';
      pill.textContent = item;
      gameMeta.appendChild(pill);
    });

    const mode = sourceMode.value;
    const gameUrl = resolveGameUrl(entry, mode);

    if (!gameUrl) {
      frameContainer.className = 'empty error';
      frameContainer.textContent = 'This entry does not define a playable URL.';
      return;
    }

    frameContainer.className = '';
    frameContainer.innerHTML = '';

    const iframeUrl = new URL(gameUrl, window.location.origin);
    iframeUrl.searchParams.set('indiecake-difficulty', String(currentDifficulty));

    const iframe = document.createElement('iframe');
    iframe.title = entry.title ? `Preview: ${entry.title}` : 'Preview game';
    iframe.loading = 'lazy';
    iframe.scrolling = 'no';
    iframe.src = iframeUrl.toString();
    iframe.addEventListener('load', function () {
      activeIframeWindow = iframe.contentWindow;
      normalizeIframeIndieCakeApi(activeIframeWindow);
    });
    frameContainer.appendChild(iframe);
  }

  function renderGames() {
    const query = search.value.trim().toLowerCase();
    state.filteredGames = state.games.filter((entry) => {
      if (!query) return true;
      const haystack = [
        entry.title,
        entry.author,
        entry.description,
        entry.objective,
        ...(entry.tags || []),
        entry.jam,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });

    gameList.innerHTML = '';

    if (state.filteredGames.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No games match your filter.';
      gameList.appendChild(empty);
      return;
    }

    state.filteredGames.forEach((entry) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'game-card';
      if (state.activeGame && isSameEntry(state.activeGame, entry)) {
        button.classList.add('active');
      }

      const title = document.createElement('strong');
      title.textContent = entry.title || 'Untitled Game';
      button.appendChild(title);

      const objective = document.createElement('span');
      objective.textContent = entry.objective || entry.description || 'No objective provided.';
      button.appendChild(objective);

      const url = document.createElement('small');
      url.textContent = resolveGameUrl(entry, sourceMode.value) || 'No URL';
      button.appendChild(url);

      button.addEventListener('click', () => setActiveGame(entry));
      gameList.appendChild(button);
    });

    if (!state.activeGame && state.filteredGames.length > 0) {
      setActiveGame(state.filteredGames[0]);
    }
  }

  async function loadIndex() {
    gameTitle.textContent = 'Loading games...';
    gameDescription.textContent = 'Fetching the local game index.';
    gameMeta.innerHTML = '';

    try {
      const response = await fetch('/game-index.json', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load game-index.json (${response.status})`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('game-index.json must contain an array of entries');
      }

      state.games = await Promise.all(
        data.map((entry) => enrichEntryWithMetadata(entry, sourceMode.value))
      );
      renderGames();

      if (state.filteredGames.length === 0) {
        gameTitle.textContent = 'No games in index';
        gameDescription.textContent = '';
        gameMeta.innerHTML = '';
        activeIframeWindow = null;
        resetRoundResult();
        frameContainer.className = 'empty';
        frameContainer.textContent = 'No games are available in the index.';
      }
    } catch (error) {
      gameList.innerHTML = '';
      frameContainer.className = 'empty error';
      frameContainer.textContent = String(error && error.message ? error.message : error);
      gameTitle.textContent = 'Unable to load games';
      gameDescription.textContent = 'Check that you are serving the repository from a local web server.';
      console.error(error);
    }
  }

  function setDifficulty(level) {
    currentDifficulty = Math.max(1, Math.min(5, Math.floor(level)));
    try {
      localStorage.setItem(DIFFICULTY_STORAGE_KEY, String(currentDifficulty));
    } catch (error) {
      // Ignore storage errors in restricted browser contexts.
    }

    difficultyButtons.forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.level, 10) === currentDifficulty);
    });

    const settings = DIFFICULTY_SETTINGS[currentDifficulty];
    if (difficultyInfo && settings) {
      difficultyInfo.innerHTML = `<strong>${settings.name}</strong><br/>${settings.description}`;
    }

    if (state.activeGame) {
      setActiveGame(state.activeGame);
    }
  }

  // Initialize difficulty from localStorage
  try {
    const saved = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
    if (saved) {
      currentDifficulty = Math.max(1, Math.min(5, Math.floor(parseInt(saved, 10))));
    }
  } catch (error) {
    // Ignore storage errors in restricted browser contexts.
  }

  // Set up difficulty button listeners
  difficultyButtons.forEach((btn) => {
    btn.classList.toggle('active', parseInt(btn.dataset.level, 10) === currentDifficulty);
    btn.addEventListener('click', () => {
      setDifficulty(parseInt(btn.dataset.level, 10));
    });
  });

  // Initialize difficulty info display
  const settings = DIFFICULTY_SETTINGS[currentDifficulty];
  if (difficultyInfo && settings) {
    difficultyInfo.innerHTML = `<strong>${settings.name}</strong><br/>${settings.description}`;
  }

  // Set up other event listeners
  search.addEventListener('input', renderGames);
  replayButton.addEventListener('click', replayActiveGame);
  nextGameButton.addEventListener('click', playNextGame);

  if (autoplayNextToggle) {
    try {
      autoplayNextToggle.checked = localStorage.getItem(AUTOPLAY_STORAGE_KEY) === '1';
    } catch (error) {
      // Ignore storage errors in restricted browser contexts.
    }

    autoplayNextToggle.addEventListener('change', () => {
      try {
        localStorage.setItem(AUTOPLAY_STORAGE_KEY, autoplayNextToggle.checked ? '1' : '0');
      } catch (error) {
        // Ignore storage errors in restricted browser contexts.
      }
    });
  }

  sourceMode.addEventListener('change', () => {
    state.games = state.games.map((entry) => ({
      ...entry,
      url: resolveGameUrl(entry, sourceMode.value),
      metadataUrl: resolveMetadataUrl(entry, sourceMode.value),
    }));
    renderGames();
    if (state.activeGame) {
      setActiveGame(state.activeGame);
    }
  });

  reloadButton.addEventListener('click', loadIndex);

  window.addEventListener('message', (event) => {
    if (!event) {
      return;
    }

    const payload = toGameCompletePayload(event.data);
    if (!payload) {
      return;
    }

    if (activeIframeWindow && event.source && event.source !== activeIframeWindow) {
      console.debug('Received game-complete from non-active iframe source; accepting payload.');
    }

    updateRoundResult(payload);

    if (autoplayNextToggle && autoplayNextToggle.checked && state.filteredGames.length > 1) {
      clearAutoplayTimer();
      autoplayNextTimer = setTimeout(() => {
        playNextGame();
      }, 1200);
    }
  });

  loadIndex();
})();
