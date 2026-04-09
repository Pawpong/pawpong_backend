import { Injectable } from '@nestjs/common';
import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notice-response-messages';

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
