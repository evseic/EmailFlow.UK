// Official Omnisend connection for the production EmailFlow website.
// Approved by the owner on 9 November 2026. The brand ID is public, not an API key.
if (location.hostname === 'www.emailflow.uk' || location.hostname === 'emailflow.uk') {
  window.omnisend = window.omnisend || [];
  window.omnisend.push(['brandID', '6aa05e6e582b1a398e5a88c2']);
  window.omnisend.push(['track', '$pageViewed']);
  (function () {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://omnisnippet1.com/inshop/launcher-v2.js';
    var first = document.getElementsByTagName('script')[0];
    first.parentNode.insertBefore(script, first);
  })();
}
