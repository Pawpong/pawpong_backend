# 포퐁 리뉴얼 백엔드 구현 지시서 — Claude Code 전용

작성일: 2026-04-27  
대상 repo: https://github.com/Pawpong/pawpong_backend.git  
로컬 참고 경로: `/Users/hyeon-yongchan/.openclaw/workspace/external/pawpong_backend`  
관련 기능명세서: `포퐁_리뉴얼_페이지별_기능명세서_3.1-3.14.md`

---

## 0. Claude Code에게 주는 작업 목적

이 문서는 Claude Code가 포퐁 백엔드 repo를 분석하고, 리뉴얼 기능명세서를 구현 가능한 백엔드 작업 단위로 나누기 위한 전용 문서입니다.

중요한 원칙:

1. 기존 백엔드를 갈아엎지 말 것.
2. 기존 NestJS/MongoDB/Mongoose 구조를 최대한 재사용할 것.
3. 먼저 현재 controller/schema/service 구조를 확인한 뒤 최소 변경으로 구현할 것.
4. API 이름은 기존 컨벤션을 우선 따르되, 새 도메인은 명확한 REST 구조로 제안할 것.
5. DB schema 변경이 필요한 경우 migration/기존 데이터 호환성을 고려할 것.
6. 기능명세서의 모든 요구사항을 한 번에 구현하지 말고, 우선순위별로 분리할 것.

---

## 1. 현재 백엔드에서 확인된 주요 구조

현재 repo는 NestJS 기반이며, Mongoose schema를 사용합니다.

### 1.1 기존 재사용 가능 API 영역

아래 영역은 이미 존재하므로 새로 만들기보다 확장/응답 보강을 우선 검토하세요.

| 영역 | 주요 파일 | 재사용 방향 |
|---|---|---|
| 홈 | `src/api/home/home.controller.ts`, `src/api/home/home.service.ts` | 배너/FAQ/available pets 기존 기능 활용, `/home/summary` 추가 검토 |
| 브리더 탐색 | `src/api/breeder/breeder.controller.ts`, `src/api/breeder/breeder.service.ts`, `src/api/breeder/breeder-explore.service.ts` | 브리더 카드/마이홈 응답 보강 |
| 브리더 관리 | `src/api/breeder-management/breeder-management.controller.ts` | 분양글 작성/수정/상태 변경 확장 |
| 입양자 | `src/api/adopter/adopter.controller.ts` | 관심/신청/후기/프로필 기능 확장 |
| 입양 신청 | `src/schema/adoption-application.schema.ts` | 신청서 context, 채팅 연결, 취소 상태 검토 |
| 채팅 | `src/api/chat/*`, `src/schema/chat-room.schema.ts`, `src/schema/chat-message.schema.ts` | applicationId/petId 연결, 시스템 메시지, 이미지 메시지 확장 |
| 알림 | `src/api/notification/notification.controller.ts`, `src/schema/notification.schema.ts` | 신규 이벤트 타입 추가 |
| 업로드 | `src/api/upload/upload.controller.ts`, `src/common/storage/storage.service.ts` | 사진 업로드 재사용 |
| 영상 피드 | `src/api/feed/video/feed-video.controller.ts`, `src/schema/video.schema.ts` | 커뮤니티와 혼동하지 말 것. 텍스트 커뮤니티는 별도 도메인 권장 |

### 1.2 기존 schema 참고

| Schema | 파일 | 현재 의미 |
|---|---|---|
| `AvailablePet` | `src/schema/available-pet.schema.ts` | 분양 가능한 아이 |
| `ParentPet` | `src/schema/parent-pet.schema.ts` | 부모견/부모묘 |
| `Breeder` | `src/schema/breeder.schema.ts` | 브리더 계정/프로필/인증/통계 |
| `AdoptionApplication` | `src/schema/adoption-application.schema.ts` | 입양/상담 신청서 |
| `ChatRoom` | `src/schema/chat-room.schema.ts` | 입양자-브리더 채팅방 |
| `BreederReview` | `src/schema/breeder-review.schema.ts` | 브리더 후기 |
| `Notification` | `src/schema/notification.schema.ts` | 알림 |
| `Video` | `src/schema/video.schema.ts` | 영상 피드 |

---

## 2. 구현 우선순위

### P0 — 핵심 입양 전환 플로우

사용자 핵심 플로우:

```text
홈 → 입양 페이지 → 입양 상세 → 입양 신청서 → 입양 채팅
```

먼저 구현/검토해야 할 것:

1. 전체 입양 게시물 조회 API
2. 입양 상세 응답 보강
3. 입양 게시물 관심 기능
4. 입양 신청서 context API
5. 신청서와 채팅방 연결
6. 분양 상태 변경 시 채팅방 시스템 메시지 생성

