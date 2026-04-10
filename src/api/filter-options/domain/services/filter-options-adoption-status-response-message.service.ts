import { Injectable } from '@nestjs/common';

import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/filter-options-response-messages';

@Injectable()
export class FilterOptionsAdoptionStatusResponseMessageService {
    adoptionStatusRetrieved(): string {
        return FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.adoptionStatusRetrieved;
    }
}
