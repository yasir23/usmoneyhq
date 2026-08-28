# US Money HQ

Free, fast US financial calculators and money tools — live at **https://usmoneyhq.com**

30+ calculators: mortgage, auto loan, salary after tax (by state), paycheck, debt payoff, DTI, PMI, HELOC, refinance, retirement, income tax, TDEE, compound interest, and more. No sign-up, no data collection, works on mobile.

## Features

- 30 calculator tools + 250 state-specific variant pages (e.g. salary-after-tax-calculator/texas)
- Server-side calculation API: `POST /api/calc/[tool]`
- Free embeddable widgets for webmasters: https://usmoneyhq.com/widgets (one-line embed, auto-backlink)
- JSON-LD structured data, dynamic sitemap, methodology page
- Auto-deploy: GitHub Actions → Docker → Traefik on push to master

## Stack

Next.js 14 (App Router API + Pages Router tools), TypeScript calc engine, standalone output, Docker + Traefik + Let's Encrypt.

## Run locally

```
npm ci
npm run build
node .next/standalone/server.js
```

## Deploy

Push to master. GitHub Actions builds, bundles, and deploys to the VPS automatically.

© 2026 US Money HQ
