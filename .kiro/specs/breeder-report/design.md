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
`status`(pending / reviewing / resolved / dismissed), 신고자·대상 브리더, 처리 메모.

## Correctness Properties

### Property 1: 처리 상태 전이는 단방향이 아니다
`pending → reviewing → resolved | dismissed`. 오처리 정정을 위해 되돌릴 수 있다.

### Property 2: 신고 누적이 브리더 정지 판단의 근거가 된다
정지 처분 자체는 `breeder-admin` 이 수행하며, 여기서는 근거 데이터만 제공한다.

## Error Handling

- 없는 신고 ID: `BadRequestException`(400).
- 응답 봉투·상태 코드는 [`_conventions.md`](../_conventions.md) 를 따른다.

## Testing Strategy

- e2e: 신고 목록 조회 → 상태 변경 왕복, 권한 없는 접근 차단
