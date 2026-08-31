# Design — breeder-report 도메인 (관리자)

## Overview

브리더 신고 처리 도메인. 입양자가 접수한 브리더 신고를 관리자가 목록으로 확인하고
`resolve`(인정) 또는 `reject`(기각)로 처리한다. 신고 접수(작성)는 `adopter` 도메인이 담당한다.

**`resolve` 는 신고 상태 변경에 그치지 않고 해당 브리더를 정지시킨다** — 아래 Property 2 참조.

위치: `src/api/admin/breeder/report/`.
라우트 prefix: `breeder-report-admin`.
상태: 구현 완료(dev). **실측 기준 2026-08-03** (소스 대조).

## Architecture

헥사고날: `controller → use-case → policy/mapper → port → adapter → repository`.

```
report/application/use-cases/  get-breeder-reports, handle-breeder-report
report/domain/services/        policy(권한·상태 해석), activity-log-factory, result-mapper
report/controller/ · decorator/ · swagger/
```

신고는 `breeders` 문서에 임베딩돼 있어 갱신 시 `breederId` 와 `reportId` 를 함께 넘긴다
(`updateReport(report.breederId, reportId, ...)`).

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/breeder-report-admin/reports` | 브리더 신고 목록 조회 |
| PATCH | `/api/breeder-report-admin/reports/{reportId}` | 브리더 신고 처리 |

처리 요청 본문: `action`(`resolve` \| `reject`), `adminNotes?`

## Data Models

`breeders` 문서에 임베딩된 신고 레코드.

| 필드 | 값 |
|---|---|
| `status` | `pending` → `resolved` \| `dismissed` |
| `adminNotes` | 관리자 메모 (선택) |
| `suspensionReason` | `resolve` 일 때만 기록 |
| `suspendedAt` | `resolve` 일 때만 기록 |

`ReportType` enum: `no_contract`, `false_info`, `inappropriate_content`, `other`.

> `ReportStatus` enum 에는 `reviewing` 이 있으나 **이 엔드포인트는 `reviewing` 으로 전이시키지 않는다.**
> `action` 이 `resolve|reject` 두 가지뿐이라 `resolved|dismissed` 로만 간다.

## Correctness Properties

### Property 1: pending 상태만 처리할 수 있다
`assertPendingReport` 가 게이트한다. 이미 처리된 신고를 다시 처리하려 하면 거부된다.
**되돌리기(resolved → pending)는 이 엔드포인트로 불가능하다.**

### Property 2: `resolve` 는 브리더 정지를 동반한다
`suspensionReason` 과 `suspendedAt` 이 함께 기록된다.
신고 인정과 정지가 한 트랜잭션에 묶여 있어, "신고만 인정하고 정지는 보류" 를 이 API 로 표현할 수 없다.
`reject` 는 두 필드를 `undefined` 로 둔다.

### Property 3: 모든 처리는 관리자 활동 로그에 남는다
`appendAdminActivityLog` 로 `RESOLVE_REPORT` / `DISMISS_REPORT` 액션이 기록된다.
설명 문자열에 `adminNotes` 가 포함된다(없으면 `No notes`).

### Property 4: 브리더 관리 권한이 필요하다
`assertCanManageBreeders(admin)` 로 관리자 레벨을 검사한다.

## Error Handling

- 없는 신고 ID: `assertReportExists` 가 거부한다.
- 이미 처리된 신고: `assertPendingReport` 가 거부한다.
- 권한 없는 관리자: `assertCanManageBreeders` 가 거부한다.
- 응답 봉투·상태 코드는 [`_conventions.md`](../_conventions.md) 를 따른다.

## Testing Strategy

- e2e: 신고 목록 조회 → `resolve` 처리 → 재처리 시 거부되는지
- `resolve` 후 브리더에 `suspendedAt` 이 실제로 기록되는지 확인 (정지 동반 여부가 계약이므로)
- 권한 없는 접근 차단
