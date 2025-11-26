# Upload Module

## 개요

파일 업로드를 담당하는 모듈입니다. Google Cloud Storage (GCS)와 연동하여 이미지 파일을 업로드하고 CDN URL을 반환합니다.

## 주요 기능

### 1. 브리더 대표 사진 업로드

- 브리더 프로필 대표 사진 업로드 (`POST /api/upload/representative-photos`)
- 최대 3장 제한, 각 파일 최대 5MB
- 로그인 필수 (브리더 권한)
- 자동으로 DB에 저장 (`profile.representativePhotos` 배열)

### 2. 분양 개체 사진 업로드

- 분양 개체의 사진 1장 업로드 (`POST /api/upload/available-pet-photos/:petId`)
- 자동으로 DB에 저장 (`photos` 배열)
- 본인 소유 개체만 업로드 가능

### 3. 부모견/부모묘 사진 업로드

- 부모견/묘의 사진 1장 업로드 (`POST /api/upload/parent-pet-photos/:petId`)
- 자동으로 DB에 저장 (`photos` 배열)
- 본인 소유 개체만 업로드 가능

### 4. 단일 파일 업로드

- 일반 단일 파일 업로드 (`POST /api/upload/single`)
- 폴더 지정 가능 (옵션)
- 인증 불필요 (공개 API)

### 5. 다중 파일 업로드

- 다중 파일 업로드 (`POST /api/upload/multiple`)
- 최대 10개 파일 제한
- 폴더 지정 가능 (옵션)
- 인증 불필요 (공개 API)

### 6. 파일 삭제

- 업로드된 파일 삭제 (`DELETE /api/upload`)
- fileName을 body에 전달
- 인증 불필요 (공개 API)

## API 엔드포인트 (6개)

### 1. POST /api/upload/representative-photos

**요청:**

- Content-Type: `multipart/form-data`
- Field name: `files` (최대 3개)
- Auth: JWT 필수 (breeder 권한)

**검증:**

- 파일 개수: 최대 3장
- 파일 크기: 각 파일 최대 5MB
- 파일 타입: jpg, jpeg, png, gif, webp만 허용

**응답:**

```json
{
    "success": true,
    "code": 200,
    "data": [
        {
            "cdnUrl": "https://storage.googleapis.com/...",
            "fileName": "representative/xxx.jpg",
            "fileSize": 1024000
        }
    ],
    "message": "대표 사진이 업로드되고 저장되었습니다."
}
```

### 2. POST /api/upload/available-pet-photos/:petId

**요청:**

- Content-Type: `multipart/form-data`
- Field name: `file` (1개)
- Auth: JWT 필수 (breeder 권한)

**검증:**

- 해당 petId가 본인 소유인지 확인

**DB 업데이트:**

- AvailablePet 컬렉션의 `photos` 배열에 1개만 저장

### 3. POST /api/upload/parent-pet-photos/:petId

**요청:**

- Content-Type: `multipart/form-data`
- Field name: `file` (1개)
- Auth: JWT 필수 (breeder 권한)

**검증:**

- 해당 petId가 본인 소유인지 확인

**DB 업데이트:**

- ParentPet 컬렉션의 `photos` 배열에 1개만 저장

### 4. POST /api/upload/single

**요청:**

- Content-Type: `multipart/form-data`
- Field name: `file` (1개)
- Body: `folder` (옵션)
- Auth: 불필요

**응답:**

```json
{
    "success": true,
    "code": 200,
    "data": {
        "cdnUrl": "https://storage.googleapis.com/...",
        "fileName": "folder/xxx.jpg",
        "fileSize": 1024000
    },
    "message": "파일 업로드 성공"
}
```

### 5. POST /api/upload/multiple

**요청:**

- Content-Type: `multipart/form-data`
- Field name: `files` (최대 10개)
- Body: `folder` (옵션)
- Auth: 불필요

**검증:**

- 파일 개수: 최대 10개

### 6. DELETE /api/upload

**요청:**

```json
{
    "fileName": "folder/xxx.jpg"
}
```

**응답:**

```json
{
    "success": true,
    "code": 200,
    "data": null,
    "message": "파일 삭제 성공"
}
```

## 파일 구조

```
upload/
├── upload.controller.ts        # API 엔드포인트
├── upload.module.ts             # 모듈 정의
└── dto/
    └── response/
        └── upload-response.dto.ts
```

## 에러 처리

- 400 Bad Request: 파일이 없음, 잘못된 파일 형식, 크기 초과
- 403 Forbidden: 브리더 권한 필요, 본인 소유 아님
- 404 Not Found: 해당 petId를 찾을 수 없음

## 연관 모듈

- StorageService: GCS 연동 서비스
- Breeder: 브리더 프로필 이미지 저장
- AvailablePet: 분양 개체 사진 저장
- ParentPet: 부모견/묘 사진 저장

## 스토리지 구조

```
bucket/
├── representative/          # 브리더 대표 사진
├── pets/
│   ├── available/          # 분양 개체 사진
│   └── parent/             # 부모견/묘 사진
└── [기타 폴더]/            # 커스텀 폴더
```

## 개선 사항

- [ ] 이미지 자동 리사이징
- [ ] WebP 자동 변환
- [ ] 바이러스 스캔 연동
- [ ] 파일 권한 확인 (DELETE 시)

## 테스트 실행

```bash
yarn test:e2e src/api/upload/test/upload.e2e-spec.ts
```
