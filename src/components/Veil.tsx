import {useEffect, useRef} from 'react';
import {hero} from '../content';
import {useReducedMotion} from '../hooks/useReducedMotion';
import {clamp, easeOutCubic, lerp, pinProgress, range} from '../lib/math';
import {onFrame} from '../lib/scroll';
import {Logo} from './Chrome';

/**
 * The opening. Six illustrated layers on one stage, pinned; one scroll range
 * moves each at its own rate (the reference's Earthrise, retold):
 *
 *   0.00 – 0.18  a veil of ivory tulle lifts off the view
 *   0.04 – 0.50  the golden-hour sun climbs out of the valley
 *   0.08 – 0.52  EVER AFTER resolves over the hills, then yields
 *   0.28 – 0.58  sheer drapes and florals close in around the view
 *   0.36 – 0.62  the floral arch and the couple rise into place, the sun
 *                framed inside the ring
 *   0.70 – 1.00  everything lifts away and the ivory lawn swallows the
 *                frame, which is where the page continues
 *
 * A fine HUD rides on top: the golden-hour clock, a ceremony countdown.
 */

const STAGE_VH = 440;

type LayerName = 'sky' | 'sun' | 'hills' | 'drapes' | 'arch' | 'ground';

/**
 * Every illustrated layer shares one crop, so they stay registered at every
 * viewport. The art lives in src/art/scene.tsx and is pre-rendered to WebP
 * by `npm run layers`: d/ for landscape screens, m/ for phones.
 */
const FIT = 'absolute inset-0 size-full object-cover object-center';

/**
 * The drape's inner edge as a clip-path: sweeps in from the top corner to
 * the tie-back at 56% height, then falls in a soft S to the floor.
 */
const DRAPE_CLIP = (() => {
  const pts: string[] = ['0% 0%', '100% 0%'];
  for (let y = 4; y <= 100; y += 4) {
    const x = y <= 56 ? 100 - 60 * (1 - Math.pow(1 - y / 56, 2.2)) : 40 + 5 * Math.sin(((y - 56) / 44) * Math.PI) - 7 * ((y - 56) / 44);
    pts.push(`${x.toFixed(1)}% ${y}%`);
  }
  pts.push('0% 100%');
  return `polygon(${pts.join(', ')})`;
})();

const DRAPE_FABRIC = [
  // Folds.
  'repeating-linear-gradient(97deg, rgba(229,215,197,0) 0, rgba(229,215,197,0.55) 1.2vw, rgba(255,255,255,0.6) 2.6vw, rgba(229,215,197,0) 4vw)',
  // Sheer falloff toward the inner edge.
  'linear-gradient(90deg, rgba(255,253,249,0.97), rgba(251,246,238,0.88) 70%, rgba(246,238,227,0.72))',
].join(', ');

function Drape({className}: {className: string}) {
  return (
    <div className={className}>
      <div className="size-full" style={{clipPath: DRAPE_CLIP, backgroundImage: DRAPE_FABRIC}} />
      {/* Tie-back. */}
      <div className="absolute top-[55%] left-[30%] h-[3px] w-[16%] rounded-full bg-champagne" />
    </div>
  );
}

/**
 * Sheer drapes and corner florals — the reference's crater rim. Pinned to
 * the screen edges (not the shared crop) so they frame a phone as well as
 * a monitor, and close in until you're inside the marquee, looking out.
 */
function Drapes() {
  const corner = 'absolute -top-[3vmin] w-[46vmin] max-w-[26rem]';
  return (
    <>
      <Drape className="absolute inset-y-0 left-0 w-[30vw] md:w-[22vw]" />
      <Drape className="absolute inset-y-0 right-0 w-[30vw] -scale-x-100 md:w-[22vw]" />
      <img src="/layers/cluster-left.webp" alt="" aria-hidden="true" width={640} height={640} decoding="async" className={`${corner} -left-[3vmin]`} />
      <img src="/layers/cluster-right.webp" alt="" aria-hidden="true" width={640} height={640} decoding="async" className={`${corner} -right-[3vmin] -scale-x-100`} />
    </>
  );
}

type Mote = {x: number; y: number; r: number; s: number; a: number; gold: boolean};

/** A fine hexagonal net, tiled across the veil. */
const TULLE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='24' viewBox='0 0 14 24'%3E%3Cpath d='M7 0 L14 4 L14 12 L7 16 L0 12 L0 4 Z M7 16 L7 24' fill='none' stroke='%23c3ad8d' stroke-opacity='0.22' stroke-width='0.6'/%3E%3C/svg%3E\")";

