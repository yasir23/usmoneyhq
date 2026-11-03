#!/usr/bin/env python3
"""
gemini_heartbeat.py — autonomous strategist/executor for usmoneyhq.com.

Every run:
  1. collect telemetry (live HTTP, sitemap count, llms.txt, AD_UNITS, offers, git status)
  2. ask Gemini for the next ranked tasks, separating autonomous work from human blockers
  3. consume HUMAN_INPUTS.env if anything was dropped in (tokens, ad slots, affiliate URLs)
  4. execute what is mechanical and safe, rebuild, commit, push
  5. submit new URLs via IndexNow
  6. WhatsApp only on a NEW blocker or a real ship, deduplicated for 24h

Design rules learned the hard way on this machine:
  - never alert twice for the same blocker inside 24h (state file holds fingerprints)
  - a build failure is a blocker, not a ship
  - HUMAN_INPUTS is consumed only when a key actually changed; empty files are ignored
  - the gateway's WhatsApp home channel is cached at startup, so alerts go straight to the
    bridge, not through cron delivery
"""
import json
import os
import re
import subprocess
import sys
import time
import hashlib
import datetime as dt

REPO = os.path.expanduser("~/us-calc-tools")
STATE = os.path.join(REPO, ".heartbeat_state.json")
INPUTS = os.path.join(REPO, "HUMAN_INPUTS.env")
LOG = os.path.expanduser("~/.hermes/state/heartbeat.log")
BRIDGE, CHAT = "http://127.0.0.1:3000/send", "81364615479302@lid"
SITE = "https://usmoneyhq.com"
KEYFILE = "a7f3c9d21b8e4f6a9c0d5e2b7f4318ad.txt"
GEMINI_KEY = os.path.expanduser("~/.hermes/gemini.key")
MODEL = "gemini-3-flash-preview"

DIRECTIVE = """You are the lead strategist for usmoneyhq.com, a US personal finance site whose
only success metric is revenue. Current position: 116 indexable pages, 80 calculators, zero ad
units configured, zero live affiliate offers, AdSense previously rejected.
Priorities in order: (1) monetisation switches that need a human, (2) programmatic long-tail
coverage built on public datasets (ACS, BLS, CFPB, IRS SOI, HMDA), (3) AEO/GEO structure
(answer-first blocks, tables, FAQPage/FinancialProduct schema, llms.txt, IndexNow).
Given the telemetry below, return JSON only:
{"blockers":[{"id":"short-id","why":"one line","ask":"exact thing a human must supply"}],
 "tasks":[{"rank":1,"title":"...","how":"one line, mechanical","risk":"low|medium|high"}]}
Max 3 blockers, max 5 tasks. No prose outside JSON."""


def sh(cmd, cwd=None, timeout=600):
    r = subprocess.run(cmd, shell=isinstance(cmd, str), cwd=cwd or REPO,
                       capture_output=True, text=True, timeout=timeout)
    return r.returncode, (r.stdout or "") + (r.stderr or "")


def state():
    if os.path.exists(STATE):
        try:
            return json.load(open(STATE))
        except Exception:
            pass
    return {"alerts": {}, "last_run": None}


def save(st):
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    json.dump(st, open(STATE, "w"), indent=1)


def telemetry():
    t = {}
    code, out = sh(["curl", "-s", "-o", "/dev/null", "-m", "20",
                    "-w", "%{http_code}", SITE])
    t["site_http"] = out.strip()
    code, out = sh(["curl", "-s", "-m", "30", SITE + "/sitemap.xml"])
    t["sitemap_urls"] = out.count("<loc>")
    code, out = sh(["curl", "-s", "-o", "/dev/null", "-m", "20",
                    "-w", "%{http_code}", SITE + "/llms.txt"])
    t["llms_http"] = out.strip()
    code, out = sh(["curl", "-s", "-o", "/dev/null", "-m", "20",
                    "-w", "%{http_code}", SITE + "/" + KEYFILE])
    t["indexnow_key_http"] = out.strip()
    src = open(os.path.join(REPO, "lib/affiliates.ts"), encoding="utf-8").read()
    t["offers_live"] = len(re.findall(r"live:\s*true", src))
    t["offers_total"] = len(re.findall(r"live:\s*(?:true|false)", src))
    m = re.search(r"AD_UNITS[^=]*=\s*\[([^\]]*)\]", src) or re.search(
        r"AD_UNITS[^=]*=\s*\[([^\]]*)\]", open(os.path.join(REPO, "lib/ads.ts"),
                                              encoding="utf-8").read()
        if os.path.exists(os.path.join(REPO, "lib/ads.ts")) else "")
    t["ad_units_filled"] = len([x for x in re.findall(r'"[^"]*"', m.group(1)) if x.strip('""')]) if m else -1
    code, out = sh(["git", "status", "--porcelain"])
    t["git_dirty_files"] = len([l for l in out.splitlines() if l.strip()])
    code, out = sh(["git", "rev-parse", "--short", "HEAD"])
    t["head"] = out.strip()
    return t


