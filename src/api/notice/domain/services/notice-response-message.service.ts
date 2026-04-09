import { Injectable } from '@nestjs/common';

export const NOTICE_RESPONSE_MESSAGE_EXAMPLES = {
    noticeListRetrieved: '공지사항 목록 조회 성공',
    noticeDetailRetrieved: '공지사항 조회 성공',
    noticeCreated: '공지사항이 생성되었습니다.',
    noticeUpdated: '공지사항이 수정되었습니다.',
    noticeDeleted: '공지사항이 삭제되었습니다.',
} as const;

@Injectable()
export class NoticeResponseMessageService {
    noticeListRetrieved(): string {
        return NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeListRetrieved;
    }

    noticeDetailRetrieved(): string {
        return NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDetailRetrieved;
    }

    noticeCreated(): string {
        return NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeCreated;
    }

    noticeUpdated(): string {
        return NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeUpdated;
    }

    noticeDeleted(): string {
        return NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDeleted;
    }
}
