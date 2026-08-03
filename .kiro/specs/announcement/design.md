# Design — announcement 도메인

## Overview

공지/안내(팝업·배너형) 도메인. 공개 안내 목록/상세를 제공한다. 관리자(announcement-admin)가 관리한다.
(게시판형 `notice`와 구분: announcement는 팝업/배너 노출용)

상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. 공개 조회.

```
controller/  announcement-list, announcement-detail
application/use-cases/  목록/상세 조회
infrastructure/* · repository/*  mongoose
admin/  안내 CRUD
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/announcement/list` | 안내 목록 |
| GET | `/api/v2/announcement/{announcementId}` | 안내 상세 |
| POST | `/api/announcement-admin/announcement` | 공지사항 생성 |
| PATCH | `/api/announcement-admin/announcement/{announcementId}` | 공지사항 수정 |
| DELETE | `/api/announcement-admin/announcement/{announcementId}` | 공지사항 삭제 |
| GET | `/api/announcement-admin/announcements` | 공지사항 목록 조회 (관리자) |

## Data Models

응답 DTO (dto/response): `announcement-response`.

스키마: `announcement`.

## Correctness Properties

### Property 1: 노출 기간/상태
노출 기간·활성 상태인 안내만 공개 응답에 포함된다.
**Validates: Requirements 1.1**

## Error Handling

- 없는/비활성 안내: `BadRequestException`(400).
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

목록/상세 조회 유스케이스 unit + e2e.
