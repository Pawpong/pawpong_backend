import { Module } from '@nestjs/common';

import {
    ADOPTER_REVIEWS_MODULE_CONTROLLERS,
    ADOPTER_REVIEWS_MODULE_IMPORTS,
    ADOPTER_REVIEWS_MODULE_PROVIDERS,
} from './adopter-reviews.module-definition';
import { ADOPTER_REVIEW_READER_PORT } from '../application/ports/adopter-review-reader.port';

/**
 * 입양자 > 후기 슬라이스
 * - 브리더 후기 작성(브리더 알림 발송) 및 신고
 * - 후기 목록·상세 조회
 */
@Module({
    imports: ADOPTER_REVIEWS_MODULE_IMPORTS,
    controllers: ADOPTER_REVIEWS_MODULE_CONTROLLERS,
    providers: ADOPTER_REVIEWS_MODULE_PROVIDERS,
    exports: [ADOPTER_REVIEW_READER_PORT],
})
export class AdopterReviewsModule {}
