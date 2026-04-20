# Pawpong Backend

Pawpong 백엔드 API 서버입니다. `NestJS + MongoDB` 기반으로 구성되어 있고, 현재 코드는 `controller -> use-case -> port -> adapter` 흐름과 `DomainError + AllExceptionsFilter` 예외 응답 규칙을 기준으로 정리돼 있습니다.

## Quick Start

```bash
yarn install
yarn typecheck
yarn start:dev
```

프로덕션 실행:

```bash
yarn build
yarn start:prod
```

## Useful Commands

```bash
# 타입 검사
yarn typecheck

# unit test
yarn test --runInBand

# e2e test
yarn test:e2e --runInBand --forceExit

# 공통 리팩토링 하네스
./scripts/harness/arch.sh
./scripts/harness/contract.sh
./scripts/harness/regression.sh
```

## Architecture Snapshot

- `module-definition` 패턴이 전 API 모듈에 적용돼 있습니다.
- production 기준 `application/use-cases`의 HTTP 예외/HTTP 유틸 참조는 `0건`입니다.
- production 기준 `application -> dto/schema/infrastructure` 직접 import는 `0건`입니다.
- production 기준 `test/` 밖 `*.spec.ts`, `*.e2e-spec.ts`는 `0건`입니다.
- 공통 provider/export 패턴은 `token + useExisting + export` 기준으로 통일돼 있습니다.
- 전역 예외 응답은 [http-exception.filter.ts](/Users/kscold/Desktop/pawpong_backend/src/common/filter/http-exception.filter.ts:1)의 `AllExceptionsFilter` 하나로 수렴돼 있습니다.

상세 진행 내역은 [refactoring-roadmap.md](/Users/kscold/Desktop/pawpong_backend/docs/refactoring-roadmap.md:1)에서 확인할 수 있습니다.

## Test Harness

공통 e2e 하네스는 [test-utils.ts](/Users/kscold/Desktop/pawpong_backend/src/common/test/test-utils.ts:1)를 기준으로 맞춰져 있습니다.

- 인메모리 MongoDB를 사용합니다.
- 실제 앱과 같은 `ValidationPipe`, `HttpStatusInterceptor`, `AllExceptionsFilter`를 적용합니다.
- 테스트 환경에서는 외부 채널 발송을 막기 위해 Discord, 메일, 알림톡 경고를 줄이고, 스토리지는 인메모리 모드로 동작합니다.
- 계약 테스트는 `src/api/**/test/contract`, e2e는 `src/api/**/test/e2e` 구조를 사용합니다.

하네스 스크립트 설명은 [docs/harness/README.md](/Users/kscold/Desktop/pawpong_backend/docs/harness/README.md:1)에 정리돼 있습니다.

## Local Notes

- 전체 앱 실행 시 Redis/BullMQ는 로컬 Redis가 없으면 연결 경고가 남을 수 있습니다.
- e2e 하네스는 외부 스토리지/메일/디스코드에 의존하지 않도록 분리돼 있습니다.
- 스웨거나 일부 도메인 사용 예시는 각 도메인 README와 Swagger DTO에 남아 있습니다.

## Key Docs

- [docs/refactoring-roadmap.md](/Users/kscold/Desktop/pawpong_backend/docs/refactoring-roadmap.md:1)
- [docs/harness/README.md](/Users/kscold/Desktop/pawpong_backend/docs/harness/README.md:1)
- [src/common/test/test-utils.ts](/Users/kscold/Desktop/pawpong_backend/src/common/test/test-utils.ts:1)
