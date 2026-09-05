import { Module } from '@nestjs/common';

import {
    BREEDER_MANAGEMENT_REVIEWS_MODULE_CONTROLLERS,
    BREEDER_MANAGEMENT_REVIEWS_MODULE_IMPORTS,
    BREEDER_MANAGEMENT_REVIEWS_MODULE_PROVIDERS,
} from './breeder-management-reviews.module-definition';

/**
 * 브리더 관리 > 후기 슬라이스
 * - 내가 받은 후기 목록 조회
 * - 후기 답글 작성/수정/삭제
 */
@Module({
    imports: BREEDER_MANAGEMENT_REVIEWS_MODULE_IMPORTS,
    controllers: BREEDER_MANAGEMENT_REVIEWS_MODULE_CONTROLLERS,
    providers: BREEDER_MANAGEMENT_REVIEWS_MODULE_PROVIDERS,
})
export class BreederManagementReviewsModule {}
