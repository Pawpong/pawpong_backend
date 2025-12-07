import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationController } from './notification.controller';

import { NotificationService } from './notification.service';

import { Notification, NotificationSchema } from '../../schema/notification.schema';
import { MailModule } from '../../common/mail/mail.module';

/**
 * 알림 모듈
 *
 * 서비스 알림 및 이메일 발송 기능을 통합 제공합니다.
 * MailModule을 re-export하여 다른 모듈이 MailService와 MailTemplateService를 사용할 수 있도록 합니다.
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]), MailModule],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService, MailModule], // MailModule re-export
})
export class NotificationModule {}
