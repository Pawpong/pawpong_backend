#!/bin/bash

# ========================================
# 간편 배포 스크립트
# ========================================
# 로컬에서 빌드하고 서버로 배포하는 스크립트

set -e

SERVER_IP="115.68.179.77"
SERVER_USER="root"
SERVER_PATH="/root/Pawpong_Backend"

echo "🚀 Pawpong Backend 배포 시작..."

# 1. Git 저장소 확인
if [ -d ".git" ]; then
    echo "📤 Git push to remote..."
    git push origin main
    
    echo "⏳ GitHub Actions가 자동 배포를 시작합니다..."
    echo "🔗 https://github.com/<your-org>/pawpong_backend/actions 에서 확인하세요."
    echo ""
    echo "또는 서버에서 수동 배포를 원하시면 다음 명령어를 실행하세요:"
    echo "  ssh $SERVER_USER@$SERVER_IP"
    echo "  cd $SERVER_PATH"
    echo "  ./gcp_deploy.sh"
else
    echo "❌ Git 저장소가 아닙니다."
    exit 1
fi
blue
        exit 1
    fi
else
    echo "🚀 Deploying to blue container..."
    docker compose build blue

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