export function Veil() {
  const rootRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<Partial<Record<LayerName, HTMLDivElement>>>({});
  const veilRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLParagraphElement>(null);
  const ceremonyRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  // Sparkle canvas size.
  useEffect(() => {
    const c = dustRef.current!;
    const sync = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = dustRef.current!;
    const ctx = canvas.getContext('2d')!;
    let seed = 11;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const motes: Mote[] = Array.from({length: 120}, () => ({x: rand(), y: rand(), r: 0.5 + rand() * 1.8, s: 0.3 + rand(), a: 0.25 + rand() * 0.6, gold: rand() > 0.35}));
    let lastP = -1;
    let lastTime = 0;

    const set = (name: LayerName, y: number, scale = 1, opacity = 1) => {
      const el = layerRefs.current[name];
      if (!el) return;
      el.style.transform = `translate3d(0, ${y}vh, 0) scale(${scale})`;
      el.style.opacity = String(opacity);
    };

    return onFrame((time) => {
      const dt = lastTime ? Math.min(0.1, (time - lastTime) / 1000) : 1 / 60;
      lastTime = time;
      const root = rootRef.current;
      if (!root) return;
      const {p, rect} = pinProgress(root);
      if (rect.bottom < 0) return;

      // Gold sparkle drifts down every frame while the veil is visible.
      const veil = 1 - range(p, 0, 0.18);
      if (veil > 0.001) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const dpr = canvas.width / Math.max(1, w);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        for (const m of motes) {
          if (!reducedRef.current) {
            m.x += 0.004 * m.s * dt;
            m.y += 0.008 * m.s * dt;
            if (m.x > 1) m.x -= 1;
            if (m.y > 1) m.y -= 1;
          }
          ctx.fillStyle = m.gold ? '#b39a72' : '#ffffff';
          ctx.globalAlpha = m.a * veil;
          ctx.beginPath();
          ctx.arc(m.x * w, (m.y - p * 0.8) * h, m.r * (1 + p * 3), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const exit = range(p, 0.7, 1);
      const settle = easeOutCubic(range(p, 0, 0.5));

      // The veil lifts upward and away.
      const lift = range(p, 0, 0.18);
      veilRef.current!.style.opacity = String(veil);
      veilRef.current!.style.transform = `translate3d(0, ${-easeOutCubic(lift) * 34}vh, 0) scale(${1 + lift * 0.12})`;
      canvas.style.opacity = String(veil);

      // Far → near, each faster than the one behind it.
      set('sky', lerp(0, -6, p), lerp(1.14, 1, settle));
      const rise = easeOutCubic(range(p, 0.04, 0.5));
      set('sun', lerp(34, 0, rise) - exit * 12, lerp(0.9, 1, rise));
      set('hills', lerp(9, 0, settle) - exit * 26);
      const drapes = easeOutCubic(range(p, 0.28, 0.58));
      set('drapes', -exit * 44, lerp(1.6, 1, drapes), drapes);
      const up = easeOutCubic(range(p, 0.36, 0.62));
      set('arch', lerp(28, 0, up) - exit * 58, 1, clamp(up * 2));
      const ground = easeOutCubic(range(p, 0.34, 0.6));
      set('ground', lerp(36, 0, ground) - exit * 78);

      // Title: resolves (tracking closes in), then yields to the arch.
      const tIn = easeOutCubic(range(p, 0.08, 0.24));
      const tOut = range(p, 0.42, 0.52);
      const title = titleRef.current!;
      title.style.opacity = String(tIn * (1 - tOut));
      title.style.letterSpacing = `${lerp(0.6, 0.24, tIn)}em`;
      title.style.transform = `translate3d(0, ${-p * 6}vh, 0)`;
      title.style.filter = tIn < 0.99 ? `blur(${(1 - tIn) * 10}px)` : '';

      // HUD: an hour of golden light, and the ceremony counting in. The top
      // readouts bow out as the corner florals arrive (they'd sit on them);
      // the ceremony reaches "Now" just as the arch starts to rise.
      const hud = hudRef.current!;
      hud.style.opacity = String(range(p, 0.02, 0.1) * (1 - range(p, 0.62, 0.72)));
      const top = String(1 - range(p, 0.42, 0.5));
      hud.querySelectorAll<HTMLElement>('[data-hud-top]').forEach((el) => (el.style.opacity = top));
      const mins = 17 * 60 + 5 + Math.round(p * 70);
      clockRef.current!.textContent = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
      const left = Math.max(0, Math.round((1 - range(p, 0, 0.38)) * 30 * 60));
      ceremonyRef.current!.textContent = left > 0 ? `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}` : 'Now';
    });
  }, []);

  const layer = (name: LayerName) => {
    return (
      <div
        key={name}
        ref={(el) => {
          if (el) layerRefs.current[name] = el;
        }}
        className="absolute inset-0 will-change-transform"
      >
        {name === 'drapes' ? (
          <Drapes />
        ) : (
          <picture>
            <source media="(max-width: 767px)" srcSet={`/layers/m/${name}.webp`} />
            <img src={`/layers/d/${name}.webp`} alt="" aria-hidden="true" className={FIT} decoding="async" fetchPriority={name === 'sky' ? 'high' : 'auto'} />
          </picture>
        )}
        {/* The lawn carries an ivory apron below it, so when it climbs it
            fills the screen and hands straight over to the page below. */}
        {name === 'ground' && <div className="absolute inset-x-0 top-[calc(100%-1px)] h-[110vh] bg-ivory" />}
      </div>
    );
  };

  return (
    <section id="top" ref={rootRef} aria-label="Welcome" className="relative" style={{height: `${STAGE_VH}svh`}}>
      <div className="sticky top-0 h-screen-s overflow-hidden bg-ivory">
        {(['sky', 'sun', 'hills'] as const).map(layer)}

        {/* Title sits between the hills and the arch. */}
        <div ref={titleRef} className="pointer-events-none absolute inset-x-0 top-[17%] text-center md:top-[15%]" style={{opacity: 0}}>
          <h1 className="font-display text-hero font-extralight text-ink" style={{marginRight: '-0.24em'}}>
            {hero.title}
          </h1>
          <p className="-mt-[0.15em] font-script text-[clamp(2rem,5vw,4.5rem)] leading-none text-gold">{hero.script}</p>
        </div>

        {(['drapes', 'arch', 'ground'] as const).map(layer)}

        {/* The veil. */}
        <div
          ref={veilRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 will-change-transform"
          style={{
            backgroundImage: `${TULLE}, repeating-linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.55) 3vw, rgba(195,173,141,0.06) 6vw), radial-gradient(60% 50% at 30% 40%, rgba(255,255,255,0.9), transparent 70%), radial-gradient(50% 60% at 75% 62%, rgba(234,215,207,0.55), transparent 70%), linear-gradient(#faf6ef, #f3ece1)`,
          }}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center">
            <Logo className="mx-auto h-auto w-[min(72vw,30rem)]" />
            <p className="mt-10 font-display text-label text-taupe uppercase">{hero.kicker}</p>
            <p className="mt-3 font-display text-[0.8125rem] font-medium tracking-[0.42em] text-ink uppercase" style={{marginRight: '-0.42em'}}>
              {hero.lift}
            </p>
            <span aria-hidden="true" className="mt-6 inline-block animate-bounce text-gold motion-reduce:animate-none">
              ↓
            </span>
          </div>
        </div>
        <canvas ref={dustRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />

        {/* HUD. */}
        <div ref={hudRef} aria-hidden="true" className="pointer-events-none absolute inset-4 font-display text-[0.6875rem] tracking-[0.2em] text-ink/75 uppercase sm:inset-6 md:text-label" style={{opacity: 0}}>
          <div className="brackets absolute inset-0 text-gold/50" />
          <div data-hud-top className="absolute top-16 left-3 space-y-1 md:top-20 md:left-4">
            <p ref={clockRef} className="tabular-nums">17:05</p>
            <p className="text-taupe">Golden hour</p>
          </div>
          <div data-hud-top className="absolute top-16 right-3 space-y-1 text-right md:top-20 md:right-4">
            <p>
              Ceremony <span ref={ceremonyRef} className="text-gold tabular-nums">30:00</span>
            </p>
            <p className="text-taupe">Places, everyone</p>
          </div>
          <div className="absolute bottom-3 left-3 max-sm:max-w-[60%] md:bottom-4 md:left-4">{hero.site}</div>
          <div className="absolute right-3 bottom-3 flex items-center gap-2 md:right-4 md:bottom-4">
            Scroll <span className="inline-block animate-bounce motion-reduce:animate-none">↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
