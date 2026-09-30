# Tampa Wholesale Double Close

Astro server-rendered metro site. Source lives in src/; fee values are read at request time from the shared WDC fee sheet, with the approved fallback schedule. No analytics scripts are included.

## Local development

Run `npm install`, then `npm run dev`. Production build: `npm run build`. Cloudflare build command: `npm run build`; deploy command: `npx wrangler deploy`.

## Editing

Metro homepage copy: `src/data/metro.ts`. City copy and service areas: `src/data/cities.ts`. Layout and tracker: `src/layouts/Base.astro`. Form: `src/components/DealForm.astro`. Fees: shared Google Sheet, fetched by `src/data/feeTerms.ts`. Privacy and terms: `src/pages/`.

Production domain: https://tampa.wholesaledoubleclose.click/ . Cloudflare SSR preview is used for this site; GitHub Pages cannot execute this server-rendered build.
