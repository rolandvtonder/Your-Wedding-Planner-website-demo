import type {MouseEvent} from 'react';
import {services} from '../content';
import {useReveals} from '../hooks/useReveals';
import {scrollToHash} from '../lib/scroll';

const toEnquire = (e: MouseEvent<HTMLAnchorElement>, name?: string) => {
  e.preventDefault();
  const select = document.querySelector<HTMLSelectElement>('#enquire select[name="service"]');
  if (select && name) select.value = name;
  scrollToHash('#enquire');
};

/** The interlocking rings that sit in each card's corner, turning on hover. */
function Rings({count}: {count: number}) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -top-12 -right-12 size-44 text-champagne/45 transition-transform duration-[1.2s] group-hover:rotate-45">
      {Array.from({length: count}, (_, k) => (
        <ellipse key={k} cx="100" cy="100" rx={40 + k * 18} ry={18 + k * 8} fill="none" stroke="currentColor" transform={`rotate(${-20 + k * 14} 100 100)`} />
      ))}
      <path d="M92 92h16l5 6-13 14-13-14Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Five services, plus a gentle way in for couples who aren't sure yet. */
export function Services() {
  const ref = useReveals<HTMLElement>();
  return (
    <section ref={ref} id="services" aria-labelledby="services-title" className="relative bg-ivory px-4 py-28 sm:px-6 md:px-[6vw] md:py-40">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between" data-reveal>
        <div>
          <p className="font-display text-label text-gold uppercase">{services.eyebrow}</p>
          <h2 id="services-title" className="mt-4 font-serif text-display font-light text-ink">
            {services.heading}
          </h2>
        </div>
        <p className="max-w-[24rem] font-display text-label text-taupe uppercase">{services.note}</p>
      </div>

      <ol className="mt-14 grid gap-5 md:mt-20 md:grid-cols-2 lg:grid-cols-3">
        {services.items.map((s, i) => (
          <li
            key={s.name}
            data-reveal
            style={{transitionDelay: `${(i % 3) * 110}ms`}}
            className={`group relative flex flex-col overflow-hidden rounded-[4px] ring-1 transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 ${
              s.featured
                ? 'bg-white ring-champagne shadow-[0_30px_80px_-40px_rgb(133_104_61/0.45)] hover:shadow-[0_36px_90px_-36px_rgb(133_104_61/0.55)]'
                : 'bg-white/60 ring-ink/10 hover:ring-champagne hover:shadow-[0_30px_80px_-44px_rgb(28_25_22/0.35)]'
            }`}
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-ivory-2">
              <img src={s.image} alt="" width={560} height={560} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
              {s.featured && (
                <span className="absolute top-3 left-3 rounded-[2px] bg-ink px-2.5 py-1.5 font-display text-[0.6875rem] tracking-[0.18em] text-ivory uppercase">Most requested</span>
              )}
            </div>
            <div className="relative flex flex-1 flex-col p-6 md:p-8">
              <Rings count={i === 0 ? 4 : 2 + (i % 2)} />
              <p className="font-serif text-[2.5rem] leading-none font-light text-champagne">0{i + 1}</p>
              <h3 className="mt-3 font-display text-[1rem] font-medium tracking-[0.16em] text-ink uppercase">{s.name}</h3>
              <p className="mt-3 text-body text-taupe">{s.body}</p>
              <ul className="mt-6 mb-10 space-y-2.5 border-t border-ink/10 pt-6">
                {s.lines.map((l) => (
                  <li key={l} className="flex gap-3 text-[0.9375rem] text-ink/80">
                    <span aria-hidden="true" className="mt-[0.6em] size-1 shrink-0 rotate-45 bg-gold" />
                    {l}
                  </li>
                ))}
              </ul>
              <a
                href="#enquire"
                onClick={(e) => toEnquire(e, s.name)}
                className={`mt-auto block rounded-[2px] px-5 py-3.5 text-center font-display text-label uppercase transition-colors ${
                  s.featured ? 'bg-ink text-ivory hover:bg-gold' : 'text-ink ring-1 ring-ink/25 hover:bg-ink hover:text-ivory'
                }`}
              >
                Enquire about {s.short}
                <span className="sr-only"> ({s.name})</span>
              </a>
            </div>
          </li>
        ))}

        <li data-reveal style={{transitionDelay: '220ms'}} className="relative flex flex-col justify-between overflow-hidden rounded-[4px] bg-ink p-6 text-ivory md:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -bottom-24 size-80 rounded-full bg-[radial-gradient(circle,rgba(195,173,141,0.35),transparent_65%)]" />
          <div className="relative">
            <p className="font-script text-[3rem] leading-none text-champagne">{services.unsure.title}</p>
            <p className="mt-6 max-w-[22rem] text-body text-ivory/80">{services.unsure.body}</p>
          </div>
          <a href="#enquire" onClick={(e) => toEnquire(e)} className="relative mt-10 rounded-[2px] bg-ivory px-5 py-3.5 text-center font-display text-label text-ink uppercase transition-colors hover:bg-champagne">
            {services.unsure.cta}
          </a>
        </li>
      </ol>
    </section>
  );
}
