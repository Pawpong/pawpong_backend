import { Injectable } from '@nestjs/common';

import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notice-response-messages';

@Injectable()
export class NoticeDeleteResponseMessageService {
    noticeDeleted(): string {
        return NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDeleted;
    }
}
