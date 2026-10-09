import {useEffect, useRef} from 'react';
import {gallery} from '../content';
import {clamp, pinProgress, range} from '../lib/math';
import {onFrame} from '../lib/scroll';

/**
 * Real weddings, as a reel of stills. The section pins and the reel slides
 * sideways with the scroll; the frame nearest the focus line is sharp and
 * bright, the rest soften back, and each picture drifts against its frame.
 */

const SECTION_VH = 420;

export function Gallery() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const cardRefs = useRef<HTMLLIElement[]>([]);
  const imgRefs = useRef<HTMLImageElement[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let lastP = -1;
    return onFrame(() => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;
      const {p, rect, vh} = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const vw = window.innerWidth;
      const desktop = vw >= 768;
      // The focus line: right of centre beside the intro on desktop, centred
      // on a phone where the reel runs full width.
      const focus = desktop ? 0.62 : 0.5;
      const k = range(p, 0.04, 0.96);
      // Travel so the first card starts on the focus line and the last one
      // ends on it — whichever frame sits on the line is the one in focus.
      const cards = cardRefs.current;
      const first = cards[0];
      const last = cards[cards.length - 1];
      const startX = track.offsetLeft + first.offsetLeft + first.offsetWidth / 2;
      const endX = track.offsetLeft + last.offsetLeft + last.offsetWidth / 2;
      const lead = Math.min(0, vw * focus - startX);
      const travel = Math.max(0, endX - vw * focus + lead);
      track.style.transform = `translate3d(${lead - k * travel}px, 0, 0)`;

      let nearest = 0;
      let best = Infinity;
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const off = (r.left + r.width / 2 - vw * focus) / vw;
        const a = clamp(Math.abs(off) * 1.6);
        card.style.opacity = String(1 - a * 0.55);
        card.style.transform = `scale(${1 - a * 0.07})`;
        card.style.filter = a > 0.02 ? `saturate(${1 - a * 0.5})` : '';
        imgRefs.current[i].style.transform = `translate3d(${off * -60}px, 0, 0) scale(1.18)`;
        if (Math.abs(off) < best) {
          best = Math.abs(off);
          nearest = i;
        }
      });
      barRef.current!.style.transform = `scaleX(${k})`;
      countRef.current!.textContent = `0${nearest + 1}`;
    });
  }, []);

  return (
    <section ref={rootRef} id="gallery" aria-labelledby="gallery-title" className="relative bg-ivory" style={{height: `${SECTION_VH}svh`}}>
      <div className="sticky top-0 flex h-screen-s flex-col justify-center overflow-hidden pt-16 md:flex-row md:items-center md:pt-0">
        <div className="relative z-10 shrink-0 px-4 sm:px-6 md:w-[34vw] md:pr-10 md:pl-[6vw]">
          <p className="font-display text-label text-gold uppercase">{gallery.eyebrow}</p>
          <h2 id="gallery-title" className="mt-4 font-serif text-display font-light text-ink">
            {gallery.heading}
          </h2>
          <p className="mt-5 max-w-[26rem] text-body text-taupe max-md:hidden">{gallery.body}</p>
          <div className="mt-8 flex items-center gap-4 font-display text-label text-taupe uppercase max-md:hidden" aria-hidden="true">
            <span className="tabular-nums">
              <span ref={countRef} className="text-ink">
                01
              </span>{' '}
              / 0{gallery.items.length}
            </span>
            <span className="relative h-px w-32 bg-ink/15">
              <span ref={barRef} className="absolute inset-0 origin-left bg-gold" style={{transform: 'scaleX(0)'}} />
            </span>
          </div>
        </div>

        <ol ref={trackRef} className="mt-8 flex gap-5 pl-4 will-change-transform sm:pl-6 md:mt-0 md:gap-7 md:pl-0">
          {gallery.items.map((entry, i) => (
            <li
              key={entry.title}
              ref={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
              className="w-[66vw] shrink-0 origin-bottom sm:w-[42vw] md:w-[clamp(15rem,22vw,21rem)]"
            >
              <figure>
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[4px] bg-ivory-2 shadow-[0_24px_60px_-30px_rgb(28_25_22/0.35)]">
                  <img
                    ref={(el) => {
                      if (el) imgRefs.current[i] = el;
                    }}
                    src={entry.image}
                    alt={`${entry.title}: ${entry.body}`}
                    width={560}
                    height={560}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover will-change-transform"
                  />
                  <span className="absolute bottom-3 left-3 rounded-[2px] bg-ivory/85 px-2.5 py-1.5 font-display text-[0.6875rem] tracking-[0.18em] text-ink uppercase backdrop-blur">
                    {entry.tag}
                  </span>
                </div>
                <figcaption className="mt-4 flex gap-4">
                  <span className="font-display text-label text-gold">0{i + 1}</span>
                  <span>
                    <span className="block font-serif text-[1.375rem] leading-tight text-ink">{entry.title}</span>
                    <span className="mt-1.5 block text-[0.9375rem] leading-relaxed text-taupe">{entry.body}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
