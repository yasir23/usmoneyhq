#!/usr/bin/env python3
"""Derive public/llms.txt's advertised inventory from the registry.

WHY THIS EXISTS
llms.txt told every AI agent that reads it: "105 calculators. 140 indexable
pages". The sitemap served 113, and 25 of those tools are deliberately out of
scope for search engines (lib/topical.ts). The daily site-integrity heartbeat
flagged that drift on 2026-10-17, -18, -19 and -20 — a number in a discovery
file is a claim, and an agent will repeat it.

The file also advertised only 18 of the 80 in-scope calculators, so an answer
engine asking "does usmoneyhq have a HELOC calculator" could not find out from
the one document built for it.

So this script derives, never retypes:
  - the in-scope tool list   = lib/tools.ts  minus lib/topical.ts
  - the indexable page count = <loc> count of the built sitemap

It owns everything from the top of the file through the calculator list, and
preserves whatever prose follows the `## State math` anchor. The first version
replaced only the `>` lines and appended its own comment block after the blank
line, so every run added another copy — hence the single-span replacement here.

    python3 scripts/sync_llms_txt.py            # rewrite public/llms.txt
    python3 scripts/sync_llms_txt.py --check    # exit 1 if it would change

Then scripts/verify_llms_txt.py asserts the result against the sitemap, and
`npm run build` runs that verifier, so the claim cannot drift silently again.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS_TS = ROOT / "lib" / "tools.ts"
TOPICAL_TS = ROOT / "lib" / "topical.ts"
LLMS = ROOT / "public" / "llms.txt"
BUILT_SITEMAP = ROOT / ".next" / "server" / "app" / "sitemap.xml.body"

SITE = "https://usmoneyhq.com"
ANCHOR = "## State math"  # first section after the calculator list; preserved


def parse_registry(text: str) -> list[tuple[str, str]]:
    """[(slug, display name)] in registry order.

    Each entry starts with `slug: "..."`. The display name is shortTitle when
    present, else the SEO title with the brand suffix and year removed.
    """
    entries: list[tuple[str, str]] = []
    blocks = re.split(r'\n\s{2,4}slug:\s*"', text)[1:]
    for block in blocks:
        slug = block.split('"', 1)[0]
        if not re.fullmatch(r"[a-z0-9\-]+", slug):
            raise SystemExit(f"sync_llms_txt: unparseable slug {slug!r} — refusing to guess")
        short = re.search(r'shortTitle:\s*"([^"]*)"', block)
        title = re.search(r'\n\s{2,6}title:\s*"([^"]*)"', block)
        name = short.group(1) if short else ""
        if not name and title:
            name = re.sub(r"\s*\|\s*US Money HQ\s*$", "", title.group(1))
            name = re.sub(r"\s+20\d\d\b", "", name)
            name = name.split(" — ")[0].strip()
        if not name:
            raise SystemExit(f"sync_llms_txt: no usable title for {slug!r}")
        entries.append((slug, name))
    if not entries:
        raise SystemExit("sync_llms_txt: parsed 0 tools from lib/tools.ts")
    return entries


def parse_out_of_scope(text: str) -> set[str]:
    body = text.split("OUT_OF_SCOPE_SLUGS", 1)
    if len(body) < 2:
        raise SystemExit("sync_llms_txt: OUT_OF_SCOPE_SLUGS not found in lib/topical.ts")
    chunk = body[1].split("];", 1)[0]
    return set(re.findall(r'"([a-z0-9\-]+)"', chunk))


def sitemap_page_list() -> list[str]:
    if not BUILT_SITEMAP.exists():
        raise SystemExit(
            "sync_llms_txt: no built sitemap at .next/server/app/sitemap.xml.body.\n"
            "Run `npm run build` first — the advertised count must come from the\n"
            "page list search engines actually receive, not from a hand-count."
        )
    body = BUILT_SITEMAP.read_text(encoding="utf-8", errors="ignore")
    urls = re.findall(r"<loc>([^<]+)</loc>", body)
    if not urls:
        raise SystemExit("sync_llms_txt: built sitemap has 0 <loc> entries")
    return urls


def composition(urls: list[str], in_scope_slugs: set[str]) -> dict[str, int]:
    """Split the sitemap by shape so the prose counts are derived too.

    Hardcoding '18 guides + 4 hubs + 11 static' in the prose would rebuild the
    exact defect this script exists to kill — a remembered number. Classify by
    path shape; the parts are asserted to sum to the total.
    """
    counts = {"tools": 0, "guides": 0, "hubs": 0, "static": 0}
    for u in urls:
        path = u.replace(SITE, "").strip("/")
        if not path:
            counts["static"] += 1
        elif "/" not in path and path in in_scope_slugs:
            counts["tools"] += 1
        elif path.startswith("guides/"):
            counts["guides"] += 1
        elif path.startswith("calculators/"):
            counts["hubs"] += 1
        else:
            counts["static"] += 1
    return counts


def build_preamble(
    entries: list[tuple[str, str]],
    in_scope: list[tuple[str, str]],
    pages: int,
    split: dict[str, int],
) -> str:
    total, kept = len(entries), len(in_scope)
    if sum(split.values()) != pages:
        raise SystemExit(
            f"sync_llms_txt: composition {split} sums to {sum(split.values())} != {pages} pages"
        )
    out = [
        "# llms.txt — agent discovery file (WebMCP/llms.txt standard).",
        "# Lets AI agents (Claude, ChatGPT, browsing agents) discover and use",
        f"# US Money HQ's {total} calculators natively.",
        "# More: https://llmstxt.org",
        "# US Money HQ",
        "> US Money HQ — free US financial calculators, state-by-state tax math, and",
        f"> scenario tools. {kept} calculators offered for indexing, {pages} indexable",
        f"> pages total — {SITE}/sitemap.xml is the authoritative list. All free, no signup.",
        "",
        "# ── COUNT DISCIPLINE ────────────────────────────────────────────────────────",
        "# Every count above is DERIVED, never remembered. scripts/sync_llms_txt.py",
        "# regenerates this block from lib/tools.ts minus lib/topical.ts, plus the",
        "# <loc> count of the built sitemap; scripts/verify_llms_txt.py re-asserts it",
        "# in `npm run build`, so a stale number fails the build instead of shipping.",
        "# The count sat at \"140 indexable pages\" for four days after the inventory",
        "# was pruned to 113 — an advertised number an agent will repeat is worse",
        "# than no number at all.",
        "#",
        f"# Composition: {split['tools']} in-scope calculator roots + {split['guides']} guides",
        f"# + {split['hubs']} category hubs + {split['static']} site/trust pages = {pages}.",
        f"# The other {total - kept} tools are live but out of topical scope (see lib/topical.ts):",
        "# a money site that also ranks for \"how much topsoil do I need\" is what an",
        "# ad reviewer reads as a programmatic aggregator.",
        "",
        "## Calculators",
        "",
    ]
    for slug, name in sorted(in_scope, key=lambda s: s[1].lower()):
        out.append(f"- {name}: {SITE}/{slug}")
    out.append("")
    # The anchor heading itself comes from `tail`, which starts at it. Emitting it
    # here too duplicated the heading on every run (caught by diffing two runs).
    return "\n".join(out)


def main() -> int:
    check_only = "--check" in sys.argv
    entries = parse_registry(TOOLS_TS.read_text(encoding="utf-8"))
    out_of_scope = parse_out_of_scope(TOPICAL_TS.read_text(encoding="utf-8"))

    known = {s for s, _ in entries}
    unknown = sorted(out_of_scope - known)
    if unknown:
        raise SystemExit(f"sync_llms_txt: out-of-scope slugs not in registry: {unknown}")

    in_scope = [(s, n) for s, n in entries if s not in out_of_scope]
    urls = sitemap_page_list()
    pages = len(urls)
    split = composition(urls, {s for s, _ in in_scope})

    current = LLMS.read_text(encoding="utf-8")
    idx = current.find(f"\n{ANCHOR}\n")
    if idx == -1:
        raise SystemExit(
            f"sync_llms_txt: anchor {ANCHOR!r} not found — the section after the "
            "calculator list was renamed. Update ANCHOR rather than guessing."
        )
    tail = current[idx + 1 :]  # keep from the anchor onward, verbatim
    rebuilt = build_preamble(entries, in_scope, pages, split) + tail

    if rebuilt == current:
        print(f"llms.txt already current: {len(in_scope)} calculators, {pages} indexable pages")
        return 0
    if check_only:
        print(f"DRIFT: llms.txt would change to {len(in_scope)} calculators / {pages} pages")
        return 1

    LLMS.write_text(rebuilt, encoding="utf-8")
    print(f"llms.txt rewritten: {len(in_scope)} in-scope calculators listed, {pages} indexable pages asserted")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
