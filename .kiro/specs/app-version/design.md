# Design — app-version 도메인

## Overview

앱 버전 도메인. 모바일(RN) 클라이언트가 최소/권장 버전을 확인해 강제/권장 업데이트를 판단하도록
버전 체크 API를 제공한다. 관리자(app-version-admin)가 버전 정책을 관리한다.

상태: 구현 완료(dev).

## Architecture

헥사고날(경량): `controller → use-case → port → adapter → repository`.

```
controller/  app-version-check
application/use-cases/  버전 체크
infrastructure/* · repository/*  mongoose
admin/  버전 정책 관리
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/app-version/check` | 현재 버전 대비 업데이트 필요 여부 |

## Data Models

응답 DTO (dto/response): `app-version-check-response`, `app-version-response`.
(최소버전/권장버전/강제업데이트 여부 등)

스키마: `app-version`.

## Correctness Properties

### Property 1: 업데이트 판정 정확성
클라이언트 버전이 최소버전 미만이면 강제 업데이트, 권장버전 미만이면 권장 업데이트로 판정한다.
**Validates: Requirements 1.1**

## Error Handling

- 잘못된 버전 파라미터: `BadRequestException`(400).
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

버전 체크 유스케이스 unit + e2e(경계 버전 케이스).
