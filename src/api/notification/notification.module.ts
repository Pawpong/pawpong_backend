import { Module } from '@nestjs/common';

import {
    NOTIFICATION_MODULE_CONTROLLERS,
    NOTIFICATION_MODULE_EXPORTS,
    NOTIFICATION_MODULE_IMPORTS,
    NOTIFICATION_MODULE_PROVIDERS,
} from './notification.module-definition';

/**
 * 알림 모듈
 *
 * 서비스 알림 및 이메일 발송 기능을 통합 제공합니다.
 */
@Module({
    imports: NOTIFICATION_MODULE_IMPORTS,
    controllers: NOTIFICATION_MODULE_CONTROLLERS,
    providers: NOTIFICATION_MODULE_PROVIDERS,
    exports: NOTIFICATION_MODULE_EXPORTS,
})
export class NotificationModule {}
