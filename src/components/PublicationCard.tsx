import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ExternalLink, Eye, Quote } from 'lucide-react';
import { useState } from 'react';
import { citations, citationsUpdated, citedBy } from '../data/citations';
import { SELF_NAME } from '../data/publications';
import type { Publication } from '../data/types';
import { asset, cn, doiUrl } from '../lib/utils';

const statusLabel: Record<string, string> = {
  accepted: 'Accepted',
  'under-revision': 'Under revision',
  submitted: 'Submitted',
};

export function Authors({ authors }: { authors: string[] }) {
  return (
    <span className="block text-sm leading-relaxed text-muted">
      {authors.map((a, i) => (
        <span key={a + i}>
          {a === SELF_NAME ? <strong className="font-semibold text-ink">{a}</strong> : a}
          {i < authors.length - 1 ? ', ' : ''}
        </span>
      ))}
    </span>
  );
}

export function PublicationCard({ pub, index, onPreview }: { pub: Publication; index?: number; onPreview?: () => void }) {
  const [open, setOpen] = useState(false);
  const published = !pub.status || pub.status === 'published';
  const citation = [pub.volume && `${pub.volume}`, pub.issue && `(${pub.issue})`].filter(Boolean).join('');

  return (
    <article
      onClick={(e) => {
        // tapping anywhere on the card (except links/buttons) opens the preview
        if (onPreview && !(e.target as HTMLElement).closest('a,button')) onPreview();
      }}
      className={cn('card group grid gap-4 border-l-4 border-l-wine/70 p-5 hover:shadow-md sm:grid-cols-[3.5rem_1fr] sm:p-6', onPreview && 'cursor-pointer hover:-translate-y-0.5')}
    >
      <div className="flex items-baseline gap-3 sm:block">
        <span className="inline-block rounded-md bg-wine/10 px-2 py-1 font-mono text-xs font-semibold text-wine">{pub.year}</span>
        {index !== undefined && <span className="font-mono text-[11px] text-muted sm:mt-1 sm:block">[{index}]</span>}
      </div>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {!published && <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">{statusLabel[pub.status!]}</span>}
          {pub.role && <span className="chip">{pub.role}</span>}
        </div>
        <h4 className="text-[1.05rem] font-semibold leading-snug text-navy transition-colors group-hover:text-wine">
          {onPreview ? (
            <button onClick={onPreview} className="text-left" aria-haspopup="dialog">
              {pub.title}
            </button>
          ) : pub.doi ? (
            <a href={doiUrl(pub.doi)} target="_blank" rel="noopener noreferrer">
              {pub.title}
            </a>
          ) : (
            pub.title
          )}
        </h4>
        <div className="mt-2">
          <Authors authors={pub.authors} />
        </div>
        <p className="mt-1.5 text-sm">
          <em className="text-ink">{pub.journal}</em>
          {published && (
            <span className="text-muted">
              {' '}
              {pub.year}
              {citation && `, ${citation}`}
              {pub.pages && `, ${pub.pages}`}
            </span>
          )}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
          {onPreview && (
            <button onClick={onPreview} aria-haspopup="dialog" className="inline-flex items-center gap-1.5 rounded-md bg-wine/10 px-2.5 py-0.5 text-xs font-semibold text-wine transition-colors hover:bg-wine hover:text-white">
              <Eye size={13} /> Preview
            </button>
          )}
          {pub.doi && (
            <a href={doiUrl(pub.doi)} target="_blank" rel="noopener noreferrer" className="rounded-md border border-line px-2 py-0.5 font-mono text-xs text-navy transition-colors hover:border-wine hover:text-wine">
              doi:{pub.doi}
            </a>
          )}
          {!!citedBy(pub.doi) && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-navy dark:bg-slate-800" title={`Citations (${citations.source}, ${citationsUpdated})`}>
              <Quote size={11} /> Cited by {citedBy(pub.doi)}
            </span>
          )}
          {(pub.url || pub.doi) && (
            <a href={pub.url ?? doiUrl(pub.doi!)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted hover:text-wine">
              Journal page <ExternalLink size={12} />
            </a>
          )}
          {pub.abstract && (
            <button
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="inline-flex items-center gap-1 text-muted hover:text-wine"
            >
              Abstract <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid gap-5 rounded-lg bg-paper p-4 md:grid-cols-[1fr_auto]">
                <p className="max-w-3xl text-[14.5px] leading-relaxed text-ink/85">{pub.abstract}</p>
                {pub.graphicalAbstract && (
                  <img src={asset(pub.graphicalAbstract)} alt={`Graphical abstract: ${pub.title}`} loading="lazy" className="w-full max-w-[260px] border border-line" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}
