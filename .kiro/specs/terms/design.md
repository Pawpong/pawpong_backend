# Design — terms 도메인

## Overview

약관 도메인. 공개로 약관 목록 및 코드별 약관 본문을 제공한다(가입 동의 화면 등에서 사용).

상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. 공개 조회.

```
controller/  terms-list, terms-detail
application/use-cases/  목록/코드별 조회
infrastructure/* · repository/*  mongoose
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/terms` | 약관 목록 |
| GET | `/api/v2/terms/{code}` | 코드별 약관 본문 |

## Data Models

응답 DTO (dto/response): `terms-response`.

스키마: `terms`.

## Correctness Properties

### Property 1: 최신 버전 제공
코드별 조회는 활성/최신 버전 약관을 반환한다.
**Validates: Requirements 1.1**

## Error Handling

- 없는 코드: `BadRequestException`(400).
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

목록/코드별 조회 유스케이스 unit + e2e.
