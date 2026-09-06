# 운영 알림 및 고객지원

## 환경 경계

- 백엔드 `APP_ENV=production`을 운영 서버에 명시함. 미지정 시 기존 `NODE_ENV` 사용함.
- 운영 오류: `DISCORD_ERROR_WEBHOOK_URL`. 개발 오류: `DISCORD_DEV_ERROR_WEBHOOK_URL`. 운영 URL로 개발 알림을 fallback하지 않음.
- 개발 피드백은 개발 DB에만 저장하며 운영 outbox가 전송하지 않음.
- 가입/서류/탈퇴 웹후크는 운영에서만 사용함.
- 프론트는 `NEXT_PUBLIC_APP_ENV`를 빌드에 고정함. Vercel 환경값을 우선함. localhost·비운영 호스트는 운영 DSN을 사용하지 않음.
- 운영 `NEXT_PUBLIC_SENTRY_DSN`과 개발 `NEXT_PUBLIC_SENTRY_DEV_DSN`을 별도 프로젝트로 설정함. 개발은 `NEXT_PUBLIC_SENTRY_ENABLE_DEV=true`일 때만, 서로 다른 DSN일 때만 수집함. 개발 DSN 미설정 시 로컬 콘솔로 확인함.
- Sentry 서버 측 운영 알림 규칙도 `environment=production`, 개발 규칙은 별도 프로젝트/개발 채널로 설정함. SDK 환경 정책만으로 다른 개발자의 과거 버전까지 통제할 수는 없음.

## 피드백 처리

- `POST /api/v2/home/support/feedback`: 기존 질문 DTO로 DB 접수 후 receiptId 반환함. 저장 실패 시 503 반환함.
- 관리자 `/support` 화면에서 접수·처리 중·처리 완료, 내가 담당하기·담당 해제를 관리함. 처리 완료에는 메모 필수임.
- `GET /api/home-admin/support`: page(20건), status, receiptId 검색 지원함. `PATCH /api/home-admin/support/:eventId`: revision 비교 후 상태와 변경 이력을 함께 저장함. 기존 관리자 JWT/RolesGuard 적용함.
- 관리자 변경은 새 outbox 전달을 예약함. Discord 제목 링크로 관리자 화면에 접근하며, 메시지 반응은 DB 상태를 바꾸지 않음.
- DB 원자적 임대와 지수 백오프 재시도로 재시작 후 미전달 접수를 유지함. 전송 성공 직후 DB 기록 전에 종료되면 중복 메시지 가능함. 접수번호·변경 버전으로 구분함.
- AI 질문 원문은 저장·전송하지 않음. 피드백 원문은 관리자 DB에 보관하고 Discord 미리보기의 연락처·인증정보·링크는 마스킹함.

## 반복 오류와 복구

- 첫 5xx 오류를 즉시 알리고 동일 오류는 5분 단위 발생 건수로 요약함. 추가 요청 없이도 타이머로 잔여 집계를 전달함. 쿼리 문자열·일부 동적 ID는 집계 키에서 제외함.
- API 오류 집계는 프로세스 단위이며 재시작 시 초기화됨. 원본 운영 로그는 기존 로그 시스템에서 조회함.
- `health-monitor.py`는 앱 밖에서 백엔드·AI Agent·Kafka·Redis 컨테이너 헬스와 공개 API readiness를 매분 관찰함.
- 연속 2회 실패 시 장애, 15분 지속 시 실패 관측 횟수 요약, 연속 2회 정상 시 복구 알림 보냄. 단순히 오류가 없었다는 이유로 복구 판정하지 않음.
- 알림 상태는 `~/.local/state/pawpong-alerts/state.json`에 원자적으로 저장함. 전달 실패 시 다음 실행에 재시도함.
- 호스트 자체가 정지하거나 외부 네트워크가 완전히 끊기면 동일 호스트의 모니터도 보낼 수 없음. 별도 외부 uptime 감시는 추가 구성 대상임.

## 배포와 설치

