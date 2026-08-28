#!/bin/bash
# remote_deploy.sh — runs on the VPS after the standalone bundle is uploaded.
# Isolated: /opt/usmoneyhq + port 3001 + own nginx vhost (000- loads first).
set -euo pipefail
cd /opt/usmoneyhq
tar xzf usmoneyhq.tar.gz && rm -f usmoneyhq.tar.gz

echo "--- extracted .next ---"
ls .next | head -20
test -f .next/BUILD_ID || { echo "BUILD_ID MISSING AFTER EXTRACT"; exit 1; }

apt-get update -qq >/dev/null 2>&1 || true
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs >/dev/null 2>&1
fi
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2 >/dev/null 2>&1
fi
if ! command -v nginx >/dev/null 2>&1; then
  apt-get install -y -qq nginx >/dev/null 2>&1
fi

export NODE_ENV=production
pm2 delete usmoneyhq 2>/dev/null || true
PORT=3001 pm2 start server.js --name usmoneyhq
pm2 save

cat > /etc/nginx/sites-available/000-usmoneyhq <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name usmoneyhq.com www.usmoneyhq.com;
    client_max_body_size 10m;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml text/plain;
}
NGINX
ln -sf /etc/nginx/sites-available/000-usmoneyhq /etc/nginx/sites-enabled/000-usmoneyhq
nginx -t && (systemctl reload nginx 2>/dev/null || service nginx reload)

echo DEPLOY_DONE
