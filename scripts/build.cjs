const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const pages = [...fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(match => new URL(match[1]).pathname.replace(/^\//, '') + 'index.html');
const publicFiles = [...pages, 'styles.css', 'script.js', 'robots.txt', 'sitemap.xml', 'llms.txt', 'privacy/index.html',
  'favicon.png', 'favicon.svg', 'apple-touch-icon.png', 'assets/social-preview.png', 'assets/logo.png', 'assets/omnisend-product-certified.png', 'assets/nick-ceo.png', 'assets/email-flow-audit-checklist.txt', 'assets/analytics.js', 'assets/arabic.css', 'assets/guide.css', 'assets/guide.js', 'assets/guide-playbook.css', 'assets/guide-playbook.js', 'guides/email-templates-en.zip', 'guides/email-templates-ar.zip', ...fs.readdirSync(path.join(root, 'assets/guide-visuals')).map(name => 'assets/guide-visuals/' + name), 'assets/guide-homeware-dark.jpg', 'assets/guide-editorial-dark.jpg', 'assets/guide-packaging-dark.jpg', 'guides/email-automation-en.html', 'guides/email-automation-ar.html', 'assets/email-marketing-overview.mp4'];
// Only generated public output is replaced. Source, drafts and user images are untouched.
fs.rmSync(output, { recursive: true, force: true });
for (const relative of publicFiles) {
  const destination = path.join(output, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, relative), destination);
}


fs.copyFileSync(path.join(root, 'node_modules/@vercel/analytics/dist/index.mjs'), path.join(output, 'assets/vercel-analytics.mjs'));

console.log(`Built ${pages.length} pages and ${publicFiles.length - pages.length + 1} public assets into dist/`);
