import { Injectable } from '@nestjs/common';

import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notice-response-messages';

@Injectable()
export class NoticeCommandResponseMessageService {
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
