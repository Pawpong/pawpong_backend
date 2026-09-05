import { Module } from '@nestjs/common';
import {
    BREEDER_MANAGEMENT_MODULE_EXPORTS,
    BREEDER_MANAGEMENT_MODULE_IMPORTS,
} from './breeder-management.module-definition';

/**
 * 브리더 관리 바운디드 컨텍스트
 * - 하위 기능 슬라이스(profile/verification/pets/applications/reviews/account/admin-banner) 조립만 담당
 * - 컨트롤러·프로바이더는 각 슬라이스 모듈이 소유한다
 */
@Module({
    imports: BREEDER_MANAGEMENT_MODULE_IMPORTS,
    exports: BREEDER_MANAGEMENT_MODULE_EXPORTS,
})
export class BreederManagementModule {}
