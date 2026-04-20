import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/inquiry-response-messages';

describe('문의 공개 조회 응답 메시지 상수', () => {
    it('공개 목록과 상세 메시지 계약을 유지한다', () => {
        expect(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryListRetrieved).toBe('문의 목록이 조회되었습니다.');
        expect(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDetailRetrieved).toBe('문의 상세가 조회되었습니다.');
    });
});
