import {useEffect, useRef} from 'react';
import {about, testimonials} from '../content';
import {useReveals} from '../hooks/useReveals';
import {range} from '../lib/math';
import {onFrame} from '../lib/scroll';

/**
 * Meet the planner, then kind words. The portrait sits in an arch — the
 * hero's floral arch, quietened — and drifts gently against its frame.
 */
export function About() {
  const ref = useReveals<HTMLElement>();
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let last = -1;
    return onFrame(() => {
      const img = imgRef.current;
      if (!img) return;
      const r = img.parentElement!.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      const t = range(vh - r.top, 0, vh + r.height);
      if (Math.abs(t - last) < 0.0005) return;
      last = t;
      img.style.transform = `translate3d(0, ${(t - 0.5) * -40}px, 0) scale(1.14)`;
    });
  }, []);

  return (
    <section ref={ref} id="about" aria-labelledby="about-title" className="relative overflow-hidden bg-ivory-2 px-4 py-28 sm:px-6 md:px-[6vw] md:py-40">
      <div className="grid items-center gap-14 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-20">
        <div className="relative mx-auto w-full max-w-[26rem]" data-reveal>
          <div aria-hidden="true" className="absolute -inset-3 translate-x-4 translate-y-4 rounded-t-[999px] rounded-b-[4px] ring-1 ring-champagne" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[4px] bg-ivory-3">
            <img ref={imgRef} src={about.image} alt={about.imageAlt} width={560} height={560} loading="lazy" decoding="async" className="size-full object-cover will-change-transform" />
          </div>
        </div>

        <div data-reveal>
          <p className="font-display text-label text-gold uppercase">{about.eyebrow}</p>
          <h2 id="about-title" className="mt-4 max-w-[14ch] font-serif text-display font-light text-ink">
            {about.heading}
          </h2>
          {about.body.map((para) => (
            <p key={para} className="mt-6 max-w-[34rem] text-body text-taupe">
              {para}
            </p>
          ))}
          <p className="mt-10 font-display text-label text-taupe uppercase">{about.signoff}</p>
          <p className="mt-1 font-script text-[2.75rem] leading-none text-ink">{about.signature}</p>
        </div>
      </div>

      <div className="mt-28 border-t border-ink/10 pt-16 md:mt-36 md:pt-20">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between" data-reveal>
          <div>
            <p className="font-display text-label text-gold uppercase">{testimonials.eyebrow}</p>
            <h3 className="mt-4 font-serif text-[clamp(2rem,3.6vw,3.25rem)] leading-tight font-light text-ink">{testimonials.heading}</h3>
          </div>
          {testimonials.placeholder && <p className="font-display text-label text-taupe uppercase">{testimonials.note}</p>}
        </div>
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.items.map((t, i) => (
            <li key={t.quote} data-reveal style={{transitionDelay: `${i * 110}ms`}} className="relative flex flex-col rounded-[4px] bg-ivory p-7 ring-1 ring-ink/8 md:p-9">
              <span aria-hidden="true" className="font-serif text-[4.5rem] leading-[0.6] text-champagne">
                “
              </span>
              <blockquote className="mt-4 flex-1 font-serif text-[1.375rem] leading-snug text-ink italic">{t.quote}</blockquote>
              <p className="mt-8 font-display text-label text-taupe uppercase">
                {t.who} <span className="text-champagne">·</span> {t.where}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
