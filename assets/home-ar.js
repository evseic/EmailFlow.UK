/* ════════ helpers ════════ */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isUaeMarket = document.body.dataset.market === 'uae';
const managementFee = isUaeMarket ? 3930 : 800;
const fmt = n => (isUaeMarket ? 'درهم ' : '£') + Math.round(n).toLocaleString('en-GB');

/* Fetch the overview only when the visitor chooses to play it. */
const marketingVideo = $('#marketing-video');
const videoPlay = $('.video-play');
if (marketingVideo && videoPlay) {
  videoPlay.hidden = false;
  videoPlay.addEventListener('click', () => {
    videoPlay.hidden = true;
    marketingVideo.focus();
    marketingVideo.play().catch(() => { videoPlay.hidden = false; });
  });
  marketingVideo.addEventListener('play', () => { videoPlay.hidden = true; });
}

/* ════════ live inbox simulation ════════ */
const FLOW_ICONS = {
  welcome: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3l2.5 5.5L20 10l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1.5L12 3z" stroke-linejoin="round"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2l2.4 11h10.2l2-8H6.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  post: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 8l9 6 9-6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  camp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 11l18-7-7 18-2.5-7.5L3 11z" stroke-linejoin="round"/></svg>',
  sub: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0" stroke-linecap="round"/></svg>'
};

