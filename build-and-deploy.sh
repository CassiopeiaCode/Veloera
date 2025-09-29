#!/bin/bash

# 快速构建和部署脚本
# 使用方法: ./build-and-deploy.sh [your-registry/repo-name] [server-address] [server-user]

set -e

REGISTRY_REPO=${1:-"veloera"}
SERVER_ADDRESS=${2:-"your-server.com"}
SERVER_USER=${3:-"root"}
IMAGE_TAG="v0.6.0-alpha.10"

echo "🏗️  开始构建 Docker 镜像..."
docker build -t ${REGISTRY_REPO}:${IMAGE_TAG} .
docker build -t ${REGISTRY_REPO}:latest .

echo "📤 推送到 Docker Registry..."
docker push ${REGISTRY_REPO}:${IMAGE_TAG}
docker push ${REGISTRY_REPO}:latest

echo "🚀 部署到服务器..."
ssh ${SERVER_USER}@${SERVER_ADDRESS} << EOF
    # 停止旧容器
    docker stop veloera || true
    docker rm veloera || true
    
    # 拉取最新镜像
    docker pull ${REGISTRY_REPO}:latest
    
    # 运行新容器
    docker run -d \
        --name veloera \
        -p 3000:3000 \
        -v /data/veloera:/data \
        --restart unless-stopped \
        ${REGISTRY_REPO}:latest
        
    echo "✅ 部署完成!"
EOF

echo "🎉 所有操作完成!"