/**
 * Every word on the page, in one place. Edit copy here — components only
 * read from this file.
 *
 * Photos were cut from screenshots of the Facebook page, so they are small
 * (~240px). Drop full-size originals into public/media/ with the same names
 * and they'll sharpen up with no code changes.
 */

/** Public files, resolved against the site's base path (e.g. a GitHub Pages sub-folder). */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const brand = {
  name: 'Your Wedding Planner',
  email: 'Hello@yourweddingplanner.co.za',
  facebook: 'https://www.facebook.com/YourWeddingPlannerSA/',
  logo: asset('brand/logo.webp'),
  logoFallback: asset('brand/logo.png'),
};

export const nav = [
  {label: 'Gallery', href: '#gallery'},
  {label: 'Journey', href: '#journey'},
  {label: 'Services', href: '#services'},
  {label: 'About', href: '#about'},
];

export const hero = {
  title: 'EVER AFTER',
  script: 'begins here',
  kicker: 'Personalised wedding planning',
  lift: 'Scroll to lift the veil',
  site: 'Full planning · Coordination · Décor & styling',
};

export const gallery = {
  eyebrow: 'Real weddings',
  heading: 'Love stories, frame by frame.',
  body: 'From the first look to the last dance — a few of the days we’ve had the honour of walking with our couples.',
  items: [
    {tag: 'The ceremony', title: 'Just married', body: 'A circle of white blooms, a burst of joy, and a whole new chapter.', image: asset('media/gallery/just-married.webp')},
    {tag: 'Candlelight', title: 'The vows', body: 'A cellar lit by a hundred flames, and two promises that filled it.', image: asset('media/gallery/the-vows.webp')},
    {tag: 'Styling', title: 'Tablescapes', body: 'Brass candlesticks, soft linen and blooms gathered low and lush.', image: asset('media/gallery/tablescape.webp')},
    {tag: 'Portraits', title: 'Golden hour', body: 'The quiet ten minutes we always protect in the timeline.', image: asset('media/gallery/golden-hour.webp')},
    {tag: 'Colour', title: 'Blush & rose', body: 'Taper candles, blush napkins and a pop of red to make it sing.', image: asset('media/gallery/styling.webp')},
    {tag: 'The details', title: 'The cake', body: 'Proteas, eucalyptus and two small guests of honour on top.', image: asset('media/gallery/the-cake.webp')},
    {tag: 'Reception', title: 'Under chandeliers', body: 'One long table, deep velvet and every face lit up.', image: asset('media/gallery/reception.webp')},
    {tag: 'Forever', title: 'Happily ever after', body: 'The veil, the breeze, and the moment it all sinks in.', image: asset('media/gallery/forever.webp')},
  ],
};

/** Stages of the planning journey, in drawing order. */
export const journey = {
  eyebrow: 'The journey',
  heading: 'From “yes” to “I do”, drawn as you scroll.',
  counterLabel: 'Days to go',
  start: 'YOUR YES',
  end: 'I DO',
  legs: [
    {when: '12 months to go', title: 'First coffee', body: 'We meet, listen to your story, and get to know the day you’re dreaming of — and the two of you.'},
    {when: '9 months to go', title: 'The master plan', body: 'Budget, venue, vendors and a timeline that keeps every moving part in step. You make the choices; we do the chasing.'},
    {when: '3 months to go', title: 'Design & styling', body: 'Mood boards become florals, linen, stationery and tablescapes. Tastings, fittings and final details fall into place.'},
    {when: 'The day', title: 'The big day', body: 'We run the day so that you can live it. Every cue, every vendor, every little thing — handled.'},
  ],
};

export const services = {
  eyebrow: 'Services',
  heading: 'However much help you need.',
  note: 'Every package is personalised — let’s chat about yours.',
  items: [
    {
      name: 'Full Wedding Planning',
      short: 'Full planning',
      body: 'From the first venue visit to the final farewell, we walk every step with you.',
      lines: ['Budget & timeline management', 'Venue & vendor sourcing', 'Design concept & styling', 'Full on-the-day coordination'],
      image: asset('media/services/full-planning.webp'),
      featured: true,
    },
    {
      name: 'On the Day Coordination',
      short: 'Coordination',
      body: 'You’ve planned it beautifully — we’ll run it, so you can be fully present.',
      lines: ['Final vendor confirmations', 'Run-sheet & timeline', 'Ceremony & reception flow', 'Set-up & pack-down oversight'],
      image: asset('media/services/coordination.webp'),
    },
    {
      name: 'Décor and Styling',
      short: 'Décor & styling',
      body: 'A look that feels like you, from ceremony arches to the last place card.',
      lines: ['Mood boards & concept', 'Florals, linen & tableware', 'Stationery & signage', 'Installation on the day'],
      image: asset('media/services/styling.webp'),
    },
    {
      name: 'Opulent Gifts',
      short: 'Opulent gifts',
      body: 'Beautifully curated gifts for your bridal party, your guests and each other.',
      lines: ['Bridal party boxes', 'Guest favours', 'Personalised keepsakes'],
      image: asset('media/services/gifts.webp'),
    },
    {
      name: 'Concierge Services',
      short: 'Concierge',
      body: 'The extras, handled — so nothing slips through the cracks.',
      lines: ['Guest accommodation & transfers', 'Appointments & errands', 'Special requests, sorted'],
      image: asset('media/services/concierge.webp'),
    },
  ],
  unsure: {
    title: 'Not sure yet?',
    body: 'Tell us a little about your day and we’ll suggest the right fit — no pressure, just a conversation.',
    cta: 'Start a conversation',
  },
};

export const about = {
  eyebrow: 'Meet your planner',
  heading: 'We walk the journey with you.',
  body: [
    'Your Wedding Planner is a personalised service. We don’t hand you a checklist and disappear — we walk the whole journey with our couples, from the first coffee to the last dance.',
    'Whether you need someone to carry the entire plan, style a room until it glows, or simply run the day so you can be in it, we’ll shape our help around you.',
  ],
  signoff: 'With love,',
  signature: 'Your Wedding Planner',
  image: asset('media/about/planner.webp'),
  imageAlt: 'Your wedding planner, laughing, in a bridal boutique',
};

export const testimonials = {
  eyebrow: 'Kind words',
  heading: 'From our couples.',
  /**
   * PLACEHOLDER quotes — the Facebook page has no reviews yet. Replace
   * these with real words from real couples (with their permission), then
   * set `placeholder` to false to remove the note on the page.
   */
  placeholder: true,
  note: 'Sample testimonials — real reviews coming soon.',
  items: [
    {quote: 'We actually got to enjoy our own wedding. Every time we turned around, something had already been taken care of.', who: 'Bride & groom', where: 'Sample quote'},
    {quote: 'She understood our style better than we did. The tables, the candles, the flowers — it looked like us, only better.', who: 'Newlyweds', where: 'Sample quote'},
    {quote: 'Calm, organised and so much fun to plan with. It felt like having a friend who happens to know every vendor in town.', who: 'Happy couple', where: 'Sample quote'},
  ],
};

export const enquire = {
  eyebrow: 'Enquire',
  heading: 'Let’s plan your day.',
  body: 'Tell us a little about your wedding and we’ll be in touch to set up a first coffee. No commitment — just a conversation.',
  countdownLabel: 'Your day is in',
  countdownEmpty: 'Pick your date in the form and watch the countdown begin.',
  submit: 'Send my enquiry',
};