const EVENTS = [
  { ic: 'cart', t: "استعادة سلة متروكة", s: "رسالة تذكير ← طلب", amt: () => 40 + Math.random() * 110 },
  { ic: 'welcome', t: "سلسلة الترحيب · الرسالة 2", s: "مشترك جديد ← أول شراء", amt: () => 25 + Math.random() * 70 },
  { ic: 'camp', t: "إرسال حملة أسبوعية", s: "رسالة عرض · 4,821 مستلماً", amt: () => 120 + Math.random() * 260 },
  { ic: 'post', t: "مسار ما بعد الشراء", s: "عرض منتج مكمّل ← طلب إضافي", amt: () => 30 + Math.random() * 90 },
  { ic: 'sub', t: "مشترك جديد", s: "نموذج منبثق · إرسال رمز خصم 10%", amt: null },
  { ic: 'cart', t: "استعادة سلة متروكة", s: "تذكير ثانٍ بخصم ← طلب", amt: () => 55 + Math.random() * 140 },
  { ic: 'camp', t: "حملة موجّهة", s: "عملاء مميزون · مشتريات متكررة", amt: () => 90 + Math.random() * 220 },
  { ic: 'post', t: "طلب تقييم", s: "تقييم من العميل بخمس نجوم", amt: null },
  { ic: 'welcome', t: "سلسلة الترحيب · الرسالة 1", s: "ترحيب ودليل المنتجات الأكثر مبيعاً", amt: () => 20 + Math.random() * 50 }
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

/* Plain-language store-sales scenarios and fee comparison */
const averageOrderInput = $('#calcAverageOrder');
const storeRevenueInput = $('#calcStoreRevenue');
function calc() {
  const feeOrders = $('#calcOrders');
  const emailOrders = $('#calcEmailOrders');
  const scenarioRevenue = $('#calcScenarioRevenue');
  if (!averageOrderInput || !feeOrders || !emailOrders || !scenarioRevenue || !storeRevenueInput) return;
  const averageOrder = Number(averageOrderInput.value);
  const revenue = Number(storeRevenueInput.value);
  const share = 10;
  const validAverage = averageOrderInput.value.trim() !== '' && averageOrderInput.validity.valid && Number.isFinite(averageOrder) && averageOrder > 0;
  const validRevenue = storeRevenueInput.value.trim() !== '' && storeRevenueInput.validity.valid && Number.isFinite(revenue) && revenue >= 0;
  const exampleRevenue = revenue * share / 100;
  const feeCount = Math.ceil(managementFee / averageOrder);
  const emailCount = Math.round(exampleRevenue / averageOrder);
  feeOrders.textContent = validAverage && Number.isFinite(feeCount) ? feeCount.toLocaleString('en-GB') : '—';
  emailOrders.textContent = validAverage && validRevenue && Number.isFinite(emailCount) ? emailCount.toLocaleString('en-GB') : '—';
  scenarioRevenue.textContent = validRevenue && Number.isFinite(exampleRevenue) ? fmt(exampleRevenue) + " مبيعات بريد شهرياً في هذا المثال" : '—';
}
[averageOrderInput, storeRevenueInput].forEach(input => input?.addEventListener('input', calc));
calc();

/* ════════ 7-Day Horizontal Timeline Stepper ════════ */
const TIMELINE_STEPS = [
  {
    num: '1',
    day: "اليوم 1",
    title: "المراجعة والاستراتيجية",
    blurb: "نراجع الحساب الحالي ونتفق على الأولويات بعد توافر الصلاحيات والمعلومات.",
    items: [
      "مراجعة شاملة لقناة البريد",
      "فحص قابلية التسليم",
      "استراتيجية مخصصة وخطة واضحة"
    ]
  },
  {
    num: '2',
    day: "اليوم 2",
    title: "الأساس التقني",
    blurb: "نفحص المصادقة وصحة القائمة وإعدادات الإرسال.",
    items: [
      "ربط Omnisend بمتجرك",
      "فحص قابلية التسليم ومعالجة المشكلات",
      "فحص سمعة المرسل وتوصيات الإرسال"
    ]
  },
  {
    num: '3-4',
    day: "اليومان 3–4",
    title: "العملاء وبناء المسارات",
    blurb: "نبني مسارات الاحتفاظ بالعملاء وننسّق تصميمها.",
    items: [
      "إعداد نماذج الاشتراك",
      "إنشاء رسائل مؤتمتة للترحيب والسلة المتروكة وما بعد الشراء",
      "قوالب مخصصة للعلامة"
    ]
  },
  {
    num: '5-6',
    day: "اليومان 5–6",
    title: "الإطلاق وتقسيم الجمهور",
    blurb: "نختبر أحداث العملاء والاستبعادات والمحتوى قبل الإطلاق المتفق عليه.",
    items: [
      "تفعيل المسارات واختبارها",
      "تقسيم ديناميكي بحسب السلوك",
      "اختبار النظام وضمان الجودة"
    ]
  },
  {
    num: '7',
    day: "اليوم 7",
    title: "الإطلاق والمراقبة",
    blurb: "المسارات الأساسية المتفق عليها جاهزة للإطلاق بعد الاختبار والموافقة.",
    items: [
      "إطلاق الأتمتة الأساسية المتفق عليها",
      "تأكيد صلاحيات التقارير وإعدادات القياس",
      "التقارير الأولى ومتابعة النتائج"
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
const REVENUE_Q = "الإيرادات الشهرية";
const DQ_OPTION = isUaeMarket ? "أقل من 49,100 درهم" : "أقل من 49,100 درهم";

const QUESTIONS = [
  { title: REVENUE_Q, sub: isUaeMarket ? "ما متوسط إيراداتك الشهرية بالدرهم تقريباً؟" : "ما متوسط إيراداتك الشهرية تقريباً؟", opts: isUaeMarket ? [DQ_OPTION, "49,100–98,200 درهم", "98,200–245,500 درهم", "أكثر من 245,500 درهم", "غير متأكد"] : [DQ_OPTION, '£10,000 – 20,000', '£20,000 – 50,000', '£50,000+', "غير متأكد"] },
  { title: "وضع التسويق بالبريد", sub: "كيف تستخدم التسويق بالبريد الإلكتروني حالياً؟", opts: ["نرسل حملات ولدينا رسائل مؤتمتة", "نرسل أحياناً نشرة أو عرضاً، من دون أتمتة فعلية", "لدينا قائمة، لكننا نادراً ما نستخدمها", "لم نبدأ التسويق بالبريد بعد", "غير متأكد"] },
  { title: "حجم القائمة", sub: "ما حجم قائمتك البريدية تقريباً؟", opts: ["لا توجد قائمة بعد", '1-500', '500-5,000', '5,000-20,000', '20,000+', "غير متأكد"] },
  { title: "التحدي الأكبر", sub: "ما أكبر تحدٍّ تواجهه في التسويق بالبريد حالياً؟", opts: ["نقص الوقت أو الموارد", "ضعف التفاعل من فتح ونقر", "لا توجد مسارات مؤتمتة", "غياب استراتيجية واضحة للمحتوى والجمهور", "غير متأكد"] }
];

const shell = $('#quizShell');
let currentQ = 0, answers = {}, contactInfo = { name: '', email: '', phone: '', website: '' }, touched = {}, isSubmitting = false;
const arrowSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function getValidationErrors() {
  const errors = {};
  const n = contactInfo.name.trim();
  if (!n) errors.name = "هذا الحقل مطلوب"; else if (n.length < 2) errors.name = "الاسم قصير جداً";
  const em = contactInfo.email.trim();
  if (!em) errors.email = "هذا الحقل مطلوب"; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) errors.email = "صيغة البريد الإلكتروني غير صالحة";
  const digits = contactInfo.phone.replace(/[^\d]/g, '');
  if (contactInfo.phone.trim() && digits.length < 8) errors.phone = "الرقم قصير جداً";
  const w = contactInfo.website.trim();
  if (!w) errors.website = "هذا الحقل مطلوب"; else if (!/\.[a-zA-Z]{2,}/.test(w)) errors.website = "أدخل نطاقاً مثل yourstore.com";
  return errors;
}

function stepHead(stepNum, title, sub) {
  return `<div class="quiz-progress"><i style="width:${Math.round(stepNum / 5 * 100)}%"></i></div>
    <div class="mono" style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-40);font-weight:600;margin-bottom:10px;text-align:center">الخطوة ${stepNum} من 5</div>
    <div class="q-title" style="text-align:center">${title}</div>
    ${sub ? `<div class="q-sub" style="text-align:center">${sub}</div>` : '<div style="height:18px"></div>'}`;
}

function renderQuiz() {
  if (!shell) return;
  const q = QUESTIONS[currentQ];
  shell.innerHTML = `${stepHead(currentQ + 1, q.title, q.sub)}
    <div class="quiz-step">
      <div class="q-opts">${q.opts.map(o => `<button class="q-opt" data-v="${o}">${o} ${arrowSvg}</button>`).join('')}</div>
      ${currentQ > 0 ? '<button class="q-back" id="qBack">العودة ←</button>' : ''}
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
    <div class="q-title">شكراً لاهتمامك!</div>
    <p class="q-sub" style="max-width:46ch;margin:10px auto 6px">خدمتنا متاحة للمتاجر التي تبلغ إيراداتها الشهرية ${isUaeMarket ? "نحو 49,100 درهم" : '£10,000'} أو أكثر. إذا كانت أقل، فتصفّح الأدلة العملية أو تواصل معنا بسؤال محدد.</p>
    <p style="color:var(--ink-40);font-size:13.5px;font-weight:500;max-width:46ch;margin:0 auto 22px">الإيرادات وحدها لا تحدّد جدوى إدارة البريد. تؤثر أيضاً الزيارات والموافقات ودورة الشراء وهوامش الربح.</p>
    <button class="btn btn-ghost" id="qRestart">ابدأ من جديد</button></div>`;
  $('#qRestart').addEventListener('click', () => { answers = {}; currentQ = 0; renderQuiz(); });
}

function renderForm() {
  shell.innerHTML = `${stepHead(5, "بيانات التواصل", '')}
  <div class="quiz-step">
    <form id="leadForm" novalidate style="max-width:440px;margin:0 auto">
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="field" data-f="name"><label for="fName">الاسم الكامل</label><input id="fName" required maxlength="200" aria-describedby="fNameError" type="text" placeholder="John Smith" autocomplete="name"><div class="err" id="fNameError"></div></div>
        <div class="field" data-f="email"><label for="fEmail">البريد الإلكتروني</label><input id="fEmail" required maxlength="254" aria-describedby="fEmailError" type="email" placeholder="name@yourbusiness.com" autocomplete="email"><div class="err" id="fEmailError"></div></div>
        <div class="field" data-f="phone"><label for="fPhone">رقم الهاتف (اختياري)</label><input id="fPhone" maxlength="80" aria-describedby="fPhoneError" type="tel" placeholder="${isUaeMarket ? '+971 50 123 4567' : '+44 20 7946 0123'}" autocomplete="tel"><div class="err" id="fPhoneError"></div></div>
        <div class="field" data-f="website"><label for="fWeb">الموقع الإلكتروني</label><input id="fWeb" required maxlength="2048" aria-describedby="fWebError" type="text" placeholder="your-store.com" autocomplete="url"><div class="err" id="fWebError"></div></div>
      </div>
      <p class="form-data-note">الهاتف اختياري. أضفه إذا رغبت في مشاركة رقم للتواصل بشأن طلبك. بعد قبول الطلب، تختار موعداً عبر Calendly؛ إرسال النموذج لا يحجز موعداً. نستخدم البيانات للرد على طلب الاستشارة. اقرأ <a href="/privacy/">سياسة الخصوصية</a>. للاستفسار عن بياناتك، راسل <a href="mailto:info@emailflow.uk">info@emailflow.uk</a>.</p>
      <p role="alert" id="submitErr" style="display:none;color:var(--stamp);font-size:13px;font-weight:600;margin-top:14px;text-align:center;background:rgba(216,80,43,.08);border:1px solid rgba(216,80,43,.25);border-radius:12px;padding:11px"></p>
      <button class="btn btn-primary" type="submit" id="leadSubmit" style="width:100%;justify-content:space-between;margin-top:22px"><span>تابع لاختيار موعد</span> <span class="arrow">${arrowSvg.replace('viewBox', 'width="13" height="13" viewBox')}</span></button>
    </form>
    <button class="q-back" id="qBack">العودة ←</button>
  </div>`;

  $('#qBack').addEventListener('click', () => { currentQ = QUESTIONS.length - 1; renderQuiz(); });

  const fields = { name: '#fName', email: '#fEmail', phone: '#fPhone', website: '#fWeb' };
  Object.entries(fields).forEach(([k, sel]) => { if ($(sel)) $(sel).value = contactInfo[k]; });

  let prevPhone = contactInfo.phone;
  $('#fPhone').addEventListener('input', e => {
    if (/^[0-9+()\s-]*$/.test(e.target.value)) { prevPhone = e.target.value; }
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
      el.querySelector('input').setAttribute('aria-invalid', show ? 'true' : 'false');
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
      const firstInvalid = $('#leadForm [aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    errEl.style.display = 'none';

    isSubmitting = true;
    const btn = $('#leadSubmit');
    const originalButton = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Sending... <span class="spin"></span>';
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactInfo.name.trim(),
          email: contactInfo.email.trim(),
          phone: contactInfo.phone.trim(),
          website: contactInfo.website.trim(),
          answers
        })
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('Submission was not accepted');
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'generate_lead', form_name: 'consultation', page_path: location.pathname });
      renderComplete();
    } catch (err) {
      errEl.style.display = 'block';
      errEl.textContent = "تعذّر تأكيد طلبك. حاول مجدداً أو راسل info@emailflow.uk.";
      if (btn) { btn.disabled = false; btn.innerHTML = originalButton; }
    } finally {
      isSubmitting = false;
    }
  });
}

