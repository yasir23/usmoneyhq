#!/usr/bin/env python3
"""
yt_upload.py — upload the US Money HQ Shorts to YouTube.

USAGE
    /opt/anaconda3/bin/python3 scripts/yt_upload.py --check
        Verify dependencies and credentials. Uploads nothing. Run this first.

    /opt/anaconda3/bin/python3 scripts/yt_upload.py --dry-run
        Print the exact metadata that WOULD be sent, for every short. Uploads nothing.

    /opt/anaconda3/bin/python3 scripts/yt_upload.py --limit 5
        Upload up to 5. Default limit is 5 because of the quota below.

WHY THE DEFAULT LIMIT IS 5 — QUOTA, NOT POLITENESS
The YouTube Data API gives a project 10,000 quota units per day by default.
A single video upload costs 1,600 units. So the ceiling is 6 uploads/day no matter
how many files exist, and 6 leaves nothing for retries. 5 is the safe number.
There are 30 shorts; at 5/day that is six days. Raising the quota requires a
form to Google — it is not a code problem and no amount of parallelism fixes it.

CREDENTIALS
This script cannot create them. They require browser consent under your Google
account. See the --check output for the exact steps. Place them at:

    ~/.hermes/credentials/youtube_client_secret.json   (from Google Cloud Console)
    ~/.hermes/credentials/youtube_token.json           (created by first consent)

The OAuth scope is youtube.upload only — this script cannot read, edit or delete
anything else on the channel, and it never touches the AdSense account.

A CAVEAT THAT WILL BITE: while the OAuth app sits in Google's "Testing" publishing
status, refresh tokens EXPIRE AFTER 7 DAYS. Uploads will work, then mysteriously
start failing a week later. Fix by publishing the app (Publishing status ->
In production). Otherwise expect to re-consent weekly.
"""
import argparse
import json
import os
import sys

SHORTS_DIR = os.path.expanduser("~/usmoneyhq-shorts")
CRED_DIR = os.path.expanduser("~/.hermes/credentials")
CLIENT_SECRET = os.path.join(CRED_DIR, "youtube_client_secret.json")
TOKEN_PATH = os.path.join(CRED_DIR, "youtube_token.json")
SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
SITE = "https://usmoneyhq.com"

# id -> the calculator page this short should send viewers to.
# Where the mapping is genuinely known the short links to the exact tool; otherwise
# it links to the calculators hub. A wrong deep link is worse than a correct hub link.
TARGET = {
    "mortgage-300k": f"{SITE}/mortgage-calculator",
    "mortgage-400k": f"{SITE}/mortgage-calculator",
    "mortgage-450k": f"{SITE}/mortgage-calculator",
    "salary-75k": f"{SITE}/salary-after-tax-calculator",
    "salary-100k-texas": f"{SITE}/salary-after-tax-calculator",
    "house-100k": f"{SITE}/home-affordability-calculator",
    "house-150k": f"{SITE}/home-affordability-calculator",
    "affordability-120k": f"{SITE}/home-affordability-calculator",
    "401k-match": f"{SITE}/401k-calculator",
    "retirement": f"{SITE}/retirement-calculator",
    "debt-snowball": f"{SITE}/debt-snowball-calculator",
    "compound": f"{SITE}/rule-of-72-calculator",
    "compound-10k-200": f"{SITE}/compound-interest-calculator",
    "sales-tax": f"{SITE}/sales-tax-calculator",
    "emergency-fund": f"{SITE}/emergency-fund-calculator",
    "rent-vs-buy": f"{SITE}/rent-vs-buy-calculator",
    "closing-costs": f"{SITE}/closing-costs-calculator",
    "car-affordability": f"{SITE}/car-affordability-calculator",
    "heloc": f"{SITE}/heloc-calculator",
    "overtime": f"{SITE}/overtime-calculator",
    "529": f"{SITE}/529-calculator",
    "paycheck-75k-texas": f"{SITE}/paycheck-calculator",
    "hourly-75k": f"{SITE}/salary-to-hourly-calculator",
    "va-loan-400k": f"{SITE}/va-mortgage-calculator",
    "auto-loan-35k": f"{SITE}/auto-loan-calculator",
    "credit-card-minimum": f"{SITE}/credit-card-payoff-calculator",
    "child-support": f"{SITE}/child-support-calculator",
    "bmi": f"{SITE}/bmi-calculator",
    "water": f"{SITE}/water-intake-calculator",
    "sleep": f"{SITE}/sleep-calculator",
}

