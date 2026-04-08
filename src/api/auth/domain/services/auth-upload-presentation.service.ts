import { Injectable } from '@nestjs/common';

import {
    AUTH_RESPONSE_MESSAGE_EXAMPLES,
    buildAuthBreederDocumentsUploadMessage,
} from './auth-response-message.service';

@Injectable()
export class AuthUploadPresentationService {
    getProfileUploadMessage(hasAuthenticatedUser: boolean, tempId?: string): string {
        if (hasAuthenticatedUser) {
            return AUTH_RESPONSE_MESSAGE_EXAMPLES.profileImageUploadedAndSaved;
        }

        if (tempId) {
            return AUTH_RESPONSE_MESSAGE_EXAMPLES.profileImageUploadedAndTempStored;
        }

        return AUTH_RESPONSE_MESSAGE_EXAMPLES.profileImageUploaded;
    }

    getBreederDocumentsUploadMessage(level: string, count: number, tempId?: string): string {
        return buildAuthBreederDocumentsUploadMessage(level, count, tempId);
    }
}
