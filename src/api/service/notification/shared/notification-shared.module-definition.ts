import { MongooseModule } from '@nestjs/mongoose';

import { Notification, NotificationSchema } from '../../../../schema/notification.schema';

import { NOTIFICATION_COMMAND_PORT } from '../application/ports/notification-command.port';
import { NOTIFICATION_INBOX_PORT } from '../application/ports/notification-inbox.port';
import { NotificationItemMapperService } from '../domain/services/notification-item-mapper.service';
import { NotificationMessageTemplateService } from '../domain/services/notification-message-template.service';
import { NotificationMongooseCommandAdapter } from '../infrastructure/notification-mongoose-command.adapter';
import { NotificationMongooseInboxAdapter } from '../infrastructure/notification-mongoose-inbox.adapter';
import { NotificationRepository } from '../repository/notification.repository';

// 알림 컨텍스트 공통 기반 — 알림 도큐먼트 영속성(읽기/쓰기 Port)과 메시지 조립 서비스.
// inbox(사용자 알림함) / dispatch(도메인 이벤트 알림 생성) 양쪽에서 사용한다.
const NOTIFICATION_SHARED_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Notification.name, schema: NotificationSchema },
]);

export const NOTIFICATION_SHARED_MODULE_IMPORTS = [NOTIFICATION_SHARED_SCHEMA_IMPORTS];

export const NOTIFICATION_SHARED_MODULE_PROVIDERS = [
    NotificationRepository,
    NotificationMongooseInboxAdapter,
    NotificationMongooseCommandAdapter,
    NotificationItemMapperService,
    NotificationMessageTemplateService,
    {
        provide: NOTIFICATION_INBOX_PORT,
        useExisting: NotificationMongooseInboxAdapter,
    },
    {
        provide: NOTIFICATION_COMMAND_PORT,
        useExisting: NotificationMongooseCommandAdapter,
    },
];

export const NOTIFICATION_SHARED_MODULE_EXPORTS = [
    NOTIFICATION_INBOX_PORT,
    NOTIFICATION_COMMAND_PORT,
    NotificationItemMapperService,
    NotificationMessageTemplateService,
    MongooseModule,
];
