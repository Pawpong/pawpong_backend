# Home Admin Module

## 개요

메인 페이지 콘텐츠 관리를 담당하는 관리자 모듈입니다. 배너와 FAQ를 관리할 수 있습니다.

## 주요 기능

### 1. 배너 관리

#### 배너 목록 조회 (`GET /api/home-admin/banners`)

- 모든 배너 목록 조회
- 정렬 순서(order) 기준 정렬

#### 배너 생성 (`POST /api/home-admin/banner`)

- 제목, 설명, 이미지 URL, 링크 URL 설정
- 배너 활성화 여부 설정 (isActive)
- 정렬 순서 설정 (order)

#### 배너 수정 (`PUT /api/home-admin/banner/:bannerId`)

- 배너 정보 수정
- 활성화/비활성화 토글

#### 배너 삭제 (`DELETE /api/home-admin/banner/:bannerId`)

- 배너 영구 삭제

### 2. FAQ 관리

#### FAQ 목록 조회 (`GET /api/home-admin/faqs`)

- 모든 FAQ 목록 조회
- 카테고리별 필터링 (category)
- 정렬 순서(order) 기준 정렬

#### FAQ 생성 (`POST /api/home-admin/faq`)

- 질문, 답변 작성
- 카테고리 설정 (adopter, breeder, general)
- 정렬 순서 설정

#### FAQ 수정 (`PUT /api/home-admin/faq/:faqId`)

- FAQ 정보 수정
- 활성화/비활성화 토글

#### FAQ 삭제 (`DELETE /api/home-admin/faq/:faqId`)

- FAQ 영구 삭제

## 파일 구조

```
home/admin/
├── home-admin.controller.ts    # API 엔드포인트
├── home-admin.service.ts        # 비즈니스 로직
├── home-admin.module.ts         # 모듈 정의
├── dto/
│   ├── request/
│   │   ├── banner-create-request.dto.ts
│   │   ├── banner-update-request.dto.ts
│   │   ├── faq-create-request.dto.ts
│   │   └── faq-update-request.dto.ts
│   └── response/
│       ├── banner-response.dto.ts
│       └── faq-response.dto.ts
└── README.md                    # 도메인 문서
```

## 주요 메서드

### HomeAdminService

```typescript
// 배너 관리
async getAllBanners(): Promise<BannerResponseDto[]>
async createBanner(dto: BannerCreateRequestDto): Promise<BannerResponseDto>
async updateBanner(bannerId: string, dto: BannerUpdateRequestDto): Promise<BannerResponseDto>
async deleteBanner(bannerId: string): Promise<void>

// FAQ 관리
async getAllFaqs(): Promise<FaqResponseDto[]>
async createFaq(dto: FaqCreateRequestDto): Promise<FaqResponseDto>
async updateFaq(faqId: string, dto: FaqUpdateRequestDto): Promise<FaqResponseDto>
async deleteFaq(faqId: string): Promise<void>
```

## 스키마 관계

### 연관 스키마

- **Banner**: 배너 정보 (banners 컬렉션)
- **Faq**: FAQ 정보 (faqs 컬렉션)

### 배너 데이터 구조

```typescript
{
  title: string;          // 배너 제목
  description?: string;   // 배너 설명
  imageUrl: string;       // 배너 이미지 URL
  linkUrl?: string;       // 클릭 시 이동 URL
  order: number;          // 정렬 순서
  isActive: boolean;      // 활성화 여부
}
```

### FAQ 데이터 구조

```typescript
{
  category: 'adopter' | 'breeder' | 'general';  // FAQ 카테고리
  question: string;       // 질문
  answer: string;         // 답변
  order: number;          // 정렬 순서
  isActive: boolean;      // 활성화 여부
}
```

## 에러 처리

- 400 Bad Request: 잘못된 요청, 유효성 검증 실패
- 404 Not Found: 배너/FAQ를 찾을 수 없음

## 권한

- **필수 권한**: super_admin 또는 admin
- 일반 사용자 접근 불가

## 테스트 실행

```bash
yarn test:e2e src/api/home/admin/test/home-admin.e2e-spec.ts
```
