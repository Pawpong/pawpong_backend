# 입양자 (Adopter) 도메인

## 개요

반려동물을 입양하고자 하는 사용자들의 기능을 관리하는 도메인입니다. 입양 신청, 후기 작성, 즐겨찾기, 신고 등의 기능을 제공합니다.

## 주요 기능

- 입양 신청 관리 (생성, 조회, 상태 추적)
- 브리더 후기 작성 및 관리
- 브리더 즐겨찾기 추가/제거
- 부적절한 브리더/후기 신고
- 개인 프로필 관리

## API 엔드포인트 (13개)

### 입양 신청

- `POST /api/adopter/application` - 입양 상담 신청 제출 (Figma 디자인 기반)
- `GET /api/adopter/applications` - 내가 보낸 입양 신청 목록 조회 (페이지네이션, animalType 필터 지원)
- `GET /api/adopter/applications/:id` - 내가 보낸 입양 신청 상세 조회

### 후기 관리

- `POST /api/adopter/review` - 브리더 후기 작성
- `GET /api/adopter/reviews` - 내가 작성한 후기 목록 조회 (페이지네이션)
- `GET /api/adopter/reviews/:id` - 후기 세부 조회

### 즐겨찾기

- `POST /api/adopter/favorite` - 브리더 즐겨찾기 추가
- `DELETE /api/adopter/favorite/:breederId` - 즐겨찾기 제거
- `GET /api/adopter/favorites` - 즐겨찾기 목록 조회 (페이지네이션)

### 신고

- `POST /api/adopter/report` - 브리더 신고
- `POST /api/adopter/report/review` - 후기 신고

### 프로필

- `GET /api/adopter/profile` - 프로필 조회
- `PATCH /api/adopter/profile` - 프로필 수정

## 비즈니스 로직

### 입양 신청

- 동일한 브리더에게 대기 중인 신청이 있으면 중복 신청 불가
- 입양자 정보(이름, 이메일, 연락처)는 JWT 토큰에서 자동 추출
- 8가지 필수 정보 입력 필요:
    1. 개인정보 수집 동의
    2. 자기소개
    3. 가족 구성원 정보
    4. 모든 가족의 동의 여부
    5. 알러지 검사 정보
    6. 집을 비우는 시간
    7. 거주 공간 소개
    8. 반려동물 경험

### 후기 작성

- 입양 신청 상태가 '상담 완료(consultation_completed)'여야 작성 가능
- 본인의 입양 신청에 대해서만 작성 가능
- 한 번의 입양 신청당 하나의 후기만 작성 가능
- 이미 후기를 작성한 신청에는 재작성 불가

### 즐겨찾기

- 중복 즐겨찾기 방지
- 브리더의 최신 정보(평점, 후기 수, 분양 가능 개체 수 등)가 함께 제공됨

### 신고

- 구체적인 사유와 함께 제출
- 관리자 검토 후 조치

## 데이터 흐름

1. 인증된 입양자가 요청 전송
2. 사용자 권한 및 데이터 유효성 검증
3. 중복성 및 비즈니스 규칙 검사
4. 데이터베이스 작업 수행
5. 관련 스키마 업데이트 (브리더 통계 등)

## 보안 고려사항

- 모든 API는 JWT 인증 필요
- 입양자 역할 권한 확인
- 입력 데이터 검증 및 sanitization
- 개인정보 보호 (프로필 조회 시)

## 의존성

- Adopter Schema (사용자 정보)
- Breeder Schema (브리더 정보 참조)
- AdoptionApplication Schema (입양 신청)
- BreederReview Schema (후기)
- Favorite Schema (즐겨찾기)
- BreederReport Schema (브리더 신고)
- ReviewReport Schema (후기 신고)
- JWT 인증 가드
- 데이터 검증 파이프

## 테스트 실행

```bash
yarn test:e2e src/api/adopter/test/adopter.e2e-spec.ts
```
