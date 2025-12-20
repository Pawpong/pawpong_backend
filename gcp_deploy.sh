#!/bin/bash

set -e

IMAGE_TAG=$1
if [ -z "$IMAGE_TAG" ]; then
    echo "❌ Error: IMAGE_TAG is required"
    echo "Usage: $0 <image-tag>"
    exit 1
fi

GCP_PROJECT_ID="pawpong"
GAR_LOCATION="asia-docker.pkg.dev"
SERVICE_NAME="pawpong-docker"
IMAGE_URL="${GAR_LOCATION}/${GCP_PROJECT_ID}/${SERVICE_NAME}/pawpong-backend:${IMAGE_TAG}"

echo "🚀 Starting deployment with image: ${IMAGE_URL}"

cd /home/ubuntu/pawpong_backend

echo "📥 Pulling new Docker image from Artifact Registry..."
docker pull "${IMAGE_URL}"

echo "🏷️ Tagging image as 'latest'..."
docker tag "${IMAGE_URL}" pawpong-backend:latest

CURRENT_CONTAINER=$(curl -s http://localhost:8080/api/health && echo "blue" || echo "green")

if [ "$CURRENT_CONTAINER" == "blue" ]; then
    echo "🔵 Current: blue → Deploying to green..."

    docker compose up -d --no-deps --build green

    echo "🏥 Health checking green deployment..."
    sleep 10

    for i in {1..30}; do
        if curl -s http://localhost:8081/api/health; then
            echo "✅ Green deployment healthy!"
            echo "🛑 Stopping blue container..."
            docker compose stop blue
            echo "🎉 Deployment completed! Green is now active."
            exit 0
        fi
        echo "⏳ Waiting for green to be ready... ($i/30)"
        sleep 2
    done

    echo "❌ Green deployment failed health check!"
    echo "🔄 Rolling back to blue..."
    docker compose stop green
    docker compose start blue
    exit 1

else
    echo "🟢 Current: green → Deploying to blue..."

    docker compose up -d --no-deps --build blue

    echo "🏥 Health checking blue deployment..."
    sleep 10

    for i in {1..30}; do
        if curl -s http://localhost:8080/api/health; then
            echo "✅ Blue deployment healthy!"
            echo "🛑 Stopping green container..."
            docker compose stop green
            echo "🎉 Deployment completed! Blue is now active."
            exit 0
        fi
        echo "⏳ Waiting for blue to be ready... ($i/30)"
        sleep 2
    done

    echo "❌ Blue deployment failed health check!"
    echo "🔄 Rolling back to green..."
    docker compose stop blue
    docker compose start green
    exit 1
fi

echo "🔍 Ensuring Grafana stack is running..."
docker compose up -d grafana loki promtail
