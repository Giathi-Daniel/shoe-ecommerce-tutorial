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

const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
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

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  const filePath = path.resolve(__dirname, 'dist/client', pathname.slice(1));

  if (!filePath.startsWith(path.resolve(__dirname, 'dist/client'))) {
    return false;
  }

  try {
    const file = await fs.readFile(filePath);
    res.setHeader('Content-Type', contentTypes[path.extname(filePath)] || 'application/octet-stream');
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
    res.statusCode = 500;
    res.end(error.stack);
  }
}

createServer(async (req, res) => {
  if (!isProduction) {
    vite.middlewares(req, res, () => renderPage(req, res));
    return;
  }

  if (await serveStatic(req, res)) return;
  renderPage(req, res);
}).listen(port, () => {
  console.log(`SSR server running at http://localhost:${port}`);
});
