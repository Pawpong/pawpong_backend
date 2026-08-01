import { Module } from '@nestjs/common';

import {
    BREEDER_MANAGEMENT_PROFILE_MODULE_CONTROLLERS,
    BREEDER_MANAGEMENT_PROFILE_MODULE_EXPORTS,
    BREEDER_MANAGEMENT_PROFILE_MODULE_IMPORTS,
    BREEDER_MANAGEMENT_PROFILE_MODULE_PROVIDERS,
} from './breeder-management-profile.module-definition';

/**
 * 브리더 관리 > 프로필/대시보드 슬라이스
 * - 브리더 프로필 조회·수정, 대시보드 요약
 * - PROFILE_PORT 를 다른 슬라이스(pets/applications/verification)에 노출
 */
@Module({
    imports: BREEDER_MANAGEMENT_PROFILE_MODULE_IMPORTS,
    controllers: BREEDER_MANAGEMENT_PROFILE_MODULE_CONTROLLERS,
    providers: BREEDER_MANAGEMENT_PROFILE_MODULE_PROVIDERS,
    exports: BREEDER_MANAGEMENT_PROFILE_MODULE_EXPORTS,
})
export class BreederManagementProfileModule {}
