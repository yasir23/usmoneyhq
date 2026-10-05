#!/usr/bin/env python3
"""
crawl_layer_watch.py — watchdog for the SEO / AEO / GEO surface of every domain.

WHY THIS EXISTS
hermesrevenue.com served 367,947 bytes of HTML for /robots.txt, /llms.txt AND
/sitemap.xml — all three were the SPA shell on a catch-all, returning HTTP 200
with content-type text/html. Nothing detected it. A crawler silently could not
read a single discovery file, and the only symptom was leads not appearing.

The failure is invisible precisely because it returns 200. A watchdog has to
check the CONTENT TYPE and the CONTENT, not the status code.

SILENT WHEN HEALTHY: prints nothing and exits 0 when every domain passes.
Any failure prints a report and exits 1. Designed for cron with no_agent=True,
where empty stdout means the operator is not disturbed.
"""
import json
import re
import sys
import urllib.error
import urllib.request

# Each domain declares what "healthy" means for it.
DOMAINS = {
    "https://sealofaudit.com": {
        "llms_min_chars": 400,
        "expect_sitemap_urls": ">=5",
    },
    "https://hermesrevenue.com": {
        "llms_min_chars": 400,
        "expect_sitemap_urls": ">=1",
    },
    "https://usmoneyhq.com": {
        "llms_min_chars": 400,
        "expect_sitemap_urls": ">=100",
    },
}

AI_CRAWLERS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]
UA = {"User-Agent": "Mozilla/5.0 (compatible; crawl-layer-watch/1.0)"}
TIMEOUT = 20


def fetch(url):
    """Return (status, content_type, body). Never raises."""
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return r.status, (r.headers.get("Content-Type") or ""), r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, "", ""
    except Exception as e:
        return 0, "", f"__ERROR__ {e}"


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """Refuse to follow redirects, so a 3xx is observable instead of transparent."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def fetch_no_redirect(url):
    """Return (status, location) WITHOUT following redirects. Never raises."""
    opener = urllib.request.build_opener(_NoRedirect)
    try:
        req = urllib.request.Request(url, headers=UA)
        with opener.open(req, timeout=TIMEOUT) as r:
            return r.status, (r.headers.get("Location") or "")
    except urllib.error.HTTPError as e:
        return e.code, (e.headers.get("Location") or "")
    except Exception as e:
        return 0, f"__ERROR__ {e}"


# A host alias serving 200 alongside the canonical host duplicates every page
# and splits crawl budget. Search Console's page export showed www carrying 164
# rows / 5,719 impressions against the apex's 388 / 19,429 — the same pages
# twice, at different positions. A canonical tag is a hint; a 301 is a
# directive, and only the 301 removes the duplicate from the report.
#
# Declared per domain, and only for domains that want consolidation, so a
# domain that deliberately serves its www alias is not flagged. Paths include
# "/" plus one deep page: a host rule that works on the root but not on nested
# routes is a real failure mode, and the root alone would not catch it.
WWW_MUST_301 = {
    "https://usmoneyhq.com": ["/", "/cd-calculator"],
}


def check_host_alias(base):
    """Returns a list of failure strings for the www alias of `base`."""
    fails = []
    host = base.split("//", 1)[-1].rstrip("/")

    for path in WWW_MUST_301.get(base, []):
        st, loc = fetch_no_redirect(f"https://www.{host}{path}")
        where = f"www.{host}{path}"

        if st == 200:
            fails.append(
                f"{where} returns 200 — the alias host serves the canonical page "
                f"(duplicate content; every page counts twice)"
            )
        elif st in (301, 308):
            if not loc.startswith(base):
                fails.append(f"{where} redirects to {loc or 'nowhere'}, not to {base}")
            elif "//www." in loc:
                fails.append(f"{where} redirects to another www host: {loc}")
        elif st in (302, 307):
            fails.append(
                f"{where} uses a temporary redirect ({st}) — host consolidation "
                f"needs a permanent 301/308 to pass authority"
            )
        else:
            fails.append(f"{where} returned HTTP {st} (expected 301 to {base})")

    return fails


def check_domain(base, want):
    """Returns a list of failure strings. Empty list == healthy."""
    fails = []

    # ── robots.txt ──────────────────────────────────────────────────────────
    st, ct, body = fetch(f"{base}/robots.txt")
    if st != 200:
        fails.append(f"robots.txt HTTP {st}")
    elif "text/html" in ct:
        # The exact signature of the original incident.
        fails.append(f"robots.txt served as HTML ({len(body)} bytes) — catch-all is shadowing it")
    else:
        if "Sitemap:" not in body:
            fails.append("robots.txt does not reference a Sitemap")
        missing = [c for c in AI_CRAWLERS if c not in body]
        if missing:
            fails.append(f"robots.txt does not allow: {', '.join(missing)}")

    # ── llms.txt (the GEO surface) ──────────────────────────────────────────
    st, ct, body = fetch(f"{base}/llms.txt")
    if st != 200:
        fails.append(f"llms.txt HTTP {st}")
    elif "text/html" in ct:
        fails.append(f"llms.txt served as HTML ({len(body)} bytes) — missing or shadowed")
    elif len(body) < want["llms_min_chars"]:
        fails.append(f"llms.txt only {len(body)} chars (want >= {want['llms_min_chars']})")
    elif not re.search(r"^#\s", body, re.M):
        fails.append("llms.txt has no markdown heading")

    # ── sitemap.xml ─────────────────────────────────────────────────────────
    st, ct, body = fetch(f"{base}/sitemap.xml")
    if st != 200:
        fails.append(f"sitemap.xml HTTP {st}")
    elif "text/html" in ct:
        fails.append(f"sitemap.xml served as HTML ({len(body)} bytes) — not parseable XML")
    else:
        locs = len(re.findall(r"<loc>", body))
        if locs == 0:
            fails.append("sitemap.xml contains no <loc> entries")
        elif want["expect_sitemap_urls"] == ">=100" and locs < 100:
            fails.append(f"sitemap.xml has only {locs} URLs (expected >= 100)")
        elif want["expect_sitemap_urls"] == ">=5" and locs < 5:
            fails.append(f"sitemap.xml has only {locs} URLs (expected >= 5)")

    # ── structured data on the homepage (the AEO surface) ───────────────────
    st, ct, body = fetch(base)
    if st == 200:
        blocks = len(re.findall(r"application/ld\+json", body))
        if blocks == 0:
            fails.append("homepage has NO JSON-LD (AEO/GEO surface missing)")
        elif "@type" not in body:
            fails.append("JSON-LD present but contains no @type")

    # ── host consolidation (www alias must not serve content) ───────────────
    fails.extend(check_host_alias(base))

    return fails


def main():
    problems = []
    for base, want in DOMAINS.items():
        try:
            fails = check_domain(base, want)
        except Exception as e:
            fails = [f"check crashed: {type(e).__name__}: {e}"]
        if fails:
            problems.append((base, fails))

    if not problems:
        return 0  # silent — nothing for the operator to read

    print("CRAWL LAYER FAILING — SEO/AEO/GEO surface degraded")
    print()
    for base, fails in problems:
        print(base)
        for f in fails:
            print(f"  - {f}")
        print()
    print("A crawl file returning 200 is NOT proof it is readable. Check the")
    print("content type: text/html on robots.txt means a catch-all is shadowing it.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
