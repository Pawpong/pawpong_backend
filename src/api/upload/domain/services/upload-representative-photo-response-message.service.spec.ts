import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/upload-response-messages';
import { UploadRepresentativePhotoResponseMessageService } from './upload-representative-photo-response-message.service';

describe('대표 사진 업로드 응답 메시지 서비스', () => {
    const service = new UploadRepresentativePhotoResponseMessageService();

    it('대표 사진 업로드 성공 메시지를 만든다', () => {
        expect(service.representativePhotosUploaded()).toBe(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.representativePhotosUploaded);
    });
});
