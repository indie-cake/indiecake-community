const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.join(__dirname, '..');
const viewerDir = path.join(__dirname, 'public');
const startPort = Number(process.env.PORT || 4173);
const engineVersion = process.env.INDIECAKE_ENGINE_VERSION || 'latest';
const engineCdnUrl = `https://cdn.jsdelivr.net/npm/indiecake-engine@${engineVersion}/dist/indiecake-engine.iife.min.js`;

const sandboxDifficultyScript = `
  <script id="indiecake-sandbox-difficulty-script">
    (function () {
      function clampDifficulty(value) {
        return Math.max(1, Math.min(5, Math.floor(Number(value) || 1)));
      }

      function getDifficultyFromUrl() {
        try {
          const url = new URL(window.location.href);
          return clampDifficulty(url.searchParams.get('indiecake-difficulty'));
        } catch (error) {
          return 1;
        }
      }

      const selectedDifficulty = getDifficultyFromUrl();
      window.__indiecake_difficulty = selectedDifficulty;

      function normalizeEngineApi(candidate) {
        if (!candidate || typeof candidate !== 'object') {
          return null;
        }

        if (typeof candidate.init === 'function') {
          return candidate;
        }

        if (candidate.IndieCake && typeof candidate.IndieCake.init === 'function') {
          return candidate.IndieCake;
        }

        if (candidate.default && typeof candidate.default.init === 'function') {
          return candidate.default;
        }

        return null;
      }

      function applyDifficultyToEngine(candidate) {
        const engine = normalizeEngineApi(candidate) || candidate;
        if (
          !engine ||
          !engine.difficulty ||
          typeof engine.difficulty.setLevel !== 'function'
        ) {
          return false;
        }

        try {
          engine.difficulty.setLevel(selectedDifficulty);
          return true;
        } catch (error) {
          return false;
        }
      }

      function installEngineNormalizer() {
        const descriptor = Object.getOwnPropertyDescriptor(window, 'IndieCake');
        if (descriptor && descriptor.configurable === false) {
          applyDifficultyToEngine(window.IndieCake);
          return;
        }

        let assignedValue = window.IndieCake;

        Object.defineProperty(window, 'IndieCake', {
          configurable: true,
          enumerable: true,
          get: function () {
            const normalized = normalizeEngineApi(assignedValue);
            return normalized || assignedValue;
          },
          set: function (value) {
            const normalized = normalizeEngineApi(value);
            assignedValue = normalized || value;
            applyDifficultyToEngine(assignedValue);
          },
        });

        if (typeof assignedValue !== 'undefined') {
          window.IndieCake = assignedValue;
        } else {
          applyDifficultyToEngine(window.IndieCake);
        }
      }

      function getEngineApi() {
        return normalizeEngineApi(window.IndieCake) || window.IndieCake || null;
      }

      installEngineNormalizer();

      function applyDifficultyIfAvailable() {
        return applyDifficultyToEngine(getEngineApi());
      }

      applyDifficultyIfAvailable();

      const checkEngine = setInterval(function () {
        if (applyDifficultyIfAvailable()) {
          clearInterval(checkEngine);
        }
      }, 25);

      setTimeout(function () {
        clearInterval(checkEngine);
      }, 5000);

      document.addEventListener('DOMContentLoaded', function () {
        applyDifficultyIfAvailable();
      }, { once: true });

      window.addEventListener('load', function () {
        applyDifficultyIfAvailable();
      }, { once: true });
    })();
  </script>`;

const sandboxViewportStyle = `
  <style id="indiecake-sandbox-viewport-style">
    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
      overflow: hidden !important;
    }

    body {
      position: relative !important;
      min-width: 0 !important;
      min-height: 0 !important;
    }
    #indiecake-sandbox-scale-root {
      position: absolute;
      top: 50%;
      left: 50%;
      transform-origin: center center;
    }
  </style>`;

