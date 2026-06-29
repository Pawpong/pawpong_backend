# Design — health 도메인 (System)

## Overview

헬스체크 도메인. 로드밸런서/배포(Blue-Green)·모니터링이 서버 가용성을 확인하는 경량 엔드포인트.
라우트 prefix `health`(비-v2), 인증 불필요.

상태: 구현 완료(dev).

## Architecture

최소 구조: `controller → use-case`. 외부 의존성 점검은 선택적.

```
controller/  health (GET /)
application/use-cases/  헬스 상태 조립
```

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/health` | 서버 헬스 상태 |

## Data Models

응답: 상태 페이로드(status, timestamp 등). 별도 스키마 없음.

## Correctness Properties

### Property 1: 무인증 가용성
인증 없이 200으로 빠르게 응답하며, 서버 기동 상태를 반영한다.
**Validates: Requirements 1.1**

## Error Handling

- 비정상 시 비-200 상태로 응답해 배포/모니터링이 감지하게 한다.

## Testing Strategy

헬스 엔드포인트 e2e(health e2e 보유).
