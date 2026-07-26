import { Module } from '@nestjs/common';

import {
    CONTEST_ADMIN_MODULE_CONTROLLERS,
    CONTEST_ADMIN_MODULE_IMPORTS,
    CONTEST_ADMIN_MODULE_PROVIDERS,
} from './contest-admin.module-definition';

/**
 * 명예의 전당 관리자 모듈
 * /contest-admin 라우트 — 콘테스트 항목 숨김/삭제 처리
 */
@Module({
    imports: CONTEST_ADMIN_MODULE_IMPORTS,
    controllers: CONTEST_ADMIN_MODULE_CONTROLLERS,
    providers: CONTEST_ADMIN_MODULE_PROVIDERS,
})
export class ContestAdminModule {}
