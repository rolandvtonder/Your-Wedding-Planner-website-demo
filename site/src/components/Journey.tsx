import {useEffect, useRef, useState} from 'react';
import {journey} from '../content';
import {clamp, easeOutCubic, lerp, pinProgress, range} from '../lib/math';
import {onFrame} from '../lib/scroll';

/**
 * From "yes" to "I do", drawn as you scroll. The section pins while the four
 * stages of planning ink themselves one after another — a gold bead riding
 * the stage being drawn — and the days-to-go counter runs down to zero.
 * The start is the logo's diamond; the end, two rings.
 */

const SECTION_VH = 380;
const WINDOW = [0.06, 0.92] as const;

const YES = {cx: 230, cy: 320};
const RINGS = {cx: 985, cy: 300};

const LEGS = [
  // First coffee: a lap and a bit around the diamond.
  `M${YES.cx} ${YES.cy - 128} a128 128 0 1 1 -0.1 0 a128 128 0 0 1 106 57`,
  // The master plan: the long way across.
  `M${YES.cx + 106} ${YES.cy - 71} C 520 40, 820 70, ${RINGS.cx - 20} ${RINGS.cy - 84}`,
  // Design & styling: circling in on the rings.
  `M${RINGS.cx - 20} ${RINGS.cy - 84} a86 86 0 1 1 -0.1 0.2 a86 86 0 0 1 20 1`,
  // The day: straight to the rings.
  `M${RINGS.cx} ${RINGS.cy - 86} Q ${RINGS.cx + 56} ${RINGS.cy - 46} ${RINGS.cx} ${RINGS.cy}`,
];

/** Days to go at the start of each stage, then at the end. */
const DAYS = [365, 270, 90, 14, 0];

