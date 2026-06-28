# Design — district 도메인

## Overview

지역 도메인. 시/구 지역 목록을 공개로 제공한다(시드 데이터 기반). 관리자(districts-admin)가 관리한다.

상태: 구현 완료(dev).

## Architecture

헥사고날(경량): `controller → use-case → port → adapter → repository`.

```
controller/  districts
application/use-cases/  지역 목록 조회
infrastructure/* · repository/*  mongoose
admin/  지역 관리
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/districts` | 지역(시/구) 목록 |

## Data Models

응답 DTO (dto/response): `district-response`, `get-districts-response`.

스키마: `district`(시드 데이터).

## Correctness Properties

### Property 1: 계층 구조
지역 응답은 시/구 계층 구조를 일관되게 표현한다.
**Validates: Requirements 1.1**

## Error Handling

- 응답은 `ApiResponseDto<T>` 래핑. 데이터 없음은 빈 배열.

## Testing Strategy

지역 목록 조회 unit + e2e.
