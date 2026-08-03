# Design — alimtalk 도메인 (관리자)

## Overview

카카오 알림톡 템플릿 관리 도메인. 브리더 승인/반려, 상담 신청, 리마인드 등
주요 이벤트 알림에 쓰이는 템플릿 **메타데이터**를 관리자가 CRUD 하고 캐시를 갱신한다.

발송은 `AlimtalkService` 가 담당하며 각 도메인이 이벤트 시점에 호출한다.
본문 문구는 카카오 측이 갖고 있고, 여기서는 그 참조(`templateId`)와 발송 조건만 관리한다.

위치: `src/common/alimtalk/` (인프라) + `src/common/alimtalk/admin/` (관리 API).
`src/api/` 두 트리 밖에 있는데, 발송이 여러 도메인에서 공유되는 cross-cutting 인프라이기 때문이다.

라우트 prefix: `alimtalk-admin`.
상태: 구현 완료(dev). **실측 기준 2026-08-03** (소스 대조).

## Architecture

```
common/alimtalk/
├── alimtalk.service.ts      발송 + 인메모리 템플릿 캐시
├── alimtalk.token.ts        주입 토큰
├── repository/              템플릿 persistence
└── admin/
    ├── alimtalk-admin.controller.ts
    ├── alimtalk-admin.service.ts   템플릿 CRUD (모델 직접 주입)
    ├── application/
    └── constants/
```

### 캐시 동작 (실측)

- `onModuleInit` 에서 `refreshTemplateCache()` 로 **활성 템플릿 전체**(`findAllActive`)를 적재한다.
  기동 로그: `[refreshTemplateCache] 템플릿 캐시 갱신 완료: N개`
- `getTemplateByCode` 는 **캐시 우선, 미스 시 DB 폴백**(`findActiveByCode`)이고
  폴백으로 찾으면 캐시에 채워 넣는다. 즉 캐시 미스 자체는 실패가 아니다.
- 캐시는 갱신 시 `clear()` 후 재적재하므로 `refresh-cache` 호출은 멱등하다.
- **캐시에 이미 올라온 항목은 만료되지 않는다.** 템플릿을 수정한 뒤 `refresh-cache` 를
  호출하지 않으면 옛 메타데이터로 계속 발송된다.