### P1 — 브리더 플로우

브리더 핵심 플로우:

```text
브리더 마이홈 → 분양글 작성 → 분양 상세/수정 → 입양 상태 변경
```

필요 작업:

1. 브리더 마이홈 summary 응답
2. 분양글 작성 필드 확장
3. 건강/접종/유전병 검사 정보 저장
4. 부모 정보 연결 개선
5. 사육환경 사진+설명 저장
6. 상태 변경 이력/시스템 메시지

### P2 — 홈/탐색/알림

1. `/home/summary`
2. 인기 검색어
3. 브리더 탐색 응답 보강
4. 알림 타입 추가

### P3 — 커뮤니티/마이홈/저장/팔로우

1. 텍스트/사진 커뮤니티 도메인
2. 커뮤니티 저장하기
3. 마이홈 통합 조회
4. 팔로우 기능
5. 저장 목록

### P4 — 명예의 전당

1. 사진 업로드
2. 주간 투표
3. 계정당 1주 1회 투표 제한
4. 랜덤 투표 후보
5. 투표 후 결과 공개
6. 어제 TOP 3/지난주 TOP 3 집계

---

## 3. 페이지별 백엔드 구현 요구사항 요약

### 3.1 홈

필요 API 후보:

```http
GET /home/summary
GET /search/popular-keywords
GET /notification/unread-count
GET /chat/rooms/unread-count
```

`/home/summary` 응답에 포함할 것:

- banners
- popularKeywords
- categoryLinks: dog, cat, reptile, breederExplore
- hallOfFameWeeklyTop3: 지난주 투표율 TOP 3
- communityPreview: 커뮤니티 글 3개
- roleBasedCta: 입양자/브리더 분기
- faqs
- unreadNotificationCount
- unreadChatCount

기존 활용:

- `GET /home/banners`
- `GET /home/faqs`
- `GET /notification/unread-count`

### 3.2 입양 페이지

필요 API 후보:

```http
GET /available-pets
GET /available-pets/popular
GET /available-pets/search
POST /available-pets/:petId/favorite
DELETE /available-pets/:petId/favorite
```

주의:

- 기존은 브리더별 아이 조회가 강함.
- 리뉴얼에는 전체 공개 입양 게시물 탐색 API가 필요함.
- `petType`은 dog/cat 외 reptile 확장 여부 확인 필요.

### 3.3 입양 상세

필요 API 후보:

```http
GET /available-pets/:petId
POST /available-pets/:petId/view
POST /available-pets/:petId/favorite
DELETE /available-pets/:petId/favorite
GET /available-pets/:petId/share-meta
```

응답에 포함할 것:

- photos
- description
- status
- breed/gender/age
- tags
- healthInfo
- parentInfo
- careEnvironment
- breederSummary
- isFavorite
- favoriteCount
- viewCount
- chatCount/inquiryCount
- canApply

### 3.4 입양 신청서

필요 API 후보:

```http
GET /available-pets/:petId/application-context
POST /adopter/application
GET /adopter/applications
GET /adopter/applications/:applicationId
```

기존 활용:

- `AdoptionApplication`
- `POST /adopter/application`
- `GET /breeder/:id/application-form`

검토:

- 신청 즉시 채팅방 생성 여부
- 중복 신청 제한
- 신청 취소 상태 추가 여부

### 3.5 입양 채팅

필요 API 후보:

```http
POST /chat/rooms
GET /chat/rooms
GET /chat/rooms/:roomId
GET /chat/rooms/:roomId/messages
POST /chat/rooms/:roomId/messages
POST /chat/rooms/:roomId/attachments
```

보강:

- `ChatRoom`에 `applicationId` 외 `petId`를 명시적으로 둘지 검토
- room detail 응답에 petSummary, breederSummary, applicationStatus 포함
- 분양 상태 변경 시 시스템 메시지 생성
- 이미지 메시지 지원

### 3.6 분양글 작성 — 브리더 전용

기존 활용:

- `POST /breeder-management/available-pets`
- `POST /upload/available-pet-photos/:petId`
- `POST /breeder-management/parent-pets`

보강 schema 후보:

```ts
healthInfo: {
  vaccinationStatus: 'completed' | 'incomplete';
  vaccinationIncompleteReason?: string;
  vaccinationRecords: Array<{ vaccineName: string; vaccinatedAt: Date; round: number }>;
  geneticTestStatus: 'completed' | 'incomplete';
  geneticTestIncompleteReason?: string;
  geneticTestRecords: Array<{ testedAt: Date; organization: string; testName: string; result: string }>;
  checkupRecords: Array<{ checkedAt: Date; organization?: string; result: string }>;
}
careEnvironment: Array<{ imageFileName: string; description: string; order: number }>;
tags: string[];
```

