# Design — notice 도메인

## Overview

공지 게시판 도메인. 공개 공지 목록/상세를 제공한다. 관리자(notice-admin)가 등록/수정/삭제한다.

상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. 공개 조회.

```
controller/  notice-list, notice-detail
application/use-cases/  목록/상세 조회
infrastructure/* · repository/*  mongoose
admin/  공지 CRUD
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/notice` | 공지 목록(페이지네이션) |
| GET | `/api/v2/notice/{noticeId}` | 공지 상세 |
| GET | `/api/notice-admin` | 공지사항 목록 조회 (관리자) |
| POST | `/api/notice-admin` | 공지사항 생성 |
| GET | `/api/notice-admin/{noticeId}` | 공지사항 상세 조회 (관리자) |
| PATCH | `/api/notice-admin/{noticeId}` | 공지사항 수정 |
| DELETE | `/api/notice-admin/{noticeId}` | 공지사항 삭제 |

## Data Models

응답 DTO (dto/response): `notice-response`.

스키마: `notice`.

## Correctness Properties

### Property 1: 게시 상태 노출
게시(공개) 상태 공지만 공개 목록/상세에 노출된다.
**Validates: Requirements 1.1**

### Property 2: 정렬
목록은 최신순(또는 고정+최신) 정렬과 표준 페이지네이션을 따른다.
**Validates: Requirements 1.2**

## Error Handling

- 없는/비공개 공지: `BadRequestException`(400).
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

목록/상세 조회 유스케이스 unit + e2e.
