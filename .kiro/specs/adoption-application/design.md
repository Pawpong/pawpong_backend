# Design — adoption-application 도메인

## Overview

입양(상담) **신청서 제출** 도메인 (Figma 122:3). 입양자가 특정 분양 펫에 대해 신청서를 작성·제출한다.
펫 ID는 이전 화면에서 결정되어 폼이 자동 채우고, 바디는 폼 입력(계획/가족/동의)만 받는다.
제출 시 동의 항목과 텍스트 유효성을 도메인 레벨에서 강제하고 신청 레코드를 `consultation_pending`으로 생성한다.

조회/관리는 분리: 입양자 측 목록·상세는 `adopter`, 브리더 측 수신/상태변경은 `breeder-management`.

상태: 구현 완료(dev).

## Architecture

헥사고날: `controller → use-case → (validator·mapper) → ports → adapter`.

```
controller/AdoptionApplicationCreateController        POST /v2/adoption-application
application/use-cases/CreateAdoptionApplicationV2UseCase
application/ports/adoption-application-writer.port    신청 영속
application/ports/adoption-application-context.port   펫/맥락 조회
domain/services/AdoptionApplicationValidatorService   cross-field 동의/텍스트 검증
domain/services/AdoptionApplicationPersistMapperService  command → 영속 모델 매핑
```

컨트롤러 데코레이터: `AdoptionApplicationProtectedController`(인증·adopter). `userId`는 `@CurrentUser`.

## Components and Interfaces

| Method | Path | 인증 | 용도 |
|---|---|---|---|
| POST | `/api/v2/adoption-application` | adopter | 입양 신청서 제출 |

### 요청 DTO — `CreateAdoptionApplicationRequestDto`

| 필드 | 타입 | 제약 | 설명 |
|---|---|---|---|
| petId | string | NotEmpty | 분양 펫 ID |
| adoptionPlan | string | NotEmpty, ≤1500 | 입양 계획 |
| familyMembers | string | NotEmpty, ≤500 | 가족 구성원 |
| privacyConsent | boolean | true 강제 | 개인정보 수집·이용 동의 |
| basicCareConsent | boolean | true 강제 | 기본 케어(예방접종/검진/훈련) 가능 |
| emergencyCareConsent | boolean | true 강제 | 응급(질병/사고 치료비) 감당 가능 |
| allFamilyConsent | boolean | true 강제 | 전 가족 입양 동의 |

> boolean 필드는 문자열 'true'/'false'도 변환 허용(`@Transform`).

## Data Models

### 응답 DTO — `CreateAdoptionApplicationResponseDto`
- `applicationId`: string — 생성된 신청 ID
- `status`: `'consultation_pending'` — 신규 신청은 항상 상담 대기

### 스키마
- `adoption-application` — 상담/입양 신청. 입양자·브리더 양측에 임베딩, `ApplicationStatus` enum
  (consultation_pending → consultation_completed → adoption_approved/adoption_rejected).

## Correctness Properties

### Property 1: 필수 동의 강제
privacy/basicCare/emergencyCare/allFamily 중 하나라도 false면 신청을 거부하고, 사유별 한국어 메시지로 400을 반환한다.
**Validates: Requirements 1.1**

### Property 2: 텍스트 유효성
adoptionPlan은 공백만일 수 없고(트림 후 비어있으면 거부), familyMembers는 빈 문자열일 수 없다.
**Validates: Requirements 1.2**

### Property 3: 대상 유효성
존재하고 분양 가능한 펫에 대해서만 신청이 생성된다.
**Validates: Requirements 1.3**

### Property 4: 초기 상태 고정
신규 신청의 status는 항상 `consultation_pending`으로 생성된다.
**Validates: Requirements 1.4**

## Error Handling

- 동의 누락/텍스트 공백: `BadRequestException`(400) — `AdoptionApplicationValidatorService`가 사유별 메시지로 던짐.
- 없는/비분양 펫: `BadRequestException`(400).
- 성공 응답은 `ApiResponseDto.success(result, "...")` 래핑.

## Testing Strategy

- unit: `AdoptionApplicationValidatorService`(동의 4종 false / 텍스트 공백 케이스),
  `CreateAdoptionApplicationV2UseCase`, persist-mapper.
- e2e: 제출 성공(consultation_pending) / 동의 누락 거부.
