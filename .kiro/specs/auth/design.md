# Design — auth 도메인

## Overview

인증/회원가입 도메인. 소셜 로그인(Google/Kakao/Naver) 기반 인증, 토큰 갱신, 로그아웃,
휴대폰 인증, 중복 검사(email/nickname/브리더명), 소셜 신규 유저 확인, 회원가입 완료(입양자/브리더),
브리더 서류/프로필 업로드, 로그인/가입 배너 제공을 담당한다.

특성:
- 소셜 OAuth는 백엔드 콜백이 기존/신규 분기 후 리다이렉트(토큰 URL 전달).
- JWT Access + Refresh, 쿠키 기반.

상태: 구현 완료(dev). **실측 기준 2026-08-04.**

### 입양자 회원가입 단일화 (2026-08-04)

입양자 가입 엔드포인트가 둘로 갈라져 있었다.

| 옛 경로 | 태그 | 상태 |
|---|---|---|
| `POST v2/auth/register/adopter` | `인증` | 최소 필드(tempId·email·nickname·phone) |
| `POST v2/auth/register-adopter` | `인증 v2` | 약관·관심품종·상담 사전정보 포함 |

둘 다 `v2/auth` 아래인데 하나만 `인증 v2` 태그를 달아 Swagger 가 두 섹션으로 쪼개져 있었고,
**operationId 가 `registerAdopter` 로 중복**돼 클라이언트 코드 생성이 깨질 수 있었다.
관리자 API 를 빼면 전 도메인이 이미 v2 이므로 `v2` 를 별도 축으로 표기할 이유도 없다.

프론트 온보딩 폼(약관 동의 → 계정 정보 → 회원 정보 → 간단한 조사 양식)이 수집하는 필드와
대조한 결과 후자가 실제 플로우와 일치해, **경로는 `register/adopter`(브리더와 대칭), 계약은 후자**로
단일화하고 `인증 v2` 태그·`v2/` 슬라이스를 제거했다.

- `RegisterAdopterUseCase` = 단일 가입 유스케이스 (구 v2)
- `CreateAdopterFromSocialUseCase` = 구 최소 유스케이스. HTTP 경로는 없어졌지만
  `REGISTER_ADOPTER_AUTH_SIGNUP` 토큰으로 **`social/complete` 가 계속 소비**한다.

### 남은 중복 — `social/complete`

프론트는 아직 입양자 가입에 `POST v2/auth/social/complete` (`role: 'adopter'`) 를 쓴다.
이 경로는 최소 필드만 받으므로 폼이 수집한 약관 동의·관심 품종·상담 사전정보가 유실되고,
자기소개는 가입 후 `PATCH v2/profile/me` 로 따로 저장하는 우회가 들어가 있다.

프론트를 `register/adopter` 로 옮기면 한 번의 호출로 정리되지만, 운영 중인 가입 흐름이라
프론트 배포와 함께 진행해야 한다. **현재는 두 경로가 공존한다.**

## Architecture

헥사고날 + Passport 전략(Google/Kakao/Naver/JWT). admin 인증 슬라이스 분리.

```
controller/            social-*, phone, refresh-token, logout, check-user, register, banners
application/use-cases/ 로그인/토큰/검증/가입/업로드 유스케이스
strategy(common)/      google/kakao/naver/jwt
infrastructure/*        mongoose + redis(인증코드) + storage
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/auth/google` | 구글 로그인 |
| GET | `/api/auth/google/callback` | 구글 로그인 콜백 |
| GET | `/api/auth/kakao` | 카카오 로그인 |
| GET | `/api/auth/kakao/callback` | 카카오 로그인 콜백 |
| GET | `/api/auth/naver` | 네이버 로그인 |
| GET | `/api/auth/naver/callback` | 네이버 로그인 콜백 |
| POST | `/api/v2/auth/check-breeder-name` | 브리더 상호명 중복 |
| POST | `/api/v2/auth/check-email` | 이메일 중복 |
| POST | `/api/v2/auth/check-nickname` | 닉네임 중복 |
| GET | `/api/v2/auth/login-banners` | 로그인 배너 |
| POST | `/api/v2/auth/logout` | 로그아웃 |
| POST | `/api/v2/auth/phone/send-code` | 인증코드 발송 |
| POST | `/api/v2/auth/phone/verify-code` | 인증코드 확인 |
| POST | `/api/v2/auth/refresh` | 토큰 갱신 |
| GET | `/api/v2/auth/register-banners` | 가입 배너 |
| POST | `/api/v2/auth/register/adopter` | 입양자 가입 |
| POST | `/api/v2/auth/register/breeder` | 브리더 가입 |
| POST | `/api/v2/auth/social/check-user` | 소셜 신규/기존 유저 확인 |
| POST | `/api/v2/auth/social/complete` | 소셜 회원가입 완료(입양자/브리더) |
| POST | `/api/v2/auth/upload-breeder-documents` | 브리더 서류 업로드 |
| POST | `/api/v2/auth/upload-breeder-profile` | 브리더 프로필 업로드 |
| POST | `/api/auth-admin/login` | 관리자 로그인 |
| POST | `/api/auth-admin/refresh` | 관리자 토큰 갱신 |

## Data Models

응답 DTO (dto/response): token-response, social-check-user-response, register-adopter/breeder-response,
phone-verification-response, logout-response, verification-documents-response, admin-login-response.

스키마: `user`, `adopter`, `breeder`, `auth-banner`, `phone-whitelist`. 인증코드는 Redis 캐시.

## Correctness Properties

### Property 1: 토큰 무결성
유효한 refresh 토큰만 access 재발급이 가능하며, 만료/위조 토큰은 거부한다.
**Validates: Requirements 1.1**

### Property 2: 중복 검사 정확성
email/nickname/브리더명 중복 검사는 실제 저장소 상태를 반영한다.
**Validates: Requirements 1.2**

### Property 3: 휴대폰 인증 검증
verify-code는 발급된 코드와 유효시간 내에서만 성공한다.
**Validates: Requirements 1.3**

## Error Handling

- 인증 실패: 401. 검증 실패/중복: 400.
- 탈퇴/정지 계정은 소셜 콜백에서 에러 type으로 리다이렉트.
- 응답은 `ApiResponseDto<T>` 래핑.
  단 소셜 로그인 3종(`auth-{google,kakao,naver}-login.controller.ts`)은 **예외** —
  OAuth 리다이렉트 URL 을 반환하므로 봉투를 쓰지 않는다 (의도된 예외, 실측 확인).

## Testing Strategy

가입/로그인/토큰/휴대폰 인증 유스케이스 unit + e2e(register e2e 포함).
