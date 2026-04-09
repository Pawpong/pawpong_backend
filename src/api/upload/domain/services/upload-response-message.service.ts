import { Injectable } from '@nestjs/common';
import {
    buildUploadMultipleFilesUploadedMessage,
    UPLOAD_RESPONSE_MESSAGE_EXAMPLES,
} from '../../constants/upload-response-messages';

@Injectable()
export class UploadResponseMessageService {
    singleFileUploaded() {
        return UPLOAD_RESPONSE_MESSAGE_EXAMPLES.singleFileUploaded;
    }

    multipleFilesUploaded(fileCount: number) {
        return buildUploadMultipleFilesUploadedMessage(fileCount);
    }

    fileDeleted() {
        return UPLOAD_RESPONSE_MESSAGE_EXAMPLES.fileDeleted;
    }

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
