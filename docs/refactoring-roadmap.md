# Refactoring Roadmap

## Goal

`main` 브랜치의 응답 형식과 동작은 유지한 채, `refactoring` 브랜치에서 점진적으로 헥사고날 + DDD 스타일로 구조를 정리한다.

## Guardrails

- 외부 API 응답 스키마는 유지한다.
- URL, HTTP method, 인증 정책은 유지한다.
- 리팩토링은 도메인 단위로 나눈다.
- 각 도메인 리팩토링 후 타입체크와 관련 테스트를 통과시킨다.
- 인프라 세부사항은 application/domain 레이어 밖으로 밀어낸다.

## Target Structure

각 도메인은 아래 구조를 기본 템플릿으로 사용한다.

```text
domain/
  entities/
  value-objects/
  events/
  services/
application/
  ports/
  use-cases/
infrastructure/
  adapters/
  repositories/
  event-handlers/
presentation/
  controllers/
  dto/
```

Nest 특성상 controller/module은 당분간 기존 위치를 유지할 수 있지만, 내부 의존 방향은 아래를 따른다.

```text
controller -> use-case -> port -> adapter
controller -> use-case -> domain
```

## Cross-Cutting Rules

- DTO 이름은 `행위 + RequestDto`, `행위 + ResponseDto` 패턴으로 통일한다.
- 외부 API 입출력 계약은 `class DTO`로 표현하고, controller 경계에서만 사용한다.
- 내부 단순 데이터 계약은 `interface` 대신 `type`을 우선 사용한다.
- Nest DI 경계는 `type/interface + symbol token` 조합을 기본으로 사용하고, 런타임 토큰은 계약 파일과 분리한다.
- `interface`는 외부 라이브러리 타입 보강, 다중 구현이 분명한 순수 TypeScript 계약 등 꼭 필요한 곳에만 제한적으로 사용한다.
- 비즈니스 규칙은 service가 아니라 use-case 또는 domain service로 이동한다.
- repository는 mongoose model 직접 접근을 숨기는 thin abstraction으로 유지한다.
- builder는 복잡한 응답 조립이나 notification payload 조립처럼 조합 책임이 큰 곳에만 쓴다.
- guard/interceptor/filter/logger는 AOP 성격으로 분리하고, use-case 안에 섞지 않는다.
- 공통화는 "폴더가 비슷하다"가 아니라 "의미와 규칙이 진짜 같다"는 기준으로만 한다.
- 공통 모듈로 뺄 대상은 최소 2개 이상 도메인에서 같은 규칙으로 반복되는 경우로 제한하고, 그 전에는 도메인 내부에 둔다.

## Recommended Order

1. `health`
2. `auth`
3. `upload`
4. `notification`
5. `adopter`
6. `breeder`
7. `breeder-management`
8. admin 계열

## Current Progress

`refactoring` 브랜치는 초기 로드맵 기준의 큰 구조 작업을 사실상 마무리한 상태다.

### Completed Snapshot

- 전 도메인에서 `controller -> use-case -> port -> adapter` 의존 방향을 기본 규칙으로 맞췄다.
- `src/api` 기준 `*.module.ts`와 `*.module-definition.ts`가 `28/28`로 일치한다.
- production 기준 `application/use-cases` 안의 Nest HTTP 예외 참조는 `0건`이다.
- production 기준 `presentation.service`, `response-service`, `response-mapper` 네이밍 잔량은 `0건`이다.
- `*.spec.ts`, `*.e2e-spec.ts`가 `test/` 밖에 남아 있는 케이스는 `0건`이다.
- 공통 provider/export 패턴은 `token + useExisting + export` 기준으로 맞췄다.
- 전역 예외 응답은 `AllExceptionsFilter` 하나로 수렴했고, guard/pipe도 `DomainError` 기준으로 통일했다.

### Domain Coverage

- public/admin API 전반이 use-case 직접 호출 구조로 바뀌었다.
- `auth`, `upload`, `notification`, `adopter`, `breeder`, `breeder-management`, `announcement`, `notice`, `inquiry`, `feed`, `app-version`, `district`, `breed`, `platform-admin`, `user-admin`, `notification-admin`, `standard-question`, `home`, `filter-options`, `health`까지 리팩토링 흐름을 반영했다.
- 조회 응답 조립 책임은 mapper/assembler/result-mapper/builder로 재명명해 역할 단위로 쪼갰다.
- social callback, HLS streaming, logout cookie 같은 HTTP 특화 흐름은 presentation interceptor/factory로 이동했다.
- domain/application/infrastructure 경계에서 schema, DTO, storage, social callback, notification dispatch, signed URL 조립 같은 인프라 결합을 분리했다.

### Test & Harness

- 도메인별 unit/e2e 보강과 함께 공통 하네스 `src/common/test/test-utils.ts`를 기준으로 테스트 앱 구성을 통일했다.
- `src/common/test`에는 pipe, guard, strategy, alimtalk admin 공통 스펙을 두어 cross-cutting 규칙을 고정했다.
- 리팩토링 중 추가한 대표 보강 범위는 social callback, JWT strategy/guard, upload admin, feed video/tag, inquiry, app-version, common exception/filter 흐름이다.

### Remaining Work

- 구조 리팩토링 자체보다는 문서/테스트 보강, naming polish, 운영 하네스 안정화가 남은 단계다.
- Redis/BullMQ, Discord webhook, AWS 자격증명 같은 외부 의존 경고는 테스트 환경에서 여전히 로그로 남을 수 있다.
- strict DDD 관점의 `entities / value-objects / events` 세분화는 일부 도메인에서 여지를 남겨두고 있으며, 현재는 실용적인 헥사고날 경계 정리에 초점을 둔 상태다.
