/* ════════ helpers ════════ */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = n => '£' + Math.round(n).toLocaleString('en-GB');

/* ════════ live inbox simulation ════════ */
const FLOW_ICONS = {
  welcome: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3l2.5 5.5L20 10l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1.5L12 3z" stroke-linejoin="round"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2l2.4 11h10.2l2-8H6.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  post: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 8l9 6 9-6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  camp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 11l18-7-7 18-2.5-7.5L3 11z" stroke-linejoin="round"/></svg>',
  sub: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0" stroke-linecap="round"/></svg>'
};

const EVENTS = [
  { ic: 'cart', t: 'Abandoned cart recovered', s: 'Reminder email → order', amt: () => 40 + Math.random() * 110 },
  { ic: 'welcome', t: 'Welcome series · email 2', s: 'New subscriber → first purchase', amt: () => 25 + Math.random() * 70 },
  { ic: 'camp', t: 'Weekly campaign sent', s: 'Promo email · 4,821 recipients', amt: () => 120 + Math.random() * 260 },
  { ic: 'post', t: 'Post-purchase flow', s: 'Cross-sell offer → extra order', amt: () => 30 + Math.random() * 90 },
  { ic: 'sub', t: 'New subscriber', s: 'Pop-up form · -10% code sent', amt: null },
  { ic: 'cart', t: 'Abandoned cart recovered', s: '2nd reminder with a discount → order', amt: () => 55 + Math.random() * 140 },
  { ic: 'camp', t: 'Segmented campaign', s: 'VIP customers · repeat purchases', amt: () => 90 + Math.random() * 220 },
  { ic: 'post', t: 'Review request', s: 'Customer left a 5★ review', amt: null },
  { ic: 'welcome', t: 'Welcome series · email 1', s: 'Welcome + bestsellers guide', amt: () => 20 + Math.random() * 50 }
];

let revTotal = 0, evIdx = 0;
const list = $('#inboxList'), sumEl = $('#revSum');

function pushMail(animated = true) {
  if (!list) return;
  const e = EVENTS[evIdx++ % EVENTS.length];
  const amt = e.amt ? e.amt() : null;
  const li = document.createElement('li');
  li.className = 'mail' + (animated && !reduced ? ' in' : '');
  li.innerHTML = `<span class="ic">${FLOW_ICONS[e.ic]}</span>
    <span><span class="t">${e.t}</span><br><span class="s">${e.s}</span></span>
    <span class="amt${amt ? '' : ' neutral'}">${amt ? '+' + fmt(amt) : '✓'}</span>`;
  list.prepend(li);
  while (list.children.length > 5) list.lastElementChild.remove();
  if (amt) { revTotal += amt; animateSum(); }
}

let sumAnim;
function animateSum() {
  if (!sumEl) return;
  if (reduced) { sumEl.textContent = fmt(revTotal); return; }
  cancelAnimationFrame(sumAnim);
  const from = parseFloat(sumEl.dataset.v || 0), to = revTotal, t0 = performance.now();
  const step = t => {
    const p = Math.min(1, (t - t0) / 600), e = 1 - Math.pow(1 - p, 3);
    const v = from + (to - from) * e;
    sumEl.textContent = fmt(v);
    sumEl.dataset.v = v;
    if (p < 1) sumAnim = requestAnimationFrame(step);
  };
  sumAnim = requestAnimationFrame(step);
}

for (let i = 0; i < 4; i++) pushMail(false);

if (!reduced) {
  let inboxTimer;
  const tick = () => { pushMail(); inboxTimer = setTimeout(tick, 2600 + Math.random() * 1800); };
  inboxTimer = setTimeout(tick, 1400);
  const inboxEl = $('.inbox');
  if (inboxEl) {
    inboxEl.addEventListener('mouseenter', () => clearTimeout(inboxTimer));
    inboxEl.addEventListener('mouseleave', () => { clearTimeout(inboxTimer); inboxTimer = setTimeout(tick, 1200); });
  }
}

/* ════════ ROI calculator ════════ */
const range = $('#calcRange');
function calc() {
  if (!range) return;
  const v = +range.value;
  if ($('#calcRev')) $('#calcRev').textContent = fmt(v);
  if ($('#calcMo')) $('#calcMo').textContent = fmt(v * .2) + '–' + fmt(v * .3).replace('€', '');
  if ($('#calcYr')) $('#calcYr').textContent = fmt(v * .2 * 12) + '+';
}
if (range) {
  range.addEventListener('input', calc);
  calc();
}