> `alimtalk-admin.service.ts` 는 adapter 가 아닌 service 에서 모델을 직접 주입한다.
> [`_conventions.md` §7](../_conventions.md) 의 `InjectModel` 규약 이탈 목록에 포함된 지점이다.

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/alimtalk-admin/templates` | 알림톡 템플릿 목록 조회 |
| POST | `/api/alimtalk-admin/templates` | 알림톡 템플릿 생성 |
| POST | `/api/alimtalk-admin/templates/refresh-cache` | 알림톡 템플릿 캐시 갱신 |
| GET | `/api/alimtalk-admin/templates/{templateCode}` | 알림톡 템플릿 상세 조회 |
| PATCH | `/api/alimtalk-admin/templates/{templateCode}` | 알림톡 템플릿 수정 |
| DELETE | `/api/alimtalk-admin/templates/{templateCode}` | 알림톡 템플릿 삭제 |

**식별자가 ObjectId 가 아니라 `templateCode` 문자열**이라 `MongoObjectIdPipe` 를 쓰지 않는다.

## Data Models

`alimtalk_templates` 컬렉션 (`AlimtalkTemplate`).

| 필드 | 용도 |
|---|---|
| `templateCode` | **unique**. 경로 식별자이자 코드에서 참조하는 키 |
| `templateId` | 카카오 측 템플릿 ID (실제 발송에 쓰이는 값) |
| `name` | 템플릿 이름 |
| `description?` | 설명 |
| `requiredVariables[]` | 치환 변수명 목록 |
| `fallbackToSms` | 알림톡 실패 시 SMS 대체 발송 여부 (기본 true) |
| `isActive` | 활성 여부 (기본 true) |
| `reviewStatus` | `pending` / `approved` / `rejected` / `re_review` — 카카오 심사 상태 |
| `memo?` | 관리 메모 |
| `buttons[]` | 버튼 (buttonType, buttonName, linkMo/Pc/And/Ios) |

**본문 텍스트 필드는 없다.** 문구는 카카오에 등록된 `templateId` 가 보유한다.

## Correctness Properties

### Property 1: 발송에는 두 관문이 있다 — `isActive` 와 `reviewStatus`

`sendByTemplate(to, templateCode, variables)` 는 순서대로 걸러진다.

1. `findActiveByCode` / `findAllActive` 가 **`isActive: true` 만** 조회한다.
   비활성 템플릿은 조회 자체가 안 돼 `템플릿을 찾을 수 없습니다` 로 끝난다.
2. 찾아도 **`reviewStatus !== 'approved'` 면 발송을 스킵**한다.
   `템플릿이 검수 중입니다: <status>` 를 반환하며, 이때 알림톡은 나가지 않고
   **이메일 등 다른 경로만 동작한다.**

즉 카카오 심사를 통과하지 않은 템플릿은 DB 에 있어도 실제로 발송되지 않는다.

### Property 2: 비활성화와 삭제는 발송 차단 효과가 같다

`isActive: false` 로 두면 레코드는 남지만 조회에서 빠져 **발송은 삭제와 똑같이 막힌다.**
`deleteTemplate` 은 소프트 삭제가 아니라 `deleteOne` **하드 삭제**다.
따라서 비활성화의 이점은 "발송이 계속된다" 가 아니라 **이력·설정이 보존된다** 는 것뿐이다.

### Property 3: 발송 실패가 호출 도메인의 흐름을 막지 않는다

`AlimtalkService` 는 실패 시 throw 하지 않고 `{ success: false, error }` 를 반환한다.
CoolSMS 미초기화·채널 ID 미설정·템플릿 없음·검수 미통과 모두 같은 형태다.
브리더 승인 같은 주 흐름이 알림 실패로 롤백되지 않는다.

### Property 4: 알림톡 실패 시 SMS 로 대체된다 (기본값)

`send()` 가 `disableSms: !fallbackToSms` 로 CoolSMS 에 넘긴다.
템플릿의 `fallbackToSms` 가 true(기본)면 알림톡이 실패해도 SMS 로 전달된다.
Property 1 의 두 관문에 걸리면 `send()` 자체를 호출하지 않으므로 **SMS 대체도 일어나지 않는다.**

## Error Handling

관리 API 는 `DomainError` 계층을 쓴다. `AllExceptionsFilter` 가 각 에러가 선언한
`statusCode` 를 그대로 응답에 싣는다.

| 상황 | 에러 | HTTP |
|---|---|---|
| 없는 `templateCode` 조회·수정·삭제 | `DomainNotFoundError` | **404** |
| 이미 존재하는 `templateCode` 생성 | `DomainConflictError` | **409** |

중복은 unique 인덱스에 맡기지 않고 **생성 전에 조회해 검사**한다.

> 이 도메인은 [`_conventions.md` §5](../_conventions.md) 의
> "404 사용 최소화, 400 우선" 방침에서 벗어나 404·409 를 쓴다.
> 현재 동작이며, 통일 여부는 결정된 바 없다.

발송 실패는 예외가 아니라 결과 객체로 표현된다(Property 3).

## Testing Strategy

- e2e: 템플릿 CRUD 왕복, 없는 코드 404, 중복 코드 409, 캐시 갱신
- **Property 1 의 두 관문을 각각 검증한다** — `isActive: false` 인 경우와
  `reviewStatus: 'pending'` 인 경우가 서로 다른 메시지로 실패하는지
- 발송은 외부 연동이라 e2e 에서 실호출하지 않는다.
  테스트 환경은 CoolSMS 키가 비어 있어 `{ success: false }` 로 떨어지므로,
  이 경로가 호출 도메인을 막지 않는지 확인하는 데 쓸 수 있다.