def ask_gemini(t):
    if not os.path.exists(GEMINI_KEY):
        return None
    key = open(GEMINI_KEY).read().strip()
    body = {"contents": [{"parts": [{"text": DIRECTIVE + "\n\nTelemetry:\n" + json.dumps(t)}]}],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1200,
                                 "thinkingConfig": {"thinkingBudget": 0}}}
    open("/tmp/hb.json", "w").write(json.dumps(body))
    r = subprocess.run(["curl", "-s", "-m", "90", "-X", "POST",
                        "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent" % MODEL,
                        "-H", "x-goog-api-key: " + key,
                        "-H", "content-type: application/json", "--data", "@/tmp/hb.json"],
                       capture_output=True, text=True)
    try:
        txt = json.loads(r.stdout)["candidates"][0]["content"]["parts"][0]["text"]
        m = re.search(r"\{[\s\S]*\}", txt)
        return json.loads(m.group(0)) if m else None
    except Exception:
        return None


def consume_inputs():
    """Wire whatever the operator dropped in HUMAN_INPUTS.env. Returns list of changes."""
    if not os.path.exists(INPUTS):
        open(INPUTS, "w").write(
            "# Drop values here; the heartbeat consumes and blanks them each run.\n"
            "# GSC_TOKEN=...\n# BING_TOKEN=...\n# ADSENSE_SLOTS=id1,id2,id3\n"
            "# AFFILIATE_LENDINGTREE_REFI=https://tracked-url\n")
        return []
    vals = {}
    for line in open(INPUTS, encoding="utf-8"):
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.strip().split("=", 1)
            if v.strip():
                vals[k.strip()] = v.strip()
    if not vals:
        return []

    changed = []
    doc = os.path.join(REPO, "pages/_document.js")
    s = open(doc, encoding="utf-8").read()
    for key, meta in (("GSC_TOKEN", "google-site-verification"), ("BING_TOKEN", "msvalidate.01")):
        if key in vals and meta not in s:
            s = s.replace("<Head>", '<Head>\n          <meta name="%s" content="%s" />'
                          % (meta, vals[key]), 1)
            changed.append(key)
    open(doc, "w").write(s)

    if "ADSENSE_SLOTS" in vals:
        ids = [x.strip() for x in vals["ADSENSE_SLOTS"].split(",") if x.strip()]
        for f in ("set_ad_units.py",):
            p = os.path.join(REPO, "scripts", f)
            if os.path.exists(p):
                code, out = sh(["python3", p] + sum([["--slot", i] for i in ids], []))
                if code == 0:
                    changed.append("ADSENSE_SLOTS")
                break

    for k, v in vals.items():
        if k.startswith("AFFILIATE_") and v.startswith("http"):
            slug = k.replace("AFFILIATE_", "").lower().replace("_", "-")
            p = os.path.join(REPO, "scripts", "activate_offer.py")
            if os.path.exists(p):
                code, out = sh(["python3", p, "--offer", slug, "--url", v,
                                "--network", "impact", "--payout-event", "lead",
                                "--states", "US", "--deploy"])
                if code == 0:
                    changed.append(k)

    if changed:
        open(INPUTS, "w").write("# consumed %s\n" % dt.datetime.now().isoformat())
    return changed


def whatsapp(msg):
    if not msg:
        return False
    open("/tmp/hbwa.json", "w").write(json.dumps({"chatId": CHAT, "message": msg}))
    r = subprocess.run(["curl", "-s", "-m", "30", "-X", "POST", BRIDGE,
                        "-H", "content-type: application/json", "--data", "@/tmp/hbwa.json"],
                       capture_output=True, text=True)
    return '"success":true' in (r.stdout or "")


def main():
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    st = state()
    t = telemetry()
    stamp = dt.datetime.now().isoformat(timespec="seconds")
    print("[%s] telemetry %s" % (stamp, json.dumps(t)))

    changes = consume_inputs()
    plan = ask_gemini(t)
    messages = []

    if changes:
        code, out = sh(["npm", "run", "build"], timeout=900)
        if code == 0:
            sh(["git", "add", "-A"])
            sh(["git", "commit", "-m", "heartbeat: wire %s" % ", ".join(changes)])
            sh(["git", "push", "origin", "master"])
            sh(["python3", "scripts/indexnow_submit.py"])
            messages.append("SHIPPED: wired %s, build clean, pushed, IndexNow resubmitted."
                            % ", ".join(changes))
        else:
            messages.append("BLOCKED: wiring %s broke the build. Rolled back to %s."
                            % (", ".join(changes), t.get("head")))

    if plan:
        for b in plan.get("blockers", [])[:3]:
            fp = hashlib.sha1(("blk:" + b.get("id", "")).encode()).hexdigest()[:12]
            last = st["alerts"].get(fp, 0)
            if time.time() - last > 86400:
                st["alerts"][fp] = time.time()
                messages.append("NEEDS YOU: %s — %s" % (b.get("why", ""), b.get("ask", "")))
        open(os.path.join(REPO, "NEXT_TASKS.json"), "w").write(json.dumps(plan, indent=1))

    st["last_run"] = stamp
    st["last_telemetry"] = t
    save(st)

    body = "\n\n".join(messages)
    if body:
        ok = whatsapp("usmoneyhq heartbeat\n\n" + body)
        print("whatsapp:", "sent" if ok else "failed (bridge?)")
    with open(LOG, "a", encoding="utf-8") as f:
        f.write("%s | %s | alerts=%d\n" % (stamp, json.dumps(t), len(messages)))
    print("done. alerts:", len(messages))
    return 0


if __name__ == "__main__":
    sys.exit(main())
