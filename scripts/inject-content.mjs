/**
 * Injects hand-authored content from content.jsonc into site components.
 *
 * Usage: node scripts/inject-content.mjs
 *
 * Reads content.jsonc and writes the values into the corresponding
 * React components. Each injection target is defined by a file path
 * and a transform function that receives the file contents and the
 * content data, returning the updated file contents.
 *
 * Safe to run repeatedly — it replaces content between known markers
 * or rewrites entire generated sections.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Strip JSONC comments and trailing commas while preserving strings.
function stripJsoncComments(text) {
  // Remove comments (// and /* */) while preserving strings
  text = text.replace(
    /"(?:[^"\\]|\\.)*"|\/\/.*$|\/\*[\s\S]*?\*\//gm,
    (match) => (match.startsWith('"') ? match : ''),
  );
  // Remove trailing commas before } or ]
  text = text.replace(/,\s*([}\]])/g, '$1');
  return text;
}

const raw = readFileSync(resolve(root, 'content.jsonc'), 'utf-8');
const content = JSON.parse(stripJsoncComments(raw));

// ─── HELPERS ────────────────────────────────────────────────

// Convert markdown links [text](url) and internal links [[Page]] to JSX.
// Internal links omit target/rel attributes.
function mdLinksToJsx(text) {
  // [[Page]] -> internal link using lowercase route
  text = text.replace(/\[\[([^\]]+)\]\]/g, (_match, label) => {
    const route = `/${label.toLowerCase()}`;
    return `<a href="${route}" className="underline hover:text-foreground">${label}</a>`;
  });
  // [text](url) -> external or internal link
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    const external = url.startsWith('http');
    const attrs = external
      ? ` target="_blank" rel="noopener noreferrer"`
      : '';
    return `<a href="${url}"${attrs} className="underline hover:text-foreground">${label}</a>`;
  });
  return text;
}

// Normalize a content value that may be a string or array of strings.
function toText(value) {
  return Array.isArray(value) ? value.join(' ') : value;
}

