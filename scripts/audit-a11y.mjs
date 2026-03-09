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

// ─── FIXTURE SWAP ───────────────────────────────────────────
// Swap build-time data files with deterministic fixtures for the audit,
// then restore originals when done (even on failure).

const LETTERBOXD_DATA = resolve(ROOT, 'src/data/letterboxd.ts');
const LETTERBOXD_BACKUP = LETTERBOXD_DATA + '.bak';
const LETTERBOXD_FIXTURE = resolve(__dirname, 'a11y-letterboxd-fixtures.ts');

function swapFixtures() {
  if (existsSync(LETTERBOXD_FIXTURE)) {
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
          } catch {
            console.log(`  ! Skipping ${route.name}: action failed (content may not be loaded)`);
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

  await browser.close();
  await server.close();
  restoreFixtures();

  // Write report
  writeFileSync(OUTPUT, JSON.stringify(allResults, null, 2));
  console.log(`\nResults written to ${OUTPUT}`);

  // Summary
  const totalViolations = allResults.reduce(
    (sum, r) => sum + r.violationCount,
    0
  );
  const uniqueIds = new Set(
    allResults.flatMap((r) => r.violations.map((v) => v.id))
  );
  console.log(
    `\nSummary: ${allResults.length} audits, ` +
      `${totalViolations} total violations (${uniqueIds.size} unique rules)`
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

  // Exit with error if any violations found (for CI)
  return totalViolations > 0 ? 1 : 0;
}

main()
  .then((exitCode) => process.exit(exitCode))
  .catch((e) => {
    restoreFixtures();
    console.error('Audit failed:', e);
    process.exit(1);
  });
