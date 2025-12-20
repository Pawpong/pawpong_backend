# GCP CI/CD 설정 완료 ✅

## 완료된 작업

### 1. API 활성화 ✅
- Artifact Registry API
- Compute Engine API  
- IAM API
- IAM Credentials API
- Cloud Resource Manager API
- Security Token Service API

### 2. Artifact Registry 생성 ✅
```
Repository: pawpong-docker
Location: asia-northeast3
Format: Docker
```

확인:
```bash
gcloud artifacts repositories list --location=asia-northeast3 --project=pawpong
```

### 3. Workload Identity Federation 설정 ✅

**Workload Identity Pool**:
- Name: `github-actions-pool`
- Location: global
- Provider: `github-actions-provider` (OIDC)

**Provider 설정**:
- Issuer: `https://token.actions.githubusercontent.com`
- Repository Owner Condition: `Pawpong`

### 4. 서비스 계정 권한 부여 ✅

**Service Account**: `pawpong-storage@pawpong.iam.gserviceaccount.com`

**부여된 권한**:
- ✅ `roles/artifactregistry.writer` - Docker 이미지 푸시
- ✅ `roles/compute.instanceAdmin.v1` - VM 인스턴스 관리
- ✅ `roles/iap.tunnelResourceAccessor` - IAP 터널 접근
- ✅ `roles/iam.serviceAccountUser` - 서비스 계정 사용
- ✅ `roles/iam.workloadIdentityUser` - GitHub Actions 인증

### 5. Workload Identity 바인딩 ✅

GitHub Repository `Pawpong/pawpong_backend`가 `pawpong-storage@pawpong.iam.gserviceaccount.com` 서비스 계정을 사용할 수 있도록 바인딩 완료.

## 다음 단계: GitHub Secrets 설정

GitHub Repository > Settings > Secrets and variables > Actions에서 다음 Secret을 **업데이트** 해주세요:

### GCP_SA_EMAIL 수정 필요! ⚠️

**현재 값**:
```
github-actions-deployer@pawpong.iam.gserviceaccount.com
```

**변경할 값**:
```
pawpong-storage@pawpong.iam.gserviceaccount.com
```

### 모든 필요한 Secrets 목록

1. ✅ `GCP_PROJECT_NUMBER`: `371938485294`
2. ✅ `GCP_PROJECT_ID`: `pawpong`
3. ✅ `GAR_LOCATION`: `asia-docker.pkg.dev`
4. ✅ `SERVICE_NAME`: `pawpong-docker`
5. ✅ `INSTANCE_ZONE`: `asia-northeast3-c`
6. ✅ `INSTANCE_NAME`: `pawpong-backend-prod`
7. ⚠️ `GCP_SA_EMAIL`: `pawpong-storage@pawpong.iam.gserviceaccount.com` **(수정 필요!)**

## CI/CD 테스트

GitHub Secret 수정 후:

```bash
git add .
git commit -m "test: CI/CD 파이프라인 테스트"
git push origin main
```

GitHub Actions 탭에서 배포 진행 상황 확인:
https://github.com/Pawpong/pawpong_backend/actions

## 서버 상태

현재 서버에서 Docker 컨테이너가 실행 중:
```bash
docker ps
# pawpong_blue 컨테이너가 8080 포트에서 실행 중
```

Nginx가 `https://api.pawpong.kr`로 프록시 중.

## 트러블슈팅

### Workload Identity 인증 실패 시

```bash
# Pool 확인
gcloud iam workload-identity-pools describe github-actions-pool \
  --location=global \
  --project=pawpong

# Provider 확인
gcloud iam workload-identity-pools providers describe github-actions-provider \
  --location=global \
  --workload-identity-pool=github-actions-pool \
  --project=pawpong

# 서비스 계정 바인딩 확인
gcloud iam service-accounts get-iam-policy \
  pawpong-storage@pawpong.iam.gserviceaccount.com \
  --project=pawpong
```

### Docker 이미지 푸시 실패 시

```bash
# Artifact Registry 인증 확인
gcloud artifacts repositories get-iam-policy pawpong-docker \
  --location=asia-northeast3 \
  --project=pawpong
```
