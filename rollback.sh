#!/bin/bash

# ========================================
# Pawpong Backend Rollback Script
# ========================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd /root/pawpong_backend

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Pawpong Backend Rollback${NC}"
echo -e "${BLUE}========================================${NC}"

# 배포 히스토리 확인
if [ ! -f .deploy_history ]; then
    echo -e "${RED}No deployment history found!${NC}"
    exit 1
fi

echo -e "${YELLOW}Available versions to rollback:${NC}"
cat -n .deploy_history
echo ""

# 롤백 대상 선택
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./rollback.sh [version_number]${NC}"
    echo -e "${YELLOW}Example: ./rollback.sh 1  (rollback to most recent previous version)${NC}"
    echo ""

    # 기본값: 가장 최근 이전 버전 (2번째 줄)
    ROLLBACK_TAG=$(sed -n '2p' .deploy_history)
    if [ -z "$ROLLBACK_TAG" ]; then
        ROLLBACK_TAG=$(sed -n '1p' .deploy_history)
    fi
    echo -e "${YELLOW}Auto-selecting previous version: ${ROLLBACK_TAG}${NC}"
else
    ROLLBACK_TAG=$(sed -n "${1}p" .deploy_history)
fi

if [ -z "$ROLLBACK_TAG" ]; then
    echo -e "${RED}Invalid version number!${NC}"
    exit 1
fi

echo -e "${BLUE}Rolling back to: ${ROLLBACK_TAG}${NC}"

# 이미지 존재 확인
if ! docker images pawpong-backend --format "{{.Tag}}" | grep -q "^${ROLLBACK_TAG}$"; then
    echo -e "${RED}Image pawpong-backend:${ROLLBACK_TAG} not found locally!${NC}"
    echo -e "${YELLOW}Available local images:${NC}"
    docker images pawpong-backend --format "{{.Tag}}"
    exit 1
fi

# 현재 활성 컨테이너 확인
if curl -sf http://localhost:8080/api/health > /dev/null 2>&1; then
    CURRENT_CONTAINER="blue"
    NEW_CONTAINER="green"
    CURRENT_PORT=8080
    NEW_PORT=8081
else
    CURRENT_CONTAINER="green"
    NEW_CONTAINER="blue"
    CURRENT_PORT=8081
    NEW_PORT=8080
fi

echo -e "${GREEN}Current active: ${CURRENT_CONTAINER} (port ${CURRENT_PORT})${NC}"
echo -e "${BLUE}Will deploy rollback to: ${NEW_CONTAINER} (port ${NEW_PORT})${NC}"

# 롤백 이미지로 태그 변경
docker tag pawpong-backend:${ROLLBACK_TAG} pawpong-backend:latest

# 새 컨테이너에 롤백 버전 배포
echo -e "${BLUE}Starting ${NEW_CONTAINER} with rollback version...${NC}"
docker compose up -d --no-deps --force-recreate ${NEW_CONTAINER}

echo -e "${YELLOW}Waiting for ${NEW_CONTAINER} to start (40 seconds)...${NC}"
sleep 40

# 헬스체크
echo -e "${BLUE}Health checking rollback deployment...${NC}"
HEALTHY=false

for i in {1..30}; do
    if curl -sf http://localhost:${NEW_PORT}/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}Rollback deployment healthy!${NC}"
        HEALTHY=true
        break
    fi
    echo -e "${YELLOW}Waiting for ${NEW_CONTAINER} to be ready... ($i/30)${NC}"
    sleep 2
done

if [ "$HEALTHY" = true ]; then
    echo -e "${BLUE}Switching traffic to rollback version...${NC}"

    # Nginx 설정 업데이트
    if [ -f /etc/nginx/sites-available/pawpong ]; then
        sed -i "s/localhost:[0-9]\{4\}/localhost:${NEW_PORT}/" /etc/nginx/sites-available/pawpong
        nginx -t && systemctl reload nginx
        echo -e "${GREEN}Nginx reloaded${NC}"
    fi

    sleep 5

    # 이전 컨테이너 중지
    echo -e "${BLUE}Stopping old ${CURRENT_CONTAINER} container...${NC}"
    docker compose stop ${CURRENT_CONTAINER}

    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Rollback completed successfully!${NC}"
    echo -e "${GREEN}Rolled back to: ${ROLLBACK_TAG}${NC}"
    echo -e "${GREEN}Active Container: ${NEW_CONTAINER} (port ${NEW_PORT})${NC}"
    echo -e "${GREEN}========================================${NC}"

    exit 0
else
    echo -e "${RED}Rollback failed health check!${NC}"
    docker compose stop ${NEW_CONTAINER}
    docker compose start ${CURRENT_CONTAINER}
    exit 1
fi
