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
`approved` 가 아닌 브리더는 공개 검색·상세에 나타나지 않는다.

### Property 2: 심사 결과는 되돌릴 수 있어야 한다
승인/거절은 최종 상태가 아니라 재심사가 가능한 전이로 다룬다. 이력이 남는다.

### Property 3: 독촉 메일은 미제출자에게만 나간다
서류를 이미 제출한 브리더는 발송 대상에서 제외된다.

## Error Handling

- 없는 브리더: `BadRequestException`(400).
- 이미 처리된 심사에 중복 처리 요청: 400 으로 거부하고 현재 상태를 메시지에 포함한다.
- 응답 봉투·상태 코드는 [`_conventions.md`](../_conventions.md) 를 따른다.

## Testing Strategy

- e2e: 승인 대기 목록 → 상세 → 승인/거절 왕복, 권한 없는 접근 401/403
- 단위: 레벨 변경 정책, 독촉 대상 필터링
