import { Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../constants/breeder-management-response-messages';

@Injectable()
export class BreederManagementVerificationCommandResponseService {
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
