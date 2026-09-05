# Design — participant 기반 1:1 DM

## Overview

채팅은 adopter↔breeder 상담방이 아니라 역할과 무관한 user↔user 1:1 DM이다.
그룹 채팅은 지원하지 않으며, 동일한 두 사용자 사이에는 상태와 무관하게 평생 하나의 방만 존재한다.
입양 신청은 방의 생성 조건이 아니라 부가 연결 정보이고 여러 신청이 한 방에 누적될 수 있다.

REST prefix는 `/api/v2/chat`, 실시간 송수신은 `/chat` Socket.IO namespace와 Kafka broadcast를 사용한다.

## API

| Method | Path                                   | 용도                                                     |
| ------ | -------------------------------------- | -------------------------------------------------------- |
| GET    | `/api/v2/chat/rooms`                   | 숨기지 않은 내 채팅방 목록                               |
| POST   | `/api/v2/chat/rooms`                   | `counterpartUserId` 상대와 방 생성 또는 기존 방 재활성화 |
| DELETE | `/api/v2/chat/rooms/{roomId}`          | 요청자 목록에서만 방 숨김                                |
| GET    | `/api/v2/chat/rooms/{roomId}/messages` | 참여자 전용 메시지 내역 및 읽음 처리                     |
| POST   | `/api/v2/chat/blocks/{userId}`         | 사용자 차단                                              |
| DELETE | `/api/v2/chat/blocks/{userId}`         | 사용자 차단 해제                                         |

`POST /rooms`의 `breederId`는 기존 클라이언트 호환용으로만 유지하며 신규 클라이언트는
`counterpartUserId`를 사용한다.

## Data Model

`chat_rooms`의 기준 필드:

- `participantIds[2]`: 참여 사용자 ID
- `participants[2]`: `{ userId, role }`
- `participantKey`: 두 ID를 정렬해 `:`로 결합한 값. unique partial index 적용
- `participantStates[2]`: 사용자별 `lastReadMessageId`, `lastReadAt`, `hiddenAt`
- `applicationIds[]`: 같은 DM에 연결된 입양 신청 ID 집합
- `status`: 마이그레이션 호환용 상태. 신규 방/재활성화 방은 `active`

`adopterId`, `breederId`, `applicationId`, `lastReadMessageId`는 마이그레이션 기간의
무중단 읽기와 기존 응답/이벤트 호환을 위해 optional legacy 필드로 남긴다.

차단 관계는 `chat_user_blocks(blockerId, blockedUserId)`에 유니크하게 저장한다.

## Policies

1. 두 사용자 순서와 역할 조합이 달라도 `participantKey`가 같으면 같은 방이다.
2. 브리더·입양자 모두 먼저 대화를 시작할 수 있고 같은 역할 간 DM도 허용한다.
3. 방 숨김은 요청자의 `participantStates.hiddenAt`만 기록한다. 상대방 기록은 유지한다.
4. 방 생성 재요청이나 새 메시지 송신은 양쪽 `hiddenAt`을 제거해 같은 방을 다시 표시한다.
5. 차단 중에는 어느 방향에서도 방 생성/재활성화/메시지 송신을 허용하지 않지만 기록 조회는 허용한다.
6. 정지·탈퇴 계정은 새 대화와 송신을 할 수 없고 상대도 그 계정에 송신할 수 없다.
7. 탈퇴 계정은 기존 목록에서 `탈퇴한 사용자`로 표시하고 프로필 이미지를 노출하지 않는다.
8. Socket.IO `join_room`은 JWT 인증뿐 아니라 DB 방 참여자 검증을 통과해야 한다.
9. 메시지의 `receiverId`와 `senderRole`은 클라이언트가 정하지 않고 서버가 방 참여자 정보로 결정한다.

## Legacy Migration

```bash
pnpm migrate:chat-participants -- --dry-run
pnpm migrate:chat-participants
```

스크립트는 멱등 실행할 수 있다. 같은 두 사용자의 legacy 방이 여러 개면 활성 방 중 최신 방을
대표 방으로 선택하고, 중복 방의 메시지 `roomId`와 `applicationId`를 대표 방에 합친다.
모두 닫힌 방이었다면 두 참여자에게 `hiddenAt`을 기록한 뒤 같은 방을 재활성화 가능한 상태로 둔다.
마지막에 기존 adopter/breeder partial unique index를 제거하고 `participantKey` unique index를 생성한다.

운영에서는 채팅 쓰기를 잠시 중단한 상태에서 다음 순서로 배포한다.

1. 백업 및 `--dry-run` 결과 확인
2. 새 애플리케이션 배포(트래픽 오픈 전 대기)
3. 실제 마이그레이션 실행 및 `skippedRoomIds`가 비어 있는지 확인
4. 채팅 트래픽 재개

## Correctness and Tests

- unit: participant 정책, 송신/읽음/숨김, 계정 상태·차단, legacy mapper
- gateway: 비참여자의 `join_room` 차단과 지원 역할 검증
- e2e: 역할 무관 생성, 역방향 동일 방, applicationIds 누적, 개인별 숨김/재사용,
  차단 양방향 정책, 탈퇴 표시, 읽음 마커, legacy 중복 방/메시지 병합
