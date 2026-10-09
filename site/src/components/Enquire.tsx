import {useEffect, useId, useState, type FormEvent} from 'react';
import {brand, enquire, services} from '../content';
import {useReveals} from '../hooks/useReveals';

type Status = 'idle' | 'invalid' | 'sent';

/** Ticks once a second toward `target` (a yyyy-mm-dd date), or idles when there's none. */
function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);
  if (!target) return null;
  // Count to 3pm on the day — a typical ceremony time.
  const ms = Math.max(0, new Date(`${target}T15:00:00`).getTime() - now);
  const s = Math.floor(ms / 1000);
  return {d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60};
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Enquiry. A countdown to the couple's own date on one side — it starts the
 * moment they pick one — and the form on the other; the form hands a drafted
 * message to the visitor's mail app, so there's no server to run.
 */
export function Enquire() {
  const ref = useReveals<HTMLElement>();
  const [date, setDate] = useState('');
  const t = useCountdown(date);
  const [status, setStatus] = useState<Status>('idle');
  const id = useId();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setStatus('invalid');
      form.reportValidity();
      return;
    }
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? '').trim();
    // Optional fields only appear in the email when they were filled in.
    const optional = (k: string, title: string) => (get(k) ? [`${title}: ${get(k)}`] : []);
    const lines = [
      `Names: ${get('names')}`,
      `Email: ${get('email')}`,
      ...optional('phone', 'Phone'),
      ...optional('date', 'Wedding date'),
      ...optional('venue', 'Venue / area'),
      ...optional('guests', 'Guests (approx.)'),
      `Interested in: ${get('service')}`,
      ...(get('message') ? ['', get('message')] : []),
    ];
    const subject = encodeURIComponent(`Wedding enquiry: ${get('names')}${get('date') ? ` · ${get('date')}` : ''}`);
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:${brand.email}?subject=${subject}&body=${body}`;
    setStatus('sent');
  };

  const field =
    'w-full rounded-[2px] bg-white/70 px-4 py-3.5 text-body text-ink ring-1 ring-ink/15 outline-none placeholder:text-taupe/60 focus:ring-2 focus:ring-gold user-invalid:ring-red-700/70';
  const label = 'mb-1.5 block font-display text-label text-taupe uppercase';
  const units: [string, number][] = t
    ? [
        ['Days', t.d],
        ['Hrs', t.h],
        ['Min', t.m],
        ['Sec', t.s],
      ]
    : [];

  return (
    <section ref={ref} id="enquire" aria-labelledby="enquire-title" className="relative overflow-hidden bg-ivory px-4 pt-28 pb-28 sm:px-6 md:px-[6vw] md:pt-40 md:pb-40">
      {/* A sliver of the golden-hour sun rising at the bottom edge — the hero, bookended. */}
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[62vw] left-1/2 size-[90vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(241,199,143,0.45),rgba(234,215,207,0.18)_55%,transparent_70%)]" />

      <div className="relative grid gap-12 md:grid-cols-2 md:gap-16">
        <div data-reveal>
          <p className="font-display text-label text-gold uppercase">{enquire.eyebrow}</p>
          <h2 id="enquire-title" className="mt-4 font-serif text-display font-light text-ink">
            {enquire.heading}
          </h2>
          <p className="mt-5 max-w-[28rem] text-body text-taupe">{enquire.body}</p>

          <div className="mt-10">
            <p className="font-display text-label text-taupe uppercase">{enquire.countdownLabel}</p>
            {t ? (
              <div className="mt-3 flex gap-2 md:gap-3" role="timer" aria-label={`${t.d} days, ${t.h} hours and ${t.m} minutes until your wedding day`}>
                {units.map(([u, v]) => (
                  <div key={u} className="brackets min-w-[4.25rem] px-3 py-3 text-center text-champagne md:min-w-[5.5rem]">
                    <span className="block font-serif text-[1.75rem] leading-none text-ink tabular-nums md:text-[2.75rem]">{String(v).padStart(2, '0')}</span>
                    <span className="mt-1.5 block font-display text-[0.6875rem] tracking-[0.18em] text-taupe uppercase">{u}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 max-w-[22rem] font-serif text-[1.375rem] leading-snug text-ink/70 italic">{enquire.countdownEmpty}</p>
            )}
          </div>

          <div className="mt-12 space-y-2 font-display text-label text-taupe uppercase">
            <p>Prefer to write directly?</p>
            <a href={`mailto:${brand.email}`} className="inline-block py-1 text-[0.9375rem] tracking-[0.04em] text-ink normal-case underline decoration-champagne underline-offset-4 hover:text-gold">
              {brand.email}
            </a>
          </div>
        </div>

        <form noValidate onSubmit={onSubmit} aria-describedby={`${id}-status`} className="space-y-4" data-reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={label}>
                Your names <span aria-hidden="true" className="text-gold">*</span>
              </span>
              <input name="names" required autoComplete="name" placeholder="e.g. Lizelle & André" className={field} onInput={() => setStatus('idle')} />
            </label>
            <label className="block">
              <span className={label}>
                Email <span aria-hidden="true" className="text-gold">*</span>
              </span>
              <input name="email" type="email" required autoComplete="email" placeholder="you@example.co.za" className={field} onInput={() => setStatus('idle')} />
            </label>
            <label className="block">
              <span className={label}>Phone</span>
              <input name="phone" type="tel" autoComplete="tel" placeholder="Optional" className={field} />
            </label>
            <label className="block">
              <span className={label}>Wedding date</span>
              <input name="date" type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value)} className={field} />
            </label>
            <label className="block">
              <span className={label}>Guests</span>
              <input name="guests" type="number" inputMode="numeric" min={1} placeholder="Approx." className={field} />
            </label>
            <label className="block sm:col-span-2">
              <span className={label}>Venue or area</span>
              <input name="venue" autoComplete="off" placeholder="If you have one in mind" className={field} />
            </label>
            <label className="block sm:col-span-2">
              <span className={label}>I’m interested in</span>
              <select name="service" defaultValue={services.items[0].name} className={`${field} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%2385683d' stroke-width='1.5'/%3E%3C/svg%3E")] bg-[position:right_1rem_center] bg-no-repeat pr-10`}>
                {services.items.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
                <option value="Not sure yet">Not sure yet</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className={label}>Tell us about your day</span>
              <textarea name="message" rows={4} placeholder="The vibe, the dream, the must-haves…" className={`${field} resize-y`} />
            </label>
          </div>
          <button type="submit" className="mt-2 w-full rounded-[2px] bg-ink px-5 py-4 font-display text-label text-ivory uppercase transition-colors hover:bg-gold">
            {enquire.submit}
          </button>
          <p id={`${id}-status`} role="status" className="min-h-[1.25rem] text-[0.875rem] text-taupe">
            {status === 'invalid' && 'Please add your names and a valid email so we can reply.'}
            {status === 'sent' && `Your mail app should be open with your enquiry drafted — just press send. If not, write to ${brand.email}.`}
          </p>
        </form>
      </div>
    </section>
  );
}
