import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../constants/inquiry-response-messages';
import { InquiryAdopterQueryResponseMessageService } from '../domain/services/inquiry-adopter-query-response-message.service';

describe('문의 입양자 조회 응답 메시지 서비스', () => {
    const service = new InquiryAdopterQueryResponseMessageService();

    it('내 문의 목록 메시지 계약을 유지한다', () => {
        expect(service.myInquiriesRetrieved()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.myInquiriesRetrieved);
    });
});
