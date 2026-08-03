# Design — breed 도메인

## Overview

품종 도메인. 펫 타입(dog/cat/reptile)별 품종 목록을 공개로 제공한다(시드 데이터 기반).
관리자(breeds-admin)가 품종을 관리한다.

상태: 구현 완료(dev).

## Architecture

헥사고날(경량): `controller → use-case → port → adapter → repository`.

```
controller/  breeds (by petType)
application/use-cases/  품종 목록 조회
infrastructure/* · repository/*  mongoose
admin/  품종 관리
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/breeds/{petType}` | 펫 타입별 품종 목록 |
| GET | `/api/breeds-admin` | 모든 품종 조회 (관리자) |
| POST | `/api/breeds-admin` | 품종 생성 (관리자) |
| GET | `/api/breeds-admin/{id}` | 특정 품종 조회 (관리자) |
| PATCH | `/api/breeds-admin/{id}` | 품종 정보 수정 (관리자) |
| DELETE | `/api/breeds-admin/{id}` | 품종 삭제 (관리자) |

## Data Models

응답 DTO (dto/response): `breed-response`, `get-breeds-response`.

스키마: `breed`(시드 데이터).

## Correctness Properties

### Property 1: 타입 필터
응답은 요청한 petType의 품종만 포함한다.
**Validates: Requirements 1.1**

## Error Handling

- 잘못된 petType: `BadRequestException`(400).
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

타입별 목록 조회 unit + e2e.
