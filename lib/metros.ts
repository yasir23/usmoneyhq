// lib/metros.ts — top US metros for metro-level variant pages
// ("mortgage calculator houston"). Each metro maps to a state slug so the
// calculator prefills that state's tax data; the metro adds city-level
// targeting to the title/desc/h1.
//
// ─────────────────────────────────────────────────────────────────────────────
// METRO_VARIANTS_INDEXED — measured 2026-09-22, currently FALSE
//
// The line above is an admission, and it was measured rather than assumed: a
// metro page carries NO city data at all. It renders the parent state's numbers
// with the city name substituted into the title, description and H1.
//
// Evidence — /mortgage-calculator/new-york-new-york vs
// /mortgage-calculator/binghamton-new-york, two different cities in one state:
//     numeric tokens shared          34
//     numeric tokens unique to NYC    0
//     numeric tokens unique to Bing.  0
//     visible-text similarity     99.2%
// The ONLY differing text between them is the city name. A metro page is
// therefore a doorway: it targets a location query while adding no information
// the state page does not already have.
//
// This is the same defect the sitemap already fixed for amount x state combos
// (see app/sitemap.ts — 2,907 URLs, 96-98% identical, zero internal links,
// excluded and noindexed). The metro layer is 1,085 URLs, 56% of the sitemap,
// and 100% identical to its siblings — a stronger case than the one already
// acted on, so leaving it indexed is inconsistent.
//
// FALSE means: metro URLs stay live and reachable (deep links keep working) but
// they are excluded from the sitemap and marked noindex,follow, so they stop
// competing with the state pages that CAN rank.
//
// TO REVERSE: set this to true. To make these pages genuinely worth indexing
// instead, give each metro real city-level data (metro median income, median
// home price, local tax rates) so the pages stop being permutations — an index
// entry is not a substitute for content.
// ─────────────────────────────────────────────────────────────────────────────
export const METRO_VARIANTS_INDEXED = false;

export interface Metro {
  slug: string;
  /** City display name, e.g. "Houston" or "Washington D.C.". */
  name: string;
  stateSlug: string;
  /**
   * Optional full display string ("City, State") used in titles/H1s.
   * Defaults to `${name}, <state>` — only set it when that would read wrong
   * (Washington D.C. is its own state equivalent, so "Washington, Washington
   * D.C." must not happen).
   */
  label?: string;
}

