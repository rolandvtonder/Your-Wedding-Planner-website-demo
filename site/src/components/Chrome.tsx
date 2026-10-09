import {useEffect, useRef, useState, type MouseEvent} from 'react';
import {brand, nav} from '../content';
import {pinProgress, range} from '../lib/math';
import {onFrame, scrollToHash} from '../lib/scroll';

function go(e: MouseEvent<HTMLAnchorElement>, then?: () => void) {
  const hash = e.currentTarget.getAttribute('href');
  if (!hash?.startsWith('#')) return;
  e.preventDefault();
  then?.();
  scrollToHash(hash);
}

/** The logo, as supplied — made transparent so it sits on ivory or a photo. */
export function Logo({className = ''}: {className?: string}) {
  return (
    <picture>
      <source srcSet={brand.logo} type="image/webp" />
      <img src={brand.logoFallback} alt={brand.name} width={900} height={376} className={className} decoding="async" />
    </picture>
  );
}

/** The logo's diamond, for small marks. */
export function Diamond({className = ''}: {className?: string}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M6 4.5h12l4 5.4L12 21 2 9.9Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);

  // Read and written per frame, never through state. Over the opening scene
  // the header stays bare and its logo steps aside for the corner florals
  // (the veil already shows the logo large); once the scene has handed over
  // to the page, a soft ivory bar fades in behind it.
  useEffect(() => {
    let lastBar = -1;
    let lastLogo = -1;
    const hero = document.getElementById('top');
    return onFrame(() => {
      if (!hero) return;
      const {p, rect} = pinProgress(hero);
      const bar = rect.bottom < 80 ? 1 : 0;
      const logo = rect.bottom < 80 ? 1 : 1 - range(p, 0.26, 0.34) + range(p, 0.86, 0.96);
      if (bar !== lastBar) barRef.current!.style.opacity = String((lastBar = bar));
      if (Math.abs(logo - lastLogo) > 0.001) logoRef.current!.style.opacity = String((lastLogo = logo));
    });
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 text-ink">
      <div ref={barRef} aria-hidden="true" className="absolute inset-0 border-b border-ink/5 bg-ivory/85 opacity-0 backdrop-blur-md transition-opacity duration-500" />
      <div className="relative flex items-center justify-between px-4 py-2.5 sm:px-6 md:px-[3vw]">
        <a ref={logoRef} href="#top" onClick={(e) => go(e)} className="block py-1" aria-label={`${brand.name} — back to top`}>
          <Logo className="h-9 w-auto md:h-11" />
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={(e) => go(e)} className="py-2 font-display text-label text-ink/75 uppercase transition-colors hover:text-gold">
              {item.label}
            </a>
          ))}
          <a href="#enquire" onClick={(e) => go(e)} className="rounded-[2px] bg-ink px-5 py-3 font-display text-label text-ivory uppercase transition-colors hover:bg-gold">
            Plan your day
          </a>
        </nav>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="menu" className="-mr-2 px-2 py-3 font-display text-label uppercase md:hidden">
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      <div id="menu" inert={!open} className={`fixed inset-0 -z-10 flex flex-col justify-center gap-6 bg-ivory/97 px-6 backdrop-blur-xl transition-opacity md:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        {[...nav, {label: 'Enquire', href: '#enquire'}].map((item, i) => (
          <a key={item.href} href={item.href} onClick={(e) => go(e, () => setOpen(false))} className="flex items-baseline gap-4 font-serif text-[2.25rem] text-ink">
            <span className="font-display text-label text-gold">0{i + 1}</span>
            {item.label}
          </a>
        ))}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ivory px-4 py-10 sm:px-6 md:px-[6vw]">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <Logo className="h-12 w-auto self-start" />
        <div className="flex flex-col gap-4 font-display text-label text-taupe uppercase md:flex-row md:items-center md:gap-10">
          <a href={`mailto:${brand.email}`} className="py-1 normal-case tracking-[0.06em] hover:text-gold">
            {brand.email}
          </a>
          <a href={brand.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-1 hover:text-gold">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="currentColor">
              <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21Z" />
            </svg>
            Facebook
          </a>
          <span>© {new Date().getFullYear()} {brand.name}</span>
          <a href="#top" onClick={(e) => go(e)} className="py-1 hover:text-gold">
            Back to the beginning ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