TAG_POOL = [
    "personal finance", "money", "financial literacy", "finance shorts",
    "money tips", "calculator", "budgeting", "usa finance",
]


def read_titles():
    """Read titles.txt written by gen_shorts.py: 'title | tags | /path/to.mp4'."""
    path = os.path.join(SHORTS_DIR, "titles.txt")
    if not os.path.exists(path):
        sys.exit(f"title list missing: {path} — run scripts/gen_shorts.py first")
    rows = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            parts = [p.strip() for p in line.split("|")]
            if len(parts) < 3:
                continue
            title, _tags, filepath = parts[0], parts[1], parts[2]
            if not os.path.exists(filepath):
                continue  # a topic whose mp4 was never produced
            rows.append({"title": title, "path": filepath,
                         "id": os.path.basename(filepath)[:-4]})
    return rows


def build_description(row):
    """
    Every description carries the site link, because a Short with no destination
    earns attention and nothing else. It also carries the estimate disclaimer:
    these videos state specific dollar figures, and a figure presented without
    'this is an estimate, your numbers differ' is the kind of claim that gets a
    finance channel reported.
    """
    url = TARGET.get(row["id"], f"{SITE}/calculators/money-loans")
    return (
        f"{row['title']}\n\n"
        f"Run the numbers for your own situation (free, no sign-up):\n{url}\n\n"
        f"US Money HQ is a free calculator library — mortgages, take-home pay, "
        f"debt payoff, retirement and more. Every figure shown is an estimate for "
        f"illustration; your rate, state and circumstances will differ, and nothing "
        f"here is financial advice.\n\n"
        f"#shorts #finance #money #personalfinance"
    )


def build_body(row):
    """The exact request body sent to the API. Kept separate so --dry-run is honest."""
    return {
        "snippet": {
            "title": row["title"][:100],  # API hard-caps titles at 100 chars
            "description": build_description(row),
            "tags": TAG_POOL + ["shorts", "finance", "money"],
            "categoryId": "27",  # Education — the honest category for these
        },
        "status": {
            "privacyStatus": "public",
            "selfDeclaredMadeForKids": False,
            # These are narrated, captioned, editorially-produced explainers with
            # no synthetic voice or AI visuals, so no altered-content disclosure is
            # required. If that ever changes, set this True rather than leaving it
            # False — an undisclosed synthetic voice is a policy violation.
            "containsSyntheticMedia": False,
        },
    }


def check():
    ok = True
    print("1. DEPENDENCIES")
    try:
        import googleapiclient  # noqa: F401
        import google_auth_oauthlib  # noqa: F401
        print("   google-api-python-client / google-auth-oauthlib: OK")
    except Exception as exc:
        ok = False
        print(f"   MISSING: {exc}")
        print("   fix: /opt/anaconda3/bin/python3 -m pip install "
              "google-api-python-client google-auth-oauthlib")

    print("\n2. SHORTS PRESENT")
    try:
        rows = read_titles()
        print(f"   {len(rows)} shorts with an existing mp4")
    except SystemExit as exc:
        ok = False
        rows = []
        print(f"   {exc}")

    print("\n3. CREDENTIALS")
    print(f"   client secret: {CLIENT_SECRET}")
    print(f"   {'FOUND' if os.path.exists(CLIENT_SECRET) else 'MISSING'}")
    print(f"   token:         {TOKEN_PATH}")
    print(f"   {'FOUND' if os.path.exists(TOKEN_PATH) else 'MISSING'}")
    if not (os.path.exists(CLIENT_SECRET) and os.path.exists(TOKEN_PATH)):
        ok = False
        print("""
   TO FIX — this needs your Google account, it cannot be automated from here:
     a. console.cloud.google.com -> create a project (or reuse one)
     b. APIs & Services -> Library -> enable "YouTube Data API v3"
     c. APIs & Services -> OAuth consent screen -> External
        -> add yourself as a Test user
        -> AFTER it works, set Publishing status to "In production"
           (in Testing, refresh tokens die every 7 days)
     d. Credentials -> Create credentials -> OAuth client ID
        -> Application type: Desktop app -> download the JSON
     e. mkdir -p ~/.hermes/credentials
        mv ~/Downloads/client_secret_*.json ~/.hermes/credentials/youtube_client_secret.json
     f. re-run: --auth   (opens a browser once to create the token)""")

    print("\n4. QUOTA")
    print("   default allowance 10,000 units/day; one upload = 1,600 units")
    print(f"   ceiling ~6 uploads/day -> {len(rows)} shorts = "
          f"{-(-len(rows)//5)} days at the default --limit of 5")
    return ok, rows


