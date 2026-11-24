import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full bg-peach-400 text-slate-900 shadow-lg shadow-peach-400/40 transition-transform hover:-translate-y-0.5 sm:bottom-8 sm:right-8"
        >
          <ArrowUp size={17} strokeWidth={1.6} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
