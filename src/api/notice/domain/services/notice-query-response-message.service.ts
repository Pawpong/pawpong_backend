import { Injectable } from '@nestjs/common';

import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notice-response-messages';

@Injectable()
export class NoticeQueryResponseMessageService {
    noticeListRetrieved(): string {
        return NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeListRetrieved;
    }

    noticeDetailRetrieved(): string {
        return NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDetailRetrieved;
    }
}