def do_auth():
    from google_auth_oauthlib.flow import InstalledAppFlow
    if not os.path.exists(CLIENT_SECRET):
        sys.exit(f"missing {CLIENT_SECRET} — complete step (e) in --check first")
    os.makedirs(CRED_DIR, exist_ok=True)
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET, SCOPES)
    creds = flow.run_local_server(port=0)
    with open(TOKEN_PATH, "w", encoding="utf-8") as fh:
        fh.write(creds.to_json())
    print(f"token written: {TOKEN_PATH}")
    print("Now run: --limit 1   to confirm one real upload works before batching.")


def load_creds():
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    if not os.path.exists(TOKEN_PATH):
        sys.exit("no token — run --auth once (see --check)")
    creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open(TOKEN_PATH, "w", encoding="utf-8") as fh:
            fh.write(creds.to_json())
    return creds


def upload(rows, limit, dry):
    if dry:
        for i, row in enumerate(rows[:limit], 1):
            body = build_body(row)
            print(f"\n{'='*70}\n[{i}/{limit}] {row['id']}\n  file : {row['path']}")
            print(f"  title: {body['snippet']['title']}")
            print(f"  tags : {', '.join(body['snippet']['tags'][:8])}...")
            print(f"  cat  : {body['snippet']['categoryId']} (Education)")
            print(f"  priv : {body['status']['privacyStatus']}")
            print("  --- description ---")
            for ln in body["snippet"]["description"].splitlines():
                print(f"  {ln}")
        print(f"\nDRY RUN — nothing uploaded. {len(rows)} shorts available.")
        return

    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

    youtube = build("youtube", "v3", credentials=load_creds())
    done = 0
    for row in rows[:limit]:
        body = build_body(row)
        print(f"\nUploading {row['id']} …", flush=True)
        media = MediaFileUpload(row["path"], mimetype="video/mp4", resumable=True)
        request = youtube.videos().insert(
            part="snippet,status", body=body, media_body=media
        )
        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                print(f"   {int(status.progress()*100)}%", flush=True)
        vid = response["id"]
        print(f"   OK  https://youtu.be/{vid}")
        done += 1
    print(f"\nuploaded {done}. A 403 quotaExceeded means wait until midnight PT.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="verify setup only")
    ap.add_argument("--auth", action="store_true", help="one-time browser consent")
    ap.add_argument("--dry-run", action="store_true", help="print metadata, upload nothing")
    ap.add_argument("--limit", type=int, default=5, help="max uploads this run (default 5)")
    args = ap.parse_args()

    if args.auth:
        do_auth()
        return
    if args.check:
        ok, _ = check()
        sys.exit(0 if ok else 1)
    if args.dry_run:
        _, rows = check()
        upload(rows, args.limit, dry=True)
        return

    ok, rows = check()
    if not ok:
        sys.exit("setup incomplete — see the TO FIX block above")
    upload(rows, args.limit, dry=False)


if __name__ == "__main__":
    main()
