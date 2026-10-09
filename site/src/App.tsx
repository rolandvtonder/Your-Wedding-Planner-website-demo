import {useEffect} from 'react';
import {About} from './components/About';
import {Footer, Header} from './components/Chrome';
import {Enquire} from './components/Enquire';
import {Gallery} from './components/Gallery';
import {Journey} from './components/Journey';
import {Services} from './components/Services';
import {Veil} from './components/Veil';
import {useReducedMotion} from './hooks/useReducedMotion';
import {startScroll} from './lib/scroll';

export default function App() {
  const reduced = useReducedMotion();
  useEffect(() => startScroll(reduced), [reduced]);

  return (
    <>
      <a href="#gallery" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-[4px] focus:bg-ink focus:px-4 focus:py-3 focus:text-ivory">
        Skip to content
      </a>
      <Header />
      <main>
        <Veil />
        <Gallery />
        <Journey />
        <Services />
        <About />
        <Enquire />
      </main>
      <Footer />
    </>
  );
}