### 3.7 분양 상세/수정 — 브리더 전용

필요 API 후보:

```http
GET /breeder-management/available-pets/:petId
PATCH /breeder-management/available-pets/:petId
PATCH /breeder-management/available-pets/:petId/status
DELETE /breeder-management/available-pets/:petId
```

보강:

- 작성자 권한 검증
- 상태 변경 시 연결 채팅방에 시스템 메시지 생성
- 상태 변경 이력 저장 검토

### 3.8 마이홈 공통

필요 API 후보:

```http
GET /myhome/me
GET /myhome/:userId
PATCH /myhome/me
POST /users/:userId/follow
DELETE /users/:userId/follow
GET /myhome/:userId/posts
GET /myhome/me/favorite-breeders
```

보강:

- 본인 여부에 따라 private/public 필드 분기
- 팔로우/팔로워 수
- BPM
- 작성 글
- 즐겨찾는 브리더는 본인만 조회 가능

### 3.9 브리더 마이홈

필요 API 후보:

```http
GET /myhome/breeders/:breederId
GET /breeder/:id/pets
```

기존 활용:

- `GET /breeder/:id`
- `GET /breeder/:id/pets`
- `GET /breeder/:id/reviews`

보강:

- breeder badge
- business location
- highlightedBreeder 여부
- 분양글 작성 버튼 노출 조건은 프론트에서 본인/브리더 여부로 처리 가능

### 3.10 저장 목록

필요 API 후보:

```http
GET /myhome/me/saved/pets
GET /myhome/me/saved/posts
GET /myhome/me/adopted-pets
```

보강:

- FavoritePet schema
- SavedCommunityPost schema
- 입양 완료 게시물과 adopter 연결 기준 정의

### 3.11 브리더 탐색

기존 활용:

- `GET /breeder/search`
- `POST /breeder/explore`
- `GET /breeder/popular`
- `GET /breeder/:id`

보강:

- card response에 badge, bpm, followerCount, availablePetCount, isFollowing 추가

### 3.12 커뮤니티

기존 영상 피드와 분리 권장.

필요 API 후보:

```http
POST /community/posts
GET /community/posts
GET /community/posts/popular
GET /community/posts/:postId
PATCH /community/posts/:postId
DELETE /community/posts/:postId
POST /community/posts/:postId/view
POST /community/posts/:postId/like
DELETE /community/posts/:postId/like
POST /community/posts/:postId/save
DELETE /community/posts/:postId/save
POST /community/posts/:postId/comments
GET /community/posts/:postId/comments
PATCH /community/comments/:commentId
DELETE /community/comments/:commentId
```

신규 schema 후보:

- CommunityPost
- CommunityComment
- CommunityLike
- SavedCommunityPost

### 3.13 명예의 전당

정책:

- 홈에서는 지난주 투표율 TOP 1~3 사진 미리보기
- 홈의 `이번주 투표하러가기` 클릭 시 명예의 전당 투표 페이지 이동
- 투표 페이지에서 사진+간단 소개 업로드 가능
- `투표하러가기` 버튼 클릭 시 랜덤 투표 후보 사진 노출
- 투표 전에는 투표수를 볼 수 없음
- 투표 후에만 투표수/투표율 확인 가능
- 계정당 1주 1회만 투표 가능
- 투표 페이지에는 어제 투표율 TOP 1~3 미리보기 노출

필요 API 후보:

```http
POST /hall-of-fame/entries
GET /hall-of-fame/entries
GET /hall-of-fame/random-entry
POST /hall-of-fame/entries/:entryId/vote
GET /hall-of-fame/my-vote-status
GET /hall-of-fame/yesterday-top
GET /hall-of-fame/weekly-top
GET /hall-of-fame/entries/:entryId/vote-result
```

신규 schema 후보:

- HallOfFameEntry
- HallOfFameVote
- HallOfFameWeeklyResult

중요 구현 조건:

- `HallOfFameVote`는 `(userId, weekKey)` unique index 필요
- vote-result API는 투표한 사용자에게만 결과 공개
- random-entry는 hidden/deleted 제외
- weekly-top은 지난주 결과, yesterday-top은 어제 기준 결과

### 3.14 알림

기존 알림 API 활용:

```http
GET /notification
GET /notification/unread-count
PATCH /notification/:id/read
PATCH /notification/read-all
DELETE /notification/:id
```

추가 알림 타입:

- 입양 신청 접수
- 입양 상태 변경
- 채팅 메시지
- 분양글 예약/완료 상태 변경
- 커뮤니티 댓글/좋아요/저장
- 팔로우
- 명예의 전당 선정/투표 결과
- 브리더 인증 결과

