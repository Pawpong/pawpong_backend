import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../constants/inquiry-response-messages';
import { InquiryBreederAnswerResponseMessageService } from '../domain/services/inquiry-breeder-answer-response-message.service';

describe('문의 브리더 답변 응답 메시지 서비스', () => {
    const service = new InquiryBreederAnswerResponseMessageService();

    it('답변 등록 메시지 계약을 유지한다', () => {
        expect(service.inquiryAnswerCreated()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryAnswerCreated);
    });
});
