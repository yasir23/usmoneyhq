#!/usr/bin/env python3
"""Add the Brevo env step to the deploy workflow, in a form GitHub's parser accepts."""
P = ".github/workflows/deploy.yml"
s = open(P, encoding="utf-8").read()

if "Inject Brevo env" in s:
    print("already patched")
    raise SystemExit(0)

STEP = """      - name: Inject Brevo env
        if: ${{ secrets.BREVO_API_KEY != '' }}
        env:
          VPS_HOST: ${{ secrets.VPS_HOST }}
          VPS_USER: ${{ secrets.VPS_USER }}
          VPS_PASSWORD: ${{ secrets.VPS_PASSWORD }}
          BREVO_API_KEY: ${{ secrets.BREVO_API_KEY }}
        run: |
          SSHPASS="$VPS_PASSWORD" sshpass -e ssh -o StrictHostKeyChecking=accept-new \\
            "$VPS_USER@$VPS_HOST" "BREVO_API_KEY='$BREVO_API_KEY' bash -s" < scripts/vps_write_env.sh
"""

anchor = "      - name: Remediate port 80 conflict"
i = s.find(anchor)
if i == -1:
    raise SystemExit("anchor not found")

s = s[:i] + STEP + "\n" + s[i:]
open(P, "w", encoding="utf-8").write(s)

try:
    import yaml
    yaml.safe_load(open(P, encoding="utf-8"))
    print("patched, YAML OK")
except ImportError:
    print("patched (pyyaml absent)")
except Exception as exc:
    print("YAML BROKEN:", exc)
    raise SystemExit(1)
