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

The official Vercel analytics package is copied to the public build and loaded only on emailflow.uk/www.emailflow.uk. The owner enabled the included Vercel Web Analytics plan; the prepared code must be deployed before it can collect page views. Custom events are not included on Hobby. The form emits a PII-free dataLayer event on confirmed acceptance for a separately configured future collector.

Release updates should be reconciled against current upstream main and checked on a Vercel preview before production verification. Do not stage docs/, dist/, node_modules/ or unrelated owner images. Local implementation notes, account screenshots and rollback archives are under docs/ and excluded from Git and the public build.

## Content maintenance

Keep business location, scope and pricing consistent across visible pages, structured data and llms.txt. Change sitemap lastmod and article modification dates only for meaningful updates. Case-study figures require underlying evidence and appropriate permission; reported attribution must not be presented as proven incremental revenue.
