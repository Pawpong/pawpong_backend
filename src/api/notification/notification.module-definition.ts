import { NotificationSharedModule } from './shared/notification-shared.module';
import { NotificationInboxModule } from './inbox/notification-inbox.module';
import { NotificationEmailModule } from './email/notification-email.module';
import { NotificationPushModule } from './push/notification-push.module';
import { NotificationDispatchModule } from './dispatch/notification-dispatch.module';

// 알림 바운디드 컨텍스트 — 기능 슬라이스 조립만 담당한다.
// 각 슬라이스가 자기 DI 를 소유하고, 외부 도메인이 쓰는 것만 Port 로 재노출한다.
export const NOTIFICATION_MODULE_IMPORTS = [
    NotificationSharedModule,
    NotificationInboxModule,
    NotificationEmailModule,
    NotificationPushModule,
    NotificationDispatchModule,
];

export const NOTIFICATION_MODULE_EXPORTS = [
    // 도메인 이벤트 알림 진입점 (NOTIFICATION_DISPATCH_PORT)
    NotificationDispatchModule,
    // 어드민 푸시 모듈이 직접 발송 (NOTIFICATION_PUSH_PORT)
    NotificationPushModule,
    // 어드민 푸시 모듈이 알림 도큐먼트 생성 (NOTIFICATION_COMMAND_PORT)
    NotificationSharedModule,
];
