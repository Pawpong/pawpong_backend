#!/bin/bash

set -e

# ========================================
# Pawpong Backend Blue-Green Deployment
# ========================================

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 환경 변수는 Docker Compose의 env_file로 전달한다. 셸에서 비밀값을 재해석하지 않는다.

# Discord 알림 함수 (비활성화)
send_discord_notification() {
    echo "Discord notification disabled (handled by GitHub Actions)"
}

# 이미지 태그 (GitHub SHA 또는 timestamp)
IMAGE_TAG=${1:-$(date +%Y%m%d_%H%M%S)}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Starting Deployment: ${IMAGE_TAG}${NC}"
echo -e "${BLUE}========================================${NC}"

# 배포 시작 알림
send_discord_notification "배포 시작\nTag: \`$IMAGE_TAG\`" 16776960

cd /home/colding/pawpong_backend

# 이전 이미지 태그 저장 (롤백용)
LAST_IMAGE=$(docker images pawpong-backend --format "{{.Tag}}" | head -n 1)
echo "$LAST_IMAGE" > /home/colding/pawpong_backend/.last_deploy
echo -e "${YELLOW}Previous image tag saved: ${LAST_IMAGE}${NC}"

# 배포 히스토리 저장 (최근 10개 유지)
echo "$IMAGE_TAG" >> /home/colding/pawpong_backend/.deploy_history
tail -10 /home/colding/pawpong_backend/.deploy_history > /home/colding/pawpong_backend/.deploy_history.tmp
mv /home/colding/pawpong_backend/.deploy_history.tmp /home/colding/pawpong_backend/.deploy_history
echo -e "${YELLOW}Deployment history updated${NC}"

echo -e "${BLUE}Using Docker image from Artifact Registry: pawpong-backend:latest${NC}"
# Artifact Registry에서 이미 pull된 이미지를 사용 (중복 빌드 제거)

# 현재 활성 컨테이너 확인 (헬스체크 기반)
echo -e "${BLUE}Checking current active container...${NC}"
if curl -sf http://localhost:8080/api/health > /dev/null 2>&1; then
    CURRENT_CONTAINER="blue"
    NEW_CONTAINER="green"
    CURRENT_PORT=8080
    NEW_PORT=8081
    echo -e "${GREEN}Current: Blue (port 8080)${NC}"
else
    CURRENT_CONTAINER="green"
    NEW_CONTAINER="blue"
    CURRENT_PORT=8081
    NEW_PORT=8080
    echo -e "${GREEN}Current: Green (port 8081)${NC}"
fi

echo -e "${BLUE}Deploying to ${NEW_CONTAINER} container...${NC}"

# 기존 Kafka는 재생성하지 않는다. 동일 커밋의 Agent가 먼저 준비되어야 한다.
docker compose --profile kafka up -d --no-deps --no-build ai-agent
AGENT_READY=false
for i in {1..30}; do
    if docker compose --profile kafka exec -T ai-agent python -c 'import grpc; from app import ai_agent_pb2 as p, ai_agent_pb2_grpc as g; r=g.AiAgentServiceStub(grpc.insecure_channel("localhost:50051")).HealthCheck(p.HealthCheckRequest(),timeout=3); assert r.openai_configured and r.kafka_connected' >/dev/null 2>&1; then
        AGENT_READY=true
        break
    fi
    sleep 2
done
if [ "$AGENT_READY" != true ]; then
    echo 'AI Agent readiness failed; keeping the existing backend active.'
    exit 1
fi

# 새 컨테이너 배포
docker compose up -d --no-deps --no-build ${NEW_CONTAINER}

echo -e "${YELLOW}Waiting for ${NEW_CONTAINER} to start (40 seconds)...${NC}"
sleep 40

# 헬스체크
echo -e "${BLUE}Health checking ${NEW_CONTAINER} deployment...${NC}"
HEALTHY=false

