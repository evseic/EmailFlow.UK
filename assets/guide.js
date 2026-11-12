(() => {
  const session = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { sessionStorage.setItem(key, value); } catch {} }
  };
  const visitStarted=Number(session.get('emailflow-visit-start'))||Date.now();
  session.set('emailflow-visit-start',String(visitStarted));
  const ar = document.documentElement.lang === 'ar';
  const text = ar ? {
    label:'دليل مجاني', title:'7 مسارات لبريد إلكتروني أكثر فاعلية', intro:'دليل عملي لمتجرك: مسارات مؤتمتة، وأوقات مقترحة للاختبار، و10 نماذج رسائل قابلة للتكييف.', email:'البريد الإلكتروني', send:'أرسل لي الدليل', sending:'جارٍ إرسال الطلب…', note:'نرسل الدليل الذي طلبته عبر Omnisend. لا يؤدي هذا الطلب إلى اشتراكك في رسائل تسويقية أخرى.', privacy:'سياسة الخصوصية (بالإنجليزية)', close:'إغلاق', success:'الدليل في طريقه إليك', details:'تم قبول طلبك. تفقد صندوق الوارد، ثم مجلد الرسائل غير المرغوب فيها أو العروض الترويجية.', error:'تعذّر قبول طلبك الآن. حاول مرة أخرى أو راسل info@emailflow.uk.', preview:'إرسال البريد غير متاح في هذه المعاينة المحلية بعد. يمكنك تجربة الطلب بعد إكمال ربط Omnisend.', invalid:'أدخل عنوان بريد إلكتروني صالحاً.', badge:'دليل EmailFlow', flows:'7 مسارات مؤتمتة', templates:'10 نماذج عملية', time:'أوقات إرسال للاختبار', thanks:'شكراً لك', to:'سنرسل الدليل إلى', small:'ابدأ بخطوة واضحة. طوّرها ببيانات متجرك.'
  } : {
    label:'Free guide', title:'7 email automations worth building', intro:'A practical playbook for your store: automated flows, timing to test, and 10 email templates you can adapt.', email:'Email address', send:'Send me the guide', sending:'Sending request…', note:'We use Omnisend to email the guide you request. This does not subscribe you to other marketing emails.', privacy:'Privacy policy', close:'Close', success:'Your guide is on its way', details:'Your request has been accepted. Check your inbox, then your Promotions or Spam folder.', error:'We couldn’t accept your request just now. Try again or email info@emailflow.uk.', preview:'Email delivery isn’t connected in this local preview yet. You can try again once Omnisend setup is complete.', invalid:'Please enter a valid email address.', badge:'The EmailFlow playbook', flows:'7 automated flows', templates:'10 practical templates', time:'Timing to test', thanks:'Thank you', to:'We’ll email the guide to', small:'Start with a clear plan. Improve it with your store’s data.'
  };
  const icon='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 4.5C7 3 9 3 12 4.5 15 3 17 3 20 4.5V20c-3-1.5-5-1.5-8 0-3-1.5-5-1.5-8 0Z"/><path d="M12 4.5V20M7 8h2M15 8h2M7 12h2M15 12h2"/></svg>';
  const launcher=document.createElement('button');
  launcher.className='guide-launcher'; launcher.type='button'; launcher.setAttribute('aria-haspopup','dialog'); launcher.setAttribute('aria-controls','freeGuideDialog');
  launcher.innerHTML=icon+'<span>'+text.label+'</span>';
  const dialog=document.createElement('dialog'); dialog.id='freeGuideDialog'; dialog.className='guide-dialog'; dialog.setAttribute('aria-labelledby','freeGuideTitle');
  dialog.innerHTML=`<button class="guide-close" type="button" aria-label="${text.close}">×</button><div class="guide-layout"><div class="guide-art" aria-hidden="true"><div class="guide-book"><div class="guide-book-brand"><img src="/assets/logo.png" width="24" height="24" alt="">EmailFlow</div><div class="guide-book-kicker">${text.badge}</div><div class="guide-book-title">${ar?'البريد الذي<br>يعيد العملاء.':'Email that<br>brings them back.'}</div><div class="guide-book-line"></div><div class="guide-book-flows"><span>01</span><i></i><span>02</span><i></i><span>03</span></div><div class="guide-book-caption">${text.small}</div><div class="guide-book-bottom">${ar?'7 مسارات / 10 نماذج':'7 FLOWS / 10 TEMPLATES'}</div></div><div class="guide-art-note">${text.flows} · ${text.templates}</div></div><div class="guide-content"><span class="guide-eyebrow">${text.label}</span><h2 id="freeGuideTitle">${text.title}</h2><p class="guide-intro">${text.intro}</p><ul class="guide-benefits"><li>${text.flows}</li><li>${text.templates}</li><li>${text.time}</li></ul><form id="freeGuideForm"><label for="freeGuideEmail">${text.email}</label><input type="email" id="freeGuideEmail" name="email" autocomplete="email" required maxlength="254" placeholder="you@yourstore.com" dir="ltr"><div class="guide-honeypot" aria-hidden="true"><label for="freeGuideCompany">Company</label><input id="freeGuideCompany" name="company" tabindex="-1" autocomplete="off"></div><button type="submit" class="guide-submit">${text.send}<span aria-hidden="true">${ar?'←':'→'}</span></button><p class="guide-status" role="alert" hidden></p><p class="guide-consent">${text.note} <a href="/privacy/">${text.privacy}</a>.</p></form><div class="guide-success" hidden tabindex="-1"><div class="guide-success-mark" aria-hidden="true">✓</div><h3>${text.success}</h3><p>${text.to} <bdi class="guide-recipient" dir="ltr"></bdi>.</p><p>${text.details}</p><button class="guide-done" type="button">${text.close}</button></div></div></div>`;
  document.body.append(launcher,dialog);
  const form=dialog.querySelector('form'),email=dialog.querySelector('#freeGuideEmail'),status=dialog.querySelector('.guide-status'),submit=dialog.querySelector('.guide-submit');
  let returnFocus;
  const openGuide=()=>{
    if(dialog.open)return;
    session.set('emailflow-guide-shown','yes');
    returnFocus=document.activeElement;dialog.showModal();document.body.classList.add('guide-modal-open');
    (form.hidden?dialog.querySelector('.guide-success'):email).focus();
  };
  launcher.addEventListener('click',openGuide);
  function maybeShowGuide(){
    if(Date.now()-visitStarted<30000||session.get('emailflow-guide-shown')||document.hidden||document.querySelector('dialog[open]'))return;
    openGuide();
  }
  setTimeout(maybeShowGuide,Math.max(0,30000-(Date.now()-visitStarted)));
  document.addEventListener('visibilitychange',maybeShowGuide);
  document.addEventListener('close',maybeShowGuide,true);
  const close=()=>dialog.close();dialog.querySelector('.guide-close').addEventListener('click',close);dialog.querySelector('.guide-done').addEventListener('click',close);
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('guide-modal-open');returnFocus?.focus();});
  email.addEventListener('input',()=>email.setCustomValidity(''));
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(submit.disabled)return;
    const value=email.value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){email.setCustomValidity(text.invalid);email.reportValidity();return;}
    submit.disabled=true;submit.textContent=text.sending;status.hidden=true;
    try {
      const response=await fetch('/api/guide',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:value,language:ar?'ar':'en',company:form.elements.company.value,source:location.pathname,deliveryRequested:true}),signal:AbortSignal.timeout(15000)});
      const result=await response.json();if(!response.ok||result.success!==true)throw new Error(result.preview?'preview':'request');
      form.hidden=true;dialog.querySelector('.guide-intro').hidden=true;dialog.querySelector('.guide-benefits').hidden=true;dialog.querySelector('.guide-eyebrow').textContent=text.thanks;dialog.querySelector('.guide-recipient').textContent=value;const success=dialog.querySelector('.guide-success');success.hidden=false;success.focus();
    }catch(error){status.textContent=error.message==='preview'?text.preview:text.error;status.hidden=false;}
    finally{submit.disabled=false;submit.innerHTML=text.send+`<span aria-hidden="true">${ar?'←':'→'}</span>`;}
  });
})();
