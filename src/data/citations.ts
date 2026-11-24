// Citation numbers, refreshed automatically every day by scripts/update-citations.mjs
// (run in the "Deploy website" GitHub workflow). Do not edit citations.json by hand.
import data from './citations.json';

export type CitationData = {
  updated: string;
  source: string;
  sourceUrl: string;
  citations: number;
  hIndex: number | null;
  i10Index: number | null;
  perYear: { year: number; citations: number }[];
  byDoi: Record<string, number>;
};

export const citations = data as CitationData;

/** "Cited by" count for one paper, or null when the index doesn't list it yet. */
export const citedBy = (doi?: string): number | null => (doi ? citations.byDoi[doi.toLowerCase()] ?? null : null);

/** e.g. "24 November 2026" */
export const citationsUpdated = new Date(citations.updated + 'T00:00:00').toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
