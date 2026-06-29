# Design — upload 도메인

## Overview

파일 업로드 도메인. 단건/다중 이미지 업로드, 분양펫/부모펫/대표 사진 업로드, 삭제를 제공한다.
스마일서브 S3 호환 스토리지(pawpong_bucket)에 저장하고 signed URL/파일키를 반환한다.

상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter(storage)`. 인증 필수.

```
controller/  single, multiple, representative-photos, available-pet-photos, parent-pet-photos, delete
application/use-cases/  업로드/삭제
infrastructure/  storage adapter (S3 호환), sharp/heic 이미지 처리
admin/  업로드 관리
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| POST | `/api/v2/upload/single` | 단건 업로드 |
| POST | `/api/v2/upload/multiple` | 다중 업로드 |
| POST | `/api/v2/upload/representative-photos` | 대표 사진 업로드 |
| POST | `/api/v2/upload/available-pet-photos/:petId` | 분양펫 사진 |
| POST | `/api/v2/upload/parent-pet-photos/:petId` | 부모펫 사진 |
| DELETE | `/api/v2/upload` | 파일 삭제 |

## Data Models

응답 DTO (dto/response): `upload-response`(url/filename/size 등).

스토리지: S3 호환(pawpong_bucket). CDN URL ↔ 파일키 변환 시 `pawpong_bucket/` 접두사 방어.

## Correctness Properties

### Property 1: 형식/용량 검증
허용 이미지 형식·용량 한도 내 파일만 업로드된다(heic→webp 변환 포함).
**Validates: Requirements 1.1**

### Property 2: 키/URL 일관성
반환되는 URL과 파일키는 실제 저장 위치와 일치하며 재변환이 멱등이다.
**Validates: Requirements 1.2**

## Error Handling

- 파일 없음/형식 위반/용량 초과: `BadRequestException`(400).
- multipart 전송 필수, 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

업로드/삭제 유스케이스 unit + e2e(형식/용량 경계).
