import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../constants/inquiry-response-messages';

describe('문의 입양자 쓰기 응답 메시지 상수', () => {
    it('작성과 수정 메시지 계약을 유지한다', () => {
        expect(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryCreated).toBe('문의가 작성되었습니다.');
        expect(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryUpdated).toBe('문의가 수정되었습니다.');
    });
});
