# Design — notification 도메인

## Overview

앱 내 알림 도메인. 알림 목록/미읽음 수 조회, 읽음 처리(단건/전체), 삭제,
푸시 토큰(FCM) 등록/해제를 담당한다. 도메인 이벤트(좋아요/승인/상담 등)를 구독해 알림을 생성한다.
관리자(admin)는 알림 발송/이메일 프리뷰를 담당.

상태: 구현 완료(dev). 최근 보강 — 푸시 토큰 등록 시 타 유저의 동일 토큰 제거.

## Architecture

헥사고날 + EventEmitter 구독(OnEvent). FCM 발송 어댑터.

```
controller/  list, unread-count, read(단건/전체), delete, push-token
application/use-cases/  조회/읽음/삭제/토큰등록·해제
listeners/  도메인 이벤트 구독 → 알림 생성
infrastructure/*  mongoose + FCM
admin/  알림 발송/이메일 프리뷰
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/notification` | 알림 목록(페이지네이션) |
| GET | `/api/v2/notification/unread-count` | 미읽음 수 |
| PATCH | `/api/v2/notification/:id/read` | 단건 읽음 |
| PATCH | `/api/v2/notification/read-all` | 전체 읽음 |
| DELETE | `/api/v2/notification/:id` | 알림 삭제 |
| POST | `/api/v2/notification/push-token` | 푸시 토큰 등록 |
| DELETE | `/api/v2/notification/push-token` | 푸시 토큰 해제 |

## Data Models

응답 DTO (dto/response): `notification-response`, `notification-email-preview-response`(admin).

스키마: `notification`. NotificationType enum(breeder_approved, new_consult_request, new_review_registered 등).

## Correctness Properties

### Property 1: 본인 알림 한정
알림 조회/읽음/삭제는 인증된 수신자 본인 것만 대상으로 한다.
**Validates: Requirements 1.1**

### Property 2: 푸시 토큰 유일성
푸시 토큰 등록 시 동일 토큰이 다른 유저에 남아있지 않도록 정리한다(중복 제거).
**Validates: Requirements 1.2**

### Property 3: 미읽음 집계 정확성
unread-count는 읽음 처리 후 실제 미읽음 수와 일치한다.
**Validates: Requirements 1.3**

## Error Handling

- 없는 알림/권한 없음: `BadRequestException`(400).
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

목록/읽음/삭제/토큰 유스케이스 unit + e2e. 이벤트 구독→알림 생성 통합 테스트.
