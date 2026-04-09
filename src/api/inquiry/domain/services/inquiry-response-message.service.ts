import { Injectable } from '@nestjs/common';
import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/inquiry-response-messages';

export { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/inquiry-response-messages';

@Injectable()
export class InquiryResponseMessageService {
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
