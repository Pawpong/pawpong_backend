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

import { AdoptionApplicationModule } from './api/adoption-application/adoption-application.module';
import { AdoptionModule } from './api/adoption/adoption.module';
import { AdopterModule } from './api/adopter/adopter.module';
import { AnnouncementModule } from './api/announcement/announcement.module';
import { AppVersionModule } from './api/app-version/app-version.module';
import { AuthModule } from './api/auth/auth.module';
import { BreedModule } from './api/breed/breed.module';
import { BreederAdminModule } from './api/breeder/admin/breeder-admin.module';
import { BreederManagementModule } from './api/breeder-management/breeder-management.module';
import { BreederModule } from './api/breeder/breeder.module';
import { BreederPetPostingModule } from './api/breeder-pet-posting/breeder-pet-posting.module';
import { ChatModule } from './api/chat/chat.module';
import { CommunityModule } from './api/community/community.module';
import { ContestAdminModule } from './api/contest/admin/contest-admin.module';
import { AiImageModule } from './api/ai-image/ai-image.module';
import { ContestModule } from './api/contest/contest.module';
import { DistrictModule } from './api/district/district.module';
import { FeedModule } from './api/feed/feed.module';
import { FilterOptionsModule } from './api/filter-options/filter-options.module';
import { HealthModule } from './api/health/health.module';
import { HomeAdminModule } from './api/home/admin/home-admin.module';
import { HomeModule } from './api/home/home.module';
import { InquiryModule } from './api/inquiry/inquiry.module';
import { NotificationAdminModule } from './api/notification/admin/notification-admin.module';
import { NotificationModule } from './api/notification/notification.module';
import { NoticeModule } from './api/notice/notice.module';
import { PlatformAdminModule } from './api/platform/admin/platform-admin.module';
import { PopularKeywordModule } from './api/popular-keyword/popular-keyword.module';
import { ProfileModule } from './api/profile/profile.module';
import { StandardQuestionModule } from './api/standard-question/standard-question.module';
import { TermsModule } from './api/terms/terms.module';
import { UploadModule } from './api/upload/upload.module';
import { UserAdminModule } from './api/user/admin/user-admin.module';

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
