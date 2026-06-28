# Design — feed 도메인 (video)

## Overview

숏폼 비디오 피드 도메인(`feed/video`). 비디오 목록/인기/상세/조회, 업로드(presigned + 완료),
HLS 스트리밍, 좋아요/상태, 댓글(작성/수정/삭제/조회/대댓글), 태그(인기/검색/추천),
내 비디오/좋아요 목록, 가시성 변경을 담당한다. 인코딩은 BullMQ 비동기 처리.

상태: 백엔드 구현 완료(dev). (프론트 2.0에는 해당 화면 미구현)

## Architecture

헥사고날 + BullMQ 프로세서. `controller → use-case → port → adapter → repository`.

```
video/controller/      list, popular, detail, view, upload, hls-stream, prefetch, like-command, like-status, liked-videos, comment-(create/update/delete/query), tag-catalog/search, ownership, library
video/application/use-cases/  각 기능 유스케이스
video/processors/      ffmpeg 인코딩 (BullMQ)
video/infrastructure/* · repository/*  mongoose + storage(HLS)
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/feed/videos` | 피드 목록 |
| GET | `/api/v2/feed/videos/popular` | 인기 |
| GET | `/api/v2/feed/videos/my/list` | 내 비디오 |
| GET | `/api/v2/feed/videos/:videoId` | 상세 |
| DELETE | `/api/v2/feed/videos/:videoId` | 삭제 |
| POST | `/api/v2/feed/videos/:videoId/view` | 조회수 |
| PATCH | `/api/v2/feed/videos/:videoId/visibility` | 가시성 변경 |
| POST | `/api/v2/feed/videos/upload-url` | 업로드 presigned URL |
| POST | `/api/v2/feed/videos/:videoId/upload-complete` | 업로드 완료 |
| GET | `/api/v2/feed/videos/stream/:videoId/:filename` | HLS 세그먼트 |
| POST | `/api/v2/feed/videos/stream/:videoId/prefetch` | 스트림 prefetch |
| POST | `/api/v2/feed/like/:videoId` | 좋아요 토글 |
| GET | `/api/v2/feed/like/:videoId/status` | 좋아요 상태 |
| GET | `/api/v2/feed/like/my/list` | 내 좋아요 목록 |
| POST | `/api/v2/feed/comment/:videoId` | 댓글 작성 |
| GET | `/api/v2/feed/comment/:videoId` | 댓글 목록 |
| GET | `/api/v2/feed/comment/:commentId/replies` | 대댓글 |
| PATCH/DELETE | `/api/v2/feed/comment/:commentId` | 댓글 수정/삭제 |
| GET | `/api/v2/feed/tag/popular` | 인기 태그 |
| GET | `/api/v2/feed/tag/search` | 태그 검색 |
| GET | `/api/v2/feed/tag/suggest` | 태그 추천 |

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

## Testing Strategy

업로드/조회/좋아요/댓글/태그 유스케이스 unit + e2e. 인코딩 프로세서는 통합 테스트.
