# EmailFlow.uk

Static ecommerce email marketing site with a Vercel Node function for consultation requests. EmailFlow provides Omnisend services exclusively. The former Klaviyo service URL permanently redirects to /omnisend-agency/; competitor comparisons are educational, not additional service offerings.

## Local development

Requires a current Node.js runtime and npm.

```sh
npm ci
npm run build
npm start
```

Preview: http://localhost:3000/ . The local server serves only dist/ and does not send consultation requests to production services.

```sh
npm run check:seo
npm test
```

SEO checks inspect every sitemap page, JSON-LD, internal targets, anchors and public output boundaries. Lead tests mock external requests and do not notify real recipients.

## Vercel

Existing project: email-flow-uk. Existing production repository: evseic/EmailFlow.UK, main branch. vercel.json builds dist/; api/submit.js remains a serverless function. Configure the actual lead destinations using the names in .env.example, keeping secret values in Vercel environment settings. The API acknowledges a request only if at least one configured destination accepts it.

The official Vercel analytics package is copied to the public build and loaded only on emailflow.uk/www.emailflow.uk. The owner enabled the included Vercel Web Analytics plan; the integration is deployed on the live site. Custom events are not included on Hobby. The form emits a PII-free dataLayer event on confirmed acceptance for a separately configured future collector.

The owner authorised publication of the prepared site changes on 9 November 2026. Before pushing, reconcile against current upstream main and validate a Vercel preview. Do not stage docs/, dist/, node_modules/ or unrelated owner images. Local implementation notes, account screenshots and rollback archives are under docs/ and excluded from Git and the public build.

## Content maintenance

Keep business location, scope and pricing consistent across visible pages, structured data and llms.txt. Change sitemap lastmod and article modification dates only for meaningful updates. Case-study figures require underlying evidence and appropriate permission; reported attribution must not be presented as proven incremental revenue.

## Free guide delivery

The corner guide button is shared across all public pages and follows the document language (English or Arabic). Original guides are `guides/email-automation-en.html` and `guides/email-automation-ar.html`; both can be printed or saved as PDF from the browser. Branded delivery email sources are in `emails/` and are intentionally excluded from the public production build. Local-only email previews are `/__preview/guide-email/en/` and `/__preview/guide-email/ar/`.

`POST /api/guide` sends one custom event to the current Omnisend API (`2026-03-15`), using an Events-write key from `OMNISEND_API_KEY`. The event names are `emailflow_guide_requested_en` and `emailflow_guide_requested_ar`, origin `api`. The request records guide delivery only and never opts a contact into marketing or overrides an unsubscribe. Set `OMNISEND_GUIDE_READY=true` only after the two workflow emails have been enabled and tested with the verified sender. Configure each workflow to respond only to its specific guide event, with `deliveryRequested=true`, and review channel settings for delivery of the explicitly requested resource. Avoid adding unsolicited follow-up emails.

The API acknowledges only an Omnisend HTTP 202 response. This means accepted for processing, not confirmed inbox delivery. It rejects cross-origin submissions, validates inputs, checks a honeypot, and throttles repeat addresses for ten minutes within each warm serverless instance. Apply a deployment-level shared rate limit before broad public promotion; the in-memory throttle is not a global rate limit. No automatic retry is made after ambiguous timeouts because Omnisend does not deduplicate real-time event sends.

Local preview never sends real email and returns an explicit preview error on guide submission. Production guide links use the canonical `https://www.emailflow.uk` origin; publish the guide assets before sending live delivery emails. Never commit `.env.local` or expose the API key in browser scripts.

### Production delivery state

The website connection is verified and the owner-approved Omnisend page-view integration is live, with its purpose explained in the privacy notice. The restricted Events-write key is stored only in private server configuration and as a sensitive production Vercel environment variable. No credential belongs in this repository.

Both language-specific guide workflows are enabled. Each responds only to its language event with deliveryRequested=true, sends one guide email immediately and has retrospective entry disabled. Channel settings permit subscribed and non-subscribed contacts; unsubscribed contacts remain excluded. Requests do not change marketing subscription status. Production OMNISEND_GUIDE_READY is enabled. English and Arabic owner-approved tests were both confirmed in the Gmail inbox, including the correct Arabic guide and consultation destinations.

Omnisend currently sends on its shared domain as EmailFlow, with the verified info@emailflow.uk address as Reply-To. Sending directly from the custom domain requires separate sender-domain authentication. The saved delivery templates are EmailFlow — Free guide delivery (English) and EmailFlow — Free guide delivery (Arabic RTL).

### Expanded guide content
The guide now includes original editorial photos, redrawn figures from existing published case studies (explicitly not original dashboard screenshots), the existing CEO image, seven core journeys including site abandonment, trigger/filter/exit settings, expandable SVG flow maps, original example emails, testing guidance, and downloadable editable HTML templates. Original result values and GBP reporting periods are retained. The source dashboard screenshots are not available in this checkout and are not fabricated. English/Arabic sources, images, SVGs and ZIP downloads are in the public build allowlist. Guide downloads are educational examples with placeholders, not production-ready sends.

### Homepage language parity

The UK, UAE English and UAE Arabic homepages share the same sections and visual components. The Arabic page uses right-to-left text and its localised runtime in assets/home-ar.js. UAE calculators use an indicative AED 3,930 management fee; original case-study figures remain in their reported GBP currency. The home-locales test checks that the shared homepage sections and interactive components remain present.
