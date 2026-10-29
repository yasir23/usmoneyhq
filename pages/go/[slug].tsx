import type { GetServerSideProps } from "next";
import { AFFILIATE_OFFERS } from "../../lib/affiliates";

/**
 * /go/[slug] — the single outbound endpoint for affiliate clicks.
 *
 * WHY THIS EXISTS
 * ---------------
 * Linking a tracked URL directly from a page leaks the affiliate host into the
 * HTML and makes the destination change a code edit in several components. One
 * resident makes it: a slug, a 302, and one log line.
 *
 * SUBID TAXONOMY
 * --------------
 * Every affiliate network splits attribution differently, but all of them expose a
 * subId parameter. This route sets one consistent scheme so that a commission can
 * be traced back to the exact page and slot that produced it:
 *
 *   subId1 = page slug        the page that generated the click (e.g. take-home-pay)
 *   subId2 = placement        where on the page (atf_table, inline_cta, exit_quiz)
 *   subId3 = click id         a unique per-click token, so a server-to-server
 *                             postback from the network can be matched to this click
 *
 * Callers pass ?src=<slug>&pos=<placement>. Values are sanitised to
 * [a-zA-Z0-9_-] so a crafted URL cannot inject extra parameters into the
 * destination. A destination that already carries a subId is rewritten, never
 * appended to — a duplicated subId1 silently loses attribution and looks like the
 * network is shaving.
 *
 * WHAT IT REFUSES
 * ---------------
 * Dormant offers (live: false) 404. A roadmap slot must never be clickable.
 */
const MAX = 40;
const CLICK_ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function clean(value: unknown): string {
  return String(value ?? "")
    .replace(/[^a-zA-Z0-9\-_]/g, "")
    .slice(0, MAX);
}

function clickId(): string {
  let out = "";
  const now = Date.now();
  for (let i = 0; i < 5; i += 1) {
    out += CLICK_ID_ALPHABET[Math.floor(Math.random() * CLICK_ID_ALPHABET.length)];
  }
  return `${now.toString(36)}${out}`;
}

function withSub(destination: string, key: string, value: string): string {
  const pattern = new RegExp(`([?&])${key}=[^&]*`);
  if (pattern.test(destination)) {
    return destination.replace(pattern, `$1${key}=${encodeURIComponent(value)}`);
  }
  const sep = destination.includes("?") ? "&" : "?";
  return `${destination}${sep}${key}=${encodeURIComponent(value)}`;
}

export const getServerSideProps: GetServerSideProps = async ({ params, query, res }) => {
  const slug = String(params?.slug ?? "").toLowerCase();
  const offer = AFFILIATE_OFFERS.find((o) => o.id === slug);

  if (!offer || !offer.live || !/^https:\/\/[^\s]+$/.test(offer.href)) {
    res.statusCode = 404;
    res.end("Not found");
    return { props: {} };
  }

  const page = clean(query.src) || "unknown";
  const placement = clean(query.pos) || "default";
  const click = clickId();

  let destination = offer.href;
  destination = withSub(destination, "subId1", `umhq-${page}`);
  destination = withSub(destination, "subId2", placement);
  destination = withSub(destination, "subId3", click);

  // One JSON line per click. Captured by the container log so the click can later
  // be joined to a network postback by subId3. No cookie, no PII.
  console.log(JSON.stringify({
    evt: "affiliate_click",
    slug,
    program: offer.program,
    page,
    placement,
    click_id: click,
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
