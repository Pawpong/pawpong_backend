# 빌드 스테이지 - Node.js 20.19.5 사용
FROM node:20.19.5-alpine AS builder
WORKDIR /app

# 캐시 레이어 최적화를 위해 종속성 관련 파일만 먼저 복사
COPY package.json yarn.lock ./

# 프로덕션 빌드에 필요한 패키지만 설치
RUN yarn install --production=false --frozen-lockfile --network-timeout 1000000

# TypeScript 설정 파일 복사
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 소스 코드만 복사
COPY src ./src

# 빌드 시 메모리 최적화 옵션 추가
ENV NODE_OPTIONS="--max-old-space-size=3072"
RUN yarn build

# 실행 스테이지 - Node.js 20.19.5 사용
FROM node:20.19.5-alpine
WORKDIR /app

# 필요한 파일만 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080
CMD ["node", "dist/main.js"]
