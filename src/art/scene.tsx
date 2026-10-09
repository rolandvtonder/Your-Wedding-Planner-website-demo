import {useMemo, type ReactNode} from 'react';
import {seeded} from '../lib/math';

/**
 * The hero scene, drawn as vector layers that share one 1600×1000 stage.
 *
 * These are NOT rendered live. `npm run layers` (scripts/render-layers.mjs)
 * draws each one to a WebP in public/layers/{d,m}/ — the page slides
 * images, not a thousand SVG nodes, which is what keeps it smooth. Edit the
 * art here, then re-run the script.
 *
 * Every full-bleed layer uses `xMidYMid slice`, so they crop identically and
 * stay registered at any viewport; on a portrait phone the visible window is
 * roughly x 570–1030, which is why everything that matters — sun, arch,
 * couple — sits inside that band around x = 800.
 *
 * The corner florals are the exception: they're pinned to the screen
 * corners instead, so they frame the view on a phone as well as a monitor.
 */

export const VB = '0 0 1600 1000';
const FULL = 'absolute inset-0 size-full';

/** Arch geometry — the sun ends up framed exactly inside it. */
export const ARCH = {cx: 800, cy: 573, r: 185};

const BLOOM = ['#fffdf8', '#fbf4ea', '#f6e9dc', '#efd6cb', '#fffaf2'];
const LEAF = ['#8e9a7e', '#7d8a6f', '#a3ad93'];

/** A single flower: petals for the big ones, layered discs for the small. */
function bloom(key: string, x: number, y: number, r: number, color: string, rot: number): ReactNode {
  if (r < 10) {
    return (
      <g key={key} transform={`translate(${x} ${y})`}>
        <circle r={r} fill={color} />
        <circle r={r * 0.55} fill="#e9d9c6" opacity="0.55" />
        <circle r={r * 0.22} fill="#d7bd94" />
      </g>
    );
  }
  return (
    <g key={key} transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={r * 0.42} cy="0" rx={r * 0.6} ry={r * 0.46} fill={color} transform={`rotate(${a})`} stroke="#e8d8c5" strokeWidth="0.6" />
      ))}
      <circle r={r * 0.42} fill="#f3e4d2" />
      <circle r={r * 0.2} fill="#d2b78d" />
    </g>
  );
}

function leaf(key: string, x: number, y: number, len: number, angle: number, color: string): ReactNode {
  return <ellipse key={key} cx={x} cy={y} rx={len} ry={len * 0.36} fill={color} transform={`rotate(${angle} ${x} ${y})`} />;
}

export function SkyArt() {
  return (
    <svg viewBox={VB} preserveAspectRatio="xMidYMid slice" className={FULL} aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe5da" />
          <stop offset="0.42" stopColor="#f6e0cc" />
          <stop offset="0.66" stopColor="#f5cfb2" />
          <stop offset="1" stopColor="#f1c4a3" />
        </linearGradient>
        <filter id="cloud" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <rect width="1600" height="1000" fill="url(#sky)" />
      <g fill="#fff" filter="url(#cloud)" opacity="0.55">
        <ellipse cx="300" cy="260" rx="260" ry="34" />
        <ellipse cx="470" cy="300" rx="180" ry="22" />
        <ellipse cx="1240" cy="220" rx="300" ry="30" />
        <ellipse cx="1100" cy="330" rx="160" ry="18" />
        <ellipse cx="760" cy="150" rx="220" ry="20" />
      </g>
    </svg>
  );
}

export function SunArt() {
  return (
    <svg viewBox={VB} preserveAspectRatio="xMidYMid slice" className={FULL} aria-hidden="true">
      <defs>
        <radialGradient id="sun-halo">
          <stop offset="0" stopColor="#fff4dc" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#ffe9c7" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffe3c0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sun-disc" cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor="#fff8ea" />
          <stop offset="0.6" stopColor="#fbe3b8" />
          <stop offset="1" stopColor="#f1c78f" />
        </radialGradient>
      </defs>
      <circle cx={ARCH.cx} cy={ARCH.cy} r="420" fill="url(#sun-halo)" />
      <circle cx={ARCH.cx} cy={ARCH.cy} r="118" fill="url(#sun-disc)" />
    </svg>
  );
}

