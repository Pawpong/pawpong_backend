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

import { AuthController } from './auth.controller';
import { AuthAdminController } from './admin/auth-admin.controller';

import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { SmsService } from './sms.service';
import { AuthService } from './auth.service';
import { AuthAdminService } from './admin/auth-admin.service';
import { AuthTokenService } from './services/auth-token.service';

import { AuthAdminRepository } from './repository/auth-admin.repository';
import { AuthRegistrationAdapter } from './infrastructure/auth-registration.adapter';
import { AuthRegistrationNotificationAdapter } from './infrastructure/auth-registration-notification.adapter';
import { AuthAdopterRepository } from './repository/auth-adopter.repository';
import { AuthBreederRepository } from './repository/auth-breeder.repository';
import { AuthSessionAdapter } from './infrastructure/auth-session.adapter';
import { AuthSocialCallbackAdapter } from './infrastructure/auth-social-callback.adapter';
import { AuthTempUploadStore } from './infrastructure/auth-temp-upload.store';
import { AuthRegistrationPort } from './application/ports/auth-registration.port';
import { AuthRegistrationNotificationPort } from './application/ports/auth-registration-notification.port';
import { AuthSessionPort } from './application/ports/auth-session.port';
import { AUTH_TEMP_UPLOAD_PORT } from './application/ports/auth-temp-upload.port';
import { AuthSocialCallbackPort } from './application/ports/auth-social-callback.port';
import { CheckSocialUserUseCase } from './application/use-cases/check-social-user.use-case';
import { CheckEmailDuplicateUseCase } from './application/use-cases/check-email-duplicate.use-case';
import { CheckNicknameDuplicateUseCase } from './application/use-cases/check-nickname-duplicate.use-case';
import { CheckBreederNameDuplicateUseCase } from './application/use-cases/check-breeder-name-duplicate.use-case';
import { CompleteSocialRegistrationUseCase } from './application/use-cases/complete-social-registration.use-case';
import { RefreshAuthTokenUseCase } from './application/use-cases/refresh-auth-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RegisterAdopterUseCase } from './application/use-cases/register-adopter.use-case';
import { RegisterBreederUseCase } from './application/use-cases/register-breeder.use-case';
import { ProcessSocialLoginCallbackUseCase } from './application/use-cases/process-social-login-callback.use-case';
import { AuthSocialIdentityService } from './domain/services/auth-social-identity.service';
import { AuthStoredFileNameService } from './domain/services/auth-stored-file-name.service';
import { AuthSocialCallbackResponseFactoryService } from './domain/services/auth-social-callback-response-factory.service';

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
    controllers: [AuthController, AuthAdminController],
    providers: [
        AuthService,
        CheckSocialUserUseCase,
        CheckEmailDuplicateUseCase,
        CheckNicknameDuplicateUseCase,
        CheckBreederNameDuplicateUseCase,
        CompleteSocialRegistrationUseCase,
        RefreshAuthTokenUseCase,
        LogoutUseCase,
        RegisterAdopterUseCase,
        RegisterBreederUseCase,
        ProcessSocialLoginCallbackUseCase,
        AuthTokenService,
        SmsService,
        AuthAdminService,
        AuthAdopterRepository,
        AuthBreederRepository,
        AuthAdminRepository,
        AuthRegistrationAdapter,
        AuthRegistrationNotificationAdapter,
        AuthSessionAdapter,
        AuthSocialCallbackAdapter,
        AuthTempUploadStore,
        AuthSocialIdentityService,
        AuthStoredFileNameService,
        AuthSocialCallbackResponseFactoryService,
        {
            provide: AuthRegistrationPort,
            useExisting: AuthRegistrationAdapter,
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
            provide: AUTH_TEMP_UPLOAD_PORT,
            useExisting: AuthTempUploadStore,
        },
        JwtStrategy,
        GoogleStrategy,
        NaverStrategy,
        KakaoStrategy,
        CustomLoggerService,
    ],
    exports: [AuthService, SmsService],
})
export class AuthModule {}
