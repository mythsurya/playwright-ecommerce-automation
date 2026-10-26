# Playwright E-commerce Automation

A Playwright and TypeScript framework for testing the Automation Practice storefront. Tests use the Page Object Model, isolated browser contexts, and separate smoke, sanity, regression, and API suites.

## Getting started

```bash
npm ci
npx playwright install
npm test
```

Set `BASE_URL` to test another compatible environment. The default is `https://automationpractice.techwithjatin.com`.

## Test suites

| Suite | Command | Coverage |
| --- | --- | --- |
| Smoke | `npm run test:smoke` | Storefront availability, account entry point, and cart page |
| Sanity | `npm run test:sanity` | Account sign-in rejects invalid credentials safely |
| Regression | `npm run test:regression` | Product search, category listing, and isolated add-to-cart flow |
| API | `npm run test:api` | Public storefront/search responses and unauthenticated API access control |
| Local | `npm run test:local` | All suites on installed Chromium and API checks |
| All browsers | `npm test` | Browser suites on Chromium, Firefox, and WebKit, plus API checks |

The API suite uses Playwright's HTTP client. The shop's `/api/products` endpoint requires an API key, so the test verifies that an unauthenticated request is rejected; it does not send credentials or attempt to bypass access controls.

## Project layout

```text
tests/
  api/          public HTTP and API access checks
  pages/        reusable Page Object Model classes
  regression/   catalog and cart journeys
  sanity/       focused account checks
  smoke/        critical availability checks
  support/      safe test data
playwright.config.ts
```

The HTML report is written to `playwright-report/`. Failed browser tests capture screenshots and traces on retry. GitHub Actions installs the Playwright browsers and runs the complete cross-browser suite on pushes and pull requests.

Tests use a fresh browser context and do not create accounts or place orders. Local `.env` files, reports, and test results are excluded from Git; never commit real credentials.
