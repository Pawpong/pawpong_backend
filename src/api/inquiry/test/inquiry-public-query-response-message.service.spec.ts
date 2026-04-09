import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../constants/inquiry-response-messages';
import { InquiryPublicQueryResponseMessageService } from '../domain/services/inquiry-public-query-response-message.service';

describe('문의 공개 조회 응답 메시지 서비스', () => {
    const service = new InquiryPublicQueryResponseMessageService();

    it('공개 목록과 상세 메시지 계약을 유지한다', () => {
        expect(service.inquiryListRetrieved()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryListRetrieved);
        expect(service.inquiryDetailRetrieved()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDetailRetrieved);
    });
});
