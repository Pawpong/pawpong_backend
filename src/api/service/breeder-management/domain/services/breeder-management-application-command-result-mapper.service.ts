import { Injectable } from '@nestjs/common';

import type { BreederManagementApplicationFormRecord } from '../../application/ports/breeder-management-profile.port';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../constants/breeder-management-response-messages';

@Injectable()
export class BreederManagementApplicationCommandResultMapperService {
    toApplicationFormUpdatedResult(customQuestions: BreederManagementApplicationFormRecord[]) {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdatedDetailed,
            customQuestions,
        };
    }

    toSimpleApplicationFormUpdatedResult(customQuestions: BreederManagementApplicationFormRecord[]) {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdatedDetailed,
            customQuestions,
            totalQuestions: customQuestions.length,
        };
    }
}
