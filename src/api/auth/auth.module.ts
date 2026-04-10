import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { MongooseModule } from '@nestjs/mongoose';
import type { StringValue } from 'ms';

import { winstonConfig } from '../../common/config/winston.config';
import { JwtStrategy } from '../../common/strategy/jwt.strategy';
import { NaverStrategy } from '../../common/strategy/naver.strategy';
import { KakaoStrategy } from '../../common/strategy/kakao.strategy';
import { GoogleStrategy } from '../../common/strategy/google.strategy';

import { AuthBannerController } from './auth-banner.controller';
import { AuthDuplicateCheckController } from './auth-duplicate-check.controller';
import { AuthPhoneController } from './auth-phone.controller';
import { AuthAdminLoginController } from './admin/auth-admin-login.controller';
import { AuthAdminTokenController } from './admin/auth-admin-token.controller';
import { AuthRefreshTokenController } from './auth-refresh-token.controller';
import { AuthSignupController } from './auth-signup.controller';
import { AuthGoogleLoginController } from './auth-google-login.controller';
import { AuthKakaoLoginController } from './auth-kakao-login.controller';
import { AuthNaverLoginController } from './auth-naver-login.controller';
import { AuthSocialCheckUserController } from './auth-social-check-user.controller';
import { AuthSocialCompleteRegistrationController } from './auth-social-complete-registration.controller';
import { AuthProfileUploadController } from './auth-profile-upload.controller';
import { AuthBreederDocumentsUploadController } from './auth-breeder-documents-upload.controller';
import { AuthLogoutController } from './auth-logout.controller';

import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { LoginAdminUseCase } from './admin/application/use-cases/login-admin.use-case';
import { RefreshAdminTokenUseCase } from './admin/application/use-cases/refresh-admin-token.use-case';
import { AuthAdminAuthenticationService } from './admin/domain/services/auth-admin-authentication.service';
import { AuthAdminPresentationService } from './admin/domain/services/auth-admin-presentation.service';
import { AuthAdminResponseMessageService } from './admin/domain/services/auth-admin-response-message.service';
import { AuthAdminRepositoryAdapter } from './admin/infrastructure/auth-admin-repository.adapter';
import { AuthAdminBcryptAdapter } from './admin/infrastructure/auth-admin-bcrypt.adapter';
import { AuthAdminJwtAdapter } from './admin/infrastructure/auth-admin-jwt.adapter';
import { AUTH_ADMIN_READER } from './admin/application/ports/auth-admin-reader.port';
import { AUTH_ADMIN_PASSWORD } from './admin/application/ports/auth-admin-password.port';
import { AUTH_ADMIN_TOKEN } from './admin/application/ports/auth-admin-token.port';
import { AuthTokenPort } from './application/ports/auth-token.port';

