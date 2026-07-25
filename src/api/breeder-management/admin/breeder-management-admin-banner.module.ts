import { Module } from '@nestjs/common';

import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_MODULE_CONTROLLERS,
    BREEDER_MANAGEMENT_ADMIN_BANNER_MODULE_EXPORTS,
    BREEDER_MANAGEMENT_ADMIN_BANNER_MODULE_IMPORTS,
    BREEDER_MANAGEMENT_ADMIN_BANNER_MODULE_PROVIDERS,
} from './breeder-management-admin-banner.module-definition';

/**
 * 브리더 관리 > 관리자 배너 슬라이스
 * - 프로필/상담 배너 CRUD (관리자)
 * - 공개 배너 조회
 * - 활성 프로필 배너 조회 Port(GET_ACTIVE_PROFILE_BANNERS_QUERY)를 외부로 노출
 */
@Module({
    imports: BREEDER_MANAGEMENT_ADMIN_BANNER_MODULE_IMPORTS,
    controllers: BREEDER_MANAGEMENT_ADMIN_BANNER_MODULE_CONTROLLERS,
    providers: BREEDER_MANAGEMENT_ADMIN_BANNER_MODULE_PROVIDERS,
    exports: BREEDER_MANAGEMENT_ADMIN_BANNER_MODULE_EXPORTS,
})
export class BreederManagementAdminBannerModule {}
