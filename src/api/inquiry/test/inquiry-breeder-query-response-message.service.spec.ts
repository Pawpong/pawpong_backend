import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../constants/inquiry-response-messages';
import { InquiryBreederQueryResponseMessageService } from '../domain/services/inquiry-breeder-query-response-message.service';

describe('문의 브리더 조회 응답 메시지 서비스', () => {
    const service = new InquiryBreederQueryResponseMessageService();

    it('브리더 문의 목록 메시지 계약을 유지한다', () => {
        expect(service.breederInquiriesRetrieved()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.breederInquiriesRetrieved);
    });
});
