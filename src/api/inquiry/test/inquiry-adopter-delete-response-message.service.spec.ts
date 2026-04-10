import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../constants/inquiry-response-messages';
import { InquiryAdopterDeleteResponseMessageService } from '../domain/services/inquiry-adopter-delete-response-message.service';

describe('문의 입양자 삭제 응답 메시지 서비스', () => {
    const service = new InquiryAdopterDeleteResponseMessageService();

    it('삭제 메시지 계약을 유지한다', () => {
        expect(service.inquiryDeleted()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDeleted);
    });
});
