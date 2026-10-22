import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
const base = process.env.BASE || '/';

let vite;
let template;
let render;

const apiOrigin = (() => {
  try {
    return process.env.VITE_API_URL ? new URL(process.env.VITE_API_URL).origin : '';
  } catch {
    return '';
  }
})();

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  ...(isProduction && {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      `connect-src 'self' ${apiOrigin} https://www.google.com/recaptcha/`.trim(),
      'frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/',
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  }),
};

const applySecurityHeaders = (res) => Object.entries(securityHeaders).forEach(([name, value]) => res.setHeader(name, value));

const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });
} else {
  template = await fs.readFile(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8');
  render = (await import('./dist/server/entry-server.js')).render;
}

const clientRoot = path.resolve(__dirname, 'dist/client');

async function serveStatic(req, res) {
  let filePath;

  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    filePath = path.resolve(clientRoot, decodeURIComponent(pathname).slice(1));
  } catch {
    return false;
  }

  if (filePath !== clientRoot && !filePath.startsWith(clientRoot + path.sep)) {
    return false;
  }

  try {
    const file = await fs.readFile(filePath);
    res.setHeader('Content-Type', contentTypes[path.extname(filePath)] || 'application/octet-stream');
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    res.end(file);
    return true;
  } catch {
    return false;
  }
}

async function renderPage(req, res) {
  try {
    const url = req.url.replace(base, '/');
    let html;
    let appHtml;

    if (!isProduction) {
      const rawTemplate = await fs.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
      html = await vite.transformIndexHtml(url, rawTemplate);
      ({ render } = await vite.ssrLoadModule('/src/entry-server.jsx'));
    } else {
      html = template;
    }

    appHtml = render(url);
    res.setHeader('Content-Type', 'text/html');
    res.end(html.replace('<!--ssr-outlet-->', appHtml));
  } catch (error) {
    vite?.ssrFixStacktrace(error);
    console.error(error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    // Stack traces are only shown while developing
    res.end(isProduction ? 'Something went wrong. Please try again.' : error.stack);
  }
}

createServer(async (req, res) => {
  applySecurityHeaders(res);

  // In development the Vite proxy needs POST and friends for /api; in production this server only serves pages
  if (isProduction && req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.end();
    return;
  }

  if (!isProduction) {
    vite.middlewares(req, res, () => renderPage(req, res));
    return;
  }

  if (await serveStatic(req, res)) return;
  renderPage(req, res);
}).listen(port, () => {
  console.log(`SSR server running at http://localhost:${port}`);
});
