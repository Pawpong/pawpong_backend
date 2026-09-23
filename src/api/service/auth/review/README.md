# 심사 계정 로그인

`POST /api/auth/review-login`은 `{emailAddress, password}`를 받아 전용 `review_credentials` 컬렉션의 자격 증명만 확인한다. 일반 사용자 및 관리자 비밀번호 로그인으로 확장하지 않는다. 역할마다 고유 계정 한 개만 등록할 수 있으며 이메일, accountId, role을 함께 확인한다. 계정은 `active`, local 인증 계정이어야 하며 브리더는 승인 완료와 기존 `isTestAccount=true`가 필요하다.

성공 응답은 기존 `ApiResponseDto`의 `data: {accessToken, refreshToken, expiresIn, user: {userId, email, role, nickname}}`. 기존 JWT 발급기와 서비스 계정의 refreshToken 해시 필드를 그대로 사용한다. 쿠키는 프론트 BFF가 저장하며 심사 여부를 JWT 또는 일반 서비스 기능 분기에 추가하지 않는다. 로그아웃 후 동일한 자격 증명으로 다시 로그인할 수 있다. 기존 정책과 동일하게 계정별 refresh 세션 한 개이므로 동시 기기 로그인 시 이전 refresh가 갱신될 수 있다.

잘못된 비밀번호, 없는/비활성 자격 증명, 탈퇴·정지·승인 취소는 동일한 401을 반환한다. Redis 공유 제한은 15분에 IP 60회, 정규화 이메일 20회이며 장애 시 503으로 거부한다. 원본 IP는 명시적으로 신뢰하는 로컬 프록시 홉까지만 읽는다. BFF가 원본 IP를 신뢰 가능하게 전달하지 않으면 같은 공개 egress IP가 하나의 제한으로 묶인다. 임의 X-Forwarded-For를 신뢰하지 않는다.

## 신규 계정 두 개 생성

운영자가 독립적으로 생성한 임의 비밀번호(각각 20~72 UTF-8 바이트, 서로 다름)를 사용한다. 저장된 입력 JSON 키는 `operator`, `acceptTerms:true`, `adopter:{emailAddress,password,nickname}`, `breeder:{emailAddress,password,nickname}`이다. 실제 이메일·비밀번호·연결 URI는 저장소/CLI 인자/로그에 넣지 않는다. stdin 또는 현재 실행 사용자 소유 0600 일반 파일로만 입력한다.

```sh
# 기본 dry-run: 입력만 검사하고 DB에 접속하지 않는다.
node -r ts-node/register src/scripts/provision-review-accounts.ts --input-file /protected/review-input.json

# 운영자가 대상과 입력을 확인한 뒤 실행. MONGODB_URI는 기존 보호 환경에서 공급한다.
node -r ts-node/register src/scripts/provision-review-accounts.ts --input-file /protected/review-input.json --apply --expected-database TARGET_DATABASE

# 빌드된 컨테이너에서는 동일한 CLI를 컴파일 산출물로 실행한다.
node dist/scripts/provision-review-accounts.js --input-file /protected/review-input.json --apply --expected-database TARGET_DATABASE
```

이 도구는 기존 이메일/닉네임 또는 기존 심사 자격 증명이 있으면 중단하며 갱신/upsert를 하지 않는다. 현재 활성 필수 약관에 동의 이력을 남긴다. MongoDB 트랜잭션이 지원되어야 하며 두 계정 및 두 자격 증명을 함께 생성하거나 모두 롤백한다. 해시는 cost 12 bcrypt로 자격 증명 컬렉션에만 저장한다. 기본 조회 및 document 직렬화는 해시를 제외한다. stdout은 생성 계정 ID와 성공 여부만 포함하며 비밀번호를 반환하지 않는다.

브리더는 테스트 계정으로 표시하고 기존 탐색/홈 노출 제외 기능을 사용한다. 실제 허가증/신분증을 위조하거나 등록 알림을 보내지 않는다. 이 플래그가 모든 쓰기·직접 프로필 접근·알림을 격리하는 것은 아니다. 로그인 후 서비스 기능은 실제 일반 계정과 동일하다. 심사 자격 증명 발급 주체는 `provisionedBy`와 timestamps로 남긴다.

계정 영구 삭제 시 연결된 `review_credentials`도 삭제한다. 탈퇴 계정을 이 도구로 자동 복원하지 않는다. `enabled=false`는 새 비밀번호 로그인을 막는 용도이며 이미 발급한 세션은 기존 계정/세션 정책을 따른다. 실제 심사 제출 전 운영 생성과 두 역할의 로그인·로그아웃·재로그인 검증이 별도로 필요하다.
