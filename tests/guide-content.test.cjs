const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
for(const language of ['en','ar'])test('complete '+language+' guide preserves all content and working local targets',()=>{
 const s=fs.readFileSync(path.join(__dirname,'../guides/email-automation-'+language+'.html'),'utf8');
 assert.equal((s.match(/<h1\b/g)||[]).length,1);assert.equal((s.match(/class="flow"/g)||[]).length,7);assert.equal((s.match(/<details class="guide-disclosure"/g)||[]).length,14);assert.equal((s.match(/<section class="template"/g)||[]).length,10);
 assert(s.includes('id="results"'));assert(s.includes('id="optimisation"'));assert(s.includes(language==='ar'?'مغادرة الموقع قبل مشاهدة منتج':'Site abandonment'));assert(s.includes('lang="'+language+'"'));if(language==='ar')assert(s.includes('dir="rtl"'));
 const ids=[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 for(const m of s.matchAll(/(?:href|src)="([^"]+)"/g)){const target=m[1];if(target.startsWith('#'))assert(ids.includes(target.slice(1)),target);else if(target.startsWith('/')){const clean=target.split('#')[0];assert(fs.existsSync(path.join(__dirname,'..',clean)+(clean.endsWith('/')?'index.html':'')),target);}}
 const packagePath=path.join(__dirname,'../guides/email-templates-'+language+'.zip');assert.equal(fs.readFileSync(packagePath).readUInt32LE(0),0x04034b50);
 const illustrationNames=fs.readdirSync(path.join(__dirname,'../assets/guide-visuals')).filter(p=>p.startsWith('flow-')&&p.endsWith('-'+language+'.svg'));assert.equal(illustrationNames.length,7);
});
