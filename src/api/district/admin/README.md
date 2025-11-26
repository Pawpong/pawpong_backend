# District Admin Module

## 개요

지역 데이터를 관리하는 관리자 모듈입니다. 시/도와 시/군/구 지역 정보를 CRUD 할 수 있습니다.

## 주요 기능

### 1. 지역 관리

#### 모든 지역 조회 (`GET /api/districts-admin`)

- 모든 지역 목록 조회
- 시/도별 시/군/구 리스트 포함

**응답 예시:**

```json
{
    "success": true,
    "code": 200,
    "data": [
        {
            "id": "507f1f77bcf86cd799439011",
            "city": "서울특별시",
            "districts": ["강남구", "강동구", "강북구", "강서구"],
            "createdAt": "2025-01-15T10:30:00.000Z",
            "updatedAt": "2025-01-15T10:30:00.000Z"
        }
    ]
}
```

#### 특정 지역 조회 (`GET /api/districts-admin/:id`)

- ID로 특정 지역 조회

#### 지역 생성 (`POST /api/districts-admin`)

- 새로운 지역 추가
- 시/도와 시/군/구 리스트 설정

**요청 예시:**

```json
{
    "city": "서울특별시",
    "districts": ["강남구", "강동구", "강북구", "강서구"]
}
```

#### 지역 수정 (`PATCH /api/districts-admin/:id`)

- 기존 지역 정보 수정
- 시/군/구 추가/삭제

**요청 예시:**

```json
{
    "city": "서울특별시",
    "districts": ["강남구", "강동구", "강북구", "강서구", "관악구"]
}
```

#### 지역 삭제 (`DELETE /api/districts-admin/:id`)

- 지역 데이터 영구 삭제

## 파일 구조

```
district/admin/
├── district-admin.controller.ts    # API 엔드포인트
├── district-admin.service.ts        # 비즈니스 로직
├── district-admin.module.ts         # 모듈 정의
├── dto/
│   ├── request/
│   │   ├── create-district-request.dto.ts
│   │   └── update-district-request.dto.ts
│   └── response/
│       └── district-response.dto.ts
└── README.md                         # 도메인 문서
```

## 주요 메서드

### DistrictAdminService

```typescript
async createDistrict(dto: CreateDistrictRequestDto): Promise<DistrictResponseDto>
async getAllDistricts(): Promise<DistrictResponseDto[]>
async getDistrictById(id: string): Promise<DistrictResponseDto>
async updateDistrict(id: string, dto: UpdateDistrictRequestDto): Promise<DistrictResponseDto>
async deleteDistrict(id: string): Promise<void>
```

## 스키마 관계

### 연관 스키마

- **District**: 지역 정보 (districts 컬렉션)

### 지역 데이터 구조

```typescript
{
  city: string;         // 시/도명 (예: "서울특별시", "경기도")
  districts: string[];  // 시/군/구 리스트
}
```

### 사용 예시 데이터

**서울특별시:**

```json
{
    "city": "서울특별시",
    "districts": [
        "강남구",
        "강동구",
        "강북구",
        "강서구",
        "관악구",
        "광진구",
        "구로구",
        "금천구",
        "노원구",
        "도봉구",
        "동대문구",
        "동작구",
        "마포구",
        "서대문구",
        "서초구",
        "성동구",
        "성북구",
        "송파구",
        "양천구",
        "영등포구",
        "용산구",
        "은평구",
        "종로구",
        "중구",
        "중랑구"
    ]
}
```

**경기도:**

```json
{
    "city": "경기도",
    "districts": [
        "수원시",
        "성남시",
        "고양시",
        "용인시",
        "부천시",
        "안산시",
        "안양시",
        "남양주시",
        "화성시",
        "평택시",
        "의정부시",
        "시흥시",
        "파주시",
        "김포시",
        "광명시"
    ]
}
```

## 에러 처리

- 400 Bad Request: 잘못된 요청, 최소 1개 이상의 시/군 필요
- 404 Not Found: 지역을 찾을 수 없음
- 409 Conflict: 중복된 시/도

## 권한

- **필수 권한**: super_admin
- 시스템 기초 데이터 관리

## 테스트 실행

```bash
yarn test:e2e src/api/district/admin/test/district-admin.e2e-spec.ts
```
