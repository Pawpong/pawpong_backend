# 포퐁 리뉴얼 페이지별 기능명세서 3.1~3.14

작성일: 2026-04-27  
목적: 백엔드 개발자에게 전달할 페이지별 기능 범위와 필요한 데이터/API를 정리한 문서  
범위: 3.1 홈 페이지 ~ 3.14 알림 페이지

---

## 3.1 홈 페이지

### 페이지 목적

사용자가 포퐁에 진입했을 때 주요 기능으로 이동하는 메인 허브입니다.  
입양 탐색, 브리더 탐색, 명예의 전당, 커뮤니티, FAQ로 연결합니다.

### 주요 기능

| 번호 | 기능 | 설명 |
|---:|---|---|
| 1 | 최상단 메뉴바 | 마이홈, 채팅, 알림 페이지 바로가기 |
| 2 | 배너 | 서비스 소개, 이벤트, 공지, 캠페인 노출 |
| 3 | 검색하기 | 품종/동물/브리더 검색 가능, 인기 검색어 노출 |
| 4 | 둘러보기 | 강아지/고양이/도마뱀은 입양 페이지로 이동, 브리더 탐색은 브리더 탐색 페이지로 이동 |
| 5 | 명예의 전당 | 지난주 투표율 TOP 1~3 사진 미리보기, 이번주 투표하러가기 버튼으로 명예의 전당 투표 페이지 이동 |
| 6 | 우리 아이 자랑하기 | 커뮤니티 글 3개 미리보기 |
| 7 | 신뢰할 수 있는 브리더 | 입양자에게는 서비스 소개, 브리더에게는 분양글 작성 바로가기 |
| 8 | 자주 묻는 질문 | FAQ 일부 노출 |

### 백엔드 필요 데이터

- 로그인 사용자 요약 정보
- 사용자 역할: 비회원/입양자/브리더
- 배너 목록
- 인기 검색어 목록
- 카테고리 바로가기 목록
- 명예의 전당 지난주 투표율 TOP 3
- 커뮤니티 글 3개
- 역할별 CTA 데이터
- FAQ 목록
- 알림 안 읽은 개수
- 채팅 안 읽은 개수

### API 후보

```http
GET /home/summary
GET /home/banners
GET /home/faqs
GET /search/popular-keywords
GET /notifications/unread-count
GET /chat/rooms/unread-count
```

### 기존 백엔드 활용

- `GET /home/banners`
- `GET /home/faqs`
- `GET /notification/unread-count`
- 기존 채팅방 조회 API 일부 활용 가능

### 신규/보강 필요

- 홈 통합 API `GET /home/summary` <!-- issue: #85 -->
- 인기 검색어 API
- 명예의 전당 지난주 투표율 TOP 3 API
- 커뮤니티 미리보기 API
- 역할별 CTA 분기 로직

---

## 3.2 입양 페이지

### 페이지 목적

입양 가능한 동물을 카테고리, 검색, 인기 기준으로 탐색하는 페이지입니다.

### 주요 기능

| 번호 | 기능 | 설명 |
|---:|---|---|
| 1 | 카테고리 선택 | 전체, 강아지, 고양이, 도마뱀 |
| 2 | 검색하기 | 원하는 품종이나 동물명 검색 |
| 3 | 인기 있는 아이들 | 관심 수가 가장 많은 입양 게시물 미리보기 |
| 4 | 입양 게시물 미리보기 | 무한 스크롤로 입양 게시물 목록 노출 |

### 입양 게시물 카드 정보

- 대표 사진
- 이름
- 품종
- 성별
- 나이
- 입양 상태
- 간단 소개
- 해시태그 일부
- 관심 수
- 조회 수
- 진행 중인 채팅 수 또는 문의 수
- 브리더 요약 정보
- 내가 관심 눌렀는지 여부

### 백엔드 필요 데이터

- 카테고리별 분양 게시물 목록
- 검색 결과
- 관심 수 기준 인기 게시물
- 무한 스크롤 커서 또는 페이지네이션
- 로그인 사용자의 관심 여부

