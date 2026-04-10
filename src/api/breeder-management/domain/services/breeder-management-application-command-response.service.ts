import { Injectable } from '@nestjs/common';

import type { BreederManagementApplicationFormRecord } from '../../application/ports/breeder-management-profile.port';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../constants/breeder-management-response-messages';

@Injectable()
export class BreederManagementApplicationCommandResponseService {
    createApplicationFormUpdated(customQuestions: BreederManagementApplicationFormRecord[]) {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdatedDetailed,
            customQuestions,
        };
    }

    createSimpleApplicationFormUpdated(customQuestions: BreederManagementApplicationFormRecord[]) {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdatedDetailed,
            customQuestions,
            totalQuestions: customQuestions.length,
        };
    }
}