/* ════════ 7-Day Horizontal Timeline Stepper ════════ */
const TIMELINE_STEPS = [
  {
    num: '1',
    day: 'DAY 1',
    title: 'Audit & strategy',
    blurb: 'Within 24 h we show you where you are losing revenue and map out the exact plan.',
    items: [
      'Full email channel audit',
      'Deliverability check',
      'Custom strategy and clear plan'
    ]
  },
  {
    num: '2',
    day: 'DAY 2',
    title: 'Technical foundation',
    blurb: 'Your emails will reach the inbox, not the spam folder.',
    items: [
      'Omnisend integration with your store',
      'Email deliverability check and fixes',
      'Sender reputation setup — so emails stay out of spam'
    ]
  },
  {
    num: '3-4',
    day: 'DAY 3–4',
    title: 'Contacts & flow building',
    blurb: 'The retention automations get built and styled.',
    items: [
      'Signup forms setup',
      'Automated email creation (welcome series, abandoned cart reminders, post-purchase emails)',
      'Personalized brand templates'
    ]
  },
  {
    num: '5-6',
    day: 'DAY 5–6',
    title: 'Launch & segmentation',
    blurb: 'The system starts earning automatically — 24/7.',
    items: [
      'Flows activated and tested',
      'Dynamic behavior-based segmentation',
      'System testing & QA'
    ]
  },
  {
    num: '7',
    day: 'DAY 7',
    title: 'Launch & monitoring',
    blurb: 'The system is fully active and starts generating revenue.',
    items: [
      'Launch of all retention automations',
      'Activation of live results dashboard',
      'First reports and results tracking'
    ]
  }
];

let currentTimelineStep = 0;

function renderTimelineStep(idx) {
  currentTimelineStep = idx;
  const s = TIMELINE_STEPS[idx];
  
  $$('.t-node').forEach((node, i) => {
    node.classList.toggle('active', i === idx);
  });

  const numEl = $('#tCardNum');
  const dayEl = $('#tCardDay');
  const titleEl = $('#tCardTitle');
  const blurbEl = $('#tCardBlurb');
  const listEl = $('#tCardList');

  if (numEl) numEl.textContent = s.num;
  if (dayEl) dayEl.textContent = s.day;
  if (titleEl) titleEl.textContent = s.title;
  if (blurbEl) blurbEl.textContent = s.blurb;
  if (listEl) {
    listEl.innerHTML = s.items.map(it => `
      <li>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16695F" stroke-width="2.5">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>${it}</span>
      </li>
    `).join('');
  }
}

$$('.t-node').forEach(node => {
  node.addEventListener('click', () => {
    const idx = parseInt(node.dataset.step, 10);
    renderTimelineStep(idx);
  });
});

const tPrev = $('#tPrev');
const tNext = $('#tNext');

if (tPrev) {
  tPrev.addEventListener('click', () => {
    const nextIdx = (currentTimelineStep - 1 + TIMELINE_STEPS.length) % TIMELINE_STEPS.length;
    renderTimelineStep(nextIdx);
  });
}

if (tNext) {
  tNext.addEventListener('click', () => {
    const nextIdx = (currentTimelineStep + 1) % TIMELINE_STEPS.length;
    renderTimelineStep(nextIdx);
  });
}

renderTimelineStep(0);

/* ════════ count-up stats ════════ */
function countUp(el) {
  const to = +el.dataset.count;
  if (reduced) { el.textContent = to; return; }
  const t0 = performance.now();
  const step = t => {
    const p = Math.min(1, (t - t0) / 1300), e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(to * e);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const cObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { countUp(e.target); cObs.unobserve(e.target); }
}), { rootMargin: '-40px' });

$$('[data-count]').forEach(el => cObs.observe(el));

/* ════════ reveal on scroll ════════ */
const rObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('vis'); rObs.unobserve(e.target); }
}), { rootMargin: '-60px' });

$$('.reveal').forEach(el => rObs.observe(el));

/* ════════ quiz funnel ════════ */
const REVENUE_Q = 'Monthly revenue';
const DQ_OPTION = 'Under £10,000';

