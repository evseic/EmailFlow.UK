const { test } = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/submit');
const keys = ['SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID'];
async function run(body, options = {}) {
 const previous = Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 const oldFetch=global.fetch;const calls=[];
 for(const key of keys) delete process.env[key];
 Object.assign(process.env,options.env || {});
 global.fetch=async (url,init)=>{calls.push({url,init});if(options.reject)throw new Error('mock transport unavailable');return {ok:options.results ? options.results[calls.length-1] : options.ok!==false,text:async()=> 'private upstream detail'};};
 const res={code:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(data){this.data=data;return this;},end(){return this;}};
 try{await handler({method:options.method||'POST',body},res);return {res,calls};}
 finally{global.fetch=oldFetch;for(const key of keys){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}}
}
const contact={name:'Test Store',email:'test@example.com',answers:{Platform:'Omnisend'}};
test('no configured destination does not claim success',async()=>{const {res,calls}=await run(contact);assert.equal(res.code,503);assert.equal(res.data.success,false);assert.equal(calls.length,0);});
test('saved lead is acknowledged after actual successful storage',async()=>{const {res,calls}=await run(contact,{env:{SUPABASE_URL:'https://storage.example.test',SUPABASE_ANON_KEY:'mock-key'}});assert.equal(res.code,200);assert.equal(res.data.success,true);assert.equal(calls.length,1);assert.equal(JSON.parse(calls[0].init.body).email,contact.email);});
test('storage rejection produces failure without private upstream details',async()=>{const {res}=await run(contact,{ok:false,env:{SUPABASE_URL:'https://storage.example.test',SUPABASE_ANON_KEY:'mock-key'}});assert.equal(res.code,503);assert.ok(!JSON.stringify(res.data).includes('private upstream'));});
test('transport failure does not claim success',async()=>{const {res}=await run(contact,{reject:true,env:{SUPABASE_URL:'https://storage.example.test',SUPABASE_ANON_KEY:'mock-key'}});assert.equal(res.code,503);});
test('notification can accept request if database fails',async()=>{const {res,calls}=await run(contact,{results:[false,true],env:{SUPABASE_URL:'https://storage.example.test',SUPABASE_ANON_KEY:'mock-key',TELEGRAM_BOT_TOKEN:'mock-token',TELEGRAM_CHAT_ID:'mock-chat'}});assert.equal(res.data.success,true);assert.equal(calls.length,2);});
test('invalid contacts are rejected before any external request',async()=>{for(const body of [{email:'x'}, {...contact,email:'bad'}, {...contact,answers:[]},'{malformed']){const {res,calls}=await run(body);assert.equal(res.code,400);assert.equal(calls.length,0);}});
test('unsupported methods are rejected',async()=>{const {res,calls}=await run(contact,{method:'GET'});assert.equal(res.code,405);assert.equal(calls.length,0);});

test('surrounding whitespace is normalized before validation and storage',async()=>{
 const {res,calls}=await run({...contact,name:'  Test Store  ',email:'  test@example.com  '},{env:{SUPABASE_URL:'https://storage.example.test',SUPABASE_ANON_KEY:'mock-key'}});
 assert.equal(res.code,200);
 const stored=JSON.parse(calls[0].init.body);
 assert.equal(stored.name,'Test Store');
 assert.equal(stored.email,'test@example.com');
});
