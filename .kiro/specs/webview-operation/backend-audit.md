# WebView 운영 감사 — Backend

- 감사 기준: 2026-09-24 KST, 시작 dev `3d11a59d`, production 배포 소스 `939ab0aa`.
- 범위: backend dev의 인증·FCM 등록·채팅 인증/ACK·앱 버전 정책. admin app-version 변경은 coordinator 소유로 이관함.
- 실행 경계: 운영/개발 DB 및 환경 변수 직접 쓰기, 실제 FCM 발송, 운영 로그인, 수동 배포, backend main push를 하지 않음. DB 쓰기 검증은 MongoMemoryReplSet에서만 실행함.

## 확인된 결함과 사용자 영향

| 결함 (시작 소스 기준) | 영향 | 수정 위치 | 네이티브 업데이트 |
|---|---|---|---|
| JWT 전략이 deleted만 거부함 | 관리자가 정지해도 기존 access token으로 HTTP 기능 사용 가능 | `src/common/strategy/jwt.strategy.ts:67` | 불필요 |
| refresh snapshot에 상태가 없고 hash 존재만 검증함 | 탈퇴/정지 사용자도 새 세션 발급 가능 | `src/api/service/auth/infrastructure/auth-session.adapter.ts:25`, `src/api/service/auth/domain/services/auth-session-authentication.service.ts:19` | 불필요 |
| 탈퇴/정지에서 refresh·내장 push 토큰·독립 기기 등록을 정리하지 않음 | 기존 토큰과 기기 소유권이 남고 복구 뒤 refresh 세션 재사용 가능 | `src/common/account-access/repository/account-access.repository.ts:19`, 각 상태 변경 repository | 불필요 |
| 소켓 최초 접속에서 suspended를 허용하고 이후 재검증 없음 | 연결 후 탈퇴/정지/만료된 사용자도 방 입장·읽음·수신 가능 | `src/api/service/chat/chat.gateway.ts:174`, `:192`, `:203` | 불필요 |
| send_message에 저장 ACK 및 요청 식별자가 없음 | 네트워크 유실 때 저장 여부를 알 수 없고 같은 요청 재시도 시 중복 메시지 생성 | `src/api/service/chat/chat.gateway.ts:256`, `src/api/service/chat/repository/chat.repository.ts:172` | 웹 반영으로 가능 |
| 스토어 호스트만 검증함 | 다른 앱/검색 페이지도 강제 업데이트 목적지로 저장 가능; RN 허용 앱 정책과 불일치 | `src/api/service/app-version/domain/services/app-version-store-url.policy.ts:2` | 불필요 |
| isActive:false 단독 PATCH에도 기존 잘못된 버전/URL 검증 적용 | 잘못 저장된 강제 업데이트를 관리자가 즉시 끌 수 없음 | `src/api/admin/app-version/application/use-cases/update-app-version.use-case.ts:33` | 불필요 |

## 수정한 계약

- 탈퇴·정지 상태 변경과 refresh/내장 push 토큰 제거를 같은 사용자 문서 쓰기로 처리함. `account.access.revoked`를 await하여 독립 기기 소유 등록도 삭제하고 현재 인스턴스의 소켓을 닫음. 다른 계정으로 소유권이 이동한 기기는 삭제하지 않음.
- 일반 푸시 토큰 조회도 suspended/deleted를 제외함. 토큰 등록 트랜잭션과 refresh hash 저장은 상태 조건을 원자적 쿼리에 포함하여 동시 정지 뒤 토큰 재등록을 막음.
- 다른 인스턴스에서 상태가 바뀐 소켓은 다음 입장/송신/읽음과 수신 전 인증을 재검증함. JWT 만료도 이때 차단함.
- `send_message.clientMessageId`는 선택 필드이며 ASCII 영숫자·밑줄·하이픈 1~128자(UUID 포함)를 허용함. `(roomId, senderId, clientMessageId)` partial unique index로 동시 재시도에도 한 메시지만 저장함. index 초기화를 `ChatRepository.onModuleInit`에서 기다리고 요청을 받음. 현재 DB 설정은 Mongoose 기본 autoIndex를 변경하지 않음.
- 성공 ACK는 `{success:true,messageId,clientMessageId?}`, 실패 ACK는 `{success:false,error}`. 기존 error/new_message 이벤트를 보존함. REST 목록과 new_message에 선택 clientMessageId를 추가함. 같은 ID/내용 재시도는 기존 messageId를 반환하고 방 정렬·unread·브로드캐스트를 다시 만들지 않음. 같은 ID의 다른 내용은 거부함.
- clientMessageId 없는 구버전은 이전처럼 같은 내용의 메시지를 각각 저장함. 공개 앱 버전 응답의 5개 기존 필드와 기존 optional appIconKey 계약을 유지함.
- iOS 상세 주소의 앱 ID는 `6814126823`, Android 상세 주소의 package는 `kr.pawpong.app`만 허용함. iOS 국가/앱 이름 경로와 마지막 slash를 허용하며 Android 중복 id 파라미터를 거부함.
- 긴급 OFF는 defined 필드가 isActive:false 하나인 경우 기존 불량 정책 검증 없이 그 필드만 저장함. ES2022 DTO의 undefined class fields를 제외해 실제 HTTP에서도 작동함. 재활성화는 저장된 정책을 다시 검증함.

## Google PKCE 및 배포 노출 확인

