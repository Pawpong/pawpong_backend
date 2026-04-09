import { Injectable } from '@nestjs/common';

import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/home-response-messages';

@Injectable()
export class HomeBannerQueryResponseMessageService {
    bannersRetrieved(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.bannersRetrieved;
    }
}
