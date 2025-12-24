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

import { AuthAdminRepository } from './repository/auth-admin.repository';
import { AuthAdopterRepository } from './repository/auth-adopter.repository';
import { AuthBreederRepository } from './repository/auth-breeder.repository';

import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { Admin, AdminSchema } from '../../schema/admin.schema';
import { AuthBanner, AuthBannerSchema } from '../../schema/auth-banner.schema';
import { CounselBanner, CounselBannerSchema } from '../../schema/counsel-banner.schema';
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
            { name: AuthBanner.name, schema: AuthBannerSchema },
            { name: CounselBanner.name, schema: CounselBannerSchema },
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
        SmsService,
        AuthAdminService,
        AuthAdopterRepository,
        AuthBreederRepository,
        AuthAdminRepository,
        JwtStrategy,
        GoogleStrategy,
        NaverStrategy,
        KakaoStrategy,
        CustomLoggerService,
    ],
    exports: [AuthService, SmsService],
})
export class AuthModule {}
