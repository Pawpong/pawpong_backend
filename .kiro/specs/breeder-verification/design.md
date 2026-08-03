# Design — breeder-verification 도메인 (관리자)

## Overview

브리더 인증 심사 도메인. 관리자가 브리더 가입 신청과 제출 서류를 검토해
승인·거절하고, 레벨(new/elite) 변경 신청을 처리한다. 서류 미제출 브리더에게 독촉 메일도 발송한다.

위치: `src/api/admin/breeder/verification/` (breeder 관리자 트리의 슬라이스).
라우트 prefix: `breeder-verification-admin`.
상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`.
브리더 문서를 공유하므로 repository·Port 는 breeder 관리자 트리의 공용 레이어를 쓴다.

```
verification/application/use-cases/  get-breeders, get-pending-breeder-verifications,
                                     get-breeder-detail, get-breeder-stats,
                                     update-breeder-verification, change-breeder-level,
                                     get-level-change-requests, send-document-reminders
verification/controller/ · decorator/ · swagger/
```

승인·거절 결과 통보는 도메인 간 직접 주입 대신 알림 경로(이메일·알림톡)를 통해 나간다.

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

`breeders.verification` 임베딩 — `status`(pending/reviewing/approved/rejected),
`documents[]`(제출 서류 파일키), 심사 메모·처리 시각.
`breeders.level` — `new | elite`, 레벨 변경 신청 상태 포함.

서류 파일키는 upload 고아 판정 화이트리스트에 `breeders.verification.documents` 로 등록돼 있다.

## Correctness Properties

### Property 1: 승인 상태만 공개 노출로 이어진다
공개 조회 repository 가 `'verification.status': 'approved'` 로 필터한다
(`service/breeder/repository/breeder-public.repository.ts`).
심사 전·거절 브리더는 공개 검색·상세에 나타나지 않는다.

### Property 2: 심사 요청이 있어야 처리할 수 있다
`assertVerificationRequestExists` 가 `breeder.verification` 없으면
`No verification request found` 로 거부한다.
**이미 처리된 심사를 다시 처리하는 것을 막는 가드는 없다** — 재심사가 가능한 현재 구조다.

### Property 3: 독촉 메일 대상은 세 조건을 모두 만족한다
`findApprovedBreedersMissingDocuments(reviewedBefore)` 기준:
**승인된(approved)** 브리더 중 **서류가 비어 있고**, 심사 시점이 **28일 이전**인 경우만.
심사 대기·거절 브리더에게는 나가지 않는다.

### Property 4: 관리자 활동이 로그로 남는다
`BreederVerificationAdminActivityLogFactoryService` 가 승인·거절·레벨변경·독촉을 기록한다.

## Error Handling

- 권한 없는 관리자: `assertCanManageBreeders` 로 거부 (`브리더 관리 권한이 없습니다.`).
- 없는 브리더: `assertBreederExists` 로 거부.
- 심사 요청 없음: `No verification request found`.
- 응답 봉투·상태 코드는 [`_conventions.md`](../_conventions.md) 를 따른다.

## Testing Strategy

- e2e: 승인 대기 목록 → 상세 → 승인/거절 왕복, 권한 없는 접근 401/403
- 단위: 레벨 변경 정책, 독촉 대상 필터링
