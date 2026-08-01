import { Module } from '@nestjs/common';

import {
    BREEDER_MANAGEMENT_SHARED_MODULE_EXPORTS,
    BREEDER_MANAGEMENT_SHARED_MODULE_IMPORTS,
    BREEDER_MANAGEMENT_SHARED_MODULE_PROVIDERS,
} from './breeder-management-shared.module-definition';

/**
 * 브리더 관리 공통 슬라이스
 * - 슬라이스 간 공유되는 capability(파일키 → CDN URL 변환 등)를 한곳에서 제공/노출
 */
@Module({
    imports: BREEDER_MANAGEMENT_SHARED_MODULE_IMPORTS,
    providers: BREEDER_MANAGEMENT_SHARED_MODULE_PROVIDERS,
    exports: BREEDER_MANAGEMENT_SHARED_MODULE_EXPORTS,
})
export class BreederManagementSharedModule {}
