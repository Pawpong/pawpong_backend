import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/inquiry-response-messages';

describe('문의 브리더 조회 응답 메시지 상수', () => {
    it('브리더 문의 목록 메시지 계약을 유지한다', () => {
        expect(INQUIRY_RESPONSE_MESSAGE_EXAMPLES.breederInquiriesRetrieved).toBe('브리더 문의 목록이 조회되었습니다.');
    });
});
