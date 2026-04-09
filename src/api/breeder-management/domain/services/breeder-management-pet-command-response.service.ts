import { Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './breeder-management-response-message.service';

@Injectable()
export class BreederManagementPetCommandResponseService {
    createParentPetAdded(petId: string) {
        return {
            petId,
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetAddedDetailed,
        };
    }

    createParentPetUpdated() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetUpdatedDetailed,
        };
    }

    createParentPetRemoved() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetRemovedDetailed,
        };
    }

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

    createAvailablePetStatusUpdated() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.petStatusUpdatedDetailed,
        };
    }
}
