import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { MongooseModule } from '@nestjs/mongoose';

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
import { AuthSessionController } from './auth-session.controller';
import { AuthSignupController } from './auth-signup.controller';
import { AuthGoogleLoginController } from './auth-google-login.controller';
import { AuthKakaoLoginController } from './auth-kakao-login.controller';
import { AuthNaverLoginController } from './auth-naver-login.controller';
import { AuthSocialRegistrationController } from './auth-social-registration.controller';
import { AuthProfileUploadController } from './auth-profile-upload.controller';
import { AuthBreederDocumentsUploadController } from './auth-breeder-documents-upload.controller';

import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { LoginAdminUseCase } from './admin/application/use-cases/login-admin.use-case';
import { RefreshAdminTokenUseCase } from './admin/application/use-cases/refresh-admin-token.use-case';
import { AuthAdminAuthenticationService } from './admin/domain/services/auth-admin-authentication.service';
import { AuthAdminPresentationService } from './admin/domain/services/auth-admin-presentation.service';
import { AuthAdminRepositoryAdapter } from './admin/infrastructure/auth-admin-repository.adapter';
import { AuthAdminBcryptAdapter } from './admin/infrastructure/auth-admin-bcrypt.adapter';
import { AuthAdminJwtAdapter } from './admin/infrastructure/auth-admin-jwt.adapter';
import { AUTH_ADMIN_READER } from './admin/application/ports/auth-admin-reader.port';
import { AUTH_ADMIN_PASSWORD } from './admin/application/ports/auth-admin-password.port';
import { AUTH_ADMIN_TOKEN } from './admin/application/ports/auth-admin-token.port';
import { AuthTokenService } from './services/auth-token.service';

import { AuthAdminRepository } from './repository/auth-admin.repository';
import { AuthRegistrationAdapter } from './infrastructure/auth-registration.adapter';
import { AuthRegistrationNotificationAdapter } from './infrastructure/auth-registration-notification.adapter';
import { AuthAdopterRepository } from './repository/auth-adopter.repository';
import { AuthBreederRepository } from './repository/auth-breeder.repository';
import { AuthSessionAdapter } from './infrastructure/auth-session.adapter';
import { AuthSocialCallbackAdapter } from './infrastructure/auth-social-callback.adapter';
import { AuthTempUploadStore } from './infrastructure/auth-temp-upload.store';
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
import { AuthSocialCallbackResponseFactoryService } from './domain/services/auth-social-callback-response-factory.service';
import { AuthProfileImageFilePolicyService } from './domain/services/auth-profile-image-file-policy.service';
import { AuthBreederDocumentFilePolicyService } from './domain/services/auth-breeder-document-file-policy.service';
import { AuthBreederDocumentOriginalFileNameService } from './domain/services/auth-breeder-document-original-file-name.service';
import { AuthBreederDocumentSubmissionService } from './domain/services/auth-breeder-document-submission.service';
import { AuthPhoneVerificationPolicyService } from './domain/services/auth-phone-verification-policy.service';
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
            useFactory: async (configService: ConfigService) =>
                ({
                    secret: configService.get<string>('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get<string>('JWT_EXPIRATION') || '24h',
                    },
                }) as any,
            inject: [ConfigService],
        }),
    ],
    controllers: [
        AuthSessionController,
        AuthPhoneController,
        AuthGoogleLoginController,
        AuthNaverLoginController,
        AuthKakaoLoginController,
        AuthSocialRegistrationController,
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
        AuthTokenService,
        AuthAdminAuthenticationService,
        AuthAdminPresentationService,
        AuthAdopterRepository,
        AuthBreederRepository,
        AuthAdminRepository,
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
        AuthSocialCallbackResponseFactoryService,
        AuthProfileImageFilePolicyService,
        AuthBreederDocumentFilePolicyService,
        AuthBreederDocumentOriginalFileNameService,
        AuthBreederDocumentSubmissionService,
        AuthPhoneVerificationPolicyService,
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
        JwtStrategy,
        GoogleStrategy,
        NaverStrategy,
        KakaoStrategy,
        CustomLoggerService,
    ],
    exports: [],
})
export class AuthModule {}
