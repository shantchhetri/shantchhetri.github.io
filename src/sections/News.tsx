import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Reveal } from '../components/Reveal';
import { Section } from '../components/Section';
import { sortedNews } from '../data/news';
import type { NewsCategory } from '../data/types';
import { asset, cn, formatNewsDate } from '../lib/utils';

const CATS: NewsCategory[] = ['Publication', 'Research Achievement', 'Conference', 'Award & Fellowship', 'Collaboration', 'Professional Update'];
const PAGE = 6;

/** Colour-coded category pills (used here and on the homepage). */
export function categoryStyle(c: NewsCategory) {
  switch (c) {
    case 'Publication':
      return 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300';
    case 'Award & Fellowship':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300';
    case 'Conference':
      return 'bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300';
    case 'Research Achievement':
      return 'bg-peach-100 text-peach-700 dark:bg-peach-400/15 dark:text-peach-300';
    case 'Collaboration':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300';
  }
}

export function News() {
  const [cat, setCat] = useState<'All' | NewsCategory>('All');
  const [shown, setShown] = useState(PAGE);
  const items = sortedNews.filter((n) => cat === 'All' || n.category === cat);
  const byYear = items.slice(0, shown).reduce<Record<string, typeof items>>((acc, n) => {
    (acc[n.date.slice(0, 4)] ||= []).push(n);
    return acc;
  }, {});

  return (
    <Section
      id="news"
      eyebrow="News & Updates"
      title={
        <>
          Recent <em>milestones</em>
        </>
      }
      intro="Publications, talks, awards and other updates, newest first."
    >
      <div className="mb-10 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter news by category">
        {(['All', ...CATS] as const).map((c) => {
          const n = c === 'All' ? sortedNews.length : sortedNews.filter((x) => x.category === c).length;
          if (!n) return null;
          return (
            <button
              key={c}
              onClick={() => {
                setCat(c);
                setShown(PAGE);
              }}
              aria-pressed={cat === c}
              className={cn(
                'rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors',
                cat === c ? 'border-wine bg-peach-400 text-slate-900' : 'border-line bg-surface text-muted hover:border-wine hover:text-wine',
              )}
            >
              {c} <span className="ml-1 opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-auto max-w-4xl space-y-10">
        {Object.entries(byYear)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([y, list]) => (
            <div key={y}>
              <h3 className="mb-4 text-2xl text-navy">{y}</h3>
              <ol className="space-y-3">
                {list.map((n, i) => (
                  <Reveal as="li" key={n.id} delay={i * 0.04}>
                    <article className="card card-hover flex gap-5 border-l-4 border-l-wine/70 p-5">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${categoryStyle(n.category)}`}>{n.category}</span>
                          <time className="font-mono text-xs text-muted">{formatNewsDate(n.date)}</time>
                        </div>
                        <h4 className="text-lg leading-snug text-navy">{n.title}</h4>
                        <p className="mt-1 text-[15px] leading-relaxed text-muted">{n.description}</p>
                        {n.link && (
                          <a href={n.link.href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-wine hover:underline">
                            {n.link.label} <ArrowUpRight size={14} />
                          </a>
                        )}
                      </div>
                      {n.image && <img src={asset(n.image)} alt="" loading="lazy" className="hidden h-24 w-36 rounded-lg object-cover sm:block" />}
                    </article>
                  </Reveal>
                ))}
              </ol>
            </div>
          ))}
      </div>
      {shown < items.length && (
        <div className="mt-10 text-center">
          <button onClick={() => setShown((s) => s + PAGE)} className="btn-ghost">
            Show earlier updates
          </button>
        </div>
      )}
    </Section>
  );
}
