import { Injectable } from '@nestjs/common';

import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/inquiry-response-messages';

@Injectable()
export class InquiryCommandResponseMessageService {
    inquiryCreated(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryCreated;
    }

    inquiryUpdated(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryUpdated;
    }

    inquiryDeleted(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDeleted;
    }

    inquiryAnswerCreated(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryAnswerCreated;
    }
}
