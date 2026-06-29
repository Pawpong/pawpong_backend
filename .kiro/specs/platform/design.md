# Design — platform 도메인 (Admin)

## Overview

플랫폼 운영/통계 도메인(관리자 전용). 대시보드용 시스템 통계(MVP 지표), 전체 통계,
시스템 헬스(서버 현황)를 관리자에게 제공한다. 라우트 prefix `platform-admin`.

상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. 관리자 인증(RolesGuard).

```
admin/controller/  platform-admin (mvp-stats, stats, system-health)
application/use-cases/  통계 집계/헬스 조회
infrastructure/* · repository/*  mongoose 집계
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/platform-admin/mvp-stats` | MVP 핵심 지표 |
| GET | `/api/v2/platform-admin/stats` | 전체 통계 |
| GET | `/api/v2/platform-admin/system-health` | 시스템 헬스/서버 현황 |

## Data Models

응답 DTO: 통계/헬스 응답(지표 집계). 스키마: `system-stats` + 각 도메인 집계.

## Correctness Properties

### Property 1: 관리자 한정
모든 엔드포인트는 관리자 권한에서만 접근 가능하다.
**Validates: Requirements 1.1**

### Property 2: 집계 정확성
통계 수치는 원본 컬렉션 집계 결과와 일치한다.
**Validates: Requirements 1.2**

## Error Handling

- 비인가 접근: 401/403.
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

통계 집계/헬스 유스케이스 unit + e2e(platform-admin e2e 보유).
