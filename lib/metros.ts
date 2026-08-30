// lib/metros.ts — top US metros for metro-level variant pages
// ("mortgage calculator houston"). Each metro maps to a state slug so the
// calculator prefills that state's tax data; the metro adds city-level
// targeting to the title/desc/h1.
export interface Metro {
  slug: string;
  name: string;
  stateSlug: string;
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

export const METROS: Metro[] = RAW.map(([city, stateSlug]) => ({
  slug: `${city}-${stateSlug}`,
  name: city.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") + (city === "washington-dc" ? "" : ""),
  stateSlug,
}));

export function getMetro(slug: string): Metro | undefined {
  return METROS.find((m) => m.slug === slug);
}
