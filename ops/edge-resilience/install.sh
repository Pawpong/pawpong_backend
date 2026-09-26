#!/usr/bin/env bash
# Host-only setup; never replace TLS certificates, upstream ports or application data.
#
# 적용 대상 3가지
#   1. nginx 자체 에러(502/503/504)에 CORS 헤더를 붙여 브라우저가 상태 코드를 보게 한다
#      (없으면 전부 "Network Error" 로 뭉개져 장애 추적이 불가능하다)
#   2. 업스트림이 1대뿐이므로 max_fails 로 죽은 것으로 표시하지 않는다
#      (3회 실패 시 30초간 모든 요청이 502 가 되어 짧은 blip 이 장애로 증폭된다)
#   3. Connection 헤더를 표준 map 패턴으로 바꿔 upstream keepalive 를 되살린다
set -euo pipefail
test "$(id -u)" = 0 || { echo 'Run with sudo'; exit 1; }
cd "$(dirname "$0")"

target=/etc/nginx/sites-available/pawpong
test -f "$target"
test "$(grep -c 'listen 443 ssl' "$target")" = 1

backup=$(mktemp -d /var/backups/pawpong-edge-XXXXXXXX)
cp -p "$target" "$backup/nginx-site"

install -m 644 pawpong-cors-maps.conf /etc/nginx/conf.d/pawpong-cors-maps.conf
install -m 644 pawpong-upstream-error.conf /etc/nginx/snippets/pawpong-upstream-error.conf

# 1) server 블록 안에 에러 스니펫 include (멱등)
if ! grep -q 'include /etc/nginx/snippets/pawpong-upstream-error.conf;' "$target"; then
    sed -i '/listen 443 ssl/a\    include /etc/nginx/snippets/pawpong-upstream-error.conf;' "$target"
fi

# 2) 업스트림이 1대이므로 죽은 것으로 표시하지 않는다.
#    deploy.sh 는 upstream 블록의 localhost:<port> 만 sed 로 바꾸므로 이 변경과 충돌하지 않는다.
sed -i '/upstream pawpong_backend {/,/}/ s/max_fails=[0-9]\+/max_fails=0/' "$target"

# 3) Connection 헤더 정리 — 기존 3줄을 표준 map 패턴 2줄로 교체 (멱등)
if grep -q 'proxy_set_header Connection "upgrade";' "$target"; then
    sed -i '/proxy_set_header Connection "";/d' "$target"
    sed -i 's|proxy_set_header Connection "upgrade";|proxy_set_header Connection $pawpong_connection_upgrade;|' "$target"
fi

if ! nginx -t; then
    cp -p "$backup/nginx-site" "$target"
    rm -f /etc/nginx/conf.d/pawpong-cors-maps.conf /etc/nginx/snippets/pawpong-upstream-error.conf
    nginx -t
    echo "Nginx validation failed; original site restored from $backup"
    exit 1
fi

systemctl reload nginx
echo "Applied. Original Nginx config retained at $backup/nginx-site"
echo
echo "검증:"
echo "  curl -s -o /dev/null -D - -H 'Origin: https://pawpong.kr' https://api.pawpong.kr/api/health | grep -i access-control"
echo "  # 백엔드를 잠시 내린 뒤 위 요청이 503 + CORS 헤더로 오는지 확인"
