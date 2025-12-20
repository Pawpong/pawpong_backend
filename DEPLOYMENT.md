# Pawpong Backend CI/CD 배포 가이드

## 개요

이 프로젝트는 Docker 기반 Blue-Green 배포 전략을 사용하며, GitHub Actions를 통한 자동 배포를 지원합니다.

## 아키텍처

- **컨테이너 구성**:
  - Blue/Green 컨테이너 (각 2GB 메모리 할당)
  - Grafana (512MB) - 로그 시각화
  - Loki (512MB) - 로그 수집/저장
  - Promtail (256MB) - 로그 에이전트

- **리소스 사용량**:
  - Blue/Green: 각 최대 2GB (총 4GB, 동시에는 2GB만 사용)
  - 모니터링 스택: 약 1.3GB
  - 총 메모리 사용량: 약 3.3GB (8GB 서버에서 여유있게 운영 가능)

## 로컬 배포

### 1. Docker Compose로 시작

```bash
# 환경 변수 설정
cp .env.example .env
# .env 파일을 실제 값으로 수정

# 초기 시작 (blue 컨테이너)
docker compose up -d blue grafana loki promtail

# 헬스체크 확인
curl http://localhost:8080/api/health
```

### 2. Blue-Green 배포 실행

```bash
# 배포 스크립트 실행
./deploy.sh
```

**배포 프로세스**:
1. 현재 활성 컨테이너 확인 (blue or green)
2. 비활성 컨테이너에 새 버전 빌드 및 시작
3. 헬스체크 (10초 대기)
4. 성공 시: 기존 컨테이너 중지
5. 실패 시: 새 컨테이너 중지, 기존 컨테이너 유지 (롤백)

## GCP 배포 설정

### 1. GCP 리소스 생성

#### Artifact Registry 생성
```bash
gcloud artifacts repositories create pawpong-docker \
  --repository-format=docker \
  --location=asia-northeast3 \
  --description="Pawpong Backend Docker Images"
```

#### Compute Engine 인스턴스 생성
```bash
gcloud compute instances create pawpong-backend-prod \
  --zone=asia-northeast3-c \
  --machine-type=e2-standard-2 \
  --boot-disk-size=30GB \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud
```

### 2. Workload Identity Federation 설정

#### Workload Identity Pool 생성
```bash
gcloud iam workload-identity-pools create github-actions-pool \
  --location="global" \
  --description="GitHub Actions pool"
```

#### Provider 생성
```bash
gcloud iam workload-identity-pools providers create-oidc github-actions-provider \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository"
```

#### Service Account 생성 및 권한 부여
```bash
# Service Account 생성
gcloud iam service-accounts create github-actions-deployer \
  --description="Service account for GitHub Actions" \
  --display-name="GitHub Actions Deployer"

# Artifact Registry 쓰기 권한
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Compute Admin 권한
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/compute.instanceAdmin.v1"

# Workload Identity 연결
gcloud iam service-accounts add-iam-policy-binding \
  github-actions-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/YOUR_GITHUB_USERNAME/pawpong_backend"
```

### 3. GitHub Secrets 설정

Repository Settings > Secrets and variables > Actions에 다음 추가:

- `GCP_PROJECT_NUMBER`: GCP 프로젝트 번호
- `DEV_SERVER_SSH_KEY`: 개발 서버 SSH 개인키 (develop 브랜치용)
- `DEV_SERVER_HOST`: 개발 서버 IP 주소

### 4. GitHub Actions 워크플로우 파일 수정

`.github/workflows/deploy-gcp.yml` 파일에서 환경 변수 수정:

```yaml
env:
    GCP_PROJECT_ID: your-gcp-project-id  # 실제 프로젝트 ID
    GAR_LOCATION: asia-docker.pkg.dev
    SERVICE_NAME: pawpong-docker
    INSTANCE_ZONE: asia-northeast3-c
    INSTANCE_NAME: pawpong-backend-prod
    GCP_SA_EMAIL: github-actions-deployer@your-project.iam.gserviceaccount.com
```

### 5. 서버에 배포 스크립트 설정

