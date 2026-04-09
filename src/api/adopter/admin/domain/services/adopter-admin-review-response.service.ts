import { Injectable } from '@nestjs/common';

import { ADOPTER_ADMIN_RESPONSE_PAYLOADS } from '../../constants/adopter-admin-response-payloads';

@Injectable()
export class AdopterAdminReviewResponseService {
    toDeleteReviewResponse(): { message: string } {
        return {
            message: ADOPTER_ADMIN_RESPONSE_PAYLOADS.reviewDeleted,
        };
    }
}
