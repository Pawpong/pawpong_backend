import { Module } from '@nestjs/common';

import { NOTIFICATION_MODULE_EXPORTS, NOTIFICATION_MODULE_IMPORTS } from './notification.module-definition';

/**
 * 알림 바운디드 컨텍스트
 * - 하위 기능 슬라이스(shared/inbox/email/push/dispatch) 조립만 담당
 * - 컨트롤러·프로바이더는 각 슬라이스 모듈이 소유한다
 */
@Module({
    imports: NOTIFICATION_MODULE_IMPORTS,
    exports: NOTIFICATION_MODULE_EXPORTS,
})
export class NotificationModule {}