- RN 담당과 start `{codeChallenge,frontendOrigin,returnUrl}` / exchange `{code,state,codeVerifier}` 및 `pawpong://auth/callback` 계약이 동일함을 확인함. 현행 backend 네이티브 Google 코드는 수정하지 않음.
- `src/api/service/auth/presentation/guards/auth-google-callback.guard.ts:23`은 native state prefix가 없는 요청을 기존 Passport 웹 경로로 처리함. 네이티브 브리지가 없는 설치본의 실제 제공자 WebView 로그인 가능성은 검증하지 않음; 백엔드 변경만으로 설치본에 네이티브 브리지를 추가할 수는 없음.
- production workflow [35889509229](https://github.com/Pawpong/Pawpong_Backend/actions/runs/35889509229)는 2026-09-23 16:32:55 UTC 생성, 성공, head `939ab0aa4e7046ed2447f1ad090b93ec5187dff0`임. 해당 main 소스의 네이티브 Google controller/start/exchange/policy 네 파일은 감사 dev와 동일하고 모듈에도 등록되어 있음. 성공 배포 소스 증거와 실제 제공자 로그인 성공 검증은 구분함.
- 읽기 관찰: dev/prod `GET /api/v2/app-version/check`의 iOS/Android 1.0.0 요청은 모두 200이며 force/recommend=false, latestVersion=1.0.0, message/storeUrl 빈 문자열임.
- `GET /api/v2/app-splash?platform=ios`는 dev 200, production 404임. `/docs-json`은 양 환경 503임. native start/exchange OPTIONS는 공통 CORS 204여서 경로 존재의 증거로 사용하지 않음. 세션을 만드는 운영 POST는 하지 않음.
- 실제 공개 스토어 읽기: [Apple KR lookup](https://itunes.apple.com/lookup?id=6814126823&country=kr)은 HTTP 200/resultCount=0, [Google Play 상세](https://play.google.com/store/apps/details?id=kr.pawpong.app)는 HTTP 404였음. 이 호스트에서 공개 설치 가능성을 확인하지 못했으며 전 세계 미출시로 단정하지 않음. 이번 URL 검증은 앱 식별자 검증이며 출시/지역별 설치 가능성 보증이 아님.

## 검증 결과

- `pnpm typecheck` 통과. coordinator가 별도로 실행한 `pnpm build`도 통과함.
- 관련 Jest 단위/HTTP 계약: 32 suites / 135 tests 통과. 기존 native Google HTTP 계약도 포함함. 선택형 로컬 Redis 통합 1 suite / 5 tests는 실행하지 않음.
- 실제 MongoDB + Socket.IO + HTTP E2E: 3 suites / 27 tests 통과. 최종 index 부팅 대기/타입 보완 뒤 chat·정책 2 suites / 19 tests와 gateway unit 12 tests도 재검증 통과함. `chat-delivery-session` 8개, `app-version-policy`, `push-integration`을 실행함.
- `src/api/service/chat/test/chat-delivery-session.e2e-spec.ts:111` 동시 동일 ID 저장/ACK/REST/unread/단일 전파, `:151` 구 클라이언트, `:163` 두 역할 탈퇴·사용자 관리자 정지·브리더 관리자 정지, `:214` 타 인스턴스 상태 변경 후 수신 차단을 검증함.
- `src/api/admin/app-version/test/e2e/app-version-policy.e2e-spec.ts:136` 실제 DTO 변환을 거친 불량 정책 OFF/재활성 거부를 검증함.
- 새 account-access 폴더, 새 채팅 E2E, 변경한 핵심 use-case/정책/mapper의 ESLint는 통과함. 변경 파일 전체 lint에는 기존 테스트/adapter의 any·unbound-method 부채가 남아 있어 전체 통과로 보고하지 않음.
- 변경분 경계 검사: application/domain/repository에 새 request DTO import 없음, 새 InjectModel은 repository 안에만 위치함. AGENTS.md는 미추적이며 커밋 대상에서 제외함.

## 테스트 공백 및 운영상 남은 확인

1. 실제 FCM 수신, Google 제공자 성공 인증, 실제 스토어 설치, 오래된 배포 앱 전체 버전 행렬은 검증하지 않음. 설치 가능한 출시 버전인지 확인한 뒤 강제 업데이트 정책을 켜야 함. 정책/환경 값을 이번 작업에서 활성화하지 않음.
2. backend dev 반영과 production 배포는 별개임. 이번 수정의 production 승격/배포와 운영 DB index 확인은 수행하지 않음.
3. unique index는 메시지 저장 중복을 막음. 저장 직후 프로세스가 종료되거나 방 메타데이터/브로커 처리에 실패한 뒤의 후속 발송까지 exactly-once로 보장하지 않음. 중복 재시도는 기존 저장 ACK를 반환하며 누락된 후속 발송 outbox 복구는 범위 밖임. REST 재조회로 저장된 메시지를 확인할 수 있음.
4. 원격 인스턴스의 유휴 소켓은 다음 활동/수신 전 닫히며 분산 즉시 연결 종료 이벤트는 도입하지 않음. 사용자 문서 토큰 제거는 상태와 원자적이나 독립 기기 등록 정리는 await 이벤트 후행 쓰기이므로 프로세스 강제 종료 사이의 정리 outbox는 없음.
5. access JWT는 상태 확인으로 거부하며 tokenVersion 기반 영구 폐기 모델로 바꾸지 않음. 이후 계정을 다시 활성화한 경우 아직 만료되지 않은 과거 access JWT까지 영구 취소하는 모델은 이번 변경 범위에 포함되지 않음; refresh 세션은 제거되어 복구되지 않음.
