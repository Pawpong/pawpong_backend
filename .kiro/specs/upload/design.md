# Design — upload 도메인

## Overview

파일 업로드 도메인. 단건/다중 이미지 업로드, 분양펫/부모펫/대표 사진 업로드, 삭제를 제공한다.
스마일서브 S3 호환 스토리지에 저장하고 signed URL/파일키를 반환한다.
관리자 측은 파일 목록·통계·**미참조(고아) 파일 판정**과 정리를 담당한다.

위치: `src/api/service/upload/` (업로드) + `src/api/admin/upload/` (관리·고아 판정).
버킷: `pawpong_s3` (구 `pawpong_bucket` 에서 변경. DB 에는 파일키만 저장하고
읽을 때 `SMILESERV_CDN_BASE_URL + fileName` 으로 조립하므로 데이터 마이그레이션은 불필요했다).

상태: 구현 완료(dev).

### 고아 파일 판정 — 새 도메인 추가 시 반드시 등록

미참조 판정은 **컬렉션 화이트리스트** 방식이라, 목록에 없는 키는 `isReferenced:false` 로
분류돼 관리자 화면에 "삭제 가능"으로 뜬다. 즉 **등록을 빠뜨리면 실제 삭제 사고**가 난다.

현재 등록된 참조 원천:

| 컬렉션 | 필드 |
|---|---|
| `breeders` | profileImageFileName, profile.representativePhotos, verification.documents |
| `available_pets` | photos |
| `parent_pets` | photoFileName |
| `adopters` | profileImageFileName |
| `banners` / `auth_banners` / `counsel_banners` | imageFileName |
| `ai_image_filters` | thumbnailFileName, referenceImageObjectKeys |
| `ai_image_jobs` | inputObjectKey, outputObjectKey |
| `contest_entries` | photoFileName, userProfileImageFileName |

수정 지점 3곳은 [`_conventions.md`](../_conventions.md#8-파일-참조-판정-고아-파일-삭제-방지) 참조.

> `contest_entries` 는 누락돼 있어 콘테스트 출품 사진이 이미 고아로 오분류되고 있었다(`6efe3eff`).
> **feed video 키(`videos/*`)는 아직 미등록** — 별도 과제로 남아 있다.

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
| DELETE | `/api/v2/upload` | 파일 삭제 |
| POST | `/api/v2/upload/available-pet-photos/{petId}` | 분양펫 사진 |
| POST | `/api/v2/upload/multiple` | 다중 업로드 |
| POST | `/api/v2/upload/parent-pet-photos/{petId}` | 부모펫 사진 |
| POST | `/api/v2/upload/representative-photos` | 대표 사진 업로드 |
| POST | `/api/v2/upload/single` | 단건 업로드 |
| DELETE | `/api/upload-admin/file` | 단일 파일 삭제 |
| GET | `/api/upload-admin/files` | 스토리지 파일 목록 조회 |
| DELETE | `/api/upload-admin/files` | 다중 파일 삭제 |
| POST | `/api/upload-admin/files/check-references` | 파일 DB 참조 확인 |
| GET | `/api/upload-admin/files/folder/{folder}` | 특정 폴더의 파일 목록 조회 |
| GET | `/api/upload-admin/files/referenced` | DB에서 참조 중인 모든 파일 조회 |
| DELETE | `/api/upload-admin/folder` | 폴더 전체 삭제 |

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
