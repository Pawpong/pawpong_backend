import { Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../constants/breeder-management-response-messages';

@Injectable()
export class BreederManagementAvailablePetCommandResultMapperService {
    toAvailablePetAddedResult(petId: string) {
        return {
            petId,
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetAddedDetailed,
        };
    }

    toAvailablePetUpdatedResult() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetUpdatedDetailed,
        };
    }

    toAvailablePetRemovedResult() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetRemovedDetailed,
        };
    }
}
