import { Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './breeder-management-response-message.service';

@Injectable()
export class BreederManagementAvailablePetCommandResponseService {
    createAvailablePetAdded(petId: string) {
        return {
            petId,
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetAddedDetailed,
        };
    }

    createAvailablePetUpdated() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetUpdatedDetailed,
        };
    }

    createAvailablePetRemoved() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetRemovedDetailed,
        };
    }
}
