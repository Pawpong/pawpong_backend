import { Injectable } from '@nestjs/common';

import { UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/upload-admin-response-messages';

@Injectable()
export class UploadAdminFileDeleteResponseMessageService {
    fileDeleted() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.fileDeleted;
    }

    filesDeleted() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.filesDeleted;
    }
}
