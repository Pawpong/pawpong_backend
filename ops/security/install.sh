#!/usr/bin/env bash
# Host-only setup; never replace TLS certificates, upstream ports or application data.
set -euo pipefail
test "$(id -u)" = 0 || { echo 'Run with sudo'; exit 1; }
cd "$(dirname "$0")"
target=/etc/nginx/sites-available/pawpong
test -f "$target"
test "$(grep -c 'listen 443 ssl' "$target")" = 1
command -v fail2ban-client >/dev/null
backup=$(mktemp -d /var/backups/pawpong-security-XXXXXXXX)
cp -p "$target" "$backup/nginx-site"
install -m 644 pawpong-probe-format.conf /etc/nginx/conf.d/pawpong-probe-format.conf
install -m 644 pawpong-probes.conf /etc/nginx/snippets/pawpong-probes.conf
if ! grep -q 'include /etc/nginx/snippets/pawpong-probes.conf;' "$target"; then
    sed -i '/listen 443 ssl/a\    include /etc/nginx/snippets/pawpong-probes.conf;' "$target"
fi
# The current host is the direct internet edge: discard spoofed forwarded-for chains.
sed -i 's/X-Forwarded-For \$proxy_add_x_forwarded_for/X-Forwarded-For $remote_addr/g' "$target"
if ! nginx -t; then
    cp -p "$backup/nginx-site" "$target"
    echo "Nginx validation failed; original site restored from $backup"
    exit 1
fi
touch /var/log/nginx/pawpong_probe.log
chmod 640 /var/log/nginx/pawpong_probe.log
install -m 644 pawpong-probes.filter.conf /etc/fail2ban/filter.d/pawpong-probes.conf
install -m 644 pawpong-probes.jail.conf /etc/fail2ban/jail.d/pawpong-probes.local
fail2ban-client -t
systemctl reload nginx
systemctl enable --now fail2ban
fail2ban-client reload
fail2ban-client status pawpong-probes
echo "Original Nginx config retained at $backup/nginx-site"
