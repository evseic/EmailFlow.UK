const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'dist');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.zip': 'application/zip', '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
if (!fs.existsSync(root)) throw new Error('Run npm run build before starting the preview server.');
http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end('Bad request'); return; }
  if (pathname === '/api/guide') {
    if (req.method !== 'POST') { res.writeHead(405, { Allow:'POST' }); res.end(); return; }
    res.writeHead(503, { 'Content-Type':'application/json', 'Cache-Control':'no-store' });
    res.end(JSON.stringify({success:false,preview:true})); return;
  }
  const emailPreview = pathname.match(/^\/__preview\/guide-email\/(en|ar)\/$/);
  if (emailPreview) {
    res.writeHead(200, { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store' });
    res.end(fs.readFileSync(path.join(__dirname,'emails','guide-'+emailPreview[1]+'.html'))); return;
  }
  if (pathname === '/klaviyo-agency' || pathname.startsWith('/klaviyo-agency/')) {
    res.writeHead(301, { Location: '/omnisend-agency/' }); res.end(); return;
  }
  if (pathname.endsWith('/index.html')) { res.writeHead(308, { Location: pathname.replace(/index\.html$/, '') }); res.end(); return; }
  let file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(404); res.end('Not found'); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!pathname.endsWith('/')) { res.writeHead(308, { Location: pathname + '/' }); res.end(); return; }
    file = path.join(file, 'index.html');
  }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); res.end('<!doctype html><html lang="en"><title>Page not found | EmailFlow</title><h1>Page not found</h1><a href="/">Return to EmailFlow</a></html>'); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(Number(process.env.PORT) || 3000, '127.0.0.1', () => console.log('EmailFlow preview: http://localhost:' + (process.env.PORT || 3000)));
