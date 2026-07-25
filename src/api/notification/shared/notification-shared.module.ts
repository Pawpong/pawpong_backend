import { Module } from '@nestjs/common';

import {
    NOTIFICATION_SHARED_MODULE_EXPORTS,
    NOTIFICATION_SHARED_MODULE_IMPORTS,
    NOTIFICATION_SHARED_MODULE_PROVIDERS,
} from './notification-shared.module-definition';

/**
 * 알림 공통 슬라이스
 * - 알림 도큐먼트 영속성(INBOX / COMMAND Port)
 * - 알림 문구 조립 서비스
 */
@Module({
    imports: NOTIFICATION_SHARED_MODULE_IMPORTS,
    providers: NOTIFICATION_SHARED_MODULE_PROVIDERS,
    exports: NOTIFICATION_SHARED_MODULE_EXPORTS,
})
export class NotificationSharedModule {}
