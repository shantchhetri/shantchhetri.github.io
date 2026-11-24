import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { Reveal } from '../components/Reveal';
import { Section } from '../components/Section';
import { journey, languages, mentees } from '../data/journey';
import { profile } from '../data/profile';

const timeline = journey
  .filter((j) => j.kind === 'Education' || j.kind === 'Research Position')
  .sort((a, b) => a.sortYear - b.sortYear);

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Reveal className="card mb-4 grid gap-3 p-6 md:grid-cols-12 md:p-7">
      <h3 className="text-base text-navy md:col-span-4"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-peach-400 align-middle" />{label}</h3>
      <div className="text-[15.5px] leading-relaxed text-ink/90 md:col-span-8">{children}</div>
    </Reveal>
  );
}

function Timeline() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <ol ref={ref} className="relative ml-2 space-y-10 pl-8">
      <span className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px bg-line" aria-hidden />
      <motion.span
        style={{ scaleY: reduce ? 1 : scaleY }}
        className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px origin-top bg-peach-400"
        aria-hidden
      />
      {timeline.map((t, i) => (
        <Reveal as="li" key={t.id} delay={i * 0.05} className="relative">
          <span className="absolute -left-[38px] top-1 h-[13px] w-[13px] rounded-full border-[3px] border-wine bg-surface shadow-[0_0_0_4px_rgb(var(--wine)/0.15)]" aria-hidden />
          <p className="font-mono text-xs text-wine">{t.period}</p>
          <p className="mt-1 text-lg font-bold text-navy">{t.title}</p>
          <p className="text-sm text-muted">{t.org}</p>
          {t.detail && <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/80">{t.detail}</p>}
        </Reveal>
      ))}
    </ol>
  );
}

export function About() {
  return (
    <Section
      id="about"
      index="01"
      eyebrow="About"
      title={
        <>
          Chemist by training, <em>device physicist</em> by curiosity
        </>
      }
      intro="Fascinated by the fundamental physics of charge transport, I specialize in the molecular design and microfabrication of n-channel organic semiconductor devices — and in the stability and transport bottlenecks that hold them back."
    >
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Block label="Academic background">
            <p>
              I completed my Ph.D. in Chemical Sciences at {profile.institution} (2020–2026) in the {profile.lab} under the supervision of
              Prof. Ratheesh K. Vijayaraghavan. My dissertation, <em>“Overcoming Fundamental Challenges in n-Channel Organic Field-Effect Transistors”</em>,
              combines small-molecule synthesis, thin-film processing and device physics. My research is supported by national and international
              collaborations, including synchrotron work at DESY, Hamburg.
            </p>
          </Block>
          <Block label="Educational qualifications">
            <ul className="space-y-2">
              <li><strong className="font-medium text-navy">Ph.D., Chemical Sciences</strong> — IISER Kolkata, 2020–2026</li>
              <li><strong className="font-medium text-navy">M.Sc., Chemical Sciences</strong> — B. Borooah College, 2017–2019</li>
              <li><strong className="font-medium text-navy">B.Sc., Chemical Sciences</strong> — B. Borooah College, 2014–2017</li>
              <li><strong className="font-medium text-navy">CSIR-NET</strong> — qualified, Chemical Sciences, 2019</li>
            </ul>
          </Block>
          <Block label="Professional experience">
            <p className="mb-3">
              <strong className="font-medium text-navy">Teaching Assistant</strong>, IISER Kolkata — General Chemistry Laboratory (CH1202) and Advanced
              Physical Chemistry Laboratory (CH3105), guiding students through spectroscopy and kinetics experiments, error analysis and data interpretation.
            </p>
            <p className="mb-2">
              <strong className="font-medium text-navy">Research mentoring</strong> — mentored MS-thesis students, now at:
            </p>
            <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              {mentees.map((m) => (
                <li key={m.name}>
                  <span className="text-ink">{m.name}</span> <span className="text-muted">— {m.now}</span>
                </li>
              ))}
            </ul>
          </Block>
          <Block label="Scientific interests">
            <p>
              n-type organic semiconductors and their ambient stability; how molecular packing — brickwork stacks, halogen bonding, polymorphism —
              controls charge transport; exciton coupling and photophysics in molecular solids; and open-shell radical materials.
            </p>
            <p className="mt-3 text-sm text-muted">Languages: {languages}.</p>
          </Block>
        </div>

        <aside className="lg:col-span-4" aria-label="Education and research timeline">
          <div className="card p-6 md:p-7 lg:sticky lg:top-24">
            <p className="mb-8 text-xl font-bold text-navy">Timeline</p>
            <Timeline />
          </div>
        </aside>
      </div>
    </Section>
  );
}
