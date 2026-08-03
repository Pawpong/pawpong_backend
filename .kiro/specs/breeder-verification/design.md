# Design — breeder-verification 도메인 (관리자)

## Overview

브리더 인증 심사 도메인. 관리자가 브리더 가입 신청과 제출 서류를 검토해 승인·거절하고,
레벨(new/elite) 변경 신청을 처리한다. 승인됐지만 서류를 오래 내지 않은 브리더에게 독촉 메일도 보낸다.

위치: `src/api/admin/breeder/verification/` (breeder 관리자 트리의 슬라이스).
라우트 prefix: `breeder-verification-admin`.
상태: 구현 완료(dev). **실측 기준 2026-08-03** (소스 대조).

## Architecture

헥사고날: `controller → use-case → policy → port → adapter → repository`.

```
verification/application/use-cases/  get-breeders, get-pending-breeder-verifications,
                                     get-breeder-detail, get-breeder-stats,
                                     update-breeder-verification, change-breeder-level,
                                     get-level-change-requests, send-document-reminders
verification/application/ports/      reader, writer, notifier
verification/domain/services/        policy(권한·표시명·액션 해석), activity-log-factory, result-mapper
```

승인·거절 통보는 도메인 간 직접 주입 대신 **Notifier Port**(`sendApproval` / `sendRejection` /
`sendDocumentReminder`)를 통해 나간다.

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/breeder-verification-admin/breeders` | 브리더 목록 조회 (통합 검색) |
| GET | `/api/breeder-verification-admin/stats` | 승인된 브리더 통계 조회 |
| GET | `/api/breeder-verification-admin/verification/pending` | 승인 대기 브리더 목록 조회 |
| GET | `/api/breeder-verification-admin/verification/level-change-requests` | 레벨 변경 신청 목록 조회 |
| GET | `/api/breeder-verification-admin/verification/{breederId}` | 브리더 상세 정보 조회 |
| PATCH | `/api/breeder-verification-admin/verification/{breederId}` | 브리더 인증 승인/거절 |
| PATCH | `/api/breeder-verification-admin/level/{breederId}` | 브리더 레벨 변경 |
| POST | `/api/breeder-verification-admin/document-reminders/send` | 서류 미제출 브리더 독촉 메일 발송 |

## Data Models

`breeders.verification` 임베딩.

| 필드 | 용도 |
|---|---|
| `status` | `pending` / `reviewing` / `approved` / `rejected` |
| `reviewedAt` | 심사 시각 (독촉 대상 판정에 쓰임) |
| `rejectionReason` | 거절 사유 (거절 시) |
| `documents[]` | 제출 서류 파일키 |
| `levelChangeRequest` | 레벨 변경 신청 (previousLevel, requestedLevel, requestedAt) |
| `levelChangeHistory[]` | 승인된 레벨 변경 이력 (approvedAt, approvedBy) |

서류 파일키는 upload 고아 판정 화이트리스트에 `breeders.verification.documents` 로 등록돼 있다.

## Correctness Properties

### Property 1: 승인된 브리더만 공개 노출된다
공개 조회 레포지토리가 `'verification.status': 'approved'` 로 필터한다
(`service/breeder/repository/breeder-public.repository.ts`).

### Property 2: 심사 처리는 관리자 활동 로그에 남는다
`appendAdminActivityLog` 로 승인/거절 액션이 기록된다.
레벨 변경 승인이면 `levelChangeHistory` 에 `previousLevel → newLevel`, `approvedAt`, `approvedBy` 가 추가되고
`levelChangeRequest` 는 정리된다.

### Property 3: 독촉 대상은 세 조건을 모두 만족한 브리더다
`findApprovedBreedersMissingDocuments` 의 실제 쿼리 조건이다.

1. `verification.status === 'approved'` — **승인된 브리더만** (대기·거절 대상 아님)
2. `verification.reviewedAt <= 오늘 - 28일` — 심사 후 28일 경과
3. `verification.documents` 가 없거나 빈 배열

즉 "승인은 됐는데 28일 넘게 서류를 안 낸 사람" 이 대상이다.

### Property 4: 발송 실패가 나머지 대상을 막지 않는다
루프 안에서 개별 try/catch 로 처리해, 한 명 실패가 전체 발송을 중단시키지 않는다.
성공한 건만 `sentCount` 와 `breederIds` 에 집계된다.

### Property 5: 브리더 관리 권한이 필요하다
모든 유스케이스가 `assertCanManageBreeders(admin)` 로 시작한다.

## Error Handling

- 없는 브리더: 조회 단계에서 거부된다.
- 권한 없는 관리자: `assertCanManageBreeders` 가 거부한다.
- **이미 처리된 심사의 재처리를 막는 가드는 없다.** `status` 를 그대로 덮어쓰므로
  승인 → 거절, 거절 → 승인 재심사가 가능하다. 이것이 현재 동작이며 의도 여부는 미확인이다.
- 응답 봉투·상태 코드는 [`_conventions.md`](../_conventions.md) 를 따른다.

## Testing Strategy

- e2e: 승인 대기 목록 → 상세 → 승인/거절 왕복, 권한 없는 접근 차단
- 독촉 대상 필터링은 세 조건(승인·28일·서류없음)을 각각 어긋나게 한 픽스처로 검증한다
- 레벨 변경 승인 시 `levelChangeHistory` 가 쌓이고 `levelChangeRequest` 가 정리되는지
