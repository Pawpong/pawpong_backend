import { Module } from '@nestjs/common';

import {
    BREEDER_MANAGEMENT_ACCOUNT_MODULE_CONTROLLERS,
    BREEDER_MANAGEMENT_ACCOUNT_MODULE_IMPORTS,
    BREEDER_MANAGEMENT_ACCOUNT_MODULE_PROVIDERS,
} from './breeder-management-account.module-definition';

/**
 * 브리더 관리 > 회원 탈퇴 슬라이스
 * - 브리더 계정 삭제 및 연관 데이터 정리
 */
@Module({
    imports: BREEDER_MANAGEMENT_ACCOUNT_MODULE_IMPORTS,
    controllers: BREEDER_MANAGEMENT_ACCOUNT_MODULE_CONTROLLERS,
    providers: BREEDER_MANAGEMENT_ACCOUNT_MODULE_PROVIDERS,
})
export class BreederManagementAccountModule {}
