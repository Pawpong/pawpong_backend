import { Injectable } from '@nestjs/common';

import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/home-response-messages';

@Injectable()
export class HomeFaqWriteResponseMessageService {
    faqCreated(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.faqCreated;
    }

    faqUpdated(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.faqUpdated;
    }
}
