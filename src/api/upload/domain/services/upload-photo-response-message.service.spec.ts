import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/upload-response-messages';
import { UploadPhotoResponseMessageService } from './upload-photo-response-message.service';

describe('사진 업로드 응답 메시지 서비스', () => {
    const service = new UploadPhotoResponseMessageService();

    it('사진 업로드 성공 메시지를 역할별로 만든다', () => {
        expect(service.representativePhotosUploaded()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.representativePhotosUploaded);
        expect(service.availablePetPhotosUploaded()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.availablePetPhotosUploaded);
        expect(service.parentPetPhotosUploaded()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.parentPetPhotosUploaded);
    });
});
