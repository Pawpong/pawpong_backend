import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notice-response-messages';

describe('공지사항 조회 응답 메시지 상수', () => {
    it('공개 경로와 관리자 조회 경로가 공유하는 메시지 계약을 유지한다', () => {
        expect(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeListRetrieved).toBe('공지사항 목록 조회 성공');
        expect(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDetailRetrieved).toBe('공지사항 조회 성공');
    });
});
