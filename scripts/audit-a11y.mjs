/**
 * Accessibility audit script — Playwright + axe-core
 *
 * Starts a Vite dev server, visits every page in both themes
 * (light + dark) at mobile and desktop widths, runs axe-core,
 * and outputs a JSON report.
 *
 * Usage:  npm run audit:a11y
 *    or:  node scripts/audit-a11y.mjs
 *
 * Prerequisites:
 *   npm install -D playwright @axe-core/playwright
 *   npx playwright install chromium
 */

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync, copyFileSync, existsSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createServer } from 'vite';
import { BLUESKY_PROFILE, BLUESKY_FEED } from './a11y-fixtures.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── CONFIGURATION ───────────────────────────────────────────
// Customize these for your project

const PORT = 5174;
const BASE = `http://localhost:${PORT}`;
const OUTPUT = process.env.CI ? 'axe-audit.json' : 'axe-audit.json';

// localStorage key for theme (set to null if not using theme toggle)
const THEME_KEY = 'app-theme';

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 812 },
};

// Open a dialog by clicking the first feed card button on the page
async function openFeedDialog(page) {
  const card = page.locator('.group button[type="button"]').first();
  await card.click();
  await page.locator('[role="dialog"]').waitFor({ timeout: 5000 });
}

// Routes to audit
// Optional `action` runs after navigation to set up interactive state (e.g. dialogs)
const ROUTES = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About Me' },
  { path: '/projects', name: 'Projects' },
  { path: '/blog', name: 'Blog' },
  { path: '/blog/hello-world', name: 'Blog Post' },
  { path: '/blog/bluesky', name: 'Bluesky Feed' },
  { path: '/blog/bluesky', name: 'Bluesky Dialog', action: openFeedDialog },
  { path: '/blog/letterboxd', name: 'Letterboxd Feed' },
  { path: '/blog/letterboxd', name: 'Letterboxd Dialog', action: openFeedDialog },
  { path: '/shows', name: 'Shows' },
];

// ─── AUDIT LOGIC ─────────────────────────────────────────────

/** Run axe-core on the current page and return a clean result object. */
async function runAxe(page) {
  const results = await new AxeBuilder({ page }).analyze();
  return {
    violations: results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodeCount: v.nodes.length,
      nodes: v.nodes.slice(0, 5).map((n) => ({
        target: n.target.join(' '),
        html: n.html.substring(0, 200),
        failureSummary: n.failureSummary,
      })),
    })),
    violationCount: results.violations.length,
    passCount: results.passes.length,
    incompleteCount: results.incomplete.length,
  };
}

function logResult(name, theme, viewport, result) {
  const icon = result.violationCount === 0 ? '\u2713' : '\u2717';
  console.log(
    `  ${icon} ${name} [${theme}, ${viewport}]: ` +
      `${result.violationCount} violations, ${result.passCount} passes`
  );
}

// ─── KEYBOARD NAV TESTS ─────────────────────────────────────
// Behavioral checks that Playwright can verify but axe-core cannot.

