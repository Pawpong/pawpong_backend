# Filter Options 도메인

## 개요

브리더 탐색 필터링에 사용되는 모든 옵션 정보를 제공하는 도메인입니다. 프론트엔드에서 필터 UI를 구성하는데 필요한 선택지 데이터를 제공합니다.

**핵심 특징:**

- **공개 API**: 모든 API는 인증 불필요
- **정적 데이터**: 필터 옵션은 거의 변경되지 않는 정적 데이터
- **한번에 조회 가능**: 전체 옵션을 한 번의 API 호출로 조회
- **개별 조회 지원**: 필요한 옵션만 선택적으로 조회 가능

## 주요 기능

- 전체 필터 옵션 한번에 조회
- 브리더 레벨 옵션 조회
- 정렬 옵션 조회
- 강아지 크기 옵션 조회
- 고양이 털 길이 옵션 조회
- 입양 가능 여부 옵션 조회

## API 엔드포인트 (6개)

### 1. 전체 필터 옵션 조회 GET /api/filter-options

브리더 검색에 사용되는 모든 필터 옵션을 한번에 조회합니다.

**Response:**

```json
{
  "success": true,
  "code": 200,
  "data": {
    "breederLevels": [
      { "value": "new", "label": "일반", "description": "신규 브리더" },
      { "value": "elite", "label": "엘리트", "description": "검증된 브리더" }
    ],
    "sortOptions": [
      { "value": "latest", "label": "최신순" },
      { "value": "favorite", "label": "인기순" },
      { "value": "review", "label": "후기순" },
      { "value": "price_asc", "label": "가격 낮은순" },
      { "value": "price_desc", "label": "가격 높은순" }
    ],
    "dogSizes": [
      { "value": "small", "label": "소형견", "description": "10kg 미만" },
      { "value": "medium", "label": "중형견", "description": "10-25kg" },
      { "value": "large", "label": "대형견", "description": "25kg 이상" }
    ],
    "catFurLengths": [
      { "value": "short", "label": "단모", "description": "털이 짧은 품종" },
      { "value": "long", "label": "장모", "description": "털이 긴 품종" }
    ],
    "adoptionStatus": [
      { "value": true, "label": "분양 가능만 보기" },
      { "value": false, "label": "전체 보기" }
    ]
  },
  "message": "필터 옵션이 조회되었습니다.",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 2. 브리더 레벨 옵션 조회 GET /api/filter-options/breeder-levels

브리더 레벨 필터 옵션 목록을 조회합니다.

**Response:**

```json
{
  "success": true,
  "code": 200,
  "data": [
    { "value": "new", "label": "일반", "description": "신규 브리더" },
    { "value": "elite", "label": "엘리트", "description": "검증된 브리더" }
  ],
  "message": "브리더 레벨 옵션이 조회되었습니다.",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 3. 정렬 옵션 조회 GET /api/filter-options/sort-options

브리더 목록 정렬 옵션을 조회합니다.

**Response:**

```json
{
  "success": true,
  "code": 200,
  "data": [
    { "value": "latest", "label": "최신순" },
    { "value": "favorite", "label": "인기순" },
    { "value": "review", "label": "후기순" },
    { "value": "price_asc", "label": "가격 낮은순" },
    { "value": "price_desc", "label": "가격 높은순" }
  ],
  "message": "정렬 옵션이 조회되었습니다.",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 4. 강아지 크기 옵션 조회 GET /api/filter-options/dog-sizes

강아지 크기 필터 옵션을 조회합니다.

**Response:**

```json
{
  "success": true,
  "code": 200,
  "data": [
    { "value": "small", "label": "소형견", "description": "10kg 미만" },
    { "value": "medium", "label": "중형견", "description": "10-25kg" },
    { "value": "large", "label": "대형견", "description": "25kg 이상" }
  ],
  "message": "강아지 크기 옵션이 조회되었습니다.",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 5. 고양이 털 길이 옵션 조회 GET /api/filter-options/cat-fur-lengths

고양이 털 길이 필터 옵션을 조회합니다.

**Response:**

```json
{
  "success": true,
  "code": 200,
  "data": [
    { "value": "short", "label": "단모", "description": "털이 짧은 품종" },
    { "value": "long", "label": "장모", "description": "털이 긴 품종" }
  ],
  "message": "고양이 털 길이 옵션이 조회되었습니다.",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 6. 입양 가능 여부 옵션 조회 GET /api/filter-options/adoption-status

입양 가능 여부 필터 옵션을 조회합니다.

**Response:**

```json
{
  "success": true,
  "code": 200,
  "data": [
    { "value": true, "label": "분양 가능만 보기" },
    { "value": false, "label": "전체 보기" }
  ],
  "message": "입양 가능 여부 옵션이 조회되었습니다.",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## 데이터 특성

### 정적 데이터

- 필터 옵션은 거의 변경되지 않는 정적 데이터
- 프론트엔드 캐싱 적극 권장
- 앱 시작 시 한 번 조회 후 로컬 저장

### 프론트엔드 활용

```typescript
// 앱 시작 시 한 번만 조회
const filterOptions = await fetch('/api/filter-options');
localStorage.setItem('filterOptions', JSON.stringify(filterOptions));

// 이후 로컬 스토리지에서 사용
const cached = JSON.parse(localStorage.getItem('filterOptions'));
```

## 접근 권한

- 모든 API는 인증 불필요 (공개 API)

## 연관 모듈

- Breeder: 브리더 탐색 필터링
- Breeder-Explore: 필터 옵션 적용

## 성능 최적화

- 정적 데이터이므로 응답 캐싱 권장
- 브라우저 캐시 헤더 설정
- CDN 캐싱 활용

## 테스트 실행

```bash
yarn test:e2e src/api/filter-options/test/filter-options.e2e-spec.ts
```
