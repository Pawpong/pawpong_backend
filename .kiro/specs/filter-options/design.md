# Design — filter-options 도메인

## Overview

필터 옵션 메타데이터 도메인. 탐색/목록 화면에서 쓰는 필터 옵션(입양상태, 브리더 레벨,
고양이 털길이, 강아지 사이즈, 정렬 옵션)을 공개로 제공한다.

상태: 구현 완료(dev).

## Architecture

헥사고날(경량): `controller → use-case`. 대부분 상수/enum 기반.

```
controller/  filter-options (전체 + 항목별)
application/use-cases/  옵션 조립
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/filter-options` | 전체 필터 옵션 |
| GET | `/api/v2/filter-options/adoption-status` | 입양 상태 옵션 |
| GET | `/api/v2/filter-options/breeder-levels` | 브리더 레벨 |
| GET | `/api/v2/filter-options/cat-fur-lengths` | 고양이 털길이 |
| GET | `/api/v2/filter-options/dog-sizes` | 강아지 사이즈 |
| GET | `/api/v2/filter-options/sort-options` | 정렬 옵션 |

## Data Models

응답 DTO (dto/response): `filter-options-response`. (value/label 쌍 목록)

데이터 출처: 도메인 enum/constants (user.enum 등).

## Correctness Properties

### Property 1: enum 일치
필터 옵션 value 집합은 도메인 enum과 정확히 일치한다.
**Validates: Requirements 1.1**

## Error Handling

- 상수 기반이라 정상 200. 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

옵션 응답 unit + e2e(enum 동기화 검증).
