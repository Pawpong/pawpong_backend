import { Module } from '@nestjs/common';

import { NOTICE_MODULE_CONTROLLERS, NOTICE_MODULE_IMPORTS, NOTICE_MODULE_PROVIDERS } from './notice.module-definition';

/**
 * 공지사항 모듈
 * 공지사항 관련 기능을 제공
 */
@Module({
    imports: NOTICE_MODULE_IMPORTS,
    controllers: NOTICE_MODULE_CONTROLLERS,
    providers: NOTICE_MODULE_PROVIDERS,
})
export class NoticeModule {}
