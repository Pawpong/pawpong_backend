import { Module } from '@nestjs/common';

import {
    NOTIFICATION_DISPATCH_MODULE_EXPORTS,
    NOTIFICATION_DISPATCH_MODULE_IMPORTS,
    NOTIFICATION_DISPATCH_MODULE_PROVIDERS,
} from './notification-dispatch.module-definition';

/**
 * 알림 > 디스패치 슬라이스
 * - 도메인 이벤트 알림의 단일 진입점(NOTIFICATION_DISPATCH_PORT)
 * - 알림 도큐먼트 생성 + 이메일 + 푸시를 함께 조율
 */
@Module({
    imports: NOTIFICATION_DISPATCH_MODULE_IMPORTS,
    providers: NOTIFICATION_DISPATCH_MODULE_PROVIDERS,
    exports: NOTIFICATION_DISPATCH_MODULE_EXPORTS,
})
export class NotificationDispatchModule {}
