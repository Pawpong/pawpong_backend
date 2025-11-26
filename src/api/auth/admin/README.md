# Auth Admin Module

## 개요

관리자 인증을 담당하는 모듈입니다. 관리자 전용 로그인 기능을 제공합니다.

## 주요 기능

### 1. 관리자 로그인

#### 관리자 로그인 (`POST /api/auth-admin/login`)

- 이메일과 비밀번호로 관리자 인증
- JWT Access Token + Refresh Token 발급
- 관리자 권한 정보 반환 (permissions)
- 관리자 레벨별 접근 제어 (super_admin, admin, moderator)

**요청 예시:**
```json
{
  "email": "admin@pawpong.com",
  "password": "admin1234"
}
```

**응답 예시:**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "adminId": "507f1f77bcf86cd799439011",
    "email": "admin@pawpong.com",
    "name": "홍길동",
    "adminLevel": "super_admin",
    "permissions": {
      "canManageUsers": true,
      "canManageBreeders": true,
      "canManageReports": true,
      "canViewStatistics": true,
      "canManageAdmins": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "관리자 로그인이 완료되었습니다."
}
```

## 파일 구조

```
auth/admin/
├── auth-admin.controller.ts    # API 엔드포인트
├── auth-admin.service.ts        # 비즈니스 로직
├── auth-admin.module.ts         # 모듈 정의
└── README.md                    # 도메인 문서
```

## 주요 메서드

### AuthAdminService

```typescript
async loginAdmin(email: string, password: string): Promise<AdminLoginResponseDto>
```

## 스키마 관계

### 연관 스키마

- **Admin**: 관리자 정보 (admins 컬렉션)

### 관리자 권한 체계

- **super_admin**: 모든 권한 (사용자/브리더/신고/통계/관리자 관리)
- **admin**: 일반 관리 권한 (사용자/브리더/신고/통계)
- **moderator**: 제한된 권한 (신고 처리)

## 에러 처리

- 400 Bad Request: 잘못된 요청
- 401 Unauthorized: 이메일 또는 비밀번호가 올바르지 않음

## 보안

- 비밀번호 bcrypt 해싱 검증
- JWT Access Token (1시간)
- Refresh Token (7일)
- 관리자 전용 Guard로 일반 사용자 접근 차단

## 테스트 실행

```bash
yarn test:e2e src/api/auth/admin/test/auth-admin.e2e-spec.ts
```
