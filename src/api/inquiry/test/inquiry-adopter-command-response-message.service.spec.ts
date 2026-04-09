import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../constants/inquiry-response-messages';
import { InquiryAdopterCommandResponseMessageService } from '../domain/services/inquiry-adopter-command-response-message.service';

describe('문의 입양자 명령 응답 메시지 서비스', () => {
    const service = new InquiryAdopterCommandResponseMessageService();

    it('작성, 수정, 삭제 메시지 계약을 유지한다', () => {
        expect(service.inquiryCreated()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryCreated);
        expect(service.inquiryUpdated()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryUpdated);
        expect(service.inquiryDeleted()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDeleted);
    });
});
