#!/bin/bash
# deploy.sh — US Calc Tools deploy to Vercel (free) OR the existing Hostinger VPS.
# Usage:
#   VERCEL_TOKEN=xxx ./deploy.sh            -> Vercel production deploy
#   DEPLOY_SSH_PASSWORD=xxx ./deploy.sh     -> VPS deploy (PM2 + nginx, tools.nayaflow.com)
set -euo pipefail
cd /Users/ambusiness/us-calc-tools

if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  echo "→ Deploying to Vercel (token present)"
  npm run build >/dev/null 2>&1
  npx vercel deploy --prod --token "$VERCEL_TOKEN" --yes 2>&1 | tail -3
  echo "✅ Vercel deploy done. Domain: set in Vercel dashboard (uscalctools.com or tools.nayaflow.com)."
  exit 0
fi

if [[ -n "${DEPLOY_SSH_PASSWORD:-}" ]]; then
  echo "→ Deploying to Hostinger VPS (password present)"
  REMOTE_HOST="${REMOTE_HOST:-187.124.116.227}"
  REMOTE_USER="${REMOTE_USER:-root}"
  APP_DIR="/opt/uscalctools"
  if ! command -v sshpass >/dev/null 2>&1; then
    echo "ERROR: sshpass not installed. brew install sshpass"
    exit 1
  fi
  npm run build >/dev/null 2>&1
  SSHPASS="$DEPLOY_SSH_PASSWORD" sshpass -e ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 "${REMOTE_USER}@${REMOTE_HOST}" \
    "mkdir -p ${APP_DIR} && (command -v node >/dev/null || (curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1 && apt-get install -y -qq nodejs)) && (command -v pm2 >/dev/null || npm install -g pm2 >/dev/null 2>&1)"
  echo "→ syncing standalone build"
  rsync -avz --delete -e "ssh -o StrictHostKeyChecking=accept-new" \
    .next/standalone/ "${REMOTE_USER}@${REMOTE_HOST}:${APP_DIR}/" --exclude node_modules
  rsync -avz -e "ssh -o StrictHostKeyChecking=accept-new" \
    .next/static/ "${REMOTE_USER}@${REMOTE_HOST}:${APP_DIR}/.next/static/"
  echo "→ starting PM2 (port 3001, keeps sealofaudit on 3000 untouched)"
  SSHPASS="$DEPLOY_SSH_PASSWORD" sshpass -e ssh -o StrictHostKeyChecking=accept-new "${REMOTE_USER}@${REMOTE_HOST}" bash -s << REMOTE
set -euo pipefail
cd ${APP_DIR}
export NODE_ENV=production
if [ ! -d node_modules ]; then npm install --omit=dev --no-audit --no-fund >/dev/null 2>&1 || true; fi
pm2 delete uscalctools 2>/dev/null || true
PORT=3001 pm2 start server.js --name uscalctools
pm2 save
REMOTE
  echo "→ nginx site"
  SSHPASS="$DEPLOY_SSH_PASSWORD" sshpass -e ssh -o StrictHostKeyChecking=accept-new "${REMOTE_USER}@${REMOTE_HOST}" bash -s << REMOTE
set -euo pipefail
cat > /etc/nginx/sites-available/uscalctools << 'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name tools.nayaflow.com uscalctools.com www.uscalctools.com;
    client_max_body_size 10m;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml text/plain;
}
NGINX
ln -sf /etc/nginx/sites-available/uscalctools /etc/nginx/sites-enabled/uscalctools
nginx -t && (systemctl reload nginx 2>/dev/null || service nginx reload)
REMOTE
  echo "✅ VPS deploy done. DNS: point tools.nayaflow.com A record -> ${REMOTE_HOST}"
  exit 0
fi

echo "Missing credential. Run one of:"
echo "  VERCEL_TOKEN=xxx $0            (create at vercel.com/account/tokens)"
echo "  DEPLOY_SSH_PASSWORD=xxx $0     (Hostinger root password)"
exit 1
