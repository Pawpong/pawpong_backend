# Design — standard-question 도메인 (Admin)

## Overview

표준 상담 질문 도메인(관리자 전용). 브리더 상담 신청 폼의 기본이 되는 표준 질문을
목록 조회·수정·상태변경·순서변경·재시드(reseed)한다. 라우트 prefix `standard-question-admin`.
브리더 상담 폼(`breeder-management`)이 이 표준 질문을 기반으로 구성된다.

상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. 관리자 인증.

```
admin/controller/  standard-question-admin (list, update, status, reorder, reseed)
application/use-cases/  조회/수정/상태/순서/재시드
infrastructure/* · repository/*  mongoose
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/standard-question-admin` | 표준 질문 목록 |
| PATCH | `/api/v2/standard-question-admin/:id` | 질문 수정 |
| PATCH | `/api/v2/standard-question-admin/:id/status` | 질문 활성/비활성 |
| POST | `/api/v2/standard-question-admin/reorder` | 순서 변경 |
| POST | `/api/v2/standard-question-admin/reseed` | 시드 재적용 |

## Data Models

응답 DTO: 표준 질문 항목/목록. 스키마: `standard-question`(시드 데이터).

## Correctness Properties

### Property 1: 관리자 한정
모든 엔드포인트는 관리자 권한에서만 접근 가능하다.
**Validates: Requirements 1.1**

### Property 2: 순서 무결성
reorder는 질문 순서를 충돌 없이 일관되게 재배치한다.
**Validates: Requirements 1.2**

## Error Handling

- 비인가/없는 질문: 401·403 / 400.
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

수정/상태/순서/재시드 유스케이스 unit + e2e.
