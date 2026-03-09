import { useState, useEffect } from 'react';
import type { LetterboxdEntry } from '@/lib/queries';
import { letterboxdEntries as buildTimeEntries } from '@/data/letterboxd';

const LETTERBOXD_RSS_URL = 'https://letterboxd.com/samm_loves_film/rss/';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseDescription(html: string): { posterUrl: string | null; review: string | null } {
  if (!html) return { posterUrl: null, review: null };
  const imgMatch = html.match(/<img\s+src="([^"]+)"/);
  const posterUrl = imgMatch?.[1] ?? null;
  const paragraphs = html.match(/<p>(?!<img)([\s\S]*?)<\/p>/g);
  let review: string | null = null;
  if (paragraphs && paragraphs.length > 0) {
    review = paragraphs
      .map((p) => p.replace(/<\/?[^>]+>/g, '').trim())
      .filter(Boolean)
      .join('\n\n');
  }
  return { posterUrl, review: review || null };
}

function parseRssXml(xml: string): LetterboxdEntry[] {
  const entries: LetterboxdEntry[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1] as string;

    const get = (tag: string) => {
      const m = itemXml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
      return m?.[1]?.trim() ?? null;
    };
    const getCdata = (tag: string) => {
      const m = itemXml.match(
        new RegExp(`<${tag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`),
      );
      return m?.[1]?.trim() ?? null;
    };

    const title = getCdata('title') || get('title') || '';
    const link = get('link') || get('guid') || '';
    const pubDate = get('pubDate') || '';
    const filmTitle = decodeHtmlEntities(
      getCdata('letterboxd:filmTitle') || get('letterboxd:filmTitle') || '',
    );
    const filmYear = get('letterboxd:filmYear') || null;
    const memberRating = get('letterboxd:memberRating') || null;
    const rewatchVal = get('letterboxd:rewatch');
    const isRewatch = rewatchVal === 'Yes';
    const description = getCdata('description') || get('description') || '';
    const { posterUrl, review } = parseDescription(description);

    const parsedDate = pubDate ? new Date(pubDate) : null;
    if (!filmTitle || !parsedDate || isNaN(parsedDate.getTime())) continue;

    entries.push({
      title: decodeHtmlEntities(title),
      link,
      publishedAt: parsedDate.toISOString(),
      filmTitle,
      filmYear,
      rating: memberRating,
      isRewatch,
      posterUrl,
      review,
    });
  }

  return entries;
}

export function useLetterboxdFeed(enabled = true) {
  const [entries, setEntries] = useState<LetterboxdEntry[]>(buildTimeEntries);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!enabled || fetched) return;

    let cancelled = false;

    setLoading(true);
    setError(null);

    async function fetchFeed() {
      try {
        const res = await fetch(`${CORS_PROXY}${encodeURIComponent(LETTERBOXD_RSS_URL)}`);
        if (!res.ok) throw new Error(`RSS fetch returned ${res.status}`);
        const xml = await res.text();

        if (cancelled) return;
        setEntries(parseRssXml(xml));
        setFetched(true);
      } catch (err) {
        if (!cancelled) {
          // Live fetch failed — keep build-time entries, only set error if we have nothing
          if (buildTimeEntries.length === 0) {
            setError(err instanceof Error ? err.message : 'Failed to load Letterboxd feed');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFeed();
    return () => {
      cancelled = true;
    };
  }, [enabled, fetched]);

  return { entries, loading, error };
}
