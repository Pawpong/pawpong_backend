import { Module } from '@nestjs/common';

import {
    NOTIFICATION_PUSH_MODULE_CONTROLLERS,
    NOTIFICATION_PUSH_MODULE_EXPORTS,
    NOTIFICATION_PUSH_MODULE_IMPORTS,
    NOTIFICATION_PUSH_MODULE_PROVIDERS,
} from './notification-push.module-definition';

/**
 * 알림 > 푸시 슬라이스
 * - FCM 푸시 발송
 * - 디바이스 토큰 등록/해제 (기기 핸드오프 시 이전 계정에서 토큰 제거)
 */
@Module({
    imports: NOTIFICATION_PUSH_MODULE_IMPORTS,
    controllers: NOTIFICATION_PUSH_MODULE_CONTROLLERS,
    providers: NOTIFICATION_PUSH_MODULE_PROVIDERS,
    exports: NOTIFICATION_PUSH_MODULE_EXPORTS,
})
export class NotificationPushModule {}
