# Design — inquiry 도메인

## Overview

문의(1:1 문의) 도메인. 사용자가 문의를 생성·조회·수정·삭제하고, 내 문의/브리더 문의 목록을 보며,
관리자/브리더가 답변을 등록한다.

상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. 인증 필수.

```
controller/  create, list, my, breeder, detail, update, delete, answer
application/use-cases/  문의 CRUD + 답변
infrastructure/* · repository/*  mongoose + mail(답변 알림)
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| POST | `/api/v2/inquiry` | 문의 생성 |
| GET | `/api/v2/inquiry` | 문의 목록 |
| GET | `/api/v2/inquiry/my` | 내 문의 |
| GET | `/api/v2/inquiry/breeder` | 브리더 문의 |
| GET | `/api/v2/inquiry/:inquiryId` | 문의 상세 |
| PATCH | `/api/v2/inquiry/:inquiryId` | 문의 수정 |
| DELETE | `/api/v2/inquiry/:inquiryId` | 문의 삭제 |
| POST | `/api/v2/inquiry/:inquiryId/answer` | 답변 등록 |

## Data Models

응답 DTO (dto/response): inquiry-create-response, inquiry-list-response, inquiry-detail-response.

스키마: `inquiry`.

## Correctness Properties

### Property 1: 작성자/권한 한정
문의 수정·삭제는 작성자, 답변은 권한 있는 주체(관리자/대상 브리더)만 가능하다.
**Validates: Requirements 1.1**

### Property 2: 상태 전이
답변 등록 시 문의 상태가 답변완료로 전이되고 알림/메일이 트리거된다.
**Validates: Requirements 1.2**

## Error Handling

- 없는 문의/권한 없음: `BadRequestException`(400).
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

문의 CRUD/답변 유스케이스 unit + e2e.
