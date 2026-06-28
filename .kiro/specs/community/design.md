# Design — community 도메인

## Overview

펫 커뮤니티(SNS형 게시판) 백엔드 도메인. 입양자/브리더가 게시글을 작성·조회·소통하고
좋아요·북마크·댓글·신고·조회수를 처리한다. 관리자(admin 슬라이스)는 신고 처리 및 게시글 숨김을 담당한다.

핵심 특성:
- 작성자 다형성: `Adopter | Breeder` (`authorModel` + `authorId`)
- 노출 정책: 비활성(삭제/숨김) 게시글은 조회·상호작용 시 400
- 자산 URL: 사진은 storage signed URL로 변환해 응답
- 현재 사용자 기준 `isLiked / isSaved` 상태 포함(비로그인 false)

상태: 전 엔드포인트 구현 완료(dev). 최근 보강 — isLiked/isSaved, 조회수 중복 방지(#135/#137),
좋아요 알림(#136), 신고/관리자 숨김(#138).

## Architecture

헥사고날(본 레포 표준): `controller → use-case → port → adapter → repository`.

```
controller/*           얇은 컨트롤러 (라우팅·DTO 바인딩·유스케이스 호출)
application/use-cases/  유스케이스 1요청 = 1파일
application/ports/      읽기/쓰기/외부 경계 인터페이스
application/types/      command/result 내부 타입 (request DTO 누수 금지)
domain/services/        community-post-mapper, community-post-write-validator
infrastructure/*        mongoose/storage adapter (port 구현)
repository/*            mongoose 쿼리 캡슐화 (InjectModel 은 여기만)
dto/{request,response}  HTTP 경계 모델 + Swagger
admin/                  관리자 전용 슬라이스 (-admin 라우트)
swagger/index.ts        Swagger 명세 분리
```

컨트롤러 데코레이터: `community-public-controller`(공개·OptionalJwt), `community-protected-controller`(인증).

## Components and Interfaces

### 엔드포인트 (실측 — 컨트롤러 기준)

| Method | Path | 컨트롤러 | 인증 | 용도 |
|---|---|---|---|---|
| GET | `/api/v2/community/posts` | community-post-list | Optional | 목록(정렬/펫타입/카테고리/작성자) |
| GET | `/api/v2/community/posts/:postId` | community-post-detail | Optional | 상세(+댓글 프리뷰) |
| GET | `/api/v2/community/posts/:postId/comments` | community-post-comment | Optional | 댓글 목록 |
| GET | `/api/v2/community/posts/me/bookmarks` | community-post-bookmark | 인증 | 내 북마크 목록 |
| POST | `/api/v2/community/posts` | community-post-write | 인증 | 작성 |
| PATCH | `/api/v2/community/posts/:postId` | community-post-write | 인증 | 수정(작성자) |
| DELETE | `/api/v2/community/posts/:postId` | community-post-write | 인증 | 삭제(소프트, 작성자) |
| POST/DELETE | `/api/v2/community/posts/:postId/like` | community-post-like | 인증 | 좋아요/취소(+알림) |
| POST/DELETE | `/api/v2/community/posts/:postId/bookmark` | community-post-bookmark | 인증 | 북마크/취소 |
| POST | `/api/v2/community/posts/:postId/comments` | community-post-comment | 인증 | 댓글 작성 |
| PATCH/DELETE | `/api/v2/community/comments/:commentId` | community-post-comment | 인증 | 댓글 수정/삭제(작성자) |
| POST | `/api/v2/community/posts/:postId/view` | community-post-view-count | Optional | 조회수 증가 |
| POST | `/api/v2/community/posts/:postId/report` | community-post-report | 인증 | 신고 |
| (admin) | `/api/v2/community-admin/*` | admin/* | admin | 신고 목록/처리·게시글 숨김 |

### 유스케이스 (application/use-cases)

create/update/delete post · create/update/delete comment · get list/detail/comments/my-saved ·
like/unlike · save/unsave · increment-view-count · report-community-post.

### 포트 (application/ports)

post-reader/writer · comment-reader/writer · like · bookmark · report · author-reader · asset-url.

## Data Models

### 응답 DTO (dto/response)

- `CommunityPostCardDto`: postId, author{userId,nickname,profileImageUrl}, authorModel, title?,
  bodyExcerpt, primaryPhotoUrl?, photoUrls[], petType?, category?, likeCount, commentCount,
  saveCount, createdAt, isLiked, isSaved
- `CommunityPostDetailDto`: 카드 + body, viewCount, commentPreview[]
- `CommunityPostCommentDto`: commentId, postId, author{...}, parentCommentId, body, likeCount, createdAt
- `CommunityPostReportResponseDto`: postId, reported
- like/bookmark/delete response dto: postId + liked/saved/deleted

### 요청 DTO (dto/request)

- `CommunityPostReportRequestDto`: reason(enum: spam|inappropriate_content|false_info|hateful_content|other), description?(≤500)
- post create/update, comment create/update, list/comment query.

### 스키마 (schema)

`community-post`, `community-post-comment`, `community-post-like`, `community-bookmark`, `community-post-report`.

## Correctness Properties

### Property 1: 신고 멱등성
동일 유저가 동일 게시글을 중복 신고하면 신규 레코드를 만들지 않고 `reported: false`를 반환한다.
**Validates: Requirements 1.1**

### Property 2: 작성자 권한
게시글/댓글의 수정·삭제는 작성자 본인만 가능하다. 타인 시도는 거부한다.
**Validates: Requirements 1.2**

### Property 3: 소프트 삭제
삭제는 상태 전환이며 물리 삭제하지 않는다. 비활성 게시글은 조회·상호작용 시 400.
**Validates: Requirements 1.3**

### Property 4: 사용자 상태 정확성
응답 `isLiked/isSaved`는 요청 사용자 기준이며 비로그인 시 false.
**Validates: Requirements 1.4**

### Property 5: 조회수 단조 증가
조회수는 호출마다 단순 증가(dedup 없음)하며 감소하지 않는다.
**Validates: Requirements 1.5**

## Error Handling

- 없는/비활성 게시글: `BadRequestException`(400) — 본 레포 404 최소화 원칙.
- 권한 없음(타인 글 수정/삭제): 403/400.
- 모든 응답은 `ApiResponseDto<T>` 래핑, 예외는 전역 필터로 표준화.

## Testing Strategy

E2E(test/e2e): community / write / like / report / comment-write / report-admin.
신규/수정 유스케이스는 unit + e2e 보강.