const QUESTIONS = [
  { title: REVENUE_Q, sub: 'Roughly what is your average monthly revenue?', opts: [DQ_OPTION, '£10,000 – 20,000', '£20,000 – 50,000', '£50,000+'] },
  { title: 'Email marketing maturity', sub: 'How are you using email marketing in your business right now?', opts: ['We send campaigns and automated emails are running', 'We occasionally send a newsletter / promo, but no real automations', 'We have a list but barely use it', 'We are not doing email marketing yet'] },
  { title: 'List size', sub: 'Roughly how big is your email list?', opts: ['1-500', '500-5,000', '5,000-20,000', '20,000+'] },
  { title: 'Biggest challenge', sub: 'What is your biggest challenge with email marketing right now?', opts: ['Not enough time / resources', 'Low engagement (opens, clicks)', 'No automated flows', 'No clear strategy (what to send, and to whom)'] }
];

const shell = $('#quizShell');
let currentQ = 0, answers = {}, contactInfo = { name: '', email: '', phone: '', website: '' }, touched = {}, isSubmitting = false;
const arrowSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function getValidationErrors() {
  const errors = {};
  const n = contactInfo.name.trim();
  if (!n) errors.name = 'This field is required'; else if (n.length < 2) errors.name = 'Name is too short';
  const em = contactInfo.email.trim();
  if (!em) errors.email = 'This field is required'; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) errors.email = 'Invalid email format';
  const digits = contactInfo.phone.replace(/[^\d]/g, '');
  if (!contactInfo.phone.trim()) errors.phone = 'This field is required'; else if (digits.length < 8) errors.phone = 'Number is too short';
  const w = contactInfo.website.trim();
  if (!w) errors.website = 'This field is required'; else if (!/\.[a-zA-Z]{2,}/.test(w)) errors.website = 'Enter a domain (e.g. yourstore.com)';
  return errors;
}

function stepHead(stepNum, title, sub) {
  return `<div class="quiz-progress"><i style="width:${Math.round(stepNum / 5 * 100)}%"></i></div>
    <div class="mono" style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-40);font-weight:600;margin-bottom:10px;text-align:center">Step ${stepNum} of 5</div>
    <div class="q-title" style="text-align:center">${title}</div>
    ${sub ? `<div class="q-sub" style="text-align:center">${sub}</div>` : '<div style="height:18px"></div>'}`;
}

function renderQuiz() {
  if (!shell) return;
  const q = QUESTIONS[currentQ];
  shell.innerHTML = `${stepHead(currentQ + 1, q.title, q.sub)}
    <div class="quiz-step">
      <div class="q-opts">${q.opts.map(o => `<button class="q-opt" data-v="${o}">${o} ${arrowSvg}</button>`).join('')}</div>
      ${currentQ > 0 ? '<button class="q-back" id="qBack">← Go back</button>' : ''}
    </div>`;

  $$('#quizShell .q-opt').forEach(b => b.addEventListener('click', () => {
    answers[q.title] = b.dataset.v;
    if (q.title === REVENUE_Q && b.dataset.v === DQ_OPTION) { renderDQ(); return; }
    if (currentQ < QUESTIONS.length - 1) { currentQ++; renderQuiz(); }
    else renderForm();
  }));

  const qb = $('#qBack');
  if (qb) qb.addEventListener('click', () => { currentQ--; renderQuiz(); });
}

function renderDQ() {
  shell.innerHTML = `<div class="quiz-step success-box">
    <div class="big-ic" style="background:var(--bg);border:1px solid var(--line);color:var(--ink-60)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 16c1-1.5 2.4-2.2 4-2.2s3 .7 4 2.2"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/></svg>
    </div>
    <div class="q-title">Thanks for your interest!</div>
    <p class="q-sub" style="max-width:46ch;margin:10px auto 6px">Right now we only work with businesses whose monthly revenue exceeds £10,000. At your stage, an investment in email marketing may simply not pay off yet.</p>
    <p style="color:var(--ink-40);font-size:13.5px;font-weight:500;max-width:46ch;margin:0 auto 22px">Keep growing — and once you reach that milestone, come back. We will help you turn your list into revenue.</p>
    <button class="btn btn-ghost" id="qRestart">Start over</button></div>`;
  $('#qRestart').addEventListener('click', () => { answers = {}; currentQ = 0; renderQuiz(); });
}

