import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../constants/inquiry-response-messages';
import { InquiryQueryResponseMessageService } from '../domain/services/inquiry-query-response-message.service';

describe('문의 조회 응답 메시지 서비스', () => {
    const service = new InquiryQueryResponseMessageService();

    it('공개, 입양자, 브리더 조회 경로의 메시지 계약을 유지한다', () => {
        expect(service.inquiryListRetrieved()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryListRetrieved);
        expect(service.inquiryDetailRetrieved()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDetailRetrieved);
        expect(service.myInquiriesRetrieved()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.myInquiriesRetrieved);
        expect(service.breederInquiriesRetrieved()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.breederInquiriesRetrieved);
    });
});