for i in {1..30}; do
    if curl --max-time 5 -sf http://localhost:${NEW_PORT}/api/health/ready > /dev/null 2>&1; then
        echo -e "${GREEN}${NEW_CONTAINER} deployment healthy!${NC}"
        HEALTHY=true
        break
    fi
    echo -e "${YELLOW}Waiting for ${NEW_CONTAINER} to be ready... ($i/30)${NC}"
    sleep 2
done

if [ "$HEALTHY" = true ]; then
    echo -e "${BLUE}Switching traffic to ${NEW_CONTAINER}...${NC}"

    # Nginx 설정 업데이트 (upstream을 새 포트로 변경)
    if [ -f /etc/nginx/sites-available/pawpong ]; then
        echo -e "${BLUE}Updating Nginx configuration...${NC}"
        # Nginx에서 upstream 포트를 새 포트로 변경
        sudo cp -p /etc/nginx/sites-available/pawpong "/etc/nginx/sites-available/pawpong.before-${IMAGE_TAG}"
        sudo sed -i "/upstream pawpong_backend {/,/}/ s/localhost:${CURRENT_PORT}/localhost:${NEW_PORT}/" /etc/nginx/sites-available/pawpong
        if ! sudo nginx -t || ! sudo systemctl reload nginx; then
            sudo cp -p "/etc/nginx/sites-available/pawpong.before-${IMAGE_TAG}" /etc/nginx/sites-available/pawpong
            sudo nginx -t && sudo systemctl reload nginx
            docker compose stop "${NEW_CONTAINER}"
            exit 1
        fi
        echo -e "${GREEN}Nginx reloaded with new upstream${NC}"
    else
        echo 'Missing Nginx configuration; refusing to stop the active backend.'
        docker compose stop "${NEW_CONTAINER}"
        exit 1
    fi

    sleep 5

    echo -e "${BLUE}Stopping old ${CURRENT_CONTAINER} container...${NC}"
    docker compose stop ${CURRENT_CONTAINER}

    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo -e "${GREEN}Active Container: ${NEW_CONTAINER} (port ${NEW_PORT})${NC}"
    echo -e "${GREEN}========================================${NC}"

    # 직전 컨테이너와 이미지는 검증 후 롤백할 수 있도록 보관한다.
    echo -e "${GREEN}Previous container and image retained for rollback${NC}"

    # 성공 알림
    send_discord_notification "배포 성공\nTag: \`$IMAGE_TAG\`\nActive: \`${NEW_CONTAINER}\` (port ${NEW_PORT})" 3066993

    exit 0
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}${NEW_CONTAINER} deployment failed health check!${NC}"
    echo -e "${RED}Rolling back to ${CURRENT_CONTAINER}...${NC}"
    echo -e "${RED}========================================${NC}"

    docker compose stop ${NEW_CONTAINER}
    docker compose start ${CURRENT_CONTAINER}

    # 실패 알림
    send_discord_notification "배포 실패\nTag: \`$IMAGE_TAG\`\n롤백 완료: \`${CURRENT_CONTAINER}\`" 15158332

    exit 1
fi

# Grafana/Loki/Promtail 확인
echo -e "${BLUE}Ensuring monitoring stack is running...${NC}"
docker compose up -d grafana loki promtail

# Kafka + AI Agent (AI 사진 콘테스트).
# KAFKA_ENABLED=true 일 때만 띄운다 — 앱은 Kafka 없이도 동작하므로
# 검증 전 서버에서 메모리를 미리 잡아먹지 않게 한다.
#
# Blue-Green 스왑과 무관하게 상주하는 사이드카라 --no-deps 로 앱을 건드리지 않는다.
# ai-agent 는 Job 을 Kafka 에서만 받으므로 앱 컨테이너 교체 중에도 계속 소비한다.
if grep -qE '^KAFKA_ENABLED=true' .env.production 2>/dev/null; then
    echo -e "${BLUE}Ensuring Kafka + AI Agent are running...${NC}"
    docker compose --profile kafka up -d --no-deps zookeeper kafka
    docker compose --profile kafka up -d --no-deps --build ai-agent
else
    echo -e "${BLUE}KAFKA_ENABLED != true — Kafka/AI Agent 기동을 건너뜁니다${NC}"
fi
