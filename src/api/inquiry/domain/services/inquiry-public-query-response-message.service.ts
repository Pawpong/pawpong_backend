import { Injectable } from '@nestjs/common';

import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/inquiry-response-messages';

@Injectable()
export class InquiryPublicQueryResponseMessageService {
    inquiryListRetrieved(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryListRetrieved;
    }

    inquiryDetailRetrieved(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDetailRetrieved;
    }
}
