import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationAdminController } from './notification-admin.controller';

import { CustomLoggerService } from '../../../common/logger/custom-logger.service';
import { NotificationAdminService } from './notification-admin.service';

import { Notification, NotificationSchema } from '../../../schema/notification.schema';

/**
 * 관리자 알림 관리 모듈
 * - 관리자가 모든 사용자의 알림을 조회하고 통계를 확인하는 기능 제공
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }])],
    controllers: [NotificationAdminController],
    providers: [NotificationAdminService, CustomLoggerService],
    exports: [NotificationAdminService],
})
export class NotificationAdminModule {}
