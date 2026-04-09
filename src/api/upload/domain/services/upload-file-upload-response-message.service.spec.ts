import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/upload-response-messages';
import { UploadFileUploadResponseMessageService } from './upload-file-upload-response-message.service';

describe('파일 업로드 응답 메시지 서비스', () => {
    const service = new UploadFileUploadResponseMessageService();

    it('파일 업로드 성공 메시지를 일관되게 만든다', () => {
        expect(service.singleFileUploaded()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.singleFileUploaded);
        expect(service.multipleFilesUploaded(3)).toBe('3개 파일 업로드 성공');
    });
});