const BOOKING_URL = 'https://calendly.com/nick-emailflow/emailflow-consultation';

function renderComplete() {
  shell.classList.add('quiz-shell-booking');
  shell.innerHTML = `<div class="quiz-progress"><i style="width:100%"></i></div>
  <div class="quiz-step success-box">
    <div class="big-ic" style="background:var(--teal);color:#fff">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <h3 class="q-title booking-title" tabindex="-1">اختر موعد الاستشارة</h3>
    <p class="q-sub booking-intro">تم استلام إجاباتك. اختر التاريخ والوقت أدناه لإتمام الحجز.</p>
    <p class="booking-fallback">التقويم لا يظهر؟ <a href="${BOOKING_URL}" target="_blank" rel="noopener noreferrer">افتح صفحة الحجز في تبويب جديد ↗</a></p>
    <div id="consultationCalendar" class="booking-calendar" aria-label="Choose a consultation time"></div>
  </div>`;
  shell.querySelector('.booking-title').focus({ preventScroll: true });
  shell.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  const calendar = document.getElementById('consultationCalendar');
  const initializeCalendar = () => {
    if (!calendar.isConnected || !window.Calendly) return;
    window.Calendly.initInlineWidget({
      url: BOOKING_URL,
      parentElement: calendar,
      prefill: { name: contactInfo.name.trim(), email: contactInfo.email.trim() }
    });
  };
  if (window.Calendly) {
    initializeCalendar();
  } else {
    const widget = document.createElement('script');
    widget.src = 'https://assets.calendly.com/assets/external/widget.js';
    widget.async = true;
    widget.onload = initializeCalendar;
    widget.onerror = () => {
      calendar.innerHTML = '<p class="booking-load-error" role="status">تعذّر تحميل التقويم. استخدم رابط الحجز أعلاه لاختيار الموعد.</p>';
    };
    document.head.appendChild(widget);
  }
}

