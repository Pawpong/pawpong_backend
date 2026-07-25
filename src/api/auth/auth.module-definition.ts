import { AuthSharedModule } from './shared/auth-shared.module';
import { AuthSignupModule } from './signup/auth-signup.module';
import { AuthSocialLoginModule } from './social-login/auth-social-login.module';
import { AuthSessionModule } from './session/auth-session.module';
import { AuthPhoneModule } from './phone/auth-phone.module';
import { AuthUploadModule } from './upload/auth-upload.module';
import { AuthBannerModule } from './banner/auth-banner.module';
import { AuthAdminModule } from './admin/auth-admin.module';

// 인증 바운디드 컨텍스트 — 기능 슬라이스 조립만 담당한다.
// 각 슬라이스가 자기 DI(컨트롤러·유스케이스·도메인·어댑터·Port 바인딩)를 직접 소유하고,
// 공유가 필요한 것만 Port 로 노출한다(shared: 사용자 repo·TOKEN/REGISTRATION/TEMP_UPLOAD Port·JWT 인프라,
// signup: 가입 유스케이스 토큰을 social-login 에 노출).
export const AUTH_MODULE_IMPORTS = [
    AuthSharedModule,
    AuthSignupModule,
    AuthSocialLoginModule,
    AuthSessionModule,
    AuthPhoneModule,
    AuthUploadModule,
    AuthBannerModule,
    AuthAdminModule,
];

// JWT 인증 인프라(JwtStrategy/JwtModule/PassportModule)는 다른 도메인의 가드가 사용하므로 재노출
export const AUTH_MODULE_EXPORTS = [AuthSharedModule];
