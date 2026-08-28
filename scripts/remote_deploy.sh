#!/bin/bash
# remote_deploy.sh — runs on the VPS after the standalone bundle is uploaded.
# Deploys US Money HQ as a Docker container behind the existing Traefik proxy.
# Isolated: own container + own Traefik router. AgentTrac (any other stack) untouched.
set -uo pipefail

cd /opt/usmoneyhq
tar xzf usmoneyhq.tar.gz && rm -f usmoneyhq.tar.gz

echo "--- extracted .next ---"
ls .next >/dev/null 2>&1 || { echo "FATAL: no .next dir"; exit 1; }
test -f .next/BUILD_ID || { echo "FATAL: BUILD_ID MISSING AFTER EXTRACT"; exit 1; }
echo "BUILD_ID OK"

echo "--- docker check ---"
command -v docker || { echo "FATAL: docker not found"; exit 1; }

# Traefik runs on host networking — our container uses the default bridge,
# which Traefik can route to via the docker gateway. No network join needed.

# Superseded pm2 process (if any) — clean up
pm2 delete usmoneyhq 2>/dev/null || true

echo "--- compose build+up ---"
if command -v docker-compose >/dev/null 2>&1; then
  docker-compose up -d --build
else
  docker compose up -d --build
fi

echo "--- app check ---"
sleep 4
docker ps --format '{{.Names}} {{.Status}}' | grep usmoneyhq || true
curl -s -m 5 http://127.0.0.1:3000/ | head -c 120 || true
echo
echo DEPLOY_DONE
