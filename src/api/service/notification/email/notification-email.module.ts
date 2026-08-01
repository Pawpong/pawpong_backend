import { Module } from '@nestjs/common';

import {
    NOTIFICATION_EMAIL_MODULE_CONTROLLERS,
    NOTIFICATION_EMAIL_MODULE_EXPORTS,
    NOTIFICATION_EMAIL_MODULE_IMPORTS,
    NOTIFICATION_EMAIL_MODULE_PROVIDERS,
} from './notification-email.module-definition';

/**
 * 알림 > 이메일 슬라이스
 * - 알림 이메일 발송
 * - 관리자용 이메일 템플릿 카탈로그·미리보기 렌더링
 */
@Module({
    imports: NOTIFICATION_EMAIL_MODULE_IMPORTS,
    controllers: NOTIFICATION_EMAIL_MODULE_CONTROLLERS,
    providers: NOTIFICATION_EMAIL_MODULE_PROVIDERS,
    exports: NOTIFICATION_EMAIL_MODULE_EXPORTS,
})
export class NotificationEmailModule {}