export function Journey() {
  const rootRef = useRef<HTMLElement>(null);
  const legRefs = useRef<SVGPathElement[]>([]);
  const beadRef = useRef<SVGGElement>(null);
  const daysRef = useRef<HTMLSpanElement>(null);
  const [leg, setLeg] = useState(0);

  useEffect(() => {
    let lastP = -1;
    let current = 0;
    return onFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const {p, rect, vh} = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const u = range(p, ...WINDOW) * LEGS.length;
      const s = clamp(Math.floor(u), 0, LEGS.length - 1);
      if (s !== current) {
        current = s;
        setLeg(s);
      }
      legRefs.current.forEach((path, i) => {
        const k = easeOutCubic(clamp(u - i));
        path.style.strokeDashoffset = String(1 - k);
        if (i === s) {
          const pt = path.getPointAtLength(path.getTotalLength() * k);
          beadRef.current!.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
        }
      });
      const d = lerp(DAYS[s], DAYS[s + 1], easeOutCubic(clamp(u - s)));
      daysRef.current!.textContent = String(Math.round(d));
    });
  }, []);

  const current = journey.legs[leg];

  return (
    <section ref={rootRef} id="journey" aria-labelledby="journey-title" className="relative bg-ivory-2" style={{height: `${SECTION_VH}svh`}}>
      <div className="sticky top-0 flex h-screen-s flex-col overflow-hidden px-4 pt-20 pb-8 sm:px-6 md:px-[6vw] md:pt-24">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-label text-gold uppercase">{journey.eyebrow}</p>
            <h2 id="journey-title" className="mt-3 max-w-[18ch] font-serif text-display font-light text-ink">
              {journey.heading}
            </h2>
          </div>
          <p className="font-display text-label text-taupe uppercase" aria-live="off">
            {journey.counterLabel}{' '}
            <span ref={daysRef} className="font-serif text-[2rem] tracking-normal text-ink tabular-nums md:text-[2.75rem]">
              365
            </span>
          </p>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center">
          {/* On a phone the drawing is cropped to the route's own extent (x ≈ 8–89%)
              so it reads larger; the labels scale up to stay legible. */}
          <svg viewBox="0 0 1200 600" className="h-auto max-h-full w-full max-md:-ml-[10.5%] max-md:w-[123%] max-md:max-w-none" role="img" aria-label="The planning journey from engagement to wedding day, drawn in four stages.">
            <defs>
              <radialGradient id="j-glow">
                <stop offset="0.35" stopColor="#c3ad8d" stopOpacity="0.32" />
                <stop offset="1" stopColor="#c3ad8d" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="j-facet" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#efe4d4" />
              </linearGradient>
            </defs>

            {/* Scattered sparkle. */}
            <g fill="#c3ad8d">
              {Array.from({length: 60}, (_, i) => (
                <circle key={i} cx={(i * 173) % 1200} cy={(i * 97) % 600} r={i % 7 === 0 ? 2 : 1.1} opacity={0.2 + ((i * 37) % 50) / 100} />
              ))}
            </g>

            {/* The diamond — the logo's mark. */}
            <circle cx={YES.cx} cy={YES.cy} r="150" fill="url(#j-glow)" />
            <g stroke="#1c1916" strokeWidth="2" strokeLinejoin="round" fill="none">
              <path d={`M${YES.cx - 52} ${YES.cy - 42} L${YES.cx + 52} ${YES.cy - 42} L${YES.cx + 82} ${YES.cy - 8} L${YES.cx} ${YES.cy + 84} L${YES.cx - 82} ${YES.cy - 8} Z`} fill="url(#j-facet)" />
              <path
                d={`M${YES.cx - 82} ${YES.cy - 8} L${YES.cx + 82} ${YES.cy - 8} M${YES.cx - 22} ${YES.cy - 42} L${YES.cx - 38} ${YES.cy - 8} L${YES.cx} ${YES.cy + 84} L${YES.cx + 38} ${YES.cy - 8} L${YES.cx + 22} ${YES.cy - 42}`}
                strokeWidth="1"
                strokeOpacity="0.45"
              />
            </g>

            {/* Two rings. */}
            <circle cx={RINGS.cx} cy={RINGS.cy} r="110" fill="url(#j-glow)" />
            <g fill="none" stroke="#c3ad8d" strokeWidth="7">
              <circle cx={RINGS.cx - 20} cy={RINGS.cy + 6} r="34" />
              <circle cx={RINGS.cx + 20} cy={RINGS.cy + 6} r="34" stroke="#b39a72" />
            </g>
            <path d={`M${RINGS.cx - 30} ${RINGS.cy - 40} l8 -9 h12 l8 9 l-14 14 Z`} fill="#fffdf8" stroke="#1c1916" strokeWidth="1.4" strokeLinejoin="round" />

            {/* Ghost of the whole route, then the inked stages over it. */}
            {LEGS.map((d, i) => (
              <path key={`g${i}`} d={d} fill="none" stroke="#85683d" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="3 7" />
            ))}
            {LEGS.map((d, i) => (
              <path
                key={i}
                ref={(el) => {
                  if (el) legRefs.current[i] = el;
                }}
                d={d}
                pathLength={1}
                fill="none"
                stroke={i === 1 ? '#85683d' : '#1c1916'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1 1"
                strokeDashoffset="1"
              />
            ))}

            <g ref={beadRef} transform={`translate(${YES.cx} ${YES.cy - 128})`}>
              <circle r="12" fill="#c3ad8d" opacity="0.35" />
              <circle r="5" fill="#85683d" />
            </g>

            <g fontFamily="Montserrat, sans-serif" fontSize="13" letterSpacing="3.5" fill="#5e554c" className="max-md:text-[30px]">
              <text x={YES.cx} y={YES.cy + 150} textAnchor="middle">
                {journey.start}
              </text>
              <text x={RINGS.cx} y={RINGS.cy + 130} textAnchor="middle">
                {journey.end}
              </text>
            </g>
          </svg>
        </div>

        {/* Current stage. */}
        <div className="grid gap-4 border-t border-ink/10 pt-5 md:grid-cols-[12rem_1fr_auto] md:items-end md:gap-10">
          <p className="font-display text-label text-gold uppercase">
            {current.when} · {leg + 1}/{journey.legs.length}
          </p>
          <div key={leg} className="animate-[leg-in_0.6s_cubic-bezier(0.2,0.7,0.1,1)] motion-reduce:animate-none" aria-live="polite">
            <h3 className="font-serif text-[1.625rem] leading-tight text-ink md:text-[2rem]">{current.title}</h3>
            <p className="mt-1.5 max-w-[42rem] text-body text-taupe">{current.body}</p>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            {journey.legs.map((_, i) => (
              <span key={i} className={`h-1 w-8 rounded-full transition-colors duration-500 ${i <= leg ? 'bg-gold' : 'bg-ink/15'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