const KBD_TESTS = [
  {
    name: 'Skip-to-content link',
    path: '/',
    test: async (page) => {
      const skipLink = await page.locator('a[href="#main-content"], a[href="#content"], a.skip-link, a.sr-only').first().count();
      const mainLandmark = await page.locator('main[id], [role="main"][id]').count();
      const failures = [];
      if (skipLink === 0) failures.push('No skip-to-content link found');
      if (mainLandmark === 0) failures.push('Main content has no id target for skip link');
      return failures;
    },
  },
  {
    name: 'Tab reaches all nav links',
    path: '/',
    test: async (page) => {
      const failures = [];
      // Get visible nav link hrefs as ground truth
      const navHrefs = await page.locator('header nav a').evaluateAll(
        (els) => els.map((el) => el.getAttribute('href')).filter(Boolean)
      );
      // Tab through all header elements (skip link is before header, so
      // track whether we've entered the header before applying exit logic)
      const visitedHrefs = [];
      let enteredHeader = false;
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          return {
            inHeader: el.closest('header') !== null,
            href: el.getAttribute('href'),
          };
        });
        if (!info) continue;
        if (info.inHeader) enteredHeader = true;
        if (info.href) visitedHrefs.push(info.href);
        // Once we've left the header after entering it, stop
        if (enteredHeader && !info.inHeader) break;
      }
      for (const href of navHrefs) {
        if (!visitedHrefs.includes(href)) {
          failures.push(`Nav link "${href}" not reached via Tab`);
        }
      }
      return failures;
    },
  },
  {
    name: 'Dialog focus trap',
    path: '/blog/bluesky',
    test: async (page) => {
      const failures = [];
      // Open dialog
      try {
        await openFeedDialog(page);
      } catch {
        return ['Could not open dialog (content may not be loaded)'];
      }

      // Tab several times and verify focus stays inside dialog
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const insideDialog = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.closest('[role="dialog"]') !== null;
        });
        if (!insideDialog) {
          const focused = await page.evaluate(() => {
            const el = document.activeElement;
            return el ? `${el.tagName.toLowerCase()}${el.textContent?.trim().substring(0, 40) || ''}` : 'body';
          });
          failures.push(`Focus escaped dialog after ${i + 1} Tab(s) to: ${focused}`);
          break;
        }
      }
      return failures;
    },
  },
  {
    name: 'Escape closes dialog',
    path: '/blog/bluesky',
    test: async (page) => {
      try {
        await openFeedDialog(page);
      } catch {
        return ['Could not open dialog (content may not be loaded)'];
      }
      await page.keyboard.press('Escape');
      // Wait briefly for React to process
      await page.waitForTimeout(200);
      const dialogVisible = await page.locator('[role="dialog"]').count();
      if (dialogVisible > 0) {
        return ['Dialog did not close on Escape'];
      }
      return [];
    },
  },
  {
    name: 'Dialog focus restore',
    path: '/blog/bluesky',
    test: async (page) => {
      const card = page.locator('.group button[type="button"]').first();
      await card.focus();
      // Mark the trigger so we can verify exact element identity after close
      await card.evaluate((el) => el.setAttribute('data-focus-test', 'trigger'));
      try {
        await card.click();
        await page.locator('[role="dialog"]').waitFor({ timeout: 5000 });
      } catch {
        return ['Could not open dialog'];
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      const restoredToTrigger = await page.evaluate(
        () => document.activeElement?.getAttribute('data-focus-test') === 'trigger'
      );
      if (!restoredToTrigger) {
        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          return el ? el.tagName.toLowerCase() : 'body';
        });
        return [`Focus not restored to exact trigger element (focused: ${focused})`];
      }
      return [];
    },
  },
];

// ─── FIXTURE SWAP ───────────────────────────────────────────
// Swap build-time data files with deterministic fixtures for the audit,
// then restore originals when done (even on failure).

const LETTERBOXD_DATA = resolve(ROOT, 'src/data/letterboxd.ts');
const LETTERBOXD_BACKUP = LETTERBOXD_DATA + '.bak';
const LETTERBOXD_FIXTURE = resolve(__dirname, 'a11y-letterboxd-fixtures.ts');

function swapFixtures() {
  if (existsSync(LETTERBOXD_FIXTURE)) {
    if (existsSync(LETTERBOXD_BACKUP)) {
      console.error('Stale backup found — a previous run may have crashed.');
      console.error('Restore manually: copy .bak back to letterboxd.ts, then delete .bak');
      process.exit(1);
    }
    copyFileSync(LETTERBOXD_DATA, LETTERBOXD_BACKUP);
    copyFileSync(LETTERBOXD_FIXTURE, LETTERBOXD_DATA);
    console.log('Swapped letterboxd.ts with fixture data');
  }
}

function restoreFixtures() {
  if (existsSync(LETTERBOXD_BACKUP)) {
    copyFileSync(LETTERBOXD_BACKUP, LETTERBOXD_DATA);
    unlinkSync(LETTERBOXD_BACKUP);
    console.log('Restored original letterboxd.ts');
  }
}

