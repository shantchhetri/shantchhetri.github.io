import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowUpRight, Building2, CheckCircle2, Loader2, Mail, Send } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { Reveal } from '../components/Reveal';
import { Section } from '../components/Section';
import { useEmail } from '../hooks/useEmail';
import { academicProfiles, profile } from '../data/profile';
import { trackEvent } from '../lib/analytics';

type Fields = { name: string; email: string; subject: string; message: string };
type Status = { kind: 'idle' | 'sending' | 'success' | 'error' | 'mailto'; text?: string };

const EMPTY: Fields = { name: '', email: '', subject: '', message: '' };
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;

function validate(f: Fields) {
  const e: Partial<Record<keyof Fields, string>> = {};
  if (f.name.trim().length < 2) e.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Please enter a valid email address.';
  if (f.subject.trim().length < 3) e.subject = 'Please add a short subject.';
  if (f.message.trim().length < 20) e.message = 'Please write at least 20 characters.';
  if (f.message.length > 5000) e.message = 'Please keep the message under 5,000 characters.';
  return e;
}

export function Contact() {
  const email = useEmail();
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const honeypot = useRef<HTMLInputElement>(null);
  const openedAt = useRef(Date.now());

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(f);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      document.getElementById(`cf-${first}`)?.focus();
      return;
    }
    // Spam protection: hidden honeypot field + minimum fill time. Bots get a silent "success".
    if (honeypot.current?.value || Date.now() - openedAt.current < 3000) {
      setStatus({ kind: 'success', text: 'Thank you — your message has been sent.' });
      setF(EMPTY);
      return;
    }

    if (!ENDPOINT) {
      const body = `${f.message}\n\n— ${f.name} (${f.email})`;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(f.subject)}&body=${encodeURIComponent(body)}`;
      setStatus({ kind: 'mailto', text: 'Your email app should open with the message ready to send.' });
      return;
    }

    setStatus({ kind: 'sending' });
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...f, _subject: `[Website] ${f.subject}` }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus({ kind: 'success', text: 'Thank you — your message has been sent. I will reply as soon as I can.' });
      trackEvent('contact-message', 'Contact form message sent');
      setF(EMPTY);
    } catch {
      setStatus({ kind: 'error', text: 'Sorry, the message could not be sent. Please try again or email me directly.' });
    }
  }

  const input = (k: keyof Fields, label: string, type = 'text', auto?: string) => (
    <div>
      <label htmlFor={`cf-${k}`} className="mb-1.5 block text-[13px] text-muted">
        {label} <span className="text-wine" aria-hidden>*</span>
      </label>
      <input
        id={`cf-${k}`}
        type={type}
        value={f[k]}
        onChange={set(k)}
        autoComplete={auto}
        required
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `cf-${k}-err` : undefined}
        className={`field ${errors[k] ? 'border-rose-400' : ''}`}
      />
      {errors[k] && (
        <p id={`cf-${k}-err`} className="mt-1 text-xs text-rose-600 dark:text-rose-400">
          {errors[k]}
        </p>
      )}
    </div>
  );

  const scholar = academicProfiles.find((p) => p.id === 'scholar');
  const orcid = academicProfiles.find((p) => p.id === 'orcid');
  const linkedin = academicProfiles.find((p) => p.id === 'linkedin');

  return (
    <Section
      id="contact"
      index="09"
      eyebrow="Contact"
      tone="surface"
      title={
        <>
          Let&rsquo;s <em>talk science</em>
        </>
      }
      intro="I welcome enquiries about collaboration, postdoctoral opportunities, invited talks and questions about my work."
    >
      <div className="grid gap-14 lg:grid-cols-12">
        <Reveal className="card min-w-0 space-y-7 p-6 sm:p-8 lg:col-span-5">
          <div className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-peach-400/10 text-wine"><Mail size={19} /></span>
            <div>
              <p className="text-[13px] text-muted">Email</p>
              {email ? (
                <a href={`mailto:${email}`} className="break-all text-lg font-semibold text-navy link-u">
                  {email}
                </a>
              ) : (
                <span className="text-lg text-muted">loading…</span>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-peach-400/10 text-wine"><Building2 size={19} /></span>
            <div>
              <p className="text-[13px] text-muted">Affiliation</p>
              <p className="text-lg font-semibold leading-snug text-navy">{profile.department}</p>
              <p className="text-[15px] text-muted">{profile.institution}</p>
              <p className="text-[15px] text-muted">{profile.location}</p>
            </div>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {[orcid, scholar, linkedin].filter((p) => p?.url).map(
              (p) =>
                p && (
                  <li key={p.id}>
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener noreferrer me" className="group flex items-center justify-between py-3.5 text-[15px] text-ink hover:text-wine">
                        {p.label} <span className="flex items-center gap-1 font-mono text-xs text-muted group-hover:text-wine">{p.handle} <ArrowUpRight size={13} /></span>
                      </a>
                    ) : (
                      <span className="flex items-center justify-between py-3.5 text-[15px] text-muted">
                        {p.label} <span className="text-xs italic">link to be added</span>
                      </span>
                    )}
                  </li>
                ),
            )}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="min-w-0 lg:col-span-7">
          <form onSubmit={submit} noValidate className="card relative space-y-5 p-6 sm:p-8" aria-describedby="cf-status">
            <div className="grid gap-5 sm:grid-cols-2">
              {input('name', 'Name', 'text', 'name')}
              {input('email', 'Email', 'email', 'email')}
            </div>
            {input('subject', 'Subject')}
            <div>
              <label htmlFor="cf-message" className="mb-1.5 block text-[13px] text-muted">
                Message <span className="text-wine" aria-hidden>*</span>
              </label>
              <textarea
                id="cf-message"
                rows={6}
                value={f.message}
                onChange={set('message')}
                required
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'cf-message-err' : undefined}
                className={`field resize-y ${errors.message ? 'border-rose-400' : ''}`}
              />
              {errors.message && (
                <p id="cf-message-err" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {errors.message}
                </p>
              )}
            </div>
            {/* honeypot — hidden from people, tempting for bots */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Company <input ref={honeypot} type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" disabled={status.kind === 'sending'} className="btn-primary disabled:opacity-60">
                {status.kind === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={1.6} />}
                {status.kind === 'sending' ? 'Sending…' : 'Send message'}
              </button>
              <p className="text-xs text-muted">Your details are used only to reply to you.</p>
            </div>
            <div id="cf-status" role="status" aria-live="polite">
              <AnimatePresence>
                {status.text && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
                      status.kind === 'error' ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-300' : 'border-peach-300 bg-peach-50 text-peach-700 dark:border-peach-400/40 dark:bg-peach-400/10 dark:text-peach-300'
                    }`}
                  >
                    {status.kind === 'error' ? <AlertCircle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="mt-0.5 shrink-0" />}
                    {status.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}
