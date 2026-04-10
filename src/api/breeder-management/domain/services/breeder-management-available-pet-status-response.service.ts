import { Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../constants/breeder-management-response-messages';

@Injectable()
export class BreederManagementAvailablePetStatusResponseService {
    createAvailablePetStatusUpdated() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.petStatusUpdatedDetailed,
        };
    }
}
