# 모바일 연동 백엔드 검증 (2026-09-24 KST)

구현 커밋: `00da853c` (`dev`). 기존 다른 작업의 변경은 포함하지 않았다.

- 공유 링크를 MongoDB에 저장하고 관리자 CRUD와 인증 없는 활성 링크 조회를 추가함.
- 푸시 토큰의 계정 이전·기기 바인딩을 한 트랜잭션으로 처리하고 동시 등록 중복 및 이전 계정 로그아웃의 소유권 해제를 방지함.
- 관리자 FCM 발송에서 토큰 중복 제거, 무효 토큰 정리, 내부 경로/공유 링크 URL 검증을 추가함.
- 앱 버전 부분 PATCH를 기존 값과 병합해 `minRequiredVersion <= latestVersion`을 검사하고 두 값을 원자적으로 저장함.
- 스토어 설정은 Apple/Google HTTPS 주소만 허용하며, 기존 DB의 빈 주소·외부 URL은 강제 업데이트를 유발하지 않도록 처리함.

## HTTP 계약

| API | 권한 | 응답 `data` |
| --- | --- | --- |
| `GET /api/deep-link-admin?page=1&limit=10` | 관리자 JWT | `{items, pagination}` |
| `POST /api/deep-link-admin` | 관리자 JWT | 생성된 항목 |
| `PUT /api/deep-link-admin/:id` | 관리자 JWT | 수정된 항목; 부분 필드 입력 지원 |
| `DELETE /api/deep-link-admin/:id` | 관리자 JWT | `null` |
| `GET /api/v2/deep-links/:slug` | 공개 | `{slug,title,description,targetPath,imageUrl}` |

모두 기존 `success/code/data/message/timestamp` 봉투를 사용한다. 목록 항목은 공개 필드에 `id/isActive/createdAt/updatedAt`을 포함한다. pagination은 `currentPage/pageSize/totalItems/totalPages/hasNextPage/hasPrevPage`다.

생성 시 `title`, `targetPath`는 필수이고, `slug`는 생략하면 생성한다. `description`, `imageUrl` 기본값은 빈 문자열, `isActive` 기본값은 `true`다. 길이는 slug 80/title 100/description 500/targetPath 500/imageUrl 2048자이며 null은 거부한다. 중복 slug는 409, 비활성·없는 공개 링크는 404, 잘못된 입력은 400이다. 공개 응답은 `Cache-Control: no-store`다.

targetPath는 실제 Pawpong 앱 루트 경로 및 안전한 하위 세그먼트만 허용한다. 외부 URL, 프로토콜 상대 URL, 역슬래시, 제어문자, 경로 순회, 다중 인코딩 우회, API·로그인 콜백·공유 링크 재귀 경로와 HTML 태그는 거부한다. 이미지 URL은 HTTPS만 허용한다. HTML/OG 렌더링은 프론트엔드 `/l/:slug`가 담당한다.

