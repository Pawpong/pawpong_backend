import { Injectable } from '@nestjs/common';

import {
    buildUploadAdminFolderFilesListedMessage,
    UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES,
} from '../../constants/upload-admin-response-messages';

@Injectable()
export class UploadAdminStorageQueryResponseMessageService {
    filesListed() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.filesListed;
    }

    folderFilesListed(folder: string) {
        return buildUploadAdminFolderFilesListedMessage(folder);
    }
}
