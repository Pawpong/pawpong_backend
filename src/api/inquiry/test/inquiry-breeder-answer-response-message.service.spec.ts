import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../constants/inquiry-response-messages';

describe('문의 브리더 답변 응답 메시지 상수', () => {
    it('답변 등록 메시지 계약을 유지한다', () => {
        expect(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryAnswerCreated).toBe('답변이 작성되었습니다.');
    });
});
