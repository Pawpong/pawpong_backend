import { Injectable } from '@nestjs/common';

import {
    buildUploadAdminFolderDeletedMessage,
    UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES,
} from '../../constants/upload-admin-response-messages';

@Injectable()
export class UploadAdminCommandResponseMessageService {
    fileDeleted() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.fileDeleted;
    }

    filesDeleted() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.filesDeleted;
    }

    folderDeleted(folder: string) {
        return buildUploadAdminFolderDeletedMessage(folder);
    }
}
