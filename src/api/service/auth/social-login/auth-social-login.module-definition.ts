import { ConfigModule } from '@nestjs/config';

import { GoogleStrategy } from '../../../../common/strategy/google.strategy';
import { KakaoStrategy } from '../../../../common/strategy/kakao.strategy';
import { NaverStrategy } from '../../../../common/strategy/naver.strategy';

import { AuthSharedModule } from '../shared/auth-shared.module';
import { AuthSignupModule } from '../signup/auth-signup.module';
import { AuthGoogleLoginController } from '../controller/auth-google-login.controller';
import { AuthKakaoLoginController } from '../controller/auth-kakao-login.controller';
import { AuthNaverLoginController } from '../controller/auth-naver-login.controller';
import { AuthSocialCheckUserController } from '../controller/auth-social-check-user.controller';
import { AuthSocialCompleteRegistrationController } from '../controller/auth-social-complete-registration.controller';
import { GetSocialLoginRedirectUrlUseCase } from '../application/use-cases/get-social-login-redirect-url.use-case';
import { ProcessSocialLoginCallbackUseCase } from '../application/use-cases/process-social-login-callback.use-case';
import { CheckSocialUserUseCase } from '../application/use-cases/check-social-user.use-case';
import { CompleteSocialRegistrationUseCase } from '../application/use-cases/complete-social-registration.use-case';
import { CompleteLegacySocialRegistrationUseCase } from '../application/use-cases/complete-legacy-social-registration.use-case';
import { AuthSocialRedirectPathService } from '../domain/services/auth-social-redirect-path.service';
import { AuthSocialRegistrationResultMapperService } from '../domain/services/auth-social-registration-result-mapper.service';
import { AuthSocialUserCheckResultMapperService } from '../domain/services/auth-social-user-check-result-mapper.service';
import {
    GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY,
    PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW,
} from '../application/tokens/auth-social-flow.token';
import { AuthSocialCallbackResultFactoryService } from '../presentation/services/auth-social-callback-result-factory.service';
import { AuthSocialErrorRedirectFactoryService } from '../presentation/services/auth-social-error-redirect-factory.service';
import { AuthSocialLoginSuccessRedirectFactoryService } from '../presentation/services/auth-social-login-success-redirect-factory.service';
import { AuthSocialSignupRedirectFactoryService } from '../presentation/services/auth-social-signup-redirect-factory.service';
import { AuthRedirectResponseInterceptor } from '../presentation/interceptors/auth-redirect-response.interceptor';
import { AuthSocialCallbackResponseInterceptor } from '../presentation/interceptors/auth-social-callback-response.interceptor';

// 인증 > 소셜 로그인 슬라이스 (구글/카카오/네이버 OAuth)
// 신규 소셜 유저의 가입 완료는 signup 슬라이스의 가입 유스케이스(Port 토큰)를 사용한다.
export const AUTH_SOCIAL_LOGIN_MODULE_IMPORTS = [AuthSharedModule, AuthSignupModule, ConfigModule];

export const AUTH_SOCIAL_LOGIN_MODULE_CONTROLLERS = [
    AuthGoogleLoginController,
    AuthKakaoLoginController,
    AuthNaverLoginController,
    AuthSocialCheckUserController,
    AuthSocialCompleteRegistrationController,
];

const AUTH_SOCIAL_LOGIN_USE_CASE_PROVIDERS = [
    GetSocialLoginRedirectUrlUseCase,
    ProcessSocialLoginCallbackUseCase,
    CheckSocialUserUseCase,
    CompleteSocialRegistrationUseCase,
    CompleteLegacySocialRegistrationUseCase,
];

const AUTH_SOCIAL_LOGIN_DOMAIN_PROVIDERS = [
    AuthSocialRedirectPathService,
    AuthSocialRegistrationResultMapperService,
    AuthSocialUserCheckResultMapperService,
];

// 소셜 콜백 결과를 리다이렉트 응답으로 변환하는 표현 계층
const AUTH_SOCIAL_LOGIN_PRESENTATION_PROVIDERS = [
    AuthSocialCallbackResultFactoryService,
    AuthSocialErrorRedirectFactoryService,
    AuthSocialLoginSuccessRedirectFactoryService,
    AuthSocialSignupRedirectFactoryService,
    AuthRedirectResponseInterceptor,
    AuthSocialCallbackResponseInterceptor,
];

export const AUTH_SOCIAL_LOGIN_MODULE_PROVIDERS = [
    ...AUTH_SOCIAL_LOGIN_USE_CASE_PROVIDERS,
    ...AUTH_SOCIAL_LOGIN_DOMAIN_PROVIDERS,
    ...AUTH_SOCIAL_LOGIN_PRESENTATION_PROVIDERS,
    {
        provide: GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY,
        useExisting: GetSocialLoginRedirectUrlUseCase,
    },
    {
        provide: PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW,
        useExisting: ProcessSocialLoginCallbackUseCase,
    },
    GoogleStrategy,
    NaverStrategy,
    KakaoStrategy,
];
