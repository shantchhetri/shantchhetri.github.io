import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SELF_NAME } from '../data/publications';
import type { Publication } from '../data/types';
import { asset, doiUrl } from '../lib/utils';

/**
 * Pop-up "title page" of a paper: journal header, title and author list,
 * animated in like a sheet of paper lifting towards the viewer.
 * If the paper has `screenshot` set in data/publications.ts, that image is
 * shown instead (e.g. a real screenshot of the article's first page).
 */

const statusText: Record<string, string> = {
  accepted: 'Manuscript accepted',
  'under-revision': 'Manuscript under revision',
  submitted: 'Manuscript submitted',
};

const sheet: Variants = {
  enter: (dir: number) => ({ opacity: 0, scale: 0.7, rotateX: 28, y: 90, x: dir * 80 }),
  show: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    y: 0,
    x: 0,
    transition: { type: 'spring', stiffness: 170, damping: 22, when: 'beforeChildren', staggerChildren: 0.08 },
  },
  exit: (dir: number) => ({ opacity: 0, scale: 0.9, x: dir * -80, transition: { duration: 0.22 } }),
};
const block: Variants = { enter: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };
const words: Variants = { enter: {}, show: { transition: { staggerChildren: 0.025 } } };
const word: Variants = { enter: { opacity: 0, y: '0.6em', filter: 'blur(4px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } } };
const people: Variants = { enter: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } };
const person: Variants = { enter: { opacity: 0, scale: 0.85, y: 6 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } } };

function TitlePage({ pub }: { pub: Publication }) {
  const published = !pub.status || pub.status === 'published';
  const meta = published
    ? [pub.year, pub.volume && `Vol. ${pub.volume}${pub.issue ? ` (${pub.issue})` : ''}`, pub.pages].filter(Boolean).join(' · ')
    : statusText[pub.status!];

  if (pub.screenshot) {
    return (
      <motion.figure variants={block} className="p-3 sm:p-4">
        <img src={asset(pub.screenshot)} alt={`First page of “${pub.title}”`} className="w-full rounded-md" />
      </motion.figure>
    );
  }

  return (
    <div className="px-6 pb-7 pt-6 sm:px-10 sm:pb-9 sm:pt-8">
      {/* journal header */}
      <motion.div variants={block} className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-peach-700 pb-3">
        <div>
          <p className="font-paper text-lg italic text-slate-800 sm:text-xl">{pub.journal}</p>
          <p className="mt-0.5 font-mono text-[11px] text-slate-500">{meta}</p>
        </div>
        <span className="rounded-sm bg-peach-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
          {published ? 'Research Article' : 'Manuscript'}
        </span>
      </motion.div>

      {/* title, word by word */}
      <motion.h3 variants={words} className="mt-6 font-paper text-[1.45rem] font-bold leading-[1.25] text-slate-900 sm:text-[1.9rem]">
        {pub.title.split(' ').map((w, i) => (
          <motion.span key={i} variants={word} className="mr-[0.28em] inline-block">
            {w}
          </motion.span>
        ))}
      </motion.h3>

      {/* authors pop in one by one; your name gets a highlight sweep */}
      <motion.p variants={people} className="mt-5 text-[15px] leading-relaxed text-slate-700">
        {pub.authors.map((a, i) => (
          <motion.span key={a + i} variants={person} className="inline-block">
            {a === SELF_NAME ? (
              <motion.strong
                initial={{ backgroundSize: '0% 100%' }}
                animate={{ backgroundSize: '100% 100%' }}
                transition={{ delay: 0.9 + i * 0.07, duration: 0.6, ease: 'easeOut' }}
                className="rounded bg-gradient-to-r from-peach-200 to-peach-100 bg-no-repeat px-1 font-bold text-slate-900 [&+span]:-ml-1"
              >
                {a}
              </motion.strong>
            ) : (
              a
            )}
            {i < pub.authors.length - 1 && <span className="mr-1">,</span>}
          </motion.span>
        ))}
      </motion.p>

      {/* abstract teaser */}
      {pub.abstract && (
        <motion.div variants={block} className="relative mt-6 max-h-24 overflow-hidden border-t border-slate-200 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-peach-700">Abstract</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-slate-600">{pub.abstract}</p>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
        </motion.div>
      )}

      {pub.doi && (
        <motion.p variants={block} className="mt-6 font-mono text-[11.5px] text-slate-500">
          DOI: {pub.doi}
        </motion.p>
      )}
    </div>
  );
}

export function PaperPreview({ list, index, onClose, onIndex }: { list: Publication[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const [dir, setDir] = useState(0);
  const open = index !== null && !!list[index];
  const pub = open ? list[index!] : null;

  const go = (d: number) => {
    if (index === null || list.length < 2) return;
    setDir(d);
    onIndex((index + d + list.length) % list.length);
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => panel.current?.focus(), 30);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('a[href],button');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <AnimatePresence>
      {open && pub && (
        <motion.div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} aria-hidden />
          <div className="pointer-events-none relative flex min-h-full items-center justify-center p-3 sm:p-8">

          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={`Paper preview: ${pub.title}`}
            tabIndex={-1}
            className="pointer-events-auto relative flex w-full max-w-3xl flex-col items-center focus:outline-none"
            style={{ perspective: 1400 }}
          >
            <div className="mb-3 flex w-full items-center justify-between text-white">
              <span className="font-mono text-xs text-slate-300">
                Paper {index! + 1} of {list.length}
              </span>
              <button onClick={onClose} aria-label="Close preview" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                <X size={18} />
              </button>
            </div>

            <div className="relative w-full">
              <AnimatePresence mode="wait" custom={dir} initial={true}>
                <motion.article
                  key={pub.id}
                  custom={dir}
                  variants={sheet}
                  initial={reduce ? false : 'enter'}
                  animate="show"
                  exit="exit"
                  className="origin-bottom rounded-xl bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/5"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <TitlePage pub={pub} />
                </motion.article>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex w-full flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button onClick={() => go(-1)} disabled={list.length < 2} aria-label="Previous paper" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => go(1)} disabled={list.length < 2} aria-label="Next paper" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30">
                  <ChevronRight size={20} />
                </button>
              </div>
              {pub.doi && (
                <a href={doiUrl(pub.doi)} target="_blank" rel="noopener noreferrer" className="btn-primary px-5 py-2.5">
                  Read full article <ExternalLink size={15} />
                </a>
              )}
            </div>
          </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
