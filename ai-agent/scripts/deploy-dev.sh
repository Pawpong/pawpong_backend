#!/usr/bin/env bash
# dev 서버(pm2)에 AI Agent 를 배포한다. dev-deploy.yml 이 원격에서 실행한다.
#
# Docker 없이 uv 로 Python 3.12 가상환경을 만들고 pm2 로 띄운다 — dev 서버는 NestJS 도 pm2 로 돌고,
# Kafka·S3·OpenAI 설정을 백엔드와 같은 .env 에서 읽는다.
# gRPC 스텁은 운영 Dockerfile 과 같은 방식으로 배포 시점에 생성한다 (리포에 커밋하지 않음).
set -euo pipefail

AGENT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$AGENT_DIR"

export PATH="$HOME/.local/bin:$PATH"
if ! command -v uv >/dev/null 2>&1; then
    echo "[ai-agent] uv 설치"
    curl -LsSf https://astral.sh/uv/install.sh | sh
fi

echo "[ai-agent] Python 3.12 가상환경 준비"
uv venv --quiet --allow-existing --python 3.12 .venv
# 의존성 버전은 pyproject.toml(운영 Dockerfile 과 동일 핀)을 따른다
uv pip install --quiet --python .venv/bin/python -r pyproject.toml grpcio-tools==1.68.1

echo "[ai-agent] gRPC 스텁 생성"
.venv/bin/python -m grpc_tools.protoc -I ../proto --python_out=app --grpc_python_out=app ../proto/ai_agent.proto
sed -i.bak 's/^import ai_agent_pb2/from . import ai_agent_pb2/' app/ai_agent_pb2_grpc.py && rm -f app/ai_agent_pb2_grpc.py.bak

echo "[ai-agent] pm2 재시작"
pm2 restart pawpong-ai-agent --update-env 2>/dev/null \
    || pm2 start scripts/run_with_env.py --name pawpong-ai-agent --cwd "$AGENT_DIR" \
        --interpreter "$AGENT_DIR/.venv/bin/python" \
        --output "$HOME/pawpong-ai-agent.log" --error "$HOME/pawpong-ai-agent.log" --merge-logs --time
pm2 save --force

# 연결 가능 여부는 실패로 막고, DEGRADED(키·Kafka 누락)는 경고로 남긴다.
# 백엔드는 에이전트 없이도 동작하므로 설정 누락 때문에 dev 배포 전체를 막지는 않는다.
echo "[ai-agent] gRPC 헬스체크"
PORT="${AI_AGENT_GRPC_PORT:-50051}"
for i in $(seq 1 30); do
    if STATUS=$(.venv/bin/python - "$PORT" <<'PY' 2>/dev/null
import sys, grpc
from app import ai_agent_pb2 as p, ai_agent_pb2_grpc as g
r = g.AiAgentServiceStub(grpc.insecure_channel(f"localhost:{sys.argv[1]}")).HealthCheck(p.HealthCheckRequest(), timeout=3)
print(f"{r.status} kafka={r.kafka_connected} openai={r.openai_configured} version={r.version}")
PY
    ); then
        echo "✅ AI Agent 응답: $STATUS"
        case "$STATUS" in
            SERVING*) ;;
            *) echo "::warning::AI Agent DEGRADED — .env 의 OPENAI_API_KEY·KAFKA_BROKER 를 확인하세요 ($STATUS)" ;;
        esac
        exit 0
    fi
    sleep 2
done
echo "❌ AI Agent 가 60초 안에 응답하지 않음 — 최근 로그:"
pm2 logs pawpong-ai-agent --lines 40 --nostream 2>&1 | tail -40
exit 1
