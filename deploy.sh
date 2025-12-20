#!/bin/bash

# 현재 활성화된 컨테이너 확인
CURRENT_CONTAINER=$(curl -s http://localhost:8080/api/health && echo "blue" || echo "green")

# 새 버전 배포
if [ "$CURRENT_CONTAINER" == "blue" ]; then
    echo "🚀 Deploying to green container..."
    docker compose build green
    docker compose up -d green

    # 헬스체크
    echo "🏥 Health checking green deployment..."
    sleep 10
    if curl -s http://localhost:8081/api/health; then
        echo "✅ Green deployment successful, stopping blue..."
        docker compose stop blue
        # Caddy 재시작 (필요시)
        # sudo systemctl restart caddy
    else
        echo "❌ Green deployment failed, rolling back..."
        docker compose stop green
        docker compose start blue
        exit 1
    fi
else
    echo "🚀 Deploying to blue container..."
    docker compose build blue
    docker compose up -d blue

    # 헬스체크
    echo "🏥 Health checking blue deployment..."
    sleep 10
    if curl -s http://localhost:8080/api/health; then
        echo "✅ Blue deployment successful, stopping green..."
        docker compose stop green
        # Caddy 재시작 (필요시)
        # sudo systemctl restart caddy
    else
        echo "❌ Blue deployment failed, rolling back..."
        docker compose stop blue
        docker compose start green
        exit 1
    fi
fi

# Grafana 스택 상태 확인 및 시작
echo "🔍 Checking Grafana stack status..."
if ! docker ps | grep -q grafana; then
    echo "🔄 Starting Grafana stack..."
    docker compose up -d grafana loki promtail
fi
