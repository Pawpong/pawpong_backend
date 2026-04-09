import { Injectable } from '@nestjs/common';

import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/filter-options-response-messages';

@Injectable()
export class FilterOptionsCatalogResponseMessageService {
    breederLevelsRetrieved(): string {
        return FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.breederLevelsRetrieved;
    }

    sortOptionsRetrieved(): string {
        return FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.sortOptionsRetrieved;
    }

    dogSizesRetrieved(): string {
        return FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.dogSizesRetrieved;
    }

    catFurLengthsRetrieved(): string {
        return FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.catFurLengthsRetrieved;
    }

    adoptionStatusRetrieved(): string {
        return FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.adoptionStatusRetrieved;
    }
}
