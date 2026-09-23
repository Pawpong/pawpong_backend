# 계정 삭제와 진행 중 쓰기의 경계

`AccountWriteFenceModule`과 전역 HTTP interceptor를 앱에 등록한다. 인증된 adopter/breeder의 POST/PUT/PATCH/DELETE만 감싸며, 영구 삭제 접수·상태 조회, 읽기, 회원가입, 관리자 경로는 제외한다. WebSocket 메시지 전송·읽음 처리도 같은 서비스를 사용하고 채팅 전송은 수신자 lease까지 유지한다.

시작 시 Mongo transaction에서 활성 계정 행을 조건부 갱신하고 `account_write_leases`에 기록한다. 계정 행은 삭제 접수와 같은 쓰기 잠금 대상이다. commit은 majority write concern을 사용한다. 삭제가 먼저 접수됐거나 계정이 활성 상태가 아니면 handler를 실행하지 않는다. 이미 시작한 쓰기는 마무리하고, 삭제 worker는 `{accountId, role}` lease가 하나라도 있으면 collect·erase·완료를 진행하지 않는다. HTTP 연결 해제와 별개로 내부 handler Observable이 완료될 때까지 기다리므로 외부 구독 취소로 lease를 제거하지 않는다.

`account_write_leases`의 `_id`와 `ownerId`는 UUID 문자열, `accountId`는 사용자 ID 문자열이다. `role`, `operation`, `startedAt`만 부가 저장하며 URL·본문·자격 증명은 저장하지 않는다. TTL은 없다. 프로세스 장애나 cleanup 오류로 남은 lease는 시간이 지났다는 이유로 지우지 않는다. 운영자가 해당 owner 프로세스의 종료 및 재개 불가능 여부와 관련 작업 상태를 확인하기 전에는 삭제 작업을 대기 상태로 남긴다. 자동 stale lease 해제나 완료 처리는 제공하지 않는다.

이 경계는 기다린 작업에 적용된다. 새 mutation은 DB 쓰기와 파생 개인정보 저장 Promise를 반드시 await하거나 별도 durable lease/job 상태로 추적해야 한다. 댓글·좋아요의 닉네임 복사 알림 저장은 await한다. 기존 AI/영상 작업은 삭제 worker가 완료 상태를 별도로 확인한다. 다른 사용자가 독자적으로 작성하는 콘텐츠까지 이 서비스가 추적한다고 가정해서는 안 된다.

검증: 실제 Mongo replica set에서 시작/삭제의 병렬 경쟁, sender/receiver 쓰기, 영구 표식 및 비활성 계정 차단, client unsubscribe, 오래된 lease 보존, 경로 제외를 확인한다. 트랜잭션을 지원하는 Mongo 구성이 필요하며 연결 실패 시 쓰기를 허용하는 fallback은 없다.
