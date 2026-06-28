# Design — auth 도메인

## Overview

인증/회원가입 도메인. 소셜 로그인(Google/Kakao/Naver) 기반 인증, 토큰 갱신, 로그아웃,
휴대폰 인증, 중복 검사(email/nickname/브리더명), 소셜 신규 유저 확인, 회원가입 완료(입양자/브리더),
브리더 서류/프로필 업로드, 로그인/가입 배너 제공을 담당한다.

특성:
- 소셜 OAuth는 백엔드 콜백이 기존/신규 분기 후 리다이렉트(토큰 URL 전달).
- JWT Access + Refresh, 쿠키 기반.

상태: 구현 완료(dev).

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
| POST | `/api/v2/auth/social/check-user` | 소셜 신규/기존 유저 확인 |
| POST | `/api/v2/auth/social/complete` | 소셜 회원가입 완료(입양자/브리더) |
| POST | `/api/v2/auth/register/adopter` | 입양자 가입 |
| POST | `/api/v2/auth/register/breeder` | 브리더 가입 |
| POST | `/api/v2/auth/register-adopter` | (레거시 호환) 입양자 가입 |
| POST | `/api/v2/auth/refresh` | 토큰 갱신 |
| POST | `/api/v2/auth/logout` | 로그아웃 |
| POST | `/api/v2/auth/check-email` | 이메일 중복 |
| POST | `/api/v2/auth/check-nickname` | 닉네임 중복 |
| POST | `/api/v2/auth/check-breeder-name` | 브리더 상호명 중복 |
| POST | `/api/v2/auth/phone/send-code` | 인증코드 발송 |
| POST | `/api/v2/auth/phone/verify-code` | 인증코드 확인 |
| POST | `/api/v2/auth/upload-breeder-documents` | 브리더 서류 업로드 |
| POST | `/api/v2/auth/upload-breeder-profile` | 브리더 프로필 업로드 |
| GET | `/api/v2/auth/login-banners` | 로그인 배너 |
| GET | `/api/v2/auth/register-banners` | 가입 배너 |

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

## Testing Strategy

가입/로그인/토큰/휴대폰 인증 유스케이스 unit + e2e(register e2e 포함).
