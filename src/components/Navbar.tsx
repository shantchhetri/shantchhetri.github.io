import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { pageHref, type Page } from '../lib/router';
import { cn } from '../lib/utils';

export const NAV: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'research', label: 'Research' },
  { id: 'publications', label: 'Publications' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'news', label: 'News' },
  { id: 'asap', label: 'ASAP Articles' },
  { id: 'cv', label: 'CV' },
  { id: 'contact', label: 'Contact' },
];

/** Tab bar: each item opens its own page. */
export function Navbar({ page }: { page: Page }) {
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [page]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300',
        scrolled || open ? 'border-line bg-surface/90 shadow-sm backdrop-blur-md' : 'border-transparent bg-surface/70 backdrop-blur-sm',
      )}
    >
      <button
        onClick={() => {
          const m = document.getElementById('main');
          m?.setAttribute('tabindex', '-1');
          m?.focus();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </button>
      <nav aria-label="Primary" className="container-page relative flex h-16 items-center justify-between lg:justify-center">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-navy lg:hidden"
        >
          {open ? <X size={20} strokeWidth={1.8} /> : <Menu size={20} strokeWidth={1.8} />}
          {NAV.find((n) => n.id === page)?.label}
        </button>

        <ul className="hidden items-center gap-1 rounded-full border border-line bg-surface/80 p-1 shadow-sm lg:flex">
          {NAV.map((item) => (
            <li key={item.id}>
              <a
                href={pageHref(item.id)}
                aria-current={page === item.id ? 'page' : undefined}
                className={cn(
                  'relative block rounded-full px-4 py-1.5 text-[13.5px] font-medium transition-colors',
                  page === item.id ? 'text-navy' : 'text-muted hover:text-navy',
                )}
              >
                {page === item.id && (
                  <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full bg-slate-200 dark:bg-slate-700" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
                <span className="relative">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <button
          onClick={toggle}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-navy lg:absolute lg:right-8"
        >
          {dark ? <Sun size={17} strokeWidth={1.6} /> : <Moon size={17} strokeWidth={1.6} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="container-page overflow-hidden lg:hidden"
          >
            {NAV.map((item) => (
              <li key={item.id} className="border-t border-line first:border-t-0">
                <a
                  href={pageHref(item.id)}
                  aria-current={page === item.id ? 'page' : undefined}
                  className={cn('flex items-center justify-between py-3 text-base font-semibold', page === item.id ? 'text-wine' : 'text-ink')}
                >
                  {item.label}
                  {page === item.id && <span className="h-1.5 w-1.5 rounded-full bg-peach-400" />}
                </a>
              </li>
            ))}
            <li className="h-3" />
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
