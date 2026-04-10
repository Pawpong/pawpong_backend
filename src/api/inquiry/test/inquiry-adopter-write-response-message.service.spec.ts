import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../constants/inquiry-response-messages';
import { InquiryAdopterWriteResponseMessageService } from '../domain/services/inquiry-adopter-write-response-message.service';

describe('문의 입양자 쓰기 응답 메시지 서비스', () => {
    const service = new InquiryAdopterWriteResponseMessageService();

    it('작성과 수정 메시지 계약을 유지한다', () => {
        expect(service.inquiryCreated()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryCreated);
        expect(service.inquiryUpdated()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryUpdated);
    });
});
