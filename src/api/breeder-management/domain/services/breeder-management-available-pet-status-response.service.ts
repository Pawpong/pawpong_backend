import { Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './breeder-management-response-message.service';

@Injectable()
export class BreederManagementAvailablePetStatusResponseService {
    createAvailablePetStatusUpdated() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.petStatusUpdatedDetailed,
        };
    }
}
