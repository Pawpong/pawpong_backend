# Design — adoption 도메인

## Overview

입양(분양) 동물의 **공개 탐색/상세 + 관심(즐겨찾기)** 도메인. 입양자가 분양 동물을 목록/인기/상세로 보고,
관심 등록·해제하며, 내 관심/입양완료 목록을 조회한다. 신청서 제출은 `adoption-application` 도메인이 담당.

특성:
- 공개 라우트는 OptionalJwt — 로그인 시 `isFavorited` 채움.
- 즐겨찾기는 `StrictRolesGuard`(adopter)로 브리더의 카운트 spam 방지.
- 사진은 storage signed URL로 변환.

상태: 전 엔드포인트 구현 완료(dev). 최근 보강 — 카드 응답에 chatCount 추가, 분양 카드 계약 정렬.

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`.

```
controller/            adoption-list, adoption-detail, adoption-favorite, adoption-my-favorites, adoption-my-adopted
application/use-cases/ 목록/인기/상세/관심토글/내관심/내입양 유스케이스
application/ports/      pet-reader, favorite, breeder-summary, record-reader, asset-url
domain/services/        카드/상세 조립
infrastructure/*        mongoose reader/writer + storage url adapter
repository/*            adoption-pet, adopter-pet-favorite, adoption-record
```

컨트롤러 데코레이터: `AdoptionOptionalAuthController`(공개), `AdoptionProtectedController`(adopter, Strict).

## Components and Interfaces

| Method | Path | 인증 | 용도 |
|---|---|---|---|
| GET | `/api/v2/adoption` | Optional | 목록(petType/breederId/excludePetId/status/keyword/sort, 페이지네이션) |
| GET | `/api/v2/adoption/me/adopted` | adopter | 내 입양 완료 목록 |
| GET | `/api/v2/adoption/me/favorites` | adopter | 내 관심 목록 |
| GET | `/api/v2/adoption/popular` | Optional | 인기 분양 동물 |
| GET | `/api/v2/adoption/{petId}` | Optional | 상세 |
| POST | `/api/v2/adoption/{petId}/favorite` | adopter | 관심 등록 |
| DELETE | `/api/v2/adoption/{petId}/favorite` | adopter | 관심 해제 |

## Data Models

응답 DTO (dto/response):
- `AdoptionPetResponseDto`(카드): petId, breederId, breederName?, name, breed, petType?, gender,
  ageDescription, price, status(available|reserved|adopted), primaryPhotoUrl, photoUrls[],
  inquiryCount, favoriteCount, viewCount, chatCount, isFavorited, isPopular, createdAt
- `AdoptionPetDetailResponseDto`(상세): 카드 + description?, tags[], birthDate, vaccinationStatus?/records,
  geneticTestStatus?/records, parents[](relation mother|father), breedingEnvironment?, breeder{breederId,displayName,profileImageUrl?,locationText?,bpm}
- `AdoptedPetCardResponseDto`: 카드 + adoptedAt
- `AdoptionFavoriteResponseDto`: petId, favoriteCount, success

스키마: `available-pet`, `adopter-pet-favorite`, `adoption-application`(record).

## Correctness Properties

### Property 1: 관심 토글 일관성
관심 등록/해제 후 응답 `favoriteCount`는 실제 저장 상태와 일치하며, 등록은 멱등(중복 등록이 카운트를 중복 증가시키지 않음).
**Validates: Requirements 1.1**

### Property 2: 로그인 기반 isFavorited
공개 응답의 `isFavorited`는 로그인 사용자 기준이며 비로그인 시 false.
**Validates: Requirements 1.2**

### Property 3: 권한 분리
관심 등록/해제는 adopter 전용(StrictRolesGuard) — breeder 권한 승격으로 우회 불가.
**Validates: Requirements 1.3**

## Error Handling

- 없는/비활성 펫: `BadRequestException`(400).
- 응답은 `ApiResponseDto<T>` 래핑, 페이지네이션은 표준 `PaginationResponse`.

## Testing Strategy

목록/상세/관심 토글 유스케이스 unit + e2e. 페이지네이션·isFavorited 분기 검증.
