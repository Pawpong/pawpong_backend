import { Injectable } from '@nestjs/common';

import {
    buildUploadMultipleFilesUploadedMessage,
    UPLOAD_RESPONSE_MESSAGE_EXAMPLES,
} from '../../constants/upload-response-messages';

@Injectable()
export class UploadFileUploadResponseMessageService {
    singleFileUploaded() {
        return UPLOAD_RESPONSE_MESSAGE_EXAMPLES.singleFileUploaded;
    }

    multipleFilesUploaded(fileCount: number) {
        return buildUploadMultipleFilesUploadedMessage(fileCount);
    }
}
