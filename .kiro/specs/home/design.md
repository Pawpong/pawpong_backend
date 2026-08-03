# Design — home 도메인

## Overview

홈 화면 데이터 제공 도메인. 메인 배너, FAQ, 분양 가능 동물(요약)을 공개로 제공한다.
관리자(home-admin)는 배너/FAQ를 관리한다.

상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`. 공개(OptionalJwt).

```
controller/  home-banners, home-faqs, home-available-pets
application/use-cases/  배너/FAQ/분양가능 조회
infrastructure/* · repository/*  mongoose + storage(배너 이미지)
admin/  배너/FAQ 관리
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/home/available-pets` | 분양 가능 동물(요약) |
| GET | `/api/v2/home/banners` | 메인 배너 |
| GET | `/api/v2/home/faqs` | FAQ |
| POST | `/api/home-admin/banner` | 배너 생성 |
| PATCH | `/api/home-admin/banner/{bannerId}` | 배너 수정 |
| DELETE | `/api/home-admin/banner/{bannerId}` | 배너 삭제 |
| GET | `/api/home-admin/banners` | 배너 전체 목록 조회 (관리자) |
| POST | `/api/home-admin/faq` | FAQ 생성 |
| PATCH | `/api/home-admin/faq/{faqId}` | FAQ 수정 |
| DELETE | `/api/home-admin/faq/{faqId}` | FAQ 삭제 |
| GET | `/api/home-admin/faqs` | FAQ 전체 목록 조회 (관리자) |

## Data Models

응답 DTO (dto/response): banner-response, faq-response, available-pet-response.

스키마: `banner`, `faq`, `available-pet`.

## Correctness Properties

### Property 1: 노출 정책
비활성/숨김 배너·FAQ는 공개 응답에서 제외된다.
**Validates: Requirements 1.1**

### Property 2: 정렬 안정성
배너/FAQ는 지정된 순서(order)대로 정렬되어 반환된다.
**Validates: Requirements 1.2**

## Error Handling

- 데이터 없음은 빈 배열로 응답(에러 아님).
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

배너/FAQ/분양가능 조회 유스케이스 unit + e2e.
