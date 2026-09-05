# Design — breeder-management 도메인

## Overview

브리더 **본인 관리** 도메인. 브리더가 프로필·계정, 분양펫(available-pets)·부모펫, 상담 신청 폼,
수신한 입양 신청 처리, 후기 답글, 대시보드, 브리더 인증(verification)을 관리한다.

상태: 구현 완료(dev). 최근 보강 — 프로필 응답 profileInfo 필드명 프론트 계약 정렬.

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. 인증(breeder) 필수.

```
controller/            profile, account, available-pets, parent-pets, applications, reviews/reply, dashboard, application-form, verification
application/use-cases/ 각 CRUD/상태전환/검증 유스케이스
application/ports/      reader/writer 포트
infrastructure/* · repository/*  mongoose + storage
admin/                 브리더 관리(admin)
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| DELETE | `/api/v2/breeder-management/account` | 계정 삭제 |
| GET | `/api/v2/breeder-management/application-form` | 상담 폼 조회/수정 |
| PATCH | `/api/v2/breeder-management/application-form` | 상담 폼 조회/수정 |
| PATCH | `/api/v2/breeder-management/application-form/simple` | 상담 폼 간단 수정 |
| GET | `/api/v2/breeder-management/applications` | 수신 신청 목록 |
| GET | `/api/v2/breeder-management/applications/{applicationId}` | 신청 상세/상태 변경 |
| PATCH | `/api/v2/breeder-management/applications/{applicationId}` | 신청 상세/상태 변경 |
| GET | `/api/v2/breeder-management/dashboard` | 대시보드 통계 |
| GET | `/api/v2/breeder-management/my-reviews` | 내 후기 목록 |
| POST | `/api/v2/breeder-management/parent-pets` | 부모펫 등록 |
| PATCH | `/api/v2/breeder-management/parent-pets/{petId}` | 부모펫 수정/삭제 |
| DELETE | `/api/v2/breeder-management/parent-pets/{petId}` | 부모펫 수정/삭제 |
| GET | `/api/v2/breeder-management/profile` | 프로필 조회/수정 |
| PATCH | `/api/v2/breeder-management/profile` | 프로필 조회/수정 |
| POST | `/api/v2/breeder-management/reviews/{reviewId}/reply` | 후기 답글 |
| PATCH | `/api/v2/breeder-management/reviews/{reviewId}/reply` | 후기 답글 |
| DELETE | `/api/v2/breeder-management/reviews/{reviewId}/reply` | 후기 답글 |
| GET | `/api/v2/breeder-management/verification` | 인증 상태 조회/신청 |
| POST | `/api/v2/breeder-management/verification` | 인증 상태 조회/신청 |
| POST | `/api/v2/breeder-management/verification/submit` | 인증 제출 |
| POST | `/api/v2/breeder-management/verification/upload` | 인증 서류 업로드 |
| POST | `/api/breeder-management-admin/counsel-banner` | 상담 배너 생성 |
| PATCH | `/api/breeder-management-admin/counsel-banner/{bannerId}` | 상담 배너 수정 |
| DELETE | `/api/breeder-management-admin/counsel-banner/{bannerId}` | 상담 배너 삭제 |
| GET | `/api/breeder-management-admin/counsel-banners` | 상담 배너 전체 목록 조회 |
| GET | `/api/breeder-management-admin/counsel-banners/active` | 활성 상담 배너 목록 조회 |
| POST | `/api/breeder-management-admin/profile-banner` | 프로필 배너 생성 |
| PATCH | `/api/breeder-management-admin/profile-banner/{bannerId}` | 프로필 배너 수정 |
| DELETE | `/api/breeder-management-admin/profile-banner/{bannerId}` | 프로필 배너 삭제 |
| GET | `/api/breeder-management-admin/profile-banners` | 프로필 배너 전체 목록 조회 |
| GET | `/api/breeder-management-admin/profile-banners/active` | 활성 프로필 배너 목록 조회 |

## Data Models

응답 DTO (dto/response): profile-update, breeder-account-delete, my-pets-list, pet-add/update/remove/status-update,
application-detail/form-response/form-update/status-update, my-reviews-list, review-reply,
verification-status/submit, upload-documents.

스키마: `breeder`, `available-pet`, `parent-pet`, `adoption-application`, `breeder-review`.

## Correctness Properties

### Property 1: 소유권 강제
분양펫/부모펫/신청/답글의 수정·삭제는 소유 브리더만 가능하다.
**Validates: Requirements 1.1**

### Property 2: 응답 계약 보존
프로필 응답 필드명은 프론트 계약(profileInfo 등)과 일치하며 리팩토링으로 변경하지 않는다.
**Validates: Requirements 1.2**

### Property 3: 상태 전이 유효성
분양 상태/신청 상태 변경은 허용된 전이만 적용한다.
**Validates: Requirements 1.3**

## Error Handling

- 권한 없음/없는 리소스: `BadRequestException`(400) 우선.
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

프로필/펫/신청/답글/인증 유스케이스 unit + e2e. 소유권·상태전이 검증.