if (shell) renderQuiz();

/* ════════ FAQ ════════ */
const FAQS = [
  {
    "q": "متى يمكن إطلاق أتمتة البريد؟",
    "a": "يمكن التخطيط لتنفيذ المسارات الأساسية خلال سبعة أيام بعد جاهزية الصلاحيات والتكاملات والمحتوى والموافقات. نتفق على النطاق بعد المراجعة. موعد الإطلاق لا يعني ضمان الإيرادات أو نمو القائمة."
  },
  {
    "q": "ما المنصات التي تعملون معها؟",
    "a": "نعمل حصرياً مع Omnisend، بما في ذلك تكامل متاجر Shopify، وندعم المسارات والحملات وتقسيم الجمهور وقابلية التسليم."
  },
  {
    "q": "ما المتاجر المناسبة للخدمة؟",
    "a": "خدمتنا الأساسية مناسبة للمتاجر التي تبلغ إيراداتها الشهرية نحو 49,100 درهم أو أكثر. تعتمد الملاءمة أيضاً على حجم القائمة والموافقات وتكرار الشراء والعمل المطلوب، ونقيّم ذلك خلال الاستشارة."
  },
  {
    "q": "هل أحتاج إلى قائمة بريدية موجودة؟",
    "a": "وجود قائمة يساعد، ويمكن أن تشمل الخطة نماذج الاشتراك وتكامل بيانات العملاء. يعتمد النمو على زيارات المتجر والعرض والموافقات التسويقية، ولا توجد نسبة نمو ثابتة."
  },
  {
    "q": "ما تكلفة إدارة البريد الإلكتروني؟",
    "a": "رسوم الإدارة الإرشادية 3,930 درهماً شهرياً، باستثناء ضريبة القيمة المضافة، وتشمل اشتراك Omnisend وأربع حملات شهرياً، من دون رسوم إعداد، وبحد أدنى ثلاثة أشهر. يُعتمد نطاق المسارات وبقية الشروط كتابةً قبل البدء. راجع دليل الأسعار للتفاصيل."
  },
  {
    "q": "هل تضمنون وصول الرسائل إلى الوارد؟",
    "a": "لا يستطيع أي مزوّد ضمان الوصول إلى كل صندوق وارد أو التبويب الرئيسي. تساعد المصادقة وصحة القائمة وممارسات الإرسال والمراقبة، لكن خدمة البريد المستقبِلة تحدّد موضع الرسالة."
  }
];

const faqWrap = $('#faqList');
if (faqWrap && !faqWrap.children.length) {
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
  const map = { 'how-it-works': null, 'calculator': null, 'tracking': null, 'faq': null };
  Object.keys(map).forEach(id => { map[id] = $$(`.nav-links a[href="#${id}"], .nav-links a[href="/#${id}"]`); });
  const spy = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      $$('.nav-links a').forEach(a => a.classList.remove('active'));
      (map[e.target.id] || []).forEach(a => a.classList.add('active'));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  Object.keys(map).forEach(id => { const s = document.getElementById(id); if (s) spy.observe(s); });
})();

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
