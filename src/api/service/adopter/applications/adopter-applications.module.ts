import { Module } from '@nestjs/common';

import {
    ADOPTER_APPLICATIONS_MODULE_CONTROLLERS,
    ADOPTER_APPLICATIONS_MODULE_IMPORTS,
    ADOPTER_APPLICATIONS_MODULE_PROVIDERS,
} from './adopter-applications.module-definition';

/**
 * 입양자 > 신청 슬라이스
 * - 상담/입양 신청 생성(브리더 알림 발송)
 * - 내 신청 목록·상세 조회
 */
@Module({
    imports: ADOPTER_APPLICATIONS_MODULE_IMPORTS,
    controllers: ADOPTER_APPLICATIONS_MODULE_CONTROLLERS,
    providers: ADOPTER_APPLICATIONS_MODULE_PROVIDERS,
})
export class AdopterApplicationsModule {}
