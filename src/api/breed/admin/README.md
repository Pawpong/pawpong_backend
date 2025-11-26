# Breed Admin Module

## 개요

반려동물 품종 데이터를 관리하는 관리자 모듈입니다. 강아지/고양이 품종 카테고리와 세부 품종을 CRUD 할 수 있습니다.

## 주요 기능

### 1. 품종 관리

#### 모든 품종 조회 (`GET /api/breeds-admin`)

- 모든 품종 카테고리 목록 조회
- 강아지/고양이 구분
- 카테고리별 세부 품종 리스트 포함

**응답 예시:**

```json
{
    "success": true,
    "code": 200,
    "data": [
        {
            "id": "507f1f77bcf86cd799439011",
            "petType": "dog",
            "category": "소형견",
            "categoryDescription": "10kg 미만",
            "breeds": ["비숑프리제", "말티즈", "포메라니안"],
            "createdAt": "2025-01-15T10:30:00.000Z",
            "updatedAt": "2025-01-15T10:30:00.000Z"
        }
    ]
}
```

#### 특정 품종 조회 (`GET /api/breeds-admin/:id`)

- ID로 특정 품종 카테고리 조회

#### 품종 생성 (`POST /api/breeds-admin`)

- 새로운 품종 카테고리 생성
- petType: 'dog' 또는 'cat'
- 카테고리명, 설명, 품종 리스트 설정

**요청 예시:**

```json
{
    "petType": "dog",
    "category": "소형견",
    "categoryDescription": "10kg 미만",
    "breeds": ["비숑프리제", "말티즈", "포메라니안"]
}
```

#### 품종 수정 (`PATCH /api/breeds-admin/:id`)

- 기존 품종 카테고리 정보 수정
- petType은 수정 불가

#### 품종 삭제 (`DELETE /api/breeds-admin/:id`)

- 품종 카테고리 영구 삭제

## 파일 구조

```
breed/admin/
├── admin-breed.controller.ts    # API 엔드포인트
├── admin-breed.service.ts        # 비즈니스 로직
├── admin-breed.module.ts         # 모듈 정의
├── dto/
│   ├── request/
│   │   ├── create-breed-request.dto.ts
│   │   └── update-breed-request.dto.ts
│   └── response/
│       └── breed-response.dto.ts
└── README.md                      # 도메인 문서
```

## 주요 메서드

### AdminBreedService

```typescript
async createBreed(dto: CreateBreedRequestDto): Promise<BreedResponseDto>
async getAllBreeds(): Promise<BreedResponseDto[]>
async getBreedById(id: string): Promise<BreedResponseDto>
async updateBreed(id: string, dto: UpdateBreedRequestDto): Promise<BreedResponseDto>
async deleteBreed(id: string): Promise<void>
```

## 스키마 관계

### 연관 스키마

- **Breed**: 품종 정보 (breeds 컬렉션)

### 품종 데이터 구조

```typescript
{
  petType: 'dog' | 'cat';       // 동물 타입
  category: string;              // 카테고리명 (예: "소형견", "장모종")
  categoryDescription?: string;  // 카테고리 설명
  breeds: string[];              // 세부 품종 리스트
}
```

### 사용 예시 데이터

**강아지 품종:**

- 소형견: 비숑프리제, 말티즈, 포메라니안, 치와와
- 중형견: 웰시코기, 비글, 코카스파니엘
- 대형견: 골든 리트리버, 래브라도, 허스키

**고양이 품종:**

- 단모종: 아메리칸 숏헤어, 러시안 블루, 샴
- 장모종: 페르시안, 메인쿤, 노르웨이 숲

## 에러 처리

- 400 Bad Request: 잘못된 요청, 유효성 검증 실패
- 404 Not Found: 품종을 찾을 수 없음
- 409 Conflict: 중복된 카테고리

## 권한

- **필수 권한**: super_admin
- 시스템 기초 데이터 관리

## 테스트 실행

```bash
yarn test:e2e src/api/breed/admin/test/admin-breed.e2e-spec.ts
```