export function HillsArt() {
  return (
    <svg viewBox={VB} preserveAspectRatio="xMidYMid slice" className={FULL} aria-hidden="true">
      <defs>
        <linearGradient id="far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2bfab" />
          <stop offset="1" stopColor="#e8cdbb" />
        </linearGradient>
        <linearGradient id="mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfb39b" />
          <stop offset="1" stopColor="#dccbb5" />
        </linearGradient>
        <linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9cdb3" />
          <stop offset="1" stopColor="#efe7d8" />
        </linearGradient>
      </defs>
      {/* Far range — table-topped like the Cape mountains, dipping to a valley
          that the sun climbs out of. */}
      <path
        d="M0 1000 L0 590 C90 575 160 545 240 548 C300 550 330 575 400 572 C470 569 520 600 580 625 C650 655 720 690 800 694 C880 690 950 660 1020 628 C1080 600 1120 560 1190 552 L1330 552 C1380 552 1400 575 1460 580 C1520 585 1560 575 1600 572 L1600 1000 Z"
        fill="url(#far)"
      />
      {/* Cypresses on the ridge. */}
      <g fill="#b7a088" opacity="0.8">
        {[
          [520, 612, 46],
          [538, 618, 34],
          [1068, 606, 50],
          [1088, 600, 38],
          [1250, 556, 30],
          [300, 556, 28],
        ].map(([x, y, h]) => (
          <path key={x} d={`M${x} ${y} C${x - 7} ${y - h * 0.4} ${x - 4} ${y - h * 0.85} ${x} ${y - h} C${x + 4} ${y - h * 0.85} ${x + 7} ${y - h * 0.4} ${x} ${y} Z`} />
        ))}
      </g>
      <path
        d="M0 1000 L0 665 C120 645 220 652 330 668 C450 686 560 700 680 706 C760 710 840 710 920 706 C1040 700 1160 684 1280 666 C1400 650 1500 644 1600 652 L1600 1000 Z"
        fill="url(#mid)"
      />
      {/* Vineyard rows, barely there. */}
      <g fill="none" stroke="#a88f74" strokeOpacity="0.18" strokeWidth="1.5">
        {Array.from({length: 7}, (_, i) => (
          <path key={i} d={`M0 ${690 + i * 9} C300 ${700 + i * 12} 520 ${716 + i * 11} 800 ${720 + i * 11} C1080 ${716 + i * 11} 1300 ${700 + i * 12} 1600 ${684 + i * 9}`} />
        ))}
      </g>
      <path d="M0 1000 L0 740 C300 730 520 742 800 746 C1080 742 1300 730 1600 738 L1600 1000 Z" fill="url(#meadow)" />
    </svg>
  );
}

/** The floral arch from the gallery's "Just married" photo, with the couple beneath. */
export function ArchArt() {
  const parts = useMemo(() => {
    const rand = seeded(23);
    const blooms: ReactNode[] = [];
    const leaves: ReactNode[] = [];
    // Walk the ring, leaving the bottom open where it meets the steps.
    for (let i = 0; i < 170; i++) {
      const t = rand();
      const a = (-80 + t * 340) * (Math.PI / 180); // 0° = right, clockwise in SVG
      const deg = (a * 180) / Math.PI;
      if (deg > 62 && deg < 118) continue;
      // Heavier clusters low-left and high-right, like a hand-built arch.
      const lush = Math.max(Math.exp(-(((deg - 150) / 40) ** 2)), Math.exp(-(((deg + 40) / 38) ** 2)));
      const spread = 10 + lush * 22;
      const r0 = ARCH.r + (rand() - 0.5) * spread;
      const x = ARCH.cx + Math.cos(a) * r0;
      const y = ARCH.cy + Math.sin(a) * r0;
      if (rand() < 0.42) {
        leaves.push(leaf(`l${i}`, x + (rand() - 0.5) * 18, y + (rand() - 0.5) * 18, 9 + rand() * 9, deg + 90 + (rand() - 0.5) * 70, LEAF[i % 3]));
      }
      const size = 5 + rand() * 9 + lush * 9;
      blooms.push(bloom(`b${i}`, x, y, size, BLOOM[Math.floor(rand() * BLOOM.length)], rand() * 72));
    }
    return {blooms, leaves};
  }, []);

  return (
    <svg viewBox={VB} preserveAspectRatio="xMidYMid slice" className={FULL} aria-hidden="true">
      {/* Steps. */}
      <rect x="610" y="757" width="380" height="16" fill="#f6efe4" />
      <rect x="610" y="757" width="380" height="2" fill="#fff" opacity="0.8" />
      <rect x="570" y="773" width="460" height="20" fill="#efe6d8" />
      <rect x="570" y="773" width="460" height="2" fill="#fff" opacity="0.7" />
      {/* The ring itself, a thin frame under the flowers. */}
      <circle cx={ARCH.cx} cy={ARCH.cy} r={ARCH.r} fill="none" stroke="#b8a283" strokeWidth="3" strokeDasharray="980 200" strokeDashoffset="-190" />
      <g>{parts.leaves}</g>
      <g>{parts.blooms}</g>

      {/* The couple, hand in hand. */}
      <g fill="#3a2f29">
        {/* Bride's veil, catching the light. */}
        <path d="M770 588 C742 630 724 690 716 748 C736 718 752 672 774 606 Z" fill="#fffaf2" opacity="0.75" />
        {/* Bride */}
        <circle cx="775" cy="597" r="11.5" />
        <circle cx="766" cy="592" r="6.5" />
        <path d="M766 612 C772 608 780 608 785 612 L783 640 L780 660 C796 694 806 728 812 760 L716 761 C734 752 744 730 750 708 C756 688 762 672 767 660 L765 640 Z" fill="#f9f3ea" stroke="#3a2f29" strokeWidth="2.2" strokeLinejoin="round" />
        {/* Groom */}
        <circle cx="839" cy="590" r="12.5" />
        <path d="M821 607 C832 600 848 600 858 607 L864 650 L860 684 L858 760 L846 760 L841 696 L836 760 L824 760 L822 684 L817 650 Z" />
        {/* Joined hands. */}
        <path d="M784 618 C794 640 800 656 808 666 M821 614 C816 638 812 654 808 666" fill="none" stroke="#3a2f29" strokeWidth="6" strokeLinecap="round" />
        {/* Bouquet. */}
        <g transform="translate(772 662)">
          <circle r="7" fill="#efd6cb" />
          <circle cx="-6" cy="3" r="5" fill="#fffdf8" />
          <circle cx="6" cy="3" r="5" fill="#fffdf8" />
          <ellipse cx="0" cy="10" rx="2.5" ry="7" fill="#7d8a6f" />
        </g>
      </g>
    </svg>
  );
}

