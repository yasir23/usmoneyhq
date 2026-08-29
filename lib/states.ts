// lib/states.ts — US state data layer for programmatic state-variant pages.
// Values are public averages (property tax % of home value, sales tax %, income tax type).
// All displayed with an "estimate — verify current rates" label.
export type IncomeTaxType = "none" | "flat" | "progressive";

export type StateData = {
  slug: string;
  abbr: string;
  name: string;
  incomeTax: IncomeTaxType;
  incomeTaxNote: string;
  propTaxPct: number; // avg effective property tax rate (% of home value)
  salesTax: number; // avg combined state+local sales tax (%)
};

export const STATES: StateData[] = [
  { slug: "alabama", abbr: "AL", name: "Alabama", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 2-5%", propTaxPct: 0.41, salesTax: 9.22 },
  { slug: "alaska", abbr: "AK", name: "Alaska", incomeTax: "none", incomeTaxNote: "No state income tax", propTaxPct: 1.06, salesTax: 1.76 },
  { slug: "arizona", abbr: "AZ", name: "Arizona", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 2.5-4.5%", propTaxPct: 0.56, salesTax: 8.40 },
  { slug: "arkansas", abbr: "AR", name: "Arkansas", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 2-4.9%", propTaxPct: 0.56, salesTax: 9.48 },
  { slug: "california", abbr: "CA", name: "California", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 1-13.3%", propTaxPct: 0.72, salesTax: 8.82 },
  { slug: "colorado", abbr: "CO", name: "Colorado", incomeTax: "flat", incomeTaxNote: "Flat state income tax, 4.4%", propTaxPct: 0.52, salesTax: 7.77 },
  { slug: "connecticut", abbr: "CT", name: "Connecticut", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 3-6.99%", propTaxPct: 2.14, salesTax: 6.35 },
  { slug: "delaware", abbr: "DE", name: "Delaware", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 2.2-6.6%", propTaxPct: 0.55, salesTax: 0.0 },
  { slug: "district-of-columbia", abbr: "DC", name: "Washington D.C.", incomeTax: "progressive", incomeTaxNote: "Progressive income tax, 4-10.75%", propTaxPct: 0.55, salesTax: 6.0 },
  { slug: "florida", abbr: "FL", name: "Florida", incomeTax: "none", incomeTaxNote: "No state income tax", propTaxPct: 0.83, salesTax: 7.01 },
  { slug: "georgia", abbr: "GA", name: "Georgia", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 1-5.75%", propTaxPct: 0.87, salesTax: 7.35 },
  { slug: "hawaii", abbr: "HI", name: "Hawaii", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 1.4-11%", propTaxPct: 0.29, salesTax: 4.44 },
  { slug: "idaho", abbr: "ID", name: "Idaho", incomeTax: "flat", incomeTaxNote: "Flat state income tax, 5.8%", propTaxPct: 0.70, salesTax: 6.02 },
  { slug: "illinois", abbr: "IL", name: "Illinois", incomeTax: "flat", incomeTaxNote: "Flat state income tax, 4.95%", propTaxPct: 2.08, salesTax: 8.82 },
  { slug: "indiana", abbr: "IN", name: "Indiana", incomeTax: "flat", incomeTaxNote: "Flat state income tax, 3.05%", propTaxPct: 0.81, salesTax: 7.0 },
  { slug: "iowa", abbr: "IA", name: "Iowa", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 4.4-5.7%", propTaxPct: 1.14, salesTax: 6.94 },
  { slug: "kansas", abbr: "KS", name: "Kansas", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 3.1-5.7%", propTaxPct: 1.27, salesTax: 8.7 },
  { slug: "kentucky", abbr: "KY", name: "Kentucky", incomeTax: "flat", incomeTaxNote: "Flat state income tax, 4.5%", propTaxPct: 0.83, salesTax: 6.0 },
  { slug: "louisiana", abbr: "LA", name: "Louisiana", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 1.85-4.25%", propTaxPct: 0.52, salesTax: 9.55 },
  { slug: "maine", abbr: "ME", name: "Maine", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 5.8-7.15%", propTaxPct: 1.19, salesTax: 5.5 },
  { slug: "maryland", abbr: "MD", name: "Maryland", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 2-5.75%", propTaxPct: 1.02, salesTax: 6.0 },
  { slug: "massachusetts", abbr: "MA", name: "Massachusetts", incomeTax: "flat", incomeTaxNote: "Flat state income tax, 5%", propTaxPct: 1.09, salesTax: 6.25 },
  { slug: "michigan", abbr: "MI", name: "Michigan", incomeTax: "flat", incomeTaxNote: "Flat state income tax, 4.25%", propTaxPct: 1.31, salesTax: 6.0 },
  { slug: "minnesota", abbr: "MN", name: "Minnesota", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 5.35-9.85%", propTaxPct: 1.00, salesTax: 7.49 },
  { slug: "mississippi", abbr: "MS", name: "Mississippi", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 4-5%", propTaxPct: 0.66, salesTax: 7.07 },
  { slug: "missouri", abbr: "MO", name: "Missouri", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 2-5.3%", propTaxPct: 0.93, salesTax: 8.1 },
  { slug: "montana", abbr: "MT", name: "Montana", incomeTax: "none", incomeTaxNote: "No state income tax (some local taxes)", propTaxPct: 0.74, salesTax: 0.0 },
  { slug: "nebraska", abbr: "NE", name: "Nebraska", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 2.46-6.64%", propTaxPct: 1.53, salesTax: 6.94 },
  { slug: "nevada", abbr: "NV", name: "Nevada", incomeTax: "none", incomeTaxNote: "No state income tax", propTaxPct: 0.54, salesTax: 8.23 },
  { slug: "new-hampshire", abbr: "NH", name: "New Hampshire", incomeTax: "none", incomeTaxNote: "No general income tax (interest/dividends only)", propTaxPct: 1.86, salesTax: 0.0 },
  { slug: "new-jersey", abbr: "NJ", name: "New Jersey", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 1.4-10.75%", propTaxPct: 2.23, salesTax: 6.6 },
  { slug: "new-mexico", abbr: "NM", name: "New Mexico", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 1.7-5.9%", propTaxPct: 0.65, salesTax: 7.6 },
  { slug: "new-york", abbr: "NY", name: "New York", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 4-10.9%", propTaxPct: 1.40, salesTax: 8.52 },
  { slug: "north-carolina", abbr: "NC", name: "North Carolina", incomeTax: "flat", incomeTaxNote: "Flat state income tax, 4.25%", propTaxPct: 0.75, salesTax: 6.98 },
  { slug: "north-dakota", abbr: "ND", name: "North Dakota", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 1.95-2.5%", propTaxPct: 0.95, salesTax: 6.96 },
  { slug: "ohio", abbr: "OH", name: "Ohio", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 2.75-3.5%", propTaxPct: 1.48, salesTax: 7.18 },
  { slug: "oklahoma", abbr: "OK", name: "Oklahoma", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 0.25-4.75%", propTaxPct: 0.82, salesTax: 8.97 },
  { slug: "oregon", abbr: "OR", name: "Oregon", incomeTax: "none", incomeTaxNote: "No sales tax; income taxed 4.75-9.9%", propTaxPct: 0.93, salesTax: 0.0 },
  { slug: "pennsylvania", abbr: "PA", name: "Pennsylvania", incomeTax: "flat", incomeTaxNote: "Flat state income tax, 3.07%", propTaxPct: 1.49, salesTax: 6.34 },
  { slug: "rhode-island", abbr: "RI", name: "Rhode Island", incomeTax: "flat", incomeTaxNote: "Flat state income tax, 3.75%", propTaxPct: 1.43, salesTax: 7.0 },
  { slug: "south-carolina", abbr: "SC", name: "South Carolina", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 0-6.4%", propTaxPct: 0.55, salesTax: 7.44 },
  { slug: "south-dakota", abbr: "SD", name: "South Dakota", incomeTax: "none", incomeTaxNote: "No state income tax", propTaxPct: 1.21, salesTax: 6.4 },
  { slug: "tennessee", abbr: "TN", name: "Tennessee", incomeTax: "none", incomeTaxNote: "No earned income tax", propTaxPct: 0.58, salesTax: 9.55 },
  { slug: "texas", abbr: "TX", name: "Texas", incomeTax: "none", incomeTaxNote: "No state income tax", propTaxPct: 1.60, salesTax: 8.19 },
  { slug: "utah", abbr: "UT", name: "Utah", incomeTax: "flat", incomeTaxNote: "Flat state income tax, 4.55%", propTaxPct: 0.55, salesTax: 6.77 },
  { slug: "vermont", abbr: "VT", name: "Vermont", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 3.35-8.75%", propTaxPct: 1.76, salesTax: 6.24 },
  { slug: "virginia", abbr: "VA", name: "Virginia", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 2-5.75%", propTaxPct: 0.79, salesTax: 5.65 },
  { slug: "washington", abbr: "WA", name: "Washington", incomeTax: "none", incomeTaxNote: "No state income tax", propTaxPct: 0.87, salesTax: 9.29 },
  { slug: "west-virginia", abbr: "WV", name: "West Virginia", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 2.36-6.5%", propTaxPct: 0.54, salesTax: 6.49 },
  { slug: "wisconsin", abbr: "WI", name: "Wisconsin", incomeTax: "progressive", incomeTaxNote: "Progressive state income tax, 3.54-7.65%", propTaxPct: 1.64, salesTax: 5.43 },
  { slug: "wyoming", abbr: "WY", name: "Wyoming", incomeTax: "none", incomeTaxNote: "No state income tax", propTaxPct: 0.57, salesTax: 5.34 },
];

export const STATE_AWARE_TOOLS = [
  "salary-after-tax-calculator",
  "paycheck-calculator",
  "tax-calculator",
  "mortgage-calculator",
  "home-affordability-calculator",
  "sales-tax-calculator",
  "property-tax-calculator",
];

export function getState(slug: string): StateData | undefined {
  return STATES.find((s) => s.slug === slug);
}

/** Top-10 most populous states — drive state-vs-state comparison pages (45 pairs). */
export const POPULAR_STATES = [
  "california",
  "texas",
  "florida",
  "new-york",
  "pennsylvania",
  "illinois",
  "ohio",
  "georgia",
  "north-carolina",
  "michigan",
];

/** Parse a "stateA-vs-stateB" slug into two validated states, or null. */
export function getComparisonPair(pairSlug: string): [StateData, StateData] | null {
  const m = pairSlug.match(/^([a-z-]+)-vs-([a-z-]+)$/);
  if (!m) return null;
  const a = getState(m[1]);
  const b = getState(m[2]);
  if (!a || !b || a.abbr === b.abbr) return null;
  return [a, b];
}

/** Unordered pairs of POPULAR_STATES (a-b, not b-a) for sitemap generation. */
export function getComparisonPairs(): [StateData, StateData][] {
  const out: [StateData, StateData][] = [];
  for (let i = 0; i < POPULAR_STATES.length; i++) {
    for (let j = i + 1; j < POPULAR_STATES.length; j++) {
      const a = getState(POPULAR_STATES[i]);
      const b = getState(POPULAR_STATES[j]);
      if (a && b) out.push([a, b]);
    }
  }
  return out;
}

export function getStateByAbbr(abbr: string): StateData | undefined {
  return STATES.find((s) => s.abbr === abbr.toUpperCase());
}
