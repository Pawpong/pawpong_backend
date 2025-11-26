# 헬스체크 (Health) 도메인

## 개요

시스템 상태 모니터링과 헬스체크 기능을 제공하는 도메인입니다. 서버의 기본 상태와 가동 시간을 확인할 수 있습니다.

## 주요 기능

- 기본 서버 상태 확인
- 서비스 버전 정보 제공
- 환경 정보 확인
- 서버 가동 시간 (uptime) 확인

## API 엔드포인트 (1개)

### GET /api/health

서버의 기본 상태와 시스템 정보를 반환합니다.

**Response:**

```json
{
  "success": true,
  "code": 200,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-15T10:30:00.000Z",
    "service": "Pawpong Backend",
    "version": "1.0.0-MVP",
    "environment": "production",
    "uptime": 123456
  },
  "message": "시스템이 정상 작동 중입니다.",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**응답 필드:**

- `status`: 서버 상태 (항상 "healthy")
- `timestamp`: 현재 시각 (ISO 8601)
- `service`: 서비스 이름
- `version`: 서비스 버전
- `environment`: 실행 환경 (development, production 등)
- `uptime`: 서버 가동 시간 (초 단위)

## 사용 사례

### 로드 밸런서 헬스체크

```bash
# 로드 밸런서에서 주기적으로 호출
GET /api/health
```

### Kubernetes Liveness Probe

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 8082
  initialDelaySeconds: 30
  periodSeconds: 10
```

### 모니터링 시스템

```bash
# Uptime 모니터링 툴에서 주기적으로 호출
curl http://localhost:8082/api/health
```

## 접근 권한

- 인증 불필요 (공개 API)
- 모든 사용자/시스템에서 접근 가능

## 의존성

- 없음 (독립적으로 동작)

## 확장 계획

향후 필요시 다음 기능 추가 가능:

- 데이터베이스 연결 상태 확인
- 외부 서비스 의존성 확인
- 메모리/CPU 사용량 모니터링
- 상세 헬스체크 엔드포인트 (`/api/health/detailed`)

## 테스트 실행

```bash
yarn test:e2e src/api/health/test/health.e2e-spec.ts
```
