import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notice-response-messages';

describe('공지사항 삭제 응답 메시지 상수', () => {
    it('삭제 메시지 계약을 유지한다', () => {
        expect(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDeleted).toBe('공지사항이 삭제되었습니다.');
    });
});
