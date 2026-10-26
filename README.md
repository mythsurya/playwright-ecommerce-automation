# Playwright E-commerce Automation

A scalable e-commerce test automation framework built using Playwright and TypeScript, following the Page Object Model (POM). Includes reusable test components, test data management, cross-browser testing, automated reports, screenshots, and end-to-end validation of shopping workflows.

## Getting started

Install dependencies:

```bash
npm ci
```

Install the Playwright browsers:

```bash
npx playwright install
```

Run the tests:

```bash
npm test
```

The HTML report is generated in `playwright-report/`.

## Project structure

- `tests/` — Playwright test specs
- `playwright.config.ts` — test runner and browser configuration
- `.github/workflows/playwright.yml` — GitHub Actions test workflow

Local environment files such as `.env` are ignored by Git. Do not commit credentials.
