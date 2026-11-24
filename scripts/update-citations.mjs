// Refreshes the citation numbers shown on the website (src/data/citations.json).
//
// Source: OpenAlex (https://openalex.org), the open scholarly index, looked up by ORCID.
// Google Scholar has no API and blocks automated readers with a CAPTCHA, so it cannot be
// read automatically; the website links to the Scholar profile instead.
//
// Run by the "Deploy website" GitHub workflow every day and on every upload.
// If OpenAlex can't be reached, the previous file is kept (no empty or made-up numbers).
import { readFileSync, writeFileSync } from 'node:fs';

const ORCID = '0009-0003-3741-0126';
const OUT = new URL('../src/data/citations.json', import.meta.url);
const API = 'https://api.openalex.org';

async function get(path) {
  const res = await fetch(API + path, { headers: { 'User-Agent': 'academic-website-citation-updater' } });
  if (!res.ok) throw new Error(`OpenAlex answered ${res.status} for ${path}`);
  return res.json();
}

async function main() {
  const author = await get(`/authors/orcid:${ORCID}`);
  const id = author.id.split('/').pop();
  const works = await get(`/works?filter=author.id:${id}&per-page=200&select=doi,cited_by_count`);

  const byDoi = {};
  for (const w of works.results) {
    if (w.doi) byDoi[w.doi.replace(/^https?:\/\/doi\.org\//i, '').toLowerCase()] = w.cited_by_count;
  }

  const data = {
    source: 'OpenAlex',
    sourceUrl: `https://openalex.org/authors/${id}`,
    citations: author.cited_by_count,
    hIndex: author.summary_stats?.h_index ?? null,
    i10Index: author.summary_stats?.i10_index ?? null,
    perYear: (author.counts_by_year ?? [])
      .map((y) => ({ year: y.year, citations: y.cited_by_count }))
      .sort((a, b) => a.year - b.year),
    byDoi,
  };
  if (!Number.isFinite(data.citations)) throw new Error('no citation count in the OpenAlex record');

  let old = null;
  try {
    old = JSON.parse(readFileSync(OUT, 'utf8'));
  } catch {}
  const { updated: _u, ...oldData } = old ?? {};
  if (old && JSON.stringify(oldData) === JSON.stringify(data)) {
    console.log('Citations: no change', { citations: data.citations, h: data.hIndex, i10: data.i10Index });
    return;
  }
  writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), ...data }, null, 2) + '\n');
  console.log('Citations: updated', { citations: data.citations, h: data.hIndex, i10: data.i10Index });
}

main().catch((e) => console.warn('Citations: kept previous numbers â€”', e.message));
