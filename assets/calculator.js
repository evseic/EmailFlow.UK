/* One calculator implementation for the UK and both UAE language versions. */
(function (root) {
  function calculate(monthlySales) {
    const sales = Number(monthlySales);
    if (!Number.isFinite(sales) || sales < 0) return null;
    return { monthlyLow: sales * 0.2, monthlyHigh: sales * 0.3, annualLow: sales * 0.2 * 12 };
  }
  if (typeof module === 'object' && module.exports) module.exports = { calculate };
  if (!root.document) return;
  root.document.querySelectorAll('[data-email-calculator]').forEach(panel => {
    const slider = panel.querySelector('#calcRange');
    const revenue = panel.querySelector('#calcRevenue');
    const monthly = panel.querySelector('#calcMonthly');
    const annual = panel.querySelector('#calcAnnual');
    if (!slider || !revenue || !monthly || !annual) return;
    const arabic = panel.dataset.language === 'ar';
    const aed = panel.dataset.currency === 'AED';
    const number = value => Math.round(value).toLocaleString(arabic ? 'ar-AE-u-nu-latn' : 'en-GB');
    const money = value => arabic ? number(value) + ' درهم' : (aed ? 'AED ' : '£') + number(value);
    const update = () => {
      const value = Math.min(Number(slider.max), Math.max(Number(slider.min), Number(slider.value)));
      const result = calculate(value);
      if (!result) return;
      revenue.textContent = money(value);
      monthly.textContent = (arabic ? '' : aed ? 'AED ' : '£') + number(result.monthlyLow) + '–' + number(result.monthlyHigh) + (arabic ? ' درهم' : '');
      if (arabic) {
        const range = root.document.createElement('bdi');
        range.dir = 'ltr';
        range.className = 'calc-number-range';
        range.textContent = number(result.monthlyLow) + '–' + number(result.monthlyHigh);
        const currency = root.document.createElement('span');
        currency.className = 'calc-currency';
        currency.textContent = 'درهم';
        monthly.replaceChildren(range, currency);
      }
      annual.textContent = money(result.annualLow);
      slider.setAttribute('aria-valuetext', money(value));
      panel.style.setProperty('--calc-progress', ((value - Number(slider.min)) / (Number(slider.max) - Number(slider.min)) * 100) + '%');
    };
    slider.addEventListener('input', update);
    slider.addEventListener('change', update);
    update();
  });
})(typeof window === 'object' ? window : {});