function renderForm() {
  shell.innerHTML = `${stepHead(5, 'Contact details', '')}
  <div class="quiz-step">
    <form id="leadForm" novalidate style="max-width:440px;margin:0 auto">
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="field" data-f="name"><label for="fName">Full name</label><input id="fName" type="text" placeholder="John Smith" autocomplete="name"><div class="err"></div></div>
        <div class="field" data-f="email"><label for="fEmail">Email</label><input id="fEmail" type="email" placeholder="name@yourbusiness.com" autocomplete="email"><div class="err"></div></div>
        <div class="field" data-f="phone"><label for="fPhone">Phone number</label><input id="fPhone" type="tel" placeholder="+1 234 567 8900" autocomplete="tel"><div class="err"></div></div>
        <div class="field" data-f="website"><label for="fWeb">Website</label><input id="fWeb" type="text" placeholder="your-store.com"><div class="err"></div></div>
      </div>
      <p id="submitErr" style="display:none;color:var(--stamp);font-size:13px;font-weight:600;margin-top:14px;text-align:center;background:rgba(216,80,43,.08);border:1px solid rgba(216,80,43,.25);border-radius:12px;padding:11px"></p>
      <button class="btn btn-primary" type="submit" id="leadSubmit" style="width:100%;justify-content:space-between;margin-top:22px"><span>Book Consultation</span> <span class="arrow">${arrowSvg.replace('viewBox', 'width="13" height="13" viewBox')}</span></button>
    </form>
    <button class="q-back" id="qBack">← Go back</button>
  </div>`;

  $('#qBack').addEventListener('click', () => { currentQ = QUESTIONS.length - 1; renderQuiz(); });

  const fields = { name: '#fName', email: '#fEmail', phone: '#fPhone', website: '#fWeb' };
  Object.entries(fields).forEach(([k, sel]) => { if ($(sel)) $(sel).value = contactInfo[k]; });

  let prevPhone = contactInfo.phone;
  $('#fPhone').addEventListener('input', e => {
    if (/^[0-9+\s]*$/.test(e.target.value)) { prevPhone = e.target.value; }
    else { e.target.value = prevPhone; }
    contactInfo.phone = e.target.value;
    if (touched.phone) paintErrors();
  });

  ['name', 'email', 'website'].forEach(k => {
    $(fields[k]).addEventListener('input', e => { contactInfo[k] = e.target.value; if (touched[k]) paintErrors(); });
  });

  Object.entries(fields).forEach(([k, sel]) => {
    $(sel).addEventListener('blur', () => { touched[k] = true; paintErrors(); });
  });

  function paintErrors() {
    const errs = getValidationErrors();
    $$('#leadForm .field').forEach(el => {
      const k = el.dataset.f, show = touched[k] && errs[k];
      el.classList.toggle('invalid', !!show);
      el.querySelector('.err').textContent = show ? errs[k] : '';
    });
    return errs;
  }

  $('#leadForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (isSubmitting) return;
    touched = { name: true, email: true, phone: true, website: true };
    const errs = paintErrors();
    const errEl = $('#submitErr');
    if (Object.keys(errs).length) {
      errEl.style.display = 'block';
      errEl.textContent = 'Please check the fields marked in red.';
      return;
    }
    errEl.style.display = 'none';

    isSubmitting = true;
    const btn = $('#leadSubmitBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Sending... <span class="spin"></span>';
    }

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone,
          website: contactInfo.website,
          answers
        })
      });
    } catch (err) {
      console.warn('Form API submit fallback:', err);
    } finally {
      isSubmitting = false;
      renderComplete();
    }
  });
}

function renderComplete() {
  shell.innerHTML = `<div class="quiz-progress"><i style="width:100%"></i></div>
  <div class="quiz-step success-box">
    <div class="big-ic" style="background:var(--teal);color:#fff">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <div class="q-title">Consultation Request Confirmed!</div>
    <p class="q-sub" style="max-width:46ch;margin:10px auto 22px">Thank you! We have received your answers and contact details. Our strategy team will reach out within 24 hours.</p>
    <a class="btn btn-primary" href="#top">Back to top <span class="arrow">${arrowSvg.replace('viewBox', 'width="13" height="13" viewBox')}</span></a>
  </div>`;
}

if (shell) renderQuiz();

