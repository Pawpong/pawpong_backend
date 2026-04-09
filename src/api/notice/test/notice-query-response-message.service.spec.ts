import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notice-response-messages';
import { NoticeQueryResponseMessageService } from '../domain/services/notice-query-response-message.service';

describe('공지사항 조회 응답 메시지 서비스', () => {
    const service = new NoticeQueryResponseMessageService();

    it('공개 경로와 관리자 조회 경로가 공유하는 메시지 계약을 유지한다', () => {
        expect(service.noticeListRetrieved()).toBe(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeListRetrieved);
        expect(service.noticeDetailRetrieved()).toBe(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDetailRetrieved);
    });
});
