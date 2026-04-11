import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from '../../../constants/upload-response-messages';

describe('개체 사진 업로드 응답 메시지 상수', () => {
    it('분양 개체와 부모견 사진 업로드 성공 메시지를 만든다', () => {
        expect(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.availablePetPhotosUploaded).toBe('분양 개체 사진이 업로드되고 저장되었습니다.');
        expect(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.parentPetPhotosUploaded).toBe('부모견/묘 사진이 업로드되고 저장되었습니다.');
    });
});
