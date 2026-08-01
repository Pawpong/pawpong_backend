import { NotificationInboxModule } from '../inbox/notification-inbox.module';
import { NotificationEmailModule } from '../email/notification-email.module';
import { NotificationPushModule } from '../push/notification-push.module';
import { NotificationDispatchService } from '../application/services/notification-dispatch.service';
import { NOTIFICATION_DISPATCH_PORT } from '../application/ports/notification-dispatch.port';

// 알림 > 디스패치 슬라이스
// 다른 도메인(입양 신청·후기·브리더 심사 등)이 소비하는 단일 진입점.
// 알림 도큐먼트 생성(inbox) + 이메일(email) + 푸시(push) 를 한 번에 조율한다.
export const NOTIFICATION_DISPATCH_MODULE_IMPORTS = [
    NotificationInboxModule,
    NotificationEmailModule,
    NotificationPushModule,
];

export const NOTIFICATION_DISPATCH_MODULE_PROVIDERS = [
    NotificationDispatchService,
    {
        provide: NOTIFICATION_DISPATCH_PORT,
        useExisting: NotificationDispatchService,
    },
];

export const NOTIFICATION_DISPATCH_MODULE_EXPORTS = [NOTIFICATION_DISPATCH_PORT];