### API 후보

```http
GET /available-pets
GET /available-pets/popular
GET /available-pets/search
POST /available-pets/{petId}/favorite
DELETE /available-pets/{petId}/favorite
```

### 기존 백엔드 활용

현재 `available_pets` 스키마와 브리더별 아이 조회 기능은 존재합니다.

### 신규/보강 필요

- 브리더별 조회가 아닌 **전체 공개 입양 게시물 조회 API** 필요
- 도마뱀 카테고리 지원 여부 확인 필요
- 관심 수/조회 수/진행 중 채팅 수 반환 필요
- 무한 스크롤 기준 정리 필요

---

## 3.3 입양 상세 페이지

### 페이지 목적

입양자가 특정 동물의 상세 정보를 확인하고 관심/공유/입양 신청으로 전환하는 페이지입니다.

### 주요 기능

| 번호 | 기능 | 설명 |
|---:|---|---|
| 1 | 페이지 경로 | 홈 > 입양 > 상세 등 breadcrumb 표시 |
| 2 | 동물 상세 사진 | 다중 사진 갤러리 |
| 3 | 입양 동물 소개 | 아이 소개/성향/특징 설명 |
| 4 | 관심있어요 | 관심 추가/취소 |
| 5 | 공유 | 공유 URL/메타 정보 제공 |
| 6 | 입양 현황 | 입양 가능/예약중/입양 완료 표시 |
| 7 | 기본 정보 | 품종, 성별, 나이 |
| 8 | 해시태그 | 성향/특징/품종 관련 태그 |
| 9 | 건강 정보 | 예방 접종 현황, 검진 결과, 유전병 검사 |
| 10 | 부모 정보 | 부모 사진, 품종, 생일, 엄마/아빠 구분 |
| 11 | 사육 환경 | 사육 환경 사진과 간단 설명 |
| 12 | 브리더 정보 | 브리더 요약, 마이홈 이동 |
| 13 | 입양 신청 | 입양 신청서 페이지로 이동 |

### 백엔드 필요 데이터

- 분양 게시물 상세 정보
- 사진 목록
- 관심 여부/관심 수
- 공유용 메타 데이터
- 상태값
- 품종/성별/나이
- 해시태그
- 예방접종 정보
- 검진 결과
- 유전병 검사 정보
- 부모 정보
- 사육 환경 정보
- 브리더 요약 정보
- 입양 신청 가능 여부
- 조회 수 증가 처리

### API 후보

```http
GET /available-pets/{petId}
POST /available-pets/{petId}/view
POST /available-pets/{petId}/favorite
DELETE /available-pets/{petId}/favorite
GET /available-pets/{petId}/share-meta
```

### 기존 백엔드 활용

- `AvailablePet`
- `ParentPet`
- `Breeder`
- 업로드 API

### 신규/보강 필요

현재 분양 개체 스키마에는 기본 정보 중심 필드가 많습니다. 리뉴얼 상세 페이지를 위해 아래 구조 보강이 필요합니다.

```text
healthInfo
- vaccinationStatus
- vaccinationRecords[]
- medicalCheckups[]
- geneticTests[]

careEnvironment[]
- imageUrl
- description

tags[]
viewCount
favoriteCount
inquiryCount/chatCount
```

---

## 3.4 입양 신청서 페이지

### 페이지 목적

입양자가 특정 동물에 대한 상담/입양 의사를 공식적으로 제출하는 페이지입니다.

### 주요 기능

| 번호 | 기능 | 설명 |
|---:|---|---|
| 1 | 신청 그만두기 | 신청서 작성 취소 |
| 2 | 브리더 프로필 보기 | 브리더 마이홈으로 이동 |
| 3 | 마음에 두신 아이 | 상세에서 넘어온 아이 정보 자동 입력 |
| 4 | 입양 계획 | 입양자가 입양 계획 작성 |
| 5 | 필수 확인 체크 | 입양 준비 확인 항목 체크 |
| 6 | 가족 구성원 | 함께 거주하는 가족 구성원 입력 |
| 7 | 상담 신청하기 | 신청서 제출 |

