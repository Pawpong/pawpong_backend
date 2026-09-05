import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WinstonModule } from 'nest-winston';

import { winstonConfig } from './common/config/winston.config';
import { AlimtalkAdminModule } from './common/alimtalk/admin/alimtalk-admin.module';
import { AlimtalkModule } from './common/alimtalk/alimtalk.module';
import { DatabaseModule } from './common/database/database.module';
import { DiscordWebhookModule } from './common/discord/discord-webhook.module';
import { KafkaModule } from './common/kafka/kafka.module';
import { LoggerModule } from './common/logger/logger.module';
import { RedisModule } from './common/redis/redis.module';

import { AdoptionApplicationModule } from './api/service/adoption-application/adoption-application.module';
import { AdoptionModule } from './api/service/adoption/adoption.module';
import { AdopterModule } from './api/service/adopter/adopter.module';
import { AnnouncementModule } from './api/service/announcement/announcement.module';
import { AppVersionModule } from './api/service/app-version/app-version.module';
import { AuthModule } from './api/service/auth/auth.module';
import { BreedModule } from './api/service/breed/breed.module';
import { BreederAdminModule } from './api/admin/breeder/breeder-admin.module';
import { BreederManagementModule } from './api/service/breeder-management/breeder-management.module';
import { BreederModule } from './api/service/breeder/breeder.module';
import { BreederPetPostingModule } from './api/service/breeder-pet-posting/breeder-pet-posting.module';
import { ChatModule } from './api/service/chat/chat.module';
import { CommunityModule } from './api/service/community/community.module';
import { ContestAdminModule } from './api/admin/contest/contest-admin.module';
import { AiImageModule } from './api/service/ai-image/ai-image.module';
import { ContestModule } from './api/service/contest/contest.module';
import { DistrictModule } from './api/service/district/district.module';
import { FeedModule } from './api/service/feed/feed.module';
import { FilterOptionsModule } from './api/service/filter-options/filter-options.module';
import { HealthModule } from './api/service/health/health.module';
import { HomeAdminModule } from './api/admin/home/home-admin.module';
import { HomeModule } from './api/service/home/home.module';
import { InquiryModule } from './api/service/inquiry/inquiry.module';
import { NotificationAdminModule } from './api/admin/notification/notification-admin.module';
import { NotificationModule } from './api/service/notification/notification.module';
import { NoticeModule } from './api/service/notice/notice.module';
import { PlatformAdminModule } from './api/admin/platform/platform-admin.module';
import { PopularKeywordModule } from './api/service/popular-keyword/popular-keyword.module';
import { ProfileModule } from './api/service/profile/profile.module';
import { StandardQuestionModule } from './api/service/standard-question/standard-question.module';
import { TermsModule } from './api/service/terms/terms.module';
import { UploadModule } from './api/service/upload/upload.module';
import { UserAdminModule } from './api/admin/user/user-admin.module';

const APP_FOUNDATION_MODULES = [
    ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
    }),
    WinstonModule.forRoot(winstonConfig),
    EventEmitterModule.forRoot(),
    LoggerModule,
    DiscordWebhookModule,
    RedisModule,
    KafkaModule,
    DatabaseModule,
    AlimtalkModule,
    AlimtalkAdminModule,
];

const APP_API_MODULES = [
    AuthModule,
    HomeModule,
    HomeAdminModule,
    BreederModule,
    AdopterModule,
    BreederManagementModule,
    BreederAdminModule,
    UserAdminModule,
    PlatformAdminModule,
    HealthModule,
    UploadModule,
    DistrictModule,
    BreedModule,
    FilterOptionsModule,
    StandardQuestionModule,
    NotificationModule,
    NotificationAdminModule,
    AnnouncementModule,
    NoticeModule,
    TermsModule,
    PopularKeywordModule,
    AdoptionModule,
    BreederPetPostingModule,
    ProfileModule,
    CommunityModule,
    AdoptionApplicationModule,
    AppVersionModule,
    InquiryModule,
    FeedModule,
    ChatModule,
    ContestModule,
    ContestAdminModule,
    AiImageModule,
];

export const APP_MODULE_IMPORTS = [...APP_FOUNDATION_MODULES, ...APP_API_MODULES];
