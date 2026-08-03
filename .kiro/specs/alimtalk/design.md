# Design — alimtalk 도메인 (관리자)

## Overview

카카오 알림톡 템플릿 관리 도메인. 브리더 승인/반려, 상담 신청, 리마인드 등
주요 이벤트 알림에 쓰이는 템플릿을 관리자가 CRUD 하고 캐시를 갱신한다.

발송 자체는 `AlimtalkService` 가 담당하며 각 도메인이 이벤트 시점에 호출한다.
여기서 관리하는 것은 **템플릿 정의**다.

위치: `src/common/alimtalk/` (인프라) + `src/common/alimtalk/admin/` (관리 API).
다른 도메인과 달리 `src/api/` 가 아니라 `common/` 에 있는데,
발송 기능이 여러 도메인에서 공유되는 cross-cutting 인프라이기 때문이다.

라우트 prefix: `alimtalk-admin`.
상태: 구현 완료(dev).

## Architecture

```
common/alimtalk/
├── alimtalk.service.ts      발송 (각 도메인이 주입해 사용)
├── alimtalk.token.ts        주입 토큰
├── repository/              템플릿 persistence
└── admin/
    ├── alimtalk-admin.controller.ts
    ├── alimtalk-admin.service.ts
    ├── application/         템플릿 CRUD 유스케이스
    └── constants/           템플릿 코드 상수
```

템플릿은 조회 빈도가 높고 변경이 드물어 캐시를 둔다.
수정 후 즉시 반영이 필요하면 `refresh-cache` 를 호출한다.

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/alimtalk-admin/templates` | 알림톡 템플릿 목록 조회 |
| POST | `/api/alimtalk-admin/templates` | 알림톡 템플릿 생성 |
| POST | `/api/alimtalk-admin/templates/refresh-cache` | 알림톡 템플릿 캐시 갱신 |
| GET | `/api/alimtalk-admin/templates/{templateCode}` | 알림톡 템플릿 상세 조회 |
| PATCH | `/api/alimtalk-admin/templates/{templateCode}` | 알림톡 템플릿 수정 |
| DELETE | `/api/alimtalk-admin/templates/{templateCode}` | 알림톡 템플릿 삭제 |

## Data Models

`alimtalk-template` 스키마 — `templateCode`(카카오 승인 코드, 식별자), 제목·본문,
치환 변수 목록, 활성 여부.

`AlimtalkTemplateCode` enum 이 코드 상수를 소유한다.
**식별자가 ObjectId 가 아니라 `templateCode` 문자열**이라는 점이 다른 도메인과 다르다.

## Correctness Properties

### Property 1: 카카오 승인 코드와 로컬 템플릿이 어긋나면 발송이 실패한다
`templateCode` 는 카카오 측 승인 값과 일치해야 한다. 임의 생성 금지.

### Property 2: 템플릿 삭제가 진행 중 발송을 깨뜨리지 않는다
발송 시점에 템플릿을 조회하므로, 삭제된 코드로 발송을 시도하면 실패한다.
사용 중인 코드는 비활성화를 우선한다.

### Property 3: 캐시 갱신은 멱등하다
`refresh-cache` 를 여러 번 호출해도 결과가 같다.

## Error Handling

- 없는 `templateCode`: `BadRequestException`(400).
- 중복 코드 생성: 400.
- 발송 실패는 호출 도메인의 흐름을 막지 않는다 — 로그·모니터링으로 남긴다.
- 응답 봉투·상태 코드는 [`_conventions.md`](../_conventions.md) 를 따른다.

## Testing Strategy

- e2e: 템플릿 CRUD 왕복, 중복 코드 거부, 캐시 갱신
- 발송은 외부 연동이므로 e2e 에서 실호출하지 않는다 (테스트 환경 키 비활성)