관리자 푸시 `targetUrl`은 앱 내부 경로, `/l/:slug`, 또는 `https://pawpong.kr|www.pawpong.kr|dev.pawpong.kr/l/:slug`를 허용한다. FCM payload는 `notification.title/body`와 `data.targetUrl`을 유지하며 APNs alert 헤더를 사용한다. 일반 `messaging/invalid-argument`는 payload 오류일 수도 있어 토큰 삭제 사유에서 제외했다. [Firebase 토큰 관리 문서](https://firebase.google.com/docs/cloud-messaging/manage-tokens)

로그아웃은 인증이 남아 있을 때 `DELETE /api/v2/notification/push-token`에 `{token}`을 보내야 한다. `/auth/logout`은 특정 기기 토큰을 알지 못하므로 계정 전체 기기의 토큰을 지우지 않는다. 토큰 이전 트랜잭션에는 MongoDB replica set이 필요하며 E2E도 MongoMemoryReplSet으로 검증했다.

실제 연결 설정의 읽기 확인(2026-09-24 KST): 로컬 개발 설정, 개발 서버 설정 사본, 운영 설정의 URI로 각각 MongoDB `hello`를 실행했다. 세 연결 모두 replica set과 세션을 지원하고 트랜잭션을 지원하는 wire version임을 확인했다. URI·호스트·replica set 이름·자격 값은 출력하거나 문서에 기록하지 않았고 DB 쓰기나 설정 변경은 하지 않았다. 배포 환경 변수와 로컬 설정 사본의 일치 여부까지 검증한 것은 아니다.

## 검증 증거

| 검사 | 결과 |
| --- | --- |
| `pnpm typecheck` | 통과 |
| `pnpm exec nest build` | 통과 |
| `pnpm exec jest --runInBand --silent --testPathPattern='(app-version\|notification.*(push\|device)\|admin-push)'` | 27 suites, 91 tests 통과 |
| 아래 5개 파일의 실제 Nest + Mongo E2E | 5 suites, 68 tests 통과 |
| DTO 누수/HTTP 경계/InjectModel 위치/새 성공 메시지의 변경 파일 스캔 | 통과 |
| `git diff --check` | 통과 |

E2E 실행은 `pnpm exec jest --config jest-e2e.json --runInBand --forceExit --silent --runTestsByPath`에 다음 파일을 전달했다.

- `src/api/service/deep-link/test/e2e/deep-link.e2e-spec.ts`: 생성→공개 조회, CRUD·페이지네이션·자동 slug, 인증/권한, XSS/리다이렉트 우회, 비활성/삭제 404, 동시 slug 충돌, OpenAPI 계약.
- `src/api/service/notification/test/e2e/push-integration.e2e-spec.ts`: 익명 재등록, 동일 계정/서로 다른 역할의 동시 등록, 계정 이전/늦은 로그아웃, 대상 역할/활성 상태/중복 제거, payload 목적지, 무효 토큰 정리, 권한·위험 URL 차단.
- `src/api/admin/app-version/test/e2e/app-version-policy.e2e-spec.ts`: 최소 미만 강제, 최소 이상~최신 미만 선택, 최신/상위 버전 업데이트 없음, 플랫폼 분리, 부분 수정 교차 검증, 빈/위험 스토어 URL 거부, 잘못된 기존 설정 방어, 비활성화·삭제 반영.
- `src/api/admin/app-version/test/e2e/app-version-admin.e2e-spec.ts`
- `src/api/service/app-version/test/e2e/app-version.e2e-spec.ts`

기존 `scripts/harness/lib.sh`는 service/admin 분리 전 경로와 제한된 도메인만 지원하므로 변경 파일에 동일한 경계 검사를 직접 적용했다. 기본 E2E의 FCM 어댑터는 대체했으며, SDK payload 단위 테스트도 실제 기기 수신의 증거는 아니다.

## 격리 통합 환경과 남은 범위

코디네이터의 원격 확인(2026-09-24 KST): 개발 API의 없는 slug가 도메인 메시지를 포함한 404를 반환하고, 개발 웹 `/l/:slug`도 사용할 수 없는 링크 안내 HTML과 404를 반환했다. 백엔드 담당자의 직접 원격 실행이나 배포 작업은 아니다.

Orca의 별도 Nest+Mongo 서버에서 관리자·입양자·공유 링크·플랫폼 버전 정책을 시드했다. 8086 API는 실제 FCM 발송을 차단하며 `pushSuccess=0`을 반환한다. Web/Admin/Android WebView용 로컬 origin을 테스트 서버에서만 허용했다. 관리자 계정·JWT·FCM 값은 저장소에 남기지 않고 비공개 `/tmp` fixture로 전달했다.

iOS Simulator의 8086 API 등록 요청은 서버 로그에서 `platform=ios`, `appVersion=1.0.0`, `isNewDevice=true`로 확인했다. 해당 격리 MongoDB에서도 이 요청 시간 이후 생성된 iOS 기기 한 건을 확인하고 RN 담당자에게 비공개 단일 기기 fixture로 전달했다. 이는 토큰 저장 증거이며 APNs 또는 기기 알림 수신 증거는 아니다.

실제 관리자 UI→Firebase 검증(2026-09-24 01:08:48 KST): 8091 격리 API는 허용된 Android Emulator 토큰 한 개, 격리 입양자 바인딩, 단 한 번의 발송 예산을 모두 확인한 뒤 제품 `NotificationFirebasePushAdapter`를 호출했다. 관리자 담당자는 개별 발송 버튼을 한 번 눌러 HTTP 200과 `recipients=1/notificationsCreated=1/pushTokensTargeted=1/pushSuccess=1/pushFailed=0/invalidTokens=0`을 관찰했다. 백엔드 담당자도 비공개 결과 파일의 `recipientCount=1`, `successCount=1`, `failures=[]`, `targetUrl=/l/mobile-integration-preview` 및 발송 예산 소비 기록을 직접 확인했다. 이는 실제 Firebase 접수 증거이며 기기 수신·탭 성공을 뜻하지 않는다.

RN 담당자는 위 발송 고유 제목의 Android OS 알림 트레이 도착을 직접 확인했고, 코디네이터가 `android-admin-fcm-tray.png` 증거 확보를 전달했다. RN은 홈에서 알림을 탭한 뒤 탐색 화면을 확인 중이라고 보고했다. 백엔드가 직접 관찰한 화면은 아니며, 최종 목적지와 앱 상태별 탭 동작의 증거는 RN 보고서 범위를 따른다. 이 격리 API는 공개 resolver 요청별 로그를 남기지 않으므로 해당 탭의 resolver 조회 시간·건수를 서버 로그에서 확인하지 못했다.

Android 로그인·로그아웃은 별도로 서버·DB에서 확인했다. 01:09:16 KST의 푸시 토큰 등록 완료 로그 한 건에 이어 01:13:40 KST 격리 DB 조회에서 허용 기기와 fixture 입양자의 소유권 일치 및 입양자 토큰 배열의 해당 토큰 한 개를 확인했다. RN이 실제 웹 로그아웃 버튼을 누른 뒤 01:13:56 KST 토큰 해제 완료 로그를 확인했고, 01:15:22 KST DB 조회에서 해당 입양자 토큰 배열의 토큰 수가 0이며 기기 레코드는 유지되고 `userId/userRole`이 모두 null임을 확인했다. 마지막 기기 변경 시각은 01:13:56.778 KST였다. 동시 이전과 늦은 로그아웃 방어는 앞선 E2E로 검증했다.

운영 DB·환경 변수·배포 설정과 `main`은 변경하지 않았다. 실제 출시 스토어 URL과 앱스토어 업데이트 설치, iOS 실제 기기/APNs 수신은 이 백엔드 작업에서 검증하지 않았다. 8086/8091 격리 테스트 서버는 RN의 후속 확인을 위해 유지하고 코디네이터에게 정리 소유권을 인계했다.
