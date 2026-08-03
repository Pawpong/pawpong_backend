# Conventions — 전 도메인 공통 계약

각 도메인 `design.md` 가 반복해서 적지 않도록 여기에 한 번만 정의한다.
**실측 기준: 2026-08-03, `https://dev-api.pawpong.kr/docs-json` 및 리포지토리 소스.**

---

## 1. 디렉토리 구조 (2026-07-26 이후)

`src/api/` 최상위가 **service / admin 미러 구조**로 분리돼 있다.
도메인별 폴더 안에 `admin/` 을 중첩하던 이전 방식은 더 이상 쓰지 않는다.

```
src/api/
├── service/<domain>/     사용자·공개 API
└── admin/<domain>/       관리자 API
```

- 관리자 기능이 없는 도메인은 `service/` 에만 존재한다.
  (`adoption-application`, `adoption`, `breeder-pet-posting`, `chat`, `feed`,
  `filter-options`, `health`, `inquiry`, `profile`, `terms`)
- 관리자 전용 도메인은 `admin/` 에만 존재한다. (`user`, `platform`)
- 두 트리는 도메인 이름을 그대로 미러링한다.

**두 트리 밖에 있는 것** (실측 2026-08-03):

| 도메인 | 실제 위치 | 이유 |
|---|---|---|
| `alimtalk` | `src/common/alimtalk/` (+ `admin/`) | 발송 기능을 여러 도메인이 공유하는 인프라 |
| `notification-email-preview` | `src/api/service/notification/` | notification 도메인의 관리자 슬라이스 |
| `breeder-verification` | `src/api/admin/breeder/verification/` | breeder 관리자 트리의 슬라이스 |
| `breeder-report` | `src/api/admin/breeder/report/` | 〃 |

라우트 prefix 는 독립돼 있으나(`alimtalk-admin` 등) 물리 위치는 위와 같다.
`standard-question` 은 `service/` 와 `admin/` 양쪽에 있다.

각 도메인 내부 계층은 동일하다.

```
<domain>/
├── controller/            얇은 컨트롤러 (라우팅·바인딩·유스케이스 호출만)
├── application/
│   ├── use-cases/         요청 하나를 처리하는 진입점
│   ├── ports/             외부 의존성 경계 (Symbol 토큰)
│   └── types/             command·result·snapshot 내부 타입
├── domain/services/       정책·검증·응답 조립
├── repository/            Mongoose 접근 캡슐화 (InjectModel 은 여기에만)
├── infrastructure/        port 구현 adapter (mongoose·redis·storage·외부 API)
├── dto/{request,response} HTTP 경계 전용 DTO
├── decorator/             컨트롤러 공통 Guard·prefix·Swagger tag
├── swagger/               긴 API 명세 분리
└── test/                  unit · e2e
```

규모가 큰 도메인은 기능축 **버티컬 슬라이스**로 다시 나눈다
(예: `breeder-management/{account,pets,profile,reviews,shared}`,
`ai-image/{shared,filters,generation,admin}`).
슬라이스마다 `<slice>.module.ts` + `<slice>.module-definition.ts` 가 DI 를 소유하고,
공통 Port·Repository 는 `shared` 슬라이스가 소유해 재노출한다.

---

## 2. 라우트 규칙

| 종류 | prefix | 예 |
|---|---|---|
| 사용자·공개 | `/api/v2/<domain>` | `/api/v2/community/posts` |
| 관리자 | `/api/<domain>-admin` (**v2 없음**) | `/api/community-report-admin` |

- 전역 prefix 는 `api`.
- 관리자 라우트에 `v2` 를 붙이지 않는 것은 기존 계약이며, 바꾸지 않는다.
- 경로 파라미터가 ObjectId 면 `MongoObjectIdPipe` 로 검증한다.

---

## 3. 응답 봉투 (필수)

모든 JSON 응답은 `ApiResponseDto` 봉투를 쓴다. 컨트롤러가 `ApiResponseDto.success(data, message)` 로 감싼다.

