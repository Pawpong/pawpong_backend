# Design — adoption-application 도메인

## Overview

입양(상담) **신청서 제출** 도메인. 입양자가 특정 분양 동물에 대해 입양 신청서를 작성·제출한다.
제출 시 동의 항목(개인정보/기본돌봄/응급돌봄/가족동의)을 검증하고 신청 레코드를 생성한다.
조회/관리(입양자 측 목록·상세)는 `adopter`, 브리더 측 수신 관리는 `breeder-management` 도메인이 담당.

상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → port → adapter → repository`.

```
controller/            adoption-application 제출 컨트롤러
application/use-cases/ create-adoption-application
application/ports/      application writer, pet reader(검증용)
domain/services/        신청 동의/유효성 검증
infrastructure/*        mongoose adapter
```

컨트롤러: 인증(adopter) 필수.

## Components and Interfaces

| Method | Path | 인증 | 용도 |
|---|---|---|---|
| POST | `/api/v2/adoption-application` | adopter | 입양 신청서 제출 |

요청 필드: petId, adoptionPlan, familyMembers, privacyConsent, basicCareConsent,
emergencyCareConsent, allFamilyConsent.

## Data Models

응답 DTO: `CreateAdoptionApplicationResponseDto` — applicationId, status.

스키마: `adoption-application`(상담/입양 신청, 입양자·브리더 양측 임베딩).

## Correctness Properties

### Property 1: 필수 동의 강제
모든 필수 동의(privacy/basicCare/emergencyCare/allFamily)가 true가 아니면 신청을 거부한다.
**Validates: Requirements 1.1**

### Property 2: 대상 유효성
존재하고 분양 가능한 펫에 대해서만 신청이 생성된다.
**Validates: Requirements 1.2**

## Error Handling

- 동의 누락/없는 펫: `BadRequestException`(400).
- 응답은 `ApiResponseDto<T>` 래핑.

## Testing Strategy

제출 유스케이스 unit(동의 검증 분기) + e2e(성공/거부).
