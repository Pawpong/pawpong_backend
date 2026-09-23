# Apple 로그인 자격 증명과 계정 삭제

기존 Apple 콜백은 `id_token`만 검증했다. 이제 일회용 `code`를 Apple `/auth/token`에 교환하고 두 ID 토큰의 검증된 `sub`가 일치할 때만 로그인 처리로 넘긴다. Apple refresh token은 Pawpong JWT refresh token과 분리한 `apple_credentials` 컬렉션에 AES-256-GCM으로 저장한다. 조회 키는 Apple sub의 HMAC이며, 암호문은 기본 조회에서 제외한다.

## 운영 설정

- `APPLE_CLIENT_ID`: 웹 Services ID.
- `APPLE_TEAM_ID`, `APPLE_KEY_ID`: 해당 앱에 연결된 Sign in with Apple 키의 식별자.
- `APPLE_PRIVATE_KEY`: PKCS#8 키. 환경 파일에서 줄바꿈은 `\n`으로 인코딩한다. 또는 `APPLE_PRIVATE_KEY_PATH`로 읽기 전용 키 파일을 지정한다.
- `APPLE_CALLBACK_URL`: Apple에 등록한 웹 콜백과 정확히 일치해야 한다.
- `APPLE_TOKEN_ENCRYPTION_KEY`: 별도로 생성한 32-byte 키를 64자리 hex로 저장한다. JWT 서명키나 Apple 서명키를 재사용하지 않는다.

키는 Control의 운영 환경 관리로 백업·버전 검증 후 반영한다. 소스·커밋·요청 로그·심사 문서에 비밀값을 넣지 않는다. **암호화 키를 임의 교체하면 이미 저장된 토큰을 읽을 수 없으므로**, 회전 시 이전 키로 복호화하고 새 키로 재암호화하는 별도 마이그레이션이 필요하다. 키 설정 없이 콜백을 배포하지 않는다.

## 영구 삭제와 재시도

1. 계정 삭제 작업이 서비스 접근을 차단한다.
2. Apple 자격 증명 저장을 잠그고 보관된 Apple refresh token을 `/auth/revoke`로 폐기한다.
3. 외부 연결 해제에 성공한 후 저장된 암호문을 제거한다. 네트워크 실패는 토큰을 유지하고 삭제 작업을 재시도한다.
4. 삭제 직전에 시작된 콜백의 재저장을 막기 위해 15분짜리 HMAC 표식만 유지한다. 이 시간에는 같은 Apple 신원으로 로그인하면 처리 중 안내가 표시될 수 있다.
5. 과거 계정에 토큰이 없으면 자체 데이터 삭제는 진행하고 `manual_disconnect_required`를 반환한다. UI는 Apple 계정 연결 수동 해제 방법을 안내한다. 기존 복구 가능한 탈퇴에는 이 경로를 사용하지 않는다.

## 검증

암호문 변조·다른 사용자로의 암호문 이동, 콜백/code 신원 불일치, 삭제와 늦은 콜백 경합, 외부 실패 뒤 재시도, 수동 해제 상태 보존, ES256 client secret과 REST 요청 형식을 단위 테스트 및 임시 MongoDB로 검증한다. 실제 사용자 Apple 계정을 삭제하는 검증은 수행하지 않는다.

공식 근거: [Apple TN3194](https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple), [Token validation](https://developer.apple.com/documentation/signinwithapplerestapi/generate-and-validate-tokens), [Token revocation](https://developer.apple.com/documentation/signinwithapplerestapi/revoke-tokens).
