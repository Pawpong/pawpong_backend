# 운영 보안·로그 기준

- API 401/403/404는 서버 장애가 아님. 429는 경고, 5xx는 오류와 스택을 기록함.
- 공통 HTTP 로그는 요청 ID, 메서드, 쿼리 없는 경로, 상태 코드, 소요 시간만 남김. 본문·쿠키·토큰은 제외함.
- 응답 X-Request-ID로 HTTP와 예외 로그를 연결함. Loki의 `| json`으로 message 안의 JSON 필드 검색 가능함.
- Loki 조회 실패는 503이며 정상 상태로 위장하지 않음. 과거 로그 기반 시스템 상태는 실시간 브로커 헬스와 구분해야 함.
- Kafka 1GB 제한, 브로커 힙 최대384MB, 헬스체크 별도16–64MB. 기존 데이터 볼륨은 보존함.
- Nginx 확정적 탐색 경로만 403으로 차단. 동일 실제 접속 IP가 10분 내 10회 요청하면 Fail2ban이 HTTP/HTTPS만 1시간 차단함. 정상 API 오류·favicon·robots·Swagger·ACME는 대상 아님.
- 현재 Nginx는 인터넷 직접 진입점임. CDN/추가 프록시 도입 전 실제 IP 신뢰 설정과 차단 정책을 재검토해야 함. 사용자 제공 X-Forwarded-For로 밴하지 않음.

## 설치 / 검증 (운영 담당자)

1. 기존 Nginx 설정을 백업하고 `pawpong-probe-format.conf`를 `/etc/nginx/conf.d/`에 설치함.
2. `pawpong-probes.conf`를 `/etc/nginx/snippets/`에 설치하고 **TLS server 안에만** include함.
3. `nginx -t` 통과 후 reload. probe 로그 파일은 640 권한으로 생성하며 기본 `/var/log/nginx/*.log` 회전 대상인지 확인함.
4. Fail2ban 설치 후 filter를 `/etc/fail2ban/filter.d/pawpong-probes.conf`, jail을 `/etc/fail2ban/jail.d/pawpong-probes.local`에 설치함.
5. `fail2ban-regex`로 정상/공격 샘플 검증, `fail2ban-client -t` 통과 후 서비스 반영함.
6. `fail2ban-client status pawpong-probes`로 확인. 오탐은 `fail2ban-client set pawpong-probes unbanip <IP>`로 해제 가능함.

자동 과거 로그 재처리로 기존 IP를 일괄 차단하지 않음. 재시작·DB 삭제로 오류를 숨기지 않음.
