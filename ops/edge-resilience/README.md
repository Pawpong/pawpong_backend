# edge-resilience

운영 nginx(`/etc/nginx/sites-available/pawpong`)에 적용하는 호스트 전용 설정.
레포의 루트 `nginx.conf` 는 참고용 사본이며 배포 파이프라인이 서버로 복사하지 않는다
(`deploy.sh` 는 blue-green 전환을 위해 upstream 포트만 `sed` 로 바꾼다).

## 왜 필요한가

프론트(`pawpong.kr`)와 API(`api.pawpong.kr`)가 다른 오리진이다.
nginx 가 직접 만드는 에러 페이지에는 `Access-Control-Allow-Origin` 이 없어서
브라우저가 응답을 차단하고, 프론트 axios 에는 상태 코드 없이 `Network Error` 만 남는다.

2026-09-20 `/community/write` 에서 보고된 `ApiError: Network Error` 가 이 경우로,
사용자 화면은 5G 풀신호였고 해당 시각 배포도 없었는데 원인을 특정할 수 없었다.

## 적용

```bash
sudo ops/edge-resilience/install.sh
```

멱등하며, `nginx -t` 실패 시 원본을 자동 복구한다. 원본은 `/var/backups/pawpong-edge-*` 에 남는다.

## 적용 후 확인

```bash
# 정상 응답의 CORS 헤더가 중복되지 않는지 (Access-Control-Allow-Origin 이 1줄이어야 한다)
curl -s -o /dev/null -D - -H 'Origin: https://pawpong.kr' https://api.pawpong.kr/api/health | grep -ci access-control-allow-origin

# WebSocket 채팅이 정상 연결되는지 (Connection 헤더 변경 영향)
# 업스트림 keepalive 복구 확인
ss -tn state established '( dport = :8080 )' | wc -l
```
