import { Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../constants/breeder-management-response-messages';

@Injectable()
export class BreederManagementParentPetCommandResponseService {
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
}
