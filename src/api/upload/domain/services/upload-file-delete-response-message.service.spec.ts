import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/upload-response-messages';
import { UploadFileDeleteResponseMessageService } from './upload-file-delete-response-message.service';

describe('파일 삭제 응답 메시지 서비스', () => {
    const service = new UploadFileDeleteResponseMessageService();

    it('파일 삭제 성공 메시지를 일관되게 만든다', () => {
        expect(service.fileDeleted()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.fileDeleted);
    });
});