### 백엔드 필요 데이터

- 신청 대상 아이 정보
- 브리더 정보
- 입양 계획
- 필수 체크 항목
- 가족 구성원
- 개인정보 동의 여부
- 신청 상태

### API 후보

```http
GET /available-pets/{petId}/application-context
POST /adopter/application
GET /adopter/applications
GET /adopter/applications/{applicationId}
```

### 기존 백엔드 활용

기존 `AdoptionApplication` 구조를 대부분 활용할 수 있습니다.

### 신규/보강 필요

- 신청서 진입 시 아이/브리더 요약을 반환하는 context API
- 신청 완료 후 채팅방 생성/연결 정책
- 입양자 신청 취소 상태 추가 검토

### 확인 필요 정책

- 신청 즉시 채팅방을 생성할지
- 브리더가 확인한 뒤 채팅방을 생성할지
- 같은 아이에 중복 신청을 허용할지
- 입양자가 신청을 취소할 수 있는지

---

## 3.5 입양 채팅 페이지

### 페이지 목적

입양자와 브리더가 당근 채팅처럼 입양 상담을 진행하는 페이지입니다.

### 주요 기능

| 번호 | 기능 | 설명 |
|---:|---|---|
| 1 | 상단 동물 미리보기 | 사진, 품종, 성별, 나이, 입양 여부, 소개, 관심/공유, 문의 수, 관심 수, 조회 수 |
| 2 | 실시간 채팅 | 텍스트 메시지 송수신 |
| 3 | 입양 예약 상태 반영 | 브리더가 상태 변경 시 채팅방에 예약 확인 미리보기/시스템 메시지 노출 |
| 4 | 사진 첨부 | `+` 버튼으로 사진 첨부 가능 |

### 백엔드 필요 데이터

- 채팅방 정보
- 연결된 신청서 ID
- 연결된 분양 게시물 ID
- 채팅방 상단 동물 요약
- 메시지 목록
- 이미지 메시지
- 시스템 메시지
- 읽음 상태

### API 후보

```http
POST /chat/rooms
GET /chat/rooms
GET /chat/rooms/{roomId}
GET /chat/rooms/{roomId}/messages
POST /chat/rooms/{roomId}/messages
POST /chat/rooms/{roomId}/attachments
```

### 기존 백엔드 활용

- 기존 채팅방/메시지/Gateway 구조 활용

### 신규/보강 필요

- 채팅방과 `applicationId`, `petId` 연결 강화
- 분양 상태 변경 시 시스템 메시지 자동 생성
- 이미지 첨부 메시지 지원
- 채팅방 상단 미리보기 응답 추가

---

## 3.6 분양글 작성 페이지 — 브리더 전용

### 페이지 목적

브리더가 입양 가능한 동물의 상세 정보를 등록하는 페이지입니다.

### 주요 기능

| 번호 | 기능 | 설명 |
|---:|---|---|
| 1 | 기본 정보 | 사진, 품종, 이름, 생년월일, 태그, 아이 소개 |
| 2 | 건강 정보 | 접종 완료/미완료, 미완료 사유, 접종명, 접종일, 차수, 접종 내역 추가 |
| 3 | 유전병 검사 | 검사 완료/미완료, 미완료 사유, 검진일, 기관, 검사명, 결과, 검사 내역 추가 |
| 4 | 부모 정보 | 사진, 품종, 엄마/아빠 선택, 생년월일, 추가 |
| 5 | 사육 환경 | 사육 환경 사진, 사육환경 소개 |

### 백엔드 필요 데이터

- 기본 분양 게시물 정보
- 사진 목록
- 태그
- 접종 정보 배열
- 유전병 검사 정보 배열
- 부모 정보 배열
- 사육 환경 배열
- 작성자 브리더 ID

### API 후보

