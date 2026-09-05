# Pawpong AI Agent

반려동물 사진을 AI 필터로 변환하는 Python 에이전트.
NestJS 백엔드와 **Kafka(비동기)** + **gRPC(동기)** 두 경로로 붙는다.

```
NestJS ──ai-image.request.v1──► AI Agent ──► OpenAI Image Edit
   ▲                                │              │
   └──ai-image.result.v1────────────┘              ▼
                                            S3 호환 버킷(iwinv)

NestJS ──gRPC GenerateFilterPreview──► AI Agent   (어드민 미리보기 전용)
```

- **Kafka**: 사용자 생성 요청. 오래 걸리므로 HTTP 요청 경로에서 분리한다.
- **gRPC**: 어드민이 필터 저장 전에 프롬프트를 즉시 시험하는 짧은 호출.

두 경로가 겹치지 않는다. AI Agent 가 죽어도 사용자 생성 요청은 Kafka 에 쌓이고,
어드민 미리보기만 503 이 된다.

## 워크플로

`app/graph/workflow.py` — LangGraph 고정 파이프라인 (분기·자율 판단 없음).

```
normalize → generate → pixelate → upload
```

각 단계가 실패하면 `error_code` 를 채우고 즉시 종료한다. 단계별 코드가 그대로
`ai-image.result.v1` 의 `errorCode` 로 나가므로, 어디서 깨졌는지 결과만 보고 안다.

| errorCode | 의미 | 재시도 |
|---|---|---|
| `INPUT_TOO_LARGE` | 원본이 `AI_IMAGE_INPUT_MAX_BYTES` 초과 | 안 함 (몇 번 해도 같다) |
| `INPUT_DOWNLOAD_FAILED` | 원본 키 없음 / S3 접근 실패 | 함 |
| `OPENAI_NOT_CONFIGURED` | API 키 미설정 | 안 함 |
| `OPENAI_CALL_FAILED` | OpenAI 호출 실패 (레이트리밋 등) | 함 |
| `OPENAI_EMPTY_RESPONSE` | 응답에 이미지 없음 | 함 |
| `OUTPUT_UPLOAD_FAILED` | 결과 업로드 실패 | 함 |

후처리(`pixelate`) 실패는 에러가 아니다. 생성물을 그대로 살려 통과시킨다 —
부가 단계 때문에 사용자 결과를 버리지 않는다.

## 환경 변수

값은 `.env.*` / 배포 환경 변수로만 주입한다. 이 파일에는 **키 이름만** 적는다.

| 키 | 기본값 | 설명 |
|---|---|---|
| `OPENAI_API_KEY` | — | **이 컨테이너에만** 존재해야 한다. Kafka 메시지·gRPC 응답·로그 어디에도 나가지 않는다 |
| `OPENAI_IMAGE_MODEL` | `gpt-image-1` | 이미지 모델 |
| `OPENAI_TIMEOUT_SECONDS` | `180` | OpenAI 호출 타임아웃 |
| `KAFKA_BROKER` | `localhost:9092` | 컨테이너 안에서는 `kafka:29092` |
| `AI_AGENT_GROUP_ID` | `pawpong-ai-agent` | 컨슈머 그룹 |
| `AI_AGENT_GRPC_PORT` | `50051` | gRPC 리슨 포트 |
| `AI_CONCURRENCY` | `1` | 동시 생성 건수. 2 vCPU 인스턴스라 1 유지 권장 |
| `AI_MAX_ATTEMPTS` | `2` | 재시도 포함 총 시도 횟수 |
| `AI_IMAGE_INPUT_MAX_BYTES` | `10485760` | 원본 크기 상한(10MB) |
| `AI_IMAGE_INPUT_MAX_EDGE` | `2048` | 입력 장축 정규화 픽셀 |
| `SMILESERV_S3_ENDPOINT` | — | NestJS 와 동일 값 |
| `SMILESERV_S3_ACCESS_KEY` | — | 〃 |
| `SMILESERV_S3_SECRET_KEY` | — | 〃 |
| `SMILESERV_S3_BUCKET` | — | 〃 |

NestJS 쪽에는 `AI_AGENT_GRPC_URL`(기본 `localhost:50051`)과
`KAFKA_ENABLED=true` / `KAFKA_BROKER` 가 필요하다.

## 로컬 실행

MongoDB 는 Atlas 를 그대로 쓰므로 컨테이너로 띄우지 않는다.
인프라만 컨테이너로 올리고 NestJS 는 호스트에서 핫리로드한다.

```bash
docker compose -f docker-compose.dev.yml up -d   # redis, kafka(KRaft), kafka-ui, ai-agent
pnpm start:dev                                    # NestJS 포그라운드
```

`.env` 에 `KAFKA_ENABLED=true`, `KAFKA_BROKER=localhost:9092`,
`AI_AGENT_GRPC_URL=localhost:50051` 이 필요하다.

확인:

```bash
# gRPC 헬스체크
docker run --rm --network host -v "$PWD/proto:/proto:ro" fullstorydev/grpcurl \
  -plaintext -import-path /proto -proto ai_agent.proto \
  localhost:50051 pawpong.aiagent.v1.AiAgentService/HealthCheck

# Kafka 왕복 — 요청을 넣고 결과 토픽을 본다
docker exec pawpong_dev_kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 --topic ai-image.result.v1 --from-beginning

# 브로커 내용 확인: http://localhost:8090 (kafka-ui)
```

`status: DEGRADED` 는 `OPENAI_API_KEY` 나 Kafka 연결이 빠졌다는 뜻이다.
프로세스는 살아 있고, 생성 요청은 즉시 실패로 회신된다.

## 빌드

`proto/` 를 NestJS 와 공유하므로 **빌드 컨텍스트는 리포 루트**다.

```bash
docker build -f ai-agent/Dockerfile -t pawpong-ai-agent:local .
```

gRPC 스텁(`app/ai_agent_pb2*.py`)은 빌드 시점에 생성하며 리포에 커밋하지 않는다.

## 배포

`deploy.sh` 가 `.env.production` 의 `KAFKA_ENABLED=true` 를 확인하고
`--profile kafka` 로 zookeeper·kafka·ai-agent 를 띄운다.
Blue-Green 스왑과 무관한 사이드카라 `--no-deps` 로 앱 컨테이너를 건드리지 않으며,
앱 교체 중에도 Kafka 에서 계속 소비한다.
