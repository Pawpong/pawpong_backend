# Design — alimtalk 도메인 (관리자)

## Overview

카카오 알림톡 템플릿 관리 도메인. 브리더 승인/반려, 상담 신청, 리마인드 등
주요 이벤트 알림에 쓰이는 템플릿 **메타데이터**를 관리자가 CRUD 하고 캐시를 갱신한다.

발송 자체는 `AlimtalkService` 가 담당하며 각 도메인이 이벤트 시점에 호출한다.

위치: `src/common/alimtalk/` (인프라) + `src/common/alimtalk/admin/` (관리 API).
`src/api/` 두 트리 밖에 있는데, 발송이 여러 도메인에서 공유되는 cross-cutting 인프라이기 때문이다.

라우트 prefix: `alimtalk-admin`.
상태: 구현 완료(dev). **실측 기준 2026-08-03** (소스·기동 로그 대조).

## Architecture

```
common/alimtalk/
├── alimtalk.service.ts      발송 + 템플릿 캐시 (각 도메인이 주입해 사용)
├── alimtalk.token.ts        주입 토큰
├── repository/              템플릿 persistence
└── admin/
    ├── alimtalk-admin.controller.ts
    ├── alimtalk-admin.service.ts
    ├── application/         템플릿 CRUD 유스케이스
    └── constants/           템플릿 코드 상수
```

`AlimtalkService` 가 인메모리 템플릿 캐시(`templateCache`)를 들고 있어 발송마다 DB 를 치지 않는다.
앱 기동 시 캐시를 채우며(기동 로그: `템플릿 캐시 갱신 완료: N개`),
관리자가 템플릿을 수정한 뒤 즉시 반영하려면 `refresh-cache` 를 호출한다.

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
| `templateId` | 카카오 측 템플릿 ID |
| `name` | 템플릿 이름 |
| `description?` | 설명 |
| `requiredVariables[]` | 치환 변수명 목록 |
| `fallbackToSms` | 알림톡 실패 시 SMS 대체 발송 여부 (기본 true) |
| `isActive` | 활성 여부 (기본 true) |
| `reviewStatus` | `pending` / `approved` / `rejected` / `re_review` — 카카오 심사 상태 |
| `memo?` | 관리 메모 |
| `buttons[]` | 버튼 (buttonType, buttonName, linkMo/Pc/And/Ios) |

**본문 텍스트는 이 스키마에 없다.** 실제 문구는 카카오 측에 등록된 `templateId` 가 갖고 있고,
여기서는 그 참조와 발송에 필요한 메타데이터만 관리한다.

`AlimtalkTemplateCode` enum 이 코드에서 쓰는 상수를 소유한다.

## Correctness Properties

### Property 1: 발송 실패가 호출 도메인의 흐름을 막지 않는다
`AlimtalkService` 는 실패 시 throw 하지 않고 `{ success: false, error }` 를 반환한다.
초기화 실패·채널 ID 미설정도 같은 형태로 돌려준다.
브리더 승인 같은 주 흐름이 알림 실패로 롤백되지 않는다.

### Property 2: 카카오 승인 코드와 로컬 템플릿이 어긋나면 발송이 실패한다
`templateCode` 는 카카오 측 승인 값과 대응해야 한다. 임의 생성 금지.
`reviewStatus` 로 카카오 심사 상태를 추적한다.

### Property 3: 캐시 갱신은 멱등하다
`refresh-cache` 를 여러 번 호출해도 결과가 같다.
템플릿 수정 후 갱신하지 않으면 **캐시에 남은 옛 메타데이터로 발송**된다.

### Property 4: 사용 중인 코드는 삭제보다 비활성화를 쓴다
삭제된 `templateCode` 로 발송을 시도하면 캐시 미스 후 조회 실패로 이어진다.
`isActive: false` 로 두면 레코드는 남는다.

## Error Handling

- 없는 `templateCode`: 400.
- 중복 `templateCode` 생성: unique 인덱스 위반.
- 발송 실패는 예외가 아니라 결과 객체로 표현된다(Property 1).
- 응답 봉투·상태 코드는 [`_conventions.md`](../_conventions.md) 를 따른다.

## Testing Strategy

- e2e: 템플릿 CRUD 왕복, 중복 코드 거부, 캐시 갱신
- 발송은 외부 연동이므로 e2e 에서 실호출하지 않는다.
  테스트 환경은 CoolSMS 키가 비어 있어 `{ success: false }` 로 떨어진다 —
  이 경로가 호출 도메인을 막지 않는지 확인하는 데 쓸 수 있다.
