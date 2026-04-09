import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/upload-response-messages';
import { UploadFileResponseMessageService } from './upload-file-response-message.service';

describe('파일 업로드 응답 메시지 서비스', () => {
    const service = new UploadFileResponseMessageService();

    it('파일 업로드와 삭제 성공 메시지를 일관되게 만든다', () => {
        expect(service.singleFileUploaded()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.singleFileUploaded);
        expect(service.multipleFilesUploaded(3)).toBe('3개 파일 업로드 성공');
        expect(service.fileDeleted()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.fileDeleted);
    });
});