```jsonc
{
  "success": true,
  "code": 200,
  "data": { },            // 실제 페이로드
  "message": "조회 성공",
  "timestamp": "2026-08-03T00:00:00.000Z"
}
```

페이지네이션은 `data` 안에 `{ items, pagination }` 으로 넣는다.

```jsonc
"data": {
  "items": [],
  "pagination": {
    "currentPage": 1, "pageSize": 20, "totalItems": 0,
    "totalPages": 0, "hasNextPage": false, "hasPrevPage": false
  }
}
```

### 봉투를 쓰지 않는 응답 — 실측 현황 (2026-08-03)

두 종류가 있다. **의도된 예외**와 **아직 정리 안 된 이탈**을 구분해야 한다.

#### 의도된 예외 (봉투를 씌우면 안 됨)

| 엔드포인트 | 반환 | 이유 |
|---|---|---|
| `GET /api/v2/feed/videos/stream/{videoId}/{filename}` | HLS manifest·segment | 바이너리. 감싸면 재생이 깨진다 |
| `GET /api/notification-email-preview-admin/render` | `text/html` 문자열 | 브라우저로 직접 여는 미리보기 |
| `GET /api/auth/{google,kakao,naver}` 및 `/callback` | 소셜 로그인 리다이렉트 | OAuth 플로우 |

#### 아직 봉투를 쓰지 않는 도메인 (정리 대상)

| 도메인 | 상태 |
|---|---|
| `announcement` (service·admin) | raw `{items, pagination}` 반환 — 실측 확인 |
| `chat` | raw 반환 — 실측 확인 |

프론트가 다른 도메인처럼 `unwrap()` 을 쓰면 이 둘은 **런타임에 실패한다.**
feed 가 정확히 같은 이유로 깨져 있었으므로(아래), 이 두 도메인도 같은 사고가 날 수 있다.
**신규 엔드포인트는 반드시 봉투를 쓴다.** 위 목록은 늘어나면 안 된다.

> feed 는 2026-08-02 까지 21개 엔드포인트 전부가 raw 를 반환했고,
> 프론트가 `unwrap()` 을 쓰다 댓글·태그 조회가 실패했다.
> `FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES` 에 전 엔드포인트 메시지가 이미 정의돼 있었고
> 컨트롤러 배선만 빠져 있던 상태라, 봉투로 통일해 해소했다(`128cc572`).

---

## 4. 성공 상태 코드는 항상 200

- `HttpStatusInterceptor` 가 POST 201 → 200, PUT/PATCH 204 → 200 으로 정규화한다.
- **모든 `@Post` 핸들러에 `@HttpCode(HttpStatus.OK)` 를 붙인다.**
  붙이지 않으면 `@nestjs/swagger` CLI 플러그인이 **빌드 시점에** 문서에 201 을 추가해,
  실제로 발생하지 않는 코드를 `/docs` 가 광고하게 된다.
  jest 는 플러그인을 거치지 않아 이 불일치를 로컬 테스트로 잡을 수 없다(`1159384f`).
- Swagger 는 `successStatus` 를 지정하지 않는다(기본 200).

회귀 방지: `src/common/test/e2e/swagger-status-code-contract.e2e-spec.ts` 가
① 문서에 200 이외 2xx 가 없는지 ② 파라미터 없는 GET 의 실응답과 문서가 일치하는지
③ 모든 `@Post` 에 `@HttpCode` 200 이 있는지 ④ 공개 POST 가 실제로 200 인지를 검사한다.

---

## 5. 에러 처리

- **404 사용 최소화.** 데이터가 없으면 `BadRequestException`(400) 을 우선한다.
- 메시지는 한국어로, 사용자가 다음 행동을 알 수 있게 쓴다.
- `HttpExceptionFilter` / `AllExceptionsFilter` 가 아래 형태로 통일한다.

```jsonc
{ "success": false, "code": 400, "error": "사용자 정보가 올바르지 않습니다.", "timestamp": "..." }
```

---

## 6. Swagger 작성

