const { test }=require('node:test');
const assert=require('node:assert/strict');
const path=require.resolve('../api/guide');
const env={OMNISEND_API_KEY:'unit-test-key',OMNISEND_GUIDE_READY:'true'};
const valid={email:'reader@example.test',language:'en',source:'/uae/',deliveryRequested:true,company:''};
async function run(body=valid,options={}){
 const previous={OMNISEND_API_KEY:process.env.OMNISEND_API_KEY,OMNISEND_GUIDE_READY:process.env.OMNISEND_GUIDE_READY};
 delete process.env.OMNISEND_API_KEY;delete process.env.OMNISEND_GUIDE_READY;Object.assign(process.env,options.env===undefined?env:options.env);
 const old=global.fetch,calls=[];global.fetch=async(url,init)=>{calls.push({url,init});if(options.reject)throw Error('private transport error');return {status:options.status||202};};
 if(!options.keepModule)delete require.cache[path];const handler=require(path);
 const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(data){this.data=data;return this;}};
 try{await handler({method:options.method||'POST',headers:{origin:'https://www.emailflow.uk','content-type':'application/json',...options.headers},body},res);return {res,calls};}
 finally{global.fetch=old;for(const [k,v]of Object.entries(previous)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
}
test('guide request requires an API key and a verified active workflow',async()=>{for(const setup of [{},{OMNISEND_API_KEY:'unit-test-key'}]){const {res,calls}=await run(valid,{env:setup});assert.equal(res.code,503);assert.equal(res.data.success,false);assert.equal(calls.length,0);}});
test('English event carries server-owned URL and never subscribes or overwrites preferences',async()=>{const {res,calls}=await run({...valid,email:' reader@example.test ',guideURL:'https://attacker.test'});assert.equal(res.code,202);assert.equal(res.data.success,true);const {url,init}=calls[0];assert.equal(url,'https://api.omnisend.com/api/events');assert.equal(init.headers['Omnisend-Version'],'2026-03-15');const data=JSON.parse(init.body);assert.equal(data.eventName,'emailflow_guide_requested_en');assert.equal(data.contact.email,'reader@example.test');assert.deepEqual(Object.keys(data.contact),['email']);assert.equal(data.properties.guideURL,'https://www.emailflow.uk/guides/email-automation-en.html');assert.equal(data.properties.deliveryRequested,true);});
test('Arabic requests select the Arabic event and guide',async()=>{const {calls}=await run({...valid,language:'ar'});const data=JSON.parse(calls[0].init.body);assert.equal(data.eventName,'emailflow_guide_requested_ar');assert.equal(data.properties.guideURL,'https://www.emailflow.uk/guides/email-automation-ar.html');});
test('invalid input and honeypots never reach Omnisend',async()=>{for(const body of [null,[],{},'{broken',{...valid,email:'bad'},{...valid,language:'lt'},{...valid,deliveryRequested:false},{...valid,company:'bot'},{...valid,source:'https://attacker.test'},{...valid,source:'//attacker.test'},{...valid,source:'/?email=private'}]){const {res,calls}=await run(body);assert.equal(res.code,400);assert.equal(calls.length,0);}});
test('unsupported method, origin and content type are rejected',async()=>{for(const options of [{method:'GET',code:405},{headers:{origin:'https://attacker.test'},code:403},{headers:{'content-type':'text/plain'},code:415}]){const {res,calls}=await run(valid,options);assert.equal(res.code,options.code);assert.equal(calls.length,0);}});
test('provider rejection never looks like delivery acceptance',async()=>{for(const status of [200,400,401,429,500]){const {res}=await run(valid,{status});assert.equal(res.code,502);assert.equal(res.data.success,false);}});
test('network failure does not retry or disclose upstream details',async()=>{const {res,calls}=await run(valid,{reject:true});assert.equal(res.code,502);assert.equal(calls.length,1);assert(!JSON.stringify(res.data).includes('private'));});
test('duplicate recipient requests are throttled on a warm instance',async()=>{await run(valid);const {res,calls}=await run({...valid,email:'READER@example.test'},{keepModule:true});assert.equal(res.code,429);assert.equal(calls.length,0);assert.equal(res.headers['Retry-After'],'600');});
