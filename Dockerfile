# 빌드 스테이지 - Node.js 22 (LTS jod) + pnpm via corepack
FROM node:22-alpine AS builder
WORKDIR /app

# corepack 으로 pnpm 활성화 — package.json.packageManager 의 버전 사용
RUN corepack enable

# 캐시 레이어 최적화: lockfile + manifest 만 먼저 복사
COPY package.json pnpm-lock.yaml .npmrc ./

# 프로덕션 빌드에 필요한 패키지(dev 포함) 설치
RUN pnpm install --frozen-lockfile

# TypeScript 설정 파일 복사
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 소스 코드만 복사
COPY src ./src

# 빌드 시 메모리 최적화 옵션 추가
ENV NODE_OPTIONS="--max-old-space-size=3072"
RUN pnpm build

# 실행 스테이지 - Node.js 22 (LTS jod)
FROM node:22-alpine

# 보안을 위해 비루트 사용자 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# 필요한 파일만 복사 (소유권을 nodejs 사용자로 설정)
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package*.json ./

# 로그 디렉토리 생성
RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

# 비루트 사용자로 전환
USER nodejs

# 환경 변수
ENV NODE_ENV=production
ENV PORT=8080

# 헬스체크 추가 (30초마다 확인)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

EXPOSE 8080

# 애플리케이션 시작
CMD ["node", "dist/main.js"]