/* ════════ FAQ ════════ */
const FAQS = [
  { q: 'How quickly will I see results?', a: 'The first results show up within 2-4 weeks — once the core automated flows go live (welcome series, abandoned cart, post-purchase). A stable +20-30% revenue lift from the email channel is typically reached within 60-90 days, as campaigns and segmentation gain momentum.' },
  { q: 'Which platforms do you work with?', a: 'Omnisend & Klaviyo' },
  { q: 'Does this work for smaller businesses or only big ones?', a: 'Monthly revenue among our clients ranges from £10,000 to £500,000+. For smaller stores, email often delivers the highest ROI — the fundamentals just need to be set up properly. We only turn away businesses whose monthly revenue is still under £10,000 — at that stage, the investment in email simply would not pay off.' },
  { q: 'Do I need a big email list already?', a: 'No. If your list is small — or you do not have one at all — the first step is signup forms and pop-ups. Within 30-60 days the list typically grows 3-5x. We work with everything from zero-contact lists to 50,000+ contact databases.' },
  { q: 'What do I get for the service?', a: 'Full management of your email channel: audit, strategy, 5+ automated flows built, regular campaigns (8 per month), copywriting, design, A/B testing, segmentation, deliverability monitoring and reporting. No extra invoices — everything is included.' },
  { q: 'Is this only for online stores?', a: 'E-commerce is our core focus, but we also work successfully with service businesses (agencies, consulting, courses, B2B SaaS). Only the strategic emphasis differs — where an online store automates purchase flows, a service business uses email for lead nurturing and client retention.' },
  { q: 'How long does it take to launch?', a: 'Audit and strategy — 12-24 hours after the first call. Core automated flows — 5 business days, with the first campaign launching within 2-3 weeks. The full foundation is live within the first month; the months after that are about growth, optimization and rolling out new campaigns.' }
];

const faqWrap = $('#faqList');
if (faqWrap) {
  FAQS.forEach((f, i) => {
    const item = document.createElement('div');
    item.className = 'faq-item' + (i === 0 ? ' open' : '');
    item.innerHTML = `<button class="faq-q" aria-expanded="${i === 0}" aria-controls="faq-a-${i}">${f.q}
      <span class="pl"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span></button>
      <div class="faq-a" id="faq-a-${i}"><p>${f.a}</p></div>`;
    faqWrap.appendChild(item);
  });

  function syncFaqHeights() {
    $$('.faq-item').forEach(it => {
      const a = it.querySelector('.faq-a');
      if (a) a.style.maxHeight = it.classList.contains('open') ? a.scrollHeight + 'px' : '0';
    });
  }

  faqWrap.addEventListener('click', e => {
    const btn = e.target.closest('.faq-q'); if (!btn) return;
    const item = btn.parentElement, wasOpen = item.classList.contains('open');
    $$('.faq-item').forEach(it => { it.classList.remove('open'); it.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); });
    if (!wasOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    syncFaqHeights();
  });
  syncFaqHeights();
}

/* ════════ mobile menu ════════ */
const menuBtn = $('#menuBtn'), mobileNav = $('#mobileNav'), menuIco = $('#menuIco');
if (menuBtn && mobileNav && menuIco) {
  const ICONS = { open: '<path d="M4 7h16M4 12h16M4 17h16"/>', close: '<path d="M6 6l12 12M6 18L18 6"/>' };
  const setMenu = open => {
    mobileNav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuIco.innerHTML = open ? ICONS.close : ICONS.open;
  };
  menuBtn.addEventListener('click', () => setMenu(!mobileNav.classList.contains('open')));
  $$('#mobileNav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
}

/* ════════ scrollspy ════════ */
(function () {
  const map = { 'how-it-works': null, 'calculator': null, 'tracking': null, 'articles': null, 'faq': null };
  Object.keys(map).forEach(id => { map[id] = $$(`.nav-links a[href="#${id}"]`); });
  const spy = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      $$('.nav-links a').forEach(a => a.classList.remove('active'));
      (map[e.target.id] || []).forEach(a => a.classList.add('active'));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  Object.keys(map).forEach(id => { const s = document.getElementById(id); if (s) spy.observe(s); });
})();

/* ════════ calculator -> quiz jump ════════ */
const calcCta = $('#calcCta');
if (calcCta && range) {
  calcCta.addEventListener('click', () => {
    const v = +range.value;
    const bucket = v > 50000 ? '€50,000+' : (v > 20000 ? '€20,000 – 50,000' : '€10,000 – 20,000');
    answers[REVENUE_Q] = bucket;
    currentQ = 1;
    renderQuiz();
  });
}

/* ════════ scroll progress + inbox tilt ════════ */
const sb = $('#scrollbar');
addEventListener('scroll', () => {
  if (!sb) return;
  const h = document.documentElement;
  sb.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
}, { passive: true });

if (!reduced && matchMedia('(pointer:fine)').matches) {
  const tw = $('#tiltWrap'), box = $('.inbox');
  if (tw && box) {
    tw.addEventListener('mousemove', e => {
      const r = tw.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      box.style.transform = `rotateY(${x * 7}deg) rotateX(${-y * 6}deg)`;
    });
    tw.addEventListener('mouseleave', () => { box.style.transform = 'rotateY(0) rotateX(0)'; });
  }
}

/* ════════ micro-viz ════════ */
(function () {
  const dotsSvg = document.querySelector('.viz-dots svg');
  if (dotsSvg) {
    let s = '';
    const COLS = 8, ROWS = 4, GAP = 19;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      const filled = i < 28;
      const last = i >= 24 && i < 28;
      const fill = last ? '#16695F' : (filled ? '#A9C5DA' : '#E3ECE8');
      s += '<circle class="fz-pop" cx="' + (6 + c * GAP) + '" cy="' + (6 + r * GAP) + '" r="5" fill="' + fill + '" style="animation-delay:' + (i * 28) + 'ms"/>';
    }
    dotsSvg.innerHTML = s;
  }

  const cal = document.querySelector('.fz-cal .cal-cells');
  if (cal) {
    const CAMPAIGN = [2, 5, 9, 13, 16, 20];
    let s = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) {
      const i = r * 7 + c, x = 9 + c * 15.5, y = 27 + r * 13;
      const hot = CAMPAIGN.includes(i);
      s += '<rect class="fz-pop" x="' + x + '" y="' + y + '" width="11" height="9" rx="2.5" fill="' + (hot ? (i % 2 ? '#7FB89F' : '#16695F') : '#EBF2EF') + '" style="animation-delay:' + (120 + i * 32) + 'ms"/>';
    }
    cal.innerHTML = s;
  }

  const vObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('run'); vObs.unobserve(e.target); }
  }), { rootMargin: '-70px' });
  $$('.viz').forEach(v => vObs.observe(v));

  $$('.feat,.stat').forEach(card => card.addEventListener('mouseenter', () => {
    const v = card.querySelector('.viz'); if (!v || !v.classList.contains('run')) return;
    v.classList.remove('run'); void v.offsetWidth; v.classList.add('run');
  }));
})();