const sandboxViewportScript = `
  <script id="indiecake-sandbox-viewport-script">
    (function () {
      function isMovableNode(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return node.nodeType !== Node.COMMENT_NODE;
        }

        const tagName = node.tagName;
        const id = node.id || '';
        return tagName !== 'SCRIPT' && id !== 'indiecake-sandbox-scale-root' && id !== 'indiecake-sandbox-viewport-script';
      }

      function fitSandboxContent() {
        const body = document.body;
        if (!body) {
          return;
        }

        let scaleRoot = document.getElementById('indiecake-sandbox-scale-root');
        if (!scaleRoot) {
          scaleRoot = document.createElement('div');
          scaleRoot.id = 'indiecake-sandbox-scale-root';

          const movableNodes = Array.from(body.childNodes).filter(isMovableNode);

          movableNodes.forEach((node) => scaleRoot.appendChild(node));
          body.appendChild(scaleRoot);
        } else {
          Array.from(body.childNodes)
            .filter((node) => node !== scaleRoot && isMovableNode(node))
            .forEach((node) => scaleRoot.appendChild(node));
        }

        scaleRoot.style.transform = 'translate(-50%, -50%) scale(1)';

        const contentWidth = Math.max(scaleRoot.scrollWidth, scaleRoot.offsetWidth, scaleRoot.clientWidth);
        const contentHeight = Math.max(scaleRoot.scrollHeight, scaleRoot.offsetHeight, scaleRoot.clientHeight);

        if (!contentWidth || !contentHeight) {
          return;
        }

        const viewportWidth = window.innerWidth || document.documentElement.clientWidth || contentWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || contentHeight;
        const scale = Math.min(viewportWidth / contentWidth, viewportHeight / contentHeight, 1);

        scaleRoot.style.width = contentWidth + 'px';
        scaleRoot.style.height = contentHeight + 'px';
        scaleRoot.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fitSandboxContent, { once: true });
      } else {
        fitSandboxContent();
      }

      window.addEventListener('load', fitSandboxContent);
      window.addEventListener('resize', fitSandboxContent);

      if (typeof ResizeObserver !== 'undefined') {
        window.addEventListener('load', function () {
          const scaleRoot = document.getElementById('indiecake-sandbox-scale-root');
          if (!scaleRoot) {
            return;
          }

          const observer = new ResizeObserver(fitSandboxContent);
          observer.observe(scaleRoot);
        }, { once: true });
      }

      window.addEventListener('load', function () {
        const body = document.body;
        if (!body || typeof MutationObserver === 'undefined') {
          return;
        }

        const observer = new MutationObserver(function () {
          fitSandboxContent();
        });

        observer.observe(body, { childList: true, subtree: false });
      }, { once: true });
    })();
  </script>`;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function send(
  res,
  statusCode,
  body,
  contentType = 'text/plain; charset=utf-8'
) {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function shouldInjectEngine(requestPath, ext) {
  return ext === '.html' && /^\/(games|templates)\//.test(requestPath);
}

function injectSandboxSupport(html) {
  let updatedHtml = html;

  if (!/indiecake-sandbox-viewport-style/i.test(updatedHtml)) {
    if (/<\/head>/i.test(updatedHtml)) {
      updatedHtml = updatedHtml.replace(
        /<\/head>/i,
        `${sandboxViewportStyle}\n</head>`
      );
    } else {
      updatedHtml = `${sandboxViewportStyle}\n${updatedHtml}`;
    }
  }

  if (!/indiecake-sandbox-difficulty-script/i.test(updatedHtml)) {
    if (/<\/head>/i.test(updatedHtml)) {
      updatedHtml = updatedHtml.replace(
        /<\/head>/i,
        `${sandboxDifficultyScript}\n</head>`
      );
    } else if (/<body[^>]*>/i.test(updatedHtml)) {
      updatedHtml = updatedHtml.replace(
        /<body([^>]*)>/i,
        `<body$1>${sandboxDifficultyScript}`
      );
    } else {
      updatedHtml = `${sandboxDifficultyScript}\n${updatedHtml}`;
    }
  }

  if (
    !/cdn\.jsdelivr\.net\/npm\/indiecake-engine@/i.test(updatedHtml) &&
    !/window\.IndieCake/.test(updatedHtml)
  ) {
    const engineScriptTag = `\n  <script src="${engineCdnUrl}"><\/script>`;

    if (/<\/head>/i.test(updatedHtml)) {
      updatedHtml = updatedHtml.replace(
        /<\/head>/i,
        `${engineScriptTag}\n</head>`
      );
    } else if (/<body[^>]*>/i.test(updatedHtml)) {
      updatedHtml = updatedHtml.replace(
        /<body([^>]*)>/i,
        `<body$1>${engineScriptTag}`
      );
    } else {
      updatedHtml = `${engineScriptTag}\n${updatedHtml}`;
    }
  }

  if (!/indiecake-sandbox-viewport-script/i.test(updatedHtml)) {
    if (/<\/body>/i.test(updatedHtml)) {
      updatedHtml = updatedHtml.replace(
        /<\/body>/i,
        `${sandboxViewportScript}\n</body>`
      );
    } else {
      updatedHtml = `${updatedHtml}\n${sandboxViewportScript}`;
    }
  }

  return updatedHtml;
}

const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const relativePath =
    requestPath === '/' ? '/sandbox/public/index.html' : requestPath;
  const filePath = path.normalize(path.join(rootDir, relativePath));

  if (!filePath.startsWith(rootDir)) {
    send(res, 403, 'Forbidden');
    return;
  }

  const resolvedViewerPath = path.normalize(path.join(viewerDir, requestPath));
  const isViewerAsset =
    requestPath !== '/' &&
    resolvedViewerPath.startsWith(viewerDir) &&
    fs.existsSync(resolvedViewerPath) &&
    fs.statSync(resolvedViewerPath).isFile();
  const finalPath = isViewerAsset ? resolvedViewerPath : filePath;

  fs.readFile(finalPath, (error, data) => {
    if (error) {
      send(res, 404, 'Not Found');
      return;
    }

    const ext = path.extname(finalPath).toLowerCase();

    if (shouldInjectEngine(requestPath, ext)) {
      const html = data.toString('utf8');
      const injected = injectSandboxSupport(html);
      send(res, 200, injected, mimeTypes[ext] || 'application/octet-stream');
      return;
    }

    send(res, 200, data, mimeTypes[ext] || 'application/octet-stream');
  });
});

function listen(port) {
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      listen(port + 1);
      return;
    }

    throw error;
  });

  server.listen(port, () => {
    console.log(
      `Indie Cake community sandbox running at http://localhost:${port}`
    );
  });
}

listen(startPort);
