import { Injectable } from '@nestjs/common';

import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/inquiry-response-messages';

@Injectable()
export class InquiryBreederQueryResponseMessageService {
    breederInquiriesRetrieved(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.breederInquiriesRetrieved;
    }
}
