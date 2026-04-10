import { Injectable } from '@nestjs/common';

import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/inquiry-response-messages';

@Injectable()
export class InquiryAdopterWriteResponseMessageService {
    inquiryCreated(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryCreated;
    }

    inquiryUpdated(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryUpdated;
    }
}
