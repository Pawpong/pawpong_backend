import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { StringValue } from 'ms';

import { LoggerModule } from '../../../../common/logger/logger.module';
import { JwtStrategy } from '../../../../common/strategy/jwt.strategy';
import { JWT_USER_STATUS_PORT } from '../../../../common/strategy/ports/jwt-user-status.port';
import { JwtUserStatusMongooseAdapter } from '../../../../common/strategy/infrastructure/jwt-user-status-mongoose.adapter';
import { Adopter, AdopterSchema } from '../../../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../../../schema/breeder.schema';

import { AuthAdopterRepository } from '../repository/auth-adopter.repository';
import { AuthBreederRepository } from '../repository/auth-breeder.repository';
import { AuthJwtTokenAdapter } from '../infrastructure/auth-jwt-token.adapter';
import { AuthRegistrationAdapter } from '../infrastructure/auth-registration.adapter';
import { AuthTempUploadStore } from '../infrastructure/auth-temp-upload.store';
import { AuthSocialCallbackAdapter } from '../infrastructure/auth-social-callback.adapter';
import { AuthSocialLoginPolicyService } from '../domain/services/auth-social-login-policy.service';
import { AUTH_TOKEN_PORT } from '../application/ports/auth-token.port';
import { AUTH_REGISTRATION_PORT } from '../application/ports/auth-registration.port';
import { AUTH_TEMP_UPLOAD_PORT } from '../application/ports/auth-temp-upload.port';
import { AUTH_SOCIAL_CALLBACK_PORT } from '../application/ports/auth-social-callback.port';
import { AuthSignupValidationService } from '../domain/services/auth-signup-validation.service';
import { AuthPhoneNumberNormalizerService } from '../domain/services/auth-phone-number-normalizer.service';
import { AuthStoredFileNameService } from '../domain/services/auth-stored-file-name.service';
import { AuthSocialIdentityService } from '../domain/services/auth-social-identity.service';
import { AuthHttpCookieService } from '../presentation/services/auth-http-cookie.service';

// 인증 컨텍스트의 여러 슬라이스가 공유하는 기반.
// - 사용자 영속성(adopter/breeder repository)
// - 토큰 발급(AUTH_TOKEN_PORT) / 회원 조회·저장(AUTH_REGISTRATION_PORT) / 임시 업로드(AUTH_TEMP_UPLOAD_PORT)
// - 가입 검증·전화번호 정규화 등 슬라이스 공용 도메인 서비스
// - JWT 인증 인프라(JwtStrategy, JwtModule, PassportModule)
const AUTH_SHARED_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Adopter.name, schema: AdopterSchema },
    { name: Breeder.name, schema: BreederSchema },
]);

const AUTH_SHARED_JWT_IMPORT = JwtModule.registerAsync({
    useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('JWT_SECRET') || '',
        signOptions: {
            expiresIn: (configService.get<string>('JWT_EXPIRATION') || '24h') as StringValue,
        },
    }),
    inject: [ConfigService],
});

export const AUTH_SHARED_MODULE_IMPORTS = [
    AUTH_SHARED_SCHEMA_IMPORTS,
    ConfigModule,
    PassportModule,
    LoggerModule,
    AUTH_SHARED_JWT_IMPORT,
];

const AUTH_SHARED_DOMAIN_PROVIDERS = [
    AuthSignupValidationService,
    AuthPhoneNumberNormalizerService,
    AuthStoredFileNameService,
    AuthSocialIdentityService,
    // 소셜 콜백 시 사용자 판별·쿠키 정책 (social-login 흐름과 세션 쿠키 정리 양쪽에서 사용)
    AuthSocialLoginPolicyService,
];

const AUTH_SHARED_INFRASTRUCTURE_PROVIDERS = [
    AuthAdopterRepository,
    AuthBreederRepository,
    AuthJwtTokenAdapter,
    AuthRegistrationAdapter,
    AuthTempUploadStore,
    AuthSocialCallbackAdapter,
    JwtUserStatusMongooseAdapter,
];

const AUTH_SHARED_PORT_BINDINGS = [
    {
        provide: AUTH_TOKEN_PORT,
        useExisting: AuthJwtTokenAdapter,
    },
    {
        provide: AUTH_REGISTRATION_PORT,
        useExisting: AuthRegistrationAdapter,
    },
    {
        provide: AUTH_TEMP_UPLOAD_PORT,
        useExisting: AuthTempUploadStore,
    },
    {
        // 소셜 콜백 처리 + 인증 쿠키 옵션 결정 (AuthHttpCookieService 가 소비)
        provide: AUTH_SOCIAL_CALLBACK_PORT,
        useExisting: AuthSocialCallbackAdapter,
    },
    {
        provide: JWT_USER_STATUS_PORT,
        useExisting: JwtUserStatusMongooseAdapter,
    },
];

export const AUTH_SHARED_MODULE_PROVIDERS = [
    ...AUTH_SHARED_DOMAIN_PROVIDERS,
    ...AUTH_SHARED_INFRASTRUCTURE_PROVIDERS,
    ...AUTH_SHARED_PORT_BINDINGS,
    AuthHttpCookieService,
    JwtStrategy,
];

export const AUTH_SHARED_MODULE_EXPORTS = [
    ...AUTH_SHARED_DOMAIN_PROVIDERS,
    AuthAdopterRepository,
    AuthBreederRepository,
    AUTH_TOKEN_PORT,
    AUTH_REGISTRATION_PORT,
    AUTH_TEMP_UPLOAD_PORT,
    AUTH_SOCIAL_CALLBACK_PORT,
    AuthHttpCookieService,
    // 슬라이스에서 JwtService / Passport 가드를 사용할 수 있도록 재노출
    JwtModule,
    PassportModule,
    // Adopter/Breeder 모델을 슬라이스 레포지토리가 주입받을 수 있도록 재노출
    MongooseModule,
];
