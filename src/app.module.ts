import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';

import { winstonConfig } from './common/config/winston.config';

import { CustomLoggerService } from './common/logger/custom-logger.service';

import { AuthModule } from './api/auth/auth.module';
import { HomeModule } from './api/home/home.module';
import { BreedModule } from './api/breed/breed.module';
import { HealthModule } from './api/health/health.module';
import { UploadModule } from './api/upload/upload.module';
import { BreederModule } from './api/breeder/breeder.module';
import { AdopterModule } from './api/adopter/adopter.module';
import { DistrictModule } from './api/district/district.module';
import { DatabaseModule } from './common/database/database.module';
import { UserAdminModule } from './api/user/admin/user-admin.module';
import { HomeAdminModule } from './api/home/admin/home-admin.module';
import { PlatformAdminModule } from './api/platform/admin/platform-admin.module';
import { FilterOptionsModule } from './api/filter-options/filter-options.module';
import { StandardQuestionModule } from './api/standard-question/standard-question.module';
import { BreederManagementModule } from './api/breeder-management/breeder-management.module';
import { BreederAdminModule } from './api/breeder/admin/breeder-admin.module'; // TODO: 기능별 분리 예정
import { NotificationModule } from './api/notification/notification.module';
import { AnnouncementModule } from './api/announcement/announcement.module';
import { BreederLevelAdminModule } from './api/breeder-level/admin/breeder-level-admin.module';
import { BreederVerificationAdminModule } from './api/breeder-verification/admin/breeder-verification-admin.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        WinstonModule.forRoot(winstonConfig),
        DatabaseModule,
        StandardQuestionModule,
        AuthModule,
        HomeModule,
        HomeAdminModule,
        BreederModule,
        AdopterModule,
        BreederManagementModule,
        BreederAdminModule,
        BreederVerificationAdminModule,
        BreederLevelAdminModule,
        UserAdminModule,
        PlatformAdminModule,
        HealthModule,
        UploadModule,
        DistrictModule,
        BreedModule,
        FilterOptionsModule,
        NotificationModule,
        AnnouncementModule,
    ],
    controllers: [],
    providers: [CustomLoggerService],
})
export class AppModule {}
