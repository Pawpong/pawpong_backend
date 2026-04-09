import { Injectable } from '@nestjs/common';
import {
    buildUploadAdminFolderDeletedMessage,
    buildUploadAdminFolderFilesListedMessage,
    UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES,
} from '../../constants/upload-admin-response-messages';

@Injectable()
export class UploadAdminResponseMessageService {
    filesListed() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.filesListed;
    }

    folderFilesListed(folder: string) {
        return buildUploadAdminFolderFilesListedMessage(folder);
    }

    fileDeleted() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.fileDeleted;
    }

    filesDeleted() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.filesDeleted;
    }

    folderDeleted(folder: string) {
        return buildUploadAdminFolderDeletedMessage(folder);
    }

    fileReferencesChecked() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.fileReferencesChecked;
    }

    referencedFilesListed() {
        return UPLOAD_ADMIN_RESPONSE_MESSAGE_EXAMPLES.referencedFilesListed;
    }
}
