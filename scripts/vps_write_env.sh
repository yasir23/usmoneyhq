#!/bin/bash
# Runs ON THE VPS, streamed over ssh by the deploy workflow.
# Writes /opt/usmoneyhq/.env from $BREVO_API_KEY in the remote environment, then restarts.
# Kept as a file rather than an inline quoted command because the inline version broke the
# workflow parse and failed the deploy in 0 seconds.
set -euo pipefail

: "${BREVO_API_KEY:?BREVO_API_KEY not passed to the remote shell}"

cd /opt/usmoneyhq

umask 077
cat > .env <<EOF
BREVO_API_KEY=${BREVO_API_KEY}
BREVO_SENDER=hello@usmoneyhq.com
BREVO_REPLY_TO=hello@usmoneyhq.com
EOF
chmod 600 .env

if docker compose version >/dev/null 2>&1; then
  docker compose up -d
else
  docker-compose up -d
fi

echo "env written ($(wc -c < .env) bytes), container restarted"
