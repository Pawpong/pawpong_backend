# GitHub Secrets 설정 가이드

## 필수 Secret 설정

GitHub Repository에서 다음 Secrets를 설정해야 합니다.

### 1. GCP_PROJECT_NUMBER

**위치**: GitHub Repository > Settings > Secrets and variables > Actions > New repository secret

**Secret 이름**: `GCP_PROJECT_NUMBER`

**값 얻는 방법**:
```bash
# 터미널에서 실행
gcloud projects describe pawpong --format="value(projectNumber)"
```

또는 GCP Console에서:
1. https://console.cloud.google.com 접속
2. 프로젝트 선택 (pawpong)
3. 대시보드에서 "프로젝트 정보" 카드 확인
4. "프로젝트 번호" 복사 (예: 123456789012)

**설정 방법**:
1. GitHub Repository 페이지로 이동
2. Settings > Secrets and variables > Actions 클릭
3. "New repository secret" 클릭
4. Name: `GCP_PROJECT_NUMBER`
5. Secret: `[위에서 얻은 프로젝트 번호]` 입력
6. "Add secret" 클릭

---

## GCP 초기 설정 명령어

아래 명령어들을 순서대로 실행하여 GCP 환경을 구성하세요.

### 1. Artifact Registry 생성

```bash
gcloud artifacts repositories create pawpong-docker \
  --repository-format=docker \
  --location=asia-northeast3 \
  --description="Pawpong Backend Docker Images" \
  --project=pawpong
```

### 2. Workload Identity Pool 생성

```bash
gcloud iam workload-identity-pools create github-actions-pool \
  --location="global" \
  --description="GitHub Actions Workload Identity Pool" \
  --project=pawpong
```

### 3. Workload Identity Provider 생성

```bash
gcloud iam workload-identity-pools providers create-oidc github-actions-provider \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --project=pawpong
```

### 4. Service Account 생성

```bash
gcloud iam service-accounts create github-actions-deployer \
  --description="Service account for GitHub Actions deployment" \
  --display-name="GitHub Actions Deployer" \
  --project=pawpong
```

### 5. Service Account에 권한 부여

```bash
# Artifact Registry 쓰기 권한
gcloud projects add-iam-policy-binding pawpong \
  --member="serviceAccount:github-actions-deployer@pawpong.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Compute Admin 권한
gcloud projects add-iam-policy-binding pawpong \
  --member="serviceAccount:github-actions-deployer@pawpong.iam.gserviceaccount.com" \
  --role="roles/compute.instanceAdmin.v1"

# Storage Admin 권한
gcloud projects add-iam-policy-binding pawpong \
  --member="serviceAccount:github-actions-deployer@pawpong.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

### 6. Workload Identity 바인딩

**주의**: `YOUR_GITHUB_USERNAME`을 실제 GitHub 사용자명으로 변경하세요.

```bash
# 먼저 프로젝트 번호 확인
PROJECT_NUMBER=$(gcloud projects describe pawpong --format="value(projectNumber)")
echo "프로젝트 번호: $PROJECT_NUMBER"

# YOUR_GITHUB_USERNAME을 실제 값으로 변경!
gcloud iam service-accounts add-iam-policy-binding \
  github-actions-deployer@pawpong.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/YOUR_GITHUB_USERNAME/pawpong_backend" \
  --project=pawpong
```

### 7. Compute Engine 인스턴스 생성

```bash
gcloud compute instances create pawpong-backend-prod \
  --zone=asia-northeast3-c \
  --machine-type=e2-standard-2 \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-standard \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --project=pawpong \
  --scopes=https://www.googleapis.com/auth/cloud-platform
```

---

## 배포 프로세스 확인

### 1. 모든 설정이 완료되었는지 확인

```bash
# Artifact Registry 확인
gcloud artifacts repositories list --location=asia-northeast3 --project=pawpong

# Service Account 확인
gcloud iam service-accounts list --project=pawpong

# Compute 인스턴스 확인
gcloud compute instances list --project=pawpong
```

### 2. main 브랜치에 push하여 배포 테스트

```bash
git add .
git commit -m "feat: CI/CD 파이프라인 구성"
git push origin main
```

### 3. GitHub Actions 실행 확인

1. GitHub Repository 페이지 이동
2. "Actions" 탭 클릭
3. "Deploy to GCP (Main)" 워크플로우 실행 확인

---

## 트러블슈팅

### 문제: Workload Identity Federation 인증 실패

**증상**: GitHub Actions에서 "Failed to authenticate to Google Cloud" 에러

**해결**:
1. GitHub Repository 이름 확인
2. Workload Identity 바인딩 명령어의 `YOUR_GITHUB_USERNAME/pawpong_backend` 부분이 정확한지 확인
3. 다시 바인딩:
```bash
PROJECT_NUMBER=$(gcloud projects describe pawpong --format="value(projectNumber)")

gcloud iam service-accounts add-iam-policy-binding \
  github-actions-deployer@pawpong.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/[실제_GitHub_사용자명]/pawpong_backend" \
  --project=pawpong
```

### 문제: Docker 이미지 푸시 실패

**증상**: "Permission denied" 에러

**해결**:
```bash
# Artifact Registry 권한 재확인
gcloud artifacts repositories get-iam-policy pawpong-docker \
  --location=asia-northeast3 \
  --project=pawpong

# 권한 재부여
gcloud projects add-iam-policy-binding pawpong \
  --member="serviceAccount:github-actions-deployer@pawpong.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

### 문제: SSH 접속 실패

**증상**: "Could not connect to instance" 에러

**해결**:
```bash
# IAP 터널링을 위한 방화벽 규칙 추가
gcloud compute firewall-rules create allow-ssh-ingress-from-iap \
  --direction=INGRESS \
  --action=allow \
  --rules=tcp:22 \
  --source-ranges=35.235.240.0/20 \
  --project=pawpong
```

---

## 요약

✅ **GitHub Secrets에 추가해야 할 항목**:
- `GCP_PROJECT_NUMBER`: GCP 프로젝트 번호

✅ **GCP에서 실행해야 할 명령어**:
1. Artifact Registry 생성
2. Workload Identity Pool & Provider 생성
3. Service Account 생성 및 권한 부여
4. Workload Identity 바인딩 (GitHub Repository 연결)
5. Compute Engine 인스턴스 생성

✅ **배포 트리거**:
- `main` 브랜치에 push → 자동 배포 시작