- GitHub Actions 운영·개발·롤백 알림은 `notify.py` 사용함. 서비스·환경·커밋·결과·헬스체크·실행 로그 표시함.
- 운영 secret `DISCORD_DEPLOY_WEBHOOK_URL`, 개발 secret `DISCORD_DEV_DEPLOY_WEBHOOK_URL` 사용함. 비밀값은 저장소에 넣지 않음.
- 백엔드 먼저 배포하고 운영 `.env.production`에 `APP_ENV`, `DISCORD_SUPPORT_WEBHOOK_URL`, `DISCORD_ERROR_WEBHOOK_URL`, `ADMIN_URL` 설정 후 관리자와 사용자 프론트를 배포함.
- 운영 계정·경로는 systemd unit을 실제 서버 구성에 맞춰 설치함. `pawpong-health-monitor.service`와 `.timer`를 `/etc/systemd/system/`에 설치한 후 `systemctl daemon-reload`, `systemctl enable --now pawpong-health-monitor.timer` 실행함.
- 기존 환경 파일은 권한 600으로 백업한 후 키 단위로 수정함. 롤백은 이전 앱 이미지와 백업된 환경을 함께 검토함. 새 접수 컬렉션을 삭제하지 않음.

## 검증

- 지원 HTTP·관리자 권한·revision 충돌·outbox 임대·환경 필터 통합 테스트 사용함.
- `python3 ops/observability/test_monitor.py`: 장애/복구 전이와 배포 payload 검증함.
- 실제 연결 테스트는 `[운영 연결 검증]` 표시와 합성 문구를 사용하며, 서비스 중단을 만들어 테스트하지 않음.

## Sentry 무료 플랜 중계

- 새 조직 `pawpong-mq`의 `pawpong-web-production`과 `pawpong-web-development`를 사용함. 각 프로젝트 DSN을 별도 설정함.
- 현재 플랜 UI에서 Discord 직접 연동을 제공하지 않아 공개 API의 `event:read` 전용 토큰으로 중계함. 유료 플랜 또는 쓰기 권한이 필요하지 않음.
- `sentry-monitor.py`가 5분마다 환경·프로젝트 필터로 조회하고 새 오류·누적 건수 증가·상태 변경만 전달함. 오류 원문·사용자 정보는 Discord로 복사하지 않음.
- 토큰과 웹훅은 `/home/colding/.config/pawpong/sentry-monitor.env`(600)에 보관함. 키는 `SENTRY_READ_TOKEN`, `SENTRY_ORG`, `SENTRY_PRODUCTION_PROJECT`, `SENTRY_DEVELOPMENT_PROJECT`, `DISCORD_SENTRY_PRODUCTION_WEBHOOK_URL`, `DISCORD_SENTRY_DEVELOPMENT_WEBHOOK_URL`임.
- `pawpong-sentry-monitor.service`와 `.timer`도 systemd에 설치함. API/웹훅 장애는 실패 종료하고 다음 주기에 재시도함. 상태 파일은 기존 모니터와 별도로 저장함.
- 성능 추적·리플레이·로그 수집을 꺼서 오류 이벤트만 사용함. 실제 오류가 무료 한도보다 많으면 수집 누락 가능하며 무료 사용량 자체를 무제한으로 보장하지 않음.
- 공식 API: https://docs.sentry.io/api/events/list-an-organizations-issues/

## Discord 채널과 배포 카드

- 프론트/관리자 배포는 `프론트엔드-배포`, 백엔드/Agent 배포는 `백엔드-배포`로 전달함. 각 저장소의 운영·개발 배포 secret 모두 해당 서비스 배포 웹훅을 사용함.
- 오류 채널은 `프론트엔드-운영-오류`, `프론트엔드-개발-오류`, `백엔드-운영-오류`, `백엔드-개발-오류`로 구분함. 오류 웹훅을 배포 secret에 넣지 않음.
- 카드에 서비스·환경·브랜치·배포 방식·대상 서버·실행자·커밋 작성자·SHA·메시지·주소·헬스체크·로그 링크를 표시함. Vercel 실행 봇과 실제 커밋 작성자를 구분함.
- GitHub 커밋 API를 읽기 토큰으로 조회함. 브랜치를 특정할 수 없는 SHA 배포는 확인 불가로 표시하며 추측하지 않음. 커밋 원문을 셸에서 실행하지 않고 Discord 멘션을 차단함.
- 기존 채널의 과거 메시지는 보존함. 새 라우팅은 이후 알림부터 적용됨.