---

## 4. 새로 추가될 가능성이 높은 Schema 목록

우선 schema 설계 후보입니다. 실제 구현 전 기존 schema와 중복 여부를 반드시 확인하세요.

```text
FavoritePet
SavedCommunityPost
Follow
CommunityPost
CommunityComment
CommunityLike
HallOfFameEntry
HallOfFameVote
HallOfFameWeeklyResult
PopularSearchKeyword 또는 SearchLog
```

---

## 5. 기존 Schema 확장 후보

### AvailablePet 확장

현재 파일: `src/schema/available-pet.schema.ts`

확장 후보:

```text
petType: dog | cat | reptile
name
breed
gender
birthDate
status
photos[]
tags[]
description
viewCount
favoriteCount
chatCount/inquiryCount
healthInfo
careEnvironment[]
```

주의:

- 현재 `petType`이 `AvailablePet`에 직접 없고 breeder 쪽에 dog/cat 중심 구조가 있으므로 설계 확인 필요.
- 도마뱀을 포함하려면 breeder specialization/petType enum도 함께 확장해야 할 수 있음.

### ChatRoom 확장

현재 파일: `src/schema/chat-room.schema.ts`

확장 후보:

```text
applicationId
petId
lastReadMessageId
lastMessage
lastMessageAt
status
```

현재 `applicationId`는 optional로 존재합니다. `petId`를 추가할지, application을 통해 간접 조회할지 결정하세요.

---

## 6. Claude Code 작업 방식 권장

Claude Code에게 실제 작업을 시킬 때는 아래 순서로 시키는 것을 추천합니다.

### 1단계 — repo 분석만 수행

요청 예시:

```text
현재 pawpong_backend repo에서 AvailablePet, AdoptionApplication, ChatRoom, Breeder 관련 controller/service/schema 구조를 분석해줘. 코드 변경하지 말고, 리뉴얼 기능명세서 기준으로 어떤 파일을 수정해야 하는지 표로 정리해줘.
```

### 2단계 — P0 구현 계획 생성

요청 예시:

```text
입양 페이지/입양 상세/입양 신청/입양 채팅 P0 범위만 구현 계획을 작성해줘. 기존 API 재사용, 신규 API, schema 변경, 테스트 항목을 분리해줘. 아직 코드는 수정하지 마.
```

### 3단계 — 작은 단위로 구현

권장 순서:

1. `GET /available-pets` 공개 리스트 API
2. `GET /available-pets/:petId` 상세 응답 보강
3. FavoritePet 관심 기능
4. application-context API
5. 채팅방 summary 응답 보강
6. 상태 변경 시스템 메시지

### 4단계 — 테스트/검증

각 구현마다 최소 확인:

- unit test 또는 service test
- controller e2e 가능 여부
- 기존 API 깨짐 여부
- schema validation
- 인증/권한 guard

---

## 7. Claude Code에게 주의시킬 점

1. 기존 API route를 임의로 삭제하거나 이름 변경하지 말 것.
2. 기존 schema 필드를 breaking change로 바꾸지 말 것.
3. enum 확장은 기존 데이터와 호환되게 할 것.
4. 도마뱀/reptile 도입 시 breeder, breed, filter-options까지 영향 범위를 확인할 것.
5. 커뮤니티는 기존 video feed와 섞지 말고 별도 도메인으로 제안할 것.
6. Hall of Fame 투표는 반드시 계정당 1주 1회 unique constraint가 필요함.
7. 투표수는 투표 전 비공개, 투표 후 공개 정책을 API 레벨에서 강제할 것.
8. 브리더 전용 기능은 `userRole=breeder`뿐 아니라 인증 승인 상태도 확인할 것.
9. 파일 업로드는 기존 upload/storage service 재사용을 우선 검토할 것.
10. 변경 전후로 `npm test`, `npm run lint`, `npm run build` 또는 repo의 실제 스크립트를 확인할 것.

---

## 8. 최종 목표

Claude Code의 최종 산출물은 단순 코드 변경이 아니라 다음이 되어야 합니다.

1. 기존 백엔드 구조 분석 결과
2. 구현 우선순위별 작업 계획
3. 변경될 API 목록
4. 변경/추가될 schema 목록
5. 권한/상태/예외 처리 기준
6. 테스트 계획
7. 필요한 경우 실제 구현 PR 단위 제안

가장 먼저 구현할 범위는 P0입니다.

```text
입양 페이지 → 입양 상세 → 입양 신청서 → 입양 채팅
```

이 플로우가 안정적으로 연결된 뒤, 홈 summary, 브리더 마이홈, 저장 목록, 커뮤니티, 명예의 전당 순서로 확장하는 것을 권장합니다.
