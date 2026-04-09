import {
    NoticeResponseMessageService,
} from '../domain/services/notice-response-message.service';
import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notice-response-messages';

describe('공지사항 응답 메시지 서비스', () => {
    const service = new NoticeResponseMessageService();

    it('공개 경로와 관리자 경로가 공유하는 메시지 계약을 유지한다', () => {
        expect(service.noticeListRetrieved()).toBe(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeListRetrieved);
        expect(service.noticeDetailRetrieved()).toBe(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDetailRetrieved);
        expect(service.noticeCreated()).toBe(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeCreated);
        expect(service.noticeUpdated()).toBe(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeUpdated);
        expect(service.noticeDeleted()).toBe(NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDeleted);
    });
});
