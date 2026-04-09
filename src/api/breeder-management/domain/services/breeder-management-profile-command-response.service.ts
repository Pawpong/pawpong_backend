import { Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './breeder-management-response-message.service';

@Injectable()
export class BreederManagementProfileCommandResponseService {
    createProfileUpdated() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileUpdated,
        };
    }

    createVerificationSubmitted() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationSubmittedDetailed,
        };
    }

    createVerificationDocumentsSubmitted() {
        return {
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationDocumentsSubmittedDetailed,
        };
    }
}
