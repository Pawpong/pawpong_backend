import { Injectable } from '@nestjs/common';

import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/upload-response-messages';

@Injectable()
export class UploadPhotoResponseMessageService {
    representativePhotosUploaded() {
        return UPLOAD_RESPONSE_MESSAGE_EXAMPLES.representativePhotosUploaded;
    }

    availablePetPhotosUploaded() {
        return UPLOAD_RESPONSE_MESSAGE_EXAMPLES.availablePetPhotosUploaded;
    }

    parentPetPhotosUploaded() {
        return UPLOAD_RESPONSE_MESSAGE_EXAMPLES.parentPetPhotosUploaded;
    }
}