/** Foreground lawn with scattered petals. Carries an ivory apron below it. */
export function GroundArt() {
  const petals = useMemo(() => {
    const rand = seeded(7);
    return Array.from({length: 70}, (_, i) => {
      const x = rand() * 1600;
      const y = 830 + rand() * 170;
      return <ellipse key={i} cx={x} cy={y} rx={3 + rand() * 4} ry={2 + rand() * 2} fill={i % 3 === 0 ? '#e7cbbf' : i % 3 === 1 ? '#d9c19d' : '#fffdf8'} transform={`rotate(${rand() * 180} ${x} ${y})`} opacity={0.8} />;
    });
  }, []);
  const tufts = useMemo(() => {
    const rand = seeded(41);
    const out: ReactNode[] = [];
    for (let i = 0; i < 46; i++) {
      const x = (i / 46) * 1600 + rand() * 30;
      const base = 818 - Math.cos(((x - 800) / 800) * Math.PI * 0.5) * 6 + (Math.abs(x - 800) / 800) * 14;
      const h = 18 + rand() * 30;
      out.push(<path key={`g${i}`} d={`M${x} ${base} q${-4 + rand() * 8} ${-h / 2} ${-6 + rand() * 12} ${-h}`} stroke={LEAF[i % 3]} strokeWidth="2" fill="none" strokeLinecap="round" />);
      if (i % 4 === 0) out.push(bloom(`f${i}`, x + 3, base - h + 2, 4 + rand() * 4, i % 8 === 0 ? '#efd6cb' : '#fffdf8', rand() * 70));
    }
    return out;
  }, []);

  return (
    <svg viewBox={VB} preserveAspectRatio="xMidYMid slice" className={FULL} aria-hidden="true">
      <defs>
        <linearGradient id="lawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe5d4" />
          <stop offset="0.35" stopColor="#f6f0e5" />
          <stop offset="1" stopColor="#faf6ef" />
        </linearGradient>
      </defs>
      <path d="M0 1000 L0 830 C260 806 520 812 800 818 C1080 812 1340 806 1600 830 L1600 1000 Z" fill="url(#lawn)" />
      {tufts}
      {petals}
    </svg>
  );
}

/** Generated floral cluster for the drape corners (top-left orientation). */
export function ClusterArt({seed}: {seed: number}) {
  const parts = useMemo(() => {
    const rand = seeded(seed);
    const leaves: ReactNode[] = [];
    const blooms: ReactNode[] = [];
    for (let i = 0; i < 46; i++) {
      // A fan out from the corner.
      const a = rand() * Math.PI * 0.5;
      const d = 30 + rand() * 210 * (0.6 + 0.4 * Math.sin(a * 2));
      const x = Math.cos(a) * d;
      const y = Math.sin(a) * d;
      leaves.push(leaf(`l${i}`, x + 14, y + 10, 12 + rand() * 16, (a * 180) / Math.PI + (rand() - 0.5) * 80, LEAF[i % 3]));
      if (d < 200) blooms.push(bloom(`b${i}`, x, y, 9 + rand() * 18 * (1 - d / 300), BLOOM[i % BLOOM.length], rand() * 72));
    }
    return {leaves, blooms};
  }, [seed]);
  return (
    <svg viewBox="-20 -20 300 300" aria-hidden="true">
      {parts.leaves}
      {parts.blooms}
    </svg>
  );
}
