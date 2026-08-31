# Design — ai-image 도메인

## Overview

AI 사진 콘테스트용 이미지 변환 도메인. 사용자가 반려동물 사진을 올리면 관리자가 등록한
**AI 필터**(도트 스타일 등)로 변환해 콘테스트에 출품한다.

- 관리자: 필터 CRUD + 저장 전 프롬프트 즉시 시험(미리보기)
- 사용자: 활성 필터 목록 → 원본 업로드 URL 발급 → 생성 요청 → 상태 폴링
- 결과물은 기존 `POST /api/v2/contest/entry` 에 파일키로 그대로 넘긴다 (**contest 도메인 무수정**)

위치: `src/api/service/ai-image/` + `src/api/admin/ai-image/`.
상태: 백엔드·AI Agent 구현 완료(dev). 프론트 미구현.

### 인프라 제약이 설계를 결정했다

운영 서버가 **2 vCPU / 8GB 단일 인스턴스**이고 그 안에서 이미 ffmpeg 트랜스코딩이 돈다.
OpenAI 이미지 변환을 HTTP 요청 경로에 태우면 API 응답이 막히므로,
긴 작업을 요청에서 분리하고 AI 처리를 **Python 프로세스로 격리**했다.

BullMQ 를 새로 붙이지 않은 이유: Kafka 인프라가 이미 있고 활성 등록돼 있었다.

## Architecture

```
[클라이언트]
   │ ① presign 요청
   ▼
[NestJS ai-image] ──② 버킷 직업로드 URL 발급──► S3 호환 버킷(iwinv)
   │ ③ Job 생성(PENDING) + Kafka emit                    ▲        ▲
   ├──► Kafka ai-image.request.v1 ──► [Python ai-agent]───┘(다운)  │(업로드)
   │                                      │ LangGraph 고정 워크플로
   ◄─── Kafka ai-image.result.v1 ◄────────┘ OpenAI Image Edit
   │ ④ Job 상태 갱신(SUCCEEDED/FAILED)
   └─► ⑤ 사용자 폴링 → ⑥ 결과 확정 후 contest 출품

어드민 필터 미리보기: NestJS ──gRPC(동기)──► ai-agent
```

**Kafka = 비동기 긴 작업, gRPC = 동기 즉시 호출.** 역할이 겹치지 않는다.
AI Agent 가 죽어도 사용자 생성 요청은 Kafka 에 쌓이고 어드민 미리보기만 503 이 된다.

버티컬 슬라이스 구성:

```
ai-image/
├── shared/       필터·Job 조회 Port, 파일키→URL 변환, repository (다른 슬라이스가 공유)
├── filters/      사용자용 활성 필터 목록
├── generation/   presign · 생성 요청 · 상태 폴링 · Kafka 결과 컨슈머
└── admin/        필터 CRUD + gRPC 미리보기 (admin 트리)
```

gRPC 클라이언트는 **admin 슬라이스에만** 배선한다. 사용자 경로는 Kafka 만 쓰므로
AI Agent 가 꺼져 있어도 동작해야 하고, 여기에만 의존시키면 장애가 미리보기 하나로 격리된다.

## Components and Interfaces

| Method | Path | 용도 |
|---|---|---|
| GET | `/api/v2/ai-image/filters` | 활성 필터 목록 (공개) |
| POST | `/api/v2/ai-image/upload-url` | 원본 업로드 presigned URL |
| POST | `/api/v2/ai-image/generation` | 생성 요청 |
| GET | `/api/v2/ai-image/generation/{jobId}` | 생성 상태 폴링 (본인 것만) |
| GET | `/api/v2/ai-image/generations` | 내 생성 이력 |
| GET | `/api/ai-image-admin/filters` | 필터 전체 목록 |
| POST | `/api/ai-image-admin/filter` | 필터 생성 |
| POST | `/api/ai-image-admin/filter/preview` | 프롬프트 즉시 시험 (gRPC 동기) |
| PATCH | `/api/ai-image-admin/filter/{filterId}` | 필터 수정 |
| DELETE | `/api/ai-image-admin/filter/{filterId}` | 필터 삭제 |
| POST | `/api/ai-image-admin/upload-url` | 썸네일·레퍼런스·미리보기 원본 업로드 URL |
| GET | `/api/ai-image-admin/agent/health` | AI Agent 가동 상태 (gRPC 동기) |
| GET | `/api/ai-image-admin/jobs` | 생성 작업 모니터링 (상태·사용자·필터 필터링) |

