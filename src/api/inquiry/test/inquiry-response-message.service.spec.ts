import {
    InquiryResponseMessageService,
    INQUIRY_RESPONSE_MESSAGE_EXAMPLES,
} from '../domain/services/inquiry-response-message.service';

describe('문의 응답 메시지 서비스', () => {
    const service = new InquiryResponseMessageService();

    it('공개, 입양자, 브리더 경로가 공유하는 메시지 계약을 유지한다', () => {
        expect(service.inquiryListRetrieved()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryListRetrieved);
        expect(service.inquiryDetailRetrieved()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDetailRetrieved);
        expect(service.myInquiriesRetrieved()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.myInquiriesRetrieved);
        expect(service.breederInquiriesRetrieved()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.breederInquiriesRetrieved);
        expect(service.inquiryCreated()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryCreated);
        expect(service.inquiryUpdated()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryUpdated);
        expect(service.inquiryDeleted()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDeleted);
        expect(service.inquiryAnswerCreated()).toBe(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryAnswerCreated);
    });
});