```http
POST /breeder-management/available-pets
POST /upload/available-pet-photos/{petId}
POST /breeder-management/available-pets/{petId}/health-records
POST /breeder-management/available-pets/{petId}/genetic-tests
POST /breeder-management/available-pets/{petId}/parents
POST /breeder-management/available-pets/{petId}/care-environments
```

### 기존 백엔드 활용

- 기존 분양 개체 등록 API
- 기존 부모견/부모묘 등록 API
- 기존 업로드 API

### 신규/보강 필요

- 건강/접종/검진/유전병 검사 구조 확장
- 사육환경 사진+설명 구조 추가
- 도마뱀 카테고리 지원 시 petType enum 확장

---

## 3.7 분양 상세보기/수정 페이지 — 브리더 전용

### 페이지 목적

브리더가 본인이 올린 분양 게시물을 확인하고 수정하거나 입양 상태를 변경하는 페이지입니다.

### 주요 기능

| 번호 | 기능 | 설명 |
|---:|---|---|
| 1 | 상세 보기 | 입양 상세와 동일한 정보 확인 |
| 2 | 게시물 수정 | 기본 정보/사진/건강/부모/사육환경 수정 |
| 3 | 상태 변경 | 입양 가능, 입양 예약중, 입양 완료로 변경 |

### 백엔드 필요 데이터

- 본인이 작성한 분양 게시물 상세
- 수정 권한 여부
- 상태 변경 가능 여부
- 연결된 채팅방 목록

### API 후보

```http
GET /breeder-management/available-pets/{petId}
PATCH /breeder-management/available-pets/{petId}
PATCH /breeder-management/available-pets/{petId}/status
DELETE /breeder-management/available-pets/{petId}
```

### 기존 백엔드 활용

- 기존 수정/상태변경 API 활용 가능

### 신규/보강 필요

- 상태 변경 시 관련 채팅방에 시스템 메시지 생성
- 상태 변경 이력 저장 검토

---

## 3.8 마이홈 — 공통

### 페이지 목적

인스타그램 마이페이지처럼 사용자 프로필과 활동을 보여주는 개인 공간입니다.  
본인이 보면 편집/저장 목록 관리가 가능하고, 다른 사람이 보면 팔로우할 수 있습니다.

### 주요 기능

| 번호 | 기능 | 설명 |
|---:|---|---|
| 1 | 프로필 사진 | 사용자 대표 이미지 |
| 2 | 프로필 편집 | 본인일 때만 노출 |
| 3 | 팔로우 버튼 | 다른 사람의 프로필일 때 노출 |
| 4 | 저장 버튼 | 본인 마이홈에서 저장 목록 이동 |
| 5 | 닉네임 | 표시 이름 |
| 6 | BPM | 사용자 활동/브랜드 지표 |
| 7 | 팔로워 수 | 팔로워 수 표시 |
| 8 | 한줄 소개 | 프로필 소개 |
| 9 | 게시글 | 내가 작성한 게시글, 게시글 작성 버튼 |
| 10 | 즐겨찾는 브리더 | 자물쇠 아이콘, 나만 볼 수 있음 |

### 백엔드 필요 데이터

- 프로필 기본 정보
- 본인 여부
- 팔로우 여부
- 팔로워/팔로잉 수
- BPM
- 작성 게시글 목록
- 즐겨찾는 브리더 목록
- 공개/비공개 필드 구분

### API 후보

```http
GET /myhome/{userId}
GET /myhome/me
PATCH /myhome/me
POST /users/{userId}/follow
DELETE /users/{userId}/follow
GET /myhome/{userId}/posts
GET /myhome/me/favorite-breeders
```

### 신규/보강 필요

- 마이홈 통합 조회 API
- 팔로우 기능
- BPM 저장/계산 정책
- 비공개 데이터 분기

---

## 3.9 마이홈 — 브리더

### 페이지 목적

브리더의 신뢰 정보와 분양 목록을 보여주는 브리더 전용 마이홈입니다.

### 주요 기능

