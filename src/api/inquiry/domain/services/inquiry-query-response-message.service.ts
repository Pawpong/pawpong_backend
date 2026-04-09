import { Injectable } from '@nestjs/common';

import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/inquiry-response-messages';

@Injectable()
export class InquiryQueryResponseMessageService {
    inquiryListRetrieved(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryListRetrieved;
    }

    inquiryDetailRetrieved(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDetailRetrieved;
    }

    myInquiriesRetrieved(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.myInquiriesRetrieved;
    }

    breederInquiriesRetrieved(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.breederInquiriesRetrieved;
    }
}