/* ════════ glow + ambient aurora ════════ */
if (!reduced && matchMedia('(pointer:fine)').matches) {
  $$('.feat-grid,.price-right,.calc-panel,.track-detail,.quiz-shell,.stats,.faq-item').forEach(el => el.classList.add('glow'));
  document.addEventListener('mousemove', e => {
    $$('.glow').forEach(el => {
      const r = el.getBoundingClientRect();
      if (e.clientX > r.left - 80 && e.clientX < r.right + 80 && e.clientY > r.top - 80 && e.clientY < r.bottom + 80) {
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }
    });
  }, { passive: true });

  const aurora = document.createElement('div'); aurora.id = 'aurora';
  document.body.appendChild(aurora);
  let ax = innerWidth * .6, ay = innerHeight * .4, tx = ax, ty = ay, auroraOn = false;
  document.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    if (!auroraOn) { auroraOn = true; ax = tx; ay = ty; aurora.classList.add('on'); }
  }, { passive: true });

  (function drift() {
    ax += (tx - ax) * .045; ay += (ty - ay) * .045;
    aurora.style.transform = 'translate(' + (ax - 350) + 'px,' + (ay - 350) + 'px)';
    requestAnimationFrame(drift);
  })();
}

/* ════════ Results Carousel Slider ════════ */
(function () {
  const track = document.getElementById('rgTrack');
  const dotsWrap = document.getElementById('rgDots');
  const prev = document.getElementById('rgPrev');
  const next = document.getElementById('rgNext');
  if (!track || !dotsWrap) return;

  const slides = [...track.children];

  slides.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Result ' + (i + 1));
    b.addEventListener('click', () => scrollToIdx(i));
    dotsWrap.appendChild(b);
  });
  const dots = [...dotsWrap.children];

  function scrollToIdx(i) {
    const s = slides[i];
    if (!s) return;
    track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.clientWidth) / 2, behavior: 'smooth' });
  }

  function activeIdx() {
    const c = track.scrollLeft + track.clientWidth / 2;
    let idx = 0, best = Infinity;
    slides.forEach((s, i) => {
      const sc = s.offsetLeft + s.clientWidth / 2;
      const d = Math.abs(sc - c);
      if (d < best) { best = d; idx = i; }
    });
    return idx;
  }

  function syncDots() {
    const idx = activeIdx();
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  let raf;
  track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(syncDots); }, { passive: true });
  if (prev) prev.addEventListener('click', () => scrollToIdx(Math.max(0, activeIdx() - 1)));
  if (next) next.addEventListener('click', () => scrollToIdx(Math.min(slides.length - 1, activeIdx() + 1)));

  syncDots();
})();
