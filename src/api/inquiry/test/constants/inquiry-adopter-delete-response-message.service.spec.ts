import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/inquiry-response-messages';

describe('문의 입양자 삭제 응답 메시지 상수', () => {
    it('삭제 메시지 계약을 유지한다', () => {
        expect(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDeleted).toBe('문의가 삭제되었습니다.');
    });
});