import { AuthAdminRepository } from './repository/auth-admin.repository';
import { AuthPhoneVerificationRepository } from './repository/auth-phone-verification.repository';
import { AuthRegistrationAdapter } from './infrastructure/auth-registration.adapter';
import { AuthRegistrationNotificationAdapter } from './infrastructure/auth-registration-notification.adapter';
import { AuthAdopterRepository } from './repository/auth-adopter.repository';
import { AuthBreederRepository } from './repository/auth-breeder.repository';
import { AuthSessionAdapter } from './infrastructure/auth-session.adapter';
import { AuthSocialCallbackAdapter } from './infrastructure/auth-social-callback.adapter';
import { AuthTempUploadStore } from './infrastructure/auth-temp-upload.store';
import { AuthJwtTokenAdapter } from './infrastructure/auth-jwt-token.adapter';
import { AuthUploadFileStoreAdapter } from './infrastructure/auth-upload-file-store.adapter';
import { AuthProfileImageTargetAdapter } from './infrastructure/auth-profile-image-target.adapter';
import { AuthRegistrationPort } from './application/ports/auth-registration.port';
import { AuthRegistrationNotificationPort } from './application/ports/auth-registration-notification.port';
import { AuthSessionPort } from './application/ports/auth-session.port';
import { AuthTempUploadPort } from './application/ports/auth-temp-upload.port';
import { AuthSocialCallbackPort } from './application/ports/auth-social-callback.port';
import { AuthUploadFileStorePort } from './application/ports/auth-upload-file-store.port';
import { AuthProfileImageTargetPort } from './application/ports/auth-profile-image-target.port';
import { AUTH_PHONE_VERIFICATION_REGISTRY_PORT } from './application/ports/auth-phone-verification-registry.port';
import { AUTH_PHONE_VERIFICATION_SENDER_PORT } from './application/ports/auth-phone-verification-sender.port';
import { AUTH_PHONE_VERIFICATION_STORE_PORT } from './application/ports/auth-phone-verification-store.port';
import {
    GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY,
    PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW,
} from './application/ports/auth-social-flow.port';
import {
    REGISTER_ADOPTER_AUTH_SIGNUP,
    REGISTER_BREEDER_AUTH_SIGNUP,
} from './application/ports/auth-signup-completion.port';
import { SUBMIT_AUTH_BREEDER_DOCUMENTS } from './application/ports/auth-breeder-document-submission.port';
import { CheckSocialUserUseCase } from './application/use-cases/check-social-user.use-case';
import { CheckEmailDuplicateUseCase } from './application/use-cases/check-email-duplicate.use-case';
import { CheckNicknameDuplicateUseCase } from './application/use-cases/check-nickname-duplicate.use-case';
import { CheckBreederNameDuplicateUseCase } from './application/use-cases/check-breeder-name-duplicate.use-case';
import { CompleteSocialRegistrationUseCase } from './application/use-cases/complete-social-registration.use-case';
import { CompleteLegacySocialRegistrationUseCase } from './application/use-cases/complete-legacy-social-registration.use-case';
import { GetSocialLoginRedirectUrlUseCase } from './application/use-cases/get-social-login-redirect-url.use-case';
import { SendPhoneVerificationCodeUseCase } from './application/use-cases/send-phone-verification-code.use-case';
import { VerifyPhoneVerificationCodeUseCase } from './application/use-cases/verify-phone-verification-code.use-case';
import { RefreshAuthTokenUseCase } from './application/use-cases/refresh-auth-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RegisterAdopterUseCase } from './application/use-cases/register-adopter.use-case';
import { RegisterBreederUseCase } from './application/use-cases/register-breeder.use-case';
import { ProcessSocialLoginCallbackUseCase } from './application/use-cases/process-social-login-callback.use-case';
import { UploadAuthProfileImageUseCase } from './application/use-cases/upload-auth-profile-image.use-case';
import { UploadAuthBreederDocumentsUseCase } from './application/use-cases/upload-auth-breeder-documents.use-case';
import { SubmitAuthBreederDocumentsUseCase } from './application/use-cases/submit-auth-breeder-documents.use-case';
import { UploadAndSubmitAuthBreederDocumentsUseCase } from './application/use-cases/upload-and-submit-auth-breeder-documents.use-case';
import { AuthSocialIdentityService } from './domain/services/auth-social-identity.service';
import { AuthStoredFileNameService } from './domain/services/auth-stored-file-name.service';
import { AuthSocialErrorRedirectResponseFactoryService } from './domain/services/auth-social-error-redirect-response-factory.service';
import { AuthSocialLoginSuccessRedirectResponseFactoryService } from './domain/services/auth-social-login-success-redirect-response-factory.service';
import { AuthSocialRedirectPathService } from './domain/services/auth-social-redirect-path.service';
import { AuthSocialSignupRedirectResponseFactoryService } from './domain/services/auth-social-signup-redirect-response-factory.service';
import { AuthProfileImageFilePolicyService } from './domain/services/auth-profile-image-file-policy.service';
import { AuthBreederDocumentFilePolicyService } from './domain/services/auth-breeder-document-file-policy.service';
import { AuthBreederDocumentOriginalFileNameService } from './domain/services/auth-breeder-document-original-file-name.service';
import { AuthBreederDocumentSubmissionService } from './domain/services/auth-breeder-document-submission.service';
import { AuthPhoneVerificationPolicyService } from './domain/services/auth-phone-verification-policy.service';
import { AuthPhoneVerificationResponseFactoryService } from './domain/services/auth-phone-verification-response-factory.service';
import { AuthLogoutResponseFactoryService } from './domain/services/auth-logout-response-factory.service';
import { AuthDuplicateCheckResponseMessageService } from './domain/services/auth-duplicate-check-response-message.service';
import { AuthHttpCookieService } from './domain/services/auth-http-cookie.service';
import { AuthSocialHttpFlowService } from './domain/services/auth-social-http-flow.service';
import { AuthUploadPresentationService } from './domain/services/auth-upload-presentation.service';
import { AuthBreederVerificationCommandAdapter } from './infrastructure/auth-breeder-verification-command.adapter';
import { AuthPhoneVerificationMemoryStore } from './infrastructure/auth-phone-verification-memory.store';
import { AuthPhoneVerificationMongooseRegistryAdapter } from './infrastructure/auth-phone-verification-mongoose-registry.adapter';
import { AuthPhoneVerificationAlimtalkAdapter } from './infrastructure/auth-phone-verification-alimtalk.adapter';
import { AUTH_BREEDER_VERIFICATION_COMMAND_PORT } from './application/ports/auth-breeder-verification-command.port';

