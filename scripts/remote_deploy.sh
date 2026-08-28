#!/bin/bash
# remote_deploy.sh — runs on the VPS after the standalone bundle is uploaded.
# Deploys US Money HQ as a Docker container behind the existing Traefik proxy.
# Isolated: own container + own Traefik router. AgentTrac (any other stack) untouched.
set -euo pipefail
cd /opt/usmoneyhq
tar xzf usmoneyhq.tar.gz && rm -f usmoneyhq.tar.gz

echo "--- extracted .next ---"
ls .next | head -20
test -f .next/BUILD_ID || { echo "BUILD_ID MISSING AFTER EXTRACT"; exit 1; }

# Docker present? (Traefik runs in Docker on this server)
if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker not found"; exit 1
fi

# Discover the Traefik docker network so our container joins it
NET=$(docker network ls --format '{{.Name}}' | grep -i traefik | head -1)
if [ -z "$NET" ]; then
  echo "ERROR: no traefik network found"; docker network ls; exit 1
fi
echo "Using traefik network: $NET"
sed -i.bak "s/NETWORK_NAME_PLACEHOLDER/$NET/g" docker-compose.yml

# Stop the old pm2 process if it exists (superseded by docker)
pm2 delete usmoneyhq 2>/dev/null || true

# Build + start (Traefik picks up labels automatically)
docker compose up -d --build

echo "--- waiting for app ---"
sleep 4
docker compose ps
curl -s -m 5 http://127.0.0.1:3000/ | head -c 200
echo
echo DEPLOY_DONE
