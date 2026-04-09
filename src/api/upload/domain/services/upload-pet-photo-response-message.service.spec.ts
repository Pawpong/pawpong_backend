import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/upload-response-messages';
import { UploadPetPhotoResponseMessageService } from './upload-pet-photo-response-message.service';

describe('개체 사진 업로드 응답 메시지 서비스', () => {
    const service = new UploadPetPhotoResponseMessageService();

    it('분양 개체와 부모견 사진 업로드 성공 메시지를 만든다', () => {
        expect(service.availablePetPhotosUploaded()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.availablePetPhotosUploaded);
        expect(service.parentPetPhotosUploaded()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.parentPetPhotosUploaded);
    });
});
