const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..','dist');const base='https://www.emailflow.uk';
const locations=[...fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const titles=new Set(),descriptions=new Set();
assert.equal(new Set(locations).size,locations.length,'Sitemap must not repeat URLs');
assert.ok(!locations.includes(base+'/klaviyo-agency/'),'Retired Klaviyo service must not be in the sitemap');
for(const url of locations){
 const f=new URL(url).pathname.slice(1)+'index.html',s=fs.readFileSync(path.join(root,f),'utf8');
 const title=s.match(/<title>(.*?)<\/title>/)?.[1];assert.ok(title,`${f}: title`);assert.ok(!titles.has(title),`${f}: duplicate title`);titles.add(title);
 const description=s.match(/name="description" content="([^"]*)"/)?.[1];
 assert.ok(description&&description.trim(),`${f}: non-empty description`);
 assert.ok(!descriptions.has(description),`${f}: duplicate description`);descriptions.add(description);
 assert.equal((s.match(/rel="canonical"/g)||[]).length,1,`${f}: one canonical`);
 assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(s),`${f}: canonical page accidentally noindexed`);
 assert.ok(s.includes('<html lang="en">'),`${f}: document language`);
 assert.ok(s.includes('property="og:site_name" content="EmailFlow"'),`${f}: consistent brand name`);
 const ids=[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,`${f}: duplicate HTML IDs`);
 assert.equal((s.match(/<h1\b/g)||[]).length,1,`${f}: one H1`);
 assert.equal(s.match(/rel="canonical" href="([^"]+)"/)?.[1],url,`${f}: canonical`);
 for(const tag of ['name="description"','property="og:image"','name="twitter:image"','max-image-preview:large'])assert.ok(s.includes(tag),`${f}: ${tag}`);
 const schemas=[...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 const organization=schemas.find(o=>o['@type']==='Organization');
 assert.ok(!/klaviyo/i.test(organization?.description||''),`${f}: agency specializes in Omnisend only`);
 assert.ok(!/href="(?:https:\/\/www\.emailflow\.uk)?\/klaviyo-agency\//.test(s),`${f}: link to retired service`);
 if(!f.startsWith('blog/'))assert.ok(!/klaviyo/i.test(s),`${f}: non-blog page must not offer Klaviyo`);
 assert.equal(organization?.['@id'],base+'/#organization',`${f}: organization entity`);
 assert.equal(organization?.logo?.url,base+'/assets/logo.png',`${f}: full-size organization logo`);
 for(const o of schemas.filter(o=>o['@type']==='BlogPosting')){
  const h1=s.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]*>/g,'');
  const normalized=value=>value.replace(/&amp;/g,'&').replace(/&quot;/g,'\"').replace(/[\"“”’']/g,'').replace(/\s+/g,' ').trim().toLowerCase();
  assert.equal(normalized(o.headline),normalized(h1),`${f}: article headline must match visible H1`);
 }
 for(const m of s.matchAll(/(?:href|src)="([^"]+)"/g)){
  const h=m[1];if(/^(mailto:|tel:|data:|javascript:)/.test(h))continue;
  const u=new URL(h,url);if(u.origin!==base)continue;
  const p=decodeURIComponent(u.pathname),dest=path.join(root,p)+(p.endsWith('/')?'index.html':'');
  assert.ok(fs.existsSync(dest),`${f}: missing ${h}`);
  if(u.hash&&fs.statSync(dest).isFile()&&dest.endsWith('.html')){const target=fs.readFileSync(dest,'utf8');assert.ok(target.includes('id="'+decodeURIComponent(u.hash.slice(1))+'"'),`${f}: missing anchor ${h}`);}
 }
}
for(const privatePath of ['docs','scripts','tests','server.js','api','.env.example','package.json'])assert.ok(!fs.existsSync(path.join(root,privatePath)),`${privatePath} leaked into public output`);
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.equal((home.match(/class="seo-faq"/g)||[]).length,6);
assert.ok(!home.includes('+20%<br>revenue'));assert.ok(!home.includes('Trusted by 50+'));
const logo=fs.readFileSync(path.join(root,'assets/logo.png'));
assert.ok(!fs.existsSync(path.join(root,'klaviyo-agency')),'Retired service must not have public static output');
assert.equal(logo.readUInt32BE(16),256,'Organization logo width');assert.equal(logo.readUInt32BE(20),256,'Organization logo height');
const preview=fs.readFileSync(path.join(root,'assets/social-preview.png'));
assert.equal(preview.readUInt32BE(16),1200,'Social preview width');assert.equal(preview.readUInt32BE(20),630,'Social preview height');
console.log(`SEO checks passed for ${locations.length} pages: unique titles/descriptions, canonical/index rules, entity branding, article headlines, image dimensions, links, anchors, static FAQs and public output boundaries.`);
