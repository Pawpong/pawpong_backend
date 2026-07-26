import { Module } from '@nestjs/common';

import {
    ADOPTER_ADMIN_MODULE_CONTROLLERS,
    ADOPTER_ADMIN_MODULE_IMPORTS,
    ADOPTER_ADMIN_MODULE_PROVIDERS,
} from './adopter-admin.module-definition';

/**
 * 입양자 > 관리자 슬라이스
 * - 후기 신고 목록 조회 및 후기 삭제
 * - 입양 신청 목록·상세 조회
 */
@Module({
    imports: ADOPTER_ADMIN_MODULE_IMPORTS,
    controllers: ADOPTER_ADMIN_MODULE_CONTROLLERS,
    providers: ADOPTER_ADMIN_MODULE_PROVIDERS,
})
export class AdopterAdminModule {}