```bash
# SSH로 서버 접속
gcloud compute ssh pawpong-backend-prod --zone=asia-northeast3-c

# 프로젝트 디렉토리 생성
mkdir -p /home/ubuntu/pawpong_backend
cd /home/ubuntu/pawpong_backend

# 저장소 클론
git clone https://github.com/YOUR_USERNAME/pawpong_backend.git .

# 환경 변수 설정
cp .env.example .env
vim .env  # 실제 값으로 수정

# Docker 설치 (필요시)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Docker Compose 설치 (필요시)
sudo apt-get update
sudo apt-get install docker-compose-plugin

# 배포 스크립트 권한 설정
chmod +x gcp_deploy.sh deploy.sh

# 초기 컨테이너 시작
docker compose up -d blue grafana loki promtail
```

## 브랜치별 배포 전략

### main 브랜치 → GCP 프로덕션
- Trigger: `main` 브랜치 push
- Workflow: `.github/workflows/deploy-gcp.yml`
- 자동으로 Docker 이미지 빌드 → Artifact Registry 푸시 → Blue-Green 배포

### gcp-deploy-test 브랜치 → GCP 테스트
- Trigger: `gcp-deploy-test` 브랜치 push
- Workflow: `.github/workflows/deploy-gcp-test.yml`
- 프로덕션과 동일한 환경에서 테스트

### develop 브랜치 → 개발 서버
- Trigger: `develop` 브랜치 push
- Workflow: `.github/workflows/dev-deploy.yml`
- SSH를 통한 직접 배포, PM2로 실행

## Grafana 모니터링

### 접속 정보
- URL: `http://localhost:3000` (또는 서버 IP:3000)
- Username: `admin`
- Password: `pawpong2025`

### 초기 설정

1. Grafana 접속
2. Data Sources에서 Loki 자동 연결 확인
3. Explore 메뉴에서 로그 확인:
   ```
   {container="pawpong_blue"} |= "error"
   {deployment="blue"} |= "ERROR"
   ```

### 로그 보존 기간
- Loki 설정: 7일 (168시간)
- 필요시 `loki/loki-config.yaml`의 `retention_period` 수정

## 트러블슈팅

### 1. Docker 이미지 빌드 실패
```bash
# 메모리 부족 시 swap 추가
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 2. 헬스체크 실패
```bash
# 컨테이너 로그 확인
docker logs pawpong_blue
docker logs pawpong_green

# Grafana에서 로그 확인
# {container="pawpong_blue"} |= "error"
```

### 3. Grafana 접속 안됨
```bash
# Grafana 컨테이너 상태 확인
docker ps | grep grafana
docker logs grafana

# 재시작
docker compose restart grafana loki promtail
```

### 4. 배포 롤백
```bash
# 수동 롤백 (Blue가 실패했을 경우)
docker compose stop blue
docker compose start green

# 또는 반대
docker compose stop green
docker compose start blue
```

## 포트 매핑

| 서비스 | 내부 포트 | 외부 포트 | 설명 |
|--------|-----------|-----------|------|
| Blue | 8080 | 8080 | 활성 컨테이너 |
| Green | 8080 | 8081 | 대기 컨테이너 |
| Grafana | 3000 | 3000 | 모니터링 대시보드 |
| Loki | 3100 | 3100 | 로그 수집 API |

## 보안 권장사항

1. **Grafana 비밀번호 변경**:
   - `docker-compose.yml`의 `GF_SECURITY_ADMIN_PASSWORD` 수정

2. **환경 변수 보호**:
   - `.env` 파일을 절대 Git에 커밋하지 말 것
   - GitHub Secrets 사용

3. **방화벽 설정**:
   - Grafana 포트(3000)는 필요시에만 외부 공개
   - 프로덕션 API는 리버스 프록시 뒤에 배치 권장

## 성능 최적화

### 메모리 사용량 모니터링
```bash
# 컨테이너별 리소스 사용량
docker stats

# 특정 컨테이너 메모리 제한 조정
# docker-compose.yml의 deploy.resources 섹션 수정
```

### 로그 크기 관리
- Docker 로그: 파일당 10MB, 최대 3개 파일 유지
- Loki 로그: 7일 후 자동 삭제
- Winston 로그: 앱 레벨에서 로테이션 설정 확인

## 참고 자료

- [Docker Blue-Green Deployment](https://docs.docker.com/compose/)
- [Grafana Loki Documentation](https://grafana.com/docs/loki/latest/)
- [GitHub Actions Workload Identity](https://github.com/google-github-actions/auth)
