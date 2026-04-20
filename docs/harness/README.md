# Local Harness README

이 문서는 로컬 리팩토링 하네스의 현재 동작을 설명하는 tracked 문서입니다.

## Goal

리팩토링 중에도 아래 규칙이 깨지지 않도록 빠르게 검증합니다.

- API status code
- response `message`
- response `data` shape
- pagination shape
- role / guard 동작
- architecture boundary

## Scripts

- `./scripts/harness/arch.sh`
  타입 검사와 아키텍처 규칙 스캔을 수행합니다.
- `./scripts/harness/contract.sh`
  도메인별 contract e2e를 실행합니다.
- `./scripts/harness/regression.sh`
  `arch -> unit -> e2e -> contract` 순서로 로컬 회귀 검사를 수행합니다.

## Current Layout

- unit spec: `src/api/**/test/**`
- e2e spec: `src/api/**/test/e2e/*.e2e-spec.ts`
- contract spec: `src/api/**/test/contract/*.e2e-spec.ts`
- 공통 테스트 하네스: `src/common/test/test-utils.ts`

`createTestingApp()`은 아래를 자동으로 맞춥니다.

- 인메모리 MongoDB 사용
- 실제 앱과 동일한 `ValidationPipe`
- 실제 앱과 동일한 `HttpStatusInterceptor`
- 실제 앱과 동일한 `AllExceptionsFilter`
- 테스트 모드용 인메모리 스토리지
- 외부 알림 채널 경고 최소화

## Default Domains

도메인을 넘기지 않으면 기본 대상은 아래 4개입니다.

- `adopter`
- `user-admin`
- `breeder-management`
- `breeder`

## Usage

```bash
./scripts/harness/arch.sh adopter user-admin
./scripts/harness/contract.sh breeder-management breeder
./scripts/harness/regression.sh adopter breeder-management
```

## Notes

- `breeder-management` public e2e는 현재 여러 파일로 분리돼 있어서 하네스가 해당 파일들을 모두 묶어 실행합니다.
- local Redis가 없으면 전체 앱 실행이나 일부 e2e에서 BullMQ 연결 경고가 남을 수 있습니다.
