# 보안 가이드

## 중요: 민감한 정보 관리

이 프로젝트는 **Public Repository**이므로 모든 민감한 정보는 절대 Git에 커밋하면 안됩니다.

## `.gitignore`로 보호되는 파일들

다음 파일들은 절대 Git에 커밋되지 않습니다:

```
.env
.env.*
gcp-service-account.json
*-service-account.json
apple-private-key.p8
```

## 환경 변수 설정 방법

### 1. 로컬 개발 환경

```bash
# .env.example 파일을 복사
cp .env.example .env

# .env 파일을 열어서 실제 값으로 수정
vim .env
```

### 2. Docker 배포 환경

`docker-compose.yml`에서 `.env` 파일을 자동으로 로드합니다:

```yaml
services:
  blue:
    env_file:
      - .env
```

**중요**: 서버에 배포할 때는 `.env` 파일을 서버에 직접 생성해야 합니다.

### 3. GitHub Actions (CI/CD)

GitHub Actions에서는 **GitHub Secrets**를 사용합니다.

**설정 방법**:
1. GitHub Repository > Settings > Secrets and variables > Actions
2. New repository secret 클릭
3. 필요한 Secret 추가

**이미 설정된 Secrets**:
- `GCP_PROJECT_NUMBER`: GCP 프로젝트 번호

**추가로 설정이 필요한 Secrets** (선택사항):
- `DEV_SERVER_SSH_KEY`: 개발 서버 SSH 개인키
- `DEV_SERVER_HOST`: 개발 서버 IP 주소

## 민감한 정보 목록

### 🔴 절대 공개하면 안되는 정보

1. **Database Credentials**
   - `MONGODB_URI` (사용자명, 비밀번호 포함)

2. **JWT Secrets**
   - `JWT_SECRET`
   - `ADMIN_JWT_SECRET`

3. **OAuth Credentials**
   - `NAVER_CLIENT_SECRET`
   - `GOOGLE_CLIENT_SECRET`
   - `KAKAO_CLIENT_SECRET`
   - `APPLE_PRIVATE_KEY_PATH`

4. **API Keys**
   - `COOLSMS_API_KEY`
   - `COOLSMS_API_SECRET`
   - `CDN_PRIVATE_KEY`

5. **Email Credentials**
   - `MAIL_PASSWORD`

6. **Webhook URLs**
   - `DISCORD_WEBHOOK_URL`

7. **GCP Service Account Keys**
   - `gcp-service-account.json`
   - `GCP_KEYFILE_PATH`

### 🟡 공개 가능하지만 주의해야 하는 정보

1. **Public Client IDs** (OAuth)
   - `NAVER_CLIENT_ID`
   - `GOOGLE_CLIENT_ID`
   - `KAKAO_CLIENT_ID`
   - 이들은 프론트엔드에서도 사용되므로 공개되어도 괜찮지만, Secret과 함께 사용될 때만 의미가 있습니다.

2. **Project IDs**
   - `GCP_PROJECT_ID` (단독으로는 위험하지 않음)

3. **Public URLs**
   - `FRONTEND_URL`
   - `CDN_BASE_URL`

## 보안 체크리스트

### ✅ 배포 전 확인사항

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] `gcp-service-account.json` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] GitHub에 `.env` 파일이 커밋되지 않았는가?
- [ ] 서버에 `.env` 파일을 직접 생성했는가?
- [ ] GitHub Secrets에 필요한 값들이 설정되어 있는가?
- [ ] JWT_SECRET과 ADMIN_JWT_SECRET이 강력한 랜덤 문자열인가?

### 🔒 JWT Secret 생성 방법

강력한 JWT Secret을 생성하려면:

```bash
# Node.js로 랜덤 문자열 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 OpenSSL 사용
openssl rand -hex 32
```

생성된 문자열을 `.env` 파일의 `JWT_SECRET`과 `ADMIN_JWT_SECRET`에 설정하세요.

## 실수로 민감 정보를 커밋한 경우

### 1. 즉시 Secret 변경
- MongoDB 비밀번호 변경
- JWT Secret 재생성
- OAuth Client Secret 재발급
- API Key 재발급

### 2. Git History에서 제거

```bash
# 특정 파일을 Git 히스토리에서 완전히 제거
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (주의!)
git push origin --force --all
```

**주의**: 이미 공개된 Secret은 무효화된 것으로 간주하고 즉시 재발급해야 합니다.

## GCP Service Account Key 관리

### 안전한 관리 방법

1. **로컬 개발**:
   ```bash
   # GCP Console에서 Service Account Key 다운로드
   # 파일을 프로젝트 루트에 저장
   mv ~/Downloads/pawpong-xxxxx.json ./gcp-service-account.json

   # .env 파일에 경로 설정
   GCP_KEYFILE_PATH=./gcp-service-account.json
   ```

2. **서버 배포**:
   ```bash
   # SSH로 서버 접속
   ssh user@your-server

   # 프로젝트 디렉토리로 이동
   cd /home/ubuntu/pawpong_backend

   # Service Account Key 생성 (내용 붙여넣기)
   vim gcp-service-account.json

   # 파일 권한 설정
   chmod 600 gcp-service-account.json
   ```

3. **GitHub Actions**:
   - Service Account Key 내용을 GitHub Secrets에 저장
   - Workflow에서 필요시 임시 파일로 생성하여 사용

## 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