| 번호 | 기능 | 설명 |
|---:|---|---|
| 1 | 사업장 위치 | 브리더 사업장/지역 정보 |
| 2 | 브리더 뱃지 | 인증/등급 배지 |
| 3 | 주목할 브리더 | BPM이 높으면 주목할 브리더 표시 |
| 4 | 분양 목록 | 분양글 작성 버튼, 내가 올린 분양 목록 |

### 백엔드 필요 데이터

- 브리더 프로필
- 사업장 위치
- 인증/뱃지 정보
- BPM
- 주목할 브리더 여부
- 분양 게시물 목록

### API 후보

```http
GET /myhome/breeders/{breederId}
GET /breeder/{id}/pets
POST /breeder-management/available-pets
```

### 기존 백엔드 활용

- 기존 브리더 프로필/분양 목록 API 활용 가능

### 신규/보강 필요

- 브리더 마이홈에 맞춘 summary 응답
- 주목할 브리더 기준 정의

---

## 3.10 저장 목록 페이지

### 페이지 목적

사용자가 관심 표시하거나 저장한 콘텐츠, 입양 완료한 게시물을 모아보는 페이지입니다.

### 주요 기능

| 번호 | 기능 | 설명 |
|---:|---|---|
| 1 | 입양 관심 | 입양 페이지에서 관심있어요 누른 입양 게시물 목록 |
| 2 | 저장 피드 | 커뮤니티에서 저장한 글 목록 |
| 3 | 입양 목록 | 내가 입양한 입양 게시물 목록 |

### 백엔드 필요 데이터

- 관심 입양 게시물 목록
- 저장한 커뮤니티 글 목록
- 내가 입양 완료한 게시물 목록

### API 후보

```http
GET /saved/pets
GET /saved/community-posts
GET /saved/adopted-pets
```

또는 마이홈 하위 API로 구성할 수도 있습니다.

```http
GET /myhome/me/saved/pets
GET /myhome/me/saved/posts
GET /myhome/me/adopted-pets
```

### 신규/보강 필요

- 분양 게시물 관심 저장
- 커뮤니티 글 저장
- 입양 완료 게시물과 입양자 연결

---

## 3.11 브리더 탐색 페이지

### 페이지 목적

입양자가 브리더를 탐색하고 브리더 마이홈으로 이동하는 페이지입니다.

### 주요 기능

| 번호 | 기능 | 설명 |
|---:|---|---|
| 1 | 브리더 목록 미리보기 | 브리더 카드 리스트 |
| 2 | 검색 | 브리더명, 품종, 지역 검색 |
| 3 | 필터 | 지역, 품종, 브리더 뱃지, BPM/인기 기준 |
| 4 | 마이홈 이동 | 브리더 카드 클릭 시 브리더 마이홈 이동 |

### 브리더 카드 정보

- 프로필 사진
- 브리더명
- 사업장 위치
- 전문 품종
- 브리더 뱃지
- BPM
- 팔로워 수
- 분양중 게시물 수
- 한줄 소개
- 팔로우 여부

### API 후보

```http
GET /breeders
GET /breeders/search
GET /breeders/popular
GET /breeders/{breederId}/summary
```

### 기존 백엔드 활용

- `GET /breeder/search`
- `POST /breeder/explore`
- `GET /breeder/popular`
- `GET /breeder/{id}`

### 신규/보강 필요

- 브리더 카드 응답 필드 보강
- BPM/뱃지/팔로우 여부 반환
- 도마뱀 전문 브리더 지원 여부 확인

---

## 3.12 커뮤니티 페이지

### 페이지 목적

쓰레드/인스타 흐름과 유사한 커뮤니티 피드입니다.  
사용자가 우리 아이 자랑, 질문, 후기, 정보 공유 글을 작성하고 소통합니다.

### 주요 기능

