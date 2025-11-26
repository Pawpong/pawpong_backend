# Home 도메인

## 개요

홈 화면에서 표시되는 주요 콘텐츠를 제공하는 도메인입니다. 메인 배너, FAQ, 분양 가능한 반려동물 정보를 조회할 수 있습니다.

## 주요 기능

### 1. 메인 배너 조회

- 홈 화면에 표시될 배너 이미지 및 링크 정보 제공
- 활성화된 배너만 반환
- 배너 순서(order)에 따라 정렬

### 2. FAQ 조회

- 자주 묻는 질문 목록 조회
- userType 필터링 지원 (adopter, breeder)
- 정렬 순서대로 반환

### 3. 분양중인 아이들 조회

- 현재 분양 가능한 반려동물 목록 조회
- limit 파라미터로 조회 개수 제한 (기본값: 10, 최대: 50)

## API 엔드포인트 (3개)

### 1. GET /api/home/banners

활성화된 배너 목록을 정렬 순서대로 반환합니다.

**Response:**

```json
{
    "success": true,
    "code": 200,
    "data": [
        {
            "imageUrl": "https://...",
            "linkType": "internal",
            "linkUrl": "/explore",
            "order": 1
        },
        {
            "imageUrl": "https://...",
            "linkType": "external",
            "linkUrl": "https://example.com",
            "order": 2
        }
    ],
    "message": "배너 목록이 조회되었습니다.",
    "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 2. GET /api/home/faqs?userType=adopter

사용자 타입에 따른 FAQ 목록을 정렬 순서대로 반환합니다.

**Query Parameters:**

- `userType`: 사용자 타입 (adopter | breeder, 기본값: adopter)

**Response:**

```json
{
    "success": true,
    "code": 200,
    "data": [
        {
            "question": "입양 절차는 어떻게 되나요?",
            "answer": "입양 절차는 다음과 같습니다...",
            "category": "입양",
            "userType": "adopter",
            "order": 1
        }
    ],
    "message": "FAQ 목록이 조회되었습니다.",
    "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 3. GET /api/home/available-pets?limit=10

분양 가능한 반려동물 목록을 반환합니다.

**Query Parameters:**

- `limit`: 조회 개수 (기본값: 10, 최대: 50)

**Response:**

```json
{
    "success": true,
    "code": 200,
    "data": [
        {
            "petId": "507f1f77bcf86cd799439011",
            "name": "밀크",
            "breed": "골든 리트리버",
            "age": 3,
            "gender": "female",
            "price": 1500000,
            "photos": ["https://..."],
            "breederName": "해피독 브리더",
            "location": "서울특별시 강남구"
        }
    ],
    "message": "분양중인 아이들이 조회되었습니다.",
    "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## 접근 권한

- 모든 API는 인증 불필요 (공개 API)

## 관련 스키마

- **Banner Schema**: 메인 배너 정보
- **FAQ Schema**: 자주 묻는 질문 정보
- **AvailablePet Schema**: 분양 가능한 반려동물 정보

## 연관 모듈

- Breeder: 분양 가능한 반려동물 정보 참조
- Admin: 배너 및 FAQ 관리

## 데이터 특성

### 배너

- `isActive: true`인 배너만 조회
- `order` 필드로 정렬 (오름차순)
- 링크 타입: internal (앱 내부) / external (외부 URL)

### FAQ

- userType 필터링: adopter (입양자용) / breeder (브리더용)
- `order` 필드로 정렬 (오름차순)
- category로 그룹화 가능

### 분양 가능 반려동물

- 분양 가능 상태 (available)인 개체만 조회
- limit으로 개수 제한 (최대 50개)
- 브리더 정보 포함

## 캐싱 전략

- 배너와 FAQ는 정적 데이터이므로 캐싱 권장
- 분양 가능 반려동물은 실시간 업데이트 필요

## 테스트 실행

```bash
yarn test:e2e src/api/home/test/home.e2e-spec.ts
```