// Split a content value into paragraphs. Array items ending with \n
// start a new paragraph; otherwise consecutive items merge into one.
function toParagraphs(value) {
  const joined = toText(value);
  return joined
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ─── ICON MAP ───────────────────────────────────────────────
// Maps social label to Lucide icon component name
const socialIconMap = {
  Letterboxd: 'Film',
  Bluesky: 'BlueskyIcon',
  Instagram: 'Instagram',
  GitHub: 'Github',
};

// ─── INJECTION TARGETS ──────────────────────────────────────

const injections = [
  {
    file: 'src/components/Layout.tsx',
    transform(src) {
      src = src.replace(
        /const (?:GITHUB_URL|REPO_URL) = '.*?';/,
        `const REPO_URL = '${content.site.repoUrl}';`,
      );
      src = src.replace(
        /(<Link to="\/" className="[^"]*">)\s*\n?\s*.*?\s*\n?\s*(<\/Link>)/,
        `$1\n              ${content.site.name}\n            $2`,
      );
      return src;
    },
  },
  {
    file: 'src/pages/HomePage.tsx',
    transform(_src) {
      const { tagline, taglineAttribution, taglineUrl } = content.home;
      let quoteBody = tagline;
      let attribution = '';
      if (taglineAttribution && taglineUrl) {
        attribution = `<a href="${taglineUrl}" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">${taglineAttribution}</a>`;
      } else if (taglineAttribution) {
        attribution = taglineAttribution;
      }
      const attrLine = attribution
        ? `\n            <footer className="mt-1 text-xs text-muted-foreground/70">&mdash; ${attribution}</footer>`
        : '';

      const descriptorProp = content.site.descriptor
        ? ` descriptor="${content.site.descriptor}"`
        : '';

      const introParagraphs = toParagraphs(content.home.intro);
      const introJsx = introParagraphs
        .map((p) => `        <p className="text-muted-foreground">${mdLinksToJsx(p)}</p>`)
        .join('\n');

      return `import { Code, User } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { SocialLinks } from '@/components/SocialLinks';

export function HomePage() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <PageHeader title="${content.site.name}"${descriptorProp} />

      <blockquote className="mb-8 text-sm italic text-muted-foreground">
            ${quoteBody}${attrLine}
          </blockquote>

      <h2 className="mb-4 text-xl font-semibold">Welcome!</h2>
      <div className="mb-8 space-y-3">
${introJsx}
      </div>

      <SocialLinks />

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-semibold">Explore</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SectionCard
            to="/about"
            icon={User}
            title="About Me"
            description="${content.home.aboutTeaser}"
          />
          <SectionCard
            to="/projects"
            icon={Code}
            title="Projects"
            description="${content.home.projectsTeaser}"
          />
        </div>
      </section>
    </div>
  );
}
`;
    },
  },
  {
    file: 'src/pages/AboutPage.tsx',
    transform(src) {
      const sections = [
        { heading: 'Improv', key: 'improv' },
        { heading: 'Movies', key: 'movies' },
        { heading: 'TTRPGs', key: 'ttrpgs' },
        { heading: 'Code', key: 'code' },
      ];
      for (const { heading, key } of sections) {
        // Match from heading through all <p> tags until </section>
        const re = new RegExp(
          `(${heading}</h2>)\\s*(?:<p class[^>]*>[\\s\\S]*?</p>\\s*)+`,
          's',
        );
        const paragraphs = toParagraphs(content.about[key]);
        const pTags = paragraphs
          .map((p, i) => {
            const mt = i > 0 ? ' mt-3' : '';
            return `          <p className="${mt ? 'mt-3 ' : ''}text-muted-foreground">${mdLinksToJsx(p)}</p>`;
          })
          .join('\n');
        src = src.replace(re, `$1\n${pTags}\n        `);
      }
      return src;
    },
  },
  {
    file: 'src/pages/ProjectsPage.tsx',
    transform(_src) {
      const projectCard = ({ name, description, tech, link }) => {
        const paragraphs = toParagraphs(description);
        const heading = link
          ? `${name} <a href="${link}" target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex translate-y-[-1px] align-middle text-muted-foreground hover:text-foreground" aria-label="Visit ${name}"><ExternalLink className="h-4 w-4" /></a>`
          : name;
        const pTags = paragraphs
          .map((p, i) => {
            const mt = i === 0 ? 'mt-1' : 'mt-3';
            return `            <p className="${mt} text-sm text-muted-foreground">${mdLinksToJsx(p)}</p>`;
          })
          .join('\n');
        const techLine = tech?.length
          ? `\n            <p className="mt-2 text-xs text-muted-foreground">${tech.join(' · ')}</p>`
          : '';
        return `          <article className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold text-card-foreground">${heading}</h3>
${pTags}${techLine}
          </article>`;
      };

      const tabletopSection =
        content.projects.tabletop?.length
          ? `
      <section>
        <h2 className="mb-4 text-xl font-semibold">Tabletop Games</h2>
        <div className="space-y-6">
${content.projects.tabletop.map(projectCard).join('\n')}
        </div>
      </section>`
          : '';

      const hasLinks = content.projects.code.some((p) => p.link) ||
        content.projects.tabletop?.some((p) => p.link);
      const externalLinkImport = hasLinks
        ? `import { ExternalLink } from 'lucide-react';\n`
        : '';

      return `${externalLinkImport}import { PageHeader } from '@/components/PageHeader';

export function ProjectsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Projects" />

      <section${tabletopSection ? ' className="mb-12"' : ''}>
        <h2 className="mb-4 text-xl font-semibold">Code Projects</h2>
        <div className="space-y-6">
${content.projects.code.map(projectCard).join('\n')}
        </div>
      </section>${tabletopSection}
    </div>
  );
}
`;
    },
  },
  {
    file: 'src/components/SocialLinks.tsx',
    transform(_src) {
      const lucideIcons = content.social
        .map((s) => socialIconMap[s.label])
        .filter((icon) => icon && icon !== 'BlueskyIcon');
      const uniqueLucide = [...new Set(lucideIcons)];
      const needsBluesky = content.social.some((s) => socialIconMap[s.label] === 'BlueskyIcon');

      const entries = content.social.map((s) => {
        const icon = socialIconMap[s.label] || 'Link';
        return `  { href: '${s.href}', label: '${s.label}', icon: ${icon} },`;
      });

      const blueskyComponent = needsBluesky
        ? `
function BlueskyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 568 501" className={className} fill="currentColor" aria-hidden="true">
      <path d="M123.121 33.664C188.241 82.553 258.281 181.68 284 234.873c25.719-53.192 95.759-152.32 160.879-201.21C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555-20.275 72.453-94.155 90.933-159.875 79.748C507.222 323.8 536.444 388.56 473.333 453.32c-119.86 122.992-172.272-30.859-185.702-70.281-2.462-7.227-3.614-10.608-3.631-7.733-.017-2.875-1.169.506-3.631 7.733-13.43 39.422-65.842 193.273-185.702 70.281-63.111-64.76-33.889-129.52 80.986-149.071-65.72 11.185-139.6-7.295-159.875-79.748C10.045 203.66.1 75.293.1 57.947.1-28.906 76.18-1.611 123.121 33.664Z" />
    </svg>
  );
}
`
        : '';

      return `import { ${uniqueLucide.join(', ')} } from 'lucide-react';
${blueskyComponent}
const socialLinks = [
${entries.join('\n')}
];

export function SocialLinks() {
  return (
    <nav aria-label="Social profiles" className="flex items-center justify-center gap-4">
      {socialLinks.map(({ href, label, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={label}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
`;
    },
  },
];

// ─── RUN ─────────────────────────────────────────────────────

let changed = 0;

for (const { file, transform } of injections) {
  const filepath = resolve(root, file);
  const before = readFileSync(filepath, 'utf-8');
  const raw = transform(before);
  // Write, format, then compare against original to detect real changes
  writeFileSync(filepath, raw);
  execSync(`npx prettier --write "${filepath}"`, { cwd: root, stdio: 'ignore' });
  const after = readFileSync(filepath, 'utf-8');
  if (after !== before) {
    console.log(`  Updated: ${file}`);
    changed++;
  } else {
    console.log(`  No change: ${file}`);
  }
}

console.log(`\nDone. ${changed} file(s) updated.`);