| 번호 | 기능 | 설명 |
|---:|---|---|
| 1 | 글 목록 | 커뮤니티 피드 조회 |
| 2 | 글 작성 | 텍스트/사진 게시글 작성 |
| 3 | 글 상세 | 게시글 상세 조회 |
| 4 | 댓글/답글 | 댓글 및 답글 작성 |
| 5 | 좋아요 | 게시글 좋아요 |
| 6 | 저장하기 | 글 저장 |
| 7 | 공유 | 공유 URL/메타 |
| 8 | 조회 수 | 글 조회 수 증가 |
| 9 | 작성자 마이홈 이동 | 작성자 프로필 이동 |
| 10 | 카테고리/태그 | 글 분류 |
| 11 | 인기 글 | 인기 커뮤니티 글 조회 |

### API 후보

```http
POST /community/posts
GET /community/posts
GET /community/posts/popular
GET /community/posts/{postId}
PATCH /community/posts/{postId}
DELETE /community/posts/{postId}
POST /community/posts/{postId}/view
POST /community/posts/{postId}/like
DELETE /community/posts/{postId}/like
POST /community/posts/{postId}/save
DELETE /community/posts/{postId}/save
POST /community/posts/{postId}/comments
GET /community/posts/{postId}/comments
PATCH /community/comments/{commentId}
DELETE /community/comments/{commentId}
```

### 기존 백엔드 활용

기존 영상 피드 기능은 있으나, 리뉴얼 커뮤니티는 텍스트/사진 중심 피드에 가깝기 때문에 별도 도메인으로 보는 것이 좋습니다.

### 신규/보강 필요

- 커뮤니티 게시글 도메인
- 댓글/답글 도메인
- 저장하기
- 좋아요
- 조회 수
- 신고/숨김 처리
- 작성자 마이홈 연결

---

## 3.13 명예의 전당 페이지

### 페이지 목적

사용자가 반려동물 사진을 올리고, 매주 1회 투표를 통해 인기 사진을 선정하는 참여형 페이지입니다.  
홈에서는 **지난주 투표율 TOP 1~3 사진**을 미리 보여주고, `이번주 투표하러가기` 버튼을 누르면 명예의 전당 투표 페이지로 이동합니다.

### 홈 화면 노출 정책

| 항목 | 내용 |
|---|---|
| 홈 미리보기 | 지난주 투표율 TOP 1~3 사진 노출 |
| CTA | 이번주 투표하러가기 |
| 이동 경로 | 명예의 전당 투표 페이지 |
| 목적 | 지난주 결과를 보여주면서 이번주 투표 참여로 유도 |

### 명예의 전당 투표 페이지 주요 기능

| 번호 | 기능 | 설명 |
|---:|---|---|
| 1 | 사진 등록 | 투표를 받을 사진 업로드 |
| 2 | 간단한 소개 작성 | 사진에 대한 짧은 소개/설명 작성 |
| 3 | 투표하러가기 버튼 | 버튼 클릭 시 투표용 사진이 랜덤으로 노출 |
| 4 | 랜덤 투표 카드 | 투표를 위해 등록된 사진 중 랜덤으로 1개 또는 여러 개를 보여줌 |
| 5 | 투표하기 | 계정당 1주에 1번만 투표 가능 |
| 6 | 투표수 공개 조건 | 투표 전에는 투표수를 볼 수 없고, 투표 후에만 투표수 확인 가능 |
| 7 | 어제 TOP 3 미리보기 | 어제 기준 투표율 TOP 1~3 사진 미리보기 노출 |
| 8 | 지난주 TOP 3 결과 | 홈에 노출되는 지난주 최종 TOP 1~3 결과 데이터 제공 |

### 사용자 플로우

```text
홈 명예의 전당 영역
→ 지난주 투표율 TOP 1~3 사진 확인
→ 이번주 투표하러가기 클릭
→ 명예의 전당 투표 페이지 이동
→ 사진 업로드 또는 투표하러가기 선택
→ 랜덤 사진 확인
→ 투표 진행
→ 투표 후 해당 사진의 투표수 확인 가능
```

### 백엔드 필요 데이터

- 업로더 ID
- 사진 URL
- 사진 소개글
- 투표 주차 정보
- 투표 수
- 투표율
- 사용자별 주간 투표 여부
- 랜덤 투표 후보 사진
- 어제 기준 TOP 3
- 지난주 최종 TOP 3
- 사진 상태값

