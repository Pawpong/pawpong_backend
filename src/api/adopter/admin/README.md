# Adopter Admin Module

## 개요

입양자 후기 신고를 관리하는 관리자 모듈입니다. 신고된 후기를 조회하고 처리할 수 있습니다.

## 주요 기능

### 1. 후기 신고 관리

#### 신고된 후기 목록 조회 (`GET /api/adopter-admin/reviews/reports`)

- 모든 후기 신고 목록 조회
- 페이지네이션 지원 (page, limit)
- 신고 사유, 신고자 정보, 후기 내용 포함

**응답 예시:**

```json
{
    "success": true,
    "code": 200,
    "data": {
        "items": [
            {
                "reportId": "507f1f77bcf86cd799439011",
                "reviewId": "507f1f77bcf86cd799439012",
                "breederId": "507f1f77bcf86cd799439013",
                "reporterId": "507f1f77bcf86cd799439014",
                "reason": "inappropriate_content",
                "description": "부적절한 내용이 포함되어 있습니다.",
                "reportedAt": "2025-01-15T10:30:00.000Z",
                "reviewContent": "후기 내용...",
                "status": "pending"
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

#### 신고된 후기 삭제 (`DELETE /api/adopter-admin/reviews/:breederId/:reviewId`)

- 신고된 후기를 영구 삭제
- 브리더 문서에서 해당 후기 제거
- 신고 내역도 함께 삭제

## 파일 구조

```
adopter/admin/
├── adopter-admin.controller.ts    # API 엔드포인트
├── adopter-admin.service.ts        # 비즈니스 로직
├── adopter-admin.module.ts         # 모듈 정의
└── README.md                        # 도메인 문서
```

## 주요 메서드

### AdopterAdminService

```typescript
async getReviewReports(page: number, limit: number): Promise<PaginationResponseDto<ReviewReportItemDto>>
async deleteReview(breederId: string, reviewId: string): Promise<void>
```

## 스키마 관계

### 연관 스키마

- **Breeder**: 브리더 정보 (breeders 컬렉션)
- **ReviewReport**: 후기 신고 정보 (review_reports 컬렉션)

### 후기 신고 사유 타입

- `inappropriate_content`: 부적절한 내용
- `spam`: 스팸
- `fake_review`: 허위 후기
- `offensive_language`: 욕설/비방
- `other`: 기타

## 에러 처리

- 400 Bad Request: 잘못된 요청
- 404 Not Found: 브리더 또는 후기를 찾을 수 없음

## 권한

- **필수 권한**: super_admin 또는 admin
- canManageReports 권한 필요

## 테스트 실행

```bash
yarn test:e2e src/api/adopter/admin/test/adopter-admin.e2e-spec.ts
```
