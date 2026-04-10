import { Injectable } from '@nestjs/common';

import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/inquiry-response-messages';

@Injectable()
export class InquiryAdopterDeleteResponseMessageService {
    inquiryDeleted(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDeleted;
    }
}
