import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const port = Number(process.env.PORT || 8000);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2'
};

const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return;
  }
  try {
    const url = new URL(request.url, 'http://localhost');
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const filename = path.resolve(root, relative);
    if (filename !== root && !filename.startsWith(root + path.sep)) {
      response.writeHead(403); response.end('Forbidden'); return;
    }
    const info = await fs.stat(filename);
    if (!info.isFile()) { response.writeHead(404); response.end('Not found'); return; }
    const body = await fs.readFile(filename);
    response.writeHead(200, {
      'Content-Type': types[path.extname(filename)] || 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? 'Port ' + port + ' is in use. Close the other preview, or set PORT to a different number.' : error.message);
  process.exit(1);
});
server.listen(port, '127.0.0.1', () => {
  console.log('\nBombay Palace local preview: http://localhost:' + port + '\n');
  console.log('Refresh your browser after editing. Press Ctrl+C to stop.\n');
});
