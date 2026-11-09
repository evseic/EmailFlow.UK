// A dedicated request event; never changes the visitor's marketing subscription.
const { randomUUID, createHash } = require('node:crypto');
const attempts = new Map();
const allowedOrigins = new Set(['https://www.emailflow.uk', 'https://emailflow.uk', 'http://localhost:3000', 'http://127.0.0.1:3000']);
module.exports = async function guide(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ success: false }); }
  if (!allowedOrigins.has(req.headers?.origin)) return res.status(403).json({ success: false });
  if (!/^application\/json(?:;|$)/i.test(req.headers?.['content-type'] || '')) return res.status(415).json({ success: false });
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return res.status(400).json({ success: false }); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) || !['en','ar'].includes(body.language) || body.deliveryRequested !== true || (body.company != null && body.company !== '') || (body.source != null && (typeof body.source !== 'string' || !/^\/(?!\/)[^?#\s]{0,300}$/.test(body.source)))) return res.status(400).json({ success: false });
  if (!process.env.OMNISEND_API_KEY || process.env.OMNISEND_GUIDE_READY !== 'true') return res.status(503).json({ success: false });
  const now = Date.now();
  for (const [k,v] of attempts) if (now-v > 600000) attempts.delete(k);
  const email = body.email.trim();
  const hash = createHash('sha256').update(email.toLowerCase()).digest('hex');
  if (attempts.has(hash)) { res.setHeader('Retry-After','600'); return res.status(429).json({ success:false }); }
  if (attempts.size >= 5000) return res.status(429).json({success:false});
  attempts.set(hash,now);
  const language = body.language;
  try {
    const response = await fetch('https://api.omnisend.com/api/events', {
      method:'POST', headers:{'Content-Type':'application/json','Authorization':'Omnisend-API-Key '+process.env.OMNISEND_API_KEY,'Omnisend-Version':'2026-03-15'},
      body:JSON.stringify({eventName:'emailflow_guide_requested_'+language,origin:'api',eventID:randomUUID(),contact:{email},properties:{language,guideURL:'https://www.emailflow.uk/guides/email-automation-'+language+'.html',sourcePath:body.source || '/',deliveryRequested:true}}),
      signal:AbortSignal.timeout(10000)
    });
    if (response.status !== 202) { attempts.delete(hash); return res.status(502).json({success:false}); }
    return res.status(202).json({success:true});
  } catch { /* Do not retry automatically: real-time events are not deduplicated by Omnisend. */ return res.status(502).json({success:false}); }
};
