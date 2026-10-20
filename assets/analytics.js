import { inject } from './vercel-analytics.mjs';

// Do not count local previews or Vercel preview deployments as production traffic.
if (['www.emailflow.uk', 'emailflow.uk'].includes(window.location.hostname)) {
  inject({
    mode: 'production',
    beforeSend(event) {
      // Keep search strings and fragments (which can contain contact details) out of analytics URLs.
      const url = new URL(event.url, window.location.origin);
      return { ...event, url: url.origin + url.pathname };
    }
  });
}
