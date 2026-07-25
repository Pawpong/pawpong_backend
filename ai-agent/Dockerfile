# 빌드 컨텍스트는 리포 루트다 (proto/ 를 NestJS 와 공유하기 때문).
#   docker build -f ai-agent/Dockerfile .
FROM python:3.12-slim AS builder
WORKDIR /build

# grpcio 는 slim 에 휠이 없는 경우가 있어 빌드 도구를 잠깐 넣는다 (런타임 스테이지엔 안 남는다)
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

# 런타임 의존성만 /install 로 격리한다
RUN pip install --no-cache-dir --prefix=/install \
    aiokafka==0.12.0 boto3==1.35.99 grpcio==1.68.1 protobuf==5.29.2 \
    langgraph==0.2.60 openai==1.59.7 pillow==11.1.0

# 스텁 생성 도구는 빌더에만 설치 — 생성물을 리포에 커밋하지 않기 위해 빌드 시점에 만든다
RUN pip install --no-cache-dir grpcio-tools==1.68.1

COPY proto ./proto
COPY ai-agent/app ./app

# grpc_tools 는 절대 import(`import ai_agent_pb2`)를 생성하므로 패키지 상대 import 로 고친다
RUN python -m grpc_tools.protoc -I proto --python_out=app --grpc_python_out=app proto/ai_agent.proto \
    && sed -i 's/^import ai_agent_pb2/from . import ai_agent_pb2/' app/ai_agent_pb2_grpc.py

FROM python:3.12-slim
WORKDIR /app

RUN groupadd -r aiagent && useradd -r -g aiagent aiagent

COPY --from=builder /install /usr/local
COPY --from=builder --chown=aiagent:aiagent /build/app ./app

USER aiagent

ENV PYTHONUNBUFFERED=1
EXPOSE 50051

# gRPC HealthCheck 로 생존을 확인한다.
# Kafka 미연결이어도 DEGRADED 로 정상 응답하므로 프로세스 생존 여부만 판정된다
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD python -c "import grpc, os; from app import ai_agent_pb2, ai_agent_pb2_grpc; ch=grpc.insecure_channel('localhost:'+os.getenv('AI_AGENT_GRPC_PORT','50051')); ai_agent_pb2_grpc.AiAgentServiceStub(ch).HealthCheck(ai_agent_pb2.HealthCheckRequest(), timeout=5)" || exit 1

CMD ["python", "-m", "app.main"]
