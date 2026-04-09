import { Injectable } from '@nestjs/common';

import { UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/upload-admin-response-messages';

@Injectable()
export class UploadAdminReferenceQueryResponseMessageService {
    fileReferencesChecked() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.fileReferencesChecked;
    }

    referencedFilesListed() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.referencedFilesListed;
    }
}
