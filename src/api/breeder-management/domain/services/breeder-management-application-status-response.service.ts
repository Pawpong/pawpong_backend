import { Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './breeder-management-response-message.service';

@Injectable()
export class BreederManagementApplicationStatusResponseService {
    createApplicationStatusUpdated() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationStatusUpdatedDetailed,
        };
    }
}