import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { Admin, AdminSchema } from '../../schema/admin.schema';
import { PhoneWhitelist, PhoneWhitelistSchema } from '../../schema/phone-whitelist.schema';

import { StorageModule } from '../../common/storage/storage.module';
import { BreederManagementModule } from '../breeder-management/breeder-management.module';
import { DiscordWebhookModule } from '../../common/discord/discord-webhook.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Adopter.name, schema: AdopterSchema },
            { name: Breeder.name, schema: BreederSchema },
            { name: Admin.name, schema: AdminSchema },
            { name: PhoneWhitelist.name, schema: PhoneWhitelistSchema },
        ]),
        StorageModule,
        BreederManagementModule,
        DiscordWebhookModule,
        PassportModule,
        WinstonModule.forRoot(winstonConfig),
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService): JwtModuleOptions => ({
                    secret: configService.get<string>('JWT_SECRET') || '',
                    signOptions: {
                        expiresIn: (configService.get<string>('JWT_EXPIRATION') || '24h') as StringValue,
                    },
                }),
            inject: [ConfigService],
        }),
    ],
    controllers: [
        AuthRefreshTokenController,
        AuthLogoutController,
        AuthPhoneController,
        AuthGoogleLoginController,
        AuthNaverLoginController,
        AuthKakaoLoginController,
        AuthSocialCheckUserController,
        AuthSocialCompleteRegistrationController,
        AuthDuplicateCheckController,
        AuthSignupController,
        AuthBannerController,
        AuthProfileUploadController,
        AuthBreederDocumentsUploadController,
        AuthAdminLoginController,
        AuthAdminTokenController,
    ],
    providers: [
        CheckSocialUserUseCase,
        CheckEmailDuplicateUseCase,
        CheckNicknameDuplicateUseCase,
        CheckBreederNameDuplicateUseCase,
        CompleteSocialRegistrationUseCase,
        CompleteLegacySocialRegistrationUseCase,
        GetSocialLoginRedirectUrlUseCase,
        SendPhoneVerificationCodeUseCase,
        VerifyPhoneVerificationCodeUseCase,
        RefreshAuthTokenUseCase,
        LogoutUseCase,
        RegisterAdopterUseCase,
        RegisterBreederUseCase,
        ProcessSocialLoginCallbackUseCase,
        UploadAuthProfileImageUseCase,
        UploadAuthBreederDocumentsUseCase,
        SubmitAuthBreederDocumentsUseCase,
        UploadAndSubmitAuthBreederDocumentsUseCase,
        LoginAdminUseCase,
        RefreshAdminTokenUseCase,
        AuthJwtTokenAdapter,
        AuthAdminAuthenticationService,
        AuthAdminPresentationService,
        AuthAdminResponseMessageService,
        AuthAdopterRepository,
        AuthBreederRepository,
        AuthAdminRepository,
        AuthPhoneVerificationRepository,
        AuthAdminRepositoryAdapter,
        AuthAdminBcryptAdapter,
        AuthAdminJwtAdapter,
        AuthRegistrationAdapter,
        AuthRegistrationNotificationAdapter,
        AuthSessionAdapter,
        AuthSocialCallbackAdapter,
        AuthTempUploadStore,
        AuthUploadFileStoreAdapter,
        AuthProfileImageTargetAdapter,
        AuthSocialIdentityService,
        AuthStoredFileNameService,
        AuthSocialRedirectPathService,
        AuthSocialSignupRedirectResponseFactoryService,
        AuthSocialLoginSuccessRedirectResponseFactoryService,
        AuthSocialErrorRedirectResponseFactoryService,
        AuthProfileImageFilePolicyService,
        AuthBreederDocumentFilePolicyService,
        AuthBreederDocumentOriginalFileNameService,
        AuthBreederDocumentSubmissionService,
        AuthPhoneVerificationPolicyService,
        AuthPhoneVerificationResponseFactoryService,
        AuthLogoutResponseFactoryService,
        AuthDuplicateCheckResponseMessageService,
        AuthHttpCookieService,
        AuthSocialHttpFlowService,
        AuthUploadPresentationService,
        AuthBreederVerificationCommandAdapter,
        AuthPhoneVerificationMemoryStore,
        AuthPhoneVerificationMongooseRegistryAdapter,
        AuthPhoneVerificationAlimtalkAdapter,
        {
            provide: AuthRegistrationPort,
            useExisting: AuthRegistrationAdapter,
        },
        {
            provide: AUTH_PHONE_VERIFICATION_REGISTRY_PORT,
            useExisting: AuthPhoneVerificationMongooseRegistryAdapter,
        },
        {
            provide: AUTH_PHONE_VERIFICATION_STORE_PORT,
            useExisting: AuthPhoneVerificationMemoryStore,
        },
        {
            provide: AUTH_PHONE_VERIFICATION_SENDER_PORT,
            useExisting: AuthPhoneVerificationAlimtalkAdapter,
        },
        {
            provide: AUTH_BREEDER_VERIFICATION_COMMAND_PORT,
            useExisting: AuthBreederVerificationCommandAdapter,
        },
        {
            provide: AUTH_ADMIN_READER,
            useExisting: AuthAdminRepositoryAdapter,
        },
        {
            provide: AUTH_ADMIN_PASSWORD,
            useExisting: AuthAdminBcryptAdapter,
        },
        {
            provide: AUTH_ADMIN_TOKEN,
            useExisting: AuthAdminJwtAdapter,
        },
        {
            provide: AuthRegistrationNotificationPort,
            useExisting: AuthRegistrationNotificationAdapter,
        },
        {
            provide: AuthTokenPort,
            useExisting: AuthJwtTokenAdapter,
        },
        {
            provide: AuthSessionPort,
            useExisting: AuthSessionAdapter,
        },
        {
            provide: AuthSocialCallbackPort,
            useExisting: AuthSocialCallbackAdapter,
        },
        {
            provide: AuthTempUploadPort,
            useExisting: AuthTempUploadStore,
        },
        {
            provide: AuthUploadFileStorePort,
            useExisting: AuthUploadFileStoreAdapter,
        },
        {
            provide: AuthProfileImageTargetPort,
            useExisting: AuthProfileImageTargetAdapter,
        },
        {
            provide: GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY,
            useExisting: GetSocialLoginRedirectUrlUseCase,
        },
        {
            provide: PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW,
            useExisting: ProcessSocialLoginCallbackUseCase,
        },
        {
            provide: REGISTER_ADOPTER_AUTH_SIGNUP,
            useExisting: RegisterAdopterUseCase,
        },
        {
            provide: REGISTER_BREEDER_AUTH_SIGNUP,
            useExisting: RegisterBreederUseCase,
        },
        {
            provide: SUBMIT_AUTH_BREEDER_DOCUMENTS,
            useExisting: SubmitAuthBreederDocumentsUseCase,
        },
        JwtStrategy,
        GoogleStrategy,
        NaverStrategy,
        KakaoStrategy,
        CustomLoggerService,
    ],
    exports: [],
})
export class AuthModule {}
