import { Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../constants/breeder-management-response-messages';

@Injectable()
export class BreederManagementApplicationStatusResultMapperService {
    toApplicationStatusUpdatedResult() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationStatusUpdatedDetailed,
        };
    }
}
