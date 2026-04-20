import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notice-response-messages';

describe('공지사항 쓰기 응답 메시지 상수', () => {
    it('생성과 수정 메시지 계약을 유지한다', () => {
        expect(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeCreated).toBe('공지사항이 생성되었습니다.');
        expect(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeUpdated).toBe('공지사항이 수정되었습니다.');
    });
});
