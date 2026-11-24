import { Download, ExternalLink, FileText } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { Section } from '../components/Section';
import { cv, profile } from '../data/profile';
import { asset } from '../lib/utils';

export function CV() {
  const href = asset(cv.file);
  return (
    <Section
      id="cv"
      index="08"
      eyebrow="Curriculum Vitae"
      title={
        <>
          The full <em>record</em>
        </>
      }
    >
      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          {/* stylized document preview */}
          <a href={href} target="_blank" rel="noopener noreferrer" className="group relative block" aria-label="Open the CV PDF in a new tab">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl bg-peach-400/15" aria-hidden />
            <div className="relative aspect-[1/1.414] rounded-xl border border-line bg-white p-7 shadow-lg transition-transform duration-300 group-hover:-translate-y-1 sm:p-9">
              <p className="text-center text-2xl font-bold text-slate-900">
                {profile.name}, {profile.postNominal}
              </p>
              <p className="mt-1 text-center text-[10px] text-slate-500">{profile.department} · {profile.institutionShort}</p>
              <div className="mt-6 space-y-5">
                {cv.sections.slice(0, 6).map((s, i) => (
                  <div key={s}>
                    <p className="border-b border-peach-600/40 pb-1 text-[11px] font-semibold text-slate-800">{s}</p>
                    <div className="mt-2 space-y-1.5" aria-hidden>
                      {Array.from({ length: i % 2 ? 2 : 3 }).map((_, k) => (
                        <div key={k} className="h-[5px] rounded bg-slate-200" style={{ width: `${92 - k * 17}%` }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <span className="absolute bottom-4 right-5 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted group-hover:text-wine">
                Open PDF <ExternalLink size={11} />
              </span>
            </div>
          </a>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7 lg:pl-8">
          <p className="text-2xl font-semibold leading-relaxed text-navy">
            A {cv.pages}-page academic CV covering education, research experience, publications, awards, technical skills, mentoring and presentations.
          </p>
          <ul className="mt-8 grid gap-x-8 gap-y-2 border-t border-line pt-6 text-[15px] text-muted sm:grid-cols-2">
            {cv.sections.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <FileText size={14} className="text-wine" strokeWidth={1.5} />
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href={href} download className="btn-primary px-7 py-3.5 text-[15px]">
              <Download size={18} strokeWidth={1.6} /> Download CV (PDF)
            </a>
            <a href={href} target="_blank" rel="noopener noreferrer" className="btn-ghost py-3.5">
              View in browser
            </a>
          </div>
          <p className="mt-5 font-mono text-xs text-muted">Last updated: {cv.lastUpdated}</p>
        </Reveal>
      </div>
    </Section>
  );
}
