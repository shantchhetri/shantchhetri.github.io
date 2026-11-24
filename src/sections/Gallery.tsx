import { AnimatePresence, motion } from 'framer-motion';
import { Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Reveal } from '../components/Reveal';
import { Section } from '../components/Section';
import { photos } from '../data/gallery';
import { asset, cn } from '../lib/utils';

export function Gallery() {
  const categories = useMemo(() => [...new Set(photos.map((p) => p.category))], []);
  const [cat, setCat] = useState('All');
  const [idx, setIdx] = useState<number | null>(null);
  const items = useMemo(() => (cat === 'All' ? photos : photos.filter((p) => p.category === cat)), [cat]);
  const step = useCallback((d: number) => setIdx((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);
  const current = idx !== null ? items[idx] : null;

  useEffect(() => {
    if (idx === null) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIdx(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [idx, step]);

  return (
    <Section
      id="gallery"
      eyebrow="Gallery"
      title={
        <>
          Moments from <em>research</em>
        </>
      }
      intro="The lab, synchrotron beamtime, conferences and the people I work with."
    >
      {photos.length === 0 ? (
        <Reveal className="mx-auto max-w-xl">
          <div className="card flex flex-col items-center gap-4 px-8 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-peach-400/10 text-wine">
              <Camera size={26} />
            </span>
            <p className="text-lg font-semibold text-navy">Photographs coming soon</p>
          </div>
        </Reveal>
      ) : (
        <>
          {categories.length > 1 && (
            <div className="mb-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter photos by category">
              {['All', ...categories].map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  aria-pressed={cat === c}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors',
                    cat === c ? 'border-wine bg-peach-400 text-slate-900' : 'border-line bg-surface text-muted hover:border-wine hover:text-wine',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <motion.ul layout className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            <AnimatePresence>
              {items.map((p, i) => (
                <motion.li
                  layout
                  key={p.src}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.04 }}
                  className="mb-4 break-inside-avoid"
                >
                  <button
                    onClick={() => setIdx(i)}
                    aria-label={`Open photo: ${p.title}`}
                    className="group relative block w-full overflow-hidden rounded-xl text-left shadow-sm transition-shadow hover:shadow-xl"
                  >
                    <img src={asset(p.src)} alt={p.title} loading="lazy" decoding="async" className="w-full transition-transform duration-700 group-hover:scale-[1.04]" />
                    <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/75 to-transparent p-4 pt-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/75">{p.category}</p>
                      <p className="font-semibold text-white">{p.title}</p>
                    </div>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </>
      )}

      {/* full-screen viewer */}
      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/90 p-4 sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Photo: ${current.title}`}
            onClick={(e) => e.target === e.currentTarget && setIdx(null)}
          >
            <button onClick={() => setIdx(null)} aria-label="Close" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <X size={20} />
            </button>
            <AnimatePresence mode="wait">
              <motion.img
                key={current.src}
                src={asset(current.src)}
                alt={current.title}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="max-h-[74vh] max-w-full rounded-lg object-contain"
              />
            </AnimatePresence>
            <div className="max-w-2xl text-center text-white">
              <p className="text-lg font-semibold">{current.title}</p>
              {(current.caption || current.date) && (
                <p className="mt-1 text-sm text-white/70">{[current.caption, current.date].filter(Boolean).join(' · ')}</p>
              )}
            </div>
            {items.length > 1 && (
              <div className="flex gap-3">
                <button onClick={() => step(-1)} aria-label="Previous photo" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => step(1)} aria-label="Next photo" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
