#!/usr/bin/env python3
"""
Wire BREVO_API_KEY through the existing deploy path, touching no new YAML step.

Two failures already came from inserting a step at a heredoc boundary. This does the
edit inside the step that already holds the SSH connection, and forwards the variable
explicitly — GitHub Actions env vars live on the runner and ssh does not carry them.
"""
import re

W = ".github/workflows/deploy.yml"
s = open(W, encoding="utf-8").read()

if "BREVO_API_KEY" in s:
    print("workflow already carries BREVO_API_KEY")
else:
    # 1. env block of the "Deploy to VPS" step — match the existing indentation exactly
    s = s.replace(
        "          VPS_PASSWORD: ${{ secrets.VPS_PASSWORD }}\n        run: |\n"
        "          sudo apt-get update -qq >/dev/null 2>&1",
        "          VPS_PASSWORD: ${{ secrets.VPS_PASSWORD }}\n"
        "          BREVO_API_KEY: ${{ secrets.BREVO_API_KEY }}\n"
        "        run: |\n"
        "          sudo apt-get update -qq >/dev/null 2>&1",
        1,
    )
    # 2. forward it across the ssh boundary
    old = '"$VPS_USER@$VPS_HOST" "bash -s" < scripts/remote_deploy.sh'
    new = ('"$VPS_USER@$VPS_HOST" "export BREVO_API_KEY=\'$BREVO_API_KEY\'; bash -s" '
           "< scripts/remote_deploy.sh")
    if old not in s:
        raise SystemExit("ssh invocation not found — refusing to guess")
    s = s.replace(old, new, 1)
    open(W, "w", encoding="utf-8").write(s)
    print("workflow patched: env var added and forwarded over ssh")

try:
    import yaml
    yaml.safe_load(open(W, encoding="utf-8"))
    print("YAML OK")
except ImportError:
    print("(pyyaml absent)")
except Exception as exc:
    print("YAML BROKEN:", exc)
    raise SystemExit(1)

# 3. remote script writes .env before the container starts
R = "scripts/remote_deploy.sh"
r = open(R, encoding="utf-8").read()
if "vps_write_env" in r or "/opt/usmoneyhq/.env" in r:
    print("remote script already writes .env")
else:
    anchor = "  docker compose up -d --build"
    if anchor not in r:
        raise SystemExit("compose line not found in remote_deploy.sh")
    block = (
        "  # Brevo credentials: written before the container starts, so the app reads a file\n"
        "  # that already exists. Skipped silently when the secret is absent.\n"
        "  if [ -n \"${BREVO_API_KEY:-}\" ]; then\n"
        "    umask 077\n"
        "    printf 'BREVO_API_KEY=%s\\nBREVO_SENDER=hello@usmoneyhq.com\\n"
        "BREVO_REPLY_TO=hello@usmoneyhq.com\\n' \"$BREVO_API_KEY\" > /opt/usmoneyhq/.env\n"
        "    chmod 600 /opt/usmoneyhq/.env\n"
        "    echo \"wrote /opt/usmoneyhq/.env ($(wc -c < /opt/usmoneyhq/.env) bytes)\"\n"
        "  else\n"
        "    echo \"BREVO_API_KEY not passed — /api/lead-capture will return 501\"\n"
        "  fi\n\n"
    )
    r = r.replace(anchor, block + anchor, 1)
    open(R, "w", encoding="utf-8").write(r)
    print("remote_deploy.sh patched")

print("\n--- ssh line now ---")
for line in open(W, encoding="utf-8").read().splitlines():
    if "bash -s" in line:
        print(line.strip()[:140])