### API 후보

```http
POST /hall-of-fame/entries
GET /hall-of-fame/entries
GET /hall-of-fame/random-entry
POST /hall-of-fame/entries/{entryId}/vote
GET /hall-of-fame/my-vote-status
GET /hall-of-fame/yesterday-top
GET /hall-of-fame/weekly-top
GET /hall-of-fame/entries/{entryId}/vote-result
```

### API별 설명

| API | 설명 |
|---|---|
| `POST /hall-of-fame/entries` | 사진과 간단한 소개를 등록 |
| `GET /hall-of-fame/random-entry` | 아직 투표하지 않은 사용자에게 랜덤 투표 후보 사진 반환 |
| `POST /hall-of-fame/entries/{entryId}/vote` | 해당 사진에 투표. 계정당 1주 1회 제한 |
| `GET /hall-of-fame/my-vote-status` | 이번 주 투표 여부 확인 |
| `GET /hall-of-fame/yesterday-top` | 어제 기준 투표율 TOP 1~3 조회 |
| `GET /hall-of-fame/weekly-top` | 지난주 최종 투표율 TOP 1~3 조회. 홈 미리보기에서 사용 |
| `GET /hall-of-fame/entries/{entryId}/vote-result` | 투표 후 투표수/투표율 조회 |

### 신규/보강 필요

- 명예의 전당 사진 엔티티
- 주차별 투표 기록 엔티티
- 계정당 1주 1회 투표 제한 로직
- 랜덤 투표 후보 반환 로직
- 투표 전 투표수 비공개 처리
- 투표 후 투표수 공개 처리
- 어제 기준 TOP 3 집계
- 지난주 최종 TOP 3 집계
- 관리자 숨김/삭제 처리

### 데이터 구조 후보

```text
HallOfFameEntry
- id
- uploaderId
- imageUrl
- description
- weekKey
- voteCount
- voteRate
- status: active | hidden | deleted
- createdAt
- updatedAt

HallOfFameVote
- id
- userId
- entryId
- weekKey
- createdAt

HallOfFameWeeklyResult
- weekKey
- topEntries[]
- calculatedAt
```

### 정책 확정 사항

| 항목 | 확정/요청 내용 |
|---|---|
| 투표 제한 | 계정당 1주에 1번만 가능 |
| 투표수 공개 | 투표 전 비공개, 투표 후 공개 |
| 홈 노출 | 지난주 투표율 TOP 1~3 사진 노출 |
| 투표 페이지 노출 | 어제 기준 투표율 TOP 1~3 사진 미리보기 노출 |
| 투표 후보 노출 | 투표하러가기 클릭 시 랜덤 사진 노출 |
| 사진 등록 | 사진 + 간단한 소개 입력 |

### 추가 확인 필요

- 랜덤 투표는 사진 1장씩 보여줄지, 여러 장 중 선택하게 할지
- 본인이 올린 사진에도 투표 가능한지
- 한 계정이 한 주에 사진을 몇 장까지 등록 가능한지
- 비회원은 조회만 가능한지, 투표/등록은 로그인 필수인지

---

## 3.14 알림 페이지

### 페이지 목적

사용자가 입양 신청, 채팅, 댓글, 좋아요, 팔로우, 명예의 전당 결과 등 주요 이벤트를 확인하는 페이지입니다.

### 주요 알림 종류

- 입양 신청 접수
- 입양 신청 상태 변경
- 채팅 메시지 도착
- 분양글 상태 변경
- 커뮤니티 댓글/답글
- 커뮤니티 좋아요
- 팔로우
- 명예의 전당 선정
- 브리더 인증 결과

### API 후보

```http
GET /notification
GET /notification/unread-count
PATCH /notification/{id}/read
PATCH /notification/read-all
DELETE /notification/{id}
```

### 기존 백엔드 활용

기존 알림 API를 활용할 수 있습니다.

### 신규/보강 필요

- 커뮤니티/팔로우/명예의 전당 이벤트 알림 타입 추가
