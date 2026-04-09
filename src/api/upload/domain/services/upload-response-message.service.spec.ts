import { UploadResponseMessageService } from './upload-response-message.service';
import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/upload-response-messages';

describe('응답 메시지 업로드 서비스', () => {
    const service = new UploadResponseMessageService();

    it('공개 업로드 성공 메시지를 일관되게 만든다', () => {
        expect(service.singleFileUploaded()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.singleFileUploaded);
        expect(service.multipleFilesUploaded(3)).toBe('3개 파일 업로드 성공');
        expect(service.fileDeleted()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.fileDeleted);
    });

    it('사진 업로드 성공 메시지를 역할별로 만든다', () => {
        expect(service.representativePhotosUploaded()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.representativePhotosUploaded);
        expect(service.availablePetPhotosUploaded()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.availablePetPhotosUploaded);
        expect(service.parentPetPhotosUploaded()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.parentPetPhotosUploaded);
    });
});
