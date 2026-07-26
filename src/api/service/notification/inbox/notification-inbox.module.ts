import { Module } from '@nestjs/common';

import {
    NOTIFICATION_INBOX_MODULE_CONTROLLERS,
    NOTIFICATION_INBOX_MODULE_EXPORTS,
    NOTIFICATION_INBOX_MODULE_IMPORTS,
    NOTIFICATION_INBOX_MODULE_PROVIDERS,
} from './notification-inbox.module-definition';

/**
 * 알림 > 알림함 슬라이스
 * - 알림 목록·미읽음 수 조회, 읽음 처리, 삭제
 * - 알림 생성 유스케이스를 dispatch 에 Port 로 노출
 */
@Module({
    imports: NOTIFICATION_INBOX_MODULE_IMPORTS,
    controllers: NOTIFICATION_INBOX_MODULE_CONTROLLERS,
    providers: NOTIFICATION_INBOX_MODULE_PROVIDERS,
    exports: NOTIFICATION_INBOX_MODULE_EXPORTS,
})
export class NotificationInboxModule {}
