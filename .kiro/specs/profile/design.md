# Design — profile 도메인

## Overview

통합 프로필/팔로우 도메인(v2). 내 프로필 조회/수정, 공개 사용자/브리더 프로필 조회,
내 즐겨찾는 브리더 목록, 사용자 팔로우/언팔로우를 담당한다.

상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. 공개+인증 컨트롤러 분리.

```
controller/  profile-me, profile-public, profile-follow
application/use-cases/  내프로필/공개프로필/즐겨찾기/팔로우 유스케이스
application/ports/  profile reader/writer, follow port
infrastructure/* · repository/*  mongoose + storage
```

컨트롤러 데코레이터: `ProfileMeController`(인증), `ProfilePublicController`(공개), `ProfileFavoritesController`.

## Components and Interfaces

| Method | Path | 인증 | 용도 |
|---|---|---|---|
| GET | `/api/v2/profile/me` | 인증 | 내 프로필 |
| PATCH | `/api/v2/profile/me` | 인증 | 내 프로필 수정 |
| GET | `/api/v2/profile/me/favorite-breeders` | 인증 | 내 즐겨찾는 브리더 |
| GET | `/api/v2/profile/users/:userId` | 공개 | 공개 사용자 프로필 |
| GET | `/api/v2/profile/breeders/:breederId` | 공개 | 공개 브리더 프로필 |
| POST | `/api/v2/profile/users/:userId/follow` | 인증 | 팔로우 |
| DELETE | `/api/v2/profile/users/:userId/follow` | 인증 | 언팔로우 |

## Data Models

응답 DTO (dto/response): my-profile-response, adopter-profile-response, breeder-profile-response,
favorite-breeder-card, follow-response.

스키마: `user`, `adopter`, `breeder`, `user-follow`, `favorite`.

## Correctness Properties

### Property 1: 팔로우 멱등성
팔로우/언팔로우는 멱등이며 follower 집계가 실제 관계와 일치한다.
**Validates: Requirements 1.1**

### Property 2: 공개/비공개 경계
공개 프로필 응답은 PII를 제외하고, 내 프로필 수정은 본인만 가능하다.
**Validates: Requirements 1.2**

### Property 3: isFollowing 정확성
프로필 응답의 isFollowing은 요청 사용자 기준이며 비로그인 시 false.
**Validates: Requirements 1.3**

## Error Handling

- 없는 사용자/브리더: `BadRequestException`(400).
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

내/공개 프로필, 즐겨찾기, 팔로우 유스케이스 unit + e2e.
