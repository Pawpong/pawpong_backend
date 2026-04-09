import { Injectable } from '@nestjs/common';

import {
    buildUploadAdminFolderDeletedMessage,
    UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES,
} from '../../constants/upload-admin-response-messages';

@Injectable()
export class UploadAdminFolderDeleteResponseMessageService {
    folderDeleted(folder: string) {
        return buildUploadAdminFolderDeletedMessage(folder);
    }
}
