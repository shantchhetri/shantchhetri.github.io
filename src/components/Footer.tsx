import { ArrowRight, Mail } from 'lucide-react';
import { academicProfiles, profile } from '../data/profile';
import { analyticsEnabled } from '../lib/analytics';
import { pageHref } from '../lib/router';
import { NAV } from './Navbar';
import { Reveal } from './Reveal';

/** Call-to-action banner shown before the contact section. */
export function CtaBanner() {
  return (
    <div className="bg-surface pb-16 pt-4">
      <Reveal className="container-page">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-peach-600 via-peach-700 to-slate-900 px-6 py-14 text-center text-white shadow-xl shadow-peach-900/20 sm:px-12">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-peach-300/30 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" aria-hidden />
          <h2 className="relative text-3xl sm:text-4xl">Interested in collaborating?</h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-peach-50/90">
            I am open to research collaborations, postdoctoral opportunities and invited talks on n-type organic semiconductors and charge transport.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <a href={pageHref('contact')} className="btn bg-white px-6 py-3 text-peach-800 hover:bg-peach-50">
              <Mail size={16} /> Get in touch
            </a>
            <a href={pageHref('publications')} className="btn-hero-ghost px-6 py-3">
              Read my work <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper text-muted">
      <div className="container-page grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <p className="text-xl font-bold text-navy">
              {profile.name}, {profile.postNominal}
            </p>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            {profile.department}
            <br />
            {profile.institution}
          </p>
        </div>
        <nav aria-label="Footer" className="md:col-span-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-wine">Navigate</p>
          <ul className="grid grid-cols-2 gap-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={pageHref(n.id)} className="hover:text-wine">{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-wine">Profiles</p>
          <ul className="space-y-2 text-sm">
            {academicProfiles.filter((p) => p.url).map((p) => (
              <li key={p.id}>
                <a href={p.url} target="_blank" rel="noopener noreferrer me" className="hover:text-wine">{p.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-page flex flex-wrap justify-between gap-2 border-t border-line py-6 text-xs text-muted">
        <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
        {analyticsEnabled && <p>This site uses cookie-free, anonymous visitor statistics (GoatCounter).</p>}
      </div>
    </footer>
  );
}
