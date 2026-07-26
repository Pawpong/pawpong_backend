import { UPLOAD_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/upload-response-messages';

describe('대표 사진 업로드 응답 메시지 상수', () => {
    it('대표 사진 업로드 성공 메시지를 만든다', () => {
        expect(UPLOAD_RESPONSE_MESSAGE_EXAMPLES.representativePhotosUploaded).toBe(
            '대표 사진이 업로드되고 저장되었습니다.',
        );
    });
});
