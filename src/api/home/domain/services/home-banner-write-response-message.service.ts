import { Injectable } from '@nestjs/common';

import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/home-response-messages';

@Injectable()
export class HomeBannerWriteResponseMessageService {
    bannerCreated(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.bannerCreated;
    }

    bannerUpdated(): string {
        return HOME_RESPONSE_MESSAGE_EXAMPLES.bannerUpdated;
    }
}
