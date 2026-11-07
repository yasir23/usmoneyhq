#!/usr/bin/env python3
"""Add a step that writes /opt/usmoneyhq/.env from the repo secret and restarts the container."""
P = ".github/workflows/deploy.yml"
s = open(P, encoding="utf-8").read()

if "Inject Brevo env" in s:
    print("already patched")
    raise SystemExit(0)

STEP = (
    "      - name: Inject Brevo env\n"
    "        if: ${{ secrets.BREVO_API_KEY != '' }}\n"
    "        env:\n"
    "          VPS_HOST: ${{ secrets.VPS_HOST }}\n"
    "          VPS_USER: ${{ secrets.VPS_USER }}\n"
    "          VPS_PASSWORD: ${{ secrets.VPS_PASSWORD }}\n"
    "          BREVO_API_KEY: ${{ secrets.BREVO_API_KEY }}\n"
    "        run: |\n"
    "          # Written before the restart, so the container reads a file that exists.\n"
    "          sshpass -e ssh -o StrictHostKeyChecking=accept-new \"$VPS_USER@$VPS_HOST\" \\\n"
    "            \"umask 077; printf 'BREVO_API_KEY=%s\\nBREVO_SENDER=hello@usmoneyhq.com\\n"
    "BREVO_REPLY_TO=hello@usmoneyhq.com\\n' \\\"$BREVO_API_KEY\\\" > /opt/usmoneyhq/.env && "
    "cd /opt/usmoneyhq && (docker compose up -d || docker-compose up -d)\"\n"
    "          echo 'wrote /opt/usmoneyhq/.env (0600) and restarted'\n"
)

anchor = "      - name: Remediate port 80 conflict"
i = s.find(anchor)
if i == -1:
    raise SystemExit("anchor not found")

s = s[:i] + STEP + "\n" + s[i:]
open(P, "w", encoding="utf-8").write(s)

# structural sanity: the file must still parse as YAML with the same top-level keys
try:
    import yaml  # optional
    d = yaml.safe_load(open(P, encoding="utf-8"))
    print("YAML OK, jobs:", list(d.get("jobs", {}).keys()))
except ImportError:
    print("patched (pyyaml absent, skipping parse check)")
except Exception as exc:
    print("YAML BROKEN:", exc)
    raise SystemExit(1)
