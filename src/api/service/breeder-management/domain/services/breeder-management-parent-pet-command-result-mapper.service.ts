import { Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../constants/breeder-management-response-messages';

@Injectable()
export class BreederManagementParentPetCommandResultMapperService {
    toParentPetAddedResult(petId: string) {
        return {
            petId,
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetAddedDetailed,
        };
    }

    toParentPetUpdatedResult() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetUpdatedDetailed,
        };
    }

    toParentPetRemovedResult() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetRemovedDetailed,
        };
    }
}
