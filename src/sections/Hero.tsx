import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, Download, FileText, Mic, PenLine, Users } from 'lucide-react';
import { ChargeTransportField } from '../components/ChargeTransportField';
import { CountUp } from '../components/CountUp';
import { Reveal } from '../components/Reveal';
import { journey, mentees } from '../data/journey';
import { sortedNews } from '../data/news';
import { cv, profile } from '../data/profile';
import { publications, publishedCount } from '../data/publications';
import { pageHref } from '../lib/router';
import { asset, formatNewsDate } from '../lib/utils';
import { categoryStyle } from './News';

// Counted from the data files, so they stay accurate as you add entries.
const firstAuthorWorks = publications.filter((p) => p.role?.toLowerCase().includes('first')).length;
const talks = journey.filter((j) => j.kind === 'Invited Talk' || j.kind === 'Presentation').length;
const STATS = [
  { icon: BookOpen, value: publishedCount, label: 'Peer-reviewed articles' },
  { icon: PenLine, value: firstAuthorWorks, label: 'First / corresponding-author works' },
  { icon: Users, value: mentees.length, label: 'Students mentored' },
  { icon: Mic, value: talks, label: 'Talks & posters' },
];

export function Hero() {
  const reduce = useReducedMotion();
  const fade = (d: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section id="home" aria-label="Introduction">
      <div className="relative overflow-hidden bg-surface">
        <ChargeTransportField />
        {/* keep the text side calm and readable */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-surface/10" aria-hidden />

        <div className="container-page relative grid min-h-[calc(92svh-4rem)] items-center gap-12 py-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.p {...fade(0.05)} className="chip mb-6 gap-2 px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-peach-400" />
              {profile.department} · {profile.institutionShort}
            </motion.p>
            <motion.h1 {...fade(0.12)} className="text-5xl font-extrabold leading-[1.02] text-navy sm:text-6xl lg:text-7xl">
              Shant Chhetri<span className="text-wine">.</span>
            </motion.h1>
            <motion.p {...fade(0.2)} className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-base font-medium text-muted sm:text-lg">
              {profile.designation.split('|').map((part, i) => (
                <span key={part} className="flex items-center gap-3">
                  {i > 0 && <span className="h-1 w-1 rounded-full bg-peach-400" />}
                  {part.trim()}
                </span>
              ))}
            </motion.p>
            <motion.p {...fade(0.28)} className="mt-7 max-w-2xl text-lg leading-relaxed text-ink sm:text-xl">
              {profile.intro}
            </motion.p>
            <motion.p {...fade(0.34)} className="mt-5 text-[15px] text-muted">
              Currently exploring <span className="font-semibold text-wine">the fundamentals of charge transport in organic semiconductors</span>.
            </motion.p>
            <motion.div {...fade(0.42)} className="mt-9 flex flex-wrap gap-3">
              <a href={pageHref('research')} className="btn-primary px-6 py-3">
                Explore My Research <ArrowRight size={16} />
              </a>
              <a href={pageHref('publications')} className="btn-ghost px-6 py-3">
                <FileText size={16} /> View Publications
              </a>
              <a href={asset(cv.file)} download className="btn-ghost px-6 py-3">
                <Download size={16} /> Download CV
              </a>
            </motion.div>
          </div>

          {profile.portrait && (
            // wrapper carries the shift to the far right (the figure's own transform is used by its fade-in)
            <div className="lg:col-span-5 lg:flex lg:justify-end lg:translate-x-[max(0px,calc((100vw_-_75rem)/2_-_1rem))]">
            <motion.figure {...fade(0.3)} className="mx-auto w-full max-w-[240px] lg:mx-0 lg:max-w-[250px]">
              <div className="relative">
                <div className="absolute -inset-1 rounded-[1.6rem] bg-gradient-to-br from-peach-300/70 via-peach-500/10 to-peach-400/50 blur-sm" aria-hidden />
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-surface shadow-xl shadow-slate-900/10">
                  <img src={asset(profile.portrait)} alt={`Portrait of ${profile.name}`} width={960} height={1111} className="h-full w-full object-cover object-[32%_30%]" />
                </div>
              </div>
            </motion.figure>
            </div>
          )}
        </div>
      </div>

      {/* Stats band */}
      <div className="border-y border-line bg-paper">
        <dl className="container-page grid grid-cols-2 gap-y-8 py-12 lg:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }, i) => (
            <Reveal key={label} delay={i * 0.08} className="flex flex-col items-center text-center">
              <Icon size={22} className="text-wine" strokeWidth={1.8} />
              <dd className="mt-3 font-mono text-4xl font-semibold text-navy">
                <CountUp to={value} />
              </dd>
              <dt className="mt-1 text-sm text-muted">{label}</dt>
            </Reveal>
          ))}
        </dl>
      </div>

      <LatestUpdates />
    </section>
  );
}

function LatestUpdates() {
  const latest = sortedNews.slice(0, 3);
  return (
    <div className="bg-surface">
      <div className="container-page py-16">
        <Reveal className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl text-navy">Latest updates</h2>
          <a href={pageHref('news')} className="btn-ghost px-3 py-1.5 text-xs">
            View all
          </a>
        </Reveal>
        <ol className="grid gap-4 md:grid-cols-3">
          {latest.map((n, i) => (
            <Reveal as="li" key={n.id} delay={i * 0.08}>
              <a
                href={n.link?.href ?? pageHref('news')}
                {...(n.link ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="card card-hover group flex h-full flex-col p-5"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${categoryStyle(n.category)}`}>{n.category}</span>
                  <time className="font-mono text-[11px] text-muted">{formatNewsDate(n.date)}</time>
                </div>
                <p className="flex-1 text-[15px] font-semibold leading-snug text-navy">{n.title}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-wine">
                  Read more <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            </Reveal>
          ))}
        </ol>
      </div>
    </div>
  );
}
