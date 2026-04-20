# Pawpong Backend

Pawpong 서비스의 백엔드 API 서버입니다. `NestJS 11 + MongoDB + TypeScript` 기반으로 구성되어 있고, `헥사고날 아키텍처(Ports & Adapters)`와 `DomainError → AllExceptionsFilter` 예외 응답 규칙을 기준으로 정리돼 있습니다.

## Tech Stack

- **Framework**: NestJS 11 (Express) + TypeScript 5
- **Database**: MongoDB (Mongoose 8)
- **Cache/Queue**: Redis, BullMQ
- **Messaging**: Kafka (kafkajs)
- **Realtime**: Socket.IO
- **Auth**: JWT + Passport (Google/Naver/Kakao OAuth)
- **Storage**: S3 / Google Cloud Storage
- **Docs**: Swagger (OpenAPI 3)
- **Test**: Jest + `mongodb-memory-server`

## Quick Start

```bash
yarn install
yarn typecheck
yarn start:dev
```

프로덕션 빌드/실행:

```bash
yarn build
yarn start:prod
```

Swagger UI는 앱 실행 후 `/docs` 경로에서 확인할 수 있습니다.

## Useful Commands

```bash
# 타입 검사
yarn typecheck

# unit test
yarn test --runInBand

# e2e test
yarn test:e2e --runInBand --forceExit

# 리팩토링 하네스 (아키텍처/계약/리그레션 검증)
./scripts/harness/arch.sh
./scripts/harness/contract.sh
./scripts/harness/regression.sh
```

## Project Structure

```
src/
├── api/                     # 도메인별 API 모듈
│   ├── adopter/             # 입양자
│   ├── announcement/        # 긴급 공지
│   ├── app-version/         # 앱 버전 관리
│   ├── auth/                # 인증 (소셜 로그인 포함)
│   ├── breed/               # 품종
│   ├── breeder/             # 브리더 검색/상세
│   ├── breeder-management/  # 브리더 본인 관리
│   ├── chat/                # 1:1 채팅 (WebSocket)
│   ├── district/            # 지역
│   ├── feed/                # 동영상 피드 (HLS)
│   ├── filter-options/      # 필터 옵션
│   ├── health/              # 헬스체크
│   ├── home/                # 홈 배너/FAQ
│   ├── inquiry/             # 문의
│   ├── notice/              # 공지사항
│   ├── notification/        # 알림
│   ├── platform/            # 플랫폼 통계/시스템 헬스
│   ├── standard-question/   # 입양 신청 표준 질문
│   ├── upload/              # 파일 업로드
│   └── user/                # 사용자 관리
├── common/                  # 공통 필터/인터셉터/파이프/가드
└── main.ts
```

각 도메인 모듈은 다음 레이어를 따릅니다.

```
domain/         # 엔티티, 도메인 서비스, DomainError
application/    # use-case, port(in/out), dto, tokens
adapter/infrastructure/  # persistence, external, mapper
```

## Architecture Snapshot

- `module-definition` 패턴이 전 API 모듈에 적용돼 있습니다.
- `application/use-cases`의 HTTP 예외 / HTTP 유틸 직접 참조: 0건
- `application → dto/schema/infrastructure` 직접 import: 0건
- `test/` 밖의 `*.spec.ts`, `*.e2e-spec.ts`: 0건
- 공통 provider/export 패턴은 `token + useExisting + export` 기준으로 통일돼 있습니다.
- 전역 예외 응답은 [http-exception.filter.ts](src/common/filter/http-exception.filter.ts)의 `AllExceptionsFilter` 하나로 수렴돼 있습니다.

상세 진행 내역은 [docs/refactoring-roadmap.md](docs/refactoring-roadmap.md)에서 확인할 수 있습니다.

## Test Harness

공통 e2e 하네스는 [test-utils.ts](src/common/test/test-utils.ts)를 기준으로 맞춰져 있습니다.

- 인메모리 MongoDB(`mongodb-memory-server`)를 사용합니다.
- 실제 앱과 동일한 `ValidationPipe`, `HttpStatusInterceptor`, `AllExceptionsFilter`를 적용합니다.
- 테스트 환경에서는 외부 채널(Discord, 메일, 알림톡) 발송이 차단되고 스토리지는 인메모리 모드로 동작합니다.
- 계약 테스트는 `src/api/**/test/contract`, e2e는 `src/api/**/test/e2e` 구조를 사용합니다.

하네스 스크립트 상세 설명은 [docs/harness/README.md](docs/harness/README.md)에 정리돼 있습니다.

## Environment Variables

주요 환경 변수(민감값 제외, 로컬 개발 기준):

| 이름 | 설명 |
|---|---|
| `PORT` | HTTP 서버 포트 (기본 8080) |
| `NODE_ENV` | `development` / `production` / `test` |
| `MONGO_URI` | MongoDB 연결 문자열 |
| `REDIS_HOST`, `REDIS_PORT` | Redis 연결 정보 |
| `KAFKA_ENABLED`, `KAFKA_BROKER` | Kafka 활성화 여부와 브로커 주소 |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | JWT 서명 시크릿 |
| `AWS_REGION`, `S3_BUCKET_NAME` | S3 업로드 관련 설정 |

민감 값은 저장소에 커밋하지 않습니다. 로컬 개발 시에는 별도 `.env`를 사용합니다.

## Local Notes

- 전체 앱 실행 시 Redis/BullMQ는 로컬 Redis가 없으면 연결 경고가 남을 수 있습니다.
- Kafka는 `KAFKA_ENABLED=false`로 비활성화한 상태에서도 부팅이 가능합니다.
- e2e 하네스는 외부 스토리지/메일/디스코드에 의존하지 않도록 분리돼 있습니다.
- Swagger 및 일부 도메인 사용 예시는 각 도메인 README와 Swagger DTO에 남아 있습니다.

## Key Docs

- [docs/refactoring-roadmap.md](docs/refactoring-roadmap.md) — 리팩토링 진행 내역
- [docs/harness/README.md](docs/harness/README.md) — 테스트 하네스 가이드
- [src/common/test/test-utils.ts](src/common/test/test-utils.ts) — 공통 테스트 유틸
