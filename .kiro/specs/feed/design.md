# Design — feed 도메인 (video)

## Overview

숏폼 비디오 피드 도메인(`feed/video`). 비디오 목록/인기/상세/조회, 업로드(presigned + 완료),
HLS 스트리밍, 좋아요/상태, 댓글(작성/수정/삭제/조회/대댓글), 태그(인기/검색/추천),
내 비디오/좋아요 목록, 가시성 변경을 담당한다. 인코딩은 BullMQ 비동기 처리.

위치: `src/api/service/feed/` (관리자 기능 없음).
상태: 백엔드 구현 완료(dev). 프론트 2.0 은 API 레이어(`entities/feed/api`)만 있고 화면 미구현 —
태그 자동완성 훅(`searchTags`)이 준비돼 있으나 이를 쓰는 컴포넌트가 아직 없다.

## Architecture

헥사고날 + BullMQ 프로세서. `controller → use-case → port → adapter → repository`.

```
video/controller/      list, popular, detail, view, upload, hls-stream, prefetch, like-command, like-status, liked-videos, comment-(create/update/delete/query), tag-catalog/search, ownership, library
video/application/use-cases/  각 기능 유스케이스
video/processors/      ffmpeg 인코딩 (BullMQ)
video/infrastructure/* · repository/*  mongoose + storage(HLS)
tag/                   태그 조회·집계 슬라이스 (인기·자동완성·태그별 영상)
```

### 응답 봉투 (2026-08-02 정정)

feed 는 21개 엔드포인트 전부가 raw 객체를 반환하던 **유일한 예외 도메인**이었다.
프론트는 다른 도메인과 동일하게 `unwrap()` 으로 봉투를 기대해 댓글·태그 조회가 런타임에 실패했다.
`FEED_VIDEO_RESPONSE_MESSAGE_EXAMPLES` 에 전 엔드포인트 메시지가 이미 정의돼 있었고
컨트롤러 배선만 빠져 있던 상태라, 표준 봉투로 통일해 원래 의도된 계약을 완성했다(`128cc572`).

- 봉투 규격은 [`_conventions.md`](../_conventions.md#3-응답-봉투-필수) 참조.
- **HLS 스트림만 예외** — 바이너리라 봉투로 감싸면 재생이 깨진다.
  Swagger 도 이 엔드포인트만 `ApiRawEndpoint` 를 유지한다.

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| PATCH | `/api/v2/feed/comment/{commentId}` | 댓글 수정/삭제 |
| DELETE | `/api/v2/feed/comment/{commentId}` | 댓글 수정/삭제 |
| GET | `/api/v2/feed/comment/{commentId}/replies` | 대댓글 |
| GET | `/api/v2/feed/comment/{videoId}` | 댓글 목록 |
| POST | `/api/v2/feed/comment/{videoId}` | 댓글 작성 |
| GET | `/api/v2/feed/like/my/list` | 내 좋아요 목록 |
| POST | `/api/v2/feed/like/{videoId}` | 좋아요 토글 |
| GET | `/api/v2/feed/like/{videoId}/status` | 좋아요 상태 |
| GET | `/api/v2/feed/tag/popular` | 인기 태그 |
| GET | `/api/v2/feed/tag/search` | 태그 검색 |
| GET | `/api/v2/feed/tag/suggest` | 태그 추천 |
| GET | `/api/v2/feed/videos` | 피드 목록 |
| GET | `/api/v2/feed/videos/my/list` | 내 비디오 |
| GET | `/api/v2/feed/videos/popular` | 인기 |
| POST | `/api/v2/feed/videos/stream/{videoId}/prefetch` | 스트림 prefetch |
| GET | `/api/v2/feed/videos/stream/{videoId}/{filename}` | HLS 세그먼트 |
| POST | `/api/v2/feed/videos/upload-url` | 업로드 presigned URL |
| GET | `/api/v2/feed/videos/{videoId}` | 상세 |
| DELETE | `/api/v2/feed/videos/{videoId}` | 삭제 |
| POST | `/api/v2/feed/videos/{videoId}/upload-complete` | 업로드 완료 |
| POST | `/api/v2/feed/videos/{videoId}/view` | 조회수 |
| PATCH | `/api/v2/feed/videos/{videoId}/visibility` | 가시성 변경 |

## Data Models

응답 DTO (video/dto/response): video-response, like-response, comment-response, tag-response.

스키마: `video`, `video-like`, `video-comment`.

## Correctness Properties

### Property 1: 업로드 수명주기
presigned URL 발급 → 업로드 완료 콜백 → 인코딩 완료 후에만 비디오가 피드에 노출된다.
**Validates: Requirements 1.1**

### Property 2: 좋아요 토글 정확성
좋아요 토글은 멱등이며 status/카운트가 실제 상태와 일치한다.
**Validates: Requirements 1.2**

### Property 3: 소유권/가시성
삭제·가시성 변경은 소유자만 가능하며 비공개 비디오는 피드에서 제외된다.
**Validates: Requirements 1.3**

## Error Handling

- 없는/미완료 비디오: `BadRequestException`(400). HLS 스트림은 적절한 콘텐츠 타입/404 처리.
- 응답은 `ApiResponseDto<T>` 래핑(스트림 제외).

### 태그 엔드포인트 3종 구분 (혼동 주의)

세 경로가 이름이 비슷해 프론트가 실제로 잘못 연결한 이력이 있다.

| 경로 | 쿼리 | 반환 | 용도 |
|---|---|---|---|
| `tag/suggest` | `q` | `{ tag, videoCount }[]` | **자동완성 후보** |
| `tag/search` | `tag` (필수) | `{ videos, tag, pagination }` | 해당 태그가 달린 **영상 목록** |
| `tag/popular` | `limit` | `{ tag, videoCount }[]` | 인기 태그 |

- 프론트가 자동완성에 `tag/search?q=` 를 호출해 동작하지 않았고, `tag/suggest?q=` 로 정정했다.
- `tag` 쿼리에 `@Allow()` 만 걸려 있어 미지정 요청이 검증을 통과했고,
  유스케이스가 `undefined.trim()` 을 호출해 **400 이어야 할 요청이 500** 으로 나갔다.
  `@IsString` + `@IsNotEmpty` 로 정정(`128cc572`).

## Testing Strategy

업로드/조회/좋아요/댓글/태그 유스케이스 unit + e2e. 인코딩 프로세서는 통합 테스트.
