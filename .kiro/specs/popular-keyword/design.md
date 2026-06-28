# Design — popular-keyword 도메인

## Overview

인기 검색어 도메인. 공개로 인기 검색어 목록을 제공한다. 관리자(popular-keyword-admin)가 관리/집계한다.

상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. 공개 조회.

```
controller/  popular-keyword-list
application/use-cases/  인기 검색어 조회
infrastructure/* · repository/*  mongoose
admin/  검색어 관리
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/popular-keyword` | 인기 검색어 목록 |

## Data Models

응답 DTO (dto/response): `popular-keyword-response`.

스키마: `popular-keyword`.

## Correctness Properties

### Property 1: 순위 정렬
인기 검색어는 집계 순위(rank/count) 기준으로 정렬되어 반환된다.
**Validates: Requirements 1.1**

## Error Handling

- 데이터 없음은 빈 배열로 응답.
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

목록 조회 유스케이스 unit + e2e.
