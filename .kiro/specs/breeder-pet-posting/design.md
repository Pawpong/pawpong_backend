# Design — breeder-pet-posting 도메인

## Overview

브리더의 **분양글(펫 포스팅)** 작성/관리 도메인. 브리더가 분양글을 등록·수정·삭제하고
내 분양글 목록을 조회한다. (공개 분양 탐색은 `adoption`, 분양펫 인벤토리 관리는 `breeder-management`와 연계)

상태: 구현 완료(dev). 최근 보강 — 내 분양글 카드에 status/chatCount 등 계약 보강.

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
| POST | `/api/v2/breeder-pet-posting` | 분양글 등록 |
| GET | `/api/v2/breeder-pet-posting/me` | 내 분양글 목록(페이지네이션) |
| PATCH | `/api/v2/breeder-pet-posting/:petId` | 분양글 수정 |
| DELETE | `/api/v2/breeder-pet-posting/:petId` | 분양글 삭제 |

## Data Models

응답 DTO (dto/response):
- `BreederPetPostingResponseDto`: 분양글 단건/등록 결과
- `BreederPetPostingCardDto`: 목록 카드(상태/카운트 포함)
- `BreederPetPostingDeleteResponseDto`: 삭제 결과

스키마: `available-pet`(분양글 본체), `breeder`.

## Correctness Properties

### Property 1: 소유권 강제
분양글 수정·삭제는 작성 브리더 본인만 가능하다.
**Validates: Requirements 1.1**

### Property 2: 목록 범위 한정
`/me` 목록은 인증된 브리더의 분양글만 반환한다.
**Validates: Requirements 1.2**

## Error Handling

- 권한 없음/없는 분양글: `BadRequestException`(400).
- 응답은 `ApiResponseDto<T>` 래핑, 목록은 표준 `PaginationResponse`.

## Testing Strategy

등록/수정/삭제/목록 유스케이스 unit + e2e. 소유권 검증.
