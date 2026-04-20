import { Module } from '@nestjs/common';

import {
    ANNOUNCEMENT_MODULE_CONTROLLERS,
    ANNOUNCEMENT_MODULE_IMPORTS,
    ANNOUNCEMENT_MODULE_PROVIDERS,
} from './announcement.module-definition';

/**
 * 공지사항 모듈
 * 공개 API 및 관리자 API 제공
 */
@Module({
    imports: ANNOUNCEMENT_MODULE_IMPORTS,
    controllers: ANNOUNCEMENT_MODULE_CONTROLLERS,
    providers: ANNOUNCEMENT_MODULE_PROVIDERS,
})
export class AnnouncementModule {}
