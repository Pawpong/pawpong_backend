# Pawpong Backend

Pawpong 서비스의 백엔드 API 서버입니다. `NestJS 11 + MongoDB + TypeScript` 기반으로 구성되어 있고, `헥사고날 아키텍처(Ports & Adapters)`와 `DomainError → AllExceptionsFilter` 예외 응답 규칙을 기준으로 정리돼 있습니다.

## Tech Stack

- **Framework**: NestJS 11 (Express) + TypeScript 5
- **Database**: MongoDB (Mongoose 8)
- **Cache/Queue**: Redis, BullMQ
- **Messaging**: Kafka (kafkajs)
- **Realtime**: Socket.IO
- **Auth**: JWT + Passport (Google / Naver / Kakao OAuth)
- **Storage**: S3 / Google Cloud Storage
- **Docs**: Swagger (OpenAPI 3)
- **Test**: Jest + `mongodb-memory-server`

## Project Structure

```
src/
├── api/                     # 도메인별 API 모듈
│   ├── adopter/             # 입양자
│   ├── announcement/        # 긴급 공지
│   ├── app-version/         # 앱 버전 관리
│   ├── auth/                # 인증 (소셜 로그인 포함)
│   ├── breed/               # 품종
│   ├── breeder/             # 브리더 검색/상세
│   ├── breeder-management/  # 브리더 본인 관리
│   ├── chat/                # 1:1 채팅 (WebSocket)
│   ├── district/            # 지역
│   ├── feed/                # 동영상 피드 (HLS)
│   ├── filter-options/      # 필터 옵션
│   ├── health/              # 헬스체크
│   ├── home/                # 홈 배너/FAQ
│   ├── inquiry/             # 문의
│   ├── notice/              # 공지사항
│   ├── notification/        # 알림
│   ├── platform/            # 플랫폼 통계/시스템 헬스
│   ├── standard-question/   # 입양 신청 표준 질문
│   ├── upload/              # 파일 업로드
│   └── user/                # 사용자 관리
├── common/                  # 공통 필터/인터셉터/파이프/가드
└── main.ts
```

## Architecture Layers

각 도메인 모듈은 다음 레이어 구조를 따릅니다.

```
domain/                    # 엔티티, 값 객체, 도메인 서비스, DomainError
application/               # use-case, port(in/out), dto, tokens
adapter/infrastructure/    # persistence, external, mapper
```

- `controller` → `use-case` → `port` → `adapter` 의 단방향 흐름을 유지합니다.
- `application` 계층은 `dto/schema/infrastructure`를 직접 참조하지 않고, port 인터페이스로만 외부와 상호작용합니다.
- 비즈니스 규칙 위반은 `DomainError` 계열(Validation / NotFound / Authorization / Conflict)로 발생시키고, 전역 `AllExceptionsFilter`에서 HTTP 응답으로 변환합니다.
- 공통 provider/export 패턴은 `token + useExisting + export` 기준으로 통일돼 있습니다.
