# Design — breeder-report 도메인 (관리자)

## Overview

브리더 신고 처리 도메인. 입양자가 접수한 브리더 신고를 관리자가 목록으로 확인하고
처리 상태를 갱신한다. 신고 접수(작성) 자체는 `adopter` 도메인이 담당한다.

위치: `src/api/admin/breeder/report/`.
라우트 prefix: `breeder-report-admin`.
상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`.

```
report/application/use-cases/  get-breeder-reports, handle-breeder-report
report/controller/ · decorator/ · swagger/
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/breeder-report-admin/reports` | 브리더 신고 목록 조회 |
| PATCH | `/api/breeder-report-admin/reports/{reportId}` | 브리더 신고 처리 |

## Data Models

`breeder-report` 스키마 — `reportType`(no_contract / false_info / inappropriate_content / other),
`status`, 신고자·대상 브리더, 처리 메모(`adminNotes`).

`ReportStatus` enum 에는 `pending / reviewing / resolved / dismissed` 가 있으나,
**관리자 처리 API 가 실제로 만들어내는 상태는 `resolved` 와 `dismissed` 뿐이다.**
`resolveReportStatus(action)` 이 `resolve → resolved`, `reject → dismissed` 로만 매핑한다.
`reviewing` 은 이 경로로 설정되지 않는다.

## Correctness Properties

### Property 1: 처리는 pending 상태에서만 가능하다 (단방향)
`assertPendingReport` 가 `status !== 'pending'` 이면 **"이미 처리된 신고입니다."** 로 거부한다.
`pending → resolved | dismissed` 한 번뿐이고, 되돌리거나 재처리할 수 없다.
오처리 정정 경로는 현재 API 에 없다.

### Property 2: 처리 이력이 관리자 활동 로그로 남는다
`AdminAction.RESOLVE_REPORT` / `DISMISS_REPORT` 로 기록된다.

### Property 3: 신고 누적이 브리더 정지 판단의 근거가 된다
정지 처분 자체는 `breeder-admin`(`POST /breeder-admin/suspend/{breederId}`)이 수행하며,
여기서는 근거 데이터만 제공한다.

## Error Handling

- 없는 신고 ID: 신고 미존재로 거부(`assertReportExists`).
- 이미 처리된 신고: **"이미 처리된 신고입니다."**
- 권한 없는 관리자: `assertCanManageBreeders` 로 거부.
- 응답 봉투·상태 코드는 [`_conventions.md`](../_conventions.md) 를 따른다.

## Testing Strategy

- e2e: 신고 목록 조회 → 상태 변경 왕복, 권한 없는 접근 차단
