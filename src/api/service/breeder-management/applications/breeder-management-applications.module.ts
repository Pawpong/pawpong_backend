import { Module } from '@nestjs/common';

import {
    BREEDER_MANAGEMENT_APPLICATIONS_MODULE_CONTROLLERS,
    BREEDER_MANAGEMENT_APPLICATIONS_MODULE_IMPORTS,
    BREEDER_MANAGEMENT_APPLICATIONS_MODULE_PROVIDERS,
} from './breeder-management-applications.module-definition';

/**
 * 브리더 관리 > 입양 신청 슬라이스
 * - 받은 신청 목록/상세 조회, 신청 상태 변경(메일·알림 발송)
 * - 신청서 양식 조회/수정 (표준·간편 양식)
 */
@Module({
    imports: BREEDER_MANAGEMENT_APPLICATIONS_MODULE_IMPORTS,
    controllers: BREEDER_MANAGEMENT_APPLICATIONS_MODULE_CONTROLLERS,
    providers: BREEDER_MANAGEMENT_APPLICATIONS_MODULE_PROVIDERS,
})
export class BreederManagementApplicationsModule {}
