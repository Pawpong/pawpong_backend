import { Injectable } from '@nestjs/common';

import { ADOPTER_ADMIN_RESPONSE_PAYLOADS } from '../../constants/adopter-admin-response-payloads';
import type { AdopterAdminReviewDeleteResult } from '../../application/types/adopter-admin-result.type';

@Injectable()
export class AdopterAdminReviewDeleteResultMapperService {
    toDeleteReviewResult(reviewId: string, breederId: string, breederName: string): AdopterAdminReviewDeleteResult {
        return {
            reviewId,
            breederId,
            breederName,
            deleteReason: ADOPTER_ADMIN_RESPONSE_PAYLOADS.reviewDeleted,
            deletedAt: new Date().toISOString(),
            message: ADOPTER_ADMIN_RESPONSE_PAYLOADS.reviewDeleted,
        };
    }
}
