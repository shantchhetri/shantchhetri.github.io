import { AnimatePresence, motion } from 'framer-motion';
import { Award, BookOpen, FlaskConical, GraduationCap, Mic, Presentation, Users, Wrench, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Section } from '../components/Section';
import { journey } from '../data/journey';
import type { JourneyKind } from '../data/types';
import { cn } from '../lib/utils';

const GROUPS: { label: string; kinds: JourneyKind[]; icon: LucideIcon }[] = [
  { label: 'Qualifications', kinds: ['Education'], icon: GraduationCap },
  { label: 'Research positions', kinds: ['Research Position'], icon: FlaskConical },
  { label: 'Awards & fellowships', kinds: ['Award', 'Fellowship'], icon: Award },
  { label: 'Talks & presentations', kinds: ['Invited Talk', 'Presentation'], icon: Mic },
  { label: 'Training & teaching', kinds: ['Training', 'Teaching'], icon: Wrench },
  { label: 'Memberships', kinds: ['Membership'], icon: Users },
];

const kindIcon: Partial<Record<JourneyKind, LucideIcon>> = {
  'Invited Talk': Presentation,
  Teaching: BookOpen,
};

export function Journey() {
  const [g, setG] = useState<number | null>(null);
  const items = journey
    .filter((j) => g === null || GROUPS[g].kinds.includes(j.kind))
    .sort((a, b) => b.sortYear - a.sortYear);

  return (
    <Section
      id="journey"
      index="06"
      eyebrow="Academic Journey"
      tone="surface"
      title={
        <>
          Qualifications, positions & <em>recognition</em>
        </>
      }
      intro="An interactive record of my academic development. Choose a category to focus the timeline."
    >
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ul className="card flex flex-wrap gap-1 p-2 lg:sticky lg:top-24 lg:flex-col" role="group" aria-label="Timeline categories">
            <li>
              <button
                onClick={() => setG(null)}
                aria-pressed={g === null}
                className={cn('w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors lg:text-[15px]', g === null ? 'bg-peach-400 text-slate-900' : 'text-muted hover:bg-paper hover:text-navy')}
              >
                All entries <span className="ml-1 font-mono text-[11px]">{journey.length}</span>
              </button>
            </li>
            {GROUPS.map((grp, i) => {
              const Icon = grp.icon;
              const n = journey.filter((j) => grp.kinds.includes(j.kind)).length;
              return (
                <li key={grp.label}>
                  <button
                    onClick={() => setG(i)}
                    aria-pressed={g === i}
                    className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors lg:text-[15px]', g === i ? 'bg-peach-400 text-slate-900' : 'text-muted hover:bg-paper hover:text-navy')}
                  >
                    <Icon size={16} strokeWidth={1.5} className="hidden lg:block" />
                    {grp.label} <span className="ml-auto font-mono text-[11px]">{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <ol className="card relative px-4 py-2 sm:px-6 lg:col-span-8">
          <span className="absolute bottom-6 left-[9rem] top-6 hidden w-px bg-line sm:block" aria-hidden />
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((j) => {
              const grp = GROUPS.find((x) => x.kinds.includes(j.kind))!;
              const Icon = kindIcon[j.kind] ?? grp.icon;
              return (
                <motion.li
                  key={j.id}
                  layout
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.35 }}
                  className="relative grid gap-2 py-5 sm:grid-cols-[7.5rem_1fr] sm:gap-0"
                >
                  <p className="font-mono text-xs text-wine sm:pr-6 sm:pt-1 sm:text-right">{j.period}</p>
                  <span className="absolute left-[7.5rem] top-5 hidden -translate-x-1/2 rounded-full bg-peach-400/10 p-1.5 text-wine sm:block" aria-hidden>
                    <Icon size={14} strokeWidth={1.6} />
                  </span>
                  <div className={cn('sm:pl-8', j.placeholder && 'opacity-60')}>
                    <p className="font-mono text-[10.5px] uppercase tracking-widest text-muted">{j.kind}</p>
                    <h3 className="mt-0.5 text-lg leading-snug text-navy">{j.title}</h3>
                    <p className="text-sm text-muted">{j.org}</p>
                    {j.detail && <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink/80">{j.detail}</p>}
                    {j.placeholder && <p className="mt-1 text-xs italic text-wine">Placeholder — edit in src/data/journey.ts</p>}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </div>
    </Section>
  );
}
