# Design — breeder-pet-posting 도메인

## Overview

브리더의 **분양글(펫 포스팅)** 작성/관리 도메인. 브리더가 분양글을 등록·수정·삭제하고
내 분양글 목록을 조회한다. (공개 분양 탐색은 `adoption`, 분양펫 인벤토리 관리는 `breeder-management`와 연계)

상태: 구현 완료(dev). 최근 보강 — 임시저장(draft) 흐름 + 사육환경 사진 배열(최대 5장) (2026-08-17,
프론트 요청: UI 는 사육환경 사진 5장인데 서버가 1장만 받던 불일치 해소, 분양글 작성 임시저장 지원).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. 인증(breeder) 필수.

```
controller/            create, update, delete, my-list
application/use-cases/ create / update / delete / list-my-postings
application/ports/      reader/writer
domain/services/        card mapper
infrastructure/* · repository/*  mongoose + storage url
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| POST | `/api/v2/breeder-pet-posting` | 분양글 등록 (draftId 전달 시 등록 성공 후 해당 임시저장 자동 삭제) |
| GET | `/api/v2/breeder-pet-posting/me` | 내 분양글 목록(페이지네이션) |
| PATCH | `/api/v2/breeder-pet-posting/{petId}` | 분양글 수정 |
| DELETE | `/api/v2/breeder-pet-posting/{petId}` | 분양글 삭제 |
| POST | `/api/v2/breeder-pet-posting/drafts` | 임시저장 신규 (전 필드 옵션, 브리더당 최대 10개) |
| PUT | `/api/v2/breeder-pet-posting/drafts/{draftId}` | 임시저장 덮어쓰기 |
| GET | `/api/v2/breeder-pet-posting/drafts` | 내 임시저장 목록 (최신 저장순, 카드 필드 null 허용) |
| GET | `/api/v2/breeder-pet-posting/drafts/{draftId}` | 임시저장 단건 (폼 복원용, 저장한 payload 그대로) |
| DELETE | `/api/v2/breeder-pet-posting/drafts/{draftId}` | 임시저장 삭제 (hard delete) |

**사육환경 사진**: `breedingEnvironment.photoFileNames` 배열(최대 5장)이 표준.
레거시 `photoFileName`(단일)도 하위 호환으로 수용하며, 저장 시 배열의 첫 장을 단일 필드에 함께 기록해
기존 소비자(adoption 상세의 `photoUrl`)가 깨지지 않는다. adoption 상세 응답에는 `photoUrls` 배열이 추가됨.

## Data Models

응답 DTO (dto/response):
- `BreederPetPostingResponseDto`: 분양글 단건/등록 결과
- `BreederPetPostingCardDto`: 목록 카드(상태/카운트 포함)
- `BreederPetPostingDeleteResponseDto`: 삭제 결과

스키마: `available-pet`(분양글 본체), `breeder`, `breeder-pet-posting-draft`(임시저장).

**임시저장을 별도 컬렉션으로 둔 이유**: 분양글 스키마는 required 필드가 많아 미완성 상태를 담을 수 없고,
available_pets 에 draft 를 섞으면 입양 페이지/프로필 조회 쿼리로 새어 나갈 위험이 있다.
draft 는 작성 폼 payload(Mixed)를 그대로 보관하고, 등록 시 일반 등록 API 로 제출 후 삭제된다.
cross-field 검증(접종 상태-기록 상호 배타 등)은 등록 시점에만 강제한다.

## Correctness Properties

### Property 1: 소유권 강제
분양글 수정·삭제는 작성 브리더 본인만 가능하다.
**Validates: Requirements 1.1**

### Property 2: 목록 범위 한정
`/me` 목록은 인증된 브리더의 분양글만 반환한다.
**Validates: Requirements 1.2**

### Property 3: 임시저장 소유권/격리
draft 의 모든 조작(조회·덮어쓰기·삭제)은 breederId 소유자 필터를 쿼리에 포함해 타인 draft 를
존재하지 않는 것처럼 다룬다(400). draft 는 별도 컬렉션이라 공개 조회 표면에 노출될 수 없다.
**Validates: Requirements 1.3**

## Error Handling

- 권한 없음/없는 분양글: `BadRequestException`(400).
- 응답은 `ApiResponseDto<T>` 래핑, 목록은 표준 `PaginationResponse`.

## Testing Strategy

등록/수정/삭제/목록 유스케이스 unit + e2e. 소유권 검증.
