# Design — user 도메인 (Admin)

## Overview

사용자 관리 도메인(관리자 전용). 사용자 목록/상세 조회, 상태 변경(정지 등), 하드 삭제,
탈퇴 사용자 목록/통계/복구, 전화번호 화이트리스트(SMS 인증 우회) 관리를 담당한다.
라우트 prefix `user-admin`.

상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. 관리자 인증.

```
admin/controller/  user-admin (users, deleted-users, phone-whitelist)
application/use-cases/  조회/상태변경/하드삭제/복구/화이트리스트 CRUD
infrastructure/* · repository/*  mongoose
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/user-admin/deleted-users` | 탈퇴 사용자 목록 조회 |
| GET | `/api/user-admin/deleted-users/stats` | 탈퇴 사용자 통계 조회 |
| PATCH | `/api/user-admin/deleted-users/{userId}/restore` | 탈퇴 사용자 복구 |
| GET | `/api/user-admin/phone-whitelist` | 전화번호 화이트리스트 목록 조회 |
| POST | `/api/user-admin/phone-whitelist` | 전화번호 화이트리스트 추가 |
| PATCH | `/api/user-admin/phone-whitelist/{id}` | 전화번호 화이트리스트 수정 |
| DELETE | `/api/user-admin/phone-whitelist/{id}` | 전화번호 화이트리스트 삭제 |
| GET | `/api/user-admin/profile` | 관리자 프로필 조회 |
| GET | `/api/user-admin/users` | 통합 사용자 목록 조회 |
| PATCH | `/api/user-admin/users/{userId}/hard-delete` | 사용자 영구 삭제 |
| PATCH | `/api/user-admin/users/{userId}/status` | 사용자 상태 변경 |

## Data Models

응답 DTO: 사용자/탈퇴/화이트리스트 목록·항목. 스키마: `user`, `adopter`, `breeder`, `phone-whitelist`.

## Correctness Properties

### Property 1: 관리자 한정
모든 엔드포인트는 관리자 권한에서만 접근 가능하다.
**Validates: Requirements 1.1**

### Property 2: 하드 삭제/복구 정합성
하드 삭제와 복구는 연관 데이터 일관성을 유지하며, 복구는 탈퇴 상태에서만 가능하다.
**Validates: Requirements 1.2**

## Error Handling

- 비인가/없는 사용자: 401·403 / 400.
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

사용자 상태/삭제/복구/화이트리스트 유스케이스 unit + e2e.
