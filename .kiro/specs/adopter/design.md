# Design — adopter 도메인

## Overview

입양자(adopter) 전용 기능 도메인. 프로필 조회/수정, 계정 삭제, 즐겨찾기(브리더) 관리,
입양 신청 내역 조회, 후기 작성/조회, 신고(브리더/후기)를 담당한다.

상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. command/query 컨트롤러 분리.

```
controller/(또는 *-command/*-query)  application, favorite, review, report, profile, account
application/use-cases/                 각 기능 유스케이스
application/ports/                      reader/writer 포트
infrastructure/* · repository/*         mongoose 접근
admin/                                  입양자 관리(admin)
```

컨트롤러: 인증(adopter) 필수.

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/adopter/profile` | 프로필 조회 |
| PATCH | `/api/v2/adopter/profile` | 프로필 수정 |
| DELETE | `/api/v2/adopter/account` | 계정 삭제(탈퇴) |
| GET | `/api/v2/adopter/favorites` | 즐겨찾기(브리더) 목록 |
| POST | `/api/v2/adopter/favorite` | 즐겨찾기 등록 |
| DELETE | `/api/v2/adopter/favorite/:breederId` | 즐겨찾기 해제 |
| GET | `/api/v2/adopter/applications` | 내 신청 목록 |
| GET | `/api/v2/adopter/applications/:id` | 신청 상세 |
| POST | `/api/v2/adopter/application` | 신청 생성 |
| GET | `/api/v2/adopter/reviews` | 내 후기 목록 |
| GET | `/api/v2/adopter/reviews/:id` | 후기 상세 |
| POST | `/api/v2/adopter/review` | 후기 작성 |
| POST | `/api/v2/adopter/report` | 브리더 신고 |
| POST | `/api/v2/adopter/report/review` | 후기 신고 |

## Data Models

응답 DTO (dto/response): adopter-profile, profile-update, account-delete,
favorite-list/add/remove, application-list/list-item/detail/create, my-review-item/detail,
review-create, report-create, review-report.

스키마: `adopter`, `favorite`, `adoption-application`, `breeder-review`, `breeder-report`.

## Correctness Properties

### Property 1: 즐겨찾기 멱등성
브리더 즐겨찾기 등록/해제는 멱등이며 목록 상태와 일치한다.
**Validates: Requirements 1.1**

### Property 2: 본인 데이터 한정
프로필/신청/후기 조회·수정은 인증된 본인 데이터로 한정된다.
**Validates: Requirements 1.2**

### Property 3: 탈퇴 처리
계정 삭제는 상태 전환(soft) 기반이며 이후 인증 차단으로 이어진다.
**Validates: Requirements 1.3**

## Error Handling

- 없는 리소스/권한 없음: `BadRequestException`(400) 우선.
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

프로필/즐겨찾기/신청/후기/신고 유스케이스 unit + e2e.
