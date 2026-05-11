import { Module } from '@nestjs/common';

import {
    ADOPTION_APPLICATION_MODULE_CONTROLLERS,
    ADOPTION_APPLICATION_MODULE_IMPORTS,
    ADOPTION_APPLICATION_MODULE_PROVIDERS,
} from './adoption-application.module-definition';

/**
 * v2 입양 신청 모듈 (Figma 122:3).
 *
 * POST /api/v2/adoption-application — 분양 펫에 대한 상담 신청 폼 제출.
 * v1 의 표준/커스텀 질문 시스템과 분리된 간소화 폼.
 */
@Module({
    imports: ADOPTION_APPLICATION_MODULE_IMPORTS,
    controllers: ADOPTION_APPLICATION_MODULE_CONTROLLERS,
    providers: ADOPTION_APPLICATION_MODULE_PROVIDERS,
})
export class AdoptionApplicationModule {}
