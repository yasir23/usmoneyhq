import type { GetServerSideProps } from "next";
import { AFFILIATE_OFFERS } from "../../lib/affiliates";

/**
 * /go/[slug] — the single outbound endpoint for affiliate clicks.
 *
 * WHY THIS EXISTS
 * ---------------
 * Linking a tracked URL directly from a page leaks the affiliate host into the
 * HTML and makes the destination change a code edit in several components. One
 * resident makes it: a slug, a 302, and one log line. Swapping a network later is
 * a change to one registry entry, not a sweep through the UI.
 *
 * WHAT IT REFUSES
 * ---------------
 * Dormant offers (live: false) 404. A roadmap slot must never be clickable — that
 * would send a reader to a dead or untracked destination, which is both a broken
 * experience and, on a site that already carries an AdSense rejection, one more
 * reason to be judged low quality.
 *
 * COMMISSION ATTRIBUTION
 * ---------------------
 * `src` in the query string is appended as subId1 so a click can be attributed to
 * the page that produced it. It is stripped of anything that is not
 * alphanumeric/dash so a crafted URL cannot inject parameters into the
 * destination.
 */
export const getServerSideProps: GetServerSideProps = async ({ params, query, res }) => {
  const slug = String(params?.slug ?? "").toLowerCase();

  const offer = AFFILIATE_OFFERS.find((o) => o.id === slug);

  if (!offer || !offer.live || !/^https:\/\/[^\s]+$/.test(offer.href)) {
    res.statusCode = 404;
    res.end("Not found");
    return { props: {} };
  }

  let destination = offer.href;
  const src = String(query.src ?? "").replace(/[^a-zA-Z0-9\-_]/g, "").slice(0, 40);
  if (src) {
    const tag = `usmoneyhq-${src}`;
    // The tracked links in the registry already carry subId1=<channel>. Appending
    // a second subId1 produces a duplicated parameter and loses the click
    // attribution, so replace the existing value instead of adding one.
    if (/[?&]subId1=/.test(destination)) {
      destination = destination.replace(/[?&]subId1=[^&]*/, (m) =>
        `${m.charAt(0)}subId1=${encodeURIComponent(tag)}`
      );
    } else {
      const sep = destination.includes("?") ? "&" : "?";
      destination = `${destination}${sep}subId1=${encodeURIComponent(tag)}`;
    }
  }

  // One JSON line per click. Captured by the container log; no database, no PII.
  console.log(JSON.stringify({
    evt: "affiliate_click",
    slug,
    program: offer.program,
    src: src || null,
    ts: new Date().toISOString(),
  }));

  res.writeHead(302, {
    Location: destination,
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex",
  });
  res.end();

  return { props: {} };
};

/** Never rendered — the response is always a header-only redirect. */
export default function Go() {
  return null;
}