const RAW: [string, string][] = [
  ["new-york", "new-york"], ["los-angeles", "california"], ["chicago", "illinois"], ["dallas", "texas"],
  ["houston", "texas"], ["washington-dc", "district-of-columbia"], ["philadelphia", "pennsylvania"],
  ["atlanta", "georgia"], ["miami", "florida"], ["phoenix", "arizona"], ["boston", "massachusetts"],
  ["san-francisco", "california"], ["riverside", "california"], ["detroit", "michigan"],
  ["seattle", "washington"], ["minneapolis", "minnesota"], ["san-diego", "california"],
  ["tampa", "florida"], ["denver", "colorado"], ["st-louis", "missouri"], ["baltimore", "maryland"],
  ["charlotte", "north-carolina"], ["orlando", "florida"], ["san-antonio", "texas"],
  ["portland", "oregon"], ["sacramento", "california"], ["pittsburgh", "pennsylvania"],
  ["cincinnati", "ohio"], ["austin", "texas"], ["las-vegas", "nevada"], ["kansas-city", "missouri"],
  ["columbus", "ohio"], ["indianapolis", "indiana"], ["cleveland", "ohio"], ["san-jose", "california"],
  ["nashville", "tennessee"], ["virginia-beach", "virginia"], ["providence", "rhode-island"],
  ["milwaukee", "wisconsin"], ["jacksonville", "florida"], ["memphis", "tennessee"],
  ["oklahoma-city", "oklahoma"], ["louisville", "kentucky"], ["richmond", "virginia"],
  ["new-orleans", "louisiana"], ["hartford", "connecticut"], ["buffalo", "new-york"],
  ["birmingham", "alabama"], ["salt-lake-city", "utah"], ["raleigh", "north-carolina"],
  ["rochester", "new-york"], ["tucson", "arizona"], ["honolulu", "hawaii"], ["tulsa", "oklahoma"],
  ["fresno", "california"], ["bridgeport", "connecticut"], ["albuquerque", "new-mexico"],
  ["omaha", "nebraska"], ["albany", "new-york"], ["bakersfield", "california"],
  ["knoxville", "tennessee"], ["grand-rapids", "michigan"], ["allentown", "pennsylvania"],
  ["el-paso", "texas"], ["mcallen", "texas"], ["dayton", "ohio"], ["columbia", "south-carolina"],
  ["greensboro", "north-carolina"], ["sarasota", "florida"], ["little-rock", "arkansas"],
  ["charleston", "south-carolina"], ["stockton", "california"], ["akron", "ohio"],
  ["colorado-springs", "colorado"], ["poughkeepsie", "new-york"], ["ogden", "utah"],
  ["cape-coral", "florida"], ["boise", "idaho"], ["lakeland", "florida"],
  ["winston-salem", "north-carolina"], ["toledo", "ohio"], ["syracuse", "new-york"],
  ["des-moines", "iowa"], ["springfield", "massachusetts"], ["greenville", "south-carolina"],
  ["wichita", "kansas"], ["madison", "wisconsin"], ["durham", "north-carolina"],
  ["harrisburg", "pennsylvania"], ["spokane", "washington"], ["palm-bay", "florida"],
  ["fayetteville", "north-carolina"], ["augusta", "georgia"], ["modesto", "california"],
  ["deltona", "florida"], ["chattanooga", "tennessee"], ["jackson", "mississippi"],
  ["scranton", "pennsylvania"], ["lansing", "michigan"], ["portland-me", "maine"],
  ["lexington", "kentucky"], ["youngstown", "ohio"], ["huntington", "west-virginia"],
  ["pensacola", "florida"], ["fort-wayne", "indiana"], ["ann-arbor", "michigan"],
  ["flint", "michigan"], ["davenport", "iowa"], ["peoria", "illinois"], ["green-bay", "wisconsin"],
  ["columbus-ga", "georgia"], ["salem", "oregon"], ["reading", "pennsylvania"],
  ["evansville", "indiana"], ["beaumont", "texas"], ["lancaster", "pennsylvania"],
  ["myrtle-beach", "south-carolina"], ["savannah", "georgia"], ["canton", "ohio"],
  ["mobile", "alabama"], ["shreveport", "louisiana"], ["fargo", "north-dakota"],
  ["rockford", "illinois"], ["south-bend", "indiana"], ["killeen", "texas"],
  ["corpus-christi", "texas"], ["erie", "pennsylvania"], ["boulder", "colorado"],
  ["santa-rosa", "california"], ["salinas", "california"], ["vallejo", "california"],
  ["oxnard", "california"], ["victorville", "california"], ["ontario", "california"],
  ["reno", "nevada"], ["fort-collins", "colorado"], ["huntsville", "alabama"],
  ["gainesville", "florida"], ["ithaca", "new-york"], ["binghamton", "new-york"],
  ["oceanside", "california"], ["temecula", "california"], ["indio", "california"],
];

/**
 * Display overrides for slugs that do NOT title-case cleanly.
 *
 * The default name is built by title-casing each hyphen-delimited word, which is
 * correct for "new-york" → "New York" but produces junk for slugs that carry a
 * state/postal suffix or a period-bearing abbreviation:
 *   washington-dc → "Washington Dc" · st-louis → "St Louis"
 *   portland-me   → "Portland Me"   · columbus-ga → "Columbus Ga"
 * All four leaked onto live metro pages (2026-09-17). `label` overrides the
 * "City, State" form only where that pairing would double the state.
 */
const DISPLAY: Record<string, { name: string; label?: string }> = {
  // DC has BOTH a state entry ("Washington D.C.") and this metro, and they cover
  // the same geography — so the metro label must not repeat the state name or
  // the two pages ship an identical <title> (caught by the metro verifier).
  "washington-dc": { name: "Washington D.C.", label: "Washington D.C. Metro" },
  "st-louis": { name: "St. Louis" },
  "portland-me": { name: "Portland" },
  "columbus-ga": { name: "Columbus" },
};

export const METROS: Metro[] = RAW.map(([city, stateSlug]) => {
  const ov = DISPLAY[city];
  const base: Metro = {
    slug: `${city}-${stateSlug}`,
    name: ov?.name || city.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
    stateSlug,
  };
  return ov?.label ? { ...base, label: ov.label } : base;
});

export function getMetro(slug: string): Metro | undefined {
  return METROS.find((m) => m.slug === slug);
}

/**
 * Metros that belong to a state — used to link a STATE page DOWN to its city
 * pages.
 *
 * Why this exists (measured 2026-09-18): metro pages were net EXPORTERS of
 * internal links — every one renders the 50-state cloud — while nothing linked
 * INTO them. All 7 tool roots together emitted just 7 metro links, and state
 * pages emitted none, so 999 of the 1,001 metro URLs were reachable only via the
 * sitemap. A page that nothing links to inherits no internal authority and gets
 * minimal crawl priority, which is why the metro-tier SEO fixes (1,001 titles,
 * H1s and descriptions) could not produce traffic: Google had no path to them.
 */
export function metrosForState(stateSlug: string): Metro[] {
  return METROS.filter((m) => m.stateSlug === stateSlug);
}
