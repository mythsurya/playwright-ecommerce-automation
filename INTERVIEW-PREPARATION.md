# Playwright E-commerce Project - Interview Preparation Notes

## 1. The project in one sentence

This is a small Playwright and TypeScript portfolio framework that checks important guest shopping journeys on the Automation Practice storefront. It separates smoke, sanity, regression, and API checks, uses Page Object Model classes for the home and account pages, runs in Chromium locally, and is configured for Chromium, Firefox, and WebKit in CI.

**Project:** [playwright-ecommerce-automation](https://github.com/mythsurya/playwright-ecommerce-automation)  
**Target:** `https://automationpractice.techwithjatin.com`  
**Language and runner:** TypeScript with `@playwright/test`

## 2. A truthful 60-second introduction

> I have a manual game-testing background, where I learned to explore user flows, think about edge cases, reproduce defects, and report clear evidence. To build on that experience, I created a Playwright and TypeScript portfolio project for an e-commerce practice site.
>
> I organized checks into smoke, sanity, regression, and API suites. The current browser coverage checks that the storefront and account entry point are available, confirms that an invalid sign-in is rejected, searches the catalog, opens the T-shirts category, and adds a product to a fresh test cart without placing an order. The API checks cover the public storefront response, catalog search, and the expected unauthenticated response from the protected web-service endpoint.
>
> I use Playwright's test runner, auto-waiting assertions, reusable Page Object Model classes, isolated test contexts, an HTML report, failure screenshots, and traces on retry. The same tests are configured for Chromium, Firefox, and WebKit in GitHub Actions. I ran the local Chromium/API suites successfully and confirmed the GitHub Actions workflow completed successfully. My next step is expanding the framework with test IDs/data where available, broader cart and checkout scenarios, and authenticated API tests using an approved test account and API key.

Keep this introduction accurate to the work you personally performed. If asked which parts you implemented yourself versus learned or received help with, answer honestly and then explain the design and tests confidently.

## 3. A deeper project walkthrough

### What the project does

The project automates a few safe, repeatable user journeys against a public training storefront:

1. Open the home page and verify the title and key navigation.
2. Navigate to the account page as a guest and verify the sign-in interface.
3. Attempt sign-in with a deliberately invalid test identity and verify the application rejects it.
4. Search for a known catalog product and verify it appears in results.
5. Open the T-shirts category and verify that a product is listed.
6. Add a product to the browser-context cart and verify the confirmation. It does **not** proceed to checkout or place an order.
7. Make read-only HTTP requests for the storefront and catalog search, and confirm that the protected web-service API returns HTTP 401 without credentials.

The site appears to be a PrestaShop training site. Its account route redirects a guest to its login page; the account test checks that behavior rather than trying to create an account.

### How I organized the code

```text
playwright.config.ts
tests/
  api/
    storefront.api.spec.ts
  pages/
    account.page.ts
    home.page.ts
  regression/
    catalog.regression.spec.ts
  sanity/
    account.sanity.spec.ts
  smoke/
    storefront.smoke.spec.ts
  support/
    test-data.ts
```

- **`playwright.config.ts`** sets the base URL, projects, reporters, retry policy, traces, and screenshots.
- **`tests/pages/home.page.ts`** holds home-page actions: open the storefront, open the account link, and search.
- **`tests/pages/account.page.ts`** holds account-page actions: open the guest account route and attempt sign-in.
- **`tests/support/test-data.ts`** keeps the deliberately invalid account values separate from the test logic.
- **Suite folders** make it easy to run a focused group without mixing short release checks with broader catalog checks.
- **`README.md`** documents commands, suite intent, project layout, and the protected-API limitation.

This is an intentionally small POM, not a large abstraction layer. The catalog tests still use product-specific locators directly; if the catalog grows, I would add a `CatalogPage` or `ProductPage` only when that creates useful shared behavior.

### Suite meaning and current coverage

| Suite | What it is for | Current examples |
| --- | --- | --- |
| Smoke | Quickly determine whether essential storefront entry points are available | Home page/navigation, guest account entry point, empty cart page |
| Sanity | A focused check after a small change or deployment | Invalid account sign-in is rejected and the guest remains on authentication |
| Regression | Check existing catalog/cart behavior that could break after a change | Catalog search, T-shirts listing, add-to-cart confirmation |
| API | Validate HTTP responses and the access boundary without browser rendering | Home page HTML, search response content, unauthenticated API request returns 401 |

These labels describe how I intend to use the suites. They do not mean the project currently covers every feature in those broad test categories.

### Commands you can demonstrate

```bash
npm ci
npx playwright install
npm run test:smoke
npm run test:sanity
npm run test:regression
npm run test:api
npm run test:local
npm test
npx playwright show-report
```

- `npm run test:smoke`, `test:sanity`, and `test:regression` select Chromium and the matching suite folder.
- `npm run test:api` selects the API project.
- `npm run test:local` runs Chromium and API checks, which is useful with the installed local Chrome plus the HTTP tests.
- `npm test` runs the full configured Playwright suite: Chromium, Firefox, WebKit, and API.
- CI installs Playwright's browser binaries with `npx playwright install --with-deps`, then runs `npx playwright test`.

### How configuration helps

- `BASE_URL` can point the suite at another compatible test environment; otherwise it uses the public practice site.
- Each Playwright test receives an isolated browser context by default. This keeps cookies and the add-to-cart state from one test from intentionally being shared with another.
- `fullyParallel: true` allows tests to run concurrently. The workflows avoid depending on shared mutable test data.
- On CI, retries are set to two and workers to two. Retries are for collecting a second result/evidence; they are not a substitute for fixing a flaky test.
- The HTML reporter writes to `playwright-report/`.
- `screenshot: 'only-on-failure'` keeps screenshots focused on failures.
- `trace: 'on-first-retry'` records a trace when a test is retried, which helps inspect actions, snapshots, and timing.
- On Windows outside CI, the Chromium project uses the locally installed Chrome executable. In CI, Playwright-managed browser binaries are used.

### How an end-to-end test works

Use the product/cart regression as your example:

1. **Arrange:** Playwright creates a new browser page/context for this test.
2. **Navigate:** The test opens the known product page using the configured `baseURL`.
3. **Check initial state:** It confirms that the expected product heading is visible.
4. **Act:** It clicks the product page's add-to-cart control.
5. **Wait and assert:** Playwright's locator assertion waits for the cart confirmation to become visible. The test checks the success message and one-item count.
6. **Cleanup/isolation:** The test stops without checkout. Playwright closes the isolated context after the test, preventing this test's cart cookie from being reused by another test.

This is an end-to-end **add-to-cart** journey, not a full purchase or checkout test. Do not describe it as a complete checkout flow.

### How the API checks work

The API suite uses Playwright's `request` fixture, so it makes HTTP requests without rendering a browser page:

- `GET /` should return status 200, an HTML content type, and the storefront title text.
- `GET /search` passes the search parameters and verifies the matching product is in the response body.
- `GET /api/products` without an API key is expected to return 401. That checks the public authorization boundary; it does not test successful authenticated API operations.

If asked why there is no authenticated API test: the API requires a key and the project does not have a safely provisioned test key. I deliberately did not invent or publish credentials. With approved credentials stored in GitHub Actions secrets or a local environment variable, I would add a positive authorized-read check while keeping secrets out of source control and test output.

### How the GitHub Actions workflow works

The workflow runs for pushes and pull requests targeting `main` or `master`:

1. Checks out the repository.
2. Sets up Node.js.
3. Runs `npm ci` using the lockfile.
4. Installs the Playwright browsers and system dependencies.
5. Runs the full `npx playwright test` command.
6. Uploads the HTML report as a workflow artifact even if a test fails, unless the run was cancelled.

The project has passed the local Chromium/API suite (10 checks) and the repository's GitHub Actions workflow completed successfully for the uploaded framework. Always check the Actions page for the latest run before claiming a current CI result.

## 4. How my manual game-testing experience transfers

| Manual game-testing skill | How I apply it here |
| --- | --- |
| Exploring a game and learning its mechanics | Explore the store navigation, account entry, search, catalog, and cart before choosing automation coverage |
| Testing positive and negative paths | Check visible successful catalog/cart behavior and invalid sign-in rejection |
| Boundary and edge-case thinking | Consider empty cart, missing/invalid credentials, no-result searches, invalid product variants, and network failures |
| Reproducing bugs consistently | Use deterministic starting pages and test data, and record steps that can be replayed |
| Clear defect reports | Attach exact expected/actual behavior, URL, browser, screenshots, and trace evidence |
| Regression testing after a change | Re-run the affected suite and broader regression checks to catch collateral breaks |
| Exploratory testing | Identify new journeys and risks that scripted tests do not yet cover |
| Compatibility testing | Run the same UI checks against Chromium, Firefox, and WebKit in CI |

An important interview point: automation extends your testing; it does not replace exploratory testing. A good tester chooses valuable scenarios, understands risk, and then automates stable checks.

## 5. Likely interview questions and clear answers

### Q1. Tell me about your automation project.

**Answer:** I created a Playwright and TypeScript portfolio project for an e-commerce training site. It has separate smoke, sanity, regression, and API suites. The browser tests cover essential storefront navigation, a guest account path, invalid sign-in behavior, catalog search/category results, and add-to-cart confirmation. API checks cover the public storefront/search responses and the expected 401 for an unauthenticated protected API request. It uses POM classes for home/account behavior, Playwright's isolated contexts, and GitHub Actions for browser-based CI.

### Q2. You are a manual game tester. Why move toward automation?

**Answer:** Manual game testing developed my observation, exploratory, negative-path, and defect-reproduction skills. I wanted to apply those skills to repeatable regression coverage. Automation is a way to run stable checks consistently; it does not remove the need for manual exploration or test design.

### Q3. What exactly is Playwright?

**Answer:** Playwright is a browser automation and testing framework. Its test runner provides fixtures, assertions, projects, parallel execution, retries, reporters, screenshots, and traces. It supports Chromium, Firefox, and WebKit. In this project I use `@playwright/test` with TypeScript for both browser tests and HTTP API checks.

### Q4. What is Page Object Model, and how did you use it?

**Answer:** POM separates page-specific locators and user actions from test scenarios. `HomePage` exposes actions like opening the home page, opening the account link, and searching. `AccountPage` exposes opening the guest account route and attempting sign-in. This keeps those actions reusable and keeps the test focused on expected behavior. I kept the POM small; catalog interactions are still in the regression spec because there are only a few of them.

### Q5. Why TypeScript?

**Answer:** TypeScript adds static types to JavaScript. Playwright provides types for `Page`, `Locator`, request fixtures, and test options, so the editor can catch many mistakes early and provide autocomplete. It also makes the function inputs and page-object APIs easier to understand as the framework grows.

### Q6. Explain smoke, sanity, and regression testing.

**Answer:** Smoke testing is a short, high-priority check that the application and critical entry points are usable. Sanity testing is a focused check of a changed area. Regression testing checks existing behavior that might have been affected by a change. In this project, smoke checks the home/account/cart entry points, sanity checks invalid sign-in handling, and regression checks catalog search, category display, and adding a product to the cart.

### Q7. What is the difference between an API test and a UI test here?

**Answer:** A UI test uses a browser page and verifies rendered elements and user interactions. An API test uses Playwright's `request` fixture to validate HTTP status, headers, and response body without loading the UI. The API test runs faster and isolates the HTTP contract; it does not prove that the browser rendered the page correctly, so both kinds are useful.

### Q8. What do you mean by cross-browser testing?

**Answer:** Running the same relevant browser scenarios across different browser engines. Chromium is used for Chrome/Edge-like behavior, Firefox uses Gecko, and WebKit represents Safari's engine. This can reveal differences in rendering, events, CSS, or browser APIs. This repository configures Chromium, Firefox, and WebKit projects, and CI installs their browser binaries.

### Q9. How do you avoid tests affecting each other?

**Answer:** Playwright creates an isolated browser context for each test by default. That means cookies, local storage, and session state are not shared unless I explicitly configure shared state. The add-to-cart test stops after verifying the confirmation and does not checkout. For future tests that create backend data, I would use unique data per test and explicit cleanup where supported.

### Q10. How do you handle waits?

**Answer:** I prefer Playwright's locator actions and web-first assertions, such as `toBeVisible()` and `toHaveURL()`. They retry until the expected condition is true or the timeout expires. I avoid fixed sleeps because they are slow when the page is fast and unreliable when it is slow.

### Q11. How do you choose locators?

**Answer:** I prefer accessible, user-facing locators such as role and label because they reflect how a user understands the page and are generally more resilient. For this practice site, some controls have weak accessibility labels, so a stable ID or class such as `#SubmitLogin` is used where needed. If I owned the application, I would ask developers to add stable accessible names or test IDs rather than rely on fragile DOM structure.

### Q12. What happens when a test fails?

**Answer:** The list reporter gives the failed test and assertion. Playwright saves a screenshot on failure; on CI retry it also records a trace. I inspect the trace, locator, page state, and failure context, then decide whether the cause is an application defect, test-data issue, timing/locator issue, or environment problem. I avoid adding a retry or sleep just to hide a deterministic failure.

### Q13. What is a flaky test, and how would you investigate it?

**Answer:** A flaky test passes and fails intermittently without a relevant code change. I would compare traces and timestamps, inspect network and page readiness, look for shared state and non-deterministic data, and verify whether the selector or assertion is too broad. I would make setup deterministic, isolate data, and wait on the actual UI condition. Retries help expose evidence but do not fix the underlying cause.

### Q14. How do you manage test data?

**Answer:** For the current negative sign-in test, the non-existent `.invalid` email and dummy password are kept in `tests/support/test-data.ts`, not repeated inline. No real user account is needed. For future account or order tests, I would use a dedicated test environment and accounts from secure CI secrets, unique data per run, and cleanup or reset procedures.

### Q15. Why does the API test expect 401?

**Answer:** The practice site's `/api/products` web-service endpoint requires an API key. The check makes an unauthenticated request and expects HTTP 401, which verifies that the endpoint is not publicly accessible. It is an access-control boundary check, not an attempt to bypass authentication. A positive authorized API check would need a proper test key supplied securely.

### Q16. Does this project test login success or complete checkout?

**Answer:** No. The account test checks the guest redirect and rejection of deliberately invalid credentials. The cart test checks that adding a product displays the confirmation. It does not create an account, use a valid login, verify authenticated account pages, submit an address/payment, or place an order. Those are clear next steps that require approved test data and an appropriate test environment.

### Q17. How is CI set up?

**Answer:** GitHub Actions triggers on pushes and pull requests to `main` or `master`. It checks out code, configures Node.js, runs `npm ci`, installs Playwright browsers with OS dependencies, executes `npx playwright test`, and uploads the HTML report. I check the workflow summary and report artifact for result details.

### Q18. Why use `npm ci` in CI?

**Answer:** `npm ci` installs exactly from the committed lockfile and fails if the lockfile and package manifest disagree. It is reproducible and avoids silently changing dependency versions during a CI run. `npm install` is more appropriate when intentionally changing dependencies and updating the lockfile.

### Q19. What is the base URL configuration for?

**Answer:** `baseURL` lets the tests navigate with relative paths like `/` and `/my-account`. It defaults to the practice site, but `BASE_URL` can override it for another compatible test environment. This avoids hard-coding the host in every test.

### Q20. What is a Playwright project?

**Answer:** A project is a named configuration variant. This config defines Chromium, Firefox, WebKit, and API projects. Browser projects run UI tests and exclude the `api` folder; the API project matches `tests/api/**/*.spec.ts`. Projects make it possible to run the same suite under multiple browsers and apply different settings to API tests.

### Q21. What is the test pyramid?

**Answer:** It is a guideline to have many fast, focused lower-level tests, fewer integration tests, and a smaller number of full end-to-end tests because E2E tests are slower and more dependent on external systems. This project is a small website test suite rather than a complete application test pyramid. Its HTTP checks are not a substitute for unit or service tests of the store's backend, which we do not own.

### Q22. How do you report a defect found by automation?

**Answer:** I would include a concise title, environment/browser, build or commit, exact reproduction steps, expected and actual results, failure screenshot/trace, and whether it reproduces manually. I would include only safe test data and avoid secrets or personal customer information.

### Q23. What would you add next?

**Answer:** First I would confirm product requirements and a safe test environment. Then I would add product-detail variations, quantity/price checks, remove-from-cart and empty-cart transitions, and a clearly defined checkout flow if test payment data exists. I would add valid sign-in only with a dedicated test account, authenticated API coverage only with a securely provisioned key, stable selectors, test-data setup/cleanup, and CI artifacts/notifications. I would prioritize by user and business risk rather than simply increasing test count.

### Q24. What was a challenge in building the project?

**Answer:** The practice site has limited accessible names on some controls, and product cards can contain more than one link with the same product name. I inspected the actual page and used the product-name link inside the matching product card rather than a broad selector. I also kept the tests limited to safe guest behavior and avoided creating accounts or placing an order.

### Q25. What are the current limitations?

**Answer:** The suite covers a small number of guest flows on a third-party practice website, so selectors and availability depend on that site's UI and uptime. It has no successful login, account creation, payment, order placement, database validation, or authenticated API test. Test data is small and static because these scenarios do not create persistent data. The current API checks validate public HTTP behavior and one unauthenticated access boundary, not the complete API contract.

## 6. Example manual test case translated into automation

**Manual case:** A guest searches for a known T-shirt and adds it to the cart.

- **Precondition:** Storefront is reachable; no account is needed.
- **Steps:** Open home → search for `Faded Short Sleeves T-shirt` → verify the result → open its product page → add it to cart.
- **Expected:** The matching product is displayed; after adding, the cart confirmation appears and says there is one item.
- **Cleanup:** Do not checkout. The Playwright context closes at the end of the test.
- **Automation location:** `tests/regression/catalog.regression.spec.ts`

In a real team, I would also confirm whether the cart is expected to persist across sessions, how stock/price is controlled, and whether there is a dedicated test environment before turning this into a checkout scenario.

## 7. A practical interview demo

1. Open the repository and show the README suite table.
2. Explain `playwright.config.ts`: base URL, browser projects, API project, screenshots, and trace settings.
3. Show `tests/pages/home.page.ts` and explain how the page object hides repetitive actions.
4. Show one test, preferably the add-to-cart regression, and narrate arrange → action → assertion → isolated cleanup.
5. Run a focused command such as `npm run test:smoke` or `npm run test:regression`.
6. Open the HTML report with `npx playwright show-report`.
7. Show the GitHub Actions workflow and explain the CI steps and browser installation.
8. State the limits clearly: the framework does not currently test a real purchase or successful authenticated APIs.

## 8. Quick command reference

```bash
# Install exact dependency versions
npm ci

# Install Playwright browser binaries
npx playwright install

# Run a focused suite
npm run test:smoke
npm run test:sanity
npm run test:regression
npm run test:api

# Run local Chrome plus API checks
npm run test:local

# Run every configured browser project plus API tests
npm test

# View the last HTML report
npx playwright show-report
```

On this Windows project, local Chromium uses the installed Chrome executable. The full Firefox/WebKit suite requires their Playwright browsers to be installed; GitHub Actions installs them in CI.

## 9. Final interview reminders

- Explain **why** a scenario matters to a shopper, not just what command runs it.
- Separate what is implemented from what you would implement next.
- Do not claim this is a production e-commerce checkout framework; it is a portfolio test framework for a practice storefront.
- Do not claim successful login, payment, order, or authenticated API coverage.
- Say that the API 401 test confirms unauthenticated access is rejected; it does not validate all security behavior.
- Describe CI based on the workflow and its run result, not as a guarantee that every future run will pass.
- Use your game-testing experience as evidence of exploratory thinking, reproducibility, risk-based testing, and clear bug reporting.
