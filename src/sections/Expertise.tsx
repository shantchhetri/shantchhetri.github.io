import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Atom, Code2, Cpu, FlaskConical, Gauge, Layers, Microscope, ScanLine, Sun, Waves, Zap, type LucideIcon } from 'lucide-react';
import type { MouseEvent } from 'react';
import { Reveal } from '../components/Reveal';
import { expertiseDomains, researchDomains, type Domain, type IconName } from '../data/expertise';
import { profile } from '../data/profile';
import { cn } from '../lib/utils';

const ICONS: Record<IconName, LucideIcon> = {
  flask: FlaskConical,
  layers: Layers,
  cpu: Cpu,
  zap: Zap,
  atom: Atom,
  sun: Sun,
  microscope: Microscope,
  gauge: Gauge,
  scan: ScanLine,
  waves: Waves,
  code: Code2,
};

const card: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1], when: 'beforeChildren', staggerChildren: 0.05 },
  }),
};
const line: Variants = { hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };
const icon: Variants = { hidden: { scale: 0.4, rotate: -20, opacity: 0 }, show: { scale: 1, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 16 } } };
const pill: Variants = { hidden: { opacity: 0, y: 8, scale: 0.92 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } } };

/** Moves a soft radial spotlight with the cursor. */
function spotlight(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

function DomainCard({ d, i, compact, className }: { d: Domain; i: number; compact?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const Icon = ICONS[d.icon];
  return (
    <motion.article
      custom={i}
      variants={card}
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      whileHover={reduce ? undefined : { y: -6 }}
      onMouseMove={spotlight}
      className={cn(
        'card group relative overflow-hidden rounded-2xl transition-[border-color,box-shadow] duration-300 hover:border-wine/40 hover:shadow-xl hover:shadow-peach-900/10',
        compact ? 'p-6' : 'p-7',
        className,
      )}
    >
      {/* cursor spotlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), rgb(var(--wine) / 0.09), transparent 60%)' }}
      />
      {/* animated top accent */}
      <motion.span variants={line} aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left bg-gradient-to-r from-peach-300 via-peach-500 to-peach-400" />

      <div className="relative flex items-start gap-4">
        <motion.span
          variants={icon}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-peach-400 to-peach-700 text-white shadow-lg shadow-peach-900/20 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
        >
          <Icon size={22} strokeWidth={1.8} />
        </motion.span>
        <div className="min-w-0">
          <span className="font-mono text-[11px] font-semibold text-wine">{String(i + 1).padStart(2, '0')}</span>
          <h4 className={cn('font-bold leading-snug text-navy', compact ? 'text-base' : 'text-lg')}>{d.title}</h4>
        </div>
      </div>
      <p className="relative mt-3 text-sm leading-relaxed text-muted">{d.description}</p>

      <ul className="relative mt-5 flex flex-wrap gap-2" aria-label={`${d.title} subtopics`}>
        {d.subtopics.map((s) => (
          <motion.li
            key={s}
            variants={pill}
            className="inline-flex items-center gap-1.5 rounded-full border border-wine/25 bg-peach-400/[0.07] px-3 py-1 text-[12.5px] font-medium text-peach-800 transition-colors duration-200 hover:border-wine hover:bg-peach-400 hover:text-slate-900 dark:text-peach-200"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
            {s}
          </motion.li>
        ))}
      </ul>
    </motion.article>
  );
}

export function Expertise() {
  // bento layout for the 5 expertise blocks: 3 across, then 2 wider
  const span = (i: number) => (i < 3 ? 'lg:col-span-2' : 'lg:col-span-3');

  return (
    <section id="research" aria-labelledby="research-title" className="relative overflow-hidden bg-surface py-16 sm:py-20">
      <div className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-peach-400/10 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-[28rem] w-[28rem] rounded-full bg-sky-400/10 blur-[130px]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgb(var(--line))_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
        aria-hidden
      />

      <div className="container-page relative">
        <Reveal className="mx-auto mb-14 max-w-3xl text-center">
          <p className="chip mb-4 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
            Research
          </p>
          <h2 id="research-title" className="text-3xl text-navy sm:text-4xl lg:text-[2.6rem] lg:leading-tight">
            Research experience & <span className="text-wine">technical expertise</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-[17px]">
            Research Scholar, {profile.department}, {profile.institutionShort} (2020 – present). My work spans six connected domains, from making
            the molecule to measuring the device.
          </p>
        </Reveal>

        <h3 className="mb-6 flex items-center gap-3 text-xl text-navy">
          <span className="h-px w-8 bg-peach-400" aria-hidden /> Research experience
        </h3>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {researchDomains.map((d, i) => (
            <DomainCard key={d.title} d={d} i={i} />
          ))}
        </div>

        <h3 className="mb-6 mt-20 flex items-center gap-3 text-xl text-navy">
          <span className="h-px w-8 bg-peach-400" aria-hidden /> Technical expertise
        </h3>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {expertiseDomains.map((d, i) => (
            <DomainCard key={d.title} d={d} i={i} compact className={cn(span(i), i === 4 && 'md:col-span-2 lg:col-span-3')} />
          ))}
        </div>
      </div>
    </section>
  );
}
