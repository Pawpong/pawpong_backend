# Design — breeder 도메인

## Overview

브리더 **공개 탐색/상세** 도메인. 입양자가 브리더를 탐색(필터)·인기·검색하고, 브리더 상세(프로필/보유펫/부모펫/후기/상담폼)를 조회한다. 브리더 본인 관리 기능은 `breeder-management` 도메인이 담당.

상태: 구현 완료(dev). 최근 보강 — 탐색 petType 미지정 시 전체 조회, 페이지네이션 표준화.

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. 공개 라우트(OptionalJwt).

```
controller/            explore, popular, search, detail, pets, parent-pets, reviews, application-form, pet-detail
application/use-cases/ 탐색/인기/검색/상세/보유펫/부모펫/후기/상담폼 조회
application/ports/      breeder reader, pet reader, review reader
infrastructure/* · repository/*  mongoose 접근 + storage url
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| POST | `/api/v2/breeder/explore` | 브리더 탐색(필터 바디) |
| GET | `/api/v2/breeder/popular` | 인기 브리더 |
| GET | `/api/v2/breeder/search` | 브리더 검색 |
| GET | `/api/v2/breeder/{id}` | 브리더 상세/프로필 |
| GET | `/api/v2/breeder/{id}/application-form` | 공개 상담 폼 |
| GET | `/api/v2/breeder/{id}/parent-pets` | 부모펫 목록 |
| GET | `/api/v2/breeder/{id}/pet/{petId}` | 보유 펫 단건 |
| GET | `/api/v2/breeder/{id}/pets` | 보유 분양 펫 목록 |
| GET | `/api/v2/breeder/{id}/reviews` | 후기 목록 |
| POST | `/api/breeder-admin/remind` | 리마인드 알림 발송 |
| POST | `/api/breeder-admin/suspend/{breederId}` | 브리더 제재 처리 (영구정지) |
| PATCH | `/api/breeder-admin/test-account/{breederId}` | 테스트 계정 설정 |
| POST | `/api/breeder-admin/unsuspend/{breederId}` | 브리더 정지 해제 |

## Data Models

응답 DTO (dto/response): breeder-card, breeder-explore, breeder-search, breeder-profile,
breeder-dashboard, pets-list, pet-detail, parent-pet-list/parent-pets, breeder-reviews,
public-application-form, received-application(-list).

스키마: `breeder`, `available-pet`, `parent-pet`, `breeder-review`, `standard-question`.

## Correctness Properties

### Property 1: 공개 PII 보호
공개 상세 응답에서 상세 주소 등 PII는 제외하고 위치는 district>city 수준만 노출한다.
**Validates: Requirements 1.1**

### Property 2: 탐색 필터 정확성
petType 미지정 시 전체 조회, 지정 시 해당 타입만 반환하며 페이지네이션은 표준 형태를 따른다.
**Validates: Requirements 1.2**

## Error Handling

- 없는 브리더/펫: `BadRequestException`(400).
- 응답은 `ApiResponseDto<T>` 래핑, 목록은 표준 `PaginationResponse`.

## Testing Strategy

탐색/검색/상세/하위목록 유스케이스 unit + e2e. PII 마스킹·페이지네이션 검증.