async function main() {
  swapFixtures();

  // Start Vite dev server
  console.log('Starting Vite dev server...');
  const server = await createServer({
    server: { port: PORT, strictPort: true, https: false },
    logLevel: 'error',
  });
  await server.listen();
  console.log(`Dev server running at ${BASE}\n`);

  const browser = await chromium.launch();
  const allResults = [];

  const themes = THEME_KEY ? ['light', 'dark'] : ['default'];

  for (const theme of themes) {
    for (const [vpName, vpSize] of Object.entries(VIEWPORTS)) {
      console.log(`--- ${theme.toUpperCase()} / ${vpName.toUpperCase()} ---`);

      const context = await browser.newContext({ viewport: vpSize });
      const page = await context.newPage();

      // Intercept Bluesky API calls with deterministic fixture data
      const BSKY_API = 'https://public.api.bsky.app/xrpc';
      await page.route(`${BSKY_API}/app.bsky.actor.getProfile*`, (route) =>
        route.fulfill({ contentType: 'application/json', body: JSON.stringify(BLUESKY_PROFILE) }),
      );
      await page.route(`${BSKY_API}/app.bsky.feed.getAuthorFeed*`, (route) =>
        route.fulfill({ contentType: 'application/json', body: JSON.stringify(BLUESKY_FEED) }),
      );

      // Pre-set theme in localStorage before any navigation
      if (THEME_KEY) {
        await page.addInitScript(
          ([key, value]) => localStorage.setItem(key, value),
          [THEME_KEY, theme]
        );
      }

      for (const route of ROUTES) {
        await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle' });
        if (route.action) {
          try {
            await route.action(page);
          } catch (error) {
            console.error(`  ! Skipping ${route.name}: action failed (content may not be loaded)`);
            console.error(`    ${error.message}`);
            allResults.push({
              page: route.name,
              path: route.path,
              theme,
              viewport: vpName,
              violations: [],
              violationCount: 0,
              passCount: 0,
              incompleteCount: 0,
              skipped: true,
              skipReason: error.message,
            });
            continue;
          }
        }
        const result = await runAxe(page);
        allResults.push({
          page: route.name,
          path: route.path,
          theme,
          viewport: vpName,
          ...result,
        });
        logResult(route.name, theme, vpName, result);
      }

      await context.close();
    }
  }

  // ─── KEYBOARD NAV TESTS ───────────────────────────────────
  // Run once per theme at desktop viewport (keyboard behavior is viewport-independent)
  const kbdResults = [];

  for (const theme of themes) {
    console.log(`--- KEYBOARD [${theme.toUpperCase()}] ---`);

    const context = await browser.newContext({ viewport: VIEWPORTS.desktop });
    const page = await context.newPage();

    // Intercept Bluesky API calls
    const BSKY_API = 'https://public.api.bsky.app/xrpc';
    await page.route(`${BSKY_API}/app.bsky.actor.getProfile*`, (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(BLUESKY_PROFILE) }),
    );
    await page.route(`${BSKY_API}/app.bsky.feed.getAuthorFeed*`, (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(BLUESKY_FEED) }),
    );

    if (THEME_KEY) {
      await page.addInitScript(
        ([key, value]) => localStorage.setItem(key, value),
        [THEME_KEY, theme]
      );
    }

    for (const test of KBD_TESTS) {
      await page.goto(`${BASE}${test.path}`, { waitUntil: 'networkidle' });
      const failures = await test.test(page);
      const icon = failures.length === 0 ? '\u2713' : '\u2717';
      console.log(`  ${icon} ${test.name} [${theme}]: ${failures.length} failures`);
      for (const f of failures) console.log(`    - ${f}`);
      kbdResults.push({
        test: test.name,
        theme,
        failures,
        failureCount: failures.length,
      });
    }

    await context.close();
  }

  await browser.close();
  await server.close();
  restoreFixtures();

  // Write report
  const report = { axe: allResults, keyboard: kbdResults };
  writeFileSync(OUTPUT, JSON.stringify(report, null, 2));
  console.log(`\nResults written to ${OUTPUT}`);

  // Summary — axe
  const totalViolations = allResults.reduce(
    (sum, r) => sum + r.violationCount,
    0
  );
  const uniqueIds = new Set(
    allResults.flatMap((r) => r.violations.map((v) => v.id))
  );
  console.log(
    `\naxe-core: ${allResults.length} audits, ` +
      `${totalViolations} violations (${uniqueIds.size} unique rules)`
  );

  if (uniqueIds.size > 0) {
    console.log('\nUnique violations across all pages:');
    for (const id of uniqueIds) {
      const affected = allResults.filter((r) =>
        r.violations.some((v) => v.id === id)
      );
      const first = affected[0].violations.find((v) => v.id === id);
      console.log(`  - ${id} (${first.impact}): ${first.help}`);
      console.log(
        `    Affected: ${affected.map((r) => `${r.page} [${r.theme}/${r.viewport}]`).join(', ')}`
      );
    }
  }

  // Summary — skipped
  const skippedCount = allResults.filter((r) => r.skipped).length;
  if (skippedCount > 0) {
    console.log(`\n${skippedCount} route(s) skipped due to action failures`);
  }

  // Summary — keyboard
  const totalKbdFailures = kbdResults.reduce((sum, r) => sum + r.failureCount, 0);
  console.log(
    `\nKeyboard nav: ${kbdResults.length} tests, ${totalKbdFailures} failures`
  );

  // Exit with error if any violations or skips found (for CI)
  return (totalViolations > 0 || totalKbdFailures > 0 || skippedCount > 0) ? 1 : 0;
}

main()
  .then((exitCode) => process.exit(exitCode))
  .catch((e) => {
    restoreFixtures();
    console.error('Audit failed:', e);
    process.exit(1);
  });