- 긴 명세는 컨트롤러가 아니라 도메인 `swagger/index.ts` 에 `ApiXxxEndpoint()` 로 분리한다.
- 봉투를 표기하는 `ApiEndpoint` / `ApiPaginatedEndpoint` 를 쓴다.
  `ApiRawEndpoint` 는 **봉투를 쓰지 않는 응답 전용**이며 현재 HLS 스트림 1건뿐이다.
- `successMessageExample` 은 컨트롤러가 실제로 넣는 메시지 상수와 같은 값을 쓴다.

회귀 방지: `src/api/service/feed/test/e2e/feed-swagger-contract.e2e-spec.ts` 가
생성된 OpenAPI 스키마와 실응답의 키 집합·`message`·`code` 를 직접 대조한다.

---

## 7. 경계 규칙

- `InjectModel` 은 `repository/` 에만 둔다. adapter 는 repository 를 주입받아 Port 를 구현한다.

  **실측(2026-08-03): 69개 중 59개만 지켜지고 있다.** 아래 10개는 adapter 가 직접
  `InjectModel` 을 쓴다 — 목표 규약이지 현재 상태가 아니다.

  | 도메인 | 위반 파일 수 |
  |---|---|
  | `service/adoption` | 4 |
  | `service/community` | 2 |
  | `service/breeder-pet-posting` | 2 |
  | `service/contest` | 1 |
  | `service/chat` | 1 |

  신규 코드는 규약을 따르고, 위 목록은 늘리지 않는다.
- request DTO 를 `application/`·`domain/`·`repository/` 로 넘기지 않는다. 내부 command 타입으로 변환한다.
- Port 바인딩은 항상 `useExisting`.
- 도메인 간 직접 서비스 주입 금지. `EventEmitter2` 또는 Port 를 쓴다.
- NestJS DI: 다른 모듈에서 온 토큰은 재노출할 수 없다. **모듈 자체**를 `exports` 한다.
  Mongoose 모델을 공유하려면 `MongooseModule` 을 재노출한다.

---

## 8. 파일 참조 판정 (고아 파일 삭제 방지)

`upload-admin` 의 미참조 파일 판정은 **컬렉션 화이트리스트** 방식이다.
목록에 없는 키는 `isReferenced:false` 로 분류돼 관리자 화면에서 삭제 가능으로 노출된다.

**새 도메인이 S3 파일키를 저장하면 반드시 아래 3곳을 함께 수정한다.**

1. `admin/upload/repository/upload-admin-file-reference.repository.ts` — 모델 주입 + count/read 메서드
2. `admin/upload/upload-admin.module-definition.ts` — `MongooseModule.forFeature` 에 스키마 추가
3. `admin/upload/infrastructure/upload-admin-file-reference-reader.adapter.ts` —
   `findReferences` 와 `readAllReferencedFiles` **양쪽**

> 실제로 `contest_entries.photoFileName` 이 누락돼 콘테스트 출품 사진이 고아로
> 오분류되고 있었다(`6efe3eff`). feed video 키(`videos/*`)는 **아직 미등록 상태**다.

---

## 9. 테스트

- 단위: `<domain>/test/**`, e2e: `<domain>/test/e2e/*.e2e-spec.ts`
- e2e 는 MongoDB Memory Server 를 쓴다. `createTestingApp(overrides)` 로 Port 대역 주입.
- `PAWPONG_TEST_MODE=true` 면 스토리지가 인메모리로 동작한다.
- 검증 순서: `pnpm typecheck` → 단위 → e2e → 필요 시 실서버 스팟체크.

**주의**: e2e 를 다른 무거운 작업과 동시에 돌리면 `beforeAll` 의 MongoMemoryServer 기동이
30초 타임아웃에 걸려 대량 실패한다. 실패 사유가 전부
`Exceeded timeout of 30000 ms for a hook` 이면 코드가 아니라 자원 문제다.

---

## 10. 커밋 전 자동 포맷

husky + lint-staged 가 스테이징된 `src/**/*.ts` 에 `prettier --write` 를 건다.
`pnpm install` 시 `prepare` 스크립트로 훅이 설치된다.