### 어드민 운영 경로가 닫혀 있어야 하는 이유

필터 CRUD 만으로는 어드민이 필터를 완성할 수 없다. `thumbnailFileName` 과
`referenceImageObjectKeys` 는 S3 키를 요구하는데 어드민에게 업로드 경로가 없으면
그 값을 채울 방법이 없고, 미리보기의 `inputObjectKey` 도 마찬가지다.
`upload-admin` 도메인은 조회·삭제만 제공하므로 여기서 자체 발급한다.

용도별로 키 경로를 나눠(`thumbnail`→`ai-image/filter`, `reference`→`ai-image/reference`,
`source`→`ai-image/source`) 고아 파일 정리 시 출처를 구분할 수 있게 한다.
MIME 허용 규칙은 사용자 생성 경로와 같아야 하므로 `shared` 의 키 서비스 한 곳에서 관리한다.

헬스체크는 **연결 실패도 200 + `UNREACHABLE`** 로 내려간다. 미리보기와 정반대 계약인데,
미리보기는 실패하면 재시도해야 할 일이지만 헬스체크는 죽었다는 사실 자체가 조회 결과이기 때문이다.
타임아웃도 미리보기(120초)와 달리 5초로 짧게 끊는다.

## Data Models

`ai_image_filters` — 관리자가 소유하는 필터 정의
: `name`, `description`, `thumbnailFileName`, `prompt`, `negativePrompt`, `model`,
  `outputSize`, `referenceImageObjectKeys[]`, `isActive`, `sortOrder`

`ai_image_jobs` — 생성 작업
: `userId`, `userRole`, `contestId`, `filterId`, `inputObjectKey`, `outputObjectKey`,
  `status`, `attempt`, `errorCode`, `completedAt`
  \+ **스냅샷** `promptSnapshot` · `negativePromptSnapshot` · `modelSnapshot` · `outputSizeSnapshot`

상태 전이: `PENDING → QUEUED → PROCESSING → SUCCEEDED | FAILED`

인덱스: `{userId, contestId}`(쿼터 집계), `{userId, createdAt:-1}`(이력)

**사용자 응답에는 프롬프트·모델·레퍼런스 키를 넣지 않는다** (운영 정보 보호).

## Correctness Properties

### Property 1: 필터 수정이 진행 중 작업을 흔들지 않는다
Job 생성 시점의 프롬프트·모델·출력크기를 스냅샷으로 복사한다.
관리자가 필터를 수정·삭제해도 이미 접수된 작업의 결과는 바뀌지 않는다.

### Property 2: 큐에 못 실은 요청은 대기 상태로 남지 않는다
`KafkaService.emit()` 은 **미연결 시 경고만 찍고 조용히 return** 한다.
그대로 쓰면 Job 이 `QUEUED` 로 영원히 멈춘다.
publisher 어댑터가 `isKafkaConnected()` 로 먼저 가드하고, 발행 실패 시 즉시
`FAILED(errorCode: QUEUE_UNAVAILABLE)` 로 확정해 사용자에게 보이게 한다.

### Property 3: 결과 중복 수신에 멱등하다
상태 갱신은 `{_id, status: {$in: [PENDING, QUEUED, PROCESSING]}}` 조건부 원자 업데이트다.
이미 `SUCCEEDED|FAILED` 인 Job 은 무시되므로 결과 메시지가 두 번 와도 최초 1회만 적용된다.

### Property 4: 컨슈머는 절대 throw 하지 않는다
`@EventPattern` 핸들러가 throw 하면 오프셋 커밋이 막혀 같은 메시지를 무한 재처리한다.
try/catch 로 감싸 로그만 남기고, 형식 오류·성공인데 결과키 누락 메시지는 폐기한다.

