import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../constants/inquiry-response-messages';
import { InquiryCommandResponseMessageService } from '../domain/services/inquiry-command-response-message.service';

describe('문의 명령 응답 메시지 서비스', () => {
    const service = new InquiryCommandResponseMessageService();

    it('작성, 수정, 삭제, 답변 메시지 계약을 유지한다', () => {
        expect(service.inquiryCreated()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryCreated);
        expect(service.inquiryUpdated()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryUpdated);
        expect(service.inquiryDeleted()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDeleted);
        expect(service.inquiryAnswerCreated()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryAnswerCreated);
    });
});
