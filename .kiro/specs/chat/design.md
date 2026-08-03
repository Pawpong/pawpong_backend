# Design — chat 도메인

## Overview

1:1 채팅 도메인. 채팅방 목록/메시지 조회, 채팅방 생성/삭제를 REST로 제공하고,
실시간 메시지 송수신은 socket.io(+ Kafka broadcast, 현재 조건부) 기반으로 동작한다.
라우트 prefix는 `/api/chat`(비-v2).

상태: 구현 완료(dev). 최근 보강 — 채팅 응답을 화면 계약으로 조립, 없는 브리더 신청 채팅 API 제거.

## Architecture

헥사고날 + 실시간(socket.io). Kafka consumer는 `KAFKA_ENABLED`일 때만 연결.

```
controller/  chat-room-query, chat-room-command
application/use-cases/  rooms 조회/메시지 조회/방 생성·삭제
gateway/socket  실시간 메시지 (socket.io)
infrastructure/* · repository/*  mongoose
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/chat/rooms` | 내 채팅방 목록 조회 |
| POST | `/api/v2/chat/rooms` | 채팅방 생성 또는 조회 |
| DELETE | `/api/v2/chat/rooms/{roomId}` | 채팅방 종료 |
| GET | `/api/v2/chat/rooms/{roomId}/messages` | 채팅 메시지 내역 조회 |

## Data Models

응답 DTO (dto/response):
- `ChatRoomResponseDto`: roomId, counterpart{nickname, profileImageUrl}, lastMessage, lastMessageAt, unreadCount, hasApplication 등 화면 계약
- `ChatMessageResponseDto`: messageId, content, senderId, createdAt 등

스키마: `chat-room`, `chat-message`.

## Correctness Properties

### Property 1: 참여자 한정
채팅방 목록/메시지/삭제는 해당 방 참여자만 접근 가능하다.
**Validates: Requirements 1.1**

### Property 2: 미읽음 집계 정확성
unreadCount는 수신자 기준 미읽음 메시지 수와 일치한다.
**Validates: Requirements 1.2**

### Property 3: 실시간/영속 일관성
socket.io로 전송된 메시지는 영속 저장되어 이후 메시지 조회에 반영된다.
**Validates: Requirements 1.3**

## Error Handling

- 없는 방/비참여자: `BadRequestException`(400)/권한 거부.
- ⚠️ **REST 응답이 표준 봉투를 쓰지 않는다** (실측 2026-08-03).
  `chat-room-query` / `chat-room-command` 컨트롤러가 `ApiResponseDto` 를 쓰지 않고
  결과를 그대로 반환한다. 프론트가 `unwrap()` 을 쓰면 실패한다.
  정리 대상이며 [`_conventions.md`](../_conventions.md#봉투를-쓰지-않는-응답--실측-현황-2026-08-03) 에 기록돼 있다.

## Testing Strategy

방 조회/메시지/생성·삭제 유스케이스 unit + e2e. 실시간은 게이트웨이 통합 테스트.
