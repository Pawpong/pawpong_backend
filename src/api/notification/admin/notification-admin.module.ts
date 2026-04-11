import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationAdminQueryController } from './notification-admin-query.controller';
import { NotificationAdminStatsController } from './notification-admin-stats.controller';

import { CustomLoggerService } from '../../../common/logger/custom-logger.service';
import { NOTIFICATION_ADMIN_READER_PORT } from './application/ports/notification-admin-reader.port';
import { GetAdminNotificationsUseCase } from './application/use-cases/get-admin-notifications.use-case';
import { GetNotificationAdminStatsUseCase } from './application/use-cases/get-notification-admin-stats.use-case';
import { NotificationAdminItemMapperService } from './domain/services/notification-admin-item-mapper.service';
import { NotificationAdminPageAssemblerService } from './domain/services/notification-admin-page-assembler.service';
import { NotificationAdminPaginationAssemblerService } from './domain/services/notification-admin-pagination-assembler.service';
import { NotificationAdminStatsResultMapperService } from './domain/services/notification-admin-stats-result-mapper.service';
import { NotificationAdminMongooseReaderAdapter } from './infrastructure/notification-admin-mongoose-reader.adapter';
import { NotificationAdminRepository } from './repository/notification-admin.repository';

import { Notification, NotificationSchema } from '../../../schema/notification.schema';

/**
 * 관리자 알림 관리 모듈
 * - 관리자가 모든 사용자의 알림을 조회하고 통계를 확인하는 기능 제공
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }])],
    controllers: [NotificationAdminQueryController, NotificationAdminStatsController],
    providers: [
        CustomLoggerService,
        GetAdminNotificationsUseCase,
        GetNotificationAdminStatsUseCase,
        NotificationAdminPaginationAssemblerService,
        NotificationAdminItemMapperService,
        NotificationAdminPageAssemblerService,
        NotificationAdminStatsResultMapperService,
        NotificationAdminRepository,
        NotificationAdminMongooseReaderAdapter,
        {
            provide: NOTIFICATION_ADMIN_READER_PORT,
            useExisting: NotificationAdminMongooseReaderAdapter,
        },
    ],
})
export class NotificationAdminModule {}
