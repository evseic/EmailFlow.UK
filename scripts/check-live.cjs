const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const base = new URL(process.argv[2] || 'https://www.emailflow.uk/');
const staticOnly = process.argv.includes('--static-only');
const origin = 'https://www.emailflow.uk';
const sourceRoot = path.resolve(__dirname, '..');
const paths = [...fs.readFileSync(path.join(sourceRoot, 'sitemap.xml'), 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
async function request(route, options = {}) {
  return fetch(new URL(route, base), { signal: AbortSignal.timeout(20000), ...options });
}
(async () => {
  for (let offset = 0; offset < paths.length; offset += 4) {
    await Promise.all(paths.slice(offset, offset + 4).map(async route => {
      const res = await request(route);
      assert.equal(res.status, 200, `${route}: HTTP status`);
      assert.ok(!(res.headers.get('x-robots-tag') || '').includes('noindex'), `${route}: response noindex`);
      const html = await res.text();
      const local = fs.readFileSync(path.join(sourceRoot, route, 'index.html'), 'utf8');
      assert.equal(html.match(/<title>(.*?)<\/title>/)?.[1], local.match(/<title>(.*?)<\/title>/)?.[1], `${route}: expected release title`);
      assert.equal(html.match(/rel="canonical" href="([^"]+)"/)?.[1], origin + route, `${route}: canonical`);
      assert.ok(html.includes('/assets/analytics.js'), `${route}: analytics integration`);
      assert.ok(html.includes('/assets/logo.png'), `${route}: organization logo`);
      if (!route.startsWith('/blog/')) assert.ok(!/klaviyo/i.test(html), `${route}: Omnisend-only release`);
    }));
  }
  const retired = await request('/klaviyo-agency/', { redirect: 'manual' });
  assert.equal(retired.status, 301, 'Retired service permanent redirect');
  assert.equal(new URL(retired.headers.get('location'), base).pathname, '/omnisend-agency/', 'Retired service redirect destination');
  const sitemap = await request('/sitemap.xml');
  assert.equal(sitemap.status, 200, 'Sitemap status');
  const xml = await sitemap.text();
  assert.equal([...xml.matchAll(/<loc>/g)].length, paths.length, 'Sitemap page count');
  assert.ok(!xml.includes(origin + '/klaviyo-agency/'), 'Retired service excluded from sitemap');
  const missing = await request('/release-check-missing-page/');
  assert.equal(missing.status, 404, 'Real 404 for missing pages');
  for (const asset of ['/assets/social-preview.png', '/assets/logo.png', '/assets/analytics.js', '/assets/vercel-analytics.mjs']) {
    const res = await request(asset);
    assert.equal(res.status, 200, `${asset}: asset status`);
    assert.ok(!res.headers.get('content-type')?.includes('text/html'), `${asset}: must not return an HTML fallback`);
  }
  for (const privateFile of ['/package.json', '/server.js', '/docs/IMPLEMENTATION-STATUS.md']) {
    assert.equal((await request(privateFile)).status, 404, `${privateFile}: source/private output excluded`);
  }
  if (!staticOnly) {
    const invalid = await request('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '', email: '' }) });
    assert.equal(invalid.status, 400, 'Deployed API rejects invalid enquiry without contacting destinations');
    assert.equal((await invalid.json()).success, false, 'Deployed API failure response');
    const analytics = await request('/_vercel/insights/script.js');
    assert.equal(analytics.status, 200, 'Enabled Vercel analytics script');
    assert.ok(!analytics.headers.get('content-type')?.includes('text/html'), 'Analytics script must not return HTML');
  }
  console.log(`Release smoke checks passed: ${paths.length} pages, redirect, sitemap, assets, 404s and output boundaries${staticOnly ? ' (static-only)' : ', plus API validation and analytics availability'}.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
