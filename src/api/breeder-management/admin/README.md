# Breeder Management Admin Module

## 개요

브리더 인증 및 신고를 관리하는 관리자 모듈입니다. 브리더 인증 승인/거절, 입양 신청 모니터링, 브리더 신고 처리 기능을 제공합니다.

## 주요 기능

### 1. 브리더 인증 관리

#### 승인 대기 브리더 목록 조회 (`GET /api/breeder-admin/verification/pending`)

- 인증 대기 중인 브리더 목록 조회
- 페이지네이션 지원 (page, limit)
- 브리더 정보, 제출 서류, 신청일 포함

**응답 예시:**

```json
{
    "success": true,
    "code": 200,
    "data": {
        "items": [
            {
                "breederId": "507f1f77bcf86cd799439011",
                "breederName": "김브리더",
                "breederEmail": "breeder@example.com",
                "breederLevel": "elite",
                "verificationStatus": "pending",
                "appliedAt": "2025-01-15T10:30:00.000Z",
                "documents": {
                    "idCardUrl": "https://...",
                    "animalProductionLicenseUrl": "https://..."
                }
            }
        ],
        "pagination": {
            "currentPage": 1,
            "pageSize": 20,
            "totalItems": 50,
            "totalPages": 3,
            "hasNextPage": true,
            "hasPrevPage": false
        }
    }
}
```

#### 브리더 인증 승인/거절 (`PATCH /api/breeder-admin/verification/:breederId`)

- 브리더 인증 승인 또는 거절
- 거절 시 사유 필수
- 승인 시 브리더 활성화

**요청 예시:**

```json
{
  "action": "approve"  // 또는 "reject"
  "reason": "서류 미비"  // reject 시 필수
}
```

### 2. 입양 신청 모니터링

#### 모든 입양 신청 조회 (`GET /api/breeder-admin/applications`)

- 전체 입양 신청 내역 조회
- 페이지네이션 지원
- 상태별 필터링 (status)
- 브리더별 필터링 (breederId)

**필터 옵션:**

- status: pending, reviewing, approved, rejected, consultation_completed
- breederId: 특정 브리더의 신청만 조회

### 3. 브리더 신고 관리

#### 브리더 신고 목록 조회 (`GET /api/breeder-admin/reports`)

- 모든 브리더 신고 목록 조회
- 페이지네이션 지원
- 신고 사유, 신고자 정보 포함

**응답 예시:**

```json
{
    "success": true,
    "code": 200,
    "data": {
        "items": [
            {
                "reportId": "507f1f77bcf86cd799439011",
                "breederId": "507f1f77bcf86cd799439012",
                "reporterId": "507f1f77bcf86cd799439013",
                "breederName": "김브리더",
                "reporterName": "이입양자",
                "reason": "사기",
                "description": "분양 계약 후 연락 두절",
                "status": "pending",
                "reportedAt": "2025-01-15T10:30:00.000Z"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "pageSize": 20,
            "totalItems": 30,
            "totalPages": 2,
            "hasNextPage": true,
            "hasPrevPage": false
        }
    }
}
```

#### 브리더 신고 처리 (`PATCH /api/breeder-admin/reports/:breederId/:reportId`)

- 신고 승인/거절 처리
- 승인 시 브리더 경고 또는 정지
- 거절 시 신고 기각

**요청 예시:**

```json
{
    "action": "approve", // 또는 "reject"
    "adminAction": "warning", // "warning", "suspend", "ban"
    "actionReason": "1차 경고 - 향후 동일 신고 발생 시 계정 정지"
}
```

## 파일 구조

```
breeder-management/admin/
├── breeder-admin.controller.ts    # API 엔드포인트
├── breeder-admin.service.ts        # 비즈니스 로직
├── breeder-admin.module.ts         # 모듈 정의
├── dto/
│   ├── request/
│   │   ├── breeder-verification-request.dto.ts
│   │   ├── application-monitoring-request.dto.ts
│   │   └── report-action-request.dto.ts
│   └── response/
│       ├── breeder-verification-response.dto.ts
│       ├── application-monitoring-response.dto.ts
│       ├── breeder-report-list.dto.ts
│       └── report-action-response.dto.ts
└── README.md                        # 도메인 문서
```

## 주요 메서드

### BreederAdminService

```typescript
// 브리더 인증 관리
async getPendingVerifications(page: number, limit: number): Promise<PaginationResponseDto<BreederVerificationResponseDto>>
async verifyBreeder(breederId: string, dto: BreederVerificationRequestDto): Promise<BreederVerificationResponseDto>

// 입양 신청 모니터링
async getAllApplications(dto: ApplicationMonitoringRequestDto): Promise<PaginationResponseDto<ApplicationMonitoringResponseDto>>

// 브리더 신고 관리
async getAllReports(page: number, limit: number): Promise<PaginationResponseDto<BreederReportListDto>>
async handleReport(breederId: string, reportId: string, dto: ReportActionRequestDto): Promise<ReportActionResponseDto>
```

## 스키마 관계

### 연관 스키마

- **Breeder**: 브리더 정보 (breeders 컬렉션)
- **AdoptionApplication**: 입양 신청 (adoption_applications 컬렉션)
- **BreederReport**: 브리더 신고 (breeder_reports 컬렉션)

### 브리더 인증 상태

- `pending`: 승인 대기
- `approved`: 승인 완료
- `rejected`: 거절됨

### 입양 신청 상태

- `pending`: 검토 대기
- `reviewing`: 검토 중
- `approved`: 승인됨
- `rejected`: 거절됨
- `consultation_completed`: 상담 완료

### 신고 처리 액션

- `warning`: 경고
- `suspend`: 계정 정지 (30일)
- `ban`: 영구 정지

## 에러 처리

- 400 Bad Request: 잘못된 요청, 유효성 검증 실패
- 404 Not Found: 브리더, 신청, 신고를 찾을 수 없음

## 권한

- **필수 권한**: super_admin 또는 admin
- canManageBreeders 권한 필요
- canManageReports 권한 필요 (신고 처리 시)

## 비즈니스 로직

### 브리더 인증 승인 시

1. verification.status → 'approved'
2. breeder.status → 'active'
3. 브리더에게 승인 알림 발송
4. 브리더 대시보드 활성화

### 브리더 인증 거절 시

1. verification.status → 'rejected'
2. verification.rejectionReason 저장
3. 브리더에게 거절 사유 알림

### 신고 승인 시

1. report.status → 'approved'
2. breeder.reports 배열에 신고 기록 추가
3. adminAction에 따라 브리더 상태 변경:
    - warning: 경고 카운트 증가
    - suspend: status → 'suspended', suspendedUntil 설정
    - ban: status → 'banned'

## 테스트 실행

```bash
yarn test:e2e src/api/breeder-management/admin/test/breeder-admin.e2e-spec.ts
```
