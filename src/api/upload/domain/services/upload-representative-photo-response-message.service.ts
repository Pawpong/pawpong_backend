import { Injectable } from '@nestjs/common';

import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/upload-response-messages';

@Injectable()
export class UploadRepresentativePhotoResponseMessageService {
    representativePhotosUploaded() {
        return UPLOAD_RESPONSE_MESSAGE_EXAMPLES.representativePhotosUploaded;
    }
}