이 선택의 대가로 실패가 조용해지므로, `GET /api/ai-image-admin/jobs` 가 그 짝이다.
어드민 응답에는 프롬프트·모델 스냅샷을 포함한다 — 필터를 수정한 뒤에는 필터 정의만 봐서
그 작업이 무엇으로 돌았는지 알 수 없기 때문이다(사용자 응답에는 여전히 넣지 않는다).

### Property 5: 쿼터는 실패 건을 세지 않는다
사용자·콘테스트당 3회. 실패한 생성은 카운트에서 제외해 사용자가 손해보지 않게 한다.

## Error Handling

| errorCode | 의미 | 재시도 |
|---|---|---|
| `QUEUE_UNAVAILABLE` | Kafka 미연결로 발행 실패 | — (즉시 FAILED) |
| `INPUT_TOO_LARGE` | 원본이 상한 초과 | 안 함 |
| `INPUT_DOWNLOAD_FAILED` | 원본 키 없음 / S3 접근 실패 | 함 |
| `OPENAI_NOT_CONFIGURED` | API 키 미설정 | 안 함 |
| `OPENAI_CALL_FAILED` | 레이트리밋 등 호출 실패 | 함 |
| `OPENAI_EMPTY_RESPONSE` | 응답에 이미지 없음 | 함 |
| `OUTPUT_UPLOAD_FAILED` | 결과 업로드 실패 | 함 |

- 도트 후처리 실패는 에러가 아니다. 생성물을 그대로 살려 통과시킨다 —
  부가 단계 때문에 사용자 결과를 버리지 않는다.
- 어드민 미리보기: 생성 실패는 `200 + isSuccess:false + errorCode`,
  **에이전트 자체에 연결하지 못한 경우에만 503**. 어드민이 원인을 구분할 수 있게 나눴다.

## Testing Strategy

- e2e: 필터 CRUD 왕복, presign 발급, 큐 미연결 시 즉시 FAILED 실측, 상태 폴링 권한(본인 것만)
- 단위: Kafka 결과 컨슈머(멱등·폐기 조건), 쿼터 정책
- 미리보기·헬스체크 e2e 는 Port 를 대역으로 교체해 OpenAI 실호출·과금과 gRPC 기동을 피한다
- 어드민 작업 모니터링 e2e 는 작업을 컬렉션에 직접 시드한다. 조회 엔드포인트이므로
  검증 대상은 필터링·페이지네이션·응답 계약이고, 작업이 만들어지는 과정은
  generation e2e 가 이미 실측한다. 모니터링 테스트를 회원가입·큐 경로에 묶으면
  auth 계약이 바뀔 때 같이 깨진다
- 파일 참조 등록 e2e: AI 키가 `isReferenced` 로 나오는지 (고아 오분류 방지)

## 외부 구성

**Python AI Agent** — `ai-agent/` (같은 리포). Kafka 컨슈머 + gRPC 서버 단일 프로세스.
LangGraph 고정 파이프라인 `normalize → generate → pixelate → upload` (분기·자율판단 없음).
운영 제한: `AI_CONCURRENCY=1`, 재시도 1회, 입력 장축 2048px·10MB 상한.
자세한 내용은 [`ai-agent/README.md`](../../../ai-agent/README.md).

**gRPC 계약** — `proto/ai_agent.proto` (NestJS·Python 공유).
대용량 이미지 바이트는 주고받지 않고 S3 objectKey 만 교환한다.
`nest-cli.json` 에 assets 설정이 없어 `.proto` 가 `dist` 로 복사되지 않으므로,
`process.cwd()/proto` 로 읽고 Docker 이미지·rsync 전송 목록에 `proto/` 를 포함시킨다.

**`OPENAI_API_KEY` 는 ai-agent 컨테이너에만 존재해야 한다.**
Kafka 메시지·gRPC 응답·어드민 응답·로그 어디에도 실리지 않는다.
