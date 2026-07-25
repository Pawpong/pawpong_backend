import { Module } from '@nestjs/common';

import {
    BREEDER_MANAGEMENT_VERIFICATION_MODULE_CONTROLLERS,
    BREEDER_MANAGEMENT_VERIFICATION_MODULE_IMPORTS,
    BREEDER_MANAGEMENT_VERIFICATION_MODULE_PROVIDERS,
} from './breeder-management-verification.module-definition';

/**
 * 브리더 관리 > 인증(심사) 슬라이스
 * - 인증 상태 조회, 인증 신청 제출
 * - 인증 서류 업로드 및 최종 제출(심사 접수 알림)
 */
@Module({
    imports: BREEDER_MANAGEMENT_VERIFICATION_MODULE_IMPORTS,
    controllers: BREEDER_MANAGEMENT_VERIFICATION_MODULE_CONTROLLERS,
    providers: BREEDER_MANAGEMENT_VERIFICATION_MODULE_PROVIDERS,
})
export class BreederManagementVerificationModule {}
